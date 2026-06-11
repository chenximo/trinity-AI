---
name: trinity-docs
description: >-
  Trinity 对外开发者文档站（apps/trinity-docs，VitePress）：三轨（文档/API/应用场景）、
  OpenRouter 版式与章节对齐、工程师 API对外接口支持参数.md 发布前 review。
  改 quickstart、API Reference 短页、api/*-parameters、multimodal、cookbook、侧栏/i18n 时使用。
  触发词：trinity-docs、对外文档站、开发者文档、API 文档站、docs/5205、OpenRouter 文档对齐、
  chat-completions 文档。勿与 trinity-product-handbook 产品手册、trinity-design-tokens 业务 UI 混用。
disable-model-invocation: true
---

# Trinity 对外文档站 · Agent Skill

## 读取顺序

`SKILL.md` → `workflows/<task>.md` → repo 真源 md。边界：[`./DOMAIN.md`](./DOMAIN.md) · 确认：[`./confirmation.md`](./confirmation.md)

## Workflows

| 意图 | 文件 |
|------|------|
| 更新 API 文档 | [`./workflows/update-api-doc.md`](./workflows/update-api-doc.md) |
| 对齐 OpenRouter | [`./workflows/align-openrouter.md`](./workflows/align-openrouter.md) |
| 更新参数表 | [`./workflows/update-param-table.md`](./workflows/update-param-table.md) |

---

## 真源（MUST READ，禁止凭记忆写对外正文）

| 任务 | 必读 |
|------|------|
| **维护入口（先读）** | `docs/04-工程与迁移/Trinity对外文档站-基本规范.md`（§1 OR+工程师 review、§2 禁止项、§7 三轨模板、**§8 子文档规范**、§11 发布检查） |
| **API 字段** | `docs/00-协作与工作流/工程师/API对外接口支持参数.md` |
| **顶栏 / 侧栏 IA** | `docs/04-工程与迁移/Trinity文档站-信息架构与顶栏设计.md` |
| **版式 / code-group** | `docs/04-工程与迁移/Trinity文档站-OpenRouter版式对齐规范.md`（含 §2.1.1 VP 布局通病） |
| **页面清单** | `docs/04-工程与迁移/Trinity文档站-一期MVP文档清单.md` |
| **对外正文** | `apps/trinity-docs/docs/**/*.md`（中文 root；英文 `docs/en/` 镜像） |
| **侧栏注册** | `apps/trinity-docs/.vitepress/config/sidebars.ts` |
| **未开放进度** | `apps/trinity-product/docs/ai-api-platform/user/developer-docs.roadmap.yml`（**不**写入对外 md） |

本地：`npm run dev:trinity-docs` → http://127.0.0.1:5205/docs/

---

## 写作流程（固定顺序）

```text
① 结构对标 OpenRouter（章节、示例形态、多模态/API Reference 分工）
② diff 工程师 API对外接口支持参数.md（仅写已支持能力）
③ 写入 apps/trinity-docs/docs（客户视角，§2 禁止内部路径）
④ 注册侧栏 + en 镜像 + build:trinity-docs
```

OR 参考（结构，非照抄未开放能力）：

- [Image Inputs](https://openrouter.ai/docs/guides/overview/multimodal/image-understanding)
- [Image Generation](https://openrouter.ai/docs/guides/overview/multimodal/image-generation)
- [Chat completions API Reference](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request)

**禁止写入对外正文**：`GET /v1/models`、Try it、OR 专属未上线参数、站内 JWT `/v1/app/chat/completions`、仓库路径、产品手册/内测用语。

---

## 三轨与落点

| Tab | 前缀 | 写什么 |
|-----|------|--------|
| **文档** | `/quickstart`、`/guides/`、`/multimodal/`、`/reference/` | 接入手册、概念、多模态指南（对齐 OR Guides） |
| **API** | `/api/` | 端点**短页** + **高级参数**（`api/chat-completions-parameters` 等） |
| **应用场景** | `/cookbook/` | Cursor / Claude Code / Codex 配置；**不**贴全参数表 |

| 页面类型 | 路径示例 | 规则 |
|----------|----------|------|
| API 短页 | `api/chat-completions.md` | P0 字段 + Authentication/Headers/Body + `::: code-group`（Python → TS fetch → Shell） |
| API 高级参数 | `api/*-parameters.md` | 工程师表全字段；链短页 |
| 多模态 | `multimodal/image-input.md` | OR 同类指南结构 + 工程师 §2.1 / §二 |
| 请求参数索引 | `guides/request-parameters.md` | 链 API，不复制全表 |

**易混（必须在相关页写明）**：

- 看图：`messages[].content` · `image_url` Part
- 生图：同路径 `POST /chat/completions` + `modalities` + `image_config`（**非** `/images/generations`）
- 生图：**不支持** `stream: true`、`trinity_async.*`

---

## 对外用语（硬规则）

| 概念 | 对外写法 |
|------|----------|
| `model` | **模型 ID**，[模型广场](https://trinity.ai/models) |
| Key | `xh-...`，`Authorization: Bearer <TRINITY_API_KEY>` |
| Base URL | `TRINITY_BASE_URL`，含 **`/v1`** |
| 追踪/计费重试 | `X-Request-Id`、`X-Idempotency-Key`（重试同一笔业务**结算键不变**） |

**禁止写入 `apps/trinity-docs/docs/**`（含 `en/`）**：`OpenRouter`、`openrouter.ai`、`对标参考`、页首链 openrouter.ai 的 Reference 行。结构借鉴仅在维护者规范内（`基本规范` §1、版式 §2.1.1）。

**改 `trinity-docs.css` 时**：本页目录保留 `aside-container: fixed`；覆盖 `content-container` 688px；留白用 `padding-inline` + `--tdocs-doc-cluster-gap`（见版式 §2.1.1）。

提示块：`::: info` 一般说明（蓝）；`::: tip` 非常重要（绿）；`::: warning` 易混/破坏性。

---

## 新增或改页（检查清单）

1. 定轨：文档 / API / cookbook  
2. 中文 md：`apps/trinity-docs/docs/...`  
3. 英文：`docs/en/...` 翻译或 `npm run docs:en-mirror -w @trinity/app-trinity-docs` 占位  
4. `sidebars.ts`：`sidebarDocsZh` / `sidebarApiZh` / `sidebarCookbookZh`  
5. 完成 **基本规范 §1.3** 工程师 review + **§8** 单页骨架核对 + §11 扫雷（禁止词含 `OpenRouter` / `对标参考`）  
6. `npm run build:trinity-docs`  

**改 API 参数顺序**：先工程师 `API对外接口支持参数.md` → 再 `trinity-docs` 对应页 → 再 product roadmap（可选）。

---

## 与其它 Skill 边界

见 [`./DOMAIN.md`](./DOMAIN.md)。

---

## 工程速查

| 项 | 路径 |
|----|------|
| VitePress 配置 | `apps/trinity-docs/.vitepress/config.ts` |
| 顶栏 Tab | `apps/trinity-docs/.vitepress/theme/docsNav.ts` |
| 样式 token | `apps/trinity-docs/.vitepress/theme/trinity-docs.css`（必覆盖 `.VPDoc.has-aside .content-container` 688px） |
| 工作区包名 | `@trinity/app-trinity-docs` |

```bash
npm run dev:trinity-docs
npm run build:trinity-docs
npm run docs:en-mirror -w @trinity/app-trinity-docs
```
