<script setup lang="ts">
/**
 * Tab · 形式2：胶囊切换（轨道内高亮药丸），高度与控件行一致（`--ctrl-h`）。
 */
import type { TabSwitchItem } from "./TabSwitch1Underline.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    tabs: TabSwitchItem[];
    tablistLabel?: string;
  }>(),
  { tablistLabel: "切换" }
);

const emit = defineEmits<{ "update:modelValue": [string] }>();

function select(id: string) {
  const t = props.tabs.find((x) => x.id === id);
  if (t?.disabled) return;
  emit("update:modelValue", id);
}
</script>

<template>
  <div class="t-ui-tabs t-ui-tabs--capsule">
    <div class="t-ui-tabs__track" role="tablist" :aria-label="tablistLabel">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="t-ui-tabs__pill"
        :class="{ 'is-active': modelValue === t.id }"
        role="tab"
        :aria-selected="modelValue === t.id"
        :disabled="t.disabled"
        @click="select(t.id)"
      >
        {{ t.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.t-ui-tabs--capsule {
  display: block;
  width: fit-content;
  max-width: 100%;
}

.t-ui-tabs__track {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.18rem;
  padding: 0.2rem;
  border-radius: 9999px;
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
}

.t-ui-tabs__pill {
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--ctrl-h) - 6px);
  padding: 0 0.85rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition:
    background 0.12s ease,
    color 0.12s ease,
    box-shadow 0.12s ease;
}

.t-ui-tabs__pill:hover:not(:disabled) {
  color: var(--text);
}

.t-ui-tabs__pill.is-active {
  background: var(--bg);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.t-ui-tabs__pill:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.t-ui-tabs__pill:focus {
  outline: none;
}

.t-ui-tabs__pill:focus-visible {
  box-shadow: 0 0 0 3px var(--blue-ring);
}

.t-ui-tabs__pill.is-active:focus-visible {
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 0 0 3px var(--blue-ring);
}
</style>
