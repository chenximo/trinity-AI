# 常见问题

## 如何获取 API 密钥？

在控制台 **API 密钥** 中创建，详见 [管理 API 密钥](./manage-api-keys)。

## 目前支持哪些接入方式？

仅 **HTTP API**（OpenAI 兼容 REST）。见 [快速入门](./quickstart)。

## 一期支持哪些能力？

| 能力 | 说明 |
| --- | --- |
| 生文 | `POST /v1/chat/completions`，支持流式 |
| 生图 | `POST /v1/images/generations` |
| 生视频 | `POST /v1/videos/generations`（可能异步） |

## 模型名称格式是什么？

`provider/model`，例如 `openai/gpt-4o`。见 [API 概述](./api/overview.md)。

## 流式、错误、限额在哪里查？

- [流式输出](./guides/streaming-sse.md)
- [错误与调试](./reference/error-codes.md)
- [速率与限额](./guides/rate-limits.md)

## 文档样例与线上不一致怎么办？

文档请求体对齐 OpenAI / OpenRouter 样例，**以 Trinity 网关实际 OpenAPI 为准**；发现差异请反馈并更新对应 md。

::: info
更多 FAQ 随产品发布补充；二期可由运营后台发布 Markdown 触发构建。
:::
