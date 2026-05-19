/** 模型管理域 · 假数据（对齐详细设计 §4.5 / §4.5.1） */

export type ModelPanelId = "list" | "master" | "lines" | "bindings" | "pricing";

export const MODEL_PANEL_ORDER: ModelPanelId[] = ["list", "master", "lines", "bindings", "pricing"];

export type RouteBindingRow = {
  id: string;
  modelId: string;
  modelName: string;
  routeName: string;
  platformKeyLabel: string;
  priority: number;
  enabled: boolean;
  updatedAt: string;
};

export const MODEL_BINDING_ROWS: RouteBindingRow[] = [
  {
    id: "bind-1",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini（平台）",
    routeName: "cn-tencent-a",
    platformKeyLabel: "腾讯生产 Key",
    priority: 1,
    enabled: true,
    updatedAt: "2026-05-11 10:05",
  },
  {
    id: "bind-2",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini（平台）",
    routeName: "cn-volc-b",
    platformKeyLabel: "火山备路 Key",
    priority: 2,
    enabled: true,
    updatedAt: "2026-05-11 09:50",
  },
];

export type ModelListRow = {
  id: string;
  displayName: string;
  apiKind: string;
  shelf: string;
  routeCount: number;
  updatedAt: string;
};

export const MODEL_LIST_ROWS: ModelListRow[] = [
  {
    id: "lm-gpt-4o-mini",
    displayName: "GPT-4o mini（平台）",
    apiKind: "API₂",
    shelf: "上架",
    routeCount: 3,
    updatedAt: "2026-05-11 10:05",
  },
  {
    id: "lm-deepseek-v3",
    displayName: "DeepSeek V3",
    apiKind: "API₁",
    shelf: "灰度",
    routeCount: 2,
    updatedAt: "2026-05-11 09:50",
  },
  {
    id: "lm-embed-3-small",
    displayName: "Text Embedding 3 Small",
    apiKind: "API₂",
    shelf: "下架",
    routeCount: 1,
    updatedAt: "2026-05-10 18:00",
  },
];

/** 逻辑模型主数据（详设 §4.5「主数据」） */
export type ModelMasterRecord = {
  modelId: string;
  displayName: string;
  contextWindow: string;
  capabilities: string;
  docAnchor: string;
  api1Vendor: string;
  remark: string;
  updatedAt: string;
  updatedBy: string;
};

export function buildDefaultModelMaster(row: ModelListRow): ModelMasterRecord {
  const byId: Record<string, Partial<ModelMasterRecord>> = {
    "lm-gpt-4o-mini": {
      contextWindow: "128k tokens",
      capabilities: "工具调用 · JSON mode · 流式",
      docAnchor: "docs/models/gpt-4o-mini",
      api1Vendor: "OpenAI（原生契约，API₁）",
      remark: "云侧 API₂ 线路与原生 API₁ 契约分表维护；语义见设计文档 §4.5.1。",
    },
    "lm-deepseek-v3": {
      contextWindow: "64k tokens",
      capabilities: "工具调用 · 流式 · 长上下文",
      docAnchor: "docs/models/deepseek-v3",
      api1Vendor: "DeepSeek（原生契约，API₁）",
      remark: "主用 API₁ 官方线路；API₂ 火山为备路。",
    },
    "lm-embed-3-small": {
      contextWindow: "8k tokens（向量）",
      capabilities: "embedding · 批量",
      docAnchor: "docs/models/text-embedding-3-small",
      api1Vendor: "OpenAI（向量契约，API₁）",
      remark: "仅向量能力；chat 线路不适用。",
    },
  };
  const seed = byId[row.id] ?? {};
  return {
    modelId: row.id,
    displayName: seed.displayName ?? row.displayName,
    contextWindow: seed.contextWindow ?? "—",
    capabilities: seed.capabilities ?? "—",
    docAnchor: seed.docAnchor ?? `docs/models/${row.id}`,
    api1Vendor: seed.api1Vendor ?? "—",
    remark: seed.remark ?? "",
    updatedAt: seed.updatedAt ?? row.updatedAt,
    updatedBy: seed.updatedBy ?? "system",
  };
}

export const MODEL_MASTER_SEEDS: ModelMasterRecord[] = MODEL_LIST_ROWS.map((row) =>
  buildDefaultModelMaster(row),
);

