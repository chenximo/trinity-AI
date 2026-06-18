# 用户控制台 · 诊断列表 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/diagnosis`）功能的产品需求真源。  
> **配套原型**：[diagnosis.html](./diagnosis.html)（HTML v0.2 · 扁平 IA）  
> **样本数据**：[mvp/data/r1/diagnosis.json](../../mvp/data/r1/diagnosis.json)（Q00·D1）  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/diagnosis.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.2 |
| 状态 | 草稿 |
| 路由 | `/console/diagnosis` |
| 六环 | ④ 诊断 |
| 优先级 | P0（规则诊断引擎） |
| 顶栏入口 | **诊断 → 诊断列表** |

### 文档分工

| 范围 | 真源 |
|------|------|
| D1–D5 规则与优先级 | **本文** + [MVP 实践手册 §④](../../../trinity-product/docs/geo/mvp-practice.md) |
| 页面 URL 审计 | P1 · [audit.html](./audit.html) · [PRD](./audit.md) |
| 优化动作 | [优化待办 PRD](./optimize.md) |

---

## 1. 页面定位

| 项 | 说明 |
|----|------|
| **用户问题** | 「SOA 低了，**为什么**？能改什么？」 |
| **不是什么** | 页面爬虫审计（**P1**）；LLM 自由发挥的建议 |

**输入**：测量标注 +（若有）`cited_urls[]` 信源盘。  
**输出**：D1–D5 + S1–S6 + 证据句 + 链到优化待办。

框架真源：[产品设计分析 · §0.6](../../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers)。

---

## 2. 规则引擎（V1）

| ID | 条件 | 结论 | 默认优先级 |
|----|------|------|-----------|
| D1 | 品牌未提及且竞品进答案 | 品类失声 | P0 |
| D2 | 品牌问法未识别 | 别名/收录 | P1–P2 |
| D3 | 提及但未进正文 | 弱提及 | P1 |
| D4 | 末段提及且竞品首推 | 叙事落后 | P1 |
| D5 | 海内外 SOA 显著差 | 市场割裂 | P2 |

### 2.2 信源缺口（S1–S6，有 `cited_urls` 时）

见 [产品设计 · §0.6.7](../../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers)。优化待办须同时引用 D* 与 S*。

| ID | 描述 |
|----|------|
| S1 | 参考链接中无我方域 |
| S2 | 竞品官方文档独占 |
| S3 | 第三方评测固化叙事 |
| S4 | 有页不可引（审计） |
| S5 | 有页未入盘（待验证） |
| S6 | 市场割裂 |

---

## 3. 功能需求

### 3.1 KPI

开放诊断数、P0/P1 计数、已关联优化任务数。

### 3.2 诊断列表

紧凑表格：优先级、规则、问题、平台、缺口、证据摘要、链到回答/优化。P0 样本 Q00 置顶 spotlight。

### 3.3 筛选

按 D1–D5 类型、P0–P2 优先级、搜索问法/Q ID。

### 3.4 规则速查

默认折叠 `<details>`：D1–D5 + S1–S4 对照表。

### 3.5 子导航

诊断列表（本期）· [页面审计](./audit.html)（P1 · v0.1）。

---

## 4. 原型验收（HTML v0.2）

| 项 | 样本 |
|----|------|
| Mock | 页头 **ⓘ** · `geo-help-tpl-diag-mock` |
| P0 spotlight | Q00 · D1 + S1–S3 · 豆包 · `#diag-q00` 深链 |
| 表格 | 5 行 · 筛选 + 搜索 |
| 规则表 | 折叠 details |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | v0.2：扁平 IA · 表格列表 · spotlight · ⓘ Mock · 规则折叠 |
| 2026-06-12 | 初稿 · 批 4a · 规则诊断 |
