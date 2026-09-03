/** Dashboard 原型 Mock · 与 mvp/config 样本数据口径一致 */

export type MarketFilter = "all" | "overseas" | "domestic";
export type Period = "day" | "week" | "month";

export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean | null;
  tone: "primary" | "overseas" | "domestic" | "neutral";
}

export interface PlatformSoa {
  id: string;
  name: string;
  market: "overseas" | "domestic";
  soa: number;
  fresh: "today" | "stale" | "old";
}

export interface AnswerRow {
  id: string;
  platform: string;
  market: "overseas" | "domestic";
  keyword: string;
  snippet: string;
  inAnswer: boolean;
  ago: string;
}

export interface CompetitorRow {
  question: string;
  ours: number;
  openrouter: number;
  tokenhub: number;
}

export const brandName = "Trinity AI";

export const lastUpdated = "今日 09:12 · 10 平台已采";

export const kpis: DashboardKpi[] = [
  { label: "SOA 总览", value: "18%", delta: "↑ 2% 较上周", deltaUp: true, tone: "primary" },
  { label: "海外 SOA", value: "24%", delta: "↑ 6% 较上周", deltaUp: true, tone: "overseas" },
  { label: "国内 SOA", value: "12%", delta: "↓ 3% 较上周", deltaUp: false, tone: "domestic" },
  { label: "总提及", value: "47", delta: "本周 +12", deltaUp: true, tone: "neutral" },
];

export const sentiment = { positive: 72, neutral: 21, negative: 7 };

export const trendPoints = {
  overseas: [32, 30, 28, 26, 28, 30, 24],
  domestic: [18, 16, 15, 14, 13, 15, 12],
};

export const platforms: PlatformSoa[] = [
  { id: "chatgpt", name: "ChatGPT", market: "overseas", soa: 31, fresh: "today" },
  { id: "perplexity", name: "Perplexity", market: "overseas", soa: 22, fresh: "today" },
  { id: "claude", name: "Claude", market: "overseas", soa: 19, fresh: "today" },
  { id: "gemini", name: "Gemini", market: "overseas", soa: 24, fresh: "stale" },
  { id: "copilot", name: "Copilot", market: "overseas", soa: 18, fresh: "today" },
  { id: "doubao", name: "豆包", market: "domestic", soa: 8, fresh: "today" },
  { id: "tongyi", name: "通义", market: "domestic", soa: 14, fresh: "today" },
  { id: "wenxin", name: "文心", market: "domestic", soa: 11, fresh: "stale" },
  { id: "kimi", name: "Kimi", market: "domestic", soa: 16, fresh: "today" },
  { id: "yuanbao", name: "腾讯元宝", market: "domestic", soa: 10, fresh: "today" },
];

export const recentAnswers: AnswerRow[] = [
  {
    id: "Q00-doubao",
    platform: "豆包",
    market: "domestic",
    keyword: "推荐两款 API 聚合平台",
    snippet: "…推荐 OpenRouter 与腾讯云 TokenHub，前者模型覆盖广，后者国内接入稳定…",
    inAnswer: false,
    ago: "2 小时前",
  },
  {
    id: "Q01-doubao",
    platform: "豆包",
    market: "domestic",
    keyword: "Trinity AI 好用吗？",
    snippet: "…Trinity AI（trinitydesk.ai）提供统一 API 接入多家大模型，适合…",
    inAnswer: true,
    ago: "2 小时前",
  },
  {
    id: "Q03-chatgpt",
    platform: "ChatGPT",
    market: "overseas",
    keyword: "OpenAI compatible API aggregators",
    snippet: "…OpenRouter is widely used; Trinity AI also offers a unified endpoint for…",
    inAnswer: true,
    ago: "5 小时前",
  },
  {
    id: "Q06-doubao",
    platform: "豆包",
    market: "domestic",
    keyword: "Trinity 和 OpenRouter 哪个更适合国内开发者？",
    snippet: "…国内开发者可优先考虑 TokenHub；海外场景 OpenRouter 模型更多…",
    inAnswer: true,
    ago: "昨日",
  },
];

export const competitorRows: CompetitorRow[] = [
  {
    question: "推荐两款 API 聚合平台",
    ours: 0,
    openrouter: 68,
    tokenhub: 52,
  },
  {
    question: "国内 OpenAI 兼容 API 聚合",
    ours: 22,
    openrouter: 41,
    tokenhub: 58,
  },
  {
    question: "一个 Key 调用多家大模型",
    ours: 35,
    openrouter: 48,
    tokenhub: 29,
  },
];

export const periodLabels: Record<Period, string> = {
  day: "近 7 日",
  week: "近 8 周",
  month: "近 6 月",
};

export const marketLabels: Record<MarketFilter, string> = {
  all: "全部",
  overseas: "海外",
  domestic: "国内",
};
