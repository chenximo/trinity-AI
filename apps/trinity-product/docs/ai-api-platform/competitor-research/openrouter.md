---
title: OpenRouter
---

# OpenRouter · 友商调研

> **说明**：OpenRouter 为 Trinity **AI API 聚合产品**当前主要对标对象；本页汇总官网入口、能力对照与内部维护文档链。

## 官方入口

| 项 | 链接 |
|----|------|
| 官网 | [openrouter.ai](https://openrouter.ai/) |
| 文档 | [openrouter.ai/docs](https://openrouter.ai/docs) |
| 定价 | [openrouter.ai/pricing](https://openrouter.ai/pricing) |
| 模型目录 | [openrouter.ai/models](https://openrouter.ai/models) |

## 与 Trinity 分层对照

OpenRouter 官网主要是 **Models + Docs + Account**（≈ 用户侧）+ **统一 API**（≈ 平台侧）。**运营后台管理平台**为 Trinity B2B 自建，工程在 `trinity-ai-admin`，友商无对等模块。

| OpenRouter | Trinity 手册入口 |
|------------|------------------|
| Models / Rankings | [模型广场 · 列表](../user/models/list) · [模型排名](../user/models/rankings) · [模型详情](../user/models/model-detail-requirements) |
| Docs / Quickstart | [开发者文档](../user/developer-docs) · 对外 [trinity-docs](http://127.0.0.1:5205/docs/quickstart) |
| Chat / Playground | [Chat 在线体验](../user/chat-experience) |
| API Reference | [统一 API 基座](../platform/unified-api) · [生文 API](../platform/chat-completions) · [多模态 API](../platform/multimodal-api) |
| Account / Keys | [用户控制台](../user/account-console) |

详见 [产品总览 · OpenRouter 对照](../#和-openrouter-怎么对照)。

## 文档站与版式（维护者）

结构借鉴仅在仓库内维护者文档讨论；**对外 `trinity-docs` 正文禁止出现 OpenRouter 字样**。

| 主题 | 仓库内文档 |
|------|------------|
| 文档站 IA / 三轨 | `docs/04-工程与迁移/Trinity文档站-信息架构与顶栏设计.md` |
| 版式 / code-group | `docs/04-工程与迁移/Trinity文档站-OpenRouter版式对齐规范.md` |
| 子文档写作规范 | `docs/04-工程与迁移/Trinity对外文档站-基本规范.md` §8 |
| 对外正文 | `apps/trinity-docs/docs/**` |

## 调研备忘

| 主题 | 结论 / 状态 |
|------|-------------|
| 模型列表与筛选 | Trinity 对标 [列表](../user/models/list)；排行见 [rankings](../user/models/rankings) |
| 单模型详情 | 轻量一屏，对标 OR 单模型页；见 [模型详情](../user/models/model-detail-requirements) |
| Cookbook（Cursor 等） | Trinity [Cookbook](http://127.0.0.1:5205/docs/cookbook/) 分轨；结构参考 OR，内容以工程师契约为准 |
| 运营上架 / 线路 | OR 无 B2B 后台；Trinity 见 [模型上架与供应线路](../operations/models-routes) |
| 【待补充：定价策略对比】 | 【待补充】 |
| 【待补充：飞书深度调研】 | 【待补充】 |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-05 | 从总览拆出 OpenRouter 专页 |
