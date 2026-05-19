/**
 * 各一级模块下的「二级页面」清单（与详细设计 §4.x 表「二级页面」列对齐）。
 * `id` 用于子路由 path 段与侧栏子菜单，如 `suppliers/list`。
 */

export type SecondaryPageDef = {
  id: string;
  title: string;
  summary: string;
};

/** key = 父级路由 `name`（如 `tai-admin-suppliers`） */
export const SECONDARY_PAGES_BY_ROUTE_NAME: Partial<Record<string, SecondaryPageDef[]>> = {
  "tai-admin-suppliers": [
    { id: "list", title: "供应商列表", summary: "分页检索、状态、健康摘要；进入档案 / 对接 / 探测。" },
    { id: "profile", title: "档案与结算", summary: "法人主体、结算周期、付款条件、联系人。" },
    { id: "integration", title: "对接配置", summary: "API 类型、Base URL、**API₂ Profile/JSON** 引用、超时与重试默认值。" },
    { id: "probe", title: "连通性探测", summary: "拨测任务、最近结果、失败原因；联动监控告警。" },
    { id: "key-rotation", title: "密钥轮换策略", summary: "凭据生命周期与网关注入方式说明（原型仅占位）。" },
  ],
  "tai-admin-models": [
    { id: "list", title: "模型列表", summary: "平台模型 ID、状态、线路数摘要；批量与检索入口。" },
    { id: "master", title: "主数据", summary: "展示名、能力标签、文档锚点；**API₁ 原生商**主数据可挂此页。" },
    { id: "lines", title: "供应线路", summary: "**API₁/API₂**、Profile、Mapper、成本与区域；线路优先级与探测。" },
    { id: "bindings", title: "路由绑定", summary: "模型路由与平台密钥绑定、优先级与启停（对齐后端 §4.2.4）。" },
    { id: "pricing", title: "刊例与成本（可选）", summary: "刊例价、内部成本；与用量试算联动。" },
  ],
  // v1 不做「API 与路由策略」（§4.6 / P5）；与 `adminNavTree.ts` 中 routing 模块同步恢复。
  // "tai-admin-routing": [
  //   { id: "rules", title: "路由规则", summary: "按客户/模型/标签匹配；冲突优先级提示。" },
  //   { id: "fallback", title: "Fallback 链", summary: "有序备路、触发条件；与 §4.5.1 线路优先级一致。" },
  //   { id: "gray", title: "灰度发布", summary: "百分比、白名单、时间窗；与模型页「流量灰度」分工。" },
  //   { id: "rate-limit", title: "限流模板", summary: "全站默认与 Burst；与套餐/客户例外覆盖关系。" },
  //   { id: "exceptions", title: "客户 / 模型例外", summary: "例外规则与主表合并/覆盖顺序。" },
  // ],
  "tai-admin-customers": [
    { id: "tenants", title: "租户列表", summary: "客户组织检索、认证摘要；进入组织/合同/授信。" },
    { id: "org", title: "组织 / 项目", summary: "合同主体下团队结构；与用量分摊、密钥归属对齐。" },
    { id: "contract", title: "合同", summary: "期限、折扣、绑定 SKU；到期提醒进工作台。" },
    { id: "invoice", title: "发票与抬头", summary: "开票抬头、税号、发票申请状态机。" },
    { id: "credit", title: "授信", summary: "信用额度、大额授信审批流。" },
  ],
  "tai-admin-keys": [
    { id: "platform-keys", title: "平台密钥", summary: "上游平台 API Key；掩码展示、gate 明文、绑定路由数。" },
    { id: "user-keys", title: "用户密钥", summary: "运营视角用户 API Key；限额、窗口、撤销（对齐 §4.3.3）。" },
    { id: "audit", title: "审计轨迹", summary: "后台谁对哪把 Key 做了什么（如冻结及原因）；非调用次数日志。" },
  ],
  "tai-admin-risk": [
    { id: "rules", title: "风控规则", summary: "IP 限流/拉黑策略：窗口、双阈值、TTL、启停（观测见「实时大盘」）。" },
    { id: "action-logs", title: "风控动作日志", summary: "已执行的限流/拉黑记录；按 IP、动作、时间检索。" },
  ],
  "tai-admin-docs": [
    { id: "list", title: "文档列表", summary: "类型、状态、负责人；筛选与批量操作。" },
    { id: "editor", title: "编辑与版本", summary: "Markdown/外链、diff、草稿与发布分支。" },
    { id: "publish", title: "发布与回滚", summary: "发布审批、一键回滚、静态刷新说明。" },
    { id: "visibility", title: "可见范围", summary: "公开/登录/指定客户组；与客户组织 ID 绑定。" },
  ],
  "tai-admin-reports": [
    { id: "preset", title: "预置报表", summary: "用量与消耗、收入试算等固定模板与参数面板。" },
    { id: "olap", title: "多维分析", summary: "OLAP 类探索（可二期）；与用量明细互跳。" },
    { id: "export", title: "导出任务", summary: "异步导出、下载链接有效期；与导出审批衔接。" },
    { id: "subscribe", title: "订阅推送（二期）", summary: "周期推送与订阅管理。" },
  ],
  "tai-admin-users": [
    { id: "list", title: "用户列表", summary: "检索、状态、所属客户组织。" },
    { id: "audit-queue", title: "审核队列", summary: "待审、批量通过/拒绝；联动工作台待办 v2。" },
    { id: "whitelist", title: "白名单", summary: "域名/号段放行规则。" },
    { id: "blacklist", title: "黑名单", summary: "拒绝登录与调用策略。" },
    { id: "kyc", title: "实名 / 企业认证", summary: "材料上传与人工审核流。" },
  ],
  "tai-admin-access": [
    { id: "admins", title: "管理员", summary: "员工账号、启用/禁用、重置密码、最近登录。" },
    { id: "roles", title: "角色", summary: "预置与自定义角色、权限点矩阵、只读模板套用。" },
    { id: "menus", title: "菜单（路由）", summary: "与侧栏、子路由一致；与权限点联动预览。" },
    { id: "data-scope", title: "数据范围", summary: "workspace/模块/敏感字段查询范围（§4.5.4）。" },
  ],
  "tai-admin-system": [
    { id: "audit-log", title: "操作审计", summary: "配置类操作检索；改前/改后 diff 与导出。" },
    { id: "security-events", title: "安全事件", summary: "登录失败、越权、credential gate 失败等。" },
    { id: "sensitive", title: "敏感操作审批", summary: "删客户、批量导出等二次验证/双人复核。" },
    { id: "export-approval", title: "数据导出审批", summary: "与大客户数据包导出衔接。" },
    { id: "flags", title: "特性开关", summary: "功能灰度、维护模式总开关。" },
    { id: "global", title: "全局参数", summary: "计费时区、默认限流、对外 API 版本策略。" },
  ],
};

