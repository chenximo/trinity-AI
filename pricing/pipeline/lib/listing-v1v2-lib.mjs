/**
 * 刊例 V1 / V2 计算（双轨；不写生产）
 * 真源：pricing/docs/刊例策略-V1-V2-国际站优先.md
 */

import {
  LISTING_POLICY,
  FX_V1_CNY_PER_USD,
} from "../../config/listing-policy.mjs";
import { tierToKey } from "./tier-key.mjs";

/**
 * @param {object | undefined} seed
 */
export function expandListingTiers(seed) {
  if (!seed) return [];
  if (Array.isArray(seed.tiers) && seed.tiers.length) {
    return seed.tiers.map((t, i, arr) => ({
      tierLabel: t.tierLabel,
      tierKey: tierToKey(t.tierLabel, i, arr.length),
      input: t.input ?? null,
      output: t.output ?? null,
      cache: t.cache ?? null,
    }));
  }
  return [
    {
      tierLabel: "标准价",
      tierKey: "uniform",
      input: seed.input ?? null,
      output: seed.output ?? null,
      cache: seed.cache ?? null,
    },
  ];
}

/** @param {number|null|undefined} n @param {string} currency */
export function listingToUsd(n, currency) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const v = Number(n);
  if (currency === "USD") return v;
  if (currency === "CNY") return v / FX_V1_CNY_PER_USD;
  return null;
}

export function listingFmt(n) {
  if (n == null) return "⚠";
  const x = Number(n);
  if (!Number.isFinite(x)) return "⚠";
  return Number.isInteger(x) ? String(x) : x.toFixed(6).replace(/\.?0+$/, "");
}

