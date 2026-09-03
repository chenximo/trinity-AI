<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const title = computed(() => (typeof route.meta.title === "string" ? route.meta.title : "页面"));
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-card" style="margin-top: 2rem; text-align: center">
      <h1>{{ title }}</h1>
      <p class="geo-settings-card-desc">本页尚未迁入 Vue 五件套，请对照 HTML 原型走查。</p>
      <p>
        <a
          class="geo-btn primary"
          href="/__geo_marketing/console/dashboard.html"
          target="_blank"
          rel="noopener"
        >
          打开 HTML 原型目录
        </a>
      </p>
    </div>
  </main>
</template>
