<script setup lang="ts">
import { marked } from "marked";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useData } from "vitepress";
import "./dev-doc-editor.css";

const STORAGE_REOPEN = "tdocs-dev-editor-reopen";

marked.setOptions({ gfm: true, breaks: true });

/** 须含 VitePress base（如 /docs/），经 portal 反代时才能命中 5205 上的中间件 */
const API = `${(import.meta.env.BASE_URL || "/docs/").replace(/\/?$/, "")}/__trinity_dev_docs`;
const { page } = useData();

const open = ref(false);
const loading = ref(false);
const saving = ref(false);
const savedOnce = ref(false);
const error = ref("");
const status = ref("");
const content = ref("");

const isDev = import.meta.env.DEV;

const mdRel = computed(() => page.value.relativePath || "index.md");

const isDocPage = computed(() => !page.value.isNotFound && Boolean(page.value.relativePath));

/** 编辑态右侧实时预览（不依赖 VitePress 模块缓存） */
const previewHtml = computed(() => {
  if (!content.value.trim()) return "<p></p>";
  try {
    return marked.parse(content.value) as string;
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
              :disabled="loading || saving"
              @click="saveMd"
            >
              {{ saving ? "保存中…" : "保存" }}
            </button>
          </div>
        </header>

        <div class="tdocs-dev-editor-pane__label">Markdown 源文</div>
        <textarea
          v-model="content"
          class="tdocs-dev-editor-md"
          spellcheck="false"
          :disabled="loading"
          aria-label="Markdown 正文"
        />

        <p
          class="tdocs-dev-editor-status"
          :class="{ 'tdocs-dev-editor-status--error': error }"
        >
          {{
            error ||
            status ||
            "右侧随输入实时预览；点「保存」写入磁盘。关闭后刷新为完整 VitePress 页面。"
          }}
        </p>
      </aside>

      <!-- 实时 Markdown 预览，替代缓存中的 VitePress 正文 -->
      <div class="tdocs-dev-preview-wrap" aria-live="polite">
        <div class="tdocs-dev-preview-pane__label">实时预览</div>
        <article class="tdocs-dev-preview vp-doc" v-html="previewHtml" />
      </div>
    </template>
  </template>
</template>
