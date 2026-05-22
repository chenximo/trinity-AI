/** 顶栏二级导航与侧栏分组（对齐 OpenRouter Docs / API Reference） */

export const DOCS_SUBNAV = [
  { id: "docs" as const, label: "文档", href: "/quickstart" },
  { id: "api" as const, label: "API", href: "/api/overview" },
];

/** 将 relativePath 或带 base 的 pathname 规范为站点内路径（如 /api/chat-completions） */
export function normalizeDocPath(input: string): string {
  let p = (input || "").split("#")[0].split("?")[0].replace(/\\/g, "/");
  p = p.replace(/\.md$/i, "").replace(/\/index$/i, "");
  if (p.startsWith("/docs/")) p = p.slice(5);
  else if (p === "/docs") p = "/";
  if (!p.startsWith("/")) p = `/${p}`;
  return p.replace(/\/+$/, "") || "/";
}

export function isApiSection(input: string): boolean {
  const p = normalizeDocPath(input);
  return p === "/api" || p.startsWith("/api/");
}
