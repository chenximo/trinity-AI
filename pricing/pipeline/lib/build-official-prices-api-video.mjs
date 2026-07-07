/**
 * 生视频厂商官方价 → GET /v1/prices 同构 JSON（USD/秒 或 USD/百万 video tokens）
 */

import { parseNum } from "./pricing-compare.mjs";
import { tierToKey } from "./tier-key.mjs";
import { formatAmountUsd, cnyToUsd } from "./build-upstream-prices-api.mjs";
import {
  officialVideoTiersForCompare,
  aigcVideoPriceForAttribute,
  tokenhubVideoTiersForCompare,
  volcengineVideoPriceAtCompare,
  findCompareTierByKey,
  isVideoTokenOfficialUnit,
  isVideoOfficialUnitComparable,
} from "./video-pricing-validate-lib.mjs";
import {
  inferOfficialFeatureFromText,
  aigcAttributeMatchesOfficialFeature,
  tokenTierLabelToAigcAttribute,
} from "../../config/video-aigc-attributes.mjs";

function normalizeResLabel(label) {
  const t = String(label ?? "").trim();
  if (!t) return t;
  const low = t.toLowerCase();
  if (low === "720p") return "720P/768P";
  if (low === "1080p") return "1080P";
  if (low === "480p" || low === "540p") return "480P/540P";
  return t;
}

function videoResolutionGroupLabel(group) {
  return (
    group.conditions?.resolution ??
    group.conditions_summary ??
    group.label ??
    "标准价"
  );
}

function videoAudioAttribute(group) {
  const enabled = group.conditions?.audio_generation === "enabled";
  return enabled ? "有声" : "无声";
}

function formatDisplayVideoUsdPerSecond(amount) {
  const shown = Math.round(amount * 100) / 100;
  return `$${shown.toFixed(2)} / 秒`;
}

function formatDisplayVideoTokenUsd(amount) {
  const shown = Math.round(amount * 100) / 100;
  return `$${shown.toFixed(2)} / 百万 video tokens`;
}

function patchVideoUnitPrice(priceObj, usdAmount, priceUnit) {
  if (!priceObj?.unit || usdAmount == null) return false;
  priceObj.unit.amount = formatAmountUsd(usdAmount);
  priceObj.unit.currency = "USD";
  priceObj.unit.unit = priceUnit;
  if (priceUnit === "per_second") {
    priceObj.unit.display = formatDisplayVideoUsdPerSecond(usdAmount);
  } else if (priceUnit === "per_million_video_tokens") {
    priceObj.unit.display = formatDisplayVideoTokenUsd(usdAmount);
  }
  return true;
}

function toUsd(val, currency, fxCnyPerUsd) {
  if (val == null) return null;
  if (currency === "USD") return parseNum(val);
  return cnyToUsd(val, fxCnyPerUsd);
}

/** @param {object} offTier @param {string} modelCurrency @param {number} fxCnyPerUsd */
function officialTierToUsd(offTier, modelCurrency, fxCnyPerUsd) {
  if (!offTier) return null;
  const price = parseNum(offTier.price ?? offTier.rawPrice);
  if (price == null) return null;
  const unit = String(offTier.unit ?? "").trim();

  if (isVideoTokenOfficialUnit(unit)) {
    return toUsd(price, modelCurrency, fxCnyPerUsd);
  }
  if (isVideoOfficialUnitComparable(offTier)) {
    if (/美元\/秒|usd\/s/i.test(unit) || modelCurrency === "USD") {
      return price;
    }
    return price / fxCnyPerUsd;
  }
  return null;
}

/**
 * @param {object|null} off
 * @param {string} aigcAttribute
 * @param {{ tierKey: string, tierLabel: string }} resTier
 */
