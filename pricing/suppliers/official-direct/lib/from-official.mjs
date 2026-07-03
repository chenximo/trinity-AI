/**
 * 原厂直连渠道 — 从 official 生文价目筛选/复制（共享逻辑）
 */

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
 * @param {object[]} officialModels
 * @param {Record<string, object>} officialTrinityMap
 * @param {import('../channels/types.mjs').OfficialDirectMeta} meta
 */
export function normalizeFromOfficial(officialModels, officialTrinityMap, meta) {
  const vendorIndex = buildTrinityVendorIndex(officialTrinityMap);
  const allow = meta.vendors;
  const allowSet = Array.isArray(allow) && allow.length ? new Set(allow) : null;
  const models = [];

  for (const m of officialModels ?? []) {
    if (allowSet && !allowSet.has(m.vendor)) continue;
    const vid = m.vendorModelId?.toLowerCase();
    if (!vid) continue;

    const tiers = (m.tiers ?? []).map(tierFromOfficial).filter(Boolean);
    if (!tiers.length) continue;

    const currency = meta.mixedCurrency
      ? (m.currency ?? "USD")
      : (m.currency ?? (meta.currency === "MIXED" ? "USD" : meta.currency) ?? "USD");
    const priceUnit =
      currency === "CNY" ? "元/百万tokens" : "美元/百万tokens";

    models.push({
      modelId: m.vendorModelId,
      trinityId: vendorIndex.get(vid) ?? null,
      upstreamModelId: m.vendorModelId,
      vendor: m.vendor,
      vendorLabel: m.vendorLabel,
      modelName: m.vendorModelId,
      displayName: `${m.vendorLabel ?? m.vendor} ${m.vendorModelId}`,
      brand: meta.brand,
      modelType: "Text",
      currency,
      priceUnit,
      region: meta.region ?? "原厂直连",
      tiers,
    });
  }

  return models.sort(
    (a, b) =>
      String(a.vendor).localeCompare(String(b.vendor)) ||
      String(a.modelId).localeCompare(String(b.modelId)),
  );
}

/** @param {ReturnType<typeof normalizeFromOfficial>} models */
export function indexByTrinity(models) {
  const byTrinity = new Map();
  for (const m of models) {
    if (!m.trinityId) continue;
    byTrinity.set(m.trinityId.toLowerCase(), m);
  }
  return byTrinity;
}
