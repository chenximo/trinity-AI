# 视频生成 · 高级参数

创建任务：**`POST /v1/video/generations`**。端点速览见 [创建视频生成任务](./videos-generations.md)。概念与轮询流程见 [视频生成](../multimodal/video-generation.md)。

---

## 创建任务 · 请求体

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 如 `tencent/kling-2.6` |
| `prompt` | string | 条件 | 无素材时必填 |
| `duration_sec` | integer | 否 | 时长（秒），默认 `5` |
| `resolution` | string | 否 | `480p`、`720p`、`1080p` 等 |
| `aspect_ratio` | string | 否 | 如 `16:9`、`9:16`、`1:1` |
| `generate_audio` | boolean | 否 | 默认 `false` |
| `frame_images` | array | 否 | 首帧 / 尾帧图 |
| `input_references` | array | 否 | 参考图 / 参考视频 |
| `model_specific_config` | object | 否 | 模型专属白名单键 |
| `provider` | object | 否 | 如 `raw_passthrough`（不参与创建映射） |

### `frame_images[]`

| 子字段 | 说明 |
| --- | --- |
| `type` | 固定 `image_url` |
| `frame_type` | `first_frame` 或 `last_frame` |
| `image_url.url` | 可访问图片 URL |

首帧、尾帧**必须**走 `frame_images[]`；不要把腾讯侧 `Usage` 取值（如 `Reference`）当作 `reference_type` 传入。

### `input_references[]`（基础）

| 字段 | 说明 |
| --- | --- |
| `type` | `image_url` 或 `video_url` |
| `image_url` | `type=image_url` 时必填，含 `url` |
| `video_url` | `type=video_url` 时必填（URL 字符串） |
| `object_id` | 可选；多图同一主体时相同 ID，可在 `prompt` 用 `@object_id` |
| `reference_type` | 可选；参考语义，见下节 |

---

## `input_references` 进阶 {#input_references-进阶}

`object_id` 与 `reference_type` 均为**可选**，平台映射到上游 `FileInfos[]`，**不做枚举校验**；传错或当前模型不支持时，上游可能忽略或报错。

**适用范围**

- 主要作用于 `input_references[]` 且 `type=image_url` 的项。
- `type=video_url` 时，`reference_type` 在 Kling 等模型上用于区分参考视频类型（`feature` / `base`）。
- 纯文生视频、仅首尾帧（`frame_images`）时，通常**不必**传这两个字段。

**与 `model_specific_config` 的区别**

| 字段 | 含义 |
| --- | --- |
| `input_references[].reference_type` | 该参考素材的**参考方式**（素材 / 风格 / 主体 / 背景等） |
| `model_specific_config` 内与文件用途相关的键（如 `usage`） | 文件在任务中的**用途**（如 `FirstFrame`、`Reference`、`LastFrame`） |

### `object_id`（主体 ID）

- 多张参考图属同一主体时传**相同** `object_id`。
- 在 `prompt` 中可用 `@object_id` 引用（例：`object_id` 为 `hero_a` 时写 `@hero_a 在雨中奔跑`）。
- **主要适用**：Vidu q2 等多图 / 主体参考；Vidu 场景通常只需 `object_id`，一般**不需要** `reference_type`。

```json
{
  "model": "tencent/vidu-q2",
  "prompt": "@hero_a 在海边漫步，电影感光影",
  "duration_sec": 5,
  "input_references": [
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/face.png" },
      "object_id": "hero_a"
    },
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/outfit.png" },
      "object_id": "hero_a"
    }
  ],
  "model_specific_config": {
    "usage": "Reference"
  }
}
```

### `reference_type`（参考语义）

| `reference_type` | 适用模型 / 场景 | 含义 |
| --- | --- | --- |
| `asset` | GV | 按**素材**参考该图片 |
| `style` | GV | 按**风格**参考该图片 |
| `subject` | PixVerse 多图参考 | 该图为**主体**参考 |
| `background` | PixVerse 多图参考 | 该图为**背景**参考 |
| `feature` | Kling + `type=video_url` | **特征**参考视频 |
| `base` | Kling + `type=video_url` | **待编辑**参考视频（非特征参考） |

**何时需要传**

- **GV** 多图：建议每张图指定 `asset` 或 `style`。
- **PixVerse**：用 `subject` / `background` 区分。
- **Kling** 视频参考：用 `feature` / `base`。
- **Vidu** 等多图主体：优先 `object_id`，一般省略 `reference_type`。
- 单张参考图、纯文生视频：通常省略。

```json
{
  "model": "tencent/gv-3.1",
  "prompt": "产品发布会，镜头在舞台与观众间切换",
  "duration_sec": 8,
  "input_references": [
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/product.png" },
      "reference_type": "asset"
    },
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/style-ref.png" },
      "reference_type": "style"
    }
  ]
}
```

---

## 查询任务

`GET /v1/video/tasks/{taskId}`

| 参数 | 说明 |
| --- | --- |
| `taskId`（路径） | 创建响应中的 `trinity_task.task_id`（或等价字段） |

---

## 完整 JSON 示例（创建）

```json
{
  "model": "tencent/kling-2.6",
  "prompt": "黄昏海边，镜头跟随人物慢跑，电影感光影。",
  "duration_sec": 5,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "generate_audio": false,
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
  ],
  "input_references": [],
  "model_specific_config": {
    "scene_type": "text_to_video",
    "enhance_prompt": "Enabled"
  },
  "provider": {
    "raw_passthrough": false
  }
}
```

---

## 相关

- [创建视频生成任务](./videos-generations.md)
- [视频生成](../multimodal/video-generation.md)
- [生视频指南](../guides/video-generation.md)
- [错误与调试](../reference/error-codes.md)
