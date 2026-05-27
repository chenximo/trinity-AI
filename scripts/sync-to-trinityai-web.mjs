#!/usr/bin/env node
/**
 * 将 trinity-AI 的 apps/、packages/ 同步到 TrinityAI-web（apps_ui/、packages/）。
 *
 * 策略（默认安全，避免覆盖对方正在改的文件）：
 *   - packages：仅新增（新包、新文件）；已存在且内容不同 → 记入冲突报告，不覆盖
 *   - apps：新增目录/文件 + 可更新「仅目标缺失」；已存在且内容不同 → 冲突报告，不覆盖
 *
 * 用法：
 *   node scripts/sync-to-trinityai-web.mjs              # 预览（dry-run）
 *   node scripts/sync-to-trinityai-web.mjs --apply      # 执行写入
 *   node scripts/sync-to-trinityai-web.mjs --apply --apps-overwrite  # apps 冲突时以源为准（先备份目标）
 *
 * 环境变量（可选）：
 *   TRINITY_SYNC_SOURCE  默认：仓库根（含 apps、packages）
 *   TRINITY_SYNC_TARGET  默认：../TrinityAI-web
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_ROOT = path.resolve(
  process.env.TRINITY_SYNC_SOURCE ?? path.join(__dirname, ".."),
);
const TARGET_ROOT = path.resolve(
  process.env.TRINITY_SYNC_TARGET ?? path.join(SOURCE_ROOT, "..", "TrinityAI-web"),
);

const APPS_SRC = path.join(SOURCE_ROOT, "apps");
const APPS_DEST = path.join(TARGET_ROOT, "apps_ui");
const PKG_SRC = path.join(SOURCE_ROOT, "packages");
const PKG_DEST = path.join(TARGET_ROOT, "packages");

const EXCLUDE_DIR_NAMES = new Set([
  "node_modules",
  "dist",
  ".vite",
  ".git",
  ".turbo",
  "coverage",
]);

const EXCLUDE_FILE_NAMES = new Set([".DS_Store", "Thumbs.db"]);

const args = process.argv.slice(2);

function hasFlag(name) {
  return args.includes(name);
}

function flagValue(name, fallback) {
  const i = args.indexOf(name);
  if (i === -1 || i === args.length - 1) return fallback;
  return args[i + 1];
}

const APPLY = hasFlag("--apply");
const SYNC_APPS = hasFlag("--apps") || hasFlag("--all") || (!hasFlag("--packages") && !hasFlag("--apps"));
const SYNC_PACKAGES = hasFlag("--packages") || hasFlag("--all") || (!hasFlag("--packages") && !hasFlag("--apps"));
const APPS_OVERWRITE = hasFlag("--apps-overwrite");
const PACKAGES_OVERWRITE = hasFlag("--packages-overwrite");
const VERBOSE = hasFlag("--verbose");
const REPORT_DIR = path.resolve(
  flagValue("--report-dir", path.join(SOURCE_ROOT, "scripts", "sync-reports")),
);

/** @typedef {'apps' | 'packages'} SyncScope */

/** @type {Record<SyncScope, { added: string[]; updated: string[]; skipped: string[]; conflicts: { rel: string; reason: string }[]; backups: string[] }>} */
const statsByScope = {
  apps: { added: [], updated: [], skipped: [], conflicts: [], backups: [] },
  packages: { added: [], updated: [], skipped: [], conflicts: [], backups: [] },
};

/** @param {SyncScope} scope */
function scopeStats(scope) {
  return statsByScope[scope];
}

/** @type {{ added: string[]; updated: string[]; skipped: string[]; conflicts: { rel: string; reason: string }[]; backups: string[] }} */
const stats = {
  get added() {
    return [...statsByScope.apps.added, ...statsByScope.packages.added];
  },
  get updated() {
    return [...statsByScope.apps.updated, ...statsByScope.packages.updated];
  },
  get skipped() {
    return [...statsByScope.apps.skipped, ...statsByScope.packages.skipped];
  },
  get conflicts() {
    return [...statsByScope.apps.conflicts, ...statsByScope.packages.conflicts];
  },
  get backups() {
    return [...statsByScope.apps.backups, ...statsByScope.packages.backups];
  },
};

const SKIP_CHANGELOG = hasFlag("--no-changelog");

function log(...parts) {
  console.log(...parts);
}

function vlog(...parts) {
  if (VERBOSE) console.log("  ", ...parts);
}

function shouldSkipDir(name) {
  return EXCLUDE_DIR_NAMES.has(name);
}

