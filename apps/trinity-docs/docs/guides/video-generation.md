# 生视频

通过 **`POST /v1/videos/generations`** 按文本（及可选参考素材）生成视频。上游实现差异较大，文档样例对齐常见 **创建任务 → 轮询状态** 模式，**具体字段待产品校验**。

## 流程

1. 创建 API 密钥。
2. `POST /videos/generations` 提交 `model` 与 `prompt`。
3. 若响应含 `id` 且 `status` 为 `processing`，轮询任务接口直至 `completed` 或 `failed`。
4. 从结果中读取视频 `url`（或下载地址）。

::: info 待确认
轮询路径可能为 `GET /v1/videos/generations/{id}` 或独立 `GET /v1/videos/{id}`，以网关 OpenAPI 为准。
:::

## 创建任务示例

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/videos/generations" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "provider/video-model",
    "prompt": "A drone shot over coastline at golden hour, 5 seconds",
    "aspect_ratio": "16:9"
  }'
```

```typescript [TypeScript]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/videos/generations`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "provider/video-model",
    prompt: "A drone shot over coastline at golden hour, 5 seconds",
    aspect_ratio: "16:9",
  }),
});
const job = await res.json();
console.log(job.id, job.status);
```

:::

## 轮询（样例）

```bash
# 路径待产品确认
curl "${TRINITY_BASE_URL}/videos/generations/${JOB_ID}" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

## 相关

- [视频生成 API](../api/videos-generations.md)
- [请求参数](./request-parameters.md)
- [错误与调试](../reference/error-codes.md)
