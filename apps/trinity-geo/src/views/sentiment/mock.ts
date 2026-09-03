/** 情感与口碑 · Mock */

export interface SentimentLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface SentimentKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "warn" | "neutral";
  deltaClass?: "up" | "down";
}

export interface SentimentFeedItem {
  tone: "pos" | "neu" | "neg";
  tag: string;
  questionId: string;
  platform: string;
  titleLink?: SentimentLink;
  time: string;
  datetime: string;
  bodyText: string;
  bodyLink?: { label: string; to: SentimentLink };
}

export interface SentimentDistBar {
  pos: number;
  neu: number;
  neg: number;
}

export interface SentimentQuestionRow {
  questionId: string;
  title: string;
  titleLink?: SentimentLink;
  platform: string;
  sentiment: "pos" | "neu" | "neg" | "none";
  action: string;
  actionLink?: SentimentLink;
  rowClass?: string;
}

export interface SentimentAlert {
  title: string;
  desc: string;
  actionLabel: string;
  actionLink: SentimentLink;
}

export const PLATFORM_FILTERS = ["全部平台", "豆包", "ChatGPT", "Claude", "更多…"] as const;
export const PERIOD_FILTERS = ["近 7 日", "近 30 日"] as const;

export type PlatformFilter = (typeof PLATFORM_FILTERS)[number];
export type PeriodFilter = (typeof PERIOD_FILTERS)[number];

export const SENTIMENT_KPIS: SentimentKpi[] = [
  { label: "正面", value: "72%", delta: "↑ 4% 较上周", tone: "primary", deltaClass: "up" },
  { label: "中性", value: "21%", delta: "客观陈述为主", tone: "neutral" },
  { label: "负面", value: "7%", delta: "1 条待复核", tone: "warn", deltaClass: "down" },
  { label: "有情感标注", value: "47", delta: "提及采样分母", tone: "neutral" },
];

export const SENTIMENT_DIST: SentimentDistBar = { pos: 72, neu: 21, neg: 7 };

export const SENTIMENT_FEED: SentimentFeedItem[] = [
  {
    tone: "pos",
    tag: "正面",
    questionId: "Q01",
    platform: "ChatGPT",
    titleLink: { name: "geo-answer-detail-brand" },
    time: "6/14 11:20",
    datetime: "2026-06-14T11:20",
    bodyText: "「统一接入多家大模型、按量计费、团队管控 API Key…」— 首推段正面推荐 · ",
    bodyLink: { label: "CCR 样本", to: { name: "geo-citations" } },
  },
  {
    tone: "pos",
    tag: "正面",
    questionId: "Q08",
    platform: "Claude",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q08" } },
    time: "6/13 09:05",
    datetime: "2026-06-13T09:05",
    bodyText: "「模型覆盖全面、OpenAI 兼容端点稳定」— 功能向正面",
  },
  {
    tone: "neu",
    tag: "中性",
    questionId: "Q05",
    platform: "Gemini",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q05" } },
    time: "6/12 16:40",
    datetime: "2026-06-12T16:40",
    bodyText: "「与 OpenRouter 相比，Trinity 更偏国内线路与企业计费」— 对比陈述无褒贬",
  },
  {
    tone: "neg",
    tag: "负面",
    questionId: "Q02",
    platform: "豆包",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q02" } },
    time: "6/11 08:00",
    datetime: "2026-06-11T08:00",
    bodyText: "「定价信息待核实」— 幻觉监测 待复核",
  },
];

export const SENTIMENT_QUESTION_ROWS: SentimentQuestionRow[] = [
  {
    questionId: "Q01",
    title: "Trinity 好用吗",
    titleLink: { name: "geo-answer-detail-brand" },
    platform: "ChatGPT",
    sentiment: "pos",
    action: "回答 →",
    actionLink: { name: "geo-answer-detail-brand" },
  },
  {
    questionId: "Q08",
    title: "降本",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q08" } },
    platform: "Claude",
    sentiment: "pos",
    action: "详情 →",
    actionLink: { name: "geo-keyword-detail", query: { q: "Q08" } },
  },
  {
    questionId: "Q05",
    title: "统一管理 API",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q05" } },
    platform: "Gemini",
    sentiment: "neu",
    action: "详情 →",
    actionLink: { name: "geo-keyword-detail", query: { q: "Q05" } },
  },
  {
    questionId: "Q02",
    title: "trinitydesk 是什么",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q02" } },
    platform: "豆包",
    sentiment: "neg",
    action: "治理 →",
    actionLink: { name: "geo-dashboard" },
    rowClass: "geo-sentiment-q-row-warn",
  },
  {
    questionId: "Q00",
    title: "推荐 API 聚合",
    platform: "豆包",
    sentiment: "none",
    action: "未提及",
    rowClass: "geo-sentiment-q-row-muted",
  },
];

export const SENTIMENT_INSIGHT =
  "叙事主题（P2）：正面常关联企业计费、国内线路、OpenAI 兼容；负面多集中在定价误述。";

export const SENTIMENT_ALERT: SentimentAlert = {
  title: "Q02 · 豆包 · 负面 / 幻觉待复核",
  desc: "回答含「定价信息待核实」— 链总览治理条与人工复核队列（P1）",
  actionLabel: "总览治理 →",
  actionLink: { name: "geo-dashboard" },
};

export const SENTIMENT_PILL_LABEL: Record<"pos" | "neu" | "neg" | "none", string> = {
  pos: "正面",
  neu: "中性",
  neg: "负面",
  none: "—",
};

export function filterBadgeLabel(platform: PlatformFilter, period: PeriodFilter): string {
  return `${platform} · ${period}`;
}
