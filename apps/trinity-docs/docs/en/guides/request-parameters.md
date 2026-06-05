# Request parameters

Trinity keeps **API Reference** under the **API** tab (aligned with [OpenRouter](https://openrouter.ai/docs)). This page is a **cross-capability index**: where to find common headers and body fields. It does **not** replace full parameter tables per endpoint.

| Layer | Location | Use when |
| --- | --- | --- |
| **Endpoint (short)** | [API track](../api/overview.md) · per-endpoint pages | Copy curl, minimal working request |
| **Advanced parameters (long)** | API track · Advanced parameters group | Tuning, integration, full field lists |
| **Concept guides** | Docs track · [Streaming](./streaming-sse.md), multimodal | Semantics, flows, easy-to-confuse topics |

Reference: OpenRouter puts sampling params in [API Reference · Parameters](https://openrouter.ai/docs/api/reference/parameters) and endpoint schemas in [Chat completions](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request). Trinity uses **advanced parameters** pages for the same role.

---

## HTTP headers (common)

Applies to **`POST /v1/chat/completions`** (text, images, streaming) and most JSON APIs. Video task creation follows [Create video generation task](../api/videos-generations.md).

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | Yes | `Bearer xh-...` (see [Manage API keys](../manage-api-keys.md)) |
| `Content-Type` | Yes | `application/json` |
| `Accept` | Recommended for streams | Text streaming: `text/event-stream` |
| `X-Request-Id` | No | **Trace ID** for support; max 128 chars |
| `X-Idempotency-Key` | No | **Settlement idempotency key**; same key in a workspace → charge once on success; **keep unchanged on retry** |
| `X-Conversation-Id` | No | Conversation grouping; max 128 chars |

Successful and error responses (**including SSE**) typically return `X-Request-Id` and `X-Settlement-Key`; `X-Conversation-Id` is echoed when sent.

::: warning Billing
Without `X-Idempotency-Key`, **each HTTP call is billed separately**. After a timeout, retry the same business operation with the **same settlement key**; the trace ID may change.
:::

See [API overview · Tracing & settlement](../api/overview.md#tracing-and-settlement-headers).

---

## Body: `model` and capability entry points

| Field | Required | Description |
| --- | --- | --- |
| `model` | Yes | **Model ID** from the [model catalog](https://trinity.ai/models) |

Trinity does **not** expose a public `GET /v1/models` listing. Do not rely on OpenRouter-only query params such as `output_modalities`.

---

## Text · common body fields (summary)

Full table: [Advanced parameters · Text](../api/chat-completions-parameters.md).

| Field | Type | Description |
| --- | --- | --- |
| `messages` | array | **Required.** `role` + `content` (string or Part array) |
| `stream` | boolean | Default `false`; `true` → [Streaming (SSE)](./streaming-sse.md) |
| `stream_options` | object | Only when `stream=true`; e.g. `include_usage` |
| `temperature` | number | Sampling randomness, often `0~2` |
| `top_p` | number | Nucleus sampling, often `0~1` |
| `max_tokens` | integer | **Mutually exclusive** with `max_completion_tokens` |
| `max_completion_tokens` | integer | Output cap including reasoning |
| `thinking_enabled` / `reasoning_effort` | boolean / string | Reasoning modes; **model-dependent** |
| `stop` | string \| string[] | Stop sequences |
| `response_format` | object \| string | Structured output |
| `tools` / `tool_choice` / `parallel_tool_calls` | — | Tool calling |
| `modalities` | array | For plain text, omit or use `["text"]` |

Multimodal **input** Parts (`image_url`, `file`, etc.): [Image input](../multimodal/image-input.md), [Video input](../multimodal/video-input.md).

---

## Images · differences from text params

Image generation uses the **same** `POST /v1/chat/completions` path with:

| Field | Description |
| --- | --- |
| `modalities` | Must include `image` (often with `text`) |
| `image_config` | Aspect ratio, resolution, reference images, etc. |

| Do not use | Reason |
| --- | --- |
| `stream: true` | Image generation **does not** support streaming |
| `trinity_async.*` | Not supported for images → `invalid_request` |

See [Image generation](../multimodal/image-generation.md) and [Advanced parameters · Images](../api/image-generation-parameters.md).

---

## Video · separate endpoints

| Step | Method | Path | Main body fields |
| --- | --- | --- | --- |
| Create | `POST` | `/video/generations` | `model`, `prompt`, `duration_sec`, `frame_images`, … |
| Poll | `GET` | `/video/tasks/{taskId}` | Path param `taskId` |

See [Video generation](../multimodal/video-generation.md) and [Advanced parameters · Video](../api/video-generation-parameters.md).

---

## Per-capability docs

| Capability | Short endpoint page | Advanced parameters |
| --- | --- | --- |
| Text | [Create chat completion](../api/chat-completions.md) | [Advanced parameters · Text](../api/chat-completions-parameters.md) |
| Images | [Create image generation](../api/images-generations.md) | [Advanced parameters · Images](../api/image-generation-parameters.md) |
| Video | [Create video generation task](../api/videos-generations.md) | [Advanced parameters · Video](../api/video-generation-parameters.md) |

---

## Quick lookup

| Goal | Where to look |
| --- | --- |
| Tune `temperature`, `tools` | [Advanced parameters · Text](../api/chat-completions-parameters.md) |
| Image/video **input** | Parts · [Multimodal](../multimodal/) |
| Text-to-image, `image_config` | [Image generation](../multimodal/image-generation.md) |
| Token-by-token UI | [Streaming (SSE)](./streaming-sse.md) |
| Retry without double billing | `X-Idempotency-Key` · [API overview](../api/overview.md) |

---

## Related

- [API overview](../api/overview.md)
- [Streaming (SSE)](./streaming-sse.md)
- [Quickstart](../quickstart.md)
- [Errors & debugging](../reference/error-codes.md)
