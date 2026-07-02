/**
 * 生文刊例校验总表：厂商官方价（锚）· AIGC 国际 / TokenHub / OpenRouter · 线上刊例
 */

import { readFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { MERGE_COMPARE_TEXT, writeCsv } from "./export-excel.mjs";
import { summaryTiersForModel } from "./build-rows.mjs";
import { parseNum } from "./pricing-compare.mjs";
import { parseOnlinePricesTiers } from "./parse-online-prices.mjs";
import { pickTierClosestToRef, tierLabelOf } from "./tier-align.mjs";
import { findTierByKey } from "./tier-key.mjs";
import {
  FIELD_MATCH_PCT,
  isCacheListingRounding,
  pctIsMaterial,
} from "./pricing-tolerance.mjs";
import {
  FX_ONLINE_DOMESTIC,
  formatOfficialSingleTier,
  formatTokenTextTier,
  num,
} from "./compare-official-lib.mjs";
import { refreshOnlinePricesForCompare } from "./fetch-online-prices-lib.mjs";
import {
  OFFICIAL_MAP_FILE,
  officialComparePaths,
  officialPricingFile,
  UPSTREAM_SUMMARY_MD,
  UPSTREAM_SUMMARY_CSV,
  SUPPLIERS_DIR,
} from "./paths.mjs";

export { MERGE_COMPARE_TEXT };

export const TEXT_COMPARE_SHEET = "刊例对比校验-生文";

const OR_MAP = path.join(SUPPLIERS_DIR, "openrouter/trinity-map.json");
const OR_FILE = path.join(SUPPLIERS_DIR, "openrouter/output/models-api.json");

function pctDelta(base, value) {
  if (base == null || value == null || base === 0) return null;
  return Math.round(((value - base) / base) * 1000) / 10;
}

function formatDeltaPct(pct) {
  if (pct == null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function formatFieldVsOfficial(label, pct, present = true) {
  if (!present) return null;
  if (pct == null) return `${label}—`;
  if (!pctIsMaterial(pct, FIELD_MATCH_PCT)) return `${label}✅`;
  return `${label}⚠${formatDeltaPct(pct)}`;
}

/** 入/出/缓 vs 官方，单列展示：一致 ✅，偏差 ⚠+X% */
function formatInOutCacheVsOfficial(
  { deltaIn, deltaOut, deltaCache },
  { active, refHasIn, refHasOut, refHasCache, offHasCache },
) {
  if (!active) return "—";
  const showCache = offHasCache || refHasCache;
  const parts = [
    formatFieldVsOfficial("入", deltaIn, refHasIn),
    formatFieldVsOfficial("出", deltaOut, refHasOut),
  ];
  if (showCache) {
    parts.push(formatFieldVsOfficial("缓", deltaCache, refHasCache));
  }
  return parts.filter(Boolean).join(" ") || "—";
}

function formatSupplierVsOfficial(cmp, opts) {
  return formatInOutCacheVsOfficial(cmp, opts);
}

function buildListingConclusion(offVsOnline, onlineNote, onlineTier, offHasCache) {
  if (onlineNote === "线上无同档刊例") return "ℹ 线上无同档";
  if (onlineNote === "线上音频未单独定价") return "ℹ 线上音频未单独定价";
  if (!onlineTier) return "—";

  return formatInOutCacheVsOfficial(
    {
      deltaIn: offVsOnline.dIn,
      deltaOut: offVsOnline.dOut,
      deltaCache: offVsOnline.dCache,
    },
    {
      active: true,
      refHasIn: num(onlineTier?.input) != null,
      refHasOut: num(onlineTier?.output) != null,
      refHasCache: num(onlineTier?.cache) != null,
      offHasCache,
    },
  );
}

function listingMaterialInOut(dIn, dOut) {
  return (
    pctIsMaterial(dIn, FIELD_MATCH_PCT) || pctIsMaterial(dOut, FIELD_MATCH_PCT)
  );
}

function formatUsdTier(tier) {
  if (!tier) return "—";
  const parts = [];
  if (tier.input != null) parts.push(`入 $${tier.input}`);
  if (tier.output != null) parts.push(`出 $${tier.output}`);
  if (tier.cache != null) parts.push(`缓 $${tier.cache}`);
  return parts.length ? parts.join(" · ") : "—";
}

function formatOnlineSingleTier(tier) {
  return formatUsdTier(tier);
}

function officialToUsd(tier, currency) {
  if (!tier) return null;
  const fx = currency === "CNY" ? FX_ONLINE_DOMESTIC : 1;
  return {
    input: tier.input != null ? tier.input / fx : null,
    output: tier.output != null ? tier.output / fx : null,
    cache: tier.cache != null ? tier.cache / fx : null,
  };
}

function cnyTierToUsd(tier) {
  if (!tier) return null;
  const input = parseNum(tier.input);
  const output = parseNum(tier.output);
  const cache = parseNum(tier.cache);
  if (input == null && output == null && cache == null) return null;
  return {
    input: input != null ? input / FX_ONLINE_DOMESTIC : null,
    output: output != null ? output / FX_ONLINE_DOMESTIC : null,
    cache: cache != null ? cache / FX_ONLINE_DOMESTIC : null,
  };
}

function refInputUsdFromTier(t) {
  const intl = parseNum(t.aigcIntlIn);
  if (intl != null) return intl;
  const th = parseNum(t.thIn);
  if (th != null) return th / FX_ONLINE_DOMESTIC;
  return null;
}

function compareUsdRefToOfficial(refUsd, offTier, offCurrency) {
  const offUsd = officialToUsd(offTier, offCurrency);
  if (!refUsd || !offUsd) {
    return {
      deltaIn: null,
      deltaOut: null,
      deltaCache: null,
      maxAbsInOut: null,
    };
  }
  const deltaIn = pctDelta(offUsd.input, refUsd.input);
  const deltaOut = pctDelta(offUsd.output, refUsd.output);
  const deltaCache = pctDelta(offUsd.cache, refUsd.cache);
  const inOutAbs = [deltaIn, deltaOut]
    .filter((v) => v != null)
    .map((v) => Math.abs(v));
  return {
    deltaIn,
    deltaOut,
    deltaCache,
    maxAbsInOut: inOutAbs.length ? Math.max(...inOutAbs) : null,
  };
}

function compareOfficialVsOnline(offTier, onlineTier, currency) {
  const offUsd = officialToUsd(offTier, currency);
  const onIn = num(onlineTier?.input);
  const onOut = num(onlineTier?.output);
  const onCache = num(onlineTier?.cache);
  const dIn = pctDelta(offUsd?.input, onIn);
  const dOut = pctDelta(offUsd?.output, onOut);
  const dCache = pctDelta(offUsd?.cache, onCache);

  const flags = [];
  const check = (label, pct) => {
    if (!pctIsMaterial(pct, FIELD_MATCH_PCT)) return;
    flags.push(`${label}${formatDeltaPct(pct)}`);
  };
  check("入", dIn);
  check("出", dOut);

  const inOutOk =
    !pctIsMaterial(dIn, FIELD_MATCH_PCT) &&
    !pctIsMaterial(dOut, FIELD_MATCH_PCT);
  const cacheMaterial =
    pctIsMaterial(dCache, FIELD_MATCH_PCT) &&
    !(inOutOk && isCacheListingRounding(offUsd?.cache, onCache));
  if (cacheMaterial) check("缓", dCache);

  return {
    deltaIn: formatDeltaPct(dIn),
    deltaOut: formatDeltaPct(dOut),
    deltaCache: formatDeltaPct(dCache),
    dIn,
    dOut,
    dCache,
    hasCache: offUsd?.cache != null || onCache != null,
    inOutOk,
    cacheMaterial,
    flags,
  };
}

function pickOfficialTierForRow(off, tier, refUsd) {
  if (!off?.tiers?.length) return null;
  const tiers = off.tiers;
  const wantKey = tier.tierKey;
  if (wantKey && wantKey !== "uniform") {
    const hit = findTierByKey(tiers, wantKey);
    if (hit) return hit;
  }
  if (refUsd != null) {
    return (
      pickTierClosestToRef(tiers, refUsd, {
        currency: off.currency ?? "USD",
        fx: FX_ONLINE_DOMESTIC,
      }) ?? tiers[0]
    );
  }
  return tiers[0] ?? null;
}

function pickOnlineTierForRow(onlineTiers, tier, refUsd) {
  if (!onlineTiers?.length) return null;
  const wantKey = tier.tierKey;
  if (wantKey && wantKey !== "uniform") {
    const hit = findTierByKey(onlineTiers, wantKey);
    if (hit) return hit;
    const isLongCtx =
      /ctx:.*\+|t:128k-256k|t:256k-1m|t:512k\+/.test(wantKey) ||
      wantKey === "ctx:200k+" ||
      wantKey === "ctx:272k+";
    if (isLongCtx && onlineTiers.length <= 1) return null;
    if (wantKey === "mod:audio" && !findTierByKey(onlineTiers, "mod:audio")) {
      return null;
    }
  }
  if (refUsd != null) {
    return (
      pickTierClosestToRef(onlineTiers, refUsd, { currency: "USD", fx: 1 }) ??
      null
    );
  }
  return onlineTiers[0] ?? null;
}

function onlineAudioUndifferentiated(onlineTiers, onlineTier) {
  if (!onlineTier) return false;
  const textTier = findTierByKey(onlineTiers, "mod:text");
  if (!textTier) return false;
  return (
    num(textTier.input) === num(onlineTier.input) &&
    num(textTier.output) === num(onlineTier.output)
  );
}

function resolveOrTier(orModel, refUsd) {
  if (!orModel?.tiers?.length) return null;
  if (orModel.tiers.length === 1) return orModel.tiers[0];
  if (refUsd != null) {
    return (
      pickTierClosestToRef(orModel.tiers, refUsd, { currency: "USD", fx: 1 }) ??
      orModel.tiers[0]
    );
  }
  return orModel.tiers[0];
}

function buildTierRow(model, tier, ctx) {
  const { off, offCurrency, onlineTiers, aigcIntl, orModel, orMapEntry, note } =
    ctx;

  const refUsd = refInputUsdFromTier(tier);
  const offTier = pickOfficialTierForRow(off, tier, refUsd);
  const onlineTier = pickOnlineTierForRow(onlineTiers, tier, refUsd);

  const sym = offCurrency === "CNY" ? "¥" : "$";

  const aigcUsd =
    tier.aigcIntlIn != null || tier.aigcIntlOut != null
      ? {
          input: parseNum(tier.aigcIntlIn),
          output: parseNum(tier.aigcIntlOut),
          cache: parseNum(tier.aigcIntlCache),
        }
      : null;
  const hasAigc = aigcUsd?.input != null || aigcUsd?.output != null;
  const aigcCmp = compareUsdRefToOfficial(aigcUsd, offTier, offCurrency);

  const thCny =
    tier.thIn != null || tier.thOut != null || tier.thCache != null
      ? {
          input: tier.thIn,
          output: tier.thOut,
          cache: tier.thCache,
        }
      : null;
  const thUsd = cnyTierToUsd(thCny);
  const thCmp = compareUsdRefToOfficial(thUsd, offTier, offCurrency);

  const orTier = resolveOrTier(orModel, refUsd);
  const hasOr = Boolean(orTier);
  const orUsd = orTier
    ? {
        input: num(orTier.input),
        output: num(orTier.output),
        cache: num(orTier.cache),
      }
    : null;
  const orCmp = compareUsdRefToOfficial(orUsd, offTier, offCurrency);

  const offVsOnline = onlineTier
    ? compareOfficialVsOnline(offTier, onlineTier, offCurrency)
    : {
        deltaIn: "—",
        deltaOut: "—",
        deltaCache: "—",
        dIn: null,
        dOut: null,
        dCache: null,
        hasCache: false,
        inOutOk: false,
        cacheMaterial: false,
        flags: [],
      };

  let onlineNote = "";
  if (!onlineTier && tier.tierKey && tier.tierKey !== "uniform") {
    onlineNote = "线上无同档刊例";
  } else if (
    tier.tierKey === "mod:audio" &&
    onlineAudioUndifferentiated(onlineTiers, onlineTier)
  ) {
    onlineNote = "线上音频未单独定价";
  }

  const offUsd = officialToUsd(offTier, offCurrency);
  const offHasCache = offUsd?.cache != null;

  const listingConclusion = buildListingConclusion(
    offVsOnline,
    onlineNote,
    onlineTier,
    offHasCache,
  );

  const aigcVsOfficial = formatSupplierVsOfficial(aigcCmp, {
    active: hasAigc,
    refHasIn: aigcUsd?.input != null,
    refHasOut: aigcUsd?.output != null,
    refHasCache: aigcUsd?.cache != null,
    offHasCache,
  });
  const thVsOfficial = formatSupplierVsOfficial(thCmp, {
    active: thUsd != null,
    refHasIn: thUsd?.input != null,
    refHasOut: thUsd?.output != null,
    refHasCache: thUsd?.cache != null,
    offHasCache,
  });
  const orVsOfficial = formatSupplierVsOfficial(orCmp, {
    active: hasOr,
    refHasIn: orUsd?.input != null,
    refHasOut: orUsd?.output != null,
    refHasCache: orUsd?.cache != null,
    offHasCache,
  });

  return {
    trinityId: model.trinityId,
    displayName: model.displayName,
    brand: model.brand,
    vendorModelId: ctx.vendorModelId ?? model.trinityId,
    tierLabel: tier.tierLabel ?? tierLabelOf(onlineTier, offTier) ?? "—",
    official: offTier ? formatOfficialSingleTier(offTier, sym) : "—",
    aigcIntl: formatTokenTextTier(
      tier.aigcIntlIn != null
        ? {
            input: tier.aigcIntlIn,
            output: tier.aigcIntlOut,
            cache: tier.aigcIntlCache,
          }
        : null,
      aigcIntl?.currency ?? "USD",
    ),
    tokenhub: formatTokenTextTier(thCny, "CNY"),
    openRouter: hasOr
      ? formatUsdTier(orUsd)
      : orMapEntry?.openRouterId
        ? "OR无价"
        : "—",
    openRouterId: orMapEntry?.openRouterId ?? "",
    online: formatOnlineSingleTier(onlineTier),
    deltaOnlineVsOfficialIn: offVsOnline.deltaIn,
    deltaOnlineVsOfficialOut: offVsOnline.deltaOut,
    deltaOnlineVsOfficialCache: offVsOnline.deltaCache,
    aigcVsOfficial,
    thVsOfficial,
    orVsOfficial,
    listingConclusion,
    listingMaterialInOut: listingMaterialInOut(
      offVsOnline.dIn,
      offVsOnline.dOut,
    ),
    note: note ?? "",
    officialStatus: ctx.officialStatus ?? "",
  };
}

/**
 * @param {object[]} models upstream 汇总 models（含 tiers）
 * @param {object} [opts]
 */
export function buildTextCompareHubFromModels(models, opts = {}) {
  const {
    vendorMap = {},
    officialByVendorId = new Map(),
    onlineByModel = new Map(),
    orById = new Map(),
    orTrinityMap = {},
    generatedAt = new Date().toISOString(),
    officialFetchedAt = null,
    pricesFetchedAt = null,
    openRouterFetchedAt = null,
  } = opts;

  const rows = [];
  for (const model of models) {
    const tid = model.trinityId.toLowerCase();
    const mapEntry = vendorMap[tid] ?? null;
    const vendorModelId = mapEntry?.vendorModelId ?? model.trinityId;
    const off =
      officialByVendorId.get(vendorModelId.toLowerCase()) ?? null;
    const offCurrency = off?.currency ?? "USD";
    const online = onlineByModel.get(tid) ?? null;
    const onlineTiers = online ? parseOnlinePricesTiers(online) : [];
    const aigcIntl = model.aigcInternational ?? null;

    const orEntry = orTrinityMap[tid] ?? null;
    const orModel =
      orEntry?.openRouterId != null
        ? (orById.get(orEntry.openRouterId.toLowerCase()) ?? null)
        : null;

    const tierRows = summaryTiersForModel(model);
    for (const tier of tierRows) {
      rows.push(
        buildTierRow(model, tier, {
          off,
          offCurrency,
          onlineTiers,
          aigcIntl,
          orModel,
          orMapEntry: orEntry,
          vendorModelId,
          officialStatus: off?.fetchStatus ?? "未映射",
          note: off?.trinityNote ?? mapEntry?.note ?? null,
        }),
      );
    }
  }

  return {
    modality: "text",
    generatedAt,
    officialFetchedAt,
    pricesFetchedAt,
    openRouterFetchedAt,
    modelCount: models.length,
    rowCount: rows.length,
    fxOnlineDomestic: FX_ONLINE_DOMESTIC,
    rows,
  };
}

export async function loadTextCompareHubContext(opts = {}) {
  const modality = opts.modality ?? "text";
  const online =
    opts.preloaded ??
    (await refreshOnlinePricesForCompare(modality, {
      quiet: opts.quiet ?? false,
    }));

  const [mapRaw, officialRaw, orMapRaw, orRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8").catch(() => "{}"),
    readFile(officialPricingFile("text"), "utf8").catch(() => "{}"),
    readFile(OR_MAP, "utf8").catch(() => "{}"),
    readFile(OR_FILE, "utf8").catch(() => "{}"),
  ]);

  const mapObj = JSON.parse(mapRaw);
  const vendorMap = {};
  for (const [k, v] of Object.entries(mapObj)) {
    if (k.startsWith("_")) continue;
    vendorMap[k.toLowerCase()] = v;
  }

  const orMapObj = JSON.parse(orMapRaw);
  const orTrinityMap = {};
  for (const [k, v] of Object.entries(orMapObj)) {
    if (k.startsWith("_")) continue;
    orTrinityMap[k.toLowerCase()] = v;
  }

  const official = JSON.parse(officialRaw);
  const orData = JSON.parse(orRaw);
  const prices = online.raw;
  const officialByVendorId = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );
  const onlineByModel = new Map(
    (prices.data ?? []).map((e) => [e.model.toLowerCase(), e]),
  );
  const orById = new Map(
    (orData.models ?? []).map((m) => [m.id.toLowerCase(), m]),
  );

  return {
    vendorMap,
    officialByVendorId,
    onlineByModel,
    orById,
    orTrinityMap,
    officialFetchedAt: official.fetchedAt ?? null,
    pricesFetchedAt: online.fetchedAt ?? prices.fetchedAt ?? null,
    openRouterFetchedAt: orData.fetchedAt ?? null,
  };
}

export function buildTextCompareExcelRows(report) {
  const header = [
    "Trinity ID",
    "显示名",
    "厂商",
    "档位",
    "厂商官方价",
    "AIGC国际",
    "TokenHub",
    "OpenRouter",
    "线上刊例",
    "刊例vs官方_入",
    "刊例vs官方_出",
    "刊例vs官方_缓",
    "AIGCvs官方",
    "TokenHub vs官方",
    "ORvs官方",
    "刊例结论",
    "备注",
  ];

  const rows = [];
  let lastId = "";
  for (const r of report.rows) {
    const show = r.trinityId !== lastId;
    lastId = r.trinityId ?? "";
    rows.push([
      show ? (r.trinityId ?? "") : "",
      show ? (r.displayName ?? "") : "",
      show ? (r.brand ?? "") : "",
      r.tierLabel ?? "",
      r.official ?? "",
      r.aigcIntl ?? "",
      r.tokenhub ?? "",
      r.openRouter ?? "",
      r.online ?? "",
      r.deltaOnlineVsOfficialIn ?? "",
      r.deltaOnlineVsOfficialOut ?? "",
      r.deltaOnlineVsOfficialCache ?? "",
      r.aigcVsOfficial ?? "",
      r.thVsOfficial ?? "",
      r.orVsOfficial ?? "",
      r.listingConclusion ?? "",
      r.note ?? "",
    ]);
  }
  return [header, ...rows];
}

/**
 * 刊例对比校验：Excel / CSV / MD / JSON 同源导出（与 buildTextCompareExcelRows 一致）
 * @param {object} report buildTextCompareHubFromModels 返回值
 * @param {typeof import("node:fs/promises").writeFile} writeFile
 */
export async function writeTextCompareHubExports(report, writeFile) {
  const excelRows = buildTextCompareExcelRows(report);
  const md = renderTextCompareHubMarkdown(report);
  const json = JSON.stringify(report, null, 2);
  const official = officialComparePaths("text");

  await mkdir(path.dirname(official.md), { recursive: true });
  await mkdir(path.dirname(UPSTREAM_SUMMARY_MD), { recursive: true });

  await writeFile(UPSTREAM_SUMMARY_MD, md, "utf8");
  await writeFile(official.md, md, "utf8");
  await writeFile(official.json, json, "utf8");
  await writeCsv(UPSTREAM_SUMMARY_CSV, excelRows, writeFile);
  await writeCsv(official.csv, excelRows, writeFile);

  return {
    excelRows,
    paths: {
      summaryMd: UPSTREAM_SUMMARY_MD,
      summaryCsv: UPSTREAM_SUMMARY_CSV,
      officialMd: official.md,
      officialJson: official.json,
      officialCsv: official.csv,
    },
  };
}

function esc(s) {
  return String(s ?? "—").replace(/\|/g, "\\|");
}

export function renderTextCompareHubMarkdown(report) {
  const [header, ...bodyRows] = buildTextCompareExcelRows(report);
  const lines = [
    "# 生文刊例对比校验（与 Excel「刊例对比校验-生文」同源）",
    "",
    `> 生成 ${report.generatedAt.slice(0, 19)}Z · 模型 ${report.modelCount} 个 · 行 ${report.rowCount}`,
    `> **目的**：校验 Trinity 线上刊例是否应对齐厂商官方价；AIGC 国际 / TokenHub / OpenRouter 互补对照官方种子`,
    `> 厂商官方价：\`suppliers/official/output/text/vendor-pricing.json\`（${report.officialFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> AIGC 国际：\`suppliers/aigc\` · TokenHub：\`suppliers/tokenhub\` · OpenRouter：\`suppliers/openrouter\`（${report.openRouterFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> 线上刊例：\`output/online/prices-api.json\`（${report.pricesFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> 国内官方 CNY→USD（与线上一致）：÷${report.fxOnlineDomestic}`,
    `> 同步导出：\`upstream/summary.*\` · \`official/text.*\` · \`trinity-pricing-text.xlsx\``,
    "",
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
  ];

  for (const row of bodyRows) {
    lines.push(`| ${row.map((c) => esc(c)).join(" | ")} |`);
  }

  lines.push(
    "",
    "## 说明",
    "",
    "- **厂商官方价**：刊例应对齐的锚（国内 CNY 展示，对比时 ÷6.5 换 USD）",
    "- **AIGCvs官方 / TokenHub vs官方 / ORvs官方**：单列展示入/出/缓；一致 `✅`，偏差 `⚠±X%`",
    "- **刊例vs官方_*%**：线上刊例相对厂商官方价；正数表示刊例高于官方",
    "- **刊例结论**：线上刊例相对官方，格式同 vs 列（`入✅ 出✅ 缓⚠+15.4%`）",
    "- TokenHub 挂牌为 CNY/百万 tokens，对比官方时 ÷6.5 换 USD",
    "- 百炼 / AIGC 国内等进货价见分表与「汇总-供应商vs官方」",
    "",
  );

  return lines.join("\n");
}
