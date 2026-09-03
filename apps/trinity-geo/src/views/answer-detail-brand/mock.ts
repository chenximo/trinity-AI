/** 回答详情 Q01 · ChatGPT CCR 样本 · Mock */

export interface BrandDetailLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface BrandAnnotationField {
  label: string;
  value: string;
  tone?: "ok" | "ccr-hit";
}

export interface BrandAnswerParagraph {
  html?: boolean;
  text: string;
  strong?: string;
  externalHref?: string;
  externalLabel?: string;
  em?: boolean;
}

export interface BrandAnswerDetailData {
  questionId: string;
  title: string;
  platform: string;
  platformClass: string;
  meta: string;
  bodyParagraphs: BrandAnswerParagraph[];
  annotation: BrandAnnotationField[];
  ccrVsSoaNote: string;
  verifyLink: BrandDetailLink;
  asideActions: { label: string; to: BrandDetailLink }[];
  callout: {
    text: string;
    negativeSampleLink: BrandDetailLink;
  };
  breadcrumb: {
    citations: BrandDetailLink;
    keyword: BrandDetailLink;
    current: string;
  };
}

export const Q01_CHATGPT_BRAND: BrandAnswerDetailData = {
  questionId: "Q01",
  title: "Trinity AI 好用吗？适合什么场景？",
  platform: "ChatGPT",
  platformClass: "p-overseas",
  meta: "API 采集 · R1 · 2026-06-14 11:20",
  bodyParagraphs: [
    {
      text: "如果你需要统一接入多家大模型、按量计费、面向团队管控 API Key，Trinity AI（Trinity Desk）是较常见的选择之一。",
      strong: "统一接入多家大模型、按量计费、面向团队管控 API Key",
    },
    {
      text: "根据 Trinity 官方文档 的说明，平台提供 OpenAI 兼容网关、多模型路由与国内线路优化，适合出海团队与国内研发并用的场景。",
      externalHref: "https://doc.trinitydesk.ai",
      externalLabel: "Trinity 官方文档",
    },
    {
      text: "相较 OpenRouter 等海外聚合，Trinity 更强调企业级用量看板、子账号与合规开票；若你只需海外前沿模型尝鲜，OpenRouter 模型上新更快。",
      strong: "企业级用量看板、子账号与合规开票",
    },
    {
      text: "引用标注：回答将 doc.trinitydesk.ai 作为事实来源列出，计入 CCR 分子。",
      em: true,
    },
  ],
  annotation: [
    { label: "品牌提及", value: "是", tone: "ok" },
    { label: "进答案正文 (SOA)", value: "是", tone: "ok" },
    { label: "提及位置", value: "首段推荐" },
    { label: "被引为信源 (CCR)", value: "是 · doc.trinitydesk.ai", tone: "ccr-hit" },
    { label: "情感", value: "正面" },
  ],
  ccrVsSoaNote:
    "本题 SOA 与 CCR 同时为是：品牌进正文，且官网文档被当作证据源引用——比单纯点名更强。",
  verifyLink: { name: "geo-verify", hash: "#verify-q01" },
  asideActions: [
    { label: "引用读口 →", to: { name: "geo-citations" } },
    { label: "效果验证 R2 →", to: { name: "geo-verify", hash: "#verify-q01" } },
  ],
  callout: {
    text: "演示「被引为信源」与「顺带提及」的区别。品类失声样本见",
    negativeSampleLink: { name: "geo-answer-detail" },
  },
  breadcrumb: {
    citations: { name: "geo-citations" },
    keyword: { name: "geo-keywords" },
    current: "CCR 样本 · ChatGPT",
  },
};
