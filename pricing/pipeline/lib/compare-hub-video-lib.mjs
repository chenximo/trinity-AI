/**
 * 生视频刊例校验总表：厂商官方价（锚）· AIGC 国内/国际 · TokenHub · 火山 · 线上刊例
 */

import { readFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { writeCsv } from "./export-excel.mjs";
import {
  FIELD_MATCH_PCT,
  pctIsMaterial,
} from "./pricing-tolerance.mjs";
import { withVerifyFlag } from "./pricing-verify.mjs";
import { FX_ONLINE_DOMESTIC } from "./compare-official-lib.mjs";
import { refreshOnlinePricesForCompare } from "./fetch-online-prices-lib.mjs";
import { parseOnlineVideoTiers } from "./parse-online-prices.mjs";
import { findTierByKey } from "./tier-key.mjs";
import {
  officialVideoTiersForCompare,
  aigcVideoTiersForCompare,
  tokenhubVideoTiersForCompare,
  volcengineVideoTiersForCompare,
  findCompareTierByKey,
  evaluateAigcVideoDomVsIntl,
  evaluateAigcVsImpliedOfficial,
  evaluateListingVsAigcIntl,
} from "./video-pricing-validate-lib.mjs";
import {
  VIDEO_REFERENCE_CONVERSION,
  impliedCnyPerSecondFromOfficialPoints,
  formatImpliedCnyPerSecond,
  formatOfficialDocPrice,
} from "../../config/video-reference-conversion.mjs";
import { resolveVideoOnlineModelId } from "../../config/video-online-model-map.mjs";
import {
  buildVideoCompareUnits,
  videoGovernanceTier,
} from "../../config/video-model-registry.mjs";
import { lookupAigcVideoByRef } from "../../suppliers/aigc/lib/pricing-api-video.mjs";
import { assertOnlineListingCovered } from "./compare-online-coverage-lib.mjs";
import {
  OFFICIAL_MAP_FILE,
  officialComparePaths,
  officialPricingFile,
  SUPPLIERS_DIR,
  TOKENHUB_FILE,
} from "./paths.mjs";

export const VIDEO_COMPARE_SHEET = "刊例对比校验-生视频";

const RES_ORDER = ["480P/540P", "720P/768P", "1080P", "2K", "4K", "统一价", "标准价"];

function symForCurrency(currency) {
  return currency === "CNY" ? "¥" : "$";
}

function formatVideoPrice(price, currency, unitSuffix = "秒") {
  if (price == null || price === "") return "—";
  return `${symForCurrency(currency)}${price}/${unitSuffix}`;
}

function formatOfficialVideoPrice(offTier, currency) {
  return formatOfficialDocPrice(offTier, currency);
}

function expandOfficialVideoTiers(off, aigcDom, aigcIntl, aigcRef) {
  const tiers = [...officialVideoTiers(off)].sort(tierSort);
  if (!aigcRef) return tiers;
  const isUniform =
    tiers.length === 1 &&
    (tiers[0].tierKey === "uniform" || /统一/.test(tiers[0].tierLabel ?? ""));
  if (!isUniform) return tiers;
  const aigcTiers = aigcVideoTiersForCompare(aigcDom ?? aigcIntl, aigcRef);
  if (!aigcTiers.length) return tiers;
  const uniform = tiers[0];
  return aigcTiers.map((at) => ({
    tierLabel: at.tierLabel,
    tierKey: at.tierKey,
    rawPrice: uniform.rawPrice ?? uniform.price,
    price: uniform.price,
    unit: uniform.unit,
    officialUniform: uniform,
  }));
}

function normalizeResLabel(label) {
  const t = String(label ?? "").trim();
  if (!t) return t;
  const low = t.toLowerCase();
  if (low === "720p") return "720P/768P";
  if (low === "1080p") return "1080P";
  if (low === "480p" || low === "540p") return "480P/540P";
  return t;
}

function officialVideoTiers(off) {
  return officialVideoTiersForCompare(off);
}

function buildReverseTrinityByVendor(vendorMap) {
  const byVendor = new Map();
  for (const [trinityId, meta] of Object.entries(vendorMap)) {
    const vendorModelId = meta?.vendorModelId;
    if (!vendorModelId) continue;
    const key = vendorModelId.toLowerCase();
    if (!byVendor.has(key)) byVendor.set(key, trinityId);
  }
  return byVendor;
}

function formatCompareBrand(off) {
  return off.vendorLabel ?? off.vendor ?? "—";
}

function isOfficialModelLinked(off, reverseTrinity) {
  const id = off.vendorModelId?.toLowerCase();
  return Boolean(id && reverseTrinity.has(id));
}

function buildVendorsWithTrinityLink(officialModels, reverseTrinity) {
  const linked = new Set();
  for (const off of officialModels) {
    if (isOfficialModelLinked(off, reverseTrinity)) {
      linked.add(formatCompareBrand(off));
    }
  }
  return linked;
}

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

function tierSort(a, b) {
  const ia = RES_ORDER.indexOf(normalizeResLabel(a.tierLabel));
  const ib = RES_ORDER.indexOf(normalizeResLabel(b.tierLabel));
  const sa = ia === -1 ? 99 : ia;
  const sb = ib === -1 ? 99 : ib;
  if (sa !== sb) return sa - sb;
  return String(a.tierLabel).localeCompare(String(b.tierLabel));
}

function aigcPriceAtSite(aigcModel, mapRef, offTier) {
  const tiers = aigcVideoTiersForCompare(aigcModel, mapRef);
  const hit = findCompareTierByKey(tiers, offTier.tierKey);
  return hit?.price ?? null;
}

function pickOnlineVideoTier(onlineTiers, offTier) {
  if (!onlineTiers?.length) return null;
  const wantKey = offTier.tierKey;
  if (wantKey) {
    const hit = onlineTiers.find((t) => t.tierKey === wantKey);
    if (hit) return hit;
    const byKey = findTierByKey(onlineTiers, wantKey);
    if (byKey) return byKey;
  }
  const want = normalizeResLabel(offTier.tierLabel).toLowerCase();
  const hit = onlineTiers.find(
    (t) => String(t.tierLabel ?? "").toLowerCase() === want,
  );
  if (hit) return hit;
  if (/720p|768p/.test(want)) {
    return (
      onlineTiers.find((t) => /768p|720p/i.test(t.tierLabel ?? "")) ??
      null
    );
  }
  if (onlineTiers.length === 1) return onlineTiers[0];
  return null;
}

function buildListingConclusion(unit, trinityId, intlPrice, onlineTier, onlinePrice) {
  const onlineSlug = unit?.onlineSlug ?? null;
  const hasOnlineListing =
    Boolean(onlineSlug) || Boolean(resolveVideoOnlineModelId(trinityId));
  if (!hasOnlineListing) {
    return "ℹ 线上无此模型刊例";
  }
  if (!onlineTier || onlinePrice == null) {
    if (intlPrice == null) return "—";
    return "ℹ 线上无同档刊例";
  }
  const cmp = evaluateListingVsAigcIntl(intlPrice, onlinePrice);
  if (!cmp.comparable) return cmp.text;
  const base = cmp.text;
  const verifyId = trinityId ?? onlineSlug ?? "—";
  if (cmp.pct != null && pctIsMaterial(cmp.pct, FIELD_MATCH_PCT)) {
    return withVerifyFlag(verifyId, Math.abs(cmp.pct), base, ["official-listing"]);
  }
  return base;
}

function syntheticOfficialFromUnit(unit, officialModel) {
  if (officialModel) return officialModel;
  return {
    vendor: unit.brand ?? "—",
    vendorLabel: unit.displayName ?? unit.onlineSlug ?? unit.vendorModelId ?? "—",
    vendorModelId: unit.vendorModelId ?? unit.onlineSlug ?? "—",
    currency: "CNY",
    fetchStatus: "—",
    trinityNote: unit.note ?? "",
  };
}

function resolveAigcForUnit(unit, tid, aigcDomByTrinity, aigcIntlByTrinity, aigcTrinityMap, aigcModels) {
  const aigcRef =
    unit.aigcRef ??
    (tid ? aigcTrinityMap[tid] ?? aigcTrinityMap[tid?.toLowerCase()] : null) ??
    null;
  let aigcDom =
    (tid ? aigcDomByTrinity.get(tid) : null) ??
    lookupAigcVideoByRef(aigcModels ?? [], "domestic", aigcRef);
  let aigcIntl =
    (tid ? aigcIntlByTrinity.get(tid) : null) ??
    lookupAigcVideoByRef(aigcModels ?? [], "international", aigcRef);
  const mapRef =
    aigcDom?._mapRef ?? aigcIntl?._mapRef ?? aigcRef ?? null;
  return { aigcDom, aigcIntl, aigcRef: mapRef };
}

/** @returns {object[]} tier-like rows for compare */
function tiersForCompareUnit(off, aigcDom, aigcIntl, aigcRef, onlineTiers) {
  if (off?.vendorModelId && officialVideoTiers(off).length) {
    let tiers = [...officialVideoTiers(off)].sort(tierSort);
    return expandOfficialVideoTiers(off, aigcDom, aigcIntl, aigcRef).sort(tierSort);
  }
  if (onlineTiers?.length) {
    return onlineTiers.map((t) => ({
      tierLabel: t.tierLabel,
      tierKey: t.tierKey,
      onlineTier: t,
    }));
  }
  const aigcTiers = aigcVideoTiersForCompare(aigcDom ?? aigcIntl, aigcRef);
  if (aigcTiers.length) return aigcTiers.sort(tierSort);
  return [{ tierLabel: "统一价", tierKey: "uniform" }];
}

function compareUnitSort(a, b) {
  const ba = (a.brand ?? a.displayName ?? a.onlineSlug ?? a.vendorModelId ?? "").toLowerCase();
  const bb = (b.brand ?? b.displayName ?? b.onlineSlug ?? b.vendorModelId ?? "").toLowerCase();
  if (ba !== bb) return ba.localeCompare(bb);
  const sa = a.onlineSlug ?? a.vendorModelId ?? "";
  const sb = b.onlineSlug ?? b.vendorModelId ?? "";
  return sa.localeCompare(sb);
}

function tokenhubVideoPriceAt(thModel, offTier) {
  const tiers = tokenhubVideoTiersForCompare(thModel);
  const hit = findCompareTierByKey(tiers, offTier.tierKey);
  return hit?.price ?? tiers[0]?.price ?? null;
}

function volcengineVideoPriceAt(volModel, offTier) {
  const tiers = volcengineVideoTiersForCompare(volModel);
  const hit = findCompareTierByKey(tiers, offTier.tierKey);
  return hit?.price ?? null;
}

function buildUnmappedRow(off, offTier, vendorModelId) {
  const implied = impliedCnyPerSecondFromOfficialPoints(offTier, off.vendor);
  return {
    trinityId: "—",
    displayName: formatCompareBrand(off),
    brand: formatCompareBrand(off),
    vendorModelId,
    tierLabel: offTier.tierLabel ?? "—",
    officialDoc: formatOfficialVideoPrice(offTier, off.currency ?? "CNY"),
    impliedOfficialCny: formatImpliedCnyPerSecond(implied),
    aigcDom: "—",
    aigcIntl: "—",
    tokenhub: "—",
    volcengine: "—",
    online: "—",
    aigcDomVsIntl: "—",
    aigcDomVsImpliedOfficial: "—",
    listingConclusion: "— 未接入",
    note: off.trinityNote ?? "",
    officialStatus: off.fetchStatus ?? "",
  };
}

function buildMappedNoListingRow(off, offTier, vendorModelId, trinityId) {
  const implied = impliedCnyPerSecondFromOfficialPoints(offTier, off.vendor);
  return {
    trinityId,
    displayName: formatCompareBrand(off),
    brand: formatCompareBrand(off),
    vendorModelId,
    tierLabel: offTier.tierLabel ?? "—",
    officialDoc: formatOfficialVideoPrice(offTier, off.currency ?? "CNY"),
    impliedOfficialCny: formatImpliedCnyPerSecond(implied),
    aigcDom: "—",
    aigcIntl: "—",
    tokenhub: "—",
    volcengine: "—",
    online: "—",
    aigcDomVsIntl: "—",
    aigcDomVsImpliedOfficial: "—",
    listingConclusion: "— 未上架",
    note: off.trinityNote ?? "",
    officialStatus: off.fetchStatus ?? "",
  };
}

function buildVideoTierRow(ctx) {
  const {
    unit,
    off,
    offTier,
    trinityId,
    vendorModelId,
    onlineSlug,
    governanceTier,
    onlineTiers,
    aigcDom,
    aigcIntl,
    aigcMapRef,
    thModel,
    volModel,
    note,
  } = ctx;

  const offModel = off ?? syntheticOfficialFromUnit(unit, null);
  const currency = offModel.currency ?? "CNY";
  const tierLabel = offTier.tierLabel ?? "—";
  const hasOfficialTier = offTier.rawPrice != null || offTier.price != null || offTier.unit;

  const domPrice = aigcPriceAtSite(aigcDom, aigcMapRef, offTier);
  const intlPrice = aigcPriceAtSite(aigcIntl, aigcMapRef, offTier);
  const thPrice = tokenhubVideoPriceAt(thModel, offTier);
  const volPrice = volcengineVideoPriceAt(volModel, offTier);

  const onlineTier =
    offTier.onlineTier ?? pickOnlineVideoTier(onlineTiers, offTier);
  const onlinePrice = onlineTier?.price ?? null;

  const implied = hasOfficialTier
    ? impliedCnyPerSecondFromOfficialPoints(offTier, offModel.vendor)
    : null;

  const domIntlCmp = evaluateAigcVideoDomVsIntl(domPrice, intlPrice, FX_ONLINE_DOMESTIC);
  const domImpliedCmp = evaluateAigcVsImpliedOfficial(domPrice, implied);

  const wrapVerify = (text, pct) => {
    if (!pctIsMaterial(pct, FIELD_MATCH_PCT) || pct == null) return text;
    return withVerifyFlag(trinityId ?? onlineSlug ?? "—", Math.abs(pct), text);
  };

  const aigcDomVsIntl =
    domIntlCmp.comparable && domIntlCmp.pct != null
      ? wrapVerify(domIntlCmp.text, domIntlCmp.pct)
      : domIntlCmp.text;

  const aigcDomVsImpliedOfficial =
    domImpliedCmp.comparable && domImpliedCmp.pct != null
      ? wrapVerify(domImpliedCmp.text, domImpliedCmp.pct)
      : domImpliedCmp.text;

  const listingConclusion = buildListingConclusion(
    unit,
    trinityId,
    intlPrice,
    onlineTier,
    onlinePrice,
  );

  return {
    onlineSlug: onlineSlug ?? "—",
    governanceTier: governanceTier ?? "—",
    trinityId: trinityId ?? "—",
    displayName: unit?.displayName ?? formatCompareBrand(offModel),
    brand: unit?.brand ?? formatCompareBrand(offModel),
    vendorModelId: vendorModelId ?? "—",
    tierLabel,
    tierKey: offTier.tierKey ?? "—",
    officialDoc: hasOfficialTier
      ? formatOfficialVideoPrice(offTier, currency)
      : "—",
    impliedOfficialCny: implied ? formatImpliedCnyPerSecond(implied) : "—",
    aigcDom: domPrice != null ? formatVideoPrice(domPrice, "CNY") : "—",
    aigcIntl: intlPrice != null ? formatVideoPrice(intlPrice, "USD") : "—",
    tokenhub: thPrice != null ? formatVideoPrice(thPrice, "CNY") : "—",
    volcengine: volPrice != null ? formatVideoPrice(volPrice, "CNY") : "—",
    online: onlinePrice != null ? formatVideoPrice(onlinePrice, "USD") : "—",
    aigcDomVsIntl,
    aigcDomVsImpliedOfficial,
    listingConclusion,
    note: note ?? "",
    officialStatus: offModel.fetchStatus ?? "",
  };
}

/**
 * @param {object[]} trinityOnlineModels
 * @param {object} hubCtx
 */
export function buildVideoCompareHubFromModels(trinityOnlineModels, hubCtx) {
  const {
    officialModels,
    officialByVendorId,
    vendorMap,
    reverseTrinity,
    aigcDomByTrinity,
    aigcIntlByTrinity,
    aigcTrinityMap,
    aigcModels,
    thById,
    volByTrinity,
    volByModelId,
    onlineByModel,
    officialFetchedAt,
    pricesFetchedAt,
    generatedAt,
  } = hubCtx;

  const trinityLinkedCount = reverseTrinity.size;
  const onlineListingCount = onlineByModel.size;
  const compareUnits = buildVideoCompareUnits(
    onlineByModel,
    officialModels,
    reverseTrinity,
  ).sort(compareUnitSort);

  const rows = [];

  for (const unit of compareUnits) {
    const vendorModelId = unit.vendorModelId ?? unit.onlineSlug ?? "—";
    const trinityId = unit.trinityId ?? null;
    const tid = trinityId?.toLowerCase() ?? null;

    const off =
      unit.vendorModelId != null
        ? officialByVendorId.get(unit.vendorModelId) ?? null
        : null;

    const { aigcDom, aigcIntl, aigcRef } = resolveAigcForUnit(
      unit,
      tid,
      aigcDomByTrinity,
      aigcIntlByTrinity,
      aigcTrinityMap,
      aigcModels,
    );

    const onlineRaw = unit.onlineSlug
      ? onlineByModel.get(unit.onlineSlug) ?? null
      : null;
    const onlineTiers = onlineRaw ? parseOnlineVideoTiers(onlineRaw) : [];

    const thModel =
      (tid ? thById.get(tid) : null) ??
      thById.get(vendorModelId.toLowerCase()) ??
      null;
    const volModel =
      (tid ? volByTrinity.get(tid) : null) ??
      (unit.volcengineId ? volByModelId.get(unit.volcengineId) : null) ??
      (unit.vendorModelId ? volByModelId.get(unit.vendorModelId) : null) ??
      null;

    const governanceTier = videoGovernanceTier(unit, off);
    const displayName =
      unit.displayName ??
      onlineRaw?.display_name ??
      (off ? formatCompareBrand(off) : vendorModelId);
    const brand = unit.brand ?? (off ? formatCompareBrand(off) : displayName);

    const tiers = tiersForCompareUnit(off, aigcDom, aigcIntl, aigcRef, onlineTiers);

    if (!tid && !unit.onlineSlug && off) {
      for (const offTier of tiers) {
        rows.push({
          ...buildUnmappedRow(off, offTier, vendorModelId),
          onlineSlug: "—",
          governanceTier: "仅官方",
        });
      }
      continue;
    }

    for (const offTier of tiers) {
      rows.push(
        buildVideoTierRow({
          unit: { ...unit, displayName, brand },
          off,
          offTier,
          trinityId,
          vendorModelId: off?.vendorModelId ?? unit.vendorModelId ?? "—",
          onlineSlug: unit.onlineSlug ?? "—",
          governanceTier,
          onlineTiers,
          aigcDom,
          aigcIntl,
          aigcMapRef: aigcRef,
          thModel,
          volModel,
          note:
            unit.note ??
            off?.trinityNote ??
            (tid ? vendorMap[tid]?.note : null) ??
            "",
        }),
      );
    }
  }

  const fullGovernanceCount = compareUnits.filter((u) => {
    const off =
      u.vendorModelId != null
        ? officialByVendorId.get(u.vendorModelId)
        : null;
    return videoGovernanceTier(u, off) === "完整";
  }).length;

  const onlineCoverage = assertOnlineListingCovered(
    onlineByModel,
    compareUnits.map((u) => u.onlineSlug).filter(Boolean),
    { modality: "video", label: "刊例对比校验-生视频" },
  );

  return {
    modality: "video",
    generatedAt,
    officialFetchedAt,
    pricesFetchedAt,
    modelCount: officialModels.length,
    compareUnitCount: compareUnits.length,
    trinityLinkedCount,
    trinityOnlineCount: trinityOnlineModels?.length ?? 0,
    onlineListingCount,
    onlineCoverage,
    fullGovernanceCount,
    rowCount: rows.length,
    fxOnlineDomestic: FX_ONLINE_DOMESTIC,
    referenceConversion: VIDEO_REFERENCE_CONVERSION,
    rows,
  };
}

export async function loadVideoCompareHubContext(opts = {}) {
  const online =
    opts.preloaded ??
    (await refreshOnlinePricesForCompare("video", {
      quiet: opts.quiet ?? true,
    }));

  const aigcMapPath = path.join(SUPPLIERS_DIR, "aigc/trinity-map-video.json");
  const volcVideoPath = path.join(
    SUPPLIERS_DIR,
    "volcengine/output/video/pricing-api.json",
  );

  const [mapRaw, officialRaw, aigcMapRaw, thRaw, volcRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8").catch(() => "{}"),
    readFile(officialPricingFile("video"), "utf8").catch(() => "{}"),
    readFile(aigcMapPath, "utf8").catch(() => "{}"),
    readFile(TOKENHUB_FILE, "utf8").catch(() => "{}"),
    readFile(volcVideoPath, "utf8").catch(() => "{}"),
  ]);

  const mapObj = JSON.parse(mapRaw);
  const vendorMap = {};
  for (const [k, v] of Object.entries(mapObj)) {
    if (k.startsWith("_")) continue;
    if (v?.modality && v.modality !== "video") continue;
    vendorMap[k.toLowerCase()] = v;
  }

  const aigcMapObj = JSON.parse(aigcMapRaw);
  const aigcTrinityMap = {};
  for (const [k, v] of Object.entries(aigcMapObj)) {
    if (k.startsWith("_")) continue;
    aigcTrinityMap[k.toLowerCase()] = v;
  }

  const official = JSON.parse(officialRaw);
  const thData = JSON.parse(thRaw);
  const volcData = JSON.parse(volcRaw);
  const officialModels = official.models ?? [];
  const officialByVendorId = new Map(
    officialModels.map((m) => [m.vendorModelId.toLowerCase(), m]),
  );
  const reverseTrinity = buildReverseTrinityByVendor(vendorMap);
  const vendorsWithLink = buildVendorsWithTrinityLink(
    officialModels,
    reverseTrinity,
  );

  const thById = new Map();
  for (const m of thData.models ?? []) {
    const isVideo =
      /-video-/i.test(m.modelId ?? "") ||
      (m.tags ?? []).some((t) => /视频|video/i.test(t));
    if (!isVideo) continue;
    const id = (m.trinityId ?? m.modelId)?.toLowerCase();
    if (id) thById.set(id, m);
    if (m.modelId) thById.set(m.modelId.toLowerCase(), m);
  }

  const volByTrinity = new Map();
  const volByModelId = new Map();
  for (const m of volcData.models ?? []) {
    if (m.trinityId) volByTrinity.set(m.trinityId.toLowerCase(), m);
    if (m.modelId) volByModelId.set(m.modelId.toLowerCase(), m);
    if (m.upstreamModelId) volByModelId.set(m.upstreamModelId.toLowerCase(), m);
  }

  const onlineByModel = new Map();
  for (const entry of online.raw?.data ?? []) {
    const id = entry.model?.toLowerCase();
    if (id) onlineByModel.set(id, entry);
  }

  return {
    officialModels,
    officialByVendorId,
    vendorMap,
    reverseTrinity,
    vendorsWithLink,
    onlineByModel,
    aigcDomByTrinity: opts.aigcDomByTrinity ?? new Map(),
    aigcIntlByTrinity: opts.aigcIntlByTrinity ?? new Map(),
    aigcTrinityMap,
    thById,
    volByTrinity,
    volByModelId,
    officialFetchedAt: official.fetchedAt ?? null,
    pricesFetchedAt: online.fetchedAt ?? online.raw?.fetchedAt ?? null,
    generatedAt: new Date().toISOString(),
  };
}

