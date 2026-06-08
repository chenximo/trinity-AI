---
name: trinity-user-console
description: >-
  Trinity 用户控制台系统 Vue/HTML：规则 ID、禁止项、检查清单。用于 account/console、用户中心列表；
  触发词：用户控制台系统规范、trinity-user-console、user-console-spec、#keys、#preset、#accounts。
  Agent 必读本 Skill；样例验收 /user-console-spec；类名见附录 A。勿与运营后台混用。
disable-model-invocation: true
---

# Trinity 用户控制台系统 · Agent 操作手册

边界：[`./DOMAIN.md`](./DOMAIN.md) · Workflows：[`add-console-page`](./workflows/add-console-page.md)、[`adjust-account-flow`](./workflows/adjust-account-flow.md) · 确认：[`./confirmation.md`](./confirmation.md)

**Agent 唯一执行真源**。规范页 `/user-console-spec` 仅做**视觉验收**；`docs/03` 给人读叙事。方法论：`docs/08-方法论与汇报/Vue原型生成最佳实践-Skill规范页与验收.md`。

## 触发词（任务里出现则应读本 Skill）

`用户控制台系统规范` · `trinity-user-console` · `user-console-spec` · `account/console` · `#keys` · `#preset` · `#accounts` · `AI 云用户中心` · `租户控制台` · `OpenRouter 式控制台`

**勿用本 Skill**：运营后台、`el-table`、`admin-ops-spec` → `trinity-admin-ruoyi-list`。

## 与 PM 协作 · 先确认再改（可选）

PM 说「先画图确认」或 `@我的提示词` 时：**先用 ASCII 分区图**（与规范页 §2 `user-console-spec-diagram` 同风格，几行框线写清左/右/第几行）复述将改的规则与锚点，**待确认后再改**。`docs/00-协作与工作流/我的提示词.md` 为 PM **随手记**，勿擅自改成正式规范条文。

## 规范先行

- 规则 ID 以本文件为准；改规则须**同步** `/user-console-spec` 样例（见方法论 §7）。
- **用户未说「落地工程」** → **仅改规范页**：`apps/trinity-design/.../user-console-spec`（`UserConsoleSpecHub.vue`、`console-sample/*`、`user-console-spec-guide.css`）+ 本 Skill + `docs/03`。**勿**改 `trinity-base.css`、`ConsolePage.vue`、`TrinityAI/account/console.html` 等产品工程。

---

## 规则速查（可判定）

| ID | MUST / NEVER |
|----|----------------|
| **UC-SHELL-01** | MUST：`or-shell` + `aside.or-side` + `.or-main`；无整页页脚 |
| **UC-MAIN-01** | MUST：面包屑 `nav.or-crumb` |
| **UC-MAIN-HEAD-01** | MUST：页头**两行分区**——① 标题行：左 `h1`、右 `.or-*-title-actions`（形式 2 筛选 + 最右 `btn-gradient`）；② 说明行在标题行**下方**全宽左区：`p.or-lead` + 小标题后 ⓘ。**NEVER** 说明/ⓘ 与右侧工具挤在同一行两端 |
| **UC-MAIN-02** | MUST：`.or-*-title-row` 右工具顺序：筛选在左、主 CTA 最右（见 UC-MAIN-HEAD-01） |
| **UC-MAIN-03** | MUST：`.or-*-lead-row` · `p.or-lead`；ⓘ 紧跟说明内**小标题**后；**NEVER** 贴 `h1` 或说明行最右端 |
| **UC-MAIN-04** | MAY：搜索行 `.or-keys-toolbar` + **`SearchForm1Fixed`**（`@trinity/ui` 形式1 固定宽，默认 `17.5rem`）；**NEVER** 手写药丸 `SearchForm2Grow` / 裸 `label.or-keys-search` |
| **UC-MAIN-05** | MAY：表下 `p.or-keys-summary` |
| **UC-TBL-COL-01** | MUST：`table.data-table` `width:100%` · 默认 `table-layout:auto`（表头与数据**同列**自适应）；`div.table-wrap` + `overflow-x:auto`；**允许**单列 `min/max-width`（例 `.or-keys-col-key`）；**NEVER** 常规列表 `table-layout:fixed` + 全列 `%` / `colgroup` 锁宽 · JS 量宽 |
| **UC-TBL-HEAD-01** | MUST：扁平 `.data-table th`；**NEVER** 渐变 `or-preset-table` 表头 |
| **UC-TBL-ALIGN-01** | MUST：全部 `th`/数据 `td` **左对齐** |
| **UC-TBL-ALIGN-02** | **NEVER**：`or-keys-th-center` / `or-keys-col-center` |
| **UC-TBL-WRAP-01** | MUST：`div.table-wrap`；宽表可 `overflow-x: auto` |
| **UC-TBL-OPS-01** | MUST：行内主操作 **&lt; 4** → `or-preset-actions` 内 `or-btn-outline` **横排**、`justify-content:flex-start` |
| **UC-TBL-OPS-02** | MUST：行内主操作 **≥ 4** → `or-keys-ops` ⋮；**NEVER** 并排 4+ 线框 |
| **UC-TBL-OPS-03** | **NEVER**：线框按钮列用 `or-keys-th-actions` / `or-keys-actions-row`（3.25rem 窄列） |
| **UC-TBL-OPS-04** | **NEVER**：同一行混用横排线框与 ⋮ |
| **UC-CTRL-01** | MUST：主按钮 `.btn.btn-gradient`；形式 2 见 `trinity-design-tokens` |
| **UC-TRACK-01** | MUST：与运营后台分轨（非 EP 若依列表壳） |

