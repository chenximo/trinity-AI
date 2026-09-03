/** 控制台顶栏与 HTML 文件名 → 路由 name */

export interface ConsoleNavItem {
  to: { name: string };
  label: string;
  nav: string;
}

export const CONSOLE_NAV: ConsoleNavItem[] = [
  { to: { name: "geo-dashboard" }, label: "总览", nav: "dashboard" },
  { to: { name: "geo-citations" }, label: "引用", nav: "citations" },
  { to: { name: "geo-sentiment" }, label: "情感", nav: "sentiment" },
  { to: { name: "geo-monitoring" }, label: "监测", nav: "monitoring" },
  { to: { name: "geo-competitors" }, label: "竞品", nav: "competitors" },
  { to: { name: "geo-diagnosis" }, label: "诊断", nav: "diagnosis" },
  { to: { name: "geo-optimize" }, label: "优化", nav: "optimize" },
  { to: { name: "geo-reports" }, label: "报告", nav: "reports" },
  { to: { name: "geo-settings-brand" }, label: "设置", nav: "settings" },
];

/** marketing/console/*.html → 路由 name（页内 <a href="./xxx.html"> 拦截用） */
export const HTML_FILE_TO_ROUTE: Record<string, string> = {
  "dashboard.html": "geo-dashboard",
  "citations.html": "geo-citations",
  "sentiment.html": "geo-sentiment",
  "monitoring.html": "geo-monitoring",
  "monitoring-logs.html": "geo-monitoring",
  "keywords.html": "geo-keywords",
  "keyword-detail.html": "geo-keyword-detail",
  "answer-detail.html": "geo-answer-detail",
  "answer-detail-brand.html": "geo-answer-detail-brand",
  "competitors.html": "geo-competitors",
  "competitors-manage.html": "geo-competitors-manage",
  "competitor-detail.html": "geo-competitor-detail",
  "diagnosis.html": "geo-diagnosis",
  "audit.html": "geo-audit",
  "audit-reports.html": "geo-audit-reports",
  "optimize.html": "geo-optimize",
  "optimize-detail.html": "geo-optimize-detail",
  "verify.html": "geo-verify",
  "reports.html": "geo-reports",
  "report-preview.html": "geo-report-preview",
  "brand-settings.html": "geo-settings-brand",
  "settings-account.html": "geo-settings-account",
  "settings-notifications.html": "geo-settings-notifications",
};
