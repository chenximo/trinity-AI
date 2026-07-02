/**
 * 火山方舟价目表 → TokenHub 对齐扁平结构
 */

import { PRICING_SHEET } from "../data/pricing-sheet.mjs";

function tierFromRow(attribute, row) {
  if (!row) return null;
  const { input, output, cache } = row;
  if (input == null && output == null && cache == null) return null;
  return {
    tierType: attribute === "标准价" ? "Uniform" : "Tiered",
    tierName: attribute,
    input: input ?? null,
    output: output ?? null,
    cache: cache ?? null,
    unit: "百万tokens",
    chargeUnit: "TOKEN",
  };
}

/**
 * @param {typeof PRICING_SHEET} sheet
 * @param {Record<string, { vendorModelId: string }>} trinityMap
 */
export function normalizeVolcenginePricing(sheet, trinityMap = {}) {
  const models = [];

  for (const entry of sheet) {
    const trinityId =
      entry.trinityId ??
      trinityMap[entry.vendorModelId]?.trinityId ??
      trinityMap[entry.vendorModelId.toLowerCase()]?.trinityId ??
      null;

    const tiers = [];
    for (const row of entry.tiers) {
      const tier = tierFromRow(row.attribute, row);
      if (tier) tiers.push(tier);
    }
    if (!tiers.length) continue;

    models.push({
      modelId: entry.vendorModelId,
      trinityId,
      upstreamModelId: entry.vendorModelId,
      vendorCode: "Doubao",
      vendorName: "豆包",
      modelName: entry.modelName,
      displayName: `豆包 ${entry.modelName}`,
      brand: "火山方舟",
      modelType: "Text",
      currency: "CNY",
      priceUnit: "元/百万tokens",
      region: "中国内地",
      tiers,
    });
  }

  return models;
}

/** @param {ReturnType<typeof normalizeVolcenginePricing>} models */
export function indexVolcengineByTrinity(models) {
  const byTrinity = new Map();
  for (const m of models) {
    if (!m.trinityId) continue;
    byTrinity.set(m.trinityId.toLowerCase(), m);
  }
  return byTrinity;
}

export function pickVolcengineModels(models) {
  return models.filter((m) => m.modelType === "Text");
}
