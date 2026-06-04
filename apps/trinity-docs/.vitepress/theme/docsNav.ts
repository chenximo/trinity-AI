/** 顶栏二级导航与侧栏分组（对齐 OpenRouter Docs / API / Cookbook） */

export type DocsSubNavId = "docs" | "api" | "cookbook";

const SUBNAV_ZH: { id: DocsSubNavId; label: string; href: string }[] = [
  { id: "docs", label: "文档", href: "/quickstart" },
  { id: "api", label: "API", href: "/api/overview" },
  { id: "cookbook", label: "应用场景", href: "/cookbook/" },
];

const SUBNAV_EN: { id: DocsSubNavId; label: string; href: string }[] = [
  { id: "docs", label: "Docs", href: "/en/quickstart" },
  { id: "api", label: "API", href: "/en/api/overview" },
  { id: "cookbook", label: "Cookbook", href: "/en/cookbook/" },
];

/** VitePress locale.path：`''` 为中文 root，`'/en'` 为英文 */
export function getDocsSubnav(localePath: string) {
  return localePath === "/en" ? SUBNAV_EN : SUBNAV_ZH;
}

/** 将 relativePath 或带 base 的 pathname 规范为站点内路径（如 /api/chat-completions） */
export function normalizeDocPath(input: string): string {
  let p = (input || "").split("#")[0].split("?")[0].replace(/\\/g, "/");
  p = p.replace(/\.md$/i, "").replace(/\/index$/i, "");
  if (p.startsWith("/docs/")) p = p.slice(5);
  else if (p === "/docs") p = "/";
  if (p.startsWith("en/")) p = p.slice(3);
  if (p.startsWith("/en/")) p = p.slice(4);
  else if (p === "/en") p = "/";
  if (!p.startsWith("/")) p = `/${p}`;
  return p.replace(/\/+$/, "") || "/";
}

export function isApiSection(input: string): boolean {
  const p = normalizeDocPath(input);
  return p === "/api" || p.startsWith("/api/");
}

export function isCookbookSection(input: string): boolean {
  const p = normalizeDocPath(input);
  return p === "/cookbook" || p.startsWith("/cookbook/");
}

export function activeSubNavId(relativePath: string): DocsSubNavId {
  if (isApiSection(relativePath)) return "api";
  if (isCookbookSection(relativePath)) return "cookbook";
  return "docs";
}
