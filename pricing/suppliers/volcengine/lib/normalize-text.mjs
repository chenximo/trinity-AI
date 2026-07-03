import { cleanCell } from "./scrape-doc.mjs";
import { TEXT_BILLING_CONTEXT } from "./constants.mjs";

const MODEL_ID_RE = /^doubao-[a-z0-9][a-z0-9.-]*/i;
const SKIP_MODEL_RE = /seedream|seedance|embedding|seed3d/i;

/**
 * @param {string[]} headers
 */
function isMainTextTable(headers) {
  const h = headers.join(" ");
  return /模型名称/.test(h) && /缓存存储/.test(h) && /百万token/.test(h);
}

/**
 * @param {string} raw
 */
function parseNum(raw) {
  const s = cleanCell(raw);
  if (!s || s === "-") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {string} condition
 */
function tierLabelFromCondition(condition) {
  const c = cleanCell(condition);
  if (!c || c === "-") return "标准价";
  if (/\[0,\s*32\]/.test(c) && !/\(32/.test(c)) return "输入≤32k";
  if (/\(32,\s*128\]/.test(c)) return "输入(32k,128k]";
  if (/\(128,\s*256\]/.test(c) || /\(128/.test(c)) return "输入(128k,256k]";
  if (/\[0,\s*256\]/.test(c)) return "输入≤256k";
  if (/\[33/.test(c) || />\s*32/.test(c)) return "输入>32k";
  return c.length > 40 ? `${c.slice(0, 37)}…` : c;
}

/**
 * @param {string} cell
 */
function extractModelId(cell) {
  const s = cleanCell(cell);
  const m = s.match(MODEL_ID_RE);
  if (!m) return null;
  return m[0].split(/按|不支持/)[0].trim();
}

/**
 * @param {import('./scrape-doc.mjs').scrapeVolcengineDoc extends (...args: any) => Promise<infer R> ? R : never} raw
 */
export function normalizeTextFromRaw(raw) {
  /** @type {Map<string, { vendorModelId: string, modelName: string, tiers: Array<{ attribute: string, input?: number|null, output?: number|null, cache?: number|null }> }>} */
  const byModel = new Map();

  for (const table of raw.tables ?? []) {
    if (table.billingContext !== TEXT_BILLING_CONTEXT) continue;
    if (!isMainTextTable(table.headers)) continue;

    let currentId = "";
    for (const row of table.rows) {
      const modelCell = row[0] ?? "";
      const condition = row[1] ?? "";
      const idFromCell = extractModelId(modelCell);
      if (idFromCell) {
        currentId = idFromCell;
      }
      if (!currentId || SKIP_MODEL_RE.test(currentId)) continue;

      const input = parseNum(row[2]);
      const output = parseNum(row[7] ?? row[6]);
      const cache = parseNum(row[5]);
      if (input == null && output == null && cache == null) continue;

      const attribute = tierLabelFromCondition(
        idFromCell ? condition : condition || modelCell,
      );
      if (!byModel.has(currentId)) {
        byModel.set(currentId, {
          vendorModelId: currentId,
          modelName: currentId.replace(/^doubao-/, "Doubao-").replace(/-/g, "-"),
          tiers: [],
        });
      }
      const entry = byModel.get(currentId);
      entry.tiers.push({ attribute, input, output, cache });
    }
  }

  return [...byModel.values()].filter((m) => m.tiers.length > 0);
}

/**
 * @param {ReturnType<typeof normalizeTextFromRaw>} sheet
 * @param {Record<string, { trinityId?: string }>} trinityMap
 */
export function buildTextApiModels(sheet, trinityMap = {}) {
  return sheet.map((entry) => {
    const trinityId =
      trinityMap[entry.vendorModelId]?.trinityId ??
      trinityMap[entry.vendorModelId.toLowerCase()]?.trinityId ??
      null;

    const tiers = entry.tiers.map((row) => ({
      tierType: entry.tiers.length === 1 ? "Uniform" : "Tiered",
      tierName: row.attribute,
      input: row.input ?? null,
      output: row.output ?? null,
      cache: row.cache ?? null,
      unit: "百万tokens",
      chargeUnit: "TOKEN",
    }));

    return {
      modality: "text",
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
      billingMode: TEXT_BILLING_CONTEXT,
      tiers,
    };
  });
}
