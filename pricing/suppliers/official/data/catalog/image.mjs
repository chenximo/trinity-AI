/**
 * 生图模型原厂目录（国内厂商官网文档）
 */

import { VENDOR_PRICING_URLS } from "../pricing-urls.mjs";

/**
 * @typedef {"tencent_hunyuan"|"volcengine"} ImageVendorKey
 * @typedef {"active"|"deprecated"|"retired"} CatalogStatus
 *
 * @typedef {{
 *   vendor: ImageVendorKey,
 *   vendorLabel: string,
 *   vendorModelId: string,
 *   docUrl: string,
 *   pricingUrl?: string,
 *   sunsetDate?: string | null,
 *   sunsetNote?: string | null,
 *   trinityNote?: string | null,
 *   region?: "global" | "domestic" | "international_only",
 *   status?: CatalogStatus,
 * }} CatalogEntry
 */

/** @type {CatalogEntry[]} */
export const IMAGE_CATALOG = [
  {
    vendor: "tencent_hunyuan",
    vendorLabel: "混元",
    vendorModelId: "hy-image-v3.0",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.image,
    trinityNote: "TokenHub hy-image-v3.0",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "tencent_hunyuan",
    vendorLabel: "混元",
    vendorModelId: "hy-image-lite",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.image,
    trinityNote: "TokenHub hy-image-lite",
    region: "domestic",
    status: "active",
  },
  // ── 火山方舟 · Seedream ───────────────────────────────────────
  {
    vendor: "volcengine",
    vendorLabel: "豆包",
    vendorModelId: "doubao-seedream-5.0-lite",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.image,
    region: "domestic",
    status: "active",
  },
  {
    vendor: "volcengine",
    vendorLabel: "豆包",
    vendorModelId: "doubao-seedream-4.5",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.image,
    region: "domestic",
    status: "active",
  },
  {
    vendor: "volcengine",
    vendorLabel: "豆包",
    vendorModelId: "doubao-seedream-4.0",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.image,
    region: "domestic",
    status: "active",
  },
];
