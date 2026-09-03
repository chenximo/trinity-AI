<script setup lang="ts">
/** 营销首页静态稿：经门户 /__geo_marketing/ 同源托管 */
import { onMounted, ref } from "vue";

const frameRef = ref<HTMLIFrameElement | null>(null);

function syncFrameHeight() {
  const frame = frameRef.value;
  if (!frame?.contentDocument?.body) return;
  frame.style.height = `${frame.contentDocument.documentElement.scrollHeight}px`;
}

onMounted(() => {
  const frame = frameRef.value;
  if (!frame) return;
  frame.addEventListener("load", () => {
    syncFrameHeight();
    frame.contentWindow?.addEventListener("resize", syncFrameHeight, { passive: true });
  });
});
</script>

<template>
  <iframe
    ref="frameRef"
    class="geo-marketing-frame"
    src="/__geo_marketing/index.html"
    title="Trinity GEO 营销首页"
  />
</template>

<style scoped>
.geo-marketing-frame {
  display: block;
  width: 100%;
  min-height: 100vh;
  border: 0;
  background: #fff;
}
</style>
