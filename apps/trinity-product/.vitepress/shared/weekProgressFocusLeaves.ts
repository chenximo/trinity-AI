/**
 * AI API 聚合产品 · 周计划 focus 可选标准叶子（与侧栏叶子页、frontmatter title 一致）
 * 增删叶子页时同步 .vitepress/config.ts 与本文件。
 */
export interface WeekFocusLeaf {
  /** 写入 week-progress.yml 的 focus 片段（与页面 title 一致） */
  label: string;
  /** 相对 ai-api-platform/index.md 的链接 */
  href: string;
  group: "用户侧" | "平台侧" | "运营后台" | "API 测试";
}

export const AI_API_FOCUS_LEAVES: WeekFocusLeaf[] = [
  { group: "用户侧", label: "列表", href: "./user/models/list" },
  { group: "用户侧", label: "模型排名", href: "./user/models/rankings" },
  { group: "用户侧", label: "模型详情", href: "./user/models/model-detail-requirements" },
  { group: "用户侧", label: "Chat 在线体验", href: "./user/chat-experience" },
  { group: "用户侧", label: "开发者文档", href: "./user/developer-docs" },
  { group: "用户侧", label: "用户控制台", href: "./user/account-console" },
  { group: "平台侧", label: "统一 API 基座", href: "./platform/unified-api" },
  { group: "平台侧", label: "生文 API + 流式", href: "./platform/chat-completions" },
  { group: "平台侧", label: "多模态 API", href: "./platform/multimodal-api" },
  { group: "平台侧", label: "鉴权 · 限流 · 配额", href: "./platform/auth-rate-quota" },
  { group: "平台侧", label: "路由与 Fallback", href: "./platform/routing-fallback" },
  { group: "平台侧", label: "计量与计费", href: "./platform/metering-billing" },
  { group: "平台侧", label: "数据策略", href: "./platform/data-policies" },
  { group: "平台侧", label: "标准错误与可观测", href: "./platform/errors-observability" },
  { group: "运营后台", label: "运营工作台", href: "./operations/dashboard" },
  { group: "运营后台", label: "供应商管理", href: "./operations/suppliers" },
  { group: "运营后台", label: "模型上架与供应线路", href: "./operations/models-routes" },
  { group: "运营后台", label: "密钥管理", href: "./operations/keys" },
  { group: "运营后台", label: "用量与计费", href: "./operations/billing" },
  { group: "运营后台", label: "监控与风控", href: "./operations/monitoring-risk" },
  { group: "运营后台", label: "用户注册与审核", href: "./operations/users" },
  { group: "运营后台", label: "权限与操作审计", href: "./operations/access-audit" },
  { group: "运营后台", label: "客户与合同", href: "./operations/customers" },
  { group: "运营后台", label: "文档中心（运营发布）", href: "./operations/docs-publish" },
  { group: "运营后台", label: "报表中心", href: "./operations/reports" },
  { group: "API 测试", label: "API 内测文档", href: "./api-test/internal-api-doc" },
  { group: "API 测试", label: "生文验收台", href: "./api-test/chat-completions" },
  { group: "API 测试", label: "生文验收路线图", href: "./api-test/roadmap" },
  { group: "API 测试", label: "Chat API Test", href: "./api-test/reports/chat-api-test" },
];

const FOCUS_GROUPS = ["用户侧", "平台侧", "运营后台", "API 测试"] as const;

export function focusLeavesByGroup(group: (typeof FOCUS_GROUPS)[number]): WeekFocusLeaf[] {
  return AI_API_FOCUS_LEAVES.filter((l) => l.group === group);
}

export { FOCUS_GROUPS };

/** 看板标签 → 叶子链接；未知片段无链接 */
export function focusHrefForItem(item: string): string | null {
  const t = item.trim();
  if (!t) return null;
  const exact = AI_API_FOCUS_LEAVES.find((l) => l.label === t);
  if (exact) return exact.href;
  return null;
}

export function isKnownFocusLabel(label: string): boolean {
  return AI_API_FOCUS_LEAVES.some((l) => l.label === label.trim());
}
