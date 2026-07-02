/**
 * 生文价目阶梯：官方上线真源以 tiers[] 为准（可多档）
 */

/**
 * @typedef {{
 *   tierLabel: string,
 *   input?: number | null,
 *   output?: number | null,
 *   cache?: number | null,
 *   parseSource?: string | null,
 * }} TextTier
 */

/**
 * 将 live / seed 价目规范为 tiers[]（单档也包进数组）
 * @param {{ tiers?: TextTier[], tierLabel?: string, input?: number|null, output?: number|null, cache?: number|null, source?: string } | null} prices
 * @param {string} [defaultLabel]
 * @returns {TextTier[]}
 */
export function normalizeTextTiers(prices, defaultLabel = "标准价") {
  if (!prices) return [];

  if (Array.isArray(prices.tiers) && prices.tiers.length) {
    return prices.tiers.map((t) => ({
      tierLabel: t.tierLabel ?? "—",
      input: t.input ?? null,
      output: t.output ?? null,
      cache: t.cache ?? null,
      parseSource: t.parseSource ?? prices.source ?? null,
    }));
  }

  if (
    prices.input != null ||
    prices.output != null ||
    prices.cache != null
  ) {
    return [
      {
        tierLabel: prices.tierLabel ?? defaultLabel,
        input: prices.input ?? null,
        output: prices.output ?? null,
        cache: prices.cache ?? null,
        parseSource: prices.source ?? null,
      },
    ];
  }

  return [];
}

/** @param {TextTier[]} tiers */
export function primaryTextTier(tiers) {
  return tiers[0] ?? null;
}

/** @param {TextTier[]} tiers */
export function countPricedTiers(tiers) {
  return tiers.filter(
    (t) => t.input != null || t.output != null || t.cache != null,
  ).length;
}
