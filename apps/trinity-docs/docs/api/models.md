# 获取模型

拉取当前 API Key **可用**的已上架模型。返回列表中的 `id` 即后续请求里的 **`model`** 字段，适用于在调用生文、生图、生视频接口前做能力发现。

也可在控制台 [模型广场](https://trinity.ai/models) 浏览模型；API 与广场均以你账号实际可见列表为准。

---

## Endpoint

| Method | URL |
| --- | --- |
| `GET` | `{TRINITY_BASE_URL}/models` |

---

## Authentication

**Authorization** · Bearer

在 `Authorization` 请求头传入 API Key：`Bearer <TRINITY_API_KEY>`（前缀一般为 `xh-...`）。详见 [管理 API 密钥](../manage-api-keys.md)。

---

## Headers

| 请求头 | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 是 | `Bearer <TRINITY_API_KEY>` |
| `Accept` | 否 | 建议 `application/json` |

本接口为 **GET**，无需 `Content-Type` 与追踪/结算头。

---

## Query

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `modality` | 否 | 按模态筛选；省略时等价于 `text`（生文）。取值：`text`、`image`、`video`、`all` |

完整说明与 `metadata` 字段见 [获取模型 · 高级参数](./models-parameters.md)。

---

## 最小请求示例

```bash
# 生文模型（默认）
curl -sS "${TRINITY_BASE_URL}/models" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"

# 生图模型
curl -sS "${TRINITY_BASE_URL}/models?modality=image" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## Response

成功时返回 **OpenAI 兼容** JSON（无额外包装层）：

| 字段 | 说明 |
| --- | --- |
| `object` | 固定为 `"list"` |
| `data` | 模型对象数组；无可用模型时为 `[]` |

单条模型的 `id`、`metadata` 及按模态的展示价字段见 [高级参数](./models-parameters.md)。

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-5.5",
      "object": "model",
      "created": 1700000000,
      "owned_by": "trinity",
      "metadata": {
        "context_length": 128000,
        "user_input_price_per_million_usd": 0.15,
        "user_output_price_per_million_usd": 0.60
      }
    }
  ]
}
```

---

## SDK 代码示例

::: code-group

```python [Python]
import os, requests

base = os.environ["TRINITY_BASE_URL"]
headers = {"Authorization": f"Bearer {os.environ['TRINITY_API_KEY']}"}

r = requests.get(f"{base}/models", headers=headers, params={"modality": "text"})
r.raise_for_status()
for m in r.json()["data"]:
    print(m["id"])
```

```ts [TypeScript]
const base = process.env.TRINITY_BASE_URL;
const res = await fetch(`${base}/models?modality=image`, {
  headers: { Authorization: `Bearer ${process.env.TRINITY_API_KEY}` },
});
const body = await res.json();
body.data.forEach((m: { id: string }) => console.log(m.id));
```

```bash [Shell]
curl -sS "${TRINITY_BASE_URL}/models?modality=video" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

:::

---

## 与下游接口

| `modality` | 列表 `id` 用于 |
| --- | --- |
| `text`（默认） | `POST /chat/completions` → `model` |
| `image` | `POST /chat/completions` → `model`（须 `modalities` 含 `image`） |
| `video` | `POST /video/generations` → `model` |

各模型可调参数以对应能力的**高级参数**页为准；本接口**不返回**完整参数 schema。

---

## 相关

- [获取模型 · 高级参数](./models-parameters.md)
- [API 概述](./overview.md)
- [创建对话补全](./chat-completions.md)
- [创建图像生成](./images-generations.md)
- [创建视频生成任务](./videos-generations.md)
- [错误与调试](../reference/error-codes.md)
