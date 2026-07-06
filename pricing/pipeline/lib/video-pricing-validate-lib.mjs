/**
 * 生视频价目校验 / 对比共享
 * 官方种子多为「积分/次」，AIGC 为「元/秒」→ Phase 1 仅展示，跨口径不比 %
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

/** 官方档是否可与 AIGC 元/秒 做数值对比（积分/秒=元/秒 可；积分/次 不可） */
export function isVideoOfficialUnitComparable(offTier) {
  const unit = String(offTier?.unit ?? "").trim();
  if (/积分\/秒|元\/秒|usd\/s|cny\/s/i.test(unit)) return true;
  if (/积分\/次|积分·次/.test(unit)) return false;
  return false;
}

/** @param {object} tier */
export function videoTierPrice(tier) {
  if (!tier) return null;
  const direct = parseNum(tier.price ?? tier.output ?? tier.input);
  if (direct != null) return direct;
  const item = (tier.items ?? []).find(
    (x) => x.name === "Output" || /输出|秒/.test(x.displayName ?? ""),
  );
  return parseNum(item?.price);
}

/** @param {object} tier @param {number} index @param {number} total */
export function videoTierWithKey(tier, index = 0, total = 1) {
  const tierLabel = tierRawLabel(tier) || "标准价";
  const tierKey = tier.tierKey ?? tierToKey(tierLabel, index, total);
  const rawPrice = tier.price ?? tier.output ?? tier.input ?? null;
  return {
    tierLabel,
    tierKey,
    price: videoTierPrice(tier),
    rawPrice,
    unit: tier.unit ?? null,
  };
}

/** @param {object} off official model */
export function officialVideoTiersForCompare(off) {
  const raw = off?.tiers ?? off?.prices?.tiers ?? [];
  const total = raw.length || 1;
  if (!raw.length) {
    const p = off?.prices?.price;
    if (p != null) {
      return [videoTierWithKey({ tierLabel: "输出", price: p, unit: off.unit }, 0, 1)];
    }
    return [];
  }
  return raw.map((t, i) => videoTierWithKey(t, i, total));
}

/** @param {object|null} aigcModel @param {object|null} mapRef */
export function aigcVideoTiersForCompare(aigcModel, mapRef) {
  if (!aigcModel?.tiers?.length) return [];
  const attr = mapRef?.attribute ?? "标准价";
  const tierRow =
    aigcModel.tiers.find((t) => t.tierName === attr) ??
    aigcModel.tiers.find((t) => t.tierName === "标准价") ??
    aigcModel.tiers[0];
  const res = tierRow?.resolutions ?? {};
  const entries = Object.entries(res);
  if (!entries.length) return [];
  const total = entries.length;
  return entries.map(([label, price], i) =>
    videoTierWithKey({ tierLabel: label, price, unit: aigcModel.priceUnit }, i, total),
  );
}

/** @param {object|null} thModel */
export function tokenhubVideoTiersForCompare(thModel) {
  if (!thModel?.tiers?.length) return [];
  return thModel.tiers.map((t, i, arr) => {
    const item = (t.items ?? []).find((x) => x.name === "Output") ?? t.items?.[0];
    const price = parseNum(item?.price ?? t.output ?? t.price);
    const tierLabel = item?.displayName || t.tierName || "输出";
    return videoTierWithKey({ tierLabel, price, unit: t.unit }, i, arr.length);
  });
}

/** @param {object|null} volModel */
export function volcengineVideoTiersForCompare(volModel) {
  if (!volModel?.tiers?.length) return [];
  return volModel.tiers.map((t, i, arr) =>
    videoTierWithKey(
      { tierLabel: t.tierName ?? t.tierLabel ?? "输出", price: t.price, unit: t.unit },
      i,
      arr.length,
    ),
  );
}

export const UNIT_MISMATCH_TEXT = "ℹ口径不同";

/**
 * @param {number|null} officialPrice
 * @param {number|null} supplierPrice
 * @param {"CNY"|"USD"} officialCurrency
 * @param {"CNY"|"USD"} supplierCurrency
 * @param {object|null} [officialTier]
 */
export function evaluateVideoPriceVsOfficial(
  officialPrice,
  supplierPrice,
  officialCurrency,
  supplierCurrency,
  officialTier = null,
) {
  if (officialTier && !isVideoOfficialUnitComparable(officialTier)) {
    return { pct: null, text: UNIT_MISMATCH_TEXT, comparable: false };
  }
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

  const pct =
    off === 0
      ? sup === 0
        ? 0
        : null
      : Math.round(((sup - off) / off) * 1000) / 10;
  const text =
    pct == null
      ? "—"
      : pctIsMaterial(pct, FIELD_MATCH_PCT)
        ? `⚠${pct > 0 ? "+" : ""}${pct}%`
        : "✅";
  return { pct, text, comparable: true };
}

export function evaluateVideoDomesticVsOfficial(
  offPrice,
  supPriceCny,
  offCurrency,
  officialTier = null,
) {
  if (officialTier && !isVideoOfficialUnitComparable(officialTier)) {
    return { pct: null, text: UNIT_MISMATCH_TEXT, comparable: false };
  }
  if (offCurrency !== "CNY" || supPriceCny == null || offPrice == null) {
    return { pct: null, text: "—", comparable: false };
  }
  const pct =
    offPrice === 0
      ? supPriceCny === 0
        ? 0
        : null
      : Math.round(((supPriceCny - offPrice) / offPrice) * 1000) / 10;
  const text =
    pct == null
      ? "—"
      : pctIsMaterial(pct, FIELD_MATCH_PCT)
        ? `⚠${pct > 0 ? "+" : ""}${pct}%`
        : "✅";
  return { pct, text, comparable: true };
}

