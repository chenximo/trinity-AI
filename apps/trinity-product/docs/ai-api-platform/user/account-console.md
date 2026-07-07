---
title: 用户控制台（归档入口）
---

# 用户控制台 · 归档入口

> **说明**：原 **单页 hash 控制台**（`/account/console#keys` · `#credits` …）的产品说明已迁移至 **[身份与组织 · 总览](./identity-org/)**。  
> **现行工程**：`TrinityAI-web/apps/web` · 路由 `/account/workspace/:link/*`  
> **旧版原型**：`apps/trinity-ai/src/views/account/ConsolePage.vue`（hash 面板，仅供对照）

---

## 现行结构

| 原 hash 面板 | 现行入口 |
|--------------|----------|
| API 密钥 | [API 密钥](./identity-org/api-keys) · `…/keys` |
| 角色管理 | 合并进 Key entitlement / [guardrails](../../platform/auth-rate-quota)（演进中） |
| 额度 | [配额与余额](./identity-org/quota) · `…/balance` |
| 活动 | [用量与活动](./identity-org/usage-logs) · `…/activity` |
| 用量 | [用量与活动](./identity-org/usage-logs) · `…/usage` |

组织、成员、子工作区见 [工作区](./identity-org/workspace) · [成员](./identity-org/members)。

---

## 子能力进度（可选）

<details>
<summary>展开 · 历史 roadmap 表</summary>

<ProductRoadmap rel="ai-api-platform/user/account-console.roadmap.yml" />

与 [周计划](../../#周计划与验收看板) 重复时 **以周计划为准**。

</details>

---

## 附录

### 验收

走查真源：[5.30 产品测试体验 / Bug 表](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（筛 **用户控制台 / 身份与组织**）。

### 修订

| 日期 | 说明 |
|------|------|
| 2026-07-06 | 迁移至 identity-org 域；本页为归档入口 |
| 2026-05-26 | 首版 hash 控制台 |
