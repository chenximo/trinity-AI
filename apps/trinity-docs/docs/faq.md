# 常见问题

## 如何获取 API 密钥？

在控制台 **API 密钥** 中创建，详见 [管理 API 密钥](./manage-api-keys)。

## 目前支持哪些接入方式？

仅 **HTTP API**（OpenAI 兼容 REST）。见 [快速入门](./quickstart)。

## 目前支持哪些能力？

| 能力 | 说明 |
| --- | --- |
| 生文 | `POST /v1/chat/completions`，支持流式 |
| 生图 | `POST /v1/chat/completions` + `modalities` / `image_config` |
| 生视频 | `POST /v1/video/generations`，查询 `GET /v1/video/tasks/{taskId}` |

## 模型名称格式是什么？

请求体里的 **`model`** 即**模型 ID** 字符串，须与 [模型广场](https://trinity.ai/models) 列表一致，例如 `gpt-5.5`、`hunyuan-image`、`kling-2.6`。详见 [API 概述 · 模型 ID](./api/overview.md#模型-idmodel-字段)。

## API Key 是什么格式？

控制台创建的密钥，前缀一般为 **`xh-...`**。请求头写 `Authorization: Bearer xh-...`。

## 流式、错误、限额在哪里查？

- [流式输出](./guides/streaming-sse.md)
- [错误与调试](./reference/error-codes.md)
- [速率与限额](./guides/rate-limits.md)

## 文档与线上行为不一致怎么办？

请以您实际调用的网关响应为准。若与本文档描述不符，请通过控制台工单或您的客户成功/技术支持渠道反馈，并附上请求 ID（`X-Request-Id`）与结算键（`X-Settlement-Key`，若已使用）便于排查。

::: info
更多 FAQ 将随产品能力更新补充。
:::
