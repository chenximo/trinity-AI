/**
 * 将 upstream-pricing 爬虫官网价转为 GET /v1/prices 同构 JSON
 * CNY（TokenHub / 百炼 / AIGC国内）÷ fxCnyPerUsd → USD；AIGC国际已是 USD
 */

import { parseNum, tierSortKey } from "./pricing-compare.mjs";
import { parseOnlinePricesTiers } from "./parse-online-prices.mjs";

const KIND_LABELS = {
  input: "input tokens",
  output: "output tokens",
  cache: "cached input tokens",
  cached_input: "cached input tokens",
  cache_creation: "cache creation tokens",
};

export function formatAmountUsd(n) {
  if (n == null || !Number.isFinite(n)) return null;
  let s = n.toFixed(6);
  s = s.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  return s;
}

export function formatDisplayUsd(amount, kind) {
  const label = KIND_LABELS[kind] ?? kind;
  const shown = Math.round(amount * 100) / 100;
  return `$${shown.toFixed(2)} / 百万 ${label}`;
}

export function cnyToUsd(cny, fxCnyPerUsd) {
  const n = parseNum(cny);
  if (n == null || !fxCnyPerUsd) return null;
  return n / fxCnyPerUsd;
}

/** 单档官网价：TH > BL > AIGC国内(CNY) > AIGC国际(USD) */
export function pickTierOfficial(tier) {
  if (!tier) return null;
  if (tier.thIn != null || tier.thOut != null || tier.thCache != null) {
    return {
      source: "tokenhub",
      currency: "CNY",
      input: tier.thIn,
      output: tier.thOut,
      cache: tier.thCache,
    };
  }
  if (tier.blIn != null || tier.blOut != null || tier.blCache != null) {
    return {
      source: "bailian",
      currency: "CNY",
      input: tier.blIn,
      output: tier.blOut,
      cache: tier.blCache,
    };
  }
  if (
    tier.aigcDomIn != null ||
    tier.aigcDomOut != null ||
    tier.aigcDomCache != null
  ) {
    return {
      source: "aigc_domestic",
      currency: "CNY",
      input: tier.aigcDomIn,
      output: tier.aigcDomOut,
      cache: tier.aigcDomCache,
    };
  }
  if (
    tier.aigcIntlIn != null ||
    tier.aigcIntlOut != null ||
    tier.aigcIntlCache != null
  ) {
    return {
      source: "aigc_international",
      currency: "USD",
      input: tier.aigcIntlIn,
      output: tier.aigcIntlOut,
      cache: tier.aigcIntlCache,
    };
  }
  return null;
}

/** 入/出爬虫价：TH > BL > AIGC国内（不含国际站，用于 CNY÷汇率） */
export function pickTierCrawlerInOut(tier) {
  if (!tier) return null;
  if (tier.thIn != null || tier.thOut != null) {
    return {
      source: "tokenhub",
      currency: "CNY",
      input: tier.thIn,
      output: tier.thOut,
    };
  }
  if (tier.blIn != null || tier.blOut != null) {
    return {
      source: "bailian",
      currency: "CNY",
      input: tier.blIn,
      output: tier.blOut,
    };
  }
  if (tier.aigcDomIn != null || tier.aigcDomOut != null) {
    return {
      source: "aigc_domestic",
      currency: "CNY",
      input: tier.aigcDomIn,
      output: tier.aigcDomOut,
    };
  }
  return null;
}

/** AIGC 国际站挂牌（USD） */
export function pickTierAigcIntl(tier) {
  if (!tier) return null;
  if (
    tier.aigcIntlIn != null ||
    tier.aigcIntlOut != null ||
    tier.aigcIntlCache != null
  ) {
    return {
      source: "aigc_international",
      currency: "USD",
      input: tier.aigcIntlIn,
      output: tier.aigcIntlOut,
      cache: tier.aigcIntlCache,
    };
  }
  return null;
}

