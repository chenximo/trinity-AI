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
  /** 绑定逻辑模型数（对齐后端 §4.2.2 · 工程期聚合） */
  modelCount: number;
  /** 可用供应线路数（对齐后端 §4.2.2） */
  routeCount: number;
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
    modelCount: 12,
    routeCount: 18,
    updatedAt: "2026-05-11 10:20",
  },
  {
    id: "sp-002",
    name: "火山引擎",
    type: "API₂ 聚合",
    status: "降级",
    health: "98.10%",
    region: "ap-southeast",
    modelCount: 8,
    routeCount: 11,
    updatedAt: "2026-05-11 10:18",
  },
  {
    id: "sp-003",
    name: "OpenAI 直连",
    type: "API₁",
    status: "正常",
    health: "99.70%",
    region: "us-west",
    modelCount: 5,
    routeCount: 6,
    updatedAt: "2026-05-11 09:55",
  },
];

/** 档案与结算（按供应商 ID；对齐详设 §4.4「档案与结算」） */
export type SupplierProfileRecord = {
  supplierId: string;
  legalName: string;
  /** 统一社会信用代码（可选） */
  taxId: string;
  billingCycle: string;
  paymentTerms: string;
  bankName: string;
  bankAccountMasked: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  /** 上游计量单位（对账用） */
  meteringUnit: string;
  contractRef: string;
  remark: string;
  updatedAt: string;
  updatedBy: string;
};

export function buildDefaultSupplierProfile(
  row: Pick<SupplierListRow, "id" | "name" | "type">,
): SupplierProfileRecord {
  const now = "2026-05-11 10:00";
  const byId: Record<string, Partial<SupplierProfileRecord>> = {
    "sp-001": {
      legalName: "深圳市腾讯计算机系统有限公司",
      taxId: "91440300708461136T",
      billingCycle: "月结 T+7",
      paymentTerms: "银行转账 · 人民币 · 对公账户",
      bankName: "招商银行深圳分行",
      bankAccountMasked: "**** **** **** 8821",
      contactName: "张商务",
      contactEmail: "zhang.vendor@example.com",
      contactPhone: "+86 755-8601-xxxx",
      meteringUnit: "token（输入+输出分开计量）",
      contractRef: "Acme-2025-TENCENT-001",
      remark: "主供应线路在 cn-east；与模型刊例季度对账。",
      updatedAt: "2026-05-11 10:20",
      updatedBy: "ops_admin",
    },
    "sp-002": {
      legalName: "北京火山引擎科技有限公司",
      taxId: "91110108MA01xxxxxx",
      billingCycle: "月结 T+15",
      paymentTerms: "银行转账 · 美元结算可选",
      bankName: "工商银行北京海淀支行",
      bankAccountMasked: "**** **** **** 3309",
      contactName: "李对接",
      contactEmail: "li.volc@example.com",
      contactPhone: "+86 10-5xxx-xxxx",
      meteringUnit: "request + token 混合",
      contractRef: "Acme-2025-VOLC-002",
      remark: "当前线路降级中，结算按实际成功请求计。",
      updatedAt: "2026-05-11 10:18",
      updatedBy: "finance_viewer",
    },
    "sp-003": {
      legalName: "OpenAI, L.L.C.",
      taxId: "—（境外主体）",
      billingCycle: "预付 + 月度补差",
      paymentTerms: "信用卡自动扣款 · USD",
      bankName: "—",
      bankAccountMasked: "—",
      contactName: "Vendor Success",
      contactEmail: "enterprise@openai.com",
      contactPhone: "—",
      meteringUnit: "token",
      contractRef: "Acme-2025-OAI-DIRECT",
      remark: "API₁ 直连；法务主体与云转售合同分轨管理。",
      updatedAt: "2026-05-11 09:55",
      updatedBy: "ops_admin",
    },
  };
  const seed = byId[row.id] ?? {};
  return {
    supplierId: row.id,
    legalName: seed.legalName ?? row.name,
    taxId: seed.taxId ?? "",
    billingCycle: seed.billingCycle ?? "月结 T+30",
    paymentTerms: seed.paymentTerms ?? "银行转账",
    bankName: seed.bankName ?? "—",
    bankAccountMasked: seed.bankAccountMasked ?? "—",
    contactName: seed.contactName ?? "待补充",
    contactEmail: seed.contactEmail ?? "",
    contactPhone: seed.contactPhone ?? "",
    meteringUnit: seed.meteringUnit ?? "token",
    contractRef: seed.contractRef ?? "—",
    remark: seed.remark ?? `${row.type} · 原型默认档案。`,
    updatedAt: seed.updatedAt ?? now,
    updatedBy: seed.updatedBy ?? "system",
  };
}

export const SUPPLIER_PROFILE_SEEDS: SupplierProfileRecord[] = SUPPLIER_LIST_ROWS.map((row) =>
  buildDefaultSupplierProfile(row),
);

