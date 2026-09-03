/** 竞品详情 · Mock 与纯函数 */

export interface CompLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface CompKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "neutral" | "ccr";
  deltaClass?: "up";
}

export interface CompWinRow {
  question: string;
  questionLink: CompLink;
  usSoa: string;
  compSoa: string;
  diff: string;
  usClass: "bad" | "mid";
  diffClass: "bad";
}

export interface CompPlatformRow {
  platform: string;
  compSoa: string;
  usSoa: string;
  usClass?: "bad" | "mid";
}

export interface CompAnswerItem {
  title: string;
  titleLink: CompLink;
  snippet: string;
  badge: string;
  badgeClass: "ok";
}

export interface CompetitorDetailData {
  id: string;
  name: string;
  marketClass: "overseas" | "domestic";
  marketLabel: string;
  status: string;
  callout: {
    strong: string;
    body: string;
    answerLink: CompLink;
  };
  kpis: CompKpi[];
  winRows: CompWinRow[];
  platformRows: CompPlatformRow[];
  latestAnswers: CompAnswerItem[];
}

const OPENROUTER: CompetitorDetailData = {
  id: "openrouter",
  name: "OpenRouter",
  marketClass: "overseas",
  marketLabel: "海外",
  status: "监测中 · 对标样本",
  callout: {
    strong: "品类词 Q00 强势占位",
    body: "「推荐两款 API 聚合平台」SOA 68%，我方 0%。",
    answerLink: { name: "geo-answer-detail" },
  },
  kpis: [
    { label: "竞品 SOA 7d", value: "52%", delta: "↑ 4pt", tone: "primary", deltaClass: "up" },
    { label: "超越我方题数", value: "4", delta: "共 10 启用题", tone: "neutral" },
    { label: "首推率", value: "38%", delta: "进正文且前列", tone: "neutral" },
    { label: "CCR", value: "12%", delta: "被引为信源", tone: "ccr" },
  ],
  winRows: [
    {
      question: "Q00 推荐两款 API…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
      usSoa: "0%",
      compSoa: "68%",
      diff: "-68",
      usClass: "bad",
      diffClass: "bad",
    },
    {
      question: "Q06 Trinity vs OpenRouter…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q06" } },
      usSoa: "28%",
      compSoa: "55%",
      diff: "-27",
      usClass: "mid",
      diffClass: "bad",
    },
    {
      question: "Q03 国内 OpenAI 兼容…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q03" } },
      usSoa: "22%",
      compSoa: "41%",
      diff: "-19",
      usClass: "mid",
      diffClass: "bad",
    },
  ],
  platformRows: [
    { platform: "豆包", compSoa: "72%", usSoa: "0%", usClass: "bad" },
    { platform: "ChatGPT", compSoa: "58%", usSoa: "15%", usClass: "mid" },
    { platform: "DeepSeek", compSoa: "35%", usSoa: "20%", usClass: "mid" },
  ],
  latestAnswers: [
    {
      title: "Q00 · 豆包 · 首推 OpenRouter",
      titleLink: { name: "geo-answer-detail" },
      snippet: "海外通用聚合首选…",
      badge: "进答案",
      badgeClass: "ok",
    },
  ],
};

const TOKENHUB: CompetitorDetailData = {
  id: "tokenhub",
  name: "TokenHub",
  marketClass: "domestic",
  marketLabel: "国内",
  status: "监测中",
  callout: {
    strong: "国内大厂网关",
    body: "Q00 豆包回答中位列第二推荐，SOA 52%，我方 0%。",
    answerLink: { name: "geo-answer-detail" },
  },
  kpis: [
    { label: "竞品 SOA 7d", value: "48%", delta: "↑ 2pt", tone: "primary", deltaClass: "up" },
    { label: "超越我方题数", value: "3", delta: "共 10 启用题", tone: "neutral" },
    { label: "首推率", value: "22%", delta: "进正文且前列", tone: "neutral" },
    { label: "CCR", value: "8%", delta: "被引为信源", tone: "ccr" },
  ],
  winRows: [
    {
      question: "Q00 推荐两款 API…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
      usSoa: "0%",
      compSoa: "52%",
      diff: "-52",
      usClass: "bad",
      diffClass: "bad",
    },
    {
      question: "Q06 Trinity vs OpenRouter…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q06" } },
      usSoa: "28%",
      compSoa: "45%",
      diff: "-17",
      usClass: "mid",
      diffClass: "bad",
    },
    {
      question: "Q03 国内 OpenAI 兼容…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q03" } },
      usSoa: "22%",
      compSoa: "58%",
      diff: "-36",
      usClass: "mid",
      diffClass: "bad",
    },
  ],
  platformRows: [
    { platform: "豆包", compSoa: "52%", usSoa: "0%", usClass: "bad" },
    { platform: "DeepSeek", compSoa: "41%", usSoa: "20%", usClass: "mid" },
    { platform: "ChatGPT", compSoa: "18%", usSoa: "15%" },
  ],
  latestAnswers: [
    {
      title: "Q00 · 豆包 · 第二推荐 TokenHub",
      titleLink: { name: "geo-answer-detail" },
      snippet: "国内大厂合规企业级聚合…",
      badge: "进答案",
      badgeClass: "ok",
    },
  ],
};

