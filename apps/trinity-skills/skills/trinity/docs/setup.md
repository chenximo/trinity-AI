# Setup

## Configuration

Priority (higher overrides lower):

1. **Environment variables** (recommended)
2. **Skill directory `.env`** (next to `SKILL.md`)
3. **Project root `.env`**

Required for P0:

```bash
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
export TRINITY_API_KEY="xh-..."
```

`TRINITY_BASE_URL` defaults to `https://api.trinitydesk.ai/v1` if unset. Do not add a trailing slash.

Create API keys in the [Trinity console](https://trinitydesk.ai/account/keys).

**`npx skills add` does not create `.env` automatically.** On first use, run once:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/init-env.cjs"
```

This creates a project-root `.env` with `TRINITY_BASE_URL` pre-filled; the user only adds `TRINITY_API_KEY=xh-...`. Existing `.env` is never overwritten. Template: `env.template` next to `SKILL.md`.

Without `TRINITY_API_KEY`, scripts print `[CONFIG_MISSING]` — run `init-env.cjs`, then ask the user to fill the key (do not read `.env` into chat).

Prefer `.env` in project root (gitignored). Do not commit secrets.

Same scripts on macOS, Windows, and Linux — install Node 18+ (or Bun), then `node scripts/gateway.cjs GET /models`. No platform-specific skill package.

## Mental model (P0)

| Script | Role |
|--------|------|
| `scripts/init-env.cjs` | Create project `.env` from template (BASE_URL filled, KEY empty) |
| `scripts/gateway.cjs` | Call Trinity gateway `/v1/*` with your `xh-` API key |
| `scripts/sanitize.js` | Redact `xh-`, `sk-`, `Bearer`, and sensitive config fields |

P2 will add `api.js`, `copy-key.js`, `inject-key.js` for management API and secure key injection.

## Authentication

Gateway requests use:

```text
Authorization: Bearer <TRINITY_API_KEY>
```

Base URL example: `https://api.trinitydesk.ai/v1` → list models at `GET /models`.

## Runtime detection

Detect once per session:

```bash
GATEWAY_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/gateway.cjs"

if command -v bun &>/dev/null; then RUNTIME="bun"; \
elif command -v node &>/dev/null; then RUNTIME="node"; \
elif command -v deno &>/dev/null; then RUNTIME="deno run --allow-net --allow-read --allow-env"; \
else echo "ERROR: No JS runtime found (need bun, node, or deno)" >&2; exit 1; fi
```

Gateway call:

```bash
$RUNTIME "$GATEWAY_SCRIPT" <METHOD> <PATH> [JSON_BODY]
```

## Error handling

- HTTP 401/403: suggest checking `TRINITY_API_KEY` and key permissions
- `[CONFIG_MISSING]`: stop retrying; ask user to export `TRINITY_API_KEY`
- Do not use `curl` with the real key in chat — always use `gateway.cjs`
