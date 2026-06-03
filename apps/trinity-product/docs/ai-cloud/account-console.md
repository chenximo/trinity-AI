---
title: 用户控制台
---

# 用户控制台

> **说明**：注册/登录后的 **企业自助台**：查看多云子账号、费用、发票与联系顾问；四面板通过 hash 切换（`#accounts` · `#billing` · `#invoices` · `#contact`）。用户控制台范围已在 **5.30** 全部完成并落锁，**6.30** 为 `-`。  
> **工程**：`apps/ai-cloud/src/views/account/ConsolePage.vue` · 路由 `account/console`  
> **体验 / 在线**：见 [AI 云 · 总览](./)（产品总览）

## 子能力清单

<ProductRoadmap rel="ai-cloud/roadmap.yml" prefix="用户控制台" />

## 附录

### 关联

| 模块 | 关系 |
|------|------|
| [营销首页](./marketing-home) | 顶栏登录 · `#consult` 预约 |
| AI API 聚合 `@account` | DOM/CSS 母版，业务字段不同 |

### PRD 与规范

- 需求：`docs/03-用户控制台系统/AI云-用户控制台系统-需求理解.md` §5.x
- 视觉：`trinity-user-console` · `/user-console-spec`

### 变更记录

| 日期 | 说明 |
|------|------|
| 2026-06-01 | 去掉附录「面板与 hash」；hash 在说明与子能力表已覆盖 |
| 2026-06-01 | 说明并入页头 blockquote，与 AI 云产品总览一致 |
| 2026-06-01 | 对齐子模块四段式；PRD 移入附录 |
