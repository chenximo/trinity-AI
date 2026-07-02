/**
 * AIGC 价目表 → TokenHub 对齐扁平结构
 */

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function priceItems(block, unit) {
  if (!block) return [];
  const items = [];
  const push = (name, displayName, price) => {
    if (price == null || price === "") return;
    items.push({ name, displayName, price: String(price), unit });
  };
  push("Input", "输入", block.input);
  push("Cache", "缓存命中", block.cache ?? block.cacheHit);
  push("CacheWrite5m", "5m缓存写入", block.cacheWrite5m);
  push("CacheWrite1h", "1h缓存写入", block.cacheWrite1h);
  push("Output", "输出", block.output);
  return items;
}

function tierFromBlock(attribute, block, unit) {
  if (!block) return null;
  const input = block.input ?? null;
  const output = block.output ?? null;
  const cache = block.cache ?? block.cacheHit ?? null;
  if (input == null && output == null && cache == null) return null;
  return {
    tierType: attribute === "统一价" ? "Uniform" : "Tiered",
    tierName: attribute,
    input,
    output,
    cache,
    unit: "百万tokens",
    chargeUnit: "TOKEN",
    items: priceItems(block, unit),
  };
}

function modelIdFor(entry, site) {
  if (entry.trinityId) return entry.trinityId;
  const base = `${entry.vendorCode}-${entry.modelName}`;
  return slugify(`aigc-${base}-${site}`);
}

/**
 * @param {import("../data/pricing-sheet.mjs").SheetModel[]} sheet
 * @param {Record<string, { vendorCode: string, modelName: string }>} trinityMap
 */
export function normalizeAigcPricing(sheet, trinityMap = {}) {
  const reverseMap = new Map();
  for (const [tid, ref] of Object.entries(trinityMap)) {
    reverseMap.set(`${ref.vendorCode}::${ref.modelName}`, tid);
  }

  const models = [];

  for (const entry of sheet) {
    const trinityId =
      entry.trinityId ??
      reverseMap.get(`${entry.vendorCode}::${entry.modelName}`) ??
      null;

    for (const site of ["domestic", "international"]) {
      const tiers = [];
      for (const row of entry.tiers) {
        const block = site === "domestic" ? row.domestic : row.international;
        const tier = tierFromBlock(
          row.attribute,
          block,
          site === "domestic" ? "元/百万tokens" : "美元/百万tokens",
        );
        if (tier) tiers.push(tier);
      }
      if (!tiers.length) continue;

      const currency = site === "domestic" ? "CNY" : "USD";
      const priceUnit =
        site === "domestic" ? "元/百万tokens" : "美元/百万tokens";
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
        modelType: "Text",
        site,
        siteLabel,
        currency,
        priceUnit,
        table: entry.table ?? "main",
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

/** @param {ReturnType<typeof normalizeAigcPricing>} models */
export function indexAigcByTrinity(models) {
  const domestic = new Map();
  const international = new Map();
  for (const m of models) {
    const key = (m.trinityId ?? m.modelId).toLowerCase();
    if (m.site === "domestic") domestic.set(key, m);
    else international.set(key, m);
  }
  return { domestic, international };
}

export function pickAigcModels(models, site) {
  return models.filter((m) => m.site === site);
}
