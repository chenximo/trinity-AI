## Action: `models` [modality]

List model IDs available to the configured API key, filtered by **modality** (text / image / video).

### Modality mapping

| User says / action | `modality` query | Gateway call |
|--------------------|------------------|--------------|
| `models`, `models text`, 生文 | `text` (default) | `GET /models` or `GET /models?modality=text` |
| `models image`, 生图 | `image` | `GET /models?modality=image` |
| `models video`, 生视频 | `video` | `GET /models?modality=video` |
| `models all`, 全部模态 | `all` | `GET /models?modality=all` |

Omitting `modality` on the API is equivalent to **`text`** (chat models). For image or video, **always** pass the query param — do not infer from the default list.

Doc: [List models · modality](https://doc.trinitydesk.ai/api/models) · [Advanced parameters](https://doc.trinitydesk.ai/api/models-parameters)

```bash
# text (default)
$RUNTIME "$GATEWAY_SCRIPT" GET /models

# image
$RUNTIME "$GATEWAY_SCRIPT" GET '/models?modality=image'

# video
$RUNTIME "$GATEWAY_SCRIPT" GET '/models?modality=video'

# all modalities
$RUNTIME "$GATEWAY_SCRIPT" GET '/models?modality=all'
```

Use single quotes around the path when it contains `?`.

### Parse response

OpenAI-compatible JSON:

- Path: `data[]`
- Columns (P0): **Model ID** (`id`), **Owner** (`owned_by`, or `-`)
- Optional column if present: **modality** (`metadata.modality_type`)
- Sort by `id` alphabetically

`metadata` may include display prices (e.g. `min_user_unit_price_usd` for image). **Do not** rank or filter by price in P0 — a dedicated filter/pricing API is planned (P1). If the user asks for “cheapest” or advanced filters, explain that and list IDs only, or point to [model catalog](https://trinity.ai/models).

If `data` is empty, tell the user no models are visible for this key and modality.

If HTTP 401/403, suggest verifying `TRINITY_API_KEY` at [API keys](https://trinitydesk.ai/account/keys).

---

## Coming in P1+ (not available yet)

| Need | API | Phase |
|------|-----|-------|
| Price sort / filter / rich catalog | Model filter / pricing API (same source as model plaza) | P1 |
| `model <id>` detail | List filter + pricing API | P1 |

---

## Coming in P2+ (not available yet)

| Action | API | Phase |
|--------|-----|-------|
| `groups` | Management API | P2 |
| `balance` | Management API | P2 |

Do not call management endpoints in P0 — use gateway-only actions.
