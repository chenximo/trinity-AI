/**
 * 壳层侧栏导航真源为 **`adminNavTree.ts`** 的 `ADMIN_NAV_TREE`（一级模块 + 二级子菜单路由）。
 * 本文件保留占位说明类型，避免旧文档指向已删除的 `ADMIN_NAV_ITEMS` 时报错。
 */

/** @deprecated 请使用 `adminNavTree.ts` 的 `ADMIN_NAV_TREE` */
export type AdminNavItem = {
  path: string;
  label: string;
  routeName: string;
  designRef: string;
  planBatch: string;
};
