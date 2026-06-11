# Video input

## How to send video files to Trinity models

Trinity supports sending video files to compatible text models through the API. This page shows how to pass video in your request.

Trinity accepts **URLs** and **Base64 data URLs** for `file_url`:

- **URL** — for publicly reachable videos; no local encoding.
- **Base64 data URL** — for local files or videos that are not publicly reachable; format `data:video/<mime>;base64,...`.

Maximum **70MB** per file (platform validation).

::: info
Whether a given URL or MIME type is accepted depends on the **model and upstream**.
:::

---

## Video input

Send requests to models that support video understanding via **`POST /v1/chat/completions`** (see [Create chat completion](../api/chat-completions.md)). Use a **`type: file`** Part in `messages[].content`; **`file_url`** is a URL or Base64 data URL. Only **`model`** values with video understanding can handle these requests.

Find available **`model`** IDs: [List models](../api/models.md) or the [model catalog](https://trinity.ai/models). Field table: [Advanced parameters · Text](../api/chat-completions-parameters.md).

| Field | Required | Description |
| --- | --- | --- |
| `type` | Yes | Always `file` |
| `file_url` | Yes | URL or Base64 data URL |
| `file_name` | No | Display file name |
| `extra_content` | No | Only when documented for the model (e.g. `google.fps`) |

::: warning Do not use `video_url` / do not confuse with video generation
Trinity text chat uses **`type: file` + `file_url`**, not `type: video_url`. For video generation use `POST /video/generations` · [Video generation](./video-generation.md).
:::

---

## Video URL

```json
{
  "type": "file",
  "file_name": "demo.mp4",
  "file_url": "https://example.com/demo.mp4"
}
```

With `type: text` in the same `content` array:

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

---

## Base64-encoded video

Encode a local file as a data URL and set `file_url`:

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

| MIME |
| --- |
| `video/mp4` |
| `video/mpeg` |
| `video/quicktime` (`.mov`) |
| `video/webm` |

---

## Related

- [Multimodal overview](./)
- [Create chat completion](../api/chat-completions.md)
- [Advanced parameters · Text](../api/chat-completions-parameters.md)
- [Image input](./image-input.md)
- [Video generation](./video-generation.md)
- [Errors & debugging](../reference/error-codes.md)
