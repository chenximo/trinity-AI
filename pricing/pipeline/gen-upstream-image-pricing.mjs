#!/usr/bin/env node
/**
 * 生图价目汇总 → 刊例对比校验 + trinity-pricing-image.xlsx
 * 与生文 gen-upstream-pricing.mjs 同范式：主表 + 汇总 + 分表（含 vs 官方）
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRICING_SHEET_IMAGE,
  SHEET_META as IMAGE_SHEET_META,
} from "../suppliers/aigc/data/pricing-sheet-image.mjs";
import {
  normalizeAigcImagePricing,
  indexAigcImageByTrinity,
} from "../suppliers/aigc/lib/pricing-api-image.mjs";
import { refreshOnlinePricesForCompare } from "./lib/fetch-online-prices-lib.mjs";
import {
  buildImageCompareHubFromModels,
  loadImageCompareHubContext,
  writeImageCompareHubExports,
  IMAGE_COMPARE_SHEET,
  MERGE_COMPARE_IMAGE,
} from "./lib/compare-hub-image-lib.mjs";
import {
  buildAigcImageCatalogRows,
  buildTokenhubImageCatalogRows,
  buildVolcengineImageCatalogRows,
} from "./lib/build-image-rows.mjs";
import {
  buildImageSupplierOfficialSummaryReport,
  buildImageSupplierOfficialSummaryExcelRows,
  IMAGE_SUPPLIER_SUMMARY_SHEET,
} from "./lib/supplier-official-summary-image.mjs";
import { IMAGE_CONNECTED_SUPPLIERS } from "../config/channels-image.mjs";
import { mergeModalityWorkbook, writeCsv, MERGE_SUPPLIER } from "./lib/export-excel.mjs";
import { renderOutputReadme } from "./lib/output-readme.mjs";
import {
  OUT_DIR,
  OUT_UPSTREAM_DIR,
  IMAGE_PRICING_XLSX,
  README_FILE,
  TOKENHUB_FILE,
  TRINITY_MODELS_CACHE_FILE,
  SUPPLIERS_DIR,
} from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TRINITY_BASE = "https://api.trinitydesk.ai/v1";
const AIGC_IMAGE_MAP = path.join(SUPPLIERS_DIR, "aigc/trinity-map-image.json");
const VOLC_IMAGE_FILE = path.join(
  SUPPLIERS_DIR,
  "volcengine/output/image/pricing-api.json",
);
const IMAGE_MODELS_CACHE = path.join(OUT_UPSTREAM_DIR, "trinity-models-image-api.json");

async function loadAigcImagePricing() {
  let trinityMap = {};
  try {
    trinityMap = JSON.parse(await readFile(AIGC_IMAGE_MAP, "utf8"));
    delete trinityMap._comment;
  } catch {
    /* optional */
  }
  const models = normalizeAigcImagePricing(PRICING_SHEET_IMAGE, trinityMap);
  return { models, trinityMap, ...indexAigcImageByTrinity(models, trinityMap) };
}

