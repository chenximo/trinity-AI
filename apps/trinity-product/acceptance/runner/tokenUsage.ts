export type TokenUsage = {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
};

export function extractTokenUsage(json: unknown): TokenUsage | null {
  if (!json || typeof json !== "object") return null;
  const usage = (json as { usage?: unknown }).usage;
  if (!usage || typeof usage !== "object") return null;

  const u = usage as Record<string, unknown>;
  const promptTokens = typeof u.prompt_tokens === "number" ? u.prompt_tokens : null;
  const completionTokens = typeof u.completion_tokens === "number" ? u.completion_tokens : null;
  const totalTokens = typeof u.total_tokens === "number" ? u.total_tokens : null;

  if (promptTokens == null && completionTokens == null && totalTokens == null) return null;

  return { promptTokens, completionTokens, totalTokens };
}

export function formatTokenUsage(usage: TokenUsage | null | undefined): string {
  if (!usage) return "—";

  const total =
    usage.totalTokens ??
    (usage.promptTokens != null && usage.completionTokens != null
      ? usage.promptTokens + usage.completionTokens
      : null);

  if (total != null && usage.promptTokens != null && usage.completionTokens != null) {
    return `${total} tokens（入 ${usage.promptTokens} / 出 ${usage.completionTokens}）`;
  }
  if (total != null) return `${total} tokens`;
  if (usage.promptTokens != null && usage.completionTokens != null) {
    return `${usage.promptTokens + usage.completionTokens} tokens（入 ${usage.promptTokens} / 出 ${usage.completionTokens}）`;
  }
  if (usage.promptTokens != null) return `入 ${usage.promptTokens} tokens`;
  if (usage.completionTokens != null) return `出 ${usage.completionTokens} tokens`;
  return "—";
}
