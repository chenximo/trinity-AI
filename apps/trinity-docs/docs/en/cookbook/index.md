# Cookbook

Trinity docs use three tabs (aligned with [OpenRouter](https://openrouter.ai/docs)):

| Tab | Best for |
|------|----------|
| [Docs](../quickstart) | First API call, keys, multimodal, streaming, errors |
| [API](../api/overview) | Endpoints, field tables, curl |
| **Cookbook** (this track) | Configure Trinity Base URL, key, and model IDs in **clients and agent apps** |

::: info
This track does not repeat full API parameter tables. See [API overview](../api/overview) and [Request parameters](../guides/request-parameters).
:::

---

## How categories are split

| Category | Typical use | Examples |
| --- | --- | --- |
| **IDE & CLI** | Coding in repos, terminal agents | Cursor, CodeBuddy IDE/CLI, Claude Code, Codex CLI |
| **Agent workbench** | Desktop agents, automation, MCP/Skills | WorkBuddy |

Both often use OpenAI-compatible `chat/completions`; we separate docs by **usage scenario**, not by vendor brand.

---

## IDE & CLI

| Tool | Guide |
|------|-------|
| [Cursor](./coding-agents/cursor) | Override OpenAI Base URL + API Key |
| [CodeBuddy](./coding-agents/codebuddy) | Coding IDE/CLI · `models.json` |
| [Claude Code](./coding-agents/claude-code) | Terminal agent |
| [Codex CLI](./coding-agents/codex-cli) | `config.toml` |

Reference: [OpenRouter · Cursor integration](https://openrouter.ai/docs/cookbook/coding-agents/cursor-integration).

---

## Agent workbench

| Tool | Guide |
|------|-------|
| [WorkBuddy](./agent-workbench/workbuddy) | Desktop agent · `~/.workbuddy/models.json` |

MCP, Skills, and local execution are covered in [WorkBuddy official docs](https://www.workbuddy.ai/docs/workbuddy/). Trinity docs only cover **model API wiring**.

---

## Prerequisites

### 1. API key

[Manage API keys](../manage-api-keys.md) (`xh-...`).

### 2. Base URL vs full path

```bash
export TRINITY_API_KEY="xh-your-key"
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
```

- **Cursor / Claude Code / Codex**: usually `TRINITY_BASE_URL` only.
- **CodeBuddy / WorkBuddy**: `models.json` `url` must be **`{TRINITY_BASE_URL}/chat/completions`**.

### 3. Model ID

From the [model catalog](https://trinity.ai/models).

### 4. Smoke test

[Errors & debugging](../reference/error-codes.md) on failure.

---

## Related

- [Quickstart](../quickstart)
- [API overview](../api/overview)
