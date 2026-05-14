<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import mainScrollHtml from "./raw/orc-main-scroll.html?raw";
import composerHtml from "./raw/orc-composer.html?raw";
import { patchTaiChatAnchors } from "./patchTaiChatAnchors";

const props = defineProps<{ drawer2Visible: boolean }>();
const emit = defineEmits<{ openDrawer: [] }>();

const host = ref<HTMLElement | null>(null);
const router = useRouter();

function paint() {
  const el = host.value;
  if (!el) return;
  el.innerHTML = `${mainScrollHtml.trim()}\n${composerHtml.trim()}`;
  patchTaiChatAnchors(el, router);
  const btn = el.querySelector<HTMLElement>("#orc-btn-drawer-2");
  if (btn) btn.style.display = props.drawer2Visible ? "grid" : "none";
}

function onDelegatedClick(e: MouseEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (t.closest("#orc-btn-drawer-2")) emit("openDrawer");
}

onMounted(() => {
  paint();
  host.value?.addEventListener("click", onDelegatedClick);
});

watch(
  () => props.drawer2Visible,
  () => {
    const btn = host.value?.querySelector<HTMLElement>("#orc-btn-drawer-2");
    if (btn) btn.style.display = props.drawer2Visible ? "grid" : "none";
  },
  { flush: "post" }
);

onUnmounted(() => {
  host.value?.removeEventListener("click", onDelegatedClick);
});
</script>

<template>
  <div ref="host" class="chat-inlined-main-composer" />
</template>
