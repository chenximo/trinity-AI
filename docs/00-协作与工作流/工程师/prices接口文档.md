# GET /v1/prices 接口文档

> **用途**：查询**已上架模型**的**用户价目表**（平台向用户收取的价格）。  
> **数据源**：`model_metered_price_policy` 模型级价策（`supply_route_id IS NULL`）。  
> **与扣费一致**：价目投影与 `ModelMeteredPricingResolver` 识别规则同构；展示价 = 用户实扣单价投影。  
> **设计原文**：[价格接口设计.md](../../docs/迭代设计/V1.1/代码详细设计相关/价格接口设计.md)

---

## 1. 基本信息

| 项 | 说明 |
|---|---|
| Base URL（正式） | `https://api.trinitydesk.ai` |
| 方法 | `GET` |
| 路径 | `/v1/prices` |
| 鉴权 | `Authorization: Bearer xh-<your_api_key>`（与 `GET /v1/models` 一致） |
| 响应格式 | JSON（无 `ApiEnvelope` 包装） |
| 模型范围 | 仅**已上架、可路由**模型；与 `GET /v1/models` 列表一致 |

### 1.1 请求头

| 请求头 | 必填 | 说明 |
|---|---|---|
| `Authorization` | 是 | `Bearer xh-...` 平台 API Key；控制台 JWT 亦可（见 §3.5 折扣价） |
| `Accept` | 否 | `application/json` |

---

## 2. 查询参数

| 参数 | 必填 | 类型 | 默认值 | 说明 |
|---|---|---|---|---|
| `model` | 否 | string | — | 逻辑模型编码，与 `GET /v1/models` 的 `data[].id`、推理请求体 `model` 一致。**省略时返回全量列表** |
| `modality` | 否 | string | 全量 | 模态过滤：`text` \| `image` \| `video` \| `all`。同名 `model_code` 跨模态共存时，单模型查询建议带上 |
| `locale` | 否 | string | `zh` | 展示文案语言：`zh` \| `en`；影响 `label`、`display`、`range.display` 等 |

### 2.1 三种调用模式

```bash
# A. 全量列表（所有已上架且有价目的模型）
curl -sS "https://api.trinitydesk.ai/v1/prices" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"

# B. 按模态过滤列表
curl -sS "https://api.trinitydesk.ai/v1/prices?modality=text" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"

# C. 单模型完整价目
curl -sS "https://api.trinitydesk.ai/v1/prices?model=demo-text-001" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"

curl -sS "https://api.trinitydesk.ai/v1/prices?model=demo-video-001&modality=video&locale=en" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"
```

### 2.2 参数组合规则

| 场景 | 行为 |
|---|---|
| 无 `model` | 返回 `{ "object": "list", "data": [ ... ] }` |
| 有 `model` | 返回单个 `{ "object": "model_prices", ... }` |
| `model` 为空字符串 | `400 invalid_model_code` |
| 不存在的 `model` | `404 model_not_found` |
| 存在但无价目 | `404 pricing_not_configured` |

---

## 3. 响应结构

### 3.1 两种 envelope

**列表响应**（省略 `model` 参数）：

```json
{
  "object": "list",
  "data": [
    { "object": "model_prices", "model": "glm-5", "...": "..." },
    { "object": "model_prices", "model": "seedance-1.0-pro", "...": "..." }
  ]
}
```

`data[]` 中每一项结构与单模型响应完全相同；条目数与 `GET /v1/models?modality=all` 中有价目的模型数一致。

**单模型响应**（指定 `model` 参数）：

```json
{
  "object": "model_prices",
  "model": "glm-5",
  "display_name": "GLM-5",
  "modality_type": "text",
  "charge_unit": "token",
  "pricing_mode": "usage_token_range",
  "currency": "USD",
  "price_unit": "per_million_tokens",
  "price_groups": [],
  "updated_at": "2026-06-12T08:00:00Z"
}
```

### 3.2 顶层字段（`model_prices` 对象）

