import { marked } from "marked";
import { computed, nextTick, ref, watch, type ComputedRef } from "vue";
import { useData } from "vitepress";

const STORAGE_REOPEN = "tproduct-dev-editor-reopen";

marked.setOptions({ gfm: true, breaks: true });

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function mermaidBlocksFromMarked(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi,
    (_match, code: string) => `<div class="mermaid">${decodeHtmlEntities(code).trim()}</div>`,
  );
}

const API = `${(import.meta.env.BASE_URL || "/product/").replace(/\/?$/, "")}/__trinity_dev_product`;

const open = ref(false);
const loading = ref(false);
const saving = ref(false);
const savedOnce = ref(false);
const error = ref("");
const status = ref("");
const content = ref("");

let mermaidApi: typeof import("mermaid").default | null = null;

async function getMermaid() {
  if (import.meta.env.SSR) return null;
  if (!mermaidApi) {
    const mod = await import("mermaid");
    mermaidApi = mod.default;
    mermaidApi.initialize({ startOnLoad: false, securityLevel: "loose" });
  }
  return mermaidApi;
}

function setEditingClass(active: boolean) {
  if (import.meta.env.SSR) return;
  document.documentElement.classList.toggle("tdocs-editing", active);
}

async function renderMermaidInPreview() {
  if (import.meta.env.SSR) return;
  const mermaid = await getMermaid();
  if (!mermaid) return;
  const root = document.querySelector<HTMLElement>(".tdocs-dev-preview");
  if (!root) return;
  const nodes = root.querySelectorAll<HTMLElement>(".mermaid");
  if (!nodes.length) return;
  try {
    await mermaid.run({ nodes: Array.from(nodes) });
  } catch {
    /* 编辑中语法未完成 */
  }
}

let watchesBound = false;

function bindEditorWatches(
  mdRel: ComputedRef<string>,
  previewHtml: ComputedRef<string>,
  loadMd: () => Promise<void>,
) {
  if (watchesBound) return;
  watchesBound = true;

  watch(open, (active) => {
    setEditingClass(active);
  });

  watch(mdRel, () => {
    if (open.value) void loadMd();
  });

  watch([previewHtml, open], async () => {
    if (!open.value) return;
    await nextTick();
    await renderMermaidInPreview();
  });
}

export function useDevDocEditor() {
  const { page } = useData();
  const isDev = import.meta.env.DEV;
  const mdRel = computed(() => page.value.relativePath || "index.md");
  const isDocPage = computed(() => !page.value.isNotFound && Boolean(page.value.relativePath));
  const canEdit = computed(() => isDev && isDocPage.value);

  const previewHtml = computed(() => {
    if (!content.value.trim()) return "<p></p>";
    try {
      return mermaidBlocksFromMarked(marked.parse(content.value) as string);
    } catch {
      return "<p>预览解析失败</p>";
    }
  });

  async function loadMd() {
    loading.value = true;
    error.value = "";
    status.value = "";
    try {
      const rel = mdRel.value;
      const res = await fetch(`${API}/raw?rel=${encodeURIComponent(rel)}`);
      const data = (await res.json()) as { rel?: string; content?: string; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      content.value = data.content ?? "";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "加载失败";
    } finally {
      loading.value = false;
    }
  }

  bindEditorWatches(mdRel, previewHtml, loadMd);

  async function openEditor() {
    open.value = true;
    savedOnce.value = false;
    await loadMd();
  }

  function closeEditor() {
    const shouldReload = savedOnce.value;
    open.value = false;
    error.value = "";
    status.value = "";
    if (import.meta.env.SSR) return;
    sessionStorage.removeItem(STORAGE_REOPEN);
    if (shouldReload) location.reload();
  }

  async function parseApiError(res: Response): Promise<string> {
    const text = await res.text();
    try {
      const data = JSON.parse(text) as { error?: string };
      return data.error || text || `HTTP ${res.status}`;
    } catch {
      return text || `HTTP ${res.status}`;
    }
  }

  async function saveMd() {
    saving.value = true;
    error.value = "";
    status.value = "";
    try {
      const rel = mdRel.value;
      const res = await fetch(`${API}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rel, content: content.value }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      savedOnce.value = true;
      closeEditor();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "保存失败";
    } finally {
      saving.value = false;
    }
  }

  function tryReopenFromStorage() {
    if (!canEdit.value || import.meta.env.SSR) return;
    const reopenRel = sessionStorage.getItem(STORAGE_REOPEN);
    if (reopenRel && reopenRel === mdRel.value) {
      sessionStorage.removeItem(STORAGE_REOPEN);
      open.value = true;
      void loadMd();
    }
  }

  return {
    open,
    loading,
    saving,
    error,
    status,
    content,
    mdRel,
    canEdit,
    previewHtml,
    openEditor,
    closeEditor,
    saveMd,
    tryReopenFromStorage,
  };
}
