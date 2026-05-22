<script setup lang="ts">
import { onMounted } from "vue";
import { getTrinityDocsSiteUrl } from "../../trinityDocsSite";

defineOptions({ name: "TaiDocsPage" });

/** `/docs` 路由占位：跳转至 VitePress 文档站 */
onMounted(() => {
  window.location.replace(getTrinityDocsSiteUrl());
});
</script>

<template>
  <main class="mvp-main docs-page-root" id="main">
    <p class="mvp-lead">正在打开文档站…</p>
  </main>
</template>
