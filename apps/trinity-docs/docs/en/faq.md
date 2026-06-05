# FAQ

## How do I get an API key?

Create one in the console under **API keys**. See [Manage API keys](./manage-api-keys).

## What integration methods are currently supported?

Only the **HTTP API** (OpenAI-compatible REST). See [Quickstart](./quickstart).

## What capabilities are currently supported?

| Capability | Description |
| --- | --- |
| Text | `POST /v1/chat/completions`, streaming supported |
| Image generation | `POST /v1/chat/completions` + `modalities` / `image_config` |
| Video generation | `POST /v1/video/generations`, query with `GET /v1/video/tasks/{taskId}` |

## What format should model names use?

The request body **`model`** is a **model ID** string and must match the [model catalog](https://trinity.ai/models), for example `doubao-seed-1-6-thinking-agent-preview`, `hunyuan-image`, or `tencent/kling-2.6`. See [API overview · Model ID](./api/overview.md#model-id-model-field).

## What format does the API key use?

Keys are created in the console and usually start with **`xh-...`**. Send them as `Authorization: Bearer xh-...`.

## Where can I find streaming, errors, and limits?

- [Streaming (SSE)](./guides/streaming-sse.md)
- [Errors & debugging](./reference/error-codes.md)
- [Rate limits](./guides/rate-limits.md)

## What if the docs and live behavior differ?

Use the actual gateway response as the source of truth. If behavior differs from the docs, contact support through your console or customer-success channel and include `X-Request-Id` plus `X-Settlement-Key` when available.
