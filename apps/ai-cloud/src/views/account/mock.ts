/**
 * AI 云用户控制台系统 · 与侧栏 hash / 壳菜单对齐的常量。
 */

export const AI_CLOUD_CONSOLE_HASH = {
  ACCOUNTS: "#accounts",
  BILLING: "#billing",
  INVOICES: "#invoices",
  CONTACT: "#contact",
} as const;

export type AiCloudConsolePanelId =
  | "accounts"
  | "billing"
  | "invoices"
  | "contact";

export const AI_CLOUD_CONSOLE_PANELS: ReadonlyArray<{
  id: AiCloudConsolePanelId;
  label: string;
  hash: string;
}> = [
  { id: "accounts", label: "账号管理", hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS },
  { id: "billing", label: "费用", hash: AI_CLOUD_CONSOLE_HASH.BILLING },
  { id: "invoices", label: "发票", hash: AI_CLOUD_CONSOLE_HASH.INVOICES },
  { id: "contact", label: "联系我们", hash: AI_CLOUD_CONSOLE_HASH.CONTACT },
] as const;

export const AI_CLOUD_CONSOLE_DEFAULT_PANEL: AiCloudConsolePanelId = "accounts";

export type CloudRegion = "domestic" | "overseas";
export type AuthStatus = "已认证" | "待补充" | "审核中";
export type AccountStatus = "正常" | "过期" | "冻结";
export type AccessMode = "平台代理绑定" | "自主开户绑定";

export type MockCloudAccount = {
  id: string;
  vendor: string;
  vendorKey: string;
  region: CloudRegion;
  regionLabel: "国内" | "海外";
  name: string;
  accountId: string;
  createdAt: string;
  entityName: string;
  authStatus: AuthStatus;
  accountStatus: AccountStatus;
  creditCodeMasked: string;
  accessMode: AccessMode;
  roleSummary: string;
  bindingHistory: string[];
  commercialSummary: string;
  /** 云厂商官网控制台登录页（演示外链，非 SSO 代登） */
  consoleUrl: string;
};

/** 各云厂商控制台入口（公开登录页，原型演示用） */
export const VENDOR_CONSOLE_URLS: Record<string, string> = {
  aliyun: "https://home.console.aliyun.com/",
  tencent: "https://console.cloud.tencent.com/",
  huawei: "https://console.huaweicloud.com/",
  aws: "https://console.aws.amazon.com/",
  gcp: "https://console.cloud.google.com/",
};

export const MOCK_CLOUD_ACCOUNTS: MockCloudAccount[] = [
  {
    id: "1",
    vendor: "阿里云",
    vendorKey: "aliyun",
    region: "domestic",
    regionLabel: "国内",
    name: "电商业务主账号",
    accountId: "1234****8901",
    createdAt: "2024-03-12",
    entityName: "上海某某科技有限公司",
    authStatus: "已认证",
    accountStatus: "正常",
    creditCodeMasked: "9131**********12X",
    accessMode: "平台代理绑定",
    roleSummary: "只读账单 · 资源目录只读（演示）",
    bindingHistory: ["2024-03-12 平台代管开通", "2025-01-08 续签渠道优惠"],
    commercialSummary: "已配置渠道优惠；框架合约 TC-2024-001 生效中",
    consoleUrl: VENDOR_CONSOLE_URLS.aliyun,
  },
  {
    id: "2",
    vendor: "腾讯云",
    vendorKey: "tencent",
    region: "domestic",
    regionLabel: "国内",
    name: "音视频项目",
    accountId: "1000****5566",
    createdAt: "2024-08-01",
    entityName: "上海某某科技有限公司",
    authStatus: "已认证",
    accountStatus: "过期",
    creditCodeMasked: "9131**********12X",
    accessMode: "平台代理绑定",
    roleSummary: "财务协同 · 子账号只读（演示）",
    bindingHistory: ["2024-08-01 绑定", "2026-04-01 纳管状态变更为过期（演示）"],
    commercialSummary: "补充协议 TC-2025-014 生效中；续签待顾问跟进",
    consoleUrl: VENDOR_CONSOLE_URLS.tencent,
  },
  {
    id: "3",
    vendor: "华为云",
    vendorKey: "huawei",
    region: "domestic",
    regionLabel: "国内",
    name: "研发测试环境",
    accountId: "hw-****2211",
    createdAt: "2025-01-15",
    entityName: "上海某某科技有限公司",
    authStatus: "已认证",
    accountStatus: "正常",
    creditCodeMasked: "9131**********12X",
    accessMode: "自主开户绑定",
    roleSummary: "项目管理员 · 费用中心只读（演示）",
    bindingHistory: ["2025-01-15 客户自主开户后纳管"],
    commercialSummary: "研发测试环境按量结算；暂无框架折扣",
    consoleUrl: VENDOR_CONSOLE_URLS.huawei,
  },
  {
    id: "4",
    vendor: "AWS",
    vendorKey: "aws",
    region: "overseas",
    regionLabel: "海外",
    name: "出海业务账号",
    accountId: "aws-****7788",
    createdAt: "2025-02-20",
    entityName: "上海某某科技有限公司",
    authStatus: "审核中",
    accountStatus: "正常",
    creditCodeMasked: "9131**********12X",
    accessMode: "平台代理绑定",
    roleSummary: "跨境账单协同 · Organizations 只读（演示）",
    bindingHistory: ["2025-02-20 提交出海纳管", "2025-03-01 企业认证审核中"],
    commercialSummary: "出海专项 TC-2025-022 待签署；技术支持跟进中",
    consoleUrl: VENDOR_CONSOLE_URLS.aws,
  },
  {
    id: "5",
    vendor: "Google Cloud",
    vendorKey: "gcp",
    region: "overseas",
    regionLabel: "海外",
    name: "数据分析项目",
    accountId: "gcp-****3344",
    createdAt: "2025-04-02",
    entityName: "上海某某科技有限公司",
    authStatus: "待补充",
    accountStatus: "冻结",
    creditCodeMasked: "9131**********12X",
    accessMode: "自主开户绑定",
    roleSummary: "待补充 IAM 只读授权（演示）",
    bindingHistory: ["2025-04-02 绑定", "2025-04-18 因资料不全冻结纳管"],
    commercialSummary: "待补充企业认证与账单授权后可恢复优惠洽谈",
    consoleUrl: VENDOR_CONSOLE_URLS.gcp,
  },
];

