# 用户控制台 · 诊断列表 · 产品需求（PRD）

> **配套原型**：[diagnosis.html](./diagnosis.html) · **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/diagnosis.html`  
> **样本**：Q00·D1 · [diagnosis.json](../../mvp/data/r1/diagnosis.json)  
> **规范**：[子页 PRD 通用规范](../../../trinity-product/docs/geo/sub-page-prd-standard)

## 1. 背景与问题

> 「SOA 低了，**为什么**？能改什么？」

**用户问题**：测量结果异常时，需要 **可解释的规则标签**（D* + S*）和链到优化/回答的证据，而不是空泛建议。

**固定样本**：Q00 · 豆包 · D1 + S1–S3 · `#diag-q00`。

---

## 2. 用户故事

作为品牌营销负责人，我想要看到每条失声问题对应的规则类型与证据摘要，以便决定进优化待办还是先看回答原文。

---

## 3. 功能范围

**做**：D1–D5 规则诊断、S1–S6 信源缺口（有 `cited_urls` 时）、列表筛选、P0 spotlight、链回答/优化。

**不做**：页面 URL 爬虫审计（→ [audit](./audit.md) P1）；LLM 自动生成建议；优化执行（→ [optimize](./optimize.md)）。

---

## 4. 数据与规则

**输入**：测量标注 +（若有）`cited_urls[]`。  
**输出**：D* + S* + 证据句 + 链优化待办。分层见 [§0.6](../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers)。

| ID | 条件 | 结论 | 默认优先级 |
|----|------|------|-----------|
| D1 | 品牌未提及且竞品进答案 | 品类失声 | P0 |
| D2 | 品牌问法未识别 | 别名/收录 | P1–P2 |
| D3 | 提及但未进正文 | 弱提及 | P1 |
| D4 | 末段提及且竞品首推 | 叙事落后 | P1 |
| D5 | 海内外 SOA 显著差 | 市场割裂 | P2 |

**信源缺口 S1–S6**（有信源盘时）：S1 缺席 · S2 竞品独占 · S3 评测固化 · S4 有页不可引 · S5 有页未入盘 · S6 市场割裂。优化待办须 **D* + S* + 对标 URL**。

**L1 位置**：测量标注 / 信源盘 → **本页规则打标** → 优化待办。全链路 [§0.6.2a](../../../trinity-product/docs/geo/product-design-analysis.md#citation-data-pipeline)。

---

## 5. 功能说明

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| KPI 条 | 开放诊断数、P0/P1 计数、已关联优化任务数 | P0 |
| 诊断列表 | 优先级、规则、问题、平台、缺口、证据摘要 | P0 |
| P0 spotlight | Q00 · D1+S1–S3 置顶 · `#diag-q00` | P0 |
| 筛选 | D 类型 · P 优先级 · 搜索 Q ID | P0 |
| 规则速查 | 折叠 details：D1–D5 + S1–S4 | P1 |
| 子导航 | 诊断列表 · [页面审计](./audit.html)（P1） | P1 |

---

## 6. 交互

**读路径（L2）**：总览 / 回答详情 / 关键词详情 → **诊断列表** → 行链 **回答详情** 或 **优化待办**；侧栏可切 **页面审计**。

| 操作 | 说明 |
|------|------|
| 筛选 D / P | 表格即时过滤 |
| 点击 spotlight / 行 | 深链 `#diag-q00` 或对应 Q |

---

## 7. 异常与空态

| 场景 | 行为 |
|------|------|
| 无开放诊断 | 空态 + 链监测/问题集 |
| 无信源盘 | 仅展示 D*，S* 列标「—」 |

---

## 8. 验收标准

```
Given Q00 豆包 R1 标注为 D1 且信源盘 M/N=0/16
When 打开诊断列表
Then Q00 spotlight 展示 D1 + S1–S3，且可链到 optimize / answer-detail
```

| 区块 | 预期 |
|------|------|
| Mock | 页头 ⓘ · `geo-help-tpl-diag-mock` |
| 表格 | 5 行 · 筛选 + 搜索 |
| 规则表 | 折叠 details |

---

## 关联

- [optimize](./optimize.md) · [audit](./audit.md) · [answer-detail](./answer-detail.md)  
- 规则样本：[MVP 实践 §④](../../../trinity-product/docs/geo/mvp-practice.md)

## Mock 真源对照（原型期）

| 模块 | 真源 | 状态 |
|------|------|------|
| 诊断行 / Q00 | [diagnosis.json](../../mvp/data/r1/diagnosis.json) | 已入库 |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | v0.2：扁平 IA · spotlight · ⓘ Mock |
| 2026-06-08 | v0.3：对齐子页 PRD ~80%（§1–§8）；删页首元信息表 |
