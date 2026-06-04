# CodeBuddy

Reference: [CodeBuddy · models.json](https://www.codebuddy.ai/docs/ide/Features/models) (Tencent Cloud Code Assistant)

## What is CodeBuddy?

[CodeBuddy](https://www.codebuddy.ai) is an AI **coding** IDE / CLI. Configure **OpenAI-compatible** endpoints in **`models.json`** to use the **Trinity gateway** with an `xh-...` key and [catalog](https://trinity.ai/models) model IDs.

For the general-purpose desktop agent [WorkBuddy](../agent-workbench/workbuddy), see the separate guide.

::: warning Use the full endpoint path
Custom model **`url` values must be the full API path** (usually ending with **`/chat/completions`**). A base URL alone such as `https://api.example.com/v1` **will fail**. For Trinity use `{TRINITY_BASE_URL}/chat/completions` (e.g. `https://api.trinitydesk.ai/v1/chat/completions`).
:::

---

## Quick start

### Step 1: Get a Trinity API key

1. Sign in to the [Trinity console](https://trinity.ai/account/console).
2. Create an API key (prefix **`xh-...`**).
3. See [Manage API keys](../../manage-api-keys.md).

### Step 2: Create `models.json`

| Scope | Path |
| --- | --- |
| User | `~/.codebuddy/models.json` |
| Project | `.codebuddy/models.json` (repo root) |

Project config overrides user config. **Do not commit real keys to Git.**

```json
{
  "models": [
    {
      "id": "doubao-seed-1-6-thinking-agent-preview",
      "name": "Trinity · chat example",
      "vendor": "OpenAI",
      "apiKey": "xh-your-key",
      "url": "https://api.trinitydesk.ai/v1/chat/completions",
      "maxInputTokens": 200000,
      "maxOutputTokens": 8192,
      "supportsToolCall": true,
      "supportsImages": true,
      "supportsReasoning": false
    }
  ],
  "availableModels": ["doubao-seed-1-6-thinking-agent-preview"]
}
```

| Field | Description |
| --- | --- |
| `id` | **Required.** Trinity **model ID** |
| `apiKey` | Actual Trinity key value (not an env var name) |
| `url` | **`{TRINITY_BASE_URL}/chat/completions`** |
| `supportsToolCall` / `supportsImages` | Match model capabilities |
| `availableModels` | Optional UI allowlist |

### Step 3: Select the model in the IDE

Reload CodeBuddy per official docs, pick the model ID, and run a short chat smoke test.

### Step 4 (optional): CLI environment variables

```bash
export TRINITY_API_KEY="xh-..."
export CODEBUDDY_API_KEY="$TRINITY_API_KEY"
export CODEBUDDY_BASE_URL="https://api.trinitydesk.ai/v1"
codebuddy --model doubao-seed-1-6-thinking-agent-preview
```

For IDE users, prefer **`models.json` with the full `url` path**.

---

## Why Trinity + CodeBuddy?

### OpenAI-compatible chat

Trinity text uses `POST /v1/chat/completions`—matches CodeBuddy’s required format ([Create chat completion](../../api/chat-completions.md)).

### Catalog-driven IDs

Add multiple Trinity model IDs in `models.json` without reinstalling CodeBuddy.

### Multi-turn and vision

CodeBuddy may send `messages[].content` as strings or Part arrays; see [Image input](../../multimodal/image-input.md).

---

## Limitations

- Custom models must be **OpenAI-compatible** only.
- **`url` must include `/chat/completions`**.
- Image/video generation APIs are outside CodeBuddy’s default chat path—use [API overview](../../api/overview).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No request / 404 | `url` ends with `/chat/completions` |
| 401 | Trinity `xh-...` key in `apiKey` |
| Model not found | `id` matches [catalog](https://trinity.ai/models) |
| Vision fails | `supportsImages: true` + capable model |

---

## Resources

- [CodeBuddy · models.json (IDE)](https://www.codebuddy.ai/docs/ide/Features/models)
- [CodeBuddy · env vars (CLI)](https://www.codebuddy.ai/docs/cli/env-vars)
- [Cursor](./cursor) · [Codex CLI](./codex-cli)
- [Quickstart](../../quickstart) · [Errors & debugging](../../reference/error-codes.md)
