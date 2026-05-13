<script setup lang="ts">
/**
 * 搜索 · 形式2：失焦时宽度按字数 `clamp`；聚焦时展开至 `max-width`（便于输入）。
 * 药丸样式全部在本组件 scoped CSS，不依赖页面是否单独引入 `ui-kit.css` 中的 `.t-ui-search--grow` 片段（整站 `trinity-base` 仍会加载 `ui-kit`）。
 */
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    inputId?: string;
    ariaLabel?: string;
    /** 至少占用的「字符宽度」档（空串时） */
    minCh?: number;
    /** 再宽不超过的 ch 上限 */
    maxCh?: number;
    /** clamp 下限，如 `10rem` */
    minWidth?: string;
    /** clamp 上限，如 `min(100%, 17.5rem)`；聚焦时外宽即用此值 */
    maxWidth?: string;
    /** 为 false 时聚焦不拉宽，仅靠字数变宽 */
    expandOnFocus?: boolean;
  }>(),
  {
    placeholder: "搜索…",
    minCh: 12,
    maxCh: 40,
    minWidth: "10rem",
    maxWidth: "min(100%, 17.5rem)",
    ariaLabel: "搜索",
    expandOnFocus: true,
  }
);

defineEmits<{ "update:modelValue": [string] }>();

const focused = ref(false);

/** 图标 + 左内边距占位，与形式1 的 2rem 左留白对齐量级 */
const iconPad = "2.5rem";

const collapsedWidthCss = computed(() => {
  const v = props.modelValue?.length ?? 0;
  const pl = (props.placeholder ?? "").length;
  const fromPlaceholder = Math.min(pl, 26) + 1;
  const n = Math.max(v + 2, fromPlaceholder);
  const ch = Math.max(props.minCh, Math.min(props.maxCh, n));
  return `clamp(${props.minWidth}, ${ch}ch + ${iconPad}, ${props.maxWidth})`;
});

const widthCss = computed(() => {
  if (props.expandOnFocus && focused.value) {
    return props.maxWidth;
  }
  return collapsedWidthCss.value;
});
</script>

<template>
  <div class="or-keys-search t-ui-search t-ui-search--grow" :style="{ width: widthCss, maxWidth: '100%' }">
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
      @focus="focused = true"
      @blur="focused = false"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.t-ui-search--grow {
  position: relative;
  overflow: visible;
  flex: 0 1 auto;
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: width 0.2s ease;
}

.t-ui-search--grow :deep(.or-keys-search-icon) {
  position: absolute;
  left: 0.55rem;
  top: 50%;
  z-index: 1;
  transform: translateY(-50%);
  color: var(--muted-2);
  pointer-events: none;
}

.t-ui-search--grow :deep(.or-input.or-keys-search-input) {
  box-sizing: border-box;
  width: 100%;
  height: var(--ctrl-h);
  min-height: var(--ctrl-h);
  margin: 0;
  padding: 0 0.65rem 0 2rem;
  border: none;
  border-radius: 9999px;
  font-size: 0.8125rem;
  line-height: 1.25;
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  min-width: 0;
  appearance: none;
  -webkit-appearance: none;
}

.t-ui-search--grow :deep(.or-input.or-keys-search-input:focus),
.t-ui-search--grow :deep(.or-input.or-keys-search-input:focus-visible) {
  outline: none;
  border: 1px solid var(--blue);
  box-shadow: 0 0 0 3px var(--blue-ring);
}
</style>
