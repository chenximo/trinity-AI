/** 供应商域 · 假数据（对齐详细设计 §4.4） */

export type SupplierPanelId = "list" | "profile" | "integration" | "probe" | "key-rotation";

export const SUPPLIER_PANEL_ORDER: SupplierPanelId[] = [
  "list",
  "profile",
  "integration",
  "probe",
  "key-rotation",
];

/** 供应商列表行（列表页 CRUD 与 `localStorage` 持久化对齐） */
export type SupplierListRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  health: string;
  region: string;
  updatedAt: string;
};

export const SUPPLIER_LIST_ROWS: SupplierListRow[] = [
  {
    id: "sp-001",
    name: "腾讯云",
    type: "API₂ 聚合",
    status: "正常",
    health: "99.92%",
    region: "cn-east",
    updatedAt: "2026-05-11 10:20",
  },
  {
    id: "sp-002",
    name: "火山引擎",
    type: "API₂ 聚合",
    status: "降级",
    health: "98.10%",
    region: "ap-southeast",
    updatedAt: "2026-05-11 10:18",
  },
  {
    id: "sp-003",
    name: "OpenAI 直连",
    type: "API₁",
    status: "正常",
    health: "99.70%",
    region: "us-west",
    updatedAt: "2026-05-11 09:55",
  },
];

export const SUPPLIER_PROFILE = {
  legalName: "深圳某某科技有限公司",
  taxId: "91440300XXXXXXXX",
  billingCycle: "月结 T+7",
  paymentTerms: "银行转账 · 人民币",
  contact: "商务 @zhang · zhang@example.com",
  remark: "与合同 Acme-2025-001 主体一致（mock）。",
};

export const SUPPLIER_INTEGRATION = {
  apiKind: "OpenAI 兼容（/v1/chat/completions）",
  baseUrl: "https://api.example-vendor.com/v1",
  profileRef: "profile/tencent-gpt4o-mini@v3",
  jsonRef: "s3://trinity-contracts/tencent/v3.json（占位）",
  timeoutMs: 45000,
  retryDefault: "幂等 2 次 · 指数退避",
  api2Note:
    "API₂：请求/响应 JSON 真源在契约中心；网关只做 Profile 选择与 Mapper 编排（原型仅文案占位）。",
};

/** 对接配置：输入 / 输出模板成对（列表 + 弹窗 Tab 编辑）；持久化见 suppliersInteractions */
export type IntegrationBindingRow = {
  id: string;
  /** 配置项显示名（如线路或 Profile 别名） */
  configName: string;
  inputName: string;
  inputJson: string;
  outputName: string;
  outputJson: string;
  updatedAt: string;
};

export const DEFAULT_INTEGRATION_BINDINGS: IntegrationBindingRow[] = [
  {
    id: "ib-001",
    configName: "chat · 腾讯云 A",
    inputName: "OpenAI 请求体映射入参",
    inputJson: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: "…" }] }, null, 2),
    outputName: "统一出参包装",
    outputJson: JSON.stringify({ id: "chatcmpl-mock", choices: [{ message: { role: "assistant", content: "…" } }] }, null, 2),
    updatedAt: "2026-05-11 11:02",
  },
  {
    id: "ib-002",
    configName: "embeddings · 火山",
    inputName: "向量请求模板",
    inputJson: JSON.stringify({ model: "text-embedding-3-small", input: ["a", "b"] }, null, 2),
    outputName: "向量数组出参",
    outputJson: JSON.stringify({ data: [{ embedding: [0.01, -0.02] }] }, null, 2),
    updatedAt: "2026-05-11 09:40",
  },
];

export const INTEGRATION_MODAL_TABS: { id: string; label: string }[] = [
  { id: "input", label: "输入模板" },
  { id: "output", label: "输出模板" },
];

export const SUPPLIER_PROBE_ROWS = [
  {
    id: "job-12",
    target: "腾讯云 · 线路 A · chat",
    lastRun: "2026-05-11 10:00",
    latency: "420ms",
    result: "成功",
    detail: "HTTP 200 · TLS 握手 38ms",
  },
  {
    id: "job-11",
    target: "火山 · 线路 B · embeddings",
    lastRun: "2026-05-11 09:45",
    latency: "—",
    result: "失败",
    detail: "连续 3 次 TLS timeout（mock）",
  },
];

export const SUPPLIER_KEY_ROTATION = {
  policy: "凭据 90 天滚动更新；新旧双发窗口 24h；网关侧热加载（占位）。",
  nextWindow: "2026-05-18 02:00–04:00 UTC+8",
  owner: "平台安全 @li",
};
