/**
 * Chat 模块 · 纯原型演示用假数据（摆布局、走交互示意）。
 * 路径：`src/views/chat/mock.ts`（见同目录 `README.md`）。
 *
 * - 不当作正式接口契约、不做字段完备校验；接 API 后应整段替换，勿在此叠业务逻辑。
 * - 改下面数组/对象即可调文案与条数；收藏仍写 localStorage 仅为对齐旧静态演示键名。
 */


/** 与旧 `chat-openrouter.js` 一致，仅演示用 */
export const ORC_FAV_MODEL_STORAGE_KEY = "trinity_orc_fav_models";

/** 侧栏 / 弹层共用的模型列表 */
export const MOCK_ORC_MODELS = [
  {
    id: "r3",
    group: "置顶",
    name: "Recraft V3",
    shortName: "Recraft V3",
    provider: "R",
    brand: "recraft",
    desc: "Recraft V3 是来自 Recraft 的图像生成模型，支持文本与图像输入，约 1K 分辨率、多种画幅比输出。",
    weekly: "51K",
    context: "65,536",
    input: "$0 / 百万 tokens",
    output: "$0 / 百万 tokens",
    available: true,
    free: true,
    supportsInput: true,
    supportsOutput: true,
  },
  {
    id: "r4p",
    group: "置顶",
    name: "Recraft V4 Pro",
    shortName: "V4 Pro",
    provider: "R",
    brand: "recraft",
    desc: "Recraft V4 Pro：更高保真与更好构图的图像生成。",
    weekly: "12K",
    context: "128,000",
    input: "$2 / 百万 tokens",
    output: "$8 / 百万 tokens",
    available: true,
    free: false,
    supportsInput: true,
    supportsOutput: true,
  },
  {
    id: "r4",
    group: "2026 年 5 月",
    name: "Recraft V4",
    shortName: "Recraft V4",
    provider: "R",
    brand: "recraft",
    desc: "Recraft V4 图像模型。",
    weekly: "8K",
    context: "65,536",
    input: "$1 / 百万 tokens",
    output: "$4 / 百万 tokens",
    available: true,
    free: false,
    supportsInput: true,
    supportsOutput: false,
  },
  {
    id: "g31",
    group: "2026 年 5 月",
    name: "Gemini 3.1 Flash Lite",
    shortName: "Gemini Flash",
    provider: "G",
    brand: "google",
    desc: "快速多模态模型。",
    weekly: "420K",
    context: "1,000,000",
    input: "$0.10 / 百万 tokens",
    output: "$0.40 / 百万 tokens",
    available: true,
    free: false,
    supportsInput: true,
    supportsOutput: true,
  },
  {
    id: "cob",
    group: "2026 年 5 月",
    name: "CoBuddy（免费）",
    shortName: "CoBuddy",
    provider: "C",
    brand: "anthropic",
    desc: "轻量助手模型。",
    weekly: "∞",
    context: "8,192",
    input: "$0 / 百万 tokens",
    output: "$0 / 百万 tokens",
    available: true,
    free: true,
    supportsInput: true,
    supportsOutput: true,
  },
  {
    id: "gpt",
    group: "2026 年 5 月",
    name: "GPT Chat Latest",
    shortName: "GPT Latest",
    provider: "O",
    brand: "openai",
    desc: "最新 GPT 类对话模型演示占位。",
    weekly: "210K",
    context: "128,000",
    input: "$2.5 / 百万 tokens",
    output: "$10 / 百万 tokens",
    available: false,
    free: false,
    supportsInput: true,
    supportsOutput: true,
  },
];

/** 空态场景卡 → 侧栏展示的模型子集（对齐旧 `chat-openrouter.js`） */
export const MOCK_MODEL_COLLECTIONS: Record<string, { title: string; ids: readonly string[] }> = {
  flagship: { title: "综合旗舰", ids: ["g31", "gpt", "cob", "r4p"] },
  creative: { title: "人设与创意", ids: ["cob", "g31", "r3"] },
  code: { title: "编程与代码", ids: ["gpt", "g31", "cob"] },
  reasoning: { title: "复杂推理", ids: ["gpt", "g31", "r4p"] },
};

