# Trinity：开发枢纽与 AI 协作流程

> **文档类型**：日常操作与设计站落地流程（偏「怎么做」）。  
> **受众**：维护本仓库的 PM 与 **Cursor 等 AI 助手**；执行改动前请先读本页与 [`04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md`](../04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md)、[`01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md`](../01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md)、[`01-原型与交付规范/Trinity原型模块目录与交付规范.md`](../01-原型与交付规范/Trinity原型模块目录与交付规范.md)。  
> **事实说明**：设计枢纽与门户的骨架、路由聚合、Vue 化规范页等 **主要由 AI 在对话中完成**；本文件把已稳定下来的约定写死，减少下一轮对话的上下文丢失。

---

## 1. 为什么要有「开发枢纽」`apps/trinity-portal`

- **单进程预览**：根目录执行一次 `npm run dev`，在 **http://localhost:5173** 用路由切换 **设计色板 / 设计规范 / 各产品骨架页（含运营后台 `/trinity-ai-admin`）**，不必为每个 app 各开一个终端与端口。  
- **与各 app 独立 dev 并存**：需要单独调试某一 app 的 Vite 行为时，仍用根 `package.json` 里的 **`npm run dev:trinity-design`**（5210）、**`dev:trinity-ai`**（5201）等脚本。  
- **生产构建不变**：各 `apps/*` 仍是 **独立可构建、可部署** 的产物；门户主要用于 **本地/评审联调**，根 `build:apps` 中会包含 `@trinity/app-portal` 的 build，便于 CI 验证聚合入口无报错。

---

## 2. 日常命令速查

| 场景 | 命令 | 默认地址 / 说明 |
|------|------|------------------|
| **推荐日常**：单端口看全站骨架 + 设计页 | 仓库根：`npm run dev` | `http://localhost:5173`（`@trinity/app-portal`） |
| 仅设计枢纽（与门户内路由路径一致） | `npm run dev:trinity-design` | `http://localhost:5210` |
| 仅 Trinity AI 骨架 | `npm run dev:trinity-ai` | `http://localhost:5201` |
| 仅 **Trinity AI 运营后台原型** | `npm run dev:trinity-ai-admin` | `http://localhost:5204` |
| 仅 AI Cloud / GEO | `npm run dev:ai-cloud`、`npm run dev:trinity-geo` 等 | 见根 `package.json` 与 `apps/README.md` |

**安装依赖**：在仓库根执行 `npm install`（npm workspaces 一次装全 workspace 包）。

**端口被占用**：可用 `lsof -nP -iTCP:5173 -sTCP:LISTEN`（替换端口号）查 PID 后结束进程；或改用各 app 脚本在约定端口启动。进程异常退出码 **137** 多为被系统或手动 **SIGKILL**（例如杀端口、关终端），一般 **重跑 dev 即可**，不是 Vite 配置错误。

---

## 3. 门户 `trinity-portal` 的技术要点（给 AI 改代码时用）

- **位置**：`apps/trinity-portal/`；包名 **`@trinity/app-portal`**。  
- **路由**：`src/router/index.ts` 使用 **懒加载** 直接引用各 app 下的 `views`（例如 `@trinity-design/views/DesignSpec.vue`）。  
- **Vite 别名**：`vite.config.ts` 中将 `@trinity-design`、`@trinity-ai`、`@app-ai-cloud` 等指向对应 **`apps/<name>/src`**，与门户内 `import` 路径一致即可。  
- **全局样式入口**：`src/main.ts` 中引入 `trinity-base.css`（链到 `packages/tokens` 与 `packages/ui/styles/ui-kit.css`）、`virtual:uno.css`、**`design-hub.css` 与 `design-tokens-page.css`**（来自 `trinity-design` 的 `src`），保证色板与设计顶栏在门户里与设计独立站 **观感一致**；**规范页专用** 的 `admin.css`、`chat-openrouter.css` 仍在 **`DesignSpec.vue` 内 import**（见下节），避免无规范页时也全量加载。  
- **顶栏壳**：`src/App.vue` 复用 `design-hub` 顶栏与主题条，通过 **`@trinity-design/composables/useTrinityDesignTheme`** 驱动 `data-theme` 与按钮态。

