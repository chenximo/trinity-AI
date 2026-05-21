# Trinity 版式与视觉规范

> **定位**：全产品线（用户站、运营后台、营销页等）共用的 **颜色、字号、栏外距** 约定。  
> **代码真源**：`packages/tokens`、`assets/trinity-base.css`；运营后台另见 `TrinityAI_Admin/admin.css` / `apps/trinity-ai-admin` 主题 CSS。  
> **组件形态**：已形式化的控件以 **`/design-spec`**（`apps/trinity-design`）与 **`@trinity/ui`** 为准。  
> **静态 HTML**（`TrinityAI/`、`TrinityCloud/` 等）：仅迁移对照，**新功能写在 Vue 五件套**，不在此维护路径表。

---

## 1. 风格与颜色

### 1.1 字体与圆角

- **字体**：Inter + Noto Sans SC；正文行高约 `1.5`。
- **圆角**：与 `trinity-base.css` / `admin.css` 中 `--radius`、`--adm-radius` 一致（约 8px / 12px 量级）。
- **按钮**：主操作用渐变主按钮（`btn-gradient` 或工程侧等价）；次要描边/幽灵；焦点环用 `--blue-ring` / `--adm-blue-ring`。

### 1.2 主题色

| 用途 | 约定 |
|------|------|
| **品牌蓝** | `#2563eb`，经 `var(--blue)` / `var(--adm-blue)` 使用，禁止单页另起 HEX |
| **辅助** | `--blue-soft`、`--muted`、`--border` 等沿用全局变量 |

### 1.3 字号与字重阶梯（§1.4）

新增 UI **优先落在下表区间**；需新档位时同步改本表与 `packages/tokens` / `trinity-base.css`。

| 层级 | 典型语义 | `rem` 范围 | 约 px（16px 基准） | 字重 |
|------|-----------|-------------|-------------------|------|
| **L1** | 页面主标题、营销 hero | `1.5`–`2` | 24–32 | `600`–`700` |
| **L2** | 区块标题、`h2` | `1.125`–`1.35` | 18–22 | `600`–`700` |
| **L3** | 卡片标题、`h3` | `1`–`1.125` | 16–18 | `600` |
| **L4** | 正文、表单、导航主项 | `0.875`–`1` | 14–16 | `400`–`500` |
| **L5** | 辅助说明、筛选标签 | `0.75`–`0.8125` | 12–13 | `400`–`500` |
| **L6** | 徽标、极弱提示 | `0.6875`–`0.75` | 11–12 | `500`–`600` |

---

## 2. 布局（栏外距）

实现优先改 **CSS 变量**，不散落魔法数。

| 区域 | 规则 | 变量 / 落点 |
|------|------|-------------|
| **顶栏 / 底栏** | 左右各 **50px** | `trinity-base.css`：`--layout-edge` / `--page-gutter` |
| **营销首页正文** | 左右各 **15%** | 如 `apps/trinity-ai` `home`、`apps/ai-cloud` 首页 `main`；内层 wrap **不再**叠 50px |
| **应用内页** | 主内容左右 **50px** | 随 `trinity-base` + 各 app 壳层 |
| **运营后台主列** | 左右 **50px** | `admin.css`：`--adm-page-inline`（侧栏宽度另用 `--adm-side-w`） |

```text
--layout-edge: 50px
--page-gutter: var(--layout-edge)
--adm-page-inline: 50px
```

---

## 3. 页面类型（Vue 原型）

| 类型 | 示例 | 顶底栏 | 正文水平留白 |
|------|------|--------|----------------|
| 营销首页 | `apps/trinity-ai` home、`apps/ai-cloud` | 50px | `main` 15%，内层横向 padding 为 0 |
| 应用内页 | `views/chat`、`views/models`、`views/account`… | 50px | 50px |
| 运营后台 | `apps/trinity-ai-admin` | 侧栏独立 | 主区 `--adm-page-inline` |

---

## 4. 维护与自检

- 改 **50px / 15% / 字号档位**：先改本文与变量，再全局搜 `--page-gutter`、`padding-inline: 15%` 等。
- 新增 Vue 模块：样式用 **Token + 规范组件**；稳定类名（`orc-*`、`or-*`）用 **非** `*.module.css` 全局表（见 [五件套规范](./Trinity原型模块目录与交付规范.md) §2）。
- 运营后台列表 DOM：**另见** [运营后台开发规范.md](../02-后台运营管理系统设计/运营后台开发规范.md)。

**改动后自检**

- [ ] `--blue` / `--adm-blue` 仍为 `#2563eb` 体系，未引入第二套主色
- [ ] 新字号落在 L1–L6；首页未在 15% 外再叠一层 50px gutter
- [ ] 需形式化控件时已对照 `/design-spec` 或 `@trinity/ui`

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-20 | 迁入 `01-原型与交付规范/`；更名；删除静态 HTML 路径表，保留版式/token 约定。 |
| （此前） | 原 `02/Trinity版式与视觉规范.md`，含 TrinityAI/Cloud 静态页目录。 |
