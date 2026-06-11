# 请求参数

Trinity 将 **API Reference** 放在 **API** 顶栏下。本页是**跨能力索引**：说明通用头与常见字段去哪查，**不**替代各能力的全字段表。

| 层级 | 位置 | 适合什么问题 |
| --- | --- | --- |
| **端点（短）** | [API](../api/overview.md) · 各端点页 | 复制 curl、跑通最小请求 |
| **高级参数（长）** | [API](../api/overview.md) · 「高级参数」分组 | 调参、联调、对全字段 |
| **概念指南** | [文档](../quickstart.md) · [流式](./streaming-sse.md) / 多模态 | 语义、流程、易混说明 |

端点短页负责跑通请求；采样参数、全字段 schema 见各能力的 **高级参数** 页（如 [对话补全高级参数](../api/chat-completions-parameters.md)）。

---

## HTTP 请求头（通用）

适用于 **`POST /v1/chat/completions`**（生文、生图、流式）及多数 JSON API。生视频创建任务以 [创建视频生成任务](../api/videos-generations.md) 为准。

| 请求头 | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 是 | `Bearer xh-...`（见 [管理 API 密钥](../manage-api-keys.md)） |
| `Content-Type` | 是 | `application/json` |
| `Accept` | 流式时建议 | 流式生文：`text/event-stream` |
| `X-Request-Id` | 否 | **追踪 ID**，排障关联；最长 128 字符 |
| `X-Idempotency-Key` | 否 | **结算幂等键**；同 workspace 内相同键仅首笔成功扣费；**重试须不变** |
| `X-Conversation-Id` | 否 | 会话分组；多轮 Agent / Prompt Cache 建议固定传同一值；最长 128 字符 |
| `X-Session-Id` | 否 | `X-Conversation-Id` 别名；仅当未传后者时生效 |

成功或失败响应（**含 SSE**）通常回写 `X-Request-Id`、`X-Settlement-Key`；传入 `X-Conversation-Id` 时会回写该头。

### Prompt Cache（生文）

部分生文模型支持 **Prompt Cache**：对多轮对话中重复的前缀 prompt 降低 input 成本。网关自动维护会话上下文，**无需在请求体中传额外缓存控制字段**。

- **提升命中率**：同一 Agent / Chat 任务内固定 `X-Conversation-Id`（或 `X-Session-Id`）。
- **查看命中**：响应 `usage.prompt_tokens_details.cached_tokens`（流式时在最后一个 chunk，需 `stream_options.include_usage`）。
- **计费说明**：模型已配置 cached input 单价时，缓存命中的 input 按该单价计费；否则暂按 input 单价。详见 [对话补全 · 高级参数 · Prompt Cache](../api/chat-completions-parameters.md#prompt-cache)。

::: warning 计费
不传 `X-Idempotency-Key` 时，每次 HTTP 调用**独立计费**。网络超时后重放同一笔业务：**保持结算键不变**，追踪 ID 可换可不变。
:::

详见 [API 概述 · 追踪与结算](../api/overview.md#追踪与结算请求头)。

---

## 请求体：`model` 与能力入口

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `model` | 是 | **模型 ID**；通过 [获取模型](../api/models.md) 或 [模型广场](https://trinity.ai/models) 获取；勿使用列表中不存在的 ID |

发现可用模型：`GET /models`，可选 `modality=text|image|video|all`。勿依赖 `output_modalities` 等第三方专属查询参数。字段见 [获取模型 · 高级参数](../api/models-parameters.md)。

---

## 生文 · 常用 body 字段（摘要）

完整表见 [高级参数 · 生文](../api/chat-completions-parameters.md)。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `messages` | array | **必填**。`role` + `content`（string 或 Part 数组） |
| `stream` | boolean | 默认 `false`；`true` 时见 [流式输出（SSE）](./streaming-sse.md) |
| `stream_options` | object | 仅 `stream=true`；如 `include_usage` |
| `temperature` | number | 采样随机性，常用 `0~2` |
| `top_p` | number | nucleus 采样，常用 `0~1` |
| `max_tokens` | integer | 与 `max_completion_tokens` **互斥** |
| `max_completion_tokens` | integer | 含思维链时的输出上限 |
| `thinking_enabled` / `reasoning_effort` | boolean / string | 深度思考；**按模型能力** |
| `stop` | string \| string[] | 停止词 |
| `response_format` | object \| string | 结构化输出 |
| `tools` / `tool_choice` / `parallel_tool_calls` | — | 工具调用 |
| `modalities` | array | 纯生文建议省略或 `["text"]` |

多模态 **输入**（`image_url`、`file` 等 Part）见 [图片输入](../multimodal/image-input.md)、[视频输入](../multimodal/video-input.md)。

---

## 生图 · 与「生文参数」的差异

生图走 **同一路径** `POST /v1/chat/completions`，但须额外设置：

| 字段 | 说明 |
| --- | --- |
| `modalities` | 须含 `image`（常配合 `text`） |
| `image_config` | 画幅、分辨率、参考图等 |

| 勿用 | 原因 |
| --- | --- |
| `stream: true` | 生图**不支持**流式 |
| `trinity_async.*` | 生图不支持，传入报 `invalid_request` |

详见 [图片生成](../multimodal/image-generation.md)、[高级参数 · 生图](../api/image-generation-parameters.md)。

---

## 生视频 · 独立端点参数

| 步骤 | 方法 | 路径 | 主要 body 字段 |
| --- | --- | --- | --- |
| 创建 | `POST` | `/video/generations` | `model`、`prompt`、`duration_sec`、`frame_images`… |
| 查询 | `GET` | `/video/tasks/{taskId}` | 路径参数 `taskId` |

详见 [视频生成](../multimodal/video-generation.md)、[高级参数 · 生视频](../api/video-generation-parameters.md)。

---

## 分能力文档入口

| 能力 | 端点短页 | 高级参数 |
| --- | --- | --- |
| 生文 | [创建对话补全](../api/chat-completions.md) | [高级参数 · 生文](../api/chat-completions-parameters.md) |
| 生图 | [创建图像生成](../api/images-generations.md) | [高级参数 · 生图](../api/image-generation-parameters.md) |
| 生视频 | [创建视频生成任务](../api/videos-generations.md) | [高级参数 · 生视频](../api/video-generation-parameters.md) |

---

## 易混对照

| 你想做的事 | 看的参数 / 文档 |
| --- | --- |
| 调 `temperature`、`tools` | [高级参数 · 生文](../api/chat-completions-parameters.md) |
| 看图、看视频（输入） | Part · [多模态输入](../multimodal/) |
| 文生图、`image_config` | [图片生成](../multimodal/image-generation.md) |
| 流式打字机效果 | [流式输出（SSE）](./streaming-sse.md) |
| 超时重试不重复扣费 | `X-Idempotency-Key` · [API 概述](../api/overview.md) |

---

## 相关

- [API 概述](../api/overview.md)
- [流式输出（SSE）](./streaming-sse.md)
- [快速入门](../quickstart.md)
- [错误与调试](../reference/error-codes.md)