/** 侧栏「会话历史」分组；仅展示用 */
export const MOCK_CHAT_SESSION_GROUPS = [
  {
    label: "今天",
    rooms: [
      {
        id: "room-1",
        title: "我想问下西安天气",
        turns: "1轮",
        time: "12:28",
        ariaLabel: "我想问下西安天气，1 轮对话，12:28",
      },
      {
        id: "room-2",
        title: "临时会话：对比两个模型的回答",
        turns: "5轮",
        time: "14:06",
        ariaLabel: "临时会话：对比两个模型的回答，5 轮对话，14:06",
      },
    ],
  },
  {
    label: "昨天",
    rooms: [
      {
        id: "room-3",
        title: "想洗车但不知道开过去还是走过去",
        turns: "2轮",
        time: "昨天 21:40",
        ariaLabel: "想洗车但不知道开过去还是走过去，2 轮对话，昨天 21:40",
      },
    ],
  },
  {
    label: "近 30 天",
    rooms: [
      {
        id: "room-4",
        title: "诗谜草稿",
        turns: "8轮",
        time: "5月6日",
        ariaLabel: "诗谜草稿，8 轮对话，5 月 6 日",
      },
      {
        id: "room-5",
        title: "API 迁移备忘",
        turns: "3轮",
        time: "4月18日",
        ariaLabel: "API 迁移备忘，3 轮对话，4 月 18 日",
      },
    ],
  },
];

/** 添加角色弹窗列表；仅展示用 */
export const MOCK_PRESET_ROLES = [
  {
    id: "preset_default_zh",
    title: "技术写作",
    desc: "中文技术文档、Release Note 与说明文；默认偏清晰结构与术语一致。",
    origin: "self" as const,
    avatar: "技",
  },
  {
    id: "preset_code_review",
    title: "代码审查",
    desc: "Pull Request 风格审阅：风险点、测试建议与可合并性摘要（演示占位）。",
    origin: "self" as const,
    avatar: "码",
  },
  {
    id: "preset_cs_short",
    title: "客服简短",
    desc: "短句、礼貌收尾；适合工单首响与常见问题模板（官方示例）。",
    origin: "official" as const,
    avatar: "服",
  },
];

export function getOrcModelById(id: string) {
  return MOCK_ORC_MODELS.find((m) => m.id === id);
}

export function filterBrowseModels(
  models: typeof MOCK_ORC_MODELS,
  query: string,
  hideUnavailable: boolean
) {
  const ft = query.trim().toLowerCase();
  return models.filter((m) => {
    if (ft && !m.name.toLowerCase().includes(ft) && !m.id.toLowerCase().includes(ft)) return false;
    if (hideUnavailable && m.available === false) return false;
    return true;
  });
}

