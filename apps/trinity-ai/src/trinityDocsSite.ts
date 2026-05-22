/** VitePress 本地 dev 端口（与 portal :5173、GEO :5203 错开） */
export const TRINITY_DOCS_DEV_PORT =
  (import.meta.env.VITE_TRINITY_DOCS_DEV_PORT as string | undefined) || "5205";

export function getTrinityDocsDevOrigin(): string {
  return `http://127.0.0.1:${TRINITY_DOCS_DEV_PORT}`;
}

/**
 * 对外 API 文档完整 URL（apps/trinity-docs · VitePress）。
 * 浏览器内：优先同源 `/docs/`（枢纽 / trinity-ai dev 经 Vite 代理到 :5205，避免跨端口与 IDE 预览报错）。
 * 无 window 的 DEV：直连 `http://127.0.0.1:5205/docs/`。
 * 生产：同源 `/docs` 或 `VITE_TRINITY_DOCS_URL`。
 */
export function getTrinityDocsSiteUrl(path = ""): string {
  const configured = (import.meta.env.VITE_TRINITY_DOCS_URL as string | undefined)?.trim();
  const suffix = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (configured) {
    const base = configured.replace(/\/$/, "");
    return suffix ? `${base}${suffix}` : base;
  }

  if (typeof window !== "undefined") {
    const base = new URL("/docs", window.location.origin).href.replace(/\/$/, "");
    return suffix ? `${base}${suffix}` : `${base}/`;
  }

  if (import.meta.env.DEV) {
    const base = `${getTrinityDocsDevOrigin()}/docs`;
    return suffix ? `${base}${suffix}` : `${base}/`;
  }

  return suffix ? `/docs${suffix}` : "/docs";
}

/** 离开当前 SPA，打开文档站（枢纽 / trinity-ai 顶栏共用） */
export function openTrinityDocsSite(path = ""): void {
  window.location.assign(getTrinityDocsSiteUrl(path));
}
