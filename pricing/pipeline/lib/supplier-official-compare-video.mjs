/**
 * 供应商分表：厂商官方价 vs 供应商挂牌（同分辨率档对齐 · 生视频）
 */

import { findTierByKey, tierToKey } from "./tier-key.mjs";
import { parseNum } from "./pricing-compare.mjs";
import { FIELD_MATCH_PCT } from "./pricing-tolerance.mjs";
import {
  officialVideoTiersForCompare,
  evaluateVideoDomesticVsOfficial,
  evaluateVideoIntlVsOfficial,
  videoTierPrice,
  UNIT_MISMATCH_TEXT,
} from "./video-pricing-validate-lib.mjs";
import { formatOfficialDocPrice } from "../../config/video-reference-conversion.mjs";
import { resolveOfficialModel } from "./supplier-official-compare.mjs";
import { formatVsWithVerify } from "./pricing-verify.mjs";

function symForCurrency(currency) {
  return currency === "CNY" ? "¥" : "$";
}

function formatVideoOfficialPrice(tier, currency) {
  return formatOfficialDocPrice(tier, currency);
}

function formatVideoSupplierPrice(price, currency) {
  if (price == null || price === "") return "—";
  return `${symForCurrency(currency)}${price}/秒`;
}

/**
 * @param {object|null} officialModel
 * @param {string} resolutionLabel
 * @param {string|null} tierKey
 */
export function pickOfficialVideoTierForSupplier(
  officialModel,
  resolutionLabel,
  tierKey = null,
  tierIndex = 0,
  tierTotal = 1,
) {
  const tiers = officialVideoTiersForCompare(officialModel);
  if (!tiers.length) return null;

  if (tierKey) {
    const hit = tiers.find((t) => t.tierKey === tierKey);
    if (hit) return hit;
    const byKey = findTierByKey(tiers, tierKey);
    if (byKey) return byKey;
  }

  const label = String(resolutionLabel ?? "").trim();
  const byLabel = tiers.find(
    (t) => String(t.tierLabel ?? "").trim().toLowerCase() === label.toLowerCase(),
  );
  if (byLabel) return byLabel;

  const keyFromLabel = tierToKey(label, tierIndex, tierTotal);
  const byDerived = tiers.find((t) => t.tierKey === keyFromLabel);
  if (byDerived) return byDerived;

  if (tiers.length === 1) return tiers[0];
  return tiers[tierIndex] ?? tiers[0] ?? null;
}

/**
 * @param {object|null} officialModel
 * @param {object|null} officialTier
 * @param {number|null} supplierPrice
 * @param {"CNY"|"USD"} supplierCurrency
 * @param {"domestic"|"international"|"tokenhub"|"volcengine"} channelKind
 */
export function buildVideoOfficialSupplierCells(
  officialModel,
  officialTier,
  supplierPrice,
  supplierCurrency,
  channelKind = "domestic",
) {
  const supplierListed = formatVideoSupplierPrice(supplierPrice, supplierCurrency);

  if (!officialTier) {
    const hasOfficial = (officialModel?.tiers ?? officialModel?.prices?.tiers ?? []).length > 0;
    return {
      vendorOfficial: "—",
      supplierListed,
      supplierVsOfficial: hasOfficial ? "— 官方无同档" : "—",
    };
  }

  const offCurrency = officialModel?.currency ?? "CNY";
  const vendorOfficial = formatVideoOfficialPrice(officialTier, offCurrency);
  const offPrice = videoTierPrice(officialTier);

  let cmp;
  if (channelKind === "domestic" || channelKind === "tokenhub" || channelKind === "volcengine") {
    cmp = evaluateVideoDomesticVsOfficial(offPrice, supplierPrice, offCurrency, officialTier);
  } else {
    cmp = evaluateVideoIntlVsOfficial(offPrice, supplierPrice, offCurrency, officialTier);
  }

  let supplierVsOfficial = cmp.text ?? "—";
  if (cmp.text === UNIT_MISMATCH_TEXT) {
    supplierVsOfficial = UNIT_MISMATCH_TEXT;
  } else if (cmp.comparable && cmp.pct != null && Math.abs(cmp.pct) < FIELD_MATCH_PCT) {
    supplierVsOfficial = "✅ 一致";
  } else if (cmp.comparable && cmp.pct != null && Math.abs(cmp.pct) >= FIELD_MATCH_PCT) {
    supplierVsOfficial = cmp.text.startsWith("⚠") ? cmp.text : `⚠${cmp.text}`;
  }

  return { vendorOfficial, supplierListed, supplierVsOfficial };
}

