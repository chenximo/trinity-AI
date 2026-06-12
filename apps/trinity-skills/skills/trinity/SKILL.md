---
name: trinity
description: Assistant for Trinity (https://trinitydesk.ai), OpenAI-compatible gateway and xh- API keys. Use for Trinity, models, API keys, gateway setup, or secure config — including Chinese queries (Trinity、查模型、密钥、网关). Reply in the user's language (中文 or English).
---

# SKILL: trinity

Trinity ([trinitydesk.ai](https://trinitydesk.ai)) aggregates model providers behind an OpenAI-compatible gateway (`/v1/*`) with `xh-` API keys.

## Security Guidelines

1. Do not expose any `xh-` key value in chat, files, code, logs, or command arguments.
2. All Trinity gateway calls must use `scripts/gateway.cjs` — not `curl`, `wget`, `fetch`, or other HTTP clients with the real key.
3. Do not read `.env` files or environment variables containing credentials into the conversation.
4. P2+ key operations (`copy-key`, `apply-key`) will use dedicated scripts; until then, tell users to create keys in the [console](https://trinitydesk.ai/account/keys).
5. When inspecting config files that may contain secrets, use `scan-config` (P2) with `inject-key.js --scan` — not raw file reads.
6. Placeholders for injected keys: `__TRINITY_KEY_{id}__` (P2).
7. Do not modify security scripts to disable masking or redirect output.

## How to Execute

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/docs/setup.md`. If the user has not configured credentials, run `${CLAUDE_SKILL_DIR}/scripts/init-env.cjs` once to create a project `.env` with `TRINITY_BASE_URL` pre-filled; tell the user to open `.env` and set `TRINITY_API_KEY=xh-...` only (do not read `.env` into chat).
2. Match the action from the table below.
3. Read the corresponding doc file for steps.
4. If no arguments or unrecognized action, show the help table below.
5. For Trinity product/API questions — read `${CLAUDE_SKILL_DIR}/docs/help.md`.

## Actions

| Action | Description | Details |
|--------|-------------|---------|
| `models` | List model IDs (default: text) | `docs/actions-query.md` |
| `models text` / `image` / `video` / `all` | List by modality (`?modality=`) | `docs/actions-query.md` |
| `help` | Skill FAQ and doc links | `docs/help.md` |

### Planned (not in P0)

| Action | Phase |
|--------|-------|
| `model <id>` | P1 |
| `keys`, `create-key`, `copy-key`, `apply-key`, `scan-config` | P2 |
| `balance`, `groups` | P2–P3 |

### `help` (or no arguments)

| Action | Usage | Description |
|--------|-------|-------------|
| `models` | `/trinity models` | List text (chat) model IDs |
| `models image` / `video` / `all` | e.g. `/trinity models image` | List image / video / all modalities |
| `help` | `/trinity help <question>` | FAQ or link to doc.trinitydesk.ai |
