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
import { formatVsWithVerify } from "./pricing-verify.mjs";
import {
  buildSupplierTableHeader,
  mediaTierLabel,
  trinityIdCell,
} from "./units.mjs";
import { parseOnlineImageTiers, num } from "./parse-online-prices.mjs";
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

/** @param {{ currency?: "CNY"|"USD" }} [sup] */
export function buildImageSupplierTableHeader(_sup = {}) {
  return buildSupplierTableHeader(_sup);
}

function listingCellsForImageRow(
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

  const tiers = parseOnlineImageTiers(onlineRaw);
  const want = String(resolutionLabel ?? "").toLowerCase();
  let hit =
    tiers.find((t) => {
      const lab = String(t.tierLabel ?? "").toLowerCase();
      return lab && want && (lab === want || lab.includes(want) || want.includes(lab));
    }) ?? tiers[0];

  let listPrice = hit?.price ?? null;
  let listing = "—";
  if (listPrice != null) {
    listing = `$${listPrice}`;
  } else {
    const def = (onlineRaw.price_groups ?? []).find((g) => g.type === "default")?.prices;
    const out = num(def?.output?.amount);
    const inn = num(def?.input?.amount);
    if (out != null || inn != null) {
      listing = `入 ${inn != null ? `$${inn}` : "⚠"} · 出 ${out != null ? `$${out}` : "⚠"}`;
      listPrice = out;
    }
  }

  const sup = num(supplierPrice);
  if (listPrice == null || sup == null) return [listing, "—"];
  const listCny =
    supplierCurrency === "CNY" ? listPrice * FX_ONLINE_DOMESTIC : listPrice;
  const cmp = supplierCurrency === "CNY" ? listCny : listPrice;
  if (!cmp) return [listing, "—"];
  const pct = Math.round(((sup - cmp) / cmp) * 1000) / 10;
  if (Math.abs(pct) < 0.5) return [listing, "一致"];
  const sign = pct > 0 ? "+" : "";
  return [listing, `⚠${sign}${pct}%`];
}

function pushImageRow(rows, show, fields, officialCtx = {}) {
  const [listing, listingVs] = listingCellsForImageRow(
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

/**
 * 上游 AIGC 全量行轴（不按 Trinity map 裁剪）
 * @param {object[]} aigcModels
 * @param {"domestic"|"international"} site
 * @param {Record<string, { vendorCode: string, modelName: string, attribute?: string }>} [aigcTrinityMap]
 */
export function iterAigcFullCatalog(aigcModels, site, aigcTrinityMap = {}) {
  /** @type {Map<string, string>} */
  const byVendorModel = new Map();
  for (const [tid, ref] of Object.entries(aigcTrinityMap)) {
    if (tid.startsWith("_") || !ref?.vendorCode) continue;
    const k = `${ref.vendorCode}\0${ref.modelName}`.toLowerCase();
    if (!byVendorModel.has(k)) byVendorModel.set(k, tid);
  }

  const list = (aigcModels ?? [])
    .filter((m) => m.site === site)
    .slice()
    .sort((a, b) =>
      `${a.vendorName || ""}\0${a.modelName || ""}\0${a.modelId || ""}`.localeCompare(
        `${b.vendorName || ""}\0${b.modelName || ""}\0${b.modelId || ""}`,
        "zh",
      ),
    );

  const items = [];
  for (const m of list) {
    const entries = aigcAllResolutionEntries(m);
    if (!entries.length) continue;
    const mapKey = `${m.vendorCode || ""}\0${m.modelName || ""}`.toLowerCase();
    const trinityId =
      m.trinityId ||
      byVendorModel.get(mapKey) ||
      "";
    items.push({ trinityId, model: m, entries });
  }
  return items;
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

  for (const { trinityId, model: m, entries } of iterAigcFullCatalog(
    aigcModels,
    site,
    aigcTrinityMap,
  )) {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
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

      pushImageRow(
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

/** TokenHub 生图（hy-image*） */
export function buildTokenhubImageCatalogRows(thData, officialCtx = {}) {
  const header = buildImageSupplierTableHeader({ currency: "CNY" });
  const rows = [];

  for (const m of thData.models ?? []) {
    if (!/^hy-image/i.test(m.modelId ?? "")) continue;
    const trinityId = m.trinityId ?? m.modelId;
    const tierList = m.tiers?.length ? m.tiers : [{ tierName: "输出", output: m.price }];

    for (let i = 0; i < tierList.length; i++) {
      const t = tierList[i];
      const item = (t.items ?? []).find((x) => x.name === "Output") ?? t.items?.[0];
      const price = Number(item?.price ?? t.output ?? t.price);
      if (!Number.isFinite(price)) continue;

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

      pushImageRow(rows, show, {
        trinityId,
        brand: m.brand ?? m.vendorName ?? "混元",
        tierName: t.tierName ?? "输出",
        resolutionLabel,
        upstreamId: m.modelId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
        supplierPrice: price,
        supplierCurrency: "CNY",
      }, officialCtx);
    }
  }

  return [header, ...rows];
}

/** 火山方舟生图 — 按官方分辨率档展开（单档供应商价重复对齐各官方档） */
export function buildVolcengineImageCatalogRows(volcModels, officialCtx = {}) {
  const header = buildImageSupplierTableHeader({ currency: "CNY" });
  const rows = [];

  for (const m of volcModels) {
    const trinityId = m.trinityId ?? m.modelId;
    if (!trinityId) continue;
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

      pushImageRow(rows, show, {
        trinityId,
        brand: m.brand ?? "火山方舟",
        tierName: e.tierName,
        resolutionLabel: e.resolutionLabel,
        upstreamId: m.modelId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
        supplierPrice: Number(volPrice),
        supplierCurrency: "CNY",
      }, officialCtx);
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
