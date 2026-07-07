/**
 * 生视频官网核实价目（种子）
 * 来源：各厂商官网定价页
 *
 * **可灵**：官网按秒 · 积分/秒 = 元/秒（1积分=¥1）→ 与 AIGC 元/秒 直接对照
 * **混元/Vidu 等**：官网按次扣积分/次 → 对照表用参考秒数折算元/秒(估)
 */

/**
 * @typedef {{ tierLabel: string, price: number | string, unit: string, note?: string }} TierSeed
 * @typedef {{ tiers: TierSeed[], note?: string }} MediaSeedEntry
 */

const KLING_VIDEO_SOURCE_URL =
  "https://kling.ai/document-api/pricing/base/video";
const KLING_AIGC_FILL_NOTE = "官网未列 · AIGC对齐";

const KLING_RES_ORDER = ["720P/768P", "1080P", "2K", "4K"];

/**
 * 可灵生视频种子：官网快照价 + 未列分辨率用 AIGC 国内补齐
 * @param {Record<string, number>} officialByRes
 * @param {Record<string, number>} [aigcFillByRes]
 * @param {string} modelNote
 * @param {string} [featureNote]
 */
function klingVideoSeed(officialByRes, aigcFillByRes = {}, modelNote, featureNote = "官网快照") {
  const merged = { ...aigcFillByRes, ...officialByRes };
  const tiers = KLING_RES_ORDER.filter((k) => merged[k] != null).map((tierLabel) => ({
    tierLabel,
    price: merged[tierLabel],
    unit: "积分/秒",
    note: officialByRes[tierLabel] != null ? featureNote : KLING_AIGC_FILL_NOTE,
  }));
  return { tiers, note: modelNote, sourceUrl: KLING_VIDEO_SOURCE_URL };
}

