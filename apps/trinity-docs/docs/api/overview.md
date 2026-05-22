# API 概述

Trinity 对外提供 **OpenAI 兼容的 HTTP API**。所有请求经统一网关鉴权与路由，按 `provider/model` 转发至上游。

::: info 样例说明
下文基址、路径与字段与 [OpenAI API](https://platform.openai.com/docs/api-reference) / [OpenRouter](https://openrouter.ai/docs) 对齐，供集成参考；**上线前请按 Trinity 网关实际实现校验**。
:::

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

密钥在控制台创建，见 [管理 API 密钥](../manage-api-keys.md)。

## 一期能力

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 生文（对话补全） | `POST` | `/chat/completions` |
| 生图 | `POST` | `/images/generations` |
| 生视频 | `POST` | `/videos/generations` |

## 模型标识

`model` 使用 **`provider/model`**，例如 `openai/gpt-4o`、`google/gemini-2.0-flash-exp:free`。各端点可用模型以产品模型列表为准。

## 响应与错误

- 成功：JSON 体，结构对齐 OpenAI 同端点（字段可能随上游略有差异）。
- 失败：OpenAI 风格 `error` 对象；见 [错误与调试](../reference/error-codes.md)。

## 相关

- [快速入门](../quickstart.md)
- [请求参数](../guides/request-parameters.md)
- [对话补全](./chat-completions.md)
