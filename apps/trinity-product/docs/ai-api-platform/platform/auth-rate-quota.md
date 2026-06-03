---
title: 鉴权 · 限流 · 配额
---

# 鉴权 · 限流 · 配额

> **说明**：API Key 鉴权、限流与配额；控制台 Key 与网关须同一套数据。

> **工程**：网关中间件 · `apps/trinity-ai-admin/src/views/admin-risk/`（五件套：`RiskPage.vue` · `risk.css` · `riskInteractions.ts` · `mock.ts` · `README.md`）· 运营 `/risk/rules`

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（Doc `/manage-api-keys`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/platform/auth-rate-quota.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **配额** / 平台侧）。子能力进度与节点列以 **`auth-rate-quota.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [用户控制台](../user/account-console) | 发 Key |
| [生文 API](./chat-completions) | 调用入口 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套（文档规范 §5.1） |
| 2026-06-02 | 子能力迁入 `roadmap.yml`；本页只嵌 `<ProductRoadmap />` |
