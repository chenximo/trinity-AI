import {
  CNY_PER_M,
  USD_PER_M,
  colTrinityList,
  buildSupplierTableHeader,
  upstreamUnit,
} from "./units.mjs";
import {
  tierPricesFromItems,
  sortSupplierCatalogModels,
} from "./pricing-compare.mjs";
import {
  formatCompactTriple,
  officialCellsForTrinityTier,
  listingCellsForTrinityTier,
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
      t.aigcIntlOut != null ||
      t.volIn != null ||
      t.volOut != null,
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

  const list = sortSupplierCatalogModels(
    aigcModels.filter((m) => m.site === site),
    { brandKey: "vendorName", idKey: "trinityId" },
  );
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
      const tierMeta = { tierIndex: i, tierTotal: m.tiers.length };
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForTrinityTier(
          m.trinityId ?? m.modelId,
          { tierLabel: t.tierName, tierKey: t.tierKey },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
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
        ...listingRowCells(
          m.trinityId ?? "",
          { tierLabel: t.tierName, tierKey: t.tierKey },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        ),
      ]);
    }
  }

  return [header, ...rows];
}

function tierLabelFromSupplierTier(t) {
  const name = t?.tierName?.trim();
  if (name) return name;
  if (t?.tierType === "Uniform") return "统一价";
  return t?.tierType ?? "统一价";
}

function listingRowCells(trinityId, tier, supplierPrices, currency, officialCtx, tierMeta) {
  const { onlineListing, listingVsSupplier } = listingCellsForTrinityTier(
    trinityId,
    tier,
    supplierPrices,
    currency,
    officialCtx,
    tierMeta,
  );
  return [onlineListing, listingVsSupplier];
}

/**
 * TokenHub / 百炼生文：供应商控制台全量目录（Excel 对外真源）
 * @param {object[]} supplierModels
 * @param {object} officialCtx
 * @param {{ resolveTrinityId?: (modelId: string) => string, formatDisplayName?: (m: object) => string, brandDefault?: string }} [opts]
 */
export function buildSupplierTextCatalogRows(
  supplierModels,
  officialCtx = {},
  opts = {},
) {
  const {
    resolveTrinityId = () => "",
    formatDisplayName = (m) =>
      m.displayName || m.modelName || m.modelId || "—",
    brandDefault = "—",
  } = opts;
  const header = buildSupplierTableHeader({});
  const currency = "CNY";

  const rows = [];
  let rowNum = 0;

  for (const m of sortSupplierCatalogModels(supplierModels)) {
    const tierList = m.tiers?.length ? m.tiers : [];
    if (!tierList.length) continue;

    const trinityId = resolveTrinityId(m.modelId);
    const displayName = formatDisplayName(m);
    const pricedTiers = tierList.filter((t) => {
      const p = tierPricesFromItems(t);
      return p.input != null || p.output != null || p.cache != null;
    });
    const tiers = pricedTiers.length ? pricedTiers : tierList;

    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      rowNum++;
      const show = i === 0;
      const supplierPrices = tierPricesFromItems(t);
      const tierMeta = { tierIndex: i, tierTotal: tiers.length };
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForTrinityTier(
          trinityId || m.modelId,
          {
            tierLabel: tierLabelFromSupplierTier(t),
            tierKey: t.tierKey,
          },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        );

      rows.push([
        rowNum,
        show ? trinityId : "",
        show ? displayName : "",
        show ? (m.brand ?? brandDefault) : "",
        tierLabelFromSupplierTier(t),
        m.modelId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
        ...listingRowCells(
          trinityId,
          {
            tierLabel: tierLabelFromSupplierTier(t),
            tierKey: t.tierKey,
          },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        ),
      ]);
    }
  }

  return [header, ...rows];
}

/** TokenHub 生文全量（控制台有几条就几条） */
export function buildTokenhubTextCatalogRows(
  thModels,
  officialCtx = {},
  resolveTrinityId = () => "",
) {
  return buildSupplierTextCatalogRows(thModels, officialCtx, {
    resolveTrinityId,
    brandDefault: "—",
  });
}

/** 百炼华北2 生文全量 */
export function buildBailianTextCatalogRows(
  blModels,
  officialCtx = {},
  resolveTrinityId = () => "",
) {
  return buildSupplierTextCatalogRows(blModels, officialCtx, {
    resolveTrinityId,
    brandDefault: "百炼",
  });
}

