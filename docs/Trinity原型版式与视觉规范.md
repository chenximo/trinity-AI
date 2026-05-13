# 原型设计规范（Trinity 系列静态页）

本文档约定 **Trinity Cloud**（`TrinityCloud/`）、**Trinity AI**（`TrinityAI/`）、**Trinity Admin**（`TrinityAI_Admin/`）及 **跨产品静态资源**（`Trinity/assets/`）在 **视觉体系统一** 与 **版心 / 边距** 上的规则，便于后续迭代与评审对齐。

### 跨产品静态资源（`Trinity/assets/`）

| 路径 | 说明 |
|------|------|
| `Trinity/assets/trinity-base.css` | 三产品共用的设计 token、顶栏与基础布局变量；`TrinityAI`、`TrinityCloud` 页面通过相对路径 `../assets/trinity-base.css`（或自子目录 `../../assets/trinity-base.css`）引用 |

### 套件门户（`TrinityCloud/`）

| 路径 | 说明 |
|------|------|
| `TrinityCloud/index.html` | **Trinity Cloud** 套件总入口（静态原型）；样式 `../assets/trinity-base.css`；链至 `TrinityAI/index.html`、`home.html`、`TrinityAI_Admin/` 等 |
| `TrinityCloud/home.html` | 多云云落地营销页（自原 `marketing/home.html` 迁入） |
| `TrinityCloud/*.css`（可选） | Cloud 专有样式建议直接放在本目录，文件名自解释（如 `cloud-home.css`） |

### 用户侧 HTML 目录（`TrinityAI/`）

| 路径 | 说明 |
|------|------|
| `TrinityAI/index.html` | **Trinity AI** 产品营销首页（原 `marketing/index.html`）；顶栏链至 `../TrinityCloud/home.html` 等 |
| `TrinityAI/app/` | 核心应用：`models.html`、`docs.html`；对话模块在 **`app/chat/`**（`index.html` + 模块内样式脚本） |
| `TrinityAI/account/` | 账户 / 控制台：`console.html`、`login.html`、`register.html`，及跳转别名 `keys.html`、`billing.html` |
| `TrinityAI/static/trinity-ai-app-shell.js`、`TrinityAI/app/chat/chat-openrouter.js` | 产品侧脚本；`app/`、`account/` 内页面按目录深度引用 `static/trinity-ai-app-shell.js`；**对话逻辑与样式仅在 `app/chat/`** |
| `TrinityAI/app/chat/chat-openrouter.css` | 对话模块专用样式，与 `index.html` 同目录 |

顶栏注入脚本 `static/trinity-ai-app-shell.js` 在页面位于 `app/`、`account/` 及其子目录（如 `app/chat/`）时，为指向 `TrinityAI` 根下页面的链接自动加若干层 `../` 前缀（见脚本内 `orPathPrefix`）。

---

## 1. 总设计统一原则

### 1.1 风格统一

- **字体**：Inter + Noto Sans SC（与页面 `<link>` 一致），正文行高约 `1.5`；**字号与字重阶梯**以本节下 **§1.4** 为准，标题字距保持各页现有层级（首页眉题、区块标题、表格标题等沿用页面内样式）。
- **圆角与面板**：小圆角 `8px`、大圆角 `12px` 级别与 `Trinity/assets/trinity-base.css` / `TrinityAI_Admin/admin.css` 中 `--radius`、`--adm-radius` 一致，避免同一产品内混用多套卡片圆角。
- **组件语义**：主操作按钮使用渐变主按钮（`btn-gradient`）、次要操作为描边或幽灵按钮；链接悬停与焦点环与现有 `--blue` / `--adm-blue-ring` 行为一致。

### 1.2 主题色统一

- **主色（品牌蓝）**：`#2563eb`（Tailwind blue-600 量级）。
  - 用户侧 / Cloud：`Trinity/assets/trinity-base.css` 中 `--blue`，渐变 `--grad` 以该蓝为起点并与紫色过渡。
  - 管理侧：`TrinityAI_Admin/admin.css` 中 `--adm-blue` 与上述为 **同一色值**，保证「门户 ↔ 后台」截图与评审时色相一致。
- **辅助色**：浅蓝底 `--blue-soft` / `--adm-blue-soft`，焦点环 `--blue-ring` / `--adm-blue-ring`；正文灰阶 `--text`、`--muted`、`--border` 等同源定义，不在单页私自改 HEX。

