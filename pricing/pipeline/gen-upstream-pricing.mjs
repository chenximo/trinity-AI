#!/usr/bin/env node
/**
 * Trinity 价目汇总 → 多文件 Markdown（便于导出 Excel）
 * - summary.md：58 款生文 · 全档位 · 上游官网对比 + 用户价
 * - supplier-tokenhub-guangzhou.md
 * - supplier-aigc-domestic.md / supplier-aigc-international.md
 * - upstream-pricing.json
 */

import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  buildTierMap,
  compareField,
  summarizeRow,
  fmtDiscount,
  fmtCostCell,
  calcCostTriple,
  pickBailianModels,
  pickTokenhubModels,
  tierSortKey,
} from "./lib/pricing-compare.mjs";
import { cell, joinLines } from "./lib/render-markdown.mjs";
import {
  buildSupplierRows,
} from "./lib/build-rows.mjs";
import {
  CNY_PER_M,
  buildSupplierTableHeader,
} from "./lib/units.mjs";
import { writeCsv, MERGE_SUPPLIER, mergeModalityWorkbook } from "./lib/export-excel.mjs";
import { renderOpenRouterMarkdown } from "./lib/compare-openrouter-lib.mjs";
import { buildOpenRouterTextSheet } from "./lib/openrouter-text-sheet.mjs";
import {
  buildSupplierOfficialSummaryReport,
  buildSupplierOfficialSummaryExcelRows,
  SUPPLIER_SUMMARY_SHEET,
} from "./lib/supplier-official-summary.mjs";
import { PRICING_SHEET, SHEET_META } from "../suppliers/aigc/data/pricing-sheet.mjs";
import {
  normalizeAigcPricing,
  indexAigcByTrinity,
} from "../suppliers/aigc/lib/pricing-api.mjs";
import { indexOnlinePrices } from "./lib/parse-online-prices.mjs";
import { renderOutputReadme } from "./lib/output-readme.mjs";
import {
  buildTextCompareHubFromModels,
  loadTextCompareHubContext,
  writeTextCompareHubExports,
  TEXT_COMPARE_SHEET,
  MERGE_COMPARE_TEXT,
} from "./lib/compare-hub-lib.mjs";
import {
  OUT_DIR,
  OUT_UPSTREAM_DIR,
  README_FILE,
  OUT_OPENROUTER_DIR,
  OPENROUTER_TEXT_MD,
  OPENROUTER_TEXT_JSON,
  UPSTREAM_PRICING_FILE,
  TRINITY_MODELS_CACHE_FILE,
  PRICES_API_FILE,
  TEXT_PRICING_XLSX,
  upstreamSupplierPaths,
  DISCOUNTS_FILE,
  TOKENHUB_FILE,
  BAILIAN_FILE,
  AIGC_MAP_FILE,
  AIGC_OUT_FILE,
  AIGC_SHEET_PATH,
} from "./lib/paths.mjs";

const TRINITY_MODELS_CACHE = TRINITY_MODELS_CACHE_FILE;

const DEFAULT_TRINITY_BASE = "https://api.trinitydesk.ai/v1";

