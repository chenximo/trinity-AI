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

/** 主数据页：单条示意逻辑模型 */
export const MODEL_MASTER_SAMPLE = {
  logicalId: "lm-gpt-4o-mini",
  displayName: "GPT-4o mini（平台）",
  contextWindow: "128k tokens",
  capabilities: "工具调用 · JSON mode · 流式",
  docAnchor: "docs/models/gpt-4o-mini（占位）",
  api1Vendor: "OpenAI（原生契约，API₁）",
  remark: "云侧 API₂ 线路与原生 API₁ 契约分表维护；语义见设计文档 **§4.5.1**（无独立子页）。",
};

export type ModelSupplyLineRow = {
  id: string;
  priority: number;
  channel: string;
  supplier: string;
  upstreamModelId: string;
  profileRef: string;
  region: string;
  costRef: string;
  updatedAt: string;
};

export const MODEL_SUPPLY_LINE_ROWS: ModelSupplyLineRow[] = [
  {
    id: "sr-101",
    priority: 1,
    channel: "API₂",
    supplier: "腾讯云",
    upstreamModelId: "gpt-4o-mini",
    profileRef: "profile/tencent-gpt4o-mini@v2",
    region: "cn-east",
    costRef: "¥0.42 / 1M in",
    updatedAt: "2026-05-11 08:12",
  },
  {
    id: "sr-102",
    priority: 2,
    channel: "API₁",
    supplier: "OpenAI 直连",
    upstreamModelId: "gpt-4o-mini",
    profileRef: "profile/openai-official@v1",
    region: "us-west",
    costRef: "内部成本表 #IC-8841",
    updatedAt: "2026-05-10 16:40",
  },
];

export const MODEL_PRICING_ROWS = [
  { sku: "SKU-G4OM-IN", listPrice: "¥1.20 / 1M tokens（入）", internalCost: "¥0.42", note: "与线路 sr-101 对齐" },
  { sku: "SKU-G4OM-OUT", listPrice: "¥4.80 / 1M tokens（出）", internalCost: "¥1.60", note: "刊例可独立于成本调整" },
];
