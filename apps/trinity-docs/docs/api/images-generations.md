# 图像生成（生图）

`POST /v1/images/generations`

根据文本提示生成图像。请求体对齐 [OpenAI Create image](https://platform.openai.com/docs/api-reference/images/create)。

---

## 请求

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | string | **必填**。`provider/model`，如 `openai/dall-e-3` |
| `prompt` | string | **必填**。图像描述 |
| `n` | integer | 可选。生成数量，默认 1 |
| `size` | string | 可选。如 `1024x1024` |
| `response_format` | string | 可选。`url` \| `b64_json` |

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/images/generations" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/dall-e-3",
    "prompt": "A serene lake at sunset",
    "size": "1024x1024"
  }'
```

```python [Python]
import json, os, requests

r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/images/generations",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "openai/dall-e-3",
        "prompt": "A serene lake at sunset",
        "size": "1024x1024",
    }),
)
print(r.json())
```

:::

---

## 响应

成功时返回 `data` 数组，元素含 `url` 或 `b64_json`（取决于 `response_format`）。

```json
{
  "created": 1710000000,
  "data": [{ "url": "https://..." }]
}
```

---

## 相关

- [生图指南](../guides/image-generation.md)
- [请求参数](../guides/request-parameters.md)
- [错误与调试](../reference/error-codes.md)
