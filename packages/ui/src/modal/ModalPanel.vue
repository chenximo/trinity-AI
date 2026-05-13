<script setup lang="ts">
/**
 * 弹窗内卡片壳：顶栏（标题 + 可选 `#headTrail` + 右上关）与底栏（顶线 + 按钮区）冻结样式；中间为默认插槽。
 * 依赖页面已引入 `@trinity/ui/styles/ui-base.css`（或 `trinity-base`，内含 `or-modal-*`、`or-keys-editor-actions` 等）。
 */
import { computed, useId } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    /** 供 `aria-labelledby`；不传则用内部 `useId()` */
    titleId?: string;
    closeLabel?: string;
    /** 顶栏下划线下方一行说明；不传则不渲染 */
    headNote?: string;
  }>(),
  { closeLabel: "关闭" }
);

defineEmits<{ close: [] }>();

const autoTitleId = useId();
const resolvedTitleId = computed(() => props.titleId ?? autoTitleId);
const trimmedHeadNote = computed(() => props.headNote?.trim() ?? "");
const showHeadNote = computed(() => trimmedHeadNote.value.length > 0);
</script>

<template>
  <div
    class="or-modal-card or-keys-editor-modal-card"
    role="region"
    :aria-labelledby="resolvedTitleId"
  >
    <header>
      <div class="or-modal-head">
        <div class="t-modal-panel-head-main">
          <h2 :id="resolvedTitleId" class="or-modal-title">{{ title }}</h2>
          <span v-if="$slots.headTrail" class="t-modal-panel-head-trail">
            <slot name="headTrail" />
          </span>
        </div>
        <button
          type="button"
          class="or-modal-close"
          :aria-label="closeLabel"
          @click="$emit('close')"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </header>
    <p v-if="showHeadNote" class="t-modal-panel-head-note">{{ trimmedHeadNote }}</p>
    <div class="t-modal-panel-body">
      <slot />
    </div>
    <div v-if="$slots.actions" class="or-keys-editor-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.t-modal-panel-head-main {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 0.35rem;
}

.t-modal-panel-head-trail {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
}

.t-modal-panel-head-note {
  margin: 0.45rem 1.25rem 0;
  padding: 0;
  border: none;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--muted);
}

.t-modal-panel-body {
  padding: 0 1.25rem 0.35rem;
}
</style>
