# Rate limits

Trinity enforces request rate, concurrency, and quota controls across account, API key, model, and gateway policy dimensions. Exact RPM, concurrency, daily quota, and balance rules are defined by the Trinity console, plan rules, and commercial agreement; this documentation does not commit fixed numeric limits.

## Limit types

| Type | Description |
| --- | --- |
| Request rate | Requests allowed within a time window; exceeding may return **429** |
| Concurrent requests | Simultaneous in-flight requests or streaming SSE connections |
| Usage quota | Tied to account balance, plan, model pricing, and settlement rules |
| Model access | Unavailable or unauthorized models return permission or model-related errors |

## Common responses

| Status | Meaning | Guidance |
| --- | --- | --- |
| `429` | Too many requests, or upstream provider rate limit | Retry with exponential backoff and a max retry cap |
| `402` | Insufficient balance or quota | Check balance, plan, or top-up status |
| `403` | Permission denied or model unavailable | Check API key permissions and model access |
| `5xx` | Temporary gateway or upstream issue | Retry a limited number of times and record request ID |

::: info Gateway limits vs upstream rate limits
A `429` may come from Trinity account / key limits, or from an upstream model provider. Record `X-Request-Id` for troubleshooting. If the response includes `Retry-After`, use it to delay retries.
:::

## Client guidance

1. Use exponential backoff for **429** and temporary **5xx**, with a maximum retry count.
2. Record `X-Request-Id` (when present) for support.
3. Set timeout and concurrency caps for streaming requests to avoid connection buildup.
4. Do not hard-code limit numbers in clients; follow console settings and server responses.

## Related

- [Errors & debugging](../reference/error-codes.md)
- [Manage API keys](../manage-api-keys.md)
