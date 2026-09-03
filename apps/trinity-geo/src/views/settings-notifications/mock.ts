/** 通知与告警 · Mock */

export interface NotifyLink {
  name: string;
  hash?: string;
}

export interface NotifyItem {
  id: string;
  title: string;
  desc: string;
  defaultEnabled: boolean;
  descLink?: { label: string; to: NotifyLink };
}

export interface SettingsNavItem {
  label: string;
  route: string;
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  { label: "品牌设置", route: "geo-settings-brand" },
  { label: "账户与套餐", route: "geo-settings-account" },
  { label: "通知与告警", route: "geo-settings-notifications" },
];

export const NOTIFY_ITEMS: NotifyItem[] = [
  {
    id: "soa-drop",
    title: "SOA 周环比下降",
    desc: "单品牌全球 SOA 较上周下降 ≥ 10%",
    defaultEnabled: true,
  },
  {
    id: "competitor-new",
    title: "竞品新覆盖",
    desc: "竞品在任一平台首次出现在监测问题答案中",
    defaultEnabled: true,
  },
  {
    id: "collect-fail",
    title: "采集失败",
    desc: "连续 2 次日采失败时提醒",
    defaultEnabled: true,
  },
  {
    id: "weekly-report",
    title: "GEO 周报",
    desc: "每周一 09:00 自动发送 ·",
    defaultEnabled: true,
    descLink: { label: "报告列表", to: { name: "geo-reports" } },
  },
  {
    id: "trial-expire",
    title: "试用即将到期",
    desc: "到期前 3 天、1 天各提醒一次",
    defaultEnabled: true,
  },
];

export const CALLOUT_LINKS = {
  reports: { name: "geo-reports" } as NotifyLink,
  monitoring: { name: "geo-monitoring" } as NotifyLink,
};
