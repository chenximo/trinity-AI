---
title: 模型详情
---

# 模型广场 · 详情页

> **说明**：从 [列表](./list) 进入的单模型页（对标 [OpenRouter 单模型页](https://openrouter.ai/) **轻量一屏**）：能否用、定价、上下文、试玩与 API 文档闭环。**6.30 商用最小集**；Providers / Performance 全 Tab **不做**。  
> **工程**：规划 `apps/trinity-ai/src/views/models/detail/`（五件套）· 路由 `/models/:modelId` · 列表域 `../`  
> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../../) · [模型域总览](./index)

---

## 1. 用户问题与边界

**问题**：用户在列表看到模型名后，需要 **一屏内** 确认：能不能用、多少钱、上下文多大、怎么试、怎么调 API。

**本页是什么**：model id 的 **决策页 + 行动页**（试玩 / 文档 / Key）。

**不是什么**：

- 不是 OpenRouter 式多 Tab 深度分析（P2）
- 不是运营编辑页
- 不允许与列表/catalog **不同的 mock 定价**

---

## 2. 用户故事

作为 **开发者**，我希望打开某模型的详情页看到刊例价与能力摘要，并一键试玩或打开 API 文档，以便决定是否接入。

---

## 3. 功能范围（6.30 最小集 vs 后期）

| 区块 | 6.30 | 后期 |
|------|:----:|------|
| 概览（名 / id / 描述 / 模态） | ✅ | — |
| 刊例价（入/出或按模态 unit 价） | ✅ | 多档分辨率展开 |
| 上下文长度 | ✅ | — |
| 404 / 未上架空态 | ✅ | — |
| 试玩 → Chat（预填 model） | ✅ | — |
| API 文档链出（trinity-docs） | ✅ | — |
| 支持参数摘要 | 🟡 P1 | 完整参数表 |
| 控制台创建 Key | 🟡 | — |
| Providers / Performance / Compare | — | P2 |

---

## 4. 页面区块（自上而下）

| 区块 | 内容 | 数据来源 |
|------|------|----------|
| **D1 顶栏** | 返回广场 · 面包屑 | 路由 |
| **D2 标题区** | 展示名 · `model` id · 提供商 | `GET /v1/models` |
| **D3 描述** | 一两段能力说明 | catalog |
| **D4 模态标签** | 文本 / 图像 / 视频… | catalog |
| **D5 定价** | 刊例摘要；多档模型链 prices 或展开 | `GET /v1/prices` |
| **D6 上下文** | max context | catalog |
| **D7 空态** | 未上架 / 不存在 → 404 友好页 | 在架状态 |
| **D8 行动** | 「试玩」→ Chat · 「查看 API」→ docs | 路由 + 锚点 |
| **D9 文档链** | 指向该 model 的 Quickstart / 模态文档 | trinity-docs |
| **D10 Key**（可选） | 无 Key 时引导控制台 | account |

---

## 5. 交互路径

```text
/models → 点击卡片 → /models/:modelId
  → 试玩 → /chat?model={id}
  → API 文档 → /docs/…#{model}
  → 创建 Key → /account/console
  → 返回 → /models
```

---

## 6. 异常

| 场景 | 行为 |
|------|------|
| id 不存在 | 404 + 回列表 |
| 已下架 | 不可用说明（不展示价/试玩） |
| prices 缺失 | 展示「定价待配置」+ 链运营（内部） |

---

## 7. 验收（6.30）

- slug 与列表、网关、`POST /v1/chat/completions` 的 `model` **完全一致**。  
- 在架模型：概览 + 价 + 上下文 + 试玩 + 文档链 **五链可达**。  
- 下架/不存在：**不出现** 详情 mock 价。

飞书走查：筛 **模型详情页**。

---

## 附录

### 关联

| 模块 | 关系 |
|------|------|
| [列表](./list) | 唯一入口 |
| [Chat](../chat-experience) | 试玩 |
| [开发者文档](../developer-docs) | API |
| [运营上架](../../operations/models-routes) | 在架 / slug |

### L3 · 子能力进度（可选）

<details>
<summary>展开 · 历史 roadmap 表</summary>

<ProductRoadmap rel="ai-api-platform/user/models/detail-roadmap.yml" />

</details>

### 修订

| 日期 | 说明 |
|------|------|
| 2026-07-06 | L2 规格：D1–D10 区块；roadmap 降为附录 |
| 2026-06-02 | 从 PRD 页收回为标准叶子 |
| 2026-05-26 | 首版需求 |
