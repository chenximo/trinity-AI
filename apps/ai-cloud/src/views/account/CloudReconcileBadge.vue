<script setup lang="ts">
import { computed } from "vue";
import type { ReconcileStatus } from "./mock";

const props = defineProps<{
  status: ReconcileStatus;
}>();

const toneClass = computed(() => {
  switch (props.status) {
    case "已对账":
      return "is-done";
    case "待对账":
      return "is-pending";
    case "有差异":
      return "is-diff";
    default:
      return "";
  }
});
</script>

<template>
  <span class="or-cloud-reconcile-badge" :class="toneClass" :data-status="status">
    <svg
      v-if="status === '已对账'"
      class="or-cloud-reconcile-badge-icon"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <svg
      v-else-if="status === '待对账'"
      class="or-cloud-reconcile-badge-icon"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <svg
      v-else-if="status === '有差异'"
      class="or-cloud-reconcile-badge-icon"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5M12 16h.01" stroke-linecap="round" />
    </svg>
    {{ status }}
  </span>
</template>
