/**
 * 生图价目校验 / 对比共享（L1↔L2、供应商 vs 官方）
 * 口径对齐 PRICING-GOVERNANCE-WORKFLOW.md §3
 */

import { tierToKey, findTierByKey } from "./tier-key.mjs";
import {
  FIELD_MATCH_PCT,
  DEFAULT_CNY_TO_USD_FX,
  pctIsMaterial,
  roundForCompare,
} from "./pricing-tolerance.mjs";
import { FX_ONLINE_DOMESTIC } from "./compare-official-lib.mjs";
import { parseNum, normalizeAttrLabel } from "./pricing-validate-lib.mjs";

export { parseNum, normalizeAttrLabel };

function tierRawLabel(tier) {
  return String(tier?.tierLabel ?? tier?.tierName ?? "").trim();
}

/** @param {object} tier */
export function imageTierPrice(tier) {
  if (!tier) return null;
  const direct = parseNum(tier.price ?? tier.output ?? tier.input);
  if (direct != null) return direct;
  const item = (tier.items ?? []).find(
    (x) => x.name === "Output" || /输出|张/.test(x.displayName ?? ""),
  );
  return parseNum(item?.price);
}

/** @param {object} tier @param {number} index @param {number} total */
export function imageTierWithKey(tier, index = 0, total = 1) {
  const tierLabel = tierRawLabel(tier) || "标准价";
  const tierKey = tier.tierKey ?? tierToKey(tierLabel, index, total);
  return {
    tierLabel,
    tierKey,
    price: imageTierPrice(tier),
  };
}

/** @param {object} off official model */
export function officialImageTiersForCompare(off) {
  const raw = off?.tiers ?? off?.prices?.tiers ?? [];
  const total = raw.length || 1;
  if (!raw.length) {
    const p = off?.prices?.price;
    if (p != null) {
      return [imageTierWithKey({ tierLabel: "输出", price: p }, 0, 1)];
    }
    return [];
  }
  return raw.map((t, i) => imageTierWithKey(t, i, total));
}

/** @param {object|null} aigcModel @param {object|null} mapRef */
export function aigcImageTiersForCompare(aigcModel, mapRef) {
  if (!aigcModel?.tiers?.length) return [];
  const attr = mapRef?.attribute;
  const tierRow = attr
    ? aigcModel.tiers.find((t) => t.tierName === attr) ?? aigcModel.tiers[0]
    : aigcModel.tiers[0];
  const res = tierRow?.resolutions ?? {};
  const entries = Object.entries(res);
  if (!entries.length) return [];
  const total = entries.length;
  return entries.map(([label, price], i) =>
    imageTierWithKey({ tierLabel: label, price }, i, total),
  );
}

/** @param {object|null} thModel */
export function tokenhubImageTiersForCompare(thModel) {
  if (!thModel?.tiers?.length) return [];
  return thModel.tiers.map((t, i, arr) => {
    const item = (t.items ?? []).find((x) => x.name === "Output") ?? t.items?.[0];
    const price = parseNum(item?.price ?? t.output ?? t.price);
    const tierLabel = item?.displayName || t.tierName || "输出";
    return imageTierWithKey({ tierLabel, price }, i, arr.length);
  });
}

/** @param {object|null} volModel */
export function volcengineImageTiersForCompare(volModel) {
  if (!volModel?.tiers?.length) return [];
  return volModel.tiers.map((t, i, arr) =>
    imageTierWithKey(
      { tierLabel: t.tierName ?? t.tierLabel ?? "输出", price: t.price },
      i,
      arr.length,
    ),
  );
}

/**
 * 按 tierKey 对齐 · 单字段 price
 * @param {ReturnType<typeof imageTierWithKey>[]} left
 * @param {ReturnType<typeof imageTierWithKey>[]} right
 */
