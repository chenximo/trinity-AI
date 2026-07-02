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
    trinityIds: ["deepseek-v4-pro"],
    severity: "warn",
    flag: "转售加价",
    scopes: ["compare-hub", "supplier-compare"],
    title: "deepseek-v4-pro：TokenHub/百炼转售加价",
    detail:
      "厂商官方 ¥3/¥6；TokenHub·百炼挂牌 ¥12/¥24 为已知转售口径。AIGC 国内 ¥3 与官方一致。",
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
    id: "hy3-preview-aigc-gap",
    trinityIds: ["hy3-preview"],
    severity: "warn",
    flag: "AIGC偏高",
    scopes: ["compare-hub", "supplier-compare"],
    title: "hy3-preview：AIGC 出/缓高于腾讯官方种子",
    detail: "需核对 AIGC 价目表与腾讯云最新挂牌；官方种子见 suppliers/official/data/seeds/text.mjs。",
  },
  {
    id: "qwen-bailian-cache",
    trinityIds: ["qwen3.5-flash", "qwen3.5-plus"],
    severity: "info",
    flag: "百炼缓存贵",
    scopes: ["compare-hub", "supplier-compare"],
    title: "千问 3.5：百炼缓存读取高于官方",
    detail: "百炼挂牌缓存价高于厂商官方种子，属供应商口径差异，入/出一致。",
  },
];

export const ISSUE_FLAG_COLUMN = "官网vsOR";

const SCOPE_ALIASES = {
  "openrouter-compare": "openrouter-compare",
  "compare-hub": "compare-hub",
  "supplier-compare": "supplier-compare",
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
  return PRICING_ANNOTATIONS.filter(
    (a) =>
      a.trinityIds.some((id) => id.toLowerCase() === key) &&
      a.scopes.includes(scopeKey),
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
