#!/usr/bin/env node
/**
 * 拉取 GET /v1/prices 全量线上价目 → output/online/prices-api.json
 *
 *   npm run pricing:fetch
 *   node pricing/pipeline/fetch-online-prices.mjs --modality=text
 *   node pricing/pipeline/fetch-online-prices.mjs --modality image
 *   node pricing/pipeline/fetch-online-prices.mjs --json-only
 *
 * 对比流水线（upstream / compare / listing-compare / diff）会自行拉最新价，
 * 无需先跑本命令；本命令用于单独刷新缓存或排障。
 */

import { fetchAndPersistOnlinePrices } from "./lib/fetch-online-prices-lib.mjs";
import { PRICES_API_CSV_FILE } from "./lib/paths.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  let modality = "text";
  let jsonOnly = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--modality" && args[i + 1]) {
      modality = args[++i];
    } else if (a.startsWith("--modality=")) {
      modality = a.slice("--modality=".length);
    } else if (a === "--all") {
      modality = "all";
    } else if (a === "--json-only") {
      jsonOnly = true;
    }
  }
  return { modality, jsonOnly };
}

async function main() {
  const { modality, jsonOnly } = parseArgs();
  await fetchAndPersistOnlinePrices({
    modality,
    writeCsvFile: !jsonOnly,
    quiet: false,
  });
  if (!jsonOnly) console.log(`Wrote ${PRICES_API_CSV_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
