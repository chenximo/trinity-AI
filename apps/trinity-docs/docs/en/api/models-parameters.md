# List models · Advanced parameters

Use this page for integration and field checks. For the endpoint summary and copyable examples, see [List models](./models.md).

---

## Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `modality` | string | No | Filter by modality; omitted means `text` |

### `modality` values

| Value | Behavior |
| --- | --- |
| Omitted / `text` | Text and multimodal text models |
| `image` | Image generation models |
| `video` | Video generation models |
| `all` | All published modalities |

Unrecognized `modality` values usually do not error but return an empty list `data: []`.

### Request example

```bash
curl -sS "${TRINITY_BASE_URL}/models?modality=all" \
  -H "Authorization: Bearer ${TRINITY_API_KEY}"
```

---

## Top-level response

| Field | Type | Description |
| --- | --- | --- |
| `object` | string | Always `"list"` |
| `data` | array | Model objects, platform-sorted; `[]` when none match |

---

## `data[]` model object

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Model code; use as `model` in downstream requests |
| `object` | string | Always `"model"` |
| `created` | integer | Unix timestamp (seconds) |
| `owned_by` | string | Provider identifier |
| `metadata` | object \| null | Display pricing and capability summary; see below |

::: info
Only **whitelisted** `metadata` fields are exposed. Display names, full parameter schemas, and reference-image limits: see the [model catalog](https://trinity.ai/models) or each capability's **advanced parameters** page.
:::

---

## `metadata` (by modality)

### Text / multimodal (`modality` omitted or `text`)

| Field | Type | Usually present | Description |
| --- | --- | --- | --- |
| `context_length` | integer | Yes | Context length (tokens) |
| `max_token` | integer | Optional | Max output tokens per request |
| `user_input_price_per_million_usd` | number | Yes | Display input price (USD per million tokens) |
| `user_output_price_per_million_usd` | number | Yes | Display output price (USD per million tokens) |

### Image (`modality=image`)

| Field | Type | Usually present | Description |
| --- | --- | --- | --- |
| `metered_charge_unit` | string | Yes | Always `image_count` (per-image billing) |
| `min_user_unit_price_usd` | number | Yes | Minimum display price per image (USD) |

### Video (`modality=video`)

| Field | Type | Usually present | Description |
| --- | --- | --- | --- |
| `metered_charge_unit` | string | Yes | Common: `video_second`, `video_token`, `video_task` |
| `min_user_unit_price_usd` | number | Yes | Minimum display unit price (USD; depends on `metered_charge_unit`) |

---

## Response examples

### Text (default / `modality=text`)

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
        "max_token": 8192,
        "user_input_price_per_million_usd": 0.15,
        "user_output_price_per_million_usd": 0.60
      }
    }
  ]
}
```

### Image (`modality=image`)

```json
{
  "object": "list",
  "data": [
    {
      "id": "hunyuan-image",
      "object": "model",
      "created": 1700000100,
      "owned_by": "trinity",
      "metadata": {
        "metered_charge_unit": "image_count",
        "min_user_unit_price_usd": 0.042
      }
    }
  ]
}
```

### Video (`modality=video`)

```json
{
  "object": "list",
  "data": [
    {
      "id": "kling-2.6",
      "object": "model",
      "created": 1700000200,
      "owned_by": "trinity",
      "metadata": {
        "metered_charge_unit": "video_second",
        "min_user_unit_price_usd": 0.08
      }
    }
  ]
}
```

### Empty list

When the key has no models for the modality, or `modality` does not match:

```json
{
  "object": "list",
  "data": []
}
```

---

## Downstream APIs

| Modality | Use list `id` in | Parameters |
| --- | --- | --- |
| Text | `POST /chat/completions` → `model` | [Chat completions · Advanced parameters](./chat-completions-parameters.md) |
| Image | `POST /chat/completions` → `model` + `modalities` / `image_config` | [Image generation · Advanced parameters](./image-generation-parameters.md) |
| Video | `POST /video/generations` → `model` | [Video generation · Advanced parameters](./video-generation-parameters.md) |

---

## Related

- [List models](./models.md)
- [API overview](./overview.md)
- [Request parameters](../guides/request-parameters.md)
