---
title: 原厂定价页链接
---

# 原厂定价页链接

> **关联**：[模型价格真源 · 总览](./) · 工程 `pricing/suppliers/official/README.md`  
> **维护**：链接以仓库代码为准；改 URL 时同步 `pricing/suppliers/official/data/pricing-urls.mjs` 与 `data/catalog/*.mjs`。

Trinity **原厂权威价**从各模型厂商官网文档获取（无统一 REST 价目 API）。下表为**厂商级定价总页**；单模型页见 [§单模型链接规则](#单模型链接规则) 与 [已生成全表](#已生成全表每模型一行)。

## 获取方式（live vs 种子）

| 类型 | 厂商 | 行为 | 备注 |
|------|------|------|------|
| **live 解析** | OpenAI、Google Gemini、xAI、Anthropic | 抓取定价/模型页 HTML 解析 | 失败时回退 `data/seeds/` |
| **live 解析** | DeepSeek V4 Flash / Pro | 抓取 API 定价页 | 失败时回退种子 |
| **种子 + 链接** | 通义、智谱、Kimi、MiniMax、混元、生图/生视频等 | 人工对照官网维护 `seeds` | `fetchStatus: seed`；链接可追溯 |

命令：`npm run pricing:supplier:official:text`（生图/生视频见 [日常操作](./operations)）。

## 厂商定价总页（按模态）

代码真源：`pricing/suppliers/official/data/pricing-urls.mjs`

### 生文 `text`

| 厂商 | 定价 / 模型文档 | 链接 |
|------|-----------------|------|
| **OpenAI (GPT)** | 价目总览 | [developers.openai.com/api/docs/pricing](https://developers.openai.com/api/docs/pricing) |
| **Google (Gemini)** | Gemini API 定价（中文） | [ai.google.dev/gemini-api/docs/pricing?hl=zh-cn](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn) |
| **Anthropic (Claude)** | 模型概览 | [platform.claude.com/docs/zh-CN/about-claude/models/overview](https://platform.claude.com/docs/zh-CN/about-claude/models/overview) |
| **Anthropic (Claude)** | 定价专页 | [platform.claude.com/docs/en/about-claude/pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| **xAI (Grok)** | 模型文档（示例入口） | [docs.x.ai/developers/models/grok-4.3](https://docs.x.ai/developers/models/grok-4.3) |
| **DeepSeek** | API 定价 | [api-docs.deepseek.com/zh-cn/quick_start/pricing](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) |
| **阿里云百炼 / 通义** | 模型定价 | [help.aliyun.com/zh/model-studio/model-pricing](https://help.aliyun.com/zh/model-studio/model-pricing) |
| **腾讯混元** | 生文定价 | [cloud.tencent.com/document/product/1823/130055](https://cloud.tencent.com/document/product/1823/130055) |
| **智谱** | 定价页 | [bigmodel.cn/pricing](https://bigmodel.cn/pricing) |
| **Kimi** | Chat 定价 | [platform.kimi.com/docs/pricing/chat](https://platform.kimi.com/docs/pricing/chat) |
| **MiniMax** | 按量付费 | [platform.minimaxi.com/docs/guides/pricing-paygo](https://platform.minimaxi.com/docs/guides/pricing-paygo) |
| **火山引擎（豆包等）** | 模型计费 | [volcengine.com/docs/82379/1544106](https://www.volcengine.com/docs/82379/1544106?lang=zh) |

### 生图 `image`

| 厂商 | 链接 |
|------|------|
| **Google Gemini** | [ai.google.dev/gemini-api/docs/pricing?hl=zh-cn](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn) |
| **阿里云百炼** | [help.aliyun.com/zh/model-studio/model-pricing](https://help.aliyun.com/zh/model-studio/model-pricing) |
| **腾讯混元** | [cloud.tencent.com/document/product/1729/97732](https://cloud.tencent.com/document/product/1729/97732) |
| **MiniMax** | [platform.minimaxi.com/docs/pricing/overview](https://platform.minimaxi.com/docs/pricing/overview) |

### 生视频 `video`

| 厂商 | 链接 |
|------|------|
| **Google Gemini** | [ai.google.dev/gemini-api/docs/pricing?hl=zh-cn](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn) |
| **阿里云百炼** | [help.aliyun.com/zh/model-studio/model-pricing](https://help.aliyun.com/zh/model-studio/model-pricing) |
| **腾讯混元** | [cloud.tencent.com/document/product/1729/97731](https://cloud.tencent.com/document/product/1729/97731) |
| **MiniMax** | [platform.minimaxi.com/docs/guides/pricing-video](https://platform.minimaxi.com/docs/guides/pricing-video) |
| **可灵 Kling** | [app.klingai.com/.../skillsMap](https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap) |
| **Vidu** | [platform.vidu.cn/docs/pricing](https://platform.vidu.cn/docs/pricing) |

## 单模型链接规则

登记在 `pricing/suppliers/official/data/catalog/{text,image,video}.mjs` 的 `docUrl`（及可选 `pricingUrl`）。

| 厂商 | URL 规则 | 示例 |
|------|----------|------|
| OpenAI | `https://developers.openai.com/api/docs/models/{vendorModelId}` | [gpt-5.5](https://developers.openai.com/api/docs/models/gpt-5.5) |
| Google | `https://ai.google.dev/gemini-api/docs/models/{id}?hl=zh-cn` 或 Vertex 模型页 | [gemini-2.5-flash](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash?hl=zh-cn) |
| xAI | `https://docs.x.ai/developers/models/{vendorModelId}` | [grok-4.3](https://docs.x.ai/developers/models/grok-4.3) |
| Anthropic | overview / pricing 页 + 模型在 catalog 中指向 | [claude-opus-4-8 等见全表](https://platform.claude.com/docs/en/about-claude/pricing) |
| 国内生文 | 多为厂商**总定价页** + 种子阶梯价；`docUrl` 仍写在 catalog 便于核对 | 通义 → 百炼定价页 |

## 已生成全表（每模型一行）

跑过 `pricing:supplier:official:*` 后，人读表带「链接」列：

| 模态 | 路径 |
|------|------|
| 生文 | `pricing/suppliers/official/output/text/vendor-pricing-table.md` |
| 生图 | `pricing/suppliers/official/output/image/vendor-pricing-table.md` |
| 生视频 | `pricing/suppliers/official/output/video/vendor-pricing-table.md` |

汇总副本（refresh 后）：`pricing/output/official/text.md` 等。

## 与转售渠道的区别

| | 本页（原厂 `official/`） | [采购渠道真源](./suppliers) 中转售 |
|--|--------------------------|-----------------------------------|
| 价含义 | 厂商官网挂牌价 | TokenHub / 百炼 scrape / AIGC 表等 |
| 典型用途 | 成本基准、gate 对比 | 实际采购价、Excel 渠道 Sheet |

网聚云联·云门户的 GPT/Gemini 价从 **official** 筛选，见 [采购渠道真源 · 网聚云联](./suppliers#网聚云联云门户)。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-03 | 首版：汇总 `pricing-urls.mjs` 与 official README |
