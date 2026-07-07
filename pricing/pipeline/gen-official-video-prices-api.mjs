#!/usr/bin/env node
/**
 * 生视频厂商官方价 → GET /v1/prices 同构 JSON（可上线草案）
 *
 *   npm run pricing:gen-official:video
 *
 * - 骨架：线上 prices-api（modality=video）模型列表与 price_groups 结构
 * - 价格：official tiers[] 按分辨率/有声属性对齐（listingAttribute）
 * - **官方无档** → AIGC 国际 USD → AIGC 国内 CNY÷fx → TokenHub → 火山
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { assembleOfficialVideoPricesDocument } from "./lib/build-official-prices-api-video.mjs";
import { refreshOnlinePricesForCompare } from "./lib/fetch-online-prices-lib.mjs";
import { indexAigcVideoByTrinity } from "../suppliers/aigc/lib/pricing-api-video.mjs";
import { VIDEO_MODEL_REGISTRY } from "../config/video-model-registry.mjs";
import {
  OUT_DRAFT_DIR,
  OFFICIAL_PRICES_API_VIDEO,
  OFFICIAL_PRICES_API_VIDEO_META,
  OFFICIAL_MAP_FILE,
  officialPricingFile,
  SUPPLIERS_DIR,
  TOKENHUB_FILE,
} from "./lib/paths.mjs";

const TAG = "official_prices_api_video";
const AIGC_VIDEO_FILE = path.join(
  SUPPLIERS_DIR,
  "aigc/output/pricing-api-video.json",
);
const AIGC_VIDEO_MAP = path.join(SUPPLIERS_DIR, "aigc/trinity-map-video.json");
const VOLC_VIDEO_FILE = path.join(
  SUPPLIERS_DIR,
  "volcengine/output/video/pricing-api.json",
);

function indexTokenhubVideoByTrinity(thData) {
  const map = new Map();
  for (const m of thData.models ?? []) {
    const isVideo =
      /-video-/i.test(m.modelId ?? "") ||
      (m.tags ?? []).some((t) => /视频|video/i.test(t));
    if (!isVideo) continue;
    const id = (m.trinityId ?? m.modelId)?.toLowerCase();
    if (id) map.set(id, m);
    if (m.modelId) map.set(m.modelId.toLowerCase(), m);
  }
  return map;
}

function indexVolcengineVideoByTrinity(volcData) {
  const map = new Map();
  for (const m of volcData.models ?? []) {
    if (m.trinityId) map.set(m.trinityId.toLowerCase(), m);
    if (m.modelId) map.set(m.modelId.toLowerCase(), m);
    if (m.upstreamModelId) map.set(m.upstreamModelId.toLowerCase(), m);
  }
  return map;
}

function registryByOnlineSlugMap() {
  const map = new Map();
  for (const reg of VIDEO_MODEL_REGISTRY) {
    if (reg.onlineSlug) map.set(reg.onlineSlug.toLowerCase(), reg);
  }
  return map;
}

async function main() {
  await mkdir(OUT_DRAFT_DIR, { recursive: true });

  const [templateData, officialData, mapRaw, aigcRaw, aigcMapRaw, thRaw, volcRaw] =
    await Promise.all([
      refreshOnlinePricesForCompare("video", { quiet: true }).then((o) => o.raw),
      readFile(officialPricingFile("video"), "utf8").then(JSON.parse),
      readFile(OFFICIAL_MAP_FILE, "utf8").then(JSON.parse),
      readFile(AIGC_VIDEO_FILE, "utf8").then(JSON.parse),
      readFile(AIGC_VIDEO_MAP, "utf8").then(JSON.parse),
      readFile(TOKENHUB_FILE, "utf8").then(JSON.parse),
      readFile(VOLC_VIDEO_FILE, "utf8").then(JSON.parse),
    ]);

  const fxCnyPerUsd = Number(templateData.fxCnyPerUsd) || 7.25;

  const aigcTrinityMap = { ...aigcMapRaw };
  delete aigcTrinityMap._comment;
  const { domestic: aigcDomByTrinity, international: aigcIntlByTrinity } =
    indexAigcVideoByTrinity(aigcRaw.models ?? [], aigcTrinityMap);
  const tokenhubByTrinity = indexTokenhubVideoByTrinity(thRaw);
  const volcengineByTrinity = indexVolcengineVideoByTrinity(volcRaw);

  const vendorMap = {};
  for (const [k, v] of Object.entries(mapRaw)) {
    if (k.startsWith("_")) continue;
    if (v?.modality && v.modality !== "video") continue;
    vendorMap[k.toLowerCase()] = v;
  }

  const generatedAt = new Date().toISOString();
  const { document, buildStats } = assembleOfficialVideoPricesDocument({
    templateData,
    officialData,
    vendorMap,
    registryByOnlineSlug: registryByOnlineSlugMap(),
    fxCnyPerUsd,
    tag: TAG,
    pricingPolicy: "official_vendor_video+l2_fallback",
    generatedAt,
    aigcDomByTrinity,
    aigcIntlByTrinity,
    aigcTrinityMap,
    tokenhubByTrinity,
    volcengineByTrinity,
  });

  const json = JSON.stringify(document, null, 2);
  await writeFile(OFFICIAL_PRICES_API_VIDEO, json, "utf8");
  await writeFile(
    OFFICIAL_PRICES_API_VIDEO_META,
    JSON.stringify(buildStats, null, 2),
    "utf8",
  );

  console.log(
    `Built ${path.basename(OFFICIAL_PRICES_API_VIDEO)}: ${buildStats.pricedModelCount}/${document.modelCount} models · tiers official ${buildStats.tierFromOfficial} · aigc ${buildStats.tierFromAigc} · tokenhub ${buildStats.tierFromTokenhub} · volc ${buildStats.tierFromVolcengine} · unchanged ${buildStats.tierUnchanged}`,
  );
  console.log(`FX: 1 USD = ${fxCnyPerUsd} CNY · policy: ${buildStats.pricingPolicy}`);
  console.log(`Fallback: ${buildStats.fallbackPolicy}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_VIDEO}`);
  console.log(`Wrote ${OFFICIAL_PRICES_API_VIDEO_META}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
