---
title: 模型详情页 · 核心需求
---

# 模型详情页 · 核心需求

::: tip 文档定位
对标 [OpenRouter 单模型页](https://openrouter.ai/openai/gpt-5.5)（如 `openai/gpt-5.5`），定义 Trinity **6.30 商用最小集** 与 **后期增强** 边界。列表页见 [模型广场 · 列表](./list)；roadmap 摘抄见 `docs/05-产品与PRD/roadmap/用户面-03-模型广场.md`（C6）。
:::

## 1. 背景与目标

| 项 | 说明 |
|----|------|
| **用户价值** | 从模型广场进入单模型，确认「能否用、多少钱、上下文多大、怎么调 API、能否试玩」 |
| **业务目标** | 6.30 与列表、运营「模型上架」、网关 `model` id、开发者文档 **同一套数据** |
| **非目标（6.30）** | 不复刻 OpenRouter 全 Tab（多上游性能对比、Arena 榜单、Apps 排行、7 日实付曲线等） |

## 2. 对标页面结构（OpenRouter）

[GPT-5.5 详情](https://openrouter.ai/openai/gpt-5.5) 大致包含：

| 区块 | Trinity 6.30 | 后期 |
|------|:------------:|:----:|
| 概览：名称、slug、描述、模态、价、上下文、发布日 | ✅ | — |
| Compare / Playground 入口 | Playground→Chat ✅；Compare ⬜ | ✅ |
| Providers（多上游、分档价、Cache、Flex/Priority） | ⬜ | ✅ |
| Performance（吞吐/延迟/错误率） | ⬜ | ✅ |
| Effective Pricing（加权实付、7 日曲线） | ⬜ | ✅ |
| Benchmarks（Arena / Elo） | ⬜ | ✅ |
| Apps 使用该模型排行 | ⬜ | ✅ |
| Activity 日用量曲线 | ⬜ | ✅ |
| Uptime + Endpoints API | ⬜ | ✅ |
| API 示例（Key、stream、reasoning、多端点） | 链文档 ✅ | 页内实验室 ⬜ |
| 同厂商更多模型 | ⬜ | ✅ |

## 3. 路由与工程

| 项 | 约定 |
|----|------|
| **路由（建议）** | `/models/:modelId` · name `tai-model-detail`（`modelId` = 网关 slug，如 `openai/gpt-5.5`） |
| **工程目录** | `apps/trinity-ai/src/views/models/detail/`（子页面；列表仍在 `ModelsPage.vue`） |
| **入口** | 列表卡片点击标题/slug；详情顶栏「返回模型广场」 |
| **数据** | 与列表共用 catalog API（或同 mock 源）；**禁止**详情页单独写死一套字段 |

## 4. 6.30 商用 · 功能需求（P0 / P1）

### 4.1 页面信息（P0）

| ID | 需求 | 验收 |
|----|------|------|
| D1 | 展示 **显示名** + **`model` id**（可复制） | 与运营上架、文档 Quickstart 一致 |
| D2 | **产品描述**（1 段，支持 Markdown 或纯文本） | 与 catalog 字段一致 |
| D3 | **模态**：文本 / 图 / 音 / 视频等（图标或标签） | 与列表卡片一致 |
| D4 | **定价**：输入价、输出价（$/M 或产品约定单位） | 与列表、计费口径一致 |
| D5 | **上下文**：总上下文、最大输出（若有） | 数字与运营配置一致 |
| D6 | **发布日期** / **新模型** 标记（若有） | 支撑列表「按新排序」 |
| D7 | **404**：未上架或 slug 不存在 | 友好空态 + 回列表 |

### 4.2 闭环（P0）

| ID | 需求 | 验收 |
|----|------|------|
| D8 | **试玩**：跳转 Chat，并 **预填 `model`** | `C4` 商用 80% 目标 |
| D9 | **API 文档**：跳转 `trinity-docs` 该模型或 Chat Completions 锚点 | `C5` 商用 100% 目标 |
| D10 | **在控制台创建 Key**（可选 P1） | 链到 account `#keys`，未登录引导登录 |

### 4.3 能力摘要（P1）

| ID | 需求 | 验收 |
|----|------|------|
| D11 | **支持参数**摘要：stream、tools、reasoning、`response_format` 等 | 列表「支持 / 不支持」即可，不必 OR 级参数表 |
| D12 | **路由说明** 一句：经 Trinity 统一网关（v1 可不展示多上游切换） | 与平台侧「单线路」口径一致 |

### 4.4 依赖（平台 / 运营 · P0）

| 依赖 | 说明 |
|------|------|
| **C3 live 模型目录 API** | 详情与列表同接口或 `GET /models/:id` |
| **运营 · 模型上架** | slug、价、模态、上下架状态 |
| **平台 · 生文 API** | Chat 试玩、文档示例 model 可调通 |
| **鉴权** | 试玩/文档不要求详情页单独登录；调 API 按现有规则 |

## 5. 6.30 后 · 增强 backlog（不阻塞商用）

按优先级大致排序：

1. **Providers 矩阵**：多上游、分档价、Cache Read、Flex/Priority（依赖路由与计费）
2. **Performance / Uptime**：需可观测与多上游样本
3. **Effective Pricing 曲线**：需真实账单与缓存命中
4. **Compare**：多模型并排对比
5. **Benchmarks / Apps / Activity**：生态与运营叙事
6. **页内 API 实验室**：替代仅链出文档
7. **同厂商推荐**：`More models from {provider}`

## 6. 子能力清单（产品手册跟踪）

**5.30 验收** / **6.30 商用** / **当前已做**：✅ 🟡 ⬜

| 子能力 | 5.30 验收 | 6.30 商用 | 当前已做 | 说明 |
|--------|:---------:|:---------:|:--------:|------|
| 详情路由 `/models/:id` | ⬜ | 🟡 | ⬜ | C6 · 6.30 目标 50% |
| 概览区 D1–D7 | ⬜ | ✅ | ⬜ | 轻量一屏 |
| 试玩 / 文档闭环 D8–D9 | ⬜ | ✅ | ⬜ | |
| 支持参数摘要 D11 | ⬜ | 🟡 | ⬜ | |
| 控制台 Key 入口 D10 | ⬜ | 🟡 | ⬜ | 可 6.30 后 |
| Providers / Performance / Pricing 曲线 | ⬜ | ⬜ | ⬜ | 后期 |
| Benchmarks / Apps / Activity / Uptime | ⬜ | ⬜ | ⬜ | 后期 |
| Compare / 页内 API 实验室 | ⬜ | ⬜ | ⬜ | 后期 |

## 7. 验收（6.30 商用 · 草案）

- [ ] 从列表进入详情，slug 与网关、文档一致
- [ ] 价、模态、上下文与列表卡片无矛盾
- [ ] 「试玩」进入 Chat 且 model 已选中
- [ ] 「API 文档」到达正确文档锚点
- [ ] 未上架模型 404 可返回列表
- [ ] live 数据：运营改上架后详情同步（无 mock 分叉）

## 8. 修订

| 日期 | 说明 |
|------|------|
| 2026-06-01 | 首版：对标 OpenRouter GPT-5.5 页；6.30 / 后期拆分 |