/** @deprecated 使用按户 `SupplierProfileRecord` */
export const SUPPLIER_PROFILE = {
  legalName: SUPPLIER_PROFILE_SEEDS[0]?.legalName ?? "",
  taxId: SUPPLIER_PROFILE_SEEDS[0]?.taxId ?? "",
  billingCycle: SUPPLIER_PROFILE_SEEDS[0]?.billingCycle ?? "",
  paymentTerms: SUPPLIER_PROFILE_SEEDS[0]?.paymentTerms ?? "",
  contact: SUPPLIER_PROFILE_SEEDS[0]
    ? `${SUPPLIER_PROFILE_SEEDS[0].contactName} · ${SUPPLIER_PROFILE_SEEDS[0].contactEmail}`
    : "",
  remark: SUPPLIER_PROFILE_SEEDS[0]?.remark ?? "",
};

/** 网关对接默认参数（按供应商；对齐详设 §4.4 对接配置） */
export type SupplierGatewayRecord = {
  supplierId: string;
  apiKind: string;
  baseUrl: string;
  profileRef: string;
  jsonRef: string;
  timeoutMs: number;
  retryDefault: string;
  updatedAt: string;
  updatedBy: string;
};

export function buildDefaultSupplierGateway(
  row: Pick<SupplierListRow, "id" | "name" | "type">,
): SupplierGatewayRecord {
  const now = "2026-05-11 10:00";
  const byId: Record<string, Partial<SupplierGatewayRecord>> = {
    "sp-001": {
      apiKind: "OpenAI 兼容（/v1/chat/completions）",
      baseUrl: "https://api.tencentcloudapi.com/v1",
      profileRef: "profile/tencent-gpt4o-mini@v3",
      jsonRef: "s3://trinity-contracts/tencent/v3.json",
      timeoutMs: 45000,
      retryDefault: "幂等 2 次 · 指数退避",
    },
    "sp-002": {
      apiKind: "OpenAI 兼容（/v1/chat/completions）",
      baseUrl: "https://open.volcengineapi.com/v1",
      profileRef: "profile/volc-embed-v2@v1",
      jsonRef: "s3://trinity-contracts/volc/v2.json",
      timeoutMs: 60000,
      retryDefault: "幂等 1 次 · 固定间隔",
    },
    "sp-003": {
      apiKind: "OpenAI 兼容（/v1/chat/completions）",
      baseUrl: "https://api.openai.com/v1",
      profileRef: "profile/openai-direct@v1",
      jsonRef: "s3://trinity-contracts/openai/v1.json",
      timeoutMs: 120000,
      retryDefault: "幂等 2 次 · 指数退避",
    },
  };
  const seed = byId[row.id] ?? {};
  return {
    supplierId: row.id,
    apiKind: seed.apiKind ?? "OpenAI 兼容（/v1/chat/completions）",
    baseUrl: seed.baseUrl ?? "https://api.example-vendor.com/v1",
    profileRef: seed.profileRef ?? `profile/${row.id}@v1`,
    jsonRef: seed.jsonRef ?? `s3://trinity-contracts/${row.id}/v1.json`,
    timeoutMs: seed.timeoutMs ?? 45000,
    retryDefault: seed.retryDefault ?? "幂等 2 次 · 指数退避",
    updatedAt: seed.updatedAt ?? now,
    updatedBy: seed.updatedBy ?? "system",
  };
}

export const SUPPLIER_GATEWAY_SEEDS: SupplierGatewayRecord[] = SUPPLIER_LIST_ROWS.map((row) =>
  buildDefaultSupplierGateway(row),
);