function matchOfficialResTier(off, aigcAttribute, resTier) {
  if (!off) return null;
  const tiers = officialVideoTiersForCompare(off);
  if (tiers.some((t) => isVideoTokenOfficialUnit(t))) return null;

  for (const t of tiers) {
    if (
      normalizeResLabel(t.tierLabel) !== normalizeResLabel(resTier.tierLabel) &&
      t.tierKey !== resTier.tierKey
    ) {
      continue;
    }
    const feature = inferOfficialFeatureFromText(t.note ?? t.tierLabel ?? "");
    if (!aigcAttributeMatchesOfficialFeature(aigcAttribute, feature)) continue;
    return t;
  }

  const byKey = findCompareTierByKey(tiers, resTier.tierKey);
  if (byKey) {
    const feature = inferOfficialFeatureFromText(byKey.note ?? byKey.tierLabel ?? "");
    if (aigcAttributeMatchesOfficialFeature(aigcAttribute, feature)) return byKey;
  }
  return null;
}

/** @param {object|null} off @param {string} aigcAttribute */
function matchOfficialTokenTier(off, aigcAttribute) {
  if (!off) return null;
  const tiers = officialVideoTiersForCompare(off).filter((t) =>
    isVideoTokenOfficialUnit(t.unit ?? t),
  );
  return (
    tiers.find((t) => {
      const fromLabel = tokenTierLabelToAigcAttribute(t.tierLabel);
      const fromName = t.tierName
        ? tokenTierLabelToAigcAttribute(t.tierName)
        : null;
      return (
        fromLabel === aigcAttribute ||
        (fromName != null && fromName === aigcAttribute)
      );
    }) ?? null
  );
}

/**
 * @param {{ intl?: object|null, dom?: object|null, mapRef?: object|null, tokenhub?: object|null, volcengine?: object|null }} l2Ctx
 */
function resolveAigcVideoUsd(l2Ctx, listingAttribute, tierKey) {
  if (!l2Ctx) return null;
  const { intl, dom, mapRef } = l2Ctx;

  if (intl) {
    const usd = aigcVideoPriceForAttribute(intl, listingAttribute, tierKey);
    if (usd != null) return { usd, source: "aigc_intl" };
  }
  if (dom) {
    const cny = aigcVideoPriceForAttribute(dom, listingAttribute, tierKey);
    if (cny != null) {
      const usd = cny / (l2Ctx.fxCnyPerUsd ?? 7.25);
      if (usd != null) return { usd, source: "aigc_dom" };
    }
  }
  return null;
}

function resolveL2VideoUsd(l2Ctx, listingAttribute, tierKey, tierLabel) {
  if (!l2Ctx) return null;

  const aigcHit = resolveAigcVideoUsd(l2Ctx, listingAttribute, tierKey);
  if (aigcHit) return aigcHit;

  const offTier = { tierKey, tierLabel };
  const th = l2Ctx.tokenhub;
  if (th) {
    const tiers = tokenhubVideoTiersForCompare(th);
    const hit = findCompareTierByKey(tiers, tierKey);
    const price = hit?.price ?? tiers[0]?.price ?? null;
    if (price != null) {
      const usd = price / (l2Ctx.fxCnyPerUsd ?? 7.25);
      return { usd, source: "tokenhub" };
    }
  }

  const vol = l2Ctx.volcengine;
  if (vol) {
    const price = volcengineVideoPriceAtCompare(vol, offTier);
    if (price != null) {
      const usd = price / (l2Ctx.fxCnyPerUsd ?? 7.25);
      return { usd, source: "volcengine" };
    }
  }

  return null;
}

function resolveVideoTierUsd(
  { listingAttribute, tierKey, tierLabel },
  officialModel,
  fxCnyPerUsd,
  l2Ctx,
) {
  const attr = listingAttribute ?? "标准价";
  const currency = officialModel?.currency ?? "CNY";

  const tokenOff = matchOfficialTokenTier(officialModel, attr);
  if (tokenOff) {
    const usd = officialTierToUsd(tokenOff, currency, fxCnyPerUsd);
    if (usd != null) return { usd, source: "official" };
  }

  const resOff = matchOfficialResTier(officialModel, attr, {
    tierKey,
    tierLabel,
  });
  if (resOff) {
    const usd = officialTierToUsd(resOff, currency, fxCnyPerUsd);
    if (usd != null) return { usd, source: "official" };
  }

  return resolveL2VideoUsd(l2Ctx, attr, tierKey, tierLabel);
}

