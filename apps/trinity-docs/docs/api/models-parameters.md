# 获取模型 · 高级参数

本文档供**联调、对字段**使用。端点速览与可复制示例见 [获取模型](./models.md)。

---

## 查询参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `modality` | string | 否 | 按模态筛选；省略时等价于 `text` |

### `modality` 取值

| 取值 | 行为 |
| --- | --- |
| 省略 / `text` | 生文类模型（含多模态生文） |
| `image` | 生图模型 |
| `video` | 生视频模型 |
| `all` | 全部已上架模态 |

未识别的 `modality` 值通常不会报错，但会返回空列表 `data: []`。

### 请求示例

```bash
curl -sS "${TRINITY_BASE_URL}/models?modality=all" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## 响应顶层

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `object` | string | 固定为 `"list"` |
| `data` | array | 模型对象数组，按平台排序；无可用模型时为 `[]` |

---

## `data[]` 单条模型

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 逻辑模型编码；作为下游请求的 `model` |
| `object` | string | 固定为 `"model"` |
| `created` | integer | Unix 时间戳（秒） |
| `owned_by` | string | 供应商标识 |
| `metadata` | object \| null | 按模态透出的展示价与能力摘要；见下节 |

::: info
本接口仅透出 **metadata 白名单字段**。展示名、完整参数 schema、参考图上限等请以 [模型广场](https://trinity.ai/models) 或各能力**高级参数**页为准。
:::

---

## `metadata`（按模态）

### 生文 / 多模态（`modality` 省略或 `text`）

| 字段 | 类型 | 必有 | 说明 |
| --- | --- | --- | --- |
| `context_length` | integer | 通常有 | 上下文长度（token） |
| `max_token` | integer | 可选 | 单次最大输出 token |
| `user_input_price_per_million_usd` | number | 通常有 | 输入 token 展示价（USD / 百万 token） |
| `user_output_price_per_million_usd` | number | 通常有 | 输出 token 展示价（USD / 百万 token） |

### 生图（`modality=image`）

| 字段 | 类型 | 必有 | 说明 |
| --- | --- | --- | --- |
| `metered_charge_unit` | string | 是 | 固定为 `image_count`（按张计费） |
| `min_user_unit_price_usd` | number | 通常有 | 单张最低展示价（USD） |

### 生视频（`modality=video`）

| 字段 | 类型 | 必有 | 说明 |
| --- | --- | --- | --- |
| `metered_charge_unit` | string | 是 | 计费单位，常见：`video_second`、`video_token`、`video_task` |
| `min_user_unit_price_usd` | number | 通常有 | 最低展示单价（USD；含义随 `metered_charge_unit` 而定） |

---

## 响应示例

### 生文（默认 / `modality=text`）

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-5.5",
      "object": "model",
      "created": 1700000000,
      "owned_by": "trinity",
      "metadata": {
        "context_length": 128000,
        "max_token": 8192,
        "user_input_price_per_million_usd": 0.15,
        "user_output_price_per_million_usd": 0.60
      }
    }
  ]
}
```

### 生图（`modality=image`）

```json
{
  "object": "list",
  "data": [
    {
      "id": "hunyuan-image",
      "object": "model",
      "created": 1700000100,
      "owned_by": "trinity",
      "metadata": {
        "metered_charge_unit": "image_count",
        "min_user_unit_price_usd": 0.042
      }
    }
  ]
}
```

### 生视频（`modality=video`）

```json
{
  "object": "list",
  "data": [
    {
      "id": "kling-2.6",
      "object": "model",
      "created": 1700000200,
      "owned_by": "trinity",
      "metadata": {
        "metered_charge_unit": "video_second",
        "min_user_unit_price_usd": 0.08
      }
    }
  ]
}
```

### 空列表

当前 Key 无对应模态可用模型，或 `modality` 无法匹配时：

```json
{
  "object": "list",
  "data": []
}
```

---

## 与下游接口

| 模态 | 列表 `id` 用于 | 参数说明 |
| --- | --- | --- |
| 生文 | `POST /chat/completions` → `model` | [对话补全 · 高级参数](./chat-completions-parameters.md) |
| 生图 | `POST /chat/completions` → `model` + `modalities` / `image_config` | [图像生成 · 高级参数](./image-generation-parameters.md) |
| 生视频 | `POST /video/generations` → `model` | [视频生成 · 高级参数](./video-generation-parameters.md) |

---

## 相关

- [获取模型](./models.md)
- [API 概述](./overview.md)
- [请求参数](../guides/request-parameters.md)
