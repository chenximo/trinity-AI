/**
 * 解析 GET /v1/prices 响应 → 扁平价（USD/百万 tokens）
 */

export function num(v) {
  if (v == null || v === "" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** legacy：default 组；阶梯：各 token_kind 取 ranges[0] 作为主档摘要价 */
export function parseOnlinePricesPrimary(entry) {
  const mode = entry.pricing_mode;
  const groups = entry.price_groups ?? [];

  if (mode === "legacy") {
    const p = groups.find((g) => g.type === "default")?.prices ?? {};
    return {
      tierLabel: "标准计价",
      input: num(p.input?.amount),
      output: num(p.output?.amount),
      cache: num(p.cache?.amount),
      cacheCreation: num(p.cache_creation?.amount),
      pricingMode: mode,
    };
  }

  const amountAt = (kind) => {
    const g = groups.find(
      (x) => x.type === "token_kind" && x.token_kind === kind,
    );
    return num(g?.ranges?.[0]?.price?.amount);
  };

  const inputG = groups.find(
    (x) => x.type === "token_kind" && x.token_kind === "input",
  );
  const tierLabel =
    inputG?.ranges?.[0]?.range?.display_short ??
    inputG?.ranges?.[0]?.range?.display ??
    inputG?.label ??
    mode;

  return {
    tierLabel,
    input: amountAt("input"),
    output: amountAt("output"),
    cache: amountAt("cached_input") ?? amountAt("cache"),
    cacheCreation: amountAt("cache_creation"),
    pricingMode: mode,
  };
}

/** legacy：default 组；含 has_audio 时展开文本/音频两档 */
export function parseOnlinePricesTiers(entry) {
  const mode = entry.pricing_mode;
  const groups = entry.price_groups ?? [];

  if (mode === "legacy") {
    const defaultG = groups.find((g) => g.type === "default");
    const audioG = groups.find((g) => g.type === "has_audio");
    const tiers = [];

    if (defaultG?.prices) {
      const p = defaultG.prices;
      tiers.push({
        tierLabel: "输入:文本/图片/视频",
        input: num(p.input?.amount),
        output: num(p.output?.amount),
        cache: num(p.cache?.amount),
        cacheCreation: num(p.cache_creation?.amount),
        pricingMode: mode,
      });
    }

    if (audioG?.prices) {
      const p = audioG.prices;
      tiers.push({
        tierLabel: "输入:音频",
        input: num(p.input?.amount),
        output: num(p.output?.amount),
        cache: num(p.cache?.amount),
        cacheCreation: num(p.cache_creation?.amount),
        pricingMode: mode,
      });
    }

    if (tiers.length) return tiers;
    return [parseOnlinePricesPrimary(entry)];
  }

  const inputG = groups.find(
    (x) => x.type === "token_kind" && x.token_kind === "input",
  );
  const outG = groups.find(
    (x) => x.type === "token_kind" && x.token_kind === "output",
  );
  const cacheG = groups.find(
    (x) =>
      x.type === "token_kind" &&
      (x.token_kind === "cached_input" || x.token_kind === "cache"),
  );

  const ranges = inputG?.ranges ?? [];
  if (!ranges.length) {
    return [parseOnlinePricesPrimary(entry)];
  }

  return ranges.map((r, i) => {
    const label =
      r.range?.display_short ?? r.range?.display ?? `档位${i + 1}`;
    const outR = outG?.ranges?.[i];
    const cacheR = cacheG?.ranges?.[i];
    return {
      tierLabel: label,
      input: num(r.price?.amount),
      output: num(outR?.price?.amount),
      cache: num(cacheR?.price?.amount),
      cacheCreation: null,
      pricingMode: mode,
    };
  });
}

export function indexOnlinePrices(data) {
  const map = new Map();
  for (const entry of data ?? []) {
    const id = entry.model?.toLowerCase();
    if (!id) continue;
    const primary = parseOnlinePricesPrimary(entry);
    map.set(id, {
      model: entry.model,
      displayName: entry.display_name,
      modality: entry.modality_type,
      updatedAt: entry.updated_at,
      ...primary,
      tiers: parseOnlinePricesTiers(entry),
    });
  }
  return map;
}

export function flattenPricesList(data) {
  return (data ?? []).map((entry) => {
    const primary = parseOnlinePricesPrimary(entry);
    return {
      model: entry.model,
      displayName: entry.display_name,
      modality: entry.modality_type,
      pricingMode: entry.pricing_mode,
      currency: entry.currency,
      priceUnit: entry.price_unit,
      updatedAt: entry.updated_at,
      tierLabel: primary.tierLabel,
      inputUsd: primary.input,
      outputUsd: primary.output,
      cacheUsd: primary.cache,
      cacheCreationUsd: primary.cacheCreation,
      tierCount: parseOnlinePricesTiers(entry).length,
    };
  });
}
