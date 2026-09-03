# 用户控制台 · 优化待办 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/optimize`）功能的产品需求真源。  
> **配套原型**：[optimize.html](./optimize.html)（HTML v0.2 · 扁平 IA）  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/optimize.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.2 |
| 状态 | 草稿 |
| 路由 | `/console/optimize` |
| 六环 | ⑤ 优化 |
| 优先级 | P0（列表）/ P1（详情页） |
| 顶栏入口 | **优化 → 优化待办** |

### 文档分工

| 范围 | 真源 |
|------|------|
| 诊断 → 动作映射 | **本文** + [MVP §⑤](../../../trinity-product/docs/geo/mvp-practice.md) |
| 诊断来源 | [诊断列表](./diagnosis.md) |
| R1 vs R2 验证 | [效果验证](./verify.md) |
| 文档树任务详情 | [optimize-detail](./optimize-detail.md) |

---

## 1. 页面定位

把诊断结论落成 **可勾选、可指派、可验收** 的改进行动。依据真源：[产品设计分析 · §0.6](../../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers)（**D* + S* + 对标 URL**）。

---

## 2. 功能需求

### 2.1 任务行（表格）

| 列 | 说明 |
|----|------|
| 状态 | 待办 / 进行中 / 已完成 |
| 诊断 | D* + S* 标签 |
| 行动 | 标题 + 副文案 |
| 目标 | question_id |
| 截止 | 可选 |
| 操作 | 详情 / 诊断 / 验证 |

### 2.2 KPI

进行中、待办、已完成、预期 SOA 提升区间。

### 2.3 筛选

状态 Tab + 搜索（行动、Q ID、D/S）。

### 2.4 P0 spotlight

`#opt-s1s2` · Q00 文档树样本，链 optimize-detail / 信源盘。

### 2.5 与验证闭环

已完成 → R2 → [verify.html](./verify.html) 信源盘 Δ / SOA Δ。

---

## 3. 缺口 → 动作映射（V1）

见页内折叠表 · [audit](./audit.html) S4 · [diagnosis](./diagnosis.md) D*。

---

## 4. 原型样本

| ID | 状态 | 说明 |
|----|------|------|
| opt-s1s2 | 进行中 | Q00 D1+S1+S2 |
| opt-s3 | 待办 | Q00 S3 |
| opt-d4 | 进行中 | Q06 D4 |
| opt-d3 | 待办 | Q02 D3 |
| opt-d2 | 已完成 | D2 别名 |

Mock：页头 **ⓘ** · `geo-help-tpl-opt-mock`

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | v0.2：扁平表格 · spotlight · 搜索筛选 · ⓘ · 映射折叠 |
| 2026-06-12 | 初稿 v0.1 · 批 4b |
