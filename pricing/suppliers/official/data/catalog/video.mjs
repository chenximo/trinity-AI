/**
 * 生视频模型原厂目录（国内厂商官网文档）
 */

import { VENDOR_PRICING_URLS } from "../pricing-urls.mjs";

/**
 * @typedef {"tencent_hunyuan"|"kling"|"vidu"|"tencent_youtu"|"volcengine"} VideoVendorKey
 * @typedef {"active"|"deprecated"|"retired"} CatalogStatus
 *
 * @typedef {{
 *   vendor: VideoVendorKey,
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
export const VIDEO_CATALOG = [
  // ── 腾讯混元 ─────────────────────────────────────────────────
  {
    vendor: "tencent_hunyuan",
    vendorLabel: "混元",
    vendorModelId: "hy-video-1.5",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.video,
    trinityNote: "TokenHub hy-video-1.5",
    region: "domestic",
    status: "active",
  },
  // ── 可灵 Kling ───────────────────────────────────────────────
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kl-video-v3",
    docUrl: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
    pricingUrl: VENDOR_PRICING_URLS.kling.video,
    trinityNote: "TokenHub kl-video-v3",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kl-video-v2-6",
    docUrl: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
    pricingUrl: VENDOR_PRICING_URLS.kling.video,
    trinityNote: "TokenHub kl-video-v2-6",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kl-video-v2-5-turbo",
    docUrl: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
    pricingUrl: VENDOR_PRICING_URLS.kling.video,
    trinityNote: "TokenHub kl-video-v2-5-turbo",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kl-video-v2-1",
    docUrl: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
    pricingUrl: VENDOR_PRICING_URLS.kling.video,
    trinityNote: "TokenHub kl-video-v2-1",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "kling",
    vendorLabel: "可灵",
    vendorModelId: "kl-video-v1",
    docUrl: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
    pricingUrl: VENDOR_PRICING_URLS.kling.video,
    trinityNote: "TokenHub kl-video-v1",
    region: "domestic",
    status: "active",
  },
  // ── Vidu ─────────────────────────────────────────────────────
  {
    vendor: "vidu",
    vendorLabel: "Vidu",
    vendorModelId: "vd-video-q3-pro",
    docUrl: "https://platform.vidu.cn/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.vidu.video,
    trinityNote: "TokenHub vd-video-q3-pro",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "vidu",
    vendorLabel: "Vidu",
    vendorModelId: "vd-video-q3-turbo",
    docUrl: "https://platform.vidu.cn/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.vidu.video,
    trinityNote: "TokenHub vd-video-q3-turbo",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "vidu",
    vendorLabel: "Vidu",
    vendorModelId: "vd-video-q2",
    docUrl: "https://platform.vidu.cn/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.vidu.video,
    trinityNote: "TokenHub vd-video-q2",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "vidu",
    vendorLabel: "Vidu",
    vendorModelId: "vd-video-q2-turbo",
    docUrl: "https://platform.vidu.cn/docs/pricing",
    pricingUrl: VENDOR_PRICING_URLS.vidu.video,
    trinityNote: "TokenHub vd-video-q2-turbo",
    region: "domestic",
    status: "active",
  },
  // ── 优图 YT ──────────────────────────────────────────────────
  {
    vendor: "tencent_youtu",
    vendorLabel: "优图",
    vendorModelId: "yt-video-2.0",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.video,
    trinityNote: "TokenHub yt-video-2.0",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "tencent_youtu",
    vendorLabel: "优图",
    vendorModelId: "yt-video-humanactor",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.video,
    trinityNote: "TokenHub yt-video-humanactor",
    region: "domestic",
    status: "active",
  },
  {
    vendor: "tencent_youtu",
    vendorLabel: "优图",
    vendorModelId: "yt-video-fx",
    docUrl: "https://cloud.tencent.com/document/product/1729/105545",
    pricingUrl: VENDOR_PRICING_URLS.tencent_hunyuan.video,
    trinityNote: "TokenHub yt-video-fx",
    region: "domestic",
    status: "active",
  },
  // ── 火山方舟 · Seedance ───────────────────────────────────────
  {
    vendor: "volcengine",
    vendorLabel: "豆包",
    vendorModelId: "doubao-seedance-2.0",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.video,
    region: "domestic",
    status: "active",
  },
  {
    vendor: "volcengine",
    vendorLabel: "豆包",
    vendorModelId: "doubao-seedance-2.0-fast",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.video,
    region: "domestic",
    status: "active",
  },
  {
    vendor: "volcengine",
    vendorLabel: "豆包",
    vendorModelId: "doubao-seedance-2.0-mini",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.video,
    region: "domestic",
    status: "active",
  },
  {
    vendor: "volcengine",
    vendorLabel: "豆包",
    vendorModelId: "doubao-seedance-1.5-pro",
    docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    pricingUrl: VENDOR_PRICING_URLS.volcengine.video,
    region: "domestic",
    status: "active",
  },
];
