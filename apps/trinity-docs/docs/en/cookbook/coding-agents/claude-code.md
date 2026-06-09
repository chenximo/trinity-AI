# Claude Code

## What is Claude Code?

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) is Anthropic’s **terminal coding agent** (`claude` CLI). If your gateway supports **Anthropic-compatible** routing or the tool supports an **OpenAI-compatible Base URL**, you can point it at Trinity with an `xh-...` key and [catalog](https://trinity.ai/models) model IDs.

::: warning Protocol note
Claude Code is built for the **Anthropic Messages API**. Trinity’s primary public path is **`POST /v1/chat/completions` (OpenAI-compatible)**. Confirm your Claude Code version and Trinity gateway support **Anthropic Base URL forwarding** or OpenAI mode before integrating; otherwise prefer [Cursor](./cursor) or direct HTTP API calls.
:::

---

## Quick start

### Step 1: Get a Trinity API key

1. Create a key at [API keys](https://trinitydesk.ai/account/keys) (`xh-...`).
2. See [Manage API keys](../../manage-api-keys.md).

### Step 2: Connect Claude Code to Trinity

**Recommended (UI):** Use [CC Switch](./cc-switch) under the Claude group (API format **OpenAI Chat Completions**, local routing enabled). Below is **manual environment variable / config file** setup.

Use **environment variables** or **project settings** (names per official docs).

**Option A · Environment variables**

```bash
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"

# OpenAI-compatible tools:
export OPENAI_API_KEY="$TRINITY_API_KEY"
export OPENAI_BASE_URL="$TRINITY_BASE_URL"

# Anthropic-compatible tools (if your gateway supports it):
# export ANTHROPIC_API_KEY="$TRINITY_API_KEY"
# export ANTHROPIC_BASE_URL="https://api.trinitydesk.ai"  # per gateway docs
```

**Option B · Project config**

Create `.claude/settings.local.json` in the project root (path per official docs). **Do not commit secrets.**

### Step 3: Configure models

Claude Code may use role-specific env vars (examples—verify in official docs):

```bash
export ANTHROPIC_DEFAULT_SONNET_MODEL="doubao-seed-1-6-thinking-agent-preview"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="gpt-4o"
```

::: tip
Values must be Trinity **model IDs** from the [catalog](https://trinity.ai/models), not Anthropic.com SKUs unless listed on Trinity.
:::

### Step 4: Verify

Run `claude` in a project directory with a short prompt; expect no 401/404.

---

## How it works (conceptually)

1. **Direct to gateway**: The tool sends traffic to Trinity for auth and routing to the `model` upstream.
2. **Model field**: Environment or request uses Trinity model IDs.
3. **Billing**: Per Trinity console and workspace rules; parameters in [Advanced parameters · Text](../../api/chat-completions-parameters.md).

---

## Why Trinity + Claude Code?

- **Shared key policy** with Cursor and scripts where supported.
- **Catalog-driven model IDs** without multiple upstream accounts.
- **Aligned with API docs** for errors, streaming, and tools.

---

## Limitations

- Optimized for Anthropic-style flows; non-Anthropic IDs may break tools or thinking blocks.
- If only OpenAI-compatible paths are open, confirm Claude Code support or use [Cursor](./cursor).
- `thinking_*`, `tools`, etc. depend on model and gateway—see [Advanced parameters · Text](../../api/chat-completions-parameters.md).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Auth failure | Trinity `xh-...` key; check shell profile overrides |
| Model unavailable | [Model catalog](https://trinity.ai/models) |
| Protocol / 400 | Match Anthropic vs OpenAI mode and Base URL path |
| Still hits anthropic.com | Verify `ANTHROPIC_BASE_URL` is set |

---

## Resources

- [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code)
- [Cookbook overview](../)
- [Quickstart](../../quickstart) · [Errors & debugging](../../reference/error-codes.md)
