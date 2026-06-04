# 创建视频生成任务

`POST` `{TRINITY_BASE_URL}/video/generations`

`Content-Type: application/json`

创建异步生视频任务；结果通过查询任务接口获取。

---

## Authentication

**Authorization** · Bearer — 见 [API 概述 · 鉴权](./overview.md#鉴权)。

---

## Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 如 `tencent/kling-2.6` |
| `prompt` | string | 条件 | 无素材时必填 |
| `duration_sec` | integer | 否 | 默认 `5` |
| `resolution` | string | 否 | 如 `1080p` |
| `aspect_ratio` | string | 否 | 如 `16:9` |

`frame_images`、`input_references`、`model_specific_config` 等见 [视频生成 · 高级参数](./video-generation-parameters.md)。

---

## Response

返回异步任务标识；用 `task_id`（或 `trinity_task.task_id`）查询状态。

---

## SDK 代码示例

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
        "prompt": "黄昏海边慢跑，电影感",
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
    prompt: "黄昏海边慢跑，电影感",
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
    "prompt": "黄昏海边慢跑，电影感",
    "duration_sec": 5,
    "aspect_ratio": "16:9"
  }'
```

:::

---

## 查询任务

`GET` `{TRINITY_BASE_URL}/video/tasks/{taskId}`

```bash
curl -sS "${TRINITY_BASE_URL}/video/tasks/vidtsk_xxx" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## 相关

- [视频生成](../multimodal/video-generation.md)
- [视频生成 · 高级参数](./video-generation-parameters.md)
- [生视频指南](../guides/video-generation.md)
- [API 概述](./overview.md)
