/**
 * §4.8 API 密钥（平台运营视角）— 原型假数据。不含真实密钥串，仅脱敏前缀与占位字段。
 */

export const KEY_PANEL_ORDER = ["list", "audit"] as const;
export type KeyPanelId = (typeof KEY_PANEL_ORDER)[number];

export type PlatformKeyStatus = "正常" | "已冻结" | "已吊销";

export type PlatformKeyRow = {
  id: string;
  displayName: string;
  /** 脱敏展示，如 sk_live_AbCd… */
  fingerprintPrefix: string;
  orgId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  creatorLogin: string;
  createdAt: string;
  status: PlatformKeyStatus;
  lastCallAt: string;
  lastCallModel: string;
  lastRegion: string;
  tags: string[];
};

export type KeyAuditRow = {
  id: string;
  at: string;
  actor: string;
  keyId: string;
  keyLabel: string;
  action: "冻结" | "解冻" | "吊销" | "检索查看" | "导出审计";
  detail: string;
};

export const DEFAULT_PLATFORM_KEYS: PlatformKeyRow[] = [
  {
    id: "pk-demo-001",
    displayName: "生产网关",
    fingerprintPrefix: "sk_live_AbCdEf…",
    orgId: "org-acme",
    orgName: "示例科技（合同主体）",
    projectId: "prj-api",
    projectName: "对外 API 项目",
    creatorLogin: "zhangsan",
    createdAt: "2026-04-02 10:12",
    status: "正常",
    lastCallAt: "2026-05-10 22:01",
    lastCallModel: "gpt-4o-mini",
    lastRegion: "华东 · 上海",
    tags: ["生产", "高调用"],
  },
  {
    id: "pk-demo-002",
    displayName: "联调沙箱",
    fingerprintPrefix: "sk_test_Xy12…",
    orgId: "org-beta",
    orgName: "内测客户 B",
    projectId: "prj-sandbox",
    projectName: "沙箱",
    creatorLogin: "lisi",
    createdAt: "2026-04-18 16:40",
    status: "已冻结",
    lastCallAt: "2026-05-08 09:44",
    lastCallModel: "claude-3-5-sonnet",
    lastRegion: "境外 · 美西",
    tags: ["沙箱", "异常地域"],
  },
  {
    id: "pk-demo-003",
    displayName: "历史轮换残留",
    fingerprintPrefix: "sk_live_Zz99…",
    orgId: "org-acme",
    orgName: "示例科技（合同主体）",
    projectId: "prj-legacy",
    projectName: "遗留集成",
    creatorLogin: "zhangsan",
    createdAt: "2025-11-01 08:00",
    status: "已吊销",
    lastCallAt: "2026-01-15 11:20",
    lastCallModel: "text-embedding-3-small",
    lastRegion: "华北 · 北京",
    tags: ["已轮换"],
  },
];

export const DEFAULT_KEY_AUDIT_ROWS: KeyAuditRow[] = [
  {
    id: "ka-1",
    at: "2026-05-10 21:58",
    actor: "ops-li",
    keyId: "pk-demo-001",
    keyLabel: "生产网关",
    action: "检索查看",
    detail: "全站检索打开详情抽屉（示意）",
  },
  {
    id: "ka-2",
    at: "2026-05-09 14:22",
    actor: "ops-li",
    keyId: "pk-demo-002",
    keyLabel: "联调沙箱",
    action: "冻结",
    detail: "原因码 RISK_GEO；网关拒绝约 30s 内生效（产品提示）",
  },
];