const LITELLM: CompetitorDetailData = {
  id: "litellm",
  name: "LiteLLM",
  marketClass: "overseas",
  marketLabel: "海外",
  status: "监测中 · 开源网关",
  callout: {
    strong: "开源网关备选",
    body: "Q00 中作为备选提及，SOA 18%，未进首推。",
    answerLink: { name: "geo-answer-detail" },
  },
  kpis: [
    { label: "竞品 SOA 7d", value: "18%", delta: "—", tone: "primary" },
    { label: "超越我方题数", value: "1", delta: "共 10 启用题", tone: "neutral" },
    { label: "首推率", value: "0%", delta: "未进首推", tone: "neutral" },
    { label: "CCR", value: "2%", delta: "被引为信源", tone: "ccr" },
  ],
  winRows: [
    {
      question: "Q00 推荐两款 API…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
      usSoa: "0%",
      compSoa: "18%",
      diff: "-18",
      usClass: "bad",
      diffClass: "bad",
    },
  ],
  platformRows: [
    { platform: "DeepSeek", compSoa: "22%", usSoa: "20%" },
    { platform: "ChatGPT", compSoa: "12%", usSoa: "15%" },
    { platform: "豆包", compSoa: "8%", usSoa: "0%", usClass: "bad" },
  ],
  latestAnswers: [
    {
      title: "Q00 · 豆包 · 备选 LiteLLM",
      titleLink: { name: "geo-answer-detail" },
      snippet: "开源网关自托管方案…",
      badge: "进答案",
      badgeClass: "ok",
    },
  ],
};

const SILICONFLOW: CompetitorDetailData = {
  id: "siliconflow",
  name: "硅基流动",
  marketClass: "domestic",
  marketLabel: "国内",
  status: "监测中",
  callout: {
    strong: "国产推理平台",
    body: "Q00 中备选提及，SOA 12%。",
    answerLink: { name: "geo-answer-detail" },
  },
  kpis: [
    { label: "竞品 SOA 7d", value: "12%", delta: "—", tone: "primary" },
    { label: "超越我方题数", value: "1", delta: "共 10 启用题", tone: "neutral" },
    { label: "首推率", value: "0%", delta: "未进首推", tone: "neutral" },
    { label: "CCR", value: "1%", delta: "被引为信源", tone: "ccr" },
  ],
  winRows: [
    {
      question: "Q00 推荐两款 API…",
      questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
      usSoa: "0%",
      compSoa: "12%",
      diff: "-12",
      usClass: "bad",
      diffClass: "bad",
    },
  ],
  platformRows: [
    { platform: "豆包", compSoa: "12%", usSoa: "0%", usClass: "bad" },
    { platform: "DeepSeek", compSoa: "8%", usSoa: "20%", usClass: "mid" },
  ],
  latestAnswers: [
    {
      title: "Q00 · 豆包 · 备选硅基流动",
      titleLink: { name: "geo-answer-detail" },
      snippet: "国产模型推理平台…",
      badge: "进答案",
      badgeClass: "ok",
    },
  ],
};

const COMPETITOR_MAP: Record<string, CompetitorDetailData> = {
  openrouter: OPENROUTER,
  tokenhub: TOKENHUB,
  litellm: LITELLM,
  siliconflow: SILICONFLOW,
};

export const DEFAULT_COMPETITOR_ID = "openrouter";

/** 按 query.id 取竞品详情；未配置时回退 openrouter */
export function getCompetitorDetail(id: string): CompetitorDetailData {
  const key = id?.toLowerCase() || DEFAULT_COMPETITOR_ID;
  return COMPETITOR_MAP[key] ?? { ...OPENROUTER, id: key, name: id || OPENROUTER.name };
}