**扩展新路由（AI 操作清单）**

1. 在目标 `apps/<app>/src/views/` 增加或确认页面组件。  
2. 在 `apps/trinity-portal/vite.config.ts` 若为新 app，增加 `resolve.alias` 指向其 `src`。  
3. 在 `apps/trinity-portal/src/router/index.ts` 增加 `path` 与 `component: () => import('…')`。  
4. 在 `apps/trinity-portal/src/App.vue` 顶栏增加对应 `<a href="…" @click="hubNav(…)">`。  
5. 根目录执行 `npm run build -w @trinity/app-portal` 验证。

### 3.1 `trinity-ai-admin`（运营后台原型 · 与门户嵌套）

- **独立运行**：根目录 **`npm run dev:trinity-ai-admin`** → **`http://localhost:5204`**（包 **`@trinity/app-trinity-ai-admin`**）。路由表见 **`apps/trinity-ai-admin/src/views/admin-shell/README.md`**。  
- **门户内路径**：**`/trinity-ai-admin`**，与 **`Trinity AI`** 的 **`/trinity-ai`** 同理——父级挂 **`AdminShellLayout.vue`**，子路由由 **`apps/trinity-ai-admin/src/trinityAdminRoutes.ts`** 中 **`getTrinityAdminChildRoutes()`** 提供，供 **`apps/trinity-ai-admin/src/router/index.ts`** 与 **`apps/trinity-portal/src/router/index.ts`** 两处复用（避免与 `Home.vue` 等已删入口漂移）。  
- **已实现子页（原型）**：**`/dashboard` 工作台**、**`/ops` 监控与运维**（`admin-ops/`）、**`/billing` 用量与计费**（`admin-billing/`）；其余 path 仍为 **`AdminStubPage.vue`**，见 **`admin-shell/README.md`** 路由表。  
- **UI 组件库**：运营后台 **统一 Element Plus**（仅 `trinity-ai-admin`）；见 **`apps/trinity-ai-admin/README.md`** · UI 组件库。  
- **规范展示（`trinity-design` · 勿进产品路由）**  
  - 运营后台列表样板：**`/admin-ops-spec`** → `apps/trinity-design/src/views/ops-admin-system/`。  
  - 用户后台索引：**`/user-console-spec`** → `apps/trinity-design/src/views/user-admin-system/`。  
  - 全站 UI：**`/design-tokens`**、**`/design-spec`** 仍在 `views/` 根下。  
  - **不要**在 `getTrinityAdminChildRoutes()` 注册 `example` 等规范 path；旧链 **`/trinity-ai-admin/example`** 重定向 **`/admin-ops-spec`**。  
  - 文字真源：**`docs/02`**、**`docs/03`**；运营列表代码模板 **`apps/trinity-ai-admin/doc/Admin列表页模板.md`**。  
- **扩展 admin 子路由（AI 操作清单）**  
  1. 改 **`ADMIN_NAV_TREE`**（`apps/trinity-ai-admin/src/views/admin-shell/adminNavTree.ts`）、**`moduleSecondaryPages.ts`** 与 **`getTrinityAdminChildRoutes()`**（`trinityAdminRoutes.ts`）。  
  2. 同步更新 **`apps/trinity-ai-admin/src/views/admin-shell/README.md`** 路由表。  
  3. 根目录执行 **`npm run build -w @trinity/app-trinity-ai-admin`** 与 **`npm run build -w @trinity/app-portal`**。

**门户下子路径与 `name`（前缀 `tai-admin-`）**

