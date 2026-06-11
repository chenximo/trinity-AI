# 快速入门

## 开始使用 Trinity AI

Trinity AI 提供统一的 HTTP API 网关：通过单一 `base_url` 与 API Key 调用平台接入的生文、多模态输入、生图等能力；`model` 指定 [模型广场](https://trinity.ai/models) 或 [获取模型](./api/models.md) 中的模型 ID。视频生成走 `POST /v1/video/generations` 异步任务。

根据集成方式，有两种常见路径：

| 方法 | 最适合 |
| --- | --- |
| **[HTTP API](#使用-api)** | 完全控制，任意语言，直接发 HTTP 请求 |
| **[应用场景](./cookbook/)** | Cursor、Codex CLI、WorkBuddy 等 IDE / Agent 内配置 |

::: tip 重要 · 模型与密钥
- API Key 前缀一般为 **`xh-...`**（[控制台](https://trinitydesk.ai/account/keys) 创建后完整复制，仅展示一次）。
- 请求里的 **`model`** 填**模型 ID**（非展示名），须与账号可见列表一致，例如 `gpt-5.5`。
- 请勿在公共仓库、前端 bundle 或日志中暴露完整密钥。
:::

::: info
`X-Request-Id`、`X-Idempotency-Key` 等追踪/结算头为**可选**，用于排障与重试幂等，见 [API 概述](./api/overview.md#追踪与结算请求头)。限额说明见 [速率限制](./guides/rate-limits.md)；其他问题见 [常见问题](./faq.md)。
:::

---

## 认证与接入地址

1. 在 [控制台 · API 密钥](https://trinitydesk.ai/account/keys) 创建 API Key。
2. 配置环境变量（生产基址如下；专属部署以交付信息为准）：

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

详见 [管理 API 密钥](./manage-api-keys.md)。

---

## 使用 API

最直接的方式：向 **`{TRINITY_BASE_URL}/chat/completions`** 发送标准 HTTP POST——兼容任意语言或框架。

下文示例使用 `gpt-5.5`。请将 `model` 改为你账号可见的模型 ID（`GET /models` 或 [模型广场](https://trinity.ai/models)）。

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

API 亦支持流式：请求体设置 `"stream": true`，响应为 SSE，见 [流式 SSE](./guides/streaming-sse.md)。完整字段见 [创建对话补全](./api/chat-completions.md)。

---

## 下一步

| 能力 | 指南 | API |
| --- | --- | --- |
| 生文 / 流式 | [流式输出](./guides/streaming-sse.md) | [创建对话补全](./api/chat-completions.md) |
| 图片输入 / 生成 | [多模态](./multimodal/) | [图像生成](./api/images-generations.md) |
| 视频输入 / 生成 | [视频生成](./multimodal/video-generation.md) | [创建视频任务](./api/videos-generations.md) |
| IDE / Agent 配置 | [应用场景](./cookbook/) | [Cursor](./cookbook/coding-agents/cursor) · [Codex CLI](./cookbook/coding-agents/codex-cli) · [WorkBuddy](./cookbook/agent-workbench/workbuddy) |
| 模型列表 | — | [获取模型](./api/models.md) |

- [API 概述](./api/overview.md) · [请求参数](./guides/request-parameters.md) · [错误与调试](./reference/error-codes.md)
