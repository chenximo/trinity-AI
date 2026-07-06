#!/usr/bin/env node
/**
 * 生视频价目汇总 → 刊例对比校验 + trinity-pricing-video.xlsx
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseAigcVideoExcel } from "../suppliers/aigc/lib/parse-aigc-video-excel.mjs";
import {
  normalizeAigcVideoPricing,
  indexAigcVideoByTrinity,
} from "../suppliers/aigc/lib/pricing-api-video.mjs";
import { refreshOnlinePricesForCompare } from "./lib/fetch-online-prices-lib.mjs";
import {
  buildVideoCompareHubFromModels,
  loadVideoCompareHubContext,
  writeVideoCompareHubExports,
  VIDEO_COMPARE_SHEET,
  MERGE_COMPARE_VIDEO,
} from "./lib/compare-hub-video-lib.mjs";
import { buildAigcVideoCatalogRows } from "./lib/build-video-rows.mjs";
import {
  buildVideoSupplierOfficialSummaryReport,
  buildVideoSupplierOfficialSummaryExcelRows,
  VIDEO_SUPPLIER_SUMMARY_SHEET,
} from "./lib/supplier-official-summary-video.mjs";
import { VIDEO_CONNECTED_SUPPLIERS } from "../config/channels-video.mjs";
import { mergeModalityWorkbook, MERGE_SUPPLIER } from "./lib/export-excel.mjs";
import {
  OUT_DIR,
  OUT_UPSTREAM_DIR,
  VIDEO_PRICING_XLSX,
  SUPPLIERS_DIR,
} from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TRINITY_BASE = "https://api.trinitydesk.ai/v1";
const AIGC_VIDEO_MAP = path.join(SUPPLIERS_DIR, "aigc/trinity-map-video.json");
const VIDEO_MODELS_CACHE = path.join(OUT_UPSTREAM_DIR, "trinity-models-video-api.json");

const SHEET_META = {
  source: "AIGC价格指南（商务版报价文档）.xlsx",
  sheet: "AIGC生视频",
  dataDate: "2026-06",
  modality: "video",
};

async function loadAigcVideoPricing() {
  let trinityMap = {};
  try {
    trinityMap = JSON.parse(await readFile(AIGC_VIDEO_MAP, "utf8"));
    delete trinityMap._comment;
  } catch {
    /* optional */
  }
  const sheet = parseAigcVideoExcel();
  const models = normalizeAigcVideoPricing(sheet, trinityMap);
  return { models, trinityMap, sheet, ...indexAigcVideoByTrinity(models, trinityMap) };
}

async function loadTrinityVideoModels() {
  const base = (process.env.TRINITY_BASE_URL || DEFAULT_TRINITY_BASE).replace(
    /\/$/,
    "",
  );
  const key = process.env.TRINITY_API_KEY;
  const headers = { Accept: "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;

  try {
    const res = await fetch(`${base}/models?modality=video`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    await mkdir(OUT_UPSTREAM_DIR, { recursive: true });
    await writeFile(VIDEO_MODELS_CACHE, JSON.stringify(body, null, 2), "utf8");
    return parseTrinityVideoModels(body);
  } catch (e) {
    try {
      const cached = JSON.parse(await readFile(VIDEO_MODELS_CACHE, "utf8"));
      console.warn("Trinity video API fetch failed, using cache:", e.message);
      return parseTrinityVideoModels(cached);
    } catch {
      return [];
    }
  }
}

function parseTrinityVideoModels(body) {
  return (body.data ?? []).map((m) => {
    const md = m.metadata ?? {};
    return {
      id: m.id,
      displayName: md.display_name ?? m.id,
      brand: md.origin_vendor_name ?? m.owned_by ?? "—",
    };
  });
}

function videoSupplierRows(sup, ctx) {
  const { aigcModels, officialCtx } = ctx;
  if (sup.catalog === "aigc") {
    return buildAigcVideoCatalogRows(
      aigcModels,
      sup.site,
      officialCtx,
      ctx.aigcTrinityMap ?? {},
    );
  }
  return [["—"]];
}

async function main() {
  const generatedAt = new Date().toISOString();
  const {
    models: aigcModels,
    trinityMap,
    domestic: aigcDomMap,
    international: aigcIntlMap,
  } = await loadAigcVideoPricing();

  const trinityList = await loadTrinityVideoModels();
  let onlinePrices = { raw: { data: [] }, fetchedAt: null };
  try {
    onlinePrices = await refreshOnlinePricesForCompare("video", { quiet: true });
  } catch (e) {
    console.warn("Online video prices fetch skipped:", e.message);
  }

  const hubCtx = {
    ...(await loadVideoCompareHubContext({ preloaded: onlinePrices })),
    aigcDomByTrinity: aigcDomMap,
    aigcIntlByTrinity: aigcIntlMap,
    aigcModels,
  };

  const officialCtx = {
    vendorMap: hubCtx.vendorMap,
    officialByVendorId: hubCtx.officialByVendorId,
  };

  const sheetCtx = {
    aigcModels,
    aigcTrinityMap: trinityMap,
    officialCtx,
  };

  const compareReport = buildVideoCompareHubFromModels(trinityList, hubCtx);
  const { excelRows: compareExcelRows, paths: comparePaths } =
    await writeVideoCompareHubExports(compareReport, writeFile);

  const summaryReport = buildVideoSupplierOfficialSummaryReport({
    ...sheetCtx,
    generatedAt,
  });
  const summaryExcelRows = buildVideoSupplierOfficialSummaryExcelRows(summaryReport);

  const excelSheets = [
    {
      name: VIDEO_COMPARE_SHEET,
      rows: compareExcelRows,
      merge: MERGE_COMPARE_VIDEO,
    },
    {
      name: VIDEO_SUPPLIER_SUMMARY_SHEET,
      rows: summaryExcelRows,
    },
    ...VIDEO_CONNECTED_SUPPLIERS.map((sup) => ({
      name: sup.excelSheet,
      rows: videoSupplierRows(sup, sheetCtx),
      merge: MERGE_SUPPLIER,
    })),
  ];

  const videoXlsx = mergeModalityWorkbook("video", excelSheets);
  await mkdir(OUT_DIR, { recursive: true });

  const aigcOut = path.join(SUPPLIERS_DIR, "aigc/output/pricing-api-video.json");
  await mkdir(path.dirname(aigcOut), { recursive: true });
  await writeFile(
    aigcOut,
    JSON.stringify(
      {
        ...SHEET_META,
        generatedAt,
        modelCount: aigcModels.length,
        trinityMappedCount: new Set(
          aigcModels.filter((m) => m.trinityId).map((m) => m.trinityId),
        ).size,
        models: aigcModels,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Trinity video models: ${trinityList.length}`);
  console.log(
    `Official catalog rows: ${compareReport.modelCount} · compare rows: ${compareReport.rowCount}`,
  );
  console.log(`AIGC video entries: ${aigcModels.length}`);
  console.log(`Wrote ${comparePaths.officialMd}`);
  console.log(`Wrote ${videoXlsx}`);
  console.log(`Wrote ${aigcOut}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
