# 生视频

完整说明（模型发现、创建/轮询、`frame_images`、`input_references`、响应解析、排错）见 **[视频生成](../multimodal/video-generation.md)**。

## 最短路径

1. 在 [管理 API 密钥](../manage-api-keys.md) 创建 `xh-...` Key。
2. 在 [模型广场](https://trinity.ai/models) 选择生视频模型 ID（如 `tencent/kling-2.6`）。
3. `POST {TRINITY_BASE_URL}/video/generations` 提交 `model`、`prompt` 等。
4. 用返回的 `trinity_task.task_id` 轮询 `GET {TRINITY_BASE_URL}/video/tasks/{taskId}` 直至完成。

字段表与示例代码亦见 [创建视频生成任务](../api/videos-generations.md)、[高级参数 · 生视频](../api/video-generation-parameters.md)。

## 相关

- [视频生成](../multimodal/video-generation.md)
- [视频输入](../multimodal/video-input.md)（看视频，非生视频）
- [创建视频生成任务](../api/videos-generations.md)
