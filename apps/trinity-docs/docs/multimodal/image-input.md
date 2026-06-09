# 图片输入

向支持多模态的**生文模型**发送带图请求时，使用 **`POST /v1/chat/completions`**（与 [创建对话补全](../api/chat-completions.md) 相同），在 `messages` 里用 **多段 `content` 数组** 传入图片。`image_url` 可以是 **公网 URL** 或 **Base64 Data URL**。

可在同一条 `content` 数组中放**多张图**；单请求可附带的图片数量因**模型与上游**而异。解析时建议**先放文本 Part、再放图片**；若必须先图后文，可将说明放进 `system` 消息。

::: warning 勿与生图混淆
**看图理解**用本页的 `image_url` Part。**文生图 / 参考图生图**用 `modalities` + `image_config`，见 [创建图像生成](../api/images-generations.md)。
:::

---

## URL 与 Base64

| 方式 | 适用场景 |
| --- | --- |
| **URL** | 公网可访问图片；无需在本地编码，体积更省 |
| **Base64 Data URL** | 本地文件、内网或私有图；格式 `data:image/<mime>;base64,...` |

单张图片大小上限以平台校验为准（契约按 **70MB 以内**，与 OpenAI 口径对齐）。

---

## 使用图片 URL

`image_url` 支持**简写字符串**或 **OpenAI 对象**写法：

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
                {"type": "text", "text": "请描述这张图片的主要内容。"},
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
          { type: "text", text: "请描述这张图片的主要内容。" },
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
        { "type": "text", "text": "请描述这张图片的主要内容。" },
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

将 `model` 换成 [模型广场](https://trinity.ai/models) 中你账号可用的、支持看图的多模态生文模型 ID。

---

## 使用 Base64 编码图片

本地图片需先转为 Data URL，再放入 `image_url.url`：

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
                {"type": "text", "text": "请描述这张图片的主要内容。"},
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
          { type: "text", text: "请描述这张图片的主要内容。" },
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
    {"type":"text","text":"请描述这张图片的主要内容。"},
    {"type":"image_url","image_url":{"url":"'"$DATA_URL"'"}}
  ]}]}'
```

:::

---

## 多图对比

多张图放在同一 `content` 数组中，可混用简写与对象写法：

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "对比这两张图的区别" },
    { "type": "image_url", "image_url": "https://example.com/a.png" },
    { "type": "image_url", "image_url": { "url": "https://example.com/b.png" } }
  ]
}
```

---

## 支持的图片类型

Data URL 的 MIME 类型常用：

| MIME |
| --- |
| `image/png` |
| `image/jpeg` |
| `image/webp` |
| `image/gif` |

具体是否被某模型接受，以 [模型广场](https://trinity.ai/models) 与调用结果为准。

---

## 模型 ID

请求体 `model` 须为支持多模态输入的**生文模型 ID**（在 [模型广场](https://trinity.ai/models) 选用；勿使用仅生图或仅视频的模型）。字段全集见 [API · 高级参数 · 生文](../api/chat-completions-parameters.md)。

---

## 相关

- [多模态概述](./)
- [创建对话补全](../api/chat-completions.md)
- [高级参数 · 生文](../api/chat-completions-parameters.md)
- [创建图像生成](../api/images-generations.md)
- [快速入门](../quickstart.md)
- [错误与调试](../reference/error-codes.md)
