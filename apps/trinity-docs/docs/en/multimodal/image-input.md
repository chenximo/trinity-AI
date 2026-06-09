# Image input

To send images to a **text model** that supports multimodal input, use **`POST /v1/chat/completions`** (same as [Create chat completion](../api/chat-completions.md)) and pass images in a **multi-part `content` array** inside `messages`. An `image_url` may be a **public URL** or a **Base64 data URL**.

You can attach **multiple images** in the same `content` array; limits depend on the **model and upstream**. For parsing, put the **text Part first, then images**; if images must come first, move instructions into a `system` message.

::: warning Do not confuse with image generation
**Image understanding** uses the `image_url` Part on this page. **Text-to-image / reference-image generation** uses `modalities` + `image_config`—see [Create image generation](../api/images-generations.md).
:::

---

## URL vs Base64

| Method | When to use |
| --- | --- |
| **URL** | Publicly reachable images; no local encoding, smaller payloads |
| **Base64 data URL** | Local, private, or intranet images; format `data:image/<mime>;base64,...` |

Per-image size limits follow platform validation (contract: **within 70MB**, aligned with common OpenAI-style limits).

---

## Image URL

`image_url` supports a **shorthand string** or the **OpenAI object** form:

```json
{ "type": "image_url", "image_url": "https://example.com/sample.png" }
```

```json
{
  "type": "image_url",
  "image_url": { "url": "https://example.com/sample.png" }
}
```

::: code-group

```python [Python]
import json, os, requests

url = f"{os.environ['TRINITY_BASE_URL']}/chat/completions"
headers = {
    "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
    "Content-Type": "application/json",
}
payload = {
    "model": "gpt-4o",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Describe the main subject of this image."},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1280px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                    },
                },
            ],
        }
    ],
}
r = requests.post(url, headers=headers, data=json.dumps(payload))
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
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe the main subject of this image." },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1280px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            },
          },
        ],
      },
    ],
  }),
});
console.log(await res.json());
```

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "gpt-4o",
    "messages": [{
      "role": "user",
      "content": [
        { "type": "text", "text": "Describe the main subject of this image." },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1280px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
          }
        }
      ]
    }]
  }'
```

:::

Replace `model` with a multimodal **text model ID** from the [model catalog](https://trinity.ai/models) that supports image input for your account.

---

## Base64-encoded images

Encode local images as a data URL and set `image_url.url`:

::: code-group

```python [Python]
import base64, json, os, requests
from pathlib import Path

def encode_image_to_data_url(image_path: str) -> str:
    suffix = Path(image_path).suffix.lower()
    mime = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif"}.get(suffix, "image/jpeg")
    b64 = base64.b64encode(Path(image_path).read_bytes()).decode("utf-8")
    return f"data:{mime};base64,{b64}"

data_url = encode_image_to_data_url("path/to/your/image.jpg")
payload = {
    "model": "gpt-4o",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Describe the main subject of this image."},
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        }
    ],
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
import { readFile } from "node:fs/promises";

async function encodeImageToDataUrl(imagePath: string): Promise<string> {
  const buf = await readFile(imagePath);
  const base64 = buf.toString("base64");
  return `data:image/jpeg;base64,${base64}`;
}

const dataUrl = await encodeImageToDataUrl("path/to/your/image.jpg");
const res = await fetch(`${process.env.TRINITY_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe the main subject of this image." },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  }),
});
console.log(await res.json());
```

```bash [Shell]
DATA_URL="data:image/jpeg;base64,$(base64 -i path/to/your/image.jpg | tr -d '\n')"
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":[
    {"type":"text","text":"Describe the main subject of this image."},
    {"type":"image_url","image_url":{"url":"'"$DATA_URL"'"}}
  ]}]}'
```

:::

---

## Multiple images

Place several images in the same `content` array; shorthand and object forms can be mixed:

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "Compare the differences between these two images" },
    { "type": "image_url", "image_url": "https://example.com/a.png" },
    { "type": "image_url", "image_url": { "url": "https://example.com/b.png" } }
  ]
}
```

---

## Supported image types

Common MIME types for data URLs:

| MIME |
| --- |
| `image/png` |
| `image/jpeg` |
| `image/webp` |
| `image/gif` |

Whether a given model accepts a type depends on the [model catalog](https://trinity.ai/models) and the API response.

---

## Model ID

Set **`model`** to a **text model ID** that supports multimodal input (pick from the [model catalog](https://trinity.ai/models); do not use image-only or video-only generation models). Full fields: [API · Advanced parameters · Text](../api/chat-completions-parameters.md).

---

## Related

- [Multimodal overview](./)
- [Create chat completion](../api/chat-completions.md)
- [Advanced parameters · Text](../api/chat-completions-parameters.md)
- [Create image generation](../api/images-generations.md)
- [Quickstart](../quickstart.md)
- [Errors & debugging](../reference/error-codes.md)
