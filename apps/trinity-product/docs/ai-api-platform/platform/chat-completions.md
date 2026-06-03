---
title: 生文 API + 流式
---

# 生文 API + 流式

> **说明**：对标 `chat/completions` 与 SSE 流式；**5.30 端到端调通**为成败线。

> **工程**：`apps/trinity-docs`（`/quickstart` · `/api/chat-completions` · `/guides/streaming-sse`）· 网关实现

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（文档 Quickstart）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/platform/chat-completions.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **生文 API + 流式** / 平台侧）。子能力进度与节点列以 **`chat-completions.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [鉴权](./auth-rate-quota) | Bearer Key |
| [路由](./routing-fallback) | 选路上游 |
| [计量](./metering-billing) | token 入账 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套（文档规范 §5.1） |
| 2026-06-02 | 子能力迁入 `roadmap.yml`；本页只嵌 `<ProductRoadmap />` |
