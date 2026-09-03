/** 引用与信源 · Mock 与纯函数 */

export interface CiteLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface CiteKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "warn" | "neutral" | "ccr";
  deltaLink?: CiteLink;
}

export interface CiteQuestionRow {
  questionId: string;
  title: string;
  titleLink?: CiteLink;
  platform: string;
  ccr: "yes" | "no";
  citeMn: string;
  citeClass: "bad" | "good" | "mid";
  gap: string;
  gapMuted?: boolean;
  action: string;
  actionLink: CiteLink;
  rowClass?: string;
}

export interface CiteStructureBar {
  tag: string;
  tagClass: "competitor" | "third" | "us" | "neutral";
  width: number;
  pct: string;
}

export interface CiteSpotlightCell {
  tone: "competitor" | "third" | "missing";
  title: string;
  desc: string;
}

export interface CitePlatformRow {
  platform: string;
  extractable: "yes" | "partial" | "no";
  note: string;
}

export const PLATFORM_FILTERS = ["全部平台", "豆包", "ChatGPT", "DeepSeek", "更多…"] as const;
export const PERIOD_FILTERS = ["近 7 日", "近 30 日", "R1", "R2"] as const;

export type PlatformFilter = (typeof PLATFORM_FILTERS)[number];
export type PeriodFilter = (typeof PERIOD_FILTERS)[number];

export const CITE_KPIS: CiteKpi[] = [
  {
    label: "CCR · 7d",
    value: "8%",
    delta: "分母 = 有提及 · Q01 样本",
    tone: "ccr",
    deltaLink: { name: "geo-answer-detail-brand" },
  },
  {
    label: "信源盘命中率",
    value: "12%",
    delta: "可提取样本中 M>0",
    tone: "warn",
  },
  {
    label: "可提取样本",
    value: "34",
    delta: "可提取渠道 · 10 平台配置",
    tone: "neutral",
  },
  {
    label: "竞品官方链占比",
    value: "58%",
    delta: "全部 cited_urls",
    tone: "neutral",
  },
];

export const CITE_QUESTION_ROWS: CiteQuestionRow[] = [
  {
    questionId: "Q00",
    title: "推荐两款 API 聚合平台",
    titleLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    platform: "豆包",
    ccr: "no",
    citeMn: "0/16",
    citeClass: "bad",
    gap: "S1+S2+S3",
    gapMuted: true,
    action: "信源盘 →",
    actionLink: { name: "geo-answer-detail", hash: "#cite-heading" },
    rowClass: "warn",
  },
  {
    questionId: "Q01",
    title: "Trinity AI 好用吗？",
    titleLink: { name: "geo-answer-detail-brand" },
    platform: "ChatGPT",
    ccr: "yes",
    citeMn: "1/3",
    citeClass: "good",
    gap: "—",
    action: "CCR 样本 →",
    actionLink: { name: "geo-answer-detail-brand" },
    rowClass: "ok",
  },
  {
    questionId: "Q06",
    title: "vs OpenRouter 国内",
    platform: "DeepSeek",
    ccr: "no",
    citeMn: "0/8",
    citeClass: "mid",
    gap: "S2",
    gapMuted: true,
    action: "诊断 →",
    actionLink: { name: "geo-diagnosis" },
  },
  {
    questionId: "Q03",
    title: "国内 OpenAI 兼容聚合",
    platform: "豆包",
    ccr: "no",
    citeMn: "0/12",
    citeClass: "bad",
    gap: "S1",
    gapMuted: true,
    action: "—",
    actionLink: { name: "geo-answer-detail", hash: "#cite-heading" },
  },
];

export const CITE_STRUCTURE_BARS: CiteStructureBar[] = [
  { tag: "竞品官方", tagClass: "competitor", width: 58, pct: "58%" },
  { tag: "第三方评测", tagClass: "third", width: 32, pct: "32%" },
  { tag: "我方官方", tagClass: "us", width: 6, pct: "6%" },
  { tag: "中立文档", tagClass: "neutral", width: 4, pct: "4%" },
];

export const CITE_STRUCTURE_INSIGHT =
  "Q00 样本：竞品官方 11 + 评测 5 + 我方 0 — 叙事由 OpenRouter / TokenHub docs 定型";

export const CITE_SPOTLIGHT = {
  title: "Q00 × 豆包 × R1 · 16 条参考链",
  badge: "M/N = 0/16",
  cells: [
    {
      tone: "competitor" as const,
      title: "竞品官方 · 11",
      desc: "OpenRouter 6 链 · TokenHub 5 链 — 含 /docs、模型列表、API 指南",
    },
    {
      tone: "third" as const,
      title: "第三方评测 · 5",
      desc: "SegmentFault、凤凰网、CSDN 等横向文定型品类叙事",
    },
    {
      tone: "missing" as const,
      title: "我方官方 · 0",
      desc: "doc.trinitydesk.ai 未进入参考盘 — R2 目标 0→1/17",
    },
  ],
  actions: [
    { label: "查看完整 16 链", to: { name: "geo-answer-detail", hash: "#cite-heading" }, primary: true },
    { label: "R1 vs R2 信源 Δ", to: { name: "geo-verify", hash: "#verify-q00" } },
    { label: "诊断 S1+S2+S3", to: { name: "geo-diagnosis", hash: "#diag-q00" } },
  ],
};

export const CITE_PLATFORM_ROWS: CitePlatformRow[] = [
  { platform: "豆包 App", extractable: "yes", note: "显式列出参考链 · Q00 信源盘样本" },
  { platform: "ChatGPT", extractable: "partial", note: "正文内链 · Q01 CCR 样本" },
  { platform: "Claude / Gemini", extractable: "partial", note: "视消费端是否返回链接" },
  { platform: "API 直连", extractable: "no", note: "仅正文 · CCR 标「不可观测」" },
];

export function filterBadgeLabel(platform: PlatformFilter, period: PeriodFilter): string {
  return `${platform} · ${period}`;
}

export const CCR_PILL_LABEL: Record<"yes" | "no", string> = {
  yes: "是",
  no: "否",
};

export const EXTRACTABLE_PILL_LABEL: Record<"yes" | "partial" | "no", string> = {
  yes: "是",
  partial: "部分",
  no: "否",
};
