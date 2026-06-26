---
title: 产品迭代版本
---

# 产品迭代版本

> **说明**：每周发布后对客 / 对内可感知的**已上线变更**（Changelog）。与 [产品总览 · 周计划](./#周计划与验收看板) 区分：周计划写「本周计划与验收」，本页写「这一版实际发布了什么」。

::: tip 维护规则
真源 **`ai-api-platform/release-notes.yml`**。每周发布后在 `releases` **顶部**（YAML 文件中最上方）新增一条；`version` 建议用发布日期 `YYYY.MM.DD`，`week` 与周计划 `Wxx` 对齐。localhost 可点「编辑迭代版本」改 YAML。
:::

<ProductReleaseNotes rel="ai-api-platform/release-notes.yml" />

## 和周计划怎么配合

| 文档 | 写什么 | 何时更新 |
|------|--------|----------|
| [周计划](./#周计划与验收看板) `week-progress-index.yml` + `week-progress-N.yml` | 本周 focus、plan、验收口径、result | 周会 |
| **本页** `release-notes.yml` | 已部署能力、文档、对客户可见的变更 | **每次发布 / 上线后** |
| [产品待办池](./#产品待办池) `product-backlog.yml` | 尚未排期的发现项 | 随时，排期后迁入周计划 |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-22 | 首版：Changelog 页 + `release-notes.yml` + 组件 |
