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
  pickBailianModels,
  pickTokenhubModels,
  listBailianMainlandTextModels,
  tierSortKey,
} from "./lib/pricing-compare.mjs";
import { buildSupplierTrinityLookup } from "../config/tokenhub-trinity-alias.mjs";
import { cell, joinLines } from "./lib/render-markdown.mjs";
import {
  buildSupplierRows,
  buildVolcengineCatalogRows,
  buildOfficialDirectCatalogRows,
  buildTokenhubTextCatalogRows,
  buildBailianTextCatalogRows,
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
import { indexVolcengineByTrinity } from "../suppliers/volcengine/lib/pricing-api.mjs";
import { DOC_URL as VOLC_DOC_URL } from "../suppliers/volcengine/lib/constants.mjs";
import {
  indexByTrinity,
} from "../suppliers/official-direct/lib/from-official.mjs";
import { buildOfficialDirectChannel } from "../suppliers/official-direct/lib/build-channel.mjs";
import { refreshOnlinePricesForCompare } from "./lib/fetch-online-prices-lib.mjs";
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
  TEXT_PRICING_XLSX,
  upstreamSupplierPaths,
  TOKENHUB_FILE,
  BAILIAN_FILE,
  AIGC_MAP_FILE,
  AIGC_OUT_FILE,
  AIGC_SHEET_PATH,
  VOLCENGINE_FILE,
  VOLCENGINE_MAP_FILE,
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
    officialPrefix: "AIGC-INTL",
  },
  {
    key: "volcengine",
    outFile: "pricing",
    title: "火山方舟 · 豆包（按量付费）",
    region: "中国内地",
    excelSheet: "火山方舟",
    priceUnit: "元/百万 tokens",
    catalog: "volcengine",
    idKey: "volId",
    inKey: "volIn",
    outKey: "volOut",
    cacheKey: "volCache",
    officialPrefix: "VOL",
  },
  {
    key: "wangju-cloudportal",
    outFile: "pricing",
    title: "网聚云联 · 云门户（GPT / Gemini 原厂直连）",
    region: "原厂直连",
    excelSheet: "网聚云联云门户",
    priceUnit: "美元/百万 tokens",
    catalog: "wangju-cloudportal",
    idKey: "wjId",
    inKey: "wjIn",
    outKey: "wjOut",
    cacheKey: "wjCache",
    officialPrefix: "WJYL",
  },
  {
    key: "relay-cust",
    outFile: "pricing",
    title: "中转站-cust（AIUPNode · 原厂直连）",
    region: "原厂直连",
    excelSheet: "中转站-cust",
    priceUnit: "按 official 币种/百万 tokens",
    catalog: "relay-cust",
    idKey: "rcId",
    inKey: "rcIn",
    outKey: "rcOut",
    cacheKey: "rcCache",
    officialPrefix: "RC",
  },
];

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

async function loadVolcenginePricing() {
  let payload;
  try {
    payload = JSON.parse(await readFile(VOLCENGINE_FILE, "utf8"));
  } catch {
    throw new Error(
      `缺少火山方舟价目 ${VOLCENGINE_FILE}；请先运行 npm run pricing:supplier:volcengine`,
    );
  }
  const models = payload.models ?? [];
  return {
    models,
    byTrinity: indexVolcengineByTrinity(models),
    dataDate: payload.dataDate ?? payload.scrapedAt?.slice(0, 7) ?? null,
  };
}

async function loadOfficialDirectPricing(supplierId) {
  const { models } = await buildOfficialDirectChannel(supplierId);
  return { models, byTrinity: indexByTrinity(models) };
}

async function loadWangjuCloudportalPricing() {
  return loadOfficialDirectPricing("wangju-cloudportal");
}

