/** 去掉重复的 `docs/` 或 VitePress base 前缀，得到页面 slug（如 `quickstart`、`api/chat-completions`） */
export function normalizePageSlug(raw: string, baseUrl = "/docs/"): string {
  let s = raw.replace(/^\/+/, "").replace(/\/+$/, "");
  const base = baseUrl.replace(/^\/+|\/+$/g, "");
  if (base && (s === base || s.startsWith(`${base}/`))) {
    s = s === base ? "" : s.slice(base.length + 1);
  }
  if (s.startsWith("docs/")) s = s.slice(5);
  if (s === "docs") s = "";
  return s;
}

/** 路由 slug → `docs/` 目录内相对路径 `*.md` */
export function pageSlugToMdRel(slug: string, baseUrl = "/docs/"): string {
  const cleaned = normalizePageSlug(slug, baseUrl);
  return cleaned ? `${cleaned}.md` : "index.md";
}
