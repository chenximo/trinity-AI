/**
 * 生视频 prices-api：线上刊例 vs 官方+AIGC 草案（按 tierKey 对齐）
 */

import { parseOnlineVideoTiers, num } from "./parse-online-prices.mjs";
import { pctDiff, absDiff, fmtUsd, fmtPct } from "./pricing-diff.mjs";
import { findCompareTierByKey } from "./video-pricing-validate-lib.mjs";

const TOLERANCE_PCT = 0.5;

function tierKeyOf(tier, index, total) {
  if (tier?.tierKey) return tier.tierKey;
  const label = String(tier?.tierLabel ?? "").trim();
  const low = label.toLowerCase();
  if (/540p|480p/.test(low)) return "res:540p";
  if (/768p|720p/.test(low)) return "res:720p";
  if (/1080p/.test(low)) return "res:1080p";
  if (/^2k/.test(low)) return "res:2k";
  if (/^4k/.test(low)) return "res:4k";
  if (/含音频|有声/.test(label)) return "audio:enabled";
  if (/无声/.test(label)) return "audio:disabled";
  if (total === 1) return "uniform";
  return `idx:${index}`;
}

function verdictForDelta(pct) {
  if (pct == null) return "缺项";
  if (Math.abs(pct) <= TOLERANCE_PCT) return "一致";
  return pct < 0 ? "降价" : "涨价";
}

/**
 * @param {object} onlineEntry
 * @param {object|null} draftEntry
 */
export function compareVideoPriceEntry(onlineEntry, draftEntry) {
  const onlineTiers = parseOnlineVideoTiers(onlineEntry);
  const draftTiers = draftEntry ? parseOnlineVideoTiers(draftEntry) : [];
  const tierCount = Math.max(onlineTiers.length, draftTiers.length, 1);

  const keys = new Set();
  onlineTiers.forEach((t, i) => keys.add(tierKeyOf(t, i, onlineTiers.length)));
  draftTiers.forEach((t, i) => keys.add(tierKeyOf(t, i, draftTiers.length)));

  const tiers = [];
  for (const key of [...keys].sort()) {
    const on =
      findCompareTierByKey(onlineTiers, key) ??
      onlineTiers.find((t, i) => tierKeyOf(t, i, onlineTiers.length) === key);
    const dr =
      findCompareTierByKey(draftTiers, key) ??
      draftTiers.find((t, i) => tierKeyOf(t, i, draftTiers.length) === key);

    const onlinePrice = on?.price ?? null;
    const draftPrice = dr?.price ?? null;
    const delta = absDiff(draftPrice, onlinePrice);
    const deltaPct = pctDiff(draftPrice, onlinePrice);

    tiers.push({
      tierKey: key,
      tierLabel: on?.tierLabel ?? dr?.tierLabel ?? key,
      onlinePrice,
      draftPrice,
      delta,
      deltaPct,
      verdict: verdictForDelta(deltaPct),
    });
  }

  const changedTiers = tiers.filter((t) => t.verdict === "降价" || t.verdict === "涨价");
  const modelVerdict =
    changedTiers.length === 0
      ? tiers.every((t) => t.verdict === "一致")
        ? "一致"
        : "缺项"
      : changedTiers.every((t) => t.verdict === "降价")
        ? "全降"
        : changedTiers.every((t) => t.verdict === "涨价")
          ? "全涨"
          : "混合";

  return {
    model: onlineEntry.model,
    displayName: onlineEntry.display_name,
    tierCount: tiers.length,
    changedTierCount: changedTiers.length,
    modelVerdict,
    tiers,
  };
}

