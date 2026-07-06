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

| 厂商 | 定价 / 文档 | 链接 |
|------|-------------|------|
| **OpenAI (GPT Image 2)** | 价目总览 · Image generation models | [developers.openai.com/api/docs/pricing](https://developers.openai.com/api/docs/pricing) |
| **Google (Gemini 生图)** | Gemini API 定价（含 Nano Banana 系列） | [ai.google.dev/gemini-api/docs/pricing?hl=zh-cn](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn) |
| **阿里云百炼 / 通义** | 模型定价 · 图像生成章节 | [help.aliyun.com/zh/model-studio/model-pricing](https://help.aliyun.com/zh/model-studio/model-pricing) |
| **阿里云百炼** | 文生图 API 说明 | [help.aliyun.com/zh/model-studio/text-to-image](https://help.aliyun.com/zh/model-studio/text-to-image) |
| **腾讯混元生图** | 混元生图 3.0 / 极速版计费（hy-image） | [cloud.tencent.com/document/product/1668/90896](https://cloud.tencent.com/document/product/1668/90896) |
| **腾讯混元大模型** | 混元生图计费（旧版 0.5元/张） | [cloud.tencent.com/document/product/1729/105925](https://cloud.tencent.com/document/product/1729/105925) |
| **火山引擎（Seedream / 即梦）** | 方舟模型价格 | [volcengine.com/docs/82379/1544106](https://www.volcengine.com/docs/82379/1544106?lang=zh) |
| **Midjourney** | 订阅方案（无公开 API 按张价） | [docs.midjourney.com/docs/plans](https://docs.midjourney.com/docs/plans) |
| **可灵 Kling** | 开发者定价 | [klingai.com/global/dev/pricing](https://klingai.com/global/dev/pricing) |
| **可灵 Kling** | 开放平台 API | [app.klingai.com/.../skillsMap](https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap) |
| **Vidu** | 产品定价（含文生图积分） | [platform.vidu.cn/docs/pricing](https://platform.vidu.cn/docs/pricing) |
| **MiniMax** | 定价总览 | [platform.minimaxi.com/docs/pricing/overview](https://platform.minimaxi.com/docs/pricing/overview) |

#### 生图模型逐条核对（catalog + Trinity 映射）

> 核实状态：`verified` = 已与官网文档对照；`aigc_only` = 官网无按张 API 价，种子暂用 AIGC 商务价；`partial` = 部分档位已核实。

| Trinity ID | 原厂 vendorModelId | API / 原厂模型 ID | 官方价（核实） | 核实 | 定价页 | 文档 |
|------------|-------------------|-------------------|---------------|------|--------|------|
| `hy-image-v3.0` | hy-image-v3.0 | 混元生图 3.0 | ¥0.2/张（统一价） | verified | [90896](https://cloud.tencent.com/document/product/1668/90896) | [105545](https://cloud.tencent.com/document/product/1729/105545) |
| `hy-image-lite` | hy-image-lite | 混元生图极速版 | ¥0.099/张 | verified | [90896](https://cloud.tencent.com/document/product/1668/90896) | [105545](https://cloud.tencent.com/document/product/1729/105545) |
| `Hunyuan-3.0` | hunyuan-image-3 | 混元生图 3.0 | ¥0.2/张（无分档） | verified | [90896](https://cloud.tencent.com/document/product/1668/90896) | [105545](https://cloud.tencent.com/document/product/1729/105545) |
| `SI-4.0` | doubao-seedream-4.0 | doubao-seedream-4.0 | ¥0.2/张 | verified | [1544106](https://www.volcengine.com/docs/82379/1544106?lang=zh) | 同上 |
| `SI-4.5` | doubao-seedream-4.5 | doubao-seedream-4.5 | ¥0.25/张 | verified | [1544106](https://www.volcengine.com/docs/82379/1544106?lang=zh) | 同上 |
| `SI-5.0-lite` | doubao-seedream-5.0-lite | Seedream 5.0 Lite | ¥0.22/张 | verified | [1544106](https://www.volcengine.com/docs/82379/1544106?lang=zh) | 同上 |
| `Jimeng-4.0` | jimeng-4.0 | 即梦 4.0 | ¥0.22/张 | verified | [1544106](https://www.volcengine.com/docs/82379/1544106?lang=zh) | 同上 |
| `qwen-0925` | qwen-image-0925 | qwen-image | ¥0.25/张（统一价） | verified | [model-pricing](https://help.aliyun.com/zh/model-studio/model-pricing) | [text-to-image](https://help.aliyun.com/zh/model-studio/text-to-image) |
| `MJ-v7` | midjourney-v7 | Midjourney v7 | 订阅制，无 API 按张价 | aigc_only | [plans](https://docs.midjourney.com/docs/plans) | [docs](https://docs.midjourney.com/) |
| `OG-image2-low` | openai-image2-low | gpt-image-2 low | $0.006/张（1024²） | partial | [pricing](https://developers.openai.com/api/docs/pricing) | 同上 |
| `OG-image2-medium` | openai-image2-medium | gpt-image-2 medium | $0.053/张（1024²） | partial | 同上 | 同上 |
| `OG-image2-high` | openai-image2-high | gpt-image-2 high | $0.211/张（1024²） | partial | 同上 | 同上 |
| `GG-2.5` | gemini-2.5-flash-image | gemini-2.5-flash-image | $0.039/张（≤1024²） | verified | [pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn) | [model](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image?hl=zh-cn) |
| `GG-3.0` | gemini-3-image | gemini-3-pro-image | $0.134/1K·2K，$0.24/4K | verified | [pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn) | [model](https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image?hl=zh-cn) |
| `GG-3.1` | gemini-3.1-image | gemini-3.1-flash-image | $0.067/1K，$0.101/2K，$0.151/4K | verified | [pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn) | [model](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image?hl=zh-cn) |
| `Vidu-q2` | vidu-q2 | viduq2 文生图 | ¥0.1875/1K，¥0.25/2K，¥0.3125/4K | verified | [pricing](https://platform.vidu.cn/docs/pricing) | 同上 |
| `Kling-2.1` | kling-2.1 | 可灵 2.1 文生图 | 灵感值计价 | aigc_only | [dev/pricing](https://klingai.com/global/dev/pricing) | [API](https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap) |
| `Kling-3.0` | kling-3 | 可灵 3 文生图 | 灵感值计价 | aigc_only | 同上 | 同上 |
| `Kling-3.0-omni` | kling-3.0-omni | 可灵 3.0 Omni | 灵感值计价 | aigc_only | 同上 | 同上 |
| `Kling-O1` | kling-o1 | 可灵 O1 | 灵感值计价 | aigc_only | 同上 | 同上 |

**说明**

- **Gemini 生图**：定价页有独立章节（Nano Banana / Flash Image / Pro Image），可按模型 ID 直接查到美元按张等价价；Trinity `GG-*` 对应 Google API 模型见上表。
- **OpenAI GPT Image 2**：按 token 计费，表中 1K 价为官方计算器在 1024×1024 下的估算；2K/4K 为 Trinity AIGC 分档映射，非 OpenAI 官方尺寸命名。
- **混元**：`90896` 为混元生图产品（3.0 ¥0.2、极速版 ¥0.099）；`105925` 为混元大模型下的旧版混元生图（¥0.5）。此前误链 `97732`（API 概览，非计费页）已更正。
- **可灵 / Midjourney**：官网为订阅或灵感值（Credits），无公开「元/张」API 价目表；L1 种子标注 `aigc_only`，gate 对比时以 AIGC 商务价为参照。
- **通义 qwen-0925**：映射百炼 `qwen-image`，官方统一 ¥0.25/张；AIGC 1K/2K/4K 分档为 Trinity 转售价（已登记例外）。

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
| 2026-07-03 | 生图：补全 10 家厂商定价链接 + 20 模型逐条核对表；修正混元计费 URL；Gemini/OpenAI 官方价 |
| 2026-07-03 | 首版：汇总 `pricing-urls.mjs` 与 official README |
