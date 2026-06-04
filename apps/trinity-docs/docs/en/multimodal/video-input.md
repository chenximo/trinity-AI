# Video input

To send video to a **text model** that supports multimodal input, use **`POST /v1/chat/completions`** (same as [Create chat completion](../api/chat-completions.md)) and pass video in a **multi-part `content` array** inside `messages`.

Trinity uses a **`type: file`** Part with **`file_url`** (public URL or Base64 data URL). This differs from [OpenRouter · Video Inputs](https://openrouter.ai/docs/guides/overview/multimodal/videos), which uses a `video_url` Part name—the purpose is the same: **help the model understand video content** (summaries, scene recognition, etc.).

::: warning Do not confuse with video generation
**Video understanding (input)** uses this page: `POST /chat/completions` + `file` Part. **Generating new video** uses async `POST /video/generations`—see [Video generation](./video-generation.md) and [Create video generation task](../api/videos-generations.md). The `input_references[].type: video_url` field on video **generation** requests is a **different schema**, not this chat Part.
:::

---

## URL vs Base64

| Method | When to use |
| --- | --- |
| **URL** | Publicly reachable video; no local encoding |
| **Base64 data URL** | Local or private files; format `data:video/<mime>;base64,...` |

Per-file size limits follow platform validation (contract: **within 70MB**). Whether a URL is accepted (some hosts only allow specific CDNs) **depends on the model and upstream**.

Pick a **text model ID** with multimodal input from the [model catalog](https://trinity.ai/models); only some models support video understanding.

---

## Video URL

```json
{
  "type": "file",
  "file_name": "demo.mp4",
  "file_url": "https://example.com/demo.mp4"
}
```

Combine with a text Part; **text first, then video** is recommended:

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "Summarize the main plot and scene changes in this video." },
    {
      "type": "file",
      "file_name": "clip.mp4",
      "file_url": "https://example.com/clip.mp4"
    }
  ]
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
                {"type": "text", "text": "Summarize the main plot of this video."},
                {
                    "type": "file",
                    "file_name": "clip.mp4",
                    "file_url": "https://example.com/clip.mp4",
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
          { type: "text", text: "Summarize the main plot of this video." },
          {
            type: "file",
            file_name: "clip.mp4",
            file_url: "https://example.com/clip.mp4",
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
        { "type": "text", "text": "Summarize the main plot of this video." },
        {
          "type": "file",
          "file_name": "clip.mp4",
          "file_url": "https://example.com/clip.mp4"
        }
      ]
    }]
  }'
```

:::

Replace `model` with a text model ID that supports video understanding for your account.

---

## Base64-encoded video

Encode local video as a data URL and set `file_url`:

::: code-group

```python [Python]
import base64, json, os, requests
from pathlib import Path

def encode_video_to_data_url(video_path: str) -> str:
    suffix = Path(video_path).suffix.lower()
    mime = {
        ".mp4": "video/mp4",
        ".mpeg": "video/mpeg",
        ".mov": "video/quicktime",
        ".webm": "video/webm",
    }.get(suffix, "video/mp4")
    b64 = base64.b64encode(Path(video_path).read_bytes()).decode("utf-8")
    return f"data:{mime};base64,{b64}"

data_url = encode_video_to_data_url("path/to/your/video.mp4")
payload = {
    "model": "gpt-4o",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What happens in this video?"},
                {
                    "type": "file",
                    "file_name": "video.mp4",
                    "file_url": data_url,
                },
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

async function encodeVideoToDataUrl(videoPath: string): Promise<string> {
  const buf = await readFile(videoPath);
  return `data:video/mp4;base64,${buf.toString("base64")}`;
}

const dataUrl = await encodeVideoToDataUrl("path/to/your/video.mp4");
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
          { type: "text", text: "What happens in this video?" },
          { type: "file", file_name: "video.mp4", file_url: dataUrl },
        ],
      },
    ],
  }),
});
console.log(await res.json());
```

```bash [Shell]
DATA_URL="data:video/mp4;base64,$(base64 -i path/to/your/video.mp4 | tr -d '\n')"
curl -sS "${TRINITY_BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":[
    {"type":"text","text":"What happens in this video?"},
    {"type":"file","file_name":"video.mp4","file_url":"'"$DATA_URL"'"}
  ]}]}'
```

:::

---

## Supported video types

Common MIME types for data URLs:

| MIME |
| --- |
| `video/mp4` |
| `video/mpeg` |
| `video/quicktime` (`.mov`) |
| `video/webm` |

Acceptance is model-specific—see the [model catalog](https://trinity.ai/models) and API responses.

Some models support `extra_content.google` at the protocol layer (for example video `fps`); send only when the model documents support. See [Advanced parameters · Text](../api/chat-completions-parameters.md).

---

## Common use cases

- **Summaries**: Text overview of video content  
- **Scene and action recognition**: People, objects, and activities  
- **Surveillance / training footage**: Extract information per your prompt  

---

## Best practices

### File size

- **Compress and trim** when quality allows to reduce upload and processing cost  
- **Resolution and frame rate**: 720p is often enough for understanding tasks  
- **Long videos**: Split into segments or send key clips only  

### Prompts

- State what to analyze (plot, anomalies, on-screen text, motion, etc.)  
- Pair the video Part with a clear text instruction  

### Difference from OpenRouter docs

[OpenRouter video input](https://openrouter.ai/docs/guides/overview/multimodal/videos) examples use `type: video_url`. On Trinity **text chat**, use **`type: file` + `file_url`**. Do not copy video **generation** `input_references` into chat requests.

---

## Troubleshooting

**Model did not understand the video as expected?**

- Confirm `model` is a multimodal **text** model with video understanding  
- Confirm `type: file` and a reachable `file_url` (or complete Base64)  
- Try Base64 if direct URLs are restricted upstream  

**Request too large or times out?**

- Compress, shorten, or lower resolution  
- Check the **70MB** platform limit  

**Confused with video generation?**

- Understand existing video → this page (`chat/completions` + `file` Part)  
- Generate new video → [Video generation](./video-generation.md)  

---

## Related

- [Multimodal overview](./)
- [Create chat completion](../api/chat-completions.md)
- [Advanced parameters · Text](../api/chat-completions-parameters.md)
- [Image input](./image-input.md)
- [Video generation](./video-generation.md)
- [Errors & debugging](../reference/error-codes.md)
