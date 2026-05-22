# 请求参数

本文说明一期 MVP 各 API 的**通用约定**与**分能力字段**。样例与 OpenAI 文档结构一致，具体枚举以网关实现为准。

## 通用

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | string | **必填**。`provider/model` |
| （Header）`Authorization` | string | **必填**。`Bearer <API_KEY>` |

## 生文 · `POST /v1/chat/completions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `messages` | array | **必填**。`role` + `content` |
| `stream` | boolean | 可选。`true` 时 SSE，见 [流式输出](./streaming-sse.md) |
| `temperature` | number | 可选。采样温度 |
| `max_tokens` | integer | 可选。最大生成 token |

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/chat/completions" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{ "role": "user", "content": "你好" }]
  }'
```

:::

详见 [对话补全 API](../api/chat-completions.md)。

## 生图 · `POST /v1/images/generations`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `prompt` | string | **必填**。图像描述 |
| `n` | integer | 可选。生成张数，默认 1 |
| `size` | string | 可选。如 `1024x1024`（以模型支持为准） |
| `response_format` | string | 可选。`url` 或 `b64_json` |

详见 [生图指南](./image-generation.md) 与 [图像生成 API](../api/images-generations.md)。

## 生视频 · `POST /v1/videos/generations`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `prompt` | string | **必填**。视频描述 |
| `duration` | integer | 可选。秒数（以模型支持为准） |
| `aspect_ratio` | string | 可选。如 `16:9` |

部分上游为**异步任务**，响应可能仅返回 `id`，需再查询状态。详见 [生视频指南](./video-generation.md)。

::: info
异步轮询路径与状态枚举 **待产品确认** 后更新 [视频生成 API](../api/videos-generations.md)。
:::

## 相关

- [API 概述](../api/overview.md)
- [错误与调试](../reference/error-codes.md)
