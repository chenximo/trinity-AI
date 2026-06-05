# 图片生成

Trinity 通过 **[创建对话补全](../api/chat-completions.md)**（`POST /v1/chat/completions`）生成图像：在请求体中设置 **`modalities`** 与 **`image_config`**。**不是** OpenAI 独立的 `POST /images/generations`。

对标参考：[OpenRouter · Image Generation](https://openrouter.ai/docs/guides/overview/multimodal/image-generation)

::: warning 勿与图片输入混淆
**文生图 / 参考图生图**用本页的 `modalities` + `image_config`。**看图理解**在 `messages[].content` 里传 `image_url` Part，见 [图片输入](./image-input.md)。
:::

---

## 模型发现

在 [模型广场](https://trinity.ai/models) 登录后，选择支持**图像输出**的生图模型，复制 **模型 ID** 填入 `model`（例如 `hunyuan-image`）。以你账号可见列表为准。

::: info
Trinity 当前不提供对外 `GET /v1/models` 列举接口；请以 [模型广场](https://trinity.ai/models) 中展示的模型能力为准，勿依赖 `output_modalities` 查询参数。
:::

---

## API 用法

向 `{TRINITY_BASE_URL}/chat/completions` 发送 JSON 请求。`modalities` 取值取决于模型能力：

| 模型输出 | 建议 `modalities` |
| --- | --- |
| 同时输出文本与图片 | `["image", "text"]` |
| 仅输出图片 | `["image"]` |

生图请求 **`stream` 须为 `false` 或省略**（当前不支持流式生图）。

---

## 基础图片生成

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
        {"role": "user", "content": "生成一幅山峦日落景象，电影感光影"},
    ],
    "modalities": ["image", "text"],
}
r = requests.post(url, headers=headers, data=json.dumps(payload))
result = r.json()

# 生成的图片通常在 assistant 消息中（字段名以实现为准）
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
    messages: [{ role: "user", content: "生成一幅山峦日落景象，电影感光影" }],
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
    "messages": [{ "role": "user", "content": "生成一幅山峦日落景象，电影感光影" }],
    "modalities": ["image", "text"]
  }'
```

:::

---

## `image_config` 配置项

部分模型支持通过 **`image_config`** 控制画幅、分辨率与返回形式。完整字段表见 [API · 高级参数 · 生图](../api/image-generation-parameters.md)。

### 宽高比 `aspect_ratio`

常用取值（**是否生效以模型能力为准**）：

| `aspect_ratio` | 说明 |
| --- | --- |
| `1:1` | 方形（常见默认） |
| `16:9` / `9:16` | 横屏 / 竖屏 |
| `4:3` / `3:4` | 传统横竖 |
| `3:2` / `2:3` | 摄影比例 |
| `4:5` / `5:4` | 社交竖横 |
| `21:9` | 超宽 |

### 分辨率档位 `image_size`

| `image_size` | 说明 |
| --- | --- |
| `1K` | 标准档位（常见默认） |
| `2K` / `4K` | 更高分辨率（按模型支持） |

### 返回形式

| 字段 | 说明 |
| --- | --- |
| `output_format` | 对外返回偏好：`url` / `base64` |
| `output_image_format` | 文件格式：`png` / `jpeg` |

### 参考图 `reference_images`（图生图）

在 `image_config.reference_images[]` 中传入 URL 参考图（当前项内 `type` 固定为 `url`），可选 `text` 描述参考语义：

```json
"reference_images": [
  {
    "type": "url",
    "url": "https://example.com/ref.png",
    "text": "保持主建筑轮廓，不改变几何结构"
  }
]
```

### 合规与人物策略（按模型）

| 字段 | 说明 |
| --- | --- |
| `person_generation` | 人物生成相关策略 |
| `input_compliance_check` / `output_compliance_check` | 输入/输出合规检查，`true` / `false` |

### 同时使用多个配置

```json
{
  "model": "hunyuan-image",
  "messages": [
    { "role": "user", "content": "赛博朋克风格未来城市夜景，霓虹灯与雨夜街道" }
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
    "messages": [{"role": "user", "content": "赛博朋克风格未来城市夜景"}],
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
    messages: [{ role: "user", content: "赛博朋克风格未来城市夜景" }],
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
    "messages": [{ "role": "user", "content": "赛博朋克风格未来城市夜景" }],
    "modalities": ["image", "text"],
    "image_config": { "aspect_ratio": "16:9", "image_size": "1K", "output_format": "url" }
  }'
```

:::

::: warning
`trinity_async.*` 生图当前不支持，传入会返回 `invalid_request`。
:::

---

## 流式生成

生图请求**不支持** `stream: true`，须等待同步 JSON 响应。流式 SSE 仅适用于纯生文，见 [流式输出（SSE）](../guides/streaming-sse.md)。

---

## 响应格式

成功时，助手消息中通常包含生成的图片（结构对齐 OpenAI / OpenRouter 习惯，上游略有差异）：

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "已为你生成图片。",
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

### 图片字段说明

| 项 | 说明 |
| --- | --- |
| **格式** | 常见为 `url` 公网地址，或 `data:image/png;base64,...` Data URL |
| **类型** | 多为 PNG / JPEG（见 `output_image_format`） |
| **多图** | 部分模型单次可返回多张，以响应体为准 |
| **尺寸** | 由模型与 `image_config` 决定 |

解析前请检查 `choices[0].message.images`；若为空，再查看 `message.content` 是否内嵌链接或 base64（以实现为准）。

---

## 模型兼容性

1. **`model`** 须为模型广场中的**生图模型 ID**。
2. 正确设置 **`modalities`**：多数模型用 `["image", "text"]`。
3. 勿对生图请求开启 **`stream: true`**。

---

## 最佳实践

- **提示词**：描述主体、风格、光线、构图，避免含糊的一句词。
- **模型选择**：在模型广场确认该 ID 支持图像输出。
- **参考图**：图生图时使用 `reference_images`，并配合 `text` 说明保留/变更的部分。
- **错误处理**：先判断 HTTP 状态与 `error` 对象，再解析 `images`。
- **存储**：`url` 形式注意链接有效期；`base64` 需自行解码落盘。

---

## 故障排除

**响应里没有图片？**

- 确认 `model` 为生图模型，且 `modalities` 含 `image`。
- 确认未设置 `stream: true`。
- 确认 `messages` 中用户 prompt 明确要求生成图像。

**模型不存在或不可用？**

- 在 [模型广场](https://trinity.ai/models) 核对模型 ID 与账号权限。

**与看图混淆？**

- 理解已有图片内容 → [图片输入](./image-input.md)（`image_url` Part）。
- 生成新图片 → 本页（`modalities` + `image_config`）。

---

## 相关

- [创建图像生成](../api/images-generations.md)
- [高级参数 · 生图](../api/image-generation-parameters.md)
- [图片输入](./image-input.md)
- [错误与调试](../reference/error-codes.md)
