<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useTrinityDesignThemeBar } from "./composables/useTrinityDesignTheme";

const route = useRoute();
const router = useRouter();
const { setTheme } = useTrinityDesignThemeBar();

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
</script>

<template>
  <div class="design-hub-shell or-site" data-or-page="home">
    <header class="design-hub-topnav">
      <div>
        <h1>Trinity · 设计枢纽</h1>
        <p>Vue 迁移 · 与 <code>TrinityAI/design-*.html</code> 对齐</p>
      </div>
      <div class="design-hub-topnav-actions">
        <nav class="design-hub-nav" aria-label="设计页">
          <a
            href="/design-tokens"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/design-tokens') }"
            @click="hubNav('/design-tokens', $event)"
            >设计色板</a>
          <a
            href="/design-spec"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/design-spec') }"
            @click="hubNav('/design-spec', $event)"
            >设计规范</a>
        </nav>
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
    </header>
    <div class="design-hub-main">
      <router-view />
    </div>
  </div>
</template>
