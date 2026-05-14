<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTrinityDesignThemeBar } from "./composables/useTrinityDesignTheme";

const route = useRoute();
const router = useRouter();
const { setTheme } = useTrinityDesignThemeBar();

const menuOpen = ref(false);

type HubPath = "/design-tokens" | "/design-spec";

function hubNav(to: HubPath, e: MouseEvent) {
  e.preventDefault();
  if (route.path === to) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  void router.push(to);
}

function hubNavActive(to: HubPath) {
  return route.path === to;
}

function hubNavFromMenu(to: HubPath, e: MouseEvent) {
  hubNav(to, e);
  menuOpen.value = false;
}

function onDocKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") menuOpen.value = false;
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);

onMounted(() => {
  document.addEventListener("keydown", onDocKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onDocKeydown);
});
</script>

<template>
  <div class="design-hub-shell or-site" data-or-page="home">
    <div v-show="menuOpen" class="design-hub-fab-scrim" aria-hidden="true" @click="menuOpen = false" />

    <div class="design-hub-fab-stack">
      <button
        type="button"
        class="design-hub-fab-btn"
        :aria-expanded="menuOpen"
        aria-controls="design-hub-fab-panel"
        aria-haspopup="dialog"
        @click="menuOpen = !menuOpen"
      >
        <span class="design-hub-fab-btn-title">Trinity · 设计枢纽</span>
        <span class="design-hub-fab-btn-chevron" :class="{ 'is-open': menuOpen }" aria-hidden="true">▾</span>
      </button>

      <div
        v-show="menuOpen"
        id="design-hub-fab-panel"
        class="design-hub-fab-card"
        role="dialog"
        aria-label="设计枢纽导航"
        @click.stop
      >
        <p class="design-hub-fab-card-lead">Vue 迁移 · 与 <code>TrinityAI/design-*.html</code> 对齐</p>
        <nav class="design-hub-fab-nav design-hub-fab-nav--dense" aria-label="设计页">
          <a
            href="/design-tokens"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/design-tokens') }"
            @click="hubNavFromMenu('/design-tokens', $event)"
            >设计色板</a>
          <a
            href="/design-spec"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/design-spec') }"
            @click="hubNavFromMenu('/design-spec', $event)"
            >设计规范</a>
        </nav>
        <div class="design-hub-fab-card-foot">
          <div class="dt-theme-bar" role="group" aria-label="预览主题">
            <span>主题预览</span>
            <button type="button" class="dt-theme-btn" data-dt-theme="light" @click="setTheme('light')">
              浅色
            </button>
            <button type="button" class="dt-theme-btn" data-dt-theme="dark" @click="setTheme('dark')">
              深色
            </button>
            <button type="button" class="dt-theme-btn" data-dt-theme="system" @click="setTheme('system')">
              跟随系统
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="design-hub-main">
      <router-view />
    </div>
  </div>
</template>
