/** 报告预览 · Mock */

export interface ReportPreviewLink {
  name: string;
  hash?: string;
}

export interface ReportPreviewSection {
  heading: string;
  paragraphs?: string[];
  summaryStrong?: string;
  platforms?: { label: string; class: string }[];
  listItems?: { label: string; to: ReportPreviewLink }[];
}

export interface ReportPreviewData {
  id: string;
  title: string;
  period: string;
  meta: string;
  generatedAt: string;
  tier: string;
  soa: {
    global: { value: string; delta: string; deltaClass: "up" | "down" };
    china: { value: string; delta: string; deltaClass: "up" | "down" };
  };
  sections: ReportPreviewSection[];
  footer: string;
}

export const REPORT_PREVIEW: ReportPreviewData = {
  id: "2026-W24",
  title: "GEO 周报 · 2026-W24",
  period: "Trinity AI · 6/9 – 6/15 · 10 平台 · 10 启用问题",
  meta: "Trinity AI · 6/9 – 6/15 · 10 平台 · 10 启用问题",
  generatedAt: "2026-06-16 09:00",
  tier: "专业版",
  soa: {
    global: { value: "42%", delta: "↑ 6%", deltaClass: "up" },
    china: { value: "28%", delta: "↓ 3%", deltaClass: "down" },
  },
  sections: [
    {
      heading: "1. 执行摘要",
      paragraphs: [
        "本周全球 SOA 回升，主要受益于 ChatGPT / Claude 品类词提及；中国侧豆包仍缺席 Q00。已完成 doc 文档树首轮发布，",
        "，正文 SOA 尚未变化。",
      ],
      summaryStrong: "信源盘 0/16 → 1/17",
    },
    {
      heading: "2. 平台分布",
      platforms: [
        { label: "ChatGPT 48%", class: "p-overseas" },
        { label: "Claude 44%", class: "p-overseas" },
        { label: "Gemini 38%", class: "p-overseas" },
        { label: "豆包 0%", class: "p-domestic" },
        { label: "DeepSeek 22%", class: "p-domestic" },
      ],
    },
    {
      heading: "3. P0 诊断与优化",
      listItems: [
        { label: "Q00 品类失声 · D1+S1+S2+S3", to: { name: "geo-diagnosis", hash: "#diag-q00" } },
        { label: "进行中：doc 文档树对标 OpenRouter", to: { name: "geo-optimize", hash: "#opt-s1s2" } },
        { label: "验证：信源盘已改善，SOA 待观察", to: { name: "geo-verify", hash: "#verify-q00" } },
      ],
    },
    {
      heading: "4. 竞品快照",
      paragraphs: ["同题 SOA：OpenRouter 68% · TokenHub 52% · 我方 0%（Q00·豆包）"],
    },
  ],
  footer: "由 Trinity GEO 自动生成 · 数据截止 6/15 日采",
};
