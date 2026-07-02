/**
 * 解析「AIGC价格指南（商务版报价文档）.xlsx」· AIGC生文本
 * 支持多段表头（混元/OG/GG/GLM… 与 Minimax/CD 分块）
 */

import XLSX from "xlsx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Excel 厂商列 → pricing-sheet vendorCode */
export const VENDOR_LABEL_TO_CODE = {
  "Hunyuan（new）": "Hunyuan",
  Hunyuan: "Hunyuan",
  OG: "OO",
  OO: "OO",
  GG: "GG",
  GLM: "Zhipu",
  Zhipu: "Zhipu",
  Deepseek: "Deepseek",
  Minimax: "Minimax",
  Kimi: "Kim",
  Kim: "Kim",
  "CD（仅国际站）": "CD",
  CD: "CD",
  "GK（仅国际站）": "GK",
};

const VENDOR_NAMES = {
  OO: "OpenAI",
  Hunyuan: "混元",
  GG: "Gemini",
  Zhipu: "智谱",
  Deepseek: "DeepSeek",
  Minimax: "MiniMax",
  Kim: "Kimi",
  CD: "Anthropic",
  GK: "xAI",
};

function num(v) {
  if (v === "" || v === "-" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isTierAttribute(s) {
  const t = String(s ?? "").trim();
  if (!t || t === "-") return false;
  return /输入|统一|≤|＞|>|token|context|长度|音频|文本|图片|视频/i.test(t);
}

function normalizeAttribute(c) {
  const t = String(c ?? "").trim();
  if (!t || t === "-") return "统一价";
  return t
    .replace(/context length/gi, "context")
    .replace(/输入<(?!=)/g, "输入<=")
    .replace(/输入＞/g, "输入>")
    .replace(/\s+/g, " ");
}

/**
 * @param {string} [xlsxPath]
 * @returns {import('../data/pricing-sheet.mjs').SheetModel[]}
 */
export function parseAigcTextExcel(xlsxPath) {
  const file =
    xlsxPath ??
    path.join(__dirname, "../../../AIGC价格指南（商务版报价文档）.xlsx");
  const wb = XLSX.readFile(file);
  const ws = wb.Sheets["AIGC生文本"];
  if (!ws) throw new Error('Excel 缺少 Sheet「AIGC生文本」');

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  /** @type {Map<string, { vendorCode: string, vendorName: string, modelName: string, tiers: object[] }>} */
  const byKey = new Map();

  let vendorLabel = null;
  let vendorCode = null;
  let modelName = null;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const a = String(r[0] ?? "").trim();
    const b = String(r[1] ?? "").trim();
    const c = String(r[2] ?? "").trim();

    if (a === "模型厂商" || b === "模型名称") continue;
    if (a === "模型（文本类）" && i > 0) {
      // 新分段表头，保留 vendor 状态由下一行 vendor 行重置
      continue;
    }

    if (a && VENDOR_LABEL_TO_CODE[a]) {
      vendorLabel = a;
      vendorCode = VENDOR_LABEL_TO_CODE[a];
    }

    if (b && !isTierAttribute(b)) {
      modelName = b;
    }

    const attrRaw = isTierAttribute(c) ? c : b === "-" || c === "-" ? "统一价" : null;
    if (!attrRaw || !modelName || !vendorCode) continue;

    const attribute = normalizeAttribute(attrRaw);
    const domestic = {
      input: num(r[3]),
      cache: num(r[4]),
      output: num(r[5]),
    };
    const international =
      vendorCode === "CD" && (num(r[8]) != null || num(r[12]) != null)
        ? {
            input: num(r[8]),
            cacheWrite5m: num(r[9]),
            cacheWrite1h: num(r[10]),
            cacheHit: num(r[11]),
            output: num(r[12]),
          }
        : {
            input: num(r[6]),
            cache: num(r[7]),
            output: num(r[8]),
          };

    const key = `${vendorCode}::${modelName}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        vendorCode,
        vendorName: VENDOR_NAMES[vendorCode] ?? vendorCode,
        modelName,
        tiers: [],
      });
    }
    byKey.get(key).tiers.push({ attribute, domestic, international });
  }

  return [...byKey.values()];
}

/** @param {ReturnType<typeof parseAigcTextExcel>} excelModels */
export function excelModelsByKey(excelModels) {
  return new Map(excelModels.map((m) => [`${m.vendorCode}::${m.modelName}`, m]));
}
