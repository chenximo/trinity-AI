/**
 * AIGC 生图价目表 → TokenHub 对齐扁平结构
 */

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolutionItems(block, unit) {
  if (!block) return [];
  return Object.entries(block).map(([label, price]) => ({
    name: label,
    displayName: label,
    price: String(price),
    unit,
  }));
}

function tierFromResolutionBlock(attribute, block, unit) {
  if (!block || !Object.keys(block).length) return null;
  return {
    tierType: attribute === "标准价" ? "Uniform" : "Tiered",
    tierName: attribute,
    resolutions: block,
    unit,
    chargeUnit: "IMAGE",
    items: resolutionItems(block, unit),
  };
}

function modelIdFor(entry, site) {
  if (entry.trinityId) return entry.trinityId;
  const base = `${entry.vendorCode}-${entry.modelName}`;
  return slugify(`aigc-${base}-${site}`);
}

/**
 * @param {import("../data/pricing-sheet-image.mjs").SheetModel[]} sheet
 * @param {Record<string, { vendorCode: string, modelName: string, attribute?: string }>} trinityMap
 */
export function normalizeAigcImagePricing(sheet, trinityMap = {}) {
  const reverseMap = new Map();
  for (const [tid, ref] of Object.entries(trinityMap)) {
    const attr = ref.attribute ?? "标准价";
    reverseMap.set(`${ref.vendorCode}::${ref.modelName}::${attr}`, tid);
    if (!reverseMap.has(`${ref.vendorCode}::${ref.modelName}`)) {
      reverseMap.set(`${ref.vendorCode}::${ref.modelName}`, tid);
    }
  }

  const models = [];

  for (const entry of sheet) {
    for (const site of ["domestic", "international"]) {
      const tiers = [];
      for (const row of entry.tiers) {
        const block = site === "domestic" ? row.domestic : row.international;
        const tier = tierFromResolutionBlock(
          row.attribute,
          block,
          site === "domestic" ? "元/张" : "美元/张",
        );
        if (tier) tiers.push(tier);
      }
      if (!tiers.length) continue;

      const attrKey = entry.tiers[0]?.attribute ?? "标准价";
      const trinityId =
        entry.trinityId ??
        reverseMap.get(`${entry.vendorCode}::${entry.modelName}::${attrKey}`) ??
        reverseMap.get(`${entry.vendorCode}::${entry.modelName}`) ??
        null;

      const currency = site === "domestic" ? "CNY" : "USD";
      const priceUnit = site === "domestic" ? "元/张" : "美元/张";
      const siteLabel = site === "domestic" ? "国内站" : "国际站";

      models.push({
        modelId: modelIdFor({ ...entry, trinityId }, site),
        trinityId,
        upstreamModelId: entry.modelName,
        vendorCode: entry.vendorCode,
        vendorName: entry.vendorName,
        modelName: entry.modelName,
        displayName: `${entry.vendorName} ${entry.modelName}`,
        brand: entry.vendorName,
        modelType: "Image",
        site,
        siteLabel,
        currency,
        priceUnit,
        modality: "image",
        region: site === "domestic" ? "中国内地" : "国际",
        regions: [
          {
            Site: site,
            Regions: [site === "domestic" ? "中国内地" : "国际"],
          },
        ],
        tiers,
      });
    }
  }

  return models;
}

/** @param {ReturnType<typeof normalizeAigcImagePricing>} models @param {Record<string, { vendorCode: string, modelName: string, attribute?: string }>} [trinityMap] */
export function indexAigcImageByTrinity(models, trinityMap = {}) {
  const domestic = new Map();
  const international = new Map();

  for (const [tid, ref] of Object.entries(trinityMap)) {
    if (tid.startsWith("_")) continue;
    const key = tid.toLowerCase();
    const dom = models.find(
      (m) =>
        m.site === "domestic" &&
        m.vendorCode === ref.vendorCode &&
        m.modelName === ref.modelName,
    );
    const intl = models.find(
      (m) =>
        m.site === "international" &&
        m.vendorCode === ref.vendorCode &&
        m.modelName === ref.modelName,
    );
    if (dom) domestic.set(key, { ...dom, _mapRef: ref });
    if (intl) international.set(key, { ...intl, _mapRef: ref });
  }

  for (const m of models) {
    if (!m.trinityId) continue;
    const key = m.trinityId.toLowerCase();
    if (m.site === "domestic" && !domestic.has(key)) domestic.set(key, m);
    if (m.site === "international" && !international.has(key)) international.set(key, m);
  }
  return { domestic, international };
}

/** @param {object|null} aigcModel @param {string} resolutionLabel */
export function aigcImagePriceAt(aigcModel, resolutionLabel) {
  if (!aigcModel?.tiers?.length) return null;
  for (const tier of aigcModel.tiers) {
    const hit = tier.resolutions?.[resolutionLabel];
    if (hit != null) return Number(hit);
  }
  return null;
}
