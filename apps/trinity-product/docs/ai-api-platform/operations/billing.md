---
title: 用量与计费
---

# 用量与计费

> **说明**：运营侧 Usage · Billing：七 Tab 原型（用量、扣费、调账等）；与用户控制台、平台计量联动。

> **工程**：`apps/trinity-ai-admin/src/views/admin-billing/`（五件套：`BillingPage.vue` · `billing.css` · `billingInteractions.ts` · `mock.ts` · `README.md`）· 路由 `/billing`

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（运营 `http://127.0.0.1:5204/billing`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/operations/billing.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **用量与计费** / 运营后台）。子能力进度与节点列以 **`billing.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [商用计费与充值](../commercial-billing/) | 付款方式 · 充值闭环 · 6.30 商用范围 |
| [全球化美金支付与 KYC](../commercial-billing/global-payment) | KYC 分层 · 对公 Wire · OFAC · 充值 UI |
| [平台侧 · 计量与计费](../platform/metering-billing) | 扣费真源 |
| [用户控制台](../user/account-console) | 用户余额与用量 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套 |
| 2026-05-26 | 接入 `billing.roadmap.yml` |
