/**
 * 价目问题标记 — 以「官网价 vs OpenRouter」为主，官网价优先
 *
 * 自动标记由 compare-openrouter-lib 按 Δ(官网÷6.5 vs OR) 计算；
 * 本文件仅登记需人工说明的口径/映射例外。
 */

/** @typedef {{ id: string, trinityIds: string[], severity: "error"|"warn"|"info", flag: string, scopes: string[], title: string, detail: string }} PricingAnnotation */

/** @type {PricingAnnotation[]} */
export const PRICING_ANNOTATIONS = [
  {
    id: "deepseek-v4-pro-reseller",
    trinityIds: [
      "deepseek-v4-pro",
      "deepseek-v4-pro-202606",
      "deepseek-v4-flash",
      "deepseek-v4-flash-202605",
    ],
    severity: "warn",
    flag: "转售加价",
    scopes: ["compare-hub", "supplier-compare", "official-suppliers"],
    title: "DeepSeek V4：百炼/TokenHub 转售或隐式缓存口径",
    detail:
      "厂商官方 ¥3/¥6（Pro）、¥1/¥2（Flash）；百炼第三方区挂牌可高于官方。Flash 缓存百炼按 input×20% 隐式计价（0.2），官方 cache hit 0.02。",
  },
  {
    id: "glm-5-tier-axis",
    trinityIds: ["glm-5", "glm-5-turbo", "glm-5.1", "glm-5v-turbo"],
    severity: "info",
    flag: "多档",
    scopes: ["openrouter-compare", "compare-hub"],
    title: "GLM-5 系列：官网按输入长度分档",
    detail: "对比时按 tierKey 对齐；勿按行号硬比。",
  },
  {
    id: "qwen-domestic-vs-or",
    trinityIds: ["qwen-plus", "qwen3.5-plus", "qwen3.5-flash"],
    severity: "info",
    flag: "口径",
    scopes: ["openrouter-compare"],
    title: "千问：官网百炼国内价 vs OR 国际 API",
    detail:
      "官网 CNY 为国内百炼挂牌；OpenRouter 多为国际 DashScope USD。官网÷6.5 低于 OR 不一定是错误。",
  },
  {
    id: "hy3-preview-aigc-domestic-only",
    trinityIds: ["hy3-preview"],
    severity: "info",
    flag: "仅国内",
    scopes: ["compare-hub", "supplier-compare"],
    title: "hy3-preview：AIGC 无国际价",
    detail:
      "混元 3-preview 在 AIGC 价目表仅有国内站报价；刊例对比「AIGC国际」列显示 —。官网价与 AIGC 国内价、TokenHub 对齐。",
  },
  {
    id: "qwen-bailian-cache",
    trinityIds: ["qwen3.5-flash", "qwen3.5-plus", "qwen-plus"],
    severity: "info",
    flag: "百炼缓存贵",
    scopes: ["compare-hub", "supplier-compare", "official-suppliers"],
    title: "千问：百炼缓存读取高于官方",
    detail:
      "百炼挂牌 cache 多为 input×20% 隐式价；官方种子为厂商文档 explicit cache hit。入/出一致时不视为渠道错误。",
  },
  {
    id: "glm-4-7-bailian-tier-axis",
    trinityIds: ["glm-4-7-251222"],
    severity: "info",
    flag: "档位轴不同",
    scopes: ["official-suppliers", "supplier-compare"],
    title: "GLM-4.7：百炼仅按输入长度分档",
    detail:
      "官方/AIGC 在 ≤32k 内再按输出长度分两档；百炼 scrape 仅 0–32k / >32k 两档。按 tierKey 硬比会产生假阳性。",
  },
  {
    id: "minimax-cache-write5m",
    trinityIds: ["minimax-m2.5", "minimax-m2.7"],
    severity: "info",
    flag: "缓存写入价",
    scopes: ["official-suppliers", "supplier-compare"],
    title: "MiniMax：官方 cache 对齐 AIGC 5m 缓存写入",
    detail:
      "官方 cache 字段对应 AIGC「5m缓存写入」价（非 cache hit）。百炼未单独列出 cache 字段时不 fail。",
  },
];

export const ISSUE_FLAG_COLUMN = "官网vsOR";

const SCOPE_ALIASES = {
  "openrouter-compare": "openrouter-compare",
  "compare-hub": "compare-hub",
  "supplier-compare": "supplier-compare",
  "official-suppliers": "official-suppliers",
};

const SCOPE_GROUPS = {
  "openrouter-compare": ["openrouter-compare"],
  "compare-hub": ["compare-hub"],
  "supplier-compare": ["supplier-compare", "official-suppliers"],
  "official-suppliers": ["official-suppliers", "supplier-compare"],
};

const DELTA_CLOSE_PCT = 8;
const DELTA_WARN_PCT = 50;

function pctDelta(base, value) {
  if (base == null || value == null || base === 0) return null;
  return ((value - base) / base) * 100;
}