export function evaluateVideoIntlVsOfficial(
  offPrice,
  supPriceUsd,
  offCurrency,
  officialTier = null,
) {
  if (officialTier && !isVideoOfficialUnitComparable(officialTier)) {
    return { pct: null, text: UNIT_MISMATCH_TEXT, comparable: false };
  }
  if (supPriceUsd == null || offPrice == null) {
    return { pct: null, text: "—", comparable: false };
  }
  const offUsd = offCurrency === "CNY" ? offPrice / FX_ONLINE_DOMESTIC : offPrice;
  const pct =
    offUsd === 0
      ? supPriceUsd === 0
        ? 0
        : null
      : Math.round(((supPriceUsd - offUsd) / offUsd) * 1000) / 10;
  const text =
    pct == null
      ? "—"
      : pctIsMaterial(pct, FIELD_MATCH_PCT)
        ? `⚠${pct > 0 ? "+" : ""}${pct}%`
        : "✅";
  return { pct, text, comparable: true };
}

/** @param {ReturnType<typeof videoTierWithKey>[]} tiers @param {string} tierKey */
export function findCompareTierByKey(tiers, tierKey) {
  if (!tierKey) return tiers[0] ?? null;
  return tiers.find((t) => t.tierKey === tierKey) ?? findTierByKey(tiers, tierKey);
}

/**
 * 按 tierKey 对齐 · 单字段 price（同币种元/秒）
 * @param {ReturnType<typeof videoTierWithKey>[]} left
 * @param {ReturnType<typeof videoTierWithKey>[]} right
 */
export function compareVideoTierLists(left, right) {
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

export const VIDEO_FX_DOMESTIC = FX_ONLINE_DOMESTIC;
export const VIDEO_FX_DEFAULT = DEFAULT_CNY_TO_USD_FX;

function pctDelta(base, value) {
  if (base == null || value == null || base === 0) return null;
  return Math.round(((value - base) / base) * 1000) / 10;
}

function formatDeltaPct(pct) {
  if (pct == null) return "—";
  if (!pctIsMaterial(pct, FIELD_MATCH_PCT)) return "✅";
  const sign = pct > 0 ? "+" : "";
  return `⚠${sign}${pct}%`;
}

/** AIGC 国内元/秒 vs 国际美元/秒：隐含汇率 + 偏差 */
export function evaluateAigcVideoDomVsIntl(domPriceCny, intlPriceUsd, fx = FX_ONLINE_DOMESTIC) {
  if (domPriceCny == null || intlPriceUsd == null || intlPriceUsd === 0) {
    return { pct: null, text: "—", comparable: false, impliedFx: null };
  }
  const impliedFx = Math.round((domPriceCny / intlPriceUsd) * 100) / 100;
  const intlAsCny = intlPriceUsd * fx;
  const pct = pctDelta(intlAsCny, domPriceCny);
  const fxPct =
    fx > 0 ? Math.round(((impliedFx - fx) / fx) * 1000) / 10 : null;
  let text = "✅";
  if (pct != null && pctIsMaterial(pct, FIELD_MATCH_PCT)) {
    text = formatDeltaPct(pct);
  }
  const fxNote =
    fxPct != null && Math.abs(fxPct) >= 3
      ? ` · 隐含汇率${impliedFx}(基准${fx})`
      : impliedFx != null
        ? ` · 隐含${impliedFx}`
        : "";
  return {
    pct,
    text: `${text}${fxNote}`,
    comparable: true,
    impliedFx,
  };
}

/** 线上刊例 USD/秒 vs AIGC 国际 USD/秒（Trinity 刊例是否覆盖进货） */
export function evaluateListingVsAigcIntl(aigcIntlUsd, listingUsd) {
  if (aigcIntlUsd == null || listingUsd == null) {
    return { pct: null, text: "—", comparable: false };
  }
  const pct = pctDelta(aigcIntlUsd, listingUsd);
  const text =
    pct == null
      ? "—"
      : pctIsMaterial(pct, FIELD_MATCH_PCT)
        ? `⚠${pct > 0 ? "+" : ""}${pct}%`
        : "✅";
  return { pct, text, comparable: pct != null };
}

/** AIGC 国内元/秒 vs 原厂折算元/秒(估) */
export function evaluateAigcVsImpliedOfficial(domPriceCny, implied) {
  if (domPriceCny == null || !implied) {
    return { pct: null, text: "—", comparable: false };
  }
  const pctMid = pctDelta(implied.mid, domPriceCny);
  if (implied.min !== implied.max) {
    const pctMin = pctDelta(implied.min, domPriceCny);
    const pctMax = pctDelta(implied.max, domPriceCny);
    const inRange =
      domPriceCny >= implied.min && domPriceCny <= implied.max;
    if (inRange) {
      return { pct: pctMid, text: "✅ 落在原厂折算区间", comparable: true };
    }
    if (pctMin != null && pctMax != null) {
      const worst = [pctMin, pctMax].reduce((a, b) =>
        Math.abs(a ?? 0) > Math.abs(b ?? 0) ? a : b,
      );
      return {
        pct: worst,
        text: formatDeltaPct(worst),
        comparable: true,
      };
    }
  }
  return {
    pct: pctMid,
    text: formatDeltaPct(pctMid),
    comparable: pctMid != null,
  };
}
