/** 用量与计费 · 假数据（对齐详细设计 §4.3） */

export type BillingTabId = "usage" | "quota" | "sku" | "invoice" | "adjust";

export const BILLING_TABS: { id: BillingTabId; label: string }[] = [
  { id: "usage", label: "用量明细" },
  { id: "quota", label: "配额监控" },
  { id: "sku", label: "套餐 SKU" },
  { id: "invoice", label: "账单" },
  { id: "adjust", label: "调账 / 充值" },
];

export const BILLING_USAGE_ROWS = [
  {
    time: "2026-05-18 14:28:01",
    org: "Acme",
    model: "gpt-4o-mini",
    line: "腾讯",
    tokens: "12.4k / 3.1k",
    amt: "¥42.10",
  },
  {
    time: "2026-05-17 14:27:55",
    org: "Beta Lab",
    model: "claude-3-5",
    line: "直连",
    tokens: "8.2k / 2.0k",
    amt: "¥118.00",
  },
  {
    time: "2026-05-10 14:27:40",
    org: "Acme",
    model: "text-embedding-3",
    line: "火山",
    tokens: "0 / 64k",
    amt: "¥1.20",
  },
];

export const BILLING_QUOTA_ROWS = [
  { org: "Acme", plan: "企业 Pro", used: "82%", hard: "100万 tok/月", soft: "90% 告警已开" },
  { org: "Beta Lab", plan: "按量后付", used: "—", hard: "无硬顶", soft: "余额低预警" },
];

export const BILLING_SKU_ROWS = [
  { id: "sku-pro-m", name: "企业 Pro · 月付", type: "包月", price: "¥9,800/月", note: "含 100万 tok" },
  { id: "sku-paygo", name: "按量后付", type: "按量", price: "刊例见价目表", note: "与合同折扣叠加" },
];

export const BILLING_INVOICE_ROWS = [
  { period: "2026-04", org: "Acme", amount: "¥42,300", status: "已出账", paid: "待付" },
  { period: "2026-04", org: "Beta Lab", amount: "¥3,200", status: "已出账", paid: "已付" },
];

export const BILLING_ADJUST_ROWS = [
  { id: "ADJ-001", org: "Acme", reason: "争议调减", amount: "-¥500", state: "待财务审" },
  { id: "ADJ-002", org: "Gamma", reason: "补偿充值", amount: "+¥2,000", state: "已完成" },
];
