# admin-shell · 运营后台壳层（P0）

## 1. 一句话

侧栏 **一级模块（可折叠）+ 二级子菜单路由** + 顶栏（面包屑 + 图标工具区）+ **TagsView** + 主区白卡片 `RouterView`；二级页面与 **`docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` §4** 子项一一对应，路由由 **`trinityAdminRoutes.ts`** 生成。**P0** 工作台单入口；**P1** `admin-ops`（实时大盘单页）；**P2** `admin-billing`、**P3** `admin-suppliers`、**P4** `admin-models`、**P6** `admin-customers`、**P7** `admin-keys`、**P9** `admin-users`、**P10** `admin-access` 与 **`admin-system`** 为多子路由实页；**P8** **`admin-docs`**（`DocsPage.vue`）为文档中心实页；**报表中心**等仍为 **`AdminStubPage.vue`** 占位，见 **`docs/AI-API聚合平台-运营后台-原型交付计划.md`**。

## 2. 路由表（真源）

独立 app 根路径为 **`/`**；嵌入 **`apps/trinity-portal`** 时，下列 path 前加前缀 **`/trinity-ai-admin`**（`name` 不变）。

**约定**：`name` 形如 `tai-admin-{模块}-{子页 id}`；父 path（如 `/ops`）为 **`redirect`** 到默认子页（运维 → `live`，计费 → `usage`，占位子模块 → 各模块表第一项）。

| path（示例） | name（示例） | 入口 Vue |
|--------------|----------------|-----------|
| `/dashboard` | `tai-admin-dashboard` | `../admin-dashboard/DashboardPage.vue` |
| `/ops/live`（`/ops/errors` 等旧 path 重定向至此） | `tai-admin-ops-live` | 侧栏单入口「实时大盘」 |
| `/billing/usage` … | `tai-admin-billing-usage` … | `../admin-billing/BillingPage.vue` |
| `/suppliers/list` … | `tai-admin-suppliers-list` … | `../admin-suppliers/SuppliersPage.vue` |
| `/models/list` … | `tai-admin-models-list` … | `../admin-models/ModelsPage.vue` |
| `/customers/tenants` … | `tai-admin-customers-tenants` … | `../admin-customers/CustomersPage.vue` |
| `/access/admins` … | `tai-admin-access-admins` … | `../admin-access/AccessPage.vue` |
| `/users/list` … | `tai-admin-users-list` … | `../admin-users/UsersPage.vue` |
| `/docs/list` … | `tai-admin-docs-list` … | `../admin-docs/DocsPage.vue` |

## 3. 入口与文件

| 文件 | 职责 |
|------|------|
| `AdminShellLayout.vue` | 布局 + 侧栏（一级 + 二级子菜单）+ 顶栏 + Tags + `RouterView` |
| `admin-shell.css` | 壳层布局与侧栏样式 |
| `../../styles/admin-element-plus.css` | Element Plus 主题变量桥接（`.admin-shell`） |

**UI**：业务页统一 **Element Plus**（见 app 根 `README.md` · UI 组件库）。
| `adminNavTree.ts` | **`ADMIN_NAV_TREE`**：侧栏 IA 真源（与路由子项对齐） |
| `mock.ts` | 仅占位类型说明（导航以 `adminNavTree` 为准） |
| `shellInteractions.ts` | 侧栏收起状态 `localStorage` |
| `AdminStubPage.vue` | 占位子页（`route.meta` + **`moduleSecondaryPages.ts`**） |
| `moduleSecondaryPages.ts` | 各模块二级页面 `id` / 标题 / 说明（与设计 §4 对齐） |

## 4. 接 API 后

替换 `mock` 中静态导航为权限过滤结果；`AdminStubPage` 按域拆为独立 `*Page.vue`（见交付规范 §7）。
