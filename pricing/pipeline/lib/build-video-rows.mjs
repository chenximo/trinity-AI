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
import {
  VIDEO_PRICE_UNIT_CNY,
  VIDEO_PRICE_UNIT_USD,
} from "../../config/channels-video.mjs";
import { formatVsWithVerify } from "./pricing-verify.mjs";

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

/** @param {{ currency?: "CNY"|"USD" }} sup */
export function buildVideoSupplierTableHeader(sup = {}) {
  const unit = sup.currency === "USD" ? VIDEO_PRICE_UNIT_USD : VIDEO_PRICE_UNIT_CNY;
  return [
    "序号",
    "Trinity ID",
    "显示名",
    "厂商",
    "价格档位",
    "分辨率档",
    "上游模型ID",
    "厂商官方价",
    `供应商挂牌(${unit})`,
    "供应商vs官方",
    "折扣",
    `成本(${unit})`,
  ];
}

function pushVideoRow(rows, rowNum, show, fields) {
  rows.push([
    rowNum,
    show ? (fields.trinityId ?? "") : "",
    show ? (fields.displayName ?? "") : "",
    show ? (fields.brand ?? "") : "",
    fields.tierName ?? "—",
    fields.resolutionLabel ?? "—",
    show ? (fields.upstreamId ?? "") : "",
    fields.vendorOfficial ?? "—",
    fields.supplierListed ?? "—",
    fields.supplierVsOfficial ?? "—",
    "待填",
    "待填",
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
  let rowNum = 0;

  for (const { trinityId, model: m, entries } of iterAigcTrinityCatalog(
    aigcModels,
    site,
    aigcTrinityMap,
  )) {
    const displayName = `${m.vendorName} ${m.modelName}`.trim();

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      rowNum++;
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

      pushVideoRow(rows, rowNum, show, {
        trinityId,
        displayName,
        brand: m.vendorName,
        tierName: e.tierName,
        resolutionLabel: e.resolutionLabel,
        upstreamId: m.modelId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
      });
    }
  }

  return [header, ...rows];
}

/** 火山方舟生视频 — 官方 token 刊例档 */
export function buildVolcengineVideoCatalogRows(volcModels, officialCtx = {}) {
  const header = buildVideoSupplierTableHeader({ currency: "CNY" });
  const rows = [];
  let rowNum = 0;

  for (const m of volcModels) {
    const trinityId = m.trinityId ?? null;
    if (!trinityId) continue;

    const displayName = m.displayName || `${m.vendorName} ${m.modelName}`.trim();
    const officialModel = resolveOfficialVideoModel(trinityId, officialCtx);
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

      rowNum++;
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

      pushVideoRow(rows, rowNum, show, {
        trinityId,
        displayName,
        brand: m.brand ?? "火山方舟",
        tierName: e.tierName,
        resolutionLabel: e.resolutionLabel,
        upstreamId: m.modelId,
        vendorOfficial,
        supplierListed: isVideoTokenOfficialUnit(e.offTier)
          ? formatVideoTokenPrice(listed, "CNY")
          : supplierListed,
        supplierVsOfficial,
      });
    }
  }

  return rows.length > 1 ? [header, ...rows] : [header];
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
