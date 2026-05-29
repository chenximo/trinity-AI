import { marked } from "marked";

function prettifyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw.trim();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 轻量 JSON 着色（不引入 highlight.js） */
function highlightJsonHtml(pretty: string): string {
  const escaped = escapeHtml(pretty);
  return escaped
    .replace(/"([^"\\]*(?:\\.[^"\\]*)*)"(?=\s*:)/g, '<span class="api-json-k">"$1"</span>')
    .replace(/:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, ': <span class="api-json-s">"$1"</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="api-json-n">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="api-json-b">$1</span>');
}

marked.use({
  renderer: {
    code({ text, lang }) {
      const language = (lang || "").trim().toLowerCase();
      if (language === "json") {
        const pretty = prettifyJson(text);
        return `<div class="api-json-module" data-api-json-module>
  <div class="api-json-module__head">
    <span class="api-json-module__badge">JSON</span>
    <span class="api-json-module__hint">请求 / 响应示例</span>
    <button type="button" class="api-json-module__copy" data-api-json-copy>复制</button>
  </div>
  <pre class="api-json-module__body"><code>${highlightJsonHtml(pretty)}</code></pre>
</div>`;
      }
      if (language === "bash" || language === "shell" || language === "sh") {
        return `<div class="api-shell-module" data-api-shell-module>
  <div class="api-json-module__head">
    <span class="api-json-module__badge api-json-module__badge--shell">${language.toUpperCase()}</span>
    <button type="button" class="api-json-module__copy" data-api-json-copy>复制</button>
  </div>
  <pre class="api-json-module__body api-json-module__body--shell"><code>${escapeHtml(text.trim())}</code></pre>
</div>`;
      }
      return `<pre class="api-code-block"><code class="language-${escapeHtml(language)}">${escapeHtml(text)}</code></pre>`;
    },
  },
});

export function renderApiDocMarkdown(md: string): string {
  return marked.parse(md, { gfm: true, breaks: false }) as string;
}
