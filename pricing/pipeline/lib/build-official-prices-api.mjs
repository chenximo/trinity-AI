/**
 * 厂商官方价 → GET /v1/prices 同构 JSON（CNY ÷ fx → USD；USD 直用）
 */

import { parseNum } from "./pricing-compare.mjs";
import { tierToKey, findTierByKey } from "./tier-key.mjs";
import {
  formatAmountUsd,
  formatDisplayUsd,
  cnyToUsd,
} from "./build-upstream-prices-api.mjs";
import {
  aigcImageTiersForCompare,
  findCompareTierByKey,
  tokenhubImageTiersForCompare,
} from "./image-pricing-validate-lib.mjs";

const KIND_LABELS = {
  input: "input tokens",
  output: "output tokens",
  cache: "cached input tokens",
  cached_input: "cached input tokens",
};

function toUsd(val, currency, fxCnyPerUsd) {
  if (currency === "USD") return parseNum(val);
  return cnyToUsd(val, fxCnyPerUsd);
}

function patchPriceObj(priceObj, usdAmount, kind) {
  if (!priceObj || usdAmount == null) return;
  priceObj.amount = formatAmountUsd(usdAmount);
  priceObj.currency = "USD";
  priceObj.unit = "per_million_tokens";
  priceObj.display = formatDisplayUsd(usdAmount, kind);
}

function formatDisplayImageUsd(amount) {
  const shown = Math.round(amount * 100) / 100;
  return `$${shown.toFixed(2)} / 张`;
}

function patchImageUnitPrice(priceObj, usdAmount) {
  if (!priceObj?.unit || usdAmount == null) return false;
  priceObj.unit.amount = formatAmountUsd(usdAmount);
  priceObj.unit.currency = "USD";
  priceObj.unit.unit = "per_image";
  priceObj.unit.display = formatDisplayImageUsd(usdAmount);
  return true;
}

function imageGroupLabel(group) {
  return (
    group.conditions?.resolution_tier ??
    group.conditions_summary ??
    group.label ??
    "标准价"
  );
}

function imageOfficialTierKey(tier, index, total) {
  const label = String(tier.tierLabel ?? tier.tierName ?? "").trim();
  const n = label.toLowerCase();
  if (/^1k$/i.test(n)) return "res:1k";
  if (/^2k$/i.test(n)) return "res:2k";
  if (/^4k$/i.test(n)) return "res:4k";
  if (/^输出$|统一|标准价/i.test(n) || total === 1) return "uniform";
  return tierToKey(label, index, total);
}

function resolveOfficialImageTier(officialTiers, groupLabel, groupIndex, resGroupCount) {
  if (!officialTiers?.length) return null;
  const wantKey = tierToKey(groupLabel, groupIndex, resGroupCount);
  for (let i = 0; i < officialTiers.length; i++) {
    const t = officialTiers[i];
    const key = imageOfficialTierKey(t, i, officialTiers.length);
    if (key === wantKey) return t;
  }
  if (officialTiers.length === 1) {
    const only = officialTiers[0];
    const onlyKey = imageOfficialTierKey(only, 0, 1);
    if (onlyKey === "uniform") return only;
  }
  return null;
}

/**
 * @param {{ intl?: object|null, dom?: object|null, mapRef?: object|null }} aigcCtx
 * @param {string} wantKey
 * @param {number} fxCnyPerUsd
 */
function resolveAigcImageUsd(aigcCtx, wantKey, fxCnyPerUsd) {
  if (!aigcCtx) return null;
  const { intl, dom, mapRef } = aigcCtx;

  if (intl) {
    const hit = findCompareTierByKey(
      aigcImageTiersForCompare(intl, mapRef),
      wantKey,
    );
    if (hit?.price != null) {
      return { usd: hit.price, source: "aigc_intl" };
    }
  }

  if (dom) {
    const hit = findCompareTierByKey(
      aigcImageTiersForCompare(dom, mapRef),
      wantKey,
    );
    if (hit?.price != null) {
      const usd = toUsd(hit.price, "CNY", fxCnyPerUsd);
      if (usd != null) return { usd, source: "aigc_dom" };
    }
  }

  return null;
}

