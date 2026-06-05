# Image generation · Advanced parameters

Image generation uses **`POST /v1/chat/completions`**. For concepts and examples, see [Image generation](../multimodal/image-generation.md); for the endpoint summary, see [Create image generation](./images-generations.md).

---

## Request body fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Image model, e.g. `hunyuan-image` |
| `messages` | array | Yes | Usually a `user` text prompt |
| `modalities` | array | Recommended | Include `image` (may also include `text`) |
| `stream` | boolean | No | Image generation **does not support** `true` |
| `image_config` | object | No | See below |

### `image_config`

| Field | Description |
| --- | --- |
| `image_size` | `1K` / `2K` / `4K`, depending on model |
| `aspect_ratio` | Common values below |
| `output_format` | Return preference: `url` / `base64` |
| `output_image_format` | `png` / `jpeg` |
| `person_generation` | Person-generation policy, depending on model |
| `input_compliance_check` | Input compliance check, `true` / `false` |
| `output_compliance_check` | Output compliance check |
| `custom_size` | e.g. `1024x1024` (some models) |
| `sequential_image_generation` | Sequential image generation (some models) |
| `reference_images[]` | `type: url`, `url`, optional `text` |

### Common `aspect_ratio` values

`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `4:5`, `5:4`, `21:9` — support depends on model capability.

::: warning
`trinity_async.*` is not supported for image generation; sending it returns `invalid_request`.
:::

---

## Difference from image input

| Capability | Image passing method |
| --- | --- |
| Text model seeing images | `messages[].content[]` · `type: image_url` → [Image input](../multimodal/image-input.md) |
| Image generation with reference images | `image_config.reference_images[]` |

---

## Full JSON example

```json
{
  "model": "hunyuan-image",
  "messages": [
    { "role": "user", "content": "Generate a cyberpunk futuristic city at night." }
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
        "text": "Keep the main building silhouette"
      }
    ]
  }
}
```

---

## Related

- [Image generation](../multimodal/image-generation.md)
- [Create image generation](./images-generations.md)
