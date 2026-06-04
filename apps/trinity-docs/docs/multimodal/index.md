# 多模态概述

Trinity 支持在统一 API 下处理**图片与视频**等多模态输入与生成能力。

::: info
`model` 为模型广场中的模型 ID；多模态**输入**在 `POST /v1/chat/completions` 的 `messages[].content` Part 数组中传递（如 `image_url`、`file` 等，与 OpenAI 结构兼容）。**生图**使用同路径 `modalities` + `image_config`（见 [图片生成](./image-generation.md)）。**生视频**使用 `POST /v1/video/generations` 异步任务（见 [视频生成](./video-generation.md)）。
:::

## 能力导航

| 主题 | 文档 |
| --- | --- |
| 图片输入 | [图片输入](./image-input) |
| 图片生成 | [图片生成](./image-generation) |
| 视频输入 | [视频输入](./video-input) |
| 视频生成 | [视频生成](./video-generation) |
