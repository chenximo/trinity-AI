import { existsSync } from "node:fs";
import XLSX from "xlsx-js-style";
import {
  TEXT_SHEET_ORDER,
  pricingXlsxForModality,
  sheetOrderForModality,
} from "./paths.mjs";
import { IMAGE_PENDING_SUPPLIERS } from "../../config/channels-image.mjs";
import { VIDEO_PENDING_SUPPLIERS } from "../../config/channels-video.mjs";

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

/** 同系列浅底色（轮换；ARGB 无 #） */
export const SERIES_FILL_PALETTE = [
  "FFE3F2FD", // 蓝
  "FFFCE4EC", // 粉
  "FFE8F5E9", // 绿
  "FFFFF8E1", // 黄
  "FFF3E5F5", // 紫
  "FFE0F7FA", // 青
  "FFFFF3E0", // 橙
  "FFF1F8E9", // 浅绿
];

const HEADER_FILL = "FFECEFF1";

/** 浅灰细线：只勾轮廓，不抢系列底色 */
const BORDER_LIGHT = {
  style: "hair",
  color: { rgb: "FFCFD8DC" },
};

/**
 * 全表浅灰发丝线（不加粗、不按模型加厚顶线；分组靠系列底色）
 * @param {import("xlsx").WorkSheet} ws
 * @param {unknown[][]} rows
 * @param {{ groupCol?: number }} [opts]
 */
export function applySheetBorders(ws, rows, _opts = {}) {
  if (!rows?.length) return;
  const colCount = Math.max(
    ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
    0,
  );

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? [];
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) {
        ws[addr] = { t: "s", v: row[c] == null ? "" : row[c] };
      }
      const cell = ws[addr];
      const prev = cell.s && typeof cell.s === "object" ? cell.s : {};
      cell.s = {
        ...prev,
        border: {
          top: BORDER_LIGHT,
          bottom: BORDER_LIGHT,
          left: BORDER_LIGHT,
          right: BORDER_LIGHT,
        },
      };
    }
  }
}

/**
 * 按「厂商」列给整行着系列色（空厂商延续上一行）
 * @param {import("xlsx").WorkSheet} ws
 * @param {unknown[][]} rows
 * @param {{ brandCol?: number }} [opts]
 */
export function applySeriesRowFills(ws, rows, opts = {}) {
  if (!rows?.length) return;
  const header = rows[0] ?? [];
  let brandCol = opts.brandCol;
  if (brandCol == null) {
    const idx = header.findIndex((h) => String(h).trim() === "厂商");
    brandCol = idx >= 0 ? idx : 4;
  }

  const colCount = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
  /** @type {Map<string, number>} */
  const brandIndex = new Map();
  let lastBrand = "";

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? [];
    let fillRgb = HEADER_FILL;
    if (r > 0) {
      const raw = cellKey(row[brandCol]);
      if (raw) lastBrand = raw;
      const brand = lastBrand || "_";
      if (!brandIndex.has(brand)) {
        brandIndex.set(brand, brandIndex.size % SERIES_FILL_PALETTE.length);
      }
      fillRgb = SERIES_FILL_PALETTE[brandIndex.get(brand)];
    }

    const fill = {
      patternType: "solid",
      fgColor: { rgb: fillRgb },
    };

    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) {
        ws[addr] = { t: "s", v: row[c] == null ? "" : row[c] };
      }
      const cell = ws[addr];
      const prev = cell.s && typeof cell.s === "object" ? cell.s : {};
      cell.s = {
        ...prev,
        fill,
        ...(r === 0
          ? { font: { ...(prev.font || {}), bold: true } }
          : {}),
      };
    }
  }

  if (!ws["!ref"]) {
    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(rows.length - 1, 0), c: Math.max(colCount - 1, 0) },
    });
  }
}

/** 刊例对比校验-生文 Sheet：模型级列合并（原厂 modelId · Trinity · 显示名 · 厂商） */
export const MERGE_COMPARE_TEXT = {
  groupCol: 0,
  columns: [0, 1, 2, 3],
};

/** @deprecated 使用 MERGE_COMPARE_TEXT */
export const MERGE_SUMMARY = MERGE_COMPARE_TEXT;

/**
 * 供应商分表（生文/生图/生视频统一）：
 * 0厂商 1上游模型 2Trinity ID 3档位 4官方价 5上游价 6刊例价 7上游vs官方 8刊例vs上游
 */
export const MERGE_SUPPLIER = {
  groupCol: 1,
  columns: [0, 1, 2],
};

/** @deprecated 与 MERGE_SUPPLIER 同结构（媒体已取消独立分辨率列） */
export const MERGE_SUPPLIER_MEDIA = MERGE_SUPPLIER;

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

/**
 * 估算单元格显示宽度（CJK 约 2 字符宽）
 * @param {unknown} v
 */
