# Trinity 前端：Vue3 + Vite + UnoCSS + TypeScript 工程方案

> **文档类型**：工程与目录设计说明（与现有静态原型并存、分期迁移）。  
> **对齐现状**：仓库根目录已有 `TrinityAI`、`TrinityCloud`、`Trinity GEO`、`TrinityAI_Admin`、`assets/trinity-base.css` 等；**设计色板与规范**以 **`apps/trinity-design`**（`/design-tokens`、`/design-spec`）维护。

---

## 1. 背景与目标

### 1.1 背景

- 当前以 **静态 HTML + 全局 CSS（`assets/trinity-base.css`）** 为主，适合快速出高保真原型。  
- **设计色板与规范**以 **`apps/trinity-design`**（Vue 路由 `/design-tokens`、`/design-spec`）为单一迭代入口；`packages/tokens` 与 `packages/ui`（含 `ui-kit.css`）与之对齐。  
- 下一阶段需要：**可路由演示、可维护组件、Mock 数据与类型契约、多产品线并行**，便于设计定界面/流程/数据格式，开发接功能与接口。

### 1.2 目标

- 采用 **Vite + Vue 3 + UnoCSS + TypeScript** 搭建 **Monorepo**（推荐 **pnpm workspace**）。  
- **`packages`**：共享 **色板 / 设计 Token** 与 **纯视觉原子组件库**（无业务逻辑）。  
- **`apps`**：三大产品线（及各自 **Admin**）各自独立 **可构建、可部署** 的 Vite 应用；内含 **路由、页面模拟、本地 Mock**。  
- 与现有静态目录 **并行存在**，按模块 **渐进迁移**，避免一次性重写。

---

## 2. 技术选型（固定）

| 层级 | 技术 | 说明 |
|------|------|------|
| 构建 | Vite | 开发体验与按需编译；与各 app 独立 `index.html` 入口一致。 |
| 框架 | Vue 3 + TypeScript | 组件化、类型契约；模板高亮依赖编辑器 **Vue - Official (Volar)**。 |
| 样式 | UnoCSS | 原子类 + 按需生成；**主题与色值**须与 `packages/tokens` 中 CSS 变量对齐，避免双轨 hex。 |
| 工程 | Monorepo workspace | 推荐 **pnpm** + `pnpm-workspace.yaml`；亦可 **npm workspaces**（根 `package.json` 的 `workspaces`；内部依赖可用 `"*"` 绑定 workspace 包，见已落地的 `trinity-workspace`）。 |

可选：根级 **ESLint + Prettier**、**Vue TSC** 在 CI 中做类型检查。

---

## 3. 与现有目录的关系

| 现有路径 | 新栈中的角色（建议） |
|----------|----------------------|
| `TrinityAI/` | **过渡期保留**：静态对话、控制台等；页面级迁移至 `apps/trinity-ai` 等。 |
| `TrinityCloud/` | 营销/云产品静态页；迁移目标 **`apps/ai-cloud`**。 |
| `Trinity GEO/` | 当前可为空占位；新栈落点 **`apps/trinity-geo`**（或文档说明与空目录二选一，避免双义）。 |
| `TrinityAI_Admin/` | 后台静态原型；迁移目标 **`apps/trinity-ai-admin`**。 |
| `assets/trinity-base.css` | 逐步收敛：全局 reset 或与 `packages/tokens` 合并，**避免**与 Uno 主题各写一套色板。 |
| **`apps/trinity-design`** | **设计色板 + 设计规范**（`/design-tokens`、`/design-spec`）；消费 `packages/tokens` 与 `packages/ui`（含 `ui-kit`），与 `assets/trinity-base.css` 联调。 |
| `uno-demo/` | 技术验证用；Monorepo 落地后可 **并入 `apps` 或删除**，避免长期两套脚手架。 |

---

## 4. 建议的仓库结构（Monorepo）

