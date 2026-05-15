<script setup lang="ts">
/**
 * 设计示意 · 筛选形式2：药丸 listbox 触发器；可选 `items` 组合列表面板（`or-app-filter-dd-*`）。
 * 不传 `items` 时仅渲染药丸按钮（兼容原 FilterForm2PillListboxTrigger）。
 * `items` 元素形状与 `index.ts` 中 `FilterForm2ListboxItem` 保持一致。
 *
 * - **未托管面板**（默认）：面板节点带 `hidden`，由宿主脚本（如画板 `useDesignSpecDropdowns`）切换 `hidden` / `aria-expanded`。
 * - **托管面板**（`managed-panel`）：用 `v-model:open` 控制显隐，触发器切换 `open`，选项 `@select` 传出下标后自动收起。
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
    /** 为 true 时由 Vue 控制面板显隐，与画板 DOM 脚本方式二选一 */
    managedPanel?: boolean;
    expanded?: boolean;
    controls?: string;
    btnId?: string;
    labelSpanId?: string;
    items?: MenuRow[];
    wrapId?: string;
    panelId?: string;
    listboxAriaLabel?: string;
    beakX?: string;
    /** 下拉面板水平对齐：`end` 与触发器/卡片右缘齐平，避免向右溢出视口 */
    panelAlign?: "start" | "end";
  }>(),
  {
    managedPanel: false,
    expanded: false,
    controls: undefined,
    btnId: undefined,
    labelSpanId: undefined,
    beakX: "2.75rem",
    listboxAriaLabel: undefined,
    panelAlign: "end",
  }
);

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{ select: [index: number] }>();

const isListMode = computed(() => props.items !== undefined);

const wrapClass = computed(() =>
  props.panelAlign === "end" ? "or-app-filter-dd-wrap or-app-filter-dd-wrap--panel-end" : "or-app-filter-dd-wrap"
);

/** `panelAlign=end` 时尖角走右侧变量，避免 `--or-pop-beak-x` 把面板仍按左侧定位 */
const panelStyle = computed(() =>
  props.panelAlign === "end"
    ? ({ "--or-pop-beak-r": "1.35rem" } as Record<string, string>)
    : ({ "--or-pop-beak-x": props.beakX } as Record<string, string>)
);

const triggerControls = computed(() =>
  isListMode.value ? props.panelId : props.controls
);

const ariaExpanded = computed(() => {
  if (props.managedPanel && isListMode.value) {
    return open.value ? "true" : "false";
  }
  return props.expanded ? "true" : "false";
});

/** 非托管时恒为 true，由画板脚本把 DOM `hidden` 设为 false 打开面板 */
const panelHidden = computed(() => {
  if (!isListMode.value) return true;
  if (!props.managedPanel) return true;
  return !open.value;
});

function onTriggerClick(e: MouseEvent) {
  if (!props.managedPanel || !isListMode.value) return;
  e.stopPropagation();
  open.value = !open.value;
}

function onItemClick(e: MouseEvent, i: number) {
  if (!props.managedPanel) return;
  e.stopPropagation();
  emit("select", i);
  open.value = false;
}
</script>

<template>
  <div v-if="isListMode" :id="wrapId" :class="wrapClass">
    <button
      :id="btnId"
      type="button"
      class="or-select or-select--app or-app-filter-dd-trigger"
      :aria-expanded="ariaExpanded"
      aria-haspopup="listbox"
      :aria-controls="triggerControls"
      @click="onTriggerClick"
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
      :hidden="panelHidden"
      :aria-label="listboxAriaLabel ?? '列表'"
      :style="panelStyle"
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
        @click="onItemClick($event, i)"
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
    :aria-expanded="ariaExpanded"
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

<style scoped>
/* 与 ui-kit 双写：保证形式2 下拉右缘与药丸右缘齐平（避免全局 CSS 顺序或未热更新时失效） */
.or-app-filter-dd-wrap--panel-end :deep(.or-app-filter-more-panel) {
  left: auto;
  right: 0;
}

.or-app-filter-dd-wrap--panel-end :deep(.or-app-filter-more-panel.or-app-filter-pop-beak::before),
.or-app-filter-dd-wrap--panel-end :deep(.or-app-filter-more-panel.or-app-filter-pop-beak::after) {
  left: calc(100% - var(--or-pop-beak-r, 1.35rem));
  right: auto;
  transform: translateX(-50%) translateZ(0);
}
</style>
