/** 报告列表 · Mock 与纯函数 */

export type ReportType = "weekly" | "monthly" | "verify";
export type ReportTypeFilter = "all" | ReportType;
export type ReportStatus = "ready" | "draft";

export interface RepLink {
  name: string;
  hash?: string;
}

export interface RepKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "neutral";
  valueSm?: boolean;
  deltaLink?: RepLink;
}

export interface RepSpotlight {
  id: string;
  filter: ReportType;
  status: ReportStatus;
  statusLabel: string;
  titleStrong: string;
  titleRest: string;
  fact: string;
  searchText: string;
  links: { label: string; to: RepLink }[];
}

export interface RepRow {
  id: string;
  type: ReportType;
  typeLabel: string;
  title: string;
  titleLink: RepLink;
  sub: string;
  period: string;
  status: ReportStatus;
  statusLabel: string;
  summaryHtml: string;
  searchText: string;
  featured?: boolean;
  actions: { label: string; to?: RepLink; muted?: boolean; title?: string }[];
}

export interface RepScheduleItem {
  label: string;
  detail: string;
  link?: RepLink;
  linkLabel?: string;
}

export const REP_TYPE_FILTERS: { id: ReportTypeFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "weekly", label: "周报" },
  { id: "monthly", label: "月报" },
  { id: "verify", label: "验收摘要" },
];

export const REP_STATUS_LABEL: Record<ReportStatus, string> = {
  ready: "已生成",
  draft: "草稿",
};

export const REP_KPIS: RepKpi[] = [
  {
    label: "本月已生成",
    value: "2",
    delta: "周报 + 月报草案",
    tone: "primary",
  },
  {
    label: "定时周报",
    value: "周一 09:00",
    delta: "配置 →",
    tone: "neutral",
    valueSm: true,
    deltaLink: { name: "geo-settings-notifications" },
  },
  {
    label: "上次发送",
    value: "6/10",
    delta: "3 位收件人",
    tone: "neutral",
    valueSm: true,
  },
  {
    label: "套餐",
    value: "专业版",
    delta: "用量 →",
    tone: "neutral",
    valueSm: true,
    deltaLink: { name: "geo-settings-account" },
  },
];

export const REP_SPOTLIGHT: RepSpotlight = {
  id: "rep-w24",
  filter: "weekly",
  status: "ready",
  statusLabel: "已生成",
  titleStrong: "W24",
  titleRest: "GEO 周报 · 6/9–6/15",
  fact: "全球 SOA 42% ↑6% · 中国 28% ↓3% · P0 诊断 3 条",
  searchText: "geo 周报 w24 2026 全球 soa 42 中国 28",
  links: [
    { label: "预览", to: { name: "geo-report-preview" } },
    { label: "总览对照", to: { name: "geo-dashboard" } },
  ],
};

export const REP_ROWS: RepRow[] = [
  {
    id: "rep-row-w24",
    type: "weekly",
    typeLabel: "周报",
    title: "GEO 周报",
    titleLink: { name: "geo-report-preview" },
    sub: "2026-W24",
    period: "6/9 – 6/15",
    status: "ready",
    statusLabel: "已生成",
    summaryHtml:
      '全球 SOA <strong>42%</strong> <span class="up">↑6%</span> · 中国 <strong>28%</strong> <span class="down">↓3%</span> · P0 ×3',
    searchText: "geo 周报 w24 2026 全球 soa 42 中国 28",
    featured: true,
    actions: [
      { label: "预览", to: { name: "geo-report-preview" } },
      { label: "PDF", muted: true, title: "商用" },
    ],
  },
  {
    id: "rep-row-monthly",
    type: "monthly",
    typeLabel: "月报",
    title: "GEO 月报",
    titleLink: { name: "geo-report-preview" },
    sub: "草案",
    period: "2026-06",
    status: "draft",
    statusLabel: "草稿",
    summaryHtml: "含 Q00 信源盘 0→1 验证注记",
    searchText: "月报 草案 2026-06 q00 信源",
    actions: [{ label: "预览", to: { name: "geo-report-preview" } }],
  },
  {
    id: "rep-row-verify",
    type: "verify",
    typeLabel: "验收",
    title: "优化验收摘要",
    titleLink: { name: "geo-verify", hash: "#verify-q00-detail" },
    sub: "Q00 · opt-s1s2",
    period: "R2 6/20",
    status: "ready",
    statusLabel: "已生成",
    summaryHtml: "信源 <strong>0/16→1/17</strong> · SOA 仍 0% · 先进盘",
    searchText: "验收摘要 q00 opt-s1s2 信源 soa",
    actions: [{ label: "验证", to: { name: "geo-verify", hash: "#verify-q00-detail" } }],
  },
];

export const REP_SCHEDULE_ITEMS: RepScheduleItem[] = [
  { label: "周报", detail: "每周一 09:00 · 收件人：市场负责人 + 2" },
  {
    label: "SOA 异动",
    detail: "即时邮件 · 阈值 −10% · ",
    link: { name: "geo-settings-notifications" },
    linkLabel: "修改",
  },
  { label: "试用到期", detail: "提前 3 天 · 账户邮箱" },
];

export const REP_TOTAL_COUNT = REP_ROWS.length;

export function filterRepRows(
  rows: RepRow[],
  typeFilter: ReportTypeFilter,
  query: string,
): RepRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchType = typeFilter === "all" || row.type === typeFilter;
    const matchQuery = !q || row.searchText.toLowerCase().includes(q);
    return matchType && matchQuery;
  });
}

export function spotlightMatches(
  spotlight: RepSpotlight,
  typeFilter: ReportTypeFilter,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  const matchType = typeFilter === "all" || typeFilter === spotlight.filter;
  const matchQuery = !q || spotlight.searchText.toLowerCase().includes(q);
  return matchType && matchQuery;
}
