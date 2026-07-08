/**
 * TokenHub + 百炼官网价对齐、比价
 */

import { tierToKey, tierSortKey } from "./tier-key.mjs";

export { tierToKey, tierSortKey };

export function priceFromTier(t, name) {
  const top = { Input: t.input, Output: t.output, Cache: t.cache }[name];
  if (top != null && top !== "") return String(top);
  const item = (t.items ?? []).find((i) => i.name === name);
  if (item?.price != null) return String(item.price);
  const aliases = {
    Cache: ["CacheHit", "CacheWrite5m"],
    Input: [],
    Output: [],
  };
  for (const alt of aliases[name] ?? []) {
    const hit = (t.items ?? []).find((i) => i.name === alt);
    if (hit?.price != null) return String(hit.price);
  }
  return null;
}

export function parseNum(v) {
  if (v == null || v === "" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** 百炼 HTML 续行错位修复（已知模型） */
const BAILIAN_TIER_FIXES = {
  "qwen-plus": [
    { tierName: "0<Token≤128K", input: "0.8", output: "2", cache: "0.16" },
    { tierName: "128K<Token≤256K", input: "2.4", output: "20", cache: "0.48" },
    { tierName: "256K<Token≤1M", input: "4.8", output: "48", cache: "0.96" },
  ],
  "qwen3.5-plus": [
    { tierName: "0<Token≤128K", input: "0.8", output: "4.8", cache: "0.16" },
    { tierName: "128K<Token≤256K", input: "2", output: "12", cache: "0.4" },
    { tierName: "256K<Token≤1M", input: "4", output: "24", cache: "0.8" },
  ],
  "qwen3.5-flash": [
    { tierName: "0<Token≤128K", input: "0.2", output: "2", cache: "0.04" },
    { tierName: "128K<Token≤256K", input: "0.8", output: "8", cache: "0.16" },
    { tierName: "256K<Token≤1M", input: "1.2", output: "12", cache: "0.24" },
  ],
  "qwen3.6-plus": [
    { tierName: "0<Token≤256K", input: "2", output: "12", cache: "0.4" },
    { tierName: "256K<Token≤1M", input: "8", output: "48", cache: "1.6" },
  ],
  "qwen3.7-plus": [
    { tierName: "0<Token≤256K", input: "2", output: "8", cache: "0.4" },
    { tierName: "256K<Token≤1M", input: "6", output: "24", cache: "1.2" },
  ],
};

export function fixBailianTiers(modelId, tiers) {
  if (BAILIAN_TIER_FIXES[modelId]) {
    return BAILIAN_TIER_FIXES[modelId].map((t) => ({
      tierType: "Tiered",
      tierName: t.tierName,
      input: t.input,
      output: t.output,
      cache: t.cache,
      items: [],
    }));
  }
  return tiers.filter((t) => {
    if (/^\d+(\.\d+)?元$/.test(String(t.tierName ?? "").trim())) return false;
    return t.input != null || t.output != null;
  });
}

export function buildTierMap(tiers, fixModelId = null) {
  const list = fixModelId ? fixBailianTiers(fixModelId, tiers) : tiers;
  const map = new Map();
  const total = list.length || 1;
  list.forEach((t, i) => {
    const key = tierToKey(t.tierName, i, total);
    map.set(key, {
      tierName: t.tierName?.trim() || "统一价",
      input: priceFromTier(t, "Input"),
      output: priceFromTier(t, "Output"),
      cache: priceFromTier(t, "Cache"),
    });
  });
  return map;
}

export function compareField(thVal, blVal, labelTh = "TokenHub", labelBl = "百炼") {
  const a = parseNum(thVal);
  const b = parseNum(blVal);
  if (a == null && b == null) return { text: "—", level: "na" };
  if (a == null) return { text: `仅${labelBl}`, level: "single" };
  if (b == null) return { text: `仅${labelTh}`, level: "single" };
  if (a === b) return { text: "一致", level: "ok" };

  const diff = b - a;
  const pct = a !== 0 ? Math.round((diff / a) * 1000) / 10 : null;
  const who = diff > 0 ? labelBl : labelTh;
  const sign = diff > 0 ? "+" : "";
  const abs = Math.abs(diff);
  const pctStr = pct != null ? ` (${sign}${pct}%)` : "";
  return {
    text: `${who} ${sign}${abs}${pctStr} ↑`.replace("↑", diff > 0 ? "↑" : "↓"),
    level: Math.abs(diff) < 0.001 ? "ok" : "diff",
    higher: diff > 0 ? labelBl : labelTh,
  };
}

export function summarizeRow(cmpIn, cmpOut, cmpCache) {
  const onlyTh =
    (cmpIn.text.startsWith("仅TokenHub") || cmpIn.text === "—") &&
    (cmpOut.text.startsWith("仅TokenHub") || cmpOut.text === "—") &&
    !cmpIn.text.startsWith("仅百炼") &&
    !cmpOut.text.startsWith("仅百炼");
  const onlyBl =
    cmpIn.text.startsWith("仅百炼") && cmpOut.text.startsWith("仅百炼");

  if (onlyTh && cmpIn.text !== "—") return "仅 TokenHub";
  if (onlyBl) return "仅百炼";

  const inOk = cmpIn.level === "ok";
  const outOk = cmpOut.level === "ok";
  const cacheDiff = cmpCache.level === "diff";
  const cacheOk = cmpCache.level === "ok";
  const onlyCache =
    inOk && outOk && cacheDiff;
  const cacheOnlyBl =
    inOk && outOk && cmpCache.text.startsWith("仅百炼");

  if (inOk && outOk && (cacheOk || cmpCache.level === "na")) return "✅ 全一致";
  if (onlyCache) return "⚠️ 仅缓存百炼贵";
  if (cacheOnlyBl) return "⚠️ 仅百炼有缓存计价";
  if (cmpIn.level === "na" && cmpOut.level === "na") return "— 待对齐";

  const hasDiff = [cmpIn, cmpOut, cmpCache].some((c) => c.level === "diff");
  if (hasDiff) return "❌ 存在价差";
  return "—";
}

export function fmtTriple(id, input, output, cache) {
  const fmt = (v) => (v == null ? "—" : v);
  const body = `**${fmt(input)} / ${fmt(output)} / ${fmt(cache)}**`;
  return id ? `\`${id}\`<br>${body}` : body;
}

export function pickBailianModels(models) {
  const byId = new Map();
  for (const m of models) {
    if (m.region !== "中国内地") continue;
    if (m.modelType !== "Text") continue;
    if (m.tiers?.[0]?.chargeUnit && m.tiers[0].chargeUnit !== "TOKEN") continue;

    const id = m.modelId?.toLowerCase();
    if (!id) continue;

    const tiers = fixBailianTiers(id, m.tiers ?? []);
    const score =
      tiers.filter((t) => t.input != null && t.output != null).length * 10 +
      tiers.length;

    const prev = byId.get(id);
    if (!prev || score > prev.score) {
      byId.set(id, { model: m, tiers, score });
    }
  }
  return byId;
}

export function pickTokenhubModels(models) {
  return models.filter((m) => m.modelType === "Text");
}

export function fmtPriceTriple(input, output, cache) {
  const f = (v) => (v == null || v === "" ? "—" : v);
  return `${f(input)} / ${f(output)} / ${f(cache)}`;
}

