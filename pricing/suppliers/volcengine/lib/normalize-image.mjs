import { cleanCell } from "./scrape-doc.mjs";
import { IMAGE_BILLING_CONTEXT } from "./constants.mjs";

const MODEL_ID_RE = /^doubao-[a-z0-9][a-z0-9.-]*/i;

/**
 * @param {string} raw
 */
function parsePrice(raw) {
  const s = cleanCell(raw);
  if (!s || s === "-") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {import('./scrape-doc.mjs').scrapeVolcengineDoc extends (...args: any) => Promise<infer R> ? R : never} raw
 */
export function normalizeImageFromRaw(raw) {
  /** @type {Array<{ vendorModelId: string, modelName: string, price: number }>} */
  const models = [];

  for (const table of raw.tables ?? []) {
    if (table.billingContext !== IMAGE_BILLING_CONTEXT) continue;
    const h = table.headers.join(" ");
    if (!/模型名称/.test(h) || !/张/.test(h)) continue;

    for (const row of table.rows) {
      const id = row[0]?.match(MODEL_ID_RE)?.[0];
      const price = parsePrice(row[1]);
      if (!id || price == null) continue;
      models.push({
        vendorModelId: id,
        modelName: id.replace(/^doubao-/, "Doubao-"),
        price,
      });
    }
  }

  return models;
}

/**
 * @param {ReturnType<typeof normalizeImageFromRaw>} sheet
 * @param {Record<string, { trinityId?: string }>} trinityMap
 */
export function buildImageApiModels(sheet, trinityMap = {}) {
  return sheet.map((entry) => {
    const trinityId =
      trinityMap[entry.vendorModelId]?.trinityId ??
      trinityMap[entry.vendorModelId.toLowerCase()]?.trinityId ??
      null;

    return {
      modality: "image",
      modelId: entry.vendorModelId,
      trinityId,
      upstreamModelId: entry.vendorModelId,
      vendorCode: "Doubao",
      vendorName: "豆包",
      modelName: entry.modelName,
      displayName: `豆包 ${entry.modelName}`,
      brand: "火山方舟",
      modelType: "Image",
      currency: "CNY",
      priceUnit: "元/张",
      region: "中国内地",
      billingMode: IMAGE_BILLING_CONTEXT,
      tiers: [
        {
          tierType: "Uniform",
          tierName: "输出",
          price: entry.price,
          unit: "元/张",
          chargeUnit: "IMAGE",
        },
      ],
    };
  });
}
