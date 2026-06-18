# 用户控制台 · 引用与信源 · 产品需求（PRD）

> **配套原型**：[citations.html](./citations.html)  
> **分层真源**：[产品设计分析 · §0.6 ②③](../../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers)

| 字段 | 内容 |
|------|------|
| 路由 | `/console/citations`（规划） |
| 读口 | **引用与信源**（对标 Generforce「AI 引用来源」） |
| 优先级 | P1 |

## 1. 定位

独立读口，承载 **② CCR** 与 **③ 信源盘**，不与 SOA 混在同一 KPI 行。

| 指标 | 用户问题 |
|------|----------|
| CCR | 提到我时，有没有把我当证据源？ |
| M/N | 参考链里有没有我？竞品 docs 占多少？ |

## 2. 页面模块

| 模块 | 说明 |
|------|------|
| 分层说明 | CCR vs M/N vs SOA |
| KPI | CCR、信源命中率、可提取样本数、来源结构 |
| 按问题表 | CCR / M/N / 缺口 S* 分列 |
| 来源结构 | competitor_official / third_party / brand_official |
| 焦点样本 | Q00 16 链 |
| 平台可提取性 | citation_extractable |

## 3. 样本

- Q00：CCR 否 · 0/16 · S1+S2+S3  
- Q01：CCR 是 · 1/3 · ChatGPT 样本页

## 4. 关联

- [可见性总览](./dashboard.html) — SOA  
- [回答详情](./answer-detail.html#cite-heading) — 单条信源盘  
- [效果验证](./verify.html#verify-q00) — R2 Δ