function cellDisplayWidth(v) {
  const s = v == null ? "" : String(v);
  let w = 0;
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    w += code > 0xff ? 2 : 1;
  }
  return w;
}

/**
 * 按表头+内容自动设列宽，避免打开后挤成一团
 * @param {import("xlsx").WorkSheet} ws
 * @param {unknown[][]} rows
 * @param {{ min?: number, max?: number, padding?: number }} [opts]
 */
export function applyAutoColumnWidths(ws, rows, opts = {}) {
  if (!rows?.length) return;
  const min = opts.min ?? 10;
  const max = opts.max ?? 56;
  const padding = opts.padding ?? 2;
  const colCount = Math.max(
    ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
    0,
  );
  if (!colCount) return;

  /** @type {number[]} */
  const widths = Array.from({ length: colCount }, () => min);
  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < colCount; c++) {
      const w = cellDisplayWidth(row[c]) + padding;
      if (w > widths[c]) widths[c] = Math.min(max, Math.max(min, w));
    }
  }
  ws["!cols"] = widths.map((wch) => ({ wch }));
}

/**
 * @param {unknown[][]} rows
 * @param {{ groupCol?: number, columns: number[] }} [merge]
 * @param {{ seriesFill?: boolean, brandCol?: number }} [style]
 */
function sheetFromRows(rows, merge, style = {}) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (merge?.columns?.length) {
    applyVerticalMerges(ws, rows, merge);
  }
  const seriesFill =
    style.seriesFill ??
    (Array.isArray(rows[0]) && rows[0].some((h) => String(h).trim() === "厂商"));
  if (seriesFill) {
    applySeriesRowFills(ws, rows, { brandCol: style.brandCol });
  }
  applySheetBorders(ws, rows, {
    groupCol: merge?.groupCol ?? style.groupCol,
  });
  applyAutoColumnWidths(ws, rows);
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
 * @param {{ name: string, rows: unknown[][], merge?: { groupCol?: number, columns: number[] }, seriesFill?: boolean }[]} sheets
 */
export function writeExcelWorkbook(filePath, sheets) {
  const wb = XLSX.utils.book_new();
  for (const { name, rows, merge, seriesFill, brandCol } of sheets) {
    const ws = sheetFromRows(rows, merge, { seriesFill, brandCol });
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  }
  XLSX.writeFile(wb, filePath, { cellStyles: true });
}

function removeSheetsByName(wb, names) {
  for (const name of names) {
    const idx = wb.SheetNames.indexOf(name);
    if (idx >= 0) {
      wb.SheetNames.splice(idx, 1);
      delete wb.Sheets[name];
    }
  }
}

/**
 * @param {string} filePath
 * @param {{ name: string, rows: unknown[][], merge?: { groupCol?: number, columns: number[] }, seriesFill?: boolean }[]} sheets
 * @param {{ sheetOrder?: string[] }} [opts]
 */
export function mergeSheetsIntoWorkbook(filePath, sheets, opts = {}) {
  const wb = existsSync(filePath)
    ? XLSX.readFile(filePath, { cellStyles: true })
    : XLSX.utils.book_new();

  for (const { name, rows, merge, seriesFill, brandCol } of sheets) {
    const sheetName = name.slice(0, 31);
    const ws = sheetFromRows(rows, merge, { seriesFill, brandCol });
    const idx = wb.SheetNames.indexOf(sheetName);
    if (idx >= 0) {
      wb.SheetNames.splice(idx, 1);
      delete wb.Sheets[sheetName];
    }
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const sheetOrder = opts.sheetOrder ?? TEXT_SHEET_ORDER;
  removeSheetsByName(wb, opts.removeSheets ?? []);
  reorderWorkbookSheets(wb, sheetOrder);
  removeDeprecatedSheets(wb);
  XLSX.writeFile(wb, filePath, { cellStyles: true });
}

/**
 * 按模态写入对应 Excel（生文 / 生图 / 生视频分册）
 * @param {import("./paths.mjs").PricingModality} modality
 * @param {{ name: string, rows: unknown[][], merge?: { groupCol?: number, columns: number[] }, seriesFill?: boolean }[]} sheets
 */
export function mergeModalityWorkbook(modality, sheets) {
  const filePath = pricingXlsxForModality(modality);
  const removeSheets =
    modality === "image"
      ? IMAGE_PENDING_SUPPLIERS.map((s) => s.excelSheet)
      : modality === "video"
        ? VIDEO_PENDING_SUPPLIERS.filter((s) => s.key !== "volcengine").map(
            (s) => s.excelSheet,
          )
        : [];
  mergeSheetsIntoWorkbook(filePath, sheets, {
    sheetOrder: sheetOrderForModality(modality),
    removeSheets,
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
