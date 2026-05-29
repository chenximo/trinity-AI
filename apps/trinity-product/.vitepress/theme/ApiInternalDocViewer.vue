<script setup lang="ts">
import { computed, ref } from "vue";
import source from "@trinity-engineer-docs/API对外接口支持参数.md?raw";
import { renderApiDocMarkdown } from "./renderApiDocMarkdown";
import "./api-internal-doc.css";

const wrapRef = ref<HTMLElement | null>(null);

/** 去掉源文 H1，本页标题由手册页「API 内测文档」承担 */
const docBody = source.replace(/^#\s+[^\n]+\n+/, "");

const html = computed(() => renderApiDocMarkdown(docBody));

async function onWrapClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-api-json-copy]");
  if (!btn || !wrapRef.value?.contains(btn)) return;
  const mod = btn.closest("[data-api-json-module], [data-api-shell-module]");
  const code = mod?.querySelector("code")?.textContent?.trim();
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    const prev = btn.textContent;
    btn.textContent = "已复制";
    btn.disabled = true;
    window.setTimeout(() => {
      btn.textContent = prev;
      btn.disabled = false;
    }, 1200);
  } catch {
    btn.textContent = "复制失败";
  }
}
</script>

<template>
  <div ref="wrapRef" class="api-internal-doc-wrap" @click="onWrapClick">
    <p class="api-internal-doc-source">
      内容真源：<code>docs/00-协作与工作流/工程师/API对外接口支持参数.md</code>（构建时同步渲染；JSON 块格式化为可复制的示例模块）
    </p>
    <article class="vp-doc api-internal-doc" v-html="html" />
  </div>
</template>
