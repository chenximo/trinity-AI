#!/usr/bin/env node
/**
 * 厂商官方价 → 0.65 prices-api 草案（DeepSeek 保留归档稿）
 *
 *   npm run pricing:gen-65-official
 *
 * - 归档当前 draft/0.65_prices-api.json → 0.65_prices_api_6_30.json
 * - 生成 draft/0.65_prices_api_7_02.json（官方价 · fx 6.5）
 * - 同步更新 draft/0.65_prices-api.json（与 7_02 一致）
 */

import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { assembleOfficialPricesDocument } from "./lib/build-official-prices-api.mjs";
import {
  OUT_DRAFT_DIR,
  PRICES_API_FILE,
  DRAFT_065_FILE,
  DRAFT_065_META_FILE,
  DRAFT_065_ARCHIVE_630,
  DRAFT_065_ARCHIVE_630_META,
  DRAFT_065_702,
  DRAFT_065_702_META,
  OFFICIAL_MAP_FILE,
  officialPricingFile,
} from "./lib/paths.mjs";

const FX = 6.5;
const TAG = "0.65_prices_api_7_02";

function isDeepSeekModelId(modelId) {
  return String(modelId ?? "")
    .toLowerCase()
    .startsWith("deepseek");
}

async function main() {
  await mkdir(OUT_DRAFT_DIR, { recursive: true });

  await copyFile(DRAFT_065_FILE, DRAFT_065_ARCHIVE_630);
  try {
    await copyFile(DRAFT_065_META_FILE, DRAFT_065_ARCHIVE_630_META);
  } catch {
    /* optional */
  }
  console.log(`Archived → ${path.basename(DRAFT_065_ARCHIVE_630)}`);

  const archive = JSON.parse(await readFile(DRAFT_065_ARCHIVE_630, "utf8"));
  const preserveByModel = new Map();
  for (const entry of archive.data ?? []) {
    const id = entry.model?.toLowerCase();
    if (id && isDeepSeekModelId(id)) {
      preserveByModel.set(id, entry);
    }
  }

  const [templateData, officialData, mapRaw] = await Promise.all([
    readFile(PRICES_API_FILE, "utf8").then(JSON.parse),
    readFile(officialPricingFile("text"), "utf8").then(JSON.parse),
    readFile(OFFICIAL_MAP_FILE, "utf8").then(JSON.parse),
  ]);

  const vendorMap = {};
  for (const [k, v] of Object.entries(mapRaw)) {
    if (k.startsWith("_")) continue;
    vendorMap[k.toLowerCase()] = v;
  }

  const generatedAt = new Date().toISOString();
  const { document, buildStats } = assembleOfficialPricesDocument({
    templateData,
    officialData,
    vendorMap,
    fxCnyPerUsd: FX,
    tag: TAG,
    preserveByModel,
    generatedAt,
  });

  const json = JSON.stringify(document, null, 2);
  await writeFile(DRAFT_065_702, json, "utf8");
  await writeFile(DRAFT_065_702_META, JSON.stringify(buildStats, null, 2), "utf8");
  await writeFile(DRAFT_065_FILE, json, "utf8");
  await writeFile(DRAFT_065_META_FILE, JSON.stringify(buildStats, null, 2), "utf8");

  console.log(
    `Built ${path.basename(DRAFT_065_702)}: official ${buildStats.pricedModelCount}/${document.modelCount} · preserved DeepSeek ${buildStats.preservedModelCount}`,
  );
  console.log(`FX: 1 USD = ${FX} CNY · policy: ${buildStats.pricingPolicy}`);
  console.log(`DeepSeek preserved: ${[...preserveByModel.keys()].join(", ")}`);
  console.log(`Wrote ${DRAFT_065_702}`);
  console.log(`Wrote ${DRAFT_065_FILE} (synced with 7_02)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