export function compareVideoPricesDocuments(onlineDoc, draftDoc) {
  const draftByModel = new Map(
    (draftDoc.data ?? []).map((e) => [String(e.model).toLowerCase(), e]),
  );
  const rows = (onlineDoc.data ?? []).map((entry) =>
    compareVideoPriceEntry(
      entry,
      draftByModel.get(String(entry.model).toLowerCase()) ?? null,
    ),
  );

  const tierRows = rows.flatMap((r) =>
    r.tiers.map((t) => ({ model: r.model, displayName: r.displayName, ...t })),
  );

  const summary = {
    modelCount: rows.length,
    tierCount: tierRows.length,
    unchangedModels: rows.filter((r) => r.modelVerdict === "一致").length,
    changedModels: rows.filter((r) => r.changedTierCount > 0).length,
    tierUnchanged: tierRows.filter((t) => t.verdict === "一致").length,
    tierDown: tierRows.filter((t) => t.verdict === "降价").length,
    tierUp: tierRows.filter((t) => t.verdict === "涨价").length,
    tierMissing: tierRows.filter((t) => t.verdict === "缺项").length,
  };

  return {
    summary,
    rows,
    tierRows,
    onlineFetchedAt: onlineDoc.fetchedAt,
    draftGeneratedAt: draftDoc.fetchedAt,
    onlineFx: onlineDoc.fxCnyPerUsd,
    draftFx: draftDoc.fxCnyPerUsd,
    draftPolicy: draftDoc.fxNote,
  };
}

export function renderVideoPricesDiffMd(doc, opts = {}) {
  const s = doc.summary;
  const draftName = opts.draftFile ?? "official-prices-api-video.json";
  const lines = [
    `# 生视频刊例 diff · 线上 vs 官方+AIGC 草案`,
    "",
    `> 线上：\`prices-api.json\`（${doc.onlineFetchedAt ?? "—"} · FX ${doc.onlineFx ?? "—"}）`,
    `> 草案：\`${draftName}\`（${doc.draftGeneratedAt ?? "—"} · FX ${doc.draftFx ?? "—"}）`,
    `> 策略：${doc.draftPolicy ?? "official_vendor_video+l2_fallback"}`,
    "",
    "## 汇总",
    "",
    "| 指标 | 数量 |",
    "|------|------|",
    `| 模型数 | ${s.modelCount} |`,
    `| 档位行 | ${s.tierCount} |`,
    `| 模型 **无变化** | ${s.unchangedModels} |`,
    `| 模型 **有调价** | ${s.changedModels} |`,
    `| 档位一致（≤${TOLERANCE_PCT}%） | ${s.tierUnchanged} |`,
    `| 档位 **降价** | ${s.tierDown} |`,
    `| 档位 **涨价** | ${s.tierUp} |`,
    "",
    "## 有调价的模型",
    "",
    "| 模型 | 显示名 | 变动档数 | 判定 |",
    "|------|--------|----------|------|",
  ];

  for (const r of doc.rows.filter((x) => x.changedTierCount > 0)) {
    lines.push(
      `| ${r.model} | ${r.displayName ?? "—"} | ${r.changedTierCount} | ${r.modelVerdict} |`,
    );
  }
  if (!doc.rows.some((r) => r.changedTierCount > 0)) {
    lines.push("| _无_ | | | |");
  }

  lines.push(
    "",
    "## 全量档位对比",
    "",
    "| 模型 | 档位 | 线上 USD | 草案 USD | Δ$ | Δ% | 判定 |",
    "|------|------|----------|----------|-----|-----|------|",
  );

  for (const t of doc.tierRows) {
    lines.push(
      `| ${t.model} | ${t.tierLabel} | ${fmtUsd(t.onlinePrice)} | ${fmtUsd(t.draftPrice)} | ${fmtUsd(t.delta)} | ${fmtPct(t.deltaPct)} | ${t.verdict} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

export function videoPricesDiffCsvRows(doc) {
  return doc.tierRows.map((t) => ({
    model: t.model,
    display_name: t.displayName ?? "",
    tier: t.tierLabel,
    tier_key: t.tierKey,
    online_usd: t.onlinePrice,
    draft_usd: t.draftPrice,
    delta_usd: t.delta,
    delta_pct: t.deltaPct,
    verdict: t.verdict,
  }));
}
