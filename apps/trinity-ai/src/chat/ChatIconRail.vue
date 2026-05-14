<script setup lang="ts">
defineProps<{ sideCollapsed: boolean }>();
const emit = defineEmits<{ expandSide: [] }>();
</script>

<template>
  <aside class="orc-icon-rail" aria-label="快捷入口">
    <button type="button" class="orc-rail-btn" id="orc-rail-new" title="新建对话" aria-label="新建对话">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
    <button type="button" class="orc-rail-btn orc-rail-btn--active" title="对话" aria-label="对话" aria-current="page">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    </button>
    <button
      type="button"
      class="orc-rail-btn orc-rail-btn--expand-side"
      id="orc-btn-side-expand"
      title="展开模型与会话侧栏"
      aria-label="展开模型与会话侧栏"
      aria-controls="orc-sidebar-inner"
      :aria-hidden="sideCollapsed ? 'false' : 'true'"
      :tabindex="sideCollapsed ? 0 : -1"
      @click="emit('expandSide')"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    </button>
    <span class="orc-rail-spacer" aria-hidden="true" />
    <button type="button" class="orc-rail-btn" title="图像" aria-label="图像">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </button>
    <button type="button" class="orc-rail-btn" title="视频" aria-label="视频">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="2" y="5" width="14" height="14" rx="2" />
        <path d="M16 10l6-3v10l-6-3v-4z" />
      </svg>
    </button>
    <button type="button" class="orc-rail-btn" title="语音输入" aria-label="语音输入">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <path d="M12 19v4M9 23h6" />
      </svg>
    </button>
    <button type="button" class="orc-rail-btn" title="探索发现" aria-label="探索发现">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
      </svg>
    </button>
    <span class="orc-rail-spacer orc-rail-spacer--bottom" aria-hidden="true" />
    <button type="button" class="orc-rail-btn orc-rail-btn--avatar" title="账户" aria-label="账户">
      <span aria-hidden="true">L</span>
    </button>
  </aside>
</template>