/** 火山方舟全量目录（直连厂商价 = 官方种子） */
export function buildVolcengineCatalogRows(volcModels, officialCtx = {}) {
  const sup = { catalog: "volcengine" };
  const header = buildSupplierTableHeader(sup);
  const currency = "CNY";

  const rows = [];
  let rowNum = 0;

  for (const m of sortSupplierCatalogModels(volcModels)) {
    const displayName = m.displayName || `${m.vendorName} ${m.modelName}`.trim();
    for (let i = 0; i < m.tiers.length; i++) {
      const t = m.tiers[i];
      rowNum++;
      const show = i === 0;
      const supplierPrices = {
        input: t.input,
        output: t.output,
        cache: t.cache,
      };
      const tierMeta = { tierIndex: i, tierTotal: m.tiers.length };
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForTrinityTier(
          m.trinityId ?? m.modelId,
          { tierLabel: t.tierName, tierKey: t.tierKey },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        );

      rows.push([
        rowNum,
        show ? (m.trinityId ?? "") : "",
        show ? displayName : "",
        show ? (m.brand ?? "火山方舟") : "",
        t.tierName,
        m.modelId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
        ...listingRowCells(
          m.trinityId ?? "",
          { tierLabel: t.tierName, tierKey: t.tierKey },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        ),
      ]);
    }
  }

  return [header, ...rows];
}

/** 原厂直连渠道 Excel 行（价 = official 筛选/复制） */
export function buildOfficialDirectCatalogRows(
  channelModels,
  officialCtx = {},
  { catalog, brandDefault, mixedCurrency = false },
) {
  const header = mixedCurrency
    ? [
        "序号",
        "Trinity ID",
        "显示名",
        "厂商",
        "价格档位",
        "上游模型ID",
        "厂商官方价",
        "供应商挂牌(元或USD/百万tokens)",
        "供应商vs官方",
        `线上刊例(${USD_PER_M})`,
        "刊例vs供应商",
      ]
    : buildSupplierTableHeader({ catalog });

  const rows = [];
  let rowNum = 0;

  for (const m of sortSupplierCatalogModels(channelModels, { idKey: "modelId" })) {
    const currency = mixedCurrency ? (m.currency ?? "USD") : "USD";
    const displayName = m.displayName || `${m.vendorLabel} ${m.modelName}`.trim();
    for (let i = 0; i < m.tiers.length; i++) {
      const t = m.tiers[i];
      rowNum++;
      const show = i === 0;
      const supplierPrices = {
        input: t.input,
        output: t.output,
        cache: t.cache,
      };
      const tierMeta = { tierIndex: i, tierTotal: m.tiers.length };
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForTrinityTier(
          m.trinityId ?? m.modelId,
          { tierLabel: t.tierName, tierKey: t.tierKey },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        );

      rows.push([
        rowNum,
        show ? (m.trinityId ?? "") : "",
        show ? displayName : "",
        show ? (m.brand ?? brandDefault) : "",
        t.tierName,
        m.modelId,
        vendorOfficial,
        supplierListed,
        supplierVsOfficial,
        ...listingRowCells(
          m.trinityId ?? "",
          { tierLabel: t.tierName, tierKey: t.tierKey },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        ),
      ]);
    }
  }

  return [header, ...rows];
}

/** @deprecated 使用 buildOfficialDirectCatalogRows */
export function buildWangjuCatalogRows(wangjuModels, officialCtx = {}) {
  return buildOfficialDirectCatalogRows(wangjuModels, officialCtx, {
    catalog: "wangju-cloudportal",
    brandDefault: "网聚云联-云门户",
    mixedCurrency: false,
  });
}

/** @deprecated 使用 buildOfficialDirectCatalogRows */
export function buildRelayCustCatalogRows(relayModels, officialCtx = {}) {
  return buildOfficialDirectCatalogRows(relayModels, officialCtx, {
    catalog: "relay-cust",
    brandDefault: "中转站-cust",
    mixedCurrency: true,
  });
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

      const supplierPrices = {
        input: t[sup.inKey],
        output: t[sup.outKey],
        cache: t[sup.cacheKey],
      };
      const tierMeta = { tierIndex: i, tierTotal: tierRows.length };
      const { vendorOfficial, supplierListed, supplierVsOfficial } =
        officialCellsForTrinityTier(
          m.trinityId,
          t,
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
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
        ...listingRowCells(
          m.trinityId,
          { tierLabel: t.tierLabel, tierKey: t.tierKey },
          supplierPrices,
          currency,
          officialCtx,
          tierMeta,
        ),
      ]);
    }
  }

  return [header, ...rows];
}
