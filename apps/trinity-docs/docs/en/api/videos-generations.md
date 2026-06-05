# Create video generation task

`POST` `{TRINITY_BASE_URL}/video/generations`

`Content-Type: application/json`

Create an async video generation task. Retrieve results with the task query endpoint.

---

## Authentication

**Authorization** · Bearer — see [API overview · Authentication](./overview.md#authentication).

---

## Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | string | Yes | Example: `tencent/kling-2.6` |
| `prompt` | string | Conditional | Required when no input assets are provided |
| `duration_sec` | integer | No | Default `5` |
| `resolution` | string | No | Example: `1080p` |
| `aspect_ratio` | string | No | Example: `16:9` |

`frame_images`, `input_references`, `model_specific_config`, and related fields are documented in [Video generation · Advanced parameters](./video-generation-parameters.md).

---

## Response

Returns an async task identifier. Use `task_id` (or `trinity_task.task_id`) to query status.

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
