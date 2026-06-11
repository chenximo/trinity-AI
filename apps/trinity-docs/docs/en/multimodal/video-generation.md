# Video generation

## How to generate video with Trinity

Trinity generates video **asynchronously** through the API: **`POST /v1/video/generations`** to create a task, then **`GET /v1/video/tasks/{taskId}`** to poll until completion and read the output URL. This page walks through that flow and common parameters.

Video generation is **long-running**. Do not block on the create request until the file is ready; implement polling and timeouts. See [Create video generation task](../api/videos-generations.md).

::: warning Do not confuse with video input
**Text-to-video / image-to-video** uses `/video/generations` and `/video/tasks/{taskId}` on this page. **Video understanding (input)** uses `type: file` + `file_url` in `messages[].content`—see [Video input](./video-input.md). `input_references[].type: video_url` on generation requests is a **reference asset field**, not a chat Part.
:::

---

## Model discovery

- **API**: `GET /models?modality=video`—see [List models](../api/models.md)
- **Console**: [Model catalog](https://trinity.ai/models)—copy the **model ID** (for example `kling-2.6`)

Use only models visible to your account.

---

## API flow (two steps)

| Step | Method | Path | Purpose |
| --- | --- | --- | --- |
| 1. Create task | `POST` | `/video/generations` | Submit `model`, `prompt`, and optional assets / layout |
| 2. Query result | `GET` | `/video/tasks/{taskId}` | Poll status; read video URL or errors |

`taskId` comes from the create response (field names may vary; commonly **`trinity_task.task_id`**, e.g. `vidtsk_xxx`). The path parameter must **exactly match** the ID returned at creation.

Video generation is **long-running**. Implement **polling** (suggested interval 2–5 seconds with backoff cap) and a client-side timeout; do not block on the create request until the file is ready.

---

## Basic text-to-video

With no reference images or videos, **`prompt` is required**.

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
        "prompt": "Golden hour coastline, camera follows a jogger, cinematic lighting",
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
    # Terminal status field names may vary; often trinity_task.status or top-level status
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
    prompt: "Golden hour coastline, camera follows a jogger, cinematic lighting",
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
# 1) Create task
curl -sS "${TRINITY_BASE_URL}/video/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "kling-2.6",
    "prompt": "Golden hour coastline, camera follows a jogger, cinematic lighting",
    "duration_sec": 5,
    "aspect_ratio": "16:9"
  }'

# 2) Poll with task_id from step 1 (replace example ID)
curl -sS "${TRINITY_BASE_URL}/video/tasks/vidtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

:::

---

## Common request fields

Full field list: [Video generation · Advanced parameters](../api/video-generation-parameters.md).

| Field | Type | Description |
| --- | --- | --- |
| `model` | string | **Required.** Model ID |
| `prompt` | string | **Required** when no `frame_images` / `input_references`; with assets, still describe shots and style |
| `duration_sec` | integer | Length in seconds; default `5`; model limits apply |
| `resolution` | string | e.g. `480p`, `720p`, `1080p` |
| `aspect_ratio` | string | e.g. `16:9`, `9:16`, `1:1` |
| `generate_audio` | boolean | Generate audio; default `false` |

### First / last frame `frame_images[]`

Constrain start and end frames with images—do not mix this with reference **semantics** in `input_references`.

| Subfield | Description |
| --- | --- |
| `type` | Always `image_url` |
| `frame_type` | `first_frame` or `last_frame` |
| `image_url.url` | Reachable image URL |

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

### Reference assets `input_references[]`

Pass reference **images** or **videos** with `prompt` to steer generation. Advanced **`object_id`** and **`reference_type`** values per model: [Advanced parameters](../api/video-generation-parameters.md).

| `type` | Required | Description |
| --- | --- | --- |
| `image_url` | `image_url.url` | Reference image |
| `video_url` | `video_url` (URL string) | Reference video (e.g. Kling feature / base video) |

### Model-specific `model_specific_config`

Whitelisted keys (e.g. `scene_type`, `enhance_prompt`) map upstream; **other keys are ignored**. `logo_add` is not supported. See the advanced parameters page for `reference_type` vs `usage`.

---

## Image-to-video / multi-reference example

```json
{
  "model": "kling-2.6",
  "prompt": "Product close-up slowly rotating, soft studio light",
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

Vidu multi-subject patterns, `object_id` with `@hero_a`, and GV / PixVerse / Kling `reference_type` tables are in [Advanced parameters](../api/video-generation-parameters.md).

---

## Response format

### Create task (`POST /video/generations`)

Success returns a task identifier for polling (shape may vary):

```json
{
  "trinity_task": {
    "task_id": "vidtsk_xxxxxxxx"
  }
}
```

A top-level `task_id` may also appear; prefer **`trinity_task.task_id`** and accept aliases.

### Query task (`GET /video/tasks/{taskId}`)

Poll responses typically include:

| Concept | Description |
| --- | --- |
| **Status** | In progress / success / failure (names and enums are implementation-specific) |
| **Video URL** | Download URL in nested or `output` fields on success |
| **Errors** | Failure details; see [Errors & debugging](../reference/error-codes.md) |

Check HTTP status and business `error` first, then stop polling on a terminal **status** or when a video URL appears. Pin exact JSON paths from one successful response in your environment.

---

## Polling and reliability

- **Interval**: Start at 2–5 seconds; backoff on 429.  
- **Timeout**: Scale with `duration_sec` and queue load (often 5–15 minutes).  
- **Idempotency**: Use `X-Idempotency-Key` on create (see [API overview](../api/overview.md)); **polling the same `taskId` is safe to retry**.  
- **Storage**: Output URLs are often **temporary**—download or copy to your storage promptly.

---

## Model compatibility

1. **`model`** must be a **video generation** ID from the catalog.  
2. **`duration_sec` / `resolution` / `aspect_ratio`** must be within model limits.  
3. **`frame_images` / `input_references`** support and caps **vary by model**.  
4. **`reference_type` / `object_id`** matter only for some models; wrong values may be ignored.

---

## Best practices

- **Prompts**: Subject, camera motion, lighting, pacing; align `@object_id` with reference fields when using multiple images.  
- **Asset URLs**: Public, valid format and size; use `frame_images` for first/last frame, `input_references` for multi-reference.  
- **Separation**: Do not use chat video **understanding** endpoints for **generation**.  
- **Errors**: On create failure, inspect HTTP + `error`; keep `taskId` for support (do not expose internal DB `request_id` fields to end users).

---

## Troubleshooting

**Create returns 4xx?**

- Check `model`, `prompt` (required without assets), key, and `TRINITY_BASE_URL` (include `/v1`).  
- Remove unsupported `model_specific_config` keys for that model.

**Polling never completes?**

- Verify `taskId` matches the create response.  
- Increase timeout; queuing at peak is normal.  
- Inspect `status` and `error` in the poll body.

**No video URL?**

- Parse only after a success terminal state; field paths vary.  
- URLs may expire—download soon after success.

**Confused with video input?**

- Analyze existing video → [Video input](./video-input.md).  
- Generate new video → this page + [Create video generation task](../api/videos-generations.md).

---

## Related

- [Create video generation task](../api/videos-generations.md)
- [Advanced parameters · Video](../api/video-generation-parameters.md)
- [Video input](./video-input.md)
- [Errors & debugging](../reference/error-codes.md)
