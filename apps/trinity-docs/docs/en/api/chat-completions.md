# Create chat completion

Send a list of chat messages to a model and generate a text response. Use this endpoint for text chat, multi-turn conversations, tool calling, and multimodal input understanding with images, audio, or files.

For real-time output, set `stream` to `true` in the request body. The gateway will return incremental chunks over Server-Sent Events (SSE).

:::: tip Scope
This page documents **text chat completions**. Image generation also uses the `/chat/completions` path, but requires `modalities` and `image_config`; see [Create image generation](./images-generations.md).
::::

---

## Endpoint

| Method | URL |
| --- | --- |
| `POST` | `{TRINITY_BASE_URL}/chat/completions` |

---

## Authentication

**Authorization** · Bearer

Pass your API key in the `Authorization` header: `Bearer <TRINITY_API_KEY>` (keys usually start with `xh-...`). See [Manage API keys](../manage-api-keys.md).

---

## Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | Yes | `Bearer <TRINITY_API_KEY>` |
| `Content-Type` | Yes | `application/json` |
| `Accept` | Streaming only | `text/event-stream` when `stream: true` |

Tracing and settlement headers (`X-Request-Id`, `X-Idempotency-Key`, `X-Conversation-Id`) are described in [API overview](./overview.md#tracing-and-settlement-headers).

---

## Minimal request

```bash
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'
```

---

## Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Model ID from the [model catalog](https://trinity.ai/models) |
| `messages` | array | Yes | `{ role, content }`; `content` may be string or a Part array |
| `stream` | boolean | No | Default `false`; `true` returns incremental SSE events |

::: info
Advanced fields such as `temperature`, `thinking_enabled`, `tools`, `stream_options`, and multimodal Parts are documented in [Chat completions · Advanced parameters](./chat-completions-parameters.md).
:::

---

## Response

Non-streaming requests return OpenAI-style JSON (`choices[]`, `usage`, etc.). Models with prompt caching may return `usage.prompt_tokens_details.cached_tokens`; see [Advanced parameters · Prompt cache](./chat-completions-parameters.md#prompt-cache). Streaming requests return `text/event-stream`; read incremental content from `choices[0].delta.content`. See [Streaming (SSE)](../guides/streaming-sse.md). Response headers include `X-Request-Id` and `X-Settlement-Key`. Errors: [Errors & debugging](../reference/error-codes.md).

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "..." },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

---

## SDK examples

::: code-group

```python [Python]
import json, os, requests

url = f"{os.environ['TRINITY_BASE_URL']}/chat/completions"
payload = {
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": False,
}
headers = {
    "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
    "Content-Type": "application/json",
}
r = requests.post(url, headers=headers, data=json.dumps(payload))
print(r.json()["choices"][0]["message"]["content"])
```

```typescript [TypeScript (fetch)]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-5.5",
    messages: [{ role: "user", content: "Hello" }],
  }),
});
const data = await res.json();
console.log(data.choices[0]?.message?.content);
```

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{ "role": "user", "content": "Hello" }],
    "stream": false
  }'
```

:::

---

## Related

- [Chat completions · Advanced parameters](./chat-completions-parameters.md)
- [API overview](./overview.md) · [Quickstart](../quickstart.md)
- [Streaming (SSE)](../guides/streaming-sse.md)
- [Image input (Parts)](../multimodal/image-input.md)
