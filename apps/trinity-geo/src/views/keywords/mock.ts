/** 问题集管理 · Mock 数据与纯函数 */

export type QuestionType = "品类词" | "品牌词" | "对比词" | "场景词";
export type QuestionStatus = "active" | "paused";
export type TypeFilter = "all" | QuestionType;
export type StatusFilter = "all" | "active" | "paused";

export interface KeywordSignal {
  label: string;
  tone: "warn" | "ok" | "neg" | "neu" | "muted";
  title?: string;
}

export interface KeywordDetailLink {
  name: string;
  query?: Record<string, string>;
}

export interface KeywordQuestion {
  id: string;
  type: QuestionType;
  status: QuestionStatus;
  text: string;
  priority?: "P0";
  soa7d: number | null;
  soaTone?: "bad" | "good" | "mid";
  signals: KeywordSignal[];
  detail: KeywordDetailLink;
}

export interface AiSuggestion {
  id: string;
  type: QuestionType;
  text: string;
  label: string;
  checked: boolean;
}

export interface KeywordTemplate {
  type: QuestionType;
  text: string;
  label: string;
}

export const BRAND_NAME = "Trinity AI";
export const QUOTA_MAX = 100;
export const QUOTA_PLAN = "专业版";

export const QUESTION_TYPES: QuestionType[] = ["品类词", "品牌词", "对比词", "场景词"];

export const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "全部类型" },
  { value: "品类词", label: "品类" },
  { value: "品牌词", label: "品牌" },
  { value: "对比词", label: "对比" },
  { value: "场景词", label: "场景" },
];

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "active", label: "监测中" },
  { value: "paused", label: "已暂停" },
];

export const TYPE_SUMMARY_LABELS: QuestionType[] = ["品类词", "品牌词", "对比词", "场景词"];

