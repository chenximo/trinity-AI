<script setup lang="ts">
import { computed } from "vue";
import type { InvoiceStatus } from "./mock";

const props = defineProps<{
  status: InvoiceStatus;
}>();

const toneClass = computed(() => {
  switch (props.status) {
    case "开票成功":
      return "is-success";
    case "待审核":
      return "is-pending";
    case "开票处理中":
      return "is-processing";
    case "已驳回":
      return "is-rejected";
    default:
      return "";
  }
});
</script>

<template>
  <span class="or-cloud-invoice-status-badge" :class="toneClass" :data-status="status">
    {{ status }}
  </span>
</template>
