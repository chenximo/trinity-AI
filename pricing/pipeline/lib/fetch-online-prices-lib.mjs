/**
 * 拉取 GET /v1/prices 并写入 output/online/prices-api-{modality}.json
 */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import {
  flattenPricesList,
  indexOnlinePrices,
} from "./parse-online-prices.mjs";
import { writeCsv } from "./export-excel.mjs";
import { FX_LISTING, FX_LISTING_NOTE } from "../../config/fx.mjs";
import {
  OUT_ONLINE_DIR,
  PRICES_API_FILE,
  pricesApiPaths,
} from "./paths.mjs";

export const DEFAULT_TRINITY_PRICES_BASE = "https://api.trinitydesk.ai/v1";

/**
 * @param {string} base
 * @param {string} modality
 */
export async function fetchPricesFromApi(base, modality) {
  const headers = { Accept: "application/json" };
  const key = process.env.TRINITY_API_KEY;
  if (key) headers.Authorization = `Bearer ${key}`;

  const q =
    modality && modality !== "all"
      ? `?modality=${encodeURIComponent(modality)}`
      : modality === "all"
        ? "?modality=all"
        : "";
  const url = `${base}/prices${q}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} → HTTP ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * @param {object} raw prices-api 文档
 * @param {{ writeCsvFile?: boolean, modality?: string }} [opts]
 */
export async function writeOnlinePricesCache(raw, opts = {}) {
  const writeCsvFile = opts.writeCsvFile ?? false;
  const data = raw.data ?? [];
  const modality = opts.modality ?? raw.modality ?? "text";
  const fetchedAt = raw.fetchedAt ?? new Date().toISOString();
  const fxCnyPerUsd = raw.fxCnyPerUsd ?? FX_LISTING;

  const paths =
    modality === "all" ? pricesApiPaths("text") : pricesApiPaths(modality);

  const flat = flattenPricesList(data);
  const priceIndex = indexOnlinePrices(data);
  const index = Object.fromEntries([...priceIndex.entries()]);

  await mkdir(OUT_ONLINE_DIR, { recursive: true });
  await writeFile(paths.json, JSON.stringify({ ...raw, modality, fxCnyPerUsd }, null, 2), "utf8");
  await writeFile(
    paths.flat,
    JSON.stringify({ fetchedAt, modality, fxCnyPerUsd, models: flat }, null, 2),
    "utf8",
  );
  await writeFile(
    paths.index,
    JSON.stringify(
      {
        fetchedAt,
        modality,
        fxCnyPerUsd,
        modelCount: priceIndex.size,
        models: index,
      },
      null,
      2,
    ),
    "utf8",
  );

  if (writeCsvFile) {
    const csvHeader = [
      "model",
      "displayName",
      "pricingMode",
      "tierLabel",
      "inputUsd",
      "outputUsd",
      "cacheUsd",
      "cacheCreationUsd",
      "updatedAt",
    ];
    const csvRows = [
      csvHeader,
      ...flat.map((r) =>
        csvHeader.map((h) => {
          const key =
            h === "inputUsd"
              ? "inputUsd"
              : h === "outputUsd"
                ? "outputUsd"
                : h === "cacheUsd"
                  ? "cacheUsd"
                  : h === "cacheCreationUsd"
                    ? "cacheCreationUsd"
                    : h;
          return r[key] ?? "";
        }),
      ),
    ];
    await writeCsv(paths.csv, csvRows, writeFile);
  }

  return { raw, map: priceIndex, fetchedAt, modelCount: data.length, paths };
}

/**
 * @param {object} opts
 * @param {string} [opts.modality]
 * @param {boolean} [opts.writeCsvFile]
 * @param {boolean} [opts.quiet]
 */
export async function fetchAndPersistOnlinePrices(opts = {}) {
  const modality = opts.modality ?? "text";
  const writeCsvFile = opts.writeCsvFile ?? false;
  const quiet = opts.quiet ?? false;
  const base = (
    process.env.TRINITY_BASE_URL ?? DEFAULT_TRINITY_PRICES_BASE
  ).replace(/\/$/, "");
  const fetchedAt = new Date().toISOString();

  const body = await fetchPricesFromApi(base, modality);
  const data = body.data ?? [];

  const raw = {
    source: "trinity_prices_api",
    apiUrl: `${base}/prices${modality && modality !== "all" ? `?modality=${modality}` : ""}`,
    modality,
    fxCnyPerUsd: FX_LISTING,
    fxNote: FX_LISTING_NOTE,
    fetchedAt,
    modelCount: data.length,
    object: body.object,
    data,
  };

  const result = await writeOnlinePricesCache(raw, { writeCsvFile, modality });

  if (!quiet) {
    console.log(
      `Fetched online prices: ${data.length} models (${modality}) at ${fetchedAt}`,
    );
    console.log(`Wrote ${result.paths.json}`);
  }

  return {
    ...result,
    apiUrl: raw.apiUrl,
  };
}

/**
 * 读取模态刊例缓存；优先 prices-api-{modality}.json，回退 legacy prices-api.json
 * @param {string} modality
 */
export async function readOnlinePricesCache(modality = "text") {
  const paths = pricesApiPaths(modality);
  const candidates = [paths.json, PRICES_API_FILE];

  for (const file of candidates) {
    try {
      const raw = JSON.parse(await readFile(file, "utf8"));
      const cachedModality = raw.modality ?? "text";
      if (
        modality !== "all" &&
        cachedModality !== "all" &&
        cachedModality !== modality
      ) {
        continue;
      }
      const map = indexOnlinePrices(raw.data ?? []);
      if (!map.size) continue;
      return { raw, map, file };
    } catch {
      /* try next */
    }
  }

  throw new Error(
    `No online prices cache for modality=${modality} (tried ${candidates.join(", ")})`,
  );
}

/** 对比流水线入口：默认每次打 API；失败时回退缓存；PRICING_SKIP_ONLINE_FETCH=1 仅读缓存 */
export async function refreshOnlinePricesForCompare(modality = "text", opts = {}) {
  async function loadCachedPrices(reason) {
    const { raw, map, file } = await readOnlinePricesCache(modality);
    if (!opts.quiet) {
      console.warn(
        `${reason}; using ${file} (${raw.fetchedAt ?? "—"}, ${map.size} models)`,
      );
    }
    return {
      raw,
      map,
      fetchedAt: raw.fetchedAt ?? null,
      modelCount: raw.modelCount ?? raw.data?.length ?? map.size,
      apiUrl: raw.apiUrl,
      skippedFetch: true,
    };
  }

  if (process.env.PRICING_SKIP_ONLINE_FETCH === "1") {
    return loadCachedPrices("PRICING_SKIP_ONLINE_FETCH=1");
  }

  try {
    return await fetchAndPersistOnlinePrices({
      modality,
      writeCsvFile: false,
      quiet: opts.quiet ?? false,
    });
  } catch (e) {
    try {
      return await loadCachedPrices(`Online prices fetch failed (${e.message})`);
    } catch {
      throw e;
    }
  }
}
