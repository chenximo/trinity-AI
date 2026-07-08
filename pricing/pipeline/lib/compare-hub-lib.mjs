/**
 * 生文刊例校验总表：厂商官方价（锚）· AIGC 国内/国际 · TokenHub · OpenRouter · 线上刊例
 */

import { readFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  L4_COMPARE_IDENTITY_HEADERS,
  L4_COMPARE_REF_PRICE_HEADERS,
  L4_COMPARE_VS_OFFICIAL_HEADERS,
  MERGE_COMPARE_IDENTITY,
} from "./compare-l4-columns.mjs";
import { writeCsv } from "./export-excel.mjs";
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

/** @deprecated 使用 MERGE_COMPARE_IDENTITY */
export const MERGE_COMPARE_TEXT = MERGE_COMPARE_IDENTITY;
export { MERGE_COMPARE_IDENTITY };

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

/** @param {Record<string, { vendorModelId?: string }>} vendorMap Trinity → official */
function buildReverseTrinityByVendor(vendorMap) {
  /** @type {Map<string, string>} */
  const byVendor = new Map();
  for (const [trinityId, meta] of Object.entries(vendorMap)) {
    const vendorModelId = meta?.vendorModelId;
    if (!vendorModelId) continue;
    const key = vendorModelId.toLowerCase();
    if (!byVendor.has(key)) byVendor.set(key, trinityId);
  }
  return byVendor;
}

/** @param {object[]} models */
function buildUpstreamByTrinity(models) {
  /** @type {Map<string, object>} */
  const map = new Map();
  for (const m of models) {
    if (m?.trinityId) map.set(m.trinityId.toLowerCase(), m);
  }
  return map;
}

/** @param {object} off */
function officialTextTiers(off) {
  const tiers = off.tiers ?? off.prices?.tiers ?? [];
  if (tiers.length) return tiers;
  const p = off.prices;
  if (p && (p.input != null || p.output != null || p.cache != null)) {
    return [
      {
        tierLabel: "标准价",
        input: p.input,
        output: p.output,
        cache: p.cache,
      },
    ];
  }
  return [{ tierLabel: "—" }];
}

/** @param {object|null} upstream @param {object} offTier @param {number} tierIndex */
function matchUpstreamTier(upstream, offTier, tierIndex) {
  if (!upstream) {
    return { tierLabel: offTier.tierLabel ?? "—", tierKey: offTier.tierKey };
  }
  const priced = summaryTiersForModel(upstream);
  if (offTier.tierKey) {
    const byKey = priced.find((t) => t.tierKey === offTier.tierKey);
    if (byKey) return byKey;
  }
  if (offTier.tierLabel) {
    const byLabel = priced.find((t) => t.tierLabel === offTier.tierLabel);
    if (byLabel) return byLabel;
  }
  return priced[tierIndex] ?? priced[0] ?? { tierLabel: offTier.tierLabel ?? "—" };
}

function formatCompareBrand(off) {
  return off.vendorLabel ?? off.vendor ?? "—";
}

/** @param {object} off @param {Map<string, string>} reverseTrinity */
function isOfficialModelLinked(off, reverseTrinity) {
  const id = off.vendorModelId?.toLowerCase();
  return Boolean(id && reverseTrinity.has(id));
}

/** @param {object[]} officialModels @param {Map<string, string>} reverseTrinity */
function buildVendorsWithTrinityLink(officialModels, reverseTrinity) {
  /** @type {Set<string>} */
  const linked = new Set();
  for (const off of officialModels) {
    if (isOfficialModelLinked(off, reverseTrinity)) {
      linked.add(formatCompareBrand(off));
    }
  }
  return linked;
}

/**
 * 1. 有已接入模型的厂商在前，整系列未接入（如豆包）沉底
 * 2. 同厂商内：已接入在前，未接入在后
 * 3. vendorModelId 字母序
 */
function compareOfficialModels(a, b, reverseTrinity, vendorsWithLink) {
  const la = formatCompareBrand(a);
  const lb = formatCompareBrand(b);

  const vendorLinkedA = vendorsWithLink.has(la) ? 0 : 1;
  const vendorLinkedB = vendorsWithLink.has(lb) ? 0 : 1;
  if (vendorLinkedA !== vendorLinkedB) return vendorLinkedA - vendorLinkedB;

  if (la !== lb) return la.localeCompare(lb);

  const linkedA = isOfficialModelLinked(a, reverseTrinity) ? 0 : 1;
  const linkedB = isOfficialModelLinked(b, reverseTrinity) ? 0 : 1;
  if (linkedA !== linkedB) return linkedA - linkedB;

  return (a.vendorModelId ?? "").localeCompare(b.vendorModelId ?? "");
}