| 字段 | 类型 | 说明 |
|---|---|---|
| `object` | string | 固定 `model_prices`（列表 wrapper 为 `list`） |
| `model` | string | 模型编码 |
| `display_name` | string | 模型展示名称 |
| `modality_type` | string | 模态：`text` \| `multimodal` \| `image` \| `video` |
| `charge_unit` | string | 计费量纲，见 §3.3 |
| `pricing_mode` | string | 计价模式，决定如何解析 `price_groups`，见 §3.4 |
| `currency` | string | 固定 `USD` |
| `price_unit` | string | 单价语义，见 §3.5 |
| `price_groups` | array | 可读价目分组，见 §4 |
| `updated_at` | string | 该模型 active 价目最近 `effective_from`（ISO-8601 UTC） |

### 3.3 `modality_type` × `charge_unit`

| `modality_type` | 典型 `charge_unit` | 业务含义 |
|---|---|---|
| `text` | `token` | 纯生文 |
| `multimodal` | `token` | 多模态（仍按 token 计） |
| `image` | `image_count` | 生图，按张 |
| `video` | `video_second` | 生视频，按秒 |
| `video` | `video_token` | 生视频，按 video token |

### 3.4 `pricing_mode` 取值

| 取值 | 适用模态 | 含义 | 对应 `price_groups` 结构 |
|---|---|---|---|
| `legacy` | 生文 | 标准双价/三价/四价，无分段 | 1 组 `type=default` |
| `context_length_range` | 生文 | 按**上下文长度**（prompt 侧）分段 | 多组 `type=token_kind`，含 `ranges[]` |
| `usage_token_range` | 生文 | 按**总 token**（input+output 合计）分段进档 | 多组 `type=token_kind`，含 `ranges[]` |
| `input_output_matrix` | 生文 | 输入区间 × 输出区间联合矩阵 | 1 组 `type=input_output_matrix`，含 `tiers[]` |
| `flat` | 生图/生视频 | 单一单价，无条件 | 1 组 `type=dimension_set` 等，`prices.unit` |
| `image_tiered` | 生图 | 按分辨率等条件分档 | 多组 `type=resolution_tier` 等 |
| `video_tiered` | 生视频 | 按分辨率/有声无声等分档 | 多组 `type=resolution_tier` / `has_audio` 等 |

**解析建议**：先读 `pricing_mode`，再选 §4 对应模板解析 `price_groups`。

### 3.5 `price_unit` 取值

| 取值 | 对应 `charge_unit` | 含义 |
|---|---|---|
| `per_million_tokens` | `token` | 每百万 token（USD） |
| `per_image` | `image_count` | 每张图（USD） |
| `per_second` | `video_second` | 每秒（USD） |
| `per_million_video_tokens` | `video_token` | 每百万 video token（USD） |

### 3.6 `PriceAmount` 对象

所有单价（`prices.*`、`ranges[].price`、`tiers[].prices.*`）共用此结构：

| 字段 | 类型 | 说明 |
|---|---|---|
| `amount` | string | 用户单价数值（USD）；通常 6 位小数，可去尾零 |
| `currency` | string | 固定 `USD` |
| `unit` | string | 与顶层 `price_unit` 或 token 种类对应 |
| `display` | string | **客户端优先展示此字段**；已格式化的可读单价 |

**JWT 登录且账号有模型折扣时**（API Key 无此字段），`PriceAmount` 额外包含：

| 字段 | 说明 |
|---|---|
| `list_amount` | 折扣前单价 |
| `list_display` | 折扣前展示文案 |
| `discount_factor` | 折扣系数，如 `"0.7500"` |
| `discount_label` | 如 `7.5折` |
| `amount` | **折后**单价（`list_amount × discount_factor`） |
| `display` | **折后**展示文案 |

未配置折扣或系数为 1.0 时：不返回 `list_*` / `discount_*` 字段。

---

## 4. `price_groups[]` 分组

每个分组描述「在什么条件下，多少钱」。同一 `type` 可出现多次（如多个分辨率档）；用 `label` + `conditions_summary` 区分。

### 4.1 分组公共字段

