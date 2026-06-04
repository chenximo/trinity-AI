# Cookbook

Trinity docs are organized in three tabs (aligned with [OpenRouter](https://openrouter.ai/docs)):

| Tab | Best for |
|------|----------|
| [Docs](../quickstart) | First API call, keys, multimodal, streaming, errors |
| [API](../api/overview) | Endpoints, field tables, curl examples |
| **Cookbook** (this track) | **Cursor, Claude Code, Codex CLI** — Base URL & Key setup |

Reference: [OpenRouter · Cookbook](https://openrouter.ai/docs/cookbook) · [Cursor integration](https://openrouter.ai/docs/cookbook/coding-agents/cursor-integration)

::: info
This track does **not** repeat full API parameter tables. See [API overview](../api/overview) and [Request parameters](../guides/request-parameters).
:::

---

## Coding tools

| Tool | Guide |
|------|-------|
| [Cursor](./coding-agents/cursor) | IDE · Override OpenAI Base URL + API Key |
| [Claude Code](./coding-agents/claude-code) | Terminal agent · Anthropic / compatible Base URL |
| [Codex CLI](./coding-agents/codex-cli) | `config.toml` · OpenAI-compatible gateway |

More tools (Claude Desktop, OpenCode, etc.) may be added later.

---

## Prerequisites

### 1. API key

1. Sign in to the [Trinity console](https://trinity.ai/account/console).
2. Create an API key and save it once (prefix is usually `xh-...`).
3. See [Manage API keys](../manage-api-keys.md).

### 2. Base URL

```bash
export TRINITY_API_KEY="xh-your-key"
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

`TRINITY_BASE_URL` **must include `/v1`**.

### 3. Model ID

Copy **model IDs** from the [model catalog](https://trinity.ai/models).

### 4. Smoke test

Send a short message in the tool; on failure see [Errors & debugging](../reference/error-codes.md).

---

## Related

- [Quickstart](../quickstart)
- [API overview](../api/overview)
