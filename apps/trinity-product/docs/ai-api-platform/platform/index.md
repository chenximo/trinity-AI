---
title: 平台侧模块
---

# 平台侧模块 · 总览

> **工程**：`TrinityAI-backend/trinityai-gateway`（入口）· `trinityai-chat-service`（OpenAI 兼容 API 核心）· `trinityai-finance-service` / `trinityai-usage-service`（计费计量）· 对外 API 文档 `apps/trinity-docs`  
> **先读**：[产品核心与架构 · 运行时主链](../product-core#运行时主链一次-api-调用)

> **地址**：见 [AI API 聚合产品 · 总览](../)（对外文档；API 说明在文档站内）

## 模块总览

| 平台侧模块 | 对标 OpenRouter | 当前已做 | 5.30 能力 | 6.30 能力 | 备注 |
|------------|-----------------|:--------:|:---------:|:---------:|------|
| [统一 API 基座](./unified-api) | One API · OpenAI 兼容 | 🟡 | ✅ | ⬜ | 内测 **P0** |
| [生文 API + 流式](./chat-completions) | `chat/completions` · SSE | 🟡 | ✅ | ⬜ | **端到端调通 = 成败线** |
| [多模态 API](./multimodal-api) | Images / Videos | 🟡 | 🟡 | ⬜ | 5.30 可降级验收 |
| [鉴权 · 限流 · 配额](./auth-rate-quota) | API Key · Rate limits | 🟡 | ✅ | ⬜ | |
| [路由与 Fallback](./routing-fallback) | Routing · 降级 | ⬜ | ⬜ | ⬜ | v1 单线路；Fallback 商用再做 |
| [计量与计费](./metering-billing) | Usage · Credits | 🟡 | 🟡 | ⬜ | 5.30 可人工记账 |
| [数据策略](./data-policies) | 数据去向约束 | ⬜ | ⬜ | ⬜ | 可先合同约定 |
| [标准错误与可观测](./errors-observability) | 错误体 · Request ID | 🟡 | ✅ | ⬜ | |

## 与用户面的关系

| 用户侧 | 依赖的平台侧 |
|--------|----------------|
| [模型广场 · 列表](../user/models/list) | 模型目录 API + 运营上架 · [模型域总览](../user/models/) |
| [Chat](../user/chat-experience) | 生文 API + 鉴权 |
| [开发者文档](../user/developer-docs) | 生文 API + 标准错误 |
| [用户控制台](../user/account-console) | 计量与计费 |

周计划与本周结果见 [AI API 聚合产品 · 总览 · 周计划与验收看板](../#周计划与验收看板)；月度主链见同页 [月度能力主链](../#月度能力主链)。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐子总览样板；去掉 tip |
| 2026-06-02 | 移除能力门禁节；周计划改链聚合总览 |
| 2026-05-26 | 总览表 + 二级叶子页 |
