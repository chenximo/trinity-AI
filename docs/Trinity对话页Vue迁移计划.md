# Trinity 对话页（`/chat`）静态 → Vue 迁移计划

> **真源页面**：`TrinityAI/app/chat/index.html` + `chat-openrouter.js` + `chat-openrouter.css`  
> **产品/交互说明**：`docs/Trinity对话页原型说明.md`（信息架构、主路径、状态机、键盘与 a11y）  
> **总纲**：`docs/TrinityAI用户站Vue还原计划.md` 阶段 C；本文件为 **可执行拆分与验收清单**，随实现更新。

---

## 1. 目标与边界

| 项 | 说明 |
|----|------|
| **目标** | 在 `apps/trinity-ai` 的 **`/chat`**（`src/views/chat/` 内 `ChatPage.vue`、同目录子块与 `raw`）中复现静态原型的 **布局、分区、可运行占位交互**，与壳 `TrinityAiShellLayout`、`meta.orPage: "chat"` 一致；`apps/trinity-portal` 下 `/trinity-ai/chat` 共用同一路由表。 |
| **本期不做** | 真实 OpenRouter/后端 API、流式输出、计费等；助手文案与对比区可保持 **占位 + 静态示意**，与 `原型说明` §1.2「静态优先」一致。 |
| **约束** | 与全站相同：`apps/trinity-ai` → `@trinity/ui` → `packages/tokens`；形式化控件走 **设计规范组件**，见总纲 §3 映射表。 |

---

## 2. 静态侧体量（便于排期）

| 文件 | 角色 | 迁移时注意 |
|------|------|-------------|
| `index.html` | 区域 DOM、模板片段、`data-orc-prototype-annotation` | 拆为 Vue 模板 + 少量 `v-html` 仅在有安全边界时；优先结构化组件。 |
| `chat-openrouter.js` | 全局 IIFE、DOM 查询、`MODELS` / `MODEL_COLLECTIONS`、事件绑定 | 拆为 **composables**（状态 + 纯函数）+ **视图内事件**；禁止在新代码中保留巨型单文件 IIFE。 |
| `chat-openrouter.css` | `orc-*` 大量布局与皮肤 | 先 **整页引入** 到 `apps/trinity-ai/src/views/chat/chat-openrouter.css`（经 `chat.css` 聚合）保证像素级回归，再按区块 **下沉为 scoped/模块** 与 Token 对齐（与 models 页「先迁后收敛」策略一致）。 |

脚本内已暴露的能力块（grep 函数名即可对照）：收藏与筛选、侧栏 Tab、模型集合/对比、`picker` 弹层、`Compare to`、预设芯片与角色选择器、会话显隐、侧栏列表渲染与 hover tooltip、Composer 与帮助气泡绑定等——迁移时按 **功能域** 拆文件，避免按行号硬搬。

---

## 3. 分期执行（建议在 PR 中粒度）

### C0 — 路由与壳对齐（极薄）

- [ ] `views/chat/ChatPage.vue` 去掉占位卡片：根容器类名与静态 `body`/主容器对齐（如 `orc-*` 根类），保证 `data-or-page` 已由壳设置 **`chat`**。  
- [ ] 确认 `main#main` 与营销页 `padding` 冲突：必要时为 chat 根加与模型页类似的 **`main#main:has(.chat-root)`** 重置（类名待定，与实现一致即可；模型侧见 `views/models/models.css` 中 `:has(.models-root)`）。

### C1 — 样式与 HTML 骨架迁入

- [ ] 从 `index.html` 抽出 **无顶栏重复** 的主体结构迁入 `views/chat/ChatPage.vue`（顶栏已由壳承担）。  
- [ ] 引入 `chat-openrouter.css`（及依赖的 `trinity-base` 已由入口引入则不再重复）。  
- [ ] 构建通过：`npm run build -w @trinity/app-trinity-ai`。

### C2 — 侧栏 · 模型列表

- [ ] `MODELS` 数据迁入 `src/data/` 或 `src/views/chat/` 下 TypeScript 模块 + 类型。  
- [ ] 搜索框：`SearchForm1Fixed` / `SearchForm2Grow`（与侧栏视觉一致者，对照 design-spec `#ds-search`）。  
- [ ] 筛选芯片：`FilterForm3LabeledSegmented` 或形式 2，与原型 `syncFilterChipsFromState` 行为对齐。  
- [ ] 模型行：列表容器 `orc-model-list` + `SelectListForm1ModelRow`（与设计 spec 一致）；收藏星、`is-active`、对比 ✓ 状态用 Vue 状态驱动。  
- [ ] Hover tooltip：优先 `InternalHelpTip` 或壳层气泡；若 DOM 与规范差异大，在 `packages/ui` 补最小示意件后再接。

