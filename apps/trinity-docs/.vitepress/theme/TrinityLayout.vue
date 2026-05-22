<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import DevDocEditor from "./DevDocEditor.vue";
import DocsSubNav from "./DocsSubNav.vue";
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-top>
      <DocsSubNav />
    </template>
    <template #layout-bottom>
      <DevDocEditor />
    </template>
  </DefaultTheme.Layout>
</template>
