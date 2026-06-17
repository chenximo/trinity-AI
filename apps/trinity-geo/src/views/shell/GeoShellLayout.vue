<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink, RouterView } from "vue-router";

const route = useRoute();
const isDemo = computed(() => route.path.endsWith("/demo"));
const isPortal = computed(() => route.path.startsWith("/trinity-geo"));
const homeTo = computed(() => (isPortal.value ? "/trinity-geo" : "/"));
const demoTo = computed(() => (isPortal.value ? "/trinity-geo/demo" : "/demo"));
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white px-4 py-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 class="text-base font-semibold text-slate-900">
            {{ isDemo ? "Trinity GEO · MVP 演示系统" : "Trinity GEO" }}
          </h1>
          <p class="mt-0.5 text-xs text-slate-500">
            {{
              isDemo
                ? "完整六环可演示 · Trinity × 豆包"
                : "营销首页"
            }}
          </p>
        </div>
        <nav class="flex gap-2 text-sm">
          <RouterLink
            :to="homeTo"
            class="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
            :class="{ '!bg-slate-900 !text-white': !isDemo }"
          >
            官网
          </RouterLink>
          <RouterLink
            :to="demoTo"
            class="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
            :class="{ '!bg-slate-900 !text-white': isDemo }"
          >
            MVP 演示
          </RouterLink>
        </nav>
      </div>
    </header>
    <main :class="isDemo ? '' : 'p-0'">
      <RouterView />
    </main>
  </div>
</template>