/** @param {object} off @param {object} offTier @param {string} vendorModelId */
function buildUnmappedOfficialRow(off, offTier, vendorModelId) {
  const sym = off.currency === "CNY" ? "¥" : "$";
  return {
    trinityId: "—",
    displayName: formatCompareBrand(off),
    brand: formatCompareBrand(off),
    vendorModelId,
    tierLabel: offTier.tierLabel ?? "—",
    official: offTier ? formatOfficialSingleTier(offTier, sym) : "—",
    aigcDom: "—",
    aigcIntl: "—",
    tokenhub: "—",
    openRouter: "—",
    openRouterId: "",
    online: "—",
    deltaOnlineVsOfficialIn: "—",
    deltaOnlineVsOfficialOut: "—",
    deltaOnlineVsOfficialCache: "—",
    aigcDomVsOfficial: "—",
    aigcIntlVsOfficial: "—",
    thVsOfficial: "—",
    orVsOfficial: "—",
    listingConclusion: "— 未接入",
    listingMaterialInOut: false,
    note: off.trinityNote ?? "",
    officialStatus: off.fetchStatus ?? "",
  };
}

/** map 有 Trinity，但线上 models 列表尚无（未上架刊例） */
function buildMappedNoListingRow(off, offTier, vendorModelId, trinityId) {
  const sym = off.currency === "CNY" ? "¥" : "$";
  return {
    trinityId,
    displayName: formatCompareBrand(off),
    brand: formatCompareBrand(off),
    vendorModelId,
    tierLabel: offTier.tierLabel ?? "—",
    official: offTier ? formatOfficialSingleTier(offTier, sym) : "—",
    aigcDom: "—",
    aigcIntl: "—",
    tokenhub: "—",
    openRouter: "—",
    openRouterId: "",
    online: "—",
    deltaOnlineVsOfficialIn: "—",
    deltaOnlineVsOfficialOut: "—",
    deltaOnlineVsOfficialCache: "—",
    aigcDomVsOfficial: "—",
    aigcIntlVsOfficial: "—",
    thVsOfficial: "—",
    orVsOfficial: "—",
    listingConclusion: "— 未上架",
    listingMaterialInOut: false,
    note: off.trinityNote ?? "",
    officialStatus: off.fetchStatus ?? "",
  };
}