/**
 * 官方无档时的 L2 补齐：AIGC 国际 → AIGC 国内 → TokenHub（CNY 档 ÷ fx）
 * @param {{ intl?: object|null, dom?: object|null, mapRef?: object|null, tokenhub?: object|null }} l2Ctx
 */
function resolveL2ImageUsd(l2Ctx, wantKey, fxCnyPerUsd) {
  if (!l2Ctx) return null;

  const aigcHit = resolveAigcImageUsd(l2Ctx, wantKey, fxCnyPerUsd);
  if (aigcHit) return aigcHit;

  const th = l2Ctx.tokenhub;
  if (th) {
    const hit = findCompareTierByKey(
      tokenhubImageTiersForCompare(th),
      wantKey,
    );
    if (hit?.price != null) {
      const usd = toUsd(hit.price, "CNY", fxCnyPerUsd);
      if (usd != null) return { usd, source: "tokenhub" };
    }
  }

  return null;
}

/**
 * @param {object} templateEntry prices-api 单条（image_tiered）
 * @param {object|null} officialModel vendor-pricing.models[]
 * @param {number} fxCnyPerUsd
 * @param {{ intl?: object|null, dom?: object|null, mapRef?: object|null, tokenhub?: object|null }|null} [l2Ctx]
 */
export function applyOfficialToImagePriceEntry(
  templateEntry,
  officialModel,
  fxCnyPerUsd,
  l2Ctx = null,
) {
  const entry = structuredClone(templateEntry);
  const tiers = officialModel?.tiers ?? [];
  const currency = officialModel?.currency ?? "USD";
  const resGroups = (entry.price_groups ?? []).filter(
    (g) => g.type === "resolution_tier" && g.prices?.unit,
  );
  const resCount = Math.max(resGroups.length, tiers.length, 1);

  if (!tiers.length && !l2Ctx?.intl && !l2Ctx?.dom && !l2Ctx?.tokenhub) {
    return {
      entry,
      hasOfficial: false,
      tierStats: { fromOfficial: 0, fromAigc: 0, fromTokenhub: 0, unchanged: resGroups.length },
    };
  }

  let patched = false;
  const tierStats = { fromOfficial: 0, fromAigc: 0, fromTokenhub: 0, unchanged: 0 };

  for (const group of entry.price_groups ?? []) {
    if (group.type !== "resolution_tier" || !group.prices?.unit) continue;
    const label = imageGroupLabel(group);
    const idx = resGroups.indexOf(group);
    const groupIndex = idx >= 0 ? idx : 0;
    const wantKey = tierToKey(label, groupIndex, resCount);

    const offTier = resolveOfficialImageTier(
      tiers,
      label,
      groupIndex,
      resCount,
    );

    let usd = null;
    let l2Source = null;
    if (offTier) {
      usd = toUsd(offTier.price, currency, fxCnyPerUsd);
    } else {
      const l2Hit = resolveL2ImageUsd(l2Ctx, wantKey, fxCnyPerUsd);
      if (l2Hit) {
        usd = l2Hit.usd;
        l2Source = l2Hit.source;
      }
    }

    if (usd == null) {
      tierStats.unchanged++;
      continue;
    }
    if (patchImageUnitPrice(group.prices, usd)) {
      patched = true;
      if (offTier) tierStats.fromOfficial++;
      else if (l2Source === "tokenhub") tierStats.fromTokenhub++;
      else if (l2Source) tierStats.fromAigc++;
    } else {
      tierStats.unchanged++;
    }
  }

  if (patched) {
    entry.currency = "USD";
    entry.price_unit = "per_image";
  }

  return { entry, hasOfficial: patched, tierStats };
}

function patchLegacyPrices(prices, offTier, currency, fxCnyPerUsd) {
  if (!prices || !offTier) return false;
  let any = false;
  for (const [key, kind] of [
    ["input", "input"],
    ["output", "output"],
    ["cache", "cache"],
  ]) {
    const usd = toUsd(offTier[key], currency, fxCnyPerUsd);
    if (usd == null) continue;
    patchPriceObj(prices[key], usd, kind);
    any = true;
  }
  return any;
}

