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

/** 官方档是否为 token 刊例（元/百万 tokens） */
export function isVideoTokenOfficialUnit(unitOrTier) {
  const unit = String(
    typeof unitOrTier === "object" ? unitOrTier?.unit : unitOrTier ?? "",
  ).trim();
  return /百万tokens|百万 tokens|\/m tokens/i.test(unit);
}

/** 线上 prices-api 档是否为 video token 刊例（per_million_video_tokens） */
export function isVideoTokenOnlineUnit(unitOrTier) {
  const unit = String(
    typeof unitOrTier === "object"
      ? unitOrTier?.unit ?? unitOrTier?.priceUnit ?? ""
      : unitOrTier ?? "",
  ).trim();
  return /per_million_video_tokens|video_token|million.*video.*token/i.test(unit);
}

/** @param {number|string|null} price @param {"CNY"|"USD"} [currency] */
export function formatVideoTokenPrice(price, currency = "CNY") {
  if (price == null || price === "") return "—";
  const sym = currency === "CNY" ? "¥" : "$";
  return `${sym}${price}/百万tokens`;
}

/** 官方档是否可与 AIGC 元/秒 做数值对比（积分/秒=元/秒 可；积分/次、token 不可） */
export function isVideoOfficialUnitComparable(offTier) {
  const unit = String(offTier?.unit ?? "").trim();
  if (isVideoTokenOfficialUnit(unit)) return false;
  if (/积分\/秒|元\/秒|美元\/秒|usd\/s|cny\/s/i.test(unit)) return true;
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
    note: tier.note ?? null,
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

import {
  normalizeAigcAttributeLabel,
  shouldIncludeAigcAttributeInCompare,
} from "../../config/video-aigc-attributes.mjs";

/** @param {object|null} aigcModel @param {string} attributeName */
export function findAigcVideoTierRow(aigcModel, attributeName) {
  if (!aigcModel?.tiers?.length) return null;
  const want = normalizeAigcAttributeLabel(attributeName);
  return (
    aigcModel.tiers.find(
      (t) => normalizeAigcAttributeLabel(t.tierName) === want,
    ) ??
    (want === "标准价" ? aigcModel.tiers[0] : null)
  );
}

/** @param {object|null} aigcModel @param {object|null} [mapRef] */
export function aigcVideoAttributeNamesForCompare(aigcModel, mapRef) {
  if (!aigcModel?.tiers?.length) {
    const fallback = mapRef?.attribute
      ? normalizeAigcAttributeLabel(mapRef.attribute)
      : "标准价";
    return [fallback];
  }
  const names = aigcModel.tiers
    .map((t) => normalizeAigcAttributeLabel(t.tierName))
    .filter((name) => shouldIncludeAigcAttributeInCompare(name));
  const unique = [...new Set(names)];
  if (unique.length) return unique;
  return [normalizeAigcAttributeLabel(mapRef?.attribute ?? "标准价")];
}

/** @param {object|null} aigcModel @param {string} attributeName */
export function aigcVideoResolutionsForAttribute(aigcModel, attributeName) {
  const tierRow = findAigcVideoTierRow(aigcModel, attributeName);
  const res = tierRow?.resolutions ?? {};
  const entries = Object.entries(res);
  if (!entries.length) return [];
  const total = entries.length;
  return entries.map(([label, price], i) =>
    videoTierWithKey(
      { tierLabel: label, price, unit: aigcModel?.priceUnit },
      i,
      total,
    ),
  );
}

/** @param {object|null} aigcModel @param {string} attributeName @param {string} [tierKey] */
export function aigcVideoPriceForAttribute(aigcModel, attributeName, tierKey) {
  const tiers = aigcVideoResolutionsForAttribute(aigcModel, attributeName);
  if (!tiers.length) return null;
  if (tierKey) {
    const hit = findCompareTierByKey(tiers, tierKey);
    if (hit?.price != null) return hit.price;
  }
  return tiers[0]?.price ?? null;
}

/** @param {object|null} aigcModel @param {object|null} mapRef */
export function aigcVideoTiersForCompare(aigcModel, mapRef) {
  if (!aigcModel?.tiers?.length) return [];
  const attr = mapRef?.attribute ?? "标准价";
  return aigcVideoResolutionsForAttribute(aigcModel, attr);
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
  const tokenTiers = volModel.tiers.filter((t) => isVideoTokenOfficialUnit(t.unit));
  const source = tokenTiers.length ? tokenTiers : [];
  return source.map((t, i, arr) => {
    const price = parseVolcengineVideoTokenPrice(t);
    return videoTierWithKey(
      {
        tierLabel: volcengineTokenTierLabel(t),
        price,
        unit: t.unit,
      },
      i,
      arr.length,
    );
  });
}

/** @param {{ tierName?: string, price?: string|number }} volTier */
function volcengineTokenTierLabel(volTier) {
  const name = String(volTier.tierName ?? volTier.tierLabel ?? "").trim();
  if (/有声/.test(name) && !/draft/i.test(name)) return "有声视频";
  if (/无声/.test(name) && !/draft/i.test(name)) return "无声视频";
  if (/不含视频/.test(name)) return "不含视频输入";
  if (/含视频/.test(name)) return "含视频输入";
  if (/480p.*720p|720p.*480p/.test(name.replace(/\s/g, ""))) {
    if (/不含/.test(name)) return "480p/720p·不含视频输入";
    if (/含/.test(name)) return "480p/720p·含视频输入";
  }
  if (/1080p/.test(name)) {
    if (/不含/.test(name)) return "1080p·不含视频输入";
    if (/含/.test(name)) return "1080p·含视频输入";
  }
  if (/4k/i.test(name)) {
    if (/不含/.test(name)) return "4k·不含视频输入";
    if (/含/.test(name)) return "4k·含视频输入";
  }
  if (/在线推理/.test(name)) return "在线推理";
  return name || "在线推理";
}

/** @param {{ price?: string|number, unit?: string, tierName?: string }} volTier @param {string} [offTierLabel] */
export function parseVolcengineVideoTokenPrice(volTier, offTierLabel = "") {
  if (!volTier || !isVideoTokenOfficialUnit(volTier.unit)) return null;
  const raw = String(volTier.price ?? "");
  const label = String(offTierLabel ?? volTier.tierName ?? "");

  if (/1080p/.test(label) && /不含/.test(label)) {
    const m = raw.match(/1080p输入不含视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }
  if (/1080p/.test(label) && /含/.test(label) && !/不含/.test(label)) {
    const m = raw.match(/1080p输入包含视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }
  if (/4k/i.test(label) && /不含/.test(label)) {
    const m = raw.match(/4k输入不含视频：([\d.]+)/i);
    if (m) return parseNum(m[1]);
  }
  if (/4k/i.test(label) && /含/.test(label) && !/不含/.test(label)) {
    const m = raw.match(/4k输入包含视频：([\d.]+)/i);
    if (m) return parseNum(m[1]);
  }
  if (/480p|720p/.test(label) && /不含/.test(label)) {
    const m = raw.match(/480p，720p输入不含视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }
  if (/480p|720p/.test(label) && /含/.test(label) && !/不含/.test(label)) {
    const m = raw.match(/480p，720p输入包含视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }
  if (/不含视频输入/.test(label)) {
    const m = raw.match(/输入不含视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }
  if (/含视频输入/.test(label)) {
    const m = raw.match(/输入包含视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }
  if (/有声/.test(label)) {
    const m = raw.match(/有声视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }
  if (/无声/.test(label)) {
    const m = raw.match(/无声视频：([\d.]+)/);
    if (m) return parseNum(m[1]);
  }

  const labeled = raw.match(/(?:有声视频|无声视频|不含视频输入|含视频输入)[：:]\s*([\d.]+)/);
  if (labeled) return parseNum(labeled[1]);
  const firstNum = raw.match(/([\d.]+)/);
  return firstNum ? parseNum(firstNum[1]) : parseNum(volTier.price);
}

function normalizeVolcVideoTierLabel(label) {
  return String(label ?? "")
    .toLowerCase()
    .replace(/视频/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/** @param {object|null} volModel @param {{ tierLabel?: string }} offTier */
export function pickVolcengineVideoTierForOfficial(volModel, offTier) {
  if (!volModel?.tiers?.length || !offTier?.tierLabel) return null;
  const tokenTiers = volModel.tiers.filter((t) => isVideoTokenOfficialUnit(t.unit));
  if (!tokenTiers.length) return null;

  const target = normalizeVolcVideoTierLabel(offTier.tierLabel);
  if (!target) return tokenTiers.length === 1 ? tokenTiers[0] : null;

  const scored = tokenTiers
    .map((t) => {
      const label = volcengineTokenTierLabel(t);
      const norm = normalizeVolcVideoTierLabel(label);
      if (norm === target) return { t, score: 100 };
      if (norm.includes(target) || target.includes(norm)) return { t, score: 80 };
      let score = 0;
      if (/有声/.test(target) && /有声/.test(norm)) score += 40;
      if (/无声/.test(target) && /无声/.test(norm)) score += 40;
      if (/不含/.test(target) && /不含/.test(norm)) score += 30;
      if (/含视频/.test(target) && /含视频/.test(norm)) score += 30;
      if (/1080p/.test(target) && /1080p/.test(norm)) score += 20;
      if (/4k/.test(target) && /4k/.test(norm)) score += 20;
      if (/480p|720p/.test(target) && /480p|720p/.test(norm)) score += 20;
      if (/在线推理/.test(target) && /在线推理/.test(norm)) score += 50;
      return { t, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best && best.score >= 20) return best.t;
  return tokenTiers.length === 1 ? tokenTiers[0] : null;
}

/** @param {{ price?: string|number, unit?: string, tierName?: string }} volTier @deprecated 按个示例档，已不作为刊例对比 */
export function parseVolcengineVideoComparePrice(volTier) {
  return parseVolcengineVideoTokenPrice(volTier);
}

/** @param {object|null} volModel @param {{ tierLabel?: string, unit?: string, price?: number }} offTier */
export function volcengineVideoPriceAtCompare(volModel, offTier) {
  if (isVideoTokenOfficialUnit(offTier)) {
    return parseNum(offTier.price ?? offTier.rawPrice);
  }
  const volTier = pickVolcengineVideoTierForOfficial(volModel, offTier);
  return parseVolcengineVideoTokenPrice(volTier, offTier?.tierLabel);
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

/** 线上 token 刊例 USD/百万 vs 官方 CNY/百万（同轴可比） */
export function evaluateListingVsOfficialToken(
  officialCnyPerM,
  listingUsdPerM,
  fx = FX_ONLINE_DOMESTIC,
) {
  if (officialCnyPerM == null || listingUsdPerM == null || fx <= 0) {
    return { pct: null, text: "—", comparable: false };
  }
  const officialUsd = officialCnyPerM / fx;
  return evaluateListingVsAigcIntl(officialUsd, listingUsdPerM);
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
