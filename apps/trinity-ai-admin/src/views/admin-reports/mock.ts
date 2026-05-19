/** 报表中心 · 假数据（对齐详细设计 §4.10） */

export const REPORT_PANEL_ORDER = ["preset", "olap", "export", "subscribe"] as const;
export type ReportPanelId = (typeof REPORT_PANEL_ORDER)[number];

export const REPORT_PRESET_ROWS = [
  { id: "rpt-usage", name: "用量与消耗", period: "近 7 日", owner: "财务组", updatedAt: "2026-05-18 09:00" },
  { id: "rpt-rev", name: "收入试算", period: "本月", owner: "运营组", updatedAt: "2026-05-17 16:20" },
];

export const REPORT_EXPORT_ROWS = [
  { id: "exp-001", name: "用量明细导出", applicant: "zhang.san", status: "已完成", createdAt: "2026-05-18 08:10" },
  { id: "exp-002", name: "客户 Acme 包", applicant: "li.si", status: "处理中", createdAt: "2026-05-17 14:00" },
];

/** 多维分析 · 可选维度（行/列分组） */
export const REPORT_OLAP_DIMENSIONS = [
  { id: "date", label: "时间" },
  { id: "tenant", label: "客户" },
  { id: "model", label: "模型" },
  { id: "line", label: "供应商线路" },
] as const;

export type ReportOlapDimensionId = (typeof REPORT_OLAP_DIMENSIONS)[number]["id"];

/** 多维分析 · 可选指标 */
export const REPORT_OLAP_METRICS = [
  { id: "requests", label: "请求次数" },
  { id: "tokensIn", label: "入向 Token" },
  { id: "tokensOut", label: "出向 Token" },
  { id: "costCny", label: "预估消耗（¥）" },
] as const;

export type ReportOlapMetricId = (typeof REPORT_OLAP_METRICS)[number]["id"];

export type ReportOlapGrain = "day" | "week" | "month";

export type ReportOlapFactRow = {
  date: string;
  tenantId: string;
  tenantName: string;
  modelId: string;
  modelName: string;
  supplyLineId: string;
  supplierName: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  costCny: number;
};

/** 日粒度事实表（原型；工程期接 usage_event / 数仓） */
export const REPORT_OLAP_FACT_ROWS: ReportOlapFactRow[] = [
  {
    date: "2026-05-12",
    tenantId: "t-acme",
    tenantName: "Acme",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini",
    supplyLineId: "sr-101",
    supplierName: "腾讯云",
    requests: 18_200,
    tokensIn: 9_200_000,
    tokensOut: 1_400_000,
    costCny: 14.2,
  },
  {
    date: "2026-05-12",
    tenantId: "t-acme",
    tenantName: "Acme",
    modelId: "lm-deepseek-v3",
    modelName: "DeepSeek V3",
    supplyLineId: "sr-201",
    supplierName: "DeepSeek 官方",
    requests: 9_800,
    tokensIn: 4_100_000,
    tokensOut: 890_000,
    costCny: 8.6,
  },
  {
    date: "2026-05-13",
    tenantId: "t-acme",
    tenantName: "Acme",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini",
    supplyLineId: "sr-102",
    supplierName: "OpenAI 直连",
    requests: 6_400,
    tokensIn: 2_800_000,
    tokensOut: 520_000,
    costCny: 6.1,
  },
  {
    date: "2026-05-13",
    tenantId: "t-beta",
    tenantName: "Beta Lab",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini",
    supplyLineId: "sr-101",
    supplierName: "腾讯云",
    requests: 4_200,
    tokensIn: 1_900_000,
    tokensOut: 310_000,
    costCny: 3.2,
  },
  {
    date: "2026-05-14",
    tenantId: "t-beta",
    tenantName: "Beta Lab",
    modelId: "lm-deepseek-v3",
    modelName: "DeepSeek V3",
    supplyLineId: "sr-202",
    supplierName: "火山引擎",
    requests: 11_500,
    tokensIn: 5_600_000,
    tokensOut: 1_200_000,
    costCny: 9.8,
  },
  {
    date: "2026-05-14",
    tenantId: "t-gamma",
    tenantName: "Gamma",
    modelId: "lm-embed-3-small",
    modelName: "Embedding 3 Small",
    supplyLineId: "sr-301",
    supplierName: "火山引擎",
    requests: 22_000,
    tokensIn: 12_000_000,
    tokensOut: 0,
    costCny: 4.5,
  },
  {
    date: "2026-05-15",
    tenantId: "t-acme",
    tenantName: "Acme",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini",
    supplyLineId: "sr-101",
    supplierName: "腾讯云",
    requests: 21_300,
    tokensIn: 10_800_000,
    tokensOut: 1_650_000,
    costCny: 16.8,
  },
  {
    date: "2026-05-15",
    tenantId: "t-gamma",
    tenantName: "Gamma",
    modelId: "lm-deepseek-v3",
    modelName: "DeepSeek V3",
    supplyLineId: "sr-201",
    supplierName: "DeepSeek 官方",
    requests: 7_600,
    tokensIn: 3_200_000,
    tokensOut: 720_000,
    costCny: 6.9,
  },
  {
    date: "2026-05-16",
    tenantId: "t-beta",
    tenantName: "Beta Lab",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini",
    supplyLineId: "sr-101",
    supplierName: "腾讯云",
    requests: 5_900,
    tokensIn: 2_400_000,
    tokensOut: 480_000,
    costCny: 4.1,
  },
  {
    date: "2026-05-17",
    tenantId: "t-acme",
    tenantName: "Acme",
    modelId: "lm-deepseek-v3",
    modelName: "DeepSeek V3",
    supplyLineId: "sr-202",
    supplierName: "火山引擎",
    requests: 8_100,
    tokensIn: 4_800_000,
    tokensOut: 1_050_000,
    costCny: 7.4,
  },
  {
    date: "2026-05-18",
    tenantId: "t-gamma",
    tenantName: "Gamma",
    modelId: "lm-gpt-4o-mini",
    modelName: "GPT-4o mini",
    supplyLineId: "sr-102",
    supplierName: "OpenAI 直连",
    requests: 3_300,
    tokensIn: 1_500_000,
    tokensOut: 290_000,
    costCny: 3.0,
  },
];

export const REPORT_OLAP_TENANT_OPTIONS = [
  { value: "", label: "全部客户" },
  ...[...new Set(REPORT_OLAP_FACT_ROWS.map((r) => r.tenantId))].map((id) => {
    const row = REPORT_OLAP_FACT_ROWS.find((r) => r.tenantId === id);
    return { value: id, label: row?.tenantName ?? id };
  }),
];

export const REPORT_OLAP_MODEL_OPTIONS = [
  { value: "", label: "全部模型" },
  ...[...new Set(REPORT_OLAP_FACT_ROWS.map((r) => r.modelId))].map((id) => {
    const row = REPORT_OLAP_FACT_ROWS.find((r) => r.modelId === id);
    return { value: id, label: row?.modelName ?? id };
  }),
];
