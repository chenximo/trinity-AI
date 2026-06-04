# Trinity 文档站 · 信息架构与顶栏设计

> **文档状态**：拍板稿（2026-06-03）  
> **工程落点**：`apps/trinity-docs`（VitePress · 默认 `http://127.0.0.1:5205/docs/`）  
> **对标**：[OpenRouter 文档](https://openrouter.ai/docs)（顶栏分轨 + 左侧目录 + API Reference）  
> **关联**：[**对外文档站基本规范](./Trinity对外文档站-基本规范.md)、[一期 MVP 清单](./Trinity文档站-一期MVP文档清单.md)、[OpenRouter 版式对齐](./Trinity文档站-OpenRouter版式对齐规范.md)、[VitePress 方案](./Trinity文档站方案-VitePress与运营后台.md)  
> **产品手册进度**：`apps/trinity-product/docs/ai-api-platform/user/developer-docs.roadmap.yml`

---

## 1. 设计目标

| 目标 | 说明 |
|------|------|
| **开发者一眼选对轨** | 先选「文档 / API / 应用场景」，再在左侧栏找页；不对标 OR 的 Client SDK、Agent SDK 空 Tab。 |
| **契约不散落** | 字段真源：`docs/00-协作与工作流/工程师/API对外接口支持参数.md` → 同步 `trinity-docs` **API 轨**；Cookbook **只写配置步骤**。 |
| **与产品手册一致** | 用户面叶子 [开发者文档](../../apps/trinity-product/docs/ai-api-platform/user/developer-docs.md) 的 roadmap 按三轨拆子能力验收。 |
| **一期可交付** | 现有 22 篇 md 归入三轨；Cookbook P0 三页（Cursor / Claude Code / Codex CLI）为 6.30 主增量。 |

---

## 2. 与 OpenRouter 对照（顶栏）

| OpenRouter 顶栏 | Trinity 是否采用 | Trinity 顶栏文案 | 说明 |
|-----------------|------------------|------------------|------|
| Docs | ✅ | **文档** | Quickstart、密钥、模块、多模态、指南、参考、FAQ |
| API Reference | ✅ | **API** | 概述 + 端点（生文 / 生图 / 生视频） |
| Client SDKs | ❌ 一期不做 | — | [MVP 边界](./Trinity文档站-一期MVP文档清单.md) 已排除 |
| Agent SDK | ❌ 一期不做 | — | 同上 |
| **Cookbook** | ✅ | **应用场景** | 对外中文名；URL 前缀 `/cookbook/`（与 OR 路径习惯一致） |
| Changelog | 🟡 二期 | **更新日志**（可选） | 有稳定发版节奏再开 Tab；勿长期空链 |

**不复制**：OR 品牌顶栏产品导航（Models / Chat / Rankings）；Trinity 顶栏右侧保留 **官网** 外链（现有 `themeConfig.nav`）。

---

## 3. 顶栏总体结构（两层）

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo] Trinity AI 文档                              [搜索]  [官网 ↗]   │  ← VitePress 主顶栏
├─────────────────────────────────────────────────────────────────────────┤
│  文档  │  API  │  应用场景                                              │  ← DocsSubNav（二级 Tab）
└─────────────────────────────────────────────────────────────────────────┘
│ 左侧栏（随 Tab 切换） │ 正文（窄栏 + 右侧 On this page）                │
```

### 3.1 主顶栏（`themeConfig.nav`）

| 元素 | 约定 |
|------|------|
| 左 | 站点标题 / Logo → `/` 或 `/quickstart` |
| 右 | **搜索**（VitePress local search，已有） |
| 右 | **官网** → 营销站或 Trinity 产品入口（外链） |
| 无 | Ask AI、Models、Chat 等产品 Tab |

### 3.2 二级 Tab（`DocsSubNav` · `docsNav.ts`）

| Tab `id` | 显示名 | 默认落地页 | 路径前缀判定 |
|----------|--------|------------|--------------|
| `docs` | 文档 | `/quickstart` | 非 `/api/`、非 `/cookbook/` |
| `api` | API | `/api/overview` | `/api/` |
| `cookbook` | 应用场景 | `/cookbook/` | `/cookbook/` |

**交互**：点击 Tab → `router.go(withBase(href))`；当前 Tab 底蓝线 + 图标（对齐 [版式规范 L2](./Trinity文档站-OpenRouter版式对齐规范.md)）。

**实现状态**：`docs` + `api` + `cookbook` 已上线（`docsNav.ts` · `config.ts` · `docs/cookbook/**`）。

---

## 4. 三轨左侧目录（目标 IA）

切换 Tab 时 **整棵侧栏替换**（`config.ts` → `themeConfig.sidebar` 按路径前缀匹配）。

### 4.1 文档轨

**心智**：我会调 HTTP API → 先跑通 → 再按需看多模态与排错。

```text
快速入门                    /quickstart                    ✅ 已有
管理 API 密钥               /manage-api-keys               ✅ 已有
模块                        /modules                       ✅ 已有
多模态 ▾
  概述                      /multimodal/
  图片输入                  /multimodal/image-input        🟡 占位
  图片生成                  /multimodal/image-generation   🟡 侧栏在，实操链 guides
  视频输入                  /multimodal/video-input        🟡 占位
  视频生成                  /multimodal/video-generation   🟡 同上
  音频                      /multimodal/audio              🟡 占位
  PDF 文件                  /multimodal/pdf                🟡 占位
指南 ▾
  请求参数（索引）          /guides/request-parameters     ✅ 已有 · 链到 API 轨短页 + 高级参数
  流式输出（SSE）           /guides/streaming-sse          ✅ 已有
  生图指南                  /guides/image-generation       ✅ 已有 · 文内互链
  生视频指南                /guides/video-generation       ✅ 已有 · 同上
参考 ▾
  错误与调试                /reference/error-codes         ✅ 已有
  速率与限额                /guides/rate-limits            ✅ 已有
常见问题                    /faq                           ✅ 已有
```

**写作边界**（对齐 OpenRouter）：`guides/request-parameters` 为跨轨索引；**全字段表**在 **API 轨** `api/*-parameters`；端点页**短**（P0 + 示例）。

### 4.2 API 轨（API Reference）

**心智**：查端点、复制 curl、对全字段；对标 OR `api-reference/*`。

```text
概述                        /api/overview                  ✅ 已有
端点 ▾
  创建对话补全              /api/chat-completions          ✅ 短页
  创建图像生成              /api/images-generations        ✅ 短页
  创建视频生成任务          /api/videos-generations        ✅ 短页
高级参数 ▾
  生文                      /api/chat-completions-parameters   ✅
  生图                      /api/image-generation-parameters   ✅
  生视频                    /api/video-generation-parameters   ✅
```

**未开放能力**（如 `GET /v1/models`、Try it、双栏 sticky 示例）：只记 `developer-docs.roadmap.yml`，**不写**对外 API 正文。

**契约同步**：

- 生文 / 生图 / 生视频字段以 `API对外接口支持参数.md` 为准发布前 diff。
- **路径叙事待产品拍板**：工程师文档生图走 `POST /v1/chat/completions` + `modalities`；API 页为 `images-generations` 时，须在概述或生图页 **显式说明** 与网关真实 path 一致，避免双故事。

### 4.3 应用场景轨（Cookbook）

**心智**：我在 Cursor / Claude Code / Codex 里怎么填 Base URL、Key、模型。

```text
概述                        /cookbook/                     ⬜ 待建
编程工具 ▾
  Cursor                    /cookbook/coding-agents/cursor           ⬜ P0
  Claude Code               /cookbook/coding-agents/claude-code      ⬜ P0
  Codex CLI                 /cookbook/coding-agents/codex-cli        ⬜ P0
  （二期 ▾ 折叠或灰字）
  Claude Desktop            /cookbook/coding-agents/claude-desktop   ⬜ 二期
  OpenCode                  /cookbook/coding-agents/opencode          ⬜ 二期
  MCP 与 Trinity            /cookbook/coding-agents/mcp              ⬜ 二期
```

**单页模板**（对标 OR `cookbook/coding-agents/*`）：

1. 适用工具版本  
2. 前置：控制台 Key、`TRINITY_BASE_URL`（内测 / 生产）  
3. 配置步骤（截图位）  
4. 推荐 `model` id（链模型广场或 `GET /v1/models`）  
5. 验收：工具内发一条测试消息  
6. 故障排除 → 链 `reference/error-codes`、Quickstart  

**禁止**：在 Cookbook 复述 `API对外接口支持参数.md` 全表。

---

## 5. 架构关系图

```mermaid
flowchart TB
  subgraph top[顶栏]
    NAV[主顶栏: Logo · 搜索 · 官网]
    TABS[二级 Tab: 文档 | API | 应用场景]
  end
  subgraph docs[文档轨]
    Q[快速入门]
    K[管理 API 密钥]
    M[模块 / 多模态]
    G[指南 / 参考 / FAQ]
  end
  subgraph api[API 轨]
    O[概述]
    E[端点: 生文 / 生图 / 生视频]
  end
  subgraph cb[应用场景轨]
    I[概述]
    T[编程工具: Cursor · Claude Code · Codex CLI]
  end
  subgraph truth[真源]
    ENG[API对外接口支持参数.md]
    REPO[apps/trinity-docs/docs/**/*.md]
  end
  NAV --> TABS
  TABS --> docs
  TABS --> api
  TABS --> cb
  ENG -->|发布前同步| E
  REPO --> docs
  REPO --> api
  REPO --> cb
