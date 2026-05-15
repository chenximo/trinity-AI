# admin-suppliers · 供应商（P3）

## 1. 一句话

演示 **§4.4 供应商**：列表、档案与结算、对接配置（网关参数 + **输入/输出模板** 列表与弹窗 CRUD，UI 用 **`@trinity/ui`**）、连通性拨测、密钥轮换策略；**当前均为 mock，无后端**。

## 2. 路由

与 `trinityAdminRoutes.ts` 及 `admin-shell/adminNavTree.ts` 一致；子路由 `name` 形如 `tai-admin-suppliers-{子页 id}`。

| path（独立 app，嵌门户时加前缀 `/trinity-ai-admin`） | name | 入口 |
|--------------------------------------------------------|------|------|
| `/suppliers/list` | `tai-admin-suppliers-list` | `SuppliersPage.vue` |
| `/suppliers/profile` | `tai-admin-suppliers-profile` | 同上 |
| `/suppliers/integration` | `tai-admin-suppliers-integration` | 同上 |
| `/suppliers/probe` | `tai-admin-suppliers-probe` | 同上 |
| `/suppliers/key-rotation` | `tai-admin-suppliers-key-rotation` | 同上 |
| `/suppliers` | `tai-admin-suppliers` | redirect → `tai-admin-suppliers-list` |

## 3. 入口文件

- `SuppliersPage.vue`：单入口，模板内 **HTML 注释分区**；按 `route.meta.stubSecondaryId` 切换子区块。

## 4. 依赖样式

- `suppliers.css`：模块布局与表；色值与若依壳层主区白卡片协调。

## 5. 数据与交互

- `mock.ts`：列表行、档案、对接静态项、**默认对接模板行**（`DEFAULT_INTEGRATION_BINDINGS`）、拨测、轮换文案；**无 DOM**。
- `suppliersInteractions.ts`：列表筛选、对接模板 JSON 持久化（`trinity-ai-admin:suppliers-integration-bindings`）、弹窗打开时 `body.or-modal-open`。

## 6. 结构约定

单入口 **`SuppliersPage.vue`**，原型阶段不在本目录再拆业务子 `.vue`。

## 7. 接 API 后

替换 `mock.ts` 为接口层；筛选与拨测任务改 store / composable；`suppliersInteractions.ts` 可删或改为服务端分页参数。

## 8. 已知缺口

未接真实拨测、契约中心、KMS；无权限与审计字段校验。
