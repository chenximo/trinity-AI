/**
 * 监控与运维 · 假数据
 * 对齐：详设 §4.2、`doc/创建后端需实现页面与功能.md` §4.4.1
 * 分区与键名说明：本目录 README.md §5
 */

/** 原型：侧栏仅「实时大盘」单页；errors/health 等旧 path 重定向至 live，数据在本文件分区使用。 */
export type OpsTabId = "live";

export const OPS_TABS: { id: OpsTabId; label: string }[] = [{ id: "live", label: "实时大盘" }];

export const OPS_MONITOR_WINDOW = {
  defaultHours: 2,
  maxHours: 24,
  refreshSec: 15,
};

export const OPS_SUMMARY = {
  windowLabel: "最近 2 小时",
  qps: "2.84k",
  errRate: "0.38%",
  p99: "890 ms",
  updatedAt: "2026-05-11 14:32:08",
  stale: false,
};

/** 五类监控图占位（对齐 §4.4.1） */
export const OPS_MONITOR_CHARTS = [
  { id: "sse", title: "SSE open", unit: "连接", last: "142", series: [120, 132, 128, 140, 138, 142] },
  { id: "token", title: "Token by model", unit: "M", last: "2.4", series: [62, 58, 71, 68, 74, 80] },
  { id: "spend", title: "Spend", unit: "USD", last: "1.2k", series: [40, 44, 42, 48, 46, 50] },
  { id: "active", title: "Active users", unit: "人", last: "386", series: [320, 340, 360, 350, 380, 386] },
  { id: "stability", title: "Stability", unit: "%", last: "99.58", series: [99.5, 99.6, 99.4, 99.7, 99.6, 99.58] },
] as const;

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
  labels: ["5/5", "5/6", "5/7", "5/8", "5/9", "5/10", "5/11"],
  points: [62, 58, 71, 68, 74, 80, 76],
};

/** 当前时间窗 · 按模型调用占比（请求次数 %；token 占比见行内 tokenPct） */
export const OPS_MODEL_CALL_SHARE = {
  title: "模型调用占比",
  metricLabel: "按请求次数",
  segments: [
    { model: "gpt-4o-mini", pct: 42, tokenPct: 38, calls: "1.19M", color: "var(--blue)" },
    { model: "claude-3-5-sonnet", pct: 28, tokenPct: 31, calls: "794k", color: "var(--purple, #7c3aed)" },
    { model: "text-embedding-3-small", pct: 18, tokenPct: 12, calls: "510k", color: "var(--success-800)" },
    { model: "gpt-4o", pct: 8, tokenPct: 14, calls: "227k", color: "var(--warning-ink)" },
    { model: "其它", pct: 4, tokenPct: 5, calls: "113k", color: "var(--muted-2)" },
  ] as const,
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
