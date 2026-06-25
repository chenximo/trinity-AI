# Billing & Credits

Trinity uses **USD prepaid Credits**: you top up your account first; after each **successful** API or console Chat call, usage is deducted at the published price for the **model ID** you used. This page covers top-ups, metering, insufficient balance, receipts, and refunds. Legal terms are governed by our [Terms of Service](https://trinitydesk.ai/legal/terms).

::: tip Quick links
- Top up & balance: [Console · Credits](https://trinitydesk.ai/account/console#credits)
- Usage detail: console **Activity**
- Model pricing: [Model catalog](https://trinity.ai/models)
:::

---

## What are Credits?

| Item | Description |
| --- | --- |
| **Credits** | Your account **USD prepaid balance** for API and Chat usage |
| **Currency** | **USD ($)** for display and settlement |
| **Shared wallet** | Console **Chat** and **API keys** share **one balance** |
| **Top-up rule** | **Pay $N → receive $N Credits** — no separate Processing / Service fees line in the purchase UI |

Credits **do not expire** by default (no account maintenance fee). If we change validity or related rules in the future, we will give **at least 30 days’ notice** on the website or by email; changes **will not apply retroactively** to balances already purchased. See [Terms of Service](https://trinitydesk.ai/legal/terms).

---

## Pay-as-you-go metering

```text
Top up USD → Credits balance
       ↓
Each successful API / Chat call → deduct per model price
       ↓
View line items in console Activity
```

| Capability | Unit | Notes |
| --- | --- | --- |
| **Text** | Tokens (prompt + completion) | e.g. `POST /v1/chat/completions` |
| **Images** | Per image / request | See [Image generation](../multimodal/image-generation.md) |
| **Video** | Per second / request | See [Video generation](../multimodal/video-generation.md) |

**Rules**:

1. Charges are based on **actual upstream usage** (e.g. token counts), **not** pre-estimated at request time.
2. **Failed requests are generally not charged** (aligned with upstream success semantics; **402** is returned when balance is insufficient before metering).
3. Per-**model ID** prices are listed on the [model catalog](https://trinity.ai/models) or console **Models** page; prices may change when upstream costs change.

::: info Published prices
Prices shown to you are **all-in** (e.g. per 1K tokens, per image, per second). Trinity **does not expose** upstream cost or markup formulas in the product UI.
:::

---

## Top up Credits

### Steps

1. Sign in to the [Trinity console](https://trinitydesk.ai/account/console#credits).
2. Open **Credits** and click **Purchase Credits** (or **Add Credits**).
3. Enter an amount and complete payment.

### Payment methods (individual)

| Method | Notes |
| --- | --- |
| **Card** | Stripe-hosted checkout (Visa / Mastercard / Amex, etc.) |
| **Link** | Stripe Link one-click pay (if enabled on your account) |
| **WeChat Pay** | Via Stripe · scan QR |
| **Alipay** | Via Stripe · redirect to authorize |

::: warning Enterprise customers
**Large prepayments, wire transfers, invoicing / Net terms, and custom volume pricing** are **not** self-serve in the console. Use **Contact Sales** from the Credits or Activity footer.
:::

### Amount rules

| Rule | Value |
| --- | --- |
| **Minimum per top-up** | **$10** |
| **Credit received** | **Pay amount = Credits received** (no extra platform fee line) |
| **Tax / VAT** | Depends on billing address, jurisdiction, and Stripe Tax; shown in Stripe checkout when applicable |

Amounts below $10 cannot be submitted.

### Payment history & receipts

- **Payment History** on the Credits page lists date, amount, method, and status.
- Open **Stripe receipt** links or the Stripe Customer Portal for downloads.
- Update **billing address** in Stripe before purchase; **Invoices** may be available depending on Stripe settings.

---

## Usage & balance

| Location | Contents |
| --- | --- |
| **Credits** | **Available balance**, Payment History |
| **Activity** | Chat / API usage by time: model, tokens, charge |
| **Console · API keys** | Key-level usage summary (when available) |

Charges apply after the request **completes successfully**. Streaming (SSE) and async image/video jobs use **final usage**.

---

## Insufficient balance (402)

When balance is too low for an upcoming call, the gateway returns **HTTP 402**.

| Item | Guidance |
| --- | --- |
| **Meaning** | Insufficient balance or quota |
| **Client action** | Direct users to [Console · Credits](https://trinitydesk.ai/account/console#credits); do not confuse with **429** (rate limit) |
| **See also** | [Errors & debugging](../reference/error-codes.md) · [Rate limits](./rate-limits.md) |

::: info 402 vs 429
**402** = out of credits → top up.**429** = too fast / rate limited → backoff and retry.
:::

---

## Low-balance alerts

You may set a **low-balance threshold** in the console (e.g. $10). Alerts may appear in-product and by email when enabled.

---

## Refunds

| Item | Policy |
| --- | --- |
| **Window** | **Within 24 hours** of the transaction |
| **Eligible** | **Unused** portion of that top-up: **full amount paid** |
| **Not eligible** | After 24 hours; or Credits from that payment **already consumed** |
| **How to request** | **Email support** — no self-serve **Refund** button in MVP |
| **Timing** | After approval, Stripe refund to original payment method, typically **5–10 business days** |
| **Withdrawals** | **Not supported** — Credits cannot be cashed out to a bank account |

### Include in your email

1. **Registered email** matching your Trinity account  
2. **Transaction ID** from Payment History (or Stripe Payment Intent ID) and **purchase time**  
3. Reason (optional)

Send to: **starsea@trinitydesk.com**

Full legal text: [Terms of Service](https://trinitydesk.ai/legal/terms).

---

## Enterprise

For:

- Large prepayments, wire transfers  
- Net30 / PO-based billing  
- Volume discounts, private deployment  

Use **Contact Sales** in the console (company name, work email, estimated monthly spend, requirements). Our sales team follows up by email. There is **no** self-serve enterprise top-up tab.

---

## Compliance & privacy

- Checkout is **Stripe-hosted**; MVP does **not** require ID upload or SMS verification before sign-up or top-up.
- Billing address is collected in Stripe for receipts / invoices and compliance.
- See [Privacy Policy](https://trinitydesk.ai/legal/privacy) for personal data handling.

---

## FAQ

### How long until balance updates after payment?

Usually **within minutes** after Stripe confirms payment. If balance is unchanged after **1 hour**, email **starsea@trinitydesk.com** with your transaction ID.

### Are Chat and API prices the same?

**Yes.** The same **model ID** uses the **same price list** and **same wallet** for Chat and API.

### Can I pay in CNY?

Accounts and list prices are in **USD**. WeChat Pay / Alipay via Stripe may show local currency conversion at checkout; Credits are still booked in USD.

### Auto top-up?

Planned for **P0.5**; use manual **Purchase Credits** today. This page will be updated when it ships.

---

## Related

- [Quickstart](../quickstart.md)
- [Rate limits](./rate-limits.md)
- [Errors & debugging](../reference/error-codes.md)
- [FAQ](../faq.md)
- [Terms of Service](https://trinitydesk.ai/legal/terms)
- [Privacy Policy](https://trinitydesk.ai/legal/privacy)