/** 费用 · 账期与对账（§5.2） */
export type BillingPeriodType = "自然月" | "合约账期";
export type ReconcileStatus = "待对账" | "已对账" | "有差异";

export type MockBillingSummary = {
  periodLabel: string;
  totalPayable: number;
  totalListPrice: number;
  savingsAmount: number;
  savingsRatePct: number;
  momPct: number;
  yoyPct: number;
};

export type MockBillingVendorShare = {
  vendorKey: string;
  vendor: string;
  sharePct: number;
  payable: number;
};

export type MockBillingLine = {
  id: string;
  vendorKey: string;
  vendor: string;
  accountName: string;
  accountId: string;
  periodType: BillingPeriodType;
  periodLabel: string;
  listPrice: number;
  payable: number;
  discountRatePct: number;
  momPct: number;
  reconcileStatus: ReconcileStatus;
  drillLines: string[];
};

export const MOCK_BILLING_SUMMARY: MockBillingSummary = {
  periodLabel: "2026-05",
  totalPayable: 386_200,
  totalListPrice: 438_800,
  savingsAmount: 52_600,
  savingsRatePct: 12,
  momPct: 8.4,
  yoyPct: 15.2,
};

export const MOCK_BILLING_VENDOR_SHARE: MockBillingVendorShare[] = [
  { vendorKey: "aliyun", vendor: "阿里云", sharePct: 38, payable: 146_756 },
  { vendorKey: "tencent", vendor: "腾讯云", sharePct: 28, payable: 108_136 },
  { vendorKey: "huawei", vendor: "华为云", sharePct: 22, payable: 84_964 },
  { vendorKey: "aws", vendor: "AWS", sharePct: 9, payable: 34_758 },
  { vendorKey: "gcp", vendor: "Google Cloud", sharePct: 3, payable: 11_586 },
];

