---
title: 总览
---

# Trinity 产品手册

## 前言

本手册是 Trinity **唯一的产品导航与阶段真相入口**（与对外开发者文档 `trinity-docs`、客户 API 文档分离）。产品经理、研发、测试与对内宣讲，优先从这里对齐 **有什么、本阶段验什么、做到哪了、去哪看原型与 PRD**。

::: tip 一条主线（阅读）
看清产品地图 → 锁定阶段（Roadmap）→ 拆到可验收（子能力）→ 一键跳到 PRD 与原型（交付包）→ 走查与 Bug 去飞书。
:::

> **管理闭环（维护时按序）**  
> 1. **规划**：产品地图（业务线 → 产品总览 → 子总览）定模块；叶子 **`roadmap.yml`** 定子清单。  
> 2. **节点**：5.30 / 6.30 列定本阶段验收范围（锁节点见 [更新规范](./产品手册更新规范)）。  
> 3. **实施**：子能力对应 PRD + 原型 + 工程路径（附录链出，不写进正文）。  
> 4. **进度**：子清单看 `roadmap`；模块汇总看子总览 / 产品总览；**本周**只看产品总览 **`week-progress.yml`**（不逐条改子能力）。  
> 5. **验收**：节点列 ✅ + 叶子附录链飞书表；走查与 Bug 在 [5.30 产品测试体验 / Bug 表](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)，手册不抄表。  
> **周会**：`roadmap.yml` → `week-progress.yml` → 子总览对齐（[更新规范 §七](./产品手册更新规范)）。

## 与 Scrum 术语对照

团队若使用 Scrum / Jira 沟通，可按下表把 **Scrum 说法** 对应到本手册字段（**维护真源仍在本站**，不另建 `docs/05/roadmap` 摘抄表）。

| Scrum 说法 | trinity-product 说法 |
|------------|----------------------|
| Product Backlog | 各叶子 **`roadmap.yml`** + 产品/子总览 **模块树** + 长需求 [`docs/05-产品与PRD/`](../../../docs/05-产品与PRD/)（附录链出，不贴全文） |
| Sprint Backlog | **`week-progress.yml`**（当周 `plan` / `focus` / `result`） |
| Epic | **子总览**模块，或用户 / 平台 / 运营 **分层** |
| Story | `roadmap.yml` 中一行 **`features[].name`** |
| Task | 手册 **不单列**；研发在工程侧自建任务；进度看 **原型 / 后端** 列 |
| Sprint Goal | 本周 **`plan`** + **`acceptance`**；可选 **`months[].goal`** |
| Release Goal | 产品总览 **5.30 / 6.30 能力主链** + 节点列（5.30 / 6.30） |
| Refinement（梳理） | **有交付**才改 `roadmap.yml`；平时细化叶子与 PRD（见 [更新规范](./产品手册更新规范)） |
| Definition of Done | `acceptance` + 符号 ✅ + [飞书验收表](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（手册不抄 Bug 表） |

::: info
本对照便于对外沟通；**不要求**在手册中改用 Epic/Story 命名。双周迭代与按周 `week-progress` 的差异由团队自行约定。
:::

<div class="product-handbook-cap-wrap">

| 能力 | 做什么 | 不做什么 | 备注 |
|------|--------|----------|------|
| **产品地图** | 业务线、模块树、分层与对标（如 OpenRouter） | 接口字段、实现细节 | 入口见下「业务线」；展开见各线 **产品总览** 与侧栏<br>与对外 `trinity-docs` 分离 |
| **Roadmap / 里程碑** | 5.30、6.30 等阶段目标与模块进度 | 排期、工时、负责人 | **唯一真源**：产品总览 / 子总览 + 叶子 **`roadmap.yml`**（✅ 🟡 ⬜）<br>汇报与周会只维护本站，见 [AI API 聚合产品 · 总览](./ai-api-platform/) 周计划看板 |
| **周进度（周会）** | 产品总览 **`week-progress.yml`**（**重点模块** 标签可点进各层 **子页面** · 计划 · 结果 · 阻塞） | 子能力逐条周状态 · 叶子 `roadmap` | [AI API 聚合产品 · 总览](./ai-api-platform/) · `<ProductWeekProgress />`；`focus` 见 [更新规范 §四](./产品手册更新规范.md) |
| **子能力 + 验收** | 拆条、门禁口径（原型 / 交付 / 节点验收） | 逐步走查步骤、Bug 台账 | 标准叶子：`*.roadmap.yml` + `<ProductRoadmap />`（localhost 可编辑）；样板 [`user/models/list`](./ai-api-platform/user/models/list) |
| **PRD / 原型索引** | 各页链 PRD、原型与工程目录 | 替代 PRD 全文 | ≈ 闭环 · **实施**；链放子模块 **附录**，体验/在线仅在 **产品总览** 四行 |
| **宣讲与导出** | 浏览器阅读、打印 PDF、按模块导出 | 客户-facing API 说明 | 非源码模式阅读<br>`npm run dev:trinity-product` → [127.0.0.1:5206/product/](http://127.0.0.1:5206/product/) |

</div>

## 业务线

| 业务 | 说明 | 入口 |
|------|------|------|
| **AI 云** | 多云营销站 + 企业用户控制台 | [产品总览](./ai-cloud/) |
| **AI API 聚合产品** | 对标 OpenRouter 的统一 API + 运营后台（B2B） | [产品总览](./ai-api-platform/) |
