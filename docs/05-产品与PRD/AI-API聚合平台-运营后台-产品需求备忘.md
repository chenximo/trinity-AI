# AI API 聚合平台 · 运营后台 · 产品需求备忘

> **文档性质**：**持续追加**的产品与交互需求清单（评审对话、原型走查、设计对齐中提出的条目）。  
> **不是**替代 [`AI-API聚合平台-后台管理系统-详细设计-v1.md`](./AI-API聚合平台-后台管理系统-详细设计-v1.md)（模块职责与 IA 仍以详设为准）。  
> **原型验收**仍以 [`AI-API聚合平台-运营后台-原型交付计划.md`](./AI-API聚合平台-运营后台-原型交付计划.md) 为准；本备忘中「原型已实现」表示 **Vue 高保真原型（`apps/trinity-ai-admin`）** 已落地，**正式工程 / 后端** 另计。

---

## 如何维护（给产品 / 设计 / 研发）

1. **新需求**：在下方对应分类表末 **新增一行**；`提出` 填日期（YYYY-MM-DD）与来源（如「走查」「周会」）。  
2. **状态**：`待做` → `原型已实现` → `工程待接` → `已关闭`（或 `不做` + 原因）。  
3. **详设升格**：若条目已稳定且应写入长期真源，同步改 **详设 v1** 或 **交付计划 §2 / §2.1**，并在本表「详设/计划」列填章节号。  
4. **实现指针**：原型改动尽量填 `apps/trinity-ai-admin` 路径或组件名，便于 AI / 研发检索。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-05-18 | 初版：汇总门户嵌套、若依式列表壳、查询栏、时间范围、侧栏图标等走查需求 |
| 2026-05-18 | **D-06～D-08**：列表「导出 + 时间范围」分档规则；必加/建议加页原型落地 |
| 2026-05-18 | **C-06**：全后台数据列表统一底部分页（`AdminTablePagination` + `useAdminTablePagination`） |
| 2026-05-19 | **G-01～G-09**：V1 页面对照后端文档已齐，登记 **文档优化 TODO**（五件套 README、总览 §2.4、计费二期说明） |
| 2026-05-19 | **B-08**：列表工具栏右侧与左侧、表格操作列按钮间距统一（§2.3） |

---

## A. 壳层、导航与全局技术

| ID | 需求 | 状态 | 提出 | 详设/计划 | 实现指针（原型） |
|----|------|------|------|-----------|------------------|
| A-01 | 运营后台经 **门户**（`trinity-portal`）嵌套路由时，须能正常渲染 **Element Plus** 组件（`el-table`、`el-form` 等），不得出现「仅文字、无表格」 | 原型已实现 | 2026-05-18 走查 | 交付计划 §2 | `apps/trinity-portal/src/main.ts` 安装 `@trinity/element-plus`；`installAdminStyles` |
| A-02 | **全项目统一** 注册 Element Plus + 中文 locale + 基础样式（各 app `main` 调用一次） | 原型已实现 | 2026-05-18 | 交付计划 §2 | `packages/element-plus`；`installTrinityElementPlus` |
| A-03 | 侧栏 **一级菜单、二级子菜单** 均展示 **图标**（若依式，与文字左对齐）；收起侧栏时一级仍显示图标 | 原型已实现 | 2026-05-18 | §2 信息架构 | `adminNavIcons.ts`、`AdminNavIcon.vue`、`adminNavTree.ts`（`iconKey`） |
| A-04 | 侧栏图标与模块/子页 **可配置**（新增二级页时仅需补 `iconKey` 映射） | 原型已实现 | 2026-05-18 | §2 | `adminNavIcons.ts` 中 `MODULE_ICON_BY_PATH`、`leafIconKey` |
| A-05 | 列表页卡片内 **不重复** 面包屑已有的一级标题（工具栏 `toolbar-only`，标题由壳层面包屑承担） | 原型已实现 | 2026-05-18 走查 | 版式规范 | `AdminSectionHead` `toolbar-only`；各 `*Page.vue` |
| A-06 | 卡片内 **说明 callout** 默认不抢占列表区（冗长提示收进 `AdminInternalTip` ⓘ） | 原型已实现 | 2026-05-18 走查 | — | `admin-page.css` 隐藏/收敛 `__callout`；页内 tip |

---

## B. 视觉与组件规范（若依 / Element Plus）

