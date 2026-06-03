---
title: 模型排名
---

# 模型广场 · 模型排名

> **说明**：对标 OpenRouter **Rankings**：按用量、Token、趋势等维度展示模型排行，引导用户从 [列表](./list) 进入详情或 Chat。数据口径与平台计量、运营在架目录一致；**6.30** 以原型与五件套为主（见周计划）。

> **工程**：`apps/trinity-ai/src/views/rankings/`（规划五件套 · 路由 `/rankings`，待建）

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../../)（用户面 `/rankings`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/user/models/rankings.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **模型排名** / 用户面）。子能力进度与节点列以 **`rankings.roadmap.yml`** 为准。

### 关联

| 模块 | 关系 |
|------|------|
| [模型广场 · 列表](./list) | 同一 `model id`；排行项可进列表/详情 |
| [模型详情页](./model-detail-requirements) | 排行行 → `/models/:id` |
| [Chat 在线体验](../chat-experience) | 排行 → 带 model 试用 |
| 平台侧 · 计量与计费 | 排行数据源（用量聚合） |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 用户侧「模型广场」子菜单新增本页；roadmap 占位 |
