#!/usr/bin/env node
/**
 * 网聚云联 · 云门户 — 从 official GPT/Gemini 筛选生成 pricing-api.json
 *
 *   npm run pricing:supplier:wangju-cloudportal
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPLIER_META } from "./data/config.mjs";
import {
  normalizeWangjuFromOfficial,
  indexWangjuByTrinity,
} from "./lib/pricing-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "output/pricing-api.json");
const MAP_FILE = path.join(__dirname, "trinity-map.json");
const OFFICIAL_FILE = path.join(
  __dirname,
  "../official/output/text/vendor-pricing.json",
);
const OFFICIAL_MAP = path.join(__dirname, "../official/trinity-map.json");

async function main() {
  const [officialRaw, mapRaw] = await Promise.all([
    readFile(OFFICIAL_FILE, "utf8"),
    readFile(OFFICIAL_MAP, "utf8"),
  ]);
  const official = JSON.parse(officialRaw);
  const officialTrinityMap = JSON.parse(mapRaw);
  delete officialTrinityMap._comment;

  const models = normalizeWangjuFromOfficial(
    official.models ?? [],
    officialTrinityMap,
  );
  const mapped = models.filter((m) => m.trinityId);
  const byTrinity = indexWangjuByTrinity(models);

  const trinityMapOut = {};
  for (const [tid, m] of byTrinity) {
    trinityMapOut[tid] = {
      vendorModelId: m.modelId,
      vendor: m.vendor,
      note: SUPPLIER_META.note,
    };
  }

  const out = {
    ...SUPPLIER_META,
    generatedAt: new Date().toISOString(),
    officialFetchedAt: official.fetchedAt ?? null,
    modelCount: models.length,
    trinityMappedCount: mapped.length,
    vendors: SUPPLIER_META.vendors,
    models,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  await writeFile(
    MAP_FILE,
    JSON.stringify(
      {
        _comment: "Trinity modelId → 云门户 upstreamModelId（build 时由 official 筛选生成）",
        ...trinityMapOut,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        modelCount: models.length,
        trinityMappedCount: mapped.length,
        openai: models.filter((m) => m.vendor === "openai").length,
        google: models.filter((m) => m.vendor === "google").length,
        outFile: OUT_FILE,
        mapFile: MAP_FILE,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
