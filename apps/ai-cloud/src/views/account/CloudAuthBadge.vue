<script setup lang="ts">
import { computed } from "vue";
import type { AuthStatus } from "./mock";

const props = defineProps<{
  status: AuthStatus;
}>();

const toneClass = computed(() => {
  switch (props.status) {
    case "已认证":
      return "is-verified";
    case "待补充":
      return "is-pending";
    case "审核中":
      return "is-reviewing";
    default:
      return "";
  }
});
</script>

<template>
  <span class="or-cloud-auth-badge" :class="toneClass" :data-auth="status">
    <svg
      v-if="status === '已认证'"
      class="or-cloud-auth-badge-icon"
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
      v-else-if="status === '待补充'"
      class="or-cloud-auth-badge-icon"
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
    <svg
      v-else-if="status === '审核中'"
      class="or-cloud-auth-badge-icon"
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
    {{ status }}
  </span>
</template>
