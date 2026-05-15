# @trinity/app-trinity-ai-admin

聚合平台 **运营后台** 前端原型（**无后端**）。本 app **长期归属产品原型**，不承接线上工程实现。

## 协作与交接（模式一 · 固定）

| 角色 | 落点 | 说明 |
|------|------|------|
| **产品 / 原型** | **本 app**（`apps/trinity-ai-admin`） | Mock、写死数据、展示与主流程；可快改、不要求工程级。补充原型**始终改这里**。 |
| **开发工程师** | **独立工程**（另建 app 或公司正式后台仓库） | 对照本 app 的页面、路由、字段与文案做工程级实现；接 API、鉴权、校验、测试与发布。 |
| **禁止** | 在本 app 内把原型改成「仅线上可跑」 | 避免产品失去可单独演示、可迭代的原型代码。 |

工程师从本 app **对照或复制**模块结构即可，无需把本仓库改成生产形态。工程落点命名由研发约定（例如 monorepo 内另建 `apps/*-admin-web`，或独立 Git 仓库），在工程 README 中反向链接本文即可。

产品 IA 与批次见：

- **`docs/AI-API聚合平台-运营后台-原型交付计划.md`**
- **`docs/AI-API聚合平台-后台管理系统-详细设计-v1.md`** §2 / §4

工程规范：**`docs/Trinity原型模块目录与交付规范.md`**

## 色彩（admin-shell 专用）

真源 **`src/styles/admin-theme.css`**（作用域 `.admin-shell`）。设计色板页 **「运营后台」** 一节有可视化对照。

| 类型 | 变量示例 | 说明 |
|------|----------|------|
| **侧栏专有 hex** | `--admin-sidebar-bg` `#304156`、`--admin-sidebar-hover` `#263445` | 深色侧栏布局，未写入全局 `packages/tokens` |
| **映射全局 token** | `--admin-primary` → `--blue`、`--admin-bg` → `--surface` | 与门户 / 静态 `adm-*` 主色一致 |
| **业务语义** | `--admin-success*`、`--admin-warning*`、`--admin-danger*` | 面板徽章、环境 Mock 标等 |

选中菜单用 **`--blue`（#2563eb）**，不用若依 `#409EFF`。

## 开发

```bash
npm run dev
```

默认端口 **5204**（见 `package.json`）。

## 当前进度

- **P0**：壳层 + 工作台（`admin-shell`、`admin-dashboard`）。  
- **P1**：实时大盘（`admin-ops/`，`OpsPage.vue` · 单入口）。  
- **P2**：用量与计费（`admin-billing/`，五 Tab + 表格 mock）。  
- **P3**：供应商（`admin-suppliers/`，五子路由共 **`SuppliersPage.vue`**：列表 / 档案 / 对接 / 拨测 / 密钥策略 mock）。  
- **P4**：模型管理（`admin-models/`，四子路由共 **`ModelsPage.vue`**：列表 CRUD + 操作列上架/下架 + 主数据 / 线路 / 刊例 mock）。  
- **P5**：**API 与路由策略（§4.6）— v1 不做**，侧栏与路由已注释，不参与本版原型/开发。  
- **P6**：客户与合同（`admin-customers/`，五子路由共 **`CustomersPage.vue`**：租户列表 CRUD mock、组织/项目、合同、发票、授信）。  
- **P7**：API 密钥（`admin-keys/`，**`KeysPage.vue`**：API 列表含冻结/吊销与行内详情、审计、风险 mock）。  
- **P8**：文档中心（`admin-docs/`，**`DocsPage.vue`**：列表 / 编辑与版本 / 发布与回滚 / 可见范围 mock）。  
- **P9**：用户与认证（`admin-users/`）。  
- **P10**：平台权限（`admin-access/`）与系统与合规（`admin-system/`，**`SystemPage.vue`**）。  
- **报表中心等**：侧栏子菜单仍部分指向 **`AdminStubPage`**，见交付计划。
