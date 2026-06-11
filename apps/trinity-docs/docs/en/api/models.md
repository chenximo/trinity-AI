# List models

List **available** published models for the current API key. Each item's `id` is the **`model`** field in later requests—use this before calling text, image, or video endpoints.

You can also browse models in the [model catalog](https://trinity.ai/models); both the API and the catalog reflect what your account can access.

---

## Endpoint

| Method | URL |
| --- | --- |
| `GET` | `{TRINITY_BASE_URL}/models` |

---

## Authentication

**Authorization** · Bearer

Send your API key as `Bearer <TRINITY_API_KEY>` (prefix is usually `xh-...`). See [Manage API keys](../manage-api-keys.md).

---

## Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | Yes | `Bearer <TRINITY_API_KEY>` |
| `Accept` | No | Recommended: `application/json` |

This is a **GET** request—no `Content-Type` or tracing/settlement headers.

---

## Query

| Parameter | Required | Description |
| --- | --- | --- |
| `modality` | No | Filter by modality; omitted means `text` (chat). Values: `text`, `image`, `video`, `all` |

Full parameter and `metadata` details: [List models · Advanced parameters](./models-parameters.md).

---

## Minimal request

```bash
# Text models (default)
curl -sS "${TRINITY_BASE_URL}/models" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"

# Image models
curl -sS "${TRINITY_BASE_URL}/models?modality=image" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## Response

Success returns **OpenAI-compatible** JSON (no extra envelope):

| Field | Description |
| --- | --- |
| `object` | Always `"list"` |
| `data` | Array of model objects; `[]` when none are available |

Per-item `id`, `metadata`, and modality-specific pricing fields: [Advanced parameters](./models-parameters.md).

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

## SDK examples

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

## Downstream APIs

| `modality` | Use list `id` in |
| --- | --- |
| `text` (default) | `POST /chat/completions` → `model` |
| `image` | `POST /chat/completions` → `model` (with `modalities` including `image`) |
| `video` | `POST /video/generations` → `model` |

Tunable parameters per model are documented on each capability's **advanced parameters** page; this endpoint does **not** return a full parameter schema.

---

## Related

- [List models · Advanced parameters](./models-parameters.md)
- [API overview](./overview.md)
- [Create chat completion](./chat-completions.md)
- [Create image generation](./images-generations.md)
- [Create video generation task](./videos-generations.md)
- [Errors & debugging](../reference/error-codes.md)
