# 生图

通过 **`POST /v1/images/generations`** 按文本提示生成图像。请求体对齐 [OpenAI Images](https://platform.openai.com/docs/api-reference/images/create)。

## 流程

1. 在 [控制台](../manage-api-keys.md) 创建 API 密钥。
2. 选择支持图像生成的 `provider/model`（以模型列表为准）。
3. 发送 HTTP POST，解析返回中的 `data[].url` 或 `b64_json`。

## 示例

::: code-group

```bash [Shell]
curl "${TRINITY_BASE_URL}/images/generations" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/dall-e-3",
    "prompt": "A serene lake at sunset, minimal flat illustration",
    "n": 1,
    "size": "1024x1024"
  }'
```

```typescript [TypeScript]
const res = await fetch(`${process.env.TRINITY_BASE_URL}/images/generations`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRINITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "openai/dall-e-3",
    prompt: "A serene lake at sunset, minimal flat illustration",
    n: 1,
    size: "1024x1024",
  }),
});
const data = await res.json();
console.log(data.data?.[0]?.url);
```

```python [Python]
import json
import os
import requests

r = requests.post(
    f"{os.environ['TRINITY_BASE_URL']}/images/generations",
    headers={
        "Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "openai/dall-e-3",
        "prompt": "A serene lake at sunset, minimal flat illustration",
        "n": 1,
        "size": "1024x1024",
    }),
)
print(r.json()["data"][0].get("url"))
```

:::

::: tip
返回 URL 若有有效期，请在业务侧及时转存；勿将 Key 写进前端公开代码。
:::

## 相关

- [图像生成 API](../api/images-generations.md)
- [请求参数](./request-parameters.md)
- [错误与调试](../reference/error-codes.md)
