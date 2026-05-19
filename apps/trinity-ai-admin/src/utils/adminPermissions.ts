/** 后台 RBAC 权限点（对齐「创建后端需实现页面与功能」§6） */

export type PermissionDef = {
  key: string;
  label: string;
  group: string;
};

export const ADMIN_PERMISSION_CATALOG: PermissionDef[] = [
  { key: "dashboard:read", label: "工作台", group: "只读" },
  { key: "monitor:read", label: "监控", group: "只读" },
  { key: "usage_log:read", label: "用量日志", group: "只读" },
  { key: "billing_log:read", label: "计费流水", group: "只读" },
  { key: "risk_log:read", label: "风控日志", group: "只读" },
  { key: "audit_log:read", label: "审计日志", group: "只读" },
  { key: "doc:read", label: "文档", group: "只读" },
  { key: "model:write", label: "模型", group: "写" },
  { key: "provider:write", label: "供应商", group: "写" },
  { key: "platform_key:write", label: "平台密钥", group: "写" },
  { key: "route_binding:write", label: "路由绑定", group: "写" },
  { key: "risk_rule:write", label: "风控规则", group: "写" },
  { key: "admin_user:write", label: "后台用户", group: "写" },
  { key: "role:write", label: "角色", group: "写" },
  { key: "doc:write", label: "文档编辑", group: "写" },
  { key: "platform_key:reveal_secret", label: "平台密钥明文", group: "高危" },
  { key: "admin_user:reset_password", label: "重置密码", group: "高危" },
  { key: "role:grant_high_privilege", label: "授予高危权限", group: "高危" },
];

export type ReadonlyRoleTemplate = {
  id: string;
  name: string;
  description: string;
  permissionKeys: string[];
};

/** 批次 C1：只读角色模板（一键套用） */
export const READONLY_ROLE_TEMPLATES: ReadonlyRoleTemplate[] = [
  {
    id: "tpl-finance-viewer",
    name: "财务只读",
    description: "用量、计费、审计只读；无写权限。",
    permissionKeys: [
      "dashboard:read",
      "monitor:read",
      "usage_log:read",
      "billing_log:read",
      "audit_log:read",
    ],
  },
  {
    id: "tpl-risk-viewer",
    name: "风控只读",
    description: "监控、风控规则/日志、审计只读。",
    permissionKeys: ["dashboard:read", "monitor:read", "risk_log:read", "audit_log:read"],
  },
  {
    id: "tpl-ops-readonly",
    name: "运营只读（查询）",
    description: "日志与监控只读，不可改配置。",
    permissionKeys: [
      "dashboard:read",
      "monitor:read",
      "usage_log:read",
      "billing_log:read",
      "risk_log:read",
      "audit_log:read",
      "doc:read",
    ],
  },
];

export function permissionKeysToLines(keys: string[]): string[] {
  const map = new Map(ADMIN_PERMISSION_CATALOG.map((p) => [p.key, p.label]));
  return keys.map((k) => map.get(k) ?? k);
}
