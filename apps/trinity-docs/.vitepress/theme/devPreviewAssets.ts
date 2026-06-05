/** 开发预览：将 Markdown 内站内绝对路径补全为 VitePress base（如 /docs/images/...） */
export function resolveDevPreviewAssetUrl(href: string): string {
  if (!href || /^(https?:|data:|\/\/)/i.test(href)) return href;
  const base = (import.meta.env.BASE_URL || "/docs/").replace(/\/$/, "");
  if (href.startsWith("/")) {
    if (base && (href === base || href.startsWith(`${base}/`))) return href;
    return `${base}${href}`;
  }
  return href;
}

/** 修正预览 HTML 中 img 的 src（含正文里的原生 <img>） */
export function fixPreviewHtmlAssetUrls(html: string): string {
  return html.replace(
    /(<img\b[^>]*\ssrc=)(["'])([^"']+)\2/gi,
    (_full, prefix: string, quote: string, src: string) => {
      const fixed = resolveDevPreviewAssetUrl(src);
      return `${prefix}${quote}${fixed}${quote}`;
    },
  );
}