```text
Trinity/
  package.json                 # 根：workspaces + scripts（name: trinity-workspace）
  tsconfig.base.json
  # 可选：pnpm-workspace.yaml（若改用 pnpm）

  packages/
    tokens/                      # 色板变量：`src/core.css`（:root + 深浅色）为单一真源；`trinity-base.css` 通过 @import 引用；`theme.css` 供仅 Vite 应用入口
    ui/                          # 设计示意：`filters/`、`modal/`、`select-list/`、`buttons/`（各一层；形式编号在文件名）
    mocks-core/                  # （可选）跨产品共享的 Mock 类型与少量假数据

  apps/
    ai-cloud/                    # AI 云 · 用户站
    ai-cloud-admin/              # AI 云 · 管理端（若有）
    trinity-ai/                  # Trinity AI · 用户站
    trinity-ai-admin/            # Trinity AI · 管理端（对应原 TrinityAI_Admin 演进）
    trinity-geo/                 # Trinity GEO · 用户站
    trinity-geo-admin/           # Trinity GEO · 管理端（若有）
    trinity-design/              # 设计枢纽：色板 + 规范（对外总览，见设计迁移计划）
    trinity-portal/              # 开发枢纽：单端口聚合各 app 路由预览（本地/评审，见 docs/Trinity开发枢纽与AI协作流程.md）

  # 现有静态资产（迁移期保留）
  TrinityAI/
  TrinityCloud/
  Trinity GEO/
  TrinityAI_Admin/
  assets/
  docs/
```

### 4.2 首期脚手架（已实现，随迭代更新）

- **位置**：与上表一致，落在 **仓库根目录**（与 `TrinityAI/`、`TrinityCloud/` 并列），**不**再套一层 `frontend/` 之类外层目录。  
- **根 `package.json` 名称**：`trinity-workspace`（私有，仅作 workspace 根，**非** npm 发布名）。  
- **包作用域**：`@trinity/tokens`、`@trinity/ui`、`@trinity/mocks-core`（mocks-core 仅占位，可后续扩）。  
- **应用**：`apps/trinity-ai`、`apps/ai-cloud`、`apps/trinity-geo`、`apps/trinity-ai-admin`、`apps/trinity-design`；另建 **`apps/trinity-portal`（`@trinity/app-portal`）** 作为 **开发枢纽**：根目录 **`npm run dev`** 默认在 **5173** 单进程聚合设计页与各骨架路由（详见 **`docs/Trinity开发枢纽与AI协作流程.md`**）。各 app 独立 dev 端口仍为 **5201–5204** 与 **5210**（设计枢纽）；一览见 **`apps/README.md`**。  
- **包管理**：当前使用 **npm workspaces**（`workspace:*` 在旧版 npm 上不可用，内部依赖写作 `"*"`）；若团队统一 **pnpm**，可再引入 `pnpm-workspace.yaml` 与 `workspace:*`。

### 4.1 依赖方向（强制）

```
apps/*  →  packages/ui  →  packages/tokens
apps/*  →  packages/mocks-core（可选，仅 apps 引用）
```

- **`packages/ui`** 不得依赖任一 `apps/*`，不得引用产品 Mock。  
- **`packages/tokens`** 不依赖 Vue，可被文档站或 Story 工具引用。

---

## 5. 产品线与 `apps` 命名约定

### 5.1 三大产品 + Admin

| 产品 | 用户站 app | 管理端 app（若有） |
|------|------------|-------------------|
| AI 云 | `apps/ai-cloud` | `apps/ai-cloud-admin` |
| Trinity AI | `apps/trinity-ai` | `apps/trinity-ai-admin` |
| Trinity GEO | `apps/trinity-geo` | `apps/trinity-geo-admin` |

**约定**：Admin **一律放在 `apps/`**，命名为 **`{产品线}-admin`**，与用户站 **拆分构建、拆分部署**，权限与路由边界清晰。

