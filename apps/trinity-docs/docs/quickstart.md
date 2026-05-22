# 快速入门

Trinity 当前仅提供 **OpenAI 兼容的 HTTP API** 接入：向网关发送标准 REST 请求（如 `POST /v1/chat/completions`），在请求头携带 API Key 即可调用多模型路由。

::: tip
模型标识使用 **`provider/model`** 格式（与 [OpenRouter](https://openrouter.ai/docs/quickstart) 一致），例如 `openai/gpt-4o`、`anthropic/claude-sonnet-4`。
:::

有关流式响应与错误处理，见 [流式 SSE](./guides/streaming-sse.md) 与 [错误码](./reference/error-codes.md)。

---

## 1. 创建 API 密钥

1. 登录 [Trinity AI 控制台](https://trinity.ai/account/console)（演示环境以实际部署域名为准）。
2. 进入 **API 密钥**，创建密钥并妥善保存（仅展示一次）。

::: warning
请勿在公共仓库、前端 bundle 或日志中暴露完整密钥。
:::

也可参阅 [管理 API 密钥](./manage-api-keys.md)。

---

## 2. 配置接入地址与密钥

将网关 `base_url` 与密钥写入环境变量（域名以实际部署为准）：

::: code-group

```bash [Shell]
export TRINITY_API_KEY="sk-trinity-..."
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

```typescript [TypeScript]
process.env.TRINITY_API_KEY = "sk-trinity-...";
process.env.TRINITY_BASE_URL = "https://api.trinity.example/v1";
```

```python [Python]
import os
os.environ["TRINITY_API_KEY"] = "sk-trinity-..."
os.environ["TRINITY_BASE_URL"] = "https://api.trinity.example/v1"
```

:::

---

## 3. 发送首次 API 请求

请求体与 [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) 保持一致。

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{ "role": "user", "content": "你好" }]
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
    messages: [{ role: "user", content: "你好" }],
  }),
});
const data = await res.json();
console.log(data.choices[0]?.message?.content);
```

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
        "model": "openai/gpt-4o",
        "messages": [{"role": "user", "content": "你好"}],
    }),
)
print(response.json()["choices"][0]["message"]["content"])
```

:::

流式输出在请求体中设置 `"stream": true`，响应为 SSE，详见 [流式 SSE](./guides/streaming-sse.md)。

---

## 模型标识

`model` 须为 **`provider/model`** 格式，例如：

- `openai/gpt-4o`
- `anthropic/claude-sonnet-4`

完整目录以产品 **模型列表** 页为准（与网关路由配置同步）。

## 下一步

| 能力 | 指南 | API |
| --- | --- | --- |
| 生文 | [流式输出](./guides/streaming-sse.md) | [对话补全](./api/chat-completions.md) |
| 生图 | [生图](./guides/image-generation.md) | [图像生成](./api/images-generations.md) |
| 生视频 | [生视频](./guides/video-generation.md) | [视频生成](./api/videos-generations.md) |

- [API 概述](./api/overview.md) · [请求参数](./guides/request-parameters.md) · [错误与调试](./reference/error-codes.md)
