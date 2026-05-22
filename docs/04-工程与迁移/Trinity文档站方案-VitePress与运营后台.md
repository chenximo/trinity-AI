# Trinity 文档站方案 · VitePress 与运营后台

> **文档状态**：执行中（2026-05-21）  
> **读者**：PM、前端、后端、AI 协作  
> **结论真源**：本文；用户站占位见 `apps/trinity-ai/src/views/docs/README.md`；运营后台文档中心见 `apps/trinity-ai-admin/src/views/admin-docs/README.md`。

---

## 1. 一句话

**文档内容真源始终是 Markdown（`.md`）**；**用户可见文档站**用 **`apps/trinity-docs` + VitePress** 构建为静态站；**一期**在仓库内手写/维护 md 并发布构建产物；**二期**由 **运营后台 `admin-docs`** 上传/编辑/发布 md，经 **发布流水线触发 VitePress 重新 build 部署**。不在 `trinity-ai` 内用 mock 或 API 返回 HTML 维护正文。

---

## 2. 已定原则

| 原则 | 说明 |
|------|------|
| **格式** | 正文、示例代码均以 **Markdown** 为准；后台编辑器落库为 **md 字符串**（`body` / `body_md`），不以富文本 HTML 为真源。 |
| **展示** | 对外文档站 = **VitePress**（侧栏、本地搜索、多语言代码 Tab、`::: tip` 等由配置 + md 提供）。 |
| **一期数据** | 「正式」= **已纳入构建的 md + 静态部署结果**；不是 Vue 页面里的假数据。 |
| **二期编辑** | **运营后台**（`trinity-ai-admin` · `admin-docs`）管理 md；**租户用户控制台系统（`docs/03`）不负责**对外 API 文档发布。 |
| **避免双轨** | 不同时维护「VitePress 静态站」与「`trinity-ai` 内 API 渲染正文」两套用户可见形态。 |

---

## 3. 与 OpenRouter 文档站的对照

