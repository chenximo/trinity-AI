/**
 * 价目偏差 ≥50% 待核验标记（未登记例外须人工复核）
 */

import { annotationsForModel } from "../../config/pricing-annotations.mjs";

export const VERIFY_DEVIATION_PCT = 50;

const VERIFY_SCOPES = ["official-suppliers", "official-aigc-image", "compare-hub"];

/** @param {string} trinityId @param {string[]} [scopes] */
export function isPricingVerifyAnnotated(trinityId, scopes = VERIFY_SCOPES) {
  if (!trinityId || trinityId === "—") return false;
  return scopes.some((s) => annotationsForModel(trinityId, s).length > 0);
}

/**
 * @param {string} trinityId
 * @param {number|null|undefined} maxAbsPct
 * @param {string} text
 * @param {string[]} [scopes]
 */
export function withVerifyFlag(trinityId, maxAbsPct, text, scopes = VERIFY_SCOPES) {
  if (!text || text === "—") return text;
  if (maxAbsPct == null || maxAbsPct < VERIFY_DEVIATION_PCT) return text;
  if (isPricingVerifyAnnotated(trinityId, scopes)) return text;
  if (text.startsWith("🔍待核验")) return text;
  return `🔍待核验 ${text}`;
}

/**
 * @param {string} trinityId
 * @param {{ status?: string, maxAbsPct?: number|null, summaryText?: string }} evalResult
 * @param {string[]} [scopes]
 */
export function formatVsWithVerify(trinityId, evalResult, scopes = VERIFY_SCOPES) {
  const base = evalResult?.summaryText ?? "—";
  if (evalResult?.status !== "mismatch") return base;
  return withVerifyFlag(trinityId, evalResult.maxAbsPct, base, scopes);
}