| ID | 需求 | 状态 | 提出 | 详设/计划 | 实现指针（原型） |
|----|------|------|------|-----------|------------------|
| B-01 | 列表 **表格**：浅灰表头、**无** 斑马纹/外边框网格（若依式横线表） | 原型已实现 | 2026-05-18 | **[运营后台-若依式列表规范.md](../02-后台运营管理系统设计/运营后台-若依式列表规范.md)** | `admin-ruoyi.css`、`admin-ep-table-wrap` |
| B-02 | 主按钮 / 链接按钮 **悬停时文字不得消失**（主题色与 EP `light-*` 变量需可读） | 原型已实现 | 2026-05-18 走查 | — | `admin-element-plus.css` 链式按钮 hover |
| B-03 | 表头、列宽：禁止使用 rem 字符串作为 `el-table-column` 的 `width`（EP 解析异常会导致列极窄、表头不可见） | 原型已实现 | 2026-05-18 走查 | — | 各 `*Page.vue` 列宽改为 **px** |
| B-04 | 列表 **支持列排序**（有 `prop` 的列默认 `sortable`） | 原型已实现 | 2026-05-18 | — | 各列表 `el-table-column` |
| B-05 | 行内操作列：`#default` 插槽须 **守卫** `scope?.row`，避免 EP 表头占位渲染报错 | 原型已实现 | 2026-05-18 走查 | — | 各 `*Page.vue` 表格模板 |
| B-06 | 工具栏 **查询行单行展示**：搜索、筛选、日期、按钮 **不换行**（窄屏可横向滚工具区，勿拆两行） | 原型已实现 | 2026-05-18 走查 | 交付计划 §2.1 | `admin-page.css` `--toolbar` `nowrap`；`AdminSectionHead` 工具顺序 |
| B-07 | 查询栏内 **Element Plus 控件垂直对齐、同高**（`el-input` / `el-select` / `el-date-picker` / `el-button` 均为 32px 行高，禁止 date-picker 单独 `small` 导致错位） | 原型已实现 | 2026-05-18 走查 | — | `AdminListQuery` 容器；`admin-page.css`；`AdminFilterSelect` |
| B-08 | 列表工具栏 **右侧** `#actions` 与 **左侧** 检索区、表格 **操作列** 行内按钮：**间距一致**（`gap: 0.5rem`）；禁止 EP 默认相邻 `margin-left` 叠加 | 原型已实现 | 2026-05-19 走查 | **[运营后台-若依式列表规范.md](../02-后台运营管理系统设计/运营后台-若依式列表规范.md) §2.3** | `admin-page.css`、`admin-ruoyi.css` |

---

## C. 列表查询栏（搜索 + 筛选 + 重置）

| ID | 需求 | 状态 | 提出 | 详设/计划 | 实现指针（原型） |
|----|------|------|------|-----------|------------------|
| C-01 | **每个数据列表页** 须提供：**关键词搜索** + **至少一项下拉筛选**（按业务字段）+ **重置**（清空关键词与各筛选，非仅清空搜索框） | 原型已实现 | 2026-05-18 | 交付计划 §2.1（筛选形态可二期统一为 FilterForm2） | `AdminListQuery.vue`；`adminListFilter.ts` |
| C-02 | 重置行为：**搜索框清空** + 触发页内 **筛选 ref 清空**（如组织、状态、时间范围） | 原型已实现 | 2026-05-18 | — | 各页 `@reset` → `reset*Query()` |
| C-03 | 已覆盖模块（列表/子表）：系统（审计/敏感/导出/开关/全局）、计费五 Tab、API 密钥（列表+审计）、用户五 Tab、权限（管理员/角色/菜单）、客户（租户/组织/合同/发票/授信）、模型（列表/线路/刊例）、供应商（列表/对接/拨测）、文档（列表/发布/可见范围）、工作台待办 | 原型已实现 | 2026-05-18 | §4 各模块 | 对应 `*Page.vue` |
| C-04 | **筛选控件形态**：交付计划 §2.1 要求列表筛选用 `@trinity/ui` **FilterForm2PillListbox**；当前原型部分页为 **`el-select`**，正式改版时需对齐 design-spec 形式 2 | 工程待接 / 待对齐 | 2026-05-18 | 交付计划 §2.1.2 | 记技术债；与 `DesignSpec` #ds-filters 对齐 |
| C-05 | 供应商 / 模型列表：**增删改查 + 导入 + 导出 Excel**（原型可占位） | 部分原型已实现 | 既有 | 交付计划 §2.1.3 | `SuppliersPage` / `ModelsPage` 工具栏按钮 |
| C-06 | **每个数据列表表格** 底栏须提供 **分页**（总数、每页条数、翻页、跳转）；默认每页 **10** 条；筛选变化时回到第 1 页；工程期换服务端分页参数 | 原型已实现 | 2026-05-18 | 交付计划 §2.1.5 | `AdminTablePagination.vue`；`adminTablePagination.ts`；各 `*Page.vue` |

