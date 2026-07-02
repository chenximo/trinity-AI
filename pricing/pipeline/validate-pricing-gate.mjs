#!/usr/bin/env node
/**
 * 价目发布门禁：官方种子 + 交叉校验 + 供应商覆盖 + 告警汇总
 *
 *   npm run pricing:gate
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const steps = [
  ["official:text", "npm", ["run", "pricing:supplier:official:text"]],
  ["aigc-excel", "node", ["pricing/pipeline/validate-aigc-excel.mjs"]],
  ["official-aigc", "node", ["pricing/pipeline/validate-official-aigc.mjs"]],
  [
    "official-suppliers",
    "node",
    ["pricing/pipeline/validate-official-vs-suppliers.mjs"],
  ],
  ["alerts-dry-run", "node", ["pricing/pipeline/emit-pricing-alerts.mjs", "--dry-run"]],
];

let failed = false;
for (const [name, cmd, args] of steps) {
  console.log(`\n── pricing:gate · ${name} ──`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`pricing:gate FAILED at step: ${name}`);
    failed = true;
    break;
  }
}

process.exit(failed ? 1 : 0);