/**
 * @param {object} templateEntry prices-api 单条（video_tiered）
 * @param {object|null} officialModel vendor-pricing.models[]
 * @param {number} fxCnyPerUsd
 * @param {{ listingAttribute?: string|null, l2Ctx?: object|null }} [ctx]
 */
export function applyOfficialToVideoPriceEntry(
  templateEntry,
  officialModel,
  fxCnyPerUsd,
  ctx = {},
) {
  const entry = structuredClone(templateEntry);
  const listingAttribute = ctx.listingAttribute ?? "标准价";
  const l2Ctx = ctx.l2Ctx
    ? { ...ctx.l2Ctx, fxCnyPerUsd }
    : { fxCnyPerUsd };

  const tierStats = {
    fromOfficial: 0,
    fromAigc: 0,
    fromTokenhub: 0,
    fromVolcengine: 0,
    unchanged: 0,
  };
  let patched = false;

  const resGroups = (entry.price_groups ?? []).filter(
    (g) => g.type === "resolution_tier" && g.prices?.unit,
  );
  const audioGroups = (entry.price_groups ?? []).filter(
    (g) => g.type === "has_audio" && g.prices?.unit,
  );
  const priceUnit = entry.price_unit ?? "per_second";

  if (resGroups.length) {
    const resCount = resGroups.length;
    for (const group of entry.price_groups ?? []) {
      if (group.type !== "resolution_tier" || !group.prices?.unit) continue;
      const label = videoResolutionGroupLabel(group);
      const idx = resGroups.indexOf(group);
      const wantKey = tierToKey(label, idx >= 0 ? idx : 0, resCount);
      const hit = resolveVideoTierUsd(
        { listingAttribute, tierKey: wantKey, tierLabel: label },
        officialModel,
        fxCnyPerUsd,
        l2Ctx,
      );
      if (hit?.usd == null) {
        tierStats.unchanged++;
        continue;
      }
      if (patchVideoUnitPrice(group.prices, hit.usd, priceUnit)) {
        patched = true;
        if (hit.source === "official") tierStats.fromOfficial++;
        else if (hit.source === "tokenhub") tierStats.fromTokenhub++;
        else if (hit.source === "volcengine") tierStats.fromVolcengine++;
        else tierStats.fromAigc++;
      } else {
        tierStats.unchanged++;
      }
    }
  }

  if (audioGroups.length) {
    for (const group of entry.price_groups ?? []) {
      if (group.type !== "has_audio" || !group.prices?.unit) continue;
      const attr = videoAudioAttribute(group);
      const enabled = group.conditions?.audio_generation === "enabled";
      const tierKey = enabled ? "audio:enabled" : "audio:disabled";
      const hit = resolveVideoTierUsd(
        { listingAttribute: attr, tierKey, tierLabel: attr },
        officialModel,
        fxCnyPerUsd,
        l2Ctx,
      );
      if (hit?.usd == null) {
        tierStats.unchanged++;
        continue;
      }
      const unit = entry.price_unit ?? "per_million_video_tokens";
      if (patchVideoUnitPrice(group.prices, hit.usd, unit)) {
        patched = true;
        if (hit.source === "official") tierStats.fromOfficial++;
        else if (hit.source === "tokenhub") tierStats.fromTokenhub++;
        else if (hit.source === "volcengine") tierStats.fromVolcengine++;
        else tierStats.fromAigc++;
      } else {
        tierStats.unchanged++;
      }
    }
  }

  if (patched) {
    entry.currency = "USD";
  }

  return { entry, hasOfficial: patched, tierStats };
}

