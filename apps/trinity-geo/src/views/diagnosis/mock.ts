/** 诊断列表 · Mock 与纯函数 */

export type DiagRule = "d1" | "d2" | "d3" | "d4" | "d5";
export type DiagPriority = "p0" | "p1" | "p2";
export type DiagTypeFilter = "all" | DiagRule;
export type DiagPriorityFilter = "all" | DiagPriority;

export interface DiagLink {
  name: string;
  query?: Record<string, string>;
  hash?: string;
}

export interface DiagKpi {
  label: string;
  value: string;
  delta: string;
  tone: "warn" | "neutral";
  deltaLink?: DiagLink;
}

export interface DiagSpotlight {
  id: string;
  priority: DiagPriority;
  rule: DiagRule;
  titleStrong: string;
  titleRest: string;
  fact: string;
  links: { label: string; to: DiagLink }[];
}

export interface DiagnosisRow {
  rowId?: string;
  priority: DiagPriority;
  rule: DiagRule;
  questionId: string;
  questionTitle: string;
  questionLink: DiagLink;
  platform: string;
  platformClass?: string;
  platformSplit?: string;
  gaps: string[] | null;
  evidence: string;
  actions: { label: string; to: DiagLink }[];
  searchText: string;
  rowClass?: string;
}

export interface RuleRow {
  rule: DiagRule;
  condition: string;
  conclusion: string;
}

export interface GapRuleRow {
  gap: string;
  condition: string;
  action: string;
  actionLink?: DiagLink;
}

export const DIAG_TYPE_FILTERS: { id: DiagTypeFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "d1", label: "D1" },
  { id: "d2", label: "D2" },
  { id: "d3", label: "D3" },
  { id: "d4", label: "D4" },
  { id: "d5", label: "D5" },
];

export const DIAG_PRIORITY_FILTERS: { id: DiagPriorityFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "p0", label: "P0" },
  { id: "p1", label: "P1" },
  { id: "p2", label: "P2" },
];

export const DIAG_KPIS: DiagKpi[] = [
  { label: "P0 待处理", value: "1", delta: "品类 / 对比失声", tone: "warn" },
  { label: "P1", value: "2", delta: "弱提及 / 叙事落后", tone: "neutral" },
  { label: "开放诊断", value: "5", delta: "近 7 日 +2", tone: "neutral" },
  {
    label: "已关联优化",
    value: "4",
    delta: "待办 →",
    tone: "neutral",
    deltaLink: { name: "geo-optimize" },
  },
];

export const DIAG_SPOTLIGHT: DiagSpotlight = {
  id: "diag-q00",
  priority: "p0",
  rule: "d1",
  titleStrong: "Q00",
  titleRest: "品类失声 · 豆包",
  fact: "16 参考链 · 我方域 0 · S1+S2+S3",
  links: [
    { label: "信源盘", to: { name: "geo-answer-detail", hash: "#cite-heading" } },
    { label: "优化", to: { name: "geo-optimize", hash: "#opt-s1s2" } },
  ],
};

