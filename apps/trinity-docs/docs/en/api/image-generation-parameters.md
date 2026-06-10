# Image generation · Advanced parameters

Image generation uses **`POST /v1/chat/completions`**. Tracing and settlement headers (`X-Request-Id`, `X-Idempotency-Key`, `X-Conversation-Id`; `X-Session-Id` is an alias for `X-Conversation-Id`) are documented in [API overview · Tracing and settlement](./overview.md#tracing-and-settlement-headers). For concepts and examples, see [Image generation](../multimodal/image-generation.md); for the endpoint summary, see [Create image generation](./images-generations.md).

Image generation appears to callers as **a single synchronous HTTP request** (typically 10–300 seconds). If synchronous wait times out (`408 generation_timeout`), continue with `trinity_task.task_id` from the response (see [Query after timeout](#query-after-timeout) below).

---

## Call semantics

| Item | Behavior |
| --- | --- |
| Sync / async | Image generation is synchronous today: **`stream` must be `false` or omitted**; `trinity_async` returns `invalid_request` |
| Prompt source | Last `user` message in `messages`: use string directly; for Part arrays, concatenate `type=text` segments |
| Reference images | `image_config.reference_images[]` **takes priority**; `image_url` in `messages[].content[]` is also mapped as reference input; both may coexist |
| Validation | Supported `image_config` keys are validated per model capability; unsupported values return `400 invalid_request` |
| Delivery | Default is HTTPS URL after upload; storage failure may fall back to data URL per `output_format=base64` |
| Billing | Charged per image; token fields in `usage` are usually 0; idempotency via tracing/settlement headers |

---

## Top-level request body fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Image model ID from the [model catalog](https://trinity.ai/models) |
| `messages` | array | Yes | Prompt and optional reference images; at least one message; without references, a non-empty prompt must be extractable from `user` |
| `messages[].role` | string | No | Usually `user` for image generation |
| `messages[].content` | string or array | Yes | string: text prompt; array: may include `text` / `image_url` Parts |
| `modalities` | array | Recommended | Must include `image`; may include `text` |
| `stream` | boolean | No | **Must be `false` or omitted**; `true` returns `invalid_request` |
| `image_config` | object | No | Shared image parameters; see below |
| `model_specific_config` | object | No | Vendor-specific parameters; see [model_specific_config](#model-specific-config); unknown keys are ignored |
| `trinity_async` | object | No | **Not supported**; returns `invalid_request` |

---

## `image_config`

| Field | Type | Description |
| --- | --- | --- |
| `image_size` | string | Resolution tier, e.g. `1K` / `2K` / `4K`, `1080p`; enums vary by model |
| `aspect_ratio` | string | Aspect ratio such as `1:1`, `16:9`, `9:16`; **some models (e.g. Hunyuan 3.0, Qwen 0925, SI series) do not support this** — use `custom_size` |
| `output_format` | string | Delivery form: `url` (default) / `base64` (data URL) |
| `output_image_format` | string | File format: `png` / `jpeg` |
| `person_generation` | string | Person/face policy: `allow_adult` / `disallowed` |
| `input_compliance_check` | boolean | Input compliance check; default `true` |
| `output_compliance_check` | boolean | Output compliance check; default `true` |
| `custom_size` | string | Custom pixel size, e.g. `1024x1024`; **required for Hunyuan / Qwen / SI and similar models** |
| `sequential_image_generation` | boolean or string | Sequential multi-image generation, e.g. `false` or `"auto"`; model-dependent |
| `reference_images` | array | Reference image list; see [reference_images](#reference-images) |
| `output_image_count` | integer | Output count; supported on some models (e.g. 1–8); default **1** when omitted |

### Common `aspect_ratio` values

`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `4:5`, `5:4`, `21:9` — support depends on model capability.

::: warning
`trinity_async.*` is not supported for image generation; sending it returns `invalid_request`.
:::

---

## `model_specific_config` {#model-specific-config}

Put vendor-specific parameters in this object; **do not** mix them into `image_config`. Only allowlisted keys for the current model take effect; unknown keys are ignored.

| Field | Type | Description |
| --- | --- | --- |
| `negative_prompt` | string | Negative prompt |
| `enhance_prompt` | boolean or string | Auto prompt enhancement: `true` / `Enabled` to enable |
| `scene_type` | string | Scene extension per model (e.g. `3d_panorama`, `image_expand`) |
| `seed` | integer | Random seed for reproducibility |
| `session_id` | string | Upstream dedup ID, max 50 chars |
| `session_context` | string | Pass-through context, max 1000 chars |
| `tasks_priority` | integer | Task priority `-10` ~ `10`, default `0` |
| `input_region` | string | Input region: `Mainland` / `Oversea` / `OverseaUSWest` |

---

## `reference_images` {#reference-images}

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string | Yes | Currently only `url` |
| `url` | string | Yes | Publicly reachable image URL; recommend **< 7MB** per image |
| `text` | string | No | Semantic description of the reference |

Supported formats: `jpeg` / `jpg` / `png` / `webp`.

### Reference image count limits (selected models)

| Model family | Limit |
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

See the [model catalog](https://trinity.ai/models) for the full limit per model.

### Optional `image_url` in `messages[].content`

Same Part structure as [Image input](../multimodal/image-input.md); may supplement reference images:

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "Keep the main outfit color" },
    { "type": "image_url", "image_url": { "url": "https://example.com/ref.png" } }
  ]
}
```

---

## Query after timeout {#query-after-timeout}

After synchronous wait timeout (default 300s, `408 generation_timeout`), query by task ID; successful terminal state still delivers images and settles billing.

| Item | Value |
| --- | --- |
| Method | `GET` |
| Path | `/image/tasks/{taskId}` |
| `taskId` | `trinity_task.task_id` from create/timeout response (e.g. `imgtsk_xxx`) |

```bash
curl -sS "${TRINITY_BASE_URL}/image/tasks/imgtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## Success response example

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

Response headers include `X-Request-Id`, `X-Settlement-Key`, etc.; see [API overview](./overview.md#tracing-and-settlement-headers).

---

## Difference from image input

| Capability | How images are passed | Output |
| --- | --- | --- |
| Text model seeing images | `messages[].content[]` · `type: image_url` → [Image input](../multimodal/image-input.md) | Text |
| Image generation references | `image_config.reference_images[]` or `image_url` in `messages` | `choices[].message.images[]` |

---

## Full JSON example (create)

```json
{
  "model": "GG-2.5",
  "messages": [
    { "role": "user", "content": "Cyberpunk city at night, neon reflections, cinematic lighting" }
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
        "text": "Keep the main building silhouette unchanged"
      }
    ]
  },
  "model_specific_config": {
    "negative_prompt": "blurry, low quality, distorted",
    "enhance_prompt": true,
    "seed": 123456
  }
}
```

---

## Related

- [Image generation](../multimodal/image-generation.md)
- [Create image generation](./images-generations.md)
- [Errors & debugging](../reference/error-codes.md)
