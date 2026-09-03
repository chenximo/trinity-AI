/** 效果验证 · Mock 与纯函数 */

export type VerifyType = "cite-first" | "soa-sync";
export type VerifyTypeFilter = "all" | VerifyType;
export type VerifyBadge = "partial" | "ok";

export interface VerifyLink {
  name?: string;
  hash?: string;
  href?: string;
  query?: Record<string, string>;
}

export interface VerifyKpi {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "neutral";
  valueSm?: boolean;
}

export interface VerifySpotlight {
  id: string;
  filter: VerifyType;
  badge: VerifyBadge;
  badgeLabel: string;
  titleStrong: string;
  titleRest: string;
  fact: string;
  searchText: string;
  links: { label: string; to: VerifyLink }[];
}

export interface VerifyIndexRow {
  filter: VerifyType;
  badge: VerifyBadge;
  badgeLabel: string;
  questionId: string;
  questionTitle: string;
  detailHash: string;
  platform: string;
  citeTrend: string;
  citeTrendClass: "ok" | "flat";
  soaTrend: string;
  soaTrendClass: "ok" | "flat";
  actionId: string;
  actionLink: VerifyLink;
  searchText: string;
}

export interface VerifyR12Row {
  label: string;
  r1: string;
  r2: string;
  r1Class?: "bad" | "ok";
  r2Class?: "bad" | "ok";
  r1Gap?: boolean;
  r2Gap?: boolean;
  delta: string;
  deltaClass?: "flat";
  primary?: boolean;
}

export interface VerifyAddedCite {
  href: string;
  label: string;
  tag: string;
  desc: string;
}

export interface VerifyCase {
  id: string;
  filter: VerifyType;
  badge: VerifyBadge;
  badgeLabel: string;
  title: string;
  metaBefore: string;
  metaActionLabel: string;
  metaAfter: string;
  metaActionLink: VerifyLink;
  verdict: string;
  r12Rows: VerifyR12Row[];
  addedSummary: string;
  addedCites: VerifyAddedCite[];
  addedHintPrefix: string;
  addedHintLinks: { label: string; to: VerifyLink }[];
  addedHintCode?: string;
  footerLinks: { label: string; to: VerifyLink }[];
  searchText: string;
}

export interface VerifyRuleRow {
  metric: string;
  meaning: string;
  order: string;
}

export const VERIFY_TYPE_FILTERS: { id: VerifyTypeFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "cite-first", label: "信源先行" },
  { id: "soa-sync", label: "SOA 同步" },
];

export const VERIFY_KPIS: VerifyKpi[] = [
  { label: "待验证", value: "2", delta: "Q00 + Q01", tone: "primary" },
  { label: "信源盘 Δ", value: "0→1", delta: "Q00 我方域", tone: "neutral", valueSm: true },
  { label: "CCR Δ", value: "1/3→2/3", delta: "Q01 双平台", tone: "neutral", valueSm: true },
  { label: "SOA Δ", value: "+6pt", delta: "Q01 · Q00 仍为 0%", tone: "neutral", valueSm: true },
];

export const VERIFY_SPOTLIGHT: VerifySpotlight = {
  id: "verify-q00",
  filter: "cite-first",
  badge: "partial",
  badgeLabel: "部分改善",
  titleStrong: "Q00",
  titleRest: "· 豆包 · opt-s1s2",
  fact: "信源 0/16→1/17 · SOA 0% 未变 · S1 缓解",
  searchText: "q00 豆包 opt-s1s2 api 聚合 信源 部分改善",
  links: [
    { label: "信源盘", to: { name: "geo-answer-detail", hash: "#cite-heading" } },
    { label: "动作", to: { name: "geo-optimize", hash: "#opt-s1s2" } },
    { label: "明细 ↓", to: { hash: "#verify-q00-detail" } },
  ],
};

