<script setup lang="ts">
import { marked } from "marked";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useData } from "vitepress";
import { bindPreviewImageResize } from "./devPreviewImageResize";
import { fixPreviewHtmlAssetUrls, resolveDevPreviewAssetUrl } from "./devPreviewAssets";
import "./dev-doc-editor.css";

const STORAGE_REOPEN = "tdocs-dev-editor-reopen";

const previewRenderer = new marked.Renderer();
previewRenderer.image = ({ href, title, text }) => {
  const src = resolveDevPreviewAssetUrl(href ?? "");
  const titleAttr = title ? ` title="${title.replace(/"/g, "&quot;")}"` : "";
  const alt = (text ?? "").replace(/"/g, "&quot;");
  return `<img src="${src}" alt="${alt}"${titleAttr} loading="lazy" class="tdocs-dev-preview-img" />`;
};

marked.setOptions({ gfm: true, breaks: true });
marked.use({ renderer: previewRenderer });

/** 须含 VitePress base（如 /docs/），经 portal 反代时才能命中 5205 上的中间件 */
const API = `${(import.meta.env.BASE_URL || "/docs/").replace(/\/?$/, "")}/__trinity_dev_docs`;
const { page } = useData();

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
let unbindPreviewImages: (() => void) | null = null;

const isDev = import.meta.env.DEV;

const mdRel = computed(() => page.value.relativePath || "index.md");

const isDocPage = computed(() => !page.value.isNotFound && Boolean(page.value.relativePath));

/** 编辑态右侧实时预览（不依赖 VitePress 模块缓存） */
const previewHtml = computed(() => {
  if (!content.value.trim()) return "<p></p>";
  try {
    const raw = marked.parse(content.value) as string;
    return fixPreviewHtmlAssetUrls(raw);
  } catch {
    return "<p>预览解析失败</p>";
  }
});

function setEditingClass(active: boolean) {
  document.documentElement.classList.toggle("tdocs-editing", active);
}

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
  sessionStorage.removeItem(STORAGE_REOPEN);
  if (shouldReload) {
    location.reload();
  }
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

async function uploadPastedImage(file: File) {
  uploadingImage.value = true;
  error.value = "";
  status.value = "正在上传图片到 COS…";
  try {
    const dataBase64 = await fileToBase64(file);
    const res = await fetch(`${API}/upload-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mime: file.type || "image/png",
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
  const items = e.clipboardData?.items;
  if (!items?.length) return;
  for (const item of items) {
    if (!item.type.startsWith("image/")) continue;
    e.preventDefault();
    const file = item.getAsFile();
    if (!file) {
      error.value = "无法读取剪贴板图片";
      return;
    }
    await uploadPastedImage(file);
    return;
  }
}

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

const statusHint = computed(() => {
  if (error.value || status.value) return "";
  if (cosEnabled.value === false) {
    return "粘贴图片需 COS：复制 env.cos.example 为 .env.local 并填写 TRINITY_DOCS_COS_*，重启 dev。";
  }
  return "左侧粘贴图片自动上传 COS；右侧预览图右下角可拖动改宽（写入 <img width>）；保存写入磁盘。";
});

function setupPreviewImageResize() {
  unbindPreviewImages?.();
  const root = previewRef.value;
  if (!root) return;

  const opts = {
    getMarkdown: () => content.value,
    setMarkdown: (v: string) => {
      content.value = v;
    },
    onResize: (width: number) => {
      status.value = `图片宽度已设为 ${width}px（已同步到 Markdown）`;
      error.value = "";
    },
  };

  unbindPreviewImages = bindPreviewImageResize(root, opts);

  for (const img of root.querySelectorAll<HTMLImageElement>("img")) {
    if (img.dataset.tdocsResizeBound === "1") continue;
    const rebind = () => {
      void nextTick(() => setupPreviewImageResize());
    };
    if (img.complete) continue;
    img.addEventListener("load", rebind, { once: true });
    img.addEventListener("error", rebind, { once: true });
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

watch(open, (active) => {
  setEditingClass(active);
});

watch(mdRel, () => {
  if (open.value) void loadMd();
});

watch([previewHtml, open, content], () => {
  if (!open.value) return;
  void nextTick(() => setupPreviewImageResize());
});

onMounted(() => {
  if (!isDev || !isDocPage.value) return;
  const reopenRel = sessionStorage.getItem(STORAGE_REOPEN);
  if (reopenRel && reopenRel === mdRel.value) {
    sessionStorage.removeItem(STORAGE_REOPEN);
    open.value = true;
    void loadMd();
  }
});

onUnmounted(() => {
  unbindPreviewImages?.();
  unbindPreviewImages = null;
  setEditingClass(false);
});
</script>

<template>
  <template v-if="isDev && isDocPage">
    <button
      v-if="!open"
      type="button"
      class="tdocs-dev-edit-trigger"
      title="开发环境：编辑本页 Markdown"
      @click="openEditor"
    >
      编辑本页
    </button>

    <template v-else>
      <aside class="tdocs-dev-editor-dock" role="dialog" aria-label="编辑 Markdown">
        <header class="tdocs-dev-editor-toolbar">
          <p class="tdocs-dev-editor-toolbar__title">
            开发编辑 · <code>docs/{{ mdRel }}</code>
            <span v-if="loading">（加载中…）</span>
          </p>
          <div class="tdocs-dev-editor-toolbar__actions">
            <button type="button" class="tdocs-dev-editor-btn" @click="closeEditor">关闭</button>
            <button
              type="button"
              class="tdocs-dev-editor-btn tdocs-dev-editor-btn--primary"
              :disabled="loading || saving || uploadingImage"
              @click="saveMd"
            >
              {{ saving ? "保存中…" : "保存" }}
            </button>
          </div>
        </header>

        <div class="tdocs-dev-editor-pane__label">Markdown 源文</div>
        <textarea
          ref="textareaRef"
          v-model="content"
          class="tdocs-dev-editor-md"
          spellcheck="false"
          :disabled="loading || uploadingImage"
          aria-label="Markdown 正文"
          @paste="onEditorPaste"
        />

        <p
          class="tdocs-dev-editor-status"
          :class="{
            'tdocs-dev-editor-status--error': error,
            'tdocs-dev-editor-status--ok': !error && status,
          }"
        >
          {{ error || status || statusHint }}
        </p>
      </aside>

      <!-- 实时 Markdown 预览，替代缓存中的 VitePress 正文 -->
      <div class="tdocs-dev-preview-wrap" aria-live="polite">
        <div class="tdocs-dev-preview-pane__label">实时预览</div>
        <article ref="previewRef" class="tdocs-dev-preview vp-doc" v-html="previewHtml" />
      </div>
    </template>
  </template>
</template>
