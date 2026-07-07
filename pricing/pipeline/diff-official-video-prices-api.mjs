#!/usr/bin/env node
/**
 * 生视频官方+AIGC 草案 vs 线上刊例 diff
 *
 *   npm run pricing:diff:official-video
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  compareVideoPricesDocuments,
  renderVideoPricesDiffMd,
  videoPricesDiffCsvRows,
} from "./lib/diff-video-prices-api.mjs";
import { writeCsv } from "./lib/export-excel.mjs";
import { readOnlinePricesCache } from "./lib/fetch-online-prices-lib.mjs";
import {
  OFFICIAL_PRICES_API_VIDEO,
  OFFICIAL_PRICES_API_VIDEO_DIFF_MD,
  OFFICIAL_PRICES_API_VIDEO_DIFF_JSON,
  OFFICIAL_PRICES_API_VIDEO_DIFF_CSV,
} from "./lib/paths.mjs";

async function main() {
  await mkdir(path.dirname(OFFICIAL_PRICES_API_VIDEO_DIFF_MD), { recursive: true });

  const [{ raw: onlineDoc }, draftRaw] = await Promise.all([
    readOnlinePricesCache("video"),
    readFile(OFFICIAL_PRICES_API_VIDEO, "utf8"),
  ]);

  const draftDoc = JSON.parse(draftRaw);
  const doc = compareVideoPricesDocuments(onlineDoc, draftDoc);

  const md = renderVideoPricesDiffMd(doc, {
    draftFile: "official-prices-api-video.json",
  });

  await writeFile(OFFICIAL_PRICES_API_VIDEO_DIFF_MD, md, "utf8");
  await writeFile(
    OFFICIAL_PRICES_API_VIDEO_DIFF_JSON,
    JSON.stringify(doc, null, 2),
    "utf8",
  );
  const csvObjects = videoPricesDiffCsvRows(doc);
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
    OFFICIAL_PRICES_API_VIDEO_DIFF_CSV,
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
  console.log(`Wrote ${OFFICIAL_PRICES_API_VIDEO_DIFF_MD}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_VIDEO_DIFF_JSON}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_VIDEO_DIFF_CSV}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