const SUPPLIERS = [
  {
    key: "tokenhub",
    outFile: "guangzhou",
    title: "腾讯云 TokenHub · 广州（ap-guangzhou）",
    region: "ap-guangzhou",
    excelSheet: "TokenHub广州",
    priceUnit: "元/百万 tokens",
    idKey: "thId",
    inKey: "thIn",
    outKey: "thOut",
    cacheKey: "thCache",
    discountKey: "thDiscount",
    costKey: "thCost",
    officialPrefix: "TH",
  },
  {
    key: "bailian",
    outFile: "beijing",
    title: "阿里云百炼 · 华北2（北京）· 中国内地",
    region: "华北2 北京",
    excelSheet: "百炼北京",
    priceUnit: "元/百万 tokens",
    idKey: "blId",
    inKey: "blIn",
    outKey: "blOut",
    cacheKey: "blCache",
    discountKey: "blDiscount",
    costKey: "blCost",
    officialPrefix: "BL",
  },
  {
    key: "aigc-domestic",
    outFile: "pricing",
    title: "腾讯云 AIGC · 国内站",
    region: "国内站",
    excelSheet: "AIGC国内站",
    priceUnit: "元/百万 tokens",
    catalog: "aigc",
    site: "domestic",
    idKey: "aigcDomId",
    inKey: "aigcDomIn",
    outKey: "aigcDomOut",
    cacheKey: "aigcDomCache",
    discountKey: "aigcDomDiscount",
    costKey: "aigcDomCost",
    officialPrefix: "AIGC-CN",
  },
  {
    key: "aigc-international",
    outFile: "pricing",
    title: "腾讯云 AIGC · 国际站",
    region: "国际站",
    excelSheet: "AIGC国际站",
    priceUnit: "美元/百万 tokens",
    catalog: "aigc",
    site: "international",
    idKey: "aigcIntlId",
    inKey: "aigcIntlIn",
    outKey: "aigcIntlOut",
    cacheKey: "aigcIntlCache",
    discountKey: "aigcIntlDiscount",
    costKey: "aigcIntlCost",
    officialPrefix: "AIGC-INTL",
  },
];

async function loadDiscounts() {
  try {
    return JSON.parse(await readFile(DISCOUNTS_FILE, "utf8"));
  } catch {
    return { suppliers: {}, modelOverrides: {} };
  }
}

function resolveDiscount(discounts, modelId, supplier) {
  const overrides = discounts.modelOverrides ?? {};
  const key = modelId.toLowerCase();
  const model = overrides[key];
  const fromModel = model?.[supplier]?.discount;
  if (fromModel != null) return fromModel;
  return discounts.suppliers?.[supplier]?.defaultDiscount ?? null;
}

function enrichTierCosts(tier, modelId, discounts) {
  const thDiscount = resolveDiscount(discounts, modelId, "tokenhub");
  const blDiscount = resolveDiscount(discounts, modelId, "bailian");
  const aigcDomDiscount = resolveDiscount(discounts, modelId, "aigc-domestic");
  const aigcIntlDiscount = resolveDiscount(discounts, modelId, "aigc-international");
  return {
    ...tier,
    thDiscount,
    blDiscount,
    aigcDomDiscount,
    aigcIntlDiscount,
    thCost: calcCostTriple(tier.thIn, tier.thOut, tier.thCache, thDiscount),
    blCost: calcCostTriple(tier.blIn, tier.blOut, tier.blCache, blDiscount),
    aigcDomCost: calcCostTriple(
      tier.aigcDomIn,
      tier.aigcDomOut,
      tier.aigcDomCache,
      aigcDomDiscount,
    ),
    aigcIntlCost: calcCostTriple(
      tier.aigcIntlIn,
      tier.aigcIntlOut,
      tier.aigcIntlCache,
      aigcIntlDiscount,
    ),
  };
}

async function loadAigcPricing() {
  let trinityMap = {};
  try {
    trinityMap = JSON.parse(await readFile(AIGC_MAP_FILE, "utf8"));
    delete trinityMap._comment;
  } catch {
    /* optional */
  }
  const models = normalizeAigcPricing(PRICING_SHEET, trinityMap);
  await mkdir(path.dirname(AIGC_OUT_FILE), { recursive: true });
  await writeFile(
    AIGC_OUT_FILE,
    JSON.stringify(
      {
        ...SHEET_META,
        generatedAt: new Date().toISOString(),
        modelCount: models.length,
        models,
      },
      null,
      2,
    ),
    "utf8",
  );
  return { models, ...indexAigcByTrinity(models) };
}

