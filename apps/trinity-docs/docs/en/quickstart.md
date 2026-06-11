# Quickstart

Trinity exposes an **HTTP API**: text, multimodal input, and image generation use `POST /v1/chat/completions`; video generation uses async `POST /v1/video/generations` tasks. `POST /v1/chat/completions` is OpenAI Chat Completions–compatible—set your SDK `base_url` and API key to Trinity.

| Approach | Best for |
| --- | --- |
| **[HTTP API](#using-the-api)** | Any language, direct requests |
| **[OpenAI SDK](#using-the-openai-sdk)** | Existing OpenAI SDK code—swap `base_url` |
| **[Cookbook](./cookbook/)** | Cursor, Codex CLI, WorkBuddy, and other tools |

::: tip Important · Models & keys
- API keys usually start with **`xh-...`** (copy the full value once from the [console](https://trinitydesk.ai/account/keys)).
- Set **`model`** to a **model ID** from the [model catalog](https://trinity.ai/models) or [List models](./api/models.md) (for example `gpt-5.5`).
- Never commit full keys to public repositories, client bundles, or logs.
:::

Optional tracing/settlement headers (`X-Request-Id`, `X-Idempotency-Key`, etc.) are described in [API overview](./api/overview.md). For streaming and errors, see [Streaming (SSE)](./guides/streaming-sse.md) and [Error codes](./reference/error-codes.md).

---

## Before you start

1. Create an API key in the [console](https://trinitydesk.ai/account/keys).
2. Set environment variables (use your deployment base URL if different):

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

See also [Manage API keys](./manage-api-keys.md).

---

## Using the API

Send HTTP requests to `{TRINITY_BASE_URL}/chat/completions`. The request/response shape is OpenAI Chat Completions–compatible. Examples below use `gpt-5.5`—replace it with a model ID visible to your account.

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

For streaming, set `"stream": true` in the body; the response is SSE. See [Streaming (SSE)](./guides/streaming-sse.md). Field reference: [Create chat completion](./api/chat-completions.md).

---

## Using the OpenAI SDK

Point the official OpenAI SDK `base_url` at Trinity—your `chat.completions.create` calls stay the same.

Install the package:

::: code-group

```bash [npm]
npm install openai
```

```bash [pnpm]
pnpm add openai
```

```bash [yarn]
yarn add openai
```

:::

::: code-group

```python [Python]
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ["TRINITY_BASE_URL"],
    api_key=os.environ["TRINITY_API_KEY"],
)

completion = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "Hello"}],
)
print(completion.choices[0].message.content)
```

```typescript [TypeScript]
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: process.env.TRINITY_BASE_URL,
  apiKey: process.env.TRINITY_API_KEY,
});

const completion = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [{ role: "user", content: "Hello" }],
});
console.log(completion.choices[0].message.content);
```

:::

---

## Model IDs

The **`model`** field must be a Trinity **model ID** (English slug) from [List models](./api/models.md) or the [model catalog](https://trinity.ai/models)—not a display name.

| Method | What to do |
| --- | --- |
| **`GET /models`** | Call [List models](./api/models.md) (optional `?modality=text\|image\|video`); use `data[].id` |
| **Model catalog** | Sign in to the [model catalog](https://trinity.ai/models) and copy the **model ID** |

Examples (verify against your list): text `gpt-5.5`; image `hunyuan-image`; video `kling-2.6`.

---

## Next steps

| Capability | Guide | API |
| --- | --- | --- |
| Text | [Streaming](./guides/streaming-sse.md) | [Chat completions](./api/chat-completions.md) |
| Image | [Image generation](./multimodal/image-generation.md) | [Images (chat)](./api/images-generations.md) |
| Video | [Video generation](./multimodal/video-generation.md) | [Video API](./api/videos-generations.md) |
| Coding tools | [Cookbook](./cookbook/) | Cursor / Claude Code / Codex CLI |

- [API overview](./api/overview.md) · [Request parameters](./guides/request-parameters.md) · [Errors](./reference/error-codes.md)
