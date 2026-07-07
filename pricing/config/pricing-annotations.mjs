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
      "厂商官方 ¥3/¥6（Pro）、¥1/¥2（Flash）。百炼 deepseek-v4-pro 缓存价非 input×20%，须查控制台；Flash 等百炼自部署按各模型 cache 比例（见 bailian/lib/cache-policy.mjs）。",
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
      "百炼 cache 按 Context Cache 文档分模型比例（默认 input×20%；Kimi/万擎 DeepSeek/GLM/MiniMax 等见 cache-policy.mjs）。官方种子为厂商 explicit cache hit，口径不同。",
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
  {
    id: "image-hunyuan-3-flat-official",
    trinityIds: ["Hunyuan-3.0", "hy-image-v3.0"],
    severity: "info",
    flag: "官方统一价",
    scopes: ["compare-hub", "supplier-compare", "official-aigc-image"],
    title: "混元生图 3.0：官网无分辨率分档",
    detail:
      "腾讯云混元生图 3.0 后付费统一 ¥0.2/张（90896）。AIGC 商务表按 1K/2K/4K 分档为转售口径，勿反向改官方种子。",
  },
  {
    id: "image-openai-gpt-image2-resale",
    trinityIds: ["OG-image2-low", "OG-image2-medium", "OG-image2-high"],
    severity: "info",
    flag: "转售口径",
    scopes: ["compare-hub", "supplier-compare", "official-aigc-image"],
    title: "GPT Image 2：官方计算器价 vs AIGC 国际转售价",
    detail:
      "OpenAI 按 token 计费，1024² 估算 low $0.006 / medium $0.053 / high $0.211。AIGC 国际列为 Trinity 转售价，与原厂不等价属预期。",
  },
  {
    id: "image-qwen-flat-official",
    trinityIds: ["qwen-0925"],
    severity: "info",
    flag: "官方统一价",
    scopes: ["compare-hub", "supplier-compare", "official-aigc-image"],
    title: "通义 qwen-image：百炼无分辨率分档",
    detail:
      "百炼 qwen-image 官方 ¥0.25/张（与分辨率无关）。AIGC「0925」按 1K/2K/4K 分档为 Trinity 转售价，勿反向改官方种子。",
  },
  {
    id: "image-vidu-fx-rounding",
    trinityIds: ["Vidu-q2"],
    severity: "info",
    flag: "汇率取整",
    scopes: ["official-aigc-image", "official-suppliers"],
    title: "Vidu q2：国际对比 CNY÷6.5 取整",
    detail:
      "官方 CNY 价 ÷6.5 与 AIGC 国际列可能有 ~2% 取整差（如 2K ¥0.25→$0.0385 vs $0.038），国内 CNY 档应对齐。",
  },
  {
    id: "image-gemini-usd-official",
    trinityIds: ["GG-2.5", "GG-3.0", "GG-3.1"],
    severity: "info",
    flag: "USD官方",
    scopes: ["compare-hub", "official-aigc-image", "official-suppliers"],
    title: "Gemini 生图：官方 USD vs AIGC 国内 CNY",
    detail:
      "Gemini 生图价来自 ai.google.dev 定价页（USD/张）。AIGC 国内列为人民币转售价；L2 国内 vs 官方不可比（币种不同），以国际 USD vs 官方为准。",
  },
  {
    id: "image-gg-2.5-tier-axis",
    trinityIds: ["GG-2.5"],
    severity: "info",
    flag: "档位轴不同",
    scopes: ["official-aigc-image", "compare-hub"],
    title: "Gemini 2.5 Flash Image：官方单档 vs AIGC 三档",
    detail:
      "Google 官方仅 ≤1024² 单档 $0.039/张；AIGC 商务表按 1K/2K/4K 分档为 Trinity 转售口径。",
  },
  {
    id: "image-volc-seedream-tier-axis",
    trinityIds: ["SI-4.0", "SI-4.5", "SI-5.0-lite"],
    severity: "info",
    flag: "火山单档",
    scopes: ["official-suppliers", "compare-hub"],
    title: "即梦/Seedream：火山方舟无分辨率分档",
    detail:
      "官方种子与 AIGC 按 1K/2K/4K 三档；火山方舟 scrape 为统一价单档。按 tierKey 硬比会产生假阳性。",
  },
  {
    id: "video-kling-v26-listing-audio",
    trinityIds: ["kl-video-v2-6"],
    severity: "info",
    flag: "刊例口径",
    scopes: ["compare-hub", "official-aigc-video"],
    title: "可灵 2.6：AIGC 无声 vs 线上 1080p/2k 刊例",
    detail:
      "AIGC 映射 attribute「无声」；线上 1080p($0.14/s)、2k($0.21/s) 约为 AIGC 国际同档 2 倍，720p/4k 对齐。刊例结论 ⚠+100% 为产品 SKU 差异，非 tierKey 错配。",
  },
  {
    id: "video-vidu-q3pro-listing-tier",
    trinityIds: ["vd-video-q3-pro"],
    severity: "info",
    flag: "刊例口径",
    scopes: ["compare-hub", "official-aigc-video"],
    title: "Vidu Q3-Pro：线上刊例低于 AIGC 国际同档",
    detail:
      "540p 对齐；720p/1080p 线上刊例约为 AIGC 国际半价（如 $0.0625 vs $0.125/s）。档位匹配正确，差异来自 Trinity 刊例定价策略，非 compare 错行。",
  },
  {
    id: "video-seedance-slug-alias",
    trinityIds: [],
    severity: "info",
    flag: "slug别名",
    scopes: ["compare-hub"],
    title: "Seedance：线上 seedance-* vs 官方 doubao-seedance-*",
    detail:
      "Trinity 线上 slug 为 seedance-1.0-pro 等（AIGC 厂商 SV）；火山/豆包官方种子为 doubao-seedance-*，分开展行，勿强行合并 tierKey。",
  },
  {
    id: "video-volcengine-reference",
    trinityIds: [
      "doubao-seedance-1.5-pro",
      "doubao-seedance-2.0",
      "doubao-seedance-2.0-fast",
      "doubao-seedance-2.0-mini",
    ],
    severity: "info",
    flag: "参照列",
    scopes: ["compare-hub", "official-suppliers"],
    title: "火山方舟生视频：L3 参照列未接入进货",
    detail:
      "channels-video.mjs 中 volcengine connected:false；对比表保留火山列作 Seedance 价目参照，L2 blocking 校验不含此列。",
  },
  {
    id: "video-gv-veo-slug-map",
    trinityIds: ["gv-3.1", "gv-3.1-fast", "gv-3.1-litenew"],
    severity: "info",
    flag: "slug映射",
    scopes: ["compare-hub", "official-aigc-video"],
    title: "GV 线上 slug → Google Veo 3.1 原厂 id",
    detail:
      "线上 gv-3.1* 为脱敏刊例 slug；官方 catalog 使用 veo-3.1-*-generate-preview（Gemini API 定价页 #veo-3.1）。",
  },
  {
    id: "video-hailuo-per-video-derived",
    trinityIds: ["hailuo-2.3", "hailuo-2.3-fast"],
    severity: "info",
    flag: "按条折算",
    scopes: ["compare-hub"],
    title: "海螺 Hailuo：MiniMax PayGo 按条 → 美元/秒",
    detail:
      "MiniMax 官网按 6s/10s 成片计价；种子按 $/6s÷6 折算为美元/秒，与 AIGC 按秒口径近似对照。",
  },
  {
    id: "video-sora2-sunset",
    trinityIds: ["os-2", "sora-2"],
    severity: "info",
    flag: "即将下线",
    scopes: ["compare-hub", "official-aigc-video"],
    title: "OpenAI Sora 2：Videos API 计划下线",
    detail:
      "sora-2 官方 $0.10/s（720p）；OpenAI 宣布 Videos API 与 sora-2 于 2026-09-24 下线。",
  },
  {
    id: "video-pixverse-credits-derived",
    trinityIds: ["pixversenew-c1", "pixversenew-v5.6", "pixversenew-v6.0"],
    severity: "info",
    flag: "积分折算",
    scopes: ["compare-hub"],
    title: "PixVerse：credits/s → 美元/秒",
    detail:
      "官方 platform.pixverse.ai 按 credits/秒；种子按 $100=10000 credits（$0.01/credit）折算 USD/秒。V5.6 按条价目表折算为 credits/s。",
  },
  {
    id: "video-seedance-token-axis",
    trinityIds: [
      "seedance-1.0-pro",
      "seedance-1.0-pro-fast",
      "seedance-1.5-pro",
      "doubao-seedance-1.0-pro",
      "doubao-seedance-1.0-pro-fast",
      "doubao-seedance-1.5-pro",
      "doubao-seedance-2.0",
      "doubao-seedance-2.0-fast",
      "doubao-seedance-2.0-mini",
    ],
    severity: "warn",
    flag: "计价轴不同",
    scopes: ["compare-hub", "official-aigc-video"],
    title: "Seedance：官方/线上 token 刊例 vs AIGC 按秒",
    detail:
      "火山方舟与 Trinity 线上 seedance-* 均为 元/百万 tokens（#2864f00a）；AIGC SV 仍为 元/秒，不可直比 %。刊例结论列比官方 token vs 线上 token。按个表仅为 16:9·5s 场景示例。",
  },
  {
    id: "video-jimeng-pro-verify",
    trinityIds: ["jv-3.0-pro", "jimeng-jv-3.0-pro"],
    severity: "warn",
    flag: "需人工核验",
    scopes: ["compare-hub"],
    title: "即梦 3.0 Pro：火山计费分档待核验",
    detail:
      "已挂 volcengine/85621/1544715；种子 1080P ¥1/s 为初值，分辨率/有声分档请在控制台核对。",
  },
  {
    id: "video-kling-official-snapshot",
    trinityIds: [
      "kling-3",
      "kling-2.6",
      "kling-2.5-turbo",
      "kling-3.0-omni",
      "kling-o1",
      "kl-video-v3",
      "kl-video-v2-6",
      "kl-video-v2-5-turbo",
      "kl-video-v2-1",
      "kl-video-v1",
      "kl-video-v3-omni",
      "kl-video-o1",
    ],
    severity: "info",
    flag: "官网快照",
    scopes: ["official-aigc-video", "official-suppliers", "compare-hub"],
    title: "可灵生视频：pricing/base/video 人工快照",
    detail:
      "Kling 定价页为 SPA 未接自动抓取；720/1080/4K 来自官网表格，2K 等未列分辨率按 AIGC 国内对齐。",
  },
  {
    id: "video-h2new-verify",
    trinityIds: ["h2new-1", "hy-video-h2new"],
    severity: "warn",
    flag: "需人工核验",
    scopes: ["compare-hub"],
    title: "h2new-1：TokenHub 未列独立 SKU",
    detail:
      "腾讯 TokenHub 130055 仅有 HY-Video-1.5 等，无 h2new/HunyuanVideo 新型号价目；官方列为 —。",
  },
  {
    id: "video-vidu-q3-direct-platform",
    trinityIds: ["vidu-q3", "vd-video-q3"],
    severity: "info",
    flag: "平台直采",
    scopes: ["compare-hub"],
    title: "Vidu Q3：platform.vidu.cn 参考生价",
    detail:
      "vd-video-q3 种子来自 Vidu 开放平台（非 TokenHub 0.3125 元/积分口径）；与 AIGC 差异可能来自进货渠道。",
  },
  {
    id: "image-mj-kling-aigc-only",
    trinityIds: [
      "MJ-v7",
      "Kling-2.1",
      "Kling-3.0",
      "Kling-3.0-omni",
      "Kling-O1",
    ],
    severity: "info",
    flag: "AIGC参照",
    scopes: ["official-aigc-image", "official-suppliers", "compare-hub"],
    title: "MJ/可灵生图：无公开按张 API 价",
    detail:
      "种子价来自 AIGC 商务参照（aigc_only），非厂商公开 API 按张价目；L2/L3 与官方种子对比仅作映射检查，不视为 blocking 差异。",
  },
];

export const ISSUE_FLAG_COLUMN = "官网vsOR";

const SCOPE_ALIASES = {
  "openrouter-compare": "openrouter-compare",
  "compare-hub": "compare-hub",
  "supplier-compare": "supplier-compare",
  "official-suppliers": "official-suppliers",
  "official-aigc-image": "official-aigc-image",
  "official-aigc-video": "official-aigc-video",
};

const SCOPE_GROUPS = {
  "openrouter-compare": ["openrouter-compare"],
  "compare-hub": ["compare-hub"],
  "supplier-compare": ["supplier-compare", "official-suppliers"],
  "official-suppliers": ["official-suppliers", "supplier-compare"],
  "official-aigc-image": ["official-aigc-image"],
  "official-aigc-video": ["official-aigc-video"],
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
