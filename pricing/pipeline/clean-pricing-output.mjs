#!/usr/bin/env node
/**
 * 清理 pricing/output 下可再生的临时 JSON（备份、publish 日志、legacy 重复刊例）
 *
 *   npm run pricing:clean              # 安全清理（仅 gitignore 类）
 *   npm run pricing:clean -- --derived # 额外删 flat/index（可从主 JSON 再生）
 *
 * 保留真源见 pricing/output/README.md §产物保留
 */

import { readdir, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OUT_ONLINE_DIR, OUT_DRAFT_DIR } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRICING_ROOT = path.join(__dirname, "..");
const withDerived = process.argv.includes("--derived");

const SAFE_GLOBS = [
  /\.old\.json$/,
  /-publish\.log\.json$/,
];

/** legacy 单文件刊例（已有 prices-api-{modality}.json 时删） */
const LEGACY_ONLINE = [
  "prices-api.json",
  "prices-api-flat.json",
  "prices-api-index.json",
];

const DERIVED_SUFFIX = ["-flat.json", "-index.json"];

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function removeIfExists(p, reason) {
  if (!(await exists(p))) return 0;
  await unlink(p);
  console.log(`removed ${path.relative(PRICING_ROOT, p)} (${reason})`);
  return 1;
}

async function cleanDir(dir, filter) {
  let n = 0;
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return 0;
  }
  for (const name of entries) {
    const full = path.join(dir, name);
    if (filter(name)) {
      n += await removeIfExists(full, "ephemeral");
    }
  }
  return n;
}

async function main() {
  let removed = 0;

  removed += await cleanDir(OUT_ONLINE_DIR, (name) =>
    SAFE_GLOBS.some((re) => re.test(name)),
  );

  const onlineEntries = await readdir(OUT_ONLINE_DIR).catch(() => []);
  const hasModalityCache = onlineEntries.some((n) =>
    /^prices-api-(text|image|video)\.json$/.test(n),
  );
  if (hasModalityCache) {
    for (const name of LEGACY_ONLINE) {
      removed += await removeIfExists(
        path.join(OUT_ONLINE_DIR, name),
        "legacy duplicate",
      );
    }
  }

  if (withDerived) {
    removed += await cleanDir(OUT_ONLINE_DIR, (name) =>
      DERIVED_SUFFIX.some((s) => name.endsWith(s)),
    );
  }

  removed += await cleanDir(PRICING_ROOT, (name) => name.startsWith(".tmp-"));

  console.log(
    `\npricing:clean done · ${removed} file(s) removed` +
      (withDerived ? " (--derived)" : ""),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
