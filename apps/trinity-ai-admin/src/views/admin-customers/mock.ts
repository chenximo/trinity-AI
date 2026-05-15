/** 客户与合同 · 假数据（对齐详细设计 §4.7；客户 ID 与计费 §4.3、密钥 §4.8 一致） */

export const CUSTOMER_PANEL_ORDER = [
  "tenants",
  "org",
  "contract",
  "invoice",
  "credit",
] as const;

export type CustomerPanelId = (typeof CUSTOMER_PANEL_ORDER)[number];

export type TenantStatus = "正式" | "试用" | "停用";

export type TenantRow = {
  id: string;
  name: string;
  status: TenantStatus;
  authSummary: string;
  ownerLogin: string;
  contractNo: string;
  creditUsed: string;
  updatedAt: string;
};

export const DEFAULT_TENANT_ROWS: TenantRow[] = [
  {
    id: "org-acme",
    name: "Acme",
    status: "正式",
    authSummary: "企业认证已通过",
    ownerLogin: "owner@acme.com",
    contractNo: "CTR-2025-001",
    creditUsed: "¥120万 / ¥200万",
    updatedAt: "2026-05-14 16:20",
  },
  {
    id: "org-beta",
    name: "Beta Lab",
    status: "试用",
    authSummary: "个人认证 · 待升级企业",
    ownerLogin: "lab@beta.io",
    contractNo: "—",
    creditUsed: "按量后付",
    updatedAt: "2026-05-13 11:05",
  },
  {
    id: "org-gamma",
    name: "Gamma",
    status: "正式",
    authSummary: "企业认证已通过",
    ownerLogin: "ops@gamma.cn",
    contractNo: "CTR-2024-088",
    creditUsed: "¥45万 / ¥80万",
    updatedAt: "2026-05-12 09:40",
  },
];

export type OrgProjectRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  projectName: string;
  members: number;
  keyCount: number;
  billingTag: string;
  updatedAt: string;
};

export const ORG_PROJECT_ROWS: OrgProjectRow[] = [
  {
    id: "prj-acme-main",
    tenantId: "org-acme",
    tenantName: "Acme",
    projectName: "默认项目",
    members: 12,
    keyCount: 8,
    billingTag: "默认分摊",
    updatedAt: "2026-05-14",
  },
  {
    id: "prj-acme-rd",
    tenantId: "org-acme",
    tenantName: "Acme",
    projectName: "研发沙箱",
    members: 5,
    keyCount: 3,
    billingTag: "研发成本中心",
    updatedAt: "2026-05-10",
  },
  {
    id: "prj-beta-default",
    tenantId: "org-beta",
    tenantName: "Beta Lab",
    projectName: "试用空间",
    members: 2,
    keyCount: 1,
    billingTag: "试用不计配额",
    updatedAt: "2026-05-13",
  },
  {
    id: "prj-gamma-prod",
    tenantId: "org-gamma",
    tenantName: "Gamma",
    projectName: "生产",
    members: 6,
    keyCount: 4,
    billingTag: "生产环境",
    updatedAt: "2026-05-12",
  },
];

export type ContractRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  skuId: string;
  skuName: string;
  discount: string;
  startDate: string;
  endDate: string;
  status: "生效中" | "即将到期" | "已到期";
};

export const CONTRACT_ROWS: ContractRow[] = [
  {
    id: "CTR-2025-001",
    tenantId: "org-acme",
    tenantName: "Acme",
    skuId: "sku-pro-m",
    skuName: "企业 Pro · 月付",
    discount: "92 折",
    startDate: "2025-06-01",
    endDate: "2026-06-01",
    status: "即将到期",
  },
  {
    id: "CTR-2024-088",
    tenantId: "org-gamma",
    tenantName: "Gamma",
    skuId: "sku-paygo",
    skuName: "按量后付",
    discount: "刊例",
    startDate: "2024-11-01",
    endDate: "2025-11-01",
    status: "生效中",
  },
];

export type InvoiceHeaderRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  title: string;
  taxId: string;
  invoiceType: string;
  email: string;
  default: boolean;
};

export const INVOICE_HEADER_ROWS: InvoiceHeaderRow[] = [
  {
    id: "inv-h-acme",
    tenantId: "org-acme",
    tenantName: "Acme",
    title: "深圳 Acme 科技有限公司",
    taxId: "91440300XXXXXXXX",
    invoiceType: "增值税专用发票",
    email: "finance@acme.com",
    default: true,
  },
  {
    id: "inv-h-gamma",
    tenantId: "org-gamma",
    tenantName: "Gamma",
    title: "Gamma 信息服务有限公司",
    taxId: "91110000YYYYYYYY",
    invoiceType: "电子普通发票",
    email: "ap@gamma.cn",
    default: true,
  },
];

export type InvoiceApplicationRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  period: string;
  amount: string;
  status: "待开票" | "已开票" | "已驳回";
  appliedAt: string;
};

export const INVOICE_APPLICATION_ROWS: InvoiceApplicationRow[] = [
  {
    id: "INV-REQ-1042",
    tenantId: "org-acme",
    tenantName: "Acme",
    period: "2026-04",
    amount: "¥42,300",
    status: "待开票",
    appliedAt: "2026-05-08 14:00",
  },
  {
    id: "INV-REQ-1038",
    tenantId: "org-gamma",
    tenantName: "Gamma",
    period: "2026-03",
    amount: "¥18,600",
    status: "已开票",
    appliedAt: "2026-04-05 10:20",
  },
];

export type CreditRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  limitAmount: string;
  usedAmount: string;
  approvalState: "—" | "待审批" | "已通过";
  note: string;
};

export const CREDIT_ROWS: CreditRow[] = [
  {
    id: "cr-acme",
    tenantId: "org-acme",
    tenantName: "Acme",
    limitAmount: "¥200万",
    usedAmount: "¥120万",
    approvalState: "—",
    note: "年度授信",
  },
  {
    id: "cr-gamma",
    tenantId: "org-gamma",
    tenantName: "Gamma",
    limitAmount: "¥80万",
    usedAmount: "¥45万",
    approvalState: "—",
    note: "季度复核",
  },
  {
    id: "cr-beta-pending",
    tenantId: "org-beta",
    tenantName: "Beta Lab",
    limitAmount: "¥50万",
    usedAmount: "—",
    approvalState: "待审批",
    note: "试用转正式 · 大额授信申请",
  },
];
