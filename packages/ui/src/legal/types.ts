/** 协议页路由 name（各应用注册 `getTrinityLegalChildRoutes()` 时须一致） */
export const TRINITY_LEGAL_ROUTE_NAMES = {
  privacy: "trinity-legal-privacy",
  terms: "trinity-legal-terms",
  modelTerms: "trinity-legal-model-terms",
} as const;

export type TrinityLegalRouteKey = keyof typeof TRINITY_LEGAL_ROUTE_NAMES;

/** 相对路径（无 router 时作 href 回退） */
export const TRINITY_LEGAL_PATHS = {
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  modelTerms: "/legal/model-terms",
} as const;

export type LegalTbdBlock = {
  kind: "tbd";
  title: string;
  lines?: string[];
  table?: { headers: string[]; rows: string[][] };
};

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "h3"; text: string }
  | LegalTbdBlock
  | { kind: "table"; headers: string[]; rows: string[][] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};
