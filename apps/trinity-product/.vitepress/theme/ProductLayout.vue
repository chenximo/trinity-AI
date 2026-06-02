<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import DevDocEditTrigger from "./DevDocEditTrigger.vue";
import DevDocEditor from "./DevDocEditor.vue";
import HandbookSidebarToggle from "./HandbookSidebarToggle.vue";
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <HandbookSidebarToggle />
      <DevDocEditTrigger />
      <DevDocEditor />
    </template>
  </DefaultTheme.Layout>
</template>
