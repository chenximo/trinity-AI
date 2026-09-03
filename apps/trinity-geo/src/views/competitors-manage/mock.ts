/** 竞品管理 · Mock 数据与纯函数 */

import type { RouteLocationRaw } from "vue-router";

export type CompMarket = "overseas" | "domestic" | "both";
export type CompStatus = "active" | "paused";
export type MarketFilter = "all" | CompMarket;
export type StatusFilter = "all" | "active" | "paused";

export interface CompetitorRow {
  id: string;
  name: string;
  market: CompMarket;
  status: CompStatus;
  soa7d: number | null;
  soaDetailLink?: RouteLocationRaw;
  aliases: string[];
  expanded: boolean;
  search: string;
}

export interface AiCompSuggestion {
  id: string;
  name: string;
  market: CompMarket;
  alias: string;
  checked: boolean;
}

export const QUOTA_MAX = 10;
export const QUOTA_PLAN = "专业版";

export const MARKET_FILTER_OPTIONS: { value: MarketFilter; label: string }[] = [
  { value: "all", label: "全部市场" },
  { value: "overseas", label: "海外" },
  { value: "domestic", label: "国内" },
  { value: "both", label: "双市场" },
];

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "active", label: "监测中" },
  { value: "paused", label: "已暂停" },
];

export const INITIAL_COMPETITORS: CompetitorRow[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    market: "overseas",
    status: "active",
    soa7d: 52,
    soaDetailLink: { name: "geo-competitor-detail" },
    aliases: ["OpenRouter", "openrouter", "openrouter.ai"],
    expanded: false,
    search: "openrouter openrouter.ai",
  },
  {
    id: "tokenhub",
    name: "TokenHub",
    market: "domestic",
    status: "active",
    soa7d: 46,
    soaDetailLink: { name: "geo-competitor-detail", query: { id: "tokenhub" } },
    aliases: ["TokenHub", "腾讯云TokenHub", "腾讯云 TokenHub", "腾讯 TokenHub"],
    expanded: false,
    search: "tokenhub 腾讯云tokenhub 腾讯",
  },
  {
    id: "litellm",
    name: "LiteLLM",
    market: "overseas",
    status: "active",
    soa7d: 14,
    soaDetailLink: { name: "geo-competitor-detail", query: { id: "litellm" } },
    aliases: ["LiteLLM", "litellm"],
    expanded: false,
    search: "litellm",
  },
  {
    id: "oneapi",
    name: "One API",
    market: "both",
    status: "active",
    soa7d: null,
    aliases: ["One API", "OneAPI", "one-api", "new-api"],
    expanded: false,
    search: "oneapi one-api new-api",
  },
  {
    id: "siliconflow",
    name: "硅基流动",
    market: "domestic",
    status: "active",
    soa7d: 11,
    soaDetailLink: { name: "geo-competitor-detail", query: { id: "siliconflow" } },
    aliases: ["硅基流动", "SiliconFlow", "siliconflow"],
    expanded: false,
    search: "siliconflow 硅基流动",
  },
  {
    id: "portkey",
    name: "Portkey",
    market: "overseas",
    status: "active",
    soa7d: null,
    aliases: ["Portkey", "portkey"],
    expanded: false,
    search: "portkey",
  },
];

export const AI_COMP_SUGGESTIONS: AiCompSuggestion[] = [
  { id: "ai-1", name: "Together AI", market: "overseas", alias: "Together AI", checked: false },
  { id: "ai-2", name: "火山方舟", market: "domestic", alias: "火山方舟", checked: false },
];

export function marketLabel(market: CompMarket): { text: string; cls: string } {
  if (market === "domestic") return { text: "国内", cls: "domestic" };
  if (market === "both") return { text: "双市场", cls: "both" };
  return { text: "海外", cls: "overseas" };
}

export function slugify(name: string, seq: number): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || `competitor-${seq}`;
  return base;
}

export function aliasPreview(aliases: string[]): string {
  const parts = aliases.slice(1);
  const text = parts.join("、");
  if (!text) return "—";
  return text.length > 36 ? `${text.slice(0, 34)}…` : text;
}

export function buildSearchText(name: string, market: CompMarket, aliases: string[]): string {
  return `${name} ${aliases.join(" ")} ${market}`.toLowerCase();
}

export function countByMarket(rows: CompetitorRow[]): Record<MarketFilter, number> {
  const counts: Record<MarketFilter, number> = {
    all: rows.length,
    overseas: 0,
    domestic: 0,
    both: 0,
  };
  for (const row of rows) counts[row.market] += 1;
  return counts;
}

export function totalAliases(rows: CompetitorRow[]): number {
  return rows.reduce((sum, row) => sum + row.aliases.length, 0);
}
