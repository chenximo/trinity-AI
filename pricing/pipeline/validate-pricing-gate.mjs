#!/usr/bin/env node
/**
 * 价目发布门禁：官方种子 + 交叉校验 + 刊例对比 + 告警汇总
 *
 *   npm run pricing:gate
 *   npm run pricing:gate -- --skip-fetch
 *   npm run pricing:gate -- --skip-fetch --no-fail-fast
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const argv = new Set(process.argv.slice(2));
const skipFetch = argv.has("--skip-fetch");
const noFailFast = argv.has("--no-fail-fast");

/** @type {[string, string, string[]][]} */
const allSteps = [
  ["skill:lint:tools", "npm", ["run", "skill:lint:tools"]],
  ["official:text", "npm", ["run", "pricing:supplier:official:text"]],
  ["official:image", "npm", ["run", "pricing:supplier:official:image"]],
  ["aigc-excel", "node", ["pricing/pipeline/validate-aigc-excel.mjs"]],
  ["official-aigc", "node", ["pricing/pipeline/validate-official-aigc.mjs"]],
  ["official-aigc-image", "node", ["pricing/pipeline/validate-official-aigc-image.mjs"]],
  ["official-aigc-video", "node", ["pricing/pipeline/validate-official-aigc-video.mjs"]],
  [
    "official-suppliers",
    "node",
    ["pricing/pipeline/validate-official-vs-suppliers.mjs"],
  ],
  [
    "official-suppliers-image",
    "node",
    ["pricing/pipeline/validate-official-vs-suppliers-image.mjs"],
  ],
  [
    "official-suppliers-video",
    "node",
    ["pricing/pipeline/validate-official-vs-suppliers-video.mjs"],
  ],
  ["listing-compare", "node", ["pricing/pipeline/validate-pricing-compare.mjs"]],
  [
    "alerts",
    "node",
    [
      "pricing/pipeline/emit-pricing-alerts.mjs",
      ...(process.env.PRICING_ALERT_WEBHOOK_URL ? [] : ["--dry-run"]),
    ],
  ],
];

const skipWhenNoFetch = new Set(["official:text", "official:image"]);

const steps = allSteps.filter(
  ([name]) => !(skipFetch && skipWhenNoFetch.has(name)),
);

let failed = false;
const failedSteps = [];

for (const [name, cmd, args] of steps) {
  console.log(`\n── pricing:gate · ${name} ──`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`pricing:gate FAILED at step: ${name}`);
    failed = true;
    failedSteps.push(name);
    if (!noFailFast) break;
  }
}

if (failed && noFailFast) {
  console.error(`\npricing:gate 完成（有失败）: ${failedSteps.join(", ")}`);
}

process.exit(failed ? 1 : 0);
