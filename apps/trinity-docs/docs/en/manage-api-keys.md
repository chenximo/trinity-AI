# Manage API keys

Create, rotate, and revoke API keys in the Trinity console for HTTP API access.

## Create a key

1. Open [Trinity console · API keys](https://trinitydesk.ai/account/keys).
2. Click **Create key**.
3. Copy and store the full key securely (**shown only once**; prefix is usually `xh-...`).

::: tip Security
Do not put keys in frontend code, public repositories, or client logs. Use environment variables or a secrets manager in production.
:::

## Rotate and revoke

| Action | Description |
| --- | --- |
| Rotate | Create a new key, switch applications, monitor traffic, then revoke the old key |
| Revoke | Takes effect immediately; requests with the old key return `401` |

::: tip Key compromise
If a key is exposed, **revoke** it first, then review recent usage in the console.
:::

## Related

- [Quickstart](./quickstart.md)
- [API overview](./api/overview.md)
- [FAQ](./faq.md)
