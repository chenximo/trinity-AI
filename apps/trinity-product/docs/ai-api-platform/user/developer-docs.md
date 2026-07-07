---
title: 对外文档站
---

# 对外文档站（trinity-docs）

> **说明**：客户-facing **HTTP API 文档**的产品规格。**Markdown 正文真源**在 `apps/trinity-docs/docs/`；本页规定 IA、P0 页面、主路径与验收，**不复制**对外正文全文。  
> **工程**：`apps/trinity-docs/`（VitePress）· 本地 `npm run dev:trinity-docs` → `http://127.0.0.1:5205/docs/`  
> **域地图** → [文档与支持 · 总览](./docs/) · 能力域 **I**

---

## 1. 用户问题与边界

**问题**：企业开发者需要 **一份可自助完成的集成说明**——从拿 Key、选 model、发第一次请求，到查错误与计费口径。

**本产品是什么**：

- 独立 **文档站** `trinity-docs`（顶栏三轨：文档 / API / 应用场景）
- 与用户站 **控制台、模型广场** 闭环，不替代控制台 UI

**不是什么**：

- 不是 [产品手册](https://127.0.0.1:5206/product/)（内部进度与规格）
- 不在对外正文写仓库路径、内测阶段用语（见 `Trinity对外文档站-基本规范` §2）
- 未开放 API（如 Try it、`GET /v1/models` 未上线）**不写进对外页**，仅在手册 roadmap 跟踪

---

## 2. 功能范围

### 2.1 三轨信息架构（P0）

| 顶栏轨 | URL 前缀 | 写什么 |
|--------|----------|--------|
| **文档** | `/quickstart` · `/guides/` · `/multimodal/` · `/reference/` · `/faq` | 接入手册、流式、多模态指南、错误与限额 |
| **API** | `/api/` | 端点 **短页**（P0 字段 + 示例）+ **高级参数**长页 |
| **应用场景** | `/cookbook/` | Cursor / Codex / Claude Code 等配置；不贴全参数表 |

对标结构：[OpenRouter Docs](https://openrouter.ai/docs/)（能力边界以 Trinity 已开放为准）。

### 2.2 P0 页面（5.30 最小集）

| 页面 | 路径 | 用途 |
|------|------|------|
| Quickstart | `/quickstart` | Key · base_url · 首次 `chat/completions` |
| 管理 API 密钥 | `/manage-api-keys` | 创建/轮换/吊销；链控制台 |
| API 概述 | `/api/overview` | 基址 · 鉴权 · 追踪头 |
| 创建对话补全 | `/api/chat-completions` | P0 请求/响应 + code-group 示例 |
| 流式 SSE | `/guides/streaming-sse` | `stream: true` |
| 错误与调试 | `/reference/error-codes` | 401 / 402 / 429 / 5xx |
| 常见问题 | `/faq` | 能力范围 · 与线上一致性 |
| Cookbook 概述 | `/cookbook/` | 编程工具索引 |

### 2.3 做 / 不做

| 做（P0–P1） | 不做 / 接口开放后再写 |
|-------------|----------------------|
| 中英 locale（quickstart 已译） | API Reference **Try it** 交互 |
| 生图/生视频指南 + API 短页（6.30 扩展） | 对外写 `GET /v1/models`（网关未开放前） |
| 示例 model 须 **在架** 且与广场 id 一致 | 站内 JWT `/v1/app/chat/*` 等内部接口 |

更细页面清单与进度 → 附录 roadmap（可选）。

---

## 3. 核心数据与口径

| 项 | 规则 |
|----|------|
| **base_url** | 生产示例 `https://api.trinitydesk.ai/v1`（专属部署以交付为准） |
| **API Key** | 前缀 `xh-...`；[控制台创建](../identity-org/api-keys) 后完整 Secret 仅展示一次 |
| **model** | 必须为 **模型 ID**（非展示名），与 [模型广场](../models/list) · 网关 · 运营上架 **同一 id** |
| **鉴权** | `Authorization: Bearer {TRINITY_API_KEY}` |
| **计费文案** | 与 [商用计费](../../commercial-billing/) · 控制台 Credits **同单位同表述** |
| **可选头** | `X-Request-Id` · `X-Idempotency-Key`（见 API 概述） |

---

## 4. 用户主路径

```text
trinity.ai/models 复制 model id
  → 控制台 /account/workspace/{link}/keys 创建 Key
  → trinity-docs /quickstart
  → POST {base_url}/chat/completions
  → 失败 → /reference/error-codes
  → 用量/账单 → 控制台 + /guides/billing-and-credits
```

**Cookbook 路径**（P1）：`/cookbook/coding-agents/cursor` 等 → 配置 Base URL + Key，model 仍走统一 API。

---

## 5. 与用户站 / 平台 / 运营的关系

| 面 | 职责 |
|----|------|
| **用户站** | 顶栏 imm 链 `trinity-docs`；控制台 Key · 广场 model |
| **平台 API** | 文档只描述 **已开放** 端点（见 [unified-api](../../platform/unified-api) · [chat-completions](../../platform/chat-completions)） |
| **运营** | [docs-publish](../../operations/docs-publish) 发布校验；模型在架后 Quickstart 示例才可更新 |

---

## 6. 异常与一致性

| 场景 | 期望 |
|------|------|
| 文档示例 model 已下架 | 发版前替换为在架 id；手册走查拦截 |
| 401 / 402 / 429 | 错误码页与网关响应体一致 |
| 中文/英文 quickstart | 关键步骤语义一致，不是机翻占位长期停留 |
| 对外正文 | 无 `apps/`、无「5.30」等内部阶段词 |

---

## 7. 验收（5.30 / 6.30）

- **Given** 运营已在架模型 M，**When** 客户按 `/quickstart` 用文档示例 model 与自有 Key 请求，**Then** `chat/completions` 返回 200（或文档声明的流式行为）。  
- **Given** Quickstart 中 `model` 字符串，**When** 与 [模型广场](../models/list) 卡片 id 对照，**Then** **完全一致**。  
- **Given** `/guides/billing-and-credits` 与控制台额度页，**When** 对照 Credits/USD 用语，**Then** **无冲突**。  
- **6.30**：生图/生视频 Quickstart 链路与异步轮询说明可独立走通。

飞书走查：筛 **开发者文档 / trinity-docs / Quickstart**。

---

## 附录

### 关联

| 模块 | 关系 |
|------|------|
| [文档与支持 · 总览](./docs/) | I 域 L1 |
| [API 密钥](../identity-org/api-keys) | Key 创建 |
| [模型域](../models/) | model id 真源 |
| [Chat 体验](../chat-experience) | 试玩 vs HTTP 集成 |
| [platform/chat-completions](../../platform/chat-completions) | 运行时行为 |

### 工程与规范（链出，非正文）

| 文档 | 用途 |
|------|------|
| `apps/trinity-docs/README.md` | 本地 dev/build |
| `docs/04-工程与迁移/Trinity对外文档站-基本规范.md` | 用语 · 三轨 · 发布检查 |
| `docs/04-工程与迁移/Trinity文档站-信息架构与顶栏设计.md` | IA |
| `docs/04-工程与迁移/Trinity文档站-一期MVP文档清单.md` | 页面清单 |
| `docs/00-协作与工作流/工程师/API对外接口支持参数.md` | 字段契约（研发） |

### L3 · 页面进度（可选）

<details>
<summary>展开 · roadmap 表（维护优先级低）</summary>

<ProductRoadmap rel="ai-api-platform/user/developer-docs.roadmap.yml" />

与 [周计划](../../#周计划与验收看板) 重复时 **以周计划为准**。

</details>

### 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | L2 样本：三轨 IA · P0 页 · 主路径 · 验收；roadmap 降为附录 |
| 2026-06-02 | 首版 roadmap 叶子 |
