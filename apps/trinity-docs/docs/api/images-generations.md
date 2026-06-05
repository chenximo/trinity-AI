# 创建图像生成

向生图模型发送文本提示词，生成图片结果。适用于文生图、带参考图的图生图，以及需要同时返回文本说明与图片的场景。

Trinity 的图片生成复用 `/chat/completions` 路径，通过 `modalities` 声明图片输出，并用 `image_config` 控制画幅、格式、参考图等参数。它**不是** `POST /images/generations`。

::: warning 易混
| 能力 | 使用方式 |
| --- | --- |
| 生文看图 | 在 `messages[].content[]` 中传 `type: image_url` |
| 生成图片 | 设置 `modalities` 包含 `image`，并按需传 `image_config` |
:::

---

## Endpoint

| Method | URL |
| --- | --- |
| `POST` | `{TRINITY_BASE_URL}/chat/completions` |

---

## Authentication

**Authorization** · Bearer — 同 [创建对话补全](./chat-completions.md)。

---

## Headers

| 请求头 | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 是 | `Bearer <TRINITY_API_KEY>` |
| `Content-Type` | 是 | `application/json` |

---

## 最小请求示例

```bash
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "hunyuan-image",
    "messages": [{ "role": "user", "content": "赛博朋克风格未来城市夜景" }],
    "modalities": ["image", "text"]
  }'
```

---

## Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 生图模型，如 `hunyuan-image` |
| `messages` | array | 是 | 通常为 `user` 文本 prompt |
| `modalities` | array | 建议 | 包含 `image`；需要文本说明时可同时包含 `text` |
| `stream` | boolean | 否 | 生图不支持 `true`，请省略或设为 `false` |
| `image_config` | object | 否 | 宽高比、返回格式、参考图等 |

`image_config` 全字段见 [图像生成 · 高级参数](./image-generation-parameters.md)。完整用法见 [图片生成指南](../multimodal/image-generation.md)。

---

## Response

成功时返回 OpenAI 风格 JSON。生成图片通常位于 `choices[0].message.images` 或模型返回的图片字段中；具体字段以模型响应为准。

---

## SDK 代码示例

::: code-group

```python [Python]
import json, os, requests

r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "hunyuan-image",
        "messages": [{"role": "user", "content": "赛博朋克风格未来城市夜景"}],
        "modalities": ["image", "text"],
        "image_config": {"aspect_ratio": "1:1", "output_format": "url"},
    }),
)
print(r.json())
```

```typescript [TypeScript (fetch)]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "hunyuan-image",
    messages: [{ role: "user", content: "赛博朋克风格未来城市夜景" }],
    modalities: ["image", "text"],
    image_config: { aspect_ratio: "1:1", output_format: "url" },
  }),
});
console.log(await res.json());
```

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "hunyuan-image",
    "messages": [{ "role": "user", "content": "赛博朋克风格未来城市夜景" }],
    "modalities": ["image", "text"],
    "image_config": { "aspect_ratio": "1:1", "output_format": "url" }
  }'
```

:::

---

## 相关

- [图片生成（完整指南）](../multimodal/image-generation.md)
- [高级参数 · 生图](./image-generation-parameters.md)
- [图片输入](../multimodal/image-input.md)
- [创建对话补全](./chat-completions.md)
