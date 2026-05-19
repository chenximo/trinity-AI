/** 文档中心（§4.9）子路由 id，须与 `moduleSecondaryPages` 中 `tai-admin-docs` 一致 */

export const DOC_PANEL_ORDER = ["list", "publish", "visibility"] as const;

export type DocPanelId = (typeof DOC_PANEL_ORDER)[number];

export type DocRow = {
  id: string;
  title: string;
  slug: string;
  type: "用户指南" | "供应商 API" | "公告" | "内部 Runbook";
  status: "草稿" | "评审中" | "已发布" | "已归档";
  owner: string;
  updatedAt: string;
  version: string;
  /** 编辑页正文 mock（非真 Markdown 引擎） */
  body: string;
};

export type DocVersionRow = {
  id: string;
  docId: string;
  version: string;
  branch: "draft" | "release";
  author: string;
  at: string;
  note: string;
};

export type PublishJobRow = {
  id: string;
  docId: string;
  docTitle: string;
  targetVersion: string;
  requestedBy: string;
  requestedAt: string;
  status: "待发布审批" | "已排期" | "已上线" | "已回滚";
  scheduledAt: string;
};

export type VisibilityRuleRow = {
  id: string;
  docId: string;
  docTitle: string;
  scope: "公开" | "登录可见" | "指定客户";
  customerHint: string;
  updatedAt: string;
};

export const DEFAULT_DOC_ROWS: DocRow[] = [
  {
    id: "doc-001",
    title: "快速开始：创建 API 密钥",
    slug: "/docs/quickstart-keys",
    type: "用户指南",
    status: "已发布",
    owner: "zhang.san",
    updatedAt: "2026-05-14 10:00",
    version: "v1.4",
    body: "# 快速开始\n\n1. 进入控制台 …\n2. 创建密钥 …\n\n（mock 正文）",
  },
  {
    id: "doc-002",
    title: "OpenAI 兼容路由字段说明",
    slug: "/docs/api/chat-completions",
    type: "供应商 API",
    status: "评审中",
    owner: "li.si",
    updatedAt: "2026-05-13 16:20",
    version: "v0.9-draft",
    body: "## 请求体\n\n`model` / `messages` …\n\n（mock）",
  },
  {
    id: "doc-003",
    title: "2026-05 网关维护公告",
    slug: "/docs/announcements/202605-gw",
    type: "公告",
    status: "草稿",
    owner: "wang.wu",
    updatedAt: "2026-05-12 09:15",
    version: "v0.1",
    body: "尊敬的用户：\n\n我们将于 …\n\n（mock）",
  },
  {
    id: "doc-004",
    title: "供应商拨测失败 Runbook",
    slug: "/internal/runbooks/probe-fail",
    type: "内部 Runbook",
    status: "已发布",
    owner: "li.si",
    updatedAt: "2026-05-10 11:40",
    version: "v2.0",
    body: "## 触发条件\n\n连续 5 次 5xx …\n\n（mock）",
  },
];

export const DEFAULT_VERSION_ROWS: DocVersionRow[] = [
  {
    id: "ver-001",
    docId: "doc-001",
    version: "v1.4",
    branch: "release",
    author: "zhang.san",
    at: "2026-05-14 10:00",
    note: "补充密钥轮换段落",
  },
  {
    id: "ver-002",
    docId: "doc-001",
    version: "v1.3",
    branch: "release",
    author: "zhang.san",
    at: "2026-05-01 14:22",
    note: "首版对外",
  },
  {
    id: "ver-003",
    docId: "doc-002",
    version: "v0.9-draft",
    branch: "draft",
    author: "li.si",
    at: "2026-05-13 16:20",
    note: "待法务确认示例字段",
  },
];

export const DEFAULT_PUBLISH_JOBS: PublishJobRow[] = [
  {
    id: "pub-001",
    docId: "doc-002",
    docTitle: "OpenAI 兼容路由字段说明",
    targetVersion: "v1.0",
    requestedBy: "li.si",
    requestedAt: "2026-05-14 09:00",
    status: "待发布审批",
    scheduledAt: "—",
  },
  {
    id: "pub-002",
    docId: "doc-001",
    docTitle: "快速开始：创建 API 密钥",
    targetVersion: "v1.4",
    requestedBy: "zhang.san",
    requestedAt: "2026-05-14 08:55",
    status: "已上线",
    scheduledAt: "2026-05-14 10:05",
  },
];

export const DEFAULT_VISIBILITY_RULES: VisibilityRuleRow[] = [
  {
    id: "vis-001",
    docId: "doc-001",
    docTitle: "快速开始：创建 API 密钥",
    scope: "公开",
    customerHint: "—",
    updatedAt: "2026-05-14 10:00",
  },
  {
    id: "vis-002",
    docId: "doc-004",
    docTitle: "供应商拨测失败 Runbook",
    scope: "登录可见",
    customerHint: "仅平台管理员与运营",
    updatedAt: "2026-05-10 11:40",
  },
  {
    id: "vis-003",
    docId: "doc-002",
    docTitle: "OpenAI 兼容路由字段说明",
    scope: "指定客户",
    customerHint: "org: acme-lab, beta-io（示意）",
    updatedAt: "2026-05-13 16:20",
  },
];

export function statusBadgeClass(status: DocRow["status"]): string {
  if (status === "已发布") return "doc-page__badge doc-page__badge--ok";
  if (status === "评审中") return "doc-page__badge doc-page__badge--warn";
  if (status === "草稿") return "doc-page__badge doc-page__badge--muted";
  return "doc-page__badge doc-page__badge--muted";
}

export function publishStatusClass(s: PublishJobRow["status"]): string {
  if (s === "已上线") return "doc-page__badge doc-page__badge--ok";
  if (s === "待发布审批") return "doc-page__badge doc-page__badge--warn";
  if (s === "已回滚") return "doc-page__badge doc-page__badge--danger";
  return "doc-page__badge doc-page__badge--muted";
}
