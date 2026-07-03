---
title: 采购渠道真源
---

# 采购渠道真源

> **关联**：[模型价格真源 · 总览](./) · [原厂定价页链接](./official-pricing-urls) · 工程 `pricing/suppliers/SOURCES.md`  
> **维护**：链接与工程脚本保持一致；**不抄具体价格数字**。

各渠道**只认下列目录下的 JSON** 为价目真源（**仅 AIGC** 仍用手工 `pricing-sheet.mjs`）；流水线、校验、Excel 都从这里读。

## 工程真源与命令

| 渠道 | 真源（相对仓库根） | 获取命令 |
|------|-------------------|----------|
| **原厂（生文）** | `pricing/suppliers/official/output/text/` | `npm run pricing:supplier:official:text` |
| **原厂（生图）** | `pricing/suppliers/official/output/image/` | `npm run pricing:supplier:official:image` |
| **原厂（生视频）** | `pricing/suppliers/official/output/video/` | `npm run pricing:supplier:official:video` |
| **TokenHub** | `pricing/suppliers/tokenhub/output/` | `npm run pricing:supplier:tokenhub:console` |
| **百炼** | `pricing/suppliers/bailian/output/` | `npm run pricing:supplier:bailian:doc` |
| **AIGC** | `pricing/suppliers/aigc/data/pricing-sheet.mjs` | `npm run pricing:supplier:aigc` |
| **火山方舟** | `pricing/suppliers/volcengine/output/text/pricing-api.json` | `npm run pricing:supplier:volcengine` |
| **网聚云联·云门户** | `pricing/suppliers/wangju-cloudportal/output/` | `npm run pricing:supplier:wangju-cloudportal` |
| **中转站-cust** | `pricing/suppliers/relay-cust/output/` | `npm run pricing:supplier:relay-cust` |

## 定价来源链接

**采购渠道**从哪里看价、工程从哪里抓/录入。代码真源见各 `pricing/suppliers/*/README.md`。

| 渠道 | 价怎么进仓库 | 定价来源链接 | 备注 |
|------|--------------|--------------|------|
| **原厂 official** | 爬官网 + 种子 | [原厂定价页链接](./official-pricing-urls) | 厂商官网；非转售进货价 |
| **TokenHub** | Playwright 抓控制台 API | [TokenHub 模型广场](https://console.cloud.tencent.com/tokenhub/models) | **需登录**腾讯云；本地跑 scrape |
| **百炼** | 爬公开文档页 | [百炼模型定价文档](https://help.aliyun.com/zh/model-studio/model-pricing) | 无需登录 |
| **AIGC** | **商家内部价目表**人工录入 | —（无固定公开定价页） | 真源 `aigc/data/pricing-sheet.mjs`；商家给表/截图 |
| **火山方舟** | 爬公开文档页 → `output/{text,image,video}/` | [火山方舟 · 模型价格](https://www.volcengine.com/docs/82379/1544106?lang=zh) | `npm run pricing:supplier:volcengine:all` |
| **网聚云联·云门户** | 从 **official** 筛选复制 | 价同 [原厂定价页](./official-pricing-urls)（GPT/Gemini） | 无独立挂牌价 URL |
| **中转站-cust** | 从 **official** 全量复制 | 产品入口：[AIUPNode 模型广场](https://www.aiupnode.com/pricing) · 价同 [原厂](./official-pricing-urls) | 门户需登录；**价不爬该站** |

### 两类「不用单独给链接」

| 类型 | 渠道 | 说明 |
|------|------|------|
| **原厂直连** | 网聚云联、中转站-cust | 价 = `official`，跟官方价自动走 `pricing:refresh` |
| **商家给表** | AIGC | 只有这一家明确「商家提供价目」；改 `pricing-sheet.mjs` |

## 原厂直连对比

| | 网聚云联·云门户 | 中转站-cust |
|--|----------------|-------------|
| 范围 | official 筛选 GPT/Gemini | official **全量**生文 |
| 构建器 | `pricing/suppliers/official-direct/channels/wangju-cloudportal.mjs` | `…/relay-cust.mjs` |
| Excel Sheet | 网聚云联云门户 | 中转站-cust |

## 其他外链

飞书台账、合同、通用厂商 API 文档 → [厂商外链索引](./vendor-links)。**数字以本节工程真源为准。**

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-03 | 补充各渠道定价来源链接表 |
