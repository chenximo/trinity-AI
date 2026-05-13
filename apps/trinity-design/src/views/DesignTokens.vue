<script setup lang="ts">
/** 设计色板页；正文片段来自 `design-tokens-main-inner.html`（REFERENCE ONLY，新内容优先迁入本组件模板）。 */
import { computed } from "vue";
import { useRouter } from "vue-router";
import tokensInner from "../assets/design-tokens-main-inner.html?raw";
import { useDesignTokensRuntime } from "../composables/useDesignTokensRuntime";

const router = useRouter();

const html = computed(() =>
  tokensInner
    .replace(/href="design-spec\.html"/g, 'href="/design-spec"')
    .replace(/href="design-tokens\.html"/g, 'href="/design-tokens"')
);

useDesignTokensRuntime();

function onClickNav(e: MouseEvent) {
  const t = e.target;
  const el = t instanceof Element ? t : t instanceof Node ? t.parentElement : null;
  if (!el) return;
  const a = el.closest("a[href]");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  if (href === "/design-spec" || href === "/design-tokens") {
    e.preventDefault();
    if (router.currentRoute.value.path === href) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    void router.push(href);
  }
}
</script>

<template>
  <main id="dt-main" class="dt-main" v-html="html" @click="onClickNav" />
</template>
