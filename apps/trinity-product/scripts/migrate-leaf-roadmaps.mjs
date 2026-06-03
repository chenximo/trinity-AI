/**
 * Markdown 子能力表 → `{slug}.roadmap.yml` + `<ProductRoadmap rel="…" />`
 * Run: node scripts/migrate-leaf-roadmaps.mjs
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(SCRIPT_DIR, "../../..");
const DOCS_ROOT = path.join(SCRIPT_DIR, "../docs");
const API_ROOT = path.join(DOCS_ROOT, "ai-api-platform");

function yamlQuote(s) {
  if (/[:#\n"'\\]/.test(s) || s !== s.trim()) return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return s;
}

function sectionPrefix(heading) {
  const t = heading
    .replace(/^###\s+/, "")
    .replace(/（[^）]*）/g, "")
    .replace(/`[^`]+`/g, "")
    .trim();
  const map = {
    "壳层与导航": "壳层",
    "API 密钥": "密钥",
    "角色管理": "角色",
    额度: "额度",
    活动: "活动",
    用量: "用量",
  };
  for (const [k, v] of Object.entries(map)) {
    if (t.includes(k)) return `${v} · `;
  }
  const short = t.split(/[：:|]/)[0].trim().slice(0, 24);
  return short ? `${short} · ` : "";
}

function parseRow(line) {
  if (!line.startsWith("|") || line.includes("---") || line.includes("子能力")) return null;
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim().replace(/\*\*/g, ""));
  if (cells.length < 5) return null;
  const [name, m530, m630, current, note] = cells;
  if (!name) return null;
  const statusCell = (v) => {
    for (const s of ["✅", "🟡", "🔵", "⬜", "➖"]) {
      if ((v || "").startsWith(s)) return s;
    }
    return "⬜";
  };
  return {
    name,
    prototype: statusCell(current),
    backend: "⬜",
    m530: m530 || "⬜",
    m630: m630 || "⬜",
    note: note || "",
  };
}

function sectionEnd(text, startIdx) {
  const tail = text.slice(startIdx);
  const m = tail.match(/\n## [^#]/);
  return m ? startIdx + m.index : text.length;
}

function extractFeatures(block) {
  const features = [];
  let prefix = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("### ")) {
      prefix = sectionPrefix(line);
      continue;
    }
    const row = parseRow(line);
    if (!row) continue;
    row.name = prefix + row.name;
    features.push(row);
  }
  return features;
}

function toYaml(features) {
  const lines = [
    "milestones:",
    '  - id: "5.30"',
    '    date: "2026-05-30"',
    '  - id: "6.30"',
    '    date: "2026-06-30"',
    "",
    "features:",
  ];
  for (const f of features) {
    lines.push(`  - name: ${yamlQuote(f.name)}`);
    lines.push(`    prototype: ${yamlQuote(f.prototype)}`);
    lines.push(`    backend: ${yamlQuote(f.backend)}`);
    if (f.m530 && f.m530 !== "⬜") lines.push(`    "5.30": ${yamlQuote(f.m530)}`);
    if (f.m630 && f.m630 !== "⬜") lines.push(`    "6.30": ${yamlQuote(f.m630)}`);
    if (f.note) lines.push(`    note: ${yamlQuote(f.note)}`);
  }
  lines.push("");
  return lines.join("\n");
}

function gitShow(relFromDocs) {
  try {
    return execSync(`git show HEAD:apps/trinity-product/docs/${relFromDocs}`, {
      encoding: "utf8",
      cwd: REPO_ROOT,
    });
  } catch {
    return null;
  }
}

function migrateFile(mdPath) {
  const relFromDocs = path.relative(DOCS_ROOT, mdPath).replace(/\\/g, "/");
  if (relFromDocs.includes("user/models/") && !relFromDocs.endsWith("model-detail-requirements.md")) {
    console.log("skip (models dir):", relFromDocs);
    return;
  }
  if (relFromDocs.endsWith("operations/billing.md")) {
    console.log("skip (billing.roadmap.yml):", relFromDocs);
    return;
  }

  let content = fs.readFileSync(mdPath, "utf8");
  const slug = path.basename(mdPath, ".md");
  const ymlName = `${slug}.roadmap.yml`;
  const ymlRel = `${path.dirname(relFromDocs)}/${ymlName}`.replace(/\\/g, "/");
  const ymlPath = path.join(DOCS_ROOT, ymlRel);

  const secRe = /## (?:\d+\.\s*)?子能力清单/;
  const startMatch = content.match(secRe);
  if (!startMatch || startMatch.index === undefined) {
    console.log("skip (no section):", relFromDocs);
    return;
  }
  const start = startMatch.index;
  const end = sectionEnd(content, start + 1);

  let block = content.slice(start, end);
  const head = gitShow(relFromDocs);
  if (head && !block.includes("| 子能力 |")) {
    const hm = head.match(secRe);
    if (hm && hm.index !== undefined) block = head.slice(hm.index, sectionEnd(head, hm.index + 1));
  }

  const features = extractFeatures(block);
  if (!features.length) {
    console.log("skip (no rows):", relFromDocs);
    return;
  }

  fs.writeFileSync(ymlPath, toYaml(features));

  const component = `<ProductRoadmap rel="${ymlRel}" />`;
  const newSection = `## 子能力清单\n\n${component}\n`;
  content = content.slice(0, start) + newSection + content.slice(end);
  content = content.replace(
    /子能力进度与节点列以上表为准/g,
    "子能力进度与节点列以 **`" + ymlName + "`** 为准",
  );
  content = content.replace(
    /子能力进度与节点列以 \*\*`roadmap\.yml`\*\* 为准/g,
    `子能力进度与节点列以 **\`${ymlName}\`** 为准`,
  );

  const rev = `| 2026-06-02 | 子能力迁入 \`${ymlName}\`；本页 \`<ProductRoadmap />\` |`;
  if (!content.includes(ymlName)) {
    content = content.replace(/(\| 2026-06-02 \|[^\n]+\n)/, `$1${rev}\n`);
  }

  fs.writeFileSync(mdPath, content);
  console.log("ok:", relFromDocs, "→", ymlName, `(${features.length})`);
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".md")) migrateFile(p);
  }
}

// 删除误写的共用 roadmap.yml
for (const bad of [
  "ai-api-platform/operations/roadmap.yml",
  "ai-api-platform/platform/roadmap.yml",
  "ai-api-platform/user/roadmap.yml",
]) {
  const p = path.join(DOCS_ROOT, bad);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log("removed:", bad);
  }
}

walk(API_ROOT);
