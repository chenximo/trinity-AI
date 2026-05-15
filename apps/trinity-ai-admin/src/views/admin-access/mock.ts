/** 平台权限（§4.12）子路由 id，须与 `moduleSecondaryPages` 中 `tai-admin-access` 一致 */

export const ACCESS_PANEL_ORDER = [
  "admins",
  "roles",
  "menus",
] as const;

export type AccessPanelId = (typeof ACCESS_PANEL_ORDER)[number];

export type PlatformAdminRow = {
  id: string;
  displayName: string;
  loginId: string;
  roleIds: string[];
  status: "启用" | "禁用";
  updatedAt: string;
};

export type PlatformRoleRow = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  /** 菜单（路由）+ 数据范围要点；管理员列表按绑定角色聚合去重；页内按钮级二期不设 */
  permissionLines?: string[];
};

export const DEFAULT_PLATFORM_ROLES: PlatformRoleRow[] = [
  {
    id: "role-platform-admin",
    name: "平台超级管理员",
    description: "全部菜单与数据范围；仅少数账号。",
    updatedAt: "2026-05-10 09:00",
    permissionLines: [
      "菜单：全部侧栏与子路由（路由级可配置，含平台权限、系统与合规）。",
      "数据范围：全平台租户与密钥元数据。",
    ],
  },
  {
    id: "role-ops",
    name: "运营",
    description: "供应商、模型、监控；客户主数据只读。（v1 不含「API 与路由策略」模块）",
    updatedAt: "2026-05-10 09:00",
    permissionLines: [
      "菜单：工作台、监控运维、供应商、模型（路由级可改配置）；用量与计费、客户与合同（路由级仅查看）。",
      "数据范围：全平台；客户主数据以只读为主。",
    ],
  },
  {
    id: "role-finance-viewer",
    name: "财务只读",
    description: "用量与计费、报表导出（受导出审批约束）。",
    updatedAt: "2026-05-10 09:00",
    permissionLines: [
      "菜单：工作台、用量与计费、报表中心（路由级仅查看）；其余模块不展示或占位只读。",
      "数据范围：全平台财务视图。",
    ],
  },
  {
    id: "role-readonly",
    name: "全局只读",
    description: "全部菜单路由仅查看（不改配置）。",
    updatedAt: "2026-05-10 09:00",
    permissionLines: [
      "菜单：全部侧栏与子路由（路由级仅查看，不改配置）。",
      "数据范围：全平台只读。",
    ],
  },
];

/** 单角色展示用权限行（无自定义时回落到预置或说明） */
export function rolePermissionLines(role: PlatformRoleRow): string[] {
  if (role.permissionLines && role.permissionLines.length > 0) return role.permissionLines;
  const preset = DEFAULT_PLATFORM_ROLES.find((x) => x.id === role.id);
  if (preset?.permissionLines && preset.permissionLines.length > 0) return [...preset.permissionLines];
  const d = role.description.trim();
  return d ? [d] : ["（未配置权限要点）"];
}