/** @type {Record<string, MediaSeedEntry>} */
export const VIDEO_SEED = {
  "hy-video-1.5": {
    tiers: [
      { tierLabel: "720p", price: 1.5, unit: "积分/次" },
      { tierLabel: "1080p", price: 3, unit: "积分/次" },
    ],
    note: "腾讯云混元视频 1.5 · 按次扣积分",
  },
  "kl-video-v3": klingVideoSeed(
    { "720P/768P": 0.8, "1080P": 1.0 },
    { "2K": 1.2, "4K": 1.44 },
    "可灵 3.0 Turbo · pricing/base/video 快照",
    "With Native Audio · 1 Unit=¥1/秒",
  ),
  "kl-video-v2-6": klingVideoSeed(
    { "720P/768P": 0.3, "1080P": 0.5 },
    { "2K": 0.75, "4K": 1.12 },
    "可灵 2.6 · pricing/base/video 快照",
    "No Native Audio · 1 Unit=¥1/秒",
  ),
  "kl-video-v2-5-turbo": klingVideoSeed(
    { "720P/768P": 0.3, "1080P": 0.5 },
    { "2K": 0.75, "4K": 1.12 },
    "可灵 2.5 Turbo · pricing/base/video 快照",
    "No Native Audio · 1 Unit=¥1/秒",
  ),
  "kl-video-v2-1": klingVideoSeed(
    { "720P/768P": 0.4, "1080P": 0.7 },
    { "2K": 1, "4K": 1.5 },
    "可灵 2.1 · pricing/base/video 快照",
    "No Native Audio · 1 Unit=¥1/秒",
  ),
  "kl-video-v1": klingVideoSeed(
    { "720P/768P": 0.4, "1080P": 0.7 },
    { "2K": 1, "4K": 1.5 },
    "可灵 1.6/2.0/2.1 · 种子按 1.6 无声档",
    "No Native Audio · 1 Unit=¥1/秒",
  ),
  "vd-video-q3-pro": {
    tiers: [
      { tierLabel: "540P", price: "1-16", unit: "积分/次" },
      { tierLabel: "720P", price: "1.5-24", unit: "积分/次" },
      { tierLabel: "1080P", price: "2-32", unit: "积分/次" },
    ],
  },
  "vd-video-q3-turbo": {
    tiers: [
      { tierLabel: "540P", price: "0.7-11.2", unit: "积分/次" },
      { tierLabel: "720P", price: "1.2-19.2", unit: "积分/次" },
      { tierLabel: "1080P", price: "1.3-20.8", unit: "积分/次" },
    ],
  },
  "vd-video-q2": {
    tiers: [
      { tierLabel: "540P", price: "0.5-8", unit: "积分/次" },
      { tierLabel: "720P", price: "0.8-12.8", unit: "积分/次" },
      { tierLabel: "1080P", price: "1-16", unit: "积分/次" },
    ],
  },
  "vd-video-q2-turbo": {
    tiers: [
      { tierLabel: "540P", price: "0.3-4.8", unit: "积分/次" },
      { tierLabel: "720P", price: "0.5-8", unit: "积分/次" },
      { tierLabel: "1080P", price: "0.6-9.6", unit: "积分/次" },
    ],
  },
  "vd-video-q3": {
    tiers: [
      { tierLabel: "540P", price: 0.21875, unit: "元/秒", note: "7×0.03125" },
      { tierLabel: "720P", price: 0.375, unit: "元/秒", note: "12×0.03125" },
      { tierLabel: "1080P", price: 0.46875, unit: "元/秒", note: "15×0.03125" },
    ],
    note: "Vidu Q3 参考生 · platform.vidu.cn 积分/s→元/s",
    sourceUrl: "https://platform.vidu.cn/docs/pricing",
  },
  "vd-video-q2-pro": {
    tiers: [
      {
        tierLabel: "540P",
        price: 0.15625,
        unit: "元/秒",
        note: "Q2-Pro 参考·稳态+5积分/s",
      },
      {
        tierLabel: "720P",
        price: 0.15625,
        unit: "元/秒",
        note: "Q2-Pro 参考·稳态+5积分/s",
      },
      {
        tierLabel: "1080P",
        price: 0.3125,
        unit: "元/秒",
        note: "Q2-Pro 参考·稳态+10积分/s",
      },
    ],
    note: "Vidu Q2-Pro 参考生阶梯价；首秒更高，列为稳态",
    sourceUrl: "https://platform.vidu.cn/docs/pricing",
  },
  "yt-video-2.0": {
    tiers: [{ tierLabel: "统一价", price: "2-10", unit: "积分/次" }],
    note: "优图视频 2.0",
  },
  "yt-video-humanactor": {
    tiers: [{ tierLabel: "统一价", price: "3-15", unit: "积分/次" }],
  },
  "yt-video-fx": {
    tiers: [{ tierLabel: "统一价", price: "1.5-8", unit: "积分/次" }],
  },
  "doubao-seedance-2.0": {
    tiers: [
      {
        tierLabel: "480p/720p·不含视频输入",
        price: 46,
        unit: "元/百万tokens",
        note: "火山在线推理 · 官方刊例",
      },
      {
        tierLabel: "480p/720p·含视频输入",
        price: 28,
        unit: "元/百万tokens",
      },
      {
        tierLabel: "1080p·不含视频输入",
        price: 51,
        unit: "元/百万tokens",
      },
      {
        tierLabel: "1080p·含视频输入",
        price: 31,
        unit: "元/百万tokens",
      },
      {
        tierLabel: "4k·不含视频输入",
        price: 26,
        unit: "元/百万tokens",
      },
      {
        tierLabel: "4k·含视频输入",
        price: 16,
        unit: "元/百万tokens",
      },
    ],
    note: "Seedance 2.0 · 火山按 token 计费；按个表为 16:9·5s 场景示例",
  },
  "doubao-seedance-2.0-fast": {
    tiers: [
      {
        tierLabel: "不含视频输入",
        price: 37,
        unit: "元/百万tokens",
        note: "不支持 1080p 输出",
      },
      { tierLabel: "含视频输入", price: 22, unit: "元/百万tokens" },
    ],
    note: "Seedance 2.0 Fast · token 刊例",
  },
  "doubao-seedance-2.0-mini": {
    tiers: [
      {
        tierLabel: "不含视频输入",
        price: 23,
        unit: "元/百万tokens",
        note: "不支持 1080p 输出",
      },
      { tierLabel: "含视频输入", price: 14, unit: "元/百万tokens" },
    ],
    note: "Seedance 2.0 Mini · token 刊例",
  },
  "doubao-seedance-1.5-pro": {
    tiers: [
      {
        tierLabel: "有声视频",
        price: 16,
        unit: "元/百万tokens",
        note: "火山在线推理 · 官方刊例",
      },
      { tierLabel: "无声视频", price: 8, unit: "元/百万tokens" },
    ],
    note: "Seedance 1.5 Pro · token 刊例；按个表为 480p·16:9·5s 示例",
  },
  "doubao-seedance-1.0-pro": {
    tiers: [
      {
        tierLabel: "在线推理",
        price: 15,
        unit: "元/百万tokens",
        note: "火山官方刊例",
      },
    ],
    note: "Seedance 1.0 Pro · token 刊例 · 官方/线上同轴",
    sourceUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
  },
  "doubao-seedance-1.0-pro-fast": {
    tiers: [
      {
        tierLabel: "在线推理",
        price: 4.2,
        unit: "元/百万tokens",
        note: "火山官方刊例",
      },
    ],
    note: "Seedance 1.0 Pro Fast · token 刊例",
    sourceUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
  },
  // ── Google Veo 3.1 · ai.google.dev/gemini-api/docs/pricing#veo-3.1 ──
  "veo-3.1-generate-preview": {
    currency: "USD",
    tiers: [
      { tierLabel: "720P/768P", price: 0.4, unit: "美元/秒", note: "含音频" },
      { tierLabel: "1080P", price: 0.4, unit: "美元/秒", note: "含音频" },
      { tierLabel: "4K", price: 0.6, unit: "美元/秒", note: "含音频" },
    ],
    note: "Veo 3.1 Standard · Gemini API",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn#veo-3.1",
  },
  "veo-3.1-fast-generate-preview": {
    currency: "USD",
    tiers: [
      { tierLabel: "720P/768P", price: 0.1, unit: "美元/秒", note: "含音频" },
      { tierLabel: "1080P", price: 0.12, unit: "美元/秒", note: "含音频" },
      { tierLabel: "4K", price: 0.3, unit: "美元/秒", note: "含音频" },
    ],
    note: "Veo 3.1 Fast · Gemini API",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn#veo-3.1",
  },
  "veo-3.1-lite-generate-preview": {
    currency: "USD",
    tiers: [
      { tierLabel: "720P/768P", price: 0.05, unit: "美元/秒", note: "含音频" },
      { tierLabel: "1080P", price: 0.08, unit: "美元/秒", note: "含音频" },
    ],
    note: "Veo 3.1 Lite · 4K 不支持",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn#veo-3.1",
  },
  // ── MiniMax Hailuo · 按条 PayGo 折算美元/秒（参考 6s 成片）──
  "hailuo-2.3": {
    currency: "USD",
    tiers: [
      {
        tierLabel: "768P",
        price: 0.0466667,
        unit: "美元/秒",
        note: "官网 $0.28/6s·768P",
      },
      {
        tierLabel: "1080P",
        price: 0.0816667,
        unit: "美元/秒",
        note: "官网 $0.49/6s·1080P",
      },
    ],
    note: "MiniMax-Hailuo-2.3 · PayGo 按条→秒(6s)",
    sourceUrl: "https://platform.minimax.io/docs/guides/pricing-paygo",
  },
  "hailuo-2.3-fast": {
    currency: "USD",
    tiers: [
      {
        tierLabel: "768P",
        price: 0.0316667,
        unit: "美元/秒",
        note: "官网 $0.19/6s·768P",
      },
      {
        tierLabel: "1080P",
        price: 0.055,
        unit: "美元/秒",
        note: "官网 $0.33/6s·1080P",
      },
    ],
    note: "MiniMax-Hailuo-2.3-Fast · PayGo 按条→秒(6s)",
    sourceUrl: "https://platform.minimax.io/docs/guides/pricing-paygo",
  },
  // ── OpenAI Sora 2 ─────────────────────────────────────────────
  "sora-2": {
    currency: "USD",
    tiers: [
      {
        tierLabel: "720P",
        price: 0.1,
        unit: "美元/秒",
        note: "1280×720 / 720×1280",
      },
    ],
    note: "Sora 2 Standard · Videos API（2026-09-24 计划下线）",
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
  },
  // ── PixVerse · credits/s → USD（$100=10000 credits）──────────
  "pixverse-v6": {
    currency: "USD",
    tiers: [
      { tierLabel: "360P", price: 0.05, unit: "美元/秒", note: "5 credits/s·无声" },
      { tierLabel: "540P", price: 0.07, unit: "美元/秒", note: "7 credits/s·无声" },
      { tierLabel: "720P", price: 0.09, unit: "美元/秒", note: "9 credits/s·无声" },
      { tierLabel: "1080P", price: 0.18, unit: "美元/秒", note: "18 credits/s·无声" },
    ],
    note: "PixVerse V6 · platform docs credits/s × $0.01",
    sourceUrl: "https://docs.platform.pixverse.ai/model-pricing-796039m0",
  },
  "pixverse-v5.6": {
    currency: "USD",
    tiers: [
      {
        tierLabel: "720P",
        price: 0.09,
        unit: "美元/秒",
        note: "45 credits/5s 单片段·无声",
      },
      {
        tierLabel: "1080P",
        price: 0.15,
        unit: "美元/秒",
        note: "75 credits/5s 单片段·无声",
      },
    ],
    note: "PixVerse V5.6 按条计价→折算 credits/s",
    sourceUrl: "https://docs.platform.pixverse.ai/model-pricing-796039m0",
  },
  "pixverse-c1": {
    currency: "USD",
    tiers: [
      { tierLabel: "768P", price: 0.1, unit: "美元/秒", note: "720p档 10 credits/s·无声" },
      { tierLabel: "1080P", price: 0.19, unit: "美元/秒", note: "19 credits/s·无声" },
    ],
    note: "PixVerse C1 · credits/s × $0.01",
    sourceUrl: "https://docs.platform.pixverse.ai/model-pricing-796039m0",
  },
  // ── 即梦 3.0 Pro（火山计费页 · 分档待人工核验）──────────────
  "jimeng-jv-3.0-pro": {
    tiers: [
      {
        tierLabel: "1080P",
        price: 1,
        unit: "元/秒",
        note: "即梦3.0 Pro · 1080P 档",
      },
    ],
    note: "⚠需人工核验 · volcengine/85621/1544715 分辨率分档",
    sourceUrl: "https://www.volcengine.com/docs/85621/1544715?lang=zh",
  },
  "kl-video-v3-omni": klingVideoSeed(
    { "720P/768P": 0.6, "1080P": 0.8, "4K": 3.0 },
    { "2K": 1.0 },
    "可灵 3.0 Omni · pricing/base/video 快照",
    "With Video Input · 对照 AIGC 无参考视频+无声",
  ),
  "kl-video-o1": klingVideoSeed(
    { "720P/768P": 0.6, "1080P": 0.8 },
    { "2K": 1.2, "4K": 1.8 },
    "可灵 O1 · pricing/base/video 快照",
    "No Video Input · 对照 AIGC 无参考视频",
  ),
  // ── 混元 H2 新型号 · TokenHub 未列 SKU ───────────────────────
  "hy-video-h2new": {
    aigcOnly: true,
    tiers: [],
    note: "⚠需人工核验 · h2new-1 未上 TokenHub 130055 价目表",
    sourceUrl: "https://cloud.tencent.com/document/product/1823/130055",
  },
};

export const VIDEO_SEED_VERIFIED_AT = "2026-07-07";
