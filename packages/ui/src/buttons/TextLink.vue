<script setup lang="ts">
/** 设计示意 · 按钮区文字链（弱跳转）。 */
defineProps<{
  href: string;
}>();
</script>

<template>
  <a :href="href" class="t-text-link"><slot /></a>
</template>

<style scoped>
.t-text-link {
  color: var(--blue);
  text-decoration: underline;
  text-underline-offset: 2px;
  font: inherit;
  cursor: pointer;
}

.t-text-link:hover {
  color: var(--purple);
}
</style>
