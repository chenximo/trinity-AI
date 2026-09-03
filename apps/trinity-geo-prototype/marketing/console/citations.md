# 用户控制台 · 引用与信源 · 产品需求（PRD）

> **手册参考样例**：[引用与信源 · 子页 PRD](../../../../trinity-product/docs/geo/samples/citations-prd-sample) · [子页 PRD 规范](../../../../trinity-product/docs/geo/sub-page-prd-standard)  
> **配套原型**：[citations.html](./citations.html)

## 1. 定位

独立读口，承载 **② CCR** 与 **③ 信源盘**，不与 SOA 混在同一 KPI 行。

| 指标 | 用户问题 |
|------|----------|
| CCR | 提到我时，有没有把我当证据源？ |
| M/N | 参考链里有没有我？竞品 docs 占多少？ |

## 2. 页面模块

| 模块 | 说明 |
|------|------|
| 筛选条 | 平台、时间窗、轮次（见 §4） |
| KPI | CCR、信源命中率、可提取样本数、来源结构 |
| 按问题表 | CCR / M/N / 缺口 S* 分列；**每行含平台** |
| 来源结构 | competitor_official / third_party / brand_official |
| 焦点样本 | 钉死一条下钻，**不受筛选** |
| 平台可提取性 | citation_extractable 元数据 |

## 3. 数据从哪来（采集 → 展示）

```text
监测任务（问题集 × 平台 × 轮次）
  → raw_answers（全文 + platform + round）
  → citation_extractable? 
       否 → 仅 SOA/提及；本页 M/N 标「—」
       是 → 解析 cited_urls[] → 分类 + brand_domain_hits → M/N
  → metric_snapshots（KPI rollup）
  → 本页：KPI + 按问题表 + 来源结构 + 可选焦点下钻
```

**原子单位**：一条采集记录 = `question_id` × `platform` × `round`（+ `collected_at`）。  
同一问法在豆包与 ChatGPT 上是**两行**，不能按「仅问题」合并 M/N。

## 3.1 页面分区与平台（定稿）

| 区域 | 默认是否拆平台 | 说明 |
|------|:--------------:|------|
| KPI 四格 | 否（全平台 rollup） | 受页头平台/时间筛选；默认 `platform=all` |
| 来源结构条 | 否 | 同上 |
| 按问题表 | **是** | 每行一题 × 一平台 |
| 焦点样本 | **是**（固定） | 如 Q00×豆包×R1；不受页头筛选 |
| 平台可提取性 | **是** | 渠道配置表 |

**口诀**：顶栏汇总默认不分平台；采、存、按行展示都分平台。见 [§0.6.2a](../../../../trinity-product/docs/geo/product-design-analysis.md#citation-data-pipeline)。

## 4. 筛选维度（商用 API）

| 筛选项 | 作用范围 | 默认 | 说明 |
|--------|----------|------|------|
| **平台** | KPI、来源结构条、按问题表 | 全部 | 与总览「市场/平台」一致，可单选豆包 / ChatGPT 等 |
| **时间窗** | 同上 | 近 7 日 | 按 `collected_at` |
| **轮次** | 同上 | 全部（或最新轮） | R1 / R2 验证期可只看 R2 |
| **可提取** | 隐含 | 仅 `true` | `false` 样本不进 M/N 分母 |

**不受筛选**：

- **焦点样本**（如 Q00 × 豆包 × R1）— 固定教学下钻；
- **平台可提取性表** — 渠道配置，非时序聚合。

规划查询示例：

```text
GET /api/console/citations/summary?brand_id=trinity&platform=all&days=7
GET /api/console/citations/by-question?...&citation_extractable=true
GET /api/console/answers/:id/citations   # 焦点 / 回答详情
```

## 5. 平台可提取性（配置）

| 平台 | citation_extractable | 原型样本 |
|------|---------------------|----------|
| 豆包 App | 是 | Q00 · `cited_sources.json` |
| ChatGPT | 部分 | Q01 · CCR 样本页 |
| Claude / Gemini | 部分 | 视消费端 |
| API 直连 | 否 | CCR 标不可观测 |

## 6. Mock 数据来源（原型验收）

> **页面展示**：不占主版面；页头标题旁 **ⓘ**（`data-geo-prototype-annotation`）点开气泡，对齐全站 `InternalHelpTip` / 对话页 `orc-help-tip` 约定。正文真源以本节与 `mvp/data/*` 为准。

| 页面模块 | 商用逻辑 | 本仓库真源 | 状态 |
|----------|----------|------------|------|
| KPI 四格 | `metric_snapshots` rollup | 演示数字（8% / 12% / 34 / 58%） | 演示 |
| 按问题 · Q00 | 单条采集 | [`mvp/data/r1/cited_sources.json`](../../mvp/data/r1/cited_sources.json) | **已入库** |
| 按问题 · Q01/Q03/Q06 | 单条采集 | UI 演示行；Q01 链 [`answer-detail-brand.html`](./answer-detail-brand.html) | 演示 |
| 来源结构条 | 筛选下 category 占比 | 由 Q00 的 11+5+0 外推演示 | 派生 |
| 焦点 Q00 | 固定下钻 | 同上 `cited_sources.json` · 渠道 `doubao-app-manual` | **已入库** |
| R2 信源 Δ | 再采集对比 | [`mvp/data/r2/cited_sources.json`](../../mvp/data/r2/cited_sources.json)、[`verify.json`](../../mvp/data/r2/verify.json) | **已入库** |
| 标注/SOA 联动 | `annotations` | [`mvp/data/r1/annotations.json`](../../mvp/data/r1/annotations.json)（当前仅 Q00 豆包 R1） | **已入库** |
| 问题文案 | 问题集 | [`mvp/config/questions.json`](../../mvp/config/questions.json) | 配置 |
| 采集录入规范 | — | [`mvp/MANUAL-SUBMIT.md`](../../mvp/MANUAL-SUBMIT.md) | 文档 |

**Q00 已入库摘要**：豆包 R1 · N=16 · M=0 · 竞品官方 11 + 第三方 5 · 缺口 S1+S2+S3 · D1。

## 7. 关联

- [可见性总览](./dashboard.html) — SOA  
- [回答详情](./answer-detail.html#cite-heading) — 单条信源盘  
- [效果验证](./verify.html#verify-q00) — R2 Δ  
- [关键词详情](./keyword-detail.html) — 按题下钻

## 8. 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿 |
| 2026-06-12 | §4 筛选、§6 Mock 真源对照、焦点样本标注 platform×round |
| 2026-06-12 | Mock 来源改页头 ⓘ 标注，移出主版面 |
| 2026-06-12 | §3.1 顶栏 rollup / 按行分平台定稿 |
