/**
 * 侧栏信息架构：一级为可折叠「模块」，二级为子菜单路由（与详细设计二级页面对齐）。
 * 路由真源仍以 `trinityAdminRoutes.ts` 为准；此处供壳层渲染与文档对照。
 */

import { BILLING_TABS } from "../admin-billing/mock";
import { leafIconKey, MODULE_ICON_BY_PATH, type NavIconKey } from "./adminNavIcons";
import { getValidSecondaryPages } from "./moduleSecondaryPages";

export type NavLeaf = {
  path: string;
  routeName: string;
  label: string;
  iconKey: NavIconKey;
  designRef: string;
  planBatch: string;
};

export type NavSubmenu = {
  kind: "submenu";
  id: string;
  label: string;
  iconKey: NavIconKey;
  designRef: string;
  planBatch: string;
  children: NavLeaf[];
};

export type NavSingleton = NavLeaf & { kind: "single" };

export type NavEntry = NavSingleton | NavSubmenu;

export type AdminModuleBase = {
  pathBase: string;
  parentRouteName: string;
  label: string;
  designRef: string;
  planBatch: string;
};

/** §4.8 · 侧栏在「实时大盘」之后 */
export const ADMIN_KEYS_MODULE: AdminModuleBase = {
  pathBase: "keys",
  parentRouteName: "tai-admin-keys",
  label: "API 密钥",
  designRef: "§4.8",
  planBatch: "P7",
};

export const ADMIN_RISK_MODULE: AdminModuleBase = {
  pathBase: "risk",
  parentRouteName: "tai-admin-risk",
  label: "风控",
  designRef: "§4.4",
  planBatch: "P1b",
};

export const ADMIN_STUB_MODULE_BASES: AdminModuleBase[] = [
  { pathBase: "suppliers", parentRouteName: "tai-admin-suppliers", label: "供应商", designRef: "§4.4", planBatch: "P3" },
  { pathBase: "models", parentRouteName: "tai-admin-models", label: "模型管理", designRef: "§4.5 / §4.5.1", planBatch: "P4" },
  // v1 不做「API 与路由策略」（详设 §4.6 / 批次 P5）；恢复时取消注释并同步 `moduleSecondaryPages.ts`。
  // { pathBase: "routing", parentRouteName: "tai-admin-routing", label: "API 与路由策略", designRef: "§4.6", planBatch: "P5" },
  { pathBase: "customers", parentRouteName: "tai-admin-customers", label: "客户与合同", designRef: "§4.7", planBatch: "P6" },
  { pathBase: "docs", parentRouteName: "tai-admin-docs", label: "文档中心", designRef: "§4.9", planBatch: "P8" },
  { pathBase: "reports", parentRouteName: "tai-admin-reports", label: "报表中心", designRef: "§4.10", planBatch: "P8" },
  { pathBase: "users", parentRouteName: "tai-admin-users", label: "用户与认证", designRef: "§4.11", planBatch: "P9" },
  { pathBase: "access", parentRouteName: "tai-admin-access", label: "平台权限", designRef: "§4.12", planBatch: "P10" },
  { pathBase: "system", parentRouteName: "tai-admin-system", label: "系统与合规", designRef: "§4.13", planBatch: "P10" },
];

/** 路由注册用：含 API 密钥、风控与占位模块全集 */
export const ADMIN_ALL_MODULE_BASES: AdminModuleBase[] = [
  ADMIN_KEYS_MODULE,
  ADMIN_RISK_MODULE,
  ...ADMIN_STUB_MODULE_BASES,
];

function stubChildren(mod: AdminModuleBase): NavLeaf[] {
  const rows = getValidSecondaryPages(mod.parentRouteName);
  if (!rows.length) return [];
  return rows.map((r) => ({
    path: `${mod.pathBase}/${r.id}`,
    routeName: `${mod.parentRouteName}-${r.id}`,
    label: r.title,
    iconKey: leafIconKey(r.id),
    designRef: mod.designRef,
    planBatch: mod.planBatch,
  }));
}

function moduleToSubmenu(mod: AdminModuleBase): NavSubmenu {
  return {
    kind: "submenu",
    id: `nav-${mod.pathBase}`,
    label: mod.label,
    iconKey: MODULE_ICON_BY_PATH[mod.pathBase] ?? "menu",
    designRef: mod.designRef,
    planBatch: mod.planBatch,
    children: stubChildren(mod),
  };
}

const billingChildren: NavLeaf[] = BILLING_TABS.map((t) => ({
  path: `billing/${t.id}`,
  routeName: `tai-admin-billing-${t.id}`,
  label: t.label,
  iconKey: leafIconKey(t.id),
  designRef: "§4.3",
  planBatch: "P2",
}));

export const ADMIN_NAV_TREE: NavEntry[] = [
  {
    kind: "single",
    path: "dashboard",
    routeName: "tai-admin-dashboard",
    label: "工作台",
    iconKey: "dashboard",
    designRef: "§4.1",
    planBatch: "P0",
  },
  {
    kind: "single",
    path: "ops/live",
    routeName: "tai-admin-ops-live",
    label: "实时大盘",
    iconKey: "monitor",
    designRef: "§4.4.1",
    planBatch: "P1",
  },
  moduleToSubmenu(ADMIN_KEYS_MODULE),
  moduleToSubmenu(ADMIN_RISK_MODULE),
  {
    kind: "submenu",
    id: "nav-billing",
    label: "用量与计费",
    iconKey: "billing",
    designRef: "§4.3",
    planBatch: "P2",
    children: billingChildren,
  },
  ...ADMIN_STUB_MODULE_BASES.map(moduleToSubmenu),
];

/** 扁平叶子（如面包屑、Tags 解析）；含所有子菜单项与单入口「工作台」 */
export function flattenNavLeaves(tree: NavEntry[] = ADMIN_NAV_TREE): NavLeaf[] {
  const out: NavLeaf[] = [];
  for (const e of tree) {
    if (e.kind === "single") {
      out.push({
        path: e.path,
        routeName: e.routeName,
        label: e.label,
        iconKey: e.iconKey,
        designRef: e.designRef,
        planBatch: e.planBatch,
      });
    } else {
      out.push(...e.children);
    }
  }
  return out;
}
