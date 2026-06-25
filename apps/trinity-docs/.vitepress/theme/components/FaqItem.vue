<script setup lang="ts">
defineProps<{
  question: string;
  id?: string;
}>();
</script>

<template>
  <details class="tdocs-faq-item" :id="id">
    <summary class="tdocs-faq-question">{{ question }}</summary>
    <div class="tdocs-faq-answer vp-doc">
      <slot />
    </div>
  </details>
</template>
