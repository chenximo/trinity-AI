/**
 * 百炼国际站（Model Studio International）价目 → 与 TokenHub 对齐的扁平结构
 * 双真源（仅本渠道）：帮助中心 EN ↔ 控制台 doc url=prices；一致入真源，不一致待人工确认。
 * 单位：美元/百万 tokens；主价取 List price（忽略 Limited-time 促销数字）
 * 缓：价目表未列缓存价 → null / 展示 ⚠，禁止比例推算。
 */

export const PRICING_API_OUT = "pricing-api.json";
export const PRICING_RAW_OUT = "bailian-intl-pricing.json";
export const PRICING_RAW_HELP_OUT = "bailian-intl-pricing-help.json";
export const PRICING_RAW_CONSOLE_OUT = "bailian-intl-pricing-console.json";
export const DUAL_SOURCE_DIFF_OUT = "dual-source-diff.json";
export const DOC_URL =
  "https://www.alibabacloud.com/help/en/model-studio/model-pricing";
/** Model Studio 控制台嵌入价目（SPA；与帮助中心双源核对） */
export const CONSOLE_DOC_URL =
  "https://modelstudio.console.alibabacloud.com/ap-southeast-1?tab=doc#/doc/?type=model&url=prices";

const MODEL_ID_RE = /^([a-zA-Z][a-zA-Z0-9._-]*)/;
const TIER_RE =
  /Token\s*[≤<≥>]|[≤<≥>]\s*\d|[\d.]+[KkMm]?\s*<\s*Token|No tiered pricing|Input\s*<=|Input\s*<|flat-rate/i;

export function isTierLabel(text) {
  if (!text) return false;
  return TIER_RE.test(String(text).trim());
}

/** 取 List price；否则取首个 $ 金额（促销文案不当主价） */
export function parseUsdAmount(text) {
  if (text == null || text === "") return null;
  const s = String(text).trim();
  if (!s || /^[-—–]$/.test(s)) return null;
  const list = s.match(/List\s*price\s*\$?\s*([\d.]+)/i);
  if (list) return { value: list[1], raw: s, isRange: false, isList: true };
  const single = s.match(/\$\s*([\d.]+)/);
  if (single) return { value: single[1], raw: s, isRange: false, isList: false };
  return null;
}

export function extractModelId(cell) {
  return parseBailianIntlModelRef(cell).modelId;
}

export function parseBailianIntlModelRef(cell) {
  if (!cell || isTierLabel(cell)) return { modelId: null, vendorPrefix: null };
  let s = String(cell).trim();
  // 文档常把备注粘在 Model ID 后：qwen3-maxCurrently… / qwen3-max-previewcontext…
  s = s.replace(/([a-z0-9._-])(Currently|context|batch|50%)/gi, "$1 $2");
  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  let first = s.split(/\s+/)[0];
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
  let s = String(cell ?? "");
  s = s.replace(/([a-z0-9._-])(Currently|context|batch|50%)/gi, "$1 $2");
  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return {
    supportsCache: /context\s*caching\s*discount/i.test(s),
    supportsBatch: /batch\s*inference/i.test(s) || /50%\s*batch/i.test(s),
    equivalenceNote:
      s.match(/Currently\s+equivalent\s+to\s+(\S+)/i)?.[1]?.replace(/context$/i, "") ??
      null,
    rawNotes: s
      .replace(MODEL_ID_RE, "")
      .replace(/Currently\s+equivalent\s+to\s+\S+/gi, "")
      .replace(/context\s*caching\s*discount/gi, "")
      .replace(/50%\s*\[?batch[^\]]*\]?/gi, "")
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
  if (/image|wanx|vision generation/i.test(s))
    return { family: "Image", modelType: "Vision" };
  if (/video/i.test(s)) return { family: "Video", modelType: "Vision" };
  if (/speech|audio|cosyvoice|asr/i.test(s))
    return { family: "Audio", modelType: "Audio" };
  if (/qwen|qwq|text generation/i.test(s))
    return { family: "Qwen", modelType: "Text" };
  if (/DeepSeek/i.test(s)) return { family: "DeepSeek", modelType: "Text" };
  if (/GLM|Zhipu/i.test(s)) return { family: "GLM", modelType: "Text" };
  if (/multimodal|VL|visual|Omni/i.test(s))
    return { family: "Multimodal", modelType: "Multimodal" };
  return { family: s.split("-")[0] || "Other", modelType: "Text" };
}

export function buildTierItems({ input, output, cache, inputUnit, outputUnit, cacheUnit }) {
  const items = [];
  if (input != null) {
    items.push({
      name: "Input",
      displayName: "输入",
      price: input,
      unit: inputUnit ?? "USD/百万tokens",
    });
  }
  if (cache != null) {
    items.push({
      name: "Cache",
      displayName: "缓存命中（隐式）",
      price: cache,
      unit: cacheUnit ?? "USD/百万tokens",
    });
  }
  if (output != null) {
    items.push({
      name: "Output",
      displayName: "输出",
      price: output,
      unit: outputUnit ?? "USD/百万tokens",
    });
  }
  return items;
}

