/** 品牌设置 · Mock 数据与纯函数 */

export type AliasType = "品牌" | "域名" | "产品名";

export interface BrandAlias {
  id: string;
  name: string;
  type: AliasType;
  enabled: boolean;
  isPrimary?: boolean;
  locked?: boolean;
  search: string;
}

export interface BrandForm {
  primaryName: string;
  industry: string;
  productUrl: string;
  docUrl: string;
  tagline: string;
}

export const BRAND_ENTITY_ID = "trinity";

export const SUGGESTED_ALIASES = ["TrinityDesk", "Trinity 大模型网关", "trinity.ai"];

export const INITIAL_BRAND_FORM: BrandForm = {
  primaryName: "Trinity AI",
  industry: "ai-api",
  productUrl: "https://trinitydesk.ai/",
  docUrl: "https://doc.trinitydesk.ai/",
  tagline: "一个 API 接入百余款大模型",
};

export const INITIAL_ALIASES: BrandAlias[] = [
  {
    id: "alias-primary",
    name: "Trinity AI",
    type: "品牌",
    enabled: true,
    isPrimary: true,
    locked: true,
    search: "trinity ai 品牌 主名称",
  },
  { id: "alias-1", name: "Trinity", type: "品牌", enabled: true, search: "trinity 品牌" },
  { id: "alias-2", name: "Trinity Desk", type: "品牌", enabled: true, search: "trinity desk 品牌" },
  { id: "alias-3", name: "trinitydesk", type: "域名", enabled: true, search: "trinitydesk 域名" },
  {
    id: "alias-4",
    name: "trinitydesk.ai",
    type: "域名",
    enabled: true,
    search: "trinitydesk.ai 域名",
  },
  { id: "alias-5", name: "Trinitydesk", type: "品牌", enabled: true, search: "trinitydesk 品牌" },
  { id: "alias-6", name: "Trinity 聚合", type: "品牌", enabled: true, search: "trinity 聚合 品牌" },
  { id: "alias-7", name: "Trinity API", type: "产品名", enabled: true, search: "trinity api 产品" },
];

export type RecalcStatus = "无" | "保存后排队" | "队列中" | "重算中…";

export function nextAliasId(aliases: BrandAlias[]): string {
  let n = aliases.length;
  while (aliases.some((a) => a.id === `alias-${n}`)) n += 1;
  return `alias-${n}`;
}

export function countEnabled(aliases: BrandAlias[]): number {
  return aliases.filter((a) => a.enabled).length;
}
