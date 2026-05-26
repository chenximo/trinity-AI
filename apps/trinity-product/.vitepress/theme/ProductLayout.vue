<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import DevDocEditTrigger from "./DevDocEditTrigger.vue";
import DevDocEditor from "./DevDocEditor.vue";
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <DevDocEditTrigger />
      <DevDocEditor />
    </template>
  </DefaultTheme.Layout>
</template>
