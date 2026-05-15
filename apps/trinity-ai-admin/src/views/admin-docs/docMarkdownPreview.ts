import DOMPurify from "dompurify";
import { marked } from "marked";

marked.use({ gfm: true, breaks: true });

/** Markdown → HTML，供运营后台文档编辑预览（经 DOMPurify 清理）。 */
export function renderDocMarkdown(md: string): string {
  const raw = marked.parse(md || "", { async: false }) as string;
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
