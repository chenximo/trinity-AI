/** 页面审计 · Mock 数据与纯函数 */

import type { RouteLocationRaw } from "vue-router";

export type AuditLamp = "bad" | "mid" | "ok";
export type AuditLampFilter = "all" | "red" | "yellow" | "green";
export type AuditPageType = "doc" | "marketing" | "blog" | "brand";

export interface AuditFactor {
  name: string;
  score: string;
  level: "fail" | "warn" | "ok";
  note: string;
}

export interface AuditRec {
  pri: string;
  text: string;
  link?: RouteLocationRaw;
}

export interface AuditPageDetail {
  url: string;
  score: number;
  lamp: AuditLamp;
  scanned: string;
  summary: string;
  optimize: RouteLocationRaw;
  diag: RouteLocationRaw;
  factors: AuditFactor[];
  recs: AuditRec[];
}

export interface AuditRow {
  id: string;
  pathLabel: string;
  domain: string;
  type: string;
  pageType: AuditPageType;
  lamp: AuditLamp;
  search: string;
}

export const AUDIT_KPIS = [
  { label: "已审计页面", value: "8", delta: "官网 3 · 文档 5", tone: "neutral" },
  { label: "红灯页面", value: "2", delta: "证据分 < 50", tone: "warn" },
  { label: "证据密度均分", value: "62", delta: "与总览闭环卡一致", tone: "neutral" },
  {
    label: "待修复项",
    value: "11",
    delta: "优化待办 →",
    tone: "neutral",
    deltaLink: { name: "geo-optimize" } as RouteLocationRaw,
  },
] as const;

export const AUDIT_BENCHMARK_ROWS = [
  {
    url: "https://openrouter.ai/docs/",
    label: "openrouter.ai/docs",
    score: 86,
    schema: "有",
    note: "Q00 信源盘高频引用",
  },
  {
    url: "https://cloud.tencent.cn/document/product/1823",
    label: "TokenHub 文档",
    score: 81,
    schema: "有",
    note: "国内竞品 docs 结构",
  },
] as const;

