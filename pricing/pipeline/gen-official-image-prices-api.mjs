#!/usr/bin/env node
/**
 * 生图厂商官方价 → GET /v1/prices 同构 JSON（可上线草案）
 *
 *   npm run pricing:gen-official:image
 *
 * - 骨架：线上 prices-api（modality=image）模型列表与 price_groups 结构
 * - 价格：official tiers[] 按 tierKey 对齐
 * - **官方无档** → AIGC 国际 USD → AIGC 国内 CNY÷6.5 → TokenHub CNY÷6.5
 * - CNY 官方 ÷ 6.5 → USD；官方 / AIGC 国际 USD 直用
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { assembleOfficialPricesDocument } from "./lib/build-official-prices-api.mjs";
import { refreshOnlinePricesForCompare } from "./lib/fetch-online-prices-lib.mjs";
import { indexAigcImageByTrinity } from "../suppliers/aigc/lib/pricing-api-image.mjs";
import {
  OUT_DRAFT_DIR,
  OFFICIAL_PRICES_API_IMAGE,
  OFFICIAL_PRICES_API_IMAGE_META,
  OFFICIAL_MAP_FILE,
  officialPricingFile,
  SUPPLIERS_DIR,
  TOKENHUB_FILE,
} from "./lib/paths.mjs";

const FX = 6.5;
const TAG = "official_prices_api_image";
const AIGC_IMAGE_FILE = path.join(
  SUPPLIERS_DIR,
  "aigc/output/pricing-api-image.json",
);
const AIGC_IMAGE_MAP = path.join(SUPPLIERS_DIR, "aigc/trinity-map-image.json");

function indexTokenhubImageByTrinity(thData) {
  const map = new Map();
  for (const m of thData.models ?? []) {
    const isImage =
      /^hy-image/i.test(m.modelId ?? "") ||
      (m.tags ?? []).some((t) => /图片|image/i.test(t));
    if (!isImage) continue;
    const id = (m.trinityId ?? m.modelId)?.toLowerCase();
    if (id) map.set(id, m);
    if (m.modelId) map.set(m.modelId.toLowerCase(), m);
  }
  return map;
}

async function main() {
  await mkdir(OUT_DRAFT_DIR, { recursive: true });

  const [templateData, officialData, mapRaw, aigcRaw, aigcMapRaw, thRaw] =
    await Promise.all([
      refreshOnlinePricesForCompare("image", { quiet: true }).then((o) => o.raw),
      readFile(officialPricingFile("image"), "utf8").then(JSON.parse),
      readFile(OFFICIAL_MAP_FILE, "utf8").then(JSON.parse),
      readFile(AIGC_IMAGE_FILE, "utf8").then(JSON.parse),
      readFile(AIGC_IMAGE_MAP, "utf8").then(JSON.parse),
      readFile(TOKENHUB_FILE, "utf8").then(JSON.parse),
    ]);

  const aigcTrinityMap = { ...aigcMapRaw };
  delete aigcTrinityMap._comment;
  const { domestic: aigcDomByTrinity, international: aigcIntlByTrinity } =
    indexAigcImageByTrinity(aigcRaw.models ?? [], aigcTrinityMap);
  const tokenhubByTrinity = indexTokenhubImageByTrinity(thRaw);

  const vendorMap = {};
  for (const [k, v] of Object.entries(mapRaw)) {
    if (k.startsWith("_")) continue;
    if (v?.modality !== "image") continue;
    vendorMap[k.toLowerCase()] = v;
  }

  const generatedAt = new Date().toISOString();
  const { document, buildStats } = assembleOfficialPricesDocument({
    templateData,
    officialData,
    vendorMap,
    fxCnyPerUsd: FX,
    tag: TAG,
    pricingPolicy: "official_vendor_image+l2_fallback",
    preserveByModel: new Map(),
    generatedAt,
    modality: "image",
    officialSourcePath: "suppliers/official/output/image/vendor-pricing.json",
    aigcDomByTrinity,
    aigcIntlByTrinity,
    aigcTrinityMap,
    tokenhubByTrinity,
  });

  const json = JSON.stringify(document, null, 2);
  await writeFile(OFFICIAL_PRICES_API_IMAGE, json, "utf8");
  await writeFile(
    OFFICIAL_PRICES_API_IMAGE_META,
    JSON.stringify(buildStats, null, 2),
    "utf8",
  );

  console.log(
    `Built ${path.basename(OFFICIAL_PRICES_API_IMAGE)}: ${buildStats.pricedModelCount}/${document.modelCount} models · tiers official ${buildStats.tierFromOfficial} · aigc ${buildStats.tierFromAigc} · tokenhub ${buildStats.tierFromTokenhub} · unchanged ${buildStats.tierUnchanged}`,
  );
  console.log(`FX: 1 USD = ${FX} CNY · policy: ${buildStats.pricingPolicy}`);
  console.log(`Fallback: ${buildStats.fallbackPolicy}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_IMAGE}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_IMAGE_META}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