async function loadRelayCustPricing() {
  return loadOfficialDirectPricing("relay-cust");
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

function mergeCatalog(trinityList, thModels, blMap, aigcDomMap, aigcIntlMap, volcMap, wangjuMap, relayCustMap) {
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
      volcengine: volcMap.get(id) ?? null,
      wangjuCloudportal: wangjuMap.get(id) ?? null,
      relayCust: relayCustMap.get(id) ?? null,
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
  const volMap = entry.volcengine
    ? buildTierMap(entry.volcengine.tiers ?? [])
    : new Map();
  const wjMap = entry.wangjuCloudportal
    ? buildTierMap(entry.wangjuCloudportal.tiers ?? [])
    : new Map();
  const rcMap = entry.relayCust
    ? buildTierMap(entry.relayCust.tiers ?? [])
    : new Map();

  const keys = new Set([
    ...thMap.keys(),
    ...blMap.keys(),
    ...adMap.keys(),
    ...aiMap.keys(),
    ...volMap.keys(),
    ...wjMap.keys(),
    ...rcMap.keys(),
  ]);
  if (!keys.size) keys.add("uniform");

  return [...keys]
    .sort((a, b) => tierSortKey(a) - tierSortKey(b))
    .map((key) => {
      const th = thMap.get(key);
      const bl = blMap.get(key);
      const ad = adMap.get(key);
      const ai = aiMap.get(key);
      const vol = volMap.get(key);
      const wj = wjMap.get(key);
      const rc = rcMap.get(key);
      const tierLabel =
        th?.tierName ||
        bl?.tierName ||
        ad?.tierName ||
        ai?.tierName ||
        vol?.tierName ||
        wj?.tierName ||
        rc?.tierName ||
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
        volId: entry.volcengine?.upstreamModelId ?? null,
        volIn: vol?.input ?? null,
        volOut: vol?.output ?? null,
        volCache: vol?.cache ?? null,
        wjId: entry.wangjuCloudportal?.upstreamModelId ?? null,
        wjIn: wj?.input ?? null,
        wjOut: wj?.output ?? null,
        wjCache: wj?.cache ?? null,
        rcId: entry.relayCust?.upstreamModelId ?? null,
        rcIn: rc?.input ?? null,
        rcOut: rc?.output ?? null,
        rcCache: rc?.cache ?? null,
        cmpIn: cmpIn.text,
        cmpOut: cmpOut.text,
        cmpCache: cmpCache.text,
        summary: summarizeRow(cmpIn, cmpOut, cmpCache),
        supplierCount:
          (th?.input != null || th?.output != null ? 1 : 0) +
          (bl?.input != null || bl?.output != null ? 1 : 0) +
          (ad?.input != null || ad?.output != null ? 1 : 0) +
          (ai?.input != null || ai?.output != null ? 1 : 0) +
          (vol?.input != null || vol?.output != null ? 1 : 0) +
          (wj?.input != null || wj?.output != null ? 1 : 0) +
          (rc?.input != null || rc?.output != null ? 1 : 0),
      };
    });
}

function supplierRows(
  sup,
  models,
  officialCtx,
  volcModels = [],
  wangjuModels = [],
  relayCustModels = [],
  { thModels = [], blModels = [], resolveTrinityId = () => "" } = {},
) {
  if (sup.key === "tokenhub") {
    return buildTokenhubTextCatalogRows(thModels, officialCtx, resolveTrinityId);
  }
  if (sup.key === "bailian") {
    return buildBailianTextCatalogRows(blModels, officialCtx, resolveTrinityId);
  }
  if (sup.catalog === "volcengine") {
    return buildVolcengineCatalogRows(volcModels, officialCtx);
  }
  if (sup.catalog === "wangju-cloudportal") {
    return buildOfficialDirectCatalogRows(wangjuModels, officialCtx, {
      catalog: "wangju-cloudportal",
      brandDefault: "网聚云联-云门户",
      mixedCurrency: false,
    });
  }
  if (sup.catalog === "relay-cust") {
    return buildOfficialDirectCatalogRows(relayCustModels, officialCtx, {
      catalog: "relay-cust",
      brandDefault: "中转站-cust",
      mixedCurrency: true,
    });
  }
  return buildSupplierRows(sup, models, officialCtx);
}