export const AUDIT_PAGES: Record<string, AuditPageDetail> = {
  "audit-doc-intro": {
    url: "https://doc.trinitydesk.ai/docs/introduction",
    score: 38,
    lamp: "bad",
    scanned: "6/14 22:30",
    summary:
      "首屏核心定义依赖客户端渲染；正文缺少可独立引用的「事实块」；无 Article / TechArticle JSON-LD。与 Q00 信源盘「我方域 0 命中」一致。",
    optimize: { name: "geo-optimize-detail" },
    diag: { name: "geo-diagnosis", hash: "#diag-q00" },
    factors: [
      { name: "证据密度", score: "22", level: "fail", note: "首 200 字无品类定义；缺量化事实" },
      { name: "可抓取性", score: "35", level: "fail", note: "无 JS 时正文为空壳；meta 过短" },
      { name: "Schema.org", score: "0", level: "warn", note: "未检测到 JSON-LD" },
      { name: "结构语义", score: "55", level: "warn", note: "H2 层级跳跃" },
      { name: "时效信号", score: "72", level: "ok", note: "页脚有更新日期" },
    ],
    recs: [
      { pri: "P0", text: "首段增加 3 条可引用事实句", link: { name: "geo-optimize-detail" } },
      { pri: "P0", text: "SSR / 预渲染核心正文" },
      { pri: "P1", text: "添加 TechArticle JSON-LD" },
    ],
  },
  "audit-developers": {
    url: "https://doc.trinitydesk.ai/docs/developers",
    score: 44,
    lamp: "bad",
    scanned: "6/14 22:28",
    summary: "开发者入口页以导航卡片为主，缺少独立定义段落；内链多但外链引用块不足。",
    optimize: { name: "geo-optimize-detail" },
    diag: { name: "geo-diagnosis", hash: "#diag-q00" },
    factors: [
      { name: "证据密度", score: "30", level: "fail", note: "无 standalone 定义句" },
      { name: "可抓取性", score: "48", level: "warn", note: "部分区块 CSR" },
      { name: "Schema.org", score: "10", level: "warn", note: "仅 WebSite" },
      { name: "结构语义", score: "58", level: "warn", note: "卡片列表非语义列表" },
      { name: "时效信号", score: "65", level: "ok", note: "无版本号" },
    ],
    recs: [
      { pri: "P0", text: "增加「什么是 Trinity API 网关」事实块" },
      { pri: "P1", text: "对标 OpenRouter Getting Started IA" },
    ],
  },
  "audit-quickstart": {
    url: "https://doc.trinitydesk.ai/docs/quickstart",
    score: 52,
    lamp: "mid",
    scanned: "6/14 22:25",
    summary: "步骤清晰但代码块多、 prose 少；缺少计费与模型列表等可引用事实。",
    optimize: { name: "geo-optimize-detail" },
    diag: { name: "geo-diagnosis" },
    factors: [
      { name: "证据密度", score: "48", level: "warn", note: "步骤为主，事实句偏少" },
      { name: "可抓取性", score: "62", level: "warn", note: "正文 SSR 尚可" },
      { name: "Schema.org", score: "20", level: "warn", note: "无 HowTo" },
      { name: "结构语义", score: "70", level: "ok", note: "标题层级正常" },
      { name: "时效信号", score: "60", level: "ok", note: "—" },
    ],
    recs: [{ pri: "P1", text: "文末增加 FAQ + 量化能力表" }],
  },
  "audit-product": {
    url: "https://trinitydesk.ai/product",
    score: 58,
    lamp: "mid",
    scanned: "6/13 18:00",
    summary: "营销话术多、可引用事实少；对比表为图片非文本。",
    optimize: { name: "geo-optimize" },
    diag: { name: "geo-diagnosis" },
    factors: [
      { name: "证据密度", score: "45", level: "warn", note: "缺模型数、计费口径" },
      { name: "可抓取性", score: "72", level: "ok", note: "静态 HTML 可读" },
      { name: "Schema.org", score: "30", level: "warn", note: "无 Product" },
      { name: "结构语义", score: "68", level: "ok", note: "—" },
      { name: "时效信号", score: "55", level: "warn", note: "无更新日期" },
    ],
    recs: [{ pri: "P1", text: "增加文本对比表与定价锚点" }],
  },
  "audit-about": {
    url: "https://trinitydesk.ai/about",
    score: 61,
    lamp: "mid",
    scanned: "6/13 18:00",
    summary: "品牌叙事完整，但缺少第三方可核验数据点。",
    optimize: { name: "geo-optimize" },
    diag: { name: "geo-diagnosis" },
    factors: [
      { name: "证据密度", score: "55", level: "warn", note: "叙事多、事实少" },
      { name: "可抓取性", score: "78", level: "ok", note: "—" },
      { name: "Schema.org", score: "40", level: "warn", note: "无 Organization" },
      { name: "结构语义", score: "72", level: "ok", note: "—" },
      { name: "时效信号", score: "50", level: "warn", note: "—" },
    ],
    recs: [{ pri: "P2", text: "补充 Organization JSON-LD" }],
  },
  "audit-api-ref": {
    url: "https://doc.trinitydesk.ai/docs/api-reference",
    score: 55,
    lamp: "mid",
    scanned: "6/14 22:20",
    summary: "API 列表完整但参数说明偏简；缺少总览性定义段。",
    optimize: { name: "geo-optimize-detail" },
    diag: { name: "geo-diagnosis" },
    factors: [
      { name: "证据密度", score: "50", level: "warn", note: "缺端点总览事实块" },
      { name: "可抓取性", score: "58", level: "warn", note: "Tab 切换藏内容" },
      { name: "Schema.org", score: "15", level: "warn", note: "—" },
      { name: "结构语义", score: "62", level: "warn", note: "—" },
      { name: "时效信号", score: "70", level: "ok", note: "—" },
    ],
    recs: [{ pri: "P1", text: "增加 OpenAPI 摘要段落在首屏" }],
  },
  "audit-changelog": {
    url: "https://trinitydesk.ai/blog/changelog",
    score: 71,
    lamp: "ok",
    scanned: "6/12 10:00",
    summary: "时效信号强；条目短、适合引用版本事实。",
    optimize: { name: "geo-optimize" },
    diag: { name: "geo-diagnosis" },
    factors: [
      { name: "证据密度", score: "68", level: "ok", note: "版本事实清晰" },
      { name: "可抓取性", score: "80", level: "ok", note: "—" },
      { name: "Schema.org", score: "55", level: "warn", note: "无 BlogPosting" },
      { name: "结构语义", score: "75", level: "ok", note: "—" },
      { name: "时效信号", score: "88", level: "ok", note: "更新频繁" },
    ],
    recs: [{ pri: "P2", text: "保持 changelog 与 docs 交叉链" }],
  },
  "audit-pricing": {
    url: "https://trinitydesk.ai/pricing",
    score: 74,
    lamp: "ok",
    scanned: "6/13 18:00",
    summary: "价格表文本化良好；可补充模型单价示例句。",
    optimize: { name: "geo-optimize" },
    diag: { name: "geo-diagnosis" },
    factors: [
      { name: "证据密度", score: "72", level: "ok", note: "价格数字可引用" },
      { name: "可抓取性", score: "82", level: "ok", note: "—" },
      { name: "Schema.org", score: "45", level: "warn", note: "无 Offer" },
      { name: "结构语义", score: "78", level: "ok", note: "表格语义正确" },
      { name: "时效信号", score: "70", level: "ok", note: "—" },
    ],
    recs: [{ pri: "P2", text: "增加 FAQ 定价说明块" }],
  },
};

