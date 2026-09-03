/** 监测采集 · Mock */

export interface MonLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface MonKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "neutral";
  deltaClass?: "up";
  deltaLink?: MonLink;
  valueSm?: boolean;
}

export interface MonPlatformCard {
  name: string;
  market: "overseas" | "domestic";
  fresh: "today" | "stale";
  status: "ok" | "warn";
  statusLabel: string;
  lastCollect: string;
  progress: string;
  failures: string;
  extractable: string;
  extractableHighlight?: boolean;
}

export interface MonFailRow {
  time: string;
  platform: string;
  questionId: string;
  questionTitle: string;
  questionLink?: MonLink;
  reason: string;
}

export interface MonRecentItem {
  questionId: string;
  title: string;
  titleLink: MonLink;
  platform: string;
  platformClass: "p-domestic" | "p-overseas";
  meta: string;
  badge: "miss" | "ok";
  badgeLabel: string;
}

export interface MonLogRow {
  time: string;
  mono?: boolean;
  platform: string;
  questionId: string;
  questionTitle: string;
  questionLink?: MonLink;
  status: "ok" | "fail";
  statusLabel: string;
  duration: string;
  answerLink?: MonLink;
  fail?: boolean;
}

export const MARKET_FILTERS = ["all", "overseas", "domestic"] as const;
export const MARKET_FILTER_LABELS: Record<(typeof MARKET_FILTERS)[number], string> = {
  all: "全部",
  overseas: "海外",
  domestic: "国内",
};

export type MarketFilter = (typeof MARKET_FILTERS)[number];
export type MonTab = "overview" | "logs";

export const MON_KPIS: MonKpi[] = [
  {
    label: "启用问题",
    value: "10",
    delta: "问题集 →",
    tone: "neutral",
    deltaLink: { name: "geo-keywords" },
  },
  { label: "预期采集", value: "100", delta: "10 题 × 10 平台", tone: "neutral" },
  {
    label: "成功率",
    value: "98%",
    delta: "2 条失败",
    tone: "primary",
    deltaClass: "up",
  },
  {
    label: "最近全量",
    value: "今日 09:12",
    delta: "下次 明日 06:00",
    tone: "neutral",
    valueSm: true,
  },
];

export const MON_PLATFORM_CARDS: MonPlatformCard[] = [
  {
    name: "ChatGPT",
    market: "overseas",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:10",
    progress: "10/10",
    failures: "0",
    extractable: "部分",
  },
  {
    name: "Gemini",
    market: "overseas",
    fresh: "today",
    status: "warn",
    statusLabel: "延迟",
    lastCollect: "昨日 22:40",
    progress: "8/10",
    failures: "2",
    extractable: "部分",
  },
  {
    name: "Claude",
    market: "overseas",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:08",
    progress: "10/10",
    failures: "0",
    extractable: "部分",
  },
  {
    name: "Perplexity",
    market: "overseas",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:05",
    progress: "10/10",
    failures: "0",
    extractable: "部分",
  },
  {
    name: "Copilot",
    market: "overseas",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:06",
    progress: "10/10",
    failures: "0",
    extractable: "部分",
  },
  {
    name: "豆包",
    market: "domestic",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:12",
    progress: "10/10",
    failures: "0",
    extractable: "是 · Q00 样本",
    extractableHighlight: true,
  },
  {
    name: "DeepSeek",
    market: "domestic",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:11",
    progress: "10/10",
    failures: "0",
    extractable: "否",
  },
  {
    name: "通义千问",
    market: "domestic",
    fresh: "stale",
    status: "warn",
    statusLabel: "延迟",
    lastCollect: "昨日 18:20",
    progress: "9/10",
    failures: "0",
    extractable: "部分",
  },
  {
    name: "文心一言",
    market: "domestic",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:09",
    progress: "10/10",
    failures: "0",
    extractable: "部分",
  },
  {
    name: "Kimi",
    market: "domestic",
    fresh: "today",
    status: "ok",
    statusLabel: "正常",
    lastCollect: "今日 09:07",
    progress: "10/10",
    failures: "0",
    extractable: "部分",
  },
];

export const MON_FAIL_ROWS: MonFailRow[] = [
  {
    time: "09:02",
    platform: "Gemini",
    questionId: "Q03",
    questionTitle: "国内 OpenAI 兼容…",
    questionLink: { name: "geo-keyword-detail" },
    reason: "429 限流",
  },
  {
    time: "08:58",
    platform: "Gemini",
    questionId: "Q00",
    questionTitle: "推荐两款 API…",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    reason: "超时",
  },
];

export const MON_RECENT_ITEMS: MonRecentItem[] = [
  {
    questionId: "Q00",
    title: "推荐两款 API 聚合平台",
    titleLink: { name: "geo-answer-detail" },
    platform: "豆包",
    platformClass: "p-domestic",
    meta: "OpenRouter · TokenHub… · 今日 09:12",
    badge: "miss",
    badgeLabel: "未进答案",
  },
  {
    questionId: "Q01",
    title: "Trinity AI 好用吗？",
    titleLink: { name: "geo-answer-detail-brand" },
    platform: "ChatGPT",
    platformClass: "p-overseas",
    meta: "正面提及 · 今日 09:10",
    badge: "ok",
    badgeLabel: "进答案",
  },
  {
    questionId: "Q08",
    title: "降低多模型成本",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q08" } },
    platform: "Claude",
    platformClass: "p-overseas",
    meta: "进正文 · 昨日 22:15",
    badge: "ok",
    badgeLabel: "进答案",
  },
];

export const MON_LOG_ROWS: MonLogRow[] = [
  {
    time: "09:02",
    mono: true,
    platform: "Gemini",
    questionId: "Q03",
    questionTitle: "国内 OpenAI 兼容…",
    questionLink: { name: "geo-keyword-detail" },
    status: "fail",
    statusLabel: "429 限流",
    duration: "—",
    fail: true,
  },
  {
    time: "08:58",
    mono: true,
    platform: "Gemini",
    questionId: "Q00",
    questionTitle: "推荐两款 API…",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    status: "fail",
    statusLabel: "超时",
    duration: "120s",
    fail: true,
  },
  {
    time: "2026-06-15 01:58",
    platform: "ChatGPT",
    questionId: "Q00",
    questionTitle: "Q00",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    status: "ok",
    statusLabel: "成功",
    duration: "8.2s",
    answerLink: { name: "geo-answer-detail" },
  },
  {
    time: "2026-06-15 01:55",
    platform: "Claude",
    questionId: "Q00",
    questionTitle: "Q00",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    status: "ok",
    statusLabel: "成功",
    duration: "6.1s",
    answerLink: { name: "geo-answer-detail" },
  },
  {
    time: "2026-06-14 02:10",
    platform: "豆包",
    questionId: "Q00",
    questionTitle: "Q00",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    status: "ok",
    statusLabel: "成功",
    duration: "11.4s",
    answerLink: { name: "geo-answer-detail" },
  },
];
