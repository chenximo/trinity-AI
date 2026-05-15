/** 系统与合规（§4.13）子路由 id，须与 `moduleSecondaryPages` 中 `tai-admin-system` 一致 */

export const SYSTEM_PANEL_ORDER = [
  "audit-log",
  "sensitive",
  "export-approval",
  "flags",
  "global",
] as const;

export type SystemPanelId = (typeof SYSTEM_PANEL_ORDER)[number];

export type AuditLogRow = {
  id: string;
  at: string;
  actorLogin: string;
  actorName: string;
  module: string;
  action: string;
  target: string;
  result: "成功" | "失败";
  ip: string;
};

export type SensitiveRuleRow = {
  id: string;
  operation: string;
  description: string;
  requireMfa: boolean;
  requireDualApproval: boolean;
  enabled: boolean;
  updatedAt: string;
};

export type ExportApprovalRow = {
  id: string;
  applicant: string;
  scope: string;
  rowEstimate: string;
  requestedAt: string;
  status: "待审批" | "已通过" | "已拒绝";
  reviewer: string;
  reviewedAt: string;
};

export type FeatureFlagRow = {
  id: string;
  key: string;
  name: string;
  env: "production" | "staging" | "all";
  rolloutPct: number;
  enabled: boolean;
  note: string;
  updatedAt: string;
};

export type GlobalParamRow = {
  id: string;
  key: string;
  label: string;
  value: string;
  category: string;
  updatedAt: string;
  updatedBy: string;
};

export const AUDIT_RETENTION_NOTE =
  "配置类操作写入不可篡改审计链（WORM / 对象锁）；默认保留 400 天，合规导出字段含 actor、tenant、before/after 摘要。";

export const DEFAULT_AUDIT_LOG_ROWS: AuditLogRow[] = [
  {
    id: "aud-001",
    at: "2026-05-15 10:22:08",
    actorLogin: "zhang.san",
    actorName: "张三",
    module: "模型管理",
    action: "更新供应线路",
    target: "model/gpt-4o/line-cn-1",
    result: "成功",
    ip: "10.2.8.14",
  },
  {
    id: "aud-002",
    at: "2026-05-15 09:55:41",
    actorLogin: "li.si",
    actorName: "李四",
    module: "API 密钥",
    action: "冻结密钥",
    target: "key/fp_8a2f…c91",
    result: "成功",
    ip: "10.2.8.22",
  },
  {
    id: "aud-003",
    at: "2026-05-14 18:03:12",
    actorLogin: "zhang.san",
    actorName: "张三",
    module: "全局参数",
    action: "修改计费时区",
    target: "billing.timezone",
    result: "成功",
    ip: "10.2.8.14",
  },
  {
    id: "aud-004",
    at: "2026-05-14 16:40:00",
    actorLogin: "wang.wu",
    actorName: "王五",
    module: "特性开关",
    action: "开启维护模式",
    target: "flag/maintenance_mode",
    result: "失败",
    ip: "10.2.9.3",
  },
  {
    id: "aud-005",
    at: "2026-05-14 11:18:33",
    actorLogin: "li.si",
    actorName: "李四",
    module: "客户与合同",
    action: "删除租户（申请）",
    target: "org/acme-lab",
    result: "成功",
    ip: "10.2.8.22",
  },
];

export const DEFAULT_SENSITIVE_RULES: SensitiveRuleRow[] = [
  {
    id: "sen-001",
    operation: "删除客户组织",
    description: "软删前双人复核；保留 30 天可恢复窗口。",
    requireMfa: true,
    requireDualApproval: true,
    enabled: true,
    updatedAt: "2026-05-10 09:00",
  },
  {
    id: "sen-002",
    operation: "批量导出用量明细",
    description: "超过 10 万行或跨租户导出须审批。",
    requireMfa: true,
    requireDualApproval: false,
    enabled: true,
    updatedAt: "2026-05-10 09:00",
  },
  {
    id: "sen-003",
    operation: "查看密钥明文",
    description: "仅平台超级管理员；单次有效令牌 5 分钟。",
    requireMfa: true,
    requireDualApproval: true,
    enabled: true,
    updatedAt: "2026-05-08 14:20",
  },
  {
    id: "sen-004",
    operation: "修改全局限流默认值",
    description: "影响全站默认配额；变更写入审计。",
    requireMfa: false,
    requireDualApproval: true,
    enabled: true,
    updatedAt: "2026-05-08 14:20",
  },
  {
    id: "sen-005",
    operation: "吊销平台管理员",
    description: "防止自锁；需另一名超级管理员确认。",
    requireMfa: true,
    requireDualApproval: true,
    enabled: false,
    updatedAt: "2026-05-01 11:00",
  },
];

