---
title: 列表
---

# 模型广场 · 列表

> **说明**：客户浏览平台可用模型：搜索、筛选、排序与卡片列表；列表须与运营「模型上架」及网关 `model` id **同一套数据**（不再用页面内写死的演示数据）。子能力进度见同目录 **`roadmap.yml`**（模型广场子目录一张表）。

> **工程**：`apps/trinity-ai/src/views/models/`（五件套：`ModelsPage.vue` · `models.css` · `modelsInteractions.ts` · `mock.ts` · `README.md`）· 路由 `/models`

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../../)（用户面 `/models`）

## 子能力清单

<ProductRoadmap />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **模型广场 · 列表** / 用户面）。子能力进度与节点列以 **`roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [模型排名](./rankings) | `/rankings` · 用量排行 · `rankings.roadmap.yml` |
| [模型详情页](./model-detail-requirements) | `/models/:id` · 6.30 轻量详情 · `detail-roadmap.yml` |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 工程行补五件套；PRD 仅附录关联；验收链飞书 |
| 2026-06-01 | 子能力迁入 `models/roadmap.yml`；本页只嵌组件 |
| 2026-06-01 | 迁入 `user/models/list` |
| 2026-05-26 | 首版 `model-catalog` |
