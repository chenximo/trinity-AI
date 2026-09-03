/** 营销站顶栏 · 导航与套件链接（可后续与 AI 云 / Trinity AI 统一） */

export interface MarketingNavItem {
  id: string;
  label: string;
  hash: string;
}

export interface MarketingSuiteLink {
  label: string;
  href: string;
}

export const MARKETING_NAV_ITEMS: MarketingNavItem[] = [
  { id: "soa", label: "SOA 是什么", hash: "#soa" },
  { id: "platforms", label: "平台覆盖", hash: "#platforms" },
  { id: "features", label: "产品能力", hash: "#features" },
  { id: "compare", label: "为何选我们", hash: "#compare" },
  { id: "pricing", label: "定价", hash: "#pricing" },
];

/** 套件切换：门户下同源路径；独立 5203 时链到 dev hub 或外链 */
export const MARKETING_SUITE_LINKS: MarketingSuiteLink[] = [
  { label: "AI 云", href: "/ai-cloud" },
  { label: "Trinity AI", href: "/trinity-ai" },
];

export const GEO_LOGO_TAG = "可见性";
