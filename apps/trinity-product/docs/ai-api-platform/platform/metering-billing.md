---
title: 计量与计费
---

# 计量与计费

> **说明**：Usage · Credits；`usage_event` 与用户控制台、运营计费联动。

> **工程**：网关计量 · `admin-billing/`（五件套）· 用户面 `views/account/` 用量面板

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（控制台 `#logs` / `#activity`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/platform/metering-billing.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **计量与计费** / 平台侧）。子能力进度与节点列以 **`metering-billing.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [商用计费与充值](../commercial-billing/) | 计费模式 · 充值 · 6.30 商用范围真源 |
| [用户控制台](../user/account-console) | 用量展示 |
| [生文 API](./chat-completions) | 触发计量 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套（文档规范 §5.1） |
| 2026-06-02 | 子能力迁入 `roadmap.yml`；本页只嵌 `<ProductRoadmap />` |
