# GET /v1/models 接口文档

> 能力发现：在调用生文、生图、生视频接口前，拉取当前 API Key **可用**的已上架模型。列表中的 `id` 即后续请求体里的 `model` 字段。

---

## 1. 基本信息

| 项 | 说明 |
|---|---|
| 方法 | `GET` |
| 路径 | `/v1/models` |
| 鉴权 | `Authorization: Bearer xh-<your_api_key>` |
| 响应格式 | OpenAI 兼容 JSON（**无** `ApiEnvelope` 包装） |
| 数据来源 | 仅包含可实际路由的模型（已启用线路 + 有效平台 Key + 计量价满足上架规则） |

### 1.1 请求头

| 请求头 | 必填 | 说明 |
|---|---|---|
| `Authorization` | 是 | `Bearer xh-...` 平台 API Key |
| `Accept` | 否 | 建议 `application/json` |

---

## 2. 查询参数

| 参数 | 必填 | 类型 | 说明 |
|---|---|---|---|
| `modality` | 否 | string | 按模态筛选模型；省略时等价于 `text` |

### 2.1 `modality` 取值

| 取值 | 行为 |
|---|---|
| 省略 / `text` | 仅返回生文类模型（`modality_type` 为 `text` 或 `multimodal`） |
| `image` | 仅返回生图模型（`modality_type=image`） |
| `video` | 仅返回生视频模型（`modality_type=video`） |
| `all` | 返回全部已上架模态的模型 |

未识别的 `modality` 值不会报错，但通常匹配不到任何模型，返回空列表。

### 2.2 请求示例

```bash
# 生文模型（默认）
curl -sS "https://api.example.com/v1/models" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"

# 生图模型
curl -sS "https://api.example.com/v1/models?modality=image" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"

# 生视频模型
curl -sS "https://api.example.com/v1/models?modality=video" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"

# 全部模态
curl -sS "https://api.example.com/v1/models?modality=all" \
  -H "Authorization: Bearer xh-sk-demo-replace-me"
```

---

## 3. 响应结构

### 3.1 顶层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `object` | string | 固定为 `"list"` |
| `data` | array | 模型对象数组，按平台排序；无可用模型时为 `[]` |

### 3.2 `data[]` 单条模型

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 逻辑模型编码；作为 `POST /v1/chat/completions` 或 `POST /v1/video/generations` 的 `model` |
| `object` | string | 固定为 `"model"` |
| `created` | integer | Unix 时间戳（秒），模型上架/创建时间 |
| `owned_by` | string | 供应商标识（如 `demo-vendor`） |
| `metadata` | object \| null | 按模态透出的展示价与能力摘要；字段见 §4 |

---

## 4. `metadata` 字段（按模态）

对外 `GET /v1/models` 仅透出**白名单字段**；`display_name`、`modality_type`、`special_param_schema_json`、参考图上限等内部/工作台配置**不在此接口返回**。

### 4.1 生文 / 多模态（`modality` 省略或 `text`）

| 字段 | 类型 | 必有 | 说明 |
|---|---|---|---|
| `context_length` | integer | 通常有 | 上下文长度（token） |
| `max_token` | integer | 可选 | 单次最大输出 token（模型有配置时出现） |
| `user_input_price_per_million_usd` | number | 通常有 | 输入 token 用户展示价（USD / 百万 token） |
| `user_output_price_per_million_usd` | number | 通常有 | 输出 token 用户展示价（USD / 百万 token） |

### 4.2 生图（`modality=image`）

| 字段 | 类型 | 必有 | 说明 |
|---|---|---|---|
| `metered_charge_unit` | string | 是 | 固定为 `image_count`（按张计费） |
| `min_user_unit_price_usd` | number | 通常有 | 单张最低用户展示价（USD） |

### 4.3 生视频（`modality=video`）

| 字段 | 类型 | 必有 | 说明 |
|---|---|---|---|
| `metered_charge_unit` | string | 是 | 计费单位，常见：`video_second`、`video_token`、`video_task` |
| `min_user_unit_price_usd` | number | 通常有 | 当前模型最低用户展示单价（USD；含义随 `metered_charge_unit` 而定） |

---

## 5. 响应示例

### 5.1 生文（默认 / `modality=text`）

```json
{
  "object": "list",
  "data": [
    {
      "id": "demo-text-alpha",
      "object": "model",
      "created": 1700000000,
      "owned_by": "demo-vendor",
      "metadata": {
        "context_length": 128000,
        "max_token": 8192,
        "user_input_price_per_million_usd": 0.15,
        "user_output_price_per_million_usd": 0.60
      }
    },
    {
      "id": "demo-text-beta",
      "object": "model",
      "created": 1700000001,
      "owned_by": "example-provider",
      "metadata": {
        "context_length": 32000,
        "user_input_price_per_million_usd": 0.08,
        "user_output_price_per_million_usd": 0.24
      }
    }
  ]
}
```

### 5.2 生图（`modality=image`）

```json
{
  "object": "list",
  "data": [
    {
      "id": "demo-image-nano",
      "object": "model",
      "created": 1700000100,
      "owned_by": "demo-vendor",
      "metadata": {
        "metered_charge_unit": "image_count",
        "min_user_unit_price_usd": 0.042
      }
    },
    {
      "id": "demo-image-pro",
      "object": "model",
      "created": 1700000101,
      "owned_by": "demo-vendor",
      "metadata": {
        "metered_charge_unit": "image_count",
        "min_user_unit_price_usd": 0.138
      }
    }
  ]
}
```

### 5.3 生视频（`modality=video`）

```json
{
  "object": "list",
  "data": [
    {
      "id": "demo/vendor-motion-2.6",
      "object": "model",
      "created": 1700000200,
      "owned_by": "demo-vendor",
      "metadata": {
        "metered_charge_unit": "video_second",
        "min_user_unit_price_usd": 0.08
      }
    },
    {
      "id": "demo/vendor-cinema-token",
      "object": "model",
      "created": 1700000201,
      "owned_by": "example-provider",
      "metadata": {
        "metered_charge_unit": "video_token",
        "min_user_unit_price_usd": 0.0025
      }
    }
  ]
}
```

### 5.4 空列表

当前 Key 无对应模态可用模型，或 `modality` 无法匹配时：

```json
{
  "object": "list",
  "data": []
}
```

---

## 6. 与下游接口的对应关系

| 模态 | 列表 `id` 用于 | 参数说明来源 |
|---|---|---|
| 生文 | `POST /v1/chat/completions` → `model` | 生文参数表（`messages`、`temperature`、`tools` 等） |
| 生图 | `POST /v1/chat/completions` → `model`，且 `modalities` 含 `"image"` | `image_config` / 生图参数表 |
| 生视频 | `POST /v1/video/generations` → `model` | 生视频参数表（`duration_sec`、`resolution` 等） |

各模型可调参数、枚举取值以网关校验及参数文档为准；**本接口不提供**完整 `special_param_schema_json`。

---

## 7. 相关说明

| 项 | 说明 |
|---|---|
| 站内工作台 | 已登录 Web 生图/生视频页使用 `GET /v1/app/studio/models?modality=image\|video`（JWT），返回含 schema 的完整 metadata |
| 本地快照 | 见 [GET-v1-models 本地快照](../GET-v1-models/README.md) |
| 对外参数总表 | 见仓库 `docs/接口说明文档/API对外接口支持参数.md` §〇 |
