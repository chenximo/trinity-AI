# Video generation · Advanced parameters

Use this page for tuning, integration, and field checks. Endpoint summary: [Create video generation task](./videos-generations.md). Workflow and polling: [Video generation](../multimodal/video-generation.md).

---

## Create task · request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Example: `tencent/kling-2.6` |
| `prompt` | string | Conditional | Required when no input assets are provided |
| `duration_sec` | integer | No | Duration in seconds, default `5` |
| `resolution` | string | No | `480p`, `720p`, `1080p`, etc. |
| `aspect_ratio` | string | No | e.g. `16:9`, `9:16`, `1:1` |
| `generate_audio` | boolean | No | Default `false` |
| `frame_images` | array | No | First / last frame images |
| `input_references` | array | No | Reference images / videos |
| `model_specific_config` | object | No | Model-specific allowlisted keys |
| `provider` | object | No | e.g. `raw_passthrough` (not part of create mapping) |

### `frame_images[]`

| Subfield | Description |
| --- | --- |
| `type` | Fixed `image_url` |
| `frame_type` | `first_frame` or `last_frame` |
| `image_url.url` | Reachable image URL |

First and last frames **must** use `frame_images[]`; do not pass model-specific asset usage values (for example `Reference`) as `reference_type`.

### `input_references[]` (basic)

| Field | Description |
| --- | --- |
| `type` | `image_url` or `video_url` |
| `image_url` | Required when `type=image_url`, contains `url` |
| `video_url` | Required when `type=video_url` (URL string) |
| `object_id` | Optional; use the same ID for multiple images of the same subject, then reference `@object_id` in `prompt` |
| `reference_type` | Optional; semantic reference type, see below |

---

## Advanced `input_references` {#input-references-advanced}

`object_id` and `reference_type` are both **optional**. If a value is wrong or unsupported by the current model, it may be ignored or return a parameter error. Follow model capability notes and actual responses.

**Scope**

- Mainly applies to `input_references[]` items with `type=image_url`.
- For `type=video_url`, `reference_type` may distinguish reference-video types such as `feature` / `base` on models like Kling.
- For pure text-to-video or first/last frame only (`frame_images`), these fields are usually unnecessary.

**Difference from `model_specific_config`**

| Field | Meaning |
| --- | --- |
| `input_references[].reference_type` | How to reference this asset (asset / style / subject / background, etc.) |
| File-usage keys inside `model_specific_config` (e.g. `usage`) | The file's role in the task (`FirstFrame`, `Reference`, `LastFrame`, etc.) |

### `object_id` (subject ID)

- Use the same `object_id` for multiple reference images of the same subject.
- Reference it in `prompt` (for example, if `object_id` is `hero_a`, write `@hero_a running in the rain`).
- Mainly for multi-image / subject reference models such as Vidu q2. Vidu scenarios usually need `object_id` and can omit `reference_type`.

```json
{
  "model": "tencent/vidu-q2",
  "prompt": "@hero_a walking by the sea, cinematic lighting",
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

### `reference_type` (reference semantics)

| `reference_type` | Model / scenario | Meaning |
| --- | --- | --- |
| `asset` | GV | Reference this image as an **asset** |
| `style` | GV | Reference this image for **style** |
| `subject` | PixVerse multi-image reference | Subject reference |
| `background` | PixVerse multi-image reference | Background reference |
| `feature` | Kling + `type=video_url` | Feature reference video |
| `base` | Kling + `type=video_url` | Base video to edit (not feature reference) |

**When to pass it**

- **GV** multi-image: specify `asset` or `style` for each image.
- **PixVerse**: use `subject` / `background`.
- **Kling** video reference: use `feature` / `base`.
- **Vidu** multi-image subjects: prefer `object_id`; usually omit `reference_type`.
- Single reference image or pure text-to-video: usually omit.

```json
{
  "model": "tencent/gv-3.1",
  "prompt": "Product launch event, camera cuts between stage and audience",
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

## Query task

`GET /v1/video/tasks/{taskId}`

| Parameter | Description |
| --- | --- |
| `taskId` (path) | `trinity_task.task_id` (or equivalent field) from the create response |

---

## Full JSON example (create)

```json
{
  "model": "tencent/kling-2.6",
  "prompt": "Golden hour coastline, camera follows a jogger, cinematic lighting.",
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

## Related

- [Create video generation task](./videos-generations.md)
- [Video generation](../multimodal/video-generation.md)
- [Errors & debugging](../reference/error-codes.md)
