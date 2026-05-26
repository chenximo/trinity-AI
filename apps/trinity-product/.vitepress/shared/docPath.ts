/** 去掉 base 前缀，得到页面 slug */
export function normalizePageSlug(raw: string, baseUrl = "/product/"): string {
  let s = raw.replace(/^\/+/, "").replace(/\/+$/, "");
  const base = baseUrl.replace(/^\/+|\/+$/g, "");
  if (base && (s === base || s.startsWith(`${base}/`))) {
    s = s === base ? "" : s.slice(base.length + 1);
  }
  if (s.startsWith("docs/")) s = s.slice(5);
  if (s === "docs") s = "";
  return s;
}

/** 路由 slug → `docs/` 目录内 `*.md` */
export function pageSlugToMdRel(slug: string, baseUrl = "/product/"): string {
  const cleaned = normalizePageSlug(slug, baseUrl);
  return cleaned ? `${cleaned}.md` : "index.md";
}
