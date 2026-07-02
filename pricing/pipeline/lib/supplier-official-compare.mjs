/**
 * 供应商分表：厂商官方价 vs 供应商挂牌（同档对齐 · 生文）
 */

import { pickTierClosestToRef } from "./tier-align.mjs";
import { findTierByKey, tierToKey } from "./tier-key.mjs";
import { parseNum } from "./pricing-compare.mjs";
import {
  FIELD_MATCH_PCT,
  isWithinTolerance,
} from "./pricing-tolerance.mjs";
import {
  FX_ONLINE_DOMESTIC,
  FX_CNY_PER_USD,
  formatOfficialSingleTier,
} from "./compare-official-lib.mjs";

/** AIGC 国内站常用 USD→CNY 挂牌系数（如 gpt-4o $2.5 → ¥18.75） */
const FX_AIGC_DOMESTIC = 7.5;

const FX_USD_TO_CNY = [
  { fx: FX_ONLINE_DOMESTIC, label: "6.5" },
  { fx: FX_CNY_PER_USD, label: "7.25" },
  { fx: FX_AIGC_DOMESTIC, label: "7.5" },
];

function formatCompactTriple(input, output, cache, currency = "CNY") {
  const sym = currency === "USD" ? "$" : "¥";
  const parts = [];
  if (input != null && input !== "") parts.push(`入 ${sym}${input}`);
  if (output != null && output !== "") parts.push(`出 ${sym}${output}`);
  if (cache != null && cache !== "") parts.push(`缓 ${sym}${cache}`);
  return parts.length ? parts.join(" · ") : "—";
}

function fieldPct(officialVal, supplierVal) {
  const off = parseNum(officialVal);
  const sup = parseNum(supplierVal);
  if (off == null || sup == null) return null;
  if (isWithinTolerance(off, sup, FIELD_MATCH_PCT)) return 0;
  if (off === 0) return null;
  return Math.round(((sup - off) / off) * 1000) / 10;
}

function formatFieldDelta(label, pct) {
  if (pct == null) return null;
  if (Math.abs(pct) < 0.5) return `${label}一致`;
  const sign = pct > 0 ? "+" : "";
  return `${label}${sign}${pct}%`;
}

/** 同币种逐字段比较 */
function compareSameCurrency(officialTier, supplierPrices) {
  const flags = [];
  for (const [label, key] of [
    ["入", "input"],
    ["出", "output"],
    ["缓", "cache"],
  ]) {
    const d = formatFieldDelta(
      label,
      fieldPct(officialTier[key], supplierPrices[key]),
    );
    if (d) flags.push(d);
  }
  return flags;
}

/**
 * 官方 USD · 供应商 CNY：在常见 FX 下换算后取最佳匹配
 * @returns {{ flags: string[], fxLabel: string|null }}
 */
function compareUsdOfficialToCnySupplier(officialTier, supplierPrices) {
  let best = { flags: [], maxAbsPct: Infinity, fxLabel: null };

  const tryFx = (fx, label) => {
    const flags = [];
    let maxAbs = 0;
    for (const [labelName, key] of [
      ["入", "input"],
      ["出", "output"],
      ["缓", "cache"],
    ]) {
      const off = parseNum(officialTier[key]);
      const sup = parseNum(supplierPrices[key]);
      if (off == null || sup == null) continue;
      const pct = fieldPct(off * fx, sup);
      const d = formatFieldDelta(labelName, pct);
      if (d) flags.push(d);
      if (pct != null) maxAbs = Math.max(maxAbs, Math.abs(pct));
    }
    if (flags.length && maxAbs < best.maxAbsPct) {
      best = {
        flags,
        maxAbsPct: maxAbs,
        fxLabel: Math.abs(fx - FX_ONLINE_DOMESTIC) < 0.01 ? null : label,
      };
    }
  };

  for (const { fx, label } of FX_USD_TO_CNY) tryFx(fx, label);

  const offIn = parseNum(officialTier.input);
  const supIn = parseNum(supplierPrices.input);
  if (offIn && supIn) {
    tryFx(supIn / offIn, "隐含");
  }

  return best;
}

function summarizeFlags(flags, fxLabel) {
  if (!flags.length) return "—";
  const bad = flags.filter((f) => !f.endsWith("一致"));
  if (!bad.length) {
    return fxLabel ? `✅ 一致(÷${fxLabel})` : "✅ 一致";
  }
  return `⚠ ${bad.join(" ")}`;
}

