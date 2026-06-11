# 快速入门

Trinity 提供 HTTP API：生文、多模态输入与生图走 `POST /v1/chat/completions`；视频生成走 `POST /v1/video/generations` 异步任务。`POST /v1/chat/completions` 兼容 OpenAI Chat Completions，替换 `base_url` 与 API Key 即可调用。

| 方式 | 适用场景 |
| --- | --- |
| **[HTTP API](#使用-api)** | 任意语言，直接发请求 |
| **[OpenAI SDK](#使用-openai-sdk)** | 已有 OpenAI SDK 代码，替换 `base_url` |
| **[应用场景](./cookbook/)** | Cursor、Codex CLI、WorkBuddy 等工具内配置 |

::: tip 重要 · 模型与密钥
- API Key 前缀一般为 **`xh-...`**（[控制台](https://trinitydesk.ai/account/keys) 创建后完整复制，仅展示一次）。
- 请求里的 **`model`** 填**模型 ID**（与 [模型广场](https://trinity.ai/models) 或 [获取模型](./api/models.md) 列表一致），例如 `gpt-5.5`。
- 请勿在公共仓库、前端 bundle 或日志中暴露完整密钥。
:::

可选传入 `X-Request-Id`、`X-Idempotency-Key` 等追踪/结算头，见 [API 概述](./api/overview.md#追踪与结算请求头)。流式与排错见 [流式 SSE](./guides/streaming-sse.md)、[错误码](./reference/error-codes.md)。

---

## 准备工作

1. 在 [控制台 · API 密钥](https://trinitydesk.ai/account/keys) 创建 API Key。
2. 配置环境变量（专属部署请以交付信息为准）：

::: code-group

```bash [Shell]
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
```

```typescript [TypeScript]
process.env.TRINITY_API_KEY = "xh-...";
process.env.TRINITY_BASE_URL = "https://api.trinitydesk.ai/v1";
```

```python [Python]
import os
os.environ["TRINITY_API_KEY"] = "xh-..."
os.environ["TRINITY_BASE_URL"] = "https://api.trinitydesk.ai/v1"
```

:::

也可参阅 [管理 API 密钥](./manage-api-keys.md)。

---

## 使用 API

向 `{TRINITY_BASE_URL}/chat/completions` 发送标准 HTTP 请求，请求/响应格式兼容 OpenAI Chat Completions。下文示例使用 `gpt-5.5`；请改为你账号可见的模型 ID。

::: code-group

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
        "model": "gpt-5.5",
        "messages": [{"role": "user", "content": "你好"}],
    }),
)
print(response.json()["choices"][0]["message"]["content"])
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
    "messages": [{ "role": "user", "content": "你好" }]
  }'
```

:::

流式输出在请求体中设置 `"stream": true`，响应为 SSE，详见 [流式 SSE](./guides/streaming-sse.md)。字段说明见 [创建对话补全](./api/chat-completions.md)。

---

## 使用 OpenAI SDK

可将 OpenAI 官方 SDK 的 `base_url` 指向 Trinity，无需改动 `chat.completions.create` 调用结构。

安装依赖：

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

```python [Python]
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ["TRINITY_BASE_URL"],
    api_key=os.environ["TRINITY_API_KEY"],
)

completion = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "你好"}],
)
print(completion.choices[0].message.content)
```

```typescript [TypeScript]
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: process.env.TRINITY_BASE_URL,
  apiKey: process.env.TRINITY_API_KEY,
});

const completion = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [{ role: "user", content: "你好" }],
});
console.log(completion.choices[0].message.content);
```

:::

---

## 模型 ID

请求体里的 **`model`** 须填 Trinity **模型 ID**（英文 slug），与 [获取模型](./api/models.md) 或 [模型广场](https://trinity.ai/models) 列表一致，勿填展示名。

| 方式 | 操作 |
| --- | --- |
| **`GET /models`** | 调用 [获取模型](./api/models.md)（可选 `?modality=text\|image\|video`），取 `data[].id` |
| **模型广场** | 登录 [模型广场](https://trinity.ai/models) 复制 **模型 ID** |

示例（调用前请核对列表）：生文 `gpt-5.5`；生图 `hunyuan-image`；生视频 `kling-2.6`。

---

## 下一步

| 能力 | 指南 | API |
| --- | --- | --- |
| 生文 | [流式输出](./guides/streaming-sse.md) | [创建对话补全](./api/chat-completions.md) |
| 生图 | [图片生成](./multimodal/image-generation.md) | [图像生成](./api/images-generations.md) |
| 生视频 | [视频生成](./multimodal/video-generation.md) | [创建视频任务](./api/videos-generations.md) |
| 编程工具 | [应用场景](./cookbook/) | Cursor / Claude Code / Codex CLI |

- [API 概述](./api/overview.md) · [请求参数](./guides/request-parameters.md) · [错误与调试](./reference/error-codes.md)
