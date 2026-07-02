import { fmtDiscount, fmtCostCell } from "./pricing-compare.mjs";
import {
  CNY_PER_M,
  USD_PER_M,
  colTrinityList,
  buildSupplierTableHeader,
  upstreamUnit,
} from "./units.mjs";
import {
  formatCompactTriple,
  officialCellsForTrinityTier,
} from "./supplier-official-compare.mjs";

export function fmtUsd(v) {
  if (v == null || v === "") return "待填";
  const n = Number(v);
  return Number.isFinite(n) ? n : "待填";
}

/** @deprecated 对比总表见 compare-hub-lib；保留供 JSON 结构 */
export function summaryTiersForModel(m) {
  const tiers = m.tiers ?? [];
  const priced = tiers.filter(
    (t) =>
      t.thIn != null ||
      t.thOut != null ||
      t.blIn != null ||
      t.blOut != null ||
      t.aigcDomIn != null ||
      t.aigcDomOut != null ||
      t.aigcIntlIn != null ||
      t.aigcIntlOut != null,
  );
  if (priced.length) return priced;
  return tiers.length ? [tiers[0]] : [];
}

function summaryLabel(t) {
  return (t?.supplierCount ?? 0) === 0 ? "无 TH/BL 官网" : (t?.summary ?? "");
}

export function buildSummaryRows(models) {
  const header = [
    "Trinity ID",
    "显示名",
    "厂商",
    "价格档位",
    "上游数",
    `TokenHub_输入(${CNY_PER_M})`,
    `TokenHub_输出(${CNY_PER_M})`,
    `TokenHub_缓存(${CNY_PER_M})`,
    `百炼_输入(${CNY_PER_M})`,
    `百炼_输出(${CNY_PER_M})`,
    `百炼_缓存(${CNY_PER_M})`,
    `AIGC国内_输入(${CNY_PER_M})`,
    `AIGC国内_输出(${CNY_PER_M})`,
    `AIGC国内_缓存(${CNY_PER_M})`,
    `AIGC国际_输入(${USD_PER_M})`,
    `AIGC国际_输出(${USD_PER_M})`,
    `AIGC国际_缓存(${USD_PER_M})`,
    "输入对比(TH vs BL)",
    "输出对比(TH vs BL)",
    "缓存对比(TH vs BL)",
    "综合(TH vs BL)",
    colTrinityList("输入"),
    colTrinityList("输出"),
    colTrinityList("缓存"),
  ];

  const rows = [];
  for (const m of models) {
    const tierRows = summaryTiersForModel(m);
    for (let i = 0; i < tierRows.length; i++) {
      const t = tierRows[i];
      const show = i === 0;
      rows.push([
        show ? m.trinityId : "",
        show ? m.displayName : "",
        show ? m.brand : "",
        t.tierLabel ?? "",
        t.supplierCount ?? 0,
        t.thIn ?? "",
        t.thOut ?? "",
        t.thCache ?? "",
        t.blIn ?? "",
        t.blOut ?? "",
        t.blCache ?? "",
        t.aigcDomIn ?? "",
        t.aigcDomOut ?? "",
        t.aigcDomCache ?? "",
        t.aigcIntlIn ?? "",
        t.aigcIntlOut ?? "",
        t.aigcIntlCache ?? "",
        t.cmpIn ?? "",
        t.cmpOut ?? "",
        t.cmpCache ?? "",
        summaryLabel(t),
      ]);
    }
  }

  return [header, ...rows];
}

/** AIGC 全量目录（列结构与百炼/TokenHub 供应商表一致） */
export function buildAigcCatalogRows(aigcModels, site, officialCtx = {}) {
  const sup = { catalog: "aigc", site };
  const header = buildSupplierTableHeader(sup);
  const currency = upstreamUnit(sup) === USD_PER_M ? "USD" : "CNY";

  const list = aigcModels.filter((m) => m.site === site);
  const rows = [];
  let rowNum = 0;

  for (const m of list) {
    const displayName = `${m.vendorName} ${m.modelName}`.trim();
    for (let i = 0; i < m.tiers.length; i++) {
      const t = m.tiers[i];
      rowNum++;
      const show = i === 0;
      const supplierPrices = {
        input: t.input,
        output: t.output,
        cache: t.cache,
      };
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForTrinityTier(
          m.trinityId,
          t,
          supplierPrices,
          currency,
          officialCtx,
          { tierIndex: i, tierTotal: m.tiers.length },
        );

      rows.push([
        rowNum,
        show ? (m.trinityId ?? "") : "",
        show ? displayName : "",
        show ? m.vendorName : "",
        t.tierName,
        show ? m.modelName : "",
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
        "待填",
        "待填",
      ]);
    }
  }

  return [header, ...rows];
}

export function buildSupplierRows(sup, models, officialCtx = {}) {
  const header = buildSupplierTableHeader(sup);
  const currency = upstreamUnit(sup) === USD_PER_M ? "USD" : "CNY";

  const rows = [];
  let rowNum = 0;

  for (const m of models) {
    const tierRows = m.tiers.filter(
      (t) => t[sup.inKey] != null || t[sup.outKey] != null,
    );
    if (!tierRows.length) continue;

    for (let i = 0; i < tierRows.length; i++) {
      const t = tierRows[i];
      rowNum++;
      const show = i === 0;
      const discount = t[sup.discountKey];
      const cost = t[sup.costKey];
      const hasSupplier = t[sup.inKey] != null || t[sup.outKey] != null;
      const discStr = discount != null ? fmtDiscount(discount) : "待填";

      const supplierPrices = {
        input: t[sup.inKey],
        output: t[sup.outKey],
        cache: t[sup.cacheKey],
      };
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForTrinityTier(
          m.trinityId,
          t,
          supplierPrices,
          currency,
          officialCtx,
          { tierIndex: i, tierTotal: tierRows.length },
        );

      const costStr =
        !hasSupplier || discount == null
          ? "待填"
          : fmtCostCell(
              discount,
              t[sup.inKey],
              t[sup.outKey],
              t[sup.cacheKey],
            );

      rows.push([
        rowNum,
        show ? m.trinityId : "",
        show ? m.displayName : "",
        show ? m.brand : "",
        t.tierLabel,
        t[sup.idKey] ?? m.trinityId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
        discStr,
        costStr,
      ]);
    }
  }

  return [header, ...rows];
}
