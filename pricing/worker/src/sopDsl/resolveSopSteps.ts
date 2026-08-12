import type { ReviewModality } from "../types.js";
import { supplierCliForChannel } from "../onboard/supplierChannelMap.js";

/**
 * 最小 DSL：scenario -> steps 清单（用于驱动 Worker 执行 CLI）。
 * 目的：先把「SOP 剧本的结构化步骤」落进可执行层，而不是仅写到文档。
 *
 * 生文主链（① 官方锚跟刊例 / ④ 上新）：
 *   V1 = 线上刊例（pricing:fetch）
 *   V2 = listing 国际站优先建议（pricing:listing:v1v2 → gen-listing-v2）
 *   对比 = V2 vs V1（pricing:diff:listing-v2）
 *
 * 0.65_* 草案路径保留为归档脚本，不再进默认 SOP。
 */

/** 生文确认单主链：线上 → listing V2 草案 → diff → emit */
const TEXT_LISTING_V2_CHAIN = [
  "pricing:fetch",
  "pricing:listing:v1v2",
  "pricing:gen-listing-v2",
  "pricing:diff:listing-v2",
  "pricing:emit-review-package",
] as const;

const OFFICIAL_FOLLOW_LISTING_STEPS: Record<ReviewModality, string[]> = {
  text: [...TEXT_LISTING_V2_CHAIN],
  image: [],
  video: [],
};

/**
 * ④ 上新跟价（B1/B2）
 *
 * B1：默认“出确认单→可写价”主链（复用①的 CLI + 组装）
 * B2：在 B1 主链前，先刷新官方供给（至少保证新 SKU 有官方真源/映射可对照）
 *
 * 说明：当前 Admin 未单独传 B1/B2 字段；Worker 通过 scenarioRaw / note 解析子类型后选择 steps。
 */
const ONBOARD_MODEL_B1_STEPS: Record<ReviewModality, string[]> = {
  text: [...TEXT_LISTING_V2_CHAIN],
  image: [],
  video: [],
};

const ONBOARD_MODEL_B2_STEPS: Record<ReviewModality, string[]> = {
  text: ["pricing:supplier:official:text", ...TEXT_LISTING_V2_CHAIN],
  image: [
    "pricing:supplier:official:image",
    "pricing:fetch",
    "pricing:upstream",
    "pricing:gen-65",
    "pricing:diff:065",
    "pricing:emit-review-package",
  ],
  video: [
    "pricing:supplier:official:video",
    "pricing:fetch",
    "pricing:upstream",
    "pricing:gen-65",
    "pricing:diff:065",
    "pricing:emit-review-package",
  ],
};

function onboardModelB2SupplierStep(
  channelId: string,
  modality: ReviewModality,
): string | null {
  // B2 “接渠道”：先跑对应 supplier CLI；image/video 部分渠道仅 text 有脚本
  if (modality !== "text" && channelId !== "aigc" && !channelId.startsWith("volcengine")) {
    return supplierCliForChannel(channelId);
  }
  return supplierCliForChannel(channelId);
}

/** ④ 自动 detect 后的步骤：先刷新 upstream-access，再按 B1/B2 分叉 */
export const ONBOARD_DETECT_STEP = "pricing:upstream:access";

function normalizeScenario(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const s = raw.trim();
  // P0：只接受新 scenario；legacy 别名可以在正式联调后再清理/回滚。
  if (s === "官方锚跟刊例") return "follow-official-listing";

  // Worker 侧传入的内部子类型（推荐格式）
  if (s === "上新跟价:B1" || s === "onboard-model-b1") return "onboard-model-b1";
  if (s === "上新跟价:B2" || s === "onboard-model-b2") return "onboard-model-b2";
  const m = s.match(/^上新跟价:B2:([\w-]+)$/);
  if (m?.[1]) return `onboard-model-b2:${m[1]}`;

  // 兜底：Admin 只传 `上新跟价`（auto detect 在 Worker 内部分叉后再传入 B1/B2）
  if (s === "上新跟价") return "onboard-model-auto";
  return undefined; // 自定义/其它：让调用方 fallback 到 DEFAULT_STEPS
}

export function resolveSopSteps(
  scenarioRaw: string | undefined,
  modality: ReviewModality,
): string[] | null {
  const key = normalizeScenario(scenarioRaw);
  if (key === "follow-official-listing") {
    return OFFICIAL_FOLLOW_LISTING_STEPS[modality];
  }
  if (key === "onboard-model-auto") {
    return [ONBOARD_DETECT_STEP, ...ONBOARD_MODEL_B1_STEPS[modality]];
  }
  if (key === "onboard-model-b1") {
    return ONBOARD_MODEL_B1_STEPS[modality];
  }
  if (key === "onboard-model-b2") {
    return ONBOARD_MODEL_B2_STEPS[modality];
  }
  if (typeof key === "string" && key.startsWith("onboard-model-b2:")) {
    const channelId = key.split(":")[2];
    const supplierStep = onboardModelB2SupplierStep(channelId, modality);
    const prefix = supplierStep ? [supplierStep] : [];
    return [...prefix, ...TEXT_LISTING_V2_CHAIN];
  }
  return null;
}
