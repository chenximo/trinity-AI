# 用户控制台 · 情感与口碑 · 产品需求（PRD）

> **配套原型**：[sentiment.html](./sentiment.html)  
> **分层真源**：[产品设计分析 · §0.6 ① 答案层](../../../../trinity-product/docs/geo/product-design-analysis.md#visibility-layers)（提及、位置、情感）  
> **工程真源**：[技术架构 · 测量 SOA](../../../../trinity-product/docs/geo/tech-architecture.md#measurement-soa)

| 字段 | 内容 |
|------|------|
| 路由 | `/console/sentiment`（规划） |
| 读口 | **情感与口碑** |
| 优先级 | P1 |

## 1. 定位

独立读口，承载 **品牌在 AI 回答中被提及时的正 / 中 / 负倾向**，不与 SOA、CCR 混读。

| 前提 | 说明 |
|------|------|
| 分母 | 仅 `brand_mentioned = true` 的采样 |
| 无声失 | 品类失声（如 Q00）→ 情感「—」，不进本页 KPI |
| 与 SOA | SOA 看是否进正文；情感看提及时的措辞态度 |
| 与 CCR | CCR 看是否被引为信源；情感不看引用角色 |

## 2. 页面模块

| 模块 | 说明 |
|------|------|
| 筛选条 | 平台、时间窗（见 §4） |
| KPI | 正 / 中 / 负占比、有情感标注条数 |
| 情感分布条 | 与 KPI 一致的可视化 |
| 提及内容流 | 摘要 + 平台 + 链回答/关键词详情 |
| 按问题表 | 每行 = 一题 × 一平台 × 情感标签 |
| 需关注 | 负面 / 幻觉待复核（链总览治理） |

## 3. 数据从哪来

```text
监测采集 → raw_answer → 规则/可选 LLM 标注 sentiment
  → 仅 brand_mentioned=true 进入情感聚合
  → metric_snapshots（口碑 rollup）
  → 本页 KPI + 分布 + 流/表
```

**原子单位**：`question_id` × `platform` × `round`；情感挂在单条 `annotations` 上。

## 3.1 页面分区与平台（定稿）

| 区域 | 默认是否拆平台 | 说明 |
|------|:--------------:|------|
| KPI 四格 + 分布条 | 否 | 全平台 rollup；可筛平台 |
| 提及内容流 | **是** | 每行含平台 |
| 按问题表 | **是** | 同题多平台 = 多行 |
| 需关注 | **是** | 单条预警，含平台 |

与 [引用页 §3.1](./citations.md) 同一口诀：**顶栏汇总默认不分平台；明细按行分平台。**

## 4. 筛选维度（商用 API）

| 筛选项 | 作用范围 | 默认 |
|--------|----------|------|
| 平台 | KPI、分布条、流、表 | 全部 |
| 时间窗 | 同上 | 近 7 日 |
| 提及 | 隐含 | 仅 `brand_mentioned=true` |

```text
GET /api/console/sentiment/summary?brand_id=trinity&platform=all&days=7
GET /api/console/sentiment/feed?...&mentioned_only=true
```

## 5. Mock 数据来源

> 页面：页头 **ⓘ**（`data-geo-prototype-annotation`），不占主版面。

| 模块 | 真源 | 状态 |
|------|------|------|
| KPI 72/21/7 | rollup 演示 | 演示 |
| Q00 情感「—」 | `mvp/data/r1/annotations.json` | **已入库** |
| Q01 正面 | `answer-detail-brand.html` | 演示 |
| Q02 负面/幻觉 | UI 演示 | 演示 |
| 其余流条目 | UI 演示 | 演示 |

## 6. 与总览关系

总览 KPI 行仅保留摘要或读口卡片（如「情感 72% 正」）；详情在本页。

## 7. 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿 |
| 2026-06-12 | v0.2：对齐引用页 IA · 筛选 · 双列看板 · ⓘ Mock 标注 |
