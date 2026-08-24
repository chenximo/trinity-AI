/**
 * 生图官网核实价目（种子）
 * 来源：厂商官网文档核实；`locked: true` 表示已与公开价目对齐，勿用 AIGC 反写
 */

export const IMAGE_SEED_VERIFIED_AT = "2026-08-24";

/** 可灵生图 API 价目（能力 × 分辨率；1K/2K 同价，无 4K 除非写明） */
const KLING_IMAGE_SOURCE_URL =
  "https://klingai.com/document-api/pricing/base/image";

/**
 * @typedef {{ tierLabel: string, price: number | string, unit: string, note?: string }} TierSeed
 * @typedef {{
 *   tiers: TierSeed[],
 *   note?: string,
 *   currency?: "CNY" | "USD",
 *   locked?: boolean,
 *   sourceUrl?: string,
 * }} MediaSeedEntry
 */

/** @type {Record<string, MediaSeedEntry>} */
export const IMAGE_SEED = {
  "hy-image-v3.0": {
    locked: true,
    sourceUrl: "https://cloud.tencent.com/document/product/1668/90896",
    tiers: [{ tierLabel: "输出", price: 0.2, unit: "元/张" }],
    note: "腾讯云混元生图 3.0 统一价",
  },
  "hy-image-lite": {
    locked: true,
    sourceUrl: "https://cloud.tencent.com/document/product/1668/90896",
    tiers: [{ tierLabel: "输出", price: 0.099, unit: "元/张" }],
    note: "腾讯云混元生图极速版统一价",
  },
  "hunyuan-image-3": {
    locked: true,
    sourceUrl: "https://cloud.tencent.com/document/product/1668/90896",
    tiers: [{ tierLabel: "输出", price: 0.2, unit: "元/张" }],
    note: "混元生图 3.0 统一价（与 hy-image-v3.0 同档，无分辨率分档）",
  },
  "doubao-seedream-5.0-lite": {
    locked: true,
    sourceUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    tiers: [
      { tierLabel: "1K", price: 0.22, unit: "元/张" },
      { tierLabel: "2K", price: 0.22, unit: "元/张" },
      { tierLabel: "4K", price: 0.22, unit: "元/张" },
    ],
    note: "火山方舟 Seedream 5.0 Lite",
  },
  "doubao-seedream-4.5": {
    locked: true,
    sourceUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    tiers: [
      { tierLabel: "1K", price: 0.25, unit: "元/张" },
      { tierLabel: "2K", price: 0.25, unit: "元/张" },
      { tierLabel: "4K", price: 0.25, unit: "元/张" },
    ],
    note: "火山方舟 Seedream 4.5",
  },
  "doubao-seedream-4.0": {
    locked: true,
    sourceUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    tiers: [
      { tierLabel: "1K", price: 0.2, unit: "元/张" },
      { tierLabel: "2K", price: 0.2, unit: "元/张" },
      { tierLabel: "4K", price: 0.2, unit: "元/张" },
    ],
    note: "火山方舟 Seedream 4.0",
  },
  "jimeng-4.0": {
    locked: true,
    sourceUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    tiers: [
      { tierLabel: "1K", price: 0.22, unit: "元/张" },
      { tierLabel: "2K", price: 0.22, unit: "元/张" },
      { tierLabel: "4K", price: 0.22, unit: "元/张" },
    ],
    note: "即梦 4.0",
  },
  "qwen-image-0925": {
    locked: true,
    sourceUrl: "https://help.aliyun.com/zh/model-studio/model-pricing",
    tiers: [{ tierLabel: "输出", price: 0.25, unit: "元/张" }],
    note: "百炼 Model ID qwen-image · 官方统一价；Trinity qwen-0925 · AIGC 分档为转售口径",
  },
  "midjourney-v7": {
    aigcOnly: true,
    sourceUrl: "https://docs.midjourney.com/docs/plans",
    currency: "USD",
    tiers: [
      { tierLabel: "1K", price: 0.039, unit: "美元/张", note: "AIGC 商务价，非 MJ 订阅/API 官方价" },
    ],
    note: "no_public_api — MJ 为订阅制，无公开按张 API 价目",
  },
  "openai-image2-low": {
    locked: true,
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    currency: "USD",
    tiers: [
      { tierLabel: "1K", price: 0.006, unit: "美元/张" },
      { tierLabel: "2K", price: 0.012, unit: "美元/张", note: "AIGC 映射档，OpenAI 官方为 1024×1536 等尺寸" },
      { tierLabel: "4K", price: 0.02, unit: "美元/张", note: "AIGC 映射档，非 OpenAI 官方尺寸命名" },
    ],
    note: "gpt-image-2 low · 1K=1024² 官方计算器",
  },
  "openai-image2-medium": {
    locked: true,
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    currency: "USD",
    tiers: [
      { tierLabel: "1K", price: 0.053, unit: "美元/张" },
      { tierLabel: "2K", price: 0.107, unit: "美元/张", note: "AIGC 映射档" },
      { tierLabel: "4K", price: 0.178, unit: "美元/张", note: "AIGC 映射档" },
    ],
    note: "gpt-image-2 medium · 1K=1024² 官方计算器",
  },
  "openai-image2-high": {
    locked: true,
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    currency: "USD",
    tiers: [
      { tierLabel: "1K", price: 0.211, unit: "美元/张" },
      { tierLabel: "2K", price: 0.428, unit: "美元/张", note: "AIGC 映射档" },
      { tierLabel: "4K", price: 0.712, unit: "美元/张", note: "AIGC 映射档" },
    ],
    note: "gpt-image-2 high · 1K=1024² 官方计算器",
  },
  "gemini-2.5-flash-image": {
    locked: true,
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn",
    currency: "USD",
    tiers: [{ tierLabel: "1K", price: 0.039, unit: "美元/张" }],
    note: "gemini-2.5-flash-image Standard · ≤1024²",
  },
  "gemini-3-image": {
    locked: true,
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn",
    currency: "USD",
    tiers: [
      { tierLabel: "1K", price: 0.134, unit: "美元/张" },
      { tierLabel: "2K", price: 0.134, unit: "美元/张" },
      { tierLabel: "4K", price: 0.24, unit: "美元/张" },
    ],
    note: "gemini-3-pro-image Standard",
  },
  "gemini-3.1-image": {
    locked: true,
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn",
    currency: "USD",
    tiers: [
      { tierLabel: "1K以下", price: 0.045, unit: "美元/张" },
      { tierLabel: "1K", price: 0.067, unit: "美元/张" },
      { tierLabel: "2K", price: 0.101, unit: "美元/张" },
      { tierLabel: "4K", price: 0.151, unit: "美元/张" },
    ],
    note: "gemini-3.1-flash-image Standard",
  },
  "vidu-q2": {
    locked: true,
    sourceUrl: "https://platform.vidu.cn/docs/pricing",
    tiers: [
      { tierLabel: "1K", price: 0.1875, unit: "元/张" },
      { tierLabel: "2K", price: 0.25, unit: "元/张" },
      { tierLabel: "4K", price: 0.3125, unit: "元/张" },
    ],
    note: "viduq2 文生图 · 6/8/10 积分 × ¥0.03125",
  },
  "kling-2.1": {
    locked: true,
    sourceUrl: KLING_IMAGE_SOURCE_URL,
    tiers: [
      { tierLabel: "1K", price: 0.1, unit: "元/张" },
      { tierLabel: "2K", price: 0.1, unit: "元/张" },
    ],
    capabilities: [
      {
        id: "text_to_image",
        label: "文生图",
        resolutions: ["1K", "2K"],
        price: 0.1,
        unit: "元/张",
      },
      {
        id: "image_to_image",
        label: "图生图",
        resolutions: ["1K", "2K"],
        price: 0.2,
        unit: "元/张",
      },
      {
        id: "multi_reference_image",
        label: "多图参考生图",
        resolutions: ["1K", "2K"],
        price: 0.4,
        unit: "元/张",
      },
    ],
    note: "kling.ai document-api/pricing/base/image · 能力分档 · 1K/2K 同价 · 无 4K",
  },
  "kling-3": {
    locked: true,
    sourceUrl: KLING_IMAGE_SOURCE_URL,
    tiers: [
      { tierLabel: "1K", price: 0.2, unit: "元/张" },
      { tierLabel: "2K", price: 0.2, unit: "元/张" },
    ],
    capabilities: [
      {
        id: "text_to_image",
        label: "文生图",
        resolutions: ["1K", "2K"],
        price: 0.2,
        unit: "元/张",
      },
      {
        id: "image_to_image",
        label: "图生图",
        resolutions: ["1K", "2K"],
        price: 0.2,
        unit: "元/张",
      },
    ],
    note: "官网文生图/图生图同价 · 1K/2K · 无 4K",
  },
  "kling-3.0-omni": {
    locked: true,
    sourceUrl: KLING_IMAGE_SOURCE_URL,
    tiers: [
      { tierLabel: "1K", price: 0.2, unit: "元/张" },
      { tierLabel: "2K", price: 0.2, unit: "元/张" },
      { tierLabel: "4K", price: 0.4, unit: "元/张" },
    ],
    capabilities: [
      {
        id: "text_to_image",
        label: "文生图",
        resolutions: ["1K", "2K"],
        price: 0.2,
        unit: "元/张",
      },
      {
        id: "image_to_image",
        label: "图生图",
        resolutions: ["1K", "2K"],
        price: 0.2,
        unit: "元/张",
      },
      {
        id: "text_to_image",
        label: "文生图",
        resolutions: ["4K"],
        price: 0.4,
        unit: "元/张",
      },
      {
        id: "image_to_image",
        label: "图生图",
        resolutions: ["4K"],
        price: 0.4,
        unit: "元/张",
      },
    ],
    note: "官网 1K/2K 同价；4K 另档",
  },
  "kling-o1": {
    locked: true,
    sourceUrl: KLING_IMAGE_SOURCE_URL,
    tiers: [
      { tierLabel: "1K", price: 0.2, unit: "元/张" },
      { tierLabel: "2K", price: 0.2, unit: "元/张" },
    ],
    capabilities: [
      {
        id: "text_to_image",
        label: "文生图",
        resolutions: ["1K", "2K"],
        price: 0.2,
        unit: "元/张",
      },
      {
        id: "image_to_image",
        label: "图生图",
        resolutions: ["1K", "2K"],
        price: 0.2,
        unit: "元/张",
      },
    ],
    note: "官网文生图/图生图同价 · 1K/2K · 无 4K",
  },
};
