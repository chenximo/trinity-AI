#!/usr/bin/env node
/**
 * 将 official-prices-api-image.json 发布为本地 L4 刊例缓存（按模态隔离）
 *
 *   npm run pricing:publish-official:image
 */

import { publishOfficialPricesApi } from "./lib/publish-official-prices-api.mjs";
import {
  OFFICIAL_PRICES_API_IMAGE,
  OFFICIAL_PRICES_API_IMAGE_META,
} from "./lib/paths.mjs";

async function main() {
  await publishOfficialPricesApi({
    modality: "image",
    draftFile: OFFICIAL_PRICES_API_IMAGE,
    metaFile: OFFICIAL_PRICES_API_IMAGE_META,
    publishedFrom: "official-prices-api-image.json",
    defaultPolicy: "official_vendor_image+l2_fallback",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