### 1.3 版式与格式统一

- **文案层级**：页面级 `h1` → 区块 `h2` → 卡片 `h3`；说明性段落使用统一 `muted` 色，避免单页引入额外灰阶。
- **间距节奏**：区块纵向间距以现有 section / panel 的 `padding` 为准；**横向页边距**严格按下节「布局规范」执行，不在单页随意改用 `clamp` 或任意 `rem` 作为左右栏外距（除非本文档修订）。

### 1.4 字号与字重阶梯（约定）

以下为 **设计约定**；实现以 `rem` 为主（默认 `html` 字号 16px 时换算为 px），与 `Trinity/assets/trinity-base.css`、各业务页（如 `TrinityAI/app/chat/chat-openrouter.css`）中已有用法对齐。**新增界面时优先落在表中区间内**，避免再引入一档无出处的字号。

| 层级 | 典型语义 | `rem` 范围 | 约 px（16px 基准） | 字重 |
|------|-----------|-------------|-------------------|------|
| **L1** | 页面主标题、营销 hero 主句 | `1.5rem`–`2rem` | 24–32 | `600`–`700` |
| **L2** | 区块标题、`h2`、大面板标题 | `1.125rem`–`1.35rem` | 18–22 | `600`–`700` |
| **L3** | 卡片标题、`h3`、侧栏分组标题 | `1rem`–`1.125rem` | 16–18 | `600` |
| **L4** | 正文、表单、列表主文案、导航主项 | `0.875rem`–`1rem` | 14–16 | `400`–`500` |
| **L5** | 辅助说明、表格次要列、筛选标签、元信息 | `0.75rem`–`0.8125rem` | 12–13 | `400`–`500` |
| **L6** | 徽标、脚注、极弱提示（慎用，注意对比度） | `0.6875rem`–`0.75rem` | 11–12 | `500`–`600` |

- **行高**：正文与表单控件说明文字建议约 **`1.5`**；单行标题可适当收紧（约 `1.2`–`1.35`）。
- **维护**：若需新增全局字号档位，应同时更新本表并在 `Trinity/assets/trinity-base.css`（或对应业务 CSS）中收敛为可复用选择器/变量，避免单页硬编码多级 `font-size`。

---

## 2. 布局规范（栏外距）

以下数值为 **设计约定**；实现上通过 CSS 变量落在代码中，修改时优先改变量而非散落魔法数。

| 区域 | 规则 | 说明 |
|------|------|------|
| **顶栏（导航栏）** | 左右各 **50px** | 全站一致；对应 `Trinity/assets/trinity-base.css` 的 **`--page-gutter`**（`var(--layout-edge)`）。**`TrinityCloud/home.html`** 顶栏 `.home-header-inner` 与 **`TrinityAI/index.html` `.header-row` 相同**：全宽、`padding: 0 var(--page-gutter)`，**不用 `max-width: 1180px` 收窄顶栏**（正文区仍可用 `home-max`）。 |
| **底栏（页脚）** | 左右各 **50px** | 与顶栏对齐；`TrinityCloud/home.html` 中 **`.home-footer .home-shell`** 与 **`TrinityAI/index.html` 的 `.wrap-wide`** 相同：全宽、`padding-inline: var(--page-gutter)`。 |
| **首页中间正文** | 左右各 **15%**（`padding-inline: 15%`） | **`TrinityAI/index.html`**：`main#main` 为 15%。**云落地 `TrinityCloud/home.html`**：`main` 内各 **`section`** 与 **`.home-overlap`** 使用 **`--home-content-inline: 15%`**（与顶栏 50px 分离；宽屏下 Logo 可能比正文更靠左，属规范如此）。 |
| **其余页面** | 主内容区左右各 **50px** | 如 `app/models.html`、`app/chat/index.html`、`account/console.html`、`app/docs.html`、`account/login.html`、`account/register.html` 等依赖 `Trinity/assets/trinity-base.css` 顶栏与 `main` / 业务容器的页面；管理台主列为 `TrinityAI_Admin/admin.css` 中 `--adm-page-inline: 50px`。 |

### 2.1 用户侧变量对照（`Trinity/assets/trinity-base.css`）

```text
--layout-edge: 50px       /* 顶栏、底栏、非首页正文栏外 */
--page-gutter: var(--layout-edge)
```

