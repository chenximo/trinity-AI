import { marked } from "marked";
import { computed, nextTick, ref, watch, type ComputedRef } from "vue";
import { useData } from "vitepress";
import { bindPreviewImageResize } from "./devPreviewImageResize";

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

function isImageMime(mime: string): boolean {
  return mime.toLowerCase().startsWith("image/");
}

/** 从剪贴板提取图片（兼容 macOS 截图、files / items 两种来源） */
function getClipboardImageFile(e: ClipboardEvent): File | null {
  const dt = e.clipboardData;
  if (!dt) return null;

  if (dt.files?.length) {
    for (const file of dt.files) {
      if (isImageMime(file.type) || (!file.type && file.size > 0)) return file;
    }
  }

  for (const item of dt.items) {
    if (item.kind !== "file") continue;
    const type = item.type.toLowerCase();
    if (!isImageMime(type)) continue;
    const file = item.getAsFile();
    if (file) return file;
  }

  return null;
}

const open = ref(false);
const loading = ref(false);
const saving = ref(false);
const uploadingImage = ref(false);
const cosEnabled = ref<boolean | null>(null);
const savedOnce = ref(false);
const error = ref("");
const status = ref("");
const content = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const previewRef = ref<HTMLElement | null>(null);

let mermaidApi: typeof import("mermaid").default | null = null;
let unbindPreviewImages: (() => void) | null = null;
let pasteHandling = false;

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
  const root = previewRef.value ?? document.querySelector<HTMLElement>(".tdocs-dev-preview");
  if (!root) return;
  const nodes = root.querySelectorAll<HTMLElement>(".mermaid");
  if (!nodes.length) return;
  try {
    await mermaid.run({ nodes: Array.from(nodes) });
  } catch {
    /* 编辑中语法未完成 */
  }
}

function setupPreviewImageResize() {
  unbindPreviewImages?.();
  const root = previewRef.value;
  if (!root) return;

  unbindPreviewImages = bindPreviewImageResize(root, {
    getMarkdown: () => content.value,
    setMarkdown: (value) => {
      content.value = value;
    },
    onResize: (width) => {
      status.value = `图片宽度已设为 ${width}px（已同步到 Markdown）`;
      error.value = "";
    },
  });
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
    if (!active) {
      unbindPreviewImages?.();
      unbindPreviewImages = null;
    }
  });

  watch(mdRel, () => {
    if (open.value) void loadMd();
  });

  watch([previewHtml, open, content], async () => {
    if (!open.value) return;
    await nextTick();
    await renderMermaidInPreview();
    setupPreviewImageResize();
  });
}

export function useDevDocEditor() {
  const { page } = useData();
  const isDev = import.meta.env.DEV;
  const mdRel = computed(() => page.value.relativePath || "index.md");
  const isDocPage = computed(() => !page.value.isNotFound && Boolean(page.value.relativePath));
  const canEdit = computed(() => isDev && isDocPage.value && mdRel.value.endsWith(".md"));

  const previewHtml = computed(() => {
    if (!content.value.trim()) return "<p></p>";
    try {
      return mermaidBlocksFromMarked(marked.parse(content.value) as string);
    } catch {
      return "<p>预览解析失败</p>";
    }
  });

  const statusHint = computed(() => {
    if (error.value || status.value) return "";
    if (cosEnabled.value === false) {
      return "粘贴/拖拽图片需 COS：apps/trinity-product/.env.local（TRINITY_PRODUCT_COS_*）或 apps/trinity-docs/.env.local（TRINITY_DOCS_COS_*），保存后重启 dev。";
    }
    return "粘贴或拖拽图片自动上传 COS；预览图右下角可拖动改宽（写入 <img width>）；保存写入磁盘。";
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
      await nextTick();
      textareaRef.value?.focus();
    }
  }

  bindEditorWatches(mdRel, previewHtml, loadMd);

  async function fetchUploadConfig() {
    try {
      const res = await fetch(`${API}/upload-config`);
      if (!res.ok) return;
      const data = (await res.json()) as { cosEnabled?: boolean };
      cosEnabled.value = Boolean(data.cosEnabled);
    } catch {
      cosEnabled.value = null;
    }
  }

  async function openEditor() {
    open.value = true;
    savedOnce.value = false;
    void fetchUploadConfig();
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

  function insertAtCursor(snippet: string) {
    const ta = textareaRef.value;
    if (!ta) {
      content.value += snippet;
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = content.value.slice(0, start);
    const after = content.value.slice(end);
    content.value = before + snippet + after;
    void nextTick(() => {
      const pos = start + snippet.length;
      ta.selectionStart = ta.selectionEnd = pos;
      ta.focus();
    });
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          reject(new Error("无法读取图片"));
          return;
        }
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(reader.error ?? new Error("读取失败"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImageFile(file: File) {
    uploadingImage.value = true;
    error.value = "";
    status.value = "正在上传图片到 COS…";
    try {
      const dataBase64 = await fileToBase64(file);
      const mime = file.type && isImageMime(file.type) ? file.type : "image/png";
      const res = await fetch(`${API}/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mime,
          filename: file.name || "paste.png",
          dataBase64,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = (await res.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error("上传成功但未返回 URL");
      const alt = file.name?.replace(/\.[^.]+$/, "") || "image";
      insertAtCursor(`![${alt}](${data.url})\n`);
      status.value = `已插入 COS 地址：${data.url}`;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "图片上传失败";
      status.value = "";
    } finally {
      uploadingImage.value = false;
    }
  }

  async function onEditorPaste(e: ClipboardEvent) {
    if (!open.value || uploadingImage.value || pasteHandling) return;
    const file = getClipboardImageFile(e);
    if (!file) return;
    e.preventDefault();
    e.stopPropagation();
    pasteHandling = true;
    try {
      await uploadImageFile(file);
    } finally {
      pasteHandling = false;
    }
  }

  watch(open, (active) => {
    if (import.meta.env.SSR) return;
    if (active) {
      document.addEventListener("paste", onEditorPaste, true);
    } else {
      document.removeEventListener("paste", onEditorPaste, true);
    }
  });

  function onEditorDragOver(e: DragEvent) {
    const types = e.dataTransfer?.types;
    if (types && [...types].includes("Files")) {
      e.preventDefault();
    }
  }

  async function onEditorDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      await uploadImageFile(file);
      return;
    }
    error.value = "请拖拽图片文件（png / jpg / webp / gif）";
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
      void fetchUploadConfig();
      void loadMd();
    }
  }

  return {
    open,
    loading,
    saving,
    uploadingImage,
    error,
    status,
    statusHint,
    content,
    mdRel,
    canEdit,
    previewHtml,
    textareaRef,
    previewRef,
    openEditor,
    closeEditor,
    saveMd,
    tryReopenFromStorage,
    onEditorPaste,
    onEditorDragOver,
    onEditorDrop,
  };
}
