# Image generation

Trinity generates images via **[Create chat completion](../api/chat-completions.md)** (`POST /v1/chat/completions`) by setting **`modalities`** and **`image_config`** in the request body. This is **not** OpenAI’s standalone `POST /images/generations`.

::: warning Do not confuse with image input
**Text-to-image / reference-image generation** uses `modalities` + `image_config` on this page. **Image understanding** uses the `image_url` Part in `messages[].content`—see [Image input](./image-input.md).
:::

---

## Model discovery

Sign in to the [model catalog](https://trinity.ai/models), choose a model that supports **image output**, and copy its **model ID** into `model` (for example `hunyuan-image`). Use only models visible to your account.

::: info
Trinity does not expose a public `GET /v1/models` listing API; do not rely on `output_modalities` query parameters until they are announced as supported.
:::

---

## API usage

Send JSON to `{TRINITY_BASE_URL}/chat/completions`. Set `modalities` based on model capabilities:

| Model output | Suggested `modalities` |
| --- | --- |
| Text and images | `["image", "text"]` |
| Images only | `["image"]` |

Image generation requests must use **`stream: false`** or omit `stream` (streaming image generation is not supported).

---

## Basic image generation

::: code-group

```python [Python]
import json, os, requests

url = f"{os.environ['TRINITY_BASE_URL']}/chat/completions"
headers = {
    "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
    "Content-Type": "application/json",
}
payload = {
    "model": "hunyuan-image",
    "messages": [
        {"role": "user", "content": "A cinematic sunset over mountain ridges, dramatic lighting"},
    ],
    "modalities": ["image", "text"],
}
r = requests.post(url, headers=headers, data=json.dumps(payload))
result = r.json()

# Generated images usually appear on the assistant message (field names may vary)
if result.get("choices"):
    message = result["choices"][0].get("message", {})
    images = message.get("images") or []
    for i, img in enumerate(images):
        image_url = img.get("image_url", {}).get("url") or img.get("image_url")
        print(f"Generated image {i + 1}: {str(image_url)[:80]}...")
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
    messages: [{ role: "user", content: "A cinematic sunset over mountain ridges, dramatic lighting" }],
    modalities: ["image", "text"],
  }),
});
const result = await res.json();

if (result.choices?.[0]?.message) {
  const message = result.choices[0].message;
  const images = message.images ?? [];
  images.forEach((img, index) => {
    const url = img.image_url?.url ?? img.image_url;
    console.log(`Generated image ${index + 1}: ${String(url).slice(0, 80)}...`);
  });
}
```

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "hunyuan-image",
    "messages": [{ "role": "user", "content": "A cinematic sunset over mountain ridges, dramatic lighting" }],
    "modalities": ["image", "text"]
  }'
```

:::

---

## `image_config` options

Some models accept **`image_config`** for aspect ratio, resolution, and return format. Full field list: [API · Advanced parameters · Images](../api/image-generation-parameters.md).

### Aspect ratio `aspect_ratio`

Common values (**model-dependent**):

| `aspect_ratio` | Description |
| --- | --- |
| `1:1` | Square (often default) |
| `16:9` / `9:16` | Landscape / portrait |
| `4:3` / `3:4` | Classic aspect |
| `3:2` / `2:3` | Photo aspect |
| `4:5` / `5:4` | Social formats |
| `21:9` | Ultra-wide |

### Resolution `image_size`

| `image_size` | Description |
| --- | --- |
| `1K` | Standard tier (common default) |
| `2K` / `4K` | Higher resolution (model-dependent) |

### Output format

| Field | Description |
| --- | --- |
| `output_format` | Preferred return: `url` / `base64` |
| `output_image_format` | File format: `png` / `jpeg` |

### Reference images `reference_images` (image-to-image)

Pass URL references in `image_config.reference_images[]` (`type` is currently `url`). Optional `text` describes how to use the reference:

```json
"reference_images": [
  {
    "type": "url",
    "url": "https://example.com/ref.png",
    "text": "Keep the main building silhouette; do not change geometry"
  }
]
```

### Compliance and person policy (model-dependent)

| Field | Description |
| --- | --- |
| `person_generation` | Person-generation policy |
| `input_compliance_check` / `output_compliance_check` | Input/output compliance checks: `true` / `false` |

### Combined example

```json
{
  "model": "hunyuan-image",
  "messages": [
    { "role": "user", "content": "Cyberpunk city at night, neon lights and rainy streets" }
  ],
  "modalities": ["image", "text"],
  "image_config": {
    "aspect_ratio": "16:9",
    "image_size": "1K",
    "output_format": "url",
    "output_image_format": "png"
  }
}
```

::: code-group

```python [Python]
import json, os, requests

