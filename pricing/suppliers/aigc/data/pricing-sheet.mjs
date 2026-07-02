/**
 * 腾讯云 AIGC 上游价目表（国内站 元/M token · 国际站 美元/M token）
 * 来源：内部价目表截图录入，2026-06
 */

/** @typedef {{ input?: string, cache?: string, output?: string, cacheWrite5m?: string, cacheWrite1h?: string, cacheHit?: string }} PriceBlock */

/**
 * @typedef {{
 *   vendorCode: string,
 *   vendorName: string,
 *   modelName: string,
 *   trinityId?: string,
 *   table?: string,
 *   tiers: { attribute: string, domestic?: PriceBlock | null, international?: PriceBlock | null }[]
 * }} SheetModel
 */

/** @type {SheetModel[]} */
export const PRICING_SHEET = [
  {
    vendorCode: "Hunyuan",
    vendorName: "混元",
    modelName: "3-preview",
    trinityId: "hy3-preview",
    tiers: [
      {
        attribute: "输入长度（0, 16k）",
        domestic: { input: "1.2", cache: "0.4", output: "4" },
      },
      {
        attribute: "输入长度 [16k, 32k）",
        domestic: { input: "1.6", cache: "0.6", output: "6.4" },
      },
      {
        attribute: "输入长度 [32k+）",
        domestic: { input: "2", cache: "0.8", output: "8" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "o1 (new)",
    tiers: [
      {
        attribute: "输入<=272K context",
        domestic: { input: "37.5", cache: "3.75", output: "225" },
        international: { input: "5", cache: "0.5", output: "30" },
      },
      {
        attribute: "输入>272K context",
        domestic: { input: "75", cache: "7.5", output: "450" },
        international: { input: "10", cache: "1", output: "60" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "o1-preview",
    tiers: [
      {
        attribute: "输入<=272K context",
        domestic: { input: "225", output: "1350" },
        international: { input: "30", output: "180" },
      },
      {
        attribute: "输入>272K context",
        domestic: { input: "450", output: "2700" },
        international: { input: "60", output: "360" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "o1-mini",
    tiers: [
      {
        attribute: "输入<=272K context",
        domestic: { input: "18.75", cache: "1.85", output: "112.5" },
        international: { input: "2.5", cache: "0.25", output: "15" },
      },
      {
        attribute: "输入>272K context",
        domestic: { input: "37.5", cache: "3.75", output: "187.5" },
        international: { input: "5", cache: "0.5", output: "22.5" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "o3-mini",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "13.13", cache: "1.35", output: "105" },
        international: { input: "1.75", cache: "0.18", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "o2",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "12.25", cache: "1.23", output: "98" },
        international: { input: "1.63", cache: "0.17", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "o1",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.38", cache: "0.94", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "4o",
    trinityId: "gpt-4o",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "18.75", cache: "9.37", output: "75" },
        international: { input: "2.5", cache: "1.25", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-4o-2024-08-06",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "13.13", cache: "1.35", output: "105" },
        international: { input: "1.75", cache: "0.18", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-4o-2024-05-13",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "13.13", cache: "1.35", output: "105" },
        international: { input: "1.75", cache: "0.18", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-4o-mini (new)",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "1.5", cache: "0.15", output: "9.375" },
        international: { input: "0.2", cache: "0.02", output: "1.25" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "4.1（new）",
    trinityId: "gpt-4.1",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "15", cache: "3.75", output: "60" },
        international: { input: "2", cache: "0.5", output: "8" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5-chat-latest",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.37", cache: "0.93", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5-nano",
    trinityId: "gpt-5-nano",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "0.37", cache: "0.03", output: "3" },
        international: { input: "0.05", cache: "0.005", output: "0.4" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.1",
    trinityId: "gpt-5.1",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "8.75", cache: "0.87", output: "70" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.1-chat",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "8.75", cache: "0.87", output: "70" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.2",
    trinityId: "gpt-5.2",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "12.25", cache: "1.22", output: "98" },
        international: { input: "1.75", cache: "0.175", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.5（new）",
    trinityId: "gpt-5.5",
    tiers: [
      {
        attribute: "输入<=272K context",
        domestic: { input: "37.5", cache: "3.75", output: "225" },
        international: { input: "5", cache: "0.5", output: "30" },
      },
      {
        attribute: "输入>272K context",
        domestic: { input: "75", cache: "7.5", output: "337.5" },
        international: { input: "10", cache: "1", output: "45" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.4",
    trinityId: "gpt-5.4",
    tiers: [
      {
        attribute: "输入<=272K context",
        domestic: { input: "18.75", cache: "1.88", output: "112.5" },
        international: { input: "2.5", cache: "0.25", output: "15" },
      },
      {
        attribute: "输入>272K context",
        domestic: { input: "37.5", cache: "3.75", output: "168.75" },
        international: { input: "5", cache: "0.5", output: "22.5" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.4-mini",
    trinityId: "gpt-5.4-mini",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "5.63", cache: "0.56", output: "33.75" },
        international: { input: "0.75", cache: "0.075", output: "4.5" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.4-pro",
    trinityId: "gpt-5.4-pro",
    tiers: [
      {
        attribute: "输入<=272K context",
        domestic: { input: "225", output: "1350" },
        international: { input: "30", output: "180" },
      },
      {
        attribute: "输入>272K context",
        domestic: { input: "450", output: "2025" },
        international: { input: "60", output: "270" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.3-codex",
    trinityId: "gpt-5.3-codex",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "13.13", cache: "1.35", output: "105" },
        international: { input: "1.75", cache: "0.18", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "chat-latest",
    trinityId: "chat-latest",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "37.5", cache: "3.75", output: "225" },
        international: { input: "5", cache: "0.5", output: "30" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.3-chat-latest",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "13.13", cache: "1.35", output: "105" },
        international: { input: "1.75", cache: "0.18", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.2-chat-latest",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "13.13", cache: "1.35", output: "105" },
        international: { input: "1.75", cache: "0.18", output: "14" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.1-chat-latest（new）",
    trinityId: "gpt-5.1-chat",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.37", cache: "0.93", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.1-chat（new）",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.37", cache: "0.93", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5.4-nano",
    trinityId: "gpt-5.4-nano",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "1.5", cache: "0.15", output: "9.375" },
        international: { input: "0.2", cache: "0.02", output: "1.25" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5-mini（new）",
    trinityId: "gpt-5-mini",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "1.875", cache: "0.1875", output: "15" },
        international: { input: "0.25", cache: "0.025", output: "2" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "5",
    trinityId: "gpt-5",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.37", cache: "0.93", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-4-turbo",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.37", cache: "0.94", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-4-0613",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "0.37", cache: "0.03", output: "3" },
        international: { input: "0.05", cache: "0.005", output: "0.4" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-4-32k",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "5.63", cache: "0.56", output: "33.75" },
        international: { input: "0.75", cache: "0.075", output: "4.5" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-3.5-turbo (new)",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "1.875", cache: "0.188", output: "15" },
        international: { input: "0.25", cache: "0.025", output: "2" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-3.5-turbo-latest",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.37", cache: "0.94", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "OO",
    vendorName: "OpenAI",
    modelName: "gpt-3.5-turbo",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "9.37", cache: "0.94", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "3.5-flash（new）",
    trinityId: "gemini-3.5-flash",
    tiers: [
      {
        attribute: "输入：文本、图片、视频",
        domestic: { input: "11.25", cache: "1.125", output: "67.5" },
        international: { input: "1.5", cache: "0.15", output: "9" },
      },
      {
        attribute: "输入：音频",
        domestic: { input: "11.25", cache: "1.125", output: "67.5" },
        international: { input: "1.5", cache: "0.15", output: "9" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "3.1-pro",
    trinityId: "gemini-3.1-pro-preview",
    tiers: [
      {
        attribute: "输入≤20万个token",
        domestic: { input: "15", cache: "1.5", output: "90" },
        international: { input: "2", cache: "0.2", output: "12" },
      },
      {
        attribute: "输入>20万个token",
        domestic: { input: "30", cache: "3", output: "135" },
        international: { input: "4", cache: "0.4", output: "18" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "3.1-flash-lite（new）",
    trinityId: "gemini-3.1-flash-lite",
    tiers: [
      {
        attribute: "输入：文本、图片、视频",
        domestic: { input: "1.87", cache: "0.18", output: "11.25" },
        international: { input: "0.25", cache: "0.025", output: "1.5" },
      },
      {
        attribute: "输入：音频",
        domestic: { input: "3.75", cache: "0.37", output: "11.25" },
        international: { input: "0.5", cache: "0.05", output: "1.5" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "3.1-flash-lite-preview",
    trinityId: "gemini-3.1-flash-lite-preview",
    tiers: [
      {
        attribute: "输入：文本、图片、视频",
        domestic: { input: "1.87", cache: "0.18", output: "11.25" },
        international: { input: "0.25", cache: "0.025", output: "1.5" },
      },
      {
        attribute: "输入：音频",
        domestic: { input: "3.75", cache: "0.37", output: "11.25" },
        international: { input: "0.5", cache: "0.05", output: "1.5" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "3.0-flash",
    trinityId: "gemini-3-flash-preview",
    tiers: [
      {
        attribute: "输入：文本、图片、视频",
        domestic: { input: "3.5", cache: "0.35", output: "21" },
        international: { input: "0.5", cache: "0.05", output: "3" },
      },
      {
        attribute: "输入：音频",
        domestic: { input: "7", cache: "0.7", output: "21" },
        international: { input: "1", cache: "0.1", output: "3" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "2.5-pro",
    trinityId: "gemini-2.5-pro",
    tiers: [
      {
        attribute: "输入≤20万个token",
        domestic: { input: "9.37", cache: "0.93", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
      {
        attribute: "输入>20万个token",
        domestic: { input: "18.75", cache: "1.87", output: "112.5" },
        international: { input: "2.5", cache: "0.25", output: "15" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "2.5-flash",
    trinityId: "gemini-2.5-flash",
    tiers: [
      {
        attribute: "输入：文本、图片、视频",
        domestic: { input: "2.25", cache: "0.22", output: "18.75" },
        international: { input: "0.3", cache: "0.03", output: "2.5" },
      },
      {
        attribute: "输入：音频",
        domestic: { input: "7.5", cache: "0.75", output: "18.75" },
        international: { input: "1", cache: "0.1", output: "2.5" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "2.5-flash-lite",
    trinityId: "gemini-2.5-flash-lite",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "0.75", cache: "0.075", output: "3" },
        international: { input: "0.1", cache: "0.01", output: "0.4" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "2.5-flash-lite-preview",
    trinityId: "gemini-2.5-flash-lite-preview",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "0.75", cache: "0.075", output: "3" },
        international: { input: "0.1", cache: "0.01", output: "0.4" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "1.5 flash (new)",
    tiers: [
      {
        attribute: "输入:文本/图片/视频",
        domestic: { input: "11.25", cache: "1.125", output: "33.75" },
        international: { input: "1.5", cache: "0.15", output: "4.5" },
      },
      {
        attribute: "输入:音频",
        domestic: { input: "11.25", cache: "1.125", output: "33.75" },
        international: { input: "1.5", cache: "0.15", output: "4.5" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "1.5 pro",
    tiers: [
      {
        attribute: "输入<=1.28M tokens",
        domestic: { input: "15", cache: "1.5", output: "90" },
        international: { input: "2", cache: "0.2", output: "12" },
      },
      {
        attribute: "输入>1.28M tokens",
        domestic: { input: "30", cache: "3", output: "135" },
        international: { input: "4", cache: "0.4", output: "18" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "1.5 flash-lite (new)",
    tiers: [
      {
        attribute: "输入:文本/图片/视频",
        domestic: { input: "1.87", cache: "0.15", output: "11.25" },
        international: { input: "0.25", cache: "0.025", output: "1.5" },
      },
      {
        attribute: "输入:音频",
        domestic: { input: "3.75", cache: "0.37", output: "11.25" },
        international: { input: "0.5", cache: "0.05", output: "1.5" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "1.5-flash-8b-preview",
    tiers: [
      {
        attribute: "输入:文本/图片/视频",
        domestic: { input: "1.87", cache: "0.15", output: "11.25" },
        international: { input: "0.25", cache: "0.025", output: "1.5" },
      },
      {
        attribute: "输入:音频",
        domestic: { input: "3.75", cache: "0.37", output: "11.25" },
        international: { input: "0.5", cache: "0.05", output: "1.5" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "1.0-flash",
    tiers: [
      {
        attribute: "输入:文本/图片/视频",
        domestic: { input: "3.5", cache: "0.35", output: "21" },
        international: { input: "0.5", cache: "0.05", output: "3" },
      },
      {
        attribute: "输入:音频",
        domestic: { input: "7", cache: "0.7", output: "21" },
        international: { input: "1", cache: "0.1", output: "3" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "1.5-pro",
    tiers: [
      {
        attribute: "输入<=1.28M tokens",
        domestic: { input: "9.37", cache: "0.93", output: "75" },
        international: { input: "1.25", cache: "0.125", output: "10" },
      },
      {
        attribute: "输入>1.28M tokens",
        domestic: { input: "18.75", cache: "1.87", output: "112.5" },
        international: { input: "2.5", cache: "0.25", output: "15" },
      },
    ],
  },
  {
    vendorCode: "GG",
    vendorName: "Google",
    modelName: "1.5-flash",
    tiers: [
      {
        attribute: "输入:文本/图片/视频",
        domestic: { input: "2.25", cache: "0.22", output: "15.75" },
        international: { input: "0.3", cache: "0.03", output: "2.5" },
      },
      {
        attribute: "输入:音频",
        domestic: { input: "7.5", cache: "0.75", output: "18.75" },
        international: { input: "1", cache: "0.1", output: "2.5" },
      },
    ],
  },
  {
    vendorCode: "CLM",
    vendorName: "Claude",
    modelName: "3.5 (new)",
    tiers: [
      {
        attribute: "输入<=32K tokens",
        domestic: { input: "6", cache: "1.5", output: "24" },
        international: { input: "0.524", cache: "0.2", output: "3.6" },
      },
      {
        attribute: "输入>32K tokens",
        domestic: { input: "8", cache: "2", output: "28" },
        international: { input: "1.232", cache: "0.328", output: "4.312" },
      },
    ],
  },
  {
    vendorCode: "CLM",
    vendorName: "Claude",
    modelName: "3-Turbo",
    tiers: [
      {
        attribute: "输入<=32K tokens",
        domestic: { input: "5", cache: "1.2", output: "22" },
        international: { input: "0.77", cache: "0.185", output: "3.388" },
      },
      {
        attribute: "输入>32K tokens",
        domestic: { input: "7", cache: "1.8", output: "25" },
        international: { input: "1.078", cache: "0.277", output: "4.004" },
      },
    ],
  },
  {
    vendorCode: "CLM",
    vendorName: "Claude",
    modelName: "3",
    tiers: [
      {
        attribute: "输入<=32K tokens",
        domestic: { input: "4", cache: "1", output: "18" },
        international: { input: "0.616", cache: "0.154", output: "2.772" },
      },
      {
        attribute: "输入>32K tokens",
        domestic: { input: "5", cache: "1.5", output: "22" },
        international: { input: "0.924", cache: "0.231", output: "3.388" },
      },
    ],
  },
  {
    vendorCode: "CLM",
    vendorName: "Claude",
    modelName: "3.7",
    tiers: [
      {
        attribute: "输入<=32K, 输出<=0.2K",
        domestic: { input: "2", cache: "0.5", output: "8" },
        international: { input: "0.308", cache: "0.082", output: "1.232" },
      },
      {
        attribute: "输入<=32K, 输出>0.2K",
        domestic: { input: "3", cache: "0.8", output: "14" },
        international: { input: "0.462", cache: "0.123", output: "2.156" },
      },
      {
        attribute: "输入>32K tokens",
        domestic: { input: "4", cache: "1", output: "16" },
        international: { input: "0.616", cache: "0.123", output: "2.464" },
      },
    ],
  },
  {
    vendorCode: "Zhipu",
    vendorName: "智谱",
    modelName: "4.7",
    trinityId: "glm-4-7-251222",
    tiers: [
      {
        attribute: "输入：≤32K token，输出≤0.2K token",
        domestic: { input: "2", cache: "0.4", output: "8" },
        international: { input: "0.308", cache: "0.062", output: "1.232" },
      },
      {
        attribute: "输入：≤32K token，输出＞0.2K token",
        domestic: { input: "3", cache: "0.6", output: "14" },
        international: { input: "0.462", cache: "0.092", output: "2.156" },
      },
      {
        attribute: "输入：＞32K token",
        domestic: { input: "4", cache: "0.8", output: "16" },
        international: { input: "0.616", cache: "0.123", output: "2.464" },
      },
    ],
  },
  {
    vendorCode: "Zhipu",
    vendorName: "智谱",
    modelName: "5.1（new）",
    trinityId: "glm-5.1",
    tiers: [
      {
        attribute: "输入：≤32K token",
        domestic: { input: "6", cache: "1.3", output: "24" },
        international: { input: "0.924", cache: "0.2", output: "3.696" },
      },
      {
        attribute: "输入：＞32K token",
        domestic: { input: "8", cache: "2", output: "28" },
        international: { input: "1.232", cache: "0.308", output: "4.312" },
      },
    ],
  },
  {
    vendorCode: "Zhipu",
    vendorName: "智谱",
    modelName: "5-Turbo",
    trinityId: "glm-5-turbo",
    tiers: [
      {
        attribute: "输入：≤32K token",
        domestic: { input: "5", cache: "1.2", output: "22" },
        international: { input: "0.77", cache: "0.185", output: "3.388" },
      },
      {
        attribute: "输入：＞32K token",
        domestic: { input: "7", cache: "1.8", output: "26" },
        international: { input: "1.078", cache: "0.277", output: "4.004" },
      },
    ],
  },
  {
    vendorCode: "Zhipu",
    vendorName: "智谱",
    modelName: "5",
    trinityId: "glm-5",
    tiers: [
      {
        attribute: "输入：≤32K token",
        domestic: { input: "4", cache: "1", output: "18" },
        international: { input: "0.616", cache: "0.154", output: "2.772" },
      },
      {
        attribute: "输入：＞32K token",
        domestic: { input: "6", cache: "1.5", output: "22" },
        international: { input: "0.924", cache: "0.231", output: "3.388" },
      },
    ],
  },
  {
    vendorCode: "Kim",
    vendorName: "Kimi",
    modelName: "k1.5 (智能搜索)",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "5", cache: "1.1", output: "27" },
        international: { input: "0.616", cache: "0.169", output: "4.158" },
      },
    ],
  },
  {
    vendorCode: "Kim",
    vendorName: "Kimi",
    modelName: "k1.5 (普通搜索)",
    trinityId: "kimi-k2.5",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "4", cache: "0.7", output: "21" },
        international: { input: "0.616", cache: "0.108", output: "3.234" },
      },
    ],
  },
  {
    vendorCode: "GK",
    vendorName: "Groq",
    modelName: "4.0",
    tiers: [
      {
        attribute: "统一价",
        international: { input: "2", cache: "0.2", output: "2" },
      },
    ],
  },
  {
    vendorCode: "GK",
    vendorName: "Groq",
    modelName: "4.0-0309-reasoning",
    tiers: [
      {
        attribute: "统一价",
        international: { input: "2.5", cache: "0.25", output: "2.5" },
      },
    ],
  },
  {
    vendorCode: "GK",
    vendorName: "Groq",
    modelName: "4.0-0309-non-reasoning",
    tiers: [
      {
        attribute: "统一价",
        international: { input: "2", cache: "0.2", output: "2" },
      },
    ],
  },
  {
    vendorCode: "GK",
    vendorName: "Groq",
    modelName: "4-1-fast-reasoning",
    tiers: [
      {
        attribute: "统一价",
        international: { input: "0.5", cache: "0.05", output: "0.5" },
      },
    ],
  },
  {
    vendorCode: "Deepseek",
    vendorName: "DeepSeek",
    modelName: "v3.2",
    trinityId: "deepseek-v3.2",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "2", cache: "0.4", output: "3" },
        international: { input: "0.308", cache: "0.062", output: "0.462" },
      },
    ],
  },
  {
    vendorCode: "Deepseek",
    vendorName: "DeepSeek",
    modelName: "v4-pro (new)",
    trinityId: "deepseek-v4-pro",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "3", cache: "0.025", output: "6" },
        international: { input: "0.462", cache: "0.004", output: "0.923" },
      },
    ],
  },
  {
    vendorCode: "Deepseek",
    vendorName: "DeepSeek",
    modelName: "v4-flash (new)",
    trinityId: "deepseek-v4-flash",
    tiers: [
      {
        attribute: "统一价",
        domestic: { input: "1", cache: "0.02", output: "2" },
        international: { input: "0.154", cache: "0.003", output: "0.308" },
      },
    ],
  },
  {
    vendorCode: "Minimax",
    vendorName: "Minimax",
    modelName: "M2.7",
    trinityId: "minimax-m2.7",
    table: "minimax",
    tiers: [
      {
        attribute: "统一价",
        domestic: {
          input: "2.1",
          cacheWrite5m: "0.42",
          cacheWrite1h: "2.525",
          output: "8.4",
        },
        international: {
          input: "0.3",
          cacheHit: "0.06",
          cacheWrite5m: "0.375",
          output: "1.2",
        },
      },
    ],
  },
  {
    vendorCode: "Minimax",
    vendorName: "Minimax",
    modelName: "M2.5",
    trinityId: "minimax-m2.5",
    table: "minimax",
    tiers: [
      {
        attribute: "统一价",
        domestic: {
          input: "2.1",
          cacheWrite5m: "0.21",
          cacheWrite1h: "2.525",
          output: "8.4",
        },
        international: {
          input: "0.3",
          cacheHit: "0.03",
          cacheWrite5m: "0.375",
          output: "1.2",
        },
      },
    ],
  },
  {
    vendorCode: "CD",
    vendorName: "微软国际站",
    modelName: "Opus 4.0 (new)",
    table: "cd",
    tiers: [
      {
        attribute: "统一价",
        international: {
          input: "5",
          cacheWrite5m: "6.25",
          cacheWrite1h: "10",
          cacheHit: "0.5",
          output: "25",
        },
      },
    ],
  },
  {
    vendorCode: "CD",
    vendorName: "微软国际站",
    modelName: "Opus 4.7",
    trinityId: "claude-opus-4-7",
    table: "cd",
    tiers: [
      {
        attribute: "统一价",
        international: {
          input: "5",
          cacheWrite5m: "6.25",
          cacheWrite1h: "10",
          cacheHit: "0.5",
          output: "25",
        },
      },
    ],
  },
  {
    vendorCode: "CD",
    vendorName: "微软国际站",
    modelName: "Opus 4.6",
    trinityId: "claude-opus-4-6",
    table: "cd",
    tiers: [
      {
        attribute: "统一价",
        international: {
          input: "5",
          cacheWrite5m: "6.25",
          cacheWrite1h: "10",
          cacheHit: "0.5",
          output: "25",
        },
      },
    ],
  },
  {
    vendorCode: "CD",
    vendorName: "微软国际站",
    modelName: "Opus 4.5",
    trinityId: "claude-opus-4-8",
    table: "cd",
    tiers: [
      {
        attribute: "统一价",
        international: {
          input: "5",
          cacheWrite5m: "6.25",
          cacheWrite1h: "10",
          cacheHit: "0.5",
          output: "25",
        },
      },
    ],
  },
  {
    vendorCode: "CD",
    vendorName: "微软国际站",
    modelName: "Sonnet 4.0",
    trinityId: "claude-sonnet-4-6",
    table: "cd",
    tiers: [
      {
        attribute: "统一价",
        international: {
          input: "3",
          cacheWrite5m: "3.75",
          cacheWrite1h: "6",
          cacheHit: "0.3",
          output: "15",
        },
      },
    ],
  },
  {
    vendorCode: "CD",
    vendorName: "微软国际站",
    modelName: "Sonnet 4.5",
    table: "cd",
    tiers: [
      {
        attribute: "≤200K token",
        international: {
          input: "3",
          cacheWrite5m: "3.75",
          cacheWrite1h: "6",
          cacheHit: "0.3",
          output: "15",
        },
      },
      {
        attribute: "＞200K token",
        international: {
          input: "6",
          cacheWrite5m: "7.5",
          cacheWrite1h: "12",
          cacheHit: "0.6",
          output: "22.5",
        },
      },
    ],
  },
  {
    vendorCode: "CD",
    vendorName: "微软国际站",
    modelName: "Haiku 4.0",
    table: "cd",
    tiers: [
      {
        attribute: "统一价",
        international: {
          input: "1",
          cacheWrite5m: "1.25",
          cacheWrite1h: "2",
          cacheHit: "0.1",
          output: "5",
        },
      },
    ],
  },
];

export const SHEET_META = {
  source: "tencent_aigc_pricing_sheet",
  dataDate: "2026-06",
  note: "国内站 元/M token（=元/百万tokens）；国际站 美元/M token。由内部价目表录入。",
};