function fieldMatches(a, b, tolerancePct = 0.5) {
  const x = parseNum(a);
  const y = parseNum(b);
  if (x == null && y == null) return true;
  if (x == null || y == null) return false;
  if (Math.abs(x - y) < 0.000001) return true;
  if (y === 0) return false;
  const pct = Math.abs(((x - y) / y) * 100);
  return pct <= tolerancePct;
}

function inOutPairMatches(aIn, aOut, bIn, bOut, tolerancePct = 0.5) {
  return (
    fieldMatches(aIn, bIn, tolerancePct) &&
    fieldMatches(aOut, bOut, tolerancePct)
  );
}

function tripleMatches(onlineTier, input, output, cache, tolerancePct = 0.5) {
  const checks = [
    [onlineTier?.input, input],
    [onlineTier?.output, output],
    [onlineTier?.cache, cache],
  ];
  let compared = 0;
  for (const [a, b] of checks) {
    if (a == null && b == null) continue;
    if (a == null || b == null) return false;
    compared++;
    if (!fieldMatches(a, b, tolerancePct)) return false;
  }
  return compared > 0;
}

/** legacy 线上单档时，从多档 upstream 中选取与线上一致或最接近的档位 */
export function pickBestLegacyUpstreamTier(
  pricedTiers,
  onlineTier,
  fxCnyPerUsd,
) {
  if (!pricedTiers.length) return null;
  if (pricedTiers.length === 1 || !onlineTier) return pricedTiers[0];

  let best = pricedTiers[0];
  let bestScore = -1;

  for (const tier of pricedTiers) {
    const official = pickTierOfficial(tier);
    const intl = pickTierAigcIntl(tier);
    const crawl = pickTierCrawlerInOut(tier);

    const candidates = [];
    if (intl) {
      candidates.push({
        input: toUsdField(intl.input, "USD", fxCnyPerUsd),
        output: toUsdField(intl.output, "USD", fxCnyPerUsd),
        cache: toUsdField(intl.cache, "USD", fxCnyPerUsd),
        weight: 4,
      });
    }
    if (tier.aigcDomIn != null || tier.aigcDomOut != null) {
      candidates.push({
        input: parseNum(tier.aigcDomIn),
        output: parseNum(tier.aigcDomOut),
        cache: parseNum(tier.aigcDomCache),
        weight: 5,
      });
      candidates.push({
        input: cnyToUsd(tier.aigcDomIn, fxCnyPerUsd),
        output: cnyToUsd(tier.aigcDomOut, fxCnyPerUsd),
        cache: cnyToUsd(tier.aigcDomCache, fxCnyPerUsd),
        weight: 3,
      });
    }
    if (crawl && official) {
      candidates.push({
        input: toUsdField(crawl.input, crawl.currency, fxCnyPerUsd),
        output: toUsdField(crawl.output, crawl.currency, fxCnyPerUsd),
        cache: toUsdField(official.cache, official.currency, fxCnyPerUsd),
        weight: 2,
      });
    }

    for (const cand of candidates) {
      if (!tripleMatches(onlineTier, cand.input, cand.output, cand.cache, 0.5)) {
        continue;
      }
      const score = cand.weight * 10;
      if (score > bestScore) {
        bestScore = score;
        best = tier;
      }
    }
  }

  if (bestScore >= 0) return best;

  let closest = pricedTiers[0];
  let closestErr = Infinity;
  for (const tier of pricedTiers) {
    const official = pickTierOfficial(tier);
    const intl = pickTierAigcIntl(tier);
    const input = toUsdField(
      intl?.input ?? official?.input,
      intl ? "USD" : official?.currency,
      fxCnyPerUsd,
    );
    const output = toUsdField(
      intl?.output ?? official?.output,
      intl ? "USD" : official?.currency,
      fxCnyPerUsd,
    );
    if (input == null || output == null || onlineTier?.input == null) continue;
    const err =
      Math.abs(input - onlineTier.input) + Math.abs(output - onlineTier.output);
    if (err < closestErr) {
      closestErr = err;
      closest = tier;
    }
  }
  return closest;
}