export function compareImageTierLists(left, right) {
  const issues = [];
  const rightKeyed = right.map((t, i) => ({
    ...t,
    tierKey: t.tierKey ?? tierToKey(t.tierLabel, i, right.length),
  }));
  const rightByKey = new Map(rightKeyed.map((t) => [t.tierKey, t]));

  for (let i = 0; i < left.length; i++) {
    const l = {
      ...left[i],
      tierKey: left[i].tierKey ?? tierToKey(left[i].tierLabel, i, left.length),
    };
    const r = rightByKey.get(l.tierKey) ?? findTierByKey(right, l.tierKey);
    if (!r) {
      issues.push({ kind: "missing_tier", tierKey: l.tierKey, left: l, right: null });
      continue;
    }
    const a = roundForCompare(l.price);
    const b = roundForCompare(r.price);
    if (a == null && b == null) continue;
    if (a == null || b == null) {
      issues.push({ kind: "missing_price", tierKey: l.tierKey, left: a, right: b });
      continue;
    }
    const pct = b === 0 ? (a === 0 ? 0 : null) : Math.round(((a - b) / b) * 1000) / 10;
    if (pct != null && pctIsMaterial(pct, FIELD_MATCH_PCT)) {
      issues.push({ kind: "price_mismatch", tierKey: l.tierKey, left: a, right: b, pct });
    }
  }

  if (left.length !== right.length) {
    issues.push({ kind: "tier_count", left: left.length, right: right.length });
  }
  return issues;
}

function formatDeltaPct(pct) {
  if (pct == null) return "—";
  if (!pctIsMaterial(pct, FIELD_MATCH_PCT)) return "✅";
  const sign = pct > 0 ? "+" : "";
  return `⚠${sign}${pct}%`;
}

function pctDelta(base, value) {
  if (base == null || value == null || base === 0) return null;
  return Math.round(((value - base) / base) * 1000) / 10;
}

/**
 * 供应商价 vs 官方价（同币种或按治理文档换汇）
 * @param {number|null} officialPrice
 * @param {number|null} supplierPrice
 * @param {"CNY"|"USD"} officialCurrency
 * @param {"CNY"|"USD"} supplierCurrency
 */
export function evaluateImagePriceVsOfficial(
  officialPrice,
  supplierPrice,
  officialCurrency,
  supplierCurrency,
) {
  if (officialPrice == null || supplierPrice == null) {
    return { pct: null, text: "—", comparable: false };
  }

  let off = officialPrice;
  let sup = supplierPrice;

  if (officialCurrency === "CNY" && supplierCurrency === "USD") {
    off = officialPrice / FX_ONLINE_DOMESTIC;
  } else if (officialCurrency === "USD" && supplierCurrency === "CNY") {
    sup = supplierPrice / FX_ONLINE_DOMESTIC;
  } else if (officialCurrency !== supplierCurrency) {
    return { pct: null, text: "—", comparable: false };
  }

  const pct = pctDelta(off, sup);
  return { pct, text: formatDeltaPct(pct), comparable: true };
}

/** 国内官方：仅比 CNY↔CNY */
export function evaluateImageDomesticVsOfficial(offPrice, supPriceCny, offCurrency) {
  if (offCurrency !== "CNY" || supPriceCny == null || offPrice == null) {
    return { pct: null, text: "—", comparable: false };
  }
  const pct = pctDelta(offPrice, supPriceCny);
  return { pct, text: formatDeltaPct(pct), comparable: true };
}

/** 国际进货：USD↔USD（官方 CNY 先 ÷FX） */
export function evaluateImageIntlVsOfficial(offPrice, supPriceUsd, offCurrency) {
  if (supPriceUsd == null || offPrice == null) {
    return { pct: null, text: "—", comparable: false };
  }
  const offUsd = offCurrency === "CNY" ? offPrice / FX_ONLINE_DOMESTIC : offPrice;
  const pct = pctDelta(offUsd, supPriceUsd);
  return { pct, text: formatDeltaPct(pct), comparable: true };
}

/** @param {object} offTier @param {string} tierKey */
export function findCompareTierByKey(tiers, tierKey) {
  if (!tierKey) return tiers[0] ?? null;
  return tiers.find((t) => t.tierKey === tierKey) ?? findTierByKey(tiers, tierKey);
}

export function impliedFxFromAigcImageRow(domestic, international, resLabel) {
  const d = parseNum(domestic?.[resLabel]);
  const i = parseNum(international?.[resLabel]);
  if (d == null || i == null || i === 0) return null;
  return Math.round((d / i) * 100) / 100;
}

export const IMAGE_FX_DOMESTIC = FX_ONLINE_DOMESTIC;
export const IMAGE_FX_DEFAULT = DEFAULT_CNY_TO_USD_FX;
