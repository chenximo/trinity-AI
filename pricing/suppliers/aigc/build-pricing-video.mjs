#!/usr/bin/env node
/**
 * 从 AIGC 生视频价目表生成 pricing-api-video.json
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseAigcVideoExcel } from "./lib/parse-aigc-video-excel.mjs";
import { normalizeAigcVideoPricing } from "./lib/pricing-api-video.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");
const MAP_FILE = path.join(__dirname, "trinity-map-video.json");
const root = path.join(__dirname, "../../..");

const SHEET_META = {
  source: "AIGC价格指南（商务版报价文档）.xlsx",
  sheet: "AIGC生视频",
  dataDate: "2026-06",
  modality: "video",
};

function syncVideoUpstream() {
  if (process.env.PRICING_SKIP_EXCEL_SYNC === "1") return;
  console.log("\n── pricing:upstream:video（同步 Excel）──");
  const r = spawnSync(
    process.execPath,
    ["pricing/pipeline/gen-upstream-video-pricing.mjs"],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function main() {
  let trinityMap = {};
  try {
    trinityMap = JSON.parse(await readFile(MAP_FILE, "utf8"));
    delete trinityMap._comment;
  } catch {
    /* optional */
  }

  const sheet = parseAigcVideoExcel();
  const models = normalizeAigcVideoPricing(sheet, trinityMap);
  const domestic = models.filter((m) => m.site === "domestic");
  const international = models.filter((m) => m.site === "international");
  const mapped = models.filter((m) => m.trinityId);

  const out = {
    ...SHEET_META,
    generatedAt: new Date().toISOString(),
    modelCount: models.length,
    domesticCount: domestic.length,
    internationalCount: international.length,
    trinityMappedCount: new Set(mapped.map((m) => m.trinityId)).size,
    models,
  };

  await mkdir(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, "pricing-api-video.json");
  await writeFile(outFile, JSON.stringify(out, null, 2), "utf8");

  console.log(
    `AIGC video models: ${models.length} (国内 ${domestic.length} · 国际 ${international.length})`,
  );
  console.log(`Trinity mapped: ${out.trinityMappedCount}`);
  console.log(`Wrote ${outFile}`);
  syncVideoUpstream();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
