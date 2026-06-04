# 生图

完整说明（模型发现、`modalities`、`image_config`、响应解析、排错）见 **[图片生成](../multimodal/image-generation.md)**（对齐 [OpenRouter · Image Generation](https://openrouter.ai/docs/guides/overview/multimodal/image-generation)）。

## 最短路径

1. 在 [管理 API 密钥](../manage-api-keys.md) 创建 `xh-...` Key。
2. 在 [模型广场](https://trinity.ai/models) 选择生图模型 ID（如 `hunyuan-image`）。
3. `POST {TRINITY_BASE_URL}/chat/completions`，设置 `modalities`（含 `image`）与可选 `image_config`。

字段表与示例代码亦见 [创建图像生成](../api/images-generations.md)、[高级参数 · 生图](../api/image-generation-parameters.md)。

## 相关

- [图片生成](../multimodal/image-generation.md)
- [图片输入](../multimodal/image-input.md)（看图，非生图）
- [创建对话补全](../api/chat-completions.md)
