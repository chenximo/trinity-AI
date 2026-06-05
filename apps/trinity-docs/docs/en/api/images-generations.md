# Create image generation

`POST` `{TRINITY_BASE_URL}/chat/completions`

`Content-Type: application/json`

Generate images with `modalities` and `image_config`. This is **not** `POST /images/generations`.

::: warning Do not confuse schemas
| Capability | How to pass images |
| --- | --- |
| Text model seeing images | `messages[].content[]` · `type: image_url` |
| Image generation | `modalities` includes `image` + `image_config` |
:::

---

## Authentication

**Authorization** · Bearer — same as [Create chat completion](./chat-completions.md).

---

## Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Image model, e.g. `hunyuan-image` |
| `messages` | array | Yes | Usually a `user` text prompt |
| `modalities` | array | Recommended | Include `image` |
| `stream` | boolean | No | Image generation **does not support** `true` |
| `image_config` | object | No | Aspect ratio, reference images, etc. |

All `image_config` fields: [Image generation · Advanced parameters](./image-generation-parameters.md).

---

## SDK examples

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
        "messages": [{"role": "user", "content": "Cyberpunk futuristic city at night"}],
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
    messages: [{ role: "user", content: "Cyberpunk futuristic city at night" }],
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
    "messages": [{ "role": "user", "content": "Cyberpunk futuristic city at night" }],
    "modalities": ["image", "text"],
    "image_config": { "aspect_ratio": "1:1", "output_format": "url" }
  }'
```

:::

---

## Related

- [Image generation guide](../multimodal/image-generation.md)
- [Image generation · Advanced parameters](./image-generation-parameters.md)
- [Image input](../multimodal/image-input.md)
- [Create chat completion](./chat-completions.md)