export function assembleOfficialVideoPricesDocument({
  templateData,
  officialData,
  vendorMap,
  registryByOnlineSlug,
  fxCnyPerUsd = 7.25,
  tag = "official_prices_api_video",
  pricingPolicy = "official_vendor_video+l2_fallback",
  generatedAt = new Date().toISOString(),
  aigcDomByTrinity = null,
  aigcIntlByTrinity = null,
  aigcTrinityMap = {},
  tokenhubByTrinity = null,
  volcengineByTrinity = null,
}) {
  const officialByVendorId = new Map(
    (officialData.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  const data = [];
  const stats = {
    total: 0,
    pricedFromOfficial: 0,
    noOfficial: 0,
    tierFromOfficial: 0,
    tierFromAigc: 0,
    tierFromTokenhub: 0,
    tierFromVolcengine: 0,
    tierUnchanged: 0,
  };

  for (const templateEntry of templateData.data ?? []) {
    const slug = String(templateEntry.model).toLowerCase();
    stats.total++;

    const reg = registryByOnlineSlug?.get(slug) ?? null;
    const trinityId =
      reg?.trinityId?.toLowerCase() ??
      vendorMap[slug]?.vendorModelId?.toLowerCase() ??
      slug;
    const vendorId =
      reg?.vendorModelId?.toLowerCase() ??
      vendorMap[trinityId]?.vendorModelId?.toLowerCase() ??
      vendorMap[slug]?.vendorModelId?.toLowerCase() ??
      trinityId;
    const officialModel = officialByVendorId.get(vendorId) ?? null;

    const mapRef =
      aigcTrinityMap[trinityId] ??
      aigcTrinityMap[slug] ??
      reg?.aigc ??
      null;
    const listingAttribute =
      reg?.listingAttribute ??
      mapRef?.attribute ??
      "标准价";

    const l2Ctx = {
      intl: aigcIntlByTrinity?.get(trinityId) ?? null,
      dom: aigcDomByTrinity?.get(trinityId) ?? null,
      mapRef,
      tokenhub: tokenhubByTrinity?.get(trinityId) ?? null,
      volcengine:
        volcengineByTrinity?.get(trinityId) ??
        volcengineByTrinity?.get(reg?.volcengineId?.toLowerCase() ?? "") ??
        null,
      fxCnyPerUsd,
    };

    const { entry, hasOfficial, tierStats } = applyOfficialToVideoPriceEntry(
      templateEntry,
      officialModel,
      fxCnyPerUsd,
      { listingAttribute, l2Ctx },
    );

    if (hasOfficial) stats.pricedFromOfficial++;
    else stats.noOfficial++;
    if (tierStats) {
      stats.tierFromOfficial += tierStats.fromOfficial ?? 0;
      stats.tierFromAigc += tierStats.fromAigc ?? 0;
      stats.tierFromTokenhub += tierStats.fromTokenhub ?? 0;
      stats.tierFromVolcengine += tierStats.fromVolcengine ?? 0;
      stats.tierUnchanged += tierStats.unchanged ?? 0;
    }
    data.push(entry);
  }

  const document = {
    source: templateData.source ?? "trinity_prices_api",
    apiUrl: templateData.apiUrl ?? null,
    modality: "video",
    fxCnyPerUsd,
    fxNote: `官方价优先（listingAttribute 对齐）；官方无档 → AIGC 国际 USD → AIGC 国内 CNY÷${fxCnyPerUsd} → TokenHub → 火山；CNY 官方 ÷ ${fxCnyPerUsd}`,
    fetchedAt: generatedAt,
    modelCount: data.length,
    object: templateData.object ?? "list",
    data,
  };

  return {
    document,
    buildStats: {
      tag,
      pricingPolicy,
      modality: "video",
      derivedFrom: {
        template: "online/prices-api.json (video)",
        official: "suppliers/official/output/video/vendor-pricing.json",
        aigc: "suppliers/aigc/output/pricing-api-video.json",
        tokenhub: "suppliers/tokenhub/output/pricing-console-api.json",
        volcengine: "suppliers/volcengine/output/video/pricing-api.json",
        registry: "config/video-model-registry.mjs",
        officialFetchedAt: officialData.fetchedAt ?? null,
        templateFetchedAt: templateData.fetchedAt ?? null,
      },
      generatedAt,
      pricedModelCount: stats.pricedFromOfficial,
      noOfficialModelCount: stats.noOfficial,
      tierFromOfficial: stats.tierFromOfficial,
      tierFromAigc: stats.tierFromAigc,
      tierFromTokenhub: stats.tierFromTokenhub,
      tierFromVolcengine: stats.tierFromVolcengine,
      tierUnchanged: stats.tierUnchanged,
      fallbackPolicy:
        "official_then_aigc_intl_then_aigc_dom_then_tokenhub_then_volcengine",
    },
  };
}
