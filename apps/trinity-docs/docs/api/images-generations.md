# 创建图像生成

向生图模型发送文本提示词，生成图片结果。适用于文生图、带参考图的图生图，以及需要同时返回文本说明与图片的场景。

Trinity 的图片生成使用 `POST /chat/completions` 路径，通过 `modalities` 声明图片输出，并用 `image_config` 控制画幅、格式、参考图等参数。

::: warning 与图片输入区分
- **看图理解**：在 `messages[].content` 中传 `type: image_url` Part，见 [图片输入](../multimodal/image-input.md)。
- **生成图片**（本页）：设置 `modalities` 含 `image`，并按需传 `image_config`。
:::

---

## Endpoint

| Method | URL |
| --- | --- |
| `POST` | `{TRINITY_BASE_URL}/chat/completions` |

---

## Authentication

**Authorization** · Bearer — 同 [创建对话补全](./chat-completions.md)。

---

## Headers

| 请求头 | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 是 | `Bearer <TRINITY_API_KEY>` |
| `Content-Type` | 是 | `application/json` |

追踪与结算（`X-Request-Id`、`X-Idempotency-Key`、`X-Conversation-Id`）见 [API 概述 · 追踪与结算](./overview.md#追踪与结算请求头)。

---

## 最小请求示例

```bash
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "hunyuan-image",
    "messages": [{ "role": "user", "content": "赛博朋克风格未来城市夜景" }],
    "modalities": ["image", "text"]
  }'
```

---

## Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 生图模型 ID；见 [获取模型](./models.md)（`modality=image`）或 [模型广场](https://trinity.ai/models) |
| `messages` | array | 是 | 通常为 `user` 文本 prompt |
| `modalities` | array | 建议 | 包含 `image`；需要文本说明时可同时包含 `text` |
| `stream` | boolean | 否 | 生图不支持 `true`，请省略或设为 `false` |
| `image_config` | object | 否 | 宽高比、返回格式、参考图等 |

`image_config` 全字段见 [图像生成 · 高级参数](./image-generation-parameters.md)。完整用法见 [图片生成指南](../multimodal/image-generation.md)。

---

## Response

成功时返回 OpenAI 风格 JSON。生成图片通常位于 `choices[0].message.images`；响应可能含 `trinity_task.task_id`（形如 `imgtsk_xxx`）与 `usage.image_count`。具体字段以模型响应为准。

生图为**同步长耗时**请求（通常 10–300 秒）。若返回 `408 generation_timeout`，可用 `trinity_task.task_id` 查询任务状态（见下文）。

---

## 超时后查询任务

| Method | URL |
| --- | --- |
| `GET` | `{TRINITY_BASE_URL}/image/tasks/{taskId}` |

`taskId` 为创建或超时响应中的 `trinity_task.task_id`。字段说明见 [高级参数 · 生图](./image-generation-parameters.md#超时后查询任务)。

```bash
curl -sS "${TRINITY_BASE_URL}/image/tasks/imgtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## SDK 代码示例

::: code-group

```python [Python]
import json, os, requests

r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "hunyuan-image",
        "messages": [{"role": "user", "content": "赛博朋克风格未来城市夜景"}],
        "modalities": ["image", "text"],
        "image_config": {"aspect_ratio": "1:1", "output_format": "url"},
    }),
)
print(r.json())
```

```typescript [TypeScript (fetch)]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "hunyuan-image",
    messages: [{ role: "user", content: "赛博朋克风格未来城市夜景" }],
    modalities: ["image", "text"],
    image_config: { aspect_ratio: "1:1", output_format: "url" },
  }),
});
console.log(await res.json());
```

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "hunyuan-image",
    "messages": [{ "role": "user", "content": "赛博朋克风格未来城市夜景" }],
    "modalities": ["image", "text"],
    "image_config": { "aspect_ratio": "1:1", "output_format": "url" }
  }'
```

:::

---

## 相关

- [获取模型](./models.md)（`modality=image`）
- [图片生成（完整指南）](../multimodal/image-generation.md)
- [高级参数 · 生图](./image-generation-parameters.md)
- [图片输入](../multimodal/image-input.md)
- [创建对话补全](./chat-completions.md)