---

## D. 时间范围筛选

| ID | 需求 | 状态 | 提出 | 详设/计划 | 实现指针（原型） |
|----|------|------|------|-----------|------------------|
| D-01 | 用量明细等需 **时间范围** 的列表：须提供 **日期范围选择器**（非无交互的「时间范围」占位按钮） | 原型已实现 | 2026-05-18 | §4.3 用量 | `AdminDateRangePicker.vue` |
| D-02 | 选择器须带 **快捷项**：今天、昨天、近 7 天、近 30 天、本月、上月 | 原型已实现 | 2026-05-18 | — | `adminDateRange.ts` → `ADMIN_DATE_RANGE_SHORTCUTS` |
| D-03 | 工具栏内展示 **宽度紧凑**（约 13rem），勿拉满整行；默认 **日期范围**（`daterange`）+ `size="small"`；结束日含当天 23:59:59 | 原型已实现 | 2026-05-18 走查 | — | `AdminDateRangePicker` `mode="date"`；`admin-page.css` |
| D-04 | 需 **精确到时分秒** 的页面可传 `mode="datetime"`（允许略宽） | 已约定 | 2026-05-18 | — | 组件 prop |
| D-05 | 其他含「时间范围」入口的模块（工作台 KPI、监控大盘等）按模块 **复用同一组件** | 待做 | 2026-05-18 | §4.1 / §4.2 | 见 `dashboardInteractions.ts` 预留 |
| D-06 | **导出 + 时间范围分档（真源见详设 §2.3）**：**必加** — 日志/流水/任务队列且工具栏有导出：**用量明细**、**操作审计**、**密钥审计轨迹**、**报表中心·导出任务** | 原型已实现 | 2026-05-18 | 详设 §2.3 · §4.3/§4.8/§4.10/§4.13 | `BillingPage`（usage）、`SystemPage`（audit-log）、`KeysPage`（audit）、`ReportsPage`（export） |
| D-07 | **建议加** — 与导出/审批按日相关的列表：**数据导出审批**、**账单**（按客户导出对账 + 账期 `YYYY-MM`） | 原型已实现 | 2026-05-18 | 详设 §2.3 · §4.3/§4.13 | `SystemPage`（export-approval）、`BillingPage`（invoice） |
| D-08 | **不必加** — 主数据快照类导出（**供应商列表**、**模型列表**）：保留组织/状态等筛选即可，**不**强制日期范围 | 已约定 | 2026-05-18 | 详设 §2.3 | `SuppliersPage` / `ModelsPage` 无 `AdminDateRangePicker` |

---

## E. 门户与工程化（非原型）

| ID | 需求 | 状态 | 提出 | 详设/计划 | 说明 |
|----|------|------|------|-----------|------|
| E-01 | 列表筛选、分页、排序 **接真实 API**（替换 `mock` + 前端 `filterByQuery`） | 工程待接 | — | §4 各模块 | 接口契约另文档 |
| E-02 | 操作审计、导出、敏感配置等 **写审计仓**（非 `localStorage` 追加） | 工程待接 | — | §4.13 | — |
| E-03 | 员工登录、RBAC、菜单权限 **服务端下发**（与侧栏 `ADMIN_NAV_TREE` 一致） | 工程待接 | — | §4.12 | — |

---

## F. 待确认 /  backlog