export function buildVideoCompareExcelRows(report) {
  const header = [
    "线上 slug",
    "治理档位",
    "原厂 modelId",
    "Trinity ID",
    "显示名",
    "厂商",
    "分辨率档",
    "原厂文档(积分/次)",
    "原厂折算元/秒(估)",
    "AIGC国内",
    "AIGC国际",
    "TokenHub",
    "火山方舟",
    "线上刊例",
    "AIGC国内vs国际",
    "AIGC国内vs原厂折算",
    "刊例结论",
    "备注",
  ];

  const rows = [];
  let lastGroup = "";
  for (const r of report.rows) {
    const group = `${r.onlineSlug ?? ""}|${r.vendorModelId ?? ""}|${r.trinityId ?? ""}`;
    const show = group !== lastGroup;
    lastGroup = group;
    rows.push([
      show ? (r.onlineSlug ?? "") : "",
      show ? (r.governanceTier ?? "") : "",
      show ? (r.vendorModelId ?? "") : "",
      show ? (r.trinityId ?? "") : "",
      show ? (r.displayName ?? "") : "",
      show ? (r.brand ?? "") : "",
      r.tierLabel ?? "",
      r.officialDoc ?? r.official ?? "",
      r.impliedOfficialCny ?? "—",
      r.aigcDom ?? "",
      r.aigcIntl ?? "",
      r.tokenhub ?? "",
      r.volcengine ?? "",
      r.online ?? "",
      r.aigcDomVsIntl ?? "",
      r.aigcDomVsImpliedOfficial ?? "",
      r.listingConclusion ?? "",
      r.note ?? "",
    ]);
  }
  return [header, ...rows];
}

