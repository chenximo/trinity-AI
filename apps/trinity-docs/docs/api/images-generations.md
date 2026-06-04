# 创建图像生成

`POST` `{TRINITY_BASE_URL}/chat/completions`

`Content-Type: application/json`

通过 `modalities` 与 `image_config` 生成图像。**不是** `POST /images/generations`。

::: warning 易混
| 能力 | 传图方式 |
| --- | --- |
| 生文看图 | `messages[].content[]` · `type: image_url` |
| 生图 | `modalities` 含 `image` + `image_config` |
:::

---

## Authentication

**Authorization** · Bearer — 同 [创建对话补全](./chat-completions.md)。

---

## Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 生图模型，如 `hunyuan-image` |
| `messages` | array | 是 | 通常 `user` 文本为 prompt |
| `modalities` | array | 建议 | 含 `image` |
| `stream` | boolean | 否 | 生图**不支持** `true` |
| `image_config` | object | 否 | 宽高比、参考图等 |

`image_config` 全字段见 [图像生成 · 高级参数](./image-generation-parameters.md)。

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