function tokenKindToField(tokenKind) {
  if (tokenKind === "cached_input" || tokenKind === "cache") return "cache";
  if (tokenKind === "input" || tokenKind === "output") return tokenKind;
  return null;
}

function resolveOfficialTier(officialTiers, label, index, total) {
  if (!officialTiers?.length) return null;
  const key = tierToKey(label, index, total);
  if (key !== "uniform") {
    const hit = findTierByKey(officialTiers, key);
    if (hit) return hit;
  }
  if (index < officialTiers.length) return officialTiers[index] ?? null;
  return null;
}

function legacyGroupLabel(group) {
  if (group.type === "has_audio") return "输入:音频";
  if (group.type === "default") return "输入:文本/图片/视频";
  return group.label ?? group.type ?? "标准价";
}

/**
 * @param {object} templateEntry prices-api 单条模板
 * @param {object|null} officialModel vendor-pricing.models[]
 * @param {number} fxCnyPerUsd
 */
export function applyOfficialToPriceEntry(
  templateEntry,
  officialModel,
  fxCnyPerUsd,
  aigcCtx = null,
) {
  const entry = structuredClone(templateEntry);
  const mode = entry.pricing_mode;

  if (mode === "image_tiered" || entry.modality_type === "image") {
    return applyOfficialToImagePriceEntry(
      templateEntry,
      officialModel,
      fxCnyPerUsd,
      aigcCtx,
    );
  }

  if (!officialModel?.tiers?.length) {
    return { entry, hasOfficial: false };
  }

  const currency = officialModel.currency ?? "USD";
  const tiers = officialModel.tiers;

  if (mode === "legacy") {
    let patched = false;
    for (const group of entry.price_groups ?? []) {
      if (!group.prices) continue;
      const offTier = resolveOfficialTier(
        tiers,
        legacyGroupLabel(group),
        0,
        tiers.length,
      );
      if (patchLegacyPrices(group.prices, offTier, currency, fxCnyPerUsd)) {
        patched = true;
      }
    }
    return { entry, hasOfficial: patched };
  }

  const inputG = entry.price_groups?.find(
    (g) => g.type === "token_kind" && g.token_kind === "input",
  );
  const rangeCount = Math.max(
    inputG?.ranges?.length ?? 0,
    tiers.length,
  );

  for (const group of entry.price_groups ?? []) {
    if (group.type !== "token_kind" || !group.ranges?.length) continue;
    const field = tokenKindToField(group.token_kind);
    if (!field) continue;

    group.ranges.forEach((range, i) => {
      const label =
        inputG?.ranges?.[i]?.range?.display_short ??
        inputG?.ranges?.[i]?.range?.display ??
        range.range?.display_short ??
        range.range?.display ??
        `档位${i + 1}`;
      const offTier = resolveOfficialTier(tiers, label, i, rangeCount);
      if (!offTier) return;
      const usd = toUsd(offTier[field], currency, fxCnyPerUsd);
      patchPriceObj(range.price, usd, group.token_kind);
    });
  }

  return { entry, hasOfficial: true };
}

