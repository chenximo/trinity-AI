<script setup lang="ts">
/**
 * 运营后台「对内说明 ⓘ」：对齐 design-spec `#ds-internal-tip`（`InternalHelpTip` · `layout="inline"`，气泡 Teleport 至 body）。
 */
import { InternalHelpTip } from "@trinity/ui";

defineProps<{
  /** 气泡标题（首行加粗） */
  heading: string;
  /** 触发器 `aria-label` */
  explain: string;
}>();
</script>

<template>
  <InternalHelpTip :title="heading" :aria-label="explain" layout="inline">
    <slot />
  </InternalHelpTip>
</template>
