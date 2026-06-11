# 创建视频生成任务

向视频生成模型提交任务，异步生成视频。适用于文生视频、首尾帧生成视频、参考图/参考视频生成视频等场景。

视频生成是长耗时任务：先调用 `POST /video/generations` 创建任务，再用返回的 `task_id` 轮询 `GET /video/tasks/{taskId}` 获取状态与结果。它**不是** `/chat/completions` 同步返回。

---

## Endpoint

| Method | URL | 说明 |
| --- | --- | --- |
| `POST` | `{TRINITY_BASE_URL}/video/generations` | 创建视频生成任务 |
| `GET` | `{TRINITY_BASE_URL}/video/tasks/{taskId}` | 查询任务状态与结果 |

---

## Authentication

**Authorization** · Bearer — 见 [API 概述 · 鉴权](./overview.md#鉴权)。

---

## Headers

| 请求头 | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 是 | `Bearer <TRINITY_API_KEY>` |
| `Content-Type` | 创建任务时 | `application/json` |

创建任务时建议携带追踪与结算头（`X-Request-Id`、`X-Idempotency-Key`、`X-Conversation-Id`），见 [API 概述 · 追踪与结算](./overview.md#追踪与结算请求头)。

---

## 最小请求示例

```bash
curl -sS "${TRINITY_BASE_URL}/video/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -d '{
    "model": "kling-2.6",
    "prompt": "黄昏海边慢跑，电影感",
    "duration_sec": 5,
    "aspect_ratio": "16:9"
  }'
```

---

## Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | string | 是 | 视频模型 ID；见 [获取模型](./models.md)（`modality=video`）或 [模型广场](https://trinity.ai/models) |
| `prompt` | string | 条件 | 无素材时必填；有素材时仍建议描述镜头、动作与风格 |
| `duration_sec` | integer | 否 | 默认 `5`，受模型能力限制 |
| `resolution` | string | 否 | 如 `720p`、`1080p` |
| `aspect_ratio` | string | 否 | 如 `16:9`、`9:16`、`1:1` |

`frame_images`、`input_references`、`model_specific_config` 等见 [视频生成 · 高级参数](./video-generation-parameters.md)。完整轮询流程见 [视频生成指南](../multimodal/video-generation.md)。

---

## Response

创建成功后返回异步任务标识。后续使用 `task_id`（或 `trinity_task.task_id`）查询状态，任务完成后在查询响应中读取视频 URL 或错误信息。

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
        "model": "kling-2.6",
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
    model: "kling-2.6",
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
    "model": "kling-2.6",
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

- [获取模型](./models.md)（`modality=video`）
- [视频生成](../multimodal/video-generation.md)
- [视频生成 · 高级参数](./video-generation-parameters.md)
- [API 概述](./overview.md)
