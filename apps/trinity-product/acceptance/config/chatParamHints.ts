/** 生文请求体字段说明（验收台悬停 / 参数表） */
export type ParamHint = {
  label: string;
  meaning: string;
};

export const CHAT_BODY_FIELD_ORDER = [
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
  "tools",
  "tool_choice",
] as const;

export const CHAT_PARAM_HINTS: Record<string, ParamHint> = {
  model: {
    label: "模型",
    meaning: "要调用的逻辑模型 ID，例如 gpt-5.5。决定走哪条上游线路与能力边界。",
  },
  messages: {
    label: "对话消息",
    meaning:
      "对话历史数组。每项含 role（system/user/assistant）与 content；模型根据上下文生成下一条回复。",
  },
  stream: {
    label: "流式输出",
    meaning:
      "false：等整段生成完再一次返回 JSON。true：用 SSE 边生成边推送（适合打字机效果）。",
  },
  stream_options: {
    label: "流式选项",
    meaning: "仅 stream=true 时有效；可控制是否在流末尾或每个 chunk 附带 token 用量统计。",
  },
  temperature: {
    label: "采样温度",
    meaning:
      "控制回答随机性。越低（如 0.2）越稳定、可重复；越高（如 0.9）越发散、有创意。常用 0～2，与 top_p 二选一调即可。",
  },
  top_p: {
    label: "核采样 top_p",
    meaning:
      "从累计概率达 p 的最小词集合里采样（nucleus sampling）。1 表示几乎不截断；0.9 略收紧。常与 temperature 配合，一般不必两个都极端。",
  },
  max_tokens: {
    label: "最大输出长度",
    meaning: "限制模型**回复**最多生成多少个 token。过小会截断，过大耗时与费用更高。",
  },
  max_completion_tokens: {
    label: "最大完成 token",
    meaning: "与 max_tokens 类似，部分模型用于包含「思考 + 回答」的总上限；二者通常互斥，只传一个。",
  },
  modalities: {
    label: "输出模态",
    meaning:
      '声明期望输出类型。纯生文一般用 ["text"] 或省略；生图场景才会出现 "image" 等。本验收台主要验证文本链路。',
  },
  thinking_enabled: {
    label: "深度思考",
    meaning:
      "true：先「想」再答，适合复杂推理题；false 或未传：常规即时回复。仅部分模型支持（如 gpt-5.5，视上架配置）。",
  },
  reasoning_effort: {
    label: "思考强度",
    meaning:
      "配合 thinking_enabled 使用：none/minimal/low/medium/high 等，越高通常推理更细、耗时更长；具体取值因模型而异。",
  },
  tools: {
    label: "工具列表",
    meaning: "声明模型可调用的 function 工具；模型可能返回 tool_calls 由业务方执行。",
  },
  tool_choice: {
    label: "工具策略",
    meaning: "auto：模型自行决定是否调用；none：禁止调用；required：必须调用工具。",
  },
};

export function formatParamHint(key: string, caseHint?: string): string {
  if (caseHint?.trim()) return caseHint.trim();
  const h = CHAT_PARAM_HINTS[key];
  if (!h) return "";
  return `${h.label} — ${h.meaning}`;
}

export function orderedBodyKeys(body: Record<string, unknown>): string[] {
  const keys = Object.keys(body);
  const ordered = CHAT_BODY_FIELD_ORDER.filter((k) => keys.includes(k));
  const rest = keys.filter((k) => !ordered.includes(k as (typeof CHAT_BODY_FIELD_ORDER)[number]));
  return [...ordered, ...rest];
}

export function formatParamValue(value: unknown): string {
  if (value === undefined) return "—";
  if (typeof value === "string") return value.length > 80 ? `${value.slice(0, 77)}…` : value;
  return JSON.stringify(value);
}

/** 列表行展示：请求体字段 + 仅出现在 hints 里的字段（如「故意省略」） */
export function highlightParamKeys(
  body: Record<string, unknown>,
  hints?: Record<string, string>,
): string[] {
  const fromBody = orderedBodyKeys(body).filter((k) => k !== "messages");
  const fromHints = hints ? Object.keys(hints).filter((k) => !fromBody.includes(k)) : [];
  return [...fromBody, ...fromHints];
}
