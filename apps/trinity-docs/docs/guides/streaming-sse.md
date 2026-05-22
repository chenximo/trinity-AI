# 流式输出（SSE）

在对话补全请求中设置 `"stream": true`，网关以 **Server-Sent Events (SSE)** 返回增量内容。chunk 格式对齐 OpenAI，便于现有客户端复用。

## 请求示例

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -N \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{ "role": "user", "content": "讲一个短笑话" }],
    "stream": true
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
    messages: [{ role: "user", content: "讲一个短笑话" }],
    stream: true,
  }),
});
const reader = res.body?.getReader();
// 按 SSE 解析 data: 行（生产环境建议使用成熟 SSE 库）
```

```python [Python]
import json, os, requests

with requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={"Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}"},
    json={
        "model": "openai/gpt-4o",
        "messages": [{"role": "user", "content": "讲一个短笑话"}],
        "stream": True,
    },
    stream=True,
) as r:
    for line in r.iter_lines():
        if line:
            print(line.decode())
```

:::

## 客户端注意

1. 使用支持流式响应的 HTTP 客户端；curl 加 `-N` 禁用缓冲。
2. 连接中断时按 [错误与调试](../reference/error-codes.md) 区分可重试与不可重试。
3. 生产环境勿禁用 TLS 校验。

::: warning
部分代理会缓冲 SSE；若本地看不到逐字输出，请检查 Nginx `proxy_buffering` 等配置。
:::

## 相关

- [对话补全 API](../api/chat-completions.md)
- [错误与调试](../reference/error-codes.md)
