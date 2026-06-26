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

/** 是否为子目录子能力表 `roadmap.yml`（含 `ai-cloud/roadmap.yml`） */
export function isRoadmapYamlRel(rel: string): boolean {
  const r = rel.trim().replace(/^\//, "").replace(/\\/g, "/");
  return r.endsWith("roadmap.yml") || r.endsWith(".roadmap.yml");
}

/** 周进度：`week-progress-index.yml` 或单月 `week-progress-N.yml` */
export function isWeekProgressYamlRel(rel: string): boolean {
  const r = rel.trim().replace(/^\//, "").replace(/\\/g, "/");
  return (
    r.endsWith("week-progress-index.yml") ||
    /week-progress-\d+\.yml$/i.test(r) ||
    r.endsWith("week-progress.yml")
  );
}

/** 聚合产品总览待办池 `product-backlog.yml` */
export function isProductBacklogYamlRel(rel: string): boolean {
  const r = rel.trim().replace(/^\//, "").replace(/\\/g, "/");
  return r.endsWith("product-backlog.yml");
}

/** 聚合产品迭代版本 `release-notes.yml` */
export function isReleaseNotesYamlRel(rel: string): boolean {
  const r = rel.trim().replace(/^\//, "").replace(/\\/g, "/");
  return r.endsWith("release-notes.yml");
}

/** 手册可经 dev API / 静态发布的 YAML（子能力表、周进度等） */
export function isProductYamlRel(rel: string): boolean {
  return (
    isRoadmapYamlRel(rel) ||
    isWeekProgressYamlRel(rel) ||
    isProductBacklogYamlRel(rel) ||
    isReleaseNotesYamlRel(rel)
  );
}

/** API `rel` 参数规范化：已有 .md / .yml 则不再追加 .md */
export function normalizeDocsRelParam(rel: string): string {
  const r = rel.trim().replace(/^\//, "").replace(/\\/g, "/");
  if (!r) return r;
  if (r.endsWith(".md") || r.endsWith(".yml") || r.endsWith(".yaml")) return r;
  return `${r}.md`;
}