export function assembleOfficialPricesDocument({
  templateData,
  officialData,
  vendorMap,
  fxCnyPerUsd = 6.5,
  tag = "0.65_prices_api_7_02",
  pricingPolicy = "official_vendor",
  preserveByModel = new Map(),
  generatedAt = new Date().toISOString(),
  modality = templateData.modality ?? "text",
  officialSourcePath = null,
  aigcDomByTrinity = null,
  aigcIntlByTrinity = null,
  aigcTrinityMap = {},
  tokenhubByTrinity = null,
}) {
  const officialByVendorId = new Map(
    (officialData.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  const data = [];
  const stats = {
    total: 0,
    pricedFromOfficial: 0,
    preserved: 0,
    noOfficial: 0,
    tierFromOfficial: 0,
    tierFromAigc: 0,
    tierFromTokenhub: 0,
    tierUnchanged: 0,
  };

  for (const templateEntry of templateData.data ?? []) {
    const id = templateEntry.model?.toLowerCase();
    stats.total++;

    if (preserveByModel.has(id)) {
      data.push(structuredClone(preserveByModel.get(id)));
      stats.preserved++;
      continue;
    }

    const vendorId =
      vendorMap[id]?.vendorModelId?.toLowerCase() ?? id;
    const officialModel = officialByVendorId.get(vendorId);
    const mapRef =
      aigcTrinityMap[id] ??
      aigcTrinityMap[templateEntry.model] ??
      null;
    const l2Ctx =
      modality === "image" &&
      (aigcDomByTrinity || aigcIntlByTrinity || tokenhubByTrinity)
        ? {
            intl: aigcIntlByTrinity?.get(id) ?? null,
            dom: aigcDomByTrinity?.get(id) ?? null,
            mapRef,
            tokenhub: tokenhubByTrinity?.get(id) ?? null,
          }
        : null;

    const result = applyOfficialToPriceEntry(
      templateEntry,
      officialModel,
      fxCnyPerUsd,
      l2Ctx,
    );
    const { entry, hasOfficial, tierStats } = result;
    if (hasOfficial) stats.pricedFromOfficial++;
    else stats.noOfficial++;
    if (tierStats) {
      stats.tierFromOfficial += tierStats.fromOfficial ?? 0;
      stats.tierFromAigc += tierStats.fromAigc ?? 0;
      stats.tierFromTokenhub += tierStats.fromTokenhub ?? 0;
      stats.tierUnchanged += tierStats.unchanged ?? 0;
    }
    data.push(entry);
  }

  const fxNote =
    modality === "image"
      ? `官方价优先；官方无档 → AIGC 国际 USD → AIGC 国内 CNY÷${fxCnyPerUsd} → TokenHub CNY÷${fxCnyPerUsd}；CNY 官方 ÷ ${fxCnyPerUsd}`
      : `厂商官方价 CNY ÷ ${fxCnyPerUsd} → USD；官方 USD 直用`;

  const document = {
    source: templateData.source ?? "trinity_prices_api",
    apiUrl: templateData.apiUrl ?? null,
    modality,
    fxCnyPerUsd,
    fxNote,
    fetchedAt: generatedAt,
    modelCount: data.length,
    object: templateData.object ?? "list",
    data,
  };

  const officialPath =
    officialSourcePath ??
    (modality === "image"
      ? "suppliers/official/output/image/vendor-pricing.json"
      : "suppliers/official/output/text/vendor-pricing.json");

  return {
    document,
    buildStats: {
      tag,
      pricingPolicy,
      modality,
      derivedFrom: {
        template: `online/prices-api.json (${modality})`,
        official: officialPath,
        aigc:
          modality === "image"
            ? "suppliers/aigc/output/pricing-api-image.json"
            : null,
        tokenhub:
          modality === "image"
            ? "suppliers/tokenhub/output/pricing-console-api.json"
            : null,
        officialFetchedAt: officialData.fetchedAt ?? null,
        templateFetchedAt: templateData.fetchedAt ?? null,
        archivePreserve:
          modality === "text" ? "0.65_prices_api_6_30.json (deepseek only)" : null,
      },
      generatedAt,
      pricedModelCount: stats.pricedFromOfficial,
      preservedModelCount: stats.preserved,
      noOfficialModelCount: stats.noOfficial,
      tierFromOfficial: stats.tierFromOfficial,
      tierFromAigc: stats.tierFromAigc,
      tierFromTokenhub: stats.tierFromTokenhub,
      tierUnchanged: stats.tierUnchanged,
      fallbackPolicy:
        modality === "image"
          ? "official_then_aigc_intl_then_aigc_dom_then_tokenhub"
          : null,
      preserveRules:
        modality === "text" ? ["deepseek* → 归档 6/30 稿"] : [],
    },
  };
}