async function loadTrinityTextModels() {
  const base = (process.env.TRINITY_BASE_URL || DEFAULT_TRINITY_BASE).replace(
    /\/$/,
    "",
  );
  const key = process.env.TRINITY_API_KEY;
  const headers = { Accept: "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;

  try {
    const res = await fetch(`${base}/models?modality=text`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    await mkdir(OUT_UPSTREAM_DIR, { recursive: true });
    await writeFile(TRINITY_MODELS_CACHE, JSON.stringify(body, null, 2), "utf8");
    return parseTrinityModels(body);
  } catch (e) {
    try {
      const cached = JSON.parse(await readFile(TRINITY_MODELS_CACHE, "utf8"));
      console.warn("Trinity API fetch failed, using cache:", e.message);
      return parseTrinityModels(cached);
    } catch {
      return null;
    }
  }
}

function parseTrinityModels(body) {
  return (body.data ?? []).map((m) => {
    const md = m.metadata ?? {};
    return {
      id: m.id,
      displayName: md.display_name ?? m.id,
      brand: md.origin_vendor_name ?? m.owned_by ?? "—",
      userInputUsd: md.user_input_price_per_million_usd ?? null,
      userOutputUsd: md.user_output_price_per_million_usd ?? null,
      userCacheUsd: null,
    };
  });
}

/** 刊例以 GET /v1/prices 为准（run compare:fetch-prices）；无文件时回退 models metadata */
async function loadOnlinePricesMap() {
  try {
    const raw = JSON.parse(await readFile(PRICES_API_FILE, "utf8"));
    const map = indexOnlinePrices(raw.data ?? []);
    console.log(
      `Loaded online prices: ${map.size} models from prices-api.json (${raw.fetchedAt ?? "—"})`,
    );
    return map;
  } catch (e) {
    console.warn(
      "prices-api.json missing or invalid; 刊例 falls back to /models metadata. Run: npm run compare:fetch-prices",
      e.message,
    );
    return null;
  }
}

function applyOnlinePrices(trinityList, priceMap) {
  if (!priceMap?.size) return trinityList;
  return trinityList.map((t) => {
    const p = priceMap.get(t.id.toLowerCase());
    if (!p) return t;
    return {
      ...t,
      userInputUsd: p.input ?? t.userInputUsd,
      userOutputUsd: p.output ?? t.userOutputUsd,
      userCacheUsd: p.cache ?? null,
    };
  });
}

function mergeCatalog(trinityList, thModels, blMap, aigcDomMap, aigcIntlMap) {
  const thById = new Map(thModels.map((m) => [m.modelId.toLowerCase(), m]));
  const list = trinityList ?? thModels.map((m) => ({
    id: m.modelId,
    displayName: m.displayName || m.modelName,
    brand: m.brand,
    userInputUsd: null,
    userOutputUsd: null,
    userCacheUsd: null,
  }));

  return list.map((t) => {
    const id = t.id.toLowerCase();
    const th = thById.get(id) ?? null;
    const bl = blMap.get(id)?.model ?? null;
    return {
      trinityId: id,
      displayName: t.displayName || th?.displayName || bl?.displayName || id,
      brand: t.brand ?? th?.brand ?? bl?.brand ?? "—",
      userInputUsd: t.userInputUsd,
      userOutputUsd: t.userOutputUsd,
      userCacheUsd: t.userCacheUsd ?? null,
      tokenhub: th,
      bailian: bl,
      aigcDomestic: aigcDomMap.get(id) ?? null,
      aigcInternational: aigcIntlMap.get(id) ?? null,
    };
  });
}

function buildTierRows(entry) {
  const thMap = entry.tokenhub
    ? buildTierMap(entry.tokenhub.tiers ?? [])
    : new Map();
  const blMap = entry.bailian
    ? buildTierMap(entry.bailian.tiers ?? [], entry.trinityId)
    : new Map();
  const adMap = entry.aigcDomestic
    ? buildTierMap(entry.aigcDomestic.tiers ?? [])
    : new Map();
  const aiMap = entry.aigcInternational
    ? buildTierMap(entry.aigcInternational.tiers ?? [])
    : new Map();

  const keys = new Set([
    ...thMap.keys(),
    ...blMap.keys(),
    ...adMap.keys(),
    ...aiMap.keys(),
  ]);
  if (!keys.size) keys.add("uniform");

  return [...keys]
    .sort((a, b) => tierSortKey(a) - tierSortKey(b))
    .map((key) => {
      const th = thMap.get(key);
      const bl = blMap.get(key);
      const ad = adMap.get(key);
      const ai = aiMap.get(key);
      const tierLabel =
        th?.tierName ||
        bl?.tierName ||
        ad?.tierName ||
        ai?.tierName ||
        (key === "uniform" ? "统一价" : key);
      const cmpIn = compareField(th?.input, bl?.input);
      const cmpOut = compareField(th?.output, bl?.output);
      const cmpCache = compareField(th?.cache, bl?.cache);
      return {
        tierKey: key,
        tierLabel,
        thId: entry.tokenhub?.modelId ?? null,
        thIn: th?.input ?? null,
        thOut: th?.output ?? null,
        thCache: th?.cache ?? null,
        blId: entry.bailian?.modelId ?? null,
        blIn: bl?.input ?? null,
        blOut: bl?.output ?? null,
        blCache: bl?.cache ?? null,
        aigcDomId: entry.aigcDomestic?.upstreamModelId ?? null,
        aigcDomIn: ad?.input ?? null,
        aigcDomOut: ad?.output ?? null,
        aigcDomCache: ad?.cache ?? null,
        aigcIntlId: entry.aigcInternational?.upstreamModelId ?? null,
        aigcIntlIn: ai?.input ?? null,
        aigcIntlOut: ai?.output ?? null,
        aigcIntlCache: ai?.cache ?? null,
        cmpIn: cmpIn.text,
        cmpOut: cmpOut.text,
        cmpCache: cmpCache.text,
        summary: summarizeRow(cmpIn, cmpOut, cmpCache),
        supplierCount:
          (th?.input != null || th?.output != null ? 1 : 0) +
          (bl?.input != null || bl?.output != null ? 1 : 0) +
          (ad?.input != null || ad?.output != null ? 1 : 0) +
          (ai?.input != null || ai?.output != null ? 1 : 0),
      };
    });
}

function supplierRows(sup, models, officialCtx) {
  return buildSupplierRows(sup, models, officialCtx);
}

function renderSupplierMd(sup, models, scrapedAt, aigcDate, officialCtx) {
  const date = sup.catalog === "aigc" ? aigcDate : scrapedAt;
  const unit = sup.priceUnit ?? CNY_PER_M;
  const headerCols = buildSupplierTableHeader(sup);
  const lines = [
    `# ${sup.title}`,
    "",
    `> 供应商：**${sup.key}** · 区域：**${sup.region}** · 数据日期：${date}`,
    `> 供应商挂牌/成本单位：**${unit}**（每百万 tokens，单元格内 入/出/缓）`,
    `> **范围**：Trinity 生文模型（${models.length} 款）中本供应商有挂牌价的行`,
    `> **厂商官方价**：模型厂商官网挂牌（\`suppliers/official\`），同档对照`,
    `> 折扣配置：\`supplier-discounts.json\` → suppliers.${sup.key}`,
    ...(sup.catalog === "aigc"
      ? [`> 数据源：\`${AIGC_SHEET_PATH}\``]
      : []),
    "",
    `| ${headerCols.join(" | ")} |`,
    `| ${headerCols.map(() => "---").join(" | ")} |`,
  ];

  const [, ...bodyRows] = supplierRows(sup, models, officialCtx);
  let modelCount = 0;
  let seen = false;

  for (const row of bodyRows) {
    const tid = row[1];
    const display = row[2];
    if (tid || (display && !seen)) modelCount++;
    if (tid || display) seen = !!display;
    if (!tid && !display) seen = false;
    lines.push(`| ${row.map((c) => cell(c)).join(" | ")} |`);
  }

  if (!bodyRows.length) {
    lines.push(
      `| ${headerCols.map(() => "—").join(" | ")} |`,
    );
  }

  lines.push(
    "",
    `> 有价模型：**${modelCount}** · 档位行：**${bodyRows.length}**`,
    "",
    "## 填数说明",
    "",
    "| 列 | 来源 |",
    "|----|------|",
    "| 厂商官方价 | `suppliers/official/output/text/vendor-pricing.json` |",
    `| 供应商挂牌 / 成本 | 上游供应商挂牌与协议成本（**${unit}**） |`,
    "| 供应商vs官方 | 同档入/出/缓相对厂商官方的偏差 |",
    "| 折扣 | `supplier-discounts.json`，0.85 = 85 折 |",
    `| 生文刊例校验 | \`upstream/summary.md\` 与 Excel \`${TEXT_COMPARE_SHEET}\` |`,
    "",
  );

  return joinLines(lines);
}

async function main() {
  const thData = JSON.parse(await readFile(TOKENHUB_FILE, "utf8"));
  const blData = JSON.parse(await readFile(BAILIAN_FILE, "utf8"));
  const discounts = await loadDiscounts();
  const { models: aigcModels, domestic: aigcDomMap, international: aigcIntlMap } =
    await loadAigcPricing();

  const trinityListRaw = await loadTrinityTextModels();
  if (!trinityListRaw?.length) {
    console.error("Failed to load Trinity models (API + cache)");
    process.exit(1);
  }

  const priceMap = await loadOnlinePricesMap();
  const trinityList = applyOnlinePrices(trinityListRaw, priceMap);

  const thModels = pickTokenhubModels(thData.models ?? []);
  const blMap = pickBailianModels(blData.models ?? []);
  const catalog = mergeCatalog(
    trinityList,
    thModels,
    blMap,
    aigcDomMap,
    aigcIntlMap,
  );

  const models = catalog.map((entry) => ({
    ...entry,
    tiers: buildTierRows(entry).map((t) =>
      enrichTierCosts(t, entry.trinityId, discounts),
    ),
  }));

  const scrapedAt =
    thData.scrapedAt?.slice(0, 10) ?? blData.scrapedAt?.slice(0, 10) ?? "—";
  const aigcDate = SHEET_META.dataDate ?? "—";
  const generatedAt = new Date().toISOString().slice(0, 19) + "Z";

  await mkdir(OUT_UPSTREAM_DIR, { recursive: true });

  const jsonOut = {
    source: "trinity_upstream_pricing",
    generatedAt: new Date().toISOString(),
    trinityModelCount: models.length,
    trinityApiUrl: `${DEFAULT_TRINITY_BASE}/models?modality=text`,
    scrapedAt,
    aigcDataDate: aigcDate,
    files: {
      summary: "upstream/summary.md",
      summaryJson: "official/text.json",
      compareOfficialMd: "official/text.md",
      compareOfficialCsv: "official/text.csv",
      excel: "trinity-pricing-text.xlsx",
      excelByModality: {
        text: "trinity-pricing-text.xlsx",
        image: "trinity-pricing-image.xlsx",
        video: "trinity-pricing-video.xlsx",
      },
      summaryCsv: "upstream/summary.csv",
      upstreamJson: "upstream/upstream-pricing.json",
      tokenhub: "upstream/tokenhub/guangzhou.md",
      bailian: "upstream/bailian/beijing.md",
      aigcDomestic: "upstream/aigc-domestic/pricing.md",
      aigcInternational: "upstream/aigc-international/pricing.md",
      aigcJson: "suppliers/aigc/output/pricing-api.json",
      onlinePrices: "online/prices-api.json",
      openrouter: "openrouter/text.md",
    },
    models: models.map((m) => ({
      trinityId: m.trinityId,
      displayName: m.displayName,
      brand: m.brand,
      userPriceUsd: {
        input: m.userInputUsd,
        output: m.userOutputUsd,
        cache: m.userCacheUsd,
      },
      tokenhubModelId: m.tokenhub?.modelId ?? null,
      bailianModelId: m.bailian?.modelId ?? null,
      tiers: m.tiers,
    })),
  };

  const hubCtx = await loadTextCompareHubContext();

  const compareReport = buildTextCompareHubFromModels(models, {
    ...hubCtx,
    thModels: thModels,
    blModels: [...blMap.values()].map((x) => x.model),
    generatedAt: new Date().toISOString(),
  });

  const { excelRows: compareExcelRows, paths: comparePaths } =
    await writeTextCompareHubExports(compareReport, writeFile);

  for (const sup of SUPPLIERS) {
    const out = upstreamSupplierPaths(sup.key, sup.outFile);
    await mkdir(out.dir, { recursive: true });
    await writeFile(
      out.md,
        renderSupplierMd(sup, models, scrapedAt, aigcDate, hubCtx),
      "utf8",
    );
  }

  await writeFile(
    README_FILE,
    renderOutputReadme({
      generatedAt,
      modelCount: models.length,
      scrapedAt,
      aigcDate,
    }),
    "utf8",
  );

  await writeFile(
    UPSTREAM_PRICING_FILE,
    JSON.stringify(jsonOut, null, 2),
    "utf8",
  );

  const orSheet = await buildOpenRouterTextSheet();
  await mkdir(OUT_OPENROUTER_DIR, { recursive: true });
  await writeFile(
    OPENROUTER_TEXT_MD,
    renderOpenRouterMarkdown(orSheet.report),
    "utf8",
  );
  await writeFile(
    OPENROUTER_TEXT_JSON,
    JSON.stringify(orSheet.report, null, 2),
    "utf8",
  );

  const summaryReport = buildSupplierOfficialSummaryReport(
    SUPPLIERS,
    models,
    hubCtx,
    { generatedAt },
  );
  const summaryExcelRows = buildSupplierOfficialSummaryExcelRows(summaryReport);

  const excelSheets = [
    { name: TEXT_COMPARE_SHEET, rows: compareExcelRows, merge: MERGE_COMPARE_TEXT },
    ...SUPPLIERS.map((sup) => ({
      name: sup.excelSheet,
      rows: supplierRows(sup, models, hubCtx),
      merge: MERGE_SUPPLIER,
    })),
    {
      name: SUPPLIER_SUMMARY_SHEET,
      rows: summaryExcelRows,
    },
  ];
  const textXlsx = mergeModalityWorkbook("text", excelSheets);

  const legacyXlsx = path.join(OUT_DIR, "trinity-pricing.xlsx");
  if (existsSync(legacyXlsx)) {
    await unlink(legacyXlsx);
    console.log(`Removed legacy ${legacyXlsx} (split into text/image/video workbooks)`);
  }


  for (const sup of SUPPLIERS) {
    const out = upstreamSupplierPaths(sup.key, sup.outFile);
    await writeCsv(
      out.csv,
      supplierRows(sup, models, hubCtx),
      writeFile,
    );
  }

  const thModelsOnSup = models.filter((m) =>
    m.tiers.some((t) => t.thIn != null || t.thOut != null),
  ).length;
  const blModelsOnSup = models.filter((m) =>
    m.tiers.some((t) => t.blIn != null || t.blOut != null),
  ).length;
  const aigcMapped = models.filter(
    (m) => m.aigcDomestic || m.aigcInternational,
  ).length;

  console.log(`Trinity models: ${models.length}`);
  console.log(
    `TokenHub priced: ${thModelsOnSup} · Bailian priced: ${blModelsOnSup} · AIGC mapped: ${aigcMapped}`,
  );
  console.log(
    `AIGC catalog: ${aigcModels.length} entries (国内 ${aigcModels.filter((m) => m.site === "domestic").length} · 国际 ${aigcModels.filter((m) => m.site === "international").length})`,
  );
  console.log(`Wrote ${comparePaths.summaryMd}`);
  console.log(`Wrote ${comparePaths.summaryCsv}`);
  console.log(`Wrote ${comparePaths.officialMd}`);
  console.log(`Wrote ${comparePaths.officialJson}`);
  console.log(`Wrote ${comparePaths.officialCsv}`);
  for (const sup of SUPPLIERS) {
    const out = upstreamSupplierPaths(sup.key, sup.outFile);
    console.log(`Wrote ${out.md}`);
    console.log(`Wrote ${out.csv}`);
  }
  console.log(`Wrote ${README_FILE}`);
  console.log(`Wrote ${OPENROUTER_TEXT_MD}`);
  console.log(`Wrote ${textXlsx} (Sheets: ${excelSheets.map((s) => s.name).join(" · ")})`);
  console.log(`Wrote ${UPSTREAM_PRICING_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