export function groupModelsForSidebar(filtered: typeof MOCK_ORC_MODELS, favoriteIds: string[]) {
  const seen: Record<string, boolean> = {};
  const favList: typeof MOCK_ORC_MODELS = [];
  for (const fid of favoriteIds) {
    const hit = filtered.find((m) => m.id === fid && !seen[fid]);
    if (hit) {
      favList.push(hit);
      seen[fid] = true;
    }
  }
  const rest = filtered.filter((m) => !seen[m.id]);
  const byGroup: Record<string, typeof MOCK_ORC_MODELS> = {};
  for (const m of rest) {
    if (!byGroup[m.group]) byGroup[m.group] = [];
    byGroup[m.group].push(m);
  }
  const sections: { key: string; models: typeof MOCK_ORC_MODELS }[] = [];
  if (favList.length) sections.push({ key: "收藏", models: favList });
  const order = ["置顶", "2026 年 5 月"];
  for (const g of order) {
    if (byGroup[g]?.length) sections.push({ key: g, models: byGroup[g] });
  }
  for (const g of Object.keys(byGroup)) {
    if (!order.includes(g) && byGroup[g].length) sections.push({ key: g, models: byGroup[g] });
  }
  return sections;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function brandPvExtraClass(m: (typeof MOCK_ORC_MODELS)[number]) {
  const b = m.brand || "";
  if (b === "google") return " orc-pv--google";
  if (b === "openai") return " orc-pv--openai";
  if (b === "anthropic") return " orc-pv--anthropic";
  if (b === "xai") return " orc-pv--xai";
  if (b === "recraft") return " orc-pv--recraft";
  return " orc-pv--letter";
}

function providerIconHtml(m: (typeof MOCK_ORC_MODELS)[number]) {
  const extra = brandPvExtraClass(m);
  if (extra.includes("letter")) {
    return `<span class="orc-pv${extra}" aria-hidden="true">${escapeHtml(m.provider || "?")}</span>`;
  }
  return `<span class="orc-pv${extra}" aria-hidden="true"></span>`;
}

function readFavIds(): string[] {
  try {
    const raw = localStorage.getItem(ORC_FAV_MODEL_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((id): id is string => typeof id === "string" && !!getOrcModelById(id));
  } catch {
    return [];
  }
}

/** 给静态弹层 DOM 填列表；仅演示，无完整交互绑定 */
export function paintMockPickerList(options?: { currentModelId?: string; favoriteIds?: string[]; query?: string }) {
  const listEl = document.querySelector("#orc-picker-list");
  if (!listEl) return;
  const currentId = options?.currentModelId ?? "r3";
  const fav = options?.favoriteIds ?? readFavIds();
  const q = options?.query ?? "";
  const filtered = filterBrowseModels(MOCK_ORC_MODELS, q, true);
  const sections = groupModelsForSidebar(filtered, fav);
  let html = "";
  for (const sec of sections) {
    html += `<div class="orc-picker-group orc-side-model-group orc-side-model-group--collection"><h4 class="orc-side-model-group-title">${escapeHtml(sec.key)}</h4>`;
    for (const m of sec.models) {
      const isFav = fav.includes(m.id);
      const picked = m.id === currentId;
      const rowClass =
        "orc-model-row orc-model-row--compare" +
        (picked ? " is-active is-selected is-preview" : "");
      html += `<button type="button" class="${rowClass}" aria-pressed="${picked ? "true" : "false"}" data-model-id="${escapeHtml(m.id)}">${providerIconHtml(m)}<span class="orc-model-row-name">${escapeHtml(m.name)}</span><span class="orc-model-row-fav" title="${isFav ? "取消收藏" : "加入收藏"}" aria-hidden="true">${isFav ? "★" : "☆"}</span><span class="orc-model-row-mark" aria-hidden="true">${picked ? "✓" : ""}</span></button>`;
    }
    html += "</div>";
  }
  listEl.innerHTML = html || '<p class="orc-picker-desc" style="padding:1rem">没有匹配的模型。</p>';
  const m0 = getOrcModelById(currentId) ?? filtered[0];
  if (m0) fillPickerDetail(m0);
}

function fillPickerDetail(m: (typeof MOCK_ORC_MODELS)[number]) {
  const title = document.querySelector("#orc-detail-title");
  const desc = document.querySelector("#orc-detail-desc");
  const logo = document.querySelector("#orc-detail-logo") as HTMLElement | null;
  const w = document.querySelector("#orc-st-weekly");
  const c = document.querySelector("#orc-st-ctx");
  const inn = document.querySelector("#orc-st-in");
  const out = document.querySelector("#orc-st-out");
  if (title) title.textContent = m.name;
  if (desc) desc.textContent = m.desc;
  if (logo) {
    logo.className = `orc-pv orc-detail-pv${brandPvExtraClass(m)}`;
    logo.textContent = brandPvExtraClass(m).includes("letter") ? m.provider || "?" : "";
  }
  if (w) w.textContent = m.weekly;
  if (c) c.textContent = m.context;
  if (inn) inn.textContent = m.input;
  if (out) out.textContent = m.output;
}

export function paintMockRolePickerList(selectedId = "preset_default_zh") {
  const host = document.querySelector("#orc-role-picker-list");
  if (!host) return;
  const html = MOCK_PRESET_ROLES.map((r) => {
    const isSel = r.id === selectedId;
    const tagClass = r.origin === "official" ? "orc-role-card-tag orc-role-card-tag--official" : "orc-role-card-tag orc-role-card-tag--self";
    const tagText = r.origin === "official" ? "官方" : "自建";
    return `<button type="button" class="orc-role-card${isSel ? " is-selected" : ""}" data-orc-preset="${escapeHtml(r.id)}"><span class="orc-role-card-avatar" aria-hidden="true">${escapeHtml(r.avatar)}</span><span class="orc-role-card-main"><span class="orc-role-card-title">${escapeHtml(r.title)}</span><span class="orc-role-card-desc">${escapeHtml(r.desc)}</span></span><span class="${tagClass}">${escapeHtml(tagText)}</span></button>`;
  }).join("");
  host.innerHTML = html;
}