/** @param {{ vendorMap?: object, officialByVendorId?: Map }} officialCtx */
export function officialCellsForVideoResolution(
  trinityId,
  resolutionLabel,
  supplierPrice,
  supplierCurrency,
  officialCtx = {},
  tierMeta = {},
  channelKind = "domestic",
) {
  const { vendorMap = {}, officialByVendorId = new Map() } = officialCtx;
  const officialModel = resolveOfficialModel(
    trinityId,
    vendorMap,
    officialByVendorId,
  );
  const officialTier = pickOfficialVideoTierForSupplier(
    officialModel,
    resolutionLabel,
    tierMeta.tierKey ?? null,
    tierMeta.tierIndex ?? 0,
    tierMeta.tierTotal ?? 1,
  );
  const cells = buildVideoOfficialSupplierCells(
    officialModel,
    officialTier,
    supplierPrice,
    supplierCurrency,
    channelKind,
  );
  const evalResult = evaluateVideoSupplierVsOfficial(
    officialModel,
    officialTier,
    supplierPrice,
    supplierCurrency,
    channelKind,
  );
  return {
    ...cells,
    supplierVsOfficial: formatVsWithVerify(trinityId, evalResult),
  };
}

export function evaluateVideoSupplierVsOfficial(
  officialModel,
  officialTier,
  supplierPrice,
  supplierCurrency,
  channelKind = "domestic",
) {
  const cells = buildVideoOfficialSupplierCells(
    officialModel,
    officialTier,
    supplierPrice,
    supplierCurrency,
    channelKind,
  );
  const summaryText = cells.supplierVsOfficial ?? "—";

  if (!officialModel) {
    return {
      status: "no_official",
      summaryText,
      maxAbsPct: null,
      maxUpPct: null,
    };
  }

  const tiers = officialVideoTiersForCompare(officialModel);
  if (!tiers.length) {
    return {
      status: "no_official",
      summaryText,
      maxAbsPct: null,
      maxUpPct: null,
    };
  }

  if (!officialTier) {
    return {
      status: "no_official_tier",
      summaryText,
      maxAbsPct: null,
      maxUpPct: null,
    };
  }

  if (summaryText === UNIT_MISMATCH_TEXT) {
    return {
      status: "unit_mismatch",
      summaryText,
      maxAbsPct: null,
      maxUpPct: null,
    };
  }

  const offCurrency = officialModel.currency ?? "CNY";
  const offPrice = videoTierPrice(officialTier);
  const cmp =
    channelKind === "international"
      ? evaluateVideoIntlVsOfficial(offPrice, supplierPrice, offCurrency, officialTier)
      : evaluateVideoDomesticVsOfficial(offPrice, supplierPrice, offCurrency, officialTier);

  if (!cmp.comparable || cmp.pct == null) {
    return {
      status: "not_comparable",
      summaryText,
      maxAbsPct: null,
      maxUpPct: null,
    };
  }

  const maxAbsPct = Math.abs(cmp.pct);
  const maxUpPct = cmp.pct > FIELD_MATCH_PCT ? cmp.pct : null;

  if (summaryText.startsWith("✅") || maxAbsPct < FIELD_MATCH_PCT) {
    return {
      status: "match",
      summaryText,
      maxAbsPct,
      maxUpPct: null,
    };
  }

  return {
    status: "mismatch",
    summaryText,
    maxAbsPct,
    maxUpPct,
  };
}

export function resolveOfficialVideoModel(trinityId, officialCtx = {}) {
  const { vendorMap = {}, officialByVendorId = new Map() } = officialCtx;
  return resolveOfficialModel(trinityId, vendorMap, officialByVendorId);
}
