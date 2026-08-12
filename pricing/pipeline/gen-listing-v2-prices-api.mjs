#!/usr/bin/env node
/**
 * 将当次 listing V2 写成 prices-api 同构草案（固定名，覆盖写）
 *
 * 口径（产品）：
 *   V1 = 线上刊例（对比时用 fetch 缓存，不写进本文件的「建议价」）
 *   V2 = 本文件 data[]（国际站优先新生成建议刊例）
 *
 * 依赖：先跑 pricing:listing:v1v2（或本脚本可自行重算 rows）
 *
 *   npm run pricing:gen-listing-v2
 *   → pricing/output/draft/listing-v2_prices-api.json
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TEXT_SEED } from "../suppliers/official/data/seeds/text.mjs";
import { TEXT_INTL_SEED } from "../suppliers/official/data/seeds/text-intl.mjs";
import { readOnlinePricesCache } from "./lib/fetch-online-prices-lib.mjs";
import {
  LISTING_POLICY,
  FX_V1_CNY_PER_USD,
  buildListingV1V2ModelRows,
} from "./lib/listing-v1v2-lib.mjs";
import {
  formatAmountUsd,
  formatDisplayUsd,
} from "./lib/build-upstream-prices-api.mjs";
import {
  OUT_DRAFT_DIR,
  LISTING_V2_PRICES_API,
  LISTING_V2_PRICES_API_META,
  LISTING_V1V2_TEXT_JSON,
} from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function priceField(amount, kind) {
  if (amount == null || !Number.isFinite(Number(amount))) return null;
  const n = Number(amount);
  const amt = formatAmountUsd(n);
  return {
    amount: amt,
    currency: "USD",
    unit: "per_million_tokens",
    display: formatDisplayUsd(n, kind),
  };
}

function applyV2ToEntry(onlineEntry, v2Tier, v2Source, note) {
  const entry = structuredClone(onlineEntry);
  const group =
    entry.price_groups?.find((g) => g.type === "default") ??
    entry.price_groups?.[0];
  if (!group) return null;
  if (!group.prices) group.prices = {};

  const inp = priceField(v2Tier.input, "input");
  const out = priceField(v2Tier.output, "output");
  const cache = priceField(v2Tier.cache, "cache");
  if (inp) group.prices.input = inp;
  if (out) group.prices.output = out;
  if (cache) group.prices.cache = cache;

  entry.listingV2Source = v2Source;
  entry.listingV2Note = note || null;
  entry.updated_at = new Date().toISOString();
  return entry;
}

/** 每模型取主档（uniform / 首档）V2 */
function primaryV2ByModel(listingRows) {
  /** @type {Map<string, { v2: object, v2Source: string, note: string }>} */
  const map = new Map();
  for (const r of listingRows) {
    if (!r.v2) continue;
    const id = String(r.modelId || "").toLowerCase();
    if (!id) continue;
    const existing = map.get(id);
    if (!existing || r.tierKey === "uniform" || r.tierLabel === "标准价") {
      map.set(id, { v2: r.v2, v2Source: r.v2Source, note: r.note || "" });
    }
  }
  return map;
}

async function loadListingRows() {
  try {
    const raw = JSON.parse(await readFile(LISTING_V1V2_TEXT_JSON, "utf8"));
    if (Array.isArray(raw.rows) && raw.rows.length) return raw.rows;
  } catch {
    /* rebuild */
  }
  const { raw: online } = await readOnlinePricesCache("text");
  const ids = (online.data || online.models || [])
    .map((m) => m.model || m.id)
    .filter(Boolean)
    .sort();
  const rows = [];
  for (const id of ids) {
    rows.push(...buildListingV1V2ModelRows(id, TEXT_SEED, TEXT_INTL_SEED));
  }
  return rows;
}

async function main() {
  const { raw: online } = await readOnlinePricesCache("text");
  const listingRows = await loadListingRows();
  const v2By = primaryV2ByModel(listingRows);

  const data = [];
  let priced = 0;
  let preserved = 0;
  for (const entry of online.data ?? []) {
    const id = String(entry.model || "").toLowerCase();
    const hit = v2By.get(id);
    if (hit?.v2 && hit.v2Source !== "missing") {
      const next = applyV2ToEntry(entry, hit.v2, hit.v2Source, hit.note);
      if (next) {
        data.push(next);
        priced++;
        continue;
      }
    }
    // 无 V2：保留线上结构但不打 listingV2Source → diff 侧视为无建议覆盖
    const copy = structuredClone(entry);
    delete copy.listingV2Source;
    data.push(copy);
    preserved++;
  }

  const generatedAt = new Date().toISOString();
  const doc = {
    source: "trinity_listing_v2",
    apiUrl: online.apiUrl,
    modality: "text",
    fxCnyPerUsd: FX_V1_CNY_PER_USD,
    fxNote:
      "V2：官网国际站优先；无国际站则国内 CNY÷6.5（或 USD 直用）。对比对象 V1=线上刊例。",
    fetchedAt: generatedAt,
    listing_policy: LISTING_POLICY,
    pricingPolicy: "listing_v2_intl_first",
    modelCount: data.length,
    object: "list",
    data,
  };

  await mkdir(OUT_DRAFT_DIR, { recursive: true });
  await writeFile(LISTING_V2_PRICES_API, JSON.stringify(doc, null, 2), "utf8");
  await writeFile(
    LISTING_V2_PRICES_API_META,
    JSON.stringify(
      {
        tag: "listing-v2_prices-api",
        pricingPolicy: "listing_v2_intl_first",
        listing_policy: LISTING_POLICY,
        generatedAt,
        onlineFetchedAt: online.fetchedAt ?? null,
        listingSourcePath: path.relative(
          path.join(__dirname, ".."),
          LISTING_V1V2_TEXT_JSON,
        ),
        pricedModelCount: priced,
        preservedOnlineOnlyCount: preserved,
        fxCnyPerUsd: FX_V1_CNY_PER_USD,
        note: "V1=线上；本文件=当次 V2 建议刊例（固定名覆盖）",
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `Wrote ${LISTING_V2_PRICES_API} · V2 applied=${priced} · keep online shell=${preserved}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
