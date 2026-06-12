---
title: Trinity Skill · 模型列表与详情 API（附录）
---

# Trinity Skill · 模型列表与详情 API（附录）

> 说明 `/trinity models` 与 `/trinity model <id>` 应对接哪些 API。落地方案优先级见 [主方案 · P0/P1](./new-api-skill#5-可落地执行方案分优先级)。

## 1. 三种「模型信息」

| 层级 | 内容 | Skill 是否暴露 |
|------|------|----------------|
| 调用标识 | 模型 ID（`model` 字段） | ✅ `models` |
| 产品详情 | 描述、价格、标签、多模态能力 | ✅ `model <id>`（P1） |
| 运营元数据 | 渠道绑定、上架规则 | ❌ 仅 Admin |

## 2. 列出模型 ID

### 方式 A：`GET /v1/models`（推荐 P0）

| 项 | 说明 |
|----|------|
| 鉴权 | `Authorization: Bearer xh-...` |
| 响应 | OpenAI 格式，`data[].id` |
| 优点 | 仅需 API Key，与 Cursor/SDK 一致 |
| 缺点 | OpenAI 标准仅 `id`；**Trinity 实测** `data[]` 含 `metadata`（价、描述、`modality_type` 等） |

```bash
curl -sS "${TRINITY_BASE_URL}/models" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

### 方式 B：`GET /api/user/models`（推荐 P2 起，对标友商）

| 项 | 说明 |
|----|------|
| 鉴权 | 访问令牌 + 用户标识 |
| 响应 | `{ "success": true, "data": ["gpt-5.5", ...] }` |
| 优点 | 与 newapi Skill `models` 指令一致 |
| 缺点 | 需管理 API |

友商执行链：`node scripts/api.js GET /api/user/models` → AI 格式化为表格。

## 3. 单模型详情（`/trinity model <id>`）

### Trinity 实测（2026-06-12 · Skill dogfood）

| 接口 | 结果 | 说明 |
|------|------|------|
| `GET /v1/models` | ✅ 200 | 14 条；当前 Key 下 `metadata.modality_type` 均为 `text` |
| `GET /v1/models/{id}` | ❌ **401** | 例：`GET /v1/models/gpt-5.5`（同 Key 下列表正常） |

**产品待办**（已记入聚合总览 [产品待办池](../#产品待办池) · `product-backlog.yml`）：

- 确认单模型路径鉴权/路由是否与 OpenAI 对齐，或是否应弃用单模型、统一走列表过滤。
- Skill P1 暂**不依赖** `GET /v1/models/{id}`；详情从列表 `metadata` 过滤，或与 `GET /api/pricing` 同源（待 P1 后端）。

### New API 参考（开源行为）

单路径通常仅有 `id`、`owned_by`、`supported_endpoint_types`，**无价格与业务描述**。

### 推荐组合（P1 · Trinity 调整）

| 步骤 | 接口 | 作用 |
|------|------|------|
| 1（主） | `GET /v1/models` | 在 `data[]` 中按 `id` 过滤，读 `metadata`（价、描述、模态） |
| 2（待办修复后可选） | `GET /v1/models/{id}` | 校验存在性（当前 401，见上表） |
| 3（备选） | `GET /api/pricing` | 与广场同源时按 `model_name` 过滤 |
| 4 | `help` + 文档站 | 流式、生图、生视频调用方式 |

### pricing 单条关键字段（New API 同源参考）

| 字段 | 用途 |
|------|------|
| `model_name` | 与请求 `model` 一致 |
| `description` / `tags` / `icon` | 广场展示 |
| `model_ratio` / `model_price` / `billing_mode` | 计费 |
| `supported_endpoint_types` | chat / image / video |
| `enable_groups` | 可见分组 |

Trinity 需保证：**模型广场展示与 pricing API 同一数据源**（P1 后端任务）。

## 4. Skill 文档应写明的执行步骤（`docs/actions-model.md`）

```markdown
## Action: `model <model_id>`

1. GET /v1/models/{model_id}（Bearer TRINITY_API_KEY）— 不存在则提示先 /trinity models
2. GET /api/pricing — 过滤 model_name
3. 展示：描述、计费、端点、分组
4. 按端点类型链 doc.trinitydesk.ai（chat / 图像 / 视频）
```

## 5. 接口能力对照表

| 需求 | 接口 | Phase |
|------|------|-------|
| 列 ID | `GET /v1/models` | P0 |
| 列 ID（管理） | `GET /api/user/models` | P2 |
| 存在性 | `GET /v1/models/{id}` | 待办（当前 401）；或列表过滤 `id` |
| 价格/描述/能力 | `GET /api/pricing` 过滤 | P1 |
| 怎么调 API | `help` → doc.trinitydesk.ai | P0 |

## 6. 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 自 MODEL_INFO_IMPLEMENTATION 调研稿迁入产品手册 |
| 2026-06-12 | Trinity dogfood：列表含 metadata；`GET /v1/models/{id}` 401 → 记入 developer-docs / detail roadmap 待办 |
