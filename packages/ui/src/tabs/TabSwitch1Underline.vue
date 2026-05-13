<script setup lang="ts">
/**
 * Tab · 形式1：普通切换（下划线指示当前项），高度与控件行一致（`--ctrl-h`）。
 */
export type TabSwitchItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    tabs: TabSwitchItem[];
    /** 供 `aria-labelledby` 使用 */
    labelId?: string;
    tablistLabel?: string;
  }>(),
  { labelId: undefined, tablistLabel: "切换" }
);

const emit = defineEmits<{ "update:modelValue": [string] }>();

function select(id: string) {
  const t = props.tabs.find((x) => x.id === id);
  if (t?.disabled) return;
  emit("update:modelValue", id);
}
</script>

<template>
  <div class="t-ui-tabs t-ui-tabs--underline">
    <div
      class="t-ui-tabs__list"
      role="tablist"
      :aria-label="tablistLabel"
      :aria-labelledby="labelId || undefined"
    >
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="t-ui-tabs__tab"
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
.t-ui-tabs--underline {
  display: block;
  width: 100%;
}

.t-ui-tabs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0 1.1rem;
  border-bottom: 1px solid var(--border);
}

.t-ui-tabs__tab {
  position: relative;
  margin: 0 0 -1px;
  padding: 0 0.1rem;
  min-height: var(--ctrl-h);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition:
    color 0.12s ease,
    border-color 0.12s ease;
}

.t-ui-tabs__tab:hover:not(:disabled) {
  color: var(--text);
}

.t-ui-tabs__tab.is-active {
  color: var(--text);
  font-weight: 600;
  border-bottom-color: var(--blue);
}

.t-ui-tabs__tab:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.t-ui-tabs__tab:focus {
  outline: none;
}

.t-ui-tabs__tab:focus-visible {
  border-radius: var(--radius-sm, 4px);
  box-shadow: 0 0 0 3px var(--blue-ring);
}
</style>