/** @deprecated 使用 `ModelMasterRecord` */
export const MODEL_MASTER_SAMPLE = {
  logicalId: MODEL_MASTER_SEEDS[0]?.modelId ?? "",
  displayName: MODEL_MASTER_SEEDS[0]?.displayName ?? "",
  contextWindow: MODEL_MASTER_SEEDS[0]?.contextWindow ?? "",
  capabilities: MODEL_MASTER_SEEDS[0]?.capabilities ?? "",
  docAnchor: MODEL_MASTER_SEEDS[0]?.docAnchor ?? "",
  api1Vendor: MODEL_MASTER_SEEDS[0]?.api1Vendor ?? "",
  remark: MODEL_MASTER_SEEDS[0]?.remark ?? "",
};

export type ModelSupplyLineRow = {
  id: string;
  /** 绑定的逻辑模型 ID（列表按供应商筛选用） */
  modelId: string;
  priority: number;
  channel: string;
  supplier: string;
  upstreamModelId: string;
  profileRef: string;
  region: string;
  costRef: string;
  /** 最近线路探测（示意） */
  lastProbeAt: string;
  probeResult: string;
  probeDetail: string;
  updatedAt: string;
};

export const MODEL_SUPPLY_LINE_ROWS: ModelSupplyLineRow[] = [
  {
    id: "sr-101",
    modelId: "lm-gpt-4o-mini",
    priority: 1,
    channel: "API₂",
    supplier: "腾讯云",
    upstreamModelId: "gpt-4o-mini",
    profileRef: "profile/tencent-gpt4o-mini@v2",
    region: "cn-east",
    costRef: "¥0.42 / 1M in",
    lastProbeAt: "2026-05-11 09:00",
    probeResult: "成功",
    probeDetail: "HTTP 200 · 420ms",
    updatedAt: "2026-05-11 08:12",
  },
  {
    id: "sr-102",
    modelId: "lm-gpt-4o-mini",
    priority: 2,
    channel: "API₁",
    supplier: "OpenAI 直连",
    upstreamModelId: "gpt-4o-mini",
    profileRef: "profile/openai-official@v1",
    region: "us-west",
    costRef: "内部成本表 #IC-8841",
    lastProbeAt: "2026-05-10 16:40",
    probeResult: "成功",
    probeDetail: "HTTP 200 · 310ms",
    updatedAt: "2026-05-10 16:40",
  },
  {
    id: "sr-201",
    modelId: "lm-deepseek-v3",
    priority: 1,
    channel: "API₁",
    supplier: "DeepSeek 官方",
    upstreamModelId: "deepseek-chat",
    profileRef: "profile/deepseek-v3@v1",
    region: "cn-north",
    costRef: "内部成本表 #IC-9012",
    lastProbeAt: "—",
    probeResult: "—",
    probeDetail: "尚未探测",
    updatedAt: "2026-05-11 09:00",
  },
  {
    id: "sr-202",
    modelId: "lm-deepseek-v3",
    priority: 2,
    channel: "API₂",
    supplier: "火山引擎",
    upstreamModelId: "deepseek-v3",
    profileRef: "profile/volc-deepseek@v1",
    region: "cn-beijing",
    costRef: "¥0.55 / 1M in",
    lastProbeAt: "2026-05-10 20:10",
    probeResult: "失败",
    probeDetail: "TLS timeout（mock）",
    updatedAt: "2026-05-10 20:10",
  },
  {
    id: "sr-301",
    modelId: "lm-embed-3-small",
    priority: 1,
    channel: "API₂",
    supplier: "火山引擎",
    upstreamModelId: "text-embedding-3-small",
    profileRef: "profile/volc-embed@v2",
    region: "cn-beijing",
    costRef: "¥0.08 / 1M tokens",
    lastProbeAt: "2026-05-10 18:00",
    probeResult: "成功",
    probeDetail: "HTTP 200 · 180ms",
    updatedAt: "2026-05-10 18:00",
  },
];

/** 供应线路中出现的供应商名（供列表筛选下拉） */
export function getModelSupplierFilterOptions(): string[] {
  return [...new Set(MODEL_SUPPLY_LINE_ROWS.map((l) => l.supplier))].sort();
}

