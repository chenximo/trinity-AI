/** 优化待办 · Mock 与纯函数 */

import type { DiagRule } from "../diagnosis/mock";

export type OptStatus = "doing" | "todo" | "done";
export type OptStatusFilter = "all" | OptStatus;

export interface OptLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface OptKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "neutral";
  valueSm?: boolean;
  deltaLink?: OptLink;
}

export interface OptSpotlight {
  id: string;
  status: OptStatus;
  rule: DiagRule;
  gaps: string[];
  title: string;
  fact: string;
  links: { label: string; to: OptLink }[];
}

export interface OptAction {
  label: string;
  to: OptLink;
}

export interface OptimizeRow {
  rowId?: string;
  status: OptStatus;
  rule: DiagRule;
  gaps?: string[];
  title: string;
  titleLink?: OptLink;
  subtitle: string;
  targetId: string;
  targetLink: OptLink;
  due: string;
  actions: OptAction[];
  searchText: string;
  rowClass?: string;
}

export interface OptMapRow {
  symptomHtml: string;
  actionType: string;
  benchmark: string;
  benchmarkLink?: OptLink;
}

export const OPT_STATUS_FILTERS: { id: OptStatusFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "doing", label: "进行中" },
  { id: "todo", label: "待办" },
  { id: "done", label: "已完成" },
];

export const OPT_KPIS: OptKpi[] = [
  { label: "进行中", value: "2", delta: "Q00 文档 + Q06 对比", tone: "primary" },
  { label: "待办", value: "2", delta: "S3 评测 + D3 证据", tone: "neutral" },
  {
    label: "已完成",
    value: "1",
    delta: "待 R2 验证 →",
    tone: "neutral",
    deltaLink: { name: "geo-verify" },
  },
  {
    label: "预期 SOA 提升",
    value: "品类 +8~15%",
    delta: "历史同类动作",
    tone: "neutral",
    valueSm: true,
  },
];

export const OPT_SPOTLIGHT: OptSpotlight = {
  id: "opt-s1s2",
  status: "doing",
  rule: "d1",
  gaps: ["S1", "S2"],
  title: "Q00 官方文档树",
  fact: "对标 OpenRouter docs · 信源 0/16",
  links: [
    { label: "任务详情", to: { name: "geo-optimize-detail" } },
    { label: "信源盘", to: { name: "geo-answer-detail", hash: "#cite-heading" } },
  ],
};

export const OPTIMIZE_ROWS: OptimizeRow[] = [
  {
    rowId: "opt-row-s1s2",
    status: "doing",
    rule: "d1",
    gaps: ["S1", "S2"],
    title: "doc 建「API 聚合选型」文档树",
    titleLink: { name: "geo-optimize-detail" },
    subtitle: "对标竞品 /docs · 内容负责",
    targetId: "Q00",
    targetLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    due: "6/18",
    actions: [
      { label: "详情", to: { name: "geo-optimize-detail" } },
      { label: "验证", to: { name: "geo-verify", hash: "#verify-q00" } },
    ],
    searchText: "q00 d1 s1 s2 文档 官方 doc openrouter",
    rowClass: "geo-opt-row-p0",
  },
  {
    rowId: "opt-row-s3",
    status: "todo",
    rule: "d1",
    gaps: ["S3"],
    title: "公域评测叙事渗透",
    subtitle: "SegmentFault / CSDN 横向文",
    targetId: "Q00",
    targetLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    due: "—",
    actions: [{ label: "诊断", to: { name: "geo-diagnosis", hash: "#diag-q00" } }],
    searchText: "q00 s3 评测 segmentfault 公域",
  },
  {
    rowId: "opt-row-d4",
    status: "doing",
    rule: "d4",
    title: "vs OpenRouter 对比表",
    subtitle: "国内线路 / 计费 / 模型数",
    targetId: "Q06",
    targetLink: { name: "geo-keyword-detail", query: { q: "Q06" } },
    due: "6/22",
    actions: [{ label: "诊断", to: { name: "geo-diagnosis" } }],
    searchText: "q06 d4 openrouter 对比",
  },
  {
    rowId: "opt-row-d3",
    status: "todo",
    rule: "d3",
    title: "核心事实前移首段",
    subtitle: "trinitydesk.ai 关于页",
    targetId: "Q02",
    targetLink: { name: "geo-keyword-detail", query: { q: "Q02" } },
    due: "—",
    actions: [{ label: "诊断", to: { name: "geo-diagnosis" } }],
    searchText: "q02 d3 弱提及 首段",
  },
  {
    rowId: "opt-row-d2",
    status: "done",
    rule: "d2",
    title: "统一 Trinity AI / Desk 别名",
    subtitle: "已发布 6/10 · 待 R2",
    targetId: "Q01",
    targetLink: { name: "geo-answer-detail-brand" },
    due: "6/10",
    actions: [
      { label: "别名", to: { name: "geo-settings-brand" } },
      { label: "验证", to: { name: "geo-verify" } },
    ],
    searchText: "d2 别名 about trinity",
  },
];

export const OPT_MAP_ROWS: OptMapRow[] = [
  {
    symptomHtml: "D1 + S1S2",
    actionType: "官方文档树",
    benchmark: "doc 选型页 · openrouter.ai/docs",
  },
  {
    symptomHtml: "D1 + S3",
    actionType: "运营渗透",
    benchmark: "第三方横向评测文结构",
  },
  { symptomHtml: "D4", actionType: "对比块", benchmark: "vs OpenRouter 表" },
  { symptomHtml: "D3", actionType: "证据前置", benchmark: "首段核心事实" },
  {
    symptomHtml: "D2",
    actionType: "别名 / About",
    benchmark: "品牌设置",
    benchmarkLink: { name: "geo-settings-brand" },
  },
];

export const OPT_ITEM_COUNT = OPTIMIZE_ROWS.length;

export function statusLabel(status: OptStatus): string {
  const map: Record<OptStatus, string> = {
    doing: "进行中",
    todo: "待办",
    done: "已完成",
  };
  return map[status];
}

export function filterOptimizeRows(
  rows: OptimizeRow[],
  statusFilter: OptStatusFilter,
  query: string,
): OptimizeRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchStatus = statusFilter === "all" || row.status === statusFilter;
    const matchQuery = !q || row.searchText.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });
}

/** 与原型 optimize.js 一致：#opt-d4 → #opt-row-d4 */
export function resolveHashTargetId(hash: string): string | null {
  const id = hash.replace(/^#/, "");
  if (!id) return null;
  if (document.getElementById(id)) return id;
  if (id.startsWith("opt-row-")) return null;
  if (id.startsWith("opt-")) return `opt-row-${id.slice(4)}`;
  return null;
}
