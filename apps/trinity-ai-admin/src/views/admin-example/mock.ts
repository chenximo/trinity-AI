/** 列表页模板示例 · 假数据 */

export interface ExampleRow {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  projectName: string;
  creatorLogin: string;
  createdAt: string;
  expiresAt: string;
  purpose: string;
  status: "正常" | "已冻结" | "已吊销";
  bindingCount: number;
  lastCallAt: string;
  lastRegion: string;
}

export const DEFAULT_EXAMPLE_ROWS: ExampleRow[] = [
  {
    id: "ex-001",
    name: "生产网关",
    orgId: "org-acme",
    orgName: "示例科技（合同主体）",
    projectName: "对外 API 项目",
    creatorLogin: "ops-admin",
    createdAt: "2026-05-10 22:01",
    expiresAt: "2027-04-02",
    purpose: "生产网关上游",
    status: "正常",
    bindingCount: 3,
    lastCallAt: "2026-05-10 22:01",
    lastRegion: "gpt-4o-mini · 华东·上海",
  },
  {
    id: "ex-002",
    name: "历史轮换残留",
    orgId: "org-acme",
    orgName: "示例科技（合同主体）",
    projectName: "遗留集成",
    creatorLogin: "ops-admin",
    createdAt: "2026-01-15 11:20",
    expiresAt: "2026-01-01",
    purpose: "历史轮换",
    status: "已吊销",
    bindingCount: 0,
    lastCallAt: "2026-01-15 11:20",
    lastRegion: "text-embedding-3-small · 华北·北京",
  },
  {
    id: "ex-003",
    name: "测试环境",
    orgId: "org-beta",
    orgName: "测试公司",
    projectName: "内部测试",
    creatorLogin: "ops-dev",
    createdAt: "2026-05-18 09:30",
    expiresAt: "2027-05-18",
    purpose: "测试环境调用",
    status: "正常",
    bindingCount: 1,
    lastCallAt: "2026-05-19 10:00",
    lastRegion: "claude-3-haiku · 华南·广州",
  },
  {
    id: "ex-004",
    name: "预发布验证",
    orgId: "org-beta",
    orgName: "测试公司",
    projectName: "预发布",
    creatorLogin: "ops-dev",
    createdAt: "2026-05-15 14:00",
    expiresAt: "2026-12-31",
    purpose: "预发布环境验证",
    status: "已冻结",
    bindingCount: 0,
    lastCallAt: "2026-05-15 14:00",
    lastRegion: "—",
  },
];