function renderSupplierMd(
  sup,
  models,
  scrapedAt,
  aigcDate,
  officialCtx,
  volcModels = [],
  wangjuModels = [],
  relayCustModels = [],
  supplierCatalogCtx = {},
) {
  const { thModels = [], blModels = [] } = supplierCatalogCtx;
  const date =
    sup.catalog === "aigc"
      ? aigcDate
      : sup.catalog === "volcengine"
        ? (officialCtx?.volcengineDataDate ?? scrapedAt?.slice(0, 7) ?? "—")
        : sup.catalog === "wangju-cloudportal"
          ? (officialCtx?.officialFetchedAt?.slice?.(0, 10) ?? "—")
          : sup.catalog === "relay-cust"
            ? (officialCtx?.officialFetchedAt?.slice?.(0, 10) ?? "—")
            : scrapedAt;
  const unit = sup.priceUnit ?? CNY_PER_M;
  const headerCols = buildSupplierTableHeader(sup);
  const lines = [
    `# ${sup.title}`,
    "",
    `> 供应商：**${sup.key}** · 区域：**${sup.region}** · 数据日期：${date}`,
    `> 供应商挂牌单位：**${unit}**（每百万 tokens，单元格内 入/出/缓）`,
    `> **范围**：${
      sup.key === "tokenhub"
        ? `TokenHub 控制台生文模型全目录（${thModels.length} 款）；按厂商 + 模型 ID 排序，同系列相邻`
        : sup.key === "bailian"
          ? `百炼华北2 中国内地生文（${blModels.length} 款，按 modelId 去重；同 ID 多文档分区暂不拆分）`
          : sup.catalog === "volcengine"
        ? `火山方舟生文模型全目录（${volcModels.length} 款）`
        : sup.catalog === "wangju-cloudportal"
          ? `云门户 GPT/Gemini 原厂直连（${wangjuModels.length} 款，对齐 official）`
          : sup.catalog === "relay-cust"
            ? `中转站-cust 原厂直连（${relayCustModels.length} 款，全量对齐 official）`
            : `Trinity 生文模型（${models.length} 款）中本供应商有挂牌价的行`
    }`,
    `> **厂商官方价**：模型厂商官网挂牌（\`suppliers/official\`），同档对照`,
    ...(sup.key === "tokenhub"
      ? [
          `> 数据源：\`suppliers/tokenhub/output/pricing-console-api.json\``,
          `> 抓取：\`npm run pricing:supplier:tokenhub:console\``,
        ]
      : []),
    ...(sup.key === "bailian"
      ? [
          `> 数据源：\`suppliers/bailian/output/pricing-api.json\``,
          `> 抓取：\`npm run pricing:supplier:bailian:doc\``,
        ]
      : []),
    ...(sup.catalog === "aigc"
      ? [`> 数据源：\`${AIGC_SHEET_PATH}\``]
      : []),
    ...(sup.catalog === "volcengine"
      ? [
          `> 数据源：[模型价格 · 火山方舟](${VOLC_DOC_URL})`,
          `> 抓取：\`suppliers/volcengine/scrape-pricing.mjs\` → \`output/text/pricing-api.json\``,
        ]
      : []),
    ...(sup.catalog === "wangju-cloudportal"
      ? [
          `> 数据源：\`suppliers/official/output/text/vendor-pricing.json\`（筛选 openai / google）`,
          `> 生成：\`npm run pricing:supplier:wangju-cloudportal\``,
        ]
      : []),
    ...(sup.catalog === "relay-cust"
      ? [
          `> 门户：[AIUPNode 模型广场](https://www.aiupnode.com/pricing)`,
          `> 数据源：\`suppliers/official/output/text/vendor-pricing.json\`（全量复制）`,
          `> 生成：\`npm run pricing:supplier:relay-cust\``,
        ]
      : []),
    "",
    `| ${headerCols.join(" | ")} |`,
    `| ${headerCols.map(() => "---").join(" | ")} |`,
  ];

  const [, ...bodyRows] = supplierRows(
    sup,
    models,
    officialCtx,
    volcModels,
    wangjuModels,
    relayCustModels,
    { thModels, blModels, resolveTrinityId: supplierCatalogCtx.resolveTrinityId },
  );
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
    `| 供应商挂牌 | 上游供应商挂牌价（**${unit}**） |`,
    "| 供应商vs官方 | 同档入/出/缓相对厂商官方的偏差 |",
    "| 线上刊例 | `GET /v1/prices` 当前挂牌（USD/百万 tokens）；未接入为 — |",
    "| 刊例vs供应商 | 线上刊例 vs 本行供应商挂牌（CNY 挂牌按 ÷6.5 换 USD 对比） |",
    `| 生文刊例校验 | \`upstream/summary.md\` 与 Excel \`${TEXT_COMPARE_SHEET}\` |`,
    "",
  );

  return joinLines(lines);
}

