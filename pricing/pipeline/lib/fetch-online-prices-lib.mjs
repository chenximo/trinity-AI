/**
 * 拉取 GET /v1/prices 并写入 output/online/prices-api.json（对比前始终用最新 API）
 */

import { mkdir, writeFile } from "node:fs/promises";
import {
  flattenPricesList,
  indexOnlinePrices,
} from "./parse-online-prices.mjs";
import { writeCsv } from "./export-excel.mjs";
import {
  OUT_ONLINE_DIR,
  PRICES_API_FILE,
  PRICES_API_FLAT_FILE,
  PRICES_API_INDEX_FILE,
  PRICES_API_CSV_FILE,
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
 * @param {{ writeCsvFile?: boolean }} [opts]
 */
export async function writeOnlinePricesCache(raw, opts = {}) {
  const writeCsvFile = opts.writeCsvFile ?? false;
  const data = raw.data ?? [];
  const modality = raw.modality ?? "text";
  const fetchedAt = raw.fetchedAt ?? new Date().toISOString();
  const fxCnyPerUsd = raw.fxCnyPerUsd ?? 7.25;

  const flat = flattenPricesList(data);
  const priceIndex = indexOnlinePrices(data);
  const index = Object.fromEntries([...priceIndex.entries()]);

  await mkdir(OUT_ONLINE_DIR, { recursive: true });
  await writeFile(PRICES_API_FILE, JSON.stringify(raw, null, 2), "utf8");
  await writeFile(
    PRICES_API_FLAT_FILE,
    JSON.stringify({ fetchedAt, modality, fxCnyPerUsd, models: flat }, null, 2),
    "utf8",
  );
  await writeFile(
    PRICES_API_INDEX_FILE,
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
    await writeCsv(PRICES_API_CSV_FILE, csvRows, writeFile);
  }

  return { raw, map: priceIndex, fetchedAt, modelCount: data.length };
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
    fxCnyPerUsd: 7.25,
    fxNote: "平台 CNY 挂牌换算 USD 刊例时使用 1 USD = 7.25 CNY",
    fetchedAt,
    modelCount: data.length,
    object: body.object,
    data,
  };

  const result = await writeOnlinePricesCache(raw, { writeCsvFile });

  if (!quiet) {
    console.log(
      `Fetched online prices: ${data.length} models (${modality}) at ${fetchedAt}`,
    );
    console.log(`Wrote ${PRICES_API_FILE}`);
  }

  return {
    ...result,
    apiUrl: raw.apiUrl,
  };
}

/** 对比流水线入口：默认每次打 API；失败时回退已有 prices-api.json；PRICING_SKIP_ONLINE_FETCH=1 仅读缓存 */
export async function refreshOnlinePricesForCompare(modality = "text", opts = {}) {
  const { readFile } = await import("node:fs/promises");

  async function loadCachedPrices(reason) {
    const raw = JSON.parse(await readFile(PRICES_API_FILE, "utf8"));
    const cachedModality = raw.modality ?? "text";
    if (
      modality !== "all" &&
      cachedModality !== "all" &&
      cachedModality !== modality
    ) {
      throw new Error(
        `cached prices-api.json modality=${cachedModality}, need ${modality}`,
      );
    }
    const map = indexOnlinePrices(raw.data ?? []);
    if (!map.size) {
      throw new Error("cached prices-api.json is empty");
    }
    if (!opts.quiet) {
      console.warn(
        `${reason}; using ${PRICES_API_FILE} (${raw.fetchedAt ?? "—"}, ${map.size} models)`,
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
