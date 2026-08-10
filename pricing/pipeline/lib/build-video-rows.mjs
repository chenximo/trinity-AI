/**
 * 生视频供应商分表 Excel 行（与生图 build-image-rows 同范式）
 */

import { tierToKey } from "./tier-key.mjs";
import {
  officialVideoTiersForCompare,
  volcengineVideoPriceAtCompare,
  volcengineVideoTiersForCompare,
  isVideoTokenOfficialUnit,
  formatVideoTokenPrice,
  videoTierPrice,
} from "./video-pricing-validate-lib.mjs";
import {
  officialCellsForVideoResolution,
  pickOfficialVideoTierForSupplier,
  resolveOfficialVideoModel,
  evaluateVideoSupplierVsOfficial,
} from "./supplier-official-compare-video.mjs";
import { formatVsWithVerify } from "./pricing-verify.mjs";
import {
  buildSupplierTableHeader,
  mediaTierLabel,
  trinityIdCell,
} from "./units.mjs";
import { parseOnlineVideoTiers, num } from "./parse-online-prices.mjs";
import { FX_ONLINE_DOMESTIC } from "./compare-official-lib.mjs";

/** @param {Record<string, { vendorCode: string, modelName: string, attribute?: string }>} aigcTrinityMap */
function findAigcModelForMap(aigcModels, site, mapRef) {
  return aigcModels.find(
    (m) =>
      m.site === site &&
      m.vendorCode === mapRef.vendorCode &&
      m.modelName === mapRef.modelName,
  );
}

/** @param {object|null} aigcModel @param {{ attribute?: string }|null} mapRef */
export function aigcResolutionEntriesForMap(aigcModel, mapRef) {
  if (!aigcModel) return [];
  const attr = mapRef?.attribute ?? "标准价";
  const tier =
    aigcModel.tiers?.find((t) => t.tierName === attr) ??
    aigcModel.tiers?.find((t) => t.tierName === "标准价") ??
    null;
  if (!tier?.resolutions) return [];
  return Object.entries(tier.resolutions).map(([resolutionLabel, price]) => ({
    tierName: tier.tierName,
    resolutionLabel,
    price: Number(price),
  }));
}

/** @param {object[]} aigcModels @param {"domestic"|"international"} site @param {Record<string, object>} aigcTrinityMap */
export function iterAigcTrinityCatalog(aigcModels, site, aigcTrinityMap = {}) {
  const items = [];
  for (const [tid, mapRef] of Object.entries(aigcTrinityMap)) {
    if (tid.startsWith("_")) continue;
    const m = findAigcModelForMap(aigcModels, site, mapRef);
    if (!m) continue;
    const entries = aigcResolutionEntriesForMap(m, mapRef);
    if (!entries.length) continue;
    items.push({ trinityId: tid, mapRef, model: m, entries });
  }
  return items;
}

/** @param {object|null} aigcModel */
export function aigcAllResolutionEntries(aigcModel) {
  if (!aigcModel?.tiers?.length) return [];
  const out = [];
  for (const tier of aigcModel.tiers) {
    const res = tier.resolutions;
    if (!res || typeof res !== "object") continue;
    for (const [resolutionLabel, price] of Object.entries(res)) {
      out.push({
        tierName: tier.tierName ?? "标准价",
        resolutionLabel,
        price: Number(price),
      });
    }
  }
  return out.filter((e) => Number.isFinite(e.price));
}

/** 上游 AIGC 生视频全量行轴（不按 Trinity map 裁剪） */
export function iterAigcVideoFullCatalog(aigcModels, site, aigcTrinityMap = {}) {
  const byVendorModel = new Map();
  for (const [tid, ref] of Object.entries(aigcTrinityMap)) {
    if (tid.startsWith("_") || !ref?.vendorCode) continue;
    const k = `${ref.vendorCode}::${ref.modelName}`.toLowerCase();
    if (!byVendorModel.has(k)) byVendorModel.set(k, tid);
  }
  const list = (aigcModels ?? [])
    .filter((m) => m.site === site)
    .slice()
    .sort((a, b) =>
      `${a.vendorName || ""}::${a.modelName || ""}::${a.modelId || ""}`.localeCompare(
        `${b.vendorName || ""}::${b.modelName || ""}::${b.modelId || ""}`,
        "zh",
      ),
    );
  const items = [];
  for (const m of list) {
    const entries = aigcAllResolutionEntries(m);
    if (!entries.length) continue;
    const mapKey = `${m.vendorCode || ""}::${m.modelName || ""}`.toLowerCase();
    const trinityId = m.trinityId || byVendorModel.get(mapKey) || "";
    items.push({ trinityId, model: m, entries });
  }
  return items;
}

