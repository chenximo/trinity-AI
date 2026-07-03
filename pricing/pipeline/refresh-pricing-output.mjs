#!/usr/bin/env node
/**
 * 价目产出刷新：官方 + 衍生供应商 JSON → 上游汇总 → Excel
 *
 * 新增/改价/改映射后跑本命令，保证 trinity-pricing-text.xlsx 与 JSON 真源一致。
 *
 *   npm run pricing:refresh
 *   npm run pricing:refresh -- --skip-official-fetch   # 仅重算 upstream（official 已是最新）
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const args = new Set(process.argv.slice(2));
const skipOfficial = args.has("--skip-official-fetch");

/** @type {[string, string, string[]][]} */
const steps = [
  ...(skipOfficial
    ? []
    : [["official:text", "npm", ["run", "pricing:supplier:official:text"]]]),
  ["aigc", "npm", ["run", "pricing:supplier:aigc"]],
  ["volcengine", "npm", ["run", "pricing:supplier:volcengine"]],
  ["wangju-cloudportal", "npm", ["run", "pricing:supplier:wangju-cloudportal"]],
  ["upstream", "npm", ["run", "pricing:upstream"]],
];

let failed = false;
for (const [name, cmd, cmdArgs] of steps) {
  console.log(`\n── pricing:refresh · ${name} ──`);
  const r = spawnSync(cmd, cmdArgs, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`pricing:refresh FAILED at step: ${name}`);
    failed = true;
    break;
  }
}

if (!failed) {
  console.log("\n✅ pricing:refresh 完成");
  console.log("   Excel: pricing/output/trinity-pricing-text.xlsx");
  console.log("   建议再跑: npm run pricing:gate");
}

process.exit(failed ? 1 : 0);
