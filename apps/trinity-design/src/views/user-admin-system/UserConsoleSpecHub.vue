<script setup lang="ts">
import ConsoleSamplePage from "./console-sample/ConsoleSamplePage.vue";
import SpecHubCrossNav from "../_shared/SpecHubCrossNav.vue";
import "../_shared/spec-hub-chrome.css";
import "./user-console-spec-preview.css";
</script>

<template>
  <div class="spec-hub spec-hub--console-preview">
    <header class="spec-hub__bar" aria-label="用户管理系统规范">
      <div class="spec-hub__bar-inner">
        <RouterLink to="/design-tokens" class="spec-hub__back">← 设计枢纽</RouterLink>
        <SpecHubCrossNav />
        <h1 class="spec-hub__title">用户管理系统 · 控制台打样</h1>
        <p class="spec-hub__note">
          路由 <code>/user-console-spec</code> · 文档
          <code>docs/03-用户后台管理系统/用户后台管理风格统一规范.md</code> · 完整原型
          <a href="/trinity-ai/account/console">/trinity-ai/account/console</a>
        </p>
      </div>
    </header>
    <main class="spec-hub__main">
      <ConsoleSamplePage />
    </main>
  </div>
</template>
