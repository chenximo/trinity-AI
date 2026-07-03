/**
 * 网聚云联 · 云门户 — 从 official 生文价目筛选 GPT / Gemini
 */

import { SUPPLIER_META } from "../data/config.mjs";

function tierFromOfficial(tier) {
  const input = tier.input ?? null;
  const output = tier.output ?? null;
  const cache = tier.cache ?? null;
  if (input == null && output == null && cache == null) return null;
  const label = tier.tierLabel ?? tier.tierName ?? "标准价";
  return {
    tierType: /^统一|标准/i.test(label) || label === "标准价" ? "Uniform" : "Tiered",
    tierName: label,
    input,
    output,
    cache,
    unit: "百万tokens",
    chargeUnit: "TOKEN",
  };
}

/** vendorModelId → trinityId（来自 official/trinity-map.json） */
export function buildTrinityVendorIndex(officialTrinityMap) {
  const byVendorModel = new Map();
  for (const [tid, meta] of Object.entries(officialTrinityMap ?? {})) {
    if (tid.startsWith("_")) continue;
    if ((meta.modality ?? "text") !== "text") continue;
    const vid = (meta.vendorModelId ?? tid).toLowerCase();
    if (!byVendorModel.has(vid)) byVendorModel.set(vid, tid);
  }
  return byVendorModel;
}

/**
 * @param {object[]} officialModels vendor-pricing.json models[]
 * @param {Record<string, object>} officialTrinityMap
 */
export function normalizeWangjuFromOfficial(officialModels, officialTrinityMap) {
  const vendorIndex = buildTrinityVendorIndex(officialTrinityMap);
  const allow = new Set(SUPPLIER_META.vendors);
  const models = [];

  for (const m of officialModels ?? []) {
    if (!allow.has(m.vendor)) continue;
    const vid = m.vendorModelId?.toLowerCase();
    if (!vid) continue;

    const tiers = (m.tiers ?? []).map(tierFromOfficial).filter(Boolean);
    if (!tiers.length) continue;

    models.push({
      modelId: m.vendorModelId,
      trinityId: vendorIndex.get(vid) ?? null,
      upstreamModelId: m.vendorModelId,
      vendor: m.vendor,
      vendorLabel: m.vendorLabel,
      modelName: m.vendorModelId,
      displayName: `${m.vendorLabel ?? m.vendor} ${m.vendorModelId}`,
      brand: SUPPLIER_META.brand,
      modelType: "Text",
      currency: m.currency ?? SUPPLIER_META.currency,
      priceUnit: SUPPLIER_META.priceUnit,
      region: SUPPLIER_META.region,
      tiers,
    });
  }

  return models.sort((a, b) =>
    String(a.vendor).localeCompare(String(b.vendor)) ||
    String(a.modelId).localeCompare(String(b.modelId)),
  );
}

/** @param {ReturnType<typeof normalizeWangjuFromOfficial>} models */
export function indexWangjuByTrinity(models) {
  const byTrinity = new Map();
  for (const m of models) {
    if (!m.trinityId) continue;
    byTrinity.set(m.trinityId.toLowerCase(), m);
  }
  return byTrinity;
}
