<script setup lang="ts">
defineProps<{
  /** 样例说明，显示在框上方 */
  caption?: string;
  /** 锚点 id，便于从文档链入 */
  id?: string;
}>();
</script>

<template>
  <div class="user-console-spec-sample" :id="id">
    <p v-if="caption" class="user-console-spec-sample__cap">{{ caption }}</p>
    <div class="user-console-spec-sample__frame account-console-root">
      <slot />
    </div>
  </div>
</template>
