# 用户控制台 · 效果验证 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/optimize/verify`）功能的产品需求真源。  
> **配套原型**：[verify.html](./verify.html)（HTML v0.2 · 扁平 IA）  
> **样本数据**：[mvp/data/r2/verify.json](../../mvp/data/r2/verify.json)、[r2/cited_sources.json](../../mvp/data/r2/cited_sources.json)  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/verify.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.2 |
| 状态 | 草稿 |
| 路由 | `/console/optimize/verify` |
| 六环 | ⑥ 验证 |
| 优先级 | P0 |
| 顶栏入口 | **优化 → 效果验证** |

### 文档分工

| 范围 | 真源 |
|------|------|
| R1 vs R2 对比、验收顺序 | **本文** + [产品设计 §0.6 ⑤](../../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers) |
| 优化动作来源 | [优化待办](./optimize.md) |
| R1 信源基线 | [回答详情](./answer-detail.md) · `mvp/data/r1/cited_sources.json` |

---

## 1. 页面定位

闭环最后一环：**优化做完之后有没有用**。验收须 **先看信源盘 Δ，再看 SOA Δ**（信源往往先于正文变化）。

---

## 2. 功能需求

### 2.1 任务索引表

| 列 | 说明 |
|----|------|
| 判定 | partial / CCR / improved |
| 问题 | question_id + 简述 |
| 领先 Δ | 信源盘或 CCR 一行摘要 |
| SOA | R1 → R2 |
| 动作 | linked_action_id |

### 2.2 明细块（按 question）

R1→R2 指标表 · 结论一行 · R2 新增链（折叠）· 文本链操作。

### 2.3 筛选

全部 / 信源先行 / SOA 同步 + 搜索。

### 2.4 P0 spotlight

`#verify-q00` · Q00 先进盘样本。

---

## 3. 原型样本

| ID | 类型 | 说明 |
|----|------|------|
| verify-q00 | 信源先行 | 0/16→1/17 · SOA 0% |
| verify-q01 | SOA 同步 | CCR 1/3→2/3 · SOA +6pt |

Mock：页头 **ⓘ** · `geo-help-tpl-verify-mock`

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | v0.2：扁平 IA · 索引表 + 明细 · spotlight · 筛选 · ⓘ |
| 2026-06-12 | 初稿 v0.1 · Q00 R1→R2 样本 |