async function loadTrinityImageModels() {
  const base = (process.env.TRINITY_BASE_URL || DEFAULT_TRINITY_BASE).replace(
    /\/$/,
    "",
  );
  const key = process.env.TRINITY_API_KEY;
  const headers = { Accept: "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;

  try {
    const res = await fetch(`${base}/models?modality=image`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    await mkdir(OUT_UPSTREAM_DIR, { recursive: true });
    await writeFile(IMAGE_MODELS_CACHE, JSON.stringify(body, null, 2), "utf8");
    return parseTrinityImageModels(body);
  } catch (e) {
    try {
      const cached = JSON.parse(await readFile(IMAGE_MODELS_CACHE, "utf8"));
      console.warn("Trinity image API fetch failed, using cache:", e.message);
      return parseTrinityImageModels(cached);
    } catch {
      return [];
    }
  }
}

function parseTrinityImageModels(body) {
  return (body.data ?? []).map((m) => {
    const md = m.metadata ?? {};
    return {
      id: m.id,
      displayName: md.display_name ?? m.id,
      brand: md.origin_vendor_name ?? m.owned_by ?? "—",
    };
  });
}

function imageSupplierRows(sup, ctx) {
  const { aigcModels, thData, volcModels, officialCtx } = ctx;
  if (sup.catalog === "aigc") {
    return buildAigcImageCatalogRows(
      aigcModels,
      sup.site,
      officialCtx,
      ctx.aigcTrinityMap ?? {},
    );
  }
  if (sup.catalog === "tokenhub") {
    return buildTokenhubImageCatalogRows(thData, officialCtx);
  }
  if (sup.catalog === "volcengine") {
    return buildVolcengineImageCatalogRows(volcModels, officialCtx);
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
  } = await loadAigcImagePricing();

  let volcData = { models: [] };
  try {
    volcData = JSON.parse(await readFile(VOLC_IMAGE_FILE, "utf8"));
  } catch {
    console.warn(`缺少 ${VOLC_IMAGE_FILE}，火山方舟列将为空`);
  }

  let thData = { models: [] };
  try {
    thData = JSON.parse(await readFile(TOKENHUB_FILE, "utf8"));
  } catch {
    /* optional */
  }

  const trinityList = await loadTrinityImageModels();
  const onlinePrices = await refreshOnlinePricesForCompare("image");

  const hubCtx = {
    ...(await loadImageCompareHubContext({ preloaded: onlinePrices })),
    aigcDomByTrinity: aigcDomMap,
    aigcIntlByTrinity: aigcIntlMap,
  };

  const officialCtx = {
    vendorMap: hubCtx.vendorMap,
    officialByVendorId: hubCtx.officialByVendorId,
  };

  const sheetCtx = {
    aigcModels,
    aigcTrinityMap: trinityMap,
    thData,
    volcModels: volcData.models ?? [],
    officialCtx,
  };

  const compareReport = buildImageCompareHubFromModels(trinityList, hubCtx);
  const { excelRows: compareExcelRows, paths: comparePaths } =
    await writeImageCompareHubExports(compareReport, writeFile);

  const summaryReport = buildImageSupplierOfficialSummaryReport({
    ...sheetCtx,
    generatedAt,
  });
  const summaryExcelRows = buildImageSupplierOfficialSummaryExcelRows(summaryReport);

  const excelSheets = [
    {
      name: IMAGE_COMPARE_SHEET,
      rows: compareExcelRows,
      merge: MERGE_COMPARE_IMAGE,
    },
    {
      name: IMAGE_SUPPLIER_SUMMARY_SHEET,
      rows: summaryExcelRows,
    },
    ...IMAGE_CONNECTED_SUPPLIERS.map((sup) => ({
      name: sup.excelSheet,
      rows: imageSupplierRows(sup, sheetCtx),
      merge: MERGE_SUPPLIER,
    })),
  ];

  const imageXlsx = mergeModalityWorkbook("image", excelSheets);
  await mkdir(OUT_DIR, { recursive: true });

  const aigcOut = path.join(SUPPLIERS_DIR, "aigc/output/pricing-api-image.json");
  await mkdir(path.dirname(aigcOut), { recursive: true });
  await writeFile(
    aigcOut,
    JSON.stringify(
      {
        ...IMAGE_SHEET_META,
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

  await writeFile(
    README_FILE,
    renderOutputReadme({
      generatedAt,
      modelCount: trinityList.length,
      scrapedAt: "—",
      aigcDate: IMAGE_SHEET_META.sheetDate ?? "—",
      imageModelCount: compareReport.modelCount,
    }),
    "utf8",
  );

  console.log(`Trinity image models: ${trinityList.length}`);
  console.log(
    `Official catalog rows: ${compareReport.modelCount} · compare rows: ${compareReport.rowCount}`,
  );
  console.log(`AIGC image entries: ${aigcModels.length}`);
  console.log(`Wrote ${comparePaths.officialMd}`);
  console.log(`Wrote ${imageXlsx}`);
  console.log(`Wrote ${aigcOut}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
