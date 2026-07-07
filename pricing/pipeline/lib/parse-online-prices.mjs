/**
 * 解析 GET /v1/prices 响应 → 扁平价（USD/百万 tokens）
 */

export function num(v) {
  if (v == null || v === "" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** image_tiered / flat 生图：取首档 unit 价 */
function parseOnlineImagePrimary(entry) {
  const groups = entry.price_groups ?? [];
  const resG = groups.find((g) => g.type === "resolution_tier");
  if (resG?.prices?.unit) {
    return {
      tierLabel:
        resG.conditions_summary ?? resG.label ?? resG.conditions?.resolution_tier ?? "标准价",
      price: num(resG.prices.unit.amount),
      pricingMode: entry.pricing_mode,
    };
  }
  const flatG =
    groups.find((g) => g.type === "dimension_set") ??
    groups.find((g) => g.type === "default");
  if (flatG?.prices?.unit) {
    return {
      tierLabel: flatG.label ?? "标准价",
      price: num(flatG.prices.unit.amount),
      pricingMode: entry.pricing_mode,
    };
  }
  return { tierLabel: "—", price: null, pricingMode: entry.pricing_mode };
}

/** 生图按分辨率分档 */
export function parseOnlineImageTiers(entry) {
  const mode = entry.pricing_mode;
  const groups = entry.price_groups ?? [];

  if (mode === "image_tiered" || entry.modality_type === "image") {
    const tiers = groups
      .filter((g) => g.type === "resolution_tier" && g.prices?.unit)
      .map((g) => ({
        tierLabel:
          g.conditions_summary ??
          g.label ??
          String(g.conditions?.resolution_tier ?? "").toUpperCase(),
        tierKey: g.conditions?.resolution_tier
          ? `res:${String(g.conditions.resolution_tier).toLowerCase()}`
          : undefined,
        price: num(g.prices.unit.amount),
        pricingMode: mode,
      }));
    if (tiers.length) return tiers;
    return [parseOnlineImagePrimary(entry)];
  }

  return [parseOnlineImagePrimary(entry)];
}

function onlineVideoUnitMeta(entry, unitBlock) {
  return {
    unit: unitBlock?.unit ?? entry.price_unit ?? entry.charge_unit ?? null,
    currency: unitBlock?.currency ?? entry.currency ?? "USD",
  };
}

function mapOnlineVideoUnitTier(group, entry, mode, { tierLabel, tierKey }) {
  const unitBlock = group.prices?.unit;
  const meta = onlineVideoUnitMeta(entry, unitBlock);
  return {
    tierLabel,
    tierKey,
    price: num(unitBlock?.amount),
    currency: meta.currency,
    unit: meta.unit,
    pricingMode: mode,
  };
}

/** 生视频：分辨率分档 USD/秒 · 或 video_token USD/百万 tokens（Seedance 等） */
export function parseOnlineVideoTiers(entry) {
  const mode = entry.pricing_mode;
  const groups = entry.price_groups ?? [];

  if (mode === "video_tiered" || entry.modality_type === "video") {
    const resTiers = groups
      .filter((g) => g.type === "resolution_tier" && g.prices?.unit)
      .map((g) => {
        const res =
          g.conditions?.resolution ??
          g.conditions_summary ??
          g.label ??
          "标准价";
        const label = String(res).trim();
        const low = label.toLowerCase();
        let tierKey;
        if (/540p|480p/.test(low)) tierKey = "res:540p";
        else if (/768p|720p/.test(low)) tierKey = "res:720p";
        else if (/1080p/.test(low)) tierKey = "res:1080p";
        else if (/^2k/.test(low)) tierKey = "res:2k";
        else if (/^4k/.test(low)) tierKey = "res:4k";
        else tierKey = `res:${low}`;
        return mapOnlineVideoUnitTier(g, entry, mode, { tierLabel: label, tierKey });
      });
    if (resTiers.length) return resTiers;

    const audioTiers = groups
      .filter((g) => g.type === "has_audio" && g.prices?.unit)
      .map((g) => {
        const enabled = g.conditions?.audio_generation === "enabled";
        const tierLabel =
          g.label ?? g.conditions_summary ?? (enabled ? "含音频" : "无声");
        const tierKey = enabled ? "audio:enabled" : "audio:disabled";
        return mapOnlineVideoUnitTier(g, entry, mode, { tierLabel, tierKey });
      });
    if (audioTiers.length) return audioTiers;
  }

  const flat = groups.find((g) => g.prices?.unit);
  if (flat?.prices?.unit) {
    return [
      mapOnlineVideoUnitTier(flat, entry, mode, {
        tierLabel: flat.label ?? "标准价",
        tierKey: "uniform",
      }),
    ];
  }
  return [];
}

/** legacy：default 组；阶梯：各 token_kind 取 ranges[0] 作为主档摘要价 */
export function parseOnlinePricesPrimary(entry) {
  const mode = entry.pricing_mode;
  const groups = entry.price_groups ?? [];

  if (mode === "video_tiered" || entry.modality_type === "video") {
    const tiers = parseOnlineVideoTiers(entry);
    const first = tiers[0];
    return {
      tierLabel: first?.tierLabel ?? "—",
      price: first?.price ?? null,
      pricingMode: mode,
    };
  }

  if (mode === "image_tiered" || entry.modality_type === "image") {
    return parseOnlineImagePrimary(entry);
  }

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

  if (mode === "video_tiered" || entry.modality_type === "video") {
    return parseOnlineVideoTiers(entry);
  }

  if (mode === "image_tiered" || entry.modality_type === "image") {
    return parseOnlineImageTiers(entry);
  }

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
    const isImage =
      entry.pricing_mode === "image_tiered" || entry.modality_type === "image";
    const isVideo =
      entry.pricing_mode === "video_tiered" || entry.modality_type === "video";
    return {
      model: entry.model,
      displayName: entry.display_name,
      modality: entry.modality_type,
      pricingMode: entry.pricing_mode,
      currency: entry.currency,
      priceUnit: entry.price_unit,
      updatedAt: entry.updated_at,
      tierLabel: primary.tierLabel,
      inputUsd: isImage || isVideo ? null : primary.input,
      outputUsd: isImage || isVideo ? null : primary.output,
      cacheUsd: isImage || isVideo ? null : primary.cache,
      cacheCreationUsd: isImage || isVideo ? null : primary.cacheCreation,
      priceUsd: isImage || isVideo ? primary.price : null,
      tierCount: parseOnlinePricesTiers(entry).length,
    };
  });
}
