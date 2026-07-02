/**
 * 供应商挂牌 vs 厂商官方价 · 汇总统计（生文 Excel 末 Sheet）
 */

import { upstreamUnit, USD_PER_M } from "./units.mjs";
import { FIELD_MATCH_PCT } from "./pricing-tolerance.mjs";
import {
  evaluateSupplierVsOfficial,
  resolveOfficialModel,
  pickOfficialTierForSupplier,
} from "./supplier-official-compare.mjs";

export const SUPPLIER_SUMMARY_SHEET = "汇总-供应商vs官方";

const HIGH_DEVIATION_PCT = 10;

function fmtPct(n) {
  if (n == null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

function fmtRange(min, max) {
  if (min == null && max == null) return "—";
  if (min == null) return fmtPct(max);
  if (max == null) return fmtPct(min);
  if (min === max) return fmtPct(min);
  return `${fmtPct(min)} ~ ${fmtPct(max)}`;
}

/**
 * @param {object} sup supplier config (from gen-upstream SUPPLIERS)
 * @param {object[]} models upstream models
 * @param {object} officialCtx
 */
export function collectSupplierOfficialTierStats(sup, models, officialCtx = {}) {
  const currency = upstreamUnit(sup) === USD_PER_M ? "USD" : "CNY";
  const { vendorMap = {}, officialByVendorId = new Map() } = officialCtx;
  const tiers = [];

  for (const m of models) {
    const tierRows = (m.tiers ?? []).filter(
      (t) => t[sup.inKey] != null || t[sup.outKey] != null,
    );
    if (!tierRows.length) continue;

    for (let i = 0; i < tierRows.length; i++) {
      const t = tierRows[i];
      const supplierPrices = {
        input: t[sup.inKey],
        output: t[sup.outKey],
        cache: t[sup.cacheKey],
      };
      const officialModel = resolveOfficialModel(
        m.trinityId,
        vendorMap,
        officialByVendorId,
      );
      const officialTier = pickOfficialTierForSupplier(
        officialModel,
        supplierPrices.input,
        currency,
        t.tierLabel,
        i,
        tierRows.length,
        t.tierKey ?? null,
      );
      const evalResult = evaluateSupplierVsOfficial(
        officialModel,
        officialTier,
        supplierPrices,
        currency,
      );

      tiers.push({
        trinityId: m.trinityId,
        displayName: m.displayName,
        brand: m.brand,
        tierLabel: t.tierLabel ?? "—",
        ...evalResult,
      });
    }
  }

  return tiers;
}

/**
 * @param {object} sup
 * @param {ReturnType<typeof collectSupplierOfficialTierStats>} tierStats
 */
function aggregateSupplierStats(sup, tierStats) {
  const byModel = new Map();
  for (const t of tierStats) {
    const id = t.trinityId.toLowerCase();
    if (!byModel.has(id)) {
      byModel.set(id, {
        trinityId: t.trinityId,
        displayName: t.displayName,
        tiers: [],
      });
    }
    byModel.get(id).tiers.push(t);
  }

  const models = [...byModel.values()];
  let matchModels = 0;
  let mismatchModels = 0;
  let uncomparableModels = 0;

  const mismatchTiers = tierStats.filter((t) => t.status === "mismatch");

  const allUpPcts = mismatchTiers
    .map((t) => {
      const v = t.maxUpPct ?? t.maxAbsPct;
      return v != null && v > FIELD_MATCH_PCT ? v : null;
    })
    .filter((v) => v != null);

  const over10Models = [];

  for (const m of models) {
    const statuses = m.tiers.map((t) => t.status);
    const hasMismatch = statuses.includes("mismatch");
    const allMatch = statuses.every((s) => s === "match");
    const allUncomp = statuses.every(
      (s) => s === "no_official" || s === "no_official_tier" || s === "not_comparable",
    );

    if (allUncomp) uncomparableModels++;
    else if (hasMismatch) {
      mismatchModels++;
      const tierMaxUps = m.tiers
        .filter((t) => t.status === "mismatch")
        .map((t) => {
          const v = t.maxUpPct ?? t.maxAbsPct;
          return v != null && v > 0 ? v : null;
        })
        .filter((v) => v != null);
      const maxUp = tierMaxUps.length ? Math.max(...tierMaxUps) : 0;
      if (maxUp > HIGH_DEVIATION_PCT) {
        over10Models.push({
          trinityId: m.trinityId,
          displayName: m.displayName,
          maxUpPct: maxUp,
          tiers: m.tiers.filter((t) => t.status === "mismatch"),
        });
      }
    } else if (allMatch) matchModels++;
    else uncomparableModels++;
  }

  const tierMatch = tierStats.filter((t) => t.status === "match").length;
  const tierMismatch = tierStats.filter((t) => t.status === "mismatch").length;
  const tierUncomp = tierStats.length - tierMatch - tierMismatch;

  return {
    supplierKey: sup.key,
    supplierLabel: sup.excelSheet ?? sup.title,
    modelTotal: models.length,
    tierTotal: tierStats.length,
    modelMatch: matchModels,
    modelMismatch: mismatchModels,
    modelUncomparable: uncomparableModels,
    tierMatch,
    tierMismatch,
    tierUncomparable: tierUncomp,
    upPctMin: allUpPcts.length ? Math.min(...allUpPcts) : null,
    upPctMax: allUpPcts.length ? Math.max(...allUpPcts) : null,
    over10Count: over10Models.length,
    over10Models,
    mismatchTiers,
  };
}

/**
 * @param {object[]} suppliers SUPPLIERS config array
 * @param {object[]} models
 * @param {object} officialCtx
 * @param {{ generatedAt?: string }} [opts]
 */
export function buildSupplierOfficialSummaryReport(suppliers, models, officialCtx, opts = {}) {
  const generatedAt = opts.generatedAt ?? new Date().toISOString();
  const bySupplier = suppliers.map((sup) => {
    const tierStats = collectSupplierOfficialTierStats(sup, models, officialCtx);
    return aggregateSupplierStats(sup, tierStats);
  });

  return { generatedAt, bySupplier };
}

/**
 * @param {ReturnType<typeof buildSupplierOfficialSummaryReport>} report
 */
export function buildSupplierOfficialSummaryExcelRows(report) {
  const header = [
    "供应商",
    "接入模型数",
    "模型_一致",
    "模型_不一致",
    "模型_无法对比",
    "对比档位行数",
    "档位_一致",
    "档位_不一致",
    "不一致上浮区间",
    "超10%模型数",
    "超10%模型列表",
  ];

  const rows = [header];

  for (const s of report.bySupplier) {
    const over10List = s.over10Models
      .map((m) => `${m.trinityId}(${fmtPct(m.maxUpPct)})`)
      .join("；");
    rows.push([
      s.supplierLabel,
      s.modelTotal,
      s.modelMatch,
      s.modelMismatch,
      s.modelUncomparable,
      s.tierTotal,
      s.tierMatch,
      s.tierMismatch,
      fmtRange(s.upPctMin, s.upPctMax),
      s.over10Count,
      over10List || "—",
    ]);
  }

  rows.push([]);
  rows.push(["—— 不一致超过10% · 档位明细 ——"]);
  rows.push([
    "供应商",
    "Trinity ID",
    "显示名",
    "档位",
    "最大上浮%",
    "供应商vs官方",
  ]);

  for (const s of report.bySupplier) {
    for (const m of s.over10Models) {
      for (let i = 0; i < m.tiers.length; i++) {
        const t = m.tiers[i];
        rows.push([
          i === 0 ? s.supplierLabel : "",
          i === 0 ? m.trinityId : "",
          i === 0 ? m.displayName : "",
          t.tierLabel,
          fmtPct(t.maxUpPct ?? t.maxAbsPct),
          t.summaryText,
        ]);
      }
    }
  }

  rows.push([]);
  rows.push([`生成时间：${report.generatedAt.slice(0, 19)}Z`]);
  rows.push([
    "说明：一致=与厂商官方价偏差<0.5%（含 FX 7.5/7.25/6.5 最佳匹配）；不一致上浮=供应商高于官方的偏差%；模型级不一致=任一档位不一致",
  ]);

  return rows;
}
