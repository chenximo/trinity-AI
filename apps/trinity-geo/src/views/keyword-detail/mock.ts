/** 关键词详情 · Mock 与纯函数 */

import type { QuestionType } from "../keywords/mock";
import { typeClass, typeShort } from "../keywords/mock";

export type DetailPeriod = "day" | "week" | "month";
export type SoaTone = "bad" | "mid" | "good";

export interface KeywordNavItem {
  id: string;
  type: QuestionType;
  text: string;
  soa: number;
  soaTone?: SoaTone;
}

export interface KeywordDetailLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface KeywordKpi {
  label: string;
  value: string;
  delta: string;
  deltaDown?: boolean;
  tone: "primary" | "warn" | "ccr" | "neutral";
  deltaLink?: KeywordDetailLink;
  deltaText?: string;
}

export interface CompetitorRankRow {
  name: string;
  soa: number;
  isUs?: boolean;
  soaTone?: SoaTone;
  detail?: KeywordDetailLink;
}

export interface NarrativeTag {
  label: string;
  hot?: boolean;
  muted?: boolean;
}

export interface PlatformSummaryRow {
  platform: string;
  market: string;
  soa: string;
  soaClass?: SoaTone | "muted";
  cite: string;
  citeClass?: SoaTone | "muted";
  leaders: string;
  answer: KeywordDetailLink;
  answerTime: string;
  answerTitle?: string;
}

export interface LatestAnswerRow {
  title: string;
  snippet: string;
  inAnswer: boolean;
  citeLabel: string;
  diagCode: string;
  diagLink: KeywordDetailLink;
  detail: KeywordDetailLink;
}

export interface KeywordDetailData {
  id: string;
  type: QuestionType;
  title: string;
  status: string;
  sampleHint: string;
  callout: {
    diagLink: KeywordDetailLink;
    diagText: string;
    citeLink: KeywordDetailLink;
    optimizeLink: KeywordDetailLink;
  };
  kpis: KeywordKpi[];
  trendNote: string;
  competitors: CompetitorRankRow[];
  tags: NarrativeTag[];
  platforms: PlatformSummaryRow[];
  latestAnswers: LatestAnswerRow[];
}

export const KEYWORD_NAV_ITEMS: KeywordNavItem[] = [
  { id: "Q00", type: "品类词", text: "推荐两款 API 聚合平台", soa: 0, soaTone: "bad" },
  { id: "Q01", type: "品牌词", text: "Trinity AI 是什么", soa: 42, soaTone: "mid" },
  { id: "Q02", type: "品类词", text: "国内 OpenAI 兼容 API 聚合", soa: 22, soaTone: "mid" },
  { id: "Q03", type: "场景词", text: "一个 Key 调用多家大模型", soa: 35 },
  { id: "Q04", type: "对比词", text: "Trinity vs OpenRouter", soa: 28, soaTone: "mid" },
];

const Q00_DETAIL: KeywordDetailData = {
  id: "Q00",
  type: "品类词",
  title: "推荐两款 API 聚合平台",
  status: "监测中 · MVP 样本（D1 · 信源 0/16）",
  sampleHint: "采集样本 28（10 平台 × 近 3 轮）· R2 验证见",
  callout: {
    diagLink: { name: "geo-diagnosis", hash: "#diag-q00" },
    diagText: "D1 · S1+S2+S3",
    citeLink: { name: "geo-answer-detail", hash: "#cite-heading" },
    optimizeLink: { name: "geo-optimize", hash: "#opt-s1s2" },
  },
  kpis: [
    { label: "SOA 7d", value: "0%", delta: "↓ 持平", deltaDown: true, tone: "primary" },
    {
      label: "信源盘 · 豆包 R1",
      value: "0/16",
      delta: "我方域未命中",
      tone: "warn",
      deltaLink: { name: "geo-answer-detail", hash: "#cite-heading" },
    },
    {
      label: "CCR",
      value: "0%",
      delta: "未被引为信源",
      tone: "ccr",
      deltaLink: { name: "geo-citations" },
      deltaText: "引用读口 →",
    },
    { label: "提及率", value: "0%", delta: "未出现品牌名", tone: "neutral" },
  ],
  trendNote: "本题 SOA 持续为 0%，竞品 OpenRouter / TokenHub 稳定领先",
  competitors: [
    { name: "OpenRouter", soa: 68, detail: { name: "geo-competitor-detail" } },
    { name: "TokenHub", soa: 52, detail: { name: "geo-competitor-detail" } },
    { name: "Trinity AI", soa: 0, isUs: true, soaTone: "bad" },
  ],
  tags: [
    { label: "API 聚合", hot: true },
    { label: "OpenAI 兼容", hot: true },
    { label: "按量计费" },
    { label: "官方文档" },
    { label: "Trinity AI", muted: true },
    { label: "多模型路由" },
  ],
  platforms: [
    {
      platform: "豆包",
      market: "国内",
      soa: "0%",
      soaClass: "bad",
      cite: "0/16",
      citeClass: "bad",
      leaders: "OpenRouter, TokenHub",
      answer: { name: "geo-answer-detail" },
      answerTime: "今日 09:12",
    },
    {
      platform: "ChatGPT",
      market: "海外",
      soa: "0%",
      soaClass: "bad",
      cite: "—",
      citeClass: "muted",
      leaders: "OpenRouter",
      answer: { name: "geo-answer-detail" },
      answerTime: "昨日",
    },
    {
      platform: "DeepSeek",
      market: "国内",
      soa: "0%",
      soaClass: "bad",
      cite: "—",
      citeClass: "muted",
      leaders: "LiteLLM",
      answer: { name: "geo-answer-detail", query: { id: "Q00-doubao" } },
      answerTime: "昨日",
      answerTitle: "Q00 · DeepSeek",
    },
    {
      platform: "Perplexity",
      market: "海外",
      soa: "12%",
      soaClass: "mid",
      cite: "—",
      citeClass: "muted",
      leaders: "—",
      answer: { name: "geo-answer-detail-brand" },
      answerTime: "2 日前",
      answerTitle: "Q01 · Perplexity",
    },
  ],
  latestAnswers: [
    {
      title: "豆包 · R1 · 2026-06-16",
      snippet: "主推 OpenRouter 与腾讯云 TokenHub · 参考盘 16 链、我方 0…",
      inAnswer: false,
      citeLabel: "信源 0/16",
      diagCode: "D1",
      diagLink: { name: "geo-diagnosis", hash: "#diag-q00" },
      detail: { name: "geo-answer-detail" },
    },
  ],
};

/** 按 question id 取详情；未配置时回退 Q00 并替换 id/标题 */
export function getKeywordDetail(id: string): KeywordDetailData {
  if (id === "Q00") return Q00_DETAIL;
  const nav = KEYWORD_NAV_ITEMS.find((n) => n.id === id);
  if (!nav) return Q00_DETAIL;
  return {
    ...Q00_DETAIL,
    id: nav.id,
    type: nav.type,
    title: nav.text,
    status: `监测中 · 样本占位（${nav.id}）`,
    kpis: Q00_DETAIL.kpis.map((k, i) =>
      i === 0 ? { ...k, value: `${nav.soa}%` } : k,
    ),
    competitors: Q00_DETAIL.competitors.map((c) =>
      c.isUs ? { ...c, soa: nav.soa, soaTone: nav.soaTone } : c,
    ),
  };
}

export { typeClass, typeShort };

export const PERIOD_LABELS: Record<DetailPeriod, string> = {
  day: "日",
  week: "周",
  month: "月",
};
