#!/usr/bin/env node
/**
 * 将 official-prices-api-video.json 发布为本地 L4 刊例缓存（按模态隔离）
 *
 *   npm run pricing:publish-official:video
 */

import path from "node:path";
import { publishOfficialPricesApi } from "./lib/publish-official-prices-api.mjs";
import {
  OFFICIAL_PRICES_API_VIDEO,
  OFFICIAL_PRICES_API_VIDEO_META,
} from "./lib/paths.mjs";

async function main() {
  await publishOfficialPricesApi({
    modality: "video",
    draftFile: OFFICIAL_PRICES_API_VIDEO,
    metaFile: OFFICIAL_PRICES_API_VIDEO_META,
    publishedFrom: "official-prices-api-video.json",
    defaultPolicy: "official_vendor_video+l2_fallback",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
