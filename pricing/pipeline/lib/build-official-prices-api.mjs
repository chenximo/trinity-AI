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
) {
  const entry = structuredClone(templateEntry);
  if (!officialModel?.tiers?.length) {
    return { entry, hasOfficial: false };
  }

  const currency = officialModel.currency ?? "USD";
  const tiers = officialModel.tiers;
  const mode = entry.pricing_mode;

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
    const { entry, hasOfficial } = applyOfficialToPriceEntry(
      templateEntry,
      officialModel,
      fxCnyPerUsd,
    );
    if (hasOfficial) stats.pricedFromOfficial++;
    else stats.noOfficial++;
    data.push(entry);
  }

  const document = {
    source: templateData.source ?? "trinity_prices_api",
    apiUrl: templateData.apiUrl ?? null,
    modality: templateData.modality ?? "text",
    fxCnyPerUsd,
    fxNote: `厂商官方价 CNY ÷ ${fxCnyPerUsd} → USD；官方 USD 直用`,
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
      derivedFrom: {
        template: "online/prices-api.json",
        official: "suppliers/official/output/text/vendor-pricing.json",
        officialFetchedAt: officialData.fetchedAt ?? null,
        templateFetchedAt: templateData.fetchedAt ?? null,
        archivePreserve: "0.65_prices_api_6_30.json (deepseek only)",
      },
      generatedAt,
      pricedModelCount: stats.pricedFromOfficial,
      preservedModelCount: stats.preserved,
      noOfficialModelCount: stats.noOfficial,
      preserveRules: ["deepseek* → 归档 6/30 稿"],
    },
  };
}