export async function writeVideoCompareHubExports(report, writeFile) {
  const excelRows = buildVideoCompareExcelRows(report);
  const md = renderVideoCompareHubMarkdown(report);
  const json = JSON.stringify(report, null, 2);
  const official = officialComparePaths("video");
  const summaryMd = path.join(
    path.dirname(official.md),
    "../upstream/video-summary.md",
  );
  const summaryCsv = path.join(
    path.dirname(official.csv),
    "../upstream/video-summary.csv",
  );

  await mkdir(path.dirname(official.md), { recursive: true });
  await mkdir(path.dirname(summaryMd), { recursive: true });

  await writeFile(summaryMd, md, "utf8");
  await writeFile(official.md, md, "utf8");
  await writeFile(official.json, json, "utf8");
  await writeCsv(summaryCsv, excelRows, writeFile);
  await writeCsv(official.csv, excelRows, writeFile);

  return {
    excelRows,
    paths: {
      summaryMd,
      summaryCsv,
      officialMd: official.md,
      officialJson: official.json,
      officialCsv: official.csv,
    },
  };
}

function esc(s) {
  return String(s ?? "—").replace(/\|/g, "\\|");
}

export function renderVideoCompareHubMarkdown(report) {
  const [header, ...bodyRows] = buildVideoCompareExcelRows(report);
  const ref = report.referenceConversion ?? VIDEO_REFERENCE_CONVERSION;
  const lines = [
    "# 生视频刊例对比校验（与 Excel「刊例对比校验-生视频」同源）",
    "",
    `> 生成 ${report.generatedAt.slice(0, 19)}Z · 对比单元 ${report.compareUnitCount ?? "—"} 个 · 行 ${report.rowCount}` +
      (report.onlineListingCount != null
        ? ` · 线上刊例 ${report.onlineListingCount} · 官方 catalog ${report.modelCount} · 完整治理 ${report.fullGovernanceCount ?? "—"}`
        : ""),
    `> **行主键**：\`prices-api\` 全量线上 slug ∪ 官方 catalog 补行（取并集，见 \`config/video-model-registry.mjs\`）`,
    `> **治理档位**：完整 = 官方+线上 · 仅刊例 = 线上有/AIGC对照 · 仅官方 = 未挂线上刊例`,
    `> **Trinity 无积分**；主对比：**AIGC 国内 vs 国际**（元/秒 · 美元/秒）`,
    `> **AIGC 来源**：\`AIGC价格指南（商务版报价文档）.xlsx\` · AIGC生视频 · 按**生成视频秒数**计费`,
    `> **原厂按秒（可灵等）**：积分/秒 = 元/秒（1积分=¥1）· 直接对照 AIGC`,
    `> **原厂按次（混元/Vidu 等）**：积分/次 ÷ ${ref.referenceSeconds}s/次 → 元/秒(估)`,
    `> **线上刊例**：\`GET /v1/prices?modality=video\` · USD/秒 · 刊例结论 = 线上 vs AIGC国际`,
    `> 模型映射：\`config/video-model-registry.mjs\`（${report.pricesFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> 刊例基准汇率：${report.fxOnlineDomestic}（国内 CNY ÷ 国际 USD）`,
    `> ${ref.footnote ?? ""}`,
  ];
  lines.push("", `| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`);
  for (const row of bodyRows) {
    lines.push(`| ${row.map((c) => esc(c)).join(" | ")} |`);
  }
  return lines.join("\n");
}

export const MERGE_COMPARE_VIDEO = {
  cols: [1, 2, 3, 4, 5, 6],
  rows: true,
};
