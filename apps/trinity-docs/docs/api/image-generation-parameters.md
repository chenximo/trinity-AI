# 图像生成 · 高级参数

本文档供**调参、联调、对字段**使用。端点速览见 [创建图像生成](./images-generations.md)；概念与示例见 [图片生成](../multimodal/image-generation.md)。

---

## 顶层请求体字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 生图模型 ID；须在 [模型广场](https://trinity.ai/models) 选择支持图像输出的模型 |
| `messages` | array | 是 | 提示词与可选参考图；至少 1 条；无参考图时须能从 `user` 消息提取非空 prompt |
| `messages[].role` | string | 否 | 生图场景通常仅 `user` |
| `messages[].content` | string or array | 是 | string：纯文本 prompt；array：可含 `text` / `image_url` Part |
| `modalities` | array | 建议 | 须含 `image`；可含 `text` |
| `stream` | boolean | 否 | **必须为 `false` 或省略**；`true` 报 `invalid_request` |
| `image_config` | object | 否 | 生图公共参数，见下节 |
| `model_specific_config` | object | 否 | 供应商专有参数，见 [model_specific_config](#model_specific_config)；未知键忽略 |
| `trinity_async` | object | 否 | **当前不支持**；传入报 `invalid_request` |

---

## `image_config`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `image_size` | string | 分辨率档位，如 `1K` / `2K` / `4K`、`1080p` 等；枚举因模型而异 |
| `aspect_ratio` | string | 宽高比，如 `1:1`、`16:9`、`9:16`；**部分模型（如 Hunyuan 3.0、Qwen 0925、SI 系列）不支持**，须用 `custom_size` |
| `output_format` | string | 对外交付形态：`url`（默认）/ `base64`（data URL） |
| `output_image_format` | string | 输出文件格式：`png` / `jpeg` |
| `person_generation` | string | 人物/人脸策略：`allow_adult` / `disallowed` |
| `input_compliance_check` | boolean | 输入合规检查，默认 `true` |
| `output_compliance_check` | boolean | 输出合规检查，默认 `true` |
| `custom_size` | string | 自定义像素尺寸，如 `1024x1024`；**Hunyuan / Qwen / SI 等依赖此字段** |
| `sequential_image_generation` | boolean or string | 多图顺序生成，如 `false` 或 `"auto"`；仅部分模型支持 |
| `reference_images` | array | 参考图列表，见 [reference_images](#reference_images) |
| `output_image_count` | integer | 输出张数；仅部分模型支持（如 1–8）；未传时默认 **1** |

### `aspect_ratio` 常用值

`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`4:5`、`5:4`、`21:9` — 是否生效以模型能力为准。

::: warning
`trinity_async.*` 生图当前不支持，传入会 `invalid_request`。
:::

---

## `model_specific_config` {#model_specific_config}

供应商专有参数统一放此对象，**不要**与 `image_config` 混用。仅当前模型白名单键生效，未知键忽略。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `negative_prompt` | string | 负向提示词 |
| `enhance_prompt` | boolean or string | 自动优化 prompt：`true`/`Enabled` 开启 |
| `scene_type` | string | 场景扩展（按模型，如 `3d_panorama`、`image_expand`） |
| `seed` | integer | 随机种子，用于复现 |
| `session_id` | string | 上游去重 ID，≤50 字符 |
| `session_context` | string | 透传上下文，≤1000 字符 |
| `tasks_priority` | integer | 任务优先级 `-10` ~ `10`，默认 `0` |
| `input_region` | string | 输入区域：`Mainland` / `Oversea` / `OverseaUSWest` |

---

## `reference_images` {#reference_images}

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 是 | 当前仅支持 `url` |
| `url` | string | 是 | 可公网访问的图片 URL；推荐单图 **< 7MB** |
| `text` | string | 否 | 参考图语义说明 |

支持格式：`jpeg` / `jpg` / `png` / `webp`。

### 各模型参考图张数上限（节选）

| 模型系列 | 上限 |
| --- | --- |
| GG-2.5 | 3 |
| GG-3.0 / GG-3.1 | 14 |
| Kling-2.1 | 4 |
| Kling-3.0 | 1 |
| Kling-3.0-omni / Kling-O1 | 10 |
| SI-4.0 / SI-4.5 / SI-5.0-lite | 14 |
| Vidu-q2 | 7 |
| Hunyuan-3.0 | 3 |
| Qwen-0925 | 1 |
| MJ-v7 | 3 |

完整上限以 [模型广场](https://trinity.ai/models) 中该模型说明为准。

### `messages[].content` 中的 `image_url`（可选）

与 [图片输入](../multimodal/image-input.md) Part 结构相同，可作为参考图补充：

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "保持角色服装主色调" },
    { "type": "image_url", "image_url": { "url": "https://example.com/ref.png" } }
  ]
}
```

---

## 超时后查询任务

同步等待超时（默认 300s，返回 `408 generation_timeout`）后，可用任务 ID 继续查询；成功终态时仍会交付图片并结算。

| 项 | 值 |
| --- | --- |
| 方法 | `GET` |
| 路径 | `/image/tasks/{taskId}` |
| `taskId` | 创建/超时响应中 `trinity_task.task_id`（形如 `imgtsk_xxx`） |

```bash
curl -sS "${TRINITY_BASE_URL}/image/tasks/imgtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## 成功响应示例

```json
{
  "id": "chatcmpl-imgtsk_xxx",
  "object": "chat.completion",
  "model": "GG-2.5",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "",
        "images": [
          {
            "type": "image_url",
            "image_url": { "url": "https://..." }
          }
        ]
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0,
    "image_count": 1
  },
  "trinity_task": {
    "task_id": "imgtsk_xxx",
    "mode": "sync",
    "status": "succeeded"
  }
}
```

响应头回写 `X-Request-Id`、`X-Settlement-Key` 等，见 [API 概述](./overview.md#追踪与结算请求头)。

---

## 与生文传图的区别

| 能力 | 传图方式 | 输出 |
| --- | --- | --- |
| 生文看图 | `messages[].content[]` · `type: image_url` → [图片输入](../multimodal/image-input.md) | 文本 |
| 生图参考图 | `image_config.reference_images[]` 或 `messages` 中的 `image_url` | `choices[].message.images[]` |

---

## 完整 JSON 示例（创建）

```json
{
  "model": "GG-2.5",
  "messages": [
    { "role": "user", "content": "赛博朋克城市夜景，霓虹倒影，电影光效" }
  ],
  "modalities": ["image", "text"],
  "stream": false,
  "image_config": {
    "image_size": "1K",
    "aspect_ratio": "16:9",
    "output_format": "url",
    "output_image_format": "png",
    "person_generation": "allow_adult",
    "reference_images": [
      {
        "type": "url",
        "url": "https://example.com/ref-building.png",
        "text": "保留主建筑轮廓，不改变几何结构"
      }
    ]
  },
  "model_specific_config": {
    "negative_prompt": "低清晰度, 模糊, 变形",
    "enhance_prompt": true,
    "seed": 123456
  }
}
```

---

## 相关

- [图片生成](../multimodal/image-generation.md)
- [创建图像生成](./images-generations.md)
- [错误与调试](../reference/error-codes.md)