首页 **额外** 在 `TrinityCloud/home.html`（及若存在的 `home-v1.html`）的页面内 `:root` 定义：

```text
--home-content-inline: 15%    /* 仅 TrinityCloud/home.html main 内 section / .home-overlap */
/* 顶栏/页脚/抽屉：与 TrinityAI index 相同，使用 trinity-base 全局 --page-gutter */
```

`TrinityAI/index.html` 中 **不** 再覆盖 `--page-gutter` 为 `clamp`，保证顶栏、页脚、抽屉等与 **50px** 规范一致；`main#main` 保持 **15%**，且 `main` 内 `.wrap` / `.wrap-wide` 的横向 `padding` 置 **0**，避免在 15% 之外再叠一层 50px。

### 2.2 管理侧变量对照（`TrinityAI_Admin/admin.css`）

```text
--adm-page-inline: 50px   /* .adm-main 等区域左右边距 */
```

侧栏宽度单独使用 `--adm-side-w`，与「内容区左右 50px」分工不同：侧栏是导航结构，主列才是「正文栏外 50px」。

---

## 3. 页面归属一览（按布局模板）

| 模板 | 页面路径 | 顶底边距 | 正文水平留白 |
|------|-----------|----------|----------------|
| 首页（产品） | `TrinityAI/index.html`（套件总入口为 `TrinityCloud/index.html`） | 50px | `main` 15%，内层 wrap 不再加横向 gutter |
| 首页（云落地） | `TrinityCloud/home.html` | 顶栏/页脚与产品首页：**全宽 + `var(--page-gutter)`** | `main` 内 `section`、`.home-overlap` 为 **15%** |
| 应用内页 | `TrinityAI/app/*`、`TrinityAI/account/*`（如 `app/chat/index.html`、`account/console.html`、`account/login.html` 等） | 50px（顶栏等） | 50px（随 `trinity-base.css` 与各页 `main` / shell） |
| 管理台 | `TrinityAI_Admin/*.html`（除全屏登录外） | 侧栏独立 | 主区 `--adm-page-inline` 50px |
| AIRouter | `AIRouter/index.html` | 50px（`--layout-edge` / `--page-gutter`） | 同左 |

---

## 4. 维护说明

- 调整 **50px** 或 **15%** 时：先改本文档与对应变量，再全局搜 `--layout-edge`、`--home-content-inline`、`--adm-page-inline`、`padding-inline: 15%` 等，避免只改单页造成不一致。
- 新增静态页时：先判定属于「首页类」还是「内页类」，再选用 `TrinityAI/index.html` / `TrinityCloud/home.html` 或 `app/models.html` 之一作为版式母版，并放入对应产品目录。
- 调整全局字号档位时：同步更新 **§1.4** 表格与 `Trinity/assets/trinity-base.css`（或业务 CSS），避免文档与代码漂移。
- 本文档不替代各页业务说明；交互、字段校验、接口约定以各模块 PRD / 注释为准。

---

*文档版本：与仓库内 `Trinity/assets/trinity-base.css`、`TrinityAI_Admin/admin.css` 及 `TrinityCloud/home.html` / `TrinityAI/index.html` 当前实现同步维护。*

---

## 5. Trinity AI 侧快速校验（对照本文档）

| 检查项 | 预期 |
|--------|------|
| `Trinity/assets/trinity-base.css` `:root` | 含 `--layout-edge: 50px` 且 `--page-gutter: var(--layout-edge)` |
| `TrinityAI/index.html` | **无** `--page-gutter: clamp(...)`；`main#main` 为 `padding-inline: 15%`；存在 `main#main .wrap` / `.wrap-wide` 的 `padding-inline: 0` |
| `TrinityCloud/home.html` | 顶栏 `.home-header-inner` 与 TrinityAI index **全宽 + `var(--page-gutter)`**；页脚 `.home-footer .home-shell` 同；`main#main > section` / `.home-overlap` 为 **15%**；正文内 `.home-shell` 横向为 0 |
| `models.html` 等内页 | 顶栏来自 `Trinity/assets/trinity-base.css`，主区随 `--page-gutter` 为 50px；不在页面内把 `--page-gutter` 改为 `clamp` |
| 主题色 | `--blue: #2563eb`（`trinity-base.css`）与 Admin `--adm-blue` 一致 |
| 字号阶梯 | 新 UI 字号落在 §1.4 各 `L1`–`L6` 区间内，与现有 `rem` 用法一致 |