export const DIAGNOSIS_ROWS: DiagnosisRow[] = [
  {
    rowId: "diag-row-q00",
    priority: "p0",
    rule: "d1",
    questionId: "Q00",
    questionTitle: "推荐两款 API 聚合平台",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q00" } },
    platform: "豆包",
    platformClass: "p-domestic",
    gaps: ["S1", "S2", "S3"],
    evidence: "未提及 Trinity；16 链 0 我方域",
    actions: [
      { label: "回答", to: { name: "geo-answer-detail" } },
      { label: "优化", to: { name: "geo-optimize", hash: "#opt-s1s2" } },
    ],
    searchText: "q00 推荐两款 api 聚合平台 品类失声",
    rowClass: "geo-diag-row-p0",
  },
  {
    priority: "p1",
    rule: "d4",
    questionId: "Q06",
    questionTitle: "Trinity 和 OpenRouter 哪个更适合国内开发者？",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q06" } },
    platform: "豆包",
    platformClass: "p-domestic",
    gaps: null,
    evidence: "竞品首推 OpenRouter，我方仅末段提及",
    actions: [
      { label: "问题", to: { name: "geo-keyword-detail", query: { q: "Q06" } } },
      { label: "优化", to: { name: "geo-optimize", hash: "#opt-d4" } },
    ],
    searchText: "q06 trinity openrouter 国内开发者 叙事",
  },
  {
    priority: "p1",
    rule: "d3",
    questionId: "Q02",
    questionTitle: "trinitydesk.ai 是什么平台？",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q02" } },
    platform: "DeepSeek",
    platformClass: "p-domestic",
    gaps: null,
    evidence: "品牌名脚注式一句，未进推荐段",
    actions: [
      { label: "问题", to: { name: "geo-keyword-detail", query: { q: "Q02" } } },
      { label: "优化", to: { name: "geo-optimize", hash: "#opt-d3" } },
    ],
    searchText: "q02 trinitydesk 弱提及",
  },
  {
    priority: "p2",
    rule: "d2",
    questionId: "Q01",
    questionTitle: "Trinity AI 好用吗？",
    questionLink: { name: "geo-answer-detail-brand" },
    platform: "元宝",
    platformClass: "p-domestic",
    gaps: null,
    evidence: "讨论 API 网关但未映射 Trinity 实体",
    actions: [
      { label: "别名", to: { name: "geo-settings-brand" } },
      { label: "优化", to: { name: "geo-optimize", hash: "#opt-d2" } },
    ],
    searchText: "q01 trinity ai 好用 未识别",
  },
  {
    priority: "p2",
    rule: "d5",
    questionId: "Q03",
    questionTitle: "国内 OpenAI 兼容 API 聚合",
    questionLink: { name: "geo-keyword-detail", query: { q: "Q03" } },
    platformSplit: "ChatGPT 24% · 豆包 12%",
    gaps: ["S6"],
    evidence: "海内外叙事不一致，国内引用国产竞品为主",
    actions: [
      { label: "问题", to: { name: "geo-keyword-detail", query: { q: "Q03" } } },
      { label: "优化", to: { name: "geo-optimize" } },
    ],
    searchText: "q03 openai 兼容 市场割裂",
  },
];

export const DIAG_RULE_ROWS: RuleRow[] = [
  { rule: "d1", condition: "品牌未提及且竞品进答案", conclusion: "品类失声" },
  { rule: "d2", condition: "品牌问法未识别", conclusion: "别名/收录" },
  { rule: "d3", condition: "提及但未进正文", conclusion: "弱提及" },
  { rule: "d4", condition: "末段提及且竞品首推", conclusion: "叙事落后" },
  { rule: "d5", condition: "海内外 SOA 显著差", conclusion: "市场割裂" },
];

export const GAP_RULE_ROWS: GapRuleRow[] = [
  { gap: "S1", condition: "参考盘无我方域", action: "建官方文档树" },
  { gap: "S2", condition: "竞品官方链占多数", action: "对标 /docs" },
  { gap: "S3", condition: "第三方评测定型", action: "公域渗透" },
  { gap: "S4", condition: "有页不可引", action: "页面审计", actionLink: { name: "geo-audit" } },
];

export const OPEN_DIAG_COUNT = DIAGNOSIS_ROWS.length;

export function filterDiagnosisRows(
  rows: DiagnosisRow[],
  typeFilter: DiagTypeFilter,
  priorityFilter: DiagPriorityFilter,
  query: string,
): DiagnosisRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchType = typeFilter === "all" || row.rule === typeFilter;
    const matchPri = priorityFilter === "all" || row.priority === priorityFilter;
    const matchQuery = !q || row.searchText.toLowerCase().includes(q);
    return matchType && matchPri && matchQuery;
  });
}
