/**
 * 刊例策略指针（V1 / V2）
 *
 * 产品真源：pricing/docs/刊例策略-V1-V2-国际站优先.md
 * - V1：线上当前刊例（/v1/prices 快照）
 * - V2：有厂商官网国际站价 → 用国际站；否则国内 CNY ÷ FX（国内折算锚）
 * - 对比表：双轨算全；价审主看 V2 vs 线上
 * - 本轮写回闸：只上浮不降（§3.1）；不自动写生产 /v1/prices
 */

import { FX_LEGACY_065 } from "./fx.mjs";

/** @typedef {"v1" | "v2"} ListingPolicyId */

/** 当前派生/对比默认跟 V2 轨 */
export const LISTING_POLICY = /** @type {ListingPolicyId} */ (
  process.env.LISTING_POLICY === "v1" ? "v1" : "v2"
);

/** 双轨均须保留出表 */
export const LISTING_RETAIN = /** @type {const} */ (["v1", "v2"]);

/** V2 无国际站时的国内 CNY → USD 回退 */
export const FX_V1_CNY_PER_USD = FX_LEGACY_065;

/**
 * 本轮写回闸：V2 低于线上则维持线上（只上浮不降）
 * @see 刊例策略 §3.1
 */
export const WRITEBACK_FLOOR_AT_ONLINE = true;

/** 生文 · 本轮明确拟上浮（其余降价项不动） */
export const WRITEBACK_UPS_TEXT = /** @type {const} */ ([
  "hy-mt2-plus",
  "glm-5.2",
]);

export const LISTING_POLICY_NOTE =
  "V1=线上快照 · V2=国际站优先 · 对比保留双轨 · 本轮写回只上浮(hy-mt2-plus/glm-5.2)不降";
