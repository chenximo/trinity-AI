<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const STORAGE_KEY = "trinity-product.sidebar-collapsed";
const isCollapsed = ref(false);

const label = computed(() => (isCollapsed.value ? "显示手册侧栏" : "收起手册侧栏"));

const applyState = (collapsed: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("tdocs-sidebar-collapsed", collapsed);
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  applyState(isCollapsed.value);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(isCollapsed.value));
  }
};

onMounted(() => {
  if (typeof window === "undefined") return;
  isCollapsed.value = window.localStorage.getItem(STORAGE_KEY) === "true";
  applyState(isCollapsed.value);
});
</script>

<template>
  <button
    class="handbook-sidebar-toggle"
    type="button"
    :aria-label="label"
    :title="label"
    @click="toggleSidebar"
  >
    <span class="handbook-sidebar-toggle__arrow" aria-hidden="true">{{ isCollapsed ? "→" : "←" }}</span>
    <span>{{ isCollapsed ? "展开目录" : "收起目录" }}</span>
  </button>
</template>
