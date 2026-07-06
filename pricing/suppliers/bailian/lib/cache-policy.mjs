/**
 * 百炼 Context Cache · cached_token 相对 input_token 的比例
 * @see https://help.aliyun.com/zh/model-studio/context-cache
 */

export const BAILIAN_CACHE_DOC_URL =
  "https://help.aliyun.com/zh/model-studio/context-cache";

/** 百炼自部署默认：cached = input × 20%（deepseek-v4-pro 除外） */
export const BAILIAN_DEFAULT_CACHE_RATIO = 0.2;

/** 不适用 input×比例，须查百炼控制台 explicit 价 */
export const BAILIAN_CACHE_CONSOLE_MODELS = new Set([
  "deepseek-v4-pro",
  "deepseek-v4-pro-us",
]);

/**
 * 按 Model ID 覆盖（小写）
 * @type {Map<string, number>}
 */
const RATIO_OVERRIDES = new Map([
  // DeepSeek · 快手万擎（vanchin/*）
  ["deepseek-v3.2-think", 0.1],
  ["deepseek-v3.1-terminus", 0.4],
  ["deepseek-v3.1", 0.4],
  ["deepseek-r1", 0.4],
  ["deepseek-r1-0528", 0.4],
  ["deepseek-v3", 0.4],
  // Kimi · 月之暗面
  ["kimi-k2.6", 0.169],
  ["kimi-k2.5", 0.175],
  // GLM · 百炼部署（glm-5.2 单独 25%，其余 glm-* 见 resolve）
  ["glm-5.2", 0.25],
  // MiniMax · 稀宇科技
  ["minimax-m3", 0.2],
  ["minimax-m2.7", 0.2],
  ["minimax-m2.5", 0.1],
  ["minimax-m2.1", 0.1],
]);

/** 文档未标「上下文缓存享有折扣」但仍按百炼规则计 cache 的模型前缀/精确 id */
const IMPLICIT_CACHE_MODEL_PATTERNS = [
  /^deepseek-v3\.2-think$/,
  /^deepseek-v3\.1/,
  /^deepseek-r1/,
  /^deepseek-v3$/,
  /^kimi-k2\.[56]$/,
  /^glm-/,
  /^minimax-m/,
];

/**
 * @param {string|null|undefined} modelId
 * @param {{ supportsCacheFromDoc?: boolean, section?: string, vendorPrefix?: string|null }} [opts]
 * @returns {{ mode: "implicit"|"console"|"none", ratio: number|null, ratioLabel: string|null }}
 */
export function resolveBailianCachePolicy(modelId, opts = {}) {
  const id = String(modelId ?? "")
    .trim()
    .toLowerCase();
  if (!id) return { mode: "none", ratio: null, ratioLabel: null };

  const vendor = String(opts.vendorPrefix ?? "")
    .trim()
    .toLowerCase();

  if (BAILIAN_CACHE_CONSOLE_MODELS.has(id) && vendor !== "vanchin") {
    return { mode: "console", ratio: null, ratioLabel: "console" };
  }

  // 万擎 · vanchin/deepseek-v4-pro
  if (vendor === "vanchin" && id === "deepseek-v4-pro") {
    return {
      mode: "implicit",
      ratio: 0.0833,
      ratioLabel: "8.33pct",
    };
  }

  // GLM · 智谱部署 ZHIPU/GLM-5*
  if (vendor === "zhipu" && /^glm-5(\.|$)/.test(id)) {
    return {
      mode: "implicit",
      ratio: 0.25,
      ratioLabel: "25pct",
    };
  }

  if (RATIO_OVERRIDES.has(id)) {
    const ratio = RATIO_OVERRIDES.get(id);
    return {
      mode: "implicit",
      ratio,
      ratioLabel: formatRatioLabel(ratio),
    };
  }

  // GLM · 百炼部署：其余 glm 系列 20%
  if (/^glm-/.test(id)) {
    return {
      mode: "implicit",
      ratio: BAILIAN_DEFAULT_CACHE_RATIO,
      ratioLabel: "20pct",
    };
  }

  const docFlag = opts.supportsCacheFromDoc === true;
  const patternHit = IMPLICIT_CACHE_MODEL_PATTERNS.some((re) => re.test(id));

  if (docFlag || patternHit) {
    return {
      mode: "implicit",
      ratio: BAILIAN_DEFAULT_CACHE_RATIO,
      ratioLabel: "20pct",
    };
  }

  return { mode: "none", ratio: null, ratioLabel: null };
}

/** @param {number|null|undefined} inputPrice @param {number|null|undefined} ratio */
export function calcBailianCachePrice(inputPrice, ratio) {
  if (inputPrice == null || inputPrice === "" || ratio == null) return null;
  const n = Number(inputPrice);
  if (!Number.isFinite(n)) return null;
  const v = n * ratio;
  return String(Number(v.toFixed(6))).replace(/\.?0+$/, "") || "0";
}

function formatRatioLabel(ratio) {
  if (ratio == null) return null;
  const pct = ratio * 100;
  return Number.isInteger(pct) ? `${pct}pct` : `${pct.toFixed(2).replace(/\.?0+$/, "")}pct`;
}

/** 汇总说明（写入 pricing-api.json cachePolicy） */
export function bailianCachePolicySummary() {
  return {
    defaultRatio: BAILIAN_DEFAULT_CACHE_RATIO,
    docUrl: BAILIAN_CACHE_DOC_URL,
    note:
      "百炼自部署默认 input×20%（deepseek-v4-pro 除外，见控制台）；万擎 DeepSeek / Kimi / GLM / MiniMax / 智谱 GLM 按模型覆盖比例。",
    consoleModels: [...BAILIAN_CACHE_CONSOLE_MODELS],
    ratioOverrides: Object.fromEntries(RATIO_OVERRIDES),
  };
}
