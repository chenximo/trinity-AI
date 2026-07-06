/**
 * 百炼官方价目 → 与 TokenHub 对齐的扁平结构
 * Context Cache：按模型 resolved ratio（见 cache-policy.mjs）
 */

import {
  BAILIAN_DEFAULT_CACHE_RATIO,
  BAILIAN_CACHE_DOC_URL,
  bailianCachePolicySummary,
  calcBailianCachePrice,
  resolveBailianCachePolicy,
} from "./cache-policy.mjs";

export const PRICING_API_OUT = "pricing-api.json";
export const PRICING_RAW_OUT = "bailian-pricing.json";

/** @deprecated 使用 BAILIAN_DEFAULT_CACHE_RATIO */
export const IMPLICIT_CACHE_HIT_RATIO = BAILIAN_DEFAULT_CACHE_RATIO;

const MODEL_ID_RE = /^([a-zA-Z][a-zA-Z0-9._-]*)/;
const TIER_RE = /Token\s*[≤<≥>]|[≤<≥>]\s*\d|[\d.]+[KkMm]?\s*<\s*Token/i;

export function isTierLabel(text) {
  if (!text) return false;
  return TIER_RE.test(String(text).trim());
}

export function parseYuanAmount(text) {
  if (text == null || text === "") return null;
  const s = String(text).trim();
  const range = s.match(/([\d.]+)\s*[~～\-—]\s*([\d.]+)\s*元/);
  if (range) return { value: range[2], raw: s, isRange: true };
  const single = s.match(/([\d.]+)\s*元/);
  if (single) return { value: single[1], raw: s, isRange: false };
  return null;
}

export function extractModelId(cell) {
  return parseBailianModelRef(cell).modelId;
}

/** @param {string|null|undefined} cell */
export function parseBailianModelRef(cell) {
  if (!cell || isTierLabel(cell)) return { modelId: null, vendorPrefix: null };
  let first = String(cell).trim().split(/\s+/)[0];
  let vendorPrefix = null;
  if (first.includes("/")) {
    const parts = first.split("/");
    vendorPrefix = parts[0]?.toLowerCase() ?? null;
    first = parts.pop() ?? first;
  }
  const m = first.match(MODEL_ID_RE);
  return {
    modelId: m?.[1]?.toLowerCase() ?? null,
    vendorPrefix,
  };
}

export function extractModelNotes(cell) {
  const s = String(cell ?? "");
  return {
    supportsCache: /上下文缓存享有折扣/.test(s),
    supportsBatch: /Batch调用半价/.test(s),
    equivalenceNote: s.match(/当前能力等同于\s*(\S+)/)?.[1] ?? null,
    rawNotes: s
      .replace(MODEL_ID_RE, "")
      .replace(/当前能力等同于\s*\S+/g, "")
      .replace(/Batch调用半价/g, "")
      .replace(/上下文缓存享有折扣/g, "")
      .trim(),
  };
}

export function findColumnKey(row, pattern) {
  return Object.keys(row).find((k) => pattern.test(k));
}

export function getCell(row, pattern) {
  const key = findColumnKey(row, pattern);
  return key ? (row[key] ?? "").trim() : "";
}

export function inferSectionMeta(section) {
  const s = section ?? "";
  if (/图像|万相|图片/i.test(s)) return { family: "图像生成", modelType: "Vision" };
  if (/视频/i.test(s)) return { family: "视频生成", modelType: "Vision" };
  if (/语音|CosyVoice/i.test(s)) return { family: "语音", modelType: "Audio" };
  if (/千问|Qwen|QwQ|文本生成/i.test(s)) return { family: "千问", modelType: "Text" };
  if (/DeepSeek/i.test(s)) return { family: "DeepSeek", modelType: "Text" };
  if (/GLM|智谱/i.test(s)) return { family: "智谱", modelType: "Text" };
  if (/多模态|VL|视觉理解|Omni/i.test(s)) return { family: "多模态", modelType: "Multimodal" };
  return { family: s.split("-")[0] || "其他", modelType: "Text" };
}

export function calcImplicitCachePrice(inputPrice, ratio = BAILIAN_DEFAULT_CACHE_RATIO) {
  return calcBailianCachePrice(inputPrice, ratio);
}

