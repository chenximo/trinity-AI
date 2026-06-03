---
title: 路由与 Fallback
---

# 路由与 Fallback

> **说明**：模型到上游线路路由；v1 单线路，Fallback 商用再做。

> **工程**：后端 `model_supply_route` · `apps/trinity-ai-admin/src/views/admin-models/`（五件套：`ModelsPage.vue` · `models.css` · `modelsInteractions.ts` · `mock.ts` · `README.md`）· `/models/lines`

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（运营线路配置）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/platform/routing-fallback.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **路由与 Fallback** / 平台侧）。子能力进度与节点列以 **`routing-fallback.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [运营后台 · 模型上架](../operations/models-routes) | 供给配置 |
| [生文 API](./chat-completions) | 调用面 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套（文档规范 §5.1） |
| 2026-06-02 | 子能力迁入 `roadmap.yml`；本页只嵌 `<ProductRoadmap />` |
