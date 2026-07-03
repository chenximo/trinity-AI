#!/usr/bin/env node
/**
 * 百炼原始价目表 → pricing-api.json
 * 用法：node scripts/bailian/normalize-pricing.mjs [bailian-pricing.json]
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRICING_API_OUT, PRICING_RAW_OUT, buildPricingApiResult } from "./lib/pricing-api.mjs";
import { syncPricingExcel } from "../../pipeline/lib/sync-pricing-excel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inFile = process.argv[2] ?? path.join(__dirname, "output", PRICING_RAW_OUT);
const outFile = path.join(__dirname, "output", PRICING_API_OUT);

const raw = JSON.parse(await readFile(inFile, "utf8"));
const result = buildPricingApiResult(raw);

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(result, null, 2), "utf8");

const withCache = result.models.filter((m) => m.supportsCache).length;
console.log(
  JSON.stringify(
    {
      modelCount: result.modelCount,
      pricingTierCount: result.pricingTierCount,
      tierRowCount: result.tierRowCount,
      modelsWithImplicitCache: withCache,
      outFile,
      sample: result.models.find((m) => m.modelId === "qwen3-max"),
    },
    null,
    2,
  ),
);
syncPricingExcel({ label: "bailian" });
