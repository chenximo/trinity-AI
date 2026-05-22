# 对话补全

`POST /v1/chat/completions`

请求体与 [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) 保持一致，便于现有客户端与 SDK 直接迁移。

---

## 请求

| 字段 | 类型 | 说明 |
|------|------|------|
| `model` | string | **必填**。`provider/model`，如 `openai/gpt-4o` |
| `messages` | array | **必填**。`role` + `content` 消息列表 |
| `stream` | boolean | 可选。`true` 时返回 SSE，见 [流式 SSE](../guides/streaming-sse.md) |

::: code-group

```bash [Shell]
curl "https://api.trinity.example/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TRINITY_API_KEY" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{ "role": "user", "content": "hi" }]
  }'
```

```typescript [TypeScript]
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.TRINITY_API_KEY,
  baseURL: "https://api.trinity.example/v1",
});

const completion = await client.chat.completions.create({
  model: "openai/gpt-4o",
  messages: [{ role: "user", content: "hi" }],
});
```

:::

---

## 响应

成功时返回 OpenAI 风格的 `choices` 数组，含 `message.role`、`message.content` 及 `usage`（若上游提供）。

::: tip
网关负责路由到具体供应商；客户端无需感知上游 endpoint 差异。
:::

## 相关

- [快速开始](../quickstart.md)
- [流式 SSE](../guides/streaming-sse.md)
- [错误码](../reference/error-codes.md)