function buildTierRow(model, tier, ctx) {
  const {
    off,
    offCurrency,
    onlineTiers,
    aigcIntl,
    orModel,
    orMapEntry,
    note,
    fixedOffTier,
  } = ctx;

  const refUsd = refInputUsdFromTier(tier);
  const offTier = fixedOffTier ?? pickOfficialTierForRow(off, tier, refUsd);
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
  const hasAigcIntl = aigcUsd?.input != null || aigcUsd?.output != null;
  const aigcIntlCmp = compareUsdRefToOfficial(aigcUsd, offTier, offCurrency);

  const aigcDomCny =
    tier.aigcDomIn != null || tier.aigcDomOut != null || tier.aigcDomCache != null
      ? {
          input: tier.aigcDomIn,
          output: tier.aigcDomOut,
          cache: tier.aigcDomCache,
        }
      : null;
  const aigcDomUsd = cnyTierToUsd(aigcDomCny);
  const hasAigcDom = aigcDomUsd?.input != null || aigcDomUsd?.output != null;
  const aigcDomCmp = compareUsdRefToOfficial(aigcDomUsd, offTier, offCurrency);

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

  const aigcDomVsOfficial = formatSupplierVsOfficial(aigcDomCmp, {
    active: hasAigcDom,
    refHasIn: aigcDomUsd?.input != null,
    refHasOut: aigcDomUsd?.output != null,
    refHasCache: aigcDomUsd?.cache != null,
    offHasCache,
  });
  const aigcIntlVsOfficial = formatSupplierVsOfficial(aigcIntlCmp, {
    active: hasAigcIntl,
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
    tierLabel:
      fixedOffTier?.tierLabel ??
      tier.tierLabel ??
      tierLabelOf(onlineTier, offTier) ??
      "—",
    official: offTier ? formatOfficialSingleTier(offTier, sym) : "—",
    aigcDom: formatTokenTextTier(aigcDomCny, "CNY"),
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
    aigcDomVsOfficial,
    aigcIntlVsOfficial,
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
 * 刊例对比：以 official vendor-pricing 为行轴；Trinity 经 map 挂接，未接入显示 —。
 * @param {object[]} models upstream 汇总（Trinity 已上架，供进货/刊例列）
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

  const reverseTrinity = buildReverseTrinityByVendor(vendorMap);
  const upstreamByTrinity = buildUpstreamByTrinity(models);

  const officialModelsActive = [...officialByVendorId.values()].filter(
    (m) => (m.status ?? "active") === "active",
  );
  const vendorsWithLink = buildVendorsWithTrinityLink(
    officialModelsActive,
    reverseTrinity,
  );
  const officialModels = officialModelsActive.sort((a, b) =>
    compareOfficialModels(a, b, reverseTrinity, vendorsWithLink),
  );

  const rows = [];
  let trinityLinkedCount = 0;

  for (const off of officialModels) {
    const vendorModelId = off.vendorModelId;
    const trinityId =
      reverseTrinity.get(vendorModelId.toLowerCase()) ?? null;
    const offCurrency = off.currency ?? "USD";
    const tiers = officialTextTiers(off);

    if (trinityId) trinityLinkedCount++;

    for (let i = 0; i < tiers.length; i++) {
      const offTier = tiers[i];

      if (!trinityId) {
        rows.push(buildUnmappedOfficialRow(off, offTier, vendorModelId));
        continue;
      }

      const upstream = upstreamByTrinity.get(trinityId.toLowerCase());
      if (!upstream) {
        rows.push(
          buildMappedNoListingRow(off, offTier, vendorModelId, trinityId),
        );
        continue;
      }

      const tid = trinityId.toLowerCase();
      const online = onlineByModel.get(tid) ?? null;
      const onlineTiers = online ? parseOnlinePricesTiers(online) : [];
      const aigcIntl = upstream.aigcInternational ?? null;
      const orEntry = orTrinityMap[tid] ?? null;
      const orModel =
        orEntry?.openRouterId != null
          ? (orById.get(orEntry.openRouterId.toLowerCase()) ?? null)
          : null;
      const upstreamTier = matchUpstreamTier(upstream, offTier, i);

      rows.push(
        buildTierRow(upstream, upstreamTier, {
          off,
          offCurrency,
          onlineTiers,
          aigcIntl,
          orModel,
          orMapEntry: orEntry,
          vendorModelId,
          fixedOffTier: offTier,
          officialStatus: off.fetchStatus ?? "",
          note: off.trinityNote ?? vendorMap[tid]?.note ?? null,
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
    modelCount: officialModels.length,
    trinityLinkedCount,
    trinityOnlineCount: models.length,
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
    ...L4_COMPARE_IDENTITY_HEADERS,
    "价格档位",
    "厂商官方价",
    ...L4_COMPARE_REF_PRICE_HEADERS,
    "线上刊例",
    "刊例vs官方_入",
    "刊例vs官方_出",
    "刊例vs官方_缓",
    ...L4_COMPARE_VS_OFFICIAL_HEADERS,
    "刊例结论",
    "备注",
  ];

  const rows = [];
  let lastVendorId = "";
  for (const r of report.rows) {
    const vendorId = r.vendorModelId ?? "";
    const show = vendorId !== lastVendorId;
    lastVendorId = vendorId;
    rows.push([
      show ? vendorId : "",
      show ? (r.trinityId ?? "") : "",
      show ? (r.displayName ?? "") : "",
      show ? (r.brand ?? "") : "",
      r.tierLabel ?? "",
      r.official ?? "",
      r.aigcDom ?? "",
      r.aigcIntl ?? "",
      r.tokenhub ?? "",
      r.openRouter ?? "",
      r.online ?? "",
      r.deltaOnlineVsOfficialIn ?? "",
      r.deltaOnlineVsOfficialOut ?? "",
      r.deltaOnlineVsOfficialCache ?? "",
      r.aigcDomVsOfficial ?? "",
      r.aigcIntlVsOfficial ?? "",
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
    `> 生成 ${report.generatedAt.slice(0, 19)}Z · 官方模型 ${report.modelCount} 个 · 行 ${report.rowCount}` +
      (report.trinityLinkedCount != null
        ? ` · Trinity 已映射 ${report.trinityLinkedCount} · 线上 ${report.trinityOnlineCount ?? "—"}`
        : ""),
    `> **行轴**：\`suppliers/official/output/text/vendor-pricing.json\` 全量；Trinity 未接入 → Trinity ID / 刊例为 —`,
    `> **目的**：官方价锚点 + Trinity 覆盖与刊例校验；进货参照仅 AIGC国内/国际 · TokenHub · OpenRouter（不含百炼/火山）`,
    `> 厂商官方价：\`suppliers/official/output/text/vendor-pricing.json\`（${report.officialFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> AIGC：\`suppliers/aigc\` · TokenHub：\`suppliers/tokenhub\` · OpenRouter：\`suppliers/openrouter\`（${report.openRouterFetchedAt?.slice(0, 19) ?? "—"}Z）`,
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
    "- **原厂 modelId**：`vendor-pricing.json` 锚点，与渠道价 join 键一致",
    "- **Trinity ID**：`—` = 官方已收录、产品未接入；刊例结论 `— 未接入` / `— 未上架` 不进 gate",
    "- **排序**：有已接入模型的厂商在前；**整系列未接入**（如豆包）沉表尾；同系列内已接入在前、单模型未接入在后",
    "- **厂商官方价**：刊例应对齐的锚（国内 CNY 展示，对比时 ÷6.5 换 USD）",
    "- **AIGC国内vs官方 / AIGC国际vs官方 / TokenHub vs官方 / OpenRouter vs官方**：单列展示入/出/缓；一致 `✅`，偏差 `⚠±X%`",
    "- **刊例vs官方_*%**：线上刊例相对厂商官方价；正数表示刊例高于官方",
    "- **刊例结论**：线上刊例相对官方，格式同 vs 列（`入✅ 出✅ 缓⚠+15.4%`）",
    "- TokenHub / AIGC 国内挂牌为 CNY/百万 tokens，对比官方时 ÷6.5 换 USD",
    "- 百炼 / 火山方舟等 L3 转售价见供应商分表与「汇总-供应商vs官方」",
    "",
  );

  return lines.join("\n");
}
