# 用户控制台 · 优化待办 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/optimize`）功能的产品需求真源。  
> **配套原型**：[optimize.html](./optimize.html)（HTML v0.1）  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/optimize.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
| 状态 | 草稿 |
| 路由 | `/console/optimize` |
| 六环 | ⑤ 优化 |
| 优先级 | P0（列表）/ P1（详情页后续） |
| 顶栏入口 | **优化 → 优化待办** |

### 文档分工

| 范围 | 真源 |
|------|------|
| 诊断 → 动作映射 | **本文** + [MVP §⑤](../../../trinity-product/docs/geo/mvp-practice.md) |
| 诊断来源 | [诊断列表](./diagnosis.md) |
| R1 vs R2 验证 | [效果验证](./verify.md) |

---

## 1. 页面定位

把诊断结论落成 **可勾选、可指派、可验收** 的改进行动。依据真源：[产品设计分析 · §0.6 ④ 归因层](../../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers)（**D* 症状 + S* 信源缺口 + 对标 URL**）。

---

## 2. 功能需求

### 2.1 任务卡片

| 字段 | 说明 |
|------|------|
| 标题 | 一句话动作（含 D* + S*） |
| 目标问题 | `question_id` 链接 |
| 类型 | 官方文档树 / 评测渗透 / 对比块 / 别名 / 证据前置 |
| 对标 URL | 竞品 docs 或第三方文（可外链） |
| 负责人、截止 | 可选 |
| 状态 | 待办 / 进行中 / 已完成 |
| 来源诊断 | 链回 diagnosis + answer-detail#cite-heading |
| R2 验证 | 信源盘 Δ → SOA Δ（文案提示） |

### 2.2 KPI

进行中、待发布、已完成、预期 SOA 提升区间（启发式）。

### 2.3 筛选

按状态 Tab。

### 2.4 与验证闭环

已完成任务 → 触发 R2 采集 → [效果验证](./verify.html) 对比信源盘 Δ 与 SOA Δ。

---

## 3. 缺口 → 动作映射（V1）

| 缺口 / 症状 | 最小动作 | 对标 |
|-------------|----------|------|
| D1 + S1 + S2 | doc 选型官方文档树 | openrouter.ai/docs、TokenHub 文档中心 |
| D1 + S3 | 公域评测渗透 | SegmentFault 横向文结构 |
| D2 | About 全称、别名库 | — |
| D3 | 核心事实前移首段 | — |
| D4 | vs 竞品对比表 | OpenRouter 对比页 |
| D5 | 中文可引用事实页 | — |

---

## 4. 原型样本

| ID | 状态 | 链诊断 |
|----|------|--------|
| opt-s1s2 | 进行中 | Q00 D1+S1+S2 · 对标 docs |
| opt-s3 | 待办 | Q00 S3 · 评测渗透 |
| opt-d4 | 进行中 | Q06 D4 |
| opt-d3 | 待办 | Q02 D3 |
| opt-d2 | 已完成 | D2 别名 |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿 · 批 4b · 优化列表 |
