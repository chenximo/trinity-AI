<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useTrinityDesignThemeBar } from "@trinity-design/composables/useTrinityDesignTheme";

const route = useRoute();
const router = useRouter();
const { setTheme } = useTrinityDesignThemeBar();

type HubPath =
  | "/"
  | "/design-tokens"
  | "/design-spec"
  | "/trinity-ai"
  | "/ai-cloud"
  | "/trinity-geo"
  | "/trinity-ai-admin";

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
        <h1>Trinity · 开发枢纽</h1>
        <p>单端口 <code>:5173</code> · 各 app 仍可按原端口独立启动</p>
      </div>
      <div class="design-hub-topnav-actions">
        <nav class="design-hub-nav design-hub-nav--wrap" aria-label="应用与文档">
          <a
            href="/"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/') }"
            @click="hubNav('/', $event)"
            >首页</a>
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
          <a
            href="/trinity-ai"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/trinity-ai') }"
            @click="hubNav('/trinity-ai', $event)"
            >Trinity AI</a>
          <a
            href="/ai-cloud"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/ai-cloud') }"
            @click="hubNav('/ai-cloud', $event)"
            >AI Cloud</a>
          <a
            href="/trinity-geo"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/trinity-geo') }"
            @click="hubNav('/trinity-geo', $event)"
            >GEO</a>
          <a
            href="/trinity-ai-admin"
            class="design-hub-nav-link"
            :class="{ 'is-active': hubNavActive('/trinity-ai-admin') }"
            @click="hubNav('/trinity-ai-admin', $event)"
            >Admin</a>
        </nav>
        <div class="dt-theme-bar" role="group" aria-label="预览主题">
          <span>主题预览</span>
          <button type="button" class="dt-theme-btn" data-dt-theme="light" @click="setTheme('light')">浅色</button>
          <button type="button" class="dt-theme-btn" data-dt-theme="dark" @click="setTheme('dark')">深色</button>
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
