/** 控制台顶栏导航 */

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
