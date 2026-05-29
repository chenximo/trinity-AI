<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: string;
  defaultValue: string;
  running?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  run: [];
}>();

const copied = ref(false);

watch(
  () => props.error,
  () => {
    copied.value = false;
  },
);

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(props.modelValue);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    /* ignore */
  }
}

function formatJson() {
  try {
    const parsed = JSON.parse(props.modelValue) as unknown;
    emit("update:modelValue", JSON.stringify(parsed, null, 2));
  } catch {
    /* parent shows parse error on run */
  }
}

function resetJson() {
  emit("update:modelValue", props.defaultValue);
}
</script>

<template>
  <div class="api-acc-req-panel">
    <div class="api-acc-req-panel-head">
      <div class="api-acc-req-panel-route">
        <span class="api-acc-req-method">POST</span>
        <span class="api-acc-req-path">/v1/chat/completions</span>
      </div>
      <div class="api-acc-req-tools">
        <button type="button" class="api-acc-btn api-acc-btn--sm" @click="copyJson">
          {{ copied ? "已复制" : "复制" }}
        </button>
        <button type="button" class="api-acc-btn api-acc-btn--sm" @click="formatJson">格式化</button>
        <button type="button" class="api-acc-btn api-acc-btn--sm" @click="resetJson">还原默认</button>
      </div>
    </div>
    <textarea
      class="api-acc-req-editor"
      :value="modelValue"
      spellcheck="false"
      rows="14"
      @input="onInput"
    />
    <p v-if="error" class="api-acc-req-error">{{ error }}</p>
    <div class="api-acc-req-foot">
      <button
        type="button"
        class="api-acc-btn api-acc-btn--primary api-acc-btn--try"
        :disabled="running"
        @click="emit('run')"
      >
        {{ running ? "运行中…" : "▶ 重新运行" }}
      </button>
      <span class="api-acc-drawer-hint">修改 JSON 后点此发送；仍使用当前用例断言规则。</span>
    </div>
  </div>
</template>
