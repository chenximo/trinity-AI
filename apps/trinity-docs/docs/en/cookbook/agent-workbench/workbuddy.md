# WorkBuddy

Reference: [WorkBuddy · Model configuration](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)

## What is WorkBuddy?

[WorkBuddy](https://www.workbuddy.ai) is a **desktop AI Agent workbench** from the Tencent Cloud Code Assistant team. It focuses on natural-language tasks, local automation, multi-agent workflows, MCP, and Skills—not on being a code-first IDE.

| Product | Focus | Guide |
| --- | --- | --- |
| **CodeBuddy** | Coding IDE / CLI | [CodeBuddy](../coding-agents/codebuddy) |
| **WorkBuddy** | General agent workbench | This page |

Trinity docs cover only the **model layer**: OpenAI-compatible `POST /v1/chat/completions`. MCP, Skills, and local execution are documented by WorkBuddy itself.

---

## Quick start (custom model)

Use **`models.json`** with a **full** endpoint URL ending in `/chat/completions`.

### Step 1: Trinity API key

See [Manage API keys](../../manage-api-keys.md) (`xh-...`).

### Step 2: Edit `models.json`

| Scope | Path |
| --- | --- |
| User (macOS/Linux) | `~/.workbuddy/models.json` |
| Windows | `C:\Users\<username>\.workbuddy\models.json` |

```json
{
  "models": [
    {
      "id": "doubao-seed-1-6-thinking-agent-preview",
      "name": "Trinity · chat",
      "vendor": "OpenAI",
      "apiKey": "xh-your-key",
      "url": "https://api.trinitydesk.ai/v1/chat/completions",
      "maxInputTokens": 200000,
      "maxOutputTokens": 8192,
      "supportsToolCall": true,
      "supportsImages": true
    }
  ],
  "availableModels": ["doubao-seed-1-6-thinking-agent-preview"]
}
```

You can also add models via **Settings → Model** in the WorkBuddy UI.

### Step 3: Restart and verify

Fully quit and restart WorkBuddy, select the model ID, and run a short task.

---

## Scope vs Trinity API

| Trinity docs | WorkBuddy product docs |
| --- | --- |
| Model `id`, `apiKey`, `url` | Local files, sandbox, permissions |
| [Streaming](../../guides/streaming-sse.md), [parameters](../../api/chat-completions-parameters.md) | MCP, Skills |

Image/video generation uses the [API track](../../api/overview), not the default WorkBuddy chat path.

---

## Limitations

- OpenAI Chat Completions-compatible endpoints only.
- `vendor: "OpenAI"` means protocol type, not vendor brand.
- Security and local execution policies are governed by WorkBuddy and your organization.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Model missing in UI | Restart app; check `availableModels` |
| Failed requests | Full `.../chat/completions` URL |
| Wrong config dir | WorkBuddy uses `~/.workbuddy/`, not `~/.codebuddy/` |

---

## Resources

- [WorkBuddy docs](https://www.workbuddy.ai/docs/workbuddy/)
- [CodeBuddy (coding)](../coding-agents/codebuddy)
- [Cookbook overview](../) · [Quickstart](../../quickstart)
