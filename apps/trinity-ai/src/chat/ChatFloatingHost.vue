<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import floatingHtml from "./raw/orc-floating-tail.html?raw";
import { paintMockPickerList, paintMockRolePickerList } from "./mock";
import { patchTaiChatAnchors } from "./patchTaiChatAnchors";

const host = ref<HTMLElement | null>(null);
const router = useRouter();

onMounted(() => {
  const el = host.value;
  if (!el) return;
  el.insertAdjacentHTML("beforeend", floatingHtml.trim());
  patchTaiChatAnchors(el, router);
  void nextTick(() => {
    paintMockPickerList();
    paintMockRolePickerList();
  });
});

onUnmounted(() => {
  host.value?.replaceChildren();
});
</script>

<template>
  <div ref="host" class="chat-floating-host" />
</template>
