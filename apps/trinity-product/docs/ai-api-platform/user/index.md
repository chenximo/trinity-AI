---
title: 用户侧模块
---

# 用户侧模块 · 总览

> **工程**：`TrinityAI-web/apps/web`（用户面）· 原型 `apps/trinity-ai/src/views/`  
> **先读**：[能力地图 · 域 H/D/A](../capability-map) · [业务全景](../business-overview)

> **地址**：见 [AI API 聚合产品 · 总览](../)（用户面体验/在线基址见该页）

## 模块总览

| 模块 | 能力域 | 当前已做 | 5.30 能力 | 6.30 能力 | 文档 |
|------|:------:|:--------:|:---------:|:---------:|:----:|
| 注册 / 登录 | A | 🟡 | ⬜ | ⬜ | 2 |
| [身份与组织 · 总览](./identity-org/) | A | 🟡 | 🟡 | 🟡 | **4** |
| [工作区](./identity-org/workspace) | A | 🟡 | 🟡 | 🟡 | 4 |
| [成员](./identity-org/members) | A | 🟡 | 🟡 | 🟡 | 4 |
| [API 密钥](./identity-org/api-keys) | A·C | 🟡 | ✅ | 🟡 | 4 |
| [配额与余额](./identity-org/quota) | A·F | 🟡 | 🟡 | 🟡 | 4 |
| [用量与活动](./identity-org/usage-logs) | F·G | 🟡 | 🟡 | ⬜ | 4 |
| [模型域总览](./models/) | D·H | 🟡 | — | — | 4 |
| [模型广场 · 列表](./models/list) | D·H | 🟡 | ✅ | 🟡 | 4 |
| [模型广场 · 详情](./models/model-detail-requirements) | D·H | ⬜ | ⬜ | 🟡 | 4 |
| [模型广场 · 排名](./models/rankings) | H | ⬜ | ➖ | ⬜ | 4 |
| [Chat 在线体验](./chat-experience) | H·E | ⬜ | ⬜ | ⬜ | 1 |
| [文档与支持 · 总览](./docs/) | I | 🟡 | 🟡 | 🟡 | **4** |
| [对外文档站](./developer-docs) | I | 🟡 | 🟡 | ⬜ | **4** |
| [用户控制台（归档）](./account-console) | — | — | — | — | — |

**身份与组织**：企业多工作区、成员邀请、子区配额分配已上线；规格见 [identity-org/](./identity-org/)。  
**模型域**：见 [models/](./models/)。

路径示例：`/account/workspace/{link}/keys` · `/models` · `/chat` · `/docs`。

周计划见 [产品总览 · 周计划与验收看板](../#周计划与验收看板)。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | I 域 L1 docs/ + developer-docs L2 样本 |
| 2026-07-06 | 新增 identity-org 域；模块表加能力域与文档列 |
| 2026-07-06 | 模型域 PM 重规划 |
| 2026-06-02 | 子总览结构冻结 |
