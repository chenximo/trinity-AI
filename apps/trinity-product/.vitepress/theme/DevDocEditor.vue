<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useDevDocEditor } from "./useDevDocEditor";
import "./dev-doc-editor.css";

/** 编辑面板仅客户端加载，避免 mermaid 等依赖影响 SSR */
const isClient = typeof window !== "undefined";

const {
  open,
  loading,
  saving,
  error,
  status,
  content,
  mdRel,
  canEdit,
  previewHtml,
  closeEditor,
  saveMd,
  tryReopenFromStorage,
} = useDevDocEditor();

onMounted(() => {
  tryReopenFromStorage();
});

onUnmounted(() => {
  document.documentElement.classList.remove("tdocs-editing");
});
</script>

<template>
  <template v-if="isClient && canEdit && open">
    <aside class="tdocs-dev-editor-dock" role="dialog" aria-label="编辑 Markdown">
      <header class="tdocs-dev-editor-toolbar">
        <p class="tdocs-dev-editor-toolbar__title">
          产品手册 · <code>docs/{{ mdRel }}</code>
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

      <p class="tdocs-dev-editor-status" :class="{ 'tdocs-dev-editor-status--error': error }">
        {{
          error ||
          status ||
          "右侧随输入实时预览；点「保存」写入磁盘。关闭后刷新为完整 VitePress 页面。"
        }}
      </p>
    </aside>

    <div class="tdocs-dev-preview-wrap" aria-live="polite">
      <div class="tdocs-dev-preview-pane__label">实时预览</div>
      <article class="tdocs-dev-preview vp-doc" v-html="previewHtml" />
    </div>
  </template>
</template>
