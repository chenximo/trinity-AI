/**
 * 价目校验共享：档位对齐、价格比对
 */

import { tierToKey, findTierByKey } from "./tier-key.mjs";
import {
  FIELD_MATCH_PCT,
  CACHE_L1_MATCH_PCT,
  roundForCompare,
  DEFAULT_CNY_TO_USD_FX,
  pctIsMaterial,
} from "./pricing-tolerance.mjs";

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

/** tierKey 用原始档位名，勿 normalizeAttrLabel（会破坏 输入<16k 等 pattern） */
function tierRawLabel(tier) {
  return String(tier?.tierLabel ?? tier?.tierName ?? "").trim();
}

/** @param {Array<{ tierLabel?: string, tierName?: string }>} tiers */
export function tierKeysFromTiers(tiers) {
  const total = tiers?.length ?? 0;
  return (tiers ?? []).map((t, i) => tierToKey(tierRawLabel(t), i, total));
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
    const av = roundForCompare(a?.[f]);
    const bv = roundForCompare(b?.[f]);
    if (av == null && bv == null) continue;
    if (av == null || bv == null) {
      if (f === "cache" && opts.skipMissingSupplierCache && av != null && bv == null)
        continue;
      deltas[f] = { status: "missing", a: av, b: bv };
      ok = false;
      continue;
    }
    const tol =
      f === "cache" ? (opts.cacheTolerancePct ?? CACHE_L1_MATCH_PCT) : FIELD_MATCH_PCT;
    const pct =
      bv === 0 ? (av === 0 ? 0 : null) : Math.round(((av - bv) / bv) * 1000) / 10;
    const match =
      Math.abs(av - bv) < 0.0001 ||
      !pctIsMaterial(pct, tol) ||
      (f === "cache" && Math.abs(av - bv) <= 0.01);
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

/** AIGC 国内/国际价块 → 可比 cache（含 cacheHit / cacheWrite5m） */
export function aigcBlockCache(block) {
  if (!block) return null;
  return parseNum(block.cache ?? block.cacheHit ?? block.cacheWrite5m);
}

/** 从 AIGC 一行推断 CNY→USD（dom.input / intl.input） */
export function impliedFxFromAigcRow(domestic, international) {
  const di = parseNum(domestic?.input);
  const ii = parseNum(international?.input);
  if (di == null || ii == null || ii === 0) return DEFAULT_CNY_TO_USD_FX;
  const fx = di / ii;
  return fx >= 6 && fx <= 8 ? fx : DEFAULT_CNY_TO_USD_FX;
}

/** TokenHub tier：补全 items[] 价 */
export function tokenhubTierPrices(tier) {
  const items = tier?.items ?? [];
  const pick = (name) =>
    parseNum(items.find((i) => i.name === name)?.price ?? items.find((i) => i.displayName === name)?.price);
  return {
    tierLabel: tier?.tierName ?? tier?.tierLabel ?? "",
    input: parseNum(tier?.input) ?? pick("Input"),
    output: parseNum(tier?.output) ?? pick("Output"),
    cache: parseNum(tier?.cache) ?? pick("Cache"),
  };
}

/** AIGC 国际 USD 应等于 official USD（CNY 官方按 fx 换 USD） */
export function officialTierToCompare(tier, currency = "USD", fx = DEFAULT_CNY_TO_USD_FX) {
  const fxRate = currency === "CNY" ? fx : 1;
  const scale = (v) => {
    const n = parseNum(v);
    return n != null ? roundForCompare(n / fxRate) : null;
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
