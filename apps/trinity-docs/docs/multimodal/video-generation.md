# 视频生成

## 如何使用 Trinity 生成视频

Trinity 支持通过 API **异步**生成视频：先 **`POST /v1/video/generations`** 创建任务，再 **`GET /v1/video/tasks/{taskId}`** 轮询直至完成并获取输出地址。本页说明该流程及常用参数。

视频生成为**长耗时任务**，请勿在创建请求上阻塞等待成片；客户端应实现轮询与超时。详情见 [创建视频生成任务](../api/videos-generations.md)。

::: warning 勿与视频输入混淆
**文生视频 / 图生视频**用本页的 `/video/generations` 与 `/video/tasks/{taskId}`。**视频理解（输入）**在 `messages[].content` 里传 `type: file` + `file_url`，见 [视频输入](./video-input.md)。生视频里的 `input_references[].type: video_url` 是**参考素材字段**，不是聊天 Part。
:::

---

## 模型发现

- **API**：`GET /models?modality=video`，见 [获取模型](../api/models.md)
- **控制台**：[模型广场](https://trinity.ai/models) 复制 **模型 ID**（例如 `kling-2.6`）

以你账号可见列表为准。

---

## API 用法（两步）

| 步骤 | 方法 | 路径 | 作用 |
| --- | --- | --- | --- |
| 1. 创建任务 | `POST` | `/video/generations` | 提交 `model`、`prompt` 与可选素材/画幅参数 |
| 2. 查询结果 | `GET` | `/video/tasks/{taskId}` | 轮询状态，读取视频 URL 或错误信息 |

`taskId` 来自创建响应（字段名以实现为准，常见 **`trinity_task.task_id`**，形如 `vidtsk_xxx`）。查询时路径参数须与创建返回的 ID **完全一致**。

生视频为**长耗时任务**，客户端应实现**轮询**（建议间隔 2–5 秒，带指数退避上限），并设置总超时；勿在创建请求上阻塞等待成片。

---

## 基础文生视频

无参考图/视频时，**`prompt` 必填**。

::: code-group

```python [Python]
import json, os, time, requests

base = os.environ["TRINITY_BASE_URL"]
headers = {
    "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
    "Content-Type": "application/json",
}

create = requests.post(
    f"{base}/video/generations",
    headers=headers,
    data=json.dumps({
        "model": "kling-2.6",
        "prompt": "黄昏海边，镜头跟随人物慢跑，电影感光影",
        "duration_sec": 5,
        "aspect_ratio": "16:9",
    }),
)
create.raise_for_status()
body = create.json()

task = body.get("trinity_task") or {}
task_id = task.get("task_id") or body.get("task_id")
if not task_id:
    raise RuntimeError(f"No task id in response: {body}")

poll_url = f"{base}/video/tasks/{task_id}"
for attempt in range(120):
    r = requests.get(poll_url, headers={"Authorization": headers["Authorization"]})
    r.raise_for_status()
    data = r.json()
    # 终态字段名以实现为准；常见在 trinity_task.status 或顶层 status
    status = (data.get("trinity_task") or {}).get("status") or data.get("status")
    if status in ("succeeded", "completed", "success"):
        print("Done:", json.dumps(data, ensure_ascii=False)[:500])
        break
    if status in ("failed", "error", "cancelled"):
        raise RuntimeError(f"Task failed: {data}")
    time.sleep(3)
else:
    raise TimeoutError(f"Task {task_id} still running after polling")
```

```typescript [TypeScript (fetch)]
const base = process.env.TRINITY_BASE_URL!;
const auth = { Authorization: `Bearer ${process.env.TRINITY_API_KEY}` };

const createRes = await fetch(`${base}/video/generations`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...auth },
  body: JSON.stringify({
    model: "kling-2.6",
    prompt: "黄昏海边，镜头跟随人物慢跑，电影感光影",
    duration_sec: 5,
    aspect_ratio: "16:9",
  }),
});
const created = await createRes.json();
const taskId =
  created?.trinity_task?.task_id ?? created?.task_id;
if (!taskId) throw new Error(`No task id: ${JSON.stringify(created)}`);

for (let i = 0; i < 120; i++) {
  const poll = await fetch(`${base}/video/tasks/${taskId}`, { headers: auth });
  const data = await poll.json();
  const status = data?.trinity_task?.status ?? data?.status;
  if (["succeeded", "completed", "success"].includes(status)) {
    console.log("Done", data);
    break;
  }
  if (["failed", "error", "cancelled"].includes(status)) {
    throw new Error(`Task failed: ${JSON.stringify(data)}`);
  }
  await new Promise((r) => setTimeout(r, 3000));
}
```

```bash [Shell]
# 1) 创建任务
curl -sS "${TRINITY_BASE_URL}/video/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "kling-2.6",
    "prompt": "黄昏海边，镜头跟随人物慢跑，电影感光影",
    "duration_sec": 5,
    "aspect_ratio": "16:9"
  }'

# 2) 用上一步返回的 task_id 轮询（示例 ID 请替换）
curl -sS "${TRINITY_BASE_URL}/video/tasks/vidtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

:::

---

## 常用请求参数

完整字段表见 [视频生成 · 高级参数](../api/video-generation-parameters.md)。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | string | **必填**。模型 ID |
| `prompt` | string | 无 `frame_images` / `input_references` 时**必填**；有素材时仍建议写清镜头与风格 |
| `duration_sec` | integer | 时长（秒），默认 `5`，受模型能力限制 |
| `resolution` | string | 如 `480p`、`720p`、`1080p` |
| `aspect_ratio` | string | 如 `16:9`、`9:16`、`1:1` |
| `generate_audio` | boolean | 是否生成音频，默认 `false` |

### 首尾帧 `frame_images[]`

用**首帧 / 尾帧图**约束画面起止，勿与 `input_references` 里的「参考语义」混用。

| 子字段 | 说明 |
| --- | --- |
| `type` | 固定 `image_url` |
| `frame_type` | `first_frame` 或 `last_frame` |
| `image_url.url` | 可访问的图片 URL |

```json
"frame_images": [
  {
    "type": "image_url",
    "frame_type": "first_frame",
    "image_url": { "url": "https://example.com/first.png" }
  },
  {
    "type": "image_url",
    "frame_type": "last_frame",
    "image_url": { "url": "https://example.com/last.png" }
  }
]
```

### 参考素材 `input_references[]`

可传入参考**图**或**视频** URL，配合 `prompt` 控制生成。进阶字段 **`object_id`**、**`reference_type`** 及按模型的取值见 [高级参数 · `input_references`](../api/video-generation-parameters.md#input_references-进阶)。

| `type` | 必填字段 | 说明 |
| --- | --- | --- |
| `image_url` | `image_url.url` | 参考图 |
| `video_url` | `video_url`（URL 字符串） | 参考视频（如 Kling 特征/基底视频） |

### 模型专属 `model_specific_config`

模型白名单内的键（如 `scene_type`、`enhance_prompt`）会映射到上游；**未在白名单的键不生效**。`logo_add` 不支持。与 `input_references[].reference_type` 的区别见高级参数页。

---

## 图生视频 / 多参考示例

```json
{
  "model": "kling-2.6",
  "prompt": "产品特写缓慢旋转，柔光棚拍",
  "duration_sec": 5,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "frame_images": [
    {
      "type": "image_url",
      "frame_type": "first_frame",
      "image_url": { "url": "https://example.com/product.png" }
    }
  ],
  "input_references": [],
  "model_specific_config": {
    "scene_type": "text_to_video",
    "enhance_prompt": "Enabled"
  }
}
```

Vidu 多图主体、`object_id` 与 `@hero_a` 写法、GV / PixVerse / Kling 的 `reference_type` 表与 JSON 样例均在 [高级参数](../api/video-generation-parameters.md)。

---

## 响应格式

### 创建任务（`POST /video/generations`）

成功时返回任务标识，用于后续查询（结构以实现为准）：

```json
{
  "trinity_task": {
    "task_id": "vidtsk_xxxxxxxx"
  }
}
```

也可能在顶层出现 `task_id` 等字段；集成时**优先读取 `trinity_task.task_id`**，并兼容顶层别名。

### 查询任务（`GET /video/tasks/{taskId}`）

轮询响应通常包含：

| 概念 | 说明 |
| --- | --- |
| **状态** | 进行中 / 成功 / 失败（字段名与枚举值以实现为准） |
| **视频地址** | 成功后在嵌套对象或 `output` 相关字段中返回可下载 URL |
| **错误** | 失败时含 `error` 或上游错误描述，见 [错误与调试](../reference/error-codes.md) |

解析时先判断 HTTP 状态与业务 `error`，再根据**终态 status** 或**是否已出现视频 URL** 结束轮询。具体 JSON 路径以你环境的一次成功响应为准落库到集成代码。

---

## 轮询与可靠性

- **间隔**：建议 2–5 秒起，可对 429 使用退避。
- **超时**：按 `duration_sec` 与模型排队情况设置客户端上限（常见 5–15 分钟量级）。
- **幂等**：创建任务可配合 `X-Idempotency-Key`（见 [API 概述](../api/overview.md)）避免重复提交；**同一 `taskId` 的查询可安全重试**。
- **存储**：输出 URL 多为**临时链接**，收到后应尽快下载或转存到你方对象存储。

---

## 模型兼容性

1. **`model`** 须为模型广场中支持**视频生成**的 ID。
2. **`duration_sec` / `resolution` / `aspect_ratio`** 须在该模型文档或广场说明的能力范围内。
3. **`frame_images` / `input_references`** 是否支持及数量上限**因模型而异**；不支持的组合可能由上游忽略或报错。
4. **`reference_type` / `object_id`** 仅对部分模型有意义，传错可能被忽略；见高级参数表。

---

## 最佳实践

- **提示词**：写清主体、运镜、光线、节奏；多参考图时用 `@object_id` 与参考语义字段一致。
- **素材 URL**：须公网可访问、格式与大小符合平台校验；首帧尾帧用 `frame_images`，多图参考用 `input_references`。
- **分离职责**：聊天里的视频**理解**与生视频 **API** 勿混用端点。
- **错误处理**：创建失败看 HTTP + `error`；轮询失败保留 `taskId` 便于工单排查（勿对外暴露内部 `request_id` 落库字段）。

---

## 故障排除

**创建返回 4xx？**

- 检查 `model`、`prompt`（无素材时必填）、Key 与 `TRINITY_BASE_URL`（含 `/v1`）。
- 确认未传入当前模型不支持的 `model_specific_config` 键。

**一直轮询不到完成？**

- 确认 `taskId` 与创建响应一致。
- 加大超时；高峰时段排队属正常。
- 查看查询响应中的 `status` 与 `error` 详情。

**没有视频 URL？**

- 确认任务已到成功终态再解析；字段路径以实现为准。
- URL 可能有过期时间，成功后尽快下载。

**与视频理解混淆？**

- 分析已有视频 → [视频输入](./video-input.md)。
- 生成新视频 → 本页 + [创建视频生成任务](../api/videos-generations.md)。

---

## 相关

- [创建视频生成任务](../api/videos-generations.md)
- [高级参数 · 生视频](../api/video-generation-parameters.md)
- [视频输入](./video-input.md)
- [错误与调试](../reference/error-codes.md)
