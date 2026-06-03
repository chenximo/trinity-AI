---
title: Chat 在线体验
---

# Chat 在线体验

> **说明**：浏览器内选模型、对话试用。与 [开发者文档](./developer-docs) 分工：文档教集成；Chat 给非开发者体验。真推理是否已接 `chat/completions` 以 roadmap 为准。

> **工程**：`apps/trinity-ai/src/views/chat/`（五件套：`ChatPage.vue` · `chat.css` · `chatInteractions.ts` · `mock.ts` · `README.md`）· 路由 `/chat`

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（用户面 `/chat`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/user/chat-experience.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **Chat 在线体验** / 用户面）。子能力进度与节点列以 **`chat-experience.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [模型广场 · 列表](./models/list) | 卡片 → Chat 带 model |
| [开发者文档](./developer-docs) | API 集成 vs 试用 |
| 平台侧 · 生文 API | 后端 `chat/completions` |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套（文档规范 §5.1） |
| 2026-06-02 | 子能力迁入 `roadmap.yml`；本页只嵌 `<ProductRoadmap />` |
| 2026-05-26 | 首版 |
