#!/usr/bin/env node
/**
 * 生视频 · 供应商 vs 官方 · 汇总校验（AIGC 接入渠道）
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parseAigcVideoExcel } from "../suppliers/aigc/lib/parse-aigc-video-excel.mjs";
import { normalizeAigcVideoPricing } from "../suppliers/aigc/lib/pricing-api-video.mjs";
import { VIDEO_CONNECTED_SUPPLIERS } from "../config/channels-video.mjs";
import { collectVideoSupplierTierStats } from "./lib/build-video-rows.mjs";
import {
  OFFICIAL_MAP_FILE,
  officialPricingFile,
  OUT_VALIDATE_DIR,
  SUPPLIERS_DIR,
} from "./lib/paths.mjs";

const AIGC_VIDEO_MAP = path.join(SUPPLIERS_DIR, "aigc/trinity-map-video.json");

async function main() {
  const [mapRaw, officialRaw, aigcMapRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8"),
    readFile(officialPricingFile("video"), "utf8"),
    readFile(AIGC_VIDEO_MAP, "utf8"),
  ]);

  const vendorMap = {};
  for (const [k, v] of Object.entries(JSON.parse(mapRaw))) {
    if (k.startsWith("_")) continue;
    if (v?.modality === "video") vendorMap[k.toLowerCase()] = v;
  }

  const official = JSON.parse(officialRaw);
  const officialByVendorId = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );
  const officialCtx = { vendorMap, officialByVendorId };

  const aigcTrinityMap = JSON.parse(aigcMapRaw);
  delete aigcTrinityMap._comment;
  const sheet = parseAigcVideoExcel();
  const aigcModels = normalizeAigcVideoPricing(sheet, aigcTrinityMap);

  const bySupplier = [];
  const mismatches = [];

  for (const sup of VIDEO_CONNECTED_SUPPLIERS) {
    const tiers = collectVideoSupplierTierStats(
      sup,
      { aigcModels, aigcTrinityMap },
      officialCtx,
    );
    const mismatch = tiers.filter(
      (t) => t.status === "mismatch" && t.maxAbsPct != null,
    );
    mismatches.push(...mismatch.map((t) => ({ supplier: sup.key, ...t })));
    bySupplier.push({
      key: sup.key,
      tierCount: tiers.length,
      mismatchCount: mismatch.length,
      unitMismatchCount: tiers.filter((t) => t.status === "unit_mismatch").length,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    bySupplier,
    mismatchCount: mismatches.length,
    mismatches,
    note: "官方积分/次 vs AIGC元/秒 → unit_mismatch 为预期",
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  const outFile = path.join(OUT_VALIDATE_DIR, "official-suppliers-video.json");
  await writeFile(outFile, JSON.stringify(report, null, 2), "utf8");

  console.log(`Suppliers checked: ${bySupplier.length}`);
  console.log(`Numeric mismatches: ${mismatches.length} (unit_mismatch excluded)`);
  console.log(`Wrote ${outFile}`);

  if (mismatches.length > 0) {
    console.error("validate-official-vs-suppliers-video: price mismatches found");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
