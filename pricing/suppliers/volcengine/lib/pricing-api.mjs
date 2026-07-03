/**
 * 火山方舟价目表 → TokenHub 对齐扁平结构
 */

import {
  buildTextApiModels,
  normalizeTextFromRaw,
} from "./normalize-text.mjs";

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
 * @param {Array<{ vendorModelId: string, modelName: string, tiers: Array<{ attribute: string, input?: number|null, output?: number|null, cache?: number|null }> }>} sheet
 * @param {Record<string, { vendorModelId: string, trinityId?: string }>} trinityMap
 */
export function normalizeVolcenginePricing(sheet, trinityMap = {}) {
  return buildTextApiModels(sheet, trinityMap);
}

/**
 * @param {import('./build-from-raw.mjs').buildModalitiesFromRaw extends (raw: infer R, ...args: unknown[]) => unknown ? R : never} raw
 * @param {Record<string, { trinityId?: string }>} trinityMap
 */
export function normalizeVolcengineFromRaw(raw, trinityMap = {}) {
  return normalizeTextFromRaw(raw);
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
  return models.filter((m) => (m.modality ?? "text") === "text");
}

export { tierFromRow };
