# 流式 SSE

在对话补全请求中设置 `"stream": true`，网关以 **Server-Sent Events (SSE)** 返回增量内容。MVP 要求 **首包延迟** 与 **chunk 格式** 与 OpenAI 对齐，便于现有前端与 SDK 无感切换。

## 请求示例

::: code-group

```bash [Shell]
curl "https://api.trinity.example/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TRINITY_API_KEY" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{ "role": "user", "content": "讲一个短笑话" }],
    "stream": true
  }'
```

```typescript [TypeScript]
const stream = await client.chat.completions.create({
  model: "openai/gpt-4o",
  messages: [{ role: "user", content: "讲一个短笑话" }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
```

:::

## 客户端注意

1. 使用支持 SSE 的 HTTP 客户端或官方 SDK 的 `stream: true` 模式。
2. 连接中断时应按 [错误码](../reference/error-codes.md) 区分可重试与不可重试场景。
3. 不要在生产环境禁用 TLS 校验。

::: warning
部分代理会缓冲 SSE；若本地开发看不到逐字输出，请检查 Nginx `proxy_buffering` 等配置。
:::

## 相关

- [对话补全 API](../api/chat-completions.md)
- [错误码](../reference/error-codes.md)
