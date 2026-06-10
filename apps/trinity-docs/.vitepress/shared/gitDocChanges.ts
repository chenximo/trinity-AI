import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import type { PendingDocChange, PendingDocChangesResult } from "./changelogTypes";

const execFileAsync = promisify(execFile);

const DOCS_GIT_PREFIX = "apps/trinity-docs/docs/";

const PAGE_LABELS: Record<string, string> = {
  "image-generation-parameters": "生图高级参数",
  "images-generations": "创建图像生成",
  "image-generation": "图片生成指南",
  "image-input": "图片输入",
  "video-generation-parameters": "生视频高级参数",
  "videos-generations": "创建视频生成",
  "video-generation": "视频生成指南",
  "video-input": "视频输入",
  overview: "API 概述",
  "error-codes": "错误码",
  "request-parameters": "请求参数索引",
  "chat-completions": "创建对话补全",
  "chat-completions-parameters": "对话补全高级参数",
  quickstart: "快速入门",
  faq: "FAQ",
};

function toDocsRel(gitPath: string): string | null {
  const normalized = gitPath.replace(/\\/g, "/");
  if (!normalized.startsWith(DOCS_GIT_PREFIX) || !normalized.endsWith(".md")) return null;
  return normalized.slice(DOCS_GIT_PREFIX.length);
}

async function git(repoRoot: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", ["-C", repoRoot, ...args], {
    maxBuffer: 4 * 1024 * 1024,
  });
  return stdout.trim();
}

export async function getGitRepoRoot(appRoot: string): Promise<string> {
  return git(appRoot, ["rev-parse", "--show-toplevel"]);
}

export async function getGitHeadShort(repoRoot: string): Promise<string | null> {
  try {
    return await git(repoRoot, ["rev-parse", "--short", "HEAD"]);
  } catch {
    return null;
  }
}

export async function getGitAuthor(repoRoot: string): Promise<string> {
  try {
    const name = await git(repoRoot, ["config", "user.name"]);
    if (name) return name;
  } catch {
    /* ignore */
  }
  return process.env.USER || process.env.USERNAME || "unknown";
}

export async function isGitWorkingTreeDirty(repoRoot: string, docsPrefix: string): Promise<boolean> {
  try {
    const status = await git(repoRoot, ["status", "--porcelain", "--", docsPrefix]);
    return Boolean(status);
  } catch {
    return false;
  }
}

function pageLabel(rel: string): string {
  const isEn = rel.startsWith("en/");
  const base = path.basename(rel, ".md");
  const label = PAGE_LABELS[base] ?? base.replace(/-/g, " ");
  return isEn ? `${label}（英）` : label;
}

function buildFileLabel(rel: string, status: string): string {
  const label = pageLabel(rel);
  if (status === "?" || status === "A") return `${label}（新增）`;
  if (status === "D") return `${label}（删除）`;
  return label;
}

function detectAreas(rels: string[]): string[] {
  const areas: string[] = [];
  const has = (re: RegExp) => rels.some((r) => re.test(r));
  if (has(/image-generation|images-generations|image-input/)) areas.push("生图");
  if (has(/video-generation|videos-generations|video-input/)) areas.push("生视频");
  if (has(/chat-completions/)) areas.push("生文");
  if (has(/overview|request-parameters|error-codes/)) areas.push("API 通用");
  if (has(/quickstart|faq/)) areas.push("入门/FAQ");
  if (has(/cookbook/)) areas.push("应用场景");
  return areas;
}

/** 按路径推断能力域，拼一两句发布说明建议（不解析 diff 正文） */
export function buildSuggestedReleaseNote(files: PendingDocChange[]): string {
  if (!files.length) return "";

  const rels = files.map((f) => f.rel);
  const areas = detectAreas(rels);
  const hasEn = rels.some((r) => r.startsWith("en/"));
  const n = files.length;

  const parts: string[] = [];
  if (areas.length) parts.push(`更新 ${areas.join("、")} 对外文档`);
  else parts.push("更新对外文档");

  if (hasEn) parts.push("含 en 镜像");
  parts.push(`共 ${n} 个文件`);

  return `${parts[0]}${parts.length > 1 ? `（${parts.slice(1).join("，")}）` : ""}。`;
}

/** 相对 HEAD 的 docs 目录变更（含未提交、未跟踪） */
export async function getPendingDocChanges(appRoot: string): Promise<PendingDocChangesResult> {
  const repoRoot = await getGitRepoRoot(appRoot);
  const gitRef = await getGitHeadShort(repoRoot);
  const docsPrefix = DOCS_GIT_PREFIX;

  const statusOut = await git(repoRoot, ["status", "--porcelain", "--", docsPrefix]);
  const statusLines = statusOut ? statusOut.split("\n").filter(Boolean) : [];

  const byRel = new Map<string, { status: string; linesAdded: number; linesRemoved: number }>();

  for (const line of statusLines) {
    const xy = line.slice(0, 2);
    const filePath = line.slice(3).trim().replace(/^"(.*)"$/, "$1");
    const rel = toDocsRel(filePath);
    if (!rel) continue;
    const index = xy[0];
    const work = xy[1];
    let status = "M";
    if (index === "?" || work === "?") status = "?";
    else if (index === "A" || work === "A") status = "A";
    else if (index === "D" || work === "D") status = "D";
    byRel.set(rel, { status, linesAdded: 0, linesRemoved: 0 });
  }

  try {
    const numstat = await git(repoRoot, ["diff", "HEAD", "--numstat", "--", docsPrefix]);
    for (const line of numstat.split("\n").filter(Boolean)) {
      const [added, removed, ...rest] = line.split(/\s+/);
      const filePath = rest.join(" ");
      const rel = toDocsRel(filePath);
      if (!rel) continue;
      const entry = byRel.get(rel) ?? { status: "M", linesAdded: 0, linesRemoved: 0 };
      entry.linesAdded = Number(added) || 0;
      entry.linesRemoved = Number(removed) || 0;
      if (entry.status === "?") entry.status = "M";
      byRel.set(rel, entry);
    }
  } catch {
    /* no diff */
  }

  const fs = await import("node:fs/promises");
  const docsDir = path.join(appRoot, "docs");
  for (const [rel, entry] of byRel) {
    if (entry.status !== "?") continue;
    try {
      const content = await fs.readFile(path.join(docsDir, rel), "utf-8");
      entry.linesAdded = content.split("\n").length;
      entry.linesRemoved = 0;
    } catch {
      entry.linesAdded = 0;
    }
  }

  const files: PendingDocChange[] = [...byRel.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rel, entry]) => ({
      rel,
      status: entry.status,
      linesAdded: entry.linesAdded,
      linesRemoved: entry.linesRemoved,
      label: buildFileLabel(rel, entry.status),
    }));

  return {
    repoRoot,
    gitRef,
    gitDirty: files.length > 0,
    files,
    suggestedNote: buildSuggestedReleaseNote(files),
  };
}
