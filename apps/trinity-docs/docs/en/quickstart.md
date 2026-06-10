# Quickstart

Trinity exposes an **OpenAI-compatible HTTP API**: send standard REST requests (for example `POST /v1/chat/completions`) with your API key in the `Authorization` header.

::: tip Important · Models & keys
- API keys usually start with **`xh-...`** (copy the full value once from the console).
- Set **`model`** to a **model ID** from the [model catalog](https://trinity.ai/models) (for example `doubao-seed-1-6-thinking-agent-preview`). Do not use model names that are not available on the platform.
- Never commit full keys to public repositories, client bundles, or logs.
:::

For streaming, tracing/settlement headers, and errors, see [Streaming (SSE)](./guides/streaming-sse.md), [API overview](./api/overview.md), and [Error codes](./reference/error-codes.md).

---

## 1. Create an API key

1. Open [API keys in the Trinity console](https://trinitydesk.ai/account/keys).
2. Open **API keys**, create a key, and store it securely (shown only once).

See also [Manage API keys](./manage-api-keys.md).

---

## 2. Configure base URL and key

Set the gateway `base_url` and key via environment variables (replace the host with your deployment):

::: code-group

```bash [Shell]
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
```

```typescript [TypeScript]
process.env.TRINITY_API_KEY = "xh-...";
process.env.TRINITY_BASE_URL = "https://api.trinitydesk.ai/v1";
```

```python [Python]
import os
os.environ["TRINITY_API_KEY"] = "xh-..."
os.environ["TRINITY_BASE_URL"] = "https://api.trinitydesk.ai/v1"
```

:::

---

## 3. Send your first request

The body matches [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat). Optional tracing/settlement headers are described in [API overview](./api/overview.md).

::: code-group

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "X-Request-Id: trace-demo-001" \
  -H "X-Idempotency-Key: settle-demo-001" \
  -d '{
    "model": "doubao-seed-1-6-thinking-agent-preview",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'
```

```typescript [TypeScript]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
    "X-Request-Id": crypto.randomUUID(),
    "X-Idempotency-Key": crypto.randomUUID(),
  },
  body: JSON.stringify({
    model: "doubao-seed-1-6-thinking-agent-preview",
    messages: [{ role: "user", content: "Hello" }],
  }),
});
const data = await res.json();
console.log(data.choices[0]?.message?.content);
```

```python [Python]
import json
import os
import requests

response = requests.post(
    url=f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
        "X-Request-Id": "trace-demo-001",
        "X-Idempotency-Key": "settle-demo-001",
    },
    data=json.dumps({
        "model": "doubao-seed-1-6-thinking-agent-preview",
        "messages": [{"role": "user", "content": "Hello"}],
    }),
)
print(response.json()["choices"][0]["message"]["content"])
```

:::

For streaming, set `"stream": true` in the body; the response is SSE. See [Streaming (SSE)](./guides/streaming-sse.md).

---

## Model IDs

The **`model`** field must be a Trinity **model ID** (an English slug such as `doubao-seed-1-6-thinking-agent-preview`), not a display name or an ID copied from another provider’s docs unless it appears in your available list.

### How to get model IDs

**Only models visible to your account** apply (plan, permissions, region).

| Method | What to do | Notes |
| --- | --- | --- |
| **Model catalog** (recommended) | Copy the **model ID** from the [model catalog](https://trinity.ai/models) into `"model"` (sign in via [API keys](https://trinitydesk.ai/account/keys) if needed) | How to get model IDs today |

::: info
In Cursor and other agents, use the same **ID** in tool settings. See [Cookbook · coding tools](./cookbook/).

If `model` is not in your available list, the gateway returns a model-not-found style error. See [Errors](./reference/error-codes.md).
:::

### Example IDs (verify against your list before calling)

- Text: `doubao-seed-1-6-thinking-agent-preview`, `gpt-4o`
- Image: `hunyuan-image` (`POST /v1/chat/completions` + `image_config`; see [Image generation API](./api/images-generations.md))
- Video: `kling-2.6` (`POST /v1/video/generations`)

See also [API overview](./api/overview.md).

## Next steps

| Capability | Guide | API |
| --- | --- | --- |
| Text | [Streaming](./guides/streaming-sse.md) | [Chat completions](./api/chat-completions.md) |
| Image | [Image generation](./multimodal/image-generation.md) | [Images (chat)](./api/images-generations.md) |
| Video | [Video generation](./multimodal/video-generation.md) | [Video API](./api/videos-generations.md) |
| Coding tools | [Cookbook](./cookbook/) | Cursor / Claude Code / Codex CLI |

- [API overview](./api/overview.md) · [Request parameters](./guides/request-parameters.md) · [Errors](./reference/error-codes.md)