function shouldSkipFile(name) {
  return EXCLUDE_FILE_NAMES.has(name);
}

function fileHash(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function ensureDir(absDir) {
  fs.mkdirSync(absDir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function backupFile(dest, scope) {
  if (!fs.existsSync(dest)) return null;
  const bak = `${dest}.sync-backup-${Date.now()}`;
  fs.copyFileSync(dest, bak);
  scopeStats(scope).backups.push(path.relative(TARGET_ROOT, bak));
  return bak;
}

function localDateLabel() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** @param {string[]} items @param {number} max */
function bulletList(items, max = 80) {
  if (!items.length) return ["- （无）"];
  const head = items.slice(0, max).map((p) => `- \`${p}\``);
  if (items.length > max) head.push(`- … 另有 ${items.length - max} 项，见 \`trinity-AI/scripts/sync-reports/\``);
  return head;
}

/**
 * @param {SyncScope} scope
 */
function buildChangelogSection(scope) {
  const s = scopeStats(scope);
  const srcLabel = scope === "apps" ? "trinity-AI/apps/" : "trinity-AI/packages/";
  const destLabel = scope === "apps" ? "apps_ui/" : "packages/";
  const mode = APPLY ? "已执行写入" : "预览（未写入，仅记录计划变更）";
  const overwrite =
    scope === "apps"
      ? APPS_OVERWRITE
        ? "是（冲突已以源覆盖，目标侧已 `.sync-backup`）"
        : "否"
      : PACKAGES_OVERWRITE
        ? "是（冲突已以源覆盖）"
        : "否";

  // 整目录新增保留简短名
  const addedDisplay = s.added.map((p) => {
    const m = p.match(/^(?:apps|packages)\/([^/]+)\/ \(entire directory\)$/);
    if (m) return `${m[1]}/（整目录新增）`;
    return p.replace(/^apps\/[^/]+\//, "").replace(/^packages\/[^/]+\//, "");
  });
  const updatedDisplay = s.updated.map((p) =>
    p.replace(/^apps\/[^/]+\//, "").replace(/^packages\/[^/]+\//, ""),
  );

  return [
    `## ${localDateLabel()}`,
    "",
    `| 项 | 值 |`,
    `|----|-----|`,
    `| **同步时间** | ${localTimestamp()} |`,
    `| **状态** | ${mode} |`,
    `| **方向** | \`${srcLabel}\` → \`${destLabel}\` |`,
    `| **摘要** | 新增 ${s.added.length} · 更新 ${s.updated.length} · 相同 ${s.skipped.length} · 冲突 ${s.conflicts.length} |`,
    `| **冲突覆盖** | ${overwrite} |`,
    "",
    "> 变更由同步脚本 **文件内容对比**（SHA-256）得出，不依赖 git。",
    "",
    "### 新增",
    "",
    ...bulletList(addedDisplay),
    "",
    "### 更新",
    "",
    ...bulletList(updatedDisplay),
    "",
    "### 冲突（未自动合并）",
    "",
    ...(s.conflicts.length
      ? s.conflicts.map((c) => {
          const p = c.rel.replace(/^apps\/[^/]+\//, "").replace(/^packages\/[^/]+\//, "");
          return `- \`${p}\` — ${c.reason}`;
        })
      : ["- （无）"]),
    "",
    "---",
    "",
  ];
}

const CHANGELOG_HEADER = {
  apps: `# CHANGELOG · apps_ui

> 本文件记录从 **trinity-AI/apps/** 同步到 **TrinityAI-web/apps_ui/** 的变更（\`npm run sync:web:apply\` 自动追加）。  
> 工程师消费原型前可先读最新一节；冲突项需人工对比后再定稿。

`,
  packages: `# CHANGELOG · packages

> 本文件记录从 **trinity-AI/packages/** 同步到 **TrinityAI-web/packages/** 的变更。  
> 默认策略：**仅追加**新文件；与工程仓已有内容不同则不覆盖（见「冲突」）。

`,
};

/**
 * @param {SyncScope} scope
 * @param {string} changelogPath
 */
function prependScopeChangelog(scope, changelogPath) {
  const section = buildChangelogSection(scope).join("\n");
  let history = "";
  if (fs.existsSync(changelogPath)) {
    const content = fs.readFileSync(changelogPath, "utf8");
    const idx = content.search(/\n## \d{4}-\d{2}-\d{2}/);
    history = idx >= 0 ? content.slice(idx + 1) : "";
  }

  const updated = CHANGELOG_HEADER[scope] + section + history;
  const outPath = APPLY
    ? changelogPath
    : changelogPath.replace(/CHANGELOG\.md$/, "CHANGELOG.preview.md");

  if (APPLY) {
    fs.writeFileSync(outPath, updated, "utf8");
    log(`   CHANGELOG → ${path.relative(TARGET_ROOT, outPath)}`);
  } else {
    fs.writeFileSync(outPath, updated, "utf8");
    log(`   CHANGELOG 预览 → ${path.relative(TARGET_ROOT, outPath)}（--apply 后写入 CHANGELOG.md）`);
  }
}

function writeScopeChangelogs() {
  if (SKIP_CHANGELOG) return;
  if (SYNC_APPS) prependScopeChangelog("apps", path.join(APPS_DEST, "CHANGELOG.md"));
  if (SYNC_PACKAGES) prependScopeChangelog("packages", path.join(PKG_DEST, "CHANGELOG.md"));
}

/**
 * @param {string} srcRoot
 * @param {string} destRoot
 * @param {string} relDir relative dir under roots
 * @param {{ overwrite: boolean; label: string; scope: SyncScope }} opts
 */
function walkSync(srcRoot, destRoot, relDir, opts) {
  const s = scopeStats(opts.scope);
  const srcDir = path.join(srcRoot, relDir);
  if (!fs.existsSync(srcDir)) return;

  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (ent.name.startsWith(".") && ent.name !== ".vitepress") continue;
    const rel = path.join(relDir, ent.name).replace(/\\/g, "/");

    if (ent.isDirectory()) {
      if (shouldSkipDir(ent.name)) continue;
      walkSync(srcRoot, destRoot, rel, opts);
      continue;
    }

    if (!ent.isFile() || shouldSkipFile(ent.name)) continue;
    if (ent.name === "CHANGELOG.md" || ent.name === "CHANGELOG.preview.md") continue;

    const srcFile = path.join(srcRoot, rel);
    const destFile = path.join(destRoot, rel);
    const destExists = fs.existsSync(destFile);

    if (!destExists) {
      if (APPLY) copyFile(srcFile, destFile);
      s.added.push(`${opts.label}/${rel}`);
      vlog("ADD", rel);
      continue;
    }

    const same = fileHash(srcFile) === fileHash(destFile);
    if (same) {
      s.skipped.push(`${opts.label}/${rel} (identical)`);
      continue;
    }

    if (!opts.overwrite) {
      s.conflicts.push({
        rel: `${opts.label}/${rel}`,
        reason: "目标已存在且内容不同（未覆盖）",
      });
      vlog("CONFLICT", rel);
      continue;
    }

    if (APPLY) {
      backupFile(destFile, opts.scope);
      copyFile(srcFile, destFile);
    }
    s.updated.push(`${opts.label}/${rel}`);
    vlog("UPDATE", rel);
  }
}

/** 同步整个顶层目录（新 app / 新 package） */
function syncTopLevelDir(srcRoot, destRoot, name, label, overwrite, scope) {
  const s = scopeStats(scope);
  const src = path.join(srcRoot, name);
  const dest = path.join(destRoot, name);
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    if (APPLY) {
      ensureDir(path.dirname(dest));
      fs.cpSync(src, dest, {
        recursive: true,
        filter: (srcPath) => {
          const base = path.basename(srcPath);
          if (EXCLUDE_DIR_NAMES.has(base)) return false;
          if (EXCLUDE_FILE_NAMES.has(base)) return false;
          return true;
        },
      });
    }
    s.added.push(`${label}/${name}/ (entire directory)`);
    log(`  + 新目录 ${label}/${name}/`);
    return;
  }

  walkSync(src, dest, "", { overwrite, label: `${label}/${name}`, scope });
}

function syncApps() {
  log("\n## apps → apps_ui");
  log(`   ${APPS_SRC}`);
  log(`   → ${APPS_DEST}`);

  if (!fs.existsSync(APPS_SRC)) {
    log("   ✗ 源目录不存在，跳过");
    return;
  }
  if (!fs.existsSync(APPS_DEST)) {
    if (APPLY) ensureDir(APPS_DEST);
    log("   ℹ 将创建 apps_ui/");
  }

  const srcApps = fs
    .readdirSync(APPS_SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !shouldSkipDir(d.name))
    .map((d) => d.name);

  for (const name of srcApps) {
    if (name === "README.md") continue;
    syncTopLevelDir(APPS_SRC, APPS_DEST, name, "apps", APPS_OVERWRITE, "apps");
  }

  const destOnly = fs
    .existsSync(APPS_DEST)
    ? fs
        .readdirSync(APPS_DEST, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .filter((n) => !srcApps.includes(n) && n !== "node_modules")
    : [];

  if (destOnly.length) {
    log(`   ℹ 仅存在于 apps_ui（不会删除）: ${destOnly.join(", ")}`);
  }
}

function syncPackages() {
  log("\n## packages → packages");
  log(`   ${PKG_SRC}`);
  log(`   → ${PKG_DEST}`);

  if (!fs.existsSync(PKG_SRC)) {
    log("   ✗ 源目录不存在，跳过");
    return;
  }
  if (!fs.existsSync(PKG_DEST)) {
    if (APPLY) ensureDir(PKG_DEST);
  }

  const srcPkgs = fs
    .readdirSync(PKG_SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const name of srcPkgs) {
    syncTopLevelDir(PKG_SRC, PKG_DEST, name, "packages", PACKAGES_OVERWRITE, "packages");
  }
}

function writeReport() {
  if (!stats.conflicts.length && !APPLY) return;
  ensureDir(REPORT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = path.join(REPORT_DIR, `sync-${stamp}.md`);
  const lines = [
    "# sync-to-trinityai-web 报告",
    "",
    `- 时间: ${new Date().toISOString()}`,
    `- 模式: ${APPLY ? "apply" : "dry-run"}`,
    `- 源: \`${SOURCE_ROOT}\``,
    `- 目标: \`${TARGET_ROOT}\``,
    "",
    "## 统计",
    "",
    `- 新增: ${stats.added.length}`,
    `- 更新: ${stats.updated.length}`,
    `- 跳过（相同）: ${stats.skipped.length}`,
    `- 冲突: ${stats.conflicts.length}`,
    `- 备份: ${stats.backups.length}`,
    "",
  ];

  if (stats.added.length) {
    lines.push("## 新增", "", ...stats.added.map((x) => `- ${x}`), "");
  }
  if (stats.updated.length) {
    lines.push("## 更新", "", ...stats.updated.map((x) => `- ${x}`), "");
  }
  if (stats.conflicts.length) {
    lines.push(
      "## 冲突（需人工对比合并）",
      "",
      "原则：packages 默认只追加；apps 默认不覆盖已不同的文件。",
      "若确认以 trinity-AI 为准，可执行：",
      "",
      "```bash",
      "node scripts/sync-to-trinityai-web.mjs --apply --apps-overwrite",
      "# packages 慎用：",
      "node scripts/sync-to-trinityai-web.mjs --apply --packages-overwrite",
      "```",
      "",
      ...stats.conflicts.map((c) => `- \`${c.rel}\` — ${c.reason}`),
      "",
    );
  }

  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
  log(`\n报告已写入: ${reportPath}`);
}

function main() {
  log("sync-to-trinityai-web");
  log(`源:   ${SOURCE_ROOT}`);
  log(`目标: ${TARGET_ROOT}`);
  log(`模式: ${APPLY ? "APPLY（写入）" : "DRY-RUN（预览，加 --apply 执行）"}`);
  if (APPS_OVERWRITE) log("apps: 冲突时覆盖目标（会先 .sync-backup）");
  if (PACKAGES_OVERWRITE) log("packages: 冲突时覆盖目标（会先 .sync-backup）");

  if (!fs.existsSync(TARGET_ROOT)) {
    console.error(`\n✗ 目标仓库不存在: ${TARGET_ROOT}`);
    console.error("  请设置 TRINITY_SYNC_TARGET 或把 TrinityAI-web 放在 trinity-AI 同级目录。");
    process.exit(1);
  }

  if (SYNC_APPS) syncApps();
  if (SYNC_PACKAGES) syncPackages();

  log("\n--- 摘要 ---");
  log(`新增: ${stats.added.length}  更新: ${stats.updated.length}  相同跳过: ${stats.skipped.length}  冲突: ${stats.conflicts.length}`);

  if (!APPLY && (stats.added.length || stats.updated.length)) {
    log("\n执行写入: node scripts/sync-to-trinityai-web.mjs --apply");
  }

  if (stats.conflicts.length) {
    log("\n存在冲突，请查看报告或加 --apps-overwrite / --packages-overwrite");
  }

  writeReport();
  writeScopeChangelogs();
  const failOnConflict =
    APPLY && stats.conflicts.length > 0 && !APPS_OVERWRITE && !PACKAGES_OVERWRITE;
  process.exit(failOnConflict ? 2 : 0);
}

main();