export const MOCK_BILLING_LINES: MockBillingLine[] = [
  {
    id: "b1",
    vendorKey: "aliyun",
    vendor: "阿里云",
    accountName: "电商业务主账号",
    accountId: "1234****8901",
    periodType: "合约账期",
    periodLabel: "2026-05",
    listPrice: 168_200,
    payable: 146_756,
    discountRatePct: 12.7,
    momPct: 6.2,
    reconcileStatus: "已对账",
    drillLines: [
      "计算：¥98,400 · 存储：¥28,100 · 网络：¥20,256",
      "渠道折扣 12.7% · 合约 TC-2024-001",
      "2026-05-18 财务确认对账",
    ],
  },
  {
    id: "b2",
    vendorKey: "tencent",
    vendor: "腾讯云",
    accountName: "音视频项目",
    accountId: "1000****5566",
    periodType: "自然月",
    periodLabel: "2026-05",
    listPrice: 124_500,
    payable: 108_136,
    discountRatePct: 13.1,
    momPct: -2.4,
    reconcileStatus: "待对账",
    drillLines: [
      "CDN / 直播：¥72,300 · 对象存储：¥35,836",
      "自然月账单 · 待财务确认",
    ],
  },
  {
    id: "b3",
    vendorKey: "huawei",
    vendor: "华为云",
    accountName: "研发测试环境",
    accountId: "hw-****2211",
    periodType: "自然月",
    periodLabel: "2026-05",
    listPrice: 96_800,
    payable: 84_964,
    discountRatePct: 12.2,
    momPct: 11.8,
    reconcileStatus: "已对账",
    drillLines: ["ECS / 裸金属：¥54,200 · 其余按量", "2026-05-20 对账完成"],
  },
  {
    id: "b4",
    vendorKey: "aws",
    vendor: "AWS",
    accountName: "出海业务账号",
    accountId: "aws-****7788",
    periodType: "合约账期",
    periodLabel: "2026-Q2",
    listPrice: 39_600,
    payable: 34_758,
    discountRatePct: 12.2,
    momPct: 18.5,
    reconcileStatus: "有差异",
    drillLines: [
      "原厂回传 $4,820 · Trinity 折算 ¥34,758",
      "差异项：预留实例抵扣滞后（演示）",
    ],
  },
  {
    id: "b5",
    vendorKey: "gcp",
    vendor: "Google Cloud",
    accountName: "数据分析项目",
    accountId: "gcp-****3344",
    periodType: "自然月",
    periodLabel: "2026-05",
    listPrice: 13_200,
    payable: 11_586,
    discountRatePct: 12.2,
    momPct: 4.1,
    reconcileStatus: "待对账",
    drillLines: ["BigQuery / GCS 按量", "账号冻结期间仅统计已授权资源"],
  },
];

/** 发票 · §5.4 P0（额度与 MOCK_BILLING_SUMMARY 同账期对齐） */
export type InvoiceType = "增值税普通发票" | "增值税专用发票";
export type InvoiceStatus = "待审核" | "开票处理中" | "开票成功" | "已驳回";

export type MockInvoiceEntity = {
  entityName: string;
  /** 表单录入用；展示用 creditCodeMasked */
  creditCode: string;
  creditCodeMasked: string;
  address: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  bankAccountMasked: string;
  authStatus: AuthStatus;
  /** false 时锁定申请开票 */
  isProfileComplete: boolean;
};

export function maskCreditCode(code: string): string {
  const s = code.trim();
  if (s.length <= 8) return s;
  return `${s.slice(0, 4)}**********${s.slice(-3)}`;
}

export function maskBankAccount(account: string): string {
  const s = account.replace(/\s/g, "");
  if (s.length <= 8) return s;
  return `${s.slice(0, 4)} **** **** ${s.slice(-4)}`;
}

export type MockInvoiceQuota = {
  periodLabel: string;
  contractId: string;
  settledPayable: number;
  appliedTotal: number;
  invoicedSuccess: number;
  remaining: number;
};

export type MockInvoiceTitle = {
  id: string;
  name: string;
  creditCodeMasked: string;
  isDefault: boolean;
};

export type MockInvoiceRecord = {
  id: string;
  applyNo: string;
  periodLabel: string;
  contractId: string;
  titleId: string;
  titleName: string;
  invoiceType: InvoiceType;
  amount: number;
  status: InvoiceStatus;
  submittedAt: string;
  email: string;
  contact?: string;
  phone?: string;
  remark?: string;
  rejectReason?: string;
};

export const MOCK_INVOICE_ENTITY: MockInvoiceEntity = {
  entityName: "上海某某科技有限公司",
  creditCode: "91310115MA1KXXXX12X",
  creditCodeMasked: maskCreditCode("91310115MA1KXXXX12X"),
  address: "上海市浦东新区张江高科技园区科苑路 88 号",
  phone: "021-8888-6666",
  bankName: "中国工商银行上海张江支行",
  bankAccount: "6222021001234567890",
  bankAccountMasked: maskBankAccount("6222021001234567890"),
  authStatus: "已认证",
  isProfileComplete: true,
};

export const MOCK_INVOICE_QUOTA: MockInvoiceQuota = {
  periodLabel: MOCK_BILLING_SUMMARY.periodLabel,
  contractId: "TC-2024-001",
  settledPayable: MOCK_BILLING_SUMMARY.totalPayable,
  appliedTotal: 64_000,
  invoicedSuccess: 235_780,
  remaining: 86_420,
};

export const MOCK_INVOICE_TITLES: MockInvoiceTitle[] = [
  {
    id: "t1",
    name: "上海某某科技有限公司",
    creditCodeMasked: "9131**********12X",
    isDefault: true,
  },
  {
    id: "t2",
    name: "上海某某科技有限公司 · 电商项目",
    creditCodeMasked: "9131**********12X",
    isDefault: false,
  },
];