export const AUDIT_ROWS: AuditRow[] = [
  {
    id: "audit-doc-intro",
    pathLabel: "…/introduction",
    domain: "doc.trinitydesk.ai",
    type: "文档",
    pageType: "doc",
    lamp: "bad",
    search: "introduction doc.trinitydesk.ai 文档",
  },
  {
    id: "audit-developers",
    pathLabel: "…/developers",
    domain: "doc.trinitydesk.ai",
    type: "文档",
    pageType: "doc",
    lamp: "bad",
    search: "developers doc api",
  },
  {
    id: "audit-quickstart",
    pathLabel: "…/quickstart",
    domain: "doc.trinitydesk.ai",
    type: "文档",
    pageType: "doc",
    lamp: "mid",
    search: "quickstart 快速开始",
  },
  {
    id: "audit-product",
    pathLabel: "/product",
    domain: "trinitydesk.ai",
    type: "产品",
    pageType: "marketing",
    lamp: "mid",
    search: "product trinitydesk",
  },
  {
    id: "audit-about",
    pathLabel: "/about",
    domain: "trinitydesk.ai",
    type: "品牌",
    pageType: "marketing",
    lamp: "mid",
    search: "about 品牌",
  },
  {
    id: "audit-api-ref",
    pathLabel: "…/api-reference",
    domain: "doc.trinitydesk.ai",
    type: "文档",
    pageType: "doc",
    lamp: "mid",
    search: "api reference 参考",
  },
  {
    id: "audit-changelog",
    pathLabel: "/blog/changelog",
    domain: "trinitydesk.ai",
    type: "博客",
    pageType: "blog",
    lamp: "ok",
    search: "changelog 博客",
  },
  {
    id: "audit-pricing",
    pathLabel: "/pricing",
    domain: "trinitydesk.ai",
    type: "定价",
    pageType: "marketing",
    lamp: "ok",
    search: "pricing 定价",
  },
];

export const LAMP_FILTER_OPTIONS: { value: AuditLampFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "red", label: "红灯" },
  { value: "yellow", label: "黄灯" },
  { value: "green", label: "绿灯" },
];

export function lampToFilter(lamp: AuditLamp): "red" | "yellow" | "green" {
  if (lamp === "bad") return "red";
  if (lamp === "mid") return "yellow";
  return "green";
}

export function scoreClass(lamp: AuditLamp): string {
  if (lamp === "bad") return "bad";
  if (lamp === "mid") return "mid";
  return "ok";
}

export function lampLabel(lamp: AuditLamp): string {
  if (lamp === "bad") return "红灯";
  if (lamp === "mid") return "黄灯";
  return "绿灯";
}

export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}
