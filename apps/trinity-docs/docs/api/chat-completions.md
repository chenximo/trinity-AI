# 创建对话补全

向模型发送一组对话消息，生成文本回复。适用于文本对话、多轮聊天、工具调用，以及图片、音频、文件等多模态输入理解。

需要实时返回时，将请求体中的 `stream` 设置为 `true`，网关会通过 Server-Sent Events（SSE）持续返回增量内容。

:::: tip 适用范围
本页说明的是**文本对话补全**能力。图片生成虽然也使用 `/chat/completions` 路径，但需要 `modalities` 与 `image_config`，请参考 [创建图像生成](./images-generations.md)。
::::

---

## Endpoint

| Method | URL |
| --- | --- |
| `POST` | `{TRINITY_BASE_URL}/chat/completions` |

---

## Authentication

**Authorization** · Bearer

在 `Authorization` 请求头传入 API Key：`Bearer <TRINITY_API_KEY>`（前缀一般为 `xh-...`）。详见 [管理 API 密钥](../manage-api-keys.md)。

---

## Headers

| 请求头 | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 是 | `Bearer <TRINITY_API_KEY>` |
| `Content-Type` | 是 | `application/json` |
| `Accept` | 流式时 | `text/event-stream`（`stream: true`） |

追踪与结算（`X-Request-Id`、`X-Idempotency-Key`、`X-Conversation-Id`）见 [API 概述 · 追踪与结算](./overview.md#追踪与结算请求头)。

---

## 最小请求示例

```bash
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{ "role": "user", "content": "你好" }]
  }'
```

---

## Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 模型 ID，见 [模型广场](https://trinity.ai/models) |
| `messages` | array | 是 | `{ role, content }`；`content` 可为 string 或 Part 数组 |
| `stream` | boolean | 否 | 默认 `false`；`true` 时返回 SSE 增量事件 |

::: info
`temperature`、`thinking_enabled`、`tools`、`stream_options`、多模态 Part 等高级字段见 [对话补全 · 高级参数](./chat-completions-parameters.md)。
:::

---

## Response

非流式请求成功时返回 OpenAI 风格 JSON（`choices[]`、`usage` 等）。支持 Prompt Cache 的模型可能在 `usage.prompt_tokens_details.cached_tokens` 中返回缓存命中量，见 [高级参数 · Prompt Cache](./chat-completions-parameters.md#prompt-cache)。流式请求返回 `text/event-stream`，从 `choices[0].delta.content` 读取增量内容，详见 [流式输出（SSE）](../guides/streaming-sse.md)。响应头含 `X-Request-Id`、`X-Settlement-Key`。错误见 [错误与调试](../reference/error-codes.md)。

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

## SDK 代码示例

::: code-group

```python [Python]
import json, os, requests

url = f"{os.environ['TRINITY_BASE_URL']}/chat/completions"
payload = {
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "你好"}],
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
    messages: [{ role: "user", content: "你好" }],
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
    "messages": [{ "role": "user", "content": "你好" }],
    "stream": false
  }'
```

:::

---

## 相关

- [对话补全 · 高级参数](./chat-completions-parameters.md)
- [API 概述](./overview.md) · [快速入门](../quickstart.md)
- [流式输出（SSE）](../guides/streaming-sse.md)
- [图片输入（Part）](../multimodal/image-input.md)