| 门户内 path（示例） | `name`（示例） | 说明 |
|-------------|--------|------|
| `/trinity-ai-admin/dashboard` | `tai-admin-dashboard` | 工作台 |
| `/trinity-ai-admin/ops` | `tai-admin-ops` | 重定向到默认子页 `…/ops/live` |
| `/trinity-ai-admin/ops/live` | `tai-admin-ops-live` | 监控与运维子页（**P1** `OpsPage.vue`） |
| `/trinity-ai-admin/billing/usage` | `tai-admin-billing-usage` | 用量与计费子页（**P2** `BillingPage.vue`） |
| `/trinity-ai-admin/suppliers/list` | `tai-admin-suppliers-list` | 供应商子页（占位） |
| … | … | 其余子路由见 `adminNavTree.ts` / `trinityAdminRoutes.ts` |

产品全景一页读见 **`docs/AI-API聚合平台-产品全景与介绍.md`**；运营后台 IA 与批次见 **`docs/AI-API聚合平台-运营后台-原型交付计划.md`**。

---

## 4. 设计应用 `trinity-design`（色板 + 规范）

### 4.1 路由与入口

- 路由定义在 `apps/trinity-design/src/router/index.ts`：**`/` 重定向到 `/design-tokens`**；另有 **`/design-spec`**、**`/admin-ops-spec`**、**`/user-console-spec`**（见 `src/views/ops-admin-system/`、`src/views/user-admin-system/`）。  
- 门户内为 **同一套 Vue 组件**，路径与独立设计站 **一致**，便于文档与口头约定。

### 4.1.5 新增 `@trinity/ui` 组件的流程（规范 → 实现 → 可点可看）

约定顺序如下；**最终交付给设计/产品验收的形态**是：**打开 `/design-spec` 即可看到、可点**，而不是「只在聊天里描述」或只改静态 HTML。

1. **设计规范先写**（`apps/trinity-design/src/views/DesignSpec.vue`）  
   - 写清用途、与 **`packages/tokens`**、**`packages/ui/styles/ui-kit.css`**（及整站 `trinity-base.css`）的关系、对 AI 的对齐话术（可写进小节 prose）。  
   - **必须**在本页增加**可见画板**（真实挂上 `@trinity/ui` 或待接组件的占位，占位也要说明「待接包名」）；并用 **`design-spec-page.css` 里的 `.ds-ui-ref`** 标出 **组件名 + 推荐 `import` 一行**。  
   - 新章节需在顶栏 **`ds-nav`** 增加 **`#ds-…` 锚点**（与现有「筛选 / 搜索 / …」同级）。  
2. **`packages/ui` 里实现**（`packages/ui/src/…`）  
   - 按类型放入目录（如 `filters/`、`search/`、`modal/`、`internal/`、`buttons/`、`select-list/`）；**形式编号写在文件名**；包内**不写业务接口与真实数据**。  
   - 在 **`packages/ui/src/index.ts`** 增加导出（类型放在 `index.ts` 顶部导出，避免从 `.vue` 再导出 type 的 TS 问题；按需增加兼容名 `T*`）。  
3. **回到设计页接线**  
   - 在 `DesignSpec.vue` 中 `import` 新组件，**Mock 数据留在 app**（本仓库即 `apps/trinity-design`），**不要**塞进 `packages/ui`。  
4. **验收**  
   - 本地执行 **`npm run build -w @trinity/app-trinity-design`**；与旧静态页或 `TrinityAI/` 对照时仅作迁移参考，**规范真源**始终是 `DesignSpec.vue`。

### 4.2 设计色板页 `DesignTokens.vue`

- 正文仍由 **`design-tokens-main-inner.html?raw` + `v-html`** 注入（片段仅作版式参考；**新内容优先写入 `DesignTokens.vue` 模板**）。`DesignTokens.vue` 在运行时把片段内 **`href="…html"`** 替换为 **`/design-tokens`**、**`/design-spec`** 等 SPA 路径。  
- 在 **`main` 根节点** 上使用 **`@click` 委托**：对站内链 **`preventDefault` + `router.push`**；实现里须用 **`e.target instanceof Element`**（或等价）再 **`closest('a[href]')`**，避免点击落在 **文本节点** 时调用 `closest` 抛错。  
- 与 **`design-spec` 互链**的段落依赖上述替换与委托，否则会出现「点了没反应」。

