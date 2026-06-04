---
name: trinity-vue-prototype-monorepo
description: >-
  Guides Trinity high-fidelity Vue3 + Vite + UnoCSS + TypeScript monorepo work:
  packages/tokens, packages/ui, apps per product and *-admin, Mock-as-contract,
  design-spec alignment, and engineer/AI handoff. Use when scaffolding or editing
  apps/*, packages/*, pnpm workspace, Uno theme, Vue prototypes, module README,
  five-piece delivery, Trinity AI / AI Cloud / Trinity GEO admin apps, or when the
  user mentions 高保真原型、Monorepo、五件套、tokens 包、组件库、Mock 契约、工程方案、双仓、交付工程师。
---

# Trinity · Vue 高保真原型 Monorepo

## 权威文档（先读再改大结构）

| 任务 | 必读 |
|------|------|
| Monorepo 目录、依赖、分期 | `docs/04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md` |
| 新建/改 `views`、模块 README、交付工程师 | `docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md`（五件套） |
| 设计枢纽 Vue 化 | `docs/01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md` |
| 交付工程师、双仓 push | `docs/00-协作与工作流/工程师/双仓协作与原型交付.md` · `如何消费原型.md` |
| 本地预览命令 | `docs/00-协作与工作流/Trinity开发枢纽与AI协作流程.md` |

本 skill 只收束 **必须遵守的规则**；细节与表格以工程方案 md 为准。

---

## 技术栈（固定）

- **Vite + Vue 3 + TypeScript + UnoCSS**
- **Monorepo**：推荐 **pnpm**；本仓库首期已用 **npm workspaces**（根 **`trinity-workspace`**、`workspaces: ["packages/*","apps/*"]`）。内部包依赖在旧版 npm 下用 `"*"` 代替 `workspace:*`。
- **设计真源**：**`apps/trinity-design`**（路由 **`/design-tokens`**、**`/design-spec`**）及 **`packages/tokens`**、**`packages/ui`**；**色值与原子样式**须与之对齐，**禁止**第三套口头规范。

---

## 目录与依赖（强制）

```
apps/*  →  packages/ui  →  packages/tokens
apps/*  →  packages/mocks-core（可选；仅 apps 引用）
```

| 包 / 应用 | 允许 | 禁止 |
|-----------|------|------|
| `packages/tokens` | CSS 变量、Uno theme 映射、可选 TS 常量 | 依赖 Vue、依赖任一 app |
| `packages/ui` | 纯视觉原子、无障碍、受控展示交互 | 真实 API、产品业务逻辑、引用 `apps/*` 或产品 Mock |

`packages/ui` 内按设计类型分 **`filters/`、`modal/`、`select-list/`、`buttons/`** 各一层；筛选「形式1/2/3」写在**文件名**（如 `FilterForm1More.vue` 形式1「更多」+ 可选菜单）。该包为**设计示意**（样式 + 事件面），非业务交付组件库。
| `apps/<name>` | 路由、views、**本应用** `mocks/`、组合组件 | 把业务写进 `packages/ui` |

**Admin**：与用户站同级放在 `apps/`，命名 **`{产品线}-admin`**（如 `apps/trinity-ai-admin`），独立构建与部署。

**设计枢纽**：`apps/trinity-design`（端口 **5210**），承载 `design-tokens` / `design-spec` 的 Vue 迁移与对外总览；**消费** `packages/tokens` 与 `packages/ui`，不另建一套色值。详见 `docs/01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md`。

## 产品线与 app 命名（与文档一致）

| 产品 | 用户站 | 管理端（若有） |
|------|--------|----------------|
| AI 云 | `apps/ai-cloud` | `apps/ai-cloud-admin` |
| Trinity AI | `apps/trinity-ai` | `apps/trinity-ai-admin` |
| Trinity GEO | `apps/trinity-geo` | `apps/trinity-geo-admin` |

静态迁移对照（过渡期保留原目录）：`TrinityCloud` → ai-cloud；`TrinityAI` → trinity-ai；`TrinityAI_Admin` → trinity-ai-admin；`Trinity GEO` 占位 → trinity-geo。

---

## 每个 app 内建议结构

```text
apps/<name>/src/
  views/
  router/
  mocks/
  components/     # 仅本应用组合层
  assets/
```

---

## 高保真 + 工程师 / AI 还原（防踩坑，执行级）

0. **五件套**：模块交付须满足 `docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md`（说明 · 工程 · 体验/online · roadmap/验收 · 附录）；产品进度写入 `trinity-product` 叶子 `roadmap.yml`，**勿**再维护 `docs/05-产品与PRD/roadmap/`。
1. **Mock 即契约**：Mock 与 **TypeScript 类型**同源；字段/枚举变更时留 **CHANGELOG 或日期说明**。
2. **路由溯源**：每 app 维护 **路由 ↔ 旧静态页（若有）↔ `/design-spec` 锚点**（`README.md` 或 `docs/路由与静态页对照-*.md`）。
3. **命名可检索**：页面与关键组件 **语义化文件名**（忌 `Page1.vue`）；`packages/ui` 命名与设计文档可追溯。
4. **长模板拆分**：单文件 Uno class 过长 → 拆子组件或上收至 `packages/ui`。
5. **与遗留 CSS**：Uno 主题与 `packages/tokens` 对齐；避免与 `assets/trinity-base.css` **长期双轨 hex**（迁移期双写须在工程方案或修订记录中写明）。

---

## Agent 工作方式检查清单

在新增或重构 Monorepo 相关代码前：

- [ ] 是否仍满足 **依赖方向**（ui 不碰 app、不碰产品 Mock）？
- [ ] 新页面是否可挂到 **路由溯源表**？
- [ ] Mock / 类型变更是否需 **防踩坑** 留痕？
- [ ] 视觉是否可对照 **`/design-spec`**、**`/design-tokens`**？

---

## 与现有仓库并存

- **`uno-demo/`**：验证用；Monorepo 落地后应 **并入 apps 或删除**，避免双脚手架。
- **静态 HTML**（`TrinityAI/` 等）：**渐进迁移**为各 `apps/*`；**不在未约定时整目录删除**（设计用静态 `design-*.html` 已由 **`apps/trinity-design`** 承接，仓库不再保留同名根文件）。

---

## 运营后台列表（trinity-ai-admin）

改 **检索 + 表格 + 分页** 子页时，除工程方案外须遵循：

- **Skill**：`.cursor/skills/trinity-admin-ruoyi-list/SKILL.md`（若依式工具栏、列宽、**全部左对齐**）
- **文档**：`docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md`
- **样式真源**：`apps/trinity-ai-admin/src/styles/admin-ruoyi.css`（`.admin-ep-table-wrap`）

列表表格勿写列级 `align`；勿对操作列单独居中。

---

## 扩展阅读（按需打开）

- 工程方案全文：`docs/04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md`
- 五件套全文：`docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md`
- 设计 token 技能：`.cursor/skills/trinity-design-tokens/SKILL.md`
- 运营后台列表技能：`.cursor/skills/trinity-admin-ruoyi-list/SKILL.md`