export const MOCK_INVOICE_RECORDS: MockInvoiceRecord[] = [
  {
    id: "inv1",
    applyNo: "INV-2026-0088",
    periodLabel: "2026-05",
    contractId: "TC-2024-001",
    titleId: "t1",
    titleName: "上海某某科技有限公司",
    invoiceType: "增值税专用发票",
    amount: 120_000,
    status: "开票成功",
    submittedAt: "2026-05-12 10:20",
    email: "finance@example.com",
  },
  {
    id: "inv2",
    applyNo: "INV-2026-0091",
    periodLabel: "2026-05",
    contractId: "TC-2024-001",
    titleId: "t1",
    titleName: "上海某某科技有限公司",
    invoiceType: "增值税专用发票",
    amount: 45_000,
    status: "开票处理中",
    submittedAt: "2026-05-18 14:05",
    email: "finance@example.com",
  },
  {
    id: "inv3",
    applyNo: "INV-2026-0095",
    periodLabel: "2026-05",
    contractId: "TC-2024-001",
    titleId: "t2",
    titleName: "上海某某科技有限公司 · 电商项目",
    invoiceType: "增值税普通发票",
    amount: 28_000,
    status: "待审核",
    submittedAt: "2026-05-20 09:30",
    email: "ap@example.com",
    remark: "电商项目 5 月结算",
  },
  {
    id: "inv4",
    applyNo: "INV-2026-0082",
    periodLabel: "2026-05",
    contractId: "TC-2024-001",
    titleId: "t1",
    titleName: "上海某某科技有限公司",
    invoiceType: "增值税普通发票",
    amount: 15_000,
    status: "已驳回",
    submittedAt: "2026-05-08 16:40",
    email: "finance@example.com",
    rejectReason: "申请金额与当期已结算账单不一致，请核对后重新申请。",
  },
];

export const INVOICE_TYPE_OPTIONS: InvoiceType[] = ["增值税普通发票", "增值税专用发票"];

export type MockContactItem = {
  label: string;
  value: string;
  href?: string;
};

export type MockContactChannel = {
  id: string;
  title: string;
  desc: string;
  items: MockContactItem[];
};

export const MOCK_CONTACT_ADVISOR = {
  badge: "VIP 专属通道",
  name: "张先生",
  role: "专属上云顾问",
  summary: "开户、集采议价、多云架构与账单对账，一对一跟进您的上云项目。",
  phone: "400-888-0626",
  wechat: "Trinity-AI-Cloud",
  hours: "工作日 9:00–18:00（GMT+8）",
  email: "starsea@trinitydesk.com",
} as const;

export const MOCK_CONTACT_CHANNELS: MockContactChannel[] = [
  {
    id: "support",
    title: "技术支持",
    desc: "控制台使用、云账号纳管、对账与权限异常。",
    items: [
      { label: "服务邮箱", value: "support@trinity.example", href: "mailto:support@trinity.example" },
      { label: "响应时效", value: "工作日 4 小时内首次回复" },
      { label: "紧急热线", value: "400-888-0626 转 2", href: "tel:4008880626" },
    ],
  },
  {
    id: "finance",
    title: "财务与开票",
    desc: "账单、发票申请与对公付款相关问题。",
    items: [
      { label: "财务邮箱", value: "finance@trinity.example", href: "mailto:finance@trinity.example" },
      { label: "控制台", value: "费用 · 发票模块在线提交" },
      { label: "服务时间", value: "工作日 9:00–17:30" },
    ],
  },
  {
    id: "biz",
    title: "商务合作",
    desc: "渠道折扣、合同账期与多云采购方案咨询。",
    items: [
      {
        label: "商务邮箱",
        value: "starsea@trinitydesk.com",
        href: "mailto:starsea@trinitydesk.com",
      },
      { label: "预约咨询", value: "官网填写需求，顾问 1 个工作日内联系" },
    ],
  },
];

export const MOCK_CONTACT_NOTES: string[] = [
  "演示环境：联系方式为占位数据，正式环境由租户商务合同与平台运营配置。",
  "费用、发票类问题请优先在控制台对应模块操作，便于财务留痕对账。",
];

export function formatCny(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN")}`;
}

export function formatPctSigned(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export function channelDiscountLabel(payable: number, listPrice: number): string {
  if (listPrice <= 0) return "—";
  const zhe = (payable / listPrice) * 10;
  return `${zhe.toFixed(1)}折`;
}

export function vendorConsoleOpenLabel(vendor: string): string {
  return `打开${vendor}控制台`;
}

/** @deprecated 使用 vendorConsoleOpenLabel */
export function vendorConsoleLoginLabel(vendor: string): string {
  return vendorConsoleOpenLabel(vendor);
}