export function getParentRouteNameFromStubChildRoute(routeName: string): string | undefined {
  const keys = Object.keys(SECONDARY_PAGES_BY_ROUTE_NAME) as string[];
  for (const parent of keys) {
    if (routeName === parent) return parent;
    if (routeName.startsWith(`${parent}-`)) return parent;
  }
  return undefined;
}

/** 过滤无 id 的二级项，避免生成 `tai-admin-*-undefined` 路由 */
export function getValidSecondaryPages(parentRouteName: string): SecondaryPageDef[] {
  return (SECONDARY_PAGES_BY_ROUTE_NAME[parentRouteName] ?? []).filter(
    (p): p is SecondaryPageDef => typeof p?.id === "string" && p.id.length > 0,
  );
}

/** 占位子页：取父模块下全部二级定义 */
export function getSecondaryPagesForParent(parentRouteName: string): SecondaryPageDef[] {
  return getValidSecondaryPages(parentRouteName);
}

export function defaultSecondaryRouteName(parentRouteName: string): string | undefined {
  const first = getValidSecondaryPages(parentRouteName)[0];
  return first ? `${parentRouteName}-${first.id}` : undefined;
}

/** 兼容：根据子路由名解析父模块后返回整表（供占位页高亮当前子页） */
export function getSecondaryPagesForRoute(routeName: string | symbol | undefined): SecondaryPageDef[] {
  if (typeof routeName !== "string") return [];
  const parent = getParentRouteNameFromStubChildRoute(routeName);
  if (parent) return getSecondaryPagesForParent(parent);
  return SECONDARY_PAGES_BY_ROUTE_NAME[routeName] ?? [];
}
