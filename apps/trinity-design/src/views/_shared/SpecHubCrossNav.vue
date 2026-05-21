<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const links = [
  { to: "/design-tokens", label: "设计色板" },
  { to: "/design-spec", label: "UI 规范" },
  { to: "/admin-ops-spec", label: "运营后台管理系统" },
  { to: "/user-console-spec", label: "用户管理系统" },
] as const;
</script>

<template>
  <nav class="spec-hub-cross-nav" aria-label="设计枢纽规范导航">
    <RouterLink
      v-for="item in links"
      :key="item.to"
      :to="item.to"
      class="spec-hub-cross-nav__link"
      :class="{ 'is-active': route.path === item.to }"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>
