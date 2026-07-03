#!/usr/bin/env node
/**
 * 从原厂官网文档拉取模型权威价目（按模态）
 *
 *   node fetch-pricing.mjs --modality=text
 *   node fetch-pricing.mjs --modality=image
 *   node fetch-pricing.mjs --modality=video
 *   node fetch-pricing.mjs --modality=all
 *   node fetch-pricing.mjs --modality=text gpt-5.5
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadCatalog,
  getSeedMap,
  getSeedVerifiedAt,
  buildCatalogMeta,
  MODALITIES,
} from "./lib/catalog-loader.mjs";
import { isModality, VENDOR_PRICING_OUT } from "./lib/modality.mjs";
import { fetchVendorPrices } from "./lib/parse-vendor-pricing.mjs";
import {
  normalizeTextTiers,
  countPricedTiers,
} from "./lib/text-tiers.mjs";
import { syncPricingExcel } from "../../pipeline/lib/sync-pricing-excel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.join(__dirname, "output");

/** @param {string[]} argv */
function parseArgs(argv) {
  let modality = "text";
  const filterIds = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--modality=")) {
      modality = arg.slice("--modality=".length);
    } else if (arg === "--modality") {
      modality = argv[++i] ?? "text";
    } else if (!arg.startsWith("-")) {
      filterIds.push(arg.toLowerCase());
    }
  }
  return { modality, filterIds };
}

/**
 * @param {import("./lib/modality.mjs").Modality} modality
 * @param {ReturnType<typeof loadCatalog>} entries
 */
function buildTiers(modality, result) {
  if (!result.prices) return [];
  if (modality === "text") {
    return normalizeTextTiers(result.prices);
  }
  return result.prices.tiers ?? [];
}

/** @param {import("./data/catalog/text.mjs").CatalogEntry} entry */
function resolveTextCurrency(entry, prices) {
  if (prices?.currency) return prices.currency;
  if (entry.region === "domestic") return "CNY";
  return "USD";
}

/**
 * @param {import("./lib/modality.mjs").Modality} modality
 * @param {ReturnType<typeof loadCatalog>} entries
 */
async function fetchModality(modality, entries) {
  const meta = buildCatalogMeta(modality);
  const seedMap = getSeedMap(modality);
  const seedVerifiedAt = getSeedVerifiedAt();
  const fetchedAt = new Date().toISOString();
  const cache = {};
  const models = [];

  for (const entry of entries) {
    process.stderr.write(`… [${modality}] ${entry.vendorLabel} · ${entry.vendorModelId}\n`);
    const result = await fetchVendorPrices(entry, cache, {
      modality,
      seedMap,
      seedVerifiedAt,
    });

    const tiers = buildTiers(modality, result);

    models.push({
      modality,
      vendor: entry.vendor,
      vendorLabel: entry.vendorLabel,
      vendorModelId: entry.vendorModelId,
      docUrl: entry.docUrl,
      pricingUrl: entry.pricingUrl ?? null,
      sunsetDate: entry.sunsetDate ?? null,
      sunsetNote: entry.sunsetNote ?? null,
      trinityNote: entry.trinityNote ?? null,
      region: entry.region ?? "global",
      status: entry.status ?? "active",
      currency:
        modality === "text"
          ? resolveTextCurrency(entry, result.prices)
          : meta.currency,
      unit: meta.unit,
      chargeUnit: meta.chargeUnit,
      tierCount: tiers.length,
      fetchStatus: result.fetchStatus,
      fetchError: result.fetchError,
      priceSource: result.priceSource,
      prices: result.prices,
      tiers,
    });

    await new Promise((r) => setTimeout(r, 300));
  }

  const ok = models.filter((m) => m.fetchStatus === "ok").length;
  const seeded = models.filter((m) => m.fetchStatus === "seed").length;
  const catalogAll = loadCatalog(modality);
  const pricingTierCount =
    modality === "text"
      ? models.reduce((n, m) => n + countPricedTiers(m.tiers ?? []), 0)
      : models.reduce((n, m) => n + (m.tiers?.length ?? 0), 0);

  const out = {
    ...meta,
    fetchedAt,
    seedVerifiedAt,
    catalogCount: catalogAll.length,
    modelCount: models.length,
    pricingTierCount,
    pricedCount: ok + seeded,
    liveCount: ok,
    seedCount: seeded,
    models,
  };

  const outDir = path.join(OUT_ROOT, modality);
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, VENDOR_PRICING_OUT);
  await writeFile(outFile, JSON.stringify(out, null, 2), "utf8");

  return { modality, modelCount: models.length, pricedCount: ok + seeded, liveCount: ok, seedCount: seeded, outFile };
}

async function main() {
  const { modality, filterIds } = parseArgs(process.argv.slice(2));

  if (modality === "all") {
    const results = [];
    for (const m of MODALITIES) {
      const entries = loadCatalog(m, filterIds);
      if (!entries.length) {
        process.stderr.write(`跳过 ${m}：无匹配模型\n`);
        continue;
      }
      results.push(await fetchModality(m, entries));
    }
    console.log(JSON.stringify({ modalities: results }, null, 2));
    syncPricingExcel({ label: "official:all" });
    return;
  }

  if (!isModality(modality)) {
    console.error(`无效 --modality=${modality}；可选：text | image | video | all`);
    process.exit(1);
  }

  const entries = loadCatalog(modality, filterIds);
  if (!entries.length) {
    console.error("无匹配模型；可用 vendorModelId 过滤");
    process.exit(1);
  }

  const result = await fetchModality(modality, entries);
  console.log(JSON.stringify(result, null, 2));
  syncPricingExcel({ label: `official:${modality}` });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