export const DEFAULT_EXPORT_APPROVALS: ExportApprovalRow[] = [
  {
    id: "exp-001",
    applicant: "li.si",
    scope: "客户 Acme · 2026-04 用量明细（全模型）",
    rowEstimate: "约 128,400 行",
    requestedAt: "2026-05-15 08:40",
    status: "待审批",
    reviewer: "",
    reviewedAt: "",
  },
  {
    id: "exp-002",
    applicant: "zhang.san",
    scope: "全平台 API 密钥元数据（脱敏）",
    rowEstimate: "约 2,100 行",
    requestedAt: "2026-05-14 17:05",
    status: "已通过",
    reviewer: "zhang.san",
    reviewedAt: "2026-05-14 17:12",
  },
  {
    id: "exp-003",
    applicant: "finance.bot",
    scope: "Beta Labs · 账单与调账 CSV",
    rowEstimate: "约 3,200 行",
    requestedAt: "2026-05-13 10:00",
    status: "已拒绝",
    reviewer: "zhang.san",
    reviewedAt: "2026-05-13 10:18",
  },
];

export const DEFAULT_FEATURE_FLAGS: FeatureFlagRow[] = [
  {
    id: "ff-001",
    key: "maintenance_mode",
    name: "维护模式总开关",
    env: "all",
    rolloutPct: 100,
    enabled: false,
    note: "开启后网关返回 503 与租户提示文案。",
    updatedAt: "2026-05-14 16:40",
  },
  {
    id: "ff-002",
    key: "model_router_v2",
    name: "路由引擎 v2",
    env: "staging",
    rolloutPct: 100,
    enabled: true,
    note: "预发全量；生产灰度见 rollout。",
    updatedAt: "2026-05-12 11:00",
  },
  {
    id: "ff-003",
    key: "model_router_v2",
    name: "路由引擎 v2",
    env: "production",
    rolloutPct: 15,
    enabled: true,
    note: "按客户 ID 哈希灰度。",
    updatedAt: "2026-05-12 11:00",
  },
  {
    id: "ff-004",
    key: "export_async_v2",
    name: "报表异步导出 v2",
    env: "production",
    rolloutPct: 50,
    enabled: true,
    note: "与数据导出审批队列联动。",
    updatedAt: "2026-05-10 09:30",
  },
];

export const DEFAULT_GLOBAL_PARAMS: GlobalParamRow[] = [
  {
    id: "gp-001",
    key: "billing.timezone",
    label: "计费与日切时区",
    value: "Asia/Shanghai",
    category: "计费",
    updatedAt: "2026-05-14 18:03",
    updatedBy: "zhang.san",
  },
  {
    id: "gp-002",
    key: "rate_limit.default_rpm",
    label: "全站默认 RPM",
    value: "1200",
    category: "限流",
    updatedAt: "2026-05-10 09:00",
    updatedBy: "zhang.san",
  },
  {
    id: "gp-003",
    key: "api.version_policy",
    label: "对外 API 版本策略",
    value: "v1 默认 · v2 需 Header Accept",
    category: "网关",
    updatedAt: "2026-05-08 14:00",
    updatedBy: "li.si",
  },
  {
    id: "gp-004",
    key: "maintenance.banner_text",
    label: "维护模式租户提示",
    value: "系统维护中，预计 30 分钟内恢复。",
    category: "运营",
    updatedAt: "2026-05-14 16:40",
    updatedBy: "wang.wu",
  },
];

export const MAINTENANCE_FLAG_KEY = "maintenance_mode";
