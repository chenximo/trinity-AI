#!/usr/bin/env node
/**
 * 刊例（L4）vs 官方锚 — 校验并写入 listing-compare.json
 *
 *   npm run pricing:validate:compare
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildListingCompareBundle } from "./lib/listing-compare-lib.mjs";
import { OUT_VALIDATE_DIR } from "./lib/paths.mjs";

const OUT_JSON = path.join(OUT_VALIDATE_DIR, "listing-compare.json");

async function main() {
  const bundle = await buildListingCompareBundle();

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(bundle, null, 2), "utf8");

  console.log(JSON.stringify(bundle.summary, null, 2));
  console.log(`\nWrote ${OUT_JSON}`);
  console.log(`Listing alerts: ${bundle.alerts.length}`);

  if (!bundle.summary.ok) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
