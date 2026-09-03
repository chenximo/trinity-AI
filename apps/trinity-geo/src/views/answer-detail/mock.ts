/** 回答详情 · Mock 与纯函数 */

export interface AnswerDetailLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface AnswerBodySection {
  heading: string;
  level: 3 | 4;
  paragraphs: string[];
  strong?: string;
}

export interface CiteLink {
  href: string;
  label: string;
  note?: string;
}

export interface CiteGroup {
  tag: "competitor" | "third" | "us-miss";
  tagLabel: string;
  title: string;
  links?: CiteLink[];
  missingNote?: string;
  missing?: boolean;
}

export interface AnnotationField {
  label: string;
  value: string;
  tone?: "bad" | "good";
}

export interface CompetitorHit {
  name: string;
  detail?: AnswerDetailLink;
  note: string;
}

export interface AnswerDetailData {
  id: string;
  questionId: string;
  title: string;
  platform: string;
  platformClass: string;
  meta: string;
  bodySections: AnswerBodySection[];
  bodyHint: string;
  citeBadge: string;
  citeBadgeTone: "danger" | "ok";
  citeGroups: CiteGroup[];
  annotation: AnnotationField[];
  citeGap: {
    text: string;
    link: AnswerDetailLink;
  };
  competitorHits: CompetitorHit[];
  ccrSample: {
    text: string;
    citationsLink: AnswerDetailLink;
    brandSampleLink: AnswerDetailLink;
  };
  diagnosis: {
    text: string;
    link: AnswerDetailLink;
  };
  metadata: { label: string; value: string; code?: boolean }[];
}

