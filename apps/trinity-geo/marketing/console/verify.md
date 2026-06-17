# 用户控制台 · 效果验证 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/optimize/verify`）功能的产品需求真源。  
> **配套原型**：[verify.html](./verify.html)（HTML v0.1，样本 **Q00 · 豆包 R1→R2**）  
> **样本数据**：[mvp/data/r2/verify.json](../../mvp/data/r2/verify.json)、[r2/cited_sources.json](../../mvp/data/r2/cited_sources.json)  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/verify.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
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

### 2.1 验证卡片（按 question_id）

| 字段 | 说明 |
|------|------|
| 关联动作 | `linked_action_id` → 优化待办 |
| R1 / R2 采集时间 | 轮次与时间戳 |
| 信源盘 Δ | 我方域 M/N：R1 vs R2 |
| SOA Δ | 进正文占比：R1 vs R2 |
| 缺口 Δ | `gap_ids` R1 vs R2 |
| 结论 | partial / improved / no_change |
| 新增我方链 | R2 新进入参考盘的 URL 列表 |

### 2.2 验收顺序（产品规则）

1. **信源盘 Δ** — 我方域是否从 0 增加  
2. **CCR Δ** — 是否被当作依据  
3. **SOA Δ** — 是否进推荐正文（可滞后）

### 2.3 触发 R2

商用：优化任务完成或手动触发 → 对**动过手的题目**补采。MVP：手工补采 + JSON 存档。

---

## 3. 原型样本（Q00）

| 指标 | R1 | R2 | 判定 |
|------|----|----|------|
| 我方域 | 0/16 | 1/17 | 信源改善 ✓ |
| SOA | 0% | 0% | 未变（预期内） |
| 缺口 | S1+S2+S3 | S2+S3 | S1 部分缓解 |
| 动作 | — | opt-s1s2 | doc 文档树上线 |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿 · 批 5 · 效果验证 + Q00 R1→R2 样本 |
