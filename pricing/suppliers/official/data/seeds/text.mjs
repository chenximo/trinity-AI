/**
 * 生文官网核实价目（种子）
 * live fetch 失败时 fallback
 *
 * **上线真源**：写入后由 fetch 展开为 vendor-pricing.json 的 models[].tiers[]
 * - 单档：沿用 input / output / cache（自动变为 1 档「标准价」）
 * - 多档：使用 tiers[]（国内长上下文、Hy3 多模式等必须用此格式）
 *
 * @example 多档（CNY 国内示例）
 * "deepseek-chat": {
 *   currency: "CNY",
 *   tiers: [
 *     { tierLabel: "输入≤4k", input: 2, output: 8, cache: 0.4 },
 *     { tierLabel: "输入>4k", input: 4, output: 16 },
 *   ],
 * },
 */

export const TEXT_SEED_VERIFIED_AT = "2026-06-28";

/**
 * @typedef {{
 *   currency?: "USD" | "CNY",
 *   tiers?: Array<{ tierLabel: string, input?: number|null, output?: number|null, cache?: number|null }>,
 *   input?: number|null,
 *   output?: number|null,
 *   cache?: number|null,
 *   note?: string,
 * }} TextSeedEntry
 */

/** @type {Record<string, TextSeedEntry>} */
export const TEXT_SEED = {
  "chat-latest": {
    tiers: [
      { tierLabel: "输入<=272K context", input: 5, cache: 0.5, output: 30 },
      { tierLabel: "输入>272K context", input: 10, cache: 1, output: 45 },
    ],
    note: "alias → 最新 Instant，同 gpt-5.5 档",
  },
  "gpt-5.5": {
    tiers: [
      { tierLabel: "输入<=272K context", input: 5, cache: 0.5, output: 30 },
      { tierLabel: "输入>272K context", input: 10, cache: 1, output: 45 },
    ],
  },
  "gpt-5.4-pro": {
    tiers: [
      { tierLabel: "输入<=272K context", input: 30, output: 180 },
      { tierLabel: "输入>272K context", input: 60, output: 270 },
    ],
  },
  "gpt-5.4": {
    tiers: [
      { tierLabel: "输入<=272K context", input: 2.5, cache: 0.25, output: 15 },
      { tierLabel: "输入>272K context", input: 5, cache: 0.5, output: 22.5 },
    ],
  },
  "gpt-5.4-nano": { input: 0.2, cache: 0.02, output: 1.25 },
  "gpt-5.4-mini": { input: 0.75, cache: 0.075, output: 4.5 },
  "gpt-5.3-codex": { input: 1.75, cache: 0.175, output: 14 },
  "gpt-5.3-chat-latest": { input: 1.25, cache: 0.125, output: 10 },
  "gpt-5.2-chat-latest": { input: 1.75, cache: 0.175, output: 14, note: "Instant 档" },
  "gpt-5.2": { input: 1.75, cache: 0.175, output: 14 },
  "gpt-5.1": { input: 1.25, cache: 0.125, output: 10 },
  "gpt-5.1-chat-latest": { input: 1.25, cache: 0.125, output: 10 },
  "gpt-5": { input: 1.25, cache: 0.125, output: 10 },
  "gpt-5-mini": { input: 0.25, cache: 0.025, output: 2 },
  "gpt-5-chat-latest": { input: 1.25, cache: 0.125, output: 10 },
  "gpt-5-nano": { input: 0.05, cache: 0.005, output: 0.4 },
  "gpt-4.1": { input: 2, cache: 0.5, output: 8 },
  "gpt-4o": { input: 2.5, cache: 1.25, output: 10 },

  "gemini-3.5-flash": {
    tiers: [
      { tierLabel: "输入:文本/图片/视频", input: 1.5, cache: 0.15, output: 9 },
      { tierLabel: "输入:音频", input: 1.5, cache: 0.15, output: 9 },
    ],
    note: "Gemini API pricing · Gemini 3.5 Flash Standard",
  },
  "gemini-3.1-flash-lite": {
    tiers: [
      { tierLabel: "输入:文本/图片/视频", input: 0.25, cache: 0.025, output: 1.5 },
      { tierLabel: "输入:音频", input: 0.5, cache: 0.05, output: 1.5 },
    ],
  },
  "gemini-3.1-pro-preview": {
    tiers: [
      { tierLabel: "输入<=20万个token", input: 2, cache: 0.2, output: 12 },
      { tierLabel: "输入>20万个token", input: 4, cache: 0.4, output: 18 },
    ],
  },
  "gemini-3.1-flash-lite-preview": {
    tiers: [
      { tierLabel: "输入:文本/图片/视频", input: 0.25, cache: 0.025, output: 1.5 },
      { tierLabel: "输入:音频", input: 0.5, cache: 0.05, output: 1.5 },
    ],
    note: "同 gemini-3.1-flash-lite",
  },
  "gemini-3-pro-preview": { input: 2, cache: 0.2, output: 12 },
  "gemini-3-flash-preview": {
    tiers: [
      { tierLabel: "输入:文本/图片/视频", input: 0.5, cache: 0.05, output: 3 },
      { tierLabel: "输入:音频", input: 1, cache: 0.1, output: 3 },
    ],
  },
  "gemini-2.5-pro": {
    tiers: [
      { tierLabel: "输入<=20万个token", input: 1.25, cache: 0.125, output: 10 },
      { tierLabel: "输入>20万个token", input: 2.5, cache: 0.25, output: 15 },
    ],
  },
  "gemini-2.5-flash": {
    tiers: [
      { tierLabel: "输入:文本/图片/视频", input: 0.3, cache: 0.03, output: 2.5 },
      { tierLabel: "输入:音频", input: 1, cache: 0.1, output: 2.5 },
    ],
  },

  "grok-4-1-fast-reasoning": { input: 1.25, cache: 0.2, output: 2.5, note: "已退役→grok-4.3" },
  "grok-4-1-fast-non-reasoning": { input: 1.25, cache: 0.2, output: 2.5, note: "已退役→grok-4.3" },
  "grok-4.20-0309-non-reasoning": { input: 1.25, cache: 0.2, output: 2.5 },
  "grok-4.20-0309-reasoning": { input: 1.25, cache: 0.2, output: 2.5 },
  "grok-4.3": { input: 1.25, cache: 0.2, output: 2.5 },

  "claude-opus-4-8": { input: 5, output: 25, cache: 0.5, note: "Claude Platform · Opus 4.8" },
  "claude-opus-4-7": { input: 5, output: 25, cache: 0.5, note: "Claude Platform 定价 · Opus 4.7" },
  "claude-opus-4-6": { input: 5, output: 25, cache: 0.5, note: "Claude Platform 定价 · Opus 4.6" },
  "claude-sonnet-4-6": { input: 3, output: 15, cache: 0.3, note: "Claude Platform 定价 · Sonnet 4.6" },

  "gemini-2.5-flash-lite": { input: 0.1, cache: 0.01, output: 0.4 },
  "gemini-2.5-flash-lite-preview": {
    input: 0.1,
    cache: 0.01,
    output: 0.4,
    note: "同 gemini-2.5-flash-lite",
  },

  // ── 国内生文（CNY/百万 tokens · 来源见各 catalog docUrl）────────
  "hy3-preview": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入<16k", input: 1.2, output: 4, cache: 0.4 },
      { tierLabel: "16k≤输入<32k", input: 1.6, output: 6.4, cache: 0.6 },
      { tierLabel: "输入≥32k", input: 2, output: 8, cache: 0.8 },
    ],
    note: "腾讯云 TokenHub 模型价格 · Hy3 preview",
  },
  "hy-mt2-lite": {
    currency: "CNY",
    input: 0.3,
    output: 1.2,
    note: "腾讯云模型价格 · Hy-MT2-Lite",
  },
  "hy-mt2-plus": {
    currency: "CNY",
    input: 0.5,
    output: 2,
    note: "腾讯云模型价格 · Hy-MT2-Plus",
  },
  "hy-mt2-pro": {
    currency: "CNY",
    input: 0.5,
    output: 2,
    note: "腾讯云模型价格 · Hy-MT2-Pro",
  },
  "hy-role": {
    currency: "CNY",
    input: 2.4,
    output: 9.6,
    note: "腾讯云模型价格 · Hy-Role",
  },
  "hunyuan-role-latest": {
    currency: "CNY",
    input: 2.4,
    output: 9.6,
    note: "腾讯云模型价格 · Hy-Role-Latest",
  },
  "hy-vision-2.0-instruct": {
    currency: "CNY",
    input: 7.5,
    output: 17.5,
    note: "腾讯云模型价格 · HY-Vision-2.0-Instruct",
  },
  "deepseek-v3.2": {
    currency: "CNY",
    input: 2,
    output: 3,
    cache: 0.4,
    note: "百炼模型定价 · 中国内地",
  },
  "deepseek-v4-flash": {
    currency: "CNY",
    input: 1,
    output: 2,
    cache: 0.02,
    note: "DeepSeek API 文档 · deepseek-v4-flash",
  },
  "deepseek-v4-pro": {
    currency: "CNY",
    input: 3,
    output: 6,
    cache: 0.025,
    note: "DeepSeek API 文档 · deepseek-v4-pro",
  },
  "qwen-flash": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤128k", input: 0.15, output: 1.5, cache: 0.03 },
      { tierLabel: "128k<输入≤256k", input: 0.6, output: 6, cache: 0.12 },
      { tierLabel: "256k<输入≤1M", input: 1.2, output: 12, cache: 0.24 },
    ],
    note: "百炼模型定价 · 中国内地",
  },
  "qwen-max": {
    currency: "CNY",
    input: 2.4,
    output: 9.6,
    note: "百炼模型定价 · 中国内地",
  },
  "qwen-plus": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤128k", input: 0.8, output: 2, cache: 0.16 },
      { tierLabel: "128k<输入≤256k", input: 2.4, output: 20, cache: 0.48 },
      { tierLabel: "256k<输入≤1M", input: 4.8, output: 48, cache: 0.96 },
    ],
    note: "百炼模型定价 · 中国内地",
  },
  "qwen-turbo": {
    currency: "CNY",
    input: 0.3,
    output: 0.6,
    note: "百炼模型定价 · 中国内地",
  },
  "qwen3.6-flash": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤256k", input: 1.2, output: 7.2, cache: 0.24 },
      { tierLabel: "256k<输入≤1M", input: 4.8, output: 28.8, cache: 0.96 },
    ],
    note: "百炼模型定价 · 中国内地",
  },
  "qwen3.6-plus": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤256k", input: 2, output: 12, cache: 0.4 },
      { tierLabel: "256k<输入≤1M", input: 8, output: 48, cache: 1.6 },
    ],
    note: "百炼模型定价 · 中国内地",
  },
  "qwen3.7-max": {
    currency: "CNY",
    input: 12,
    output: 36,
    cache: 2.4,
    note: "百炼模型定价 · 中国内地",
  },
  "qwen3.7-plus": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤256k", input: 2, output: 8, cache: 0.4 },
      { tierLabel: "256k<输入≤1M", input: 6, output: 24, cache: 1.2 },
    ],
    note: "百炼模型定价 · 中国内地",
  },
  "qwen3.5-plus": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤128k", input: 0.8, output: 4.8, cache: 0.08 },
      { tierLabel: "128k<输入≤256k", input: 2, output: 12, cache: 0.2 },
      { tierLabel: "256k<输入≤1M", input: 4, output: 24, cache: 0.4 },
    ],
    note: "百炼模型定价 · 中国内地",
  },
  "qwen3.5-flash": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤128k", input: 0.2, output: 2, cache: 0.02 },
      { tierLabel: "128k<输入≤256k", input: 0.8, output: 8, cache: 0.08 },
      { tierLabel: "256k<输入≤1M", input: 1.2, output: 12, cache: 0.12 },
    ],
    note: "百炼模型定价 · 中国内地",
  },
  "glm-5": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入<32k", input: 4, output: 18, cache: 1 },
      { tierLabel: "输入≥32k", input: 6, output: 22, cache: 1.5 },
    ],
    note: "智谱开放平台定价 · GLM-5",
  },
  "glm-4.7": {
    currency: "CNY",
    tiers: [
      {
        tierLabel: "输入≤32k，输出≤0.2k",
        input: 2,
        output: 8,
        cache: 0.4,
      },
      {
        tierLabel: "输入≤32k，输出>0.2k",
        input: 3,
        output: 14,
        cache: 0.6,
      },
      { tierLabel: "输入>32k", input: 4, output: 16, cache: 0.8 },
    ],
    note: "智谱开放平台定价 · GLM-4.7（输入长度 + ≤32k 内输出长度三档，与 AIGC 商务一致）",
  },
  "kimi-k2.5": {
    currency: "CNY",
    input: 4,
    output: 21,
    cache: 0.7,
    note: "月之暗面 Kimi 开放平台 · K2.5",
  },
  "glm-5.1": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入<32k", input: 6, output: 24, cache: 1.3 },
      { tierLabel: "输入≥32k", input: 8, output: 28, cache: 2 },
    ],
    note: "智谱开放平台定价 · GLM-5.1",
  },
  "glm-5.2": {
    currency: "CNY",
    input: 8,
    output: 28,
    cache: 2,
    note: "智谱开放平台定价 · GLM-5.2",
  },
  "glm-5-turbo": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入<32k", input: 5, output: 22, cache: 1.2 },
      { tierLabel: "输入≥32k", input: 7, output: 26, cache: 1.8 },
    ],
    note: "智谱开放平台定价 · GLM-5-Turbo",
  },
  "glm-5v-turbo": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入<32k", input: 5, output: 22, cache: 1.2 },
      { tierLabel: "输入≥32k", input: 7, output: 26, cache: 1.8 },
    ],
    note: "智谱开放平台定价 · GLM-5V-Turbo",
  },
  "kimi-k2.6": {
    currency: "CNY",
    input: 6.5,
    output: 27,
    cache: 1.1,
    note: "百炼模型定价 · Kimi K2.6",
  },
  "kimi-k2.7-code": {
    currency: "CNY",
    input: 6.5,
    output: 27,
    cache: 1.3,
    note: "百炼模型定价 · Kimi K2.7 Code",
  },
  "kimi-k2.7-code-highspeed": {
    currency: "CNY",
    input: 13,
    output: 54,
    cache: 2.6,
    note: "百炼模型定价 · Kimi K2.7 Code HighSpeed",
  },
  "minimax-m2.5": {
    currency: "CNY",
    input: 2.1,
    output: 8.4,
    cache: 0.21,
    note: "MiniMax 按量计费 · M2.5 缓存读取",
  },
  "minimax-m2.7": {
    currency: "CNY",
    input: 2.1,
    output: 8.4,
    cache: 0.42,
    note: "MiniMax 按量计费 · M2.7 缓存读取",
  },
  "minimax-m3": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤512k", input: 2.1, output: 8.4, cache: 0.42 },
      { tierLabel: "输入>512k", input: 4.2, output: 16.8, cache: 0.84 },
    ],
    note: "MiniMax 按量计费 · M3",
  },

  // ── 火山方舟 · 豆包（按量付费）https://www.volcengine.com/docs/82379/1544106 ──
  "doubao-seed-2-1-pro": {
    currency: "CNY",
    input: 6,
    output: 30,
    cache: 1.2,
    note: "Doubao-Seed-2.1-Pro",
  },
  "doubao-seed-2-1-turbo": {
    currency: "CNY",
    input: 3,
    output: 15,
    cache: 0.6,
    note: "Doubao-Seed-2.1-Turbo",
  },
  "doubao-seed-2-0-pro": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤32k", input: 3.2, output: 16, cache: 0.64 },
      { tierLabel: "输入(32k,128k]", input: 4.8, output: 24, cache: 0.96 },
      { tierLabel: "输入(128k,256k]", input: 9.6, output: 48, cache: 1.92 },
    ],
    note: "Doubao-Seed-2.0-Pro · 在线推理（常规）",
  },
  "doubao-seed-2-0-lite": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤32k", input: 0.6, output: 3.6, cache: 0.12 },
      { tierLabel: "输入>32k", input: 1.2, output: 7.2, cache: 0.24 },
    ],
    note: "Doubao-Seed-2.0-Lite",
  },
  "doubao-seed-2-0-mini": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤32k", input: 0.2, output: 2, cache: 0.04 },
      { tierLabel: "输入>32k", input: 0.4, output: 4, cache: 0.08 },
    ],
    note: "Doubao-Seed-2.0-Mini",
  },
  "doubao-seed-1-8": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤32k", input: 0.8, output: 2, cache: 0.16 },
      { tierLabel: "输入>32k", input: 1.6, output: 4, cache: 0.32 },
    ],
    note: "Doubao-Seed-1.8",
  },
  "doubao-seed-1-6": {
    currency: "CNY",
    tiers: [
      { tierLabel: "输入≤32k", input: 0.8, output: 2, cache: 0.16 },
      { tierLabel: "输入>32k", input: 1.6, output: 4, cache: 0.32 },
    ],
    note: "Doubao-Seed-1.6",
  },
  "doubao-pro-32k": {
    currency: "CNY",
    input: 0.8,
    output: 2,
    cache: 0.16,
    note: "Doubao-Pro-32k",
  },
  "doubao-lite-32k": {
    currency: "CNY",
    input: 0.3,
    output: 0.6,
    cache: 0.06,
    note: "Doubao-Lite-32k",
  },
};