export function listingPctDelta(v2, v1) {
  if (v2 == null || v1 == null) return "⚠";
  if (v1 === 0) return v2 === 0 ? "=" : "n/a";
  const d = ((v2 - v1) / Math.abs(v1)) * 100;
  if (Math.abs(d) < 0.05) return "=";
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(1)}%`;
}

/**
 * @param {string} modelId
 * @param {Record<string, any>} domesticSeed
 * @param {Record<string, any>} intlSeed
 */
export function buildListingV1V2ModelRows(modelId, domesticSeed, intlSeed) {
  const d = domesticSeed[modelId];
  const i = intlSeed[modelId];
  const dCur = d?.currency ?? (d ? "USD" : null);
  const dTiers = expandListingTiers(d);
  const iTiers = expandListingTiers(i);

  const intlByKey = new Map(iTiers.map((t) => [t.tierKey, t]));
  const intlUniform =
    intlByKey.get("uniform") ?? (iTiers.length === 1 ? iTiers[0] : null);

  const baseTiers = dTiers.length ? dTiers : iTiers.length ? iTiers : [];
  if (!baseTiers.length) {
    return [
      {
        modelId,
        tierLabel: "—",
        tierKey: "uniform",
        domestic: null,
        international: null,
        v1: null,
        v2: null,
        note: "缺国内与国际锚",
        v2Source: "missing",
      },
    ];
  }

  return baseTiers.map((dt) => {
    let it = intlByKey.get(dt.tierKey);
    let v2Source = "intl";
    let note = "";
    if (!it && intlUniform && dt.tierKey !== "uniform") {
      it = intlUniform;
      v2Source = "intl-uniform";
      note = "国际站单档对齐";
    } else if (!it && i) {
      v2Source = "fallback-v1";
      note = "国际站缺本档 → 回退 V1";
    } else if (!i && dCur === "USD") {
      v2Source = "usd-direct";
      note = "国际-only / 已是 USD · V2=V1";
    } else if (!i) {
      v2Source = "fallback-v1";
      note = "无国际站锚 → V2=V1";
    }

    const domestic = d
      ? {
          currency: dCur,
          input: dt.input,
          output: dt.output,
          cache: dt.cache,
        }
      : null;

    const v1 = d
      ? {
          input: listingToUsd(dt.input, dCur),
          output: listingToUsd(dt.output, dCur),
          cache: listingToUsd(dt.cache, dCur),
        }
      : it
        ? { input: it.input, output: it.output, cache: it.cache }
        : null;

    let v2 = v1;
    if (v2Source === "intl" || v2Source === "intl-uniform") {
      v2 = {
        input: it.input ?? null,
        output: it.output ?? null,
        cache: it.cache ?? null,
      };
    }

    return {
      modelId,
      tierLabel: dt.tierLabel,
      tierKey: dt.tierKey,
      domestic,
      international: it
        ? {
            currency: "USD",
            input: it.input,
            output: it.output,
            cache: it.cache,
          }
        : null,
      v1,
      v2,
      note,
      v2Source,
    };
  });
}

export function listingMoneyCell(obj) {
  if (!obj) return "—";
  const cur = obj.currency ? `${obj.currency} ` : "";
  return `${cur}入 ${listingFmt(obj.input)} · 出 ${listingFmt(obj.output)} · 缓 ${listingFmt(obj.cache)}`;
}

export function listingUsdCell(obj) {
  if (!obj) return "—";
  return `入 $${listingFmt(obj.input)} · 出 $${listingFmt(obj.output)} · 缓 $${listingFmt(obj.cache)}`;
}

export function listingV2vsV1Cell(v1, v2) {
  if (!v1 || !v2) return "—";
  return `入 ${listingPctDelta(v2.input, v1.input)} / 出 ${listingPctDelta(v2.output, v1.output)}`;
}

/**
 * @param {object[]} listingRows buildListingV1V2ModelRows 展开结果
 */
export function indexListingV1V2Rows(listingRows) {
  /** @type {Map<string, object>} */
  const byIdTier = new Map();
  /** @type {Map<string, object[]>} */
  const byId = new Map();
  for (const r of listingRows) {
    const id = String(r.modelId ?? "").toLowerCase();
    if (!id) continue;
    byIdTier.set(`${id}\0${r.tierKey}`, r);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(r);
  }
  return { byIdTier, byId };
}

/**
 * @param {{ byIdTier: Map, byId: Map }} index
 * @param {string} modelId
 * @param {string} [tierLabel]
 * @param {number} [tierIndex]
 * @param {number} [tierTotal]
 */
export function lookupListingV1V2(
  index,
  modelId,
  tierLabel = "",
  tierIndex = 0,
  tierTotal = 1,
) {
  const id = String(modelId ?? "").trim().toLowerCase();
  if (!id || !index) return null;
  const tk = tierToKey(tierLabel || "标准价", tierIndex, tierTotal);
  return (
    index.byIdTier.get(`${id}\0${tk}`) ??
    index.byIdTier.get(`${id}\0uniform`) ??
    index.byId.get(id)?.[0] ??
    null
  );
}

/**
 * 为刊例对比行挂上 V1/V2 展示字段
 * @param {object[]} compareRows
 * @param {Record<string, any>} domesticSeed
 * @param {Record<string, any>} intlSeed
 */
export function enrichCompareRowsWithListingV1V2(
  compareRows,
  domesticSeed,
  intlSeed,
) {
  const ids = new Set();
  for (const r of compareRows) {
    const tid = String(r.trinityId ?? "").trim();
    if (tid && tid !== "—" && tid !== "-") ids.add(tid);
  }
  const listingRows = [];
  for (const id of ids) {
    listingRows.push(...buildListingV1V2ModelRows(id, domesticSeed, intlSeed));
  }
  const index = indexListingV1V2Rows(listingRows);
  const policy = LISTING_POLICY;

  for (const r of compareRows) {
    const tid = String(r.trinityId ?? "").trim();
    const hit =
      tid && tid !== "—" && tid !== "-"
        ? lookupListingV1V2(index, tid, r.tierLabel ?? "")
        : null;
    r.listingV1 = hit ? listingUsdCell(hit.v1) : "—";
    r.listingV2 = hit ? listingUsdCell(hit.v2) : "—";
    r.listingV2vsV1 = hit ? listingV2vsV1Cell(hit.v1, hit.v2) : "—";
    r.listingEffective =
      policy === "v1" ? r.listingV1 : r.listingV2;
    r.listingV2Source = hit?.v2Source ?? "—";
    r.listingPolicy = policy;
    if (hit?.note) {
      r.note = [r.note, hit.note].filter(Boolean).join(" · ");
    }
  }
  return compareRows;
}

export { LISTING_POLICY, FX_V1_CNY_PER_USD };
