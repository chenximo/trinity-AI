# CC Switch

Use [CC Switch](https://github.com/farion1231/cc-switch) to connect **Codex CLI** or **Claude Code** to the Trinity gateway. CC Switch manages provider profiles and writes CLI config files. Trinity integration requires **local routing**: CC Switch forwards to `https://api.trinitydesk.ai/v1` and performs protocol conversion when needed.

Reference: [CC Switch user manual](https://github.com/farion1231/cc-switch/tree/main/docs/user-manual/en) · [App routing](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/en/4-proxy/4.2-routing.md)

---

## Prerequisites

1. Install [CC Switch](https://github.com/farion1231/cc-switch/releases).
2. Create a key at [API keys](https://trinitydesk.ai/account/keys) (`xh-...`) → [Manage API keys](../../manage-api-keys.md).
3. Target CLI installed and working (Codex or Claude Code).

---

## Configuration map

| Setting | CC Switch location | Trinity value |
| --- | --- | --- |
| Routing master switch | **Settings → Routing → Local routing** | On (**Running**) |
| App routing | Same panel → **Enable routing** | Check **Codex** or **Claude** |
| Local service URL | Same panel (displayed, copyable) | Default `http://127.0.0.1:15721`; written into CLI by CC Switch; usually no manual edit |
| Request URL / endpoint | **Codex** or **Claude** → Edit provider | `https://api.trinitydesk.ai/v1` (no trailing `/`) |
| API Key | Edit provider | `xh-...` |
| Model | Edit provider / model mapping | [Model catalog](https://trinity.ai/models) **model ID** |
| Requires local routing map | Edit **Codex** provider | **On** |
| API format | Edit **Claude** provider (Advanced) | **OpenAI Chat Completions** |

::: info Local routing vs proxy
**Local routing** (e.g. `http://127.0.0.1:15721`) is CC Switch’s on-machine API forwarder: the CLI sends requests there, and CC Switch forwards to the Trinity endpoint in the provider profile (`https://api.trinitydesk.ai/v1`). **Proxy / global outbound proxy** on the Settings page is separate—it controls whether CC Switch itself uses Clash-style proxies to reach the internet. Trinity integration needs **local routing and providers only**, not outbound proxy.
:::

---

## Integration flow (Codex)

### Step 1: Enable local routing

1. Open **Settings → Routing → Local routing**.
2. Turn on the routing master switch; status **Running**.
3. Under **Enable routing**, check **Codex**.

### Step 2: Add and enable Trinity provider

1. On the main screen, select **Codex** → **Add provider → Custom**.
2. Fill the table below, save, and **Enable** the provider in the list.

| Field | Value |
| --- | --- |
| Provider name | Custom, e.g. `Trinity` |
| API Key | `xh-...` |
| Request URL / endpoint | `https://api.trinitydesk.ai/v1` (no trailing `/`) |
| Requires local routing map | **On** |
| Model / model mapping | **Model ID** from [catalog](https://trinity.ai/models) |

### Step 3: Verify

1. Fully quit and restart Codex.
2. In CC Switch: routing **Running**, **Codex** checked under routing, Trinity provider **Enabled**.
3. Run a short task in Codex; on Trinity, confirm `POST /v1/chat/completions` with the configured `model`.

Multi-model setup, `auth.json`, `cc-switch-model-catalog.json`, empty App dropdown, etc.: [CC Switch with Codex (connection & model picker)](./codex-cc-switch.md).

---

## Integration flow (Claude Code, optional)

Claude Code uses the Anthropic API natively. Via CC Switch, set the provider **API format** to **OpenAI Chat Completions** and use local routing for forwarding. Steps match Codex except you check **Claude** under routing and add the provider under the **Claude** group.

### Step 1: Enable local routing

1. Open **Settings → Routing → Local routing**.
2. Turn on the routing master switch; status **Running**.
3. Under **Enable routing**, check **Claude** (you may also check **Codex** if using both).

### Step 2: Add and enable Trinity provider

1. On the main screen, select **Claude** → **Add provider → Custom**.
2. Fill the table below, save, and **Enable** the provider.

| Field | Value |
| --- | --- |
| Provider name | e.g. `Trinity · Claude` |
| API Key | `xh-...` |
| Request URL / endpoint | `https://api.trinitydesk.ai/v1` (no trailing `/`) |
| API format (Advanced) | **OpenAI Chat Completions** (not Anthropic Native) |
| Model | **Model ID** from [catalog](https://trinity.ai/models) |

With routing on, CC Switch writes `ANTHROPIC_BASE_URL` and related fields to `~/.claude/settings.json` (per your saved config). Config JSON example for field reference:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "xh-...",
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:15721"
  },
  "model": "gpt-5.5"
}
```

`ANTHROPIC_BASE_URL` is usually set automatically to the local service URL when routing is enabled; treat the example as field reference only.

### Step 3: Verify

1. Fully quit and restart Claude Code.
2. In CC Switch: routing **Running**, **Claude** checked, Trinity provider **Enabled**.
3. Run a short task; on Trinity, confirm `POST /v1/chat/completions` with the configured `model`.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Routing on but no Trinity usage | **Codex** (or Claude) checked under routing; Trinity provider **Enabled**; restart CLI |
| Codex no response / protocol error | **Requires local routing map** on; routing **Running** |
| Claude Code 400 | API format **OpenAI Chat Completions**; **Claude** checked under routing |
| 404 / path error | Endpoint `https://api.trinitydesk.ai/v1`; do not use local URL or `/v1` only in provider profile |
| 401 / unknown model | Valid `xh-...` key; model ID matches [catalog](https://trinity.ai/models) |
| `claude: command not found` | Install [Claude Code CLI](https://code.claude.com/docs/en/setup) |

---

## Manual config

With CC Switch and routing enabled, config is written to `~/.codex/config.toml`, `~/.claude/settings.json`, etc. Do not `export` conflicting `OPENAI_BASE_URL` / `ANTHROPIC_BASE_URL` in the shell. Manual setup: [Codex CLI](./codex-cli.md), [Claude Code](./claude-code.md).

---

## Resources

- [CC Switch · routing service](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/en/4-proxy/4.1-service.md)
- [Codex CLI](./codex-cli) · [Claude Code](./claude-code) · [Quickstart](../../quickstart)