### 4.3 设计规范页 `DesignSpec.vue`

- **新增组件流水线**（先写规范、再写包、再在 `/design-spec` 验收）：见上文 **§4.1.5**。  
- **真源**：设计规范以 **`apps/trinity-design/src/views/DesignSpec.vue`**（路由 **`/design-spec`**）为准；仓库内 **`design-spec-main-inner.html`** 仅历史/对照参考（文件头 **REFERENCE ONLY**），**勿再**与 `DesignSpec.vue` 双轨维护。  
- **已用 Vue 模板整页还原**（不再整块 `v-html` 内层 HTML）；示意控件优先使用 **`@trinity/ui`**（如筛选形式 1/2/3、`ModalPanel`、`InternalHelpTip`、`TButton`、`SelectListForm1ModelRow` 等），与 `packages/ui` 的「设计示意、非业务」定位一致。  
- **画板旁的 `@trinity/ui` 映射**：各小节用 **`design-spec-page.css` 中 `.ds-ui-ref`** 灰条标出 **组件名 + 推荐 `import` 一行**，便于你对 AI 说「按设计规范筛选形式2」时直接落到可引用实现；类名长文仍保留在原有 prose 中作溯源。  
- **画板样式（迁移计划「方案 A」）**：在 **本组件内** `import` **`TrinityAI_Admin/admin.css`** 与 **`TrinityAI/app/chat/chat-openrouter.css`**，并配合 **`design-spec-page.css`**；**不必**再写进 `main.ts`，以免色板-only 场景也全量加载。  
- **画板下拉等行为**：`composables/useDesignSpecDropdowns.ts` 绑定在 **`main` 的 `ref`** 上，依赖 DOM **`id`**（如 `#ds-app-filter-more-wrap`）；改模板时须保持 id 与 composable 一致。  
- 同样在 **`main` 上做站内链委托**（与色板页相同的 `Element` 安全写法）。

### 4.4 顶栏导航（独立设计站 `App.vue`）

- 使用 **带 `href` 的 `<a>` + `@click.prevent` + `router.push`**，当前路由再次点击时 **滚动到顶部**，避免「同路由无反馈」。  
- 样式与 **`design-hub.css`**、**`.design-hub-nav-link` / `.is-active`** 对齐；门户顶栏链接更多时可加 **`design-hub-nav--wrap`**（样式在同文件内定义）。

---

## 5. `packages/ui` 与 Mock 数据（提醒 AI）

- **`packages/ui`**：仅 **设计示意**（类名、尺寸、无障碍、必要事件）；**形式编号写在文件名**（如 `FilterForm1More.vue`、`FilterForm2PillListbox.vue`）；目录按 **类型一层**（`filters/`、`search/`、`modal/`、`buttons/` 等），避免过深业务式路径。**新增组件的先后顺序与验收方式**见上文 **§4.1.5**。  
- **Mock / 列表示例数据**：放在 **具体 `apps/*/src`**，**不要**放进 `packages/ui`。  
- 详细约束见工程方案 **`docs/Trinity前端Vue与Monorepo工程方案.md`** §7 与 §11。

---

## 6. 给 AI 的提示词习惯（可选但有效）

- 改 **`apps/trinity-ai`** 下某模块的**迭代补充**时：先读该模块 **`views/<模块>/README.md`**，按 **`docs/Trinity原型模块目录与交付规范.md` §6.1** 核对「二次开发补充」表格与 mock / 交互边界，再改 `*.vue` / `mock.ts` / `*Interactions.ts`。  
- 改设计页时明确：**「路径：`apps/trinity-design/…`；路由：`/design-tokens`、`/design-spec`」**。  
- 改门户聚合时明确：**「只改 `apps/trinity-portal` 路由与 `App.vue` 导航；子页仍 living 在各自 app」**。  
- 要求 AI **改完后在仓库根执行** `npm run build -w @trinity/app-portal` 与（若动到设计站）`npm run build -w @trinity/app-trinity-design`。

