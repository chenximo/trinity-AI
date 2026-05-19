<script setup lang="ts">
defineProps<{
  beforeJson?: string;
  afterJson?: string;
  changedFields?: string;
}>();
</script>

<template>
  <div class="admin-audit-diff">
    <div class="admin-audit-diff__block">
      <h4 class="admin-audit-diff__title">改前 (before)</h4>
      <pre class="admin-audit-diff__pre">{{ beforeJson || "—" }}</pre>
    </div>
    <div class="admin-audit-diff__block">
      <h4 class="admin-audit-diff__title">改后 (after)</h4>
      <pre class="admin-audit-diff__pre">{{ afterJson || "—" }}</pre>
    </div>
    <div v-if="changedFields" class="admin-audit-diff__block admin-audit-diff__block--full">
      <h4 class="admin-audit-diff__title">变更字段</h4>
      <pre class="admin-audit-diff__pre">{{ changedFields }}</pre>
    </div>
  </div>
</template>

<style scoped>
.admin-audit-diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.admin-audit-diff__block--full {
  grid-column: 1 / -1;
}
.admin-audit-diff__title {
  margin: 0 0 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}
.admin-audit-diff__pre {
  margin: 0;
  padding: 0.5rem 0.65rem;
  max-height: 12rem;
  overflow: auto;
  font-size: 0.6875rem;
  line-height: 1.45;
  border-radius: 0.35rem;
  background: var(--surface-2);
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
