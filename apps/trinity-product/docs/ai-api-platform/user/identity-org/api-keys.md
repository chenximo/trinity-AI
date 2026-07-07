---
title: API 密钥
---

# API 密钥

> **说明**：租户开发者在 **当前工作区** 创建与管理 **API Key**；Key 是调用 [统一 API](../../platform/unified-api) 的凭证。5.30 成败线：**创建 Key → 调通 chat/completions**。  
> **工程**：`KeysView.vue` · `KeysAdvancedFilterPanel.vue` · `ConsoleModelEntitlementPicker.vue` · 路由 `/account/workspace/:link/keys`  
> **域地图** → [身份与组织 · 总览](./index) · 能力域 **A + C**

---

## 1. 用户问题与边界

**问题**：开发者要把 Trinity 接进业务系统，需要 **可轮换、可吊销、可按工作区隔离** 的密钥。

**本能力是什么**：工作区内的 Key **CRUD**、Secret 一次性展示、到期筛选、（可选）模型 entitlement。

**不是什么**：运营侧 [平台上游 Key](../../operations/keys) 管理。

---

## 2. 功能范围

| 做（P0） | 不做 / P1 |
|----------|-----------|
| 创建 Key · 展示完整 Secret 一次 | IP 白名单（P1） |
| 搜索 · 按到期筛选 | — |
| 删除 / 吊销 | — |
| Key 归属当前工作区 | 跨工作区共享 Key |
| 模型 entitlement / 护栏（guardrails 页联动） | P1 完善 |

---

## 3. 数据与字段

| 展示 | 含义 |
|------|------|
| 名称 | 租户自定义，便于识别 |
| Secret | 创建时完整显示；之后仅前缀 |
| 到期 | 可选 TTL；筛选器支持 |
| 工作区 | 隐式：当前 `lastLink` |
| 模型范围 | entitlement 限制可调 model（若启用） |

---

## 4. 交互路径

```text
/account/workspace/{link}/keys → 创建 → 复制 Secret
  → trinity-docs Quickstart → POST /v1/chat/completions
  → /usage 查看该 Key 产生用量
```

---

## 5. 验收

- 在子工作区创建的 Key，切换到其他工作区后 **不在列表中**。  
- 用 Key 调 API 成功，[用量](./usage-logs) 可归因。  
- 删除 Key 后，旧 Secret 立即 401。

飞书走查：筛 **API 密钥 / 控制台**。

---

## 附录

### 关联

| 模块 | 关系 |
|------|------|
| [platform/auth-rate-quota](../../platform/auth-rate-quota) | 鉴权 · 限流 |
| [developer-docs](../developer-docs) | Quickstart |
| [quota](./quota) | 余额不足时 402 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-07-06 | 初版 L2 |