### 6.1 每周一 · 周记（上交格式）

- **目录与约定**：[`docs/周记/README.md`](./周记/README.md)（每周**一个文件** **`YYYY-Www.md`**，ISO 周；周一写**上一周**）。  
- **新建**：复制 [`docs/周记/_template.md`](./周记/_template.md) → `docs/周记/YYYY-Www.md`。  
- **同一文件两段**：**`## 简版（上交）`**（仅业务表述，复制整节提交）→ **`## 详细版`**（存档，勿上交；不写「维护周记」类协作话）。  
- **滚动清单**：[`docs/02-后台运营管理系统设计/设计待办.md`](../02-后台运营管理系统设计/设计待办.md)、[`docs/00-协作与工作流/产品管理随手记.md`](./产品管理随手记.md) 仍在原文件维护；周记可不写或一句带过。

---

## 7. 相关文件索引

| 主题 | 路径 |
|------|------|
| 新增 `@trinity/ui` 组件流程（规范 → 包 → 可点可看） | `docs/Trinity开发枢纽与AI协作流程.md` **§4.1.5** |
| 门户入口与路由 | `apps/trinity-portal/src/main.ts`、`router/index.ts`、`App.vue` |
| 运营后台 / 用户后台规范展示 | `apps/trinity-design/src/views/ops-admin-system/`、`apps/trinity-design/src/views/user-admin-system/` |
| 运营后台子路由真源（门户 `/trinity-ai-admin` 与独立 app 共用） | `apps/trinity-ai-admin/src/trinityAdminRoutes.ts`、`views/admin-shell/README.md` |
| 门户构建配置 | `apps/trinity-portal/vite.config.ts`、`package.json` |
| 设计站路由与页面 | `apps/trinity-design/src/router/index.ts`、`views/DesignTokens.vue`、`views/DesignSpec.vue` |
| 设计顶栏与主题 | `apps/trinity-design/src/design-hub.css`、`composables/useTrinityDesignTheme.ts`、`lib/trinityDesignTheme.ts` |
| 规范画板下拉 | `apps/trinity-design/src/composables/useDesignSpecDropdowns.ts` |
| 根脚本 | 仓库根 `package.json`（`dev`、`dev:*`、`build:apps`） |
| apps 一览 | `apps/README.md` |
| Vue 原型五件套与二次开发流程 | `docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md`（**§6.1**） |
| 设计枢纽落地计划 | `docs/01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md` |
| **每周一周记**（`YYYY-Www.md` · 简版 + 详细版） | `docs/周记/README.md`、`docs/周记/_template.md` |

---

## 8. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-18 | **§6.1** 周记：单文件 **`YYYY-Www.md`** 含 **简版（上交）+ 详细版**；`docs/周记/README.md`、`_template.md`、首篇 `2026-W20.md`。 |
| 2026-05-11 | §3.1：补充 **已实现子页**（dashboard / ops / billing）；门户子路由表 **ops、billing** 从「占位」改为实页说明。 |
| 2026-05-11 | §2：增加 **`dev:trinity-ai-admin`**（:5204）；新增 **§3.1**（`trinity-ai-admin` 门户嵌套、`getTrinityAdminChildRoutes`、子路由表）；§7 索引增加 `trinityAdminRoutes`；门户 **`App.vue`** 对 `/trinity-ai-admin` 使用 **`startsWith`** 高亮。 |
| 2026-05-14 | §6：增补 **trinity-ai 迭代/二次开发** 提示——先读模块 README 与交付规范 **§6.1**；§7 索引增加五件套与二次开发文档链。 |
| 2026-05-11 | 增补 **§4.1.5**：新增 `@trinity/ui` 组件流程（规范页先 → 包内实现 → `/design-spec` 验收）；§5 指向该流程。 |
| 2026-05-13 | 初稿：单端口门户、设计站 Vue 化要点、方案 A CSS 落点、委托点击与顶栏导航、AI 协作清单与索引。 |
