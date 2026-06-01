---
title: 平台侧模块
---

# 平台侧模块 · 总览

::: tip 填写说明
- **当前已做**、**5.30 能力**、**6.30 能力** 用 **✅ 🟡 ⬜**（与 [聚合平台总览](../) 一致；**5.30 商用** / **6.30 商用** 见 [手册总览](../../))
- 进度摘抄自 `docs/05-产品与PRD/roadmap/平台面-00-总览.md`，网关联调后请你改 emoji
:::

> **平台侧**：对外 **HTTP API**（网关、鉴权、路由、计量）；无独立营销 UI，以 [开发者文档](http://127.0.0.1:5205/docs/api/overview) 与网关行为为准。  
> **关联**：[用户侧](../user/) · [运营后台管理平台](../operations/) · `apps/trinity-ai-admin`

## 原型与体验

| | 链接 |
|--|------|
| **原型链接** | —（无独立页面） |
| **体验地址** | [API 总览](http://127.0.0.1:5205/docs/api/overview) · Quickstart [生文](http://127.0.0.1:5205/docs/quickstart)（`npm run dev:trinity-docs`） |

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
| [模型广场](../user/model-catalog) | 模型目录 API + 运营上架 |
| [Chat](../user/chat-experience) | 生文 API + 鉴权 |
| [开发者文档](../user/developer-docs) | 生文 API + 标准错误 |
| [用户控制台](../user/account-console) | 计量与计费 |

## 5.30 能力门禁（草案）

| 优先级 | 模块 | 门禁 |
|--------|------|------|
| **P0** | 生文 API + 流式 | `POST /v1/chat/completions` **真通**（含 stream） |
| **P0** | 鉴权 | 无效 Key → 401；有效 Key 可调通 |
| **P0** | 统一 API 基座 | 基址、`model` id、错误体与文档一致 |
| **P0** | 计量 | 调用产生 `usage_event`（可查，可不自动扣费） |
| P1 | 限流 | 基础按 Key 限流 |
| P2 | 多模态 | 至少一条生图或生视频通路演示 |
| **不做** | Fallback 全链 | 不阻塞 5.30 内测 |

用例与 Bug：[飞书 · 5.30 体验测试表](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)。

## 6.30 能力门禁（草案）

| 优先级 | 模块 | 门禁 |
|--------|------|------|
| **P0** | 路由与 Fallback | §4.6 供应线路 + 多上游 Fallback 生产可用 |
| **P0** | 计量与计费 | 自动扣费 / 对账闭环 |
| P1 | 多模态 API | 生图 + 生视频各至少一条生产通路 |
| P2 | 数据策略 | 租户数据去向引擎或合同级策略 |
| **纳入 6.30** | Fallback 全链 | 5.30 单线路 → 6.30 降级链 |

对照 `docs/05-产品与PRD/roadmap/平台面-00-总览.md` 填写各模块 **6.30 能力** 列。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-01 | 总览表增加 **6.30 能力** 列口径；与 **5.30 商用** / **6.30 商用** 里程碑对齐 |
| 2026-05-26 | 总览表 + 二级叶子页；5.30 口径 |