async function main() {
  const thData = JSON.parse(await readFile(TOKENHUB_FILE, "utf8"));
  const blData = JSON.parse(await readFile(BAILIAN_FILE, "utf8"));
  const { models: aigcModels, domestic: aigcDomMap, international: aigcIntlMap } =
    await loadAigcPricing();
  const { models: volcModels, byTrinity: volcMap, dataDate: volcDataDate } =
    await loadVolcenginePricing();
  const { models: wangjuModels, byTrinity: wangjuMap } =
    await loadWangjuCloudportalPricing();
  const { models: relayCustModels, byTrinity: relayCustMap } =
    await loadRelayCustPricing();

  const trinityListRaw = await loadTrinityTextModels();
  if (!trinityListRaw?.length) {
    console.error("Failed to load Trinity models (API + cache)");
    process.exit(1);
  }

  const onlinePrices = await refreshOnlinePricesForCompare("text");
  const priceMap = onlinePrices.map;
  const trinityList = applyOnlinePrices(trinityListRaw, priceMap);

  const thModels = pickTokenhubModels(thData.models ?? []);
  const blCatalogModels = listBailianMainlandTextModels(blData.models ?? []);
  const resolveTrinityId = buildSupplierTrinityLookup(trinityList.map((t) => t.id));
  const supplierCatalogCtx = {
    thModels,
    blModels: blCatalogModels,
    resolveTrinityId,
  };
  const blMap = pickBailianModels(blData.models ?? []);
  const catalog = mergeCatalog(
    trinityList,
    thModels,
    blMap,
    aigcDomMap,
    aigcIntlMap,
    volcMap,
    wangjuMap,
    relayCustMap,
  );

  const models = catalog.map((entry) => ({
    ...entry,
    tiers: buildTierRows(entry),
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
      volcengine: "upstream/volcengine/pricing.md",
      wangjuCloudportal: "upstream/wangju-cloudportal/pricing.md",
      relayCust: "upstream/relay-cust/pricing.md",
      aigcJson: "suppliers/aigc/output/pricing-api.json",
      volcengineJson: "suppliers/volcengine/output/pricing-api.json",
      wangjuCloudportalJson: "suppliers/wangju-cloudportal/output/pricing-api.json",
      relayCustJson: "suppliers/relay-cust/output/pricing-api.json",
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

  const hubCtx = {
    ...(await loadTextCompareHubContext({ preloaded: onlinePrices })),
    volcengineDataDate: volcDataDate,
  };

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
        renderSupplierMd(
          sup,
          models,
          scrapedAt,
          aigcDate,
          hubCtx,
          volcModels,
          wangjuModels,
          relayCustModels,
          supplierCatalogCtx,
        ),
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

  const orSheet = await buildOpenRouterTextSheet([], { preloaded: onlinePrices });
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
    {
      name: SUPPLIER_SUMMARY_SHEET,
      rows: summaryExcelRows,
    },
    ...SUPPLIERS.map((sup) => ({
      name: sup.excelSheet,
      rows: supplierRows(
        sup,
        models,
        hubCtx,
        volcModels,
        wangjuModels,
        relayCustModels,
        supplierCatalogCtx,
      ),
      merge: MERGE_SUPPLIER,
    })),
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
      supplierRows(
        sup,
        models,
        hubCtx,
        volcModels,
        wangjuModels,
        relayCustModels,
        supplierCatalogCtx,
      ),
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
  const volcMapped = models.filter((m) => m.volcengine).length;
  const wangjuMapped = models.filter((m) => m.wangjuCloudportal).length;
  const relayCustMapped = models.filter((m) => m.relayCust).length;

  console.log(`Trinity models: ${models.length}`);
  console.log(`TokenHub catalog: ${thModels.length} text models (Excel 全量)`);
  console.log(`Bailian catalog: ${blCatalogModels.length} mainland text models (按 modelId 去重)`);
  console.log(
    `TokenHub Trinity-mapped (刊例对比): ${thModelsOnSup} · Bailian Trinity-mapped: ${blModelsOnSup} · AIGC mapped: ${aigcMapped} · Volcengine mapped: ${volcMapped} · Wangju mapped: ${wangjuMapped} · Relay-cust mapped: ${relayCustMapped}`,
  );
  console.log(
    `AIGC catalog: ${aigcModels.length} entries (国内 ${aigcModels.filter((m) => m.site === "domestic").length} · 国际 ${aigcModels.filter((m) => m.site === "international").length})`,
  );
  console.log(`Volcengine catalog: ${volcModels.length} entries`);
  console.log(`Wangju cloudportal catalog: ${wangjuModels.length} entries`);
  console.log(`Relay-cust catalog: ${relayCustModels.length} entries`);
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
