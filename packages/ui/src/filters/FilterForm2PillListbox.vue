<script setup lang="ts">
/**
 * 设计示意 · 筛选形式2：药丸 listbox 触发器；可选 `items` 组合列表面板（`or-app-filter-dd-*`）。
 * 不传 `items` 时仅渲染药丸按钮（兼容原 FilterForm2PillListboxTrigger）。
 * `items` 元素形状与 `index.ts` 中 `FilterForm2ListboxItem` 保持一致。
 */
import { computed } from "vue";

/** @see FilterForm2ListboxItem in ../index.ts */
type MenuRow = {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  dataAttrs?: Record<string, string>;
};

const props = withDefaults(
  defineProps<{
    expanded?: boolean;
    controls?: string;
    btnId?: string;
    labelSpanId?: string;
    items?: MenuRow[];
    wrapId?: string;
    panelId?: string;
    listboxAriaLabel?: string;
    beakX?: string;
  }>(),
    { expanded: false, controls: undefined, btnId: undefined, labelSpanId: undefined, beakX: "2.75rem", listboxAriaLabel: undefined }
);

const isListMode = computed(() => props.items !== undefined);

const triggerControls = computed(() =>
  isListMode.value ? props.panelId : props.controls
);
</script>

<template>
  <div v-if="isListMode" :id="wrapId" class="or-app-filter-dd-wrap">
    <button
      :id="btnId"
      type="button"
      class="or-select or-select--app or-app-filter-dd-trigger"
      :aria-expanded="expanded ? 'true' : 'false'"
      aria-haspopup="listbox"
      :aria-controls="triggerControls"
    >
      <span :id="labelSpanId"><slot>按模型</slot></span>
      <svg
        class="or-app-filter-dd-chevron"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div
      :id="panelId"
      class="or-app-filter-more-panel or-app-filter-pop-beak"
      role="listbox"
      hidden
      :aria-label="listboxAriaLabel ?? '列表'"
      :style="{ '--or-pop-beak-x': beakX }"
    >
      <button
        v-for="(row, i) in items"
        :key="i"
        type="button"
        class="or-app-filter-dd-item"
        :class="{ 'is-checked': row.checked }"
        role="option"
        tabindex="-1"
        :disabled="row.disabled"
        v-bind="row.dataAttrs || {}"
      >
        <span class="or-app-filter-dd-label">{{ row.label }}</span>
        <span class="or-app-filter-dd-mark" aria-hidden="true">{{ row.checked ? "✓" : "" }}</span>
      </button>
    </div>
  </div>
  <button
    v-else
    :id="btnId"
    type="button"
    class="or-select or-select--app or-app-filter-dd-trigger"
    :aria-expanded="expanded ? 'true' : 'false'"
    aria-haspopup="listbox"
    :aria-controls="triggerControls"
  >
    <span :id="labelSpanId"><slot>按模型</slot></span>
    <svg
      class="or-app-filter-dd-chevron"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>
