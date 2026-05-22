<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import DevDocEditor from "./DevDocEditor.vue";
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <DevDocEditor />
    </template>
  </DefaultTheme.Layout>
</template>
