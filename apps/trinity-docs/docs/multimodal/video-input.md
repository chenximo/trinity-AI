# 视频输入

## 如何向 Trinity 模型发送视频文件

Trinity 支持通过 API 向兼容的生文模型发送视频文件。本页说明如何在请求中传入视频 Part。

Trinity 支持视频的 **URL** 与 **Base64 Data URL** 两种 `file_url` 写法：

- **URL**：适用于公网可访问的视频；无需本地编码。
- **Base64 Data URL**：适用于本地文件或无法公网直链的视频；格式为 `data:video/<mime>;base64,...`。

单文件大小上限为 **70MB**（以平台校验为准）。

::: info
某条 URL 或 MIME 是否被接受，以**模型与上游**为准。
:::

---

## 视频输入

向支持视频理解的模型发送请求时，使用 **`POST /v1/chat/completions`**（见 [创建对话补全](../api/chat-completions.md)），在 `messages[].content` 中指定 **`type: file`** Part；**`file_url`** 为 URL 或 Base64 Data URL。仅具备视频理解能力的 **`model`** 可处理此类请求。

查询可用 **`model`**：[获取模型](../api/models.md) 或 [模型广场](https://trinity.ai/models)。字段表：[高级参数 · 生文](../api/chat-completions-parameters.md)。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `type` | 是 | 固定为 `file` |
| `file_url` | 是 | URL 或 Base64 Data URL |
| `file_name` | 否 | 文件名 |
| `extra_content` | 否 | 仅模型文档声明支持时（如 `google.fps`） |

::: warning 勿用 `video_url` / 勿与生视频混淆
Trinity 生文侧使用 **`type: file` + `file_url`**，不使用 `type: video_url`。生视频任务见 `POST /video/generations` · [视频生成](./video-generation.md)。
:::

---

## 使用视频 URL

```json
{
  "type": "file",
  "file_name": "demo.mp4",
  "file_url": "https://example.com/demo.mp4"
}
```

与 `type: text` 置于同一 `content` 数组：

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "请概括这段视频的主要情节与场景变化。" },
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
                {"type": "text", "text": "请概括这段视频的主要情节。"},
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
          { type: "text", text: "请概括这段视频的主要情节。" },
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
        { "type": "text", "text": "请概括这段视频的主要情节。" },
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

## 使用 Base64 编码视频

将本地文件编码为 Data URL 后写入 `file_url`：

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
                {"type": "text", "text": "这段视频里发生了什么？"},
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
          { type: "text", text: "这段视频里发生了什么？" },
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
    {"type":"text","text":"这段视频里发生了什么？"},
    {"type":"file","file_name":"video.mp4","file_url":"'"$DATA_URL"'"}
  ]}]}'
```

:::

---

## 支持的视频类型

| MIME |
| --- |
| `video/mp4` |
| `video/mpeg` |
| `video/quicktime`（`.mov`） |
| `video/webm` |

---

## 相关

- [多模态概述](./)
- [创建对话补全](../api/chat-completions.md)
- [高级参数 · 生文](../api/chat-completions-parameters.md)
- [图片输入](./image-input.md)
- [视频生成](./video-generation.md)
- [错误与调试](../reference/error-codes.md)