/** 管理员绑定多角色时：合并权限行并去重（顺序按角色 id 与行出现序） */
export function mergedPermissionLinesForAdmin(roleIds: string[], roles: PlatformRoleRow[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of roleIds) {
    const r = roles.find((x) => x.id === id);
    if (!r) continue;
    for (const line of rolePermissionLines(r)) {
      const t = line.trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

export const DEFAULT_PLATFORM_ADMINS: PlatformAdminRow[] = [
  {
    id: "adm-001",
    displayName: "张三",
    loginId: "zhang.san",
    roleIds: ["role-platform-admin"],
    status: "启用",
    updatedAt: "2026-05-10 10:12",
  },
  {
    id: "adm-002",
    displayName: "李四",
    loginId: "li.si",
    roleIds: ["role-ops"],
    status: "启用",
    updatedAt: "2026-05-09 16:40",
  },
  {
    id: "adm-003",
    displayName: "王五",
    loginId: "wang.wu",
    roleIds: ["role-readonly"],
    status: "禁用",
    updatedAt: "2026-05-08 11:05",
  },
];

/** 数据范围子页：核心枚举（与 §4.12「数据范围」、§3 角色表对齐） */
export type DataScopeBlock = {
  key: string;
  title: string;
  intro: string;
  bullets: string[];
  listBehavior: string;
  typicalRoles: string;
};

export const DATA_SCOPE_BLOCKS: DataScopeBlock[] = [
  {
    key: "all",
    title: "全平台",
    intro:
      "不强制按客户组 / 负责人切片；在**已授权菜单（路由）**下，可检索与处理全站租户、组织与相关计量数据。",
    bullets: [
      "客户与合同、用量明细、API 密钥元数据、报表等列表默认**不**自动加上「仅本组」类条件。",
      "跨客户跳转、全局检索、审计留痕检索等场景以此为前提。",
      "高危动作（删租户、批量导出等）仍走审批与审计，与数据范围正交。",
    ],
    listBehavior:
      "进入列表时不注入组织标签过滤；操作员可用手动筛选（客户、项目、时间窗）自行缩窄。",
    typicalRoles: "平台超级管理员；需全站排障的运营 / 风控（只读或受控写）。",
  },
  {
    key: "group",
    title: "客户组（组织标签）",
    intro:
      "通过 **客户组 ID / 组织标签**（如「华东 enterprise」「战略客户包」）将员工与一批客户组织绑定；带客户主键的列表默认落在该集合内。",
    bullets: [
      "适用于商务、区域客户成功、一线客服等「日常只应看到自己盘子里的客户」。",
      "可与工作台待办、工单指派「仅处理本组客户」联动（v2）。",
      "跨组查看通常需 elevated 角色、临时授权或审批单（正式版策略）。",
    ],
    listBehavior:
      "服务端或 BFF 在列表查询上附加 `customer_group_id` / 标签条件；无权限时不返回组外行（而非仅前端隐藏）。",
    typicalRoles: "商务 / 客户成功（§3）；部分只读客服坐席。",
  },
  {
    key: "self",
    title: "仅本人",
    intro:
      "仅可访问**本人创建**、**本人为处理人**或**明确指派给自己**的数据；适用于外包审核、兼职岗、强隔离场景。",
    bullets: [
      "典型对象：审核队列条目、导出任务 owner、工单责任人、个人草稿。",
      "与「客户组」可同时生效时，一般取 **交集（更严）**（先组内、再本人）；正式版可配置。",
      "禁止通过改 URL 参数窥探他人队列：以服务端 session 身份为准。",
    ],
    listBehavior:
      "列表默认条件含 `assignee_id = 当前员工` 或 `created_by = 当前员工`；离开队列类页面即不携带该隐式条件。",
    typicalRoles: "外包审核、兼职风控、一线客服（写少、队列型）。",
  },
];

/** 设计中常见的其它切片（§3 表延伸；与菜单路由正交；本期文案说明，二期可做枚举绑定） */
export const DATA_SCOPE_EXTENDED_SLICES: { key: string; title: string; body: string }[] = [
  {
    key: "customer-dim",
    title: "客户维度（负责客户集）",
    body:
      "商务 / 客户成功常用：在「客户组」之上再按「我负责的客户」过滤，用于合同、套餐变更申请列表；可与 CRM 同步维护负责关系。",
  },
  {
    key: "finance",
    title: "财务域 + 脱敏",
    body:
      "账单、发票、对账、报表导出等：客户标识、地址等按脱敏策略展示；导出走异步任务与导出审批（§4.13），与「全平台」可读但不可随意导出区分。",
  },
  {
    key: "risk",
    title: "风控域",
    body:
      "用户审核、黑名单、异常用量、审计检索等：列表常带风险等级、处置状态过滤；与监控告警、工作台待办深链。",
  },
  {
    key: "cs",
    title: "客服（只读为主 + 有限写）",
    body:
      "主读客户信息、用量解释、文档指引；若二期上工单，仅工单正文 / 备注等窄写权限，不改变客户主数据与计费。",
  },
];

export const DATA_SCOPE_COMBINE_RULE =
  "同一管理员绑定**多个角色**且数据范围不同时：列表与检索的默认可见集合在原型中按各角色范围的**并集（取宽）**理解，以免协作被误挡；若合规要求**取严（交集）**或按业务域拆分策略，留待正式版与组织策略、权限服务一并配置。";

export const DATA_SCOPE_ROLE_BINDING_NOTE =
  "当前在「角色」子页用「权限要点」中的「数据范围：……」**自由文本**维护，并与本页各小节语义对齐；后续建议在角色上增加**结构化枚举**（全平台 / 客户组 / 仅本人 + 扩展切片），由网关或 BFF 统一注入查询条件，避免仅靠前端筛选。";
