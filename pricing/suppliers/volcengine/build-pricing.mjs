#!/usr/bin/env node
/**
 * 火山方舟官方价目 → pricing-api.json（与 official/seeds 同源）
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRICING_SHEET, SHEET_META } from "./data/pricing-sheet.mjs";
import { normalizeVolcenginePricing } from "./lib/pricing-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");
const MAP_FILE = path.join(__dirname, "trinity-map.json");

async function main() {
  let trinityMap = {};
  try {
    trinityMap = JSON.parse(await readFile(MAP_FILE, "utf8"));
    delete trinityMap._comment;
  } catch {
    /* optional */
  }

  const models = normalizeVolcenginePricing(PRICING_SHEET, trinityMap);
  const mapped = models.filter((m) => m.trinityId);

  const out = {
    ...SHEET_META,
    generatedAt: new Date().toISOString(),
    modelCount: models.length,
    trinityMappedCount: new Set(mapped.map((m) => m.trinityId)).size,
    models,
  };

  await mkdir(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, "pricing-api.json");
  await writeFile(outFile, JSON.stringify(out, null, 2), "utf8");

  console.log(`Volcengine models: ${models.length} · Trinity mapped: ${out.trinityMappedCount}`);
  console.log(`Wrote ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
