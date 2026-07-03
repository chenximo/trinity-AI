import { existsSync } from "node:fs";
import XLSX from "xlsx";
import {
  TEXT_SHEET_ORDER,
  pricingXlsxForModality,
  sheetOrderForModality,
} from "./paths.mjs";

function cellKey(v) {
  return v == null ? "" : String(v).trim();
}

/**
 * 按 groupCol 识别同一模型多档的连续行（空单元格视为延续上一模型）
 * @param {unknown[][]} rows 含表头
 * @param {number} groupCol
 * @returns {{ start: number, end: number }[]} 数据行下标（含，相对 rows）
 */
export function modelGroupRanges(rows, groupCol = 0) {
  if (rows.length <= 2) return [];

  const ranges = [];
  let start = 1;
  let groupKey = cellKey(rows[1][groupCol]);

  for (let i = 2; i < rows.length; i++) {
    const raw = rows[i][groupCol];
    const key = cellKey(raw) || groupKey;

    if (key !== groupKey) {
      if (i - 1 > start) ranges.push({ start, end: i - 1 });
      start = i;
      groupKey = cellKey(raw);
    } else if (cellKey(raw)) {
      groupKey = cellKey(raw);
    }
  }

  if (rows.length - 1 > start) {
    ranges.push({ start, end: rows.length - 1 });
  }

  return ranges;
}

/**
 * @param {import("xlsx").WorkSheet} ws
 * @param {unknown[][]} rows
 * @param {{ groupCol?: number, columns: number[] }} merge
 */
export function applyVerticalMerges(ws, rows, merge) {
  const groupCol = merge.groupCol ?? 0;
  const ranges = modelGroupRanges(rows, groupCol);
  if (!ranges.length) return;

  ws["!merges"] = ws["!merges"] ?? [];

  for (const { start, end } of ranges) {
    for (const col of merge.columns) {
      ws["!merges"].push({
        s: { r: start, c: col },
        e: { r: end, c: col },
      });
      for (let r = start + 1; r <= end; r++) {
        const addr = XLSX.utils.encode_cell({ r, c: col });
        if (ws[addr]) delete ws[addr];
      }
    }
  }
}

/** 刊例对比校验-生文 Sheet：模型级列合并（原厂 modelId · Trinity · 显示名 · 厂商） */
export const MERGE_COMPARE_TEXT = {
  groupCol: 0,
  columns: [0, 1, 2, 3],
};

/** @deprecated 使用 MERGE_COMPARE_TEXT */
export const MERGE_SUMMARY = MERGE_COMPARE_TEXT;

/** 分上游 Sheet */
export const MERGE_SUPPLIER = {
  groupCol: 1,
  columns: [1, 2, 3],
};

/** 官方对比 · 生文 */
export const MERGE_OFFICIAL_TEXT = {
  groupCol: 0,
  columns: [0, 1, 9],
};

/** 官方对比 · 生图/生视频 */
export const MERGE_OFFICIAL_MEDIA = {
  groupCol: 0,
  columns: [0, 1, 7],
};

/** OpenRouter 对比 · 生文 */
export const MERGE_OPENROUTER_TEXT = {
  groupCol: 0,
  columns: [0, 1],
};

function sheetFromRows(rows, merge) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (merge?.columns?.length) {
    applyVerticalMerges(ws, rows, merge);
  }
  return ws;
}

export const DEPRECATED_MASTER_SHEETS = [
  "摘要",
  "官方-生文",
  "OR-生文",
  "对比-生文",
];

function reorderWorkbookSheets(wb, sheetOrder = TEXT_SHEET_ORDER) {
  const known = sheetOrder.filter((n) => wb.SheetNames.includes(n));
  const extra = wb.SheetNames.filter((n) => !sheetOrder.includes(n));
  wb.SheetNames = [...known, ...extra];
}

function removeDeprecatedSheets(wb) {
  for (const legacy of DEPRECATED_MASTER_SHEETS) {
    const idx = wb.SheetNames.indexOf(legacy);
    if (idx >= 0) {
      wb.SheetNames.splice(idx, 1);
      delete wb.Sheets[legacy];
    }
  }
}

/**
 * 新建工作簿并写入（覆盖整个文件）
 * @param {string} filePath
 * @param {{ name: string, rows: unknown[][], merge?: { groupCol?: number, columns: number[] } }[]} sheets
 */
export function writeExcelWorkbook(filePath, sheets) {
  const wb = XLSX.utils.book_new();
  for (const { name, rows, merge } of sheets) {
    const ws = sheetFromRows(rows, merge);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  }
  XLSX.writeFile(wb, filePath);
}

/**
 * 增量更新工作簿：按 Sheet 名替换或追加，保留同册其他 Sheet
 * @param {string} filePath
 * @param {{ name: string, rows: unknown[][], merge?: { groupCol?: number, columns: number[] } }[]} sheets
 * @param {{ sheetOrder?: string[] }} [opts]
 */
export function mergeSheetsIntoWorkbook(filePath, sheets, opts = {}) {
  const wb = existsSync(filePath)
    ? XLSX.readFile(filePath)
    : XLSX.utils.book_new();

  for (const { name, rows, merge } of sheets) {
    const sheetName = name.slice(0, 31);
    const ws = sheetFromRows(rows, merge);
    const idx = wb.SheetNames.indexOf(sheetName);
    if (idx >= 0) {
      wb.SheetNames.splice(idx, 1);
      delete wb.Sheets[sheetName];
    }
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const sheetOrder = opts.sheetOrder ?? TEXT_SHEET_ORDER;
  reorderWorkbookSheets(wb, sheetOrder);
  removeDeprecatedSheets(wb);
  XLSX.writeFile(wb, filePath);
}

/**
 * 按模态写入对应 Excel（生文 / 生图 / 生视频分册）
 * @param {import("./paths.mjs").PricingModality} modality
 * @param {{ name: string, rows: unknown[][], merge?: { groupCol?: number, columns: number[] } }[]} sheets
 */
export function mergeModalityWorkbook(modality, sheets) {
  const filePath = pricingXlsxForModality(modality);
  mergeSheetsIntoWorkbook(filePath, sheets, {
    sheetOrder: sheetOrderForModality(modality),
  });
  return filePath;
}

/**
 * UTF-8 BOM CSV for Excel double-click open
 * @param {string} filePath
 * @param {unknown[][]} rows
 */
export async function writeCsv(filePath, rows, writeFile) {
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = rows.map((r) => r.map(escape).join(",")).join("\n");
  await writeFile(filePath, `\uFEFF${body}\n`, "utf8");
}
