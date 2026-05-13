<script setup lang="ts">
/** 设计示意 · 按钮：线框 / 主渐变。 */
withDefaults(
  defineProps<{
    variant?: "outline" | "gradient";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  { variant: "outline", disabled: false, type: "button" }
);
</script>

<template>
  <button :type="type" class="t-btn" :class="{ 't-btn--gradient': variant === 'gradient' }" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.t-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: var(--ctrl-h, 36px);
  min-height: var(--ctrl-h, 36px);
  padding: 0 1.1rem;
  border-radius: var(--radius, 8px);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--muted);
}

.t-btn:hover:not(:disabled) {
  background: var(--surface);
  border-color: var(--border-strong);
  color: var(--text);
}

.t-btn:focus-visible {
  outline: 2px solid var(--blue-ring);
  outline-offset: 2px;
}

.t-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.t-btn--gradient {
  background: var(--grad);
  color: #fff !important;
  border: none;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.25);
}

.t-btn--gradient:hover:not(:disabled) {
  background: var(--grad-hover);
  color: #fff !important;
}
</style>
