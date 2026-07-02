/**
 * 官网价 vs OpenRouter（主）· Trinity 线上刊例（辅）
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseOnlinePricesTiers } from "./parse-online-prices.mjs";
import {
  alignNote,
  alignTierPairs,
  pickTierClosestToRef,
  tierLabelOf,
} from "./tier-align.mjs";
import {
  issueFlagForOpenRouterRow,
  renderAnnotationFooterMd,
  ISSUE_FLAG_COLUMN,
} from "../../config/pricing-annotations.mjs";
import { OUT_DIR, SUPPLIERS_DIR } from "./paths.mjs";
import { refreshOnlinePricesForCompare } from "./fetch-online-prices-lib.mjs";

export const FX_ONLINE_DOMESTIC = Number(process.env.FX_ONLINE_DOMESTIC || "6.5");
export const FX_CNY_PER_USD = Number(process.env.FX_CNY_PER_USD || "7.25");

const OR_MAP = path.join(SUPPLIERS_DIR, "openrouter/trinity-map.json");
const OR_FILE = path.join(SUPPLIERS_DIR, "openrouter/output/models-api.json");
const OFFICIAL_MAP = path.join(SUPPLIERS_DIR, "official/trinity-map.json");

function esc(s) {
  return String(s ?? "—").replace(/\|/g, "\\|");
}

function fmt(n, digits = 4) {
  if (n == null) return "—";
  return String(Math.round(n * 10 ** digits) / 10 ** digits);
}

function pctDelta(base, value) {
  if (base == null || value == null || base === 0) return null;
  return ((value - base) / base) * 100;
}

function formatUsdTier(tier) {
  if (!tier) return "—";
  const parts = [];
  if (tier.input != null) parts.push(`入 $${fmt(tier.input)}`);
  if (tier.output != null) parts.push(`出 $${fmt(tier.output)}`);
  if (tier.cache != null) parts.push(`缓 $${fmt(tier.cache)}`);
  return parts.length ? parts.join(" · ") : "—";
}

function formatOfficialTier(tier, currency) {
  if (!tier) return "—";
  const sym = currency === "CNY" ? "¥" : "$";
  const parts = [];
  if (tier.input != null) parts.push(`入 ${sym}${tier.input}`);
  if (tier.output != null) parts.push(`出 ${sym}${tier.output}`);
  if (tier.cache != null) parts.push(`缓 ${sym}${tier.cache}`);
  return parts.length ? parts.join(" · ") : "—";
}

function officialToUsd(tier, currency) {
  if (!tier) return null;
  const fx = currency === "CNY" ? FX_ONLINE_DOMESTIC : 1;
  return {
    tierLabel: tier.tierLabel,
    input: tier.input != null ? tier.input / fx : null,
    output: tier.output != null ? tier.output / fx : null,
    cache: tier.cache != null ? tier.cache / fx : null,
  };
}

function formatDeltaPct(pct) {
  if (pct == null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${fmt(pct, 1)}%`;
}

function onlineTierToUsd(tier) {
  if (!tier) return null;
  return {
    tierLabel: tier.tierLabel,
    input: tier.input,
    output: tier.output,
    cache: tier.cache,
  };
}

function relCloseTier(a, b, relTol = 0.12) {
  if (a == null || b == null) return false;
  const base = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return Math.abs(a - b) / base <= relTol;
}

function officialTiersToUsd(tiers, currency) {
  return (tiers ?? []).map((t) => ({
    raw: t,
    usd: officialToUsd(t, currency),
  }));
}

function expandAlignedRows({
  trinityId,
  openRouterId,
  orModel,
  orTier,
  offTiers,
  offCurrency,
  onlineTiers,
  mapNote,
  offNote,
}) {
  const orSingle = (orModel?.tiers?.length ?? 0) <= 1;
  const pairs = alignTierPairs(offTiers, onlineTiers, {
    fx: FX_ONLINE_DOMESTIC,
    currencyA: offCurrency,
  });
  if (!pairs.length) pairs.push({ a: null, b: null, match: "index" });

  const orRefInput = orTier?.input ?? null;
  const offUsdList = officialTiersToUsd(offTiers, offCurrency);
  const closestOffEntry =
    orRefInput != null && offUsdList.length
      ? offUsdList.reduce((best, cur) => {
          const u = cur.usd?.input;
          if (u == null) return best;
          if (!best) return cur;
          const db = Math.abs(best.usd.input - orRefInput);
          const dc = Math.abs(u - orRefInput);
          return dc < db ? cur : best;
        }, null)
      : offUsdList[0] ?? null;

  const closestOnlineToOr =
    orRefInput != null
      ? pickTierClosestToRef(onlineTiers, orRefInput, { currency: "USD" })
      : onlineTiers?.[0] ?? null;

  const rows = [];

  for (let i = 0; i < pairs.length; i++) {
    const { a: offTier, b: onlineTierRaw, match } = pairs[i];
    const offUsd = officialToUsd(offTier, offCurrency);
    const onlineTier = onlineTierRaw ? onlineTierToUsd(onlineTierRaw) : null;

    const hasOfficialOr = Boolean(orTier && offUsd && offTier);

    const deltaOffIn = hasOfficialOr
      ? pctDelta(orTier.input, offUsd.input)
      : null;
    const deltaOffOut = hasOfficialOr
      ? pctDelta(orTier.output, offUsd.output)
      : null;

    const isPrimaryOfficialOrRow =
      hasOfficialOr &&
      (!orSingle ||
        offTier === closestOffEntry?.raw ||
        relCloseTier(offUsd.input, orRefInput));

    const comparableOnlineOr =
      orTier &&
      onlineTier &&
      (orSingle
        ? onlineTierRaw === closestOnlineToOr ||
          relCloseTier(onlineTier.input, orRefInput)
        : true);

    const deltaOnlineIn = comparableOnlineOr
      ? pctDelta(orTier.input, onlineTier.input)
      : null;
    const deltaOnlineOut = comparableOnlineOr
      ? pctDelta(orTier.output, onlineTier.output)
      : null;

    const align = alignNote(match, orSingle, Boolean(orTier));
    let note = mapNote ?? offNote ?? null;
    if (align) note = note ? `${note}；${align}` : align;

    const issueFlag = issueFlagForOpenRouterRow(trinityId, {
      offUsd,
      orTier,
      comparable: isPrimaryOfficialOrRow,
    });

    rows.push({
      trinityId,
      openRouterId,
      openRouterName: orModel?.name ?? null,
      tierIndex: i,
      tierLabel: tierLabelOf(onlineTierRaw, offTier, orTier),
      tierMatch: match,
      official: formatOfficialTier(offTier, offCurrency),
      officialUsd: formatUsdTier(offUsd),
      openRouter: orTier ? formatUsdTier(orTier) : "未收录",
      deltaOfficialVsOrInput: formatDeltaPct(deltaOffIn),
      deltaOfficialVsOrOutput: formatDeltaPct(deltaOffOut),
      trinityOnline: formatUsdTier(onlineTier),
      deltaOnlineVsOrInput: formatDeltaPct(deltaOnlineIn),
      deltaOnlineVsOrOutput: formatDeltaPct(deltaOnlineOut),
      issueFlag,
      note,
      orFound: Boolean(orModel),
      onlineFound: Boolean(onlineTier),
    });
  }

  return rows;
}

/**
 * @param {string[]} filterIds
 * @param {{ preloaded?: Awaited<ReturnType<typeof refreshOnlinePricesForCompare>> }} [opts]
 */