payload = {
    "model": "hunyuan-image",
    "messages": [{"role": "user", "content": "Cyberpunk city at night, neon and rain"}],
    "modalities": ["image", "text"],
    "image_config": {"aspect_ratio": "16:9", "image_size": "1K", "output_format": "url"},
}
r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps(payload),
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
    messages: [{ role: "user", content: "Cyberpunk city at night, neon and rain" }],
    modalities: ["image", "text"],
    image_config: { aspect_ratio: "16:9", image_size: "1K", output_format: "url" },
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
    "messages": [{ "role": "user", "content": "Cyberpunk city at night, neon and rain" }],
    "modalities": ["image", "text"],
    "image_config": { "aspect_ratio": "16:9", "image_size": "1K", "output_format": "url" }
  }'
```

:::

::: warning
`trinity_async.*` is not supported for image generation; sending it returns `invalid_request`.
:::

---

## Streaming

Image generation **does not** support `stream: true`. Wait for a synchronous JSON body. Streaming SSE applies to text-only chat—see [Streaming (SSE)](../guides/streaming-sse.md).

---

## Response format

On success, the assistant message usually includes generated images (structure follows OpenAI-compatible conventions; upstream may differ slightly):

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Here is your generated image.",
        "images": [
          {
            "type": "image_url",
            "image_url": {
              "url": "https://..."
            }
          }
        ]
      }
    }
  ]
}
```

### Image fields

| Item | Description |
| --- | --- |
| **Format** | Often a public `url`, or `data:image/png;base64,...` |
| **Type** | Usually PNG / JPEG (see `output_image_format`) |
| **Multiple images** | Some models return more than one per call |
| **Dimensions** | Driven by the model and `image_config` |

Check `choices[0].message.images` first; if empty, inspect `message.content` for embedded links or base64 (implementation-specific).

---

## Model compatibility

1. **`model`** must be an **image-generation model ID** from the catalog.
2. Set **`modalities`** correctly—most models use `["image", "text"]`.
3. Do **not** set **`stream: true`** on image generation requests.

---

## Best practices

- **Prompts**: Describe subject, style, lighting, and composition—avoid vague one-liners.
- **Model choice**: Confirm image output in the catalog before integrating.
- **Reference images**: Use `reference_images` with `text` to say what to keep or change.
- **Errors**: Check HTTP status and the `error` object before parsing `images`.
- **Storage**: `url` links may expire; decode and save `base64` yourself.

---

## Troubleshooting

**No images in the response?**

- Confirm `model` is an image model and `modalities` includes `image`.
- Confirm `stream` is not `true`.
- Confirm the user message clearly asks for image generation.

**Model missing or unavailable?**

- Verify the model ID and account access in the [model catalog](https://trinity.ai/models).

**Confused with image input?**

- Understand existing images → [Image input](./image-input.md) (`image_url` Part).
- Generate new images → this page (`modalities` + `image_config`).

---

## Related

- [Create image generation](../api/images-generations.md)
- [Advanced parameters · Images](../api/image-generation-parameters.md)
- [Image input](./image-input.md)
- [Errors & debugging](../reference/error-codes.md)