export const INITIAL_QUESTIONS: KeywordQuestion[] = [
  {
    id: "Q00",
    type: "品类词",
    status: "active",
    text: "推荐两款 API 聚合平台",
    priority: "P0",
    soa7d: 0,
    soaTone: "bad",
    signals: [
      { label: "D1", tone: "warn", title: "D1 品类失声" },
      { label: "未进答案", tone: "warn" },
    ],
    detail: { name: "geo-keyword-detail", query: { q: "Q00" } },
  },
  {
    id: "Q01",
    type: "品牌词",
    status: "active",
    text: "Trinity AI 好用吗？适合什么场景？",
    soa7d: 62,
    soaTone: "good",
    signals: [
      { label: "CCR", tone: "ok" },
      { label: "正面", tone: "ok" },
    ],
    detail: { name: "geo-answer-detail-brand" },
  },
  {
    id: "Q02",
    type: "品牌词",
    status: "active",
    text: "trinitydesk.ai 是什么平台？",
    soa7d: 48,
    soaTone: "good",
    signals: [{ label: "负面", tone: "neg" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q02" } },
  },
  {
    id: "Q03",
    type: "品类词",
    status: "active",
    text: "国内有哪些 OpenAI 兼容的大模型 API 聚合平台？",
    soa7d: 8,
    soaTone: "bad",
    signals: [{ label: "未进答案", tone: "warn" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q03" } },
  },
  {
    id: "Q04",
    type: "品类词",
    status: "active",
    text: "想一个 Key 调用多家大模型，有什么推荐？",
    soa7d: 22,
    soaTone: "mid",
    signals: [{ label: "—", tone: "muted" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q04" } },
  },
  {
    id: "Q05",
    type: "品牌词",
    status: "active",
    text: "Trinity Desk 和 OpenRouter 怎么选？",
    soa7d: 35,
    soaTone: "mid",
    signals: [{ label: "中性", tone: "neu" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q05" } },
  },
  {
    id: "Q06",
    type: "对比词",
    status: "active",
    text: "Trinity 和 OpenRouter 哪个更适合国内开发者？",
    soa7d: 28,
    soaTone: "mid",
    signals: [{ label: "—", tone: "muted" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q06" } },
  },
  {
    id: "Q07",
    type: "对比词",
    status: "active",
    text: "trinitydesk 和其他 API 中转平台比有什么优势？",
    soa7d: 41,
    soaTone: "good",
    signals: [{ label: "—", tone: "muted" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q07" } },
  },
  {
    id: "Q08",
    type: "品牌词",
    status: "active",
    text: "Trinity API 网关支持哪些模型？",
    soa7d: 55,
    soaTone: "good",
    signals: [{ label: "正面", tone: "ok" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q08" } },
  },
  {
    id: "Q09",
    type: "场景词",
    status: "active",
    text: "我在做 AI 应用，怎么降低多模型接入成本？",
    soa7d: 18,
    soaTone: "mid",
    signals: [{ label: "—", tone: "muted" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q09" } },
  },
  {
    id: "Q10",
    type: "场景词",
    status: "paused",
    text: "团队想统一计费、统一看用量，选什么平台？",
    soa7d: null,
    signals: [{ label: "—", tone: "muted" }],
    detail: { name: "geo-keyword-detail", query: { q: "Q10" } },
  },
];

export const AI_SUGGESTIONS: AiSuggestion[] = [
  {
    id: "ai-1",
    type: "品类词",
    text: "2025 年值得用的 LLM API 网关有哪些？",
    label: "品类 · 2025 年值得用的 LLM API 网关有哪些？",
    checked: true,
  },
  {
    id: "ai-2",
    type: "对比词",
    text: "Trinity Desk 对比 OpenRouter 在国内延迟和模型覆盖上怎么样？",
    label: "对比 · Trinity vs OpenRouter 国内体验",
    checked: true,
  },
  {
    id: "ai-3",
    type: "场景词",
    text: "创业公司如何选一个 API 聚合平台控制 token 成本？",
    label: "场景 · 创业公司控制 token 成本",
    checked: false,
  },
  {
    id: "ai-4",
    type: "品牌词",
    text: "Trinity AI 和硅基流动比有什么区别？",
    label: "品牌 · Trinity vs 硅基流动",
    checked: false,
  },
];

export const KEYWORD_TEMPLATES: KeywordTemplate[] = [
  {
    type: "品类词",
    text: "国内有哪些 OpenAI 兼容的大模型 API 聚合平台？",
    label: "品类 · API 聚合推荐",
  },
  {
    type: "对比词",
    text: "Trinity 和 OpenRouter 哪个更适合国内开发者？",
    label: "对比 · 与 OpenRouter",
  },
  {
    type: "场景词",
    text: "团队想统一计费、统一看用量，选什么平台？",
    label: "场景 · 统一计费",
  },
];

export function typeClass(type: QuestionType): string {
  if (type === "品类词") return "type-category";
  if (type === "品牌词") return "type-brand";
  if (type === "对比词") return "type-compare";
  return "type-scenario";
}

export function typeShort(type: QuestionType): string {
  if (type === "品类词") return "品类";
  if (type === "品牌词") return "品牌";
  if (type === "对比词") return "对比";
  return "场景";
}

export function countByType(questions: KeywordQuestion[]): Record<QuestionType, number> {
  const counts: Record<QuestionType, number> = {
    品类词: 0,
    品牌词: 0,
    对比词: 0,
    场景词: 0,
  };
  for (const q of questions) {
    if (q.status === "active") counts[q.type] += 1;
  }
  return counts;
}

export function nextQuestionId(questions: KeywordQuestion[]): string {
  const max = questions.reduce((n, q) => {
    const num = Number.parseInt(q.id.replace(/^Q/, ""), 10);
    return Number.isFinite(num) ? Math.max(n, num) : n;
  }, 0);
  return `Q${String(max + 1).padStart(2, "0")}`;
}
