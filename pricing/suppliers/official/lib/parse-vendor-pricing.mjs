/**
 * 从原厂官网页面解析 USD/百万 tokens 价目
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export async function fetchText(url, { timeoutMs = 30_000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": UA },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/** @param {string|null|undefined} s */
export function parseUsd(s) {
  if (s == null || s === "" || s === "—" || s === "-") return null;
  const m = String(s).replace(/,/g, "").match(/\$?\s*([\d.]+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * OpenAI developers.openai.com 模型页
 * @returns {{ input: number|null, output: number|null, cache: number|null, source: string }}
 */
export function parseOpenAiModelPage(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const pick = (label) => {
    const re = new RegExp(`${label}[^$]{0,40}\\$\\s*([\\d.]+)`, "i");
    const m = text.match(re);
    return m ? parseUsd(m[1]) : null;
  };

  let input = pick("Input");
  let output = pick("Output");
  let cache = pick("Cached input");

  if (input == null || output == null) {
    const headline = text.match(/Price\s*\$\s*([\d.]+)\s*•\s*\$\s*([\d.]+)/i);
    if (headline) {
      input ??= parseUsd(headline[1]);
      output ??= parseUsd(headline[2]);
    }
  }

  if (input == null && output == null) return null;

  return {
    input,
    output,
    cache,
    source: "openai_model_page",
  };
}

/**
 * xAI docs.x.ai 模型页（HTML 或 MD 渲染）
 */
export function parseXaiModelPage(html) {
  const rows = [...html.matchAll(/\|\s*([^|]+?)\s*\|\s*\$?\s*([\d.]+)\s*\|/g)];
  const map = Object.fromEntries(
    rows.map((m) => [m[1].trim().toLowerCase(), parseUsd(m[2])]),
  );

  const input = map.input ?? null;
  const output = map.output ?? null;
  const cache = map["cached input"] ?? null;

  if (input == null && output == null) {
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const inputM = text.match(/Input\s*\$\s*([\d.]+)/i);
    const outputM = text.match(/Output\s*\$\s*([\d.]+)/i);
    const cacheM = text.match(/Cached input\s*\$\s*([\d.]+)/i);
    if (!inputM && !outputM) return null;
    return {
      input: inputM ? parseUsd(inputM[1]) : null,
      output: outputM ? parseUsd(outputM[1]) : null,
      cache: cacheM ? parseUsd(cacheM[1]) : null,
      source: "xai_model_page",
    };
  }

  return { input, output, cache, source: "xai_model_page" };
}

/**
 * Anthropic models overview — 按 Claude API ID 提取
 * @param {string} html
 * @param {string} apiId e.g. claude-opus-4-8
 */
export function parseAnthropicOverview(html, apiId) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const idRe = apiId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockRe = new RegExp(
    `${idRe}[\\s\\S]{0,400}?每百万输入令牌\\s*\\$\\s*([\\d.]+)[\\s\\S]{0,80}?每百万输出令牌\\s*\\$\\s*([\\d.]+)`,
    "i",
  );
  const m = text.match(blockRe);
  if (m) {
    return {
      input: parseUsd(m[1]),
      output: parseUsd(m[2]),
      cache: null,
      source: "anthropic_overview",
    };
  }

  const enRe = new RegExp(
    `${idRe}[\\s\\S]{0,400}?\\$\\s*([\\d.]+)\\s*per 1M input[\\s\\S]{0,80}?\\$\\s*([\\d.]+)\\s*per 1M output`,
    "i",
  );
  const en = text.match(enRe);
  if (en) {
    return {
      input: parseUsd(en[1]),
      output: parseUsd(en[2]),
      cache: null,
      source: "anthropic_overview",
    };
  }

  return null;
}

/**
 * Google Gemini API pricing 页 — 按 model id 锚点解析 pricing-table
 * @param {string} html
 * @param {string} modelId
 */
export function parseGooglePricingPage(html, modelId) {
  const anchor = `id="${modelId}"`;
  const start = html.indexOf(anchor);
  if (start < 0) return null;

  const section = html.slice(start, start + 12_000);
  const tableMatch = section.match(
    /<table class="pricing-table">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
  );
  if (!tableMatch) return null;

  const rows = [...tableMatch[1].matchAll(/<tr>[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
  const paidCell = (rowHtml) => {
    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
      c[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    );
    return cells[2] ?? cells.at(-1) ?? "";
  };

  const firstUsd = (text) => {
    const m = text.match(/(?:USD\s*)?\$?\s*([\d.]+)/i);
    return m ? parseUsd(m[1]) : null;
  };

  const inputRow = rows[0];
  const outputRow = rows[1];
  const cacheRow = rows[2];

  const input = firstUsd(paidCell(inputRow));
  const output = firstUsd(paidCell(outputRow));
  const cache = firstUsd(paidCell(cacheRow));

  if (input == null && output == null) return null;

  return {
    input,
    output,
    cache,
    source: "google_pricing_page",
  };
}

/**
 * DeepSeek API 定价页 — deepseek-v4-flash / deepseek-v4-pro
 * @param {string} html
 * @param {string} vendorModelId
 */
export function parseDeepSeekPricingPage(html, vendorModelId) {
  if (!vendorModelId.startsWith("deepseek-v4-")) return null;

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const pickCol = (labelRe) => {
    const m = text.match(labelRe);
    if (!m) return null;
    const nums = [...m[0].matchAll(/([\d.]+)\s*元/g)].map((x) => Number(x[1]));
    if (!nums.length) return null;
    const col = vendorModelId.includes("flash") ? 0 : 1;
    return nums[col] ?? nums[0] ?? null;
  };

  const cache = pickCol(/缓存命中[\s\S]{0,200}/i);
  const input = pickCol(/缓存未命中[\s\S]{0,200}/i);
  const output = pickCol(/百万tokens输出[\s\S]{0,200}/i);

  if (input == null && output == null) return null;

  return {
    currency: "CNY",
    input,
    output,
    cache,
    source: "deepseek_pricing_page",
  };
}

import { TEXT_SEED, TEXT_SEED_VERIFIED_AT } from "../data/seeds/text.mjs";
import { normalizeTextTiers, primaryTextTier } from "./text-tiers.mjs";

const MEDIA_VENDORS = new Set([
  "tencent_hunyuan",
  "kling",
  "vidu",
  "tencent_youtu",
]);

/** 国内生文：官网无稳定 HTML 解析，以核实种子为准 */
const DOMESTIC_TEXT_VENDORS = new Set([
  "deepseek",
  "bailian",
  "tencent_hunyuan",
  "zhipu",
  "kimi",
  "minimax",
]);

/**
 * @param {string} vendorModelId
 * @param {Record<string, unknown>} seedMap
 * @param {string} seedVerifiedAt
 * @param {import("./modality.mjs").Modality} modality
 */
function seedPrices(vendorModelId, seedMap, seedVerifiedAt, modality) {
  const seed = seedMap[vendorModelId];
  if (!seed) return null;

  if (modality === "text") {
    const s = /** @type {{
      currency?: string,
      tiers?: Array<{ tierLabel: string, input?: number|null, output?: number|null, cache?: number|null }>,
      input?: number|null, output?: number|null, cache?: number|null, note?: string
    }} */ (seed);

    const tiers = normalizeTextTiers(
      s.tiers?.length
        ? { tiers: s.tiers, source: "official_price_seed" }
        : {
            tierLabel: "标准价",
            input: s.input,
            output: s.output,
            cache: s.cache,
            source: "official_price_seed",
          },
    );
    const primary = primaryTextTier(tiers);

    return {
      currency: s.currency ?? "USD",
      tiers,
      input: primary?.input ?? null,
      output: primary?.output ?? null,
      cache: primary?.cache ?? null,
      source: "official_price_seed",
      seedNote: s.note ?? null,
      seedVerifiedAt,
    };
  }

  const s = /** @type {{ tiers: Array<{ tierLabel: string, price: number|string, unit: string, note?: string }>, note?: string }} */ (seed);
  return {
    tiers: s.tiers.map((t) => ({
      tierLabel: t.tierLabel,
      price: t.price,
      unit: t.unit,
      note: t.note ?? null,
      parseSource: "official_price_seed",
    })),
    source: "official_price_seed",
    seedNote: s.note ?? null,
    seedVerifiedAt,
  };
}

/**
 * @param {import("../data/catalog/text.mjs").CatalogEntry & { modality?: string }} entry
 * @param {{ googlePricingHtml?: string, anthropicOverviewHtml?: string }} cache
 * @param {{ modality?: import("./modality.mjs").Modality, seedMap?: Record<string, unknown>, seedVerifiedAt?: string }} [options]
 */
export async function fetchVendorPrices(entry, cache = {}, options = {}) {
  const modality = options.modality ?? "text";
  const seedMap = options.seedMap ?? TEXT_SEED;
  const seedVerifiedAt = options.seedVerifiedAt ?? TEXT_SEED_VERIFIED_AT;

  const fromSeed = (reason, priceSource) => {
    const seed = seedPrices(entry.vendorModelId, seedMap, seedVerifiedAt, modality);
    if (!seed) {
      return {
        fetchStatus: "parse_failed",
        fetchError: reason,
        prices: null,
        priceSource: priceSource ?? entry.docUrl,
      };
    }
    return {
      fetchStatus: "seed",
      fetchError: reason,
      prices: seed,
      priceSource: `${priceSource ?? entry.docUrl} (seed ${seedVerifiedAt})`,
    };
  };

  if (
    modality !== "text" ||
    MEDIA_VENDORS.has(entry.vendor) ||
    DOMESTIC_TEXT_VENDORS.has(entry.vendor)
  ) {
    if (
      modality === "text" &&
      entry.vendor === "deepseek" &&
      (entry.vendorModelId === "deepseek-v4-flash" ||
        entry.vendorModelId === "deepseek-v4-pro")
    ) {
      try {
        const url =
          entry.pricingUrl ??
          entry.docUrl ??
          "https://api-docs.deepseek.com/zh-cn/quick_start/pricing";
        const html = await fetchText(url);
        const raw = parseDeepSeekPricingPage(html, entry.vendorModelId);
        if (raw) {
          const tiers = normalizeTextTiers({
            tierLabel: "标准价",
            input: raw.input,
            output: raw.output,
            cache: raw.cache,
            source: raw.source,
          });
          return {
            fetchStatus: "ok",
            fetchError: null,
            prices: { ...raw, tiers },
            priceSource: url,
          };
        }
      } catch {
        /* fallback to seed */
      }
    }

    const seed = seedPrices(entry.vendorModelId, seedMap, seedVerifiedAt, modality);
    if (seed) {
      const seedNote =
        modality === "text" && DOMESTIC_TEXT_VENDORS.has(entry.vendor)
          ? "国内生文以官网核实种子为准"
          : "国内生图/生视频暂以官网核实种子为准";
      return {
        fetchStatus: "seed",
        fetchError: seedNote,
        prices: seed,
        priceSource: `${entry.pricingUrl ?? entry.docUrl} (seed ${seedVerifiedAt})`,
      };
    }
    return {
      fetchStatus: "unsupported_vendor",
      fetchError: entry.vendor,
      prices: null,
      priceSource: entry.pricingUrl ?? entry.docUrl,
    };
  }

  try {
    if (entry.vendor === "openai" || entry.vendor === "xai") {
      const html = await fetchText(entry.docUrl);
      const prices =
        entry.vendor === "openai"
          ? parseOpenAiModelPage(html)
          : parseXaiModelPage(html);
      if (!prices) {
        return fromSeed("无法在页面解析价目，且无种子", entry.docUrl);
      }
      return {
        fetchStatus: "ok",
        fetchError: null,
        prices,
        priceSource: entry.docUrl,
      };
    }

    if (entry.vendor === "anthropic") {
      if (!cache.anthropicOverviewHtml) {
        cache.anthropicOverviewHtml = await fetchText(entry.docUrl);
      }
      const prices = parseAnthropicOverview(
        cache.anthropicOverviewHtml,
        entry.vendorModelId,
      );
      if (!prices) {
        return fromSeed("overview 未找到该模型价目，且无种子", entry.docUrl);
      }
      return {
        fetchStatus: "ok",
        fetchError: null,
        prices,
        priceSource: entry.docUrl,
      };
    }

    if (entry.vendor === "google") {
      const pricingUrl =
        entry.pricingUrl ??
        "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn";
      if (!cache.googlePricingHtml) {
        cache.googlePricingHtml = await fetchText(pricingUrl);
      }
      const prices = parseGooglePricingPage(
        cache.googlePricingHtml,
        entry.vendorModelId,
      );
      if (!prices) {
        return fromSeed("pricing 页未匹配到该模型，且无种子", pricingUrl);
      }
      return {
        fetchStatus: "ok",
        fetchError: null,
        prices,
        priceSource: pricingUrl,
      };
    }

    return {
      fetchStatus: "unsupported_vendor",
      fetchError: entry.vendor,
      prices: null,
      priceSource: null,
    };
  } catch (e) {
    const seeded = fromSeed(
      e instanceof Error ? e.message : String(e),
      entry.docUrl,
    );
    if (seeded.prices) return seeded;
    return {
      fetchStatus: "fetch_failed",
      fetchError: e instanceof Error ? e.message : String(e),
      prices: null,
      priceSource: entry.docUrl,
    };
  }
}
