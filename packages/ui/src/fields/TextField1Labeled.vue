<script setup lang="ts">
/**
 * 参考样式：前置标签 + 单行文本，高度与搜索框一致（`--ctrl-h`），
 * `.or-input` 见 `@trinity/ui/styles/ui-kit.css`；与站点表单 `textarea:focus` / `.form-group input:focus` 对齐时宿主可再引入 `trinity-base`。
 */
withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    inputId: string;
    placeholder?: string;
    disabled?: boolean;
    /** 不传则用 `label` */
    ariaLabel?: string;
    type?: string;
  }>(),
  { placeholder: "", disabled: false, type: "text" }
);

defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div class="t-ui-text-field1">
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      :type="type"
      class="or-input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel ?? label"
      autocomplete="off"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.t-ui-text-field1 {
  display: block;
  width: 100%;
  max-width: 26rem;
}

.t-ui-text-field1 label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.35rem;
}

.t-ui-text-field1 .or-input {
  box-sizing: border-box;
  width: 100%;
  height: var(--ctrl-h);
  min-height: var(--ctrl-h);
  margin: 0;
  padding: 0 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 8px);
  font-size: 0.8125rem;
  line-height: 1.25;
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  min-width: 0;
}

.t-ui-text-field1 .or-input:focus,
.t-ui-text-field1 .or-input:focus-visible {
  outline: none;
  border: 1px solid var(--blue);
  box-shadow: 0 0 0 3px var(--blue-ring);
}

.t-ui-text-field1 .or-input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
