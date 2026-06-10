import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import type { PendingDocChange } from "./changelogTypes";

const execFileAsync = promisify(execFile);

const DOCS_GIT_PREFIX = "apps/trinity-docs/docs/";

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

function autoSummary(linesAdded: number, linesRemoved: number, status: string): string {
  if (status === "?" || status === "A") return `新增文档（约 ${linesAdded} 行）`;
  if (status === "D") return "删除文档";
  if (linesAdded === 0 && linesRemoved === 0) return "内容调整（无行数变化）";
  return `约 +${linesAdded} / -${linesRemoved} 行`;
}

/** 相对 HEAD 的 docs 目录变更（含未提交、未跟踪） */
export async function getPendingDocChanges(appRoot: string): Promise<{
  repoRoot: string;
  gitRef: string | null;
  gitDirty: boolean;
  files: PendingDocChange[];
}> {
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
      summary: autoSummary(entry.linesAdded, entry.linesRemoved, entry.status),
    }));

  const gitDirty = files.length > 0;

  return { repoRoot, gitRef, gitDirty, files };
}
