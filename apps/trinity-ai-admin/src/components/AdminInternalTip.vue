<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue";

defineProps<{
  heading: string;
  explain: string;
}>();
</script>

<template>
  <el-popover placement="right" :width="280" trigger="click" popper-class="admin-ep-tip-popper">
    <template #reference>
      <el-button
        type="info"
        link
        class="admin-ep-tip-trigger"
        :aria-label="explain"
        :title="explain"
        @click.stop
      >
        <el-icon :size="14"><QuestionFilled /></el-icon>
      </el-button>
    </template>
    <p class="admin-ep-tip-heading">{{ heading }}</p>
    <div class="admin-ep-tip-body">
      <slot />
    </div>
  </el-popover>
</template>

<style scoped>
.admin-ep-tip-trigger {
  padding: 0 0.15rem;
  height: 1.25rem;
  vertical-align: middle;
}
.admin-ep-tip-heading {
  margin: 0 0 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.admin-ep-tip-body {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}
.admin-ep-tip-body :deep(p) {
  margin: 0 0 0.35rem;
}
.admin-ep-tip-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