| 字段 | 类型 | 何时出现 | 说明 |
|---|---|---|---|
| `type` | string | 始终 | 分组类型，见 §4.2 |
| `label` | string | 始终 | 分组标题（已本地化） |
| `token_kind` | string | `type=token_kind` | 本组 token 种类：`input` \| `cached_input` \| `output` |
| `conditions_summary` | string | 生图/生视频 | 一行条件摘要，如 `1080p · 有声` |
| `conditions` | object | 生图/生视频 | 结构化条件键值，见 §4.4 |
| `prices` | object | 多种 | 单价集合，见 §4.3 |
| `ranges` | array | `type=token_kind` | 按 token 区间分档，见 §4.5 |
| `tiers` | array | `type=input_output_matrix` | 输入×输出联合档位，见 §4.6 |

### 4.2 `type` 分组类型

| `type` | 适用 `pricing_mode` | 结构要点 |
|---|---|---|
| `default` | `legacy` | `prices` 含 `input`、可选 `cache`/`cache_creation`、`output` |
| `token_kind` | `context_length_range`、`usage_token_range` | 含 `token_kind` + `ranges[]` |
| `input_output_matrix` | `input_output_matrix` | 含 `tiers[]` |
| `resolution_tier` | `image_tiered`、`video_tiered` | `conditions` + `prices.unit` |
| `has_audio` | `video_tiered` | 有声/无声等业务语义分组 |
| `dimension_set` | `flat`、`video_tiered` 等 | 其它多维条件组合 |
| `flat` | `flat` | 无条件单价（部分模型用 `dimension_set` 代替） |

### 4.3 `prices` 对象键

| 键 | 出现场景 | 说明 |
|---|---|---|
| `input` | 生文 | 普通输入 token 单价 |
| `cache` | 生文（有缓存读价时） | 缓存**读取** token 单价（DB 中 `cached_input`） |
| `cache_creation` | 生文（Claude 等，V1.6+） | 缓存**创建** token 单价 |
| `output` | 生文 | 输出 token 单价 |
| `unit` | 生图/生视频 | 该条件下的单位单价 |

**缺失规则**：

- 无缓存读价 → **不返回** `cache` 键（不是 `null`）
- 无缓存创建价 → **不返回** `cache_creation` 键
- 生文 `legacy` 模式：`input` 和 `output` 缺一不可，否则整接口 `404 pricing_not_configured`

### 4.4 `conditions` 常见键（生图/生视频）

| 键 | 示例值 | 含义 |
|---|---|---|
| `resolution_tier` | `"1k"`, `"2k"`, `"1080p"` | 分辨率档位 |
| `resolution` | `"720p"`, `"1080p"` | 精确分辨率 |
| `audio_generation` | `"enabled"`, `"disabled"` | 是否生成音频 |
| `generation_mode` | `"text_to_video"`, `"image_to_video"` | 生成模式 |
| `pricing_tier` | `"2k"` | 定价档标识 |
| `variant` | `"-"` | 变体标识 |

> 原始 DB 字段 `conditions_json` **不对外暴露**；仅投影为 `conditions` + `conditions_summary`。

### 4.5 `ranges[]` 元素（`type=token_kind`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `range` | object | 区间描述，见 §4.7 |
| `price` | object | 该区间对应的 `PriceAmount` |

**区间语义**：

- `context_length_range`：按 prompt/上下文长度命中档位
- `usage_token_range`：按 `prompt_tokens + completion_tokens` **合计**命中**单一档位**，再分别取 input/cache/output 价（三组 `ranges` 边界一致、仅 `amount` 不同；**不是** input/output 各自独立进档）

**排序**：`ranges` 按 `range.min` 升序。

### 4.6 `tiers[]` 元素（`type=input_output_matrix`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `tier_id` | string | 稳定档位 ID |
| `label` | string | 档位标题 |
| `input_range` | object | 输入 token 区间，见 §4.7 |
| `output_range` | object | 输出 token 区间；`any: true` 表示输出长度不限 |
| `prices` | object | 该档位下 `input` / `cache` / `output` 单价 |

### 4.7 `range` 对象（token 区间）

| 字段 | 类型 | 说明 |
|---|---|---|
| `min` | integer | 区间下界（含） |
| `max` | integer \| 缺失 | 区间上界（含）；**缺失/null = 无上界** |
| `display` | string | 区间完整描述 |
| `display_short` | string | 区间短描述 |
| `any` | boolean | `true` 表示该维度不限 |

**格式化规则**（服务端生成）：

