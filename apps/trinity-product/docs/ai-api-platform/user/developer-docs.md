---
title: 开发者文档
---

# 开发者文档

> **说明**：对外 HTTP API 文档；**内容真源** 在 `apps/trinity-docs/docs/`，本页只做产品盘点与进度。顶栏三轨：**文档**（快速入门/指南/参考）+ **API**（端点字段）+ **应用场景 / Cookbook**（编程工具接入）。子能力清单与 [一期 MVP 文档清单](../../../../docs/04-工程与迁移/Trinity文档站-一期MVP文档清单.md) 对齐，缺项以 YAML 行为准。

> **工程**：`apps/trinity-docs/docs/`（VitePress 内容真源；非 `trinity-ai` 业务 views 五件套）· 用户站 `/docs` → 外链文档站

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（文档站 `http://127.0.0.1:5205/docs/`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/user/developer-docs.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **开发者文档** / 用户面）。子能力进度与节点列以 **`developer-docs.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联

| 模块 | 关系 |
|------|------|
| [Chat 在线体验](./chat-experience) | 试用 vs 集成 |
| [用户控制台](./account-console) | Key 创建后调 API |
| 平台侧 · 统一 API / 生文 | Quickstart 依赖 |
| Cookbook · 编程工具 | 对外 `trinity-docs` `/cookbook/coding-agents/*`；配置步骤不复述 `API对外接口支持参数.md` 全表 |

### PRD / 规范

- 工程内容真源：`apps/trinity-docs/`
- 参数契约（研发）：`docs/00-协作与工作流/工程师/API对外接口支持参数.md`
- 对外文档站维护规范：`docs/04-工程与迁移/Trinity对外文档站-基本规范.md`（§1 OpenRouter 对齐 + 工程师 API 参数 review）
- 文档站 IA（顶栏 / 三轨目录）：`docs/04-工程与迁移/Trinity文档站-信息架构与顶栏设计.md`
- 一期页面清单与验收闭环：`docs/04-工程与迁移/Trinity文档站-一期MVP文档清单.md`

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-03 | 基本规范 §1：OR 结构 + 工程师 API 参数 review 流程写入维护规范 |
| 2026-06-03 | 对齐 OR：API 短页 + API 轨高级参数；未开放能力仅 roadmap |
| 2026-06-03 | roadmap 补全文档站页面/双语/多模态占位/GET models/发布校验等子项 |
| 2026-06-03 | roadmap 增补 Cookbook · 编程工具子项 |
| 2026-06-02 | 对齐标准叶子五件套 |
| 2026-06-02 | 子能力迁入 `roadmap.yml`；本页只嵌 `<ProductRoadmap />` |
| 2026-05-26 | 首版 |
