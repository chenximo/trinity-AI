#!/usr/bin/env node
/**
 * 火山方舟官方价目 → pricing-api.json（从 raw 归一化）
 *
 *   node build-pricing.mjs
 *   node build-pricing.mjs --modality=text|image|video|all
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRICING_RAW_OUT } from "./lib/constants.mjs";
import { buildFromRawFile } from "./lib/build-from-raw.mjs";
import { syncPricingExcel } from "../../pipeline/lib/sync-pricing-excel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_FILE = path.join(__dirname, "output", PRICING_RAW_OUT);

/** @param {string[]} argv */
function parseArgs(argv) {
  let modality = "all";
  for (const arg of argv) {
    if (arg.startsWith("--modality=")) {
      modality = arg.slice("--modality=".length);
    } else if (arg === "--modality") {
      modality = argv[argv.indexOf(arg) + 1] ?? "all";
    }
  }
  return { modality };
}

async function main() {
  const { modality } = parseArgs(process.argv.slice(2));
  let rawExists = true;
  try {
    await readFile(RAW_FILE, "utf8");
  } catch {
    rawExists = false;
  }

  if (!rawExists) {
    console.error(
      `缺少 ${RAW_FILE}\n请先运行：npm run pricing:supplier:volcengine:doc`,
    );
    process.exit(1);
  }

  const result = await buildFromRawFile(RAW_FILE, /** @type {'all'|import('./lib/constants.mjs').MODALITIES[number]} */ (modality));

  for (const [m, info] of Object.entries(result)) {
    console.log(
      `Volcengine ${m}: ${info.modelCount} models · Trinity mapped: ${info.trinityMappedCount}`,
    );
    console.log(`Wrote ${info.outFile}`);
  }
  syncPricingExcel({ label: "volcengine" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