/** @param {{ currency?: "CNY"|"USD" }} [_sup] */
export function buildVideoSupplierTableHeader(_sup = {}) {
  return buildSupplierTableHeader(_sup);
}

function listingCellsForVideoRow(
  trinityId,
  resolutionLabel,
  supplierPrice,
  supplierCurrency,
  officialCtx = {},
) {
  const tid = String(trinityId ?? "").trim();
  if (!tid) return ["—", "—"];
  const onlineRaw = officialCtx.onlineByModel?.get(tid.toLowerCase());
  if (!onlineRaw) return ["—", "—"];

  const tiers = parseOnlineVideoTiers(onlineRaw);
  const want = String(resolutionLabel ?? "").toLowerCase();
  let hit =
    tiers.find((t) => {
      const lab = String(t.tierLabel ?? "").toLowerCase();
      return lab && want && (lab === want || lab.includes(want) || want.includes(lab));
    }) ?? tiers[0];

  const listPrice = hit?.price ?? null;
  const listing = listPrice != null ? `$${listPrice}` : "—";

  const sup = num(supplierPrice);
  if (listPrice == null || sup == null) return [listing, "—"];
  const cmp =
    supplierCurrency === "CNY" ? listPrice * FX_ONLINE_DOMESTIC : listPrice;
  if (!cmp) return [listing, "—"];
  const pct = Math.round(((sup - cmp) / cmp) * 1000) / 10;
  if (Math.abs(pct) < 0.5) return [listing, "一致"];
  const sign = pct > 0 ? "+" : "";
  return [listing, `⚠${sign}${pct}%`];
}

function pushVideoRow(rows, show, fields, officialCtx = {}) {
  const [listing, listingVs] = listingCellsForVideoRow(
    fields.trinityId,
    fields.resolutionLabel,
    fields.supplierPrice,
    fields.supplierCurrency,
    officialCtx,
  );
  rows.push([
    show ? (fields.brand ?? "") : "",
    show ? (fields.upstreamId ?? "") : "",
    trinityIdCell(fields.trinityId, show),
    mediaTierLabel(fields.tierName, fields.resolutionLabel),
    fields.vendorOfficial ?? "—",
    fields.supplierListed ?? "—",
    listing,
    fields.supplierVsOfficial ?? "—",
    listingVs,
  ]);
}

export function buildAigcVideoCatalogRows(
  aigcModels,
  site,
  officialCtx = {},
  aigcTrinityMap = {},
) {
  const currency = site === "international" ? "USD" : "CNY";
  const header = buildVideoSupplierTableHeader({ currency });
  const channelKind = site === "international" ? "international" : "domestic";
  const rows = [];

  for (const { trinityId, model: m, entries } of iterAigcVideoFullCatalog(
    aigcModels,
    site,
    aigcTrinityMap,
  )) {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const show = i === 0;
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForVideoResolution(
          trinityId,
          e.resolutionLabel,
          e.price,
          currency,
          officialCtx,
          {
            tierKey: tierToKey(e.resolutionLabel, i, entries.length),
            tierIndex: i,
            tierTotal: entries.length,
          },
          channelKind,
        );

      pushVideoRow(
        rows,
        show,
        {
          trinityId,
          brand: m.vendorName,
          tierName: e.tierName,
          resolutionLabel: e.resolutionLabel,
          upstreamId: m.modelId || m.upstreamModelId || "",
          vendorOfficial,
          supplierListed,
          supplierVsOfficial,
          supplierPrice: e.price,
          supplierCurrency: currency,
        },
        officialCtx,
      );
    }
  }

  return [header, ...rows];
}