/**
 * 0.65 优化规则：
 * - 缓：始终爬虫 TH>BL>国内>国际，CNY÷fx
 * - 入/出：默认爬虫 TH>BL>国内 CNY÷fx；若线上相对爬虫换算有偏差且与 AIGC 国际一致 → 国际 USD
 */
export function resolveOptimizedTierPrices(tier, onlineTier, fxCnyPerUsd) {
  const crawl = pickTierCrawlerInOut(tier);
  const cacheOfficial = pickTierOfficial(tier);
  const intl = pickTierAigcIntl(tier);

  const crawlIn = toUsdField(crawl?.input, crawl?.currency, fxCnyPerUsd);
  const crawlOut = toUsdField(crawl?.output, crawl?.currency, fxCnyPerUsd);
  const cacheUsd = toUsdField(
    cacheOfficial?.cache,
    cacheOfficial?.currency,
    fxCnyPerUsd,
  );

  const intlIn = toUsdField(intl?.input, "USD", fxCnyPerUsd);
  const intlOut = toUsdField(intl?.output, "USD", fxCnyPerUsd);

  const onlineIn = onlineTier?.input ?? null;
  const onlineOut = onlineTier?.output ?? null;

  let input = crawlIn;
  let output = crawlOut;
  let inOutSource = crawl?.source ?? null;

  const onlyIntl = !crawl && intl;
  const deviatedFromCrawl =
    crawlIn != null &&
    crawlOut != null &&
    onlineIn != null &&
    onlineOut != null &&
    !inOutPairMatches(onlineIn, onlineOut, crawlIn, crawlOut);
  const matchesIntl =
    intlIn != null &&
    intlOut != null &&
    onlineIn != null &&
    onlineOut != null &&
    inOutPairMatches(onlineIn, onlineOut, intlIn, intlOut);

  if (onlyIntl || (deviatedFromCrawl && matchesIntl)) {
    input = intlIn;
    output = intlOut;
    inOutSource = "aigc_international";
  } else if (!crawl && intl) {
    input = intlIn;
    output = intlOut;
    inOutSource = "aigc_international";
  }

  return {
    input,
    output,
    cache: cacheUsd,
    inOutSource,
    cacheSource: cacheOfficial?.source ?? null,
    usedAigcIntlInOut: inOutSource === "aigc_international",
  };
}

function patchResolvedLegacyPrices(prices, resolved) {
  if (!prices || !resolved) return false;
  let any = false;
  if (resolved.input != null) {
    patchPriceObj(prices.input, resolved.input, "input");
    any = true;
  }
  if (resolved.output != null) {
    patchPriceObj(prices.output, resolved.output, "output");
    any = true;
  }
  if (resolved.cache != null) {
    patchPriceObj(prices.cache, resolved.cache, "cache");
    any = true;
  }
  return any;
}

function toUsdField(val, currency, fxCnyPerUsd) {
  if (currency === "USD") return parseNum(val);
  return cnyToUsd(val, fxCnyPerUsd);
}

function patchPriceObj(priceObj, usdAmount, kind) {
  if (!priceObj || usdAmount == null) return;
  priceObj.amount = formatAmountUsd(usdAmount);
  priceObj.currency = "USD";
  priceObj.unit = "per_million_tokens";
  priceObj.display = formatDisplayUsd(usdAmount, kind);
}

function patchLegacyPrices(prices, official, fxCnyPerUsd) {
  if (!prices || !official) return false;
  const fields = [
    ["input", "input"],
    ["output", "output"],
    ["cache", "cache"],
    ["cache_creation", "cache_creation"],
  ];
  let any = false;
  for (const [key, kind] of fields) {
    if (key === "cache_creation") continue;
    const usd = toUsdField(official[key === "cache" ? "cache" : key], official.currency, fxCnyPerUsd);
    if (usd == null) continue;
    patchPriceObj(prices[key], usd, kind);
    any = true;
  }
  return any;
}