export function buildTierItems({ input, output, cache, inputUnit, outputUnit, cacheUnit }) {
  const items = [];
  if (input != null) {
    items.push({
      name: "Input",
      displayName: "输入",
      price: input,
      unit: inputUnit ?? "元/百万tokens",
    });
  }
  if (cache != null) {
    items.push({
      name: "Cache",
      displayName: "缓存命中（隐式）",
      price: cache,
      unit: cacheUnit ?? "元/百万tokens",
    });
  }
  if (output != null) {
    items.push({
      name: "Output",
      displayName: "输出",
      price: output,
      unit: outputUnit ?? "元/百万tokens",
    });
  }
  return items;
}

function parsePricingRow(row, ctx) {
  const modelCell = getCell(row, /模型\s*ID/i);
  const regionCell = getCell(row, /服务部署范围/);
  const modeCell = getCell(row, /模式/);
  const tierCell = getCell(row, /单次请求|Token范围|Token数/);
  const inputCell = getCell(row, /输入单价/);
  const outputCell = getCell(row, /输出单价/);
  const freeCell = getCell(row, /免费额度/);

  let inputParsed = parseYuanAmount(inputCell);
  let outputParsed = parseYuanAmount(outputCell);
  let tierName = tierCell || "统一价";
  let modelId = extractModelId(modelCell);
  let vendorPrefix = parseBailianModelRef(modelCell).vendorPrefix;
  let region = regionCell;
  let mode = modeCell;
  let notes = extractModelNotes(modelCell);

  // 多阶梯续行：首列是档位，价格在后续列错位
  if (!inputParsed && modelCell && isTierLabel(modelCell)) {
    tierName = modelCell;
    inputParsed = parseYuanAmount(regionCell);
    outputParsed = parseYuanAmount(modeCell);
    modelId = ctx.modelId;
    region = ctx.region;
    mode = ctx.mode;
  }

  if (modelId) {
    ctx.modelId = modelId;
    ctx.region = region || ctx.region;
    ctx.mode = mode || ctx.mode;
    ctx.supportsCache = notes.supportsCache || ctx.supportsCache;
    ctx.supportsBatch = notes.supportsBatch || ctx.supportsBatch;
    ctx.equivalenceNote = notes.equivalenceNote || ctx.equivalenceNote;
    ctx.vendorPrefix = vendorPrefix || ctx.vendorPrefix;
    ctx.modelCell = modelCell;
  }

  if (!ctx.modelId) return null;

  // 仅输出价（图像等）
  if (!inputParsed && outputParsed && !inputCell) {
    outputParsed = parseYuanAmount(getCell(row, /输出单价/)) ?? outputParsed;
  }

  const input = inputParsed?.value ?? null;
  const output = outputParsed?.value ?? null;
  if (input == null && output == null) return null;

  const isPerImage = /张|幅/i.test(outputCell) || /张|幅/i.test(inputCell);
  const tokenUnit = "百万tokens";
  const inputUnit = isPerImage ? null : "元/百万tokens";
  const outputUnit = isPerImage
    ? (outputCell.match(/元\/\S+/)?.[0] ?? "元/张")
    : "元/百万tokens";

  const supportsCacheFromDoc = ctx.supportsCache && !isPerImage;
  const cachePolicy = resolveBailianCachePolicy(ctx.modelId, {
    supportsCacheFromDoc,
    section: ctx.section,
    vendorPrefix: ctx.vendorPrefix,
  });
  const supportsCache =
    cachePolicy.mode === "implicit" || cachePolicy.mode === "console";
  const cache =
    cachePolicy.mode === "implicit" && input != null
      ? calcBailianCachePrice(input, cachePolicy.ratio)
      : null;

  return {
    modelId: ctx.modelId,
    region: ctx.region || region || null,
    mode: ctx.mode || mode || null,
    tierName,
    input,
    output,
    cache,
    inputRaw: inputParsed?.raw ?? null,
    outputRaw: outputParsed?.raw ?? null,
    freeQuota: freeCell || null,
    supportsCache,
    supportsBatch: ctx.supportsBatch,
    equivalenceNote: ctx.equivalenceNote,
    cachePolicyMode: cachePolicy.mode,
    cacheRatio: cachePolicy.ratio,
    cacheRatioLabel: cachePolicy.ratioLabel,
    chargeUnit: isPerImage ? "IMAGE" : "TOKEN",
    unit: isPerImage ? outputUnit : tokenUnit,
    items: buildTierItems({
      input,
      output,
      cache,
      inputUnit,
      outputUnit,
      cacheUnit: inputUnit,
    }),
  };
}

