/** 竞品概览 · Mock 与纯函数 */

export interface CompLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface CompKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "warn" | "neutral";
  deltaClass?: "down" | "up";
  deltaLink?: CompLink;
}

export interface CompRankItem {
  name: string;
  soa: number;
  barWidth: number;
  isUs?: boolean;
  detailLink?: CompLink;
}

export interface CompMatrixCol {
  label: string;
  detailLink?: CompLink;
}

export interface CompMatrixRow {
  questionId: string;
  title: string;
  titleLink: CompLink;
  cells: { value: string; tone?: "bad" | "mid" | "good" }[];
}

export interface CompGapItem {
  title: string;
  titleLink: CompLink;
  snippet: string;
  snippetHtml?: boolean;
  flag?: { label: string; tone: "warn" };
  action: string;
  actionLink: CompLink;
}

export const MARKET_FILTERS = ["all", "overseas", "domestic"] as const;
export type MarketFilter = (typeof MARKET_FILTERS)[number];

export const MARKET_FILTER_LABELS: Record<MarketFilter, string> = {
  all: "全部",
  overseas: "海外",
  domestic: "国内",
};

export const COMP_KPIS: CompKpi[] = [
  {
    label: "我方 SOA 7d",
    value: "18%",
    delta: "↓ 2pt",
    tone: "primary",
    deltaClass: "down",
  },
  {
    label: "监测竞品",
    value: "6",
    delta: "管理 →",
    tone: "neutral",
    deltaLink: { name: "geo-competitors-manage" },
  },
  {
    label: "落后题数",
    value: "4",
    delta: "竞品 SOA 更高",
    tone: "warn",
  },
  {
    label: "领先题数",
    value: "2",
    delta: "品牌词为主",
    tone: "neutral",
    deltaClass: "up",
  },
];

export const COMP_RANK_LIST: CompRankItem[] = [
  { name: "OpenRouter", soa: 52, barWidth: 52, detailLink: { name: "geo-competitor-detail" } },
  {
    name: "TokenHub",
    soa: 46,
    barWidth: 46,
    detailLink: { name: "geo-competitor-detail", query: { id: "tokenhub" } },
  },
  { name: "Trinity AI（我方）", soa: 18, barWidth: 18, isUs: true },
  {
    name: "LiteLLM",
    soa: 14,
    barWidth: 14,
    detailLink: { name: "geo-competitor-detail", query: { id: "litellm" } },
  },
  {
    name: "硅基流动",
    soa: 11,
    barWidth: 11,
    detailLink: { name: "geo-competitor-detail", query: { id: "siliconflow" } },
  },
];

export const COMP_MATRIX_COLS: CompMatrixCol[] = [
  { label: "我方" },
  { label: "OpenRouter", detailLink: { name: "geo-competitor-detail" } },
  {
    label: "TokenHub",
    detailLink: { name: "geo-competitor-detail", query: { id: "tokenhub" } },
  },
  { label: "LiteLLM" },
];

export const COMP_MATRIX_ROWS: CompMatrixRow[] = [
  {
    questionId: "Q00",
    title: "推荐两款 API 聚合平台",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    cells: [
      { value: "0%", tone: "bad" },
      { value: "68%" },
      { value: "52%" },
      { value: "12%", tone: "mid" },
    ],
  },
  {
    questionId: "Q03",
    title: "国内 OpenAI 兼容…",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q03" } },
    cells: [
      { value: "22%", tone: "mid" },
      { value: "41%" },
      { value: "58%" },
      { value: "18%", tone: "mid" },
    ],
  },
  {
    questionId: "Q01",
    title: "Trinity AI 好用吗？",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q01" } },
    cells: [
      { value: "62%" },
      { value: "8%", tone: "mid" },
      { value: "5%", tone: "mid" },
      { value: "3%", tone: "mid" },
    ],
  },
  {
    questionId: "Q06",
    title: "Trinity 和 OpenRouter…",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q06" } },
    cells: [
      { value: "28%", tone: "mid" },
      { value: "55%" },
      { value: "20%", tone: "mid" },
      { value: "8%", tone: "mid" },
    ],
  },
];

export const COMP_GAP_ITEMS: CompGapItem[] = [
  {
    title: "推荐两款 API 聚合平台",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    snippet: "我方 0% · OpenRouter 68% · ",
    flag: { label: "D1", tone: "warn" },
    action: "看回答",
    actionLink: { name: "geo-answer-detail" },
  },
  {
    title: "Trinity 和 OpenRouter 哪个更适合国内开发者？",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q06" } },
    snippet: "我方 28% · OpenRouter 55% · 对比词落后",
    action: "看竞品",
    actionLink: { name: "geo-competitor-detail" },
  },
];

export const COMP_MATRIX_HEAD_LINK: CompLink = {
  name: "geo-keyword-detail",
  query: { q: "Q00" },
};
