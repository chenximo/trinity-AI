# Create video generation task

Submit a task to a video generation model and generate video asynchronously. Use this endpoint for text-to-video, first/last-frame video generation, and video generation with image or video references.

Video generation is a long-running task: first call `POST /video/generations` to create a task, then poll `GET /video/tasks/{taskId}` with the returned `task_id` to retrieve status and results. This is **not** returned synchronously from `/chat/completions`.

---

## Endpoint

| Method | URL | Description |
| --- | --- | --- |
| `POST` | `{TRINITY_BASE_URL}/video/generations` | Create a video generation task |
| `GET` | `{TRINITY_BASE_URL}/video/tasks/{taskId}` | Query task status and results |

---

## Authentication

**Authorization** · Bearer — see [API overview · Authentication](./overview.md#authentication).

---

## Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | Yes | `Bearer <TRINITY_API_KEY>` |
| `Content-Type` | When creating a task | `application/json` |

When creating a task, include tracing and settlement headers (`X-Request-Id`, `X-Idempotency-Key`, `X-Conversation-Id`); see [API overview · Tracing and settlement](./overview.md#tracing-and-settlement-headers).

---

## Minimal request

```bash
curl -sS "${TRINITY_BASE_URL}/video/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "tencent/kling-2.6",
    "prompt": "Golden hour coastline, cinematic jogger shot",
    "duration_sec": 5,
    "aspect_ratio": "16:9"
  }'
```

---

## Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Video generation model, e.g. `tencent/kling-2.6` |
| `prompt` | string | Conditional | Required when no input assets are provided; still recommended for describing camera movement, action, and style |
| `duration_sec` | integer | No | Default `5`, limited by model capabilities |
| `resolution` | string | No | Example: `720p`, `1080p` |
| `aspect_ratio` | string | No | Example: `16:9`, `9:16`, `1:1` |

`frame_images`, `input_references`, `model_specific_config`, and related fields are documented in [Video generation · Advanced parameters](./video-generation-parameters.md). Full polling flow: [Video generation guide](../multimodal/video-generation.md).

---

## Response

A successful create request returns an async task identifier. Use `task_id` or `trinity_task.task_id` to query status, then read the video URL or error information from the task query response.

---

## SDK examples

::: code-group

```python [Python]
import json, os, requests

r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/video/generations",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "tencent/kling-2.6",
        "prompt": "Golden hour coastline, cinematic jogger shot",
        "duration_sec": 5,
        "aspect_ratio": "16:9",
    }),
)
print(r.json())
```

```typescript [TypeScript (fetch)]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/video/generations`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "tencent/kling-2.6",
    prompt: "Golden hour coastline, cinematic jogger shot",
    duration_sec: 5,
    aspect_ratio: "16:9",
  }),
});
console.log(await res.json());
```

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/video/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "tencent/kling-2.6",
    "prompt": "Golden hour coastline, cinematic jogger shot",
    "duration_sec": 5,
    "aspect_ratio": "16:9"
  }'
```

:::

---

## Query task

`GET` `{TRINITY_BASE_URL}/video/tasks/{taskId}`

```bash
curl -sS "${TRINITY_BASE_URL}/video/tasks/vidtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## Related

- [Video generation](../multimodal/video-generation.md)
- [Video generation · Advanced parameters](./video-generation-parameters.md)
- [API overview](./overview.md)