export async function buildOpenRouterCompareRows(filterIds = [], opts = {}) {
  const online =
    opts.preloaded ?? (await refreshOnlinePricesForCompare("text"));
  const prices = online.raw;

  const [mapRaw, orRaw, officialMapRaw, officialRaw] = await Promise.all([
    readFile(OR_MAP, "utf8"),
    readFile(OR_FILE, "utf8").catch(() => "{}"),
    readFile(OFFICIAL_MAP, "utf8").catch(() => "{}"),
    readFile(
      path.join(SUPPLIERS_DIR, "official/output/text/vendor-pricing.json"),
      "utf8",
    ).catch(() => "{}"),
  ]);

  const orMap = JSON.parse(mapRaw);
  const orData = JSON.parse(orRaw);
  const officialMap = JSON.parse(officialMapRaw);
  const official = JSON.parse(officialRaw);

  const orById = new Map(
    (orData.models ?? []).map((m) => [m.id.toLowerCase(), m]),
  );
  const onlineByModel = new Map(
    (prices.data ?? [])
      .filter((e) => e.modality_type === "text")
      .map((e) => [e.model.toLowerCase(), e]),
  );
  const officialByVendorId = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  let targets = Object.entries(orMap)
    .filter(([k]) => !k.startsWith("_"))
    .map(([trinityId, meta]) => ({
      trinityId,
      openRouterId: meta.openRouterId ?? null,
      mapNote: meta.note ?? null,
    }));

  if (filterIds.length) {
    const set = new Set(filterIds.map((s) => s.toLowerCase()));
    targets = targets.filter((t) => set.has(t.trinityId.toLowerCase()));
  }

  const rows = [];

  for (const t of targets) {
    const online = onlineByModel.get(t.trinityId.toLowerCase()) ?? null;
    const orModel = t.openRouterId
      ? (orById.get(t.openRouterId.toLowerCase()) ?? null)
      : null;
    const orTier = orModel?.tiers?.[0] ?? null;

    const offMeta = officialMap[t.trinityId];
    const off =
      offMeta?.vendorModelId != null
        ? (officialByVendorId.get(offMeta.vendorModelId.toLowerCase()) ?? null)
        : null;

    rows.push(
      ...expandAlignedRows({
        trinityId: t.trinityId,
        openRouterId: t.openRouterId,
        orModel,
        orTier,
        offTiers: off?.tiers ?? [],
        offCurrency: off?.currency ?? "USD",
        onlineTiers: online ? parseOnlinePricesTiers(online) : [],
        mapNote: t.mapNote,
        offNote: off?.trinityNote,
      }),
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    fxOnlineDomestic: FX_ONLINE_DOMESTIC,
    fxCnyPerUsd: FX_CNY_PER_USD,
    openRouterFetchedAt: orData.fetchedAt ?? null,
    pricesFetchedAt: prices.fetchedAt ?? null,
    officialFetchedAt: official.fetchedAt ?? null,
    modelCount: targets.length,
    rowCount: rows.length,
    rows,
  };
}

/** Excel 行（与 Markdown 表一致） */
export function buildOpenRouterExcelRows(report) {
  const header = [
    "Trinity ID",
    "OpenRouter",
    "档位",
    "官方价",
    "官方÷6.5",
    "OpenRouter",
    "Δ官入vsOR",
    "Δ官出vsOR",
    ISSUE_FLAG_COLUMN,
    "Trinity线上",
    "Δ线入vsOR",
    "Δ线出vsOR",
    "备注",
  ];
  const rows = [];
  let lastId = "";
  for (const r of report.rows) {
    const show = r.trinityId !== lastId;
    lastId = r.trinityId ?? "";
    rows.push([
      show ? (r.trinityId ?? "") : "",
      show ? (r.openRouterId ?? "") : "",
      r.tierLabel ?? "",
      r.official ?? "",
      r.officialUsd ?? "",
      r.openRouter ?? "",
      r.deltaOfficialVsOrInput ?? "",
      r.deltaOfficialVsOrOutput ?? "",
      show ? (r.issueFlag ?? "") : "",
      r.trinityOnline ?? "",
      r.deltaOnlineVsOrInput ?? "",
      r.deltaOnlineVsOrOutput ?? "",
      r.note ?? "",
    ]);
  }
  return [header, ...rows];
}

export function renderOpenRouterMarkdown(report) {
  const lines = [
    "# 官网价 vs OpenRouter vs Trinity 线上（生文）",
    "",
    `> 生成 ${report.generatedAt.slice(0, 19)}Z`,
    `> **主对比**：官网价（国内 CNY÷${report.fxOnlineDomestic}）vs OpenRouter`,
    `> OpenRouter：\`suppliers/openrouter/output/models-api.json\`（${report.openRouterFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> 官方价：\`suppliers/official/output/text/vendor-pricing.json\`（${report.officialFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> Trinity 线上（参考）：\`output/online/prices-api.json\`（${report.pricesFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    "",
    "| Trinity ID | OpenRouter | 档位 | 官方价 | 官方÷6.5 | OpenRouter | Δ官入vsOR | Δ官出vsOR | " +
      ISSUE_FLAG_COLUMN +
      " | Trinity线上 | Δ线入vsOR | Δ线出vsOR | 备注 |",
    "|------------|------------|------|--------|----------|------------|-----------|-----------|" +
      "----------|-------------|-------------|-------------|------|",
  ];

  for (const r of report.rows) {
    lines.push(
      `| ${esc(r.trinityId)} | ${esc(r.openRouterId ?? "—")} | ${esc(r.tierLabel)} | ${esc(r.official)} | ${esc(r.officialUsd)} | ${esc(r.openRouter)} | ${esc(r.deltaOfficialVsOrInput)} | ${esc(r.deltaOfficialVsOrOutput)} | ${esc(r.issueFlag)} | ${esc(r.trinityOnline)} | ${esc(r.deltaOnlineVsOrInput)} | ${esc(r.deltaOnlineVsOrOutput)} | ${esc(r.note)} |`,
    );
  }

  lines.push(
    "",
    "## 说明",
    "",
    "- **官网价优先**：`官网vsOR` 列依据 **官方÷6.5 vs OpenRouter** 自动标记",
    "- **Δ官 vs OR**：官网相对 OR（正数 = 官网更贵）",
    "- **Δ线 vs OR**：Trinity 线上相对 OR，仅供参考（转售线可能与官网不一致）",
    "- OR 单档时，仅 input 价最接近 OR 的官网档参与主对比",
    "- 生成命令：`npm run pricing:compare:openrouter`",
    renderAnnotationFooterMd(["openrouter-compare"]),
  );

  return lines.join("\n");
}