function sortedUpstreamTiers(tiers) {
  return [...(tiers ?? [])].sort(
    (a, b) => tierSortKey(a.tierKey) - tierSortKey(b.tierKey),
  );
}

function tokenKindToField(tokenKind) {
  if (tokenKind === "cached_input" || tokenKind === "cache") return "cache";
  if (tokenKind === "input" || tokenKind === "output") return tokenKind;
  return null;
}

/**
 * 以 prices-api 单条为结构模板，填入爬虫换算价
 */
export function applyUpstreamToPriceEntry(templateEntry, upstreamModel, fxCnyPerUsd) {
  const onlineTiers = parseOnlinePricesTiers(templateEntry);
  const entry = structuredClone(templateEntry);
  const tiers = sortedUpstreamTiers(upstreamModel?.tiers);
  const pricedTiers = tiers.filter((t) => pickTierOfficial(t));

  if (!pricedTiers.length) {
    return { entry, hasUpstream: false, source: null };
  }

  const mode = entry.pricing_mode;
  let source = null;

  if (mode === "legacy") {
    const tier = pickBestLegacyUpstreamTier(
      pricedTiers,
      onlineTiers[0],
      fxCnyPerUsd,
    );
    const official = pickTierOfficial(tier);
    source = official?.source ?? null;
    const group = entry.price_groups?.find((g) => g.type === "default");
    patchLegacyPrices(group?.prices, official, fxCnyPerUsd);
    return { entry, hasUpstream: !!official, source };
  }

  for (const group of entry.price_groups ?? []) {
    if (group.type !== "token_kind" || !group.ranges?.length) continue;
    const field = tokenKindToField(group.token_kind);
    if (!field) continue;

    group.ranges.forEach((range, i) => {
      const tier = pricedTiers[i] ?? tiers[i];
      const official = pickTierOfficial(tier);
      if (!official) return;
      source = source ?? official.source;
      const usd = toUsdField(official[field], official.currency, fxCnyPerUsd);
      patchPriceObj(range.price, usd, group.token_kind);
    });
  }

  return { entry, hasUpstream: true, source };
}

/**
 * 0.65 优化版：缓=爬虫换算；入/出在偏离爬虫且对齐 AIGC 国际时用国际价
 */
export function applyOptimizedToPriceEntry(
  templateEntry,
  upstreamModel,
  fxCnyPerUsd,
) {
  const onlineTiers = parseOnlinePricesTiers(templateEntry);
  const entry = structuredClone(templateEntry);
  const tiers = sortedUpstreamTiers(upstreamModel?.tiers);
  const pricedTiers = tiers.filter((t) => pickTierOfficial(t));

  if (!pricedTiers.length) {
    return {
      entry,
      hasUpstream: false,
      inOutSource: null,
      cacheSource: null,
      usedAigcIntlInOut: false,
    };
  }

  const mode = entry.pricing_mode;
  let inOutSource = null;
  let cacheSource = null;
  let usedAigcIntlInOut = false;

  if (mode === "legacy") {
    const tier = pickBestLegacyUpstreamTier(
      pricedTiers,
      onlineTiers[0],
      fxCnyPerUsd,
    );
    const resolved = resolveOptimizedTierPrices(
      tier,
      onlineTiers[0],
      fxCnyPerUsd,
    );
    inOutSource = resolved.inOutSource;
    cacheSource = resolved.cacheSource;
    usedAigcIntlInOut = resolved.usedAigcIntlInOut;
    const group = entry.price_groups?.find((g) => g.type === "default");
    patchResolvedLegacyPrices(group?.prices, resolved);
    return {
      entry,
      hasUpstream: true,
      inOutSource,
      cacheSource,
      usedAigcIntlInOut,
    };
  }

  const resolvedByIndex = pricedTiers.map((tier, i) =>
    resolveOptimizedTierPrices(
      tier,
      onlineTiers[i] ?? onlineTiers[0],
      fxCnyPerUsd,
    ),
  );

  for (const group of entry.price_groups ?? []) {
    if (group.type !== "token_kind" || !group.ranges?.length) continue;
    const field = tokenKindToField(group.token_kind);
    if (!field) continue;

    group.ranges.forEach((range, i) => {
      const resolved = resolvedByIndex[i] ?? resolvedByIndex[0];
      if (!resolved) return;
      inOutSource = inOutSource ?? resolved.inOutSource;
      cacheSource = cacheSource ?? resolved.cacheSource;
      if (resolved.usedAigcIntlInOut) usedAigcIntlInOut = true;
      const usd = field === "cache" ? resolved.cache : resolved[field];
      patchPriceObj(range.price, usd, group.token_kind);
    });
  }

  return {
    entry,
    hasUpstream: true,
    inOutSource,
    cacheSource,
    usedAigcIntlInOut,
  };
}

