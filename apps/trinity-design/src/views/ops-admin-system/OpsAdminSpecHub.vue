<script setup lang="ts">
import ListExamplePage from "./list-example/ListExamplePage.vue";
import SpecHubCrossNav from "../_shared/SpecHubCrossNav.vue";
import "../_shared/spec-hub-chrome.css";
import "./ops-admin-spec-preview.css";
</script>

<template>
  <div class="spec-hub">
    <header class="spec-hub__bar" aria-label="运营后台管理系统规范">
      <div class="spec-hub__bar-inner">
        <RouterLink to="/design-tokens" class="spec-hub__back">← 设计枢纽</RouterLink>
        <SpecHubCrossNav />
        <h1 class="spec-hub__title">运营后台管理系统 · 列表页规范样板</h1>
        <p class="spec-hub__note">
          路由 <code>/admin-ops-spec</code> · 与业务页
          <code>trinity-ai-admin/keys/platform-keys</code> 共用
          <code>KeysPage.vue</code> · 文档
          <code>docs/02-后台运营管理系统设计/</code>
        </p>
      </div>
    </header>
    <main class="spec-hub__main">
      <div class="admin-shell admin-ops-spec-preview__shell" aria-label="运营后台列表预览">
        <main class="admin-shell__main">
          <ListExamplePage />
        </main>
      </div>
    </main>
  </div>
</template>