/** 火山方舟生视频 — 官方 token 刊例档 */
export function buildVolcengineVideoCatalogRows(volcModels, officialCtx = {}) {
  const header = buildVideoSupplierTableHeader({ currency: "CNY" });
  const rows = [];

  for (const m of volcModels) {
    const trinityId = m.trinityId ?? "";
    const officialModel = trinityId
      ? resolveOfficialVideoModel(trinityId, officialCtx)
      : null;
    const offTiers = officialVideoTiersForCompare(officialModel).filter((t) =>
      isVideoTokenOfficialUnit(t),
    );
    const volTiers = volcengineVideoTiersForCompare(m);
    const expansions =
      offTiers.length > 0
        ? offTiers.map((t, i) => ({
            resolutionLabel: t.tierLabel,
            tierKey: t.tierKey ?? tierToKey(t.tierLabel, i, offTiers.length),
            tierName: t.tierLabel,
            offTier: t,
          }))
        : volTiers.map((t, i) => ({
            resolutionLabel: t.tierLabel,
            tierKey: t.tierKey ?? tierToKey(t.tierLabel, i, volTiers.length),
            tierName: t.tierLabel,
            offTier: t,
          }));

    for (let i = 0; i < expansions.length; i++) {
      const e = expansions[i];
      const volPrice = volcengineVideoPriceAtCompare(m, e.offTier);
      if (volPrice == null && !e.offTier) continue;

      const show = i === 0;
      const listed = volPrice != null ? volPrice : videoTierPrice(e.offTier);
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForVideoResolution(
          trinityId,
          e.resolutionLabel,
          listed,
          "CNY",
          officialCtx,
          { tierKey: e.tierKey, tierIndex: i, tierTotal: expansions.length },
          "volcengine",
        );

      pushVideoRow(rows, show, {
        trinityId,
        brand: m.brand ?? "火山方舟",
        tierName: e.tierName,
        resolutionLabel: e.resolutionLabel,
        upstreamId: m.modelId,
        vendorOfficial,
        supplierListed: isVideoTokenOfficialUnit(e.offTier)
          ? formatVideoTokenPrice(listed, "CNY")
          : supplierListed,
        supplierVsOfficial,
        supplierPrice: listed,
        supplierCurrency: "CNY",
      }, officialCtx);
    }
  }

  return rows.length > 0 ? [header, ...rows] : [header];
}

/**
 * @param {import("../../config/channels-video.mjs").VideoSupplierChannel} sup
 */
export function collectVideoSupplierTierStats(
  sup,
  { aigcModels = [], volcModels = [], aigcTrinityMap = {} },
  officialCtx = {},
) {
  const tiers = [];

  if (sup.catalog === "aigc") {
    const site = sup.site;
    const currency = site === "international" ? "USD" : "CNY";
    const channelKind = site === "international" ? "international" : "domestic";

    for (const { trinityId, model: m, entries } of iterAigcTrinityCatalog(
      aigcModels,
      site,
      aigcTrinityMap,
    )) {
      const officialModel = resolveOfficialVideoModel(trinityId, officialCtx);

      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const tierKey = tierToKey(e.resolutionLabel, i, entries.length);
        const officialTier = pickOfficialVideoTierForSupplier(
          officialModel,
          e.resolutionLabel,
          tierKey,
          i,
          entries.length,
        );
        const evalResult = evaluateVideoSupplierVsOfficial(
          officialModel,
          officialTier,
          e.price,
          currency,
          channelKind,
        );
        tiers.push({
          trinityId,
          displayName: `${m.vendorName} ${m.modelName}`.trim(),
          brand: m.vendorName,
          tierLabel: `${e.tierName}·${e.resolutionLabel}`,
          ...evalResult,
          summaryText: formatVsWithVerify(trinityId, evalResult),
        });
      }
    }
  }

  if (sup.catalog === "volcengine") {
    for (const m of volcModels) {
      const trinityId = m.trinityId ?? null;
      if (!trinityId) continue;
      const officialModel = resolveOfficialVideoModel(trinityId, officialCtx);
      const offTiers = officialVideoTiersForCompare(officialModel).filter((t) =>
        isVideoTokenOfficialUnit(t),
      );
      const expansions =
        offTiers.length > 0
          ? offTiers.map((t, i) => ({
              resolutionLabel: t.tierLabel,
              tierKey: t.tierKey ?? tierToKey(t.tierLabel, i, offTiers.length),
              offTier: t,
            }))
          : volcengineVideoTiersForCompare(m).map((t, i, arr) => ({
              resolutionLabel: t.tierLabel,
              tierKey: t.tierKey ?? tierToKey(t.tierLabel, i, arr.length),
              offTier: t,
            }));

      for (let i = 0; i < expansions.length; i++) {
        const e = expansions[i];
        const volPrice = volcengineVideoPriceAtCompare(m, e.offTier);
        if (volPrice == null) continue;
        const officialTier = pickOfficialVideoTierForSupplier(
          officialModel,
          e.resolutionLabel,
          e.tierKey,
          i,
          expansions.length,
        );
        const evalResult = evaluateVideoSupplierVsOfficial(
          officialModel,
          officialTier,
          volPrice,
          "CNY",
          "volcengine",
        );
        tiers.push({
          trinityId,
          displayName: m.displayName,
          brand: m.brand ?? "火山方舟",
          tierLabel: e.resolutionLabel,
          ...evalResult,
          summaryText: formatVsWithVerify(trinityId, evalResult),
        });
      }
    }
  }

  return tiers;
}
