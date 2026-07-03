/**
 * 价目对比容差 — 避免舍入 / FX / 刊例缓存策略造成的假阳性
 */

export const FIELD_MATCH_PCT = 0.5;
export const CACHE_L1_MATCH_PCT = 1;
export const CACHE_ONLINE_TOLERANCE_PCT = 16;
export const FX_MATCH_PCT = 0.5;
export const DEFAULT_CNY_TO_USD_FX = 6.5;

function parseNumLocal(v) {
  if (v == null || v === "" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** @param {number|null|undefined} n @param {number} [dp] */
export function roundForCompare(n, dp = 3) {
  const v = parseNumLocal(n);
  if (v == null) return null;
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

/** @param {number|null|undefined} base @param {number|null|undefined} value @param {number} tolerancePct */
export function isWithinTolerance(base, value, tolerancePct = FIELD_MATCH_PCT) {
  if (base == null || value == null) return true;
  if (base === 0) return Math.abs(value) < 1e-9;
  return (Math.abs(value - base) / Math.abs(base)) * 100 < tolerancePct;
}

/**
 * Trinity 线上刊例缓存价相对厂商官方价的已知舍入带（÷6.5 策略等）
 * 入/出已一致时，缓单独偏差在此带内不记为待更新
 */
export function isCacheListingRounding(officialCacheUsd, onlineCacheUsd) {
  return isWithinTolerance(
    officialCacheUsd,
    onlineCacheUsd,
    CACHE_ONLINE_TOLERANCE_PCT,
  );
}

/** @param {number|null|undefined} pct */
export function pctIsMaterial(pct, tolerancePct = FIELD_MATCH_PCT) {
  if (pct == null) return false;
  return Math.abs(pct) >= tolerancePct;
}
