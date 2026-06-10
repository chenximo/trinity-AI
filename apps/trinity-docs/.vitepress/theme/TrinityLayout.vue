<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import DevDocChangelog from "./DevDocChangelog.vue";
import DevDocEditor from "./DevDocEditor.vue";
import DocsSubNav from "./DocsSubNav.vue";
import TrinityProductNav from "./TrinityProductNav.vue";
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-top>
      <TrinityProductNav />
      <DocsSubNav />
    </template>
    <template #layout-bottom>
      <DevDocChangelog />
      <DevDocEditor />
    </template>
  </DefaultTheme.Layout>
</template>
