# 创建对话补全

`POST` `{TRINITY_BASE_URL}/chat/completions`

`Content-Type: application/json`

向模型发送对话消息，获取补全回复。支持**非流式**与**流式（SSE）**。

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

## Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 模型 ID，见 [模型广场](https://trinity.ai/models) |
| `messages` | array | 是 | `{ role, content }`；`content` 可为 string 或 Part 数组 |
| `stream` | boolean | 否 | 默认 `false`；`true` 时为 SSE |

::: info
`temperature`、`thinking_enabled`、`tools`、多模态 Part 等**高级字段**见 [对话补全 · 高级参数](./chat-completions-parameters.md)。文生图勿在本端点混用 `image_config`，见 [图像生成](./images-generations.md)。
:::

---

## Response

成功时返回 OpenAI 风格 JSON（`choices[]`、`usage` 等）。流式见 [流式输出（SSE）](../guides/streaming-sse.md)。响应头含 `X-Request-Id`、`X-Settlement-Key`。错误见 [错误与调试](../reference/error-codes.md)。

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
    "model": "doubao-seed-1-6-thinking-agent-preview",
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
    model: "doubao-seed-1-6-thinking-agent-preview",
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
    "model": "doubao-seed-1-6-thinking-agent-preview",
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
