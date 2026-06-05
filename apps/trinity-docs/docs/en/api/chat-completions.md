# Create chat completion

`POST` `{TRINITY_BASE_URL}/chat/completions`

`Content-Type: application/json`

Send chat messages to a model and receive a completion. Supports non-streaming JSON and streaming SSE.

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

## Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Model ID from the [model catalog](https://trinity.ai/models) |
| `messages` | array | Yes | `{ role, content }`; `content` may be string or a Part array |
| `stream` | boolean | No | Default `false`; `true` returns SSE |

::: info
Advanced fields such as `temperature`, `thinking_enabled`, `tools`, and multimodal Parts are documented in [Chat completions · Advanced parameters](./chat-completions-parameters.md). For image generation, use [Create image generation](./images-generations.md) with `image_config`.
:::

---

## Response

Success returns OpenAI-style JSON (`choices[]`, `usage`, etc.). Streaming is documented in [Streaming (SSE)](../guides/streaming-sse.md). Response headers include `X-Request-Id` and `X-Settlement-Key`. Errors: [Errors & debugging](../reference/error-codes.md).

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
    "model": "doubao-seed-1-6-thinking-agent-preview",
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
    model: "doubao-seed-1-6-thinking-agent-preview",
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
    "model": "doubao-seed-1-6-thinking-agent-preview",
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
