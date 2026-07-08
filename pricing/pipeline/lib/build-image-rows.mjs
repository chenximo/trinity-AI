/**
 * 生图供应商分表 Excel 行（与 build-rows.mjs 生文范式对齐）
 */

import { tierToKey } from "./tier-key.mjs";
import {
  officialImageTiersForCompare,
} from "./image-pricing-validate-lib.mjs";
import {
  officialCellsForImageResolution,
  pickOfficialImageTierForSupplier,
  resolveOfficialImageModel,
  evaluateImageSupplierVsOfficial,
} from "./supplier-official-compare-image.mjs";
import {
  IMAGE_PRICE_UNIT_CNY,
  IMAGE_PRICE_UNIT_USD,
} from "../../config/channels-image.mjs";
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

/** @param {ReturnType<import("../suppliers/aigc/lib/pricing-api-image.mjs").normalizeAigcImagePricing>} aigcModels @param {"domestic"|"international"} site @param {Record<string, object>} aigcTrinityMap */
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
export function buildImageSupplierTableHeader(sup = {}) {
  const unit = sup.currency === "USD" ? IMAGE_PRICE_UNIT_USD : IMAGE_PRICE_UNIT_CNY;
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
  ];
}

function pushImageRow(rows, rowNum, show, fields) {
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
  ]);
}

