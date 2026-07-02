#!/usr/bin/env node
/**
 * 拉取 GET /v1/prices 全量线上价目；写入前将当前文件备份为 prices-api.old.json
 *
 *   npm run compare:fetch-prices
 *   node pricing/pipeline/fetch-online-prices.mjs --modality=text
 *   node pricing/pipeline/fetch-online-prices.mjs --json-only
 */

import {
  access,
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  flattenPricesList,
  indexOnlinePrices,
} from "./lib/parse-online-prices.mjs";
import { writeCsv } from "./lib/export-excel.mjs";

import {
  OUT_ONLINE_DIR,
  PRICES_API_FILE,
  PRICES_API_OLD_FILE,
  PRICES_API_FLAT_FILE,
  PRICES_API_INDEX_FILE,
  PRICES_API_CSV_FILE,
} from "./lib/paths.mjs";
const PRICES_FILE = PRICES_API_FILE;
const PRICES_OLD_FILE = PRICES_API_OLD_FILE;
const PRICES_FLAT_FILE = PRICES_API_FLAT_FILE;
const PRICES_INDEX_FILE = PRICES_API_INDEX_FILE;
const PRICES_CSV = PRICES_API_CSV_FILE;
const DEFAULT_BASE = "https://api.trinitydesk.ai/v1";

function parseArgs() {
  const args = process.argv.slice(2);
  let modality = "text";
  let jsonOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--modality" && args[i + 1]) modality = args[++i];
    else if (args[i] === "--all") modality = "all";
    else if (args[i] === "--json-only") jsonOnly = true;
  }
  return { modality, jsonOnly };
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function archiveCurrent() {
  if (!(await fileExists(PRICES_FILE))) return false;
  await copyFile(PRICES_FILE, PRICES_OLD_FILE);
  return true;
}

async function fetchPrices(base, modality) {
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

async function main() {
  const { modality, jsonOnly } = parseArgs();
  const base = (process.env.TRINITY_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
  const fetchedAt = new Date().toISOString();

  const body = await fetchPrices(base, modality);
  const data = body.data ?? [];
  const archived = await archiveCurrent();

  const out = {
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

  const flat = flattenPricesList(data);
  const priceIndex = indexOnlinePrices(data);
  const index = Object.fromEntries(
    [...priceIndex.entries()].map(([k, v]) => [k, v]),
  );

  await mkdir(OUT_ONLINE_DIR, { recursive: true });
  await writeFile(PRICES_FILE, JSON.stringify(out, null, 2), "utf8");
  await writeFile(
    PRICES_FLAT_FILE,
    JSON.stringify(
      { fetchedAt, modality, fxCnyPerUsd: 7.25, models: flat },
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(
    PRICES_INDEX_FILE,
    JSON.stringify(
      {
        fetchedAt,
        modality,
        fxCnyPerUsd: 7.25,
        modelCount: priceIndex.size,
        models: index,
      },
      null,
      2,
    ),
    "utf8",
  );

  if (!jsonOnly) {
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
    await writeCsv(PRICES_CSV, csvRows, writeFile);
  }

  if (archived) {
    let oldMeta = null;
    try {
      oldMeta = JSON.parse(await readFile(PRICES_OLD_FILE, "utf8"));
    } catch {
      /* ignore */
    }
    console.log(
      `Archived previous → prices-api.old.json` +
        (oldMeta?.fetchedAt ? ` (was ${oldMeta.fetchedAt})` : ""),
    );
  }

  console.log(`Fetched ${data.length} models (${modality}) at ${fetchedAt}`);
  console.log(`Wrote ${PRICES_FILE}`);
  if (archived) console.log(`Wrote ${PRICES_OLD_FILE}`);
  console.log(`Wrote ${PRICES_FLAT_FILE}`);
  console.log(`Wrote ${PRICES_INDEX_FILE}`);
  if (!jsonOnly) console.log(`Wrote ${PRICES_CSV}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
