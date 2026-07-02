#!/usr/bin/env node
/**
 * 校验 .cursor/skills 下各 tools.yaml
 *
 *   npm run skill:lint:tools
 *   node scripts/lint-skill-tools.mjs [--skill=trinity-official-pricing]
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, ".cursor/skills");
const PACKAGE_JSON = JSON.parse(
  readFileSync(path.join(ROOT, "package.json"), "utf8"),
);
const SCRIPTS = PACKAGE_JSON.scripts ?? {};
const CONFIRM_VALUES = new Set(["none", "optional", "required"]);

const skillFilter = process.argv
  .find((a) => a.startsWith("--skill="))
  ?.slice("--skill=".length);

function findToolsYamlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      findToolsYamlFiles(p, acc);
    } else if (name === "tools.yaml") {
      acc.push(p);
    }
  }
  return acc;
}

/** 轻量解析 trinity.tools/v1（不引入 yaml 依赖） */
function parseToolsYaml(content, filePath) {
  const errors = [];
  const schemaMatch = content.match(/^schema:\s*(\S+)/m);
  const skillMatch = content.match(/^skill:\s*(\S+)/m);
  const schema = schemaMatch?.[1];
  const skill = skillMatch?.[1];

  if (schema !== "trinity.tools/v1") {
    errors.push(`${filePath}: schema 须为 trinity.tools/v1`);
  }

  const dirName = path.basename(path.dirname(filePath));
  if (skill && skill !== dirName) {
    errors.push(
      `${filePath}: skill=${skill} 与目录名 ${dirName} 不一致`,
    );
  }

  const tools = [];
  const blocks = content.split(/\n  - id:/).slice(1);
  for (const raw of blocks) {
    const idLine = raw.split("\n")[0]?.trim();
    if (!idLine) continue;
    const id = idLine.replace(/^['"]|['"]$/g, "");
    const get = (key) => {
      const m = raw.match(new RegExp(`\\n    ${key}:\\s*(.+)`));
      if (!m) return undefined;
      let v = m[1].trim();
      if (v === "null") return null;
      if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
      if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
      return v;
    };
    const confirm = get("confirm");
    tools.push({
      id,
      command: get("command"),
      confirm: confirm ?? "none",
      reads: extractList(raw, "reads"),
      writes: extractList(raw, "writes"),
      paths: extractList(raw, "paths"),
    });
    if (!CONFIRM_VALUES.has(tools[tools.length - 1].confirm)) {
      errors.push(`${filePath}: tool ${id} confirm 无效: ${confirm}`);
    }
  }

  return { errors, tools, skill: skill ?? dirName, filePath };
}

function extractList(block, key) {
  const lines = block.split("\n");
  const out = [];
  let inList = false;
  for (const line of lines) {
    if (line.match(new RegExp(`^    ${key}:`))) {
      inList = true;
      const inline = line.replace(new RegExp(`^    ${key}:\\s*`), "").trim();
      if (inline && inline !== "[]") continue;
      continue;
    }
    if (inList) {
      if (line.match(/^    [a-z]/)) break;
      const m = line.match(/^      - (.+)/);
      if (m) out.push(m[1].trim());
    }
  }
  return out;
}

function npmScriptFromCommand(command) {
  if (!command || command === "null") return null;
  const m = command.match(/^npm run (\S+)/);
  return m?.[1] ?? null;
}

function pathExists(rel) {
  if (rel.includes("*")) {
    const parts = rel.split("/");
    const idx = parts.findIndex((p) => p.includes("*"));
    const base = path.join(ROOT, ...parts.slice(0, idx));
    return existsSync(base);
  }
  return existsSync(path.join(ROOT, rel));
}

function loadToolIdsFromWorkflows(skillDir) {
  const wfDir = path.join(skillDir, "workflows");
  if (!existsSync(wfDir)) return new Set();
  const ids = new Set();
  const idRe = /`(pricing|acceptance|monorepo)\.[a-z0-9.]+`/g;
  for (const f of readdirSync(wfDir)) {
    if (!f.endsWith(".md")) continue;
    const text = readFileSync(path.join(wfDir, f), "utf8");
    for (const m of text.matchAll(idRe)) {
      ids.add(m[0].slice(1, -1));
    }
  }
  return ids;
}

function loadConfirmationText(skillDir) {
  const p = path.join(skillDir, "confirmation.md");
  if (!existsSync(p)) return "";
  return readFileSync(p, "utf8");
}

const allErrors = [];
const allWarnings = [];
const files = findToolsYamlFiles(SKILLS_DIR).filter((f) => {
  if (!skillFilter) return true;
  return f.includes(skillFilter);
});

if (!files.length) {
  console.error("未找到 tools.yaml");
  process.exit(1);
}

for (const filePath of files) {
  const content = readFileSync(filePath, "utf8");
  const { errors, tools, skill } = parseToolsYaml(content, filePath);
  allErrors.push(...errors);

  const skillDir = path.dirname(filePath);
  const toolIdSet = new Set(tools.map((t) => t.id));
  const wfIds = loadToolIdsFromWorkflows(skillDir);
  const confirmMd = loadConfirmationText(skillDir);

  for (const t of tools) {
    const script = npmScriptFromCommand(t.command);
    if (script && !SCRIPTS[script]) {
      allErrors.push(
        `${filePath}: tool ${t.id} 命令 npm run ${script} 不在 package.json`,
      );
    }
    if (t.command?.startsWith("node ") && !t.command.includes("scaffold")) {
      const rel = t.command.replace(/^node /, "").split(" ")[0];
      if (!existsSync(path.join(ROOT, rel))) {
        allErrors.push(`${filePath}: tool ${t.id} 找不到 ${rel}`);
      }
    }
    for (const p of [...t.reads, ...t.writes, ...t.paths]) {
      if (!pathExists(p)) {
        allWarnings.push(`${filePath}: tool ${t.id} 路径可能不存在: ${p}`);
      }
    }
    if (t.confirm === "required" && !confirmMd.includes(t.id)) {
      allWarnings.push(
        `${skill}/confirmation.md 未提及 required tool \`${t.id}\``,
      );
    }
  }

  for (const wfId of wfIds) {
    if (!toolIdSet.has(wfId)) {
      allWarnings.push(
        `${skill}: workflow 引用 \`${wfId}\` 但 tools.yaml 未定义`,
      );
    }
  }

  console.log(`✓ ${skill} · ${tools.length} tools`);
}

console.log("");
if (allWarnings.length) {
  console.log(`⚠ ${allWarnings.length} warning(s):`);
  for (const w of allWarnings) console.log(`  - ${w}`);
  console.log("");
}

if (allErrors.length) {
  console.error(`✗ ${allErrors.length} error(s):`);
  for (const e of allErrors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("skill:lint:tools OK");
process.exit(0);
