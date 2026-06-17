# 用户控制台 · AI 回答详情 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/monitoring/answers/:id`）功能的产品需求真源。  
> **配套原型**：[answer-detail.html](./answer-detail.html)（HTML v0.1，样本 **Q00 · 豆包**）  
> **样本数据**：[mvp/data/r1/annotations.json](../../mvp/data/r1/annotations.json)、[cited_sources.json](../../mvp/data/r1/cited_sources.json)（信源盘）  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/answer-detail.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
| 状态 | 草稿 |
| 路由 | `/console/monitoring/answers/:id` |
| 六环 | ③ 测量 · 原始证据 |
| 优先级 | P0 |
| 顶栏入口 | 关键词详情 / 总览回答流 / 监测概览 |

### 文档分工

| 范围 | 真源 |
|------|------|
| 全文展示、标注侧栏、竞品命中 | **本文** |
| 单题聚合 KPI | [关键词详情](./keyword-detail.md) |
| 标注规则 | [技术架构 · 测量 SOA](../../../../trinity-product/docs/geo/tech-architecture.md#measurement-soa) |

---

## 1. 背景与问题

### 1.1 用户原声

> 「SOA 是 0，AI 到底说了什么？」  
> 「竞品排在第几？有没有提到我们？」

### 1.2 页面定位

| 项 | 说明 |
|----|------|
| **用户问题** | 「这一条 AI 回答里，品牌/竞品各是什么情况？」 |
| **产品角色** | **原始证据页**：全文 + 规则引擎标注结果 + 诊断钩子 |
| **样本** | Q00 豆包 — 未提及 Trinity，OpenRouter / TokenHub 进正文 |

---

## 2. 用户故事

```
作为 品牌营销负责人，
我想要 阅读 AI 回答原文并看到系统如何标注品牌与竞品，
以便 向老板解释 SOA 数字，并决定是否进入优化流程。
```

---

## 3. 功能需求

### 3.1 页头

| 元素 | 说明 |
|------|------|
| 面包屑 | 监测 → Q00 → 回答详情 |
| 问法 | 关联 `question_text` |
| 元信息 | 平台、采集渠道、轮次、采集时间 |
| 返回 | 关键词详情 |

### 3.2 回答全文

| 能力 | 说明 | 优先级 |
|------|------|:------:|
| Markdown 渲染 | 标题、列表、加粗 | P0 |
| 品牌高亮 | 命中别名黄色标记 | P0 |
| 竞品高亮 | 可选次要色（后续） | P1 |
| 数据来源 | `raw_answers.answer_full` | P0 |

### 3.3 测量标注侧栏

| 字段 | 说明 | Q00 样本 |
|------|------|----------|
| 品牌提及 | 正文是否出现别名 | 否 |
| 进答案正文 (SOA) | `in_answer_body` | 否 |
| 提及位置 | 首推 / 前列 / 备选 / — | — |
| 被引为信源 (CCR) | 是否作为引用来源 | 否 |
| 参考链接数 | `cited_urls.length` | 16 |
| 我方域命中 | `brand_domain_hits` / 总数 | 0 / 16 |
| 情感 | 正 / 中 / 负 / — | — |

### 3.4 参考来源（信源层 · ③）

当平台回答附带「参考链接 / 产品依据」时，必须结构化采集并展示。

| 能力 | 说明 | 优先级 |
|------|------|:------:|
| 全量 URL 列表 | 来自 `cited_sources.json` → `cited_urls[]` | P0 |
| 分组展示 | 竞品官方 / 第三方评测 / 我方（缺失块） | P0 |
| 统计徽章 | 我方域 M/N | P0 |
| 缺口归因 | S1–S3 链诊断与优化 | P0 |
| 锚点 | `#cite-heading` 供诊断/优化链入 | P0 |

**Q00 样本**：OpenRouter 6 + TokenHub 5 + 第三方 5；我方 0；缺口 **S1+S2+S3**。

### 3.5 命中竞品列表

来自 `competitors_detail`：名称 + 位置语义（进正文·首推 / 备选提及等）。

**Q00**：OpenRouter、TokenHub 进正文；LiteLLM、One API、硅基流动、Portkey 备选。

### 3.6 诊断卡片

当 `in_answer_body=N` 且题为品类词 → 提示 **D1 品类失声**；若有信源盘且 `brand_domain_hits=0` → 叠加 **S1+S2+S3**，链优化（对标 URL）。

### 3.7 采集元数据

`question_id`、`channel`、`round`、可选截图 URL（后续）。

---

## 4. 空态与引导

| 场景 | 行为 |
|------|------|
| 品牌未进答案 | 侧栏红色标注 + 链品牌设置（别名是否够）+ 链诊断 |
| 采集失败 | 不展示本页；监测概览失败列表处理 |

---

## 5. 原型验收（Q00 · 豆包）

| 区块 | 预期 |
|------|------|
| 全文 | OpenRouter、TokenHub 两节 + 备选 |
| 标注 | 品牌提及否、SOA 否、参考 16 链 0 我方 |
| 信源 | 三组 16 URL + 我方缺失块 |
| 竞品 | 6 个竞品列表 |
| 诊断 | D1 + S1+S2+S3 |
| 元数据 | Q00、doubao-app-manual、R1 |

---

## 6. 路由与参数

| 参数 | 说明 |
|------|------|
| `:id` | `raw_answer` 主键或稳定 slug |
| `?q=&platform=` | 原型可选查询（商用 REST 用路径 ID） |