/** 某逻辑模型是否绑定指定供应商线路 */
export function modelHasSupplierLine(modelId: string, supplier: string): boolean {
  return MODEL_SUPPLY_LINE_ROWS.some((l) => l.modelId === modelId && l.supplier === supplier);
}

/** 刊例与成本（详设 §4.5；与套餐 SKU、供应线路成本联动） */
export type ModelPricingRow = {
  id: string;
  modelId: string;
  /** 关联供应线路 `id`，用于跳转 lines */
  supplyLineId: string;
  sku: string;
  listPrice: string;
  internalCost: string;
  effectiveFrom: string;
  note: string;
  updatedAt: string;
};

export const DEFAULT_MODEL_PRICING_ROWS: ModelPricingRow[] = [
  {
    id: "pr-101",
    modelId: "lm-gpt-4o-mini",
    supplyLineId: "sr-101",
    sku: "SKU-G4OM-IN",
    listPrice: "¥1.20 / 1M tokens（入）",
    internalCost: "¥0.42",
    effectiveFrom: "2026-05-01",
    note: "与线路 sr-101 成本对齐",
    updatedAt: "2026-05-11 10:00",
  },
  {
    id: "pr-102",
    modelId: "lm-gpt-4o-mini",
    supplyLineId: "sr-101",
    sku: "SKU-G4OM-OUT",
    listPrice: "¥4.80 / 1M tokens（出）",
    internalCost: "¥1.60",
    effectiveFrom: "2026-05-01",
    note: "刊例可独立于成本调整",
    updatedAt: "2026-05-11 10:00",
  },
  {
    id: "pr-103",
    modelId: "lm-gpt-4o-mini",
    supplyLineId: "sr-102",
    sku: "SKU-G4OM-IN-OAI",
    listPrice: "¥1.35 / 1M tokens（入）",
    internalCost: "¥0.48",
    effectiveFrom: "2026-04-15",
    note: "OpenAI 直连备路刊例",
    updatedAt: "2026-05-10 16:40",
  },
  {
    id: "pr-201",
    modelId: "lm-deepseek-v3",
    supplyLineId: "sr-201",
    sku: "SKU-DS-IN",
    listPrice: "¥0.90 / 1M tokens（入）",
    internalCost: "¥0.55",
    effectiveFrom: "2026-05-08",
    note: "与火山线路成本参考一致",
    updatedAt: "2026-05-11 09:00",
  },
  {
    id: "pr-202",
    modelId: "lm-deepseek-v3",
    supplyLineId: "sr-201",
    sku: "SKU-DS-OUT",
    listPrice: "¥2.40 / 1M tokens（出）",
    internalCost: "¥0.95",
    effectiveFrom: "2026-05-08",
    note: "灰度客户沿用 v1 刊例",
    updatedAt: "2026-05-11 09:00",
  },
  {
    id: "pr-203",
    modelId: "lm-deepseek-v3",
    supplyLineId: "sr-202",
    sku: "SKU-DS-IN-VOLC",
    listPrice: "¥0.85 / 1M tokens（入）",
    internalCost: "¥0.55",
    effectiveFrom: "2026-05-01",
    note: "线路 sr-202",
    updatedAt: "2026-05-10 20:10",
  },
  {
    id: "pr-301",
    modelId: "lm-embed-3-small",
    supplyLineId: "sr-301",
    sku: "SKU-EMB-3S",
    listPrice: "¥0.08 / 1M tokens",
    internalCost: "¥0.03",
    effectiveFrom: "2026-04-01",
    note: "Embedding 统一定价",
    updatedAt: "2026-05-10 18:00",
  },
  {
    id: "pr-302",
    modelId: "lm-embed-3-small",
    supplyLineId: "sr-301",
    sku: "SKU-EMB-3S-BATCH",
    listPrice: "¥0.05 / 1M tokens（批）",
    internalCost: "¥0.02",
    effectiveFrom: "2026-05-01",
    note: "批量调用折扣档",
    updatedAt: "2026-05-10 18:00",
  },
];

/** @deprecated 使用 `DEFAULT_MODEL_PRICING_ROWS` */
export const MODEL_PRICING_ROWS = DEFAULT_MODEL_PRICING_ROWS;
