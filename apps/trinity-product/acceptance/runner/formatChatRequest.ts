/** 与 API 内测文档 § 生文示例字段顺序一致 */
const CHAT_COMPLETION_FIELD_ORDER = [
  "model",
  "messages",
  "stream",
  "stream_options",
  "temperature",
  "top_p",
  "max_tokens",
  "max_completion_tokens",
  "modalities",
  "thinking_enabled",
  "reasoning_effort",
] as const;

export function orderChatCompletionBody(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of CHAT_COMPLETION_FIELD_ORDER) {
    if (key in body) out[key] = body[key];
  }
  for (const key of Object.keys(body)) {
    if (!(key in out)) out[key] = body[key];
  }
  return out;
}

export function buildChatCompletionRequest(
  request: Record<string, unknown>,
  model: string | undefined,
  options?: { matrix?: boolean; forceModel?: boolean },
): Record<string, unknown> {
  const raw = { ...request } as Record<string, unknown>;
  if (options?.forceModel && model) {
    raw.model = model;
  } else {
    const useMatrixModel = options?.matrix !== false;
    if (useMatrixModel && model) {
      raw.model = model;
    } else if (!raw.model && model) {
      raw.model = model;
    }
  }
  return orderChatCompletionBody(raw);
}
