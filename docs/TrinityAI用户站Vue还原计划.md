# Trinity AI 用户站：静态 → Vue 还原计划

> **范围**：将仓库根目录 `TrinityAI/` 下的静态 HTML/JS 原型，迁移为 **`apps/trinity-ai`**（Vite + Vue 3 + TypeScript + UnoCSS）内的可维护实现。  
> **设计真源**：`apps/trinity-design` 路由 `/design-spec`、`/design-tokens`；Token 与全局样式对齐 **`packages/tokens`** 与 **`assets/trinity-base.css`**（经 `@repo/assets` 引入）。  
> **原子组件**：凡属设计规范中的形式化控件，**一律从 `@trinity/ui` 引入**；缺件在 **`packages/ui`** 按规范补全后再在业务中使用。

---

## 1. 静态侧资产清单（迁移对照表）

| 静态路径 | 角色 | Vue 侧目标路由（建议） | 备注 |
|----------|------|------------------------|------|
| `TrinityAI/index.html` | 营销首页 | `/` | 体量大，按区块拆组件 |
| `TrinityAI/app/chat/index.html` + `chat-openrouter.js/.css` | 对话主界面 | `/chat` | 见 `docs/Trinity对话页原型说明.md` |
| `TrinityAI/app/models.html` | 模型相关页 | `/models` | |
| `TrinityAI/app/docs.html` | 文档页 | `/docs` | |
| `TrinityAI/account/console.html` | 控制台 | `/account/console` | `keys` / `billing` 等锚点并入或独立子路由 |
| `TrinityAI/account/register.html` | 注册 | `/account/register` 或首页 `#register` | 与产品约定一致即可 |
| `TrinityAI/account/login.html` | 登录跳转 | 重定向至 `/` 或 `/login` | 当前多为跳转首页锚点 |
| `TrinityAI/static/trinity-ai-app-shell.js` | 顶栏、主题、登录态、抽屉 | **布局组件 + composables** | 不再依赖 DOM 注入 |
| `TrinityAI/static/ui-lang-toggle.js` | 中/英切换 | `useTrinityOrUiLang`（并入壳） | 与壳合并 |

详细目录说明见 `TrinityAI/README.md`。

---

## 2. 依赖与约束（强制）

```
apps/trinity-ai  →  packages/ui  →  packages/tokens
```

- **`@trinity/ui`**：仅设计示意与形式化片，不含 OpenRouter、计费等业务接口。  
- **禁止**：在 `apps/trinity-ai` 中复制 `design-spec` 已形式化的 DOM 结构（类名堆叠）而不走 UI 包——若规范有、包无，**先扩 `packages/ui`**。  
- **色值**：优先使用 CSS 变量（与 `packages/tokens` / `trinity-base` 一致），避免业务内硬编码 hex 与 Token 双轨。

---

## 3. `@trinity/ui` 与静态模式映射（还原时逐项替换）

| 静态/脚本中的交互形态 | 包导出（`packages/ui/src/index.ts`） |
|----------------------|--------------------------------------|
| 主按钮、线框按钮、渐变主按钮 | `TButton` |
| 文内链接 | `TextLink` |
| 筛选形式 1（更多） | `FilterForm1More` / `FilterForm1MoreTrigger` |
| 筛选形式 2（药丸 + listbox） | `FilterForm2PillListbox` / `Trigger` |
| 筛选形式 3（标签 + 分段） | `FilterForm3LabeledSegmented`（优先 `segments` prop） |
| 搜索形式 1 / 2 | `SearchForm1Fixed` / `SearchForm2Grow` |
| 带标签输入 | `TextField1Labeled` |
| Tab 形式 1 / 2 | `TabSwitch1Underline` / `TabSwitch2Capsule` |
| 弹层 | `ModalPanel` |
| 帮助气泡 | `InternalHelpTip` |
| 模型列表行（多选等） | `SelectListForm1ModelRow` |

---

## 4. 分期执行（与仓库迭代顺序）

### 阶段 0（文档与骨架）— **已完成**

- 本文档定稿并随 PR 维护。  
- `apps/trinity-ai`：建立与上表一致的路由表；首页占位；**`/dev/ui-kit`** 保留 `@trinity/ui` 烟测页（不对外承诺 URL 稳定）。  
- 根 `npm run dev`（portal）或 `npm run dev -w @trinity/app-trinity-ai` 可访问各占位路由。

**已落地（仓库状态）**

| 路由 | 组件 | 说明 |
|------|------|------|
| `/` | `views/home/HomePage.vue` | 营销首页占位 |
| `/models` | `views/models/ModelsPage.vue` | 模型页占位（与静态主导航顺序一致：首页 → 模型 → 对话 → 文档） |
| `/chat` | `views/chat/ChatPage.vue` | 对话占位 |
| `/docs` | `DocsPage.vue` | 文档占位 |
| `/account/console` | `views/account/ConsolePage.vue` | 控制台占位（域级五件套见 `views/account/README.md`） |
| `/dev/ui-kit` | `UiKitPlayground.vue` | `@trinity/ui` 烟测（形式 3 使用 `segments` prop） |

**实现要点**