```

---

## 6. 用户阅读路径（验收用）

| 场景 | 推荐路径 |
|------|----------|
| 第一次接 API | 文档 → 快速入门 → 管理 API 密钥 → API → 对话补全 |
| 查某字段含义 | API → 对端点页；复杂约束查工程师参数 md（内测） |
| 配 Cursor | 应用场景 → Cursor；失败 → 参考 → 错误与调试 |
| 生图 / 生视频 | 文档 → 多模态或指南 → API 对应端点 |
| 产品 / 测试对进度 | 产品手册 → 开发者文档 roadmap（按三轨子项） |

---

## 7. 分期

| 阶段 | 顶栏 | 目录 | 内容 |
|------|------|------|------|
| **现状** | 文档 \| API \| **应用场景**（三 Tab） | 三轨侧栏；Cookbook P0 四页占位 | 待内测域名与工具截图走查 |
| **下一迭代** | 可选 + 更新日志 | Cookbook 二期页 | 参数表与 API 轨 diff 门禁 |
| **6.30** | 可选 + 更新日志 | Cookbook 二期项；多模态输入页补正文 | API 页与 `API对外接口支持参数.md` 无漂移 |
| **三期** | Ask AI / SDK Tab | 仅当产品有 SDK 再开 Tab | `llms.txt`、后台发布流水线 |

---

## 8. 工程改动清单（实现本设计时）

| 文件 | 改动 |
|------|------|
| `.vitepress/theme/docsNav.ts` | `DOCS_SUBNAV` 增加 `cookbook`；`isCookbookSection()` |
| `.vitepress/theme/DocsSubNav.vue` | 第三 Tab 样式 `tdocs-subnav__icon--cookbook` |
| `.vitepress/config.ts` | `sidebarCookbook`；`sidebar` 增加 `/cookbook/` 前缀；文档轨侧栏不变 |
| `docs/cookbook/**` | 概述 + P0 三页 md |
| `trinity-docs.css` | Tab 栏与 OR 对齐（见版式规范 L2） |
| [一期 MVP 清单](./Trinity文档站-一期MVP文档清单.md) §4 | 更新为本文 §4 目标 IA |
| [developer-docs.roadmap.yml](../../apps/trinity-product/docs/ai-api-platform/user/developer-docs.roadmap.yml) | 已含 Cookbook 子项，按页验收 |

---

## 9. 首页与入口

| 项 | 建议 |
|----|------|
| `docs/index.md` | 改为 `layout: doc` 或弱 Hero，**以三轨入口卡片** 引导（文档 / API / 应用场景），减少营销感（对齐版式 L10） |
| `trinity-ai` / `trinity-portal` 顶栏「文档」 | 继续链 `5205` 或门户 `/docs` 反代；默认落地 **快速入门** |
| 搜索 | 跨三轨全文检索（VitePress local 默认行为） |

---

## 10. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-03 | 首版：三轨顶栏 + 目录目标 IA；对标 OpenRouter；Cookbook 对外名「应用场景」 |
