/**
 * TokenHub 控制台 DescribeModelList → 扁平价目结构
 */

export const CONSOLE_API_OUT = "pricing-console-api.json";

/** "192k" / "1M" / "1000k" / "60" → 整数 */
export function parseCompactNumber(str) {
  if (str == null || str === "") return null;
  const s = String(str).trim();
  const m = s.match(/^([\d.]+)\s*([kKmM])?$/);
  if (!m) {
    const n = Number(s);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  const num = Number(m[1]);
  if (!Number.isFinite(num)) return null;
  const unit = (m[2] ?? "").toLowerCase();
  if (unit === "k") return Math.round(num * 1000);
  if (unit === "m") return Math.round(num * 1_000_000);
  return Math.round(num);
}

export function flattenModelLimits(modelSpec) {
  if (!modelSpec) return null;

  const maxInputTokens = modelSpec.MaxInputToken ?? null;
  const maxOutputTokens = modelSpec.MaxOutputToken ?? null;
  const contextWindow = modelSpec.ContextLength ?? null;
  const tpmRaw = modelSpec.TPM ?? null;
  const qpmRaw = modelSpec.QPM ?? null;

  return {
    /** 最大输入 Tokens（控制台原文，如 192k） */
    maxInputTokens,
    /** 最大输出 Tokens（控制台原文，如 128k） */
    maxOutputTokens,
    /** 上下文窗口（控制台原文，如 256k） */
    contextWindow,
    /** 最大 TPM（数值，如 1000000） */
    maxTpm: parseCompactNumber(tpmRaw),
    /** 最大 QPM（数值，如 60） */
    maxQpm: parseCompactNumber(qpmRaw),
    /** 原始 TPM 字符串（如 1000k），便于对照控制台 */
    maxTpmRaw: tpmRaw,
    /** 原始 QPM 字符串 */
    maxQpmRaw: qpmRaw,
    /** 最大输入 Tokens（数值） */
    maxInputTokensValue: parseCompactNumber(maxInputTokens),
    /** 最大输出 Tokens（数值） */
    maxOutputTokensValue: parseCompactNumber(maxOutputTokens),
    /** 上下文窗口（数值） */
    contextWindowValue: parseCompactNumber(contextWindow),
    concurrency: modelSpec.Concurrency ?? null,
    inputDescription: modelSpec.InputDescription ?? null,
  };
}

export function inferInputOutputTypes(model) {
  const tags = new Set(model.Tags ?? []);
  const modelType = model.ModelType ?? "";
  const chargeUnit = model.ModelChargingInfo?.[0]?.ChargeUnit ?? "";

  const input = new Set();
  const output = new Set();

  if (tags.has("图片生成") || chargeUnit === "PICTURE") {
    input.add("文本");
    input.add("图片");
    output.add("图片");
    return { input: [...input], output: [...output], source: "inferred" };
  }
  if (tags.has("视频生成")) {
    input.add("文本");
    input.add("图片");
    output.add("视频");
    return { input: [...input], output: [...output], source: "inferred" };
  }
  if (tags.has("3D生成")) {
    input.add("文本");
    input.add("图片");
    output.add("3D");
    return { input: [...input], output: [...output], source: "inferred" };
  }
  if (modelType === "Multimodal" || tags.has("视觉理解")) {
    input.add("图片");
    input.add("视频");
    output.add("文本");
    return { input: [...input], output: [...output], source: "inferred" };
  }

  input.add("文本");
  output.add("文本");
  if (tags.has("多模态理解")) {
    input.add("图片");
    input.add("视频");
  }

  return { input: [...input], output: [...output], source: "inferred" };
}

export function flattenModel(model) {
  const tiers = (model.ModelChargingInfo ?? []).map((tier) => {
    const items = (tier.ChargingItems ?? []).map((c) => ({
      name: c.PriceName,
      displayName: c.DisplayName,
      price: c.Price,
      unit: c.PriceUnit,
    }));
    const pick = (name) =>
      items.find((i) => i.name === name)?.price ??
      items.find((i) => i.displayName === name)?.price ??
      null;
    return {
      tierType: tier.Type,
      tierName: tier.Name,
      input: tier.InputPrice ?? pick("Input"),
      output: tier.OutputPrice ?? pick("Output"),
      cache: tier.CachePrice ?? pick("Cache"),
      unit: tier.InputOutputUnit ?? tier.ChargeUnit ?? null,
      items,
    };
  });

  return {
    modelId: model.ModelId,
    modelName: model.ModelName,
    displayName: model.DisplayName,
    brand: model.Brand,
    modelType: model.ModelType,
    status: model.Status,
    tags: model.Tags ?? [],
    /** 模型能力（控制台 Summary） */
    capability: model.Summary ?? null,
    /** 模型介绍（控制台 Description，较长） */
    description: model.Description ?? null,
    /** 输入输出类型（列表 API 无独立字段，按 ModelType/Tags/计费单位推断） */
    inputOutputTypes: inferInputOutputTypes(model),
    limits: flattenModelLimits(model.ModelSpec),
    regions: model.ModelAccessInfo?.ModelSiteRegions ?? null,
    tiers,
  };
}

export function mergeModelSetsFromPayloads(payloads) {
  const merged = new Map();
  const urls = [];
  for (const p of payloads) {
    if (!p.url?.includes("DescribeModelList")) continue;
    const set = p.json?.data?.data?.Response?.ModelSet;
    if (!Array.isArray(set)) continue;
    urls.push(p.url);
    for (const m of set) {
      if (m?.ModelId) merged.set(m.ModelId, m);
    }
  }
  return { urls, modelSet: [...merged.values()] };
}

export function buildConsoleApiResult({ payloads, scrapedAt, fromFile }) {
  const { urls, modelSet } = mergeModelSetsFromPayloads(payloads);
  if (!modelSet.length) return null;

  const models = modelSet.map(flattenModel);
  const pricingTierCount = models.reduce((n, m) => n + m.tiers.length, 0);

  return {
    source: "tencent_tokenhub_console_api",
    api: "DescribeModelList",
    apiUrl: urls[0]?.split("?")[0] ?? "https://console.cloud.tencent.com/cgi/capi",
    apiCaptureCount: urls.length,
    scrapedAt: scrapedAt ?? new Date().toISOString(),
    ...(fromFile ? { fromFile } : {}),
    modelCount: models.length,
    pricingTierCount,
    models,
  };
}