/** @returns {{ fieldPcts: number[], maxAbsPct: number|null, maxUpPct: number|null }} */
function collectFieldPcts(officialTier, supplierPrices, offCurrency, supplierCurrency) {
  const fieldPcts = [];

  const pushPct = (offVal, supVal, fx = 1) => {
    const off = parseNum(offVal);
    const sup = parseNum(supVal);
    if (off == null || sup == null) return;
    const pct = fieldPct(off * fx, sup);
    if (pct != null) fieldPcts.push(pct);
  };

  if (!officialTier) return { fieldPcts, maxAbsPct: null, maxUpPct: null };

  if (offCurrency === supplierCurrency) {
    for (const key of ["input", "output", "cache"]) {
      pushPct(officialTier[key], supplierPrices[key]);
    }
  } else if (offCurrency === "USD" && supplierCurrency === "CNY") {
    const { flags, maxAbsPct } = compareUsdOfficialToCnySupplier(
      officialTier,
      supplierPrices,
    );
    void flags;
    if (maxAbsPct !== Infinity) {
      for (const key of ["input", "output", "cache"]) {
        const off = parseNum(officialTier[key]);
        const sup = parseNum(supplierPrices[key]);
        if (off == null || sup == null) continue;
        let bestPct = null;
        for (const { fx } of FX_USD_TO_CNY) {
          const pct = fieldPct(off * fx, sup);
          if (pct != null && (bestPct == null || Math.abs(pct) < Math.abs(bestPct))) {
            bestPct = pct;
          }
        }
        const offIn = parseNum(officialTier.input);
        const supIn = parseNum(supplierPrices.input);
        if (offIn && supIn) {
          const pct = fieldPct(offIn * (supIn / offIn), sup);
          if (pct != null && (bestPct == null || Math.abs(pct) < Math.abs(bestPct))) {
            bestPct = pct;
          }
        }
        if (bestPct != null) fieldPcts.push(bestPct);
      }
    }
    const up = fieldPcts.filter((p) => p > FIELD_MATCH_PCT);
    const maxUpPct = up.length ? Math.max(...up) : null;
    const maxAbs =
      fieldPcts.length > 0
        ? Math.max(...fieldPcts.map((p) => Math.abs(p)))
        : maxAbsPct !== Infinity
          ? maxAbsPct
          : null;
    return { fieldPcts, maxAbsPct: maxAbs, maxUpPct };
  } else if (offCurrency === "CNY" && supplierCurrency === "USD") {
    for (const key of ["input", "output", "cache"]) {
      pushPct(officialTier[key], supplierPrices[key], 1 / FX_ONLINE_DOMESTIC);
    }
  }

  const maxAbsPct = fieldPcts.length
    ? Math.max(...fieldPcts.map((p) => Math.abs(p)))
    : null;
  const up = fieldPcts.filter((p) => p > FIELD_MATCH_PCT);
  const maxUpPct = up.length ? Math.max(...up) : null;
  return { fieldPcts, maxAbsPct, maxUpPct };
}

/**
 * 数值评估：供应商挂牌 vs 厂商官方（同档）
 * @returns {{
 *   status: "match"|"mismatch"|"no_official_tier"|"no_official"|"not_comparable",
 *   summaryText: string,
 *   maxAbsPct: number|null,
 *   maxUpPct: number|null,
 * }}
 */
export function evaluateSupplierVsOfficial(
  officialModel,
  officialTier,
  supplierPrices,
  supplierCurrency,
) {
  const cells = buildOfficialSupplierCells(
    officialModel,
    officialTier,
    supplierPrices,
    supplierCurrency,
  );
  const summaryText = cells.supplierVsOfficial ?? "—";

  if (!officialModel?.tiers?.length) {
    return {
      status: "no_official",
      summaryText,
      maxAbsPct: null,
      maxUpPct: null,
    };
  }
  if (!officialTier) {
    return {
      status: "no_official_tier",
      summaryText,
      maxAbsPct: null,
      maxUpPct: null,
    };
  }

  const offCurrency = officialModel.currency ?? "USD";
  const { maxAbsPct, maxUpPct } = collectFieldPcts(
    officialTier,
    supplierPrices,
    offCurrency,
    supplierCurrency,
  );

  if (summaryText.startsWith("✅") || (maxAbsPct != null && maxAbsPct < FIELD_MATCH_PCT)) {
    return { status: "match", summaryText, maxAbsPct: maxAbsPct ?? 0, maxUpPct: null };
  }
  if (summaryText === "—") {
    return { status: "not_comparable", summaryText, maxAbsPct, maxUpPct };
  }
  return { status: "mismatch", summaryText, maxAbsPct, maxUpPct };
}