export function buildUpstreamPricesApi({
  templateFile,
  upstreamFile,
  fxCnyPerUsd = 7.25,
  tag = "7.25_prices",
}) {
  return {
    fxCnyPerUsd,
    tag,
    templateFile,
    upstreamFile,
  };
}

export function assembleUpstreamPricesDocument({
  templateData,
  upstreamData,
  fxCnyPerUsd,
  tag,
  pricingPolicy = "default",
  generatedAt = new Date().toISOString(),
}) {
  const upstreamById = new Map(
    (upstreamData.models ?? []).map((m) => [m.trinityId.toLowerCase(), m]),
  );

  const data = [];
  const stats = {
    total: 0,
    withUpstream: 0,
    bySource: {},
    aigcIntlInOut: 0,
  };
  const applyFn =
    pricingPolicy === "optimized_0.65"
      ? applyOptimizedToPriceEntry
      : applyUpstreamToPriceEntry;

  for (const templateEntry of templateData.data ?? []) {
    const id = templateEntry.model?.toLowerCase();
    const upstreamModel = upstreamById.get(id);
    const result = applyFn(templateEntry, upstreamModel, fxCnyPerUsd);
    const { entry, hasUpstream } = result;
    const source = result.source ?? result.inOutSource;
    data.push(entry);
    stats.total++;
    if (hasUpstream) {
      stats.withUpstream++;
      if (source) stats.bySource[source] = (stats.bySource[source] ?? 0) + 1;
      if (result.usedAigcIntlInOut) stats.aigcIntlInOut++;
    }
  }

  const fxNote =
    pricingPolicy === "optimized_0.65"
      ? `上游官网 CNY ÷ ${fxCnyPerUsd} → USD；AIGC 国际 USD 直用；入/出对齐国际站时优先国际价`
      : `上游官网 CNY（元/百万tokens）÷ ${fxCnyPerUsd} → USD；AIGC国际站已为 USD 直用`;

  const document = {
    source: templateData.source ?? "trinity_prices_api",
    apiUrl: templateData.apiUrl ?? null,
    modality: templateData.modality ?? "text",
    fxCnyPerUsd,
    fxNote,
    fetchedAt: generatedAt,
    modelCount: data.length,
    object: templateData.object ?? "list",
    data,
  };

  return {
    document,
    buildStats: {
      tag,
      pricingPolicy,
      derivedFrom: {
        template: "prices-api.json",
        upstream: "upstream-pricing.json",
        upstreamScrapedAt: upstreamData.scrapedAt ?? null,
        templateFetchedAt: templateData.fetchedAt ?? null,
      },
      generatedAt,
      pricedModelCount: stats.withUpstream,
      pricedBySource: stats.bySource,
      aigcIntlInOutCount: stats.aigcIntlInOut,
      upstreamPriority:
        pricingPolicy === "optimized_0.65"
          ? {
              cache: [
                "tokenhub",
                "bailian",
                "aigc_domestic",
                "aigc_international",
              ],
              inOut: [
                "tokenhub",
                "bailian",
                "aigc_domestic",
                "aigc_international_if_online_matches",
              ],
            }
          : ["tokenhub", "bailian", "aigc_domestic", "aigc_international"],
    },
  };
}