| ID | 需求 | 状态 | 提出 | 备注 |
|----|------|------|------|------|
| F-01 | 列表筛选统一为 **FilterForm2** 还是允许 **el-select**（运营习惯 vs 设计规范） | 待确认 | 2026-05-18 | 产品拍板后更新 C-04 |
| F-02 | **实时大盘** 是否也需要完整「查询栏 + 时间范围」 | **已定** | 2026-05-18 | 否：页头 `AdminSectionHead` 工具区提供 **2/6/24h 时间窗 + 刷新**；无列表式查询栏。分区与 mock 见 [`admin-ops/README.md`](../apps/trinity-ai-admin/src/views/admin-ops/README.md) |
| F-03 | **文档编辑** 子路由为编辑器形态，是否排除「列表查询栏」统一要求 | 待确认 | 2026-05-18 | §4.9 |

---

## G. 文档优化（V1 原型页面齐 · 2026-05-19）

> **背景**：对照 [`apps/trinity-ai-admin/doc/创建后端需实现页面与功能.md`](../apps/trinity-ai-admin/doc/创建后端需实现页面与功能.md) **§12**，V1 页面/mock **已覆盖**；下列为 **文档与说明** 补强，**不阻塞** 后端开工。真源任务表：[`后台原型总览.md`](../02-后台运营管理系统设计/后台原型总览.md) **§8**。

| ID | 任务 | 状态 | 提出 | 说明 |
|----|------|------|------|------|
| G-01 | `admin-reports/README.md` | 待做 | 2026-05-19 | 五件套缺 README |
| G-02 | `admin-reports/reportsInteractions.ts` | 待做 | 2026-05-19 | Tab / 导出任务交互抽离 |
| G-03 | `admin-users/README.md` | 待做 | 2026-05-19 | §4.11 v1 五 Tab 说明 |
| G-04 | `admin-access/README.md` | 待做 | 2026-05-19 | §4.12 权限四 Tab |
| G-05 | `admin-system/README.md` | 待做 | 2026-05-19 | §4.13 审计 / 安全 / 审批 |
| G-06 | `后台原型总览` §2.4 通俗说明补全 | 待做 | 2026-05-19 | billing / reports / users / access / system |
| G-07 | `admin-billing/README` 详设二期能力清单 | 待做 | 2026-05-19 | 钻取、SKU/调账表单、真导出 |
| G-08 | 交付计划 P2「列表+抽屉」与实页对齐 | 待做 | 2026-05-19 | 改文案或排期抽屉 |
| G-09 | 未对齐若依列表的页面登记 | 待做 | 2026-05-19 | 如 `AccessPage` |

---

## 相关文档索引

| 文档 | 用途 |
|------|------|
| [`AI-API聚合平台-后台管理系统-详细设计-v1.md`](./AI-API聚合平台-后台管理系统-详细设计-v1.md) | 模块 IA、二级页面职责、业务流程 |
| [`AI-API聚合平台-运营后台-原型交付计划.md`](./AI-API聚合平台-运营后台-原型交付计划.md) | 批次、五件套、§2.1 工具栏与 Excel |
| [`Trinity版式与视觉规范.md`](./Trinity版式与视觉规范.md) | 全局版式与 token |
| [`产品管理随手记.md`](./产品管理随手记.md) | 原始想法；重大条目应升格到详设或本备忘 |
| [`docs/02-后台运营管理系统设计/后台原型总览.md`](../02-后台运营管理系统设计/后台原型总览.md) | 模块 ↔ 目录、V1 对照结论、**§8 文档 TODO** |
| `apps/trinity-ai-admin/README.md` | 原型工程约定与本地启动 |

---

## 附录：共享原型组件（便于检索）

| 组件 / 工具 | 路径 | 用途 |
|-------------|------|------|
| `AdminListQuery` | `src/components/AdminListQuery.vue` | 搜索 + `#filters` + 重置 |
| `AdminDateRangePicker` | `src/components/AdminDateRangePicker.vue` | 日期范围 + 快捷项 |
| `AdminNavIcon` | `src/views/admin-shell/AdminNavIcon.vue` | 侧栏一级/二级图标 |
| `AdminSectionHead` | `src/components/AdminSectionHead.vue` | 页头 / 仅工具栏 |
| `filterByQuery` | `src/utils/adminListFilter.ts` | 前端 mock 过滤 |
| `adminDateRange` | `src/utils/adminDateRange.ts` | 快捷项、区间解析 |
| `AdminTablePagination` | `src/components/AdminTablePagination.vue` | 列表底部分页条 |
| `useAdminTablePagination` | `src/utils/adminTablePagination.ts` | 前端 mock 切片分页 |