export function resolveOfficialModel(trinityId, vendorMap, officialByVendorId) {
  const tid = trinityId?.toLowerCase();
  if (!tid) return null;
  const vendorModelId = vendorMap[tid]?.vendorModelId ?? trinityId;
  return officialByVendorId.get(vendorModelId.toLowerCase()) ?? null;
}

export function pickOfficialTierForSupplier(
  officialModel,
  supplierIn,
  supplierCurrency,
  tierLabel,
  tierIndex = 0,
  tierTotal = 1,
  tierKey = null,
) {
  const tiers = officialModel?.tiers ?? [];
  if (!tiers.length) return null;

  const wantKey =
    tierKey && tierKey !== "uniform"
      ? tierKey
      : tierToKey(tierLabel, tierIndex, tierTotal);

  if (wantKey && wantKey !== "uniform") {
    const byKey = findTierByKey(tiers, wantKey);
    if (byKey) return byKey;
  }

  if (tierLabel && tiers.length > 1) {
    const want = tierToKey(tierLabel, tierIndex, tierTotal);
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      const key = tierToKey(t.tierLabel ?? t.tierName, i, tiers.length);
      if (key === want) return t;
    }
  }

  const currency = officialModel.currency ?? "USD";
  const supIn = parseNum(supplierIn);
  if (supIn != null) {
    const refUsd =
      supplierCurrency === "USD" ? supIn : supIn / FX_ONLINE_DOMESTIC;
    const hit = pickTierClosestToRef(tiers, refUsd, {
      currency,
      fx: FX_ONLINE_DOMESTIC,
    });
    if (hit) return hit;
  }

  if (tiers.length === 1) return tiers[0];
  if (tierIndex < tiers.length) return tiers[tierIndex];
  return null;
}

export function buildOfficialSupplierCells(
  officialModel,
  officialTier,
  supplierPrices,
  supplierCurrency,
) {
  const supplierListed = formatCompactTriple(
    supplierPrices.input,
    supplierPrices.output,
    supplierPrices.cache,
    supplierCurrency,
  );

  if (!officialTier) {
    const hasOfficial = (officialModel?.tiers ?? []).length > 0;
    return {
      vendorOfficial: "—",
      supplierListed,
      supplierVsOfficial: hasOfficial ? "— 官方无同档" : "—",
    };
  }

  const offCurrency = officialModel?.currency ?? "USD";
  const sym = offCurrency === "CNY" ? "¥" : "$";
  const vendorOfficial = formatOfficialSingleTier(officialTier, sym);

  let supplierVsOfficial;
  if (offCurrency === supplierCurrency) {
    supplierVsOfficial = summarizeFlags(
      compareSameCurrency(officialTier, supplierPrices),
      null,
    );
  } else if (offCurrency === "USD" && supplierCurrency === "CNY") {
    const { flags, fxLabel } = compareUsdOfficialToCnySupplier(
      officialTier,
      supplierPrices,
    );
    supplierVsOfficial = summarizeFlags(flags, fxLabel);
  } else if (offCurrency === "CNY" && supplierCurrency === "USD") {
    const flags = [];
    for (const [label, key] of [
      ["入", "input"],
      ["出", "output"],
      ["缓", "cache"],
    ]) {
      const off = parseNum(officialTier[key]);
      const sup = parseNum(supplierPrices[key]);
      if (off == null || sup == null) continue;
      const pct = fieldPct(off / FX_ONLINE_DOMESTIC, sup);
      const d = formatFieldDelta(label, pct);
      if (d) flags.push(d);
    }
    supplierVsOfficial = summarizeFlags(flags, "6.5");
  } else {
    supplierVsOfficial = "—";
  }

  return { vendorOfficial, supplierListed, supplierVsOfficial };
}

/** @param {{ vendorMap?: object, officialByVendorId?: Map }} officialCtx */
export function officialCellsForTrinityTier(
  trinityId,
  tier,
  supplierPrices,
  supplierCurrency,
  officialCtx = {},
  tierMeta = {},
) {
  const { vendorMap = {}, officialByVendorId = new Map() } = officialCtx;
  const officialModel = resolveOfficialModel(
    trinityId,
    vendorMap,
    officialByVendorId,
  );
  const officialTier = pickOfficialTierForSupplier(
    officialModel,
    supplierPrices.input,
    supplierCurrency,
    tier?.tierLabel ?? tier?.tierName,
    tierMeta.tierIndex ?? 0,
    tierMeta.tierTotal ?? 1,
    tier?.tierKey ?? tierMeta.tierKey ?? null,
  );
  return buildOfficialSupplierCells(
    officialModel,
    officialTier,
    supplierPrices,
    supplierCurrency,
  );
}

export { formatCompactTriple };
