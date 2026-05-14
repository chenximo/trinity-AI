<script setup lang="ts">
import { computed, useId } from "vue";

/** 设计示意 · 筛选形式3：标签 + 芯片槽；子节点用 `button.or-keys-seg-btn`，样式见 `@trinity/ui/styles/ui-kit.css`。 */
const props = withDefaults(
  defineProps<{
    label: string;
    labelId?: string;
    /** 传入则渲染芯片按钮；不传则使用默认 slot */
    segments?: { label: string; active?: boolean; disabled?: boolean }[];
  }>(),
  { labelId: undefined, segments: undefined }
);

const autoId = useId();
const effectiveLabelId = computed(() => props.labelId ?? autoId);

defineEmits<{ segmentClick: [index: number] }>();
</script>

<template>
  <div class="or-app-filter-row" style="align-items: center">
    <span class="or-keys-expiry-lbl" :id="effectiveLabelId">{{ label }}</span>
    <div class="or-keys-seg" role="group" :aria-labelledby="effectiveLabelId">
      <template v-if="segments && segments.length > 0">
        <button
          v-for="(s, i) in segments"
          :key="i"
          type="button"
          class="or-keys-seg-btn"
          :class="{ 'is-active': s.active }"
          tabindex="0"
          :disabled="s.disabled"
          @click="$emit('segmentClick', i)"
        >
          {{ s.label }}
        </button>
      </template>
      <slot v-else />
    </div>
  </div>
</template>