类名挂钩见 **附录 A**（可替换，**UC-TBL-*** 视觉必达）。

---

## 读盘顺序（生成 Vue 前）

1. 本 Skill **规则速查 + §5 清单**
2. 母版：`apps/trinity-ai/src/views/account/ConsolePage.vue`、`account.css`
3. 验收锚点（附录 B）→ 浏览器或 `console-sample/` 源码
4. `trinity-design-tokens`（形式 2、`adm-form2-dd.js`、弹窗）

**不要**通读 `docs/03` 全文；仅当用户问实施状态时读该文档「实施状态」段。

---

## 1 · 布局（UC-SHELL-01）

```
header.or-inject          ← 产品壳，非 account 内
.account-console-root
  .or-shell
    aside.or-side         ← .or-side-heading + a.or-dash-nav.is-active
    .or-main              ← UC-MAIN-* + UC-TBL-*
```

---

## 2 · 主列五步（UC-MAIN-01～05）

| ID | 块 | DOM 要点 |
|----|-----|----------|
| UC-MAIN-01 | 面包屑 | `nav.or-crumb` |
| UC-MAIN-HEAD-01 | 页头分区 | `header.or-keys-pagehead` · 标题行（左标题/右工具）+ 说明行（下） |
| UC-MAIN-02 | 标题行工具 | `.or-keys-title-row` · `.or-keys-title-actions` |
| UC-MAIN-03 | 说明 + ⓘ | `.or-keys-lead-row` · `p.or-lead` · `details.or-keys-info` |
| UC-MAIN-04 | 搜索 | `.or-keys-toolbar` · `SearchForm1Fixed`（`v-model` · `input-id` · `placeholder`） |
| UC-MAIN-05 | 摘要 | `p.or-keys-summary` |

角色页头可用 `or-preset-pagehead`；**UC-TBL-*** 仍适用。

---

## 3 · 表格（UC-TBL-*）

**UC-TBL-COL-01**（自适应列宽）与 **UC-TBL-HEAD-01 / UC-TBL-ALIGN-01** 必达；操作列 **UC-TBL-OPS-01 / 02** 二选一。规范页蓝条索引：`/user-console-spec` 页顶「重要规范索引」。

---

## 附录 A · 类名挂钩（示例，可替换）

