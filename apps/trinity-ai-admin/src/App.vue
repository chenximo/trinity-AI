<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white px-4 py-3">
      <h1 class="text-base font-semibold text-slate-900">Trinity AI · 管理端原型</h1>
      <p class="mt-0.5 text-xs text-slate-500">apps/trinity-ai-admin — 静态参考 TrinityAI_Admin/</p>
    </header>
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>