| 条件 | `display` 示例 |
|---|---|
| `min=0`，`max` 有值 | `0 – 128K tokens` / `display_short`: `≤ 128K` |
| `min>0`，`max` 有值 | `32K – 200K tokens` |
| `max` 缺省 / null | `> 128K tokens` |

---

## 5. 响应示例

### 5.1 全量列表

```json
{
  "object": "list",
  "data": [
    {
      "object": "model_prices",
      "model": "glm-5",
      "display_name": "GLM-5",
      "modality_type": "text",
      "charge_unit": "token",
      "pricing_mode": "usage_token_range",
      "currency": "USD",
      "price_unit": "per_million_tokens",
      "price_groups": [],
      "updated_at": "2026-06-12T08:00:00Z"
    }
  ]
}
```

### 5.2 生文标准计价（`pricing_mode=legacy`）

```json
{
  "object": "model_prices",
  "model": "demo-text-001",
  "display_name": "Demo Text 001",
  "modality_type": "text",
  "charge_unit": "token",
  "pricing_mode": "legacy",
  "currency": "USD",
  "price_unit": "per_million_tokens",
  "price_groups": [
    {
      "type": "default",
      "label": "标准计价",
      "prices": {
        "input": {
          "amount": "3",
          "currency": "USD",
          "unit": "per_million_tokens",
          "display": "$3.00 / 1M input tokens"
        },
        "cache": {
          "amount": "0.75",
          "currency": "USD",
          "unit": "per_million_tokens",
          "display": "$0.75 / 1M cached input tokens"
        },
        "output": {
          "amount": "15",
          "currency": "USD",
          "unit": "per_million_tokens",
          "display": "$15.00 / 1M output tokens"
        }
      }
    }
  ],
  "updated_at": "2026-03-15T08:00:00Z"
}
```

### 5.3 Claude 四价（`legacy` + `cache_creation`）

```json
{
  "object": "model_prices",
  "model": "claude-opus-4-6",
  "pricing_mode": "legacy",
  "price_groups": [{
    "type": "default",
    "label": "标准计价",
    "prices": {
      "input":          { "amount": "5",    "unit": "per_million_tokens" },
      "cache":          { "amount": "0.5",  "unit": "per_million_tokens" },
      "cache_creation": { "amount": "6.25", "unit": "per_million_tokens" },
      "output":         { "amount": "25",   "unit": "per_million_tokens" }
    }
  }]
}
```

### 5.4 生文按上下文分段（`context_length_range`）

```json
{
  "object": "model_prices",
  "model": "demo-range-001",
  "pricing_mode": "context_length_range",
  "price_groups": [
    {
      "type": "token_kind",
      "label": "输入 token · 按上下文长度",
      "token_kind": "input",
      "ranges": [
        {
          "range": { "min": 0, "max": 128000, "display": "0 – 128K tokens", "display_short": "≤ 128K" },
          "price": { "amount": "1.25", "currency": "USD", "unit": "per_million_tokens", "display": "$1.25 / 1M input tokens" }
        },
        {
          "range": { "min": 128001, "display": "> 128K tokens", "display_short": "> 128K" },
          "price": { "amount": "2.5", "currency": "USD", "unit": "per_million_tokens", "display": "$2.50 / 1M input tokens" }
        }
      ]
    }
  ]
}
```

### 5.5 生图按分辨率（`image_tiered`）

```json
{
  "object": "model_prices",
  "model": "demo-image-001",
  "modality_type": "image",
  "charge_unit": "image_count",
  "pricing_mode": "image_tiered",
  "price_unit": "per_image",
  "price_groups": [{
    "type": "resolution_tier",
    "label": "2K 分辨率",
    "conditions_summary": "2K",
    "conditions": { "resolution_tier": "2k" },
    "prices": {
      "unit": { "amount": "0.0525", "currency": "USD", "unit": "per_image", "display": "$0.05 / 张" }
    }
  }]
}
```

### 5.6 生视频按条件（`video_tiered` + `has_audio`）

```json
{
  "object": "model_prices",
  "model": "demo-video-001",
  "modality_type": "video",
  "charge_unit": "video_second",
  "pricing_mode": "video_tiered",
  "price_unit": "per_second",
  "price_groups": [
    {
      "type": "has_audio",
      "label": "含音频",
      "conditions_summary": "1080p · 有声",
      "conditions": {
        "resolution_tier": "1080p",
        "audio_generation": "enabled"
      },
      "prices": {
        "unit": { "amount": "0.077", "currency": "USD", "unit": "per_second", "display": "$0.08 / 秒" }
      }
    }
  ]
}
```

