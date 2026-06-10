# Chat completions · Advanced parameters

Use this page for tuning, integration, and field checks. For the endpoint summary and copyable examples, see [Create chat completion](./chat-completions.md).

---

## Request body fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Model ID from the [model catalog](https://trinity.ai/models) |
| `messages` | array | Yes | See `messages[]` below |
| `stream` | boolean | No | Default `false` |
| `stream_options` | object | No | `include_usage`, `chunk_include_usage` (only with `stream=true`) |
| `temperature` | number | No | Common range `0~2` |
| `top_p` | number | No | Common range `0~1` |
| `max_tokens` | integer | No | Mutually exclusive with `max_completion_tokens` |
| `max_completion_tokens` | integer | No | `1~65536` |
| `thinking_enabled` | boolean | No | Deep thinking; depends on model capability |
| `reasoning_effort` | string | No | `none` / `minimal` / `low` / `medium` / `high` and model-specific values |
| `stop` | string \| string[] | No | Stop sequences, up to 4 strings |
| `response_format` | object \| string | No | `text` / `json_object` / `json_schema` |
| `frequency_penalty` | number | No | Depends on model capability |
| `presence_penalty` | number | No | Depends on model capability |
| `logprobs` | boolean | No | Depends on model capability |
| `top_logprobs` | integer | No | Requires `logprobs=true` |
| `tools` | array | No | `type: function` + `function.name` |
| `parallel_tool_calls` | boolean | No | Default `true` |
| `tool_choice` | string \| object | No | `none` / `auto` / `required`, or specify a function |
| `modalities` | array | No | For text, usually omit or use `["text"]` |

### `messages[]`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `role` | string | No | `system` / `user` / `assistant` / `tool` |
| `content` | string \| array | Yes | String or Part array |
| `tool_calls` | array | No | Only on `role=assistant` |
| `tool_call_id` | string | No | Required only for `role=tool` |

### Parts (`content` as array)

| `type` | Description |
| --- | --- |
| `text` | `{ "type": "text", "text": "..." }` |
| `image_url` | URL or `data:image/...;base64,...`; see [Image input](../multimodal/image-input.md) |
| `input_audio` | `input_audio.data` (Base64) + `format`: `mp3` / `wav` |
| `file` | `file_url` (≤70MB; video supported); optional `file_name`; see [Video input](../multimodal/video-input.md) |

::: info
Parts are for **text models reading images/audio/files**. Image generation reference images use `image_config.reference_images`; see [Image generation · Advanced parameters](./image-generation-parameters.md).
:::

---

## Tracing and settlement headers

| Header | Description |
| --- | --- |
| `X-Request-Id` | Trace ID; max 128 chars |
| `X-Idempotency-Key` | Settlement idempotency key; **keep unchanged when retrying the same business operation** |
| `X-Conversation-Id` | Conversation grouping; keep stable per Agent / chat for prompt cache |

::: tip
Without `X-Idempotency-Key`, each HTTP call is billed independently. After a network timeout, replay with the **same settlement key**.
:::

---

## Prompt cache {#prompt-cache}

Applies to **text models that support prompt caching** (see the [model catalog](https://trinity.ai/models)). The gateway maintains session context automatically—**no cache-control fields in the request body**.

### Improve hit rate

Within the same Agent or multi-turn chat, **keep** `X-Conversation-Id` stable (or use `X-Session-Id` when the former is omitted). Changing the conversation ID often reduces cache hits.

### Response `usage`

| Field | Description |
| --- | --- |
| `usage.prompt_tokens_details.cached_tokens` | Input tokens read from cache (**> 0** on a hit) |
| `usage.prompt_tokens_details.cache_write_tokens` | Tokens written to cache on first request (when returned upstream) |

For streaming, these fields appear on the **final** SSE chunk when `stream_options.include_usage` is set. See [Streaming (SSE)](../guides/streaming-sse.md).

Example (non-streaming):

```json
{
  "usage": {
    "prompt_tokens": 1500,
    "completion_tokens": 120,
    "total_tokens": 1620,
    "prompt_tokens_details": {
      "cached_tokens": 1200
    }
  }
}
```

### Billing

When the model has a **cached input** unit price, input charges are roughly:

- Uncached prompt × input unit price
- Cached prompt × cached input unit price (usually lower than input)
- Completion × output unit price

If no cached input price is configured, cached tokens are billed at the **input** unit price for now. See the console and model page for actual rates.

---

## Reasoning mode (by model)

| Model example | Constraint summary |
| --- | --- |
| `gpt-5.1` / `gpt-5.2` / `gpt-4o` | Does not support `thinking_enabled` / `reasoning_effort` |
| `gemini-3-pro-preview` | Does not allow `thinking_enabled=false`; `reasoning_effort`: `low` / `medium` / `high` |
| `gemini-3-flash-preview` | Thinking is on by default; `reasoning_effort` includes `minimal` |

Use the [model catalog](https://trinity.ai/models) and actual model capability as the source of truth.

---

## Full JSON example

```json
{
  "model": "gpt-5.5",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello" }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024,
  "thinking_enabled": true,
  "reasoning_effort": "medium",
  "tools": [],
  "tool_choice": "auto"
}
```

---

## Related

- [Create chat completion](./chat-completions.md)
- [API overview](./overview.md)
- [Streaming (SSE)](../guides/streaming-sse.md)
- [Errors & debugging](../reference/error-codes.md)
