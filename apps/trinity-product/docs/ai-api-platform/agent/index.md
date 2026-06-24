---
title: Agent · 总览
---

# Agent · 总览（二期 · 规划期）

> **定位**：在 **AI API 聚合一期**（统一网关 · 鉴权 · 计量 · 控制台）之上，规划「智能体开发 & 运行」能力。  
> **状态**：战略与设计讨论稿，**未统一立项**。  
> **一期底座**：[平台侧 · 生文 API](../platform/chat-completions) · [统一 API](../platform/unified-api) · [开发者文档](../user/developer-docs)

---

## 文档树

```
Agent（二期 · 规划期）
  ├── 总览                    ← 本页
  ├── 战略与架构（L0）         → 为什么做、分层架构、Phase、边界
  ├── Agent SDK · P0 设计（L2） → callModel / tools · 对标 OpenRouter
  ├── 预研
  │   ├── 落地报告             → 垂直选型 · 双线验证 · 落地节奏（Executive）
  │   └── 跨境投放             → 投放 Dogfood 切片详述
  └── 附录 · 行业背景          → 2026 市场与出海语境（非决策真源）
```

| 层级 | 文档 | 真源优先级 |
|:----:|------|:----------:|
| **L0** | [战略与架构](./positioning-and-architecture) | ★ 战略 / 架构 / IA / Phase |
| **L2** | [Agent SDK · P0 设计](./agent-sdk-product-design) | ★ P0 技术验收 |
| 预研 | [落地报告](./agent-landing-report) · [跨境投放](./preresearch-cross-border-ads-agent) | 方向与试刀场景 |
| 附录 | [行业背景](./industry-cross-border) | 市场输入，立项前参考 |

**阅读顺序**：L0 → 预研落地报告 → L2 SDK → 按需读附录 / 跨境投放详述。

---

## 与一期的关系

| 概念 | 一期（当前交付） | 二期 · Agent（本目录） |
|------|------------------|------------------------|
| 核心 | 多模型 API 聚合、Key、计量 | Agent SDK +（规划）Web 孵化器 |
| 手册入口 | user / platform / operations | 本目录 |
| 对外文档 | `trinity-docs` Quickstart · Cookbook | Agent SDK **尚未**写入 docs（见 SDK 设计 §对外节奏） |
| Cookbook 相关 | IDE 配 Base URL · Skill | [开发者文档 · 智能体工作台（二期）](../user/developer-docs)（Workbench 接入，≠ Agent SDK 本体） |

Phase 节奏（摘要）：**P0** SDK 循环 · **P1** 记忆 · **P2** 工作流 + Web MVP · **P3** 企业管控。详 [战略与架构 · 阶段节奏](./positioning-and-architecture#阶段节奏)。

---

## 已有能力（一期底座）

| 能力 | 入口 |
|------|------|
| REST · `tools` / 流式 | [平台侧 · 生文 API](../platform/chat-completions) |
| IDE 里配 Base URL | [trinity-docs Cookbook](http://127.0.0.1:5205/docs/cookbook/) |
| IDE Skill | `apps/trinity-skills` · [友商 Skill 对标](../competitor-research/new-api-skill) |

一期周计划见 [产品总览](../#周计划与验收看板)；Agent 尚未纳入 `week-progress` / 待办池。

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-08 | 侧栏按 L0 / L2 / 预研 / 附录分层；标「二期 · 规划期」 |
| 2026-06-22 | 增 Agent 项目落地报告 |
| 2026-06-22 | 定位与架构合并为单页 |
