#!/usr/bin/env node
/**
 * 价目产出刷新：官方 + 衍生供应商 JSON → 上游汇总 → Excel
 *
 *   npm run pricing:refresh
 *   npm run pricing:refresh -- --skip-official-fetch
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OFFICIAL_DIRECT_CHANNELS } from "../suppliers/official-direct/channels/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const args = new Set(process.argv.slice(2));
const skipOfficial = args.has("--skip-official-fetch");

/** @type {[string, string, string[]][]} */
const steps = [
  ...(skipOfficial
    ? []
    : [
        ["official:text", "npm", ["run", "pricing:supplier:official:text"]],
        ["official:image", "npm", ["run", "pricing:supplier:official:image"]],
        ["official:video", "npm", ["run", "pricing:supplier:official:video"]],
      ]),
  ["aigc", "npm", ["run", "pricing:supplier:aigc"]],
  ["volcengine", "npm", ["run", "pricing:supplier:volcengine"]],
  ...OFFICIAL_DIRECT_CHANNELS.map(
    (c) =>
      /** @type {[string, string, string[]]} */ ([
        c.supplierId,
        "node",
        [
          "pricing/suppliers/official-direct/build-pricing.mjs",
          `--channel=${c.supplierId}`,
        ],
      ]),
  ),
  ["upstream", "npm", ["run", "pricing:upstream"]],
];

let failed = false;
const childEnv = { ...process.env, PRICING_SKIP_EXCEL_SYNC: "1" };
for (const [name, cmd, cmdArgs] of steps) {
  console.log(`\n── pricing:refresh · ${name} ──`);
  const r = spawnSync(cmd, cmdArgs, { cwd: root, stdio: "inherit", env: childEnv });
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