- 子路由表集中在 `apps/trinity-ai/src/trinityAiRoutes.ts`，路由 `name` 统一 `tai-*` 前缀；`meta.orPage` 与静态壳 `data-or-page` 对齐。  
- 壳布局为 `apps/trinity-ai/src/views/shell/TrinityAiShellLayout.vue`（五件套目录，见阶段 A）；独立应用 `router/index.ts` 以该壳为父级、`path: "/"` 挂载子表。  
- `apps/trinity-portal` 在 **`/trinity-ai`** 下嵌套同一壳与子表，便于 `:5173` 单端口预览；枢纽顶栏对 Trinity AI 使用 **`path.startsWith('/trinity-ai')`** 高亮。  
- 占位页内链使用 **`RouterLink` + `name: 'tai-*'`**，避免在 portal 嵌套路径下误用绝对 `href`。外链示意仍可用 `TextLink`。

### 阶段 A — 应用壳（替代 `trinity-ai-app-shell.js`）— **已完成**

- **`TrinityAiShellLayout.vue`**：沿用 `assets/trinity-base.css` 中 `header.or-inject`、`.header-row`、主导航、`.or-header-actions`、移动抽屉、品牌链套件等类名与 DOM 结构；`data-or-page` 取自 `route.meta.orPage`。  
- **壳层交互与 composable**（localStorage 键与静态脚本一致）：`views/shell/shellInteractions.ts` — `useTrinityOrSession` / `useTrinityOrTheme` / `useTrinityOrUiLang`、`mountTrinityOrWindowApi`（`window.TrinityOR`）；存储键名见同目录 `mock.ts`。  
- **登录/注册弹层**：已并入 `views/shell/TrinityAiShellLayout.vue`（OAuth 演示、表单校验、密码强度、记住我 `trinity_or_remember`）；`#login` / `#register` 与 `?signin=1` / `?register=1` 与壳行为对齐；`Escape` / 遮罩关闭；提交后由壳写入会话。  
- **`window.TrinityOR`**：`openSignIn`、`signOut`、`isSignedIn`，便于与旧脚本或外链调试对齐。  
- **套件首页**：默认 `../TrinityCloud/home.html`，可通过环境变量 **`VITE_TRINITY_SUITE_HOME`** 覆盖。  
- **控制台入口**：主导航仅四链（与静态一致）；控制台与 UI 烟测放在抽屉次要链；账户菜单内为 `RouterLink` + hash 锚点。  

> 顶栏登录按钮、OAuth 等仍使用 **`trinity-base` 的 `.btn` / `.or-auth-*`** 形态，与静态壳像素一致；业务内表单控件在后续页面迁移时再逐步换为 `@trinity/ui`。

### 阶段 B — 营销首页 — **已完成**

- **`TrinityAI/index.html`** 中 `<main>` 正文与页脚迁入 **`apps/trinity-ai/src/views/home/HomePage.vue`**（五件套目录）；样式为 **`apps/trinity-ai/src/views/home/home.css`**（已去掉与全局重复的 `html`/`body` 块）。  
- 站内链接改为 **`RouterLink`**（`tai-account-console` / `tai-docs` / `tai-models` 等）；页内锚点（`#capabilities`、`#apps` 等）仍为 `<a href="#">`。  
- **首屏 CTA**：`@trinity/ui` 的 **`TButton`**（`gradient` / `outline`）+ `useRouter` 跳转控制台与文档；步骤区 OAuth 示意按钮调用 **`window.TrinityOR.openSignIn`** 打开壳上登录弹层。  
- 静态正文再生成：根目录 `TrinityAI/index.html` 变更后执行 **`npm run gen:marketing -w @trinity/app-trinity-ai`** 重新生成 `views/home/HomePage.vue`（脚本会保留 TButton、RouterLink、`HOME_HERO_PROVIDERS` 与 `useHomeNavigation` 约定）。  
- **`apps/trinity-ai/index.html`**：与静态站对齐的 **description**、**title** 与 **Google Fonts**（Inter / Noto Sans SC）。

### 阶段 C — 对话页

- **执行清单与分期**：见 **`docs/Trinity对话页Vue迁移计划.md`**（与 `docs/Trinity对话页原型说明.md`、静态 `TrinityAI/app/chat/` 对照）。  
- **概要**：`chat-openrouter.js` 拆为 composables + 子组件；侧栏/筛选/搜索/弹层映射到总纲 §3 `@trinity/ui` 表；样式先迁入 `apps/trinity-ai` 局部 CSS 再按 Token 收敛。

### 阶段 D — `models` / `docs`

- 路由视图 + 内容块；同样优先 UI 包。

### 阶段 E — 账户控制台

- 表单与分段、Tab 对齐规范；路由与旧 `account/*.html` 锚点关系在 README 或本表更新一行。

### 阶段 F — 部署与静态目录

- 明确生产入口为 `apps/trinity-ai` 构建产物后，再决定是否将 `TrinityAI/` 标为归档或仅保留 refs。  
- `vite.config` 的 `base` 与外链（如 `TrinityCloud/home.html`）用环境变量配置。

---

## 5. 验收与走查

- 设计走查：对照 `apps/trinity-design` `/design-spec` 各形式；关键页在 **portal** 与设计枢纽同开对比。  
- 构建：`npm run build -w @trinity/app-trinity-ai` 无报错。  
- a11y：保留静态原型中已有的 `aria-*`、跳过链接等语义，迁移时不降级。

---

## 6. 相关文档

- `docs/Trinity前端Vue与Monorepo工程方案.md` — Monorepo 与依赖方向。  
- `docs/Trinity开发枢纽与AI协作流程.md` — 本地聚合预览端口约定。  
- `docs/Trinity对话页原型说明.md` — 对话模块产品与交互说明。  
- `docs/Trinity域模块说明-写作模板.md` — 域模块文档写法。
