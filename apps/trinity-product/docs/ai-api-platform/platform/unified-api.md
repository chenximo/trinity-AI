---
title: 统一 API 基座
---

# 统一 API 基座

> **说明**：统一基址、路由入口、请求/响应形态与 OpenAI SDK **零改造**对齐；对标 OpenRouter **One API**。所有下游能力挂在此基座上。

> **工程**：`apps/trinity-docs`（`/api/overview` 等）· 网关服务实现 · 内测见 [API 测试](../api-test/)

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（对外文档 `/docs/api/overview`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/platform/unified-api.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **统一 API 基座** / 平台侧）。子能力进度与节点列以 **`unified-api.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [生文 API](./chat-completions) | 核心端点 |
| [开发者文档](../user/developer-docs) | 对外叙述真源 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套（文档规范 §5.1） |
| 2026-06-02 | 子能力迁入 `roadmap.yml`；本页只嵌 `<ProductRoadmap />` |
