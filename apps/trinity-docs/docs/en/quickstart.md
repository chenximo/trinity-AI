# Quickstart

## Get started with Trinity AI

Trinity AI provides a unified HTTP API gateway: one `base_url` and API key for text, multimodal input, image generation, and more—set **`model`** to an ID from the [model catalog](https://trinity.ai/models) or [List models](./api/models.md). Video generation uses async `POST /v1/video/generations` tasks.

Pick an integration path:

| Approach | Best for |
| --- | --- |
| **[HTTP API](#using-the-api)** | Full control, any language, direct HTTP requests |
| **[Cookbook](./cookbook/)** | Cursor, Codex CLI, WorkBuddy, and other IDE / agent tools |

::: tip Important · Models & keys
- API keys usually start with **`xh-...`** (copy the full value once from the [console](https://trinitydesk.ai/account/keys)).
- Set **`model`** to a **model ID** (not a display name) from your account’s available list—for example `gpt-5.5`.
- Never commit full keys to public repositories, client bundles, or logs.
:::

::: info
Tracing and settlement headers such as `X-Request-Id` and `X-Idempotency-Key` are **optional**—see [API overview](./api/overview.md). Rate limits: [Rate limits](./guides/rate-limits.md). Other questions: [FAQ](./faq.md).
:::

---

## Authentication & base URL

1. Create an API key in the [console](https://trinitydesk.ai/account/keys).
2. Set environment variables (example production base URL; use your deployment URL if different):

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

See [Manage API keys](./manage-api-keys.md).

---

## Using the API

The most direct approach: send a standard HTTP POST to **`{TRINITY_BASE_URL}/chat/completions`**—works with any language or framework.

Examples below use `gpt-5.5`. Replace **`model`** with an ID visible to your account (`GET /models` or the [model catalog](https://trinity.ai/models)).

::: code-group

```python [Python]
import json
import os
import requests

response = requests.post(
    url=f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "gpt-5.5",
        "messages": [{"role": "user", "content": "Hello"}],
    }),
)
print(response.json()["choices"][0]["message"]["content"])
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
    "messages": [{ "role": "user", "content": "Hello" }]
  }'
```

:::

Streaming: set `"stream": true` in the body for SSE—see [Streaming (SSE)](./guides/streaming-sse.md). Full fields: [Create chat completion](./api/chat-completions.md).

---

## Next steps

| Capability | Guide | API |
| --- | --- | --- |
| Text / streaming | [Streaming (SSE)](./guides/streaming-sse.md) | [Chat completions](./api/chat-completions.md) |
| Image input / generation | [Multimodal](./multimodal/) | [Image generation](./api/images-generations.md) |
| Video input / generation | [Video generation](./multimodal/video-generation.md) | [Video API](./api/videos-generations.md) |
| IDE / agent setup | [Cookbook](./cookbook/) | [Cursor](./cookbook/coding-agents/cursor) · [Codex CLI](./cookbook/coding-agents/codex-cli) · [WorkBuddy](./cookbook/agent-workbench/workbuddy) |
| Model list | — | [List models](./api/models.md) |

- [API overview](./api/overview.md) · [Request parameters](./guides/request-parameters.md) · [Errors](./reference/error-codes.md)