若某产品线暂无 Admin，可不建目录，待需求明确后再加。

### 5.2 每个 app 内部建议目录

```text
apps/<name>/
  src/
    views/           # 页面级路由组件
    router/          # vue-router
    mocks/           # 本应用 Mock 数据（JSON / TS）
    components/      # 仅本应用组合层（非通用则不放 packages/ui）
    assets/
  index.html
  vite.config.ts
```

---

## 6. `packages/tokens`（色板与设计 Token）

### 6.1 职责

- 从 **`packages/tokens/src/core.css`** 与 **`trinity-base.css`** 收敛 **唯一一套 CSS 变量**（含浅色 / 深色 / `system` 策略若需要）。  
- 提供 **Uno `theme` 配置**（颜色、圆角、字号等与变量对齐），供各 app 与 `packages/ui` 使用。  
- 可选：导出 **TS 常量或类型**，供 Mock 与文档使用。

### 6.2 验收标准

- 修改主色或关键 radius 时，**Uno 工具类与遗留 CSS 变量**不长期分叉；迁移期需在文档中写明「以 tokens 包为准」或「过渡期双写清单」。

---

## 7. `packages/ui`（组件库）

### 7.1 职责

- **纯视觉与交互原子**：按钮、输入框壳、弹窗壳（头/体/底）、列表行（对齐 **`/design-spec`** 中形式 1 / 2）、Typography 等。  
- **可含**：无障碍属性、`focus-visible`、键盘可操作说明。  
- **不含**：登录态、计费、真实 API、产品专有表格列与业务校验。

### 7.2 文档（建议）

- 在 `packages/ui` 内引入 **组件文档 / 预览**（如 VitePress、Histoire、Storybook 等任选其一），供设计与开发对照；与三大 `apps` 部署分离或根脚本统一启动。

---

## 8. Mock 与类型契约

- **Mock 数据** 放在 **各 `apps/*/src/mocks`**，形状用 **TypeScript 类型** 描述，便于交付开发时作为「假接口契约」。  
- 跨产品可复用的类型或假数据可放 **`packages/mocks-core`**（可选）。  
- **`packages/ui`** 不依赖 Mock 包。

---

## 9. 分期落地（建议）

| 阶段 | 内容 |
|------|------|
| **一期** | 根 workspace、`tsconfig` 基座、三（或六）个 app **空壳** 可 `pnpm dev` / `pnpm build`；`tokens` 包打通 CSS 变量 + Uno theme，在一个 app 内验证主题切换。 |
| **二期** | `ui` 包首批原子组件（与 **`/design-spec`** 对齐）；文档站可预览。 |
| **三期** | 按产品迁移页面：建议先 **Trinity AI 一条主路径**（如壳 + 关键弹窗），再 **AI 云首页块**，最后 **GEO** 随 PRD 填充。 |
| **持续** | 静态 HTML 与 Vue app 并行；迁移完成的模块从静态目录退役或改为跳转至新 app。 |

---

## 10. 设计 / 开发分工（与选型一致）

| 角色 | 负责 |
|------|------|
| 设计 / 产品 | 界面、流程、**Mock 数据结构**、路由与页面清单；对齐 **`/design-spec`** 与 **`/design-tokens`**。 |
| 开发 | 各 `apps` 内功能、真实接口、权限、状态管理、与后端联调；在 `packages/ui` 仅扩展通用能力时提 PR 到 ui 包。 |

---

## 11. 高保真交付与工程师 / AI 还原：防踩坑

本工程的目标包含：**高保真可演示**，且 **便于技术工程师结合 AI 做项目还原**。架构选对只是前提，下列约定能显著减少「AI 猜错、工程返工」。

### 11.1 Mock 即契约

