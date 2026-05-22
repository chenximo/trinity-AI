# 视频生成（生视频）

`POST /v1/videos/generations`

根据提示生成视频。上游多为异步；样例请求体参考 OpenAI 系扩展约定，**路径与状态字段待产品校验**。

---

## 创建生成任务

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | string | **必填**。`provider/model` |
| `prompt` | string | **必填**。视频描述 |
| `duration` | integer | 可选。时长（秒） |
| `aspect_ratio` | string | 可选。如 `16:9`、`9:16` |

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/videos/generations" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "provider/video-model",
    "prompt": "Ocean waves, cinematic, 5s",
    "aspect_ratio": "16:9"
  }'
```

```python [Python]
import json, os, requests

r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/videos/generations",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "provider/video-model",
        "prompt": "Ocean waves, cinematic, 5s",
        "aspect_ratio": "16:9",
    }),
)
print(r.json())
```

:::

---

## 响应（异步样例）

```json
{
  "id": "video_abc123",
  "status": "processing",
  "model": "provider/video-model"
}
```

`status` 可能为 `processing`、`completed`、`failed`。完成后响应或查询接口提供 `url` / `output` 等字段（以实现为准）。

---

## 查询任务（占位）

```http
GET /v1/videos/generations/{id}
Authorization: Bearer <TRINITY_API_KEY>
```

::: info 待确认
查询路径、状态枚举与终态响应结构以网关 OpenAPI 为准。
:::

---

## 相关

- [生视频指南](../guides/video-generation.md)
- [错误与调试](../reference/error-codes.md)
