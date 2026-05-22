<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useData } from "vitepress";
import "./dev-doc-editor.css";

const API = "/__trinity_dev_docs";
const { page } = useData();

const open = ref(false);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const status = ref("");
const content = ref("");

const isDev = import.meta.env.DEV;

const mdRel = computed(() => page.value.relativePath || "index.md");

const isDocPage = computed(() => !page.value.isNotFound && Boolean(page.value.relativePath));

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
  await loadMd();
}

function closeEditor() {
  open.value = false;
  error.value = "";
  status.value = "";
}

async function saveMd() {
  saving.value = true;
  error.value = "";
  status.value = "";
  try {
    const res = await fetch(`${API}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rel: mdRel.value, content: content.value }),
    });
    if (!res.ok) throw new Error(await res.text());
    status.value = `已保存 ${mdRel.value}；右侧页面将自动热更新`;
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

    <!-- 左侧编辑栏；右侧保留真实 VitePress 页面（不用 iframe，避免 Vite 模块 MIME 报错） -->
    <aside
      v-else
      class="tdocs-dev-editor-dock"
      role="dialog"
      aria-label="编辑 Markdown"
    >
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
          "右侧为 VitePress 实时页面；保存后自动热更新，无需 iframe 预览。"
        }}
      </p>
    </aside>
  </template>
</template>
