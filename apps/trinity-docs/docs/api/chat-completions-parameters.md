# 对话补全 · 高级参数

本文档供**调参、联调、对字段**使用。端点速览与可复制示例见 [创建对话补全](./chat-completions.md)。

---

## 请求体字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 模型 ID，见 [模型广场](https://trinity.ai/models) |
| `messages` | array | 是 | 见下节 `messages[]` |
| `stream` | boolean | 否 | 默认 `false` |
| `stream_options` | object | 否 | `include_usage`、`chunk_include_usage`（仅 `stream=true`） |
| `temperature` | number | 否 | 常用 `0~2` |
| `top_p` | number | 否 | 常用 `0~1` |
| `max_tokens` | integer | 否 | 与 `max_completion_tokens` **互斥** |
| `max_completion_tokens` | integer | 否 | `1~65536` |
| `thinking_enabled` | boolean | 否 | 深度思考；按模型能力 |
| `reasoning_effort` | string | 否 | `none` / `minimal` / `low` / `medium` / `high` 等 |
| `stop` | string \| string[] | 否 | 停止词，最多 4 个 |
| `response_format` | object \| string | 否 | `text` / `json_object` / `json_schema` |
| `frequency_penalty` | number | 否 | 按模型能力 |
| `presence_penalty` | number | 否 | 按模型能力 |
| `logprobs` | boolean | 否 | 按模型能力 |
| `top_logprobs` | integer | 否 | 需 `logprobs=true` |
| `tools` | array | 否 | `type: function` + `function.name` |
| `parallel_tool_calls` | boolean | 否 | 默认 `true` |
| `tool_choice` | string \| object | 否 | `none` / `auto` / `required` 或指定 function |
| `modalities` | array | 否 | 生文建议省略或 `["text"]` |

### `messages[]`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `role` | string | 否 | `system` / `user` / `assistant` / `tool` |
| `content` | string \| array | 是 | string 或 Part 数组 |
| `tool_calls` | array | 否 | 仅 `role=assistant` |
| `tool_call_id` | string | 否 | 仅 `role=tool` 时必传 |

### Part（`content` 为数组）

| `type` | 说明 |
| --- | --- |
| `text` | `{ "type": "text", "text": "..." }` |
| `image_url` | URL 或 `data:image/...;base64,...`；详见 [图片输入](../multimodal/image-input.md) |
| `input_audio` | `input_audio.data`（Base64）+ `format`：`mp3` / `wav` |
| `file` | `file_url`（≤70MB，可传视频）；可选 `file_name`；详见 [视频输入](../multimodal/video-input.md) |

::: info
Part 用于**生文看图/听音/读文件**。生图参考图用 `image_config.reference_images`，见 [图像生成 · 高级参数](./image-generation-parameters.md)。
:::

---

## 追踪与结算请求头

| 请求头 | 说明 |
| --- | --- |
| `X-Request-Id` | 追踪 ID；最长 128 字符 |
| `X-Idempotency-Key` | 结算幂等；**重试同一笔业务须不变** |
| `X-Conversation-Id` | 会话分组；多轮 Agent / Prompt Cache 建议固定传同一值 |

::: tip
不传 `X-Idempotency-Key` 时每次 HTTP 调用独立计费。网络超时重放应**固定结算键**。
:::

---

## Prompt Cache {#prompt-cache}

适用于**支持 Prompt Cache 的生文模型**（以 [模型广场](https://trinity.ai/models) 说明为准）。网关自动维护会话上下文，**客户端无需在 body 中传缓存控制字段**。

### 提升命中率

同一 Agent 或多轮 Chat 内，请**固定** `X-Conversation-Id`（未传时可用 `X-Session-Id`）。频繁更换会话 ID 会降低缓存命中。

### 响应 `usage`

| 字段 | 说明 |
| --- | --- |
| `usage.prompt_tokens_details.cached_tokens` | 从缓存读取的 input token 数（命中时 **> 0**） |
| `usage.prompt_tokens_details.cache_write_tokens` | 首次写入缓存的 token 数（若上游返回） |

流式请求在**最后一个** SSE chunk 中附带上述字段（需 `stream_options.include_usage`），见 [流式输出（SSE）](../guides/streaming-sse.md)。

示例（非流式）：

```json
{
  "usage": {
    "prompt_tokens": 1500,
    "completion_tokens": 120,
    "total_tokens": 1620,
    "prompt_tokens_details": {
      "cached_tokens": 1200
    }
  }
}
```

### 计费

模型已配置 **cached input** 单价时，input 费用大致为：

- 未缓存 prompt × input 单价
- 缓存命中 prompt × cached input 单价（通常低于 input）
- completion × output 单价

若模型尚未配置 cached input 价目，缓存命中的 token **暂按 input 单价**计费。具体单价以控制台与模型说明为准。

---

## 思考模式（按模型）

| 模型示例 | 约束摘要 |
| --- | --- |
| `gpt-5.1` / `gpt-5.2` / `gpt-4o` | 不支持 `thinking_enabled` / `reasoning_effort` |
| `gemini-3-pro-preview` | 不允许 `thinking_enabled=false`；`reasoning_effort` 为 `low` / `medium` / `high` |
| `gemini-3-flash-preview` | 默认开启思考；`reasoning_effort` 含 `minimal` 等 |

以 [模型广场](https://trinity.ai/models) 与实际上线能力为准。

---

## 完整 JSON 示例

```json
{
  "model": "doubao-seed-1-6-thinking-agent-preview",
  "messages": [
    { "role": "system", "content": "你是一个专业助手。" },
    { "role": "user", "content": "你好" }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024,
  "thinking_enabled": true,
  "reasoning_effort": "medium",
  "tools": [],
  "tool_choice": "auto"
}
```

---

## 相关

- [创建对话补全](./chat-completions.md)
- [API 概述](./overview.md)
- [流式输出（SSE）](../guides/streaming-sse.md)
- [错误与调试](../reference/error-codes.md)
