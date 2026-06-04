# 视频输入

向支持多模态的**生文模型**发送带视频素材的请求时，使用 **`POST /v1/chat/completions`**（与 [创建对话补全](../api/chat-completions.md) 相同），在 `messages` 里用 **多段 `content` 数组** 传入视频。

Trinity 将视频作为 **`type: file`** 的 Part，通过 **`file_url`** 传入（公网 URL 或 Base64 Data URL）。与 [OpenRouter · Video Inputs](https://openrouter.ai/docs/guides/overview/multimodal/videos) 的 `video_url` Part 命名不同，但用途一致：**让模型理解视频内容**（摘要、场景识别等）。

::: warning 勿与生视频混淆
**视频理解（输入）**用本页 · `POST /chat/completions` + `file` Part。**生成新视频**用 `POST /video/generations` 异步任务，见 [视频生成](./video-generation.md) 与 [创建视频生成任务](../api/videos-generations.md)。生视频里的 `input_references[].type: video_url` 是**另一套字段**，不是本页 Part。
:::

---

## URL 与 Base64

| 方式 | 适用场景 |
| --- | --- |
| **URL** | 公网可访问视频；无需本地编码 |
| **Base64 Data URL** | 本地或私有文件；格式 `data:video/<mime>;base64,...` |

单文件大小上限以平台校验为准（契约按 **70MB 以内**）。是否支持某条 URL（如部分平台仅支持特定托管链接）**以模型与上游为准**。

在 [模型广场](https://trinity.ai/models) 选择支持多模态输入的**生文模型 ID**；仅部分模型具备视频理解能力。

---

## 使用视频 URL

```json
{
  "type": "file",
  "file_name": "demo.mp4",
  "file_url": "https://example.com/demo.mp4"
}
```

可与文本 Part 组合；建议**先文本、后视频**：

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

将 `model` 换成你账号可用的、支持视频理解的生文模型 ID。

---

## 使用 Base64 编码视频

本地视频先转为 Data URL，再放入 `file_url`：

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

Data URL 常用 MIME：

| MIME |
| --- |
| `video/mp4` |
| `video/mpeg` |
| `video/quicktime`（`.mov`） |
| `video/webm` |

具体是否被某模型接受，以 [模型广场](https://trinity.ai/models) 与调用结果为准。

部分模型在协议层支持 `extra_content.google`（如视频理解帧率 `fps` 等），仅当模型声明支持时可传；详见 [高级参数 · 生文](../api/chat-completions-parameters.md) 与工程师实现说明。

---

## 常见用途

- **视频摘要**：生成文字版内容概要  
- **场景与动作识别**：描述人物、物体与活动  
- **监控 / 教学片分析**：按提示词抽取关键信息  

---

## 最佳实践

### 文件体积

- 在可接受前提下**压缩、裁剪**视频，降低上传与处理成本  
- 控制分辨率与帧率：720p 常可满足一般理解任务  
- 过长视频可**分段**多次请求，或只提交关键片段  

### 提示词

- 说明要分析什么（情节、异常、文字、运动等）  
- 视频 Part 与文本 Part 一并给出明确任务  

### 与 OpenRouter 文档的差异

[OpenRouter 视频输入](https://openrouter.ai/docs/guides/overview/multimodal/videos) 示例使用 `type: video_url`。Trinity 生文侧请使用 **`type: file` + `file_url`**（与工程师契约一致）。勿把生视频 API 的 `input_references` 结构抄到本页。

---

## 故障排除

**模型没有按预期理解视频？**

- 确认 `model` 为生文且支持多模态/视频理解  
- 确认使用 `type: file` 且 `file_url` 可访问（或 Base64 完整）  
- 尝试改用 Base64（部分上游对直连 URL 限制更严）  

**请求过大或超时？**

- 压缩视频、缩短时长、降低分辨率  
- 检查是否超过 **70MB** 等平台限制  

**和「生成视频」搞混？**

- 理解已有视频 → 本页（`chat/completions` + `file` Part）  
- 生成新视频 → [视频生成](./video-generation.md)  

---

## 相关

- [多模态概述](./)
- [创建对话补全](../api/chat-completions.md)
- [高级参数 · 生文](../api/chat-completions-parameters.md)
- [图片输入](./image-input.md)
- [视频生成](./video-generation.md)
- [错误与调试](../reference/error-codes.md)
