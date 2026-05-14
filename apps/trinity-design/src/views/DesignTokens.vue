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

const toc = [
  { id: "dt-cat-brand", label: "品牌与主色" },
  { id: "dt-cat-surface", label: "背景与表面" },
  { id: "dt-cat-scene-cards", label: "对话场景卡合成底" },
  { id: "dt-cat-text", label: "文字色阶" },
  { id: "dt-cat-border", label: "描边" },
  { id: "dt-cat-interaction", label: "交互与焦点" },
  { id: "dt-console-pagehead", label: "控制台 · 页头" },
  { id: "dt-cat-glass", label: "弹层与玻璃态" },
  { id: "dt-cat-auth", label: "注册 / 认证" },
  { id: "dt-cat-layout", label: "尺寸与圆角" },
  { id: "dt-cat-type", label: "字体栈" },
] as const;

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
  <div class="dt-page">
    <aside class="dt-sidebar" aria-label="色板目录">
      <p class="dt-sidebar-title">本页章节</p>
      <nav class="dt-sidebar-nav" aria-label="锚点跳转">
        <a v-for="row in toc" :key="row.id" class="dt-sidebar-link" :href="'#' + row.id">{{ row.label }}</a>
      </nav>
    </aside>
    <div class="dt-content" v-html="html" @click="onClickNav" />
  </div>
</template>
