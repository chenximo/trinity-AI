/** 与 `moduleSecondaryPages` 中 `tai-admin-users` 子路由 id 一致 */

export const USER_PANEL_ORDER = ["list", "audit-queue", "whitelist", "blacklist", "kyc"] as const;

export type UserPanelId = (typeof USER_PANEL_ORDER)[number];

/** 终端用户（非平台员工） */
export type TerminalUserRow = {
  id: string;
  email: string;
  displayName: string;
  orgName: string;
  status: "正常" | "待审核" | "已拒绝" | "已冻结";
  registeredAt: string;
  phone?: string;
};

export type WhitelistRuleRow = {
  id: string;
  pattern: string;
  patternType: "邮箱域名" | "手机号段";
  enabled: boolean;
  note: string;
  updatedAt: string;
};

export type BlacklistEntryRow = {
  id: string;
  target: string;
  targetType: "邮箱" | "手机" | "用户ID";
  reason: string;
  blockLogin: boolean;
  blockApi: boolean;
  updatedAt: string;
};

export type KycApplicationRow = {
  id: string;
  userId: string;
  kind: "个人实名" | "企业认证";
  status: "待审" | "通过" | "拒绝";
  submittedAt: string;
  remark: string;
};

export const DEFAULT_TERMINAL_USERS: TerminalUserRow[] = [
  {
    id: "tu-1001",
    email: "dev@acme.example",
    displayName: "Acme 主账号",
    orgName: "Acme Tech（试用）",
    status: "正常",
    registeredAt: "2026-05-01 10:20",
    phone: "138****0001",
  },
  {
    id: "tu-1002",
    email: "pending@startup.example",
    displayName: "李雷",
    orgName: "Startup Labs",
    status: "待审核",
    registeredAt: "2026-05-08 14:05",
  },
  {
    id: "tu-1003",
    email: "rejected@bad.example",
    displayName: "可疑注册",
    orgName: "—",
    status: "已拒绝",
    registeredAt: "2026-05-02 09:00",
  },
  {
    id: "tu-1004",
    email: "frozen@risk.example",
    displayName: "风控冻结",
    orgName: "Risk Co",
    status: "已冻结",
    registeredAt: "2026-04-20 11:30",
  },
];

export const DEFAULT_WHITELIST_RULES: WhitelistRuleRow[] = [
  {
    id: "wl-1",
    pattern: "@partner-corp.example",
    patternType: "邮箱域名",
    enabled: true,
    note: "战略合作方域名自动通过邮箱验证",
    updatedAt: "2026-05-01 09:00",
  },
  {
    id: "wl-2",
    pattern: "86139",
    patternType: "手机号段",
    enabled: true,
    note: "号段示意；正式版接运营商号段库",
    updatedAt: "2026-05-03 16:12",
  },
];

export const DEFAULT_BLACKLIST_ENTRIES: BlacklistEntryRow[] = [
  {
    id: "bl-1",
    target: "spam-bot@evil.example",
    targetType: "邮箱",
    reason: "批量注册 / 撞库",
    blockLogin: true,
    blockApi: true,
    updatedAt: "2026-05-06 10:00",
  },
];

export const DEFAULT_KYC_APPLICATIONS: KycApplicationRow[] = [
  {
    id: "kyc-1",
    userId: "tu-1002",
    kind: "企业认证",
    status: "待审",
    submittedAt: "2026-05-08 14:10",
    remark: "执照 OCR 待人工复核",
  },
  {
    id: "kyc-2",
    userId: "tu-1001",
    kind: "个人实名",
    status: "通过",
    submittedAt: "2026-05-01 10:25",
    remark: "身份证二要素通过",
  },
];
