# 对话补全（生文）

`POST /v1/chat/completions`

请求体与 [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) 保持一致。

---

## 请求

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | string | **必填**。`provider/model`，如 `openai/gpt-4o` |
| `messages` | array | **必填**。`role` + `content` |
| `stream` | boolean | 可选。`true` 时 SSE，见 [流式输出](../guides/streaming-sse.md) |
| `temperature` | number | 可选 |
| `max_tokens` | integer | 可选 |

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{ "role": "user", "content": "hi" }]
  }'
```

```typescript [TypeScript]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "openai/gpt-4o",
    messages: [{ role: "user", content: "hi" }],
  }),
});
const data = await res.json();
console.log(data.choices[0]?.message?.content);
```

```python [Python]
import json, os, requests

r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "openai/gpt-4o",
        "messages": [{"role": "user", "content": "hi"}],
    }),
)
print(r.json()["choices"][0]["message"]["content"])
```

:::

---

## 响应

成功时返回 `choices` 数组，含 `message.role`、`message.content` 及 `usage`（若上游提供）。

::: tip
网关负责路由到具体供应商；客户端无需感知上游 endpoint 差异。
:::

---

## 相关

- [快速入门](../quickstart.md)
- [流式输出](../guides/streaming-sse.md)
- [错误与调试](../reference/error-codes.md)
