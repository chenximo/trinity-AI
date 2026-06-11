# Codex CLI

## What is Codex CLI?

[Codex CLI](https://github.com/openai/codex) is OpenAI’s open-source **terminal coding agent**. Configure an **OpenAI-compatible** provider in `config.toml` to route requests through the **Trinity gateway** with an `xh-...` key and [catalog](https://trinity.ai/models) model IDs.

---

## Quick start

### Step 1: Get a Trinity API key

1. Create a key at [API keys](https://trinitydesk.ai/account/keys).
2. See [Manage API keys](../../manage-api-keys.md).

### Step 2: Connect Codex to Trinity

**Recommended (UI):** Use [CC Switch](./cc-switch) to add a Codex provider (**Requires local routing map** on, endpoint `https://api.trinitydesk.ai/v1`). Full guide for connection, multi-model, and switching: [CC Switch with Codex](./codex-cc-switch.md). Below is **manual `config.toml` / environment variable** setup.

Codex reads the key from the variable named in `env_key`:

```bash
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
```

### Step 3: Edit `config.toml`

Usually `~/.codex/config.toml` (confirm in official docs):

```toml
model_provider = "openai"
model = "gpt-5.5"

[model_providers.openai]
name = "trinity"
base_url = "https://api.trinitydesk.ai/v1"
env_key = "TRINITY_API_KEY"
```

| Setting | Description |
| --- | --- |
| `model` | Trinity **model ID** |
| `base_url` | `TRINITY_BASE_URL` with **`/v1`** |
| `env_key` | Env var for the key, e.g. `TRINITY_API_KEY` |

::: info
Some Codex builds use different provider section names; Trinity is **OpenAI-compatible REST**—pick the provider section your Codex version documents and set **`base_url` to Trinity**.
:::

Or environment-only:

```bash
export OPENAI_API_KEY="$TRINITY_API_KEY"
export OPENAI_BASE_URL="$TRINITY_BASE_URL"
```

### Step 4: Smoke test

Run Codex in a repo with a simple task; confirm `POST /chat/completions` hits your gateway.

---

## Why Trinity + Codex CLI?

### One gateway and key

Same Base URL and key as [Quickstart](../../quickstart) for local and CI use.

### Swap model IDs

Change `model` in `config.toml` to another catalog ID without reinstalling Codex.

### Parameters and streaming

See [Advanced parameters · Text](../../api/chat-completions-parameters.md) and [Streaming (SSE)](../../guides/streaming-sse.md).

---

## Limitations

- `config.toml` fields vary by Codex version—follow **your** official docs.
- Default Codex paths target OpenAI-compatible chat; Trinity image/video async APIs are out of scope.
- Codex-only options (`personality`, reasoning effort, etc.) depend on model and passthrough.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Still calls `api.openai.com` | Check `OPENAI_BASE_URL` / `config.toml` overrides |
| 401 | Trinity `xh-...` key |
| 404 model | Match [catalog](https://trinity.ai/models) |
| 429 | [Rate limits](../../guides/rate-limits.md) |
| Parameter errors | [Request parameters](../../guides/request-parameters.md) |

---

## Resources

- [Codex CLI repository](https://github.com/openai/codex)
- [Cursor](./cursor) · [Claude Code](./claude-code)
- [Quickstart](../../quickstart) · [Errors & debugging](../../reference/error-codes.md)