function isPricingTable(table) {
  const headers = table.headers ?? [];
  return headers.some((h) => /输入单价|输出单价/i.test(h));
}

export function parsePricingTables(tables) {
  const tierRows = [];
  const skipped = [];

  for (const table of tables) {
    if (!isPricingTable(table)) continue;
    const section = table.section ?? "";
    const { family, modelType } = inferSectionMeta(section);
    const ctx = {
      modelId: null,
      region: null,
      mode: null,
      section,
      supportsCache: false,
      supportsBatch: false,
      equivalenceNote: null,
      vendorPrefix: null,
      modelCell: null,
    };

    for (const row of table.rows ?? []) {
      const parsed = parsePricingRow(row, ctx);
      if (!parsed) continue;
      tierRows.push({
        ...parsed,
        section,
        family,
        modelType,
      });
    }
  }

  return { tierRows, skipped };
}

export function groupTierRows(tierRows) {
  const models = new Map();

  for (const row of tierRows) {
    const key = [row.modelId, row.region ?? "", row.mode ?? "", row.section ?? ""].join(
      "\0",
    );
    if (!models.has(key)) {
      models.set(key, {
        modelId: row.modelId,
        modelName: row.modelId,
        displayName: row.modelId,
        brand: row.family,
        modelType: row.modelType,
        status: "online",
        region: row.region,
        mode: row.mode,
        section: row.section,
        supportsCache: row.supportsCache,
        supportsBatch: row.supportsBatch,
        cachePolicy: row.cachePolicyMode === "implicit" ? "implicit" : row.cachePolicyMode === "console" ? "console" : null,
        cacheRatio: row.cacheRatio ?? null,
        cacheRatioLabel: row.cacheRatioLabel ?? null,
        equivalenceNote: row.equivalenceNote ?? null,
        freeQuota: row.freeQuota ?? null,
        tags: [],
        capability: null,
        description: null,
        inputOutputTypes: null,
        limits: null,
        tiers: [],
      });
    }
    const m = models.get(key);
    m.supportsCache = m.supportsCache || row.supportsCache;
    m.supportsBatch = m.supportsBatch || row.supportsBatch;
    if (row.cachePolicyMode === "implicit") {
      m.cachePolicy = "implicit";
      m.cacheRatio = row.cacheRatio ?? m.cacheRatio;
      m.cacheRatioLabel = row.cacheRatioLabel ?? m.cacheRatioLabel;
    } else if (row.cachePolicyMode === "console" && !m.cachePolicy) {
      m.cachePolicy = "console";
    }
    if (row.freeQuota) m.freeQuota = row.freeQuota;
    if (row.equivalenceNote) m.equivalenceNote = row.equivalenceNote;

    m.tiers.push({
      tierType: row.tierName === "统一价" ? "Uniform" : "Tiered",
      tierName: row.tierName,
      input: row.input,
      output: row.output,
      cache: row.cache,
      unit: row.unit,
      chargeUnit: row.chargeUnit,
      inputRaw: row.inputRaw,
      outputRaw: row.outputRaw,
      cacheSource:
        row.cachePolicyMode === "implicit" && row.cacheRatioLabel
          ? `implicit_${row.cacheRatioLabel}`
          : row.cachePolicyMode === "console"
            ? "console"
            : null,
      items: row.items,
    });
  }

  return [...models.values()];
}

export function buildPricingApiResult(raw) {
  const { tierRows } = parsePricingTables(raw.tables ?? []);
  const models = groupTierRows(tierRows);
  const pricingTierCount = models.reduce((n, m) => n + m.tiers.length, 0);

  return {
    source: "alibaba_bailian_doc",
    docUrl: raw.docUrl ?? "https://help.aliyun.com/zh/model-studio/model-pricing",
    cachePolicy: {
      mode: "per_model",
      ...bailianCachePolicySummary(),
    },
    scrapedAt: raw.scrapedAt ?? new Date().toISOString(),
    modelCount: models.length,
    pricingTierCount,
    tierRowCount: tierRows.length,
    tableCount: raw.tableCount ?? raw.tables?.length ?? 0,
    models,
  };
}
