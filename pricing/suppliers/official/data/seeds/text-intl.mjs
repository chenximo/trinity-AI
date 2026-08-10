/**
 * 生文 · 厂商官网国际站价（V2 锚）
 *
 * 与 seeds/text.mjs（国内/既有 L0）平行；不改写国内 seed。
 * 金额只许来自所引国际站价目明文；缺档勿推算。
 * 键 = Trinity modelId（与线上 /v1/prices、trinity-map 对齐）。
 *
 * @typedef {{
 *   currency?: "USD",
 *   tiers?: Array<{ tierLabel: string, input?: number|null, output?: number|null, cache?: number|null }>,
 *   input?: number|null,
 *   output?: number|null,
 *   cache?: number|null,
 *   note?: string,
 *   sourceUrl: string,
 *   verifiedAt: string,
 * }} TextIntlSeedEntry
 */

export const TEXT_INTL_SEED_VERIFIED_AT = "2026-08-07";

/** @type {Record<string, TextIntlSeedEntry>} */
export const TEXT_INTL_SEED = {
  // ── DeepSeek 官方全球 USD（中英同卡）──────────────────────────
  "deepseek-v4-flash": {
    currency: "USD",
    input: 0.14,
    output: 0.28,
    cache: 0.0028,
    sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing",
    verifiedAt: "2026-08-07",
    note: "DeepSeek EN · cache miss=input · cache hit=cache · /1M tok",
  },
  "deepseek-v4-pro": {
    currency: "USD",
    input: 0.435,
    output: 0.87,
    cache: 0.003625,
    sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing",
    verifiedAt: "2026-08-07",
    note: "DeepSeek EN · cache miss=input · cache hit=cache · /1M tok",
  },

  // ── Z.AI 国际站 USD（单档；国内多档缺国际档时该档回退 V1）────
  "glm-5": {
    currency: "USD",
    input: 1,
    output: 3.2,
    cache: 0.2,
    sourceUrl: "https://docs.z.ai/guides/overview/pricing",
    verifiedAt: "2026-08-07",
    note: "Z.AI Pricing · Text · GLM-5",
  },
  "glm-5.1": {
    currency: "USD",
    input: 1.4,
    output: 4.4,
    cache: 0.26,
    sourceUrl: "https://docs.z.ai/guides/overview/pricing",
    verifiedAt: "2026-08-07",
    note: "Z.AI Pricing · Text · GLM-5.1",
  },
  "glm-5.2": {
    currency: "USD",
    input: 1.4,
    output: 4.4,
    cache: 0.26,
    sourceUrl: "https://docs.z.ai/guides/overview/pricing",
    verifiedAt: "2026-08-07",
    note: "Z.AI Pricing · Text · GLM-5.2",
  },
  "glm-5-turbo": {
    currency: "USD",
    input: 1.2,
    output: 4.0,
    cache: 0.24,
    sourceUrl: "https://docs.z.ai/guides/overview/pricing",
    verifiedAt: "2026-08-07",
    note: "Z.AI Pricing · Text · GLM-5-Turbo",
  },
  "glm-5v-turbo": {
    currency: "USD",
    input: 1.2,
    output: 4,
    cache: 0.24,
    sourceUrl: "https://docs.z.ai/guides/overview/pricing",
    verifiedAt: "2026-08-07",
    note: "Z.AI Pricing · Vision · GLM-5V-Turbo",
  },

  // ── Kimi 国际站 platform.kimi.ai ─────────────────────────────
  "kimi-k2.5": {
    currency: "USD",
    input: 0.6,
    output: 3.0,
    cache: 0.1,
    sourceUrl: "https://platform.kimi.ai/docs/pricing/chat-k25",
    verifiedAt: "2026-08-07",
    note: "Kimi.ai · cache miss=input · cache hit=cache · /1M tok",
  },
  "kimi-k2.6": {
    currency: "USD",
    input: 0.95,
    output: 4.0,
    cache: 0.16,
    sourceUrl: "https://platform.kimi.ai/docs/pricing/chat-k26",
    verifiedAt: "2026-08-07",
    note: "Kimi.ai · cache miss=input · cache hit=cache · /1M tok",
  },
  "kimi-k2.7-code": {
    currency: "USD",
    input: 0.95,
    output: 4.0,
    cache: 0.19,
    sourceUrl: "https://platform.kimi.ai/docs/pricing/chat-k27-code",
    verifiedAt: "2026-08-07",
    note: "Kimi.ai · cache miss=input · cache hit=cache · /1M tok",
  },
  "kimi-k2.7-code-highspeed": {
    currency: "USD",
    input: 1.9,
    output: 8.0,
    cache: 0.38,
    sourceUrl: "https://platform.kimi.ai/docs/pricing/chat-k27-code",
    verifiedAt: "2026-08-07",
    note: "Kimi.ai · cache miss=input · cache hit=cache · /1M tok",
  },
  "kimi-k3": {
    currency: "USD",
    input: 3.0,
    output: 15.0,
    cache: 0.3,
    sourceUrl: "https://platform.kimi.ai/docs/pricing/chat-k3",
    verifiedAt: "2026-08-07",
    note: "Kimi.ai · cache miss=input · cache hit=cache · /1M tok",
  },

  // ── MiniMax 国际站 platform.minimax.io（标准档，非 Priority）──
  "minimax-m2.5": {
    currency: "USD",
    input: 0.3,
    output: 1.2,
    cache: 0.03,
    sourceUrl: "https://platform.minimax.io/docs/guides/pricing-paygo",
    verifiedAt: "2026-08-07",
    note: "MiniMax.io PayGo · Prompt caching Read",
  },
  "minimax-m2.7": {
    currency: "USD",
    input: 0.3,
    output: 1.2,
    cache: 0.06,
    sourceUrl: "https://platform.minimax.io/docs/guides/pricing-paygo",
    verifiedAt: "2026-08-07",
    note: "MiniMax.io PayGo · Prompt caching Read",
  },
  "minimax-m3": {
    currency: "USD",
    tiers: [
      {
        tierLabel: "输入≤512k",
        input: 0.3,
        output: 1.2,
        cache: 0.06,
      },
      {
        tierLabel: "输入>512k",
        input: 0.6,
        output: 2.4,
        cache: 0.12,
      },
    ],
    sourceUrl: "https://platform.minimax.io/docs/guides/pricing-paygo",
    verifiedAt: "2026-08-07",
    note: "MiniMax.io · M3 Permanent 50% off 现价（划线价不作锚）",
  },

  // ── 通义 · Alibaba Cloud Model Studio Singapore · Deployment=International ──
  // 表内 Input/Output 为标准价（list）；限时折扣不入锚。缓存价见 Context Cache 专页，表内未列 → cache ⚠
  // Plus 系有 Non-Thinking / Thinking 两列出；刊例 output 取 Non-Thinking（与国内单出列对齐）
  "qwen3.7-max": {
    currency: "USD",
    input: 2.5,
    output: 7.5,
    cache: null,
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "Model Studio SG · International · list $2.5/$7.5（表注限时 50% off 不入锚）· cache ⚠",
  },
  "qwen3.7-plus": {
    currency: "USD",
    tiers: [
      { tierLabel: "输入≤256k", input: 0.4, output: 1.6, cache: null },
      { tierLabel: "256k<输入≤1M", input: 1.2, output: 4.8, cache: null },
    ],
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "International · Non-Thinking 出列；Thinking 同价 · cache ⚠",
  },
  "qwen3.6-plus": {
    currency: "USD",
    tiers: [
      { tierLabel: "输入≤256k", input: 0.5, output: 3, cache: null },
      { tierLabel: "256k<输入≤1M", input: 2, output: 6, cache: null },
    ],
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "International · Non-Thinking 出列 · cache ⚠",
  },
  "qwen3.6-flash": {
    currency: "USD",
    tiers: [
      { tierLabel: "输入≤256k", input: 0.25, output: 1.5, cache: null },
      { tierLabel: "256k<输入≤1M", input: 1, output: 4, cache: null },
    ],
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "International · cache ⚠",
  },
  "qwen3.5-plus": {
    currency: "USD",
    tiers: [
      { tierLabel: "输入≤128k", input: 0.4, output: 2.4, cache: null },
      { tierLabel: "128k<输入≤256k", input: 0.4, output: 2.4, cache: null },
      { tierLabel: "256k<输入≤1M", input: 0.5, output: 3, cache: null },
    ],
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "International · 国际站为 ≤256k/≤1M 两档；≤128k 与 128–256k 同用 ≤256k 明文价 · cache ⚠",
  },
  "qwen3.5-flash": {
    currency: "USD",
    input: 0.1,
    output: 0.4,
    cache: null,
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "International · 0<Token≤1M 单档 · cache ⚠",
  },
  "qwen-plus": {
    currency: "USD",
    tiers: [
      { tierLabel: "输入≤128k", input: 0.4, output: 1.2, cache: null },
      { tierLabel: "128k<输入≤256k", input: 0.4, output: 1.2, cache: null },
      { tierLabel: "256k<输入≤1M", input: 1.2, output: 3.6, cache: null },
    ],
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "International · output=Non-Thinking；≤128k/128–256k 同用国际 ≤256k 明文价 · cache ⚠",
  },
  "qwen-flash": {
    currency: "USD",
    tiers: [
      { tierLabel: "输入≤128k", input: 0.05, output: 0.4, cache: null },
      { tierLabel: "128k<输入≤256k", input: 0.05, output: 0.4, cache: null },
      { tierLabel: "256k<输入≤1M", input: 0.25, output: 2, cache: null },
    ],
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
    verifiedAt: "2026-08-07",
    note: "International · ≤128k/128–256k 同用国际 ≤256k 明文价 · cache ⚠",
  },
  // qwen-max / qwen-turbo：International 表仅见 batch 价，无实时刊例明文 → 不入 V2（回退 V1）

  // ── 混元 · TokenHub 国际（产品破例 V2 锚）Singapore 区 ──────────
  "hy3-preview": {
    currency: "USD",
    input: 0.132,
    output: 0.528,
    cache: 0.033,
    sourceUrl: "https://intl.cloud.tencent.com/document/product/1300/78937",
    verifiedAt: "2026-08-07",
    note: "TokenHub intl · Singapore · Hy3 · 国内多档 → 国际单档对齐",
  },
  "hy-mt2-plus": {
    currency: "USD",
    input: 0.1,
    output: 0.4,
    cache: null,
    sourceUrl: "https://intl.cloud.tencent.com/document/product/1300/78937",
    verifiedAt: "2026-08-07",
    note: "TokenHub intl · Singapore · Hy-MT2-Plus · cache 表内 -",
  },
  // hy-mt2-lite / hy-mt2-pro / hy-role / hunyuan-role-latest / hy-vision：intl 表无行 → V2=V1
};

