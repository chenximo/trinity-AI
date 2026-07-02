/**
 * 同族模型档位规则（官方种子 / AIGC 录入校验）
 * minTiers：该 vendorModelId 在 official seed 中至少应有的档位数
 */

/** @typedef {{ id: string, label: string, minTiers: number, match: (vendorModelId: string, trinityId?: string) => boolean, aigcModelName?: string|null }} TierFamilyRule */

/** @type {TierFamilyRule[]} */
export const TIER_FAMILY_RULES = [
  {
    id: "openai-272k",
    label: "OpenAI GPT · 272K 长上下文",
    minTiers: 2,
    match: (id) => ["gpt-5.5", "chat-latest", "gpt-5.4"].includes(id),
    aigcModelName: null,
  },
  {
    id: "openai-272k-pro",
    label: "OpenAI GPT-5.4 Pro · 272K",
    minTiers: 2,
    match: (id) => id === "gpt-5.4-pro",
  },
  {
    id: "gemini-pro-200k",
    label: "Gemini Pro · 200K",
    minTiers: 2,
    match: (id) =>
      id === "gemini-2.5-pro" || id === "gemini-3.1-pro-preview",
  },
  {
    id: "gemini-flash-modality",
    label: "Gemini Flash · 文本/音频分档",
    minTiers: 2,
    match: (id) =>
      /gemini-.*flash/i.test(id) &&
      !id.includes("lite-preview") &&
      !id.includes("flash-lite"),
  },
  {
    id: "zhipu-glm-32k",
    label: "智谱 GLM-5 · 32K",
    minTiers: 2,
    match: (id, tid) =>
      /^glm-5(-|$)/.test(id) ||
      id === "glm-5v-turbo" ||
      (tid && /^glm-5/.test(tid)),
  },
  {
    id: "zhipu-glm-47",
    label: "智谱 GLM-4.7 · 输入/输出分档",
    minTiers: 3,
    match: (id, tid) => id === "glm-4.7" || tid === "glm-4-7-251222",
  },
  {
    id: "minimax-512k",
    label: "MiniMax M3 · 512K",
    minTiers: 2,
    match: (id) => id === "minimax-m3",
  },
  {
    id: "qwen-128-256-1m",
    label: "通义 Qwen · 128K/256K/1M",
    minTiers: 3,
    match: (id) =>
      ["qwen-flash", "qwen-plus", "qwen3.5-flash", "qwen3.5-plus"].includes(
        id,
      ),
  },
  {
    id: "qwen-256-1m",
    label: "通义 Qwen3.6+ · 256K/1M",
    minTiers: 2,
    match: (id) =>
      ["qwen3.6-flash", "qwen3.6-plus", "qwen3.7-plus"].includes(id),
  },
  {
    id: "hunyuan-hy3",
    label: "混元 Hy3 · 16K/32K+",
    minTiers: 3,
    match: (id, tid) => id === "hy3-preview" || tid === "hy3-preview",
  },
];

/**
 * @param {string} vendorModelId
 * @param {string} [trinityId]
 */
export function familyRulesForModel(vendorModelId, trinityId) {
  const id = vendorModelId?.toLowerCase() ?? "";
  const tid = trinityId?.toLowerCase() ?? "";
  return TIER_FAMILY_RULES.filter((r) => r.match(id, tid));
}