function parsePricingRow(row, ctx) {
  const modelCell =
    getCell(row, /^Model\s*ID$/i) ||
    getCell(row, /^Model$/i) ||
    getCell(row, /Model\s*ID/i);
  const regionCell = getCell(row, /Deployment\s*scope/i);
  const modeCell = getCell(row, /^Mode$/i) || getCell(row, /Mode/i);
  const tierCell =
    getCell(row, /Input\s*tokens\s*per\s*request/i) ||
    getCell(row, /Input\s*Token\s*Range/i) ||
    getCell(row, /Token/i);
  // 勿误匹配 Input Price (Implicit Cache Hit)
  const inputCell = getCell(row, /Input\s*price(?![^(]*[Cc]ache)/i);
  const outputCell = getCell(row, /Output\s*price(?![^(]*[Cc]ache)/i);
  const freeCell = getCell(row, /Free\s*quota/i);
  // 仅当价目表明文有缓存列时取值；禁止比例推算
  const cacheCell =
    getCell(row, /Implicit\s*Cache\s*Hit/i) ||
    getCell(row, /Input\s*Price\s*\(\s*Implicit\s*Cache/i);

  let inputParsed = parseUsdAmount(inputCell);
  let outputParsed = parseUsdAmount(outputCell);
  let tierName =
    !tierCell || /no\s*tiered\s*pricing/i.test(tierCell)
      ? "统一价"
      : tierCell;
  let modelId = extractModelId(modelCell);
  let vendorPrefix = parseBailianIntlModelRef(modelCell).vendorPrefix;
  let region = regionCell;
  let mode = modeCell;
  let notes = extractModelNotes(modelCell);

  // 多阶梯续行：首列是档位
  if (!inputParsed && modelCell && isTierLabel(modelCell)) {
    tierName = /no\s*tiered\s*pricing/i.test(modelCell) ? "统一价" : modelCell;
    inputParsed = parseUsdAmount(regionCell);
    outputParsed = parseUsdAmount(modeCell);
    // 有时续行把价放在 Mode / tier 列之后
    if (!inputParsed) inputParsed = parseUsdAmount(tierCell);
    if (!outputParsed) outputParsed = parseUsdAmount(inputCell);
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

  const input = inputParsed?.value ?? null;
  const output = outputParsed?.value ?? null;
  if (input == null && output == null) return null;
  // 生文错位续行常只有 input、无 output
  if (input != null && output == null) {
    const probe = `${inputCell} ${outputCell} ${tierCell}`;
    if (!/\/image|per\s*image|\/second|per\s*second/i.test(probe)) return null;
  }

  // 丢弃错位续行：档位名是 $x 但与 input 不一致（如 tier=$3.6、input=12）
  // 若档位名==单价，视为「统一价」误写入价格
  if (/^\$[\d.]+$/.test(String(tierName).trim())) {
    const named = Number(String(tierName).trim().slice(1));
    const inn = input != null ? Number(input) : NaN;
    if (Number.isFinite(named) && Number.isFinite(inn) && Math.abs(named - inn) < 1e-9) {
      tierName = "统一价";
    } else {
      return null;
    }
  }

  // 续行错位：档位名变成 "List price $x…"
  if (/list\s*price|limited-time/i.test(String(tierName)) && !/Token/i.test(String(tierName))) {
    return null;
  }

  const isPerImage =
    /\/image|per\s*image|\/张/i.test(outputCell) ||
    /\/image|per\s*image/i.test(inputCell);
  const isPerSecond = /\/second|per\s*second/i.test(outputCell + inputCell);
  const tokenUnit = "百万tokens";
  const inputUnit = isPerImage || isPerSecond ? null : "USD/百万tokens";
  const outputUnit = isPerImage
    ? "USD/image"
    : isPerSecond
      ? "USD/second"
      : "USD/百万tokens";

  // 缓存：仅表列明文；无则 null → 展示 ⚠（禁止比例推算）
  const cacheParsed = parseUsdAmount(cacheCell);
  const cache = cacheParsed?.value ?? null;
  const supportsCache = Boolean(
    (ctx.supportsCache || cache != null) && !isPerImage && !isPerSecond,
  );

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
    cachePolicyMode: cache != null ? "table" : supportsCache ? "table_missing" : "none",
    cacheRatio: null,
    cacheRatioLabel: null,
    chargeUnit: isPerImage ? "IMAGE" : isPerSecond ? "SECOND" : "TOKEN",
    unit: isPerImage || isPerSecond ? outputUnit : tokenUnit,
    currency: "USD",
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
  return headers.some((h) => /Input\s*price|Output\s*price/i.test(h));
}

export function parsePricingTables(tables) {
  const tierRows = [];

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

  return { tierRows };
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
        currency: "USD",
        supportsCache: row.supportsCache,
        supportsBatch: row.supportsBatch,
        cachePolicy: row.supportsCache ? "table_missing" : null,
        cacheRatio: null,
        cacheRatioLabel: null,
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
    if (row.supportsCache) m.cachePolicy = "table_missing";
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
      currency: "USD",
      inputRaw: row.inputRaw,
      outputRaw: row.outputRaw,
      cacheSource: row.cache != null ? "table" : "⚠",
      items: row.items,
    });
  }

  return [...models.values()];
}

/** 扁平档位键：用于双真源对账 */
export function normalizeTierLabel(tierName) {
  const s = String(tierName ?? "").trim();
  if (!s || /no\s*tiered|flat-rate|统一价|^-$/i.test(s)) return "flat";
  // 抽上下界 token 数（K/M）
  const nums = [...s.matchAll(/(\d+(?:\.\d+)?)\s*([KkMm])?/g)].map((m) => {
    let n = Number(m[1]);
    const u = (m[2] || "").toLowerCase();
    if (u === "k") n *= 1_000;
    if (u === "m") n *= 1_000_000;
    return n;
  });
  if (nums.length >= 2) return `${nums[0]}-${nums[1]}`;
  if (nums.length === 1) {
    if (/<=|≤/.test(s)) return `0-${nums[0]}`;
    if (/>|≥/.test(s)) return `${nums[0]}-inf`;
    return String(nums[0]);
  }
  return s.toLowerCase().replace(/\s+/g, "");
}

export function tierCompareKey(row) {
  return [
    String(row.modelId ?? "").toLowerCase(),
    normalizeTierLabel(row.tierName),
    row.chargeUnit ?? "TOKEN",
  ].join("\0");
}

function normPrice(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  // 对齐 $1.400 vs $1.4
  return Math.round(n * 1e6) / 1e6;
}

/**
 * 帮助中心 vs 控制台：入/出一致 → consensus；不一致 / 单侧有 → conflicts
 * 缓：帮助中心表常无列；控制台有明文则不因「一侧无缓」判冲突（合并进 consensus 时用控制台缓）
 */
export function diffDualSourceTierRows(helpRows, consoleRows) {
  const helpMap = new Map(helpRows.map((r) => [tierCompareKey(r), r]));
  const consoleMap = new Map(consoleRows.map((r) => [tierCompareKey(r), r]));
  const consensusKeys = new Set();
  const conflicts = [];
  const helpOnly = [];
  const consoleOnly = [];
  /** @type {Map<string, object>} */
  const consoleByKey = consoleMap;

  for (const [key, h] of helpMap) {
    const c = consoleMap.get(key);
    if (!c) {
      helpOnly.push({
        key,
        modelId: h.modelId,
        region: h.region,
        mode: h.mode,
        tierName: h.tierName,
        help: { input: h.input, output: h.output, cache: h.cache },
      });
      continue;
    }
    const hi = normPrice(h.input);
    const ho = normPrice(h.output);
    const ci = normPrice(c.input);
    const co = normPrice(c.output);
    const sameIn = hi === ci || (hi == null && ci == null);
    const sameOut = ho === co || (ho == null && co == null);
    // 两侧都有缓且数值不同 → 冲突；一侧无缓不冲突
    const hc = normPrice(h.cache);
    const cc = normPrice(c.cache);
    const cacheConflict = hc != null && cc != null && hc !== cc;
    if (sameIn && sameOut && !cacheConflict) {
      consensusKeys.add(key);
    } else {
      conflicts.push({
        key,
        modelId: h.modelId,
        region: h.region,
        mode: h.mode,
        tierName: h.tierName,
        help: { input: h.input, output: h.output, cache: h.cache },
        console: { input: c.input, output: c.output, cache: c.cache },
        status: "待人工确认讨论",
      });
    }
  }

  for (const [key, c] of consoleMap) {
    if (helpMap.has(key)) continue;
    consoleOnly.push({
      key,
      modelId: c.modelId,
      region: c.region,
      mode: c.mode,
      tierName: c.tierName,
      console: { input: c.input, output: c.output, cache: c.cache },
    });
  }

  return { consensusKeys, conflicts, helpOnly, consoleOnly, consoleByKey };
}

/**
 * @param {object} raw help 或合并 raw
 * @param {{ consensusOnly?: boolean, consensusKeys?: Set<string>, dualSource?: object }} [opts]
 */
export function buildPricingApiResult(raw, opts = {}) {
  const { tierRows } = parsePricingTables(raw.tables ?? []);
  let rows = tierRows;
  if (opts.consensusOnly && opts.consensusKeys) {
    rows = tierRows.filter((r) => opts.consensusKeys.has(tierCompareKey(r)));
  }
  const models = groupTierRows(rows);
  const pricingTierCount = models.reduce((n, m) => n + m.tiers.length, 0);

  return {
    source: raw.source ?? "alibaba_bailian_intl_doc",
    docUrl: raw.docUrl ?? DOC_URL,
    consoleDocUrl: CONSOLE_DOC_URL,
    currency: "USD",
    cachePolicy: {
      mode: "table_only",
      note: "价目表未列缓存价则 cache=null（展示 ⚠），禁止比例推算",
    },
    dualSource: opts.dualSource ?? null,
    scrapedAt: raw.scrapedAt ?? new Date().toISOString(),
    modelCount: models.length,
    pricingTierCount,
    tierRowCount: rows.length,
    tableCount: raw.tableCount ?? raw.tables?.length ?? 0,
    models,
  };
}
