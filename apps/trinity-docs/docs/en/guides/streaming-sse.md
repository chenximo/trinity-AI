# Streaming (SSE)

Set `"stream": true` on **`POST /v1/chat/completions`** to receive incremental output as **Server-Sent Events (SSE)**. The stream follows **OpenAI Chat Completions streaming** conventions so existing clients and parsers often work with minimal changes.

Reference: [OpenRouter · API Streaming](https://openrouter.ai/docs/api/reference/streaming)

::: warning Scope
**Streaming applies to text chat** (and other chat completions that return text deltas). Image generation must use `stream: false` or omit `stream`. Video uses async polling—see [Video generation](../multimodal/video-generation.md).
:::

---

## Enable streaming

| Item | Value |
| --- | --- |
| Body | `"stream": true` |
| Recommended header | `Accept: text/event-stream` |
| Response `Content-Type` | `text/event-stream` |

Optional **`stream_options`** (only when `stream=true`):

| Field | Description |
| --- | --- |
| `include_usage` | Include `usage` on the **final** chunk |
| `chunk_include_usage` | Include cumulative `usage` on every chunk |

Details: [Advanced parameters · Text](../api/chat-completions-parameters.md).

---

## Request examples

::: code-group

```bash [Shell]
curl -sS -N "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "X-Request-Id: trace-$(uuidgen)" \
  -H "X-Idempotency-Key: settle-$(uuidgen)" \
  -d '{
    "model": "doubao-seed-1-6-thinking-agent-preview",
    "messages": [{ "role": "user", "content": "Tell a short joke" }],
    "stream": true,
    "stream_options": { "include_usage": true }
  }'
```

```typescript [TypeScript (fetch)]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "doubao-seed-1-6-thinking-agent-preview",
    messages: [{ role: "user", content: "Tell a short joke" }],
    stream: true,
    stream_options: { include_usage: true },
  }),
});

if (!res.ok) throw new Error(await res.text());
const reader = res.body!.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (payload === "[DONE]") return;
    try {
      const chunk = JSON.parse(payload);
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) process.stdout.write(delta);
    } catch {
      /* ignore non-JSON lines */
    }
  }
}
```

```python [Python]
import json, os, requests

with requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Accept": "text/event-stream",
    },
    json={
        "model": "doubao-seed-1-6-thinking-agent-preview",
        "messages": [{"role": "user", "content": "Tell a short joke"}],
        "stream": True,
        "stream_options": {"include_usage": True},
    },
    stream=True,
) as r:
    r.raise_for_status()
    for line in r.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data: "):
            continue
        payload = line[6:].strip()
        if payload == "[DONE]":
            break
        try:
            chunk = json.loads(payload)
            delta = (chunk.get("choices") or [{}])[0].get("delta", {}).get("content")
            if delta:
                print(delta, end="", flush=True)
        except json.JSONDecodeError:
            pass
print()
```

:::

---

## Response format (SSE)

The stream is a sequence of lines, typically:

```text
data: {"id":"...","choices":[{"delta":{"content":"He"},"index":0}]}

data: {"id":"...","choices":[{"delta":{"content":"llo"},"index":0}]}

data: [DONE]
```

| Point | Description |
| --- | --- |
| **Prefix** | Payloads usually on `data: ` lines |
| **End** | Often `data: [DONE]` (confirm in your environment) |
| **Text delta** | `choices[0].delta.content` |
| **Tool calls** | May appear in `delta.tool_calls` (model-dependent) |
| **Usage** | With `stream_options.include_usage`, often on the **last** JSON chunk |
| **Comments** | Occasional `: ping` SSE comments—**safe to ignore** per spec |

Chunk JSON follows OpenAI shapes; upstream may differ slightly—pin paths from one real stream in your deployment.

---

## Tracing, billing, and retries

Streaming responses still return **`X-Request-Id`** and **`X-Settlement-Key`** (and optional `X-Conversation-Id`).

After a network drop, retry the **same business operation**:

- **Keep `X-Idempotency-Key` unchanged** → avoid duplicate charges
- **Change `X-Request-Id` if you want** → distinguish retry attempts

See [API overview · Tracing & settlement](../api/overview.md#追踪与结算请求头).

---

## Client notes

1. **Disable buffering**: curl `-N`; reverse proxies off for SSE (e.g. Nginx `proxy_buffering off`).
2. **HTTP client**: Must support streaming bodies; `requests` with `stream=True`, fetch with `ReadableStream`.
3. **Parser**: Prefer a production SSE library to avoid split JSON issues.
4. **TLS**: Do not disable certificate verification in production.
5. **Errors**: Failures before the stream start as normal JSON `error`; mid-stream issues may appear in chunks or disconnects—see [Errors & debugging](../reference/error-codes.md).

::: warning Proxy buffering
Some CDNs/gateways buffer `text/event-stream` and flush all at once. If you never see token-by-token output, check proxy settings and the `Accept` header.
:::

---

## Troubleshooting

**No token-by-token output?**

- Confirm `stream: true` and that you are not streaming an image request.
- curl `-N`; check Nginx / WAF buffering.
- Verify response `Content-Type` is `text/event-stream`.

**Parse errors?**

- Only parse `data: ` lines; skip blanks and `:` comment lines.
- Stop when `payload === "[DONE]"`.

**Double billing on retry?**

- Reuse the same `X-Idempotency-Key` with the same request body.

---

## Related

- [Create chat completion](../api/chat-completions.md)
- [Advanced parameters · Text](../api/chat-completions-parameters.md)
- [Request parameters](./request-parameters.md)
- [Errors & debugging](../reference/error-codes.md)
