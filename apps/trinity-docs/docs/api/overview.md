# API 概述

Trinity 对外提供 **OpenAI 兼容的 HTTP API**。请求经统一网关鉴权与路由，按请求体中的 **`model`（模型 ID）** 转发至对应模型服务。

## 基址

| 项 | 值（示例） |
| --- | --- |
| Base URL | `https://api.trinity.example/v1` |
| 协议 | HTTPS |

路径均相对于 **含 `/v1` 的 base**（如 `POST {TRINITY_BASE_URL}/chat/completions`）。

## 鉴权

每个请求须携带：

```http
Authorization: Bearer <TRINITY_API_KEY>
Content-Type: application/json
```

- API Key 在控制台创建，前缀一般为 **`xh-...`**（见 [管理 API 密钥](../manage-api-keys.md)）。
- 仅填 Key 本体，不要重复写 `Bearer` 前缀到环境变量里。

## 追踪与结算（请求头）

适用于 **`POST /v1/chat/completions`**（含生文、生图）及流式响应；生视频创建任务以网关说明为准。

| 请求头 | 必填 | 作用 |
| --- | --- | --- |
| `X-Request-Id` | 否 | **追踪 ID**，排障与日志关联；最长 128 字符；未传时服务端生成 |
| `X-Idempotency-Key` | 否 | **结算幂等键**；同 workspace 内相同键仅首笔成功扣费；**重试须保持不变** |
| `X-Conversation-Id` | 否 | 会话分组 ID；最长 128 字符 |

响应（含 SSE）建议回写：`X-Request-Id`、`X-Settlement-Key`；传入 `X-Conversation-Id` 时回写该头。

::: warning 计费
不传 `X-Idempotency-Key` 时，每次 HTTP 调用独立计费。网络超时重放同一笔业务时，应**固定结算键**、可更换追踪 ID。
:::

详见 [对话补全](./chat-completions.md) 示例中的请求头。

## 当前支持的能力

| 能力 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 生文（创建对话补全） | `POST` | `/chat/completions` | 纯文本、工具调用、多模态输入（Part） |
| 生图 | `POST` | `/chat/completions` | 须 `modalities` 含 `image` + `image_config`（**非** `/images/generations`） |
| 生视频 | `POST` | `/video/generations` | 创建异步任务 |
| 查询视频任务 | `GET` | `/video/tasks/{taskId}` | `taskId` 为创建返回的 `trinity_task.task_id` |

## 模型 ID（`model` 字段）

请求体中的 **`model`** 填写**模型 ID** 字符串，须与 Trinity 当前对外提供的模型一致。示例（以你账号可见列表为准）：

- 生文：`doubao-seed-1-6-thinking-agent-preview`、`gpt-4o`
- 生图：`hunyuan-image`
- 生视频：`tencent/kling-2.6`

**如何查可用模型 ID**：登录后打开 [模型广场](https://trinity.ai/models)，复制目标模型的 **模型 ID** 填入 `model`。填写列表中不存在的 ID 会返回「模型不存在」类错误。

## 响应与错误

- 成功：JSON 或 SSE（`stream: true`），结构对齐 OpenAI 同能力（字段可能随上游略有差异）。
- 失败：OpenAI 风格 `error` 对象；见 [错误与调试](../reference/error-codes.md)。

## 文档分层（对齐 OpenRouter）

| 类型 | 说明 |
| --- | --- |
| **API 端点页**（本轨） | 短页：`POST`、鉴权、P0 字段、代码示例（对标 OR API Reference） |
| **高级参数**（API 轨） | 全字段表、调参与联调：侧栏「高级参数」或 [请求参数索引](../guides/request-parameters.md) |
| **流程指南** | 流式 SSE、生图/生视频流程、多模态概念 |

## 相关

- [快速入门](../quickstart.md)
- [请求参数](../guides/request-parameters.md)
- [创建对话补全](./chat-completions.md)
- [创建图像生成](./images-generations.md)
- [创建视频生成任务](./videos-generations.md)
