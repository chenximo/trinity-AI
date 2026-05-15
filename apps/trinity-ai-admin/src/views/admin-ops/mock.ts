/** 监控与运维 · 假数据（对齐详细设计 §4.2） */

/** 原型 v1：仅保留「实时大盘」；其余子页后续批次再开。 */
export type OpsTabId = "live";

export const OPS_TABS: { id: OpsTabId; label: string }[] = [{ id: "live", label: "实时大盘" }];

export const OPS_SUMMARY = {
  windowLabel: "最近 1 小时",
  qps: "2.84k",
  errRate: "0.38%",
  p99: "890 ms",
  updatedAt: "2026-05-11 14:32:08",
};

export const OPS_SERIES_POINTS = [
  { t: "14:00", qps: 2100, err: 0.4 },
  { t: "14:10", qps: 2600, err: 0.35 },
  { t: "14:20", qps: 3200, err: 0.42 },
  { t: "14:30", qps: 2800, err: 0.38 },
];

export const OPS_ERROR_TOP = [
  { code: "429", route: "/v1/chat/completions", line: "腾讯云 · gpt-4o-mini", count: 1280, pct: "41%" },
  { code: "504", route: "/v1/embeddings", line: "火山 · text-embedding-3", count: 420, pct: "13%" },
  { code: "400", route: "/v1/messages", line: "直连 · claude-3-5", count: 310, pct: "10%" },
];

export const OPS_LATENCY_TOP = [
  { dim: "客户 Acme", p95: "1.2s", note: "长上下文占比高" },
  { dim: "线路 火山-B", p95: "980ms", note: "区域 ap-southeast" },
  { dim: "模型 claude-3-5", p95: "760ms", note: "全平台均值上方" },
];

export const OPS_SUPPLIER_HEALTH = [
  { name: "腾讯云", line: "线路 A", ok: "99.92%", p95: "420ms", cap: "62%", status: "正常" },
  { name: "火山引擎", line: "线路 B", ok: "98.10%", p95: "890ms", cap: "88%", status: "降级中" },
  { name: "OpenAI 直连", line: "线路 O1", ok: "99.70%", p95: "510ms", cap: "35%", status: "正常" },
];

export const OPS_ALERT_RULES = [
  {
    name: "错误率突增",
    cond: "5m 窗口错误率 > 1%",
    channel: "企业微信 + 邮件",
    silent: "10m",
    on: true,
  },
  {
    name: "线路连续失败",
    cond: "同一线路 5 次连续 5xx",
    channel: "仅 on-call",
    silent: "5m",
    on: true,
  },
  {
    name: "P99 延迟",
    cond: "P99 > 3s 持续 3m",
    channel: "邮件",
    silent: "30m",
    on: false,
  },
];

export const OPS_MAINTENANCE = [
  {
    title: "供应商 B 计划维护",
    window: "2026-05-18 02:00–04:00 (UTC+8)",
    action: "自动切备路 · 已公告",
    owner: "运营 @zhou",
  },
  {
    title: "网关配置发布",
    window: "2026-05-12 22:00–22:15",
    action: "灰度 5% → 100%",
    owner: "平台 @chen",
  },
];

/** 近 7 日调用量趋势（相对 0–100，mock 画板；由工作台迁入大盘） */
export const OPS_CALL_TREND_7D = {
  title: "调用量趋势（近 7 日）",
  points: [62, 58, 71, 68, 74, 80, 76],
};

/** 近 24h 错误码分布（百分比合计 100，饼图 mock） */
export const OPS_ERROR_DIST_24H = {
  title: "近 24h 错误码分布",
  segments: [
    { label: "429 限流", pct: 38, color: "var(--warning-ink)" },
    { label: "5xx 上游", pct: 32, color: "var(--danger-ink)" },
    { label: "4xx 参数", pct: 22, color: "var(--muted)" },
    { label: "其它", pct: 8, color: "var(--muted-2)" },
  ] as const,
};