参考：[OpenRouter Quickstart](https://openrouter.ai/docs/quickstart)

**版式对齐清单与代码片段规范（含托管决策）** → [Trinity文档站-OpenRouter版式对齐规范.md](./Trinity文档站-OpenRouter版式对齐规范.md)

| 能力 | OpenRouter 常见做法 | Trinity 对应 |
|------|---------------------|--------------|
| 正文 | Markdown / MDX 源 | 仓库或后台存储的 **`.md`** |
| 侧栏目录 | 站点配置或目录结构 | VitePress `themeConfig.sidebar`（可由后台 nav **生成配置**） |
| 多语言代码示例 | Tab 切换（Python / TS / curl） | VitePress **`::: code-group`** |
| 语法高亮 | 构建时（如 Shiki） | VitePress 内置 |
| 搜索 | 本地或 Algolia | 一期：`themeConfig.search.provider: 'local'` |
| 给 AI 读 | `.md` 直链、`llms.txt` | **三期可选**（构建脚本导出） |

**不需要**：浏览器插件；在 `DocsPage.vue` 里手写大段 HTML 冒充文档站。

---

## 4. 总体架构

```text
                    ┌──────────────────────────────┐
                    │  内容真源：Markdown (.md)     │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │ 一期                     │ 二期                     │
         │ Git: apps/trinity-docs/  │ 运营后台 admin-docs      │
         │   docs/**/*.md           │  上传 / 编辑 / 发布 md    │
         │                          │  → DB 或对象存储           │
         └─────────────────────────┼─────────────────────────┘
                                   │ 发布（二期）
                                   ▼
                    ┌──────────────────────────────┐
                    │  CI：拉取已发布 md → 写入构建目录 │
                    │  vitepress build               │
                    └──────────────┬───────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │  静态文档站（CDN / Nginx）      │
                    │  docs.xxx.com 或 /docs 反代    │
                    └──────────────┬───────────────┘
                                   ▲
                    trinity-ai 顶栏「文档」外链 / 跳转
```

**不推荐（二期）**：后台只改库，用户站用 `trinity-ai` + `GET /docs/pages/:slug` 动态渲染 Markdown——与 VitePress 重复建设，除非放弃 VitePress。

**推荐（二期）**：后台发布 → **触发 VitePress 构建部署**（构建型 CMS）。

---

## 5. 工程落点

### 5.1 用户可见文档站：`apps/trinity-docs`（已脚手架）

| 项 | 约定 |
|----|------|
| 技术栈 | VitePress（Vue 3 + Vite，与 monorepo 一致） |
| 内容目录 | `apps/trinity-docs/docs/` |
| 配置 | `apps/trinity-docs/.vitepress/config.ts`（`sidebar`、`search`、`base`） |
| 样式 | 复用 `@trinity/tokens`（`theme.css` / `core.css`）；必要时映射 VitePress `--vp-c-brand` 与 `assets/trinity-base.css` 语义色 |
| 脚本 | 根 `package.json`：`dev:trinity-docs`、`build:trinity-docs`；开发端口 **5205**（见开发枢纽文档） |

**建议目录（一期即定，二期 slug 不变）：**

```text
apps/trinity-docs/
├── docs/
│   ├── index.md
│   ├── quickstart.md
│   ├── api/
│   │   └── chat-completions.md
│   └── …
├── .vitepress/
│   └── config.ts
├── package.json
└── README.md
```

后台 `slug` 与文件路径一致，例如 `quickstart` → `docs/quickstart.md`。

### 5.2 用户站 `trinity-ai`：`views/docs/`

| 现状 | 目标 |
|------|------|
| 五件套 + `mock.ts` 章节占位 | **过渡**；文档站上线后顶栏「文档」**外链 VitePress**，本模块改为跳转或删除 |
| 路由 `tai-docs` `/docs` | 可 **302 到文档站** 或保留极简中转页 |

详见：`apps/trinity-ai/src/views/docs/README.md`。

### 5.3 运营后台：`admin-docs`（二期接真存储）

| 文件 | 说明 |
|------|------|
| `apps/trinity-ai-admin/src/views/admin-docs/` | 列表 / 编辑 / 发布 / 可见性（§4.9，见 `docs/02-后台运营管理系统设计/后台原型总览.md`） |
| `mock.ts` 中 `DocRow.body` | 原型期为 md 字符串；二期对接写 API |
| `docMarkdownPreview.ts` | `marked` + `DOMPurify` 预览；与用户站构建前预览逻辑同源 |

**字段对齐建议（与二期存储一致）：**

| 字段 | 说明 |
|------|------|
| `slug` | 对应 `docs/{slug}.md` 或子路径 |
| `title` | 页面标题 |
| `body` / `body_md` | Markdown 全文 |
| `status` | 草稿 / 评审中 / **已发布** / 已归档（仅已发布进入构建） |
| `sort` | 侧栏排序（或 frontmatter `order`） |

---

## 6. 分期交付

### 6.1 一期（上线紧、形态从简）

**目标**：可读、可导航、代码示例达标；内容即正式 md。

| 必做 | 说明 |
|------|------|
| 初始化 `apps/trinity-docs` | VitePress 脚手架、workspace 脚本 |
| 接入设计 token | `@trinity/tokens`，品牌色与官网一致 |
| 配置侧栏 + 本地搜索 | `config.ts` |
| 首批 md | 建议 ≥4 篇：快速开始、对话补全、流式 SSE、错误码（对齐原 `TrinityAI/app/docs.html` 信息架构） |
| 多语言代码 | md 内 `::: code-group` 或连续 fenced code block |
| 部署 | 定 `base`（子路径 `/docs/` 或独立子域）；Nginx / 静态托管 |
| 入口 | `trinity-ai` / `ai-cloud` 顶栏链到文档站 URL |

**一期明确不做：**

- `trinity-ai` 内 API 动态渲染文档正文  
- 全文站内搜索增强（Algolia）、OpenAPI 自动生成、`llms.txt`  
- 运营后台接真写库（可用 Git 改 md；内容仍算正式）  
- Request Builder 类交互工具（可外链或三期）

**粗估工时（首次落地）：**

| 项 | 参考 |
|----|------|
| 脚手架 + monorepo 脚本 | 0.5d |
| 主题 / token / 顶栏品牌 | 0.5～1d |
| 首批 md + sidebar | 0.5～1d |
| 部署与入口联调 | 0.5d |

（「5 分钟 + 10 分钟」仅指熟悉 VitePress 后的增量；含 monorepo 与视觉对齐通常需上表量级。）

### 6.2 二期（运营后台上架 md）

**目标**：运营在后台改 md，发布后用户看到新文档站。

| 能力 | 说明 |
|------|------|
| 上传 / 编辑 `.md` | 后台 Markdown 编辑器，保存 `body_md` |
| 发布 / 回滚 | 仅 **已发布** 进入构建集 |
| 可见性 | 公开 / 登录可见等（读构建过滤或三期） |
| 发布流水线 | 拉取已发布 md → 写入构建目录 → `vitepress build` → 部署 |

**用户站 `DocsPage.vue`**：无需接「读文档 API」；最多保留跳转。

**可选增强（三期）：**

- 根据后台 nav API **生成** `sidebar` 配置片段  
- OpenAPI → md 章节同步  
- `llms.txt` / `*.md` 直链导出（对齐 OpenRouter AI 可读约定）

---

## 7. 一期实施流程（VitePress 静态站）

与产品沟通一致的步骤：

1. **初始化**：在 `apps/` 下创建 `trinity-docs`，安装 VitePress。  
2. **接入样式**：`@trinity/tokens` + 必要时 `trinity-base` 变量映射到 VitePress theme。  
3. **开启核心能力（配置为主）**：`sidebar`、`search`、`code-group`、自定义块（tip/note）。  
4. **写文档**：在 `docs/` 下新增 `.md`（如 `quickstart.md`）。  
5. **构建发布**：`vitepress build` → 静态资源部署。  
6. **联调入口**：营销站 / 壳层「文档」指向文档站 URL。

---

## 8. 已否决或易混淆的方案

| 方案 | 结论 |
|------|------|
| 一期 `views/docs/mock.ts` 当正文源 | ❌ 与「正式 md」冲突；仅允许过渡期占位 |
| 一期用户站 `GET /docs/pages/:slug` 读库渲染 | ❌ 与 VitePress 双轨；除非不做 VitePress |
| 租户用户控制台系统（`docs/03`）发布对外 API 文档 | ❌ 对外文档由 **运营后台** 维护 |
| 正文真源用富文本 HTML | ❌ 统一 Markdown |
| 独立 Mintlify 托管且与仓库 md 双轨 | ❌ 除非团队明确不自建 VitePress |

---

## 9. 待拍板（落地前确认）

| # | 事项 | 选项 |
|---|------|------|
| 1 | 文档站 URL | 独立子域 `docs.*` vs 主站路径 `/docs/`（影响 VitePress `base`） |
| 2 | 一期首批页面清单 | 是否仅 quickstart + api 三章 + 错误码 |
| 3 | 二期构建触发 | 手动 CI / 发布按钮 webhook / 定时同步 |
| 4 | md 存储 | DB `body_md` vs 对象存储 `.md` 文件（构建脚本拉取方式不同） |

---

## 10. 相关文档与代码索引

| 类型 | 路径 |
|------|------|
| OpenRouter 版式对齐规范 | [Trinity文档站-OpenRouter版式对齐规范.md](./Trinity文档站-OpenRouter版式对齐规范.md) |
| 用户站还原计划（阶段 D · 文档） | [TrinityAI用户站Vue还原计划.md](./TrinityAI用户站Vue还原计划.md) |
| 五件套规范 | [Trinity原型模块目录与交付规范.md](../01-原型与交付规范/Trinity原型模块目录与交付规范.md) |
| 运营后台文档中心（§4.9） | [后台原型总览.md](../02-后台运营管理系统设计/后台原型总览.md) |
| 静态对照页 | `TrinityAI/app/docs.html` |
| 用户站 docs 模块（过渡） | `apps/trinity-ai/src/views/docs/` |
| 运营后台 admin-docs 原型 | `apps/trinity-ai-admin/src/views/admin-docs/` |

---

## 11. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-21 | 初稿：汇总文档源 md、一期 VitePress 构建、二期 admin-docs 发布流水线、与 OpenRouter 对照及否决方案。 |