export const VERIFY_INDEX_ROWS: VerifyIndexRow[] = [
  {
    filter: "cite-first",
    badge: "partial",
    badgeLabel: "部分",
    questionId: "Q00",
    questionTitle: "API 聚合推荐",
    detailHash: "#verify-q00-detail",
    platform: "豆包",
    citeTrend: "0/16 → 1/17",
    citeTrendClass: "ok",
    soaTrend: "0% → 0%",
    soaTrendClass: "flat",
    actionId: "s1s2",
    actionLink: { name: "geo-optimize", hash: "#opt-s1s2" },
    searchText: "q00 豆包 opt-s1s2 api 聚合 信源",
  },
  {
    filter: "soa-sync",
    badge: "ok",
    badgeLabel: "CCR",
    questionId: "Q01",
    questionTitle: "Trinity 好用吗",
    detailHash: "#verify-q01-detail",
    platform: "ChatGPT + 豆包",
    citeTrend: "CCR 1/3 → 2/3",
    citeTrendClass: "ok",
    soaTrend: "62% → 68%",
    soaTrendClass: "ok",
    actionId: "d3",
    actionLink: { name: "geo-optimize", hash: "#opt-d3" },
    searchText: "q01 chatgpt 豆包 opt-d3 ccr 定价",
  },
];

export const VERIFY_CASES: VerifyCase[] = [
  {
    id: "verify-q00-detail",
    filter: "cite-first",
    badge: "partial",
    badgeLabel: "部分改善",
    title: "Q00 · 推荐两款 API 聚合平台",
    metaBefore: "豆包 · ",
    metaActionLabel: "opt-s1s2",
    metaAfter: " · R1 6/16 → R2 6/20",
    metaActionLink: { name: "geo-optimize", hash: "#opt-s1s2" },
    verdict:
      "信源盘先行（S1 部分缓解）；SOA 仍为 0% — 符合「先进盘、后进答案」。缺口 S2、S3 仍在。",
    r12Rows: [
      {
        label: "信源盘 · 我方域",
        r1: "0/16",
        r2: "1/17",
        r1Class: "bad",
        r2Class: "ok",
        delta: "↑ 先进盘",
        primary: true,
      },
      {
        label: "SOA",
        r1: "0%",
        r2: "0%",
        r1Class: "bad",
        r2Class: "bad",
        delta: "— 未变",
        deltaClass: "flat",
      },
      {
        label: "缺口",
        r1: "S1+S2+S3",
        r2: "S2+S3",
        r1Gap: true,
        r2Gap: true,
        delta: "S1 缓解",
      },
    ],
    addedSummary: "R2 新增 1 条我方参考链",
    addedCites: [
      {
        href: "https://doc.trinitydesk.ai/docs/api-aggregation",
        label: "doc.trinitydesk.ai/docs/api-aggregation",
        tag: "R2",
        desc: "API 聚合选型指南",
      },
    ],
    addedHintPrefix: "R1 ",
    addedHintLinks: [
      { label: "16 链全表", to: { name: "geo-answer-detail", hash: "#cite-heading" } },
    ],
    addedHintCode: "mvp/data/r2/cited_sources.json",
    footerLinks: [
      { label: "R1 回答与信源", to: { name: "geo-answer-detail", hash: "#cite-heading" } },
      { label: "诊断", to: { name: "geo-diagnosis", hash: "#diag-q00" } },
      { label: "继续 S3 渗透", to: { name: "geo-optimize", hash: "#opt-s3" } },
    ],
    searchText: "q00 豆包 opt-s1s2 api 聚合 信源",
  },
  {
    id: "verify-q01-detail",
    filter: "soa-sync",
    badge: "ok",
    badgeLabel: "CCR 改善",
    title: "Q01 · Trinity AI 好用吗？",
    metaBefore: "ChatGPT + 豆包 · ",
    metaActionLabel: "opt-d3",
    metaAfter: " · R1 6/14 → R2 6/18",
    metaActionLink: { name: "geo-optimize", hash: "#opt-d3" },
    verdict: "定价页审计 74（+6）后 CCR 扩至双平台；SOA +6pt。与 Q00「先进盘」形成对照样本。",
    r12Rows: [
      {
        label: "CCR 命中",
        r1: "1/3",
        r2: "2/3",
        r1Class: "ok",
        r2Class: "ok",
        delta: "↑ 双平台",
        primary: true,
      },
      {
        label: "SOA",
        r1: "62%",
        r2: "68%",
        r1Class: "ok",
        r2Class: "ok",
        delta: "↑ 6pt",
      },
      {
        label: "引用 URL",
        r1: "doc 首页",
        r2: "+ pricing",
        r1Gap: true,
        r2Gap: true,
        delta: "更精准",
      },
    ],
    addedSummary: "R2 新增 1 条引用链",
    addedCites: [
      {
        href: "https://trinitydesk.ai/pricing",
        label: "trinitydesk.ai/pricing",
        tag: "R2 · 豆包",
        desc: "按量计费 · 企业套餐",
      },
    ],
    addedHintPrefix: "R1 ",
    addedHintLinks: [
      { label: "Q01 回答", to: { name: "geo-answer-detail-brand" } },
      { label: "/pricing 74 分", to: { name: "geo-audit", hash: "#audit-pricing" } },
    ],
    footerLinks: [
      { label: "R1 回答（CCR+）", to: { name: "geo-answer-detail-brand" } },
      { label: "引用读口", to: { name: "geo-citations" } },
      { label: "情感 72%", to: { name: "geo-sentiment" } },
    ],
    searchText: "q01 chatgpt 豆包 opt-d3 ccr 定价",
  },
];

