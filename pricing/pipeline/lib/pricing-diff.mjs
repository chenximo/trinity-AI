import { parseOnlinePricesTiers, num } from "./parse-online-prices.mjs";
import { pickTierOfficial } from "./build-upstream-prices-api.mjs";

export function pctDiff(a, b) {
  const x = num(a);
  const y = num(b);
  if (x == null || y == null || y === 0) return null;
  return Math.round(((x - y) / y) * 1000) / 10;
}

export function absDiff(a, b) {
  const x = num(a);
  const y = num(b);
  if (x == null || y == null) return null;
  return Math.round((x - y) * 1e6) / 1e6;
}

export function fieldStatus(online, scraped, tolerancePct = 0.5) {
  const o = num(online);
  const s = num(scraped);
  if (o == null && s == null) return "无";
  if (o == null || s == null) return "缺项";
  const abs = Math.abs(o - s);
  if (abs < 0.000001) return "一致";
  const pct = pctDiff(o, s);
  if (pct != null && Math.abs(pct) <= tolerancePct) return "接近";
  return "偏差";
}

export function rowVerdict(fields) {
  const statuses = fields.map((f) => f.status);
  if (statuses.every((s) => s === "一致" || s === "无")) return "一致";
  if (statuses.some((s) => s === "缺项")) return "缺项";
  if (statuses.every((s) => s === "一致" || s === "接近" || s === "无"))
    return "接近";
  return "偏差";
}

export function modelHasScrapedUpstream(upstreamModel) {
  return (upstreamModel?.tiers ?? []).some((t) => pickTierOfficial(t));
}

export function comparePriceEntries(onlineEntry, scrapedEntry, upstreamModel) {
  const hasScrape = modelHasScrapedUpstream(upstreamModel);
  const onlineTiers = parseOnlinePricesTiers(onlineEntry);
  const scrapedTiers = parseOnlinePricesTiers(scrapedEntry);
  const tierCount = Math.max(onlineTiers.length, scrapedTiers.length);

  const tiers = [];
  for (let i = 0; i < tierCount; i++) {
    const on = onlineTiers[i] ?? onlineTiers[0];
    const sc = scrapedTiers[i] ?? scrapedTiers[0];
    const fields = ["input", "output", "cache"].map((key) => ({
      key,
      online: on?.[key] ?? null,
      scraped: hasScrape ? (sc?.[key] ?? null) : null,
      delta: hasScrape ? absDiff(on?.[key], sc?.[key]) : null,
      deltaPct: hasScrape ? pctDiff(on?.[key], sc?.[key]) : null,
      status: hasScrape
        ? fieldStatus(on?.[key], sc?.[key])
        : "无爬虫",
    }));
    tiers.push({
      tierIndex: i,
      tierLabel: on?.tierLabel ?? sc?.tierLabel ?? `档位${i + 1}`,
      pricingMode: on?.pricingMode ?? sc?.pricingMode,
      fields,
      verdict: hasScrape ? rowVerdict(fields) : "无爬虫",
    });
  }

  const primary = tiers[0];
  const scrapeSource =
    hasScrape && upstreamModel
      ? pickTierOfficial(
          (upstreamModel.tiers ?? []).find((t) => pickTierOfficial(t)),
        )?.source ?? null
      : null;

  return {
    model: onlineEntry.model,
    displayName: onlineEntry.display_name,
    hasScrapedUpstream: hasScrape,
    scrapeSource,
    pricingMode: onlineEntry.pricing_mode,
    tierCount: tiers.length,
    primaryVerdict: primary?.verdict ?? "—",
    tiers,
  };
}

export function summarizeDiffs(rows) {
  const withScrape = rows.filter((r) => r.hasScrapedUpstream);
  const counts = {
    total: rows.length,
    withScrape: withScrape.length,
    withoutScrape: rows.length - withScrape.length,
    match: 0,
    close: 0,
    diff: 0,
    partial: 0,
    noScrape: rows.length - withScrape.length,
  };

  for (const r of withScrape) {
    const v = r.primaryVerdict;
    if (v === "一致") counts.match++;
    else if (v === "接近") counts.close++;
    else if (v === "偏差") counts.diff++;
    else counts.partial++;
  }

  return counts;
}

export function fmtUsd(n) {
  if (n == null) return "—";
  return String(Math.round(n * 1e6) / 1e6);
}

export function fmtPct(n) {
  if (n == null) return "—";
  return `${n > 0 ? "+" : ""}${n}%`;
}
