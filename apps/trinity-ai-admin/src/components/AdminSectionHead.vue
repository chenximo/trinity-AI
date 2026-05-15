<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="admin-section-head">
    <div class="admin-section-head__start">
      <div class="admin-section-title-row">
        <h2 class="admin-section-title">{{ title }}</h2>
        <slot name="annot" />
      </div>
      <p v-if="$slots.desc" class="admin-section-desc"><slot name="desc" /></p>
    </div>
    <div v-if="$slots.tools" class="admin-section-head__end">
      <div class="admin-section-tools">
        <slot name="tools" />
      </div>
    </div>
  </div>
</template>
