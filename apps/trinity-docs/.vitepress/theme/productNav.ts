/** 与 trinitydesk.ai / trinity-ai 壳层主导航对齐 */

export const PRODUCT_HOME = "https://trinitydesk.ai/";
export const PRODUCT_MODELS = "https://trinitydesk.ai/models";
export const PRODUCT_CHAT = "https://trinitydesk.ai/chat";

export type ProductNavId = "home" | "models" | "chat" | "docs";

export type ProductNavItem = {
  id: ProductNavId;
  labelZh: string;
  labelEn: string;
  href?: string;
  /** 文档站内链，不设 href */
  docsInternal?: boolean;
};

export const PRODUCT_NAV: ProductNavItem[] = [
  { id: "home", labelZh: "首页", labelEn: "Home", href: PRODUCT_HOME },
  { id: "models", labelZh: "模型", labelEn: "Models", href: PRODUCT_MODELS },
  { id: "chat", labelZh: "对话", labelEn: "Chat", href: PRODUCT_CHAT },
  { id: "docs", labelZh: "文档", labelEn: "Docs", docsInternal: true },
];