const Q00_DOUBAO: AnswerDetailData = {
  id: "Q00-doubao",
  questionId: "Q00",
  title: "推荐两款 API 聚合平台",
  platform: "豆包",
  platformClass: "p-domestic",
  meta: "豆包 App 实测 · R1 · 2026-06-16 16:46",
  bodySections: [
    {
      heading: "两款主流 API 聚合平台完整推荐 + 全部参考来源链接",
      level: 3,
      paragraphs: [],
    },
    {
      heading: "一、OpenRouter（海外全球通用商用聚合平台）",
      level: 4,
      paragraphs: [
        "全球头部 LLM 统一 API 网关，原生兼容 OpenAI 协议，聚合 400+ 大模型，适合海外开发者、AI 产品原型与 Cursor 等客户端接入。",
      ],
    },
    {
      heading: "二、腾讯云 TokenHub（国内大厂合规企业级聚合网关）",
      level: 4,
      paragraphs: [
        "腾讯云官方大模型统一聚合网关，境内节点、OpenAI 标准协议，聚合混元、DeepSeek、GLM、Kimi 等国产模型，适配政企与 AI SaaS 商用场景。",
      ],
    },
    {
      heading: "三、推荐结论的行业评测依据",
      level: 4,
      paragraphs: [
        "回答明确写出：推荐结论基于平台官方文档 + 行业第三方实测评测双重交叉验证，并附全部可核验链接。",
      ],
      strong: "平台官方文档 + 行业第三方实测评测",
    },
  ],
  bodyHint: "正文摘要 · 完整依据见下方「参考来源」· 样本数据 mvp/data/r1/cited_sources.json",
  citeBadge: "我方域 0 / 16",
  citeBadgeTone: "danger",
  citeGroups: [
    {
      tag: "competitor",
      tagLabel: "竞品官方",
      title: "OpenRouter · 6 链",
      links: [
        { href: "https://openrouter.ai/", label: "openrouter.ai", note: "官网" },
        { href: "https://openrouter.ai/enterprise", label: "openrouter.ai/enterprise" },
        { href: "https://openrouter.ai/docs/", label: "openrouter.ai/docs", note: "开发文档" },
        { href: "https://openrouter.ai/models", label: "openrouter.ai/models" },
        { href: "https://openrouter.ai/api", label: "openrouter.ai/api" },
        { href: "https://openrouter.ai/terms", label: "openrouter.ai/terms" },
      ],
    },
    {
      tag: "competitor",
      tagLabel: "竞品官方",
      title: "腾讯云 TokenHub · 5 链",
      links: [
        { href: "https://cloud.tencent.com.cn/product/tokenhub", label: "cloud.tencent.com.cn/product/tokenhub" },
        { href: "https://cloud.tencent.cn/document/product/1823", label: "文档中心 product/1823" },
        { href: "https://console.cloud.tencent.com/tokenhub/", label: "控制台入口" },
        { href: "https://cloud.tencent.cn/document/product/1823/130660", label: "OpenAI 兼容接口指南" },
        { href: "https://cloud.tencent.com/developer/article/2675028", label: "腾讯云开发者社区文章" },
      ],
    },
    {
      tag: "third",
      tagLabel: "第三方评测",
      title: "行业横向对比 · 5 链",
      links: [
        { href: "https://segmentfault.com/a/1190000047675459", label: "SegmentFault · 七大聚合平台实测" },
        { href: "https://tech.ifeng.com/c/8rNIr0ld4HY", label: "凤凰网科技 · 全球 API 聚合评测" },
        { href: "https://segmentfault.com/a/1190000047770975", label: "SegmentFault · 九大平台排名" },
        { href: "http://caijing.iqilu.com/cjzx/2026/0603/5919150.shtml", label: "齐鲁网 · 选型指南" },
        { href: "https://blog.csdn.net/2601_96269683/article/details/162058087", label: "CSDN · 企业级中转对比" },
      ],
    },
    {
      tag: "us-miss",
      tagLabel: "我方缺失",
      title: "trinitydesk.ai / doc.trinitydesk.ai · 0 链",
      missing: true,
      missingNote:
        "推荐叙事完全由竞品官方文档 + 公域评测文章支撑；我方无任何页面进入本题参考盘。",
    },
  ],
  annotation: [
    { label: "品牌提及", value: "否", tone: "bad" },
    { label: "进答案正文 (SOA)", value: "否", tone: "bad" },
    { label: "提及位置", value: "—" },
    { label: "被引为信源 (CCR)", value: "否 · 我方域未出现", tone: "bad" },
    { label: "参考链接数", value: "16" },
    { label: "我方域命中", value: "0 / 16", tone: "bad" },
    { label: "情感", value: "—" },
  ],
  citeGap: {
    text: "16 条参考链接均为 OpenRouter / TokenHub 官方文档或 SegmentFault、凤凰网、CSDN 等第三方评测，无 trinitydesk 域。",
    link: { name: "geo-diagnosis", hash: "#diag-q00" },
  },
  competitorHits: [
    { name: "OpenRouter", detail: { name: "geo-competitor-detail" }, note: "进正文 · 首推" },
    { name: "TokenHub", detail: { name: "geo-competitor-detail" }, note: "进正文 · 前列" },
    { name: "LiteLLM", note: "备选提及" },
    { name: "One API", note: "备选提及" },
    { name: "硅基流动", note: "备选提及" },
    { name: "Portkey", note: "备选提及" },
  ],
  ccrSample: {
    text: "本题 CCR 否（品类失声）。查看「被引为信源」→",
    citationsLink: { name: "geo-citations" },
    brandSampleLink: { name: "geo-answer-detail-brand" },
  },
  diagnosis: {
    text: "D1 品类失声 + S1+S2+S3 — 正文未提及我方；16 条参考链接均为竞品官方与第三方评测，无 trinitydesk 域。",
    link: { name: "geo-optimize", hash: "#opt-s1s2" },
  },
  metadata: [
    { label: "question_id", value: "Q00", code: true },
    { label: "channel", value: "doubao-app-manual", code: true },
    { label: "round", value: "R1" },
  ],
};

/** 按采集 id 取回答详情；未配置时回退 Q00 豆包 */
export function getAnswerDetail(id: string): AnswerDetailData {
  if (!id || id === "Q00-doubao") return Q00_DOUBAO;
  const qMatch = id.match(/^(Q\d+)/i);
  const questionId = qMatch?.[1]?.toUpperCase() ?? "Q00";
  return {
    ...Q00_DOUBAO,
    id,
    questionId,
    meta: `${id} · 样本占位 · R1`,
  };
}
