/** 文档页：页内锚点滚动（MVP；接 CMS 后可改为路由 hash 或独立章节路由） */

export function scrollToDocSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    history.replaceState(null, "", `#${sectionId}`);
  } catch {
    /* ignore */
  }
}

/** 进入页时若 URL 带 hash，滚动到对应章节 */
export function syncDocsHashOnMount(): void {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;
  requestAnimationFrame(() => scrollToDocSection(hash));
}