export const VERIFY_RULE_ROWS: VerifyRuleRow[] = [
  { metric: "信源盘 Δ", meaning: "我方域 M/N 是否增加", order: "① 往往最先" },
  { metric: "CCR Δ", meaning: "是否被当作依据引用", order: "② 与信源接近" },
  { metric: "SOA Δ", meaning: "是否进答案正文推荐", order: "③ 可滞后数轮" },
];

export const VERIFY_ITEM_COUNT = VERIFY_INDEX_ROWS.length;

function matchesFilter(
  filter: VerifyType,
  searchText: string,
  typeFilter: VerifyTypeFilter,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  const matchType = typeFilter === "all" || filter === typeFilter;
  const matchQuery = !q || searchText.toLowerCase().includes(q);
  return matchType && matchQuery;
}

export function filterVerifyIndexRows(
  rows: VerifyIndexRow[],
  typeFilter: VerifyTypeFilter,
  query: string,
): VerifyIndexRow[] {
  return rows.filter((row) => matchesFilter(row.filter, row.searchText, typeFilter, query));
}

export function filterVerifyCases(
  cases: VerifyCase[],
  typeFilter: VerifyTypeFilter,
  query: string,
): VerifyCase[] {
  return cases.filter((c) => matchesFilter(c.filter, c.searchText, typeFilter, query));
}

export function spotlightMatches(
  spotlight: VerifySpotlight,
  typeFilter: VerifyTypeFilter,
  query: string,
): boolean {
  return matchesFilter(spotlight.filter, spotlight.searchText, typeFilter, query);
}

/** 与原型 verify.js 一致 */
export function resolveVerifyHashTargetId(hash: string): string | null {
  const id = hash.replace(/^#/, "");
  if (!id) return null;
  if (document.getElementById(id)) return id;
  if (id === "verify-q00") {
    return document.getElementById("verify-q00-detail")
      ? "verify-q00-detail"
      : "verify-q00";
  }
  if (id === "verify-q01") return "verify-q01-detail";
  return null;
}

export function toRouterLink(link: VerifyLink) {
  if (link.name) {
    return { name: link.name, query: link.query, hash: link.hash };
  }
  return { hash: link.hash };
}
