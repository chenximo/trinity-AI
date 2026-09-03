/** 优化任务详情 · Mock 与纯函数 */

export type OptDetailStatus = "doing" | "todo" | "done";

export interface OptDetailLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface OptDetailKpi {
  label: string;
  value: string;
  delta: string;
  deltaLink?: OptDetailLink;
  externalHref?: string;
}

export interface ChecklistItem {
  text: string;
  state?: "done" | "doing";
}

export interface OptDetailData {
  id: string;
  status: OptDetailStatus;
  title: string;
  ruleLabel: string;
  targetId: string;
  targetLink: OptDetailLink;
  owner: string;
  due: string;
  calloutLinks: { label: string; to: OptDetailLink }[];
  kpis: OptDetailKpi[];
  description: string;
  basisLinks: { label: string; to?: OptDetailLink; href?: string }[];
  checklist: ChecklistItem[];
  acceptance: { text: string; link?: OptDetailLink }[];
}

const OPT_S1S2: OptDetailData = {
  id: "opt-s1s2",
  status: "doing",
  title: "doc 建「API 聚合选型」官方文档树",
  ruleLabel: "D1 · S1+S2",
  targetId: "Q00",
  targetLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
  owner: "内容",
  due: "6/18",
  calloutLinks: [
    { label: "诊断 D1+S1+S2", to: { name: "geo-diagnosis", hash: "#diag-q00" } },
    { label: "R2 验证", to: { name: "geo-verify", hash: "#verify-q00" } },
  ],
  kpis: [
    {
      label: "关联诊断",
      value: "D1+S1+S2",
      delta: "查看 →",
      deltaLink: { name: "geo-diagnosis", hash: "#diag-q00" },
    },
    {
      label: "信源盘（R1→R2）",
      value: "0/16 → 1/17",
      delta: "验证 →",
      deltaLink: { name: "geo-verify", hash: "#verify-q00" },
    },
    {
      label: "SOA（豆包·Q00）",
      value: "0%",
      delta: "待下一轮日采",
    },
    {
      label: "对标",
      value: "OpenRouter docs",
      delta: "打开 →",
      externalHref: "https://openrouter.ai/docs/",
    },
  ],
  description:
    "在 doc.trinitydesk.ai 建立与竞品对标的官方文档树：首段定义品类、模型列表、OpenAI 兼容说明、计费事实。解决 Q00 答案中信源盘仅第三方评测、无官方文档被引用的问题。",
  basisLinks: [
    { label: "Q00 信源盘 0/16", to: { name: "geo-answer-detail", hash: "#cite-heading" } },
    { label: "openrouter.ai/docs", href: "https://openrouter.ai/docs/" },
    { label: "TokenHub 文档中心", href: "https://cloud.tencent.cn/document/product/1823" },
  ],
  checklist: [
    { text: "确定文档 IA：入门 / 模型 / 计费 / 兼容 API", state: "done" },
    { text: "发布首篇「什么是 API 聚合平台」定义文", state: "done" },
    { text: "模型列表页 + OpenAI 兼容端点说明", state: "doing" },
    { text: "计费事实表（与官网 pricing 一致）" },
    { text: "提交 sitemap / 站内互链至产品页" },
  ],
  acceptance: [
    { text: "信源盘：至少 1 条官方 doc 域名被 AI 答案引用" },
    { text: "SOA：豆包 Q00 出现品牌名（中长期）" },
    { text: "记录：", link: { name: "geo-verify", hash: "#verify-q00" } },
  ],
};

export function getOptimizeDetail(id: string): OptDetailData {
  if (!id || id === "opt-s1s2" || id === "s1s2") return OPT_S1S2;
  return {
    ...OPT_S1S2,
    id,
    title: `优化任务 · ${id}`,
    status: "todo",
  };
}

export function statusLabel(status: OptDetailStatus): string {
  const map: Record<OptDetailStatus, string> = {
    doing: "进行中",
    todo: "待办",
    done: "已完成",
  };
  return map[status];
}
