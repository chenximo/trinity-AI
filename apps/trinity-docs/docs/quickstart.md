# 快速入门

Trinity 当前仅提供 **OpenAI 兼容的 HTTP API** 接入：向网关发送标准 REST 请求（如 `POST /v1/chat/completions`），在请求头携带 API Key 即可调用平台提供的模型。

::: tip 重要 · 模型与密钥
- API Key 前缀一般为 **`xh-...`**（控制台创建后完整复制）。
- 请求里的 **`model`** 填**模型 ID**（与 [模型广场](https://trinity.ai/models) 列表一致），例如 `doubao-seed-1-6-thinking-agent-preview`。勿填写平台未提供的模型名。
- 请勿在公共仓库、前端 bundle 或日志中暴露完整密钥。
:::

有关流式、追踪/结算头与错误处理，见 [流式 SSE](./guides/streaming-sse.md)、[API 概述](./api/overview.md#追踪与结算请求头) 与 [错误码](./reference/error-codes.md)。

---

## 1. 创建 API 密钥

1. 登录 [Trinity AI 控制台](https://trinity.ai/account/console)（演示环境以实际部署域名为准）。
2. 进入 **API 密钥**，创建密钥并妥善保存（仅展示一次）。

也可参阅 [管理 API 密钥](./manage-api-keys.md)。

---

## 2. 配置接入地址与密钥

将网关 `base_url` 与密钥写入环境变量（生产基址示例见下；内测/私有化以运维为准）：

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

---

## 3. 发送首次 API 请求

请求体与 [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) 保持一致；可选传入追踪/结算头（见 [API 概述](./api/overview.md#追踪与结算请求头)）。

::: code-group

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "X-Request-Id: trace-demo-001" \
  -H "X-Idempotency-Key: settle-demo-001" \
  -d '{
    "model": "doubao-seed-1-6-thinking-agent-preview",
    "messages": [{ "role": "user", "content": "你好" }]
  }'
```

```typescript [TypeScript]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
    "X-Request-Id": crypto.randomUUID(),
    "X-Idempotency-Key": crypto.randomUUID(),
  },
  body: JSON.stringify({
    model: "doubao-seed-1-6-thinking-agent-preview",
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
        "X-Request-Id": "trace-demo-001",
        "X-Idempotency-Key": "settle-demo-001",
    },
    data=json.dumps({
        "model": "doubao-seed-1-6-thinking-agent-preview",
        "messages": [{"role": "user", "content": "你好"}],
    }),
)
print(response.json()["choices"][0]["message"]["content"])
```

:::

流式输出在请求体中设置 `"stream": true`，响应为 SSE，详见 [流式 SSE](./guides/streaming-sse.md)。

---

## 模型标识

请求体里的 **`model`** 必须填 Trinity 的**模型 ID**（英文 slug，如 `doubao-seed-1-6-thinking-agent-preview`），不是页面上的展示名，也不要直接照搬其他平台文档里的写法，除非该字符串出现在你账号的可用列表中。

### 客户如何获取模型 ID

**以你登录账号实际看到的列表为准**（与套餐、权限、区域有关）。

| 方式 | 操作 | 说明 |
| --- | --- | --- |
| **模型广场**（推荐） | 登录 [Trinity AI 控制台](https://trinity.ai/account/console)，打开 [模型广场](https://trinity.ai/models)，复制目标模型的 **模型 ID**，填入 `"model"` | 当前获取模型 ID 的方式 |

::: info
在 IDE / Agent 工具（Cursor 等）里手填或下拉的名称也应与模型广场中的 **ID** 一致，详见 [应用场景 · 编程工具](./cookbook/)。

若 `model` 不在可用列表中，网关会返回模型不存在类错误，见 [错误与调试](./reference/error-codes.md)。
:::

### 示例 ID（格式参考，调用前请核对列表）

- 生文：`doubao-seed-1-6-thinking-agent-preview`、`gpt-4o`
- 生图：`hunyuan-image`（`POST /v1/chat/completions` + `image_config`，见 [图像生成 API](./api/images-generations.md)）
- 生视频：`tencent/kling-2.6`（`POST /v1/video/generations`）

更多说明见 [API 概述 · 模型 ID](./api/overview.md#模型-idmodel-字段)。

## 下一步

| 能力 | 指南 | API |
| --- | --- | --- |
| 生文 | [流式输出](./guides/streaming-sse.md) | [创建对话补全](./api/chat-completions.md) |
| 生图 | [图片生成](./multimodal/image-generation.md) | [图像生成](./api/images-generations.md) |
| 生视频 | [视频生成](./multimodal/video-generation.md) | [创建视频任务](./api/videos-generations.md) |
| 编程工具 | [应用场景](./cookbook/) | Cursor / Claude Code / Codex CLI |

- [API 概述](./api/overview.md) · [请求参数](./guides/request-parameters.md) · [错误与调试](./reference/error-codes.md)
