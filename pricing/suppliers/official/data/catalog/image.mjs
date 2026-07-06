/**
 * 生图模型原厂目录（国内 + 国际）
 */

import { VENDOR_PRICING_URLS } from "../pricing-urls.mjs";

/**
 * @typedef {"openai"|"google"|"tencent_hunyuan"|"volcengine"|"bailian"|"midjourney"|"kling"|"vidu"} ImageVendorKey
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
  // ── 混元 ─────────────────────────────────────────────────────
  {
    vendor: "tencent_hunyuan",
    vendorLabel: "混元",
    vendorModelId: "hy-image-v3.0",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.image,
    trinityNote: "TokenHub hy-image-v3.0 · API 混元生图 3.0",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "tencent_hunyuan",
    vendorLabel: "混元",
    vendorModelId: "hy-image-lite",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.image,
    trinityNote: "TokenHub hy-image-lite · 混元生图极速版",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "tencent_hunyuan",
    vendorLabel: "混元",
    vendorModelId: "hunyuan-image-3",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.image,
    trinityNote: "Trinity Hunyuan-3.0 · 官方与 hy-image-v3.0 同价 0.2元/张",
    region: "domestic",
    status: "active",
  },
  // ── 豆包 Seedream / 即梦 ─────────────────────────────────────
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
  {
    vendor: "volcengine",
    vendorLabel: "即梦",
    vendorModelId: "jimeng-4.0",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.image,
    region: "domestic",
    status: "active",
  },
  // ── 通义 ─────────────────────────────────────────────────────
  {
    vendor: "bailian",
    vendorLabel: "通义",
    vendorModelId: "qwen-image-0925",
    docUrl: "https://help.aliyun.com/zh/model-studio/text-to-image",
    pricingUrl: VENDOR_PRICING_URLS.bailian.image,
    trinityNote: "Trinity qwen-0925 · 百炼 API qwen-image（统一 ¥0.25/张）",
    region: "domestic",
    status: "active",
  },
  // ── Midjourney ───────────────────────────────────────────────
  {
    vendor: "midjourney",
    vendorLabel: "Midjourney",
    vendorModelId: "midjourney-v7",
    docUrl: "https://docs.midjourney.com/",
    pricingUrl: VENDOR_PRICING_URLS.midjourney.image,
    trinityNote: "订阅制，无公开 API 按张价目",
    region: "international_only",
    status: "active",
  },
  // ── OpenAI image-2 ───────────────────────────────────────────
  {
    vendor: "openai",
    vendorLabel: "OpenAI",
    vendorModelId: "openai-image2-low",
    docUrl: "https://developers.openai.com/api/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.openai.image,
    region: "international_only",
    status: "active",
  },
  {
    vendor: "openai",
    vendorLabel: "OpenAI",
    vendorModelId: "openai-image2-medium",
    docUrl: "https://developers.openai.com/api/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.openai.image,
    region: "international_only",
    status: "active",
  },
  {
    vendor: "openai",
    vendorLabel: "OpenAI",
    vendorModelId: "openai-image2-high",
    docUrl: "https://developers.openai.com/api/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.openai.image,
    region: "international_only",
    status: "active",
  },
  // ── Gemini 生图 ──────────────────────────────────────────────
  {
    vendor: "google",
    vendorLabel: "Gemini",
    vendorModelId: "gemini-2.5-flash-image",
    docUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image?hl=zh-cn",
    pricingUrl: VENDOR_PRICING_URLS.google.image,
    trinityNote: "API ID gemini-2.5-flash-image · Nano Banana",
    region: "global",
    status: "active",
  },
  {
    vendor: "google",
    vendorLabel: "Gemini",
    vendorModelId: "gemini-3-image",
    docUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image?hl=zh-cn",
    pricingUrl: VENDOR_PRICING_URLS.google.image,
    trinityNote: "API ID gemini-3-pro-image · Nano Banana Pro",
    region: "global",
    status: "active",
  },
  {
    vendor: "google",
    vendorLabel: "Gemini",
    vendorModelId: "gemini-3.1-image",
    docUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image?hl=zh-cn",
    pricingUrl: VENDOR_PRICING_URLS.google.image,
    trinityNote: "API ID gemini-3.1-flash-image · Nano Banana 2",
    region: "global",
    status: "active",
  },
  // ── Vidu ─────────────────────────────────────────────────────
  {
    vendor: "vidu",
    vendorLabel: "Vidu",
    vendorModelId: "vidu-q2",
    docUrl: "https://platform.vidu.cn/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.vidu.image,
    trinityNote: "viduq2 文生图 · 积分计价",
    region: "domestic",
    status: "active",
  },
  // ── 可灵 ─────────────────────────────────────────────────────
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kling-2.1",
    docUrl: VENDOR_PRICING_URLS.kling.image_api,
    pricingUrl: VENDOR_PRICING_URLS.kling.image,
    trinityNote: "灵感值/Credits 计价，无公开按张 API 价目",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kling-3",
    docUrl: VENDOR_PRICING_URLS.kling.image_api,
    pricingUrl: VENDOR_PRICING_URLS.kling.image,
    trinityNote: "灵感值/Credits 计价，无公开按张 API 价目",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kling-3.0-omni",
    docUrl: VENDOR_PRICING_URLS.kling.image_api,
    pricingUrl: VENDOR_PRICING_URLS.kling.image,
    trinityNote: "灵感值/Credits 计价，无公开按张 API 价目",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kling-o1",
    docUrl: VENDOR_PRICING_URLS.kling.image_api,
    pricingUrl: VENDOR_PRICING_URLS.kling.image,
    trinityNote: "灵感值/Credits 计价，无公开按张 API 价目",
    region: "domestic",
    status: "active",
  },
];
