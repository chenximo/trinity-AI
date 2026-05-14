/**
 * 一次性/可重复：从 `TrinityAI/account/console.html` 生成 `ConsolePage.vue` 模板片段。
 * 运行：`node scripts/gen-account-console-page.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const consoleHtml = path.join(repoRoot, "TrinityAI/account/console.html");
const outVue = path.join(repoRoot, "apps/trinity-ai/src/views/account/ConsolePage.vue");

const lines = fs.readFileSync(consoleHtml, "utf8").split("\n");
/** 1-based 31–1462：`<div class="or-shell">` … 模态结尾，不含外层 `<main>` */
const mainInner = lines.slice(30, 1462).join("\n");
/** Vue 壳内控制台不保留静态 `page-foot`（产品布局：顶栏 + 左栏 + 主列，无底部栏） */
const foot = "";

function spaLinks(html) {
  let h = html;
  h = h.replace(
    /<a href="\.\/"([^>]*)>Trinity AI<\/a>/g,
    "<RouterLink :to=\"{ name: 'tai-home' }\"$1>Trinity AI</RouterLink>"
  );
  h = h.replace(
    /<a href="\.\/" class="text-link">← 首页<\/a>/g,
    '<RouterLink :to="{ name: \'tai-home\' }" class="text-link">← 首页</RouterLink>'
  );
  h = h.replace(
    /<a href="\.\.\/app\/models\.html">模型<\/a>/g,
    '<RouterLink :to="{ name: \'tai-models\' }">模型</RouterLink>'
  );
  h = h.replace(
    /<a href="\.\.\/app\/chat\/index\.html">对话<\/a>/g,
    '<RouterLink :to="{ name: \'tai-chat\' }">对话</RouterLink>'
  );
  h = h.replace(
    /<a href="\.\.\/app\/docs\.html">文档<\/a>/g,
    '<RouterLink :to="{ name: \'tai-docs\' }">文档</RouterLink>'
  );
  h = h.replace(
    /<a href="\.\.\/app\/models\.html" class="text-link">模型<\/a>/g,
    '<RouterLink :to="{ name: \'tai-models\' }" class="text-link">模型</RouterLink>'
  );
  h = h.replace(
    /<a href="\.\.\/app\/chat\/index\.html" class="text-link">Trinity AI: 对话<\/a>/g,
    '<RouterLink :to="{ name: \'tai-chat\' }" class="text-link">Trinity AI: 对话</RouterLink>'
  );
  h = h.replace(
    /<a href="\.\.\/app\/chat\/index\.html" class="or-btn-outline" style="text-decoration: none">在对话中测试<\/a>/g,
    '<RouterLink :to="{ name: \'tai-chat\' }" class="or-btn-outline" style="text-decoration: none">在对话中测试</RouterLink>'
  );
  return h;
}

const body = spaLinks(mainInner + (foot ? "\n" + foot : ""));

const vue = `<script setup lang="ts">
import { onActivated, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import "./account.css";
import {
  mountAccountConsoleInteractions,
  type AccountConsoleHandle,
} from "./accountInteractions";

defineOptions({ name: "TaiAccountConsolePage" });

const rootRef = ref<HTMLElement | null>(null);
let handle: AccountConsoleHandle | undefined;

onMounted(() => {
  if (rootRef.value) {
    void mountAccountConsoleInteractions(rootRef.value).then((h) => {
      handle = h;
    });
  }
});

onActivated(() => {
  handle?.syncHashPanels();
});

onUnmounted(() => {
  handle?.dispose();
});
</script>

<template>
  <main ref="rootRef" class="mvp-main account-console-root">
${body}
  </main>
</template>
`;

fs.writeFileSync(outVue, vue, "utf8");
console.log("Wrote", outVue);
