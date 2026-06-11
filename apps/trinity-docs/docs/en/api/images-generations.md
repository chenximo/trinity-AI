# Create image generation

Send a text prompt to an image generation model and generate image outputs. Use this endpoint for text-to-image, image generation with references, and responses that include both text and images.

Trinity image generation uses `POST /chat/completions`. Declare image output with `modalities`, and use `image_config` for aspect ratio, output format, reference images, and related options.

::: warning vs image input
- **Image understanding**: pass a `type: image_url` Part in `messages[].content`—see [Image input](../multimodal/image-input.md).
- **Image generation** (this page): set `modalities` to include `image`, and optionally pass `image_config`.
:::

---

## Endpoint

| Method | URL |
| --- | --- |
| `POST` | `{TRINITY_BASE_URL}/chat/completions` |

---

## Authentication

**Authorization** · Bearer — same as [Create chat completion](./chat-completions.md).

---

## Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | Yes | `Bearer <TRINITY_API_KEY>` |
| `Content-Type` | Yes | `application/json` |

Tracing and settlement (`X-Request-Id`, `X-Idempotency-Key`, `X-Conversation-Id`) are documented in [API overview · Tracing and settlement](./overview.md#tracing-and-settlement-headers).

---

## Minimal request

```bash
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "hunyuan-image",
    "messages": [{ "role": "user", "content": "Cyberpunk futuristic city at night" }],
    "modalities": ["image", "text"]
  }'
```

---

## Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Image model ID from [List models](./models.md) (`modality=image`) or the [model catalog](https://trinity.ai/models) |
| `messages` | array | Yes | Usually a `user` text prompt |
| `modalities` | array | Recommended | Include `image`; include `text` as well when text explanation is needed |
| `stream` | boolean | No | Image generation does not support `true`; omit it or set `false` |
| `image_config` | object | No | Aspect ratio, output format, reference images, etc. |

All `image_config` fields: [Image generation · Advanced parameters](./image-generation-parameters.md). Full usage: [Image generation guide](../multimodal/image-generation.md).

---

## Response

Success returns OpenAI-style JSON. Generated images are usually in `choices[0].message.images`; the response may include `trinity_task.task_id` (e.g. `imgtsk_xxx`) and `usage.image_count`. Use the actual model response as the source of truth.

Image generation is a **synchronous long-running** request (typically 10–300 seconds). On `408 generation_timeout`, query by `trinity_task.task_id` (see below).

---

## Query after timeout

| Method | URL |
| --- | --- |
| `GET` | `{TRINITY_BASE_URL}/image/tasks/{taskId}` |

`taskId` is `trinity_task.task_id` from the create or timeout response. See [Advanced parameters · Image generation](./image-generation-parameters.md#query-after-timeout).

```bash
curl -sS "${TRINITY_BASE_URL}/image/tasks/imgtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## SDK examples

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
        "messages": [{"role": "user", "content": "Cyberpunk futuristic city at night"}],
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
    messages: [{ role: "user", content: "Cyberpunk futuristic city at night" }],
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
    "messages": [{ "role": "user", "content": "Cyberpunk futuristic city at night" }],
    "modalities": ["image", "text"],
    "image_config": { "aspect_ratio": "1:1", "output_format": "url" }
  }'
```

:::

---

## Related

- [List models](./models.md) (`modality=image`)
- [Image generation guide](../multimodal/image-generation.md)
- [Image generation · Advanced parameters](./image-generation-parameters.md)
- [Image input](../multimodal/image-input.md)
- [Create chat completion](./chat-completions.md)
