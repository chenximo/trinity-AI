# Trinity 文档站 · OpenRouter 版式对齐规范

> **文档状态**：执行中（2026-05-21）  
> **对照真源**：[OpenRouter Quickstart](https://openrouter.ai/docs/quickstart)（线上页面 + 本仓库截图 `assets/image-6b4455dd-*`、`assets/image-2d8bf319-*`）  
> **工程落点**：`apps/trinity-docs`（VitePress）· 样式 `/.vitepress/theme/trinity-docs.css`  
> **关联**：[Trinity文档站方案-VitePress与运营后台.md](./Trinity文档站方案-VitePress与运营后台.md)

---

## 1. 目标与边界

| 项 | 约定 |
| --- | --- |
| **要对齐什么** | 开发者阅读体验：三栏布局、侧栏信息架构、正文排版、**代码片段组件（图 2）**、表格与提示块。 |
| **不复制什么** | OpenRouter 品牌紫、顶栏「Models / Chat / Rankings」等产品导航；Trinity 顶栏链官网与 Trinity 产品。 |
| **色板真源** | `@trinity/tokens` → `trinity-docs.css` 映射 VitePress `--vp-*`；禁止文档页内魔法 hex。 |
| **内容真源** | 仍为 `apps/trinity-docs/docs/**/*.md`；版式规范不引入第二套正文存储。 |

---

## 2. 总览对齐清单（拍板用）

图例：**✅ 已做** · **🟡 部分** · **⬜ 待做** · **— 不跟**

### 2.1 全局布局（对应截图 1）

| # | 元素 | OpenRouter 特征 | Trinity 现状 | 状态 | 落点 |
| --- | --- | --- | --- | --- | --- |
| L1 | 顶栏高度与底边 | 白底、细灰底边、左 Logo + 右搜索/操作 | VitePress 默认顶栏 + token 色 | 🟡 | `trinity-docs.css` · `themeConfig` |
| L2 | 顶栏二级导航 | Docs / API Reference / Cookbook 横向 Tab | 已有「文档 / API」；应用场景 Tab 待上 | 🟡 | `DocsSubNav` · [信息架构与顶栏设计](./Trinity文档站-信息架构与顶栏设计.md) |
| L3 | 顶栏「Ask AI」 | 右侧主 CTA | 无 | — | 三期或链 Trinity 对话 |
| L4 | 左侧栏分组 | Overview / Models & Routing / Features + **图标** | 文字分组、无图标 | ⬜ | `sidebar` + 自定义 `VPSidebarItem` 或 CSS |
| L5 | 左栏当前项 | 浅蓝底 + 加粗蓝字 | 浅蓝底已有，无图标 | 🟡 | `trinity-docs.css` |
| L6 | 正文区留白 | 左留白 = 右留白 = 正文与目录间距 | `--tdocs-doc-cluster-gap: 5rem`（≥1280px）；**禁止** VP `688px` | ✅ | `trinity-docs.css` §布局覆盖 |
| L7 | 正文左对齐轴 | 标题、段落、表格同左缘 | 已统一 | ✅ | `.vp-doc` |
| L8 | 右侧「本页目录」 | On this page + **左侧蓝竖条** 表当前节 | VitePress outline，样式偏弱 | 🟡 | `VPDocAsideOutline` CSS |
| L9 | 章节分隔 | `---` 大间距 + 细横线 | quickstart 已用 `---` | ✅ | md 约定 |
| L10 | 首页形态 | 以文档目录为主，非大 Hero 营销 | 仍保留 VPHome Hero | 🟡 | `index.md` / 可改 `layout: doc` |

#### 2.1.1 VitePress 默认布局陷阱（通病 · 必覆盖）

> **对外正文禁止出现 OpenRouter 字样**（含「对标参考」、openrouter.ai 链接）→ 见 [基本规范 §2](./Trinity对外文档站-基本规范.md#2-首要原则对外正文零内部信息)。本节与下表仅供**维护者**改 CSS / 验收版式。

凡用 **VitePress 1.6 默认主题** 的文档站（`trinity-docs`、`trinity-product` 等）都会遇到同一组 scoped 样式，**不要靠改 md**，须在主题 CSS 统一覆盖：

| 来源 | 默认行为 | 现象 | Trinity 做法 |
| --- | --- | --- | --- |
| `VPDoc.vue` scoped | `.VPDoc.has-aside .content-container { max-width: 688px }` | 有「本页目录」时正文被限死 ~688px，两侧出现大块空白 | `max-width: none; width: 100%`（见 `trinity-docs.css`、`trinity-product/.../custom.css`） |
| `VPDoc.vue` scoped | `.aside { flex-grow: 1; padding-left: 32px }` | 目录列被撑宽或间距异常 | `flex-grow: 0` + 固定 `--tdocs-aside-col` |
| `VPDoc.vue` scoped | `.aside-container { position: fixed }` | **须保留 fixed**：本页目录钉在视口；改 sticky 会长文滚走 | **不要**改 sticky；留白用 container `padding-inline` 调 |
| `VPContent.vue` scoped | `@media (min-width: 1440px)` 按 `--vp-layout-max-width` 视口居中 | 超宽屏左右留白过大，且左右算法不对称 | 主列 `padding-left: sidebar` only；**中间区**用 container `padding-inline` 控留白 |
| 布局调优误区 | 对 container 用负 `margin` 撑宽 | 目录被挤出视口 | **只减 container 内 padding**；中间区（正文+目录）总宽保持 `width:100%` |

**约定（冻结）**：

1. **中间区** = `.VPDoc .container`（flex：正文 + 本页目录），总宽度占满 `VPContent` 主列，**不**负 margin 外扩。
2. **左右留白** = container 的 `padding-inline`（`--tdocs-doc-gutter-lg`，与 `--tdocs-doc-cluster-gap` 同为 `5rem`），**不**再叠 `content-container` 的 `max-width`。
3. 正文变宽 = 取消 688px 限制后 `flex: 1` 吸收 padding 释放的空间；目录列宽度不变。
4. 新站复用同一套时，复制上述覆盖块并改 gutter token，勿只改 `.container` 而漏掉 `.content-container`。

### 2.2 正文组件

| # | 元素 | OpenRouter 特征 | Trinity 现状 | 状态 | 落点 |
| --- | --- | --- | --- | --- | --- |
| C1 | H1 标题 | 大号、左对齐、无下边框 | 已调字号 | ✅ | `.vp-doc h1` |
| C2 | 正文链接 | 蓝色、hover 下划线 | `var(--blue)` | ✅ | `.vp-doc a` |
| C3 | 对照表 | 两列 Approach / Best for，浅灰表头、行分割线 | quickstart 表 + 表格 CSS | ✅ | md + `.vp-doc table` |
| C4 | 说明（info） | OR sky：`#f0f9ff` / `#bae6fd` / 字 `#0c4a6e` / 图标 `#0ea5e9` | `::: info`（默认「说明」） | ✅ | `--tdocs-or-sky-*` |
| C5 | 重要（tip） | 同色相：浅绿底 + 中浅绿边 + **深绿字/星标** | `::: tip`（默认「重要」） | ✅ | `--tdocs-callout-tip-*` |
| C6 | Warning | 黄/橙语义 + 三角图标 | `::: warning` 黄底 + 图标 | ✅ | `.custom-block.warning` |

### 2.3 代码片段组件（对应截图 2 · **重点**）

| # | 元素 | OpenRouter 特征 | Trinity 现状 | 状态 | 落点 |
| --- | --- | --- | --- | --- | --- |
| S1 | **整体容器** | **浅色**底、浅灰边框、圆角 | 浅色底 + 边框 | ✅ | `trinity-docs.css` `--tdocs-code-*` |
| S2 | 语言 Tab | 顶栏灰底条；**选中 = 白底 + 顶蓝线**；未选灰底 | `radio`+`label`，选中顶蓝线 | ✅ | `.vp-code-group .tabs label` |
| S3 | Tab 文案 | `Python` / `TypeScript (fetch)` / `Shell` | `Shell` / `TypeScript` / `Python` 已有 | ✅ | md `::: code-group` |
| S4 | 行号 | 左列浅灰、与代码区分隔 | `lineNumbers: true` 已开 | ✅ | `config.ts` |
| S5 | 复制按钮 | 右上角 **双矩形** 图标 | VitePress `button.copy` 已启用 | ✅ | 悬停加强透明度 |
| S6 | 举报/反馈 | 右上角 flag 图标 | 无 | — | 非必须；可用「反馈」链 GitHub |
| S7 | 语法高亮 | 浅色主题（类 GitHub Light） | Shiki `github-light` + 浅色底 | ✅ | `markdown.theme` + `.shiki` 映射 |
| S8 | 底部装饰条 | 容器底细蓝条（品牌点缀） | 无 | ⬜ | 可选 CSS `::after` |
| S9 | 缩进与对齐 | 2 空格；`url=` / `headers=` 参数对齐 | 由示例 md 保证 | ✅ | 写作规范 §4 |
| S10 | 单行 code fence 标题 | ` ```python title="Python" ` 等 | 使用 `[Python]` 标签 | ✅ | VitePress 约定 |

### 2.4 工程与联调

| # | 项 | 状态 | 说明 |
| --- | --- | --- | --- |
| E1 | `@trinity/tokens` 接入 | ✅ | `trinity-docs.css` |
| E2 | `::: code-group` | ✅ | quickstart / api 示例 |
| E3 | 开发枢纽 `/docs/` 代理 | ✅ | portal `vite` proxy → `:5205` |
| E4 | trinity-ai 文档入口 URL | ✅ | `getTrinityDocsSiteUrl()` 同源 |
| E5 | 深色模式 | 🟡 | 有；OR 截图以浅色为主，需保证浅色代码块优先验收 |

---

## 3. 代码片段规范（图 2 细化）

以下为对外 API 文档页的**冻结约定**（写作 + 前端共同遵守）。

### 3.1 结构

```markdown
::: code-group

```bash [Shell]
curl ...
```

```typescript [TypeScript (fetch)]
fetch(...)
```

```python [Python]
import requests
...
```

:::
```

| 规则 | 说明 |
| --- | --- |
| 语言顺序 | 与 OpenRouter 一致时：**Python → TypeScript (fetch) → Shell**；全站统一一种顺序，避免页间乱跳。 |
| Tab 文案 | 方括号内即 Tab 标签；`TypeScript (fetch)` 与 OR 保持一致，便于对照。 |
| 默认展示 | 第一组 fence 为默认选中 Tab。 |
| 行号 | 全局开启；不要手动写行号。 |
| 密钥占位 | `<TRINITY_API_KEY>` / `$TRINITY_API_KEY`，与 OR 的 `<OPENROUTER_API_KEY>` 同级。 |

### 3.2 视觉（目标态 · 浅色代码块）

```
┌─────────────────────────────────────────────────────────┐
│ [Python] [TypeScript (fetch)] [Shell]     [flag] [copy] │  ← Tab 条：surface 灰底
├─────────────────────────────────────────────────────────┤
│  1 │ import requests                                    │  ← 行号 muted-2
│  2 │ ...                                                │  ← 代码区：bg 白或 #fafafa
│ ...│                                                    │
├─────────────────────────────────────────────────────────┤
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 可选品牌底条（非必须）
└─────────────────────────────────────────────────────────┘
```

| Token / 变量 | 浅色目标 | 映射 |
| --- | --- | --- |
| 容器背景 | `#ffffff` | `var(--bg)` |
| 容器边框 | `#e5e7eb` | `var(--border)` |
| Tab 条背景 | `#f9fafb` | `var(--surface)` |
| 选中 Tab | 白底 + 顶边 `2px solid var(--blue)` | 待实现 S2 |
| 代码字色 | Shiki `github-light` | `markdown.theme.light` |
| 圆角 | `12px` | `var(--radius-lg)` |

**深色模式**：可保留深色代码块变体，但**浅色为默认验收路径**（与 OpenRouter 线上一致）。

### 3.3 API Reference 页分工（对标 OR `api-reference/*`）

| 页面类型 | 路径示例 | 内容上限 |
| --- | --- | --- |
| **端点短页** | `/api/chat-completions` | Authentication + Headers + Body（P0）+ 示例 + 短 Response |
| **高级参数** | `/api/chat-completions-parameters` 等 | 全字段表、Part、思考/工具、联调说明（API 轨侧栏） |
| **未开放** | — | 仅 `developer-docs.roadmap.yml`，不进对外 md |

右侧 **sticky curl + 200 示例 + Try it** → roadmap 二期（自定义 VitePress 布局）。

### 3.4 包管理器 Tab 示例（截图：npm / pnpm / yarn）

```markdown
::: code-group

```bash [npm]
npm install openai
```

```bash [pnpm]
pnpm add openai
```

```bash [yarn]
yarn add openai
```

:::
```

见 `docs/quickstart.md`「使用 OpenAI SDK」节。

### 3.4 已实现（2026-05-21）

浅色代码块、`label` Tab 顶蓝线、行号分隔线、复制按钮位置、Shiki 浅色变量映射；**无需**为代码块单独托管第三方。

---

## 4. Markdown 与信息架构约定

### 4.1 Quickstart 页骨架（对齐 OR）

1. 一句话价值主张  
2. **集成方式对照表**（| 方式 | 适用场景 |）  
3. `::: tip` 重要（模型 ID、密钥等）/ `::: info` 说明（补充信息）  
4. `---`  
5. `## 使用 xxx API` + 说明段 + `::: code-group`  
6. 重复 `---` 分节  
7. 「下一步」内链列表  

参考实现：`apps/trinity-docs/docs/quickstart.md`。

### 4.2 侧栏（目标 IA，待配置）

建议向 OpenRouter 靠拢的分组（文案可中文化）：

| 分组 | 示例条目 |
| --- | --- |
| Overview | 文档首页、快速开始、认证（待写） |
| API | 对话补全、模型列表（待写） |
| Guides | 流式 SSE、错误处理 |
| Reference | 错误码 |

图标：可用 VitePress `sidebar` 自定义 HTML 或扩展主题组件；**一期可仅用文字，二期再加图标**。

---

## 5. 托管方案：何时自建、何时外包

代码片段若要做到与 OpenRouter **像素级一致**（浅色块、顶蓝线 Tab、常显复制、底栏装饰），在 VitePress 上需要 **覆盖 `VpCodeGroup` 或写独立 Vue 组件**，工作量高于纯 CSS。

| 方案 | 适用 | 优点 | 缺点 | 建议 |
| --- | --- | --- | --- | --- |
| **A. 继续 VitePress + CSS/轻量组件** | 一期、md 真源在 Git | 与 monorepo、token、CI 一体；无第二真源 | 代码块需自研样式；与 Fern 级平台有差距 | **默认推荐** |
| **B. VitePress +  fork `VpCodeGroup.vue`** | 代码块要求高、仍要 md 在仓内 | 可控、可渐进 | 升级 VitePress 需合并主题 | 对齐清单 S1–S8 未完成时采用 |
| **C. Mintlify / Fern 等托管文档** | 团队不愿维护主题 | 版式接近 OR、开箱代码块 | **双真源风险**；与二期 admin-docs 流水线冲突 | 见方案文档 §8 已否决，除非 PM 改口 |
| **D. 仅代码块 iframe 外链** | 只想代码区像 OR | 实现快 | SEO、主题割裂、鉴权难 | **不推荐** |
| **E. ReadMe / GitBook 等 SaaS** | 非技术团队运营为主 | 编辑器强 | 贵、导出与 CI 复杂 | 仅作竞品参考 |

**决策建议（PM + 前端）：**

- **一期**：走 **方案 A**，按 §2 清单优先 **S1/S2/S7（浅色代码块 + Tab）** 与 **L4/L8（侧栏图标、本页目录强调）**。  
- **若 S1–S8 两迭代仍不达标**：再评估 **方案 B**；**不** 默认切 Mintlify（避免 md 双轨）。  
- **托管**一词若指「部署」：仍为 `vitepress build` → CDN/Nginx，与版式托管无关。

---

## 6. 验收步骤

1. 本地：`npm run dev:trinity-docs`，打开 `/docs/quickstart`。  
2. 并排打开 [OpenRouter Quickstart](https://openrouter.ai/docs/quickstart)。  
3. 按 §2 表逐项勾选（建议打印 §2.1–2.3 作评审表）。  
4. **代码块专项**：截图对比 Tab、行号、复制、背景色（浅色）。  
5. 深色模式：确认代码块可读，不要求与 OR 一致。  

---

## 7. 实施优先级（建议迭代）

| 迭代 | 内容 | 预估 |
| --- | --- | --- |
| **P0** | S1/S2/S7 浅色代码组 + Tab 顶蓝线；表格与分隔线微调 | 0.5–1d |
| **P1** | L8 本页目录蓝条；C4/C5 提示块分色与图标 | 0.5d |
| **P2** | L2/L4 顶栏二级 nav + 侧栏图标 | 1d |
| **P3** | S8 底装饰条、S6 反馈入口（可选） | 0.25d |

---

## 8. 代码与文档索引

| 类型 | 路径 |
| --- | --- |
| 样式增量 | `apps/trinity-docs/.vitepress/theme/trinity-docs.css` |
| 主题入口 | `apps/trinity-docs/.vitepress/theme/index.ts` |
| VitePress 配置 | `apps/trinity-docs/.vitepress/config.ts` |
| 对照页 md | `apps/trinity-docs/docs/quickstart.md` |
| 截图（评审附件） | `.cursor/projects/.../assets/image-6b4455dd-*.png`、`image-2d8bf319-*.png` |
| 总方案 | [Trinity文档站方案-VitePress与运营后台.md](./Trinity文档站方案-VitePress与运营后台.md) |

---

## 9. 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-05-21 | 初稿：OpenRouter 对照清单、代码片段图 2 规范、托管方案决策表、验收与迭代优先级。 |
