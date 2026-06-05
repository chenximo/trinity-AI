# Cursor

Reference: [OpenRouter · Cursor integration](https://openrouter.ai/docs/cookbook/coding-agents/cursor-integration)

## What is Cursor?

[Cursor](https://cursor.com) is an AI code editor built on VS Code with Agent mode, tab completions, inline edits, and a CLI. Using an **OpenAI-compatible Base URL**, you can point Cursor’s OpenAI provider slot at the **Trinity gateway** and call **model IDs** from the [model catalog](https://trinity.ai/models) with your `xh-...` key.

---

## Quick start

Cursor routes requests through **Override OpenAI Base URL** instead of `api.openai.com`.

### Step 1: Get a Trinity API key

1. Open [API keys](https://trinitydesk.ai/account/keys) in the Trinity console.
2. Create an API key (prefix **`xh-...`**).
3. See [Manage API keys](../../manage-api-keys.md).

### Step 2: Configure Cursor

1. Open **Cursor Settings** (`Cmd/Ctrl + ,`).
2. Go to **Models** and expand **API Keys**.
3. Enable **OpenAI API Key**, then:
   - Paste `TRINITY_API_KEY` (`xh-...`) into **OpenAI API Key**.
   - Enable **Override OpenAI Base URL** and set:

     ```text
     https://api.trinitydesk.ai/v1
     ```

     (Replace with your `TRINITY_BASE_URL`; **must include `/v1`**.)

### Step 3: Add models

In **Models**, click **+ Add model** and enter a **model ID** from the [catalog](https://trinity.ai/models), for example:

- `doubao-seed-1-6-thinking-agent-preview`
- `gpt-4o`

Use IDs visible to your account that support chat.

### Step 4: Select a model

Pick the model in Chat or Agent; requests go through Trinity.

---

## Why Trinity + Cursor?

### One catalog of model IDs

Use Trinity **model IDs** in Cursor’s OpenAI-compatible slot for chat capabilities your account exposes—without separate upstream keys per vendor (within your product scope).

### Same HTTP contract as the API docs

Same `TRINITY_BASE_URL` and key as [Quickstart](../../quickstart) and [Create chat completion](../../api/chat-completions.md).

### Keys and usage in the console

Manage keys and permissions in the Trinity console; team quotas follow console and commercial terms.

---

## Limitations

- **Tab completions** may still use Cursor’s built-in models and are **not** affected by BYOK / Base URL overrides ([Cursor docs](https://cursor.com/docs)).
- **Auto / Composer** modes may or may not use your key—see [Cursor · API keys help](https://cursor.com/help/models-and-usage/api-keys).
- Only models that work on Trinity’s **OpenAI-compatible** `POST /chat/completions` path apply here. Image/video APIs are separate—see [API overview](../../api/overview).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Invalid API key / 401 | Use a Trinity key (`xh-...`), not OpenAI or another vendor |
| Model not found / 404 | Model ID must match the [catalog](https://trinity.ai/models) exactly |
| Wrong base URL | Must be `https://.../v1`; do not use `api.openai.com` |
| No streaming / all at once | [Streaming (SSE)](../../guides/streaming-sse.md), proxy buffering |
| Timeouts | DNS, corporate proxy, TLS |

---

## Resources

- [Cursor documentation](https://cursor.com/docs)
- [Cursor · BYOK help](https://cursor.com/help/models-and-usage/api-keys)
- [Trinity model catalog](https://trinity.ai/models)
- [Quickstart](../../quickstart) · [Errors & debugging](../../reference/error-codes.md)
