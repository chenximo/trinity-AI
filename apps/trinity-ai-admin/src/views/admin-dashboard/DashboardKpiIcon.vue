<script setup lang="ts">
import type { DashboardKpiIcon } from "./mock";

defineProps<{ icon: DashboardKpiIcon }>();
</script>

<template>
  <svg v-if="icon === 'activity'" viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
    <path
      d="M4 14.5 8 10l3 3 5-6 4 5"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  <svg v-else-if="icon === 'shield'" viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
    <path
      d="M12 3 5 6v5c0 4 3.2 7.4 7 8 3.8-.6 7-4 7-8V6l-7-3Z"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linejoin="round"
    />
  </svg>
  <svg v-else-if="icon === 'users'" viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
    <circle cx="9" cy="8" r="2.5" stroke="currentColor" stroke-width="1.75" />
    <circle cx="15" cy="8" r="2.5" stroke="currentColor" stroke-width="1.75" />
    <path
      d="M4 20c0-3 2.5-5 5-5h6c2.5 0 5 2 5 5"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
    />
  </svg>
  <svg v-else viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
    <path
      d="M4 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
      stroke="currentColor"
      stroke-width="1.75"
    />
    <path d="M16 12h3v4h-3" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" />
  </svg>
</template>
