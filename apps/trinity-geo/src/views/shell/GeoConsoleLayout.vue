<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { CONSOLE_NAV } from "./mock";
import { useGeoConsoleBodyClass } from "./shellInteractions";

const route = useRoute();
useGeoConsoleBodyClass();

const activeNav = computed(() => (typeof route.meta.nav === "string" ? route.meta.nav : ""));
</script>

<template>
  <div class="geo-console">
    <header class="geo-console-header">
      <div class="geo-console-header-inner">
        <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-console-logo">
          <span class="geo-console-logo-mark" aria-hidden="true">◎</span>
          Trinity GEO
        </RouterLink>
        <nav class="geo-console-nav" aria-label="控制台主导航">
          <RouterLink
            v-for="item in CONSOLE_NAV"
            :key="item.nav"
            :to="item.to"
            :class="{ 'is-active': activeNav === item.nav }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <div class="geo-console-user">
          <span class="geo-console-brand">Trinity AI</span>
          <RouterLink :to="{ name: 'geo-settings-account' }" class="geo-console-account">账户</RouterLink>
        </div>
      </div>
    </header>
    <RouterView />
  </div>
</template>