/** @deprecated 使用 `SupplierGatewayRecord` + `buildDefaultSupplierGateway` */
export const SUPPLIER_INTEGRATION = {
  apiKind: SUPPLIER_GATEWAY_SEEDS[0]?.apiKind ?? "",
  baseUrl: SUPPLIER_GATEWAY_SEEDS[0]?.baseUrl ?? "",
  profileRef: SUPPLIER_GATEWAY_SEEDS[0]?.profileRef ?? "",
  jsonRef: SUPPLIER_GATEWAY_SEEDS[0]?.jsonRef ?? "",
  timeoutMs: SUPPLIER_GATEWAY_SEEDS[0]?.timeoutMs ?? 45000,
  retryDefault: SUPPLIER_GATEWAY_SEEDS[0]?.retryDefault ?? "",
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

/** 连通性拨测任务行（按供应商过滤 · 见 suppliersInteractions） */
export type SupplierProbeRow = {
  id: string;
  supplierId: string;
  target: string;
  lastRun: string;
  latency: string;
  result: string;
  detail: string;
};

export const SUPPLIER_PROBE_ROWS: SupplierProbeRow[] = [
  {
    id: "job-12",
    supplierId: "sp-001",
    target: "腾讯云 · 线路 A · chat",
    lastRun: "2026-05-11 10:00",
    latency: "420ms",
    result: "成功",
    detail: "HTTP 200 · TLS 握手 38ms",
  },
  {
    id: "job-11",
    supplierId: "sp-002",
    target: "火山引擎 · 线路 B · embeddings",
    lastRun: "2026-05-11 09:45",
    latency: "—",
    result: "失败",
    detail: "连续 3 次 TLS timeout（mock）",
  },
  {
    id: "job-10",
    supplierId: "sp-003",
    target: "OpenAI 直连 · 线路 C · chat",
    lastRun: "2026-05-11 09:30",
    latency: "310ms",
    result: "成功",
    detail: "HTTP 200 · TLS 握手 22ms",
  },
];

/** @deprecated 使用 SupplierRotationPolicy */
export const SUPPLIER_KEY_ROTATION = {
  policy: "凭据 90 天滚动更新；新旧双发窗口 24h；网关侧热加载（占位）。",
  nextWindow: "2026-05-18 02:00–04:00 UTC+8",
  owner: "平台安全 @li",
};

/** 按供应商轮换策略（对齐详设 §4.4 密钥轮换策略） */
export type SupplierRotationPolicy = {
  supplierId: string;
  rotationDays: number;
  dualKeyWindowHours: number;
  notifyChannels: string;
  kmsMode: string;
  owner: string;
  nextWindow: string;
  remark: string;
  updatedAt: string;
  updatedBy: string;
};

export type SupplierRotationEventRow = {
  id: string;
  supplierId: string;
  windowLabel: string;
  scheduledAt: string;
  status: string;
  platformKeyRef: string;
  detail: string;
};

export function buildDefaultSupplierRotationPolicy(
  row: Pick<SupplierListRow, "id" | "name">,
): SupplierRotationPolicy {
  const byId: Record<string, Partial<SupplierRotationPolicy>> = {
    "sp-001": {
      rotationDays: 90,
      dualKeyWindowHours: 24,
      notifyChannels: "邮件 · 企业微信 · PagerDuty",
      kmsMode: "网关心跳热加载",
      nextWindow: "2026-05-18 02:00–04:00 UTC+8",
      remark: "与腾讯云控制台轮换窗口对齐；双发期网关同时接受新旧 Key。",
    },
    "sp-002": {
      rotationDays: 60,
      dualKeyWindowHours: 12,
      notifyChannels: "邮件 · 企业微信",
      kmsMode: "KMS 托管同步",
      nextWindow: "2026-05-22 01:00–03:00 UTC+8",
      remark: "火山侧建议 60 天；降级线路不参与自动轮换。",
    },
    "sp-003": {
      rotationDays: 90,
      dualKeyWindowHours: 24,
      notifyChannels: "邮件",
      kmsMode: "手动登记 + 平台密钥",
      nextWindow: "2026-05-25 03:00–05:00 UTC+8",
      remark: "OpenAI 直连凭据在平台密钥维护；本页仅治理说明与窗口公示。",
    },
  };
  const seed = byId[row.id] ?? {};
  return {
    supplierId: row.id,
    rotationDays: seed.rotationDays ?? 90,
    dualKeyWindowHours: seed.dualKeyWindowHours ?? 24,
    notifyChannels: seed.notifyChannels ?? "邮件",
    kmsMode: seed.kmsMode ?? "网关心跳热加载",
    owner: seed.owner ?? "平台安全 @li",
    nextWindow: seed.nextWindow ?? "待排期",
    remark: seed.remark ?? `${row.name} 轮换策略待补充。`,
    updatedAt: seed.updatedAt ?? "2026-05-11 10:00",
    updatedBy: seed.updatedBy ?? "system",
  };
}

export const SUPPLIER_ROTATION_POLICY_SEEDS: SupplierRotationPolicy[] = SUPPLIER_LIST_ROWS.map((row) =>
  buildDefaultSupplierRotationPolicy(row),
);

export const SUPPLIER_ROTATION_EVENT_SEEDS: SupplierRotationEventRow[] = [
  {
    id: "rot-101",
    supplierId: "sp-001",
    windowLabel: "2026-Q2 例行轮换",
    scheduledAt: "2026-05-18 02:00",
    status: "计划中",
    platformKeyRef: "腾讯生产 Key（pk-tc-prod）",
    detail: "窗口内完成双发切换；值班 @ops",
  },
  {
    id: "rot-102",
    supplierId: "sp-001",
    windowLabel: "2026-Q1 例行轮换",
    scheduledAt: "2026-02-12 02:00",
    status: "已完成",
    platformKeyRef: "腾讯生产 Key（pk-tc-prod）",
    detail: "HTTP 200 验证通过 · 无业务告警",
  },
  {
    id: "rot-201",
    supplierId: "sp-002",
    windowLabel: "火山备路 Key 轮换",
    scheduledAt: "2026-05-22 01:00",
    status: "计划中",
    platformKeyRef: "火山备路 Key（pk-volc-b）",
    detail: "主路不参与；仅备路凭据",
  },
  {
    id: "rot-301",
    supplierId: "sp-003",
    windowLabel: "OpenAI 直连轮换",
    scheduledAt: "2026-05-25 03:00",
    status: "计划中",
    platformKeyRef: "OpenAI 直连 Key（pk-oai-1）",
    detail: "需在平台密钥页完成明文轮换后登记",
  },
];
