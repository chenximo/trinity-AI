#!/usr/bin/env node
/**
 * 官方生视频种子 ↔ L2 AIGC 交叉校验
 * 官方多为「积分/次」· AIGC 为「元/秒」→ 同档结构对齐，跨口径不比 %
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parseAigcVideoExcel, excelVideoModelsByKey } from "../suppliers/aigc/lib/parse-aigc-video-excel.mjs";
import {
  normalizeAigcVideoPricing,
  indexAigcVideoByTrinity,
} from "../suppliers/aigc/lib/pricing-api-video.mjs";
import {
  officialVideoTiersForCompare,
  aigcVideoTiersForCompare,
  compareVideoTierLists,
  isVideoOfficialUnitComparable,
} from "./lib/video-pricing-validate-lib.mjs";
import {
  OFFICIAL_MAP_FILE,
  officialPricingFile,
  OUT_VALIDATE_DIR,
  SUPPLIERS_DIR,
} from "./lib/paths.mjs";

const AIGC_VIDEO_MAP = path.join(SUPPLIERS_DIR, "aigc/trinity-map-video.json");

async function main() {
  const [officialMapRaw, aigcMapRaw, officialRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8"),
    readFile(AIGC_VIDEO_MAP, "utf8"),
    readFile(officialPricingFile("video"), "utf8"),
  ]);

  const officialTrinityMap = JSON.parse(officialMapRaw);
  const aigcTrinityMap = JSON.parse(aigcMapRaw);
  delete aigcTrinityMap._comment;
  const official = JSON.parse(officialRaw);

  const sheet = parseAigcVideoExcel();
  const aigcModels = normalizeAigcVideoPricing(sheet, aigcTrinityMap);
  const { domestic, international } = indexAigcVideoByTrinity(aigcModels, aigcTrinityMap);
  const excelMap = excelVideoModelsByKey(sheet);

  const officialByVendor = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  const results = [];
  const unitMismatch = [];
  const missingAigc = [];
  const tierIssues = [];

  for (const [tid, meta] of Object.entries(officialTrinityMap)) {
    if (tid.startsWith("_") || meta?.modality !== "video") continue;
    const off = officialByVendor.get(meta.vendorModelId?.toLowerCase());
    if (!off) continue;

    const mapRef = aigcTrinityMap[tid];
    const dom = domestic.get(tid.toLowerCase());
    const intl = international.get(tid.toLowerCase());

    if (!mapRef) {
      missingAigc.push({ trinityId: tid, vendorModelId: meta.vendorModelId, reason: "no_aigc_map" });
      continue;
    }

    const excelKey = `${mapRef.vendorCode}::${mapRef.modelName}`;
    if (!excelMap.has(excelKey)) {
      missingAigc.push({ trinityId: tid, excelKey, reason: "no_excel_row" });
    }

    const offTiers = officialVideoTiersForCompare(off);
    const domTiers = aigcVideoTiersForCompare(dom, mapRef);
    const intlTiers = aigcVideoTiersForCompare(intl, mapRef);

    const officialComparable = offTiers.some((t) => isVideoOfficialUnitComparable(t));
    if (!officialComparable && offTiers.length) {
      unitMismatch.push({
        trinityId: tid,
        vendorModelId: meta.vendorModelId,
        officialUnit: offTiers[0]?.unit ?? off.unit,
        note: "积分/次 vs 元/秒 · 仅结构校验",
      });
    }

    if (domTiers.length && offTiers.some((t) => isVideoOfficialUnitComparable(t))) {
      const issues = compareVideoTierLists(domTiers, offTiers);
      if (issues.length) {
        tierIssues.push({ trinityId: tid, site: "domestic", issues });
      }
    }

    results.push({
      trinityId: tid,
      vendorModelId: meta.vendorModelId,
      aigcMap: mapRef,
      officialTierCount: offTiers.length,
      aigcDomTierCount: domTiers.length,
      aigcIntlTierCount: intlTiers.length,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mappedCount: results.length,
    unitMismatchCount: unitMismatch.length,
    missingAigcCount: missingAigc.length,
    tierIssueCount: tierIssues.length,
    unitMismatch,
    missingAigc,
    tierIssues,
    results,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  const outFile = path.join(OUT_VALIDATE_DIR, "official-aigc-video.json");
  await writeFile(outFile, JSON.stringify(report, null, 2), "utf8");

  console.log(`Video Trinity mapped: ${results.length}`);
  console.log(`Unit mismatch (expected): ${unitMismatch.length}`);
  console.log(`Missing AIGC map/row: ${missingAigc.length}`);
  console.log(`Tier structure issues: ${tierIssues.length}`);
  console.log(`Wrote ${outFile}`);

  if (tierIssues.length > 0) {
    console.error("validate-official-aigc-video: tier structure issues found");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
