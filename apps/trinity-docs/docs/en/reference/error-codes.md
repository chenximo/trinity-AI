# Error codes

The Trinity gateway returns **OpenAI-style JSON error bodies** such as `error.message`, `error.type`, and `error.code`. Errors generally come from either an **upstream provider** or the **Trinity gateway**.

## Upstream errors (may pass through)

| HTTP | Typical case | Client guidance |
|------|--------------|-----------------|
| 429 | Upstream provider rate limit | Exponential backoff retry |
| 502 / 503 / 504 | Upstream unavailable or timeout | Limited retries |
| 401 / 403 | Upstream key or permission issue (if returned) | Check model access and contact support |

::: info
For 429 / 5xx, Trinity preserves parseable error bodies where possible so SDKs and existing retry logic can keep working. Exact fields may vary by upstream provider.
:::

## Gateway errors

| HTTP | Typical case | Client guidance |
| --- | --- | --- |
| 400 | Invalid request body, such as malformed `model` or wrong field type | Check JSON and parameter tables |
| 401 | Missing or invalid `Authorization` | Check API key and `Bearer` header |
| 402 | Insufficient balance or quota | Check account balance, plan, or top-up status |
| 403 | Permission denied, model not enabled, or key restricted | Check key permissions and model access |
| 404 | Model not found, task not found, or wrong path | Check model ID, `taskId`, and URL path |
| 408 | Image generation sync wait timeout (`generation_timeout`) | Query `GET /image/tasks/{taskId}` with `trinity_task.task_id` from the response |
| 429 | Requests too fast, or account / key limit triggered | Back off per [Rate limits](../guides/rate-limits.md) |
| 5xx | Temporary gateway or upstream issue | Retry a limited number of times and record request ID |

### Common image-generation `error.code` (selected)

| HTTP | `error.code` | Meaning | Client guidance |
| --- | --- | --- | --- |
| 400 | `invalid_request` | Missing/invalid parameters or unsupported fields | See [Advanced parameters · Image generation](../api/image-generation-parameters.md) |
| 400 | `content_policy_violation` | Content moderation blocked the request | Adjust prompt or reference images |
| 404 | `model_not_found` | Model disabled or unknown | Verify model ID in the [model catalog](https://trinity.ai/models) |
| 408 | `generation_timeout` | Synchronous poll timeout | Query `/image/tasks/{taskId}` with `trinity_task.task_id` |
| 502 | `upstream_task_failed` | Upstream task failed at terminal state | Check parameters and assets; failure is usually not billed |

::: warning
Do not expose upstream stack traces or internal hosts to end users; record response header `X-Request-Id` for troubleshooting.
:::

## Troubleshooting checklist

1. Confirm `TRINITY_BASE_URL` includes the `/v1` prefix and matches [Quickstart](../quickstart.md).
2. Confirm `model` is a platform model ID (see [API overview · Model ID](../api/overview.md#model-id-model-field)).
3. Record response headers `X-Request-Id` and `X-Settlement-Key` (see [API overview · Tracing and settlement](../api/overview.md#tracing-and-settlement-headers)) and contact support.

## Related

- [Quickstart](../quickstart.md)
- [Chat completions API](../api/chat-completions.md)
- [Rate limits](../guides/rate-limits.md)
