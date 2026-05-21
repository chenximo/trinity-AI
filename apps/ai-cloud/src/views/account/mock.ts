/**
 * AI 云用户控制台 · 与侧栏 hash / 壳菜单对齐的常量。
 */

export const AI_CLOUD_CONSOLE_HASH = {
  ACCOUNTS: "#accounts",
  BILLING: "#billing",
  CONTRACTS: "#contracts",
  INVOICES: "#invoices",
  CONTACT: "#contact",
} as const;

export type AiCloudConsolePanelId =
  | "accounts"
  | "billing"
  | "contracts"
  | "invoices"
  | "contact";

export const AI_CLOUD_CONSOLE_PANELS: ReadonlyArray<{
  id: AiCloudConsolePanelId;
  label: string;
  hash: string;
}> = [
  { id: "accounts", label: "账号管理", hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS },
  { id: "billing", label: "费用", hash: AI_CLOUD_CONSOLE_HASH.BILLING },
  { id: "contracts", label: "合同", hash: AI_CLOUD_CONSOLE_HASH.CONTRACTS },
  { id: "invoices", label: "发票", hash: AI_CLOUD_CONSOLE_HASH.INVOICES },
  { id: "contact", label: "联系我们", hash: AI_CLOUD_CONSOLE_HASH.CONTACT },
] as const;

export const AI_CLOUD_CONSOLE_DEFAULT_PANEL: AiCloudConsolePanelId = "accounts";

export type MockCloudAccount = {
  id: string;
  vendor: string;
  vendorKey: string;
  name: string;
  accountId: string;
  createdAt: string;
  identity: string;
  status: string;
  /** 云厂商官网控制台登录页（演示一键跳转） */
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

/** 与 TrinityCloud/home.html Hero 示意行对齐的 Mock */
export const MOCK_CLOUD_ACCOUNTS: MockCloudAccount[] = [
  {
    id: "1",
    vendor: "阿里云",
    vendorKey: "aliyun",
    name: "电商业务主账号",
    accountId: "1234****8901",
    createdAt: "2024-03-12",
    identity: "上海某某科技有限公司",
    status: "已配置优惠",
    consoleUrl: VENDOR_CONSOLE_URLS.aliyun,
  },
  {
    id: "2",
    vendor: "腾讯云",
    vendorKey: "tencent",
    name: "音视频项目",
    accountId: "1000****5566",
    createdAt: "2024-08-01",
    identity: "上海某某科技有限公司",
    status: "合约生效中",
    consoleUrl: VENDOR_CONSOLE_URLS.tencent,
  },
  {
    id: "3",
    vendor: "华为云",
    vendorKey: "huawei",
    name: "研发测试环境",
    accountId: "hw-****2211",
    createdAt: "2025-01-15",
    identity: "上海某某科技有限公司",
    status: "已认证",
    consoleUrl: VENDOR_CONSOLE_URLS.huawei,
  },
  {
    id: "4",
    vendor: "AWS",
    vendorKey: "aws",
    name: "出海业务账号",
    accountId: "aws-****7788",
    createdAt: "2025-02-20",
    identity: "上海某某科技有限公司",
    status: "技术支持中",
    consoleUrl: VENDOR_CONSOLE_URLS.aws,
  },
  {
    id: "5",
    vendor: "Google Cloud",
    vendorKey: "gcp",
    name: "数据分析项目",
    accountId: "gcp-****3344",
    createdAt: "2025-04-02",
    identity: "上海某某科技有限公司",
    status: "待补充资料",
    consoleUrl: VENDOR_CONSOLE_URLS.gcp,
  },
];

export function vendorConsoleLoginLabel(vendor: string): string {
  return `一键登录${vendor}控制台`;
}

