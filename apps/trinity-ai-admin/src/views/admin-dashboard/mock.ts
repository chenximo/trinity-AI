/** 工作台假数据，对齐 `docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` §4.1 */

export type DashboardKpiIcon = "activity" | "shield" | "users" | "wallet";

export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  /** 主指标下方一行说明 */
  sublabel: string;
  /** 环比/对比等弱提示 */
  delta: string;
  /** 语义色：好 / 警告 / 危险 */
  tone: "ok" | "warn" | "bad";
  icon: DashboardKpiIcon;
};

export const DASHBOARD_KPIS: DashboardKpi[] = [
  {
    id: "calls",
    label: "今日调用量",
    value: "128.4k",
    sublabel: "网关聚合成功请求",
    delta: "环比 +12%",
    tone: "ok",
    icon: "activity",
  },
  {
    id: "err",
    label: "错误率",
    value: "0.42%",
    sublabel: "5xx / 429 合计",
    delta: "较昨日 ↓ 0.05pt",
    tone: "ok",
    icon: "shield",
  },
  {
    id: "pending",
    label: "待处理事项",
    value: "11",
    sublabel: "审核 + 合同 + 配额",
    delta: "4 条紧急",
    tone: "warn",
    icon: "users",
  },
  {
    id: "arpu",
    label: "本月预估账单",
    value: "¥186k",
    sublabel: "已出账客户加权",
    delta: "试算 · 非开票额",
    tone: "ok",
    icon: "wallet",
  },
];

export type DashboardTodoKind = "用户审核" | "合同与授信" | "供应商" | "计费用量" | "平台权限";

export type DashboardTodo = {
  id: string;
  kind: DashboardTodoKind;
  title: string;
  urgent: boolean;
  code: string;
  meta: string;
  /** 列表右侧时间展示 */
  timeLabel: string;
  /** 「去处理」跳转 */
  routeName: string;
};

export const DASHBOARD_TODOS: DashboardTodo[] = [
  {
    id: "td-1",
    kind: "用户审核",
    title: "企业认证材料待审 · 示例科技",
    urgent: true,
    code: "KYC-20260514-003",
    meta: "组织 org-acme · 附件 4 份",
    timeLabel: "05-14 10:20",
    routeName: "tai-admin-users-audit-queue",
  },
  {
    id: "td-2",
    kind: "合同与授信",
    title: "合同 30 天内到期 · Acme 科技",
    urgent: true,
    code: "CT-2026-0601",
    meta: "企业 Pro · 自动续约关闭",
    timeLabel: "05-13 16:05",
    routeName: "tai-admin-customers-contract",
  },
  {
    id: "td-3",
    kind: "供应商",
    title: "线路 B 连续失败超阈值 · 火山",
    urgent: false,
    code: "SUP-PROBE-882",
    meta: "gpt-4o-mini · 华东",
    timeLabel: "05-13 09:40",
    routeName: "tai-admin-suppliers-probe",
  },
  {
    id: "td-4",
    kind: "计费用量",
    title: "配额软告警 · Beta Lab",
    urgent: false,
    code: "QTA-9281",
    meta: "按量后付 · 软顶 90%",
    timeLabel: "05-12 22:18",
    routeName: "tai-admin-billing-quota",
  },
  {
    id: "td-5",
    kind: "平台权限",
    title: "新管理员账号待启用 MFA",
    urgent: false,
    code: "ADM-014",
    meta: "角色：运营只读",
    timeLabel: "05-12 11:00",
    routeName: "tai-admin-access-admins",
  },
];

export type DashboardWidget = {
  id: string;
  title: string;
  summary: string;
  /** 跳转子路由 name */
  routeName: string;
};

export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  { id: "w1", title: "错误率 Top 模型", summary: "gpt-4o-mini · 0.9% · 腾讯云线路", routeName: "tai-admin-ops-live" },
  { id: "w2", title: "供应商降级提示", summary: "线路 B 已连续失败 6 次，已自动尝试备路", routeName: "tai-admin-models-lines" },
  { id: "w3", title: "合同 30 天内到期", summary: "Acme 科技 · 2026-06-01", routeName: "tai-admin-customers-contract" },
];

/** 工作台一级下的「二级页面」与 §4.1 / §2 表对齐（本页用分区承载，非各建独立 URL） */
export const DASHBOARD_SECONDARY_IA = [
  {
    id: "kpi",
    title: "概览 KPI",
    phase: "v1",
    summary: "卡片式 KPI、时间范围、只读；每卡可深链到监控/用量/客户/用户审核等一级模块。",
  },
  {
    id: "widgets",
    title: "关键 Widget",
    phase: "v1",
    summary: "只读卡片：错误 Top、降级提示、合同到期等；点击跳转对应模块的侧栏子菜单路由。",
  },
  {
    id: "todo",
    title: "待办中心",
    phase: "v2",
    summary: "跨模块人工队列聚合、筛选、指派/已读；独立子页，首版可不挂侧栏。",
  },
  {
    id: "shortcuts",
    title: "快捷入口",
    phase: "v2",
    summary: "可配置卡片/链接区；一键新建租户、SKU、上下架等。",
  },
];
