<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-slate-900">控制台</h2>
    <p class="mt-2 text-sm text-slate-600">静态真源：<code class="text-xs">TrinityAI/account/console.html</code>（阶段 E）。</p>
    <p class="mt-4 text-sm text-slate-600">
      <RouterLink
        :to="{ name: 'tai-home' }"
        class="text-[var(--blue)] underline underline-offset-2 hover:text-[var(--purple)]"
      >
        返回首页
      </RouterLink>
    </p>
  </div>
</template>
