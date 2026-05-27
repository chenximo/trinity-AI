import { TRINITY_LEGAL_PATHS } from "../legal/types";

/** 静态页 / 无 router 时拼协议链接（含门户 `/trinity-ai` 前缀） */
export function resolveLegalHref(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return normalized;
  const pathname = (window.location.pathname || "").replace(/\\/g, "/");
  const m = pathname.match(/^(.*\/trinity-ai)\/?/i);
  if (m) return `${m[1]}${normalized}`;
  return normalized;
}

export const LEGAL_HREF = {
  terms: () => resolveLegalHref(TRINITY_LEGAL_PATHS.terms),
  privacy: () => resolveLegalHref(TRINITY_LEGAL_PATHS.privacy),
  modelTerms: () => resolveLegalHref(TRINITY_LEGAL_PATHS.modelTerms),
} as const;
