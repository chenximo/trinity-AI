#!/usr/bin/env node
/**
 * 生视频刊例一键编排：gen → diff →（可选）publish
 *
 *   npm run pricing:rollout:video
 *   npm run pricing:rollout:video -- --publish
 *   npm run pricing:rollout:video -- --skip-gen
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const args = process.argv.slice(2);
const doPublish = args.includes("--publish");
const skipGen = args.includes("--skip-gen");

function run(name, scriptRel) {
  console.log(`\n── rollout:video · ${name} ──`);
  const r = spawnSync("node", [scriptRel], {
    cwd: root,
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error(`rollout:video FAILED at: ${name}`);
    process.exit(r.status ?? 1);
  }
}

if (!skipGen) {
  run("gen-official", "pricing/pipeline/gen-official-video-prices-api.mjs");
}
run("diff-official", "pricing/pipeline/diff-official-video-prices-api.mjs");

if (doPublish) {
  run("publish", "pricing/pipeline/publish-official-video-prices-api.mjs");
} else {
  console.log(
    "\nReview draft/official-prices-api-video-diff.md then:\n  npm run pricing:publish-official:video\n  or: npm run pricing:rollout:video -- --publish --skip-gen",
  );
}

console.log("\nrollout:video OK");
