---
title: 文档与支持
---

# 文档与支持 · 总览

> **能力域 I**：客户 **如何发现、集成、排错** Trinity API——对外 **`trinity-docs`** 为正文真源；本手册描述 **产品边界、信息架构、主路径与验收**。  
> **工程**：`apps/trinity-docs/`（VitePress · `docs/**/*.md`）· 用户站顶栏链文档站  
> **业务上下文** → [业务全景 · 集成与调用 §4.3](../../business-overview#43-集成与调用客户系统真正用起来)

---

## 页面树（产品视角）

```text
用户站顶栏「文档」→ trinity-docs（/docs/）
├── 文档轨     Quickstart · 指南 · 多模态 · 参考 · FAQ
├── API 轨     概述 · chat/image/video 短页 · 高级参数
└── 应用场景   Cookbook（Cursor · Codex · …）

本手册
└── [对外文档站 · 产品规格](../developer-docs)   ← L2 主文档
```

| 主题 | 手册 L2 | 对外正文真源 |
|------|---------|--------------|
| **对外文档站（产品规格）** | [developer-docs.md](../developer-docs) | `apps/trinity-docs/docs/` |
| 法务 / FAQ 口径 | 链 [legal](../../../legal/) · docs `/faq` | [页面清单](../../../legal/pages-and-content) |

---

## 与能力域的关系

| 域 | 关系 |
|:--:|------|
| **A · C** | Quickstart 前置：[创建 API Key](../identity-org/api-keys) |
| **D** | 文档示例 `model` = [模型广场](../models/) · 网关 id |
| **E** | 文档描述 [platform/](../../platform/) 已开放端点 |
| **H** | [Chat](../chat-experience) 试玩 vs 文档集成 |
| **运营** | [docs-publish](../../operations/docs-publish) 发布与校验 |

---

## 主路径（5.30 成败线）

```text
模型广场选 model id
  → 控制台创建 Key
  → trinity-docs /quickstart
  → POST /v1/chat/completions 成功
  → （可选）/reference/error-codes · /guides/billing-and-credits
```

**铁律**：对外 docs · 控制台文案 · 运营刊例 **三处口径一致**（见 [商用计费](../../commercial-billing/)）。

---

## 范围：P0 / P1 / P2

| 优先级 | 文档与支持 |
|:------:|------------|
| **P0** | 三轨 IA · Quickstart · manage-api-keys · chat-completions API 短页 · 错误码 |
| **P0** | 模型 id 与广场一致 · 示例 model 须在架 |
| **P1** | 多模态指南全文 · Cookbook 扩充 · 英文站除 quickstart 外翻译 |
| **P2** | API Reference Try it · `GET /v1/models` 对外文档（接口开放后） |

---

## 关联

| 模块 | 关系 |
|------|------|
| [能力地图 · I 域](../../capability-map) | 三面落点 |
| [developer-docs](../developer-docs) | **L2 规格（本域样本）** |
| [operations/docs-publish](../../operations/docs-publish) | 运营发布 |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | 初版：I 域 L1；developer-docs 为 L2 样本 |
