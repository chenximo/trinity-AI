/** 账户与套餐 · Mock 数据 */

import type { RouteLocationRaw } from "vue-router";

export interface QuotaRow {
  dimension: string;
  used: number | string;
  max: number | string | null;
  meterPercent: number | null;
  meterFull?: boolean;
  note?: string;
  manageLink?: RouteLocationRaw;
  manageLabel?: string;
  warn?: boolean;
  spanUsedMax?: boolean;
}

export const ACCOUNT_KPIS = [
  { label: "当前套餐", value: "专业版", delta: "$79/月 · 年付 8 折", tone: "primary" },
  { label: "试用剩余", value: "12", delta: "天 · 到期前升级", tone: "warn" },
  {
    label: "监测问题",
    value: "10/100",
    delta: "问题集 →",
    tone: "neutral",
    deltaLink: { name: "geo-keywords" } as RouteLocationRaw,
  },
  { label: "监测平台", value: "10/10", delta: "已满额", tone: "neutral", deltaWarn: true },
] as const;

export const QUOTA_ROWS: QuotaRow[] = [
  {
    dimension: "品牌数",
    used: 1,
    max: 3,
    meterPercent: 33,
    manageLink: { name: "geo-settings-brand" },
    manageLabel: "品牌",
  },
  {
    dimension: "监测问题",
    used: 10,
    max: 100,
    meterPercent: 10,
    manageLink: { name: "geo-keywords" },
    manageLabel: "问题集",
  },
  {
    dimension: "监测平台",
    used: 10,
    max: 10,
    meterPercent: 100,
    meterFull: true,
    warn: true,
    manageLink: { name: "geo-monitoring" },
    manageLabel: "平台",
  },
  {
    dimension: "竞品数",
    used: 6,
    max: 10,
    meterPercent: 60,
    manageLink: { name: "geo-competitors-manage" },
    manageLabel: "竞品",
  },
  {
    dimension: "日采频次",
    used: "每日 1 次 / 品牌",
    max: null,
    meterPercent: null,
    spanUsedMax: true,
  },
  {
    dimension: "报告导出",
    used: "PDF + 邮件定时",
    max: null,
    meterPercent: null,
    spanUsedMax: true,
    manageLink: { name: "geo-reports" },
    manageLabel: "报告",
  },
];

export const ACCOUNT_PROFILE = {
  email: "ops@trinity.ai",
  org: "Trinity AI Inc.",
  timezone: "Asia/Shanghai (UTC+8)",
};

export const PLAN_PERKS = [
  "最多 3 个品牌 · 100 监测问题",
  "10 个 AI 平台 · 10 个竞品",
  "每日采集 · PDF 周报邮件",
  "诊断 + 优化待办 + 效果验证",
];
