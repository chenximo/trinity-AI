/**
 * 价目校验共享：档位对齐、价格比对
 */

import { tierToKey, findTierByKey } from "./tier-key.mjs";
import { FIELD_MATCH_PCT, pctIsMaterial } from "./pricing-tolerance.mjs";

export function parseNum(v) {
  if (v == null || v === "" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeAttrLabel(s) {
  return String(s ?? "")
    .trim()
    .replace(/context length/gi, "context")
    .replace(/输入<(?!=)/g, "输入<=")
    .replace(/输入＞/g, "输入>")
    .replace(/\s+/g, " ");
}

/** @param {Array<{ tierLabel?: string, tierName?: string }>} tiers */
export function tierKeysFromTiers(tiers) {
  const total = tiers?.length ?? 0;
  return (tiers ?? []).map((t, i) =>
    tierToKey(t.tierLabel ?? t.tierName ?? "", i, total),
  );
}

/**
 * @param {object|null} a { input, output, cache }
 * @param {object|null} b
 * @param {{ fields?: string[] }} [opts]
 */
export function comparePriceTriple(a, b, opts = {}) {
  const fields = opts.fields ?? ["input", "output", "cache"];
  const deltas = {};
  let ok = true;
  for (const f of fields) {
    const av = parseNum(a?.[f]);
    const bv = parseNum(b?.[f]);
    if (av == null && bv == null) continue;
    if (av == null || bv == null) {
      deltas[f] = { status: "missing", a: av, b: bv };
      ok = false;
      continue;
    }
    const pct =
      bv === 0 ? (av === 0 ? 0 : null) : Math.round(((av - bv) / bv) * 1000) / 10;
    const match = Math.abs(av - bv) < 0.0001 || !pctIsMaterial(pct, FIELD_MATCH_PCT);
    deltas[f] = { status: match ? "ok" : "mismatch", a: av, b: bv, pct };
    if (!match) ok = false;
  }
  return { ok, deltas };
}

/**
 * 按 tierKey 对齐两档列表
 * @param {Array<{ tierLabel?: string, tierName?: string, input?: number|null, output?: number|null, cache?: number|null }>} left
 * @param {Array<{ tierLabel?: string, tierName?: string, input?: number|null, output?: number|null, cache?: number|null }>} right
 */
export function compareTierLists(left, right, opts = {}) {
  const issues = [];
  const leftKeys = tierKeysFromTiers(left);
  const rightKeys = tierKeysFromTiers(right);
  const allKeys = [...new Set([...leftKeys, ...rightKeys])];

  if (left.length !== right.length) {
    issues.push({
      kind: "tier_count",
      leftCount: left.length,
      rightCount: right.length,
      leftKeys,
      rightKeys,
    });
  }

  for (const key of allKeys) {
    if (key === "uniform") {
      if (left.length === 1 && right.length === 1) {
        const cmp = comparePriceTriple(left[0], right[0], opts);
        if (!cmp.ok) {
          issues.push({
            kind: "price_mismatch",
            tierKey: key,
            tierLabel: left[0].tierLabel ?? left[0].tierName,
            ...cmp,
          });
        }
      } else if (left.length !== right.length) {
        issues.push({
          kind: "tier_count",
          leftCount: left.length,
          rightCount: right.length,
          leftKeys,
          rightKeys,
        });
      }
      continue;
    }
    const lt = findTierByKey(left, key);
    const rt = findTierByKey(right, key);
    if (!lt || !rt) {
      issues.push({
        kind: "missing_tier",
        tierKey: key,
        left: Boolean(lt),
        right: Boolean(rt),
      });
      continue;
    }
    const cmp = comparePriceTriple(lt, rt, opts);
    if (!cmp.ok) {
      issues.push({
        kind: "price_mismatch",
        tierKey: key,
        tierLabel: lt.tierLabel ?? lt.tierName,
        ...cmp,
      });
    }
  }
  return issues;
}

/** AIGC 国际 USD 应等于 official USD（CNY 官方 ÷6.5 换 USD） */
export function officialTierToCompare(tier, currency = "USD") {
  const fx = currency === "CNY" ? 6.5 : 1;
  const scale = (v) => {
    const n = parseNum(v);
    return n != null ? n / fx : null;
  };
  return {
    tierLabel: tier.tierLabel ?? tier.tierName,
    input: scale(tier.input),
    output: scale(tier.output),
    cache: scale(tier.cache),
  };
}

export function aigcIntlTierToCompare(tier) {
  return {
    tierLabel: tier.tierName ?? tier.attribute,
    input: parseNum(tier.input),
    output: parseNum(tier.output),
    cache: parseNum(tier.cache),
  };
}