- **字段名、嵌套结构、枚举取值** 与正式接口设计尽量一致；Mock 文件与 TS 类型 **同源**（类型导出 + 假数据引用同一形状）。  
- **破坏性变更**（删字段、改含义、改枚举）时：在 `docs/` 或 app 内 `mocks/CHANGELOG.md` 写 **一行说明 + 日期**，或给 Mock 版本号；避免工程师与 AI 仍按旧结构生成代码。  
- 列表、分页、空态、错误态若原型要演示，**各给一组 Mock**，并在路由或页面注释中标明「演示用 / 非最终接口」。

### 11.2 路由与溯源表（建议每 app 一份）

- 在 **`apps/<name>/README.md`** 或 **`docs/路由与静态页对照-<app>.md`** 维护表格：**路由 path** → **对应旧静态路径（若有）** → **设计稿或 `/design-spec` 锚点** → **备注**。  
- 工程师与 AI **先查表再改文件**，减少「不知道这页对应哪份 HTML」的上下文丢失。

### 11.3 设计规范单一事实来源

- **视觉与交互原子** 以 **`apps/trinity-design`**（路由 **`/design-spec`**、**`/design-tokens`**）及 **`packages/tokens`**、**`packages/ui`** 为权威；**不另起第三套「口头规范」**。  
- 若规范与实现暂时不一致，在 **规范页或本方案文档「修订记录」** 中写明以哪一侧为准、计划何时对齐。

### 11.4 命名与可检索性

- **路由、页面组件、关键组合组件** 使用 **语义化文件名**（如 `ModelPickerModal.vue`、`ConsolePresetTable.vue`），避免 `Page1`、`Tmp`。  
- **公共能力** 放在 `packages/ui` 时用 **与设计文档一致或可追溯的组件名**，便于 AI 用自然语言检索（「弹窗头」「形式 2 下拉」等）。

### 11.5 对 AI 与人类的共同说明

- **AI 还原的是仓库里已写清的内容**：类型、Mock、路由表、规范链接越完整，还原成本越低。  
- **长模板可拆组件**：单文件 `class` 过长时，拆分子组件或抽 `packages/ui`，避免单次对话贴不全导致 AI 漏状态。  
- **本仓库日常开发枢纽与给 AI 的分步清单**：见 **`docs/Trinity开发枢纽与AI协作流程.md`**。

---

## 12. 待定事项（需产品确认）

1. **`Trinity GEO` 空目录**：与 `apps/trinity-geo` 是否保留双份；若只保留 app，根目录空壳是否删除并改文档说明。  
2. **AI 云 Admin**：是否一期就建 `apps/ai-cloud-admin`，还是待需求后再建。  
3. **`TrinityAI_Admin` 与 `trinity-ai-admin` 命名**：是否严格一一对应迁移，或合并为单一 Admin 应用（多模块路由）——影响仓库目录与部署个数。

---

## 13. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-11 | `packages/ui` 扁平为「类型一层」：`filters/`、`modal/`、`select-list/`、`buttons/`；形式编号写入文件名；弱链接并入 `buttons/TextLink.vue`；包定位改为设计示意（非业务项目）。 |
| 2026-05-11 | `packages/ui` 按设计类型分子目录：`filters/form-{1,2,3}`、`buttons`、`modal`、`links`；`TAppFilterMore` 兼容导出指向 `FilterMoreTrigger`。`trinity-ai` 入口改为 `trinity-base.css` 以便形式2/3 类名样式完整。 |
| 2026-05-13 | 初稿：基于当前仓库结构讨论整理。 |
| 2026-05-13 | 仓库根落地 Monorepo 首期：`packages/tokens|ui|mocks-core` + `apps` 四应用；根 `trinity-workspace` + npm workspaces；见 §4.2、`apps/README.md`。 |
| 2026-05-13 | 新增 `apps/trinity-portal`：根 `npm run dev` 单端口聚合路由；操作与 AI 协作流程见 **`docs/Trinity开发枢纽与AI协作流程.md`**；§4 目录树与 §4.2 已补充。 |