/** @param {ReturnType<import("../suppliers/aigc/lib/pricing-api-image.mjs").normalizeAigcImagePricing>} aigcModels */
export function buildAigcImageCatalogRows(
  aigcModels,
  site,
  officialCtx = {},
  aigcTrinityMap = {},
) {
  const currency = site === "international" ? "USD" : "CNY";
  const header = buildImageSupplierTableHeader({ currency });
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
        officialCellsForImageResolution(
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

      pushImageRow(rows, rowNum, show, {
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

/** TokenHub 生图（hy-image*） */
export function buildTokenhubImageCatalogRows(thData, officialCtx = {}) {
  const header = buildImageSupplierTableHeader({ currency: "CNY" });
  const rows = [];
  let rowNum = 0;

  for (const m of thData.models ?? []) {
    if (!/^hy-image/i.test(m.modelId ?? "")) continue;
    const trinityId = m.trinityId ?? m.modelId;
    const displayName = m.displayName ?? m.modelName ?? m.modelId;
    const tierList = m.tiers?.length ? m.tiers : [{ tierName: "输出", output: m.price }];

    for (let i = 0; i < tierList.length; i++) {
      const t = tierList[i];
      const item = (t.items ?? []).find((x) => x.name === "Output") ?? t.items?.[0];
      const price = Number(item?.price ?? t.output ?? t.price);
      if (!Number.isFinite(price)) continue;

      rowNum++;
      const show = i === 0;
      const resolutionLabel = t.tierName === "统一价" ? "输出" : (t.tierName ?? "输出");
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForImageResolution(
          trinityId,
          resolutionLabel,
          price,
          "CNY",
          officialCtx,
          { tierIndex: i, tierTotal: tierList.length },
          "tokenhub",
        );

      pushImageRow(rows, rowNum, show, {
        trinityId,
        displayName,
        brand: m.brand ?? m.vendorName ?? "混元",
        tierName: t.tierName ?? "输出",
        resolutionLabel,
        upstreamId: m.modelId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
      });
    }
  }

  return [header, ...rows];
}

/** 火山方舟生图 — 按官方分辨率档展开（单档供应商价重复对齐各官方档） */
export function buildVolcengineImageCatalogRows(volcModels, officialCtx = {}) {
  const header = buildImageSupplierTableHeader({ currency: "CNY" });
  const rows = [];
  let rowNum = 0;

  for (const m of volcModels) {
    const trinityId = m.trinityId ?? m.modelId;
    if (!trinityId) continue;
    const displayName = m.displayName || `${m.vendorName} ${m.modelName}`.trim();
    const volPrice = m.tiers?.[0]?.price ?? null;
    if (volPrice == null) continue;

    const officialModel = resolveOfficialImageModel(trinityId, officialCtx);
    const offTiers = officialImageTiersForCompare(officialModel);
    const expansions =
      offTiers.length > 0
        ? offTiers.map((t, i) => ({
            resolutionLabel: t.tierLabel,
            tierKey: t.tierKey ?? tierToKey(t.tierLabel, i, offTiers.length),
            tierName: m.tiers?.[0]?.tierName ?? "输出",
          }))
        : [
            {
              resolutionLabel: m.tiers?.[0]?.tierName ?? "输出",
              tierKey: "uniform",
              tierName: m.tiers?.[0]?.tierName ?? "输出",
            },
          ];

    for (let i = 0; i < expansions.length; i++) {
      const e = expansions[i];
      rowNum++;
      const show = i === 0;
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForImageResolution(
          trinityId,
          e.resolutionLabel,
          Number(volPrice),
          "CNY",
          officialCtx,
          { tierKey: e.tierKey, tierIndex: i, tierTotal: expansions.length },
          "volcengine",
        );

      pushImageRow(rows, rowNum, show, {
        trinityId,
        displayName,
        brand: m.brand ?? "火山方舟",
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

/**
 * 汇总统计用：收集单渠道所有档位对比结果
 * @param {import("../../config/channels-image.mjs").ImageSupplierChannel} sup
 */
export function collectImageSupplierTierStats(
  sup,
  { aigcModels = [], thData = {}, volcModels = [], aigcTrinityMap = {} },
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
      const officialModel = resolveOfficialImageModel(trinityId, officialCtx);

      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const tierKey = tierToKey(e.resolutionLabel, i, entries.length);
        const officialTier = pickOfficialImageTierForSupplier(
          officialModel,
          e.resolutionLabel,
          tierKey,
          i,
          entries.length,
        );
        const evalResult = evaluateImageSupplierVsOfficial(
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
    return tiers;
  }

  if (sup.catalog === "tokenhub") {
    for (const m of thData.models ?? []) {
      if (!/^hy-image/i.test(m.modelId ?? "")) continue;
      const trinityId = m.trinityId ?? m.modelId;
      const tierList = m.tiers?.length ? m.tiers : [{ tierName: "输出", output: m.price }];
      const officialModel = resolveOfficialImageModel(trinityId, officialCtx);

      for (let i = 0; i < tierList.length; i++) {
        const t = tierList[i];
        const item = (t.items ?? []).find((x) => x.name === "Output") ?? t.items?.[0];
        const price = Number(item?.price ?? t.output ?? t.price);
        if (!Number.isFinite(price)) continue;
        const resolutionLabel = t.tierName === "统一价" ? "输出" : (t.tierName ?? "输出");
        const officialTier = pickOfficialImageTierForSupplier(
          officialModel,
          resolutionLabel,
          null,
          i,
          tierList.length,
        );
        const evalResult = evaluateImageSupplierVsOfficial(
          officialModel,
          officialTier,
          price,
          "CNY",
          "tokenhub",
        );
        tiers.push({
          trinityId,
          displayName: m.displayName ?? m.modelName,
          brand: m.brand ?? "混元",
          tierLabel: resolutionLabel,
          ...evalResult,
        });
      }
    }
    return tiers;
  }

  if (sup.catalog === "volcengine") {
    for (const m of volcModels) {
      const trinityId = m.trinityId ?? m.modelId;
      const volPrice = m.tiers?.[0]?.price;
      if (!trinityId || volPrice == null) continue;
      const officialModel = resolveOfficialImageModel(trinityId, officialCtx);
      const offTiers = officialImageTiersForCompare(officialModel);
      const expansions =
        offTiers.length > 0
          ? offTiers.map((t, i) => ({
              resolutionLabel: t.tierLabel,
              tierKey: t.tierKey ?? tierToKey(t.tierLabel, i, offTiers.length),
            }))
          : [{ resolutionLabel: "输出", tierKey: "uniform" }];

      for (let i = 0; i < expansions.length; i++) {
        const e = expansions[i];
        const officialTier = pickOfficialImageTierForSupplier(
          officialModel,
          e.resolutionLabel,
          e.tierKey,
          i,
          expansions.length,
        );
        const evalResult = evaluateImageSupplierVsOfficial(
          officialModel,
          officialTier,
          Number(volPrice),
          "CNY",
          "volcengine",
        );
        tiers.push({
          trinityId,
          displayName: m.displayName,
          brand: m.brand ?? "火山方舟",
          tierLabel: e.resolutionLabel,
          ...evalResult,
        });
      }
    }
  }

  return tiers;
}
