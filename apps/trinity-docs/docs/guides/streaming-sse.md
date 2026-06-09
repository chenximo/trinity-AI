# 流式输出（SSE）

在 **`POST /v1/chat/completions`** 请求体中设置 `"stream": true`，网关以 **Server-Sent Events (SSE)** 增量返回内容。事件格式对齐 **OpenAI Chat Completions 流式**，便于复用现有 SDK 与解析逻辑。

::: warning 适用范围
**流式仅适用于生文（及带文本增量的对话补全）**。生图须 `stream: false` 或省略；生视频为异步任务轮询，见 [视频生成](../multimodal/video-generation.md)。
:::

---

## 启用流式

| 项 | 值 |
| --- | --- |
| Body | `"stream": true` |
| 建议请求头 | `Accept: text/event-stream` |
| 响应 `Content-Type` | `text/event-stream` |

可选 **`stream_options`**（仅 `stream=true` 时）：

| 字段 | 说明 |
| --- | --- |
| `include_usage` | 是否在**最后一个** chunk 附带 `usage` |
| `chunk_include_usage` | 是否每个 chunk 带累计 `usage` |

字段细节见 [高级参数 · 生文](../api/chat-completions-parameters.md)。

---

## 请求示例

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
    "messages": [{ "role": "user", "content": "讲一个短笑话" }],
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
    messages: [{ role: "user", content: "讲一个短笑话" }],
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
      /* 非 JSON 行可忽略 */
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
        "messages": [{"role": "user", "content": "讲一个短笑话"}],
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

## 响应格式（SSE）

流由多行事件组成，常见模式：

```text
data: {"id":"...","choices":[{"delta":{"content":"你"},"index":0}]}

data: {"id":"...","choices":[{"delta":{"content":"好"},"index":0}]}

data: [DONE]
```

| 要点 | 说明 |
| --- | --- |
| **行前缀** | 业务数据多在 `data: ` 行；按行解析 |
| **结束** | 常见以 `data: [DONE]` 结束（以实现为准） |
| **增量文本** | `choices[0].delta.content` |
| **工具调用** | 可能出现在 `delta.tool_calls`（按模型） |
| **usage** | 若开启 `stream_options.include_usage`，常在**最后一个** JSON chunk |
| **注释行** | 偶发 `: ping` 等 SSE 注释，按规范**可忽略** |

每个 JSON chunk 结构对齐 OpenAI；上游字段名可能略有差异，集成时以一次真实流式响应为准。

---

## 追踪、计费与重试

流式响应同样回写 **`X-Request-Id`**、**`X-Settlement-Key`**（及可选 `X-Conversation-Id`）。

网络中断后重放**同一笔**业务：

- **`X-Idempotency-Key` 保持不变** → 避免重复扣费（命中幂等时不再结算）
- **`X-Request-Id` 可更换** → 便于区分重试次数

详见 [API 概述 · 追踪与结算](../api/overview.md#追踪与结算请求头)。

---

## 客户端注意

1. **禁用缓冲**：curl 使用 `-N`；反向代理关闭 SSE 缓冲（如 Nginx `proxy_buffering off`）。
2. **HTTP 客户端**：须支持流式 body；`requests` 设 `stream=True`，fetch 用 `ReadableStream`。
3. **解析库**：生产环境建议使用成熟 SSE 库，避免半包 JSON 解析错误。
4. **TLS**：生产环境勿关闭证书校验。
5. **错误**：流开始前失败为普通 HTTP JSON `error`；流中途失败见 chunk 或连接断开，对照 [错误与调试](../reference/error-codes.md)。

::: warning 代理缓冲
部分 CDN/网关会缓冲 `text/event-stream`，导致「一次性出全文」。本地无逐字输出时，先查代理与 `Accept` 头。
:::

---

## 故障排除

**没有逐字输出？**

- 确认 `stream: true` 且未对生图请求误开流式。
- curl 加 `-N`；检查 Nginx / 云 WAF 缓冲。
- 用 `-v` 看 `Content-Type` 是否为 `text/event-stream`。

**解析报错？**

- 只处理 `data: ` 行；忽略空行与 `:` 注释行。
- `payload === "[DONE]"` 时结束，勿再 `JSON.parse`。

**重试被重复计费？**

- 固定 `X-Idempotency-Key` 后再重放请求体。

---

## 相关

- [创建对话补全](../api/chat-completions.md)
- [高级参数 · 生文](../api/chat-completions-parameters.md)
- [请求参数](./request-parameters.md)
- [错误与调试](../reference/error-codes.md)
