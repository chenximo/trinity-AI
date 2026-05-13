<script setup lang="ts">
/**
 * 设计示意 · 筛选形式1：渐变「更多」触发器；可选 `items` 时带出下拉菜单。
 * 不传 `items` 时仅渲染按钮（兼容原 Trigger 用法）；`items` 形状见 `index.ts` 的 `FilterForm1MenuItem`。
 *
 * 样式分工（本文件不 import CSS）：
 * - 渐变按钮：模板 class `t-filter-f1-more` → 本组件末尾 scoped 样式块。
 * - 外框 / 面板 / 菜单行：模板 class `or-app-filter-more-wrap`、`or-app-filter-more-panel`、`or-app-filter-menu-item` 等
 *   → 由宿主引入 `@trinity/ui/styles/ui-base.css`（或 `assets/trinity-base.css`，后者会再拉取 `ui-kit.css`）提供规则。
 */
import { computed } from "vue";

/** @see FilterForm1MenuItem in ../index.ts */
type MenuRow = {
  label: string;
  disabled?: boolean;
  active?: boolean;
  icon?: "diagram" | "dial" | "user-add";
};

const props = withDefaults(
  defineProps<{
    expanded?: boolean;
    controls?: string;
    popup?: "menu" | "true";
    /** 与 design-spec 画板 `useDesignSpecDropdowns` 等对齐 */
    btnId?: string;
    /** 传入则渲染「wrap + 按钮 + 面板」；不传则仅按钮 */
    items?: MenuRow[];
    wrapId?: string;
    panelId?: string;
    menuAriaLabel?: string;
    beakX?: string;
  }>(),
  {
    expanded: false,
    controls: undefined,
    popup: "menu",
    btnId: undefined,
    menuAriaLabel: "更多选项",
    beakX: "2.6rem",
  }
);

const isMenuMode = computed(() => props.items !== undefined);

const triggerControls = computed(() =>
  isMenuMode.value ? props.panelId : props.controls
);
</script>

<template>
  <div v-if="isMenuMode" :id="wrapId" class="or-app-filter-more-wrap">
    <button
      :id="btnId"
      type="button"
      class="t-filter-f1-more"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-haspopup="popup"
      :aria-controls="triggerControls"
    >
      <span class="t-filter-f1-more__label"><slot>更多</slot></span>
      <svg
        class="t-filter-f1-more__chevron"
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
      role="menu"
      hidden
      :aria-label="menuAriaLabel"
      :style="{ '--or-pop-beak-x': beakX }"
    >
      <button
        v-for="(row, i) in items"
        :key="i"
        type="button"
        class="or-app-filter-menu-item"
        :class="{ 'is-active': row.active }"
        role="menuitem"
        tabindex="-1"
        :disabled="row.disabled"
      >
        <span class="or-app-filter-menu-ic" aria-hidden="true">
          <template v-if="row.icon === 'dial'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="8" stroke-dasharray="1.5 3" />
            </svg>
          </template>
          <template v-else-if="row.icon === 'user-add'">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </svg>
          </template>
          <template v-else>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
            </svg>
          </template>
        </span>
        <span>{{ row.label }}</span>
      </button>
    </div>
  </div>
  <button
    v-else
    :id="btnId"
    type="button"
    class="t-filter-f1-more"
    :aria-expanded="expanded ? 'true' : 'false'"
    :aria-haspopup="popup"
    :aria-controls="triggerControls"
  >
    <span class="t-filter-f1-more__label"><slot>更多</slot></span>
    <svg
      class="t-filter-f1-more__chevron"
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
.t-filter-f1-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  height: var(--ctrl-h, 36px);
  min-height: var(--ctrl-h, 36px);
  padding: 0 0.95rem;
  margin: 0;
  border: 1px solid rgba(99, 102, 241, 0.45);
  border-radius: 999px;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff !important;
  cursor: pointer;
  background: var(--grad);
  box-shadow:
    0 2px 10px -2px rgba(79, 70, 229, 0.35),
    0 1px 2px rgba(15, 23, 42, 0.06);
  transition:
    filter 0.15s ease,
    box-shadow 0.15s ease;
}

.t-filter-f1-more:hover {
  filter: brightness(1.05);
  box-shadow:
    0 4px 14px -2px rgba(79, 70, 229, 0.4),
    0 1px 2px rgba(15, 23, 42, 0.08);
}

.t-filter-f1-more:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px var(--blue-ring),
    0 2px 10px -2px rgba(79, 70, 229, 0.35);
}

.t-filter-f1-more__chevron {
  flex-shrink: 0;
  opacity: 0.95;
}
</style>
