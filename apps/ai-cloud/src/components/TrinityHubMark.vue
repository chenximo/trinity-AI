<script setup lang="ts">
defineOptions({ name: "TrinityHubMark" });
</script>

<template>
  <svg class="trinity-hub-mark" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="trinity-hub-grad-a" x1="6" y1="38" x2="42" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#22d3ee" />
        <stop offset="50%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>
    </defs>
    <path
      fill="none"
      stroke="url(#trinity-hub-grad-a)"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.5 29.5c-5.5-3.5-5.8-11.2-.5-14.8 3.8-2.7 8.6-2.5 12.2-.2M34.5 29.5c5.5-3.5 5.8-11.2.5-14.8-3.8-2.7-8.6-2.5-12.2-.2M24 15.5c0-5.5 4.8-9.2 10.2-7.8 2.8.7 5 3 5.8 5.8"
    />
  </svg>
</template>

<style scoped>
.trinity-hub-mark {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
