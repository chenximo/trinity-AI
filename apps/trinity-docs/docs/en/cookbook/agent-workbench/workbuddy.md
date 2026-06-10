# WorkBuddy

Reference: [WorkBuddy · Model configuration](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)

## What is WorkBuddy?

[WorkBuddy](https://www.workbuddy.ai) is a **desktop AI Agent workbench** from the Tencent Cloud Code Assistant team. It focuses on natural-language tasks, local automation, multi-agent workflows, MCP, and Skills—not on being a code-first IDE.

| Product | Focus | Guide |
| --- | --- | --- |
| **CodeBuddy** | Coding IDE / CLI, `models.json` for coding | [CodeBuddy](../coding-agents/codebuddy) |
| **WorkBuddy** | General agent workbench | This page |

Trinity docs cover only the **model layer**: OpenAI-compatible `POST /v1/chat/completions`. MCP, Skills, and local execution are documented by WorkBuddy itself.

---

## Quick start (Trinity custom model)

WorkBuddy calls Trinity via **OpenAI-compatible** `POST /v1/chat/completions`. Use the **UI** (recommended) or edit **`models.json`**; both require the same **endpoint URL, API key, and model ID**.

::: warning Use the full endpoint path
The **API URL** must be the full path ending in **`/chat/completions`**. `https://api.trinitydesk.ai/v1` alone **will fail**. Use **`https://api.trinitydesk.ai/v1/chat/completions`** (`{TRINITY_BASE_URL}/chat/completions`).
:::

### Step 1: Get a Trinity API key

1. Open [Trinity console · API keys](https://trinitydesk.ai/account/keys).
2. Create an API key (prefix **`xh-...`**).
3. See [Manage API keys](../../manage-api-keys.md).

Replace placeholders below with **`xh-your-key`**. Do **not** commit real keys to Git or screenshots.

### Step 2: Configure in the UI (recommended)

On the WorkBuddy **chat page**, open the **Model** dropdown at the bottom and follow the steps below (see also [WorkBuddy · Model](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)).

**1. Open custom model setup**

In the model list, scroll to the bottom and click **「+ Configure custom model」** (or equivalent **Add custom model** entry).

**2. Choose vendor「Custom」**

In the custom model dialog, set **Vendor / Provider** to **Custom** (not a built-in vendor preset).

**3. Add a model and fill the Trinity fields**

Click **「Add model」**, then complete the form per the table below:

| WorkBuddy field | Value | Source |
| --- | --- | --- |
| **API URL** / endpoint | `https://api.trinitydesk.ai/v1/chat/completions` | Trinity gateway **`{TRINITY_BASE_URL}/chat/completions`**; must include `/chat/completions`, not `/v1` only |
| **API Key** | `xh-your-key` | Key from Step 1; sent as `Authorization: Bearer xh-...` |
| **Model name** / Model ID | Exact Trinity **model ID** | [Model catalog](https://trinity.ai/models), e.g. `doubao-seed-1-6-thinking-agent-preview`; names like `gpt-5.5` must match the catalog **ID string** |

::: tip Model name = request `model` field
WorkBuddy sends this value as the JSON **`model`** field. A wrong ID causes “model not found” or routing errors.

If the form has **tool calling / image / reasoning** toggles, set them per the model’s capabilities in the [catalog](https://trinity.ai/models) (e.g. disable image support if the model does not support it).
:::

Save. The new model appears under **Custom models** and can be selected from the **Model** dropdown on the chat page.

### Step 3 (optional): Edit `models.json` for batch setup

For **multiple Trinity models** or team-wide config, edit the user-level file (**do not commit real keys**):

| Scope | Path |
| --- | --- |
| User (macOS / Linux) | `~/.workbuddy/models.json` |
| Windows | `C:\Users\<username>\.workbuddy\models.json` |

Saving in the UI writes matching entries locally. WorkBuddy currently uses a **root-level JSON array** (verified), for example:

```json
[
  {
    "id": "gpt-5.5",
    "name": "gpt-5.5",
    "vendor": "Custom",
    "url": "https://api.trinitydesk.ai/v1/chat/completions",
    "apiKey": "xh-your-key",
    "supportsToolCall": false,
    "supportsImages": true,
    "supportsReasoning": false,
    "useCustomProtocol": true
  }
]
```

| Field | Description |
| --- | --- |
| `id` | **Required.** Same as UI **Model name**; must be a Trinity [catalog](https://trinity.ai/models) model ID |
| `name` | Display name; may match `id` or use a friendlier label |
| `url` | **Required.** Same as UI **API URL**; must be `…/v1/chat/completions` |
| `apiKey` | **Required.** Same as UI **API Key** (`xh-...`) |
| `vendor` | `Custom` when vendor is **Custom** in the UI |
| `supportsToolCall` | Tool calling support; per model capability |
| `supportsImages` | Image input support; `true` for multimodal models |
| `supportsReasoning` | Reasoning / chain-of-thought; per model capability |
| `useCustomProtocol` | Custom vendor protocol; usually `true` for UI-added custom models |

To add more models, **append objects** to the array (valid JSON, comma-separated).

### Step 4: Restart and verify

1. **Fully quit and restart** WorkBuddy (closing the window may not be enough).
2. Select the configured **model name** (`id`) in the **Model** dropdown.
3. Send a short task (e.g. “Describe Trinity API in one sentence”) and confirm a normal reply.

If it fails, see [Troubleshooting](#troubleshooting) below.

---

## Scope vs Trinity API

| Trinity docs | WorkBuddy product docs |
| --- | --- |
| `model` / `apiKey` / `url` (OpenAI-compatible chat) | Local files, sandbox, permissions |
| [Streaming SSE](../../guides/streaming-sse.md), [chat parameters](../../api/chat-completions-parameters.md) | MCP |
| [Errors & debugging](../../reference/error-codes.md) | Skills (`SKILL.md`) |

Image and video generation use the Trinity API directly (see [API overview](../../api/overview)), not the default WorkBuddy chat path.

---

## Why Trinity + WorkBuddy?

- **One key and model IDs** shared with HTTP API and coding tools via the [catalog](https://trinity.ai/models).
- **OpenAI compatibility** matches WorkBuddy custom model requirements.
- **Multiple models** in `models.json` for different agent tasks.

---

## Limitations

- **OpenAI Chat Completions** endpoints only; with **Custom** vendor you still need Trinity’s full **`/chat/completions`** URL.
- Tool calling and image input depend on `supportsToolCall` / `supportsImages` and upstream model capability.
- Desktop agent compliance, network, and local execution policies are governed by WorkBuddy and your organization.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| New model missing in list | Restart WorkBuddy; ensure `models.json` is a valid array with the `id` |
| Request failed / 404 | **API URL** includes `/chat/completions`; **model name** matches [catalog](https://trinity.ai/models) ID |
| 401 | Valid `xh-...` **API Key** |
| Confused with CodeBuddy | CodeBuddy uses `~/.codebuddy/`; WorkBuddy uses `~/.workbuddy/` |

---

## Resources

- [WorkBuddy docs](https://www.workbuddy.ai/docs/workbuddy/)
- [CodeBuddy (coding)](../coding-agents/codebuddy)
- [Cookbook overview](../) · [Quickstart](../../quickstart)
