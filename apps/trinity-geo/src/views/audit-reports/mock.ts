/** 审计报告 · Mock */

export interface AuditLink {
  name: string;
  hash?: string;
}

export interface AuditKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "neutral" | "warn";
  deltaLink?: AuditLink;
  valueStyle?: string;
  deltaClass?: "up";
}

export interface AuditReportRow {
  id: string;
  idLink?: AuditLink;
  scannedAt: string;
  scope: string;
  pageCount: number;
  avgScore: string;
  avgClass?: "mid";
  redCount: string;
  redClass?: "bad";
  detailLink: AuditLink;
}

export interface AuditSummaryRow {
  page: string;
  pageLink: AuditLink;
  score: string;
  scoreClass: "bad" | "mid";
  delta: string;
  deltaClass?: "up";
  action: string;
  actionLink?: AuditLink;
}

export interface DiagnosisNavItem {
  label: string;
  route: string;
}

export const DIAGNOSIS_NAV: DiagnosisNavItem[] = [
  { label: "诊断列表", route: "geo-diagnosis" },
  { label: "页面审计", route: "geo-audit" },
  { label: "审计报告", route: "geo-audit-reports" },
];

export const AUDIT_KPIS: AuditKpi[] = [
  { label: "历史报告", value: "4", delta: "近 90 日", tone: "primary" },
  {
    label: "最近扫描",
    value: "6/14 22:30",
    delta: "8 页 · 手动触发",
    tone: "neutral",
    valueStyle: "font-size: 1rem",
  },
  {
    label: "最新红灯",
    value: "2",
    delta: "doc/introduction 38",
    tone: "warn",
    deltaLink: { name: "geo-audit", hash: "#audit-doc-intro" },
  },
  {
    label: "均分趋势",
    value: "62",
    delta: "↑ 4 vs 5/28 基线",
    tone: "neutral",
    deltaClass: "up",
  },
];

export const AUDIT_REPORT_ROWS: AuditReportRow[] = [
  {
    id: "AR-20260614",
    idLink: { name: "geo-audit-reports", hash: "#rep-20260614" },
    scannedAt: "2026-06-14 22:30",
    scope: "官网 + doc 子域",
    pageCount: 8,
    avgScore: "62",
    redCount: "2",
    redClass: "bad",
    detailLink: { name: "geo-audit", hash: "#audit-doc-intro" },
  },
  {
    id: "AR-20260528",
    scannedAt: "2026-05-28 10:00",
    scope: "官网 + doc 子域",
    pageCount: 7,
    avgScore: "58",
    avgClass: "mid",
    redCount: "3",
    redClass: "bad",
    detailLink: { name: "geo-audit" },
  },
  {
    id: "AR-20260415",
    scannedAt: "2026-04-15 09:00",
    scope: "仅 doc 子域",
    pageCount: 5,
    avgScore: "55",
    avgClass: "mid",
    redCount: "2",
    redClass: "bad",
    detailLink: { name: "geo-audit" },
  },
  {
    id: "AR-20240301",
    scannedAt: "2026-03-01 09:00",
    scope: "官网首页",
    pageCount: 1,
    avgScore: "61",
    avgClass: "mid",
    redCount: "0",
    detailLink: { name: "geo-audit", hash: "#audit-product" },
  },
];

export const AUDIT_SUMMARY = {
  id: "rep-20260614",
  title: "报告摘要 · AR-20260614",
  desc: "与总览「证据密度 62 · 红灯 2」一致 · 关联 Q00 / opt-s1s2",
  badge: "待修复 11 项",
  badgeClass: "partial" as const,
  rows: [
    {
      page: "doc …/introduction",
      pageLink: { name: "geo-audit", hash: "#audit-doc-intro" },
      score: "38",
      scoreClass: "bad" as const,
      delta: "—",
      action: "opt-s1s2",
      actionLink: { name: "geo-optimize-detail", query: { id: "opt-s1s2" } },
    },
    {
      page: "/product",
      pageLink: { name: "geo-audit", hash: "#audit-product" },
      score: "58",
      scoreClass: "mid" as const,
      delta: "+3",
      deltaClass: "up" as const,
      action: "证据块补全",
    },
    {
      page: "/pricing",
      pageLink: { name: "geo-audit", hash: "#audit-pricing" },
      score: "74",
      scoreClass: "mid" as const,
      delta: "+6",
      deltaClass: "up" as const,
      action: "opt-d3 · Q01 CCR",
      actionLink: { name: "geo-optimize", hash: "#opt-d3" },
    },
    {
      page: "/about",
      pageLink: { name: "geo-audit", hash: "#audit-about" },
      score: "61",
      scoreClass: "mid" as const,
      delta: "—",
      action: "Schema 补全",
    },
  ] satisfies AuditSummaryRow[],
  verifyLinks: [
    { label: "Q00 信源盘", to: { name: "geo-verify", hash: "#verify-q00" } },
    { label: "Q01 CCR", to: { name: "geo-verify", hash: "#verify-q01" } },
  ],
};