### 5.7 生视频单一单价（`flat`）

```json
{
  "object": "model_prices",
  "model": "seedance-1.0-pro",
  "modality_type": "video",
  "charge_unit": "video_token",
  "pricing_mode": "flat",
  "price_unit": "per_million_video_tokens",
  "price_groups": [{
    "type": "dimension_set",
    "label": "标准计价",
    "prices": {
      "unit": { "amount": "2.068966", "currency": "USD", "unit": "per_million_video_tokens", "display": "$2.07 / 百万 video tokens" }
    }
  }]
}
```

---

## 6. 按 `pricing_mode` 的消费逻辑（程序化解析）

```
IF pricing_mode == "legacy":
  READ price_groups[0].prices.input / .cache / .cache_creation / .output

ELIF pricing_mode IN ("context_length_range", "usage_token_range"):
  FOR EACH group IN price_groups WHERE group.type == "token_kind":
    token_kind = group.token_kind
    FOR EACH range IN group.ranges:
      IF token_count IN range.range: USE range.price.amount

ELIF pricing_mode == "input_output_matrix":
  FOR EACH tier IN price_groups[0].tiers:
    IF input_tokens IN tier.input_range AND output_tokens IN tier.output_range:
      USE tier.prices.input / .cache / .output

ELIF pricing_mode == "flat":
  READ price_groups[0].prices.unit.amount

ELIF pricing_mode IN ("image_tiered", "video_tiered"):
  FOR EACH group IN price_groups:
    IF request_conditions MATCH group.conditions:
      USE group.prices.unit.amount
```

---

## 7. 错误响应

错误体结构：

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "<error_code>",
    "message": "<description>"
  }
}
```

| HTTP 状态码 | `error.code` | 说明 |
|---|---|---|
| 400 | `invalid_model_code` | 指定了 `model` 但为空或非法 |
| 404 | `model_not_found` | 模型未上架或不可路由 |
| 404 | `pricing_not_configured` | 模型可路由但未配置用户价目，或生文缺 input/output |

### 7.1 错误示例

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "model_not_found",
    "message": "Model 'unknown-model' not found or not routable."
  }
}
```

---

## 8. 不返回的内容

| 字段/概念 | 说明 |
|---|---|
| `official_unit_price_usd` | 官方价，仅 Admin 可见 |
| `cost_unit_price_usd` | 线路成本价，仅 Admin / 内部 detect |
| `provider_id` | 供应商 ID |
| `conditions_json` 原始结构 | 仅投影为 `conditions` / `ranges` / `tiers` |
| `supply_route_id` | 线路维度；对外价目读**模型级**价策 |

---

## 9. 与相关接口的关系

| 接口 | 关系 |
|---|---|
| `GET /v1/models` | 模型发现；`data[].id` = 本接口 `model`；metadata 仅有**摘要价**，非完整价表 |
| `GET /v1/models?modality=all` | 获取全部已上架模型 ID 列表 |
| `POST /v1/prices/detect` | 内部探针，校验价目命中（需专用 Key `X-Xinghan-Price-Probe-Key`，非用户 API Key） |
| `GET /v1/admin/models/{id}/metered-price-policies` | Admin 内部，含官方价/成本价 |

---

## 10. 集成检查清单

- [ ] 列表模式：`object == "list"` → 遍历 `data[]`
- [ ] 单模型模式：`object == "model_prices"` → 直接解析
- [ ] 先读 `pricing_mode`，再选 §6 模板
- [ ] 金额字段均为 **string**，需按 decimal 解析
- [ ] 展示给用户优先用 `display`，计算用 `amount`
- [ ] `usage_token_range` 是**合计进档**，不是 input/output 各自进档
- [ ] 生图/生视频：用 `conditions` 匹配请求参数，取 `prices.unit`
- [ ] Claude 模型检查是否有 `cache_creation` 第四价
- [ ] 同名 model 跨模态时加 `modality` 参数
