/** 风控模块（对齐「创建后端需实现页面与功能」§4.4.2 / §4.4.3；运行监控见侧栏「实时大盘」） */

export const RISK_PANEL_ORDER = ["rules", "action-logs"] as const;
export type RiskPanelId = (typeof RISK_PANEL_ORDER)[number];

export type RiskRuleRow = {
  id: string;
  name: string;
  windowSec: number;
  rateLimitThreshold: number;
  blacklistThreshold: number;
  ttlSec: number;
  enabled: boolean;
  updatedAt: string;
};

export type RiskActionLogRow = {
  id: string;
  ip: string;
  actionType: "rate_limit" | "blacklist";
  scopeType: "global" | "model" | "key";
  hitCount: number;
  ruleSource: string;
  startedAt: string;
  endedAt: string;
};

export const RISK_ACTION_TYPE_LABEL: Record<RiskActionLogRow["actionType"], string> = {
  rate_limit: "限流",
  blacklist: "拉黑",
};

export const RISK_SCOPE_TYPE_LABEL: Record<RiskActionLogRow["scopeType"], string> = {
  global: "全局",
  model: "模型",
  key: "密钥",
};

export const DEFAULT_RISK_RULES: RiskRuleRow[] = [
  {
    id: "rr-global",
    name: "全局限流",
    windowSec: 60,
    rateLimitThreshold: 120,
    blacklistThreshold: 300,
    ttlSec: 3600,
    enabled: true,
    updatedAt: "2026-05-18 09:00",
  },
  {
    id: "rr-burst",
    name: "突发黑名单",
    windowSec: 10,
    rateLimitThreshold: 40,
    blacklistThreshold: 80,
    ttlSec: 7200,
    enabled: true,
    updatedAt: "2026-05-17 14:20",
  },
  {
    id: "rr-model",
    name: "单模型突增",
    windowSec: 30,
    rateLimitThreshold: 80,
    blacklistThreshold: 160,
    ttlSec: 1800,
    enabled: false,
    updatedAt: "2026-05-16 11:30",
  },
];

export const DEFAULT_RISK_ACTION_LOGS: RiskActionLogRow[] = [
  {
    id: "ra-001",
    ip: "203.0.113.42",
    actionType: "rate_limit",
    scopeType: "global",
    hitCount: 128,
    ruleSource: "rr-global",
    startedAt: "2026-05-18 14:10:00",
    endedAt: "2026-05-18 14:11:00",
  },
  {
    id: "ra-002",
    ip: "198.51.100.7",
    actionType: "blacklist",
    scopeType: "key",
    hitCount: 12,
    ruleSource: "rr-burst",
    startedAt: "2026-05-18 13:55:00",
    endedAt: "2026-05-18 15:55:00",
  },
  {
    id: "ra-003",
    ip: "192.0.2.88",
    actionType: "rate_limit",
    scopeType: "model",
    hitCount: 56,
    ruleSource: "rr-global",
    startedAt: "2026-05-18 12:20:00",
    endedAt: "2026-05-18 12:21:00",
  },
];

export function riskRuleLabelById(rules: readonly RiskRuleRow[], ruleId: string): string {
  return rules.find((r) => r.id === ruleId)?.name ?? ruleId;
}
