/** 用量与计费 · 假数据（对齐详细设计 §4.3） */

export type BillingTabId =
  | "usage"
  | "debit-ledger"
  | "credit-ledger"
  | "quota"
  | "sku"
  | "invoice"
  | "adjust";

export const BILLING_TABS: { id: BillingTabId; label: string }[] = [
  { id: "usage", label: "用量明细" },
  { id: "debit-ledger", label: "扣费流水" },
  { id: "credit-ledger", label: "入账流水" },
  { id: "quota", label: "配额监控" },
  { id: "sku", label: "套餐 SKU" },
  { id: "invoice", label: "账单" },
  { id: "adjust", label: "调账 / 充值" },
];

export const BILLING_USAGE_ROWS = [
  {
    time: "2026-05-18 14:28:01",
    requestId: "req-8f2a1c",
    org: "Acme",
    workspace: "ws-prod",
    apiKey: "sk_live_Ab…",
    model: "gpt-4o-mini",
    line: "腾讯",
    status: "200",
    latencyMs: 842,
    tokens: "12.4k / 3.1k",
    amt: "¥42.10",
  },
  {
    time: "2026-05-17 14:27:55",
    requestId: "req-7e91bd",
    org: "Beta Lab",
    workspace: "ws-beta",
    apiKey: "sk_test_Xy…",
    model: "claude-3-5",
    line: "直连",
    status: "200",
    latencyMs: 1204,
    tokens: "8.2k / 2.0k",
    amt: "¥118.00",
  },
  {
    time: "2026-05-10 14:27:40",
    requestId: "req-3c44aa",
    org: "Acme",
    workspace: "ws-prod",
    apiKey: "sk_live_Ab…",
    model: "text-embedding-3",
    line: "火山",
    status: "429",
    latencyMs: 120,
    tokens: "0 / 64k",
    amt: "¥1.20",
  },
];

export const BILLING_DEBIT_ROWS = [
  {
    at: "2026-05-18 14:28:02",
    requestId: "req-8f2a1c",
    workspace: "ws-prod",
    user: "zhangsan",
    amount: "-¥42.10",
    billingLine: "BL-202605-8821",
  },
  {
    at: "2026-05-17 14:27:56",
    requestId: "req-7e91bd",
    workspace: "ws-beta",
    user: "lisi",
    amount: "-¥118.00",
    billingLine: "BL-202605-7710",
  },
];

export const BILLING_CREDIT_ROWS = [
  {
    at: "2026-05-16 10:00:00",
    workspace: "ws-prod",
    source: "Stripe",
    amount: "+¥10,000",
    orderId: "po_stripe_9921",
  },
  {
    at: "2026-05-12 15:30:00",
    workspace: "ws-beta",
    source: "手工充值",
    amount: "+¥2,000",
    orderId: "po_manual_4412",
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
