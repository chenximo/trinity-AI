---
title: 模型详情
---

# 模型详情页

> **说明**：从 [模型广场 · 列表](./list) 进入单模型页（对标 [OpenRouter 单模型页](https://openrouter.ai/openai/gpt-5.5) **轻量一屏**）：确认能否用、定价、上下文、试玩与 API 文档闭环。**6.30 商用最小集**；Providers / Performance 等全 Tab **不做**。数据与列表、运营上架、网关 `model` id **同一套**，禁止详情页单独 mock。

> **工程**：`apps/trinity-ai/src/views/models/detail/`（规划五件套：`ModelDetailPage.vue` · `model-detail.css` · `*Interactions.ts` · 复用列表 `mock.ts` · `README.md`）· 列表域 `../`（`ModelsPage.vue` 等）· 路由 `/models/:modelId`

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../../)（用户面 `/models/:id`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/user/models/detail-roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **模型详情页** / 用户面）。子能力进度与节点列以 **`detail-roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [模型广场 · 列表](./list) | 卡片入口 · 共用 catalog |
| [Chat 在线体验](../chat-experience) | 试玩预填 model |
| [开发者文档](../developer-docs) | API 文档锚点 |
| [用户控制台](../account-console) | 可选 Key 入口 |
| 运营 · [模型上架](../../operations/models-routes) | slug / 在架 / 定价 |
| 平台侧 · 生文 API | 试玩与文档 model 可调通 |

### PRD / 规范

- `docs/05-产品与PRD/roadmap/用户面-03-模型广场.md`（C6 模型详情）
- 工程规划：`apps/trinity-ai/src/views/models/detail/README.md`

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 改为标准叶子页 + `detail-roadmap.yml`；从列表 roadmap 拆出详情子能力 |
| 2026-06-02 | 曾标为 PRD 页，已收回 |
| 2026-05-26 | 首版核心需求 |
