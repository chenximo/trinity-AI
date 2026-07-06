/**
 * 供应商分表：厂商官方价 vs 供应商挂牌（同分辨率档对齐 · 生图）
 */

import { findTierByKey, tierToKey } from "./tier-key.mjs";
import { parseNum } from "./pricing-compare.mjs";
import { FIELD_MATCH_PCT } from "./pricing-tolerance.mjs";
import {
  officialImageTiersForCompare,
  evaluateImageDomesticVsOfficial,
  evaluateImageIntlVsOfficial,
  imageTierPrice,
} from "./image-pricing-validate-lib.mjs";
import {
  resolveOfficialModel,
} from "./supplier-official-compare.mjs";
import { formatVsWithVerify } from "./pricing-verify.mjs";

function symForCurrency(currency) {
  return currency === "CNY" ? "¥" : "$";
}

function formatImageOfficialPrice(tier, currency) {
  if (!tier) return "—";
  const p = imageTierPrice(tier);
  if (p == null) return "—";
  return `${symForCurrency(currency)}${p}/张`;
}

function formatImageSupplierPrice(price, currency) {
  if (price == null || price === "") return "—";
  return `${symForCurrency(currency)}${price}/张`;
}

/**
 * @param {object|null} officialModel
 * @param {string} resolutionLabel
 * @param {string|null} tierKey
 */
export function pickOfficialImageTierForSupplier(
  officialModel,
  resolutionLabel,
  tierKey = null,
  tierIndex = 0,
  tierTotal = 1,
) {
  const tiers = officialImageTiersForCompare(officialModel);
  if (!tiers.length) return null;

  if (tierKey) {
    const hit = tiers.find((t) => t.tierKey === tierKey);
    if (hit) return hit;
    const byKey = findTierByKey(tiers, tierKey);
    if (byKey) return byKey;
  }

  const label = String(resolutionLabel ?? "").trim();
  const byLabel = tiers.find(
    (t) => String(t.tierLabel ?? "").trim() === label,
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
export function buildImageOfficialSupplierCells(
  officialModel,
  officialTier,
  supplierPrice,
  supplierCurrency,
  channelKind = "domestic",
) {
  const supplierListed = formatImageSupplierPrice(supplierPrice, supplierCurrency);

  if (!officialTier) {
    const hasOfficial = (officialModel?.tiers ?? officialModel?.prices?.tiers ?? []).length > 0;
    return {
      vendorOfficial: "—",
      supplierListed,
      supplierVsOfficial: hasOfficial ? "— 官方无同档" : "—",
    };
  }

  const offCurrency = officialModel?.currency ?? "CNY";
  const vendorOfficial = formatImageOfficialPrice(officialTier, offCurrency);
  const offPrice = imageTierPrice(officialTier);

  let cmp;
  if (channelKind === "domestic" || channelKind === "tokenhub" || channelKind === "volcengine") {
    cmp = evaluateImageDomesticVsOfficial(offPrice, supplierPrice, offCurrency);
  } else {
    cmp = evaluateImageIntlVsOfficial(offPrice, supplierPrice, offCurrency);
  }

  let supplierVsOfficial = cmp.text ?? "—";
  if (cmp.comparable && cmp.pct != null && Math.abs(cmp.pct) < FIELD_MATCH_PCT) {
    supplierVsOfficial = "✅ 一致";
  } else if (cmp.comparable && cmp.pct != null && Math.abs(cmp.pct) >= FIELD_MATCH_PCT) {
    supplierVsOfficial = cmp.text.startsWith("⚠") ? cmp.text : `⚠${cmp.text}`;
  }

  return { vendorOfficial, supplierListed, supplierVsOfficial };
}

/** @param {{ vendorMap?: object, officialByVendorId?: Map }} officialCtx */
export function officialCellsForImageResolution(
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
  const officialTier = pickOfficialImageTierForSupplier(
    officialModel,
    resolutionLabel,
    tierMeta.tierKey ?? null,
    tierMeta.tierIndex ?? 0,
    tierMeta.tierTotal ?? 1,
  );
  const cells = buildImageOfficialSupplierCells(
    officialModel,
    officialTier,
    supplierPrice,
    supplierCurrency,
    channelKind,
  );
  const evalResult = evaluateImageSupplierVsOfficial(
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

export function evaluateImageSupplierVsOfficial(
  officialModel,
  officialTier,
  supplierPrice,
  supplierCurrency,
  channelKind = "domestic",
) {
  const cells = buildImageOfficialSupplierCells(
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

  const tiers = officialImageTiersForCompare(officialModel);
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

  const offCurrency = officialModel.currency ?? "CNY";
  const offPrice = imageTierPrice(officialTier);
  const cmp =
    channelKind === "international"
      ? evaluateImageIntlVsOfficial(offPrice, supplierPrice, offCurrency)
      : evaluateImageDomesticVsOfficial(offPrice, supplierPrice, offCurrency);

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

export function resolveOfficialImageModel(trinityId, officialCtx = {}) {
  const { vendorMap = {}, officialByVendorId = new Map() } = officialCtx;
  return resolveOfficialModel(trinityId, vendorMap, officialByVendorId);
}
