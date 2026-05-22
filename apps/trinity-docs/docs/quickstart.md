# 快速开始

Trinity 提供 **OpenAI 兼容** 的统一 HTTP API：将 `base_url` 指向 Trinity 网关，沿用现有 OpenAI SDK，**仅替换 API Key** 即可访问多模型路由。

根据集成深度，可选用以下方式：

| 方式 | 适用场景 |
| --- | --- |
| **[HTTP API](#使用-http-api)** | 任意语言、零依赖、完全可控 |
| **[OpenAI SDK](#使用-openai-sdk)** | 已有 OpenAI 客户端，改 `baseURL` 即可迁移 |
| **[原生 fetch / curl](#使用-http-api)** | 脚本、边缘函数、快速验证 |

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

---

## 使用 HTTP API

直接向 `POST /v1/chat/completions` 发送标准 JSON 请求，与 [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) 请求体一致。

### 配置环境变量

::: code-group

```bash [Shell]
export TRINITY_API_KEY="sk-trinity-..."
export OPENAI_BASE_URL="https://api.trinity.example/v1"
```

```typescript [TypeScript]
process.env.TRINITY_API_KEY = "sk-trinity-...";
process.env.OPENAI_BASE_URL = "https://api.trinity.example/v1";
```

```python [Python]
import os
os.environ["TRINITY_API_KEY"] = "sk-trinity-..."
os.environ["OPENAI_BASE_URL"] = "https://api.trinity.example/v1"
```

:::

### 发送首次请求

::: code-group

```bash [Shell]
curl "https://api.trinity.example/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TRINITY_API_KEY" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{ "role": "user", "content": "你好" }]
  }'
```

```typescript [TypeScript]
const res = await fetch("https://api.trinity.example/v1/chat/completions", {
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
    url="https://api.trinity.example/v1/chat/completions",
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

---

## 使用 OpenAI SDK

将官方 OpenAI SDK 的 `baseURL` 指向 Trinity，即可复用现有代码结构。

安装依赖（示例）：

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

```typescript [TypeScript]
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.TRINITY_API_KEY,
  baseURL: "https://api.trinity.example/v1",
});

const completion = await client.chat.completions.create({
  model: "openai/gpt-4o",
  messages: [{ role: "user", content: "你好" }],
});

console.log(completion.choices[0]?.message?.content);
```

```python [Python]
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["TRINITY_API_KEY"],
    base_url="https://api.trinity.example/v1",
)

completion = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "你好"}],
)
print(completion.choices[0].message.content)
```

:::

API 亦支持 `stream: true` 的 SSE，见 [流式 SSE](./guides/streaming-sse.md)。

---

## 模型标识

`model` 须为 **`provider/model`** 格式，例如：

- `openai/gpt-4o`
- `anthropic/claude-sonnet-4`

完整目录以产品 **模型列表** 页为准（与网关路由配置同步）。

## 下一步

- [对话补全 API](./api/chat-completions.md)
- [流式 SSE](./guides/streaming-sse.md)
- [错误码](./reference/error-codes.md)
