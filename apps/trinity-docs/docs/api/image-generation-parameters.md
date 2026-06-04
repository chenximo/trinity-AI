# 图像生成 · 高级参数

生图走 **`POST /v1/chat/completions`**。概念与示例见 [图片生成](../multimodal/image-generation.md)；端点速览见 [创建图像生成](./images-generations.md)。

---

## 请求体字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 生图模型，如 `hunyuan-image` |
| `messages` | array | 是 | 通常 `user` 文本为 prompt |
| `modalities` | array | 建议 | 含 `image`（可含 `text`） |
| `stream` | boolean | 否 | 生图**不支持** `true` |
| `image_config` | object | 否 | 见下表 |

### `image_config`

| 字段 | 说明 |
| --- | --- |
| `image_size` | `1K` / `2K` / `4K` 等（按模型） |
| `aspect_ratio` | 见下节常用宽高比 |
| `output_format` | 返回偏好：`url` / `base64` |
| `output_image_format` | `png` / `jpeg` |
| `person_generation` | 人物生成策略（按模型） |
| `input_compliance_check` | 输入合规，`true` / `false` |
| `output_compliance_check` | 输出合规 |
| `custom_size` | 如 `1024x1024`（部分模型） |
| `sequential_image_generation` | 顺序生成（部分模型） |
| `reference_images[]` | `type: url`、`url`、可选 `text` |

### `aspect_ratio` 常用值

`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`4:5`、`5:4`、`21:9` — 是否生效以模型能力为准。

::: warning
`trinity_async.*` 生图当前不支持，传入会 `invalid_request`。
:::

---

## 与生文传图的区别

| 能力 | 传图方式 |
| --- | --- |
| 生文看图 | `messages[].content[]` · `type: image_url` → [图片输入](../multimodal/image-input.md) |
| 生图参考图 | `image_config.reference_images[]` |

---

## 完整 JSON 示例

```json
{
  "model": "hunyuan-image",
  "messages": [
    { "role": "user", "content": "生成一张未来城市夜景，赛博朋克风格。" }
  ],
  "modalities": ["image", "text"],
  "image_config": {
    "aspect_ratio": "1:1",
    "image_size": "1K",
    "output_format": "url",
    "reference_images": [
      {
        "type": "url",
        "url": "https://example.com/ref.png",
        "text": "保持主建筑轮廓"
      }
    ]
  }
}
```

---

## 相关

- [图片生成](../multimodal/image-generation.md)
- [创建图像生成](./images-generations.md)
- [生图指南](../guides/image-generation.md)
