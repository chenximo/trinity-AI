# FAQ

Trinity AI is a unified HTTP API gateway for text, image, and video models. Accounts use **USD prepaid Credits**; successful calls are metered against your balance. This page answers the most common questions. For full billing rules see [Billing & Credits](./guides/billing-and-credits.md); for integration see [Quickstart](./quickstart.md) and linked guides.

---

## Getting started

### What is Trinity AI?

Trinity is an **AI API aggregation gateway** for developers: you call OpenAI-compatible HTTP endpoints and select a **model ID** from the [model catalog](https://trinity.ai/models) without integrating each upstream separately. The console provides **Chat** and **API key** management; both share the same Credits balance.

### How do I get started?

1. Sign up and open the [console](https://trinitydesk.ai/account/keys).
2. Create an API key (prefix `xh-...`) — see [Manage API keys](./manage-api-keys.md).
3. Follow [Quickstart](./quickstart.md) to set `TRINITY_BASE_URL` and `TRINITY_API_KEY`, then send your first `POST /v1/chat/completions`.
4. For paid usage, top up at [Credits](https://trinitydesk.ai/account/console#credits) first (**402** when balance is insufficient).

### What integration methods are supported?

**HTTP API only** (OpenAI-compatible REST). For Cursor, Codex CLI, WorkBuddy, etc., see [Cookbook](./cookbook/).

### How do Chat and the API relate?

**Same account, same Credits wallet, same price list.** Console Chat and API key calls use identical metering after successful completion. View usage in **Activity**.

### How do I get support?

Email **support@trinitydesk.ai** with:

- Registered account email
- Time of the issue (UTC or local)
- Response header **`X-Request-Id`** (if available)
- For billing retries: **`X-Idempotency-Key`** / **`X-Settlement-Key`**

Use the same address for billing and refund questions.

---

## Billing & Credits

### What are Credits?

**USD prepaid balance** for API and Chat usage. Display and settlement use **$**. Full rules: [Billing & Credits](./guides/billing-and-credits.md).

### How do I top up?

[Console · Credits](https://trinitydesk.ai/account/console#credits) → **Purchase Credits** → pay via **card / Stripe Link / WeChat Pay / Alipay** (Stripe-hosted checkout).

### What is the minimum top-up?

**$10** per transaction.

### Is there a top-up fee?

**No separate platform or processing fee line.** You pay **$N and receive $N Credits** (Sales Tax / VAT may apply in Stripe checkout).

### How are models priced?

Per **model ID**: text is usually **per 1K tokens**, images **per image / request**, video **per second / request**. See the [model catalog](https://trinity.ai/models) or console **Models** page; docs do not commit to fixed numbers.

### When am I charged?

After the request **completes successfully**, based on actual upstream usage (e.g. token counts). **Failed requests are generally not charged** (**402** blocks calls when balance is insufficient).

### What happens when balance runs out?

The gateway returns **HTTP 402**. Direct users to [Credits](https://trinitydesk.ai/account/console#credits). **402** (no credits) is not **429** (rate limit) — see [Errors & debugging](./reference/error-codes.md) and [Rate limits](./guides/rate-limits.md).

### How long until balance updates after payment?

Usually **within minutes**. If balance is unchanged after **1 hour**:

1. Check your **Stripe receipt email** to confirm charge.
2. If **not charged**, the card may have been declined — retry with another method.
3. If **charged** but Credits missing, email **support@trinitydesk.ai** with transaction ID and time.

### How do refunds work?

- **Window**: **24 hours** after the transaction
- **Eligible**: **Unused** portion of that top-up — **full amount paid**
- **How**: Email **support@trinitydesk.ai** (account email, transaction ID from Payment History, purchase time)
- **Notes**: No self-serve **Refund** button; no withdrawals; consumed Credits are not refundable

See [Billing & Credits · Refunds](./guides/billing-and-credits.md#refunds) and [Terms of Service](https://trinitydesk.ai/legal/terms).

### Do Credits expire?

**No expiration by default.** Policy changes require **at least 30 days’ notice** and do not apply retroactively to purchased balances.

### Enterprise / wire / Net terms?

Use **Contact Sales** in the console. **No** self-serve wire or enterprise top-up tab. See [Billing & Credits · Enterprise](./guides/billing-and-credits.md#enterprise).

### Receipts and invoices?

**Payment History** on the Credits page; **Stripe receipt** links and Customer Portal. Update billing address in Stripe before purchase; invoices depend on Stripe settings.

### Is there a free trial allowance?

Welcome Credits, if offered, follow **console and current announcements**. With zero balance, paid models may return **402** until you top up.

---

## Models

### Which models are available?

[Model catalog](https://trinity.ai/models) or [List models](./api/models.md). Only listed **model IDs** are callable.

### What goes in the `model` field?

A **model ID** string (e.g. `gpt-5.5`), **not** a display name. Must match your account’s available list — see [API overview · Model ID](./api/overview.md#model-id-model-field).

### 403 / 404 on a model?

- **404 / model_not_found**: wrong ID or not enabled for your account → check the [catalog](https://trinity.ai/models).
- **403**: key permissions or model access → check console settings.

### Image and video pricing?

Same wallet and charge timing as text; units are **per image / request** and **per second / request**. See [Multimodal overview](./multimodal/) and sub-guides.

---

## API technical

### Authentication?

```http
Authorization: Bearer xh-...
```

Create keys at [API keys](https://trinitydesk.ai/account/keys) (prefix **`xh-...`**).

### Base URL?

Default production:

```text
https://api.trinitydesk.ai/v1
```

Dedicated deployments may differ. Path must include **`/v1`**.

### OpenAI SDK?

Yes — point `base_url` at Trinity `/v1` and use your `xh-...` key. See [Quickstart](./quickstart.md) and [Cookbook](./cookbook/).

### Streaming?

**Text**: `stream: true` (SSE) — [Streaming (SSE)](./guides/streaming-sse.md). **Image generation**: **no** `stream: true`. **Video**: async tasks — [Video generation](./multimodal/video-generation.md).

### Retries and double billing?

Send **`X-Idempotency-Key`** (and settlement headers documented) on retries for the same business operation. See [API overview · Tracing and settlement](./api/overview.md#tracing-and-settlement-headers) and [Request parameters](./guides/request-parameters.md).

### 402 vs 429?

| Code | Meaning | Action |
| --- | --- | --- |
| **402** | Insufficient Credits | Top up |
| **429** | Rate limited | Backoff |

### Debugging errors?

1. Verify Base URL, `model` ID, key format.
2. Record **`X-Request-Id`**.
3. See [Errors & debugging](./reference/error-codes.md).

---

## Privacy & data

### Are prompts logged?

Storage and logging of inputs/outputs on Trinity’s side are governed by the [Privacy Policy](https://trinitydesk.ai/legal/privacy) and [Terms · User content](https://trinitydesk.ai/legal/terms). We **do not control** upstream providers (including training use). See console/docs for the provider mapped to each model.

### Who processes payments?

**Stripe** hosts payment forms; Trinity **does not store** full card numbers. Billing address is collected in Stripe checkout.

### Legal documents?

- [Privacy Policy](https://trinitydesk.ai/legal/privacy)
- [Terms of Service](https://trinitydesk.ai/legal/terms)

---

## Account

### Manage API keys?

[Manage API keys](./manage-api-keys.md). Full key value is shown **once** at creation.

### Usage and balance?

- **Balance / payments**: [Credits](https://trinitydesk.ai/account/console#credits)
- **Usage detail**: console **Activity**

### Low-balance alerts?

Configure a **threshold** in the console when available; alerts may appear in-product and by email.

### Delete account?

Email **support@trinitydesk.ai**. Treatment of unused Credits follows [Terms of Service](https://trinitydesk.ai/legal/terms).

---

## Troubleshooting

### 401 Unauthorized

Check `Authorization: Bearer xh-...`, key status — [Manage API keys](./manage-api-keys.md).

### 402 Payment Required

Check [Credits](https://trinitydesk.ai/account/console#credits) — [Insufficient balance](./guides/billing-and-credits.md#insufficient-balance-402).

### 429 Too Many Requests

Exponential backoff — [Rate limits](./guides/rate-limits.md).

### Charged but no Credits

See [How long until balance updates?](#how-long-until-balance-updates-after-payment)

### Docs vs live behavior

**Gateway responses are authoritative.** Report discrepancies to **support@trinitydesk.ai** with `X-Request-Id` and steps to reproduce.

---

## Further reading

| Topic | Doc |
| --- | --- |
| Integration | [Quickstart](./quickstart.md) · [Cookbook](./cookbook/) |
| Billing | [Billing & Credits](./guides/billing-and-credits.md) |
| Limits | [Rate limits](./guides/rate-limits.md) |
| Errors | [Errors & debugging](./reference/error-codes.md) |
| Streaming | [Streaming (SSE)](./guides/streaming-sse.md) |
| Keys | [Manage API keys](./manage-api-keys.md) |