### C3 — 侧栏 · 会话历史 + 窄屏抽屉

- [ ] 会话列表 UI 与分组；与 `orc-mobile-drawer-open` 等断点行为一致（`@media` 以现有 CSS 为准）。  
- [ ] 与壳抽屉 **不重复**：仅 chat 内区域抽屉/折叠逻辑；全局导航仍以壳为准。

### C4 — 主列：顶栏（预设 / 角色 / 选模）

- [ ] 预设芯片、`+ 选择模型`、角色选择弹层（`#orc-role-picker-overlay` 等）迁为组件 + `ModalPanel` 或页面级 `role="dialog"` 结构。  
- [ ] `useRouter` + `RouterLink` 跳转 `tai-account-console` 与 `#preset` 等，与 `原型说明` §1.3 一致。

### C5 — 主列：空态 / 线程 / 对比区

- [ ] 空态场景卡片与快捷芯片（数据可常量配置）。  
- [ ] 有消息：用户气泡、助手占位、**多模型对比**与综合总结折叠；`setConversationActive` / `updateCompareUIFromSelection` 等逻辑进 composable。  
- [ ] `Compare to`：与选择器同一弹层入口，行为对齐 §2.2.5（完成/取消、草稿不随 Esc 丢失等——产品规则以 `原型说明` 为准）。

### C6 — Composer 底栏

- [ ] `textarea`、图标行、发送/Shift+Enter；空发送时的原型默认句若保留，须在代码注释中标 **TODO：产品二选一**（见 `原型说明` §2.4）。  
- [ ] 底栏 ⓘ：`InternalHelpTip` + 模板；`data-orc-prototype-annotations` 剥离流程见 `原型说明` §2.6。

### C7 — 全局浮层与键盘

- [ ] 模型选择器大浮层：多选草稿、`pickerPreviewId`、右侧参数预览、`applyPickerSelectionToApp` 路径。  
- [ ] 记忆滑块、模型设置遮罩、会话菜单；**Esc 行为** 与静态一致（选择器打开时 Esc 不关闭等）。  
- [ ] `bindOrcHelpTips` 类逻辑：改为 Vue 生命周期注册/卸载，避免泄漏监听。

### C8 — 持久化与后续 API

- [ ] `localStorage`：`trinity_orc_fav_models` 等与静态键一致；封装小 composable（键名常量一处维护）。  
- [ ] 预留 **HTTP/流式** 接口层（`src/views/chat/api.ts` 或 `services/`），页面仅依赖接口类型，不接真实密钥。

---

## 4. 建议目录结构（`apps/trinity-ai/src`）

```
views/
  views/chat/ChatPage.vue    # 组装 + 布局根（路由入口）
chat/                       # 可选：与路由解耦
  components/               # OrcSidebarModels.vue, OrcComposer.vue, …
  composables/              # useOrcModelPicker.ts, useOrcCompare.ts, …
  data/                     # models.ts, collections.ts（从静态常量迁出）
styles/
  chat-openrouter.css       # 自静态迁入，再逐步瘦身
```

命名前缀 `Orc*` 仅作过渡，与 `orc-*` 类名对齐；稳定后可改为业务语义名。

---

## 5. 验收清单（阶段 C 关闭前）

- [ ] **路由**：独立站 `/chat`、portal `/trinity-ai/chat` 均可进入，壳高亮正确。  
- [ ] **构建**：`npm run build -w @trinity/app-trinity-ai` 与 `npm run build -w @trinity/app-portal` 无报错。  
- [ ] **交互**：单模切换、打开/关闭选择器、对比模式进入/清空、发送后空态→线程切换、收藏读写与列表同步（与原型一致处）。  
- [ ] **a11y**：保留/补全 `aria-expanded`、`role="dialog"`、跳过链接；不弱于静态。  
- [ ] **文档**：本文件勾选状态与 `Trinity对话页原型说明.md` §2 表格冲突时，**以代码 + PR 为准**回写说明。

---

## 6. 与总计划文档的衔接

在 `docs/TrinityAI用户站Vue还原计划.md` 中将 **阶段 C** 收敛为一句并指向本文；阶段 C 完成后把 `ChatPage.vue` 行更新为「已落地」与组件备注。

---

*文档版本：初稿；随 `TrinityAI/app/chat/*` 与 `ChatPage` 实现迭代维护。*
