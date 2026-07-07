---
title: 配额与余额
---

# 配额与余额

> **说明**：**顶级工作区** 持有账户余额与 **可分配配额池**；可向 **子工作区** allocate / reclaim USD 配额。子区在 balance 页查看 **本工作区专属配额**。充值与 Credits 口径见 [商用计费](../../commercial-billing/)。  
> **工程**：`BalanceView.vue` · `AccountQuotaPool.vue` · `AllocateQuotaModal.vue` · `RechargeModal.vue` · API `/v1/credits` · `/v1/credits/quota/allocate` · `/v1/credits/quota/reclaim`  
> **域地图** → [身份与组织 · 总览](./index) · 能力域 **A + F**

---

## 1. 用户问题与边界

**问题**：采购/财务要把 **预算分到部门或项目**（子工作区），避免一个团队耗尽全公司余额却不可见。

**本能力是什么**：顶级 **池化余额 + 向子区分配专属配额 + 修改/收回**。

**不是什么**：运营侧对账调账（→ [operations/billing](../../operations/billing)）；完整后付费账单生命周期（部分在 [billing 页](#账单) P1）。

---

## 2. 功能范围

| 视图 | 顶级工作区 | 子工作区 |
|------|------------|----------|
| 账户可用余额 | ✅ | — |
| 充值（Stripe 等） | ✅ | — |
| 子工作区配额池表格 | ✅ | — |
| 分配 / 修改 / 收回配额 | ✅ | — |
| 本工作区专属配额 | — | ✅ |

---

## 3. 业务规则（草案 · 与线上一致）

| 规则 | 说明 |
|------|------|
| **分配** | 从顶级 **可分配余额** 划入子区；POST allocate |
| **收回** | 从子区未用配额划回顶级；POST reclaim |
| **扣费** | API 调用按 Key 所在工作区扣 **专属配额** 或顶级余额（以实现为准，三处与 [commercial-billing](../../commercial-billing/) 对齐） |
| **计量单位** | USD / Credits；对外 docs · 控制台 · 运营 **同口径** |

---

## 4. 交互路径

```text
顶级 /account/workspace/{top}/balance
  → 查看可分配余额 · 子区配额表
  → 分配配额 → 选子工作区 · 填金额 → 确认
子区 /account/workspace/{sub}/balance
  → 查看「本工作区专属配额」
  → 顶级可「修改配额」「收回」
```

---

## 5. 验收

- 顶级分配 $N 到子区后，子区 balance 显示专属配额 $N。  
- 收回后子区配额减少、顶级可分配池增加。  
- 充值成功后顶级可用余额与控制台展示一致（与 docs 口径一致）。

E2E 参考：`TrinityAI-web/apps/web/tests/e2e/account/enterprise.spec.ts`。

---

## 附录

### 账单

顶级工作区 `/account/workspace/{top}/billing` · 账单明细 · 6.30 商用对账；子区无此菜单。

### 修订

| 日期 | 说明 |
|------|------|
| 2026-07-06 | 初版 L2：子区配额 allocate/reclaim |
