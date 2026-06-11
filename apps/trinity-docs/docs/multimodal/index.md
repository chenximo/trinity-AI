# 多模态概述

## Trinity 多模态 API 概览

Trinity 在统一 HTTP API 下提供图片与视频的**输入理解**与**生成**能力。按场景选择路径与 Part 类型，避免混用。

| 场景 | 端点 | 要点 |
| --- | --- | --- |
| 图片 / 视频**输入**（模型理解） | `POST /v1/chat/completions` | `messages[].content` 中的 `image_url`、`file` 等 Part |
| **图片生成** | `POST /v1/chat/completions` | `modalities` + `image_config` |
| **视频生成** | `POST /v1/video/generations` | 异步任务 + `GET /video/tasks/{taskId}` 查询 |

`model` 填 [获取模型](../api/models.md) 或 [模型广场](https://trinity.ai/models) 中的模型 ID。

## 能力导航

| 主题 | 文档 |
| --- | --- |
| 图片输入 | [图片输入](./image-input) |
| 图片生成 | [图片生成](./image-generation) |
| 视频输入 | [视频输入](./video-input) |
| 视频生成 | [视频生成](./video-generation) |
