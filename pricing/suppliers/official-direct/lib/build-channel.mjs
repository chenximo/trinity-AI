/**
 * 构建单个原厂直连渠道的 pricing-api.json + trinity-map.json
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getOfficialDirectChannel } from "../channels/index.mjs";
import { normalizeFromOfficial, indexByTrinity } from "./from-official.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPPLIERS_DIR = path.resolve(__dirname, "../..");

const OFFICIAL_FILE = path.join(
  SUPPLIERS_DIR,
  "official/output/text/vendor-pricing.json",
);
const OFFICIAL_MAP = path.join(SUPPLIERS_DIR, "official/trinity-map.json");

/**
 * @param {string} supplierId
 * @returns {Promise<{ meta: object, models: object[], modelCount: number, trinityMappedCount: number, outFile: string, mapFile: string }>}
 */
export async function buildOfficialDirectChannel(supplierId) {
  const meta = getOfficialDirectChannel(supplierId);
  const supplierDir = path.join(SUPPLIERS_DIR, supplierId);
  const outFile = path.join(supplierDir, "output/pricing-api.json");
  const mapFile = path.join(supplierDir, "trinity-map.json");

  const [officialRaw, mapRaw] = await Promise.all([
    readFile(OFFICIAL_FILE, "utf8"),
    readFile(OFFICIAL_MAP, "utf8"),
  ]);
  const official = JSON.parse(officialRaw);
  const officialTrinityMap = JSON.parse(mapRaw);
  delete officialTrinityMap._comment;

  const models = normalizeFromOfficial(
    official.models ?? [],
    officialTrinityMap,
    meta,
  );
  const mapped = models.filter((m) => m.trinityId);
  const byTrinity = indexByTrinity(models);

  const trinityMapOut = {};
  for (const [tid, m] of byTrinity) {
    trinityMapOut[tid] = {
      vendorModelId: m.modelId,
      vendor: m.vendor,
      note: meta.note,
    };
  }

  const out = {
    ...meta,
    generatedAt: new Date().toISOString(),
    officialFetchedAt: official.fetchedAt ?? null,
    modelCount: models.length,
    trinityMappedCount: mapped.length,
    ...(Array.isArray(meta.vendors) ? { vendors: meta.vendors } : {}),
    models,
  };

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(out, null, 2), "utf8");
  await writeFile(
    mapFile,
    JSON.stringify(
      {
        _comment: meta.mapComment ?? `Trinity modelId → ${meta.brand}`,
        ...trinityMapOut,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    meta,
    models,
    modelCount: models.length,
    trinityMappedCount: mapped.length,
    outFile,
    mapFile,
  };
}