/**
 * 自动标记：官网价（USD）vs OpenRouter
 * @param {{ offUsd?: { input?: number|null, output?: number|null }|null, orTier?: { input?: number|null, output?: number|null }|null, comparable?: boolean }} ctx
 */
export function autoFlagOfficialVsOr({ offUsd, orTier, comparable = true }) {
  if (!orTier?.input && !orTier?.output) return "OR未收录";
  if (!offUsd?.input && !offUsd?.output) return "无官网价";
  if (!comparable) return "—";

  const di = pctDelta(orTier.input, offUsd.input);
  const dout = pctDelta(orTier.output, offUsd.output);
  const vals = [di, dout].filter((v) => v != null);
  if (!vals.length) return "—";

  const maxAbs = Math.max(...vals.map((v) => Math.abs(v)));
  if (maxAbs <= DELTA_CLOSE_PCT) return "一致";

  const parts = [];
  const inLabel = fmtDeltaLabel("官入", di);
  const outLabel = fmtDeltaLabel("官出", dout);
  if (inLabel) parts.push(inLabel);
  if (outLabel) parts.push(outLabel);

  if (maxAbs >= DELTA_WARN_PCT) {
    return `⚠ ${parts.join(" ")}`;
  }
  return parts.join(" ") || "有差异";
}

function fmtPct(n) {
  const rounded = Math.round(n * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function fmtDeltaLabel(prefix, pct) {
  if (pct == null) return null;
  if (Math.abs(pct) < DELTA_CLOSE_PCT) return null;
  return `${prefix}${fmtPct(pct)}`;
}

/**
 * @param {string} trinityId
 * @param {object} ctx — 传给 autoFlagOfficialVsOr
 */
export function issueFlagForOpenRouterRow(trinityId, ctx) {
  const auto = autoFlagOfficialVsOr(ctx);
  const manual = annotationsForModel(trinityId, "openrouter-compare")
    .map((a) => a.flag)
    .filter((f) => f && f !== auto);
  const parts = [auto, ...manual].filter((p) => p && p !== "—" && p !== "一致");
  if (!parts.length) {
    if (auto === "—" || auto === "一致") return auto;
    return auto || "—";
  }
  return [...new Set(parts)].join("；");
}

/**
 * @param {string} trinityId
 * @param {string} scope
 */
export function annotationsForModel(trinityId, scope = "openrouter-compare") {
  if (!trinityId) return [];
  const key = trinityId.toLowerCase();
  const scopeKey = SCOPE_ALIASES[scope] ?? scope;
  const accepted = new Set(SCOPE_GROUPS[scopeKey] ?? [scopeKey]);
  return PRICING_ANNOTATIONS.filter(
    (a) =>
      a.trinityIds.some((id) => id.toLowerCase() === key) &&
      a.scopes.some((s) => accepted.has(SCOPE_ALIASES[s] ?? s)),
  );
}

/** @deprecated 仅 openrouter 表使用 issueFlagForOpenRouterRow */
export function issueFlagForModel(trinityId, scope = "openrouter-compare") {
  return annotationsForModel(trinityId, scope)
    .map((a) => a.flag)
    .join("；");
}

/**
 * @param {string|string[]} scopes
 */
export function collectAnnotationsForScopes(scopes) {
  const set = new Set(Array.isArray(scopes) ? scopes : [scopes]);
  return PRICING_ANNOTATIONS.filter((a) =>
    a.scopes.some((s) => set.has(s) || set.has(SCOPE_ALIASES[s])),
  );
}

/**
 * Markdown 表底注释（官网 vs OR）
 * @param {string|string[]} scopes
 */
export function renderAnnotationFooterMd(scopes) {
  const items = collectAnnotationsForScopes(scopes);
  const lines = [
    "",
    "## 官网 vs OpenRouter 说明",
    "",
    `- **${ISSUE_FLAG_COLUMN}** 以 **官网价（国内 CNY÷6.5）vs OpenRouter** 为准；官网价优先。`,
    "- **一致**：入/出与 OR 差异均 ≤8%",
    "- **⚠ 官入/官出 ±N%**：官网相对 OR 偏差 ≥50% 或显著差异",
    "- **OR未收录** / **无官网价**：无法对比",
    "- Trinity 线上列为参考，不作为问题标记主依据",
    "",
  ];

  if (!items.length) return lines.join("\n");

  lines.push("### 人工登记例外", "");
  for (const a of items) {
    const tag =
      a.severity === "error" ? "【待修复】" : a.severity === "warn" ? "【注意】" : "【说明】";
    lines.push(`#### ${tag} ${a.title}`, "", a.detail, "");
  }

  return lines.join("\n");
}

/**
 * Excel / CSV 表底注释
 * @param {unknown[][]} rows
 * @param {string|string[]} scopes
 */
export function appendExcelAnnotationRows(rows, scopes) {
  const footer = renderAnnotationFooterMd(scopes);
  if (!footer.trim()) return rows;

  const out = [...rows, [], ["—— 官网 vs OpenRouter 说明 ——"]];
  for (const line of footer.split("\n").filter((l) => l && !l.startsWith("#"))) {
    out.push([line]);
  }
  return out;
}
