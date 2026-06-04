# Trinity 文档站 · 一期 MVP 文档清单

> **文档状态**：执行中（2026-05-21）  
> **对照**：[OpenRouter 文档](https://openrouter.ai/docs)（Docs 指南 + API Reference 双轨）  
> **内容真源**：`apps/trinity-docs/docs/**/*.md`  
> **MVP 能力**：HTTP API · 生文 · 生图 · 生视频  
> **关联**：[**对外文档站基本规范（维护入口）**](./Trinity对外文档站-基本规范.md)、[Trinity文档站方案-VitePress与运营后台.md](./Trinity文档站方案-VitePress与运营后台.md)、[OpenRouter 版式对齐](./Trinity文档站-OpenRouter版式对齐规范.md)、[信息架构与顶栏设计](./Trinity文档站-信息架构与顶栏设计.md)

---

## 1. 一期边界

| 包含 | 不包含（三期或产品就绪后再写） |
|------|------------------------------|
| HTTP API 接入说明 | Client SDK / Agent SDK 独立文档 |
| 生文（对话补全 + 流式） | 图片/视频**输入**、音频、PDF |
| 生图、生视频（生成类） | Embeddings、OAuth、Analytics、BYOK |
| 认证、参数、错误、限额（占位） | 与真实计费/配额强绑定的数值（待产品校验） |

**代码示例**：与 OpenAI / OpenRouter 请求体对齐的**样例**；`api.trinity.example`、路径、字段枚举以网关最终实现为准，发布前由研发校验。

---

## 2. 用户闭环（验收路径）

```mermaid
flowchart LR
  A[快速入门] --> B[拿到 API Key]
  B --> C[调通生文]
  C --> D[按需：流式 SSE]
  D --> E[生图指南 + API]
  E --> F[生视频指南 + API]
  F --> G[错误 / 限额查阅]
```

1. **文档 → 快速入门** → 配置 `TRINITY_BASE_URL` + Key → `POST /v1/chat/completions` 成功（生文）。
2. **文档 → 流式输出** → `stream: true` 样例可跑通（或知悉代理缓冲限制）。
3. **文档 → 生图 / 生视频** → 理解参数差异与异步（若有）流程。
4. **API → 概述 + 三个端点** → 查字段表、复制 curl。
5. **错误与调试** → 401/429/5xx 处理策略明确。

---

## 3. 页面清单与状态

### 3.0 应用场景 Tab（Cookbook）

| 状态 | 路径 | 标题 | 说明 |
|------|------|------|------|
| 🟡 | `/cookbook/` | 概述 | 三轨说明；P0 编程工具索引 |
| 🟡 | `/cookbook/coding-agents/cursor` | Cursor | 配置步骤占位，待截图走查 |
| 🟡 | `/cookbook/coding-agents/claude-code` | Claude Code | 同上 |
| 🟡 | `/cookbook/coding-agents/codex-cli` | Codex CLI | 同上 |

### 3.1 文档 Tab（指南）

| 状态 | 路径 | 标题 | 说明 |
|------|------|------|------|
| ✅ | `/quickstart` | 快速入门 | 仅 HTTP API；首次生文请求 |
| ✅ | `/modules` | 模块 | 能力域说明 |
| ✅ | `/multimodal/` | 多模态 · 概述 | 一级 Tree + 二级子页 |
| ✅ | `/multimodal/image-input` 等 | 多模态子项 | 图片/视频/音频/PDF（占位） |

### 3.2 API Tab（接口参考）

| 状态 | 路径 | 标题 | 说明 |
|------|------|------|------|
| ✅ | `/api/overview` | API 概述 | 基址、鉴权、错误体 |
| ✅ | `/api/chat-completions` | 对话补全（生文） | `POST /v1/chat/completions` |
| ✅ | `/api/images-generations` | 图像生成（生图） | `POST /v1/images/generations` |
| ✅ | `/api/videos-generations` | 视频生成（生视频） | `POST /v1/videos/generations` + 查询占位 |

### 3.3 有页面、侧栏外（补充阅读）

| 路径 | 标题 | 说明 |
|------|------|------|
| `/guides/image-generation` | 生图指南 | 侧栏走多模态子页；文内互链 |
| `/guides/video-generation` | 生视频指南 | 同上 |

---

## 4. 侧栏信息架构

配置：`apps/trinity-docs/.vitepress/config.ts`。

### 4.1 文档 Tab 演进图

**初版需求（产品列出）**

```text
快速入门 → 模块 → 多模态▾(7项) → 管理 API 密钥 → 常见问题
```

**MVP 闭环版（中间迭代，已废弃）**

```text
快速入门 → 管理 API 密钥 → 指南▾ → 参考▾ → 常见问题
```

**当前（产品 IA + 最小闭环合并）**

```text
快速入门 → 管理 API 密钥 → 模块 → 多模态▾(7项) → 指南▾(流式/请求参数) → 参考▾(错误/限额) → 常见问题
```

```mermaid
flowchart LR
  subgraph v1[初版需求]
    direction TB
    a1[快速入门]
    a2[模块]
    am[多模态▾]
    a3[管理 API 密钥]
    a4[常见问题]
  end
  subgraph v2[MVP闭环版]
    direction TB
    b1[快速入门]
    b2[管理 API 密钥]
    bg[指南▾]
    br[参考▾]
    b3[常见问题]
  end
  subgraph now[当前]
    direction TB
    c1[快速入门]
    c2[管理 API 密钥]
    c3[模块]
    cm[多模态▾]
    g[指南▾]
    r[参考▾]
    c4[常见问题]
  end
  v1 --> v2 --> now
```

### 4.2 现行侧栏（文档 + API）

| Tab | 结构 |
|-----|------|
| **文档** | 快速入门 → 管理 API 密钥 → 模块 → 多模态 ▾ → 指南 ▾ → 参考 ▾ → 常见问题 |
| **API** | 概述 → 端点 ▾（对话补全 / 图像生成 / 视频生成） |

### 4.2.1 目标侧栏（三轨 · 拍板）

顶栏二级 Tab 与完整目录树见 **[Trinity文档站-信息架构与顶栏设计.md](./Trinity文档站-信息架构与顶栏设计.md)**：

| Tab | 结构 |
|-----|------|
| **文档** | 同上（现行） |
| **API** | 同上（现行） |
| **应用场景**（Cookbook） | 概述 → 编程工具 ▾（Cursor / Claude Code / Codex CLI · 二期再扩） |

---

## 4.3 侧栏已齐、仍缺内容层

| 项 | 说明 |
|----|------|
| 生图/生视频实操 | 侧栏在 `multimodal/图片生成` 等；完整示例在 `guides/image-generation`，需页内互链 |
| 指南子项 | 闭环版曾有「生图 / 生视频」独立项，现并入多模态 + API Tab，可按需在指南下加链 |
| 产品校验 | §6（`base_url`、异步轮询、model 列表、限额数值） |
| 一期边界外 | 多模态：图片/视频**输入**、音频、PDF（侧栏保留，文档标占位） |

---

## 5. 写作约定

完整条文见 **[Trinity对外文档站-基本规范](./Trinity对外文档站-基本规范.md)**（§1 OpenRouter + 工程师 review、对外用语、三轨、发布检查）。摘要：

1. 每个 API **短页**：**方法 + Path** → P0 字段 → `::: code-group` → 响应；全字段在 `api/*-parameters`。
2. 对外写 **模型 ID**（仅 [模型广场](https://trinity.ai/models)）；发布前 diff 工程师 `API对外接口支持参数.md`（§1.3）。
3. `TRINITY_API_KEY`（`xh-...`）、`TRINITY_BASE_URL`（含 `/v1`）；生图走 **chat/completions**；生视频 **video/generations** + **video/tasks/{id}`**。
4. 待确认项用 `::: info` 或表注。

---

## 6. 产品校验项（发布前）

- [ ] 生产 `base_url` 与路径是否与文档一致
- [ ] 生图/生视频是否异步；轮询 URL 与状态枚举
- [ ] 各能力可用 `provider/model` 列表
- [ ] 限额、402/429 文案与真实计费一致
- [ ] 错误体 `error.type` / `code` 枚举

---

## 7. 本地预览

```bash
npm run dev:trinity-docs   # http://127.0.0.1:5205/docs/quickstart
```
