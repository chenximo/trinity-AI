<script setup lang="ts">
/** 设计示意 · 多选列表形式1：模型行按钮壳（`orc-model-row`）；样式见 `@trinity/ui/styles/ui-kit.css`。 */
withDefaults(
  defineProps<{
    selected?: boolean;
    active?: boolean;
  }>(),
  { selected: false, active: false }
);

const emit = defineEmits<{ click: [MouseEvent] }>();
</script>

<template>
  <button
    type="button"
    class="orc-model-row orc-model-row--compare"
    :class="{ 'is-selected': selected, 'is-active': active }"
    :aria-pressed="selected ? 'true' : 'false'"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
