#!/usr/bin/env node
/**
 * 官方价 vs 上游 vs 线上刊例 对照表
 *
 *   npm run pricing:compare:official -- gpt-5.5
 *   npm run pricing:compare:official -- --modality=video
 *   npm run pricing:compare:official -- --modality=all
 *
 * 生文（text）：写入「刊例对比校验-生文」总表
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { mergeModalityWorkbook, writeCsv } from "./lib/export-excel.mjs";
import {
  OUT_OFFICIAL_DIR,
  TEXT_PRICING_XLSX,
  IMAGE_PRICING_XLSX,
  VIDEO_PRICING_XLSX,
  pricingXlsxForModality,
  UPSTREAM_PRICING_FILE,
  UPSTREAM_SUMMARY_MD,
  officialComparePaths,
  officialMasterSheetName,
  TEXT_COMPARE_MASTER_SHEET,
} from "./lib/paths.mjs";
import {
  MODALITIES,
  buildCompareRows,
  renderCompareMarkdown,
  buildOfficialCompareExcelRows,
  officialCompareMerge,
} from "./lib/compare-official-lib.mjs";
import {
  buildTextCompareHubFromModels,
  loadTextCompareHubContext,
  writeTextCompareHubExports,
  MERGE_COMPARE_TEXT,
} from "./lib/compare-hub-lib.mjs";
/** @param {string[]} argv */
function parseArgs(argv) {
  let modality = "text";
  const filterIds = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--modality=")) modality = arg.slice("--modality=".length);
    else if (arg === "--modality") modality = argv[++i] ?? "text";
    else if (!arg.startsWith("-")) filterIds.push(arg);
  }
  return { modality, filterIds };
}

async function runTextCompareHub(filterIds, { writeMaster = true } = {}) {
  const upstreamRaw = JSON.parse(await readFile(UPSTREAM_PRICING_FILE, "utf8"));
  let models = upstreamRaw.models ?? [];
  if (filterIds.length) {
    const set = new Set(filterIds.map((s) => s.toLowerCase()));
    models = models.filter((m) => set.has(m.trinityId.toLowerCase()));
  }
  if (!models.length) {
    console.error(
      "[text] 无匹配模型；请先运行 npm run pricing:upstream，或检查过滤参数",
    );
    return null;
  }

  const hubCtx = await loadTextCompareHubContext();
  const report = buildTextCompareHubFromModels(models, {
    ...hubCtx,
    generatedAt: new Date().toISOString(),
  });

  const paths = officialComparePaths("text");

  const { excelRows } = await writeTextCompareHubExports(report, writeFile);

  if (writeMaster) {
    mergeModalityWorkbook("text", [
      {
        name: TEXT_COMPARE_MASTER_SHEET,
        rows: excelRows,
        merge: MERGE_COMPARE_TEXT,
      },
    ]);
  }

  const out = {
    modality: "text",
    modelCount: report.modelCount,
    rowCount: report.rowCount,
    mdFile: paths.md,
    jsonFile: paths.json,
    csvFile: paths.csv,
    summaryMd: UPSTREAM_SUMMARY_MD,
  };
  if (writeMaster) {
    out.masterSheet = TEXT_COMPARE_MASTER_SHEET;
    out.masterXlsx = TEXT_PRICING_XLSX;
  }
  console.log(JSON.stringify(out, null, 2));
  return {
    modality: "text",
    sheetName: TEXT_COMPARE_MASTER_SHEET,
    excelRows,
    merge: MERGE_COMPARE_TEXT,
  };
}

async function runModality(modality, filterIds, { writeMaster = true } = {}) {
  if (modality === "text") {
    return runTextCompareHub(filterIds, { writeMaster });
  }

  const report = await buildCompareRows(modality, filterIds);
  if (!report.rows.length) {
    console.error(`[${modality}] 无匹配模型（检查 trinity-map.json 与过滤参数）`);
    return null;
  }

  const paths = officialComparePaths(modality);
  const excelRows = buildOfficialCompareExcelRows(report);
  const sheetName = officialMasterSheetName(modality);

  await mkdir(OUT_OFFICIAL_DIR, { recursive: true });
  await writeFile(paths.md, renderCompareMarkdown(report), "utf8");
  await writeFile(paths.json, JSON.stringify(report, null, 2), "utf8");
  await writeCsv(paths.csv, excelRows, writeFile);

  if (writeMaster) {
    mergeModalityWorkbook(modality, [
      {
        name: sheetName,
        rows: excelRows,
        merge: officialCompareMerge(modality),
      },
    ]);
  }

  const out = {
    modality,
    modelCount: report.modelCount,
    rowCount: report.rowCount,
    mdFile: paths.md,
    jsonFile: paths.json,
    csvFile: paths.csv,
  };
  if (writeMaster) {
    out.masterSheet = sheetName;
    out.masterXlsx = pricingXlsxForModality(modality);
  }
  console.log(JSON.stringify(out, null, 2));
  return { modality, sheetName, excelRows, merge: officialCompareMerge(modality) };
}

async function main() {
  const { modality, filterIds } = parseArgs(process.argv.slice(2));

  if (modality === "all") {
    const results = [];
    const textR = await runTextCompareHub(filterIds, { writeMaster: false });
    if (textR) results.push(textR);
    for (const m of MODALITIES.filter((x) => x !== "text")) {
      const r = await runModality(m, filterIds, { writeMaster: false });
      if (r) results.push(r);
    }
    if (!results.length) process.exit(1);

    for (const r of results) {
      mergeModalityWorkbook(r.modality, [
        {
          name: r.sheetName,
          rows: r.excelRows,
          merge: r.merge,
        },
      ]);
    }
    console.log(
      JSON.stringify(
        {
          workbooks: {
            text: TEXT_PRICING_XLSX,
            image: IMAGE_PRICING_XLSX,
            video: VIDEO_PRICING_XLSX,
          },
          sheets: results.map((r) => ({
            modality: r.modality,
            sheet: r.sheetName,
            xlsx: pricingXlsxForModality(r.modality),
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!MODALITIES.includes(modality)) {
    console.error(`无效 --modality=${modality}；可选 text | image | video | all`);
    process.exit(1);
  }

  const r = await runModality(modality, filterIds);
  if (!r) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
