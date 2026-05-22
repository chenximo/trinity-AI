<script setup lang="ts">
import { computed } from "vue";
import { useData, useRouter, withBase } from "vitepress";
import { DOCS_SUBNAV, isApiSection } from "./docsNav";

const { page } = useData();
const router = useRouter();

/** 用 relativePath 判断轨；route.path 在浏览器内含 /docs base，不能单独依赖 */
const activeId = computed(() =>
  isApiSection(page.value.relativePath) ? "api" : "docs",
);

function tabHref(href: string) {
  return withBase(href);
}

function onTabClick(e: MouseEvent, href: string) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  // router.go 需要含 site base 的路径（如 /docs/api/overview），勿传裸 /api/...
  void router.go(withBase(href));
}
</script>

<template>
  <div class="tdocs-subnav-anchor">
    <nav class="tdocs-subnav" aria-label="文档与 API">
      <div class="tdocs-subnav__inner">
        <a
          v-for="tab in DOCS_SUBNAV"
          :key="tab.id"
          :href="tabHref(tab.href)"
          class="tdocs-subnav__tab"
          :class="{ 'is-active': activeId === tab.id }"
          @click="onTabClick($event, tab.href)"
        >
          <span class="tdocs-subnav__icon" :class="`tdocs-subnav__icon--${tab.id}`" aria-hidden="true" />
          {{ tab.label }}
        </a>
      </div>
    </nav>
  </div>
</template>
