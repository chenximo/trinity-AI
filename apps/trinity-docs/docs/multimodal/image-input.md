# 图片输入

## 如何向 Trinity 模型发送图片

Trinity 支持通过 API 向兼容的生文模型发送图片。本页说明如何在请求中传入图片 Part。

Trinity 支持图片的 **URL** 与 **Base64 Data URL** 两种写法：

- **URL**：适用于公网可访问的图片；无需本地编码。
- **Base64 Data URL**：适用于本地或私有图片；格式为 `data:image/<mime>;base64,...`。

单张图片大小上限为 **70MB**（以平台校验为准）。可在同一 `content` 数组中传多张图；数量上限以模型与上游为准。

::: info
是否接受某条 URL 或 MIME，以**模型与上游**为准。
:::

---

## 图片输入

向支持看图能力的模型发送请求时，使用 **`POST /v1/chat/completions`**（见 [创建对话补全](../api/chat-completions.md)），在 `messages[].content` 中指定 **`type: image_url`** Part。

查询可用 **`model`**：[获取模型](../api/models.md) 或 [模型广场](https://trinity.ai/models)。字段表：[高级参数 · 生文](../api/chat-completions-parameters.md)。

::: warning 勿与生图混淆
**看图理解**用本页的 `image_url` Part。**文生图 / 参考图生图**用 `modalities` + `image_config`，见 [创建图像生成](../api/images-generations.md)。
:::

---

## 使用图片 URL

`image_url` 支持**简写字符串**或**对象**写法：

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