| 用途 | 示例类名 | 规则 ID |
|------|----------|---------|
| 页头壳 | `header.or-keys-pagehead` · `or-preset-pagehead` · `or-log-pagehead` | UC-MAIN-HEAD-01 |
| 说明内 ⓘ | `details.or-keys-info`（紧跟小标题句，规范页 `user-console-spec-lead-*`） | UC-MAIN-03 |
| 搜索 | `SearchForm1Fixed` from `@trinity/ui` | UC-MAIN-04 |
| 表格外框 | `table-wrap` · `or-keys-table-wrap` | UC-TBL-WRAP-01 |
| 表格作用域 | `data-table` · `or-keys-table` | UC-TBL-HEAD-01 |
| 长文本列约束 | `.or-keys-col-key`（`min-width` / `max-width`） | UC-TBL-COL-01 |
| 用量宽表 | `or-logs-scroll` · `or-logs-wide` | UC-TBL-HEAD-01 |
| 操作列表头/格（线框） | `th.or-table-th-ops` · `td.or-table-td-ops` | UC-TBL-OPS-01 |
| 线框按钮容器 | `div.or-preset-actions` · `button.or-btn-outline` | UC-TBL-OPS-01 |
| 操作列 ⋮ | `td.or-table-td-ops` · `div.or-keys-ops` · `.or-keys-ops-trigger` | UC-TBL-OPS-02 |
| 居中列（禁用） | `or-keys-th-center` · `or-keys-col-center` | UC-TBL-ALIGN-02 |
| 窄列 ⋮ 专用（禁用于线框列） | `or-keys-th-actions` · `or-keys-actions-row` | UC-TBL-OPS-03 |

---

## 唯一风格示范（整页只认一个）

**`/user-console-spec#spec-sample-main`（§2 · API 密钥主列）** = 用户控制台系统统一视觉真源（含表头/对齐）。`#preset`、`#logs`、AI 云等须**收敛到此风格**。§3 **仅** `#spec-sample-table-actions-buttons` / `#spec-sample-table-actions-menu` 两个操作列分叉样例。

## 附录 B · 验收锚点（/user-console-spec）

| 锚点 | 验收 |
|------|------|
| **`#spec-sample-main`** | **主示范** · UC-SHELL / UC-MAIN-HEAD-01～05 · **UC-TBL-COL-01** · **UC-TBL-HEAD-01** · **UC-TBL-ALIGN-01** |
| `#uc-spec-note-pagehead-layout` | UC-MAIN-HEAD-01（页头左右分区蓝条） |
| `#uc-spec-note-col-layout` | UC-TBL-COL-01（条文蓝条） |
| `#spec-1-layout` | UC-SHELL-01（壳层示意） |
| `#spec-3-table` | §3 规则矩阵（条文） |
| `#spec-sample-table-actions-buttons` | UC-TBL-OPS-01（操作 &lt; 4 横排） |
| `#spec-sample-table-actions-menu` | UC-TBL-OPS-02（操作 ≥ 4 ⋮） |

---

## 5 · 交付前检查清单（对照规则 ID）

- [ ] **UC-TRACK-01** 非运营后台 EP 表
- [ ] **UC-SHELL-01** 壳层 DOM
- [ ] **UC-MAIN-HEAD-01** **UC-MAIN-01～03** 页头分区（UC-MAIN-04 搜索 · UC-MAIN-05 摘要若适用）
- [ ] **UC-TBL-COL-01** **UC-TBL-HEAD-01** **UC-TBL-ALIGN-01** **UC-TBL-ALIGN-02**
- [ ] **UC-TBL-OPS-01** 或 **UC-TBL-OPS-02**（未违反 **UC-TBL-OPS-03/04**）
- [ ] **UC-CTRL-01** 按钮 / 形式 2 脚本
- [ ] 附录 B 对应样例块视觉一致（类名可不同）

---

## 路径索引

| 用途 | 路径 |
|------|------|
| 规范样例 | `/user-console-spec` · `apps/trinity-design/.../UserConsoleSpecHub.vue` |
| 母版 | `apps/trinity-ai/src/views/account/` |
| AI 云 | `apps/ai-cloud/src/views/account/` |
| CSS | `assets/trinity-base.css` · `account.css` |

关联：**`trinity-design-tokens`** · **`trinity-vue-prototype-monorepo`**
