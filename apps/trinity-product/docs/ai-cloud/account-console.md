---
title: 用户控制台
---

# 用户控制台

> **说明**：注册/登录后的 **企业自助台**：查看多云子账号、费用、发票与联系顾问；四面板通过 hash 切换（`#accounts` · `#billing` · `#invoices` · `#contact`）。用户控制台范围已在 **5.30** 全部完成并落锁，**6.30** 为 `-`。  
> **工程**：`apps/ai-cloud/src/views/account/`（五件套：`ConsolePage.vue` · `account.css` · `accountInteractions.ts` · `mock.ts` · `README.md`）· 路由 `account/console`  
> **体验 / 在线**：见 [AI 云 · 总览](./)（产品总览）

## 子能力清单

<ProductRoadmap rel="ai-cloud/roadmap.yml" prefix="用户控制台" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **用户控制台** / AI 云）。子能力进度以 `ai-cloud/roadmap.yml` 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [营销首页](./marketing-home) | 顶栏登录 · `#consult` 预约 |
| AI API 聚合 `@account` | DOM/CSS 母版，业务字段不同 |

### PRD 与规范

- 需求：`docs/03-用户控制台系统/AI云-用户控制台系统-需求理解.md` §5.x
- 视觉：`trinity-user-console` · `/user-console-spec`

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-01 | 去掉附录「面板与 hash」；hash 在说明与子能力表已覆盖 |
| 2026-06-01 | 说明并入页头 blockquote，与 AI 云产品总览一致 |
| 2026-06-01 | 对齐子模块四段式；PRD 移入附录 |
