#!/usr/bin/env node
/**
 * 生图官方+AIGC 草案 vs 线上刊例 diff
 *
 *   npm run pricing:diff:official-image
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  compareImagePricesDocuments,
  renderImagePricesDiffMd,
  imagePricesDiffCsvRows,
} from "./lib/diff-image-prices-api.mjs";
import { writeCsv } from "./lib/export-excel.mjs";
import {
  OFFICIAL_PRICES_API_IMAGE,
  OFFICIAL_PRICES_API_IMAGE_DIFF_MD,
  OFFICIAL_PRICES_API_IMAGE_DIFF_JSON,
  OFFICIAL_PRICES_API_IMAGE_DIFF_CSV,
  PRICES_API_FILE,
} from "./lib/paths.mjs";

async function main() {
  await mkdir(path.dirname(OFFICIAL_PRICES_API_IMAGE_DIFF_MD), { recursive: true });

  const [onlineRaw, draftRaw] = await Promise.all([
    readFile(PRICES_API_FILE, "utf8"),
    readFile(OFFICIAL_PRICES_API_IMAGE, "utf8"),
  ]);

  const onlineDoc = JSON.parse(onlineRaw);
  const draftDoc = JSON.parse(draftRaw);
  const doc = compareImagePricesDocuments(onlineDoc, draftDoc);

  const md = renderImagePricesDiffMd(doc, {
    draftFile: "official-prices-api-image.json",
  });

  await writeFile(OFFICIAL_PRICES_API_IMAGE_DIFF_MD, md, "utf8");
  await writeFile(
    OFFICIAL_PRICES_API_IMAGE_DIFF_JSON,
    JSON.stringify(doc, null, 2),
    "utf8",
  );
  const csvObjects = imagePricesDiffCsvRows(doc);
  const csvHeader = [
    "model",
    "display_name",
    "tier",
    "tier_key",
    "online_usd",
    "draft_usd",
    "delta_usd",
    "delta_pct",
    "verdict",
  ];
  await writeCsv(
    OFFICIAL_PRICES_API_IMAGE_DIFF_CSV,
    [
      csvHeader,
      ...csvObjects.map((r) => csvHeader.map((k) => r[k] ?? "")),
    ],
    writeFile,
  );

  const s = doc.summary;
  console.log(
    `Diff: ${s.changedModels}/${s.modelCount} models changed · tiers ↓${s.tierDown} ↑${s.tierUp} =${s.tierUnchanged}`,
  );
  console.log(`Wrote ${OFFICIAL_PRICES_API_IMAGE_DIFF_MD}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_IMAGE_DIFF_JSON}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_IMAGE_DIFF_CSV}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
