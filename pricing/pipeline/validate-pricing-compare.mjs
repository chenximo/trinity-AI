#!/usr/bin/env node
/**
 * 价目对比二次校验：档位对齐、假阳性、未登记真出入
 *
 *   node pricing/pipeline/validate-pricing-compare.mjs
 */

import { readFile } from "node:fs/promises";
import {
  UPSTREAM_PRICING_FILE,
  officialPricingFile,
  OFFICIAL_MAP_FILE,
} from "./lib/paths.mjs";
import {
  buildTextCompareHubFromModels,
  loadTextCompareHubContext,
} from "./lib/compare-hub-lib.mjs";
import { findTierByKey } from "./lib/tier-key.mjs";
import { annotationsForModel } from "../config/pricing-annotations.mjs";
import { parseOnlinePricesTiers } from "./lib/parse-online-prices.mjs";

const FALSE_POSITIVE_PATTERNS = [
  /刊例vs官方_入.*\+100%/,
  /刊例vs官方_出.*-70%/,
];

function isFalsePositiveFlag(text) {
  if (!text) return false;
  return FALSE_POSITIVE_PATTERNS.some((re) => re.test(text));
}

async function main() {
  const upstream = JSON.parse(await readFile(UPSTREAM_PRICING_FILE, "utf8"));
  const official = JSON.parse(
    await readFile(officialPricingFile("text"), "utf8"),
  );
  const ctx = await loadTextCompareHubContext();
  const report = buildTextCompareHubFromModels(upstream.models ?? [], ctx);

  const officialById = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );
  const mapObj = JSON.parse(await readFile(OFFICIAL_MAP_FILE, "utf8"));

  const issues = [];
  const falsePositives = [];
  const missingOfficialTier = [];

  for (const m of upstream.models ?? []) {
    const tid = m.trinityId?.toLowerCase();
    const vendorId = mapObj[tid]?.vendorModelId?.toLowerCase() ?? tid;
    const off = officialById.get(vendorId);
    for (const t of m.tiers ?? []) {
      if (!t.tierKey || t.tierKey === "uniform") continue;
      if (!off?.tiers?.length) continue;
      if (!findTierByKey(off.tiers, t.tierKey)) {
        missingOfficialTier.push({
          trinityId: m.trinityId,
          tierLabel: t.tierLabel,
          tierKey: t.tierKey,
        });
      }
    }
  }

  for (const row of report.rows) {
    const tid = row.trinityId?.toLowerCase();
    const listing = row.listingConclusion ?? "";

    if (isFalsePositiveFlag(row.deltaOnlineVsOfficialIn)) {
      falsePositives.push({
        trinityId: row.trinityId,
        tierLabel: row.tierLabel,
        deltaIn: row.deltaOnlineVsOfficialIn,
      });
    }

    if (
      row.listingMaterialInOut &&
      !listing.startsWith("ℹ") &&
      !listing.startsWith("—") &&
      row.trinityId !== "—" &&
      !annotationsForModel(tid, "compare-hub").length
    ) {
      issues.push({
        trinityId: row.trinityId,
        tierLabel: row.tierLabel,
        listingConclusion: listing,
        kind: "online",
      });
    }
  }

  const gemini35 = report.rows.filter(
    (r) => r.trinityId === "gemini-3.5-flash" && r.tierLabel?.includes("文本"),
  );
  for (const r of gemini35) {
    if (r.deltaOnlineVsOfficialIn?.includes("+200")) {
      falsePositives.push({
        trinityId: r.trinityId,
        tierLabel: r.tierLabel,
        updateFlag: `刊例 ${r.deltaOnlineVsOfficialIn}（官方价应已修正为 $1.5）`,
      });
    }
  }

  const summary = {
    rowCount: report.rowCount,
    missingOfficialTier: missingOfficialTier.length,
    suspectedFalsePositives: falsePositives.length,
    unannotatedWarnings: issues.length,
    ok:
      falsePositives.length === 0 &&
      missingOfficialTier.filter((m) => !m.tierKey.startsWith("t:idx-")).length ===
        0,
  };

  console.log(JSON.stringify({ summary, falsePositives, missingOfficialTier, unannotatedWarnings: issues }, null, 2));

  if (!summary.ok) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
