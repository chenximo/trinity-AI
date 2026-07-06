/**
 * 解析「AIGC价格指南（商务版报价文档）.xlsx」· AIGC生图片
 * 列：厂商 / 模型名 / 属性 · 国内 1K以下/1K/2K/4K（元/张）· 国际 1K/2K/4K（美元/张）
 */

import XLSX from "xlsx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const VENDOR_LABEL_TO_CODE = {
  Hunyuan: "Hunyuan",
  "Hunyuan（new）": "Hunyuan",
  SI: "SI",
  MJ: "MJ",
  JI: "JI",
  Qwen: "Qwen",
  OG: "OO",
  OO: "OO",
  GG: "GG",
  Vidu: "Vidu",
  Kling: "Kling",
};

export const VENDOR_NAMES = {
  Hunyuan: "混元",
  SI: "Seedream",
  MJ: "Midjourney",
  JI: "即梦",
  Qwen: "通义",
  OO: "OpenAI",
  GG: "Gemini",
  Vidu: "Vidu",
  Kling: "可灵",
};

export const RESOLUTION_LABELS = ["1K以下", "1K", "2K", "4K"];
const DOM_COLS = [3, 4, 5, 6];
const INT_COLS = [7, 8, 9, 10];

function num(v) {
  if (v === "" || v === "-" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeVendorLabel(a) {
  const raw = String(a ?? "").trim();
  if (!raw) return null;
  const head = raw.split("（")[0].split("\n")[0].trim();
  return VENDOR_LABEL_TO_CODE[raw] ?? VENDOR_LABEL_TO_CODE[head] ?? null;
}

function normalizeAttribute(c) {
  const t = String(c ?? "").trim();
  if (!t || t === "-") return "标准价";
  return t;
}

function blockFromRow(row, cols) {
  /** @type {Record<string, string>} */
  const block = {};
  RESOLUTION_LABELS.forEach((label, idx) => {
    const n = num(row[cols[idx]]);
    if (n != null) block[label] = String(n);
  });
  return Object.keys(block).length ? block : null;
}

/**
 * @param {string} [xlsxPath]
 * @returns {import("../data/pricing-sheet-image.mjs").SheetModel[]}
 */
export function parseAigcImageExcel(xlsxPath) {
  const file =
    xlsxPath ??
    path.join(__dirname, "../../../AIGC价格指南（商务版报价文档）.xlsx");
  const wb = XLSX.readFile(file);
  const ws = wb.Sheets["AIGC生图片"];
  if (!ws) throw new Error('Excel 缺少 Sheet「AIGC生图片」');

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  /** @type {Map<string, { vendorCode: string, vendorName: string, modelName: string, tiers: object[] }>} */
  const byKey = new Map();

  let vendorCode = null;
  let modelName = null;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const a = String(r[0] ?? "").trim();
    const b = String(r[1] ?? "").trim();
    const c = String(r[2] ?? "").trim();

    if (a === "模型厂商" || b === "模型名称") continue;
    if (a === "模型（图片类）") continue;

    const vc = normalizeVendorLabel(a);
    if (vc) vendorCode = vc;
    if (b && b !== "-") modelName = b;
    if (!vendorCode || !modelName) continue;

    const attribute = normalizeAttribute(c);
    const domestic = blockFromRow(r, DOM_COLS);
    const international = blockFromRow(r, INT_COLS);
    if (!domestic && !international) continue;

    const key = `${vendorCode}::${modelName}`;
    let entry = byKey.get(key);
    if (!entry) {
      entry = {
        vendorCode,
        vendorName: VENDOR_NAMES[vendorCode] ?? vendorCode,
        modelName,
        tiers: [],
      };
      byKey.set(key, entry);
    }

    entry.tiers.push({ attribute, domestic, international });
  }

  return [...byKey.values()];
}

/** @param {ReturnType<typeof parseAigcImageExcel>} models */
export function excelImageModelsByKey(models) {
  return new Map(models.map((m) => [`${m.vendorCode}::${m.modelName}`, m]));
}
