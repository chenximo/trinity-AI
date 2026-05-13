<script setup lang="ts">
/**
 * 搜索 · 形式1：固定宽度；圆角矩形（`radius-md`）+ 灰描边。
 * 样式全部在本组件 scoped CSS，不依赖页面是否单独引入 `ui-kit.css` 中的 `.t-ui-search--fixed` 片段（整站 `trinity-base` 仍会加载 `ui-kit`）。
 */
withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    inputId?: string;
    ariaLabel?: string;
    /** 固定外宽，如 `17.5rem`、`min(100%, 20rem)` */
    width?: string;
  }>(),
  { placeholder: "搜索…", width: "17.5rem", ariaLabel: "搜索" }
);

defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div class="or-keys-search t-ui-search t-ui-search--fixed" :style="{ width, maxWidth: '100%' }">
    <svg
      class="or-keys-search-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.2-4.2" stroke-linecap="round" />
    </svg>
    <input
      :id="inputId"
      type="search"
      class="or-input or-keys-search-input"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      autocomplete="off"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.t-ui-search--fixed {
  position: relative;
  overflow: visible;
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.t-ui-search--fixed :deep(.or-keys-search-icon) {
  position: absolute;
  left: 0.55rem;
  top: 50%;
  z-index: 1;
  transform: translateY(-50%);
  color: var(--muted-2);
  pointer-events: none;
}

.t-ui-search--fixed :deep(.or-input.or-keys-search-input) {
  box-sizing: border-box;
  width: 100%;
  height: var(--ctrl-h);
  min-height: var(--ctrl-h);
  margin: 0;
  padding: 0 0.55rem 0 2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 8px);
  font-size: 0.8125rem;
  line-height: 1.25;
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  min-width: 0;
  appearance: none;
  -webkit-appearance: none;
}

.t-ui-search--fixed :deep(.or-input.or-keys-search-input:focus),
.t-ui-search--fixed :deep(.or-input.or-keys-search-input:focus-visible) {
  outline: none;
  border: 1px solid var(--blue);
  box-shadow: 0 0 0 3px var(--blue-ring);
}
</style>
