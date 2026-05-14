import fs from "node:fs";

const indexPath = new URL("../../../TrinityAI/index.html", import.meta.url);
const outPath = new URL("../src/views/MarketingHome.vue", import.meta.url);

const lines = fs.readFileSync(indexPath, "utf8").split("\n");
const mainInner = lines.slice(1077, 1584).join("\n");
const footer = lines.slice(1586, 1649).join("\n");
let body = `${mainInner}\n${footer}`;

body = body.replace(
  /<div class="hero-cta">[\s\S]*?<\/div>\s*\n\s*<div class="hero-trust"/,
  `<div class="hero-cta">
          <TButton variant="gradient" type="button" class="btn btn-gradient" @click="goConsole">立即接入&nbsp;→</TButton>
          <TButton variant="outline" type="button" class="btn btn-outline-hero" @click="goDocs">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8M8 11h6" />
            </svg>
            查看文档
          </TButton>
        </div>
        <div class="hero-trust"`
);

body = body.replace(
  /<a href="app\/models\.html" class="browse-all">查看全部模型 →<\/a>/,
  '<RouterLink class="browse-all" :to="{ name: \'tai-models\' }">查看全部模型 →</RouterLink>'
);

body = body.replace(
  /<a href="app\/docs\.html" class="more">了解更多 →<\/a>/g,
  '<RouterLink class="more" :to="{ name: \'tai-docs\' }">了解更多 →</RouterLink>'
);

body = body.replace(
  /<a href="app\/models\.html" class="more">查看全部模型 →<\/a>/,
  '<RouterLink class="more" :to="{ name: \'tai-models\' }">查看全部模型 →</RouterLink>'
);

body = body.replace(
  /<a href="app\/docs\.html" class="more">查看文档 →<\/a>/,
  '<RouterLink class="more" :to="{ name: \'tai-docs\' }">查看文档 →</RouterLink>'
);

body = body.replace(
  /<div class="view-all-row"><a href="app\/models\.html" class="view-all">查看全部 →<\/a><\/div>/,
  '<div class="view-all-row"><RouterLink class="view-all" :to="{ name: \'tai-models\' }">查看全部 →</RouterLink></div>'
);

body = body.replace(
  /<div class="view-all-row"><a href="#apps" class="view-all">查看全部 →<\/a><\/div>/,
  '<div class="view-all-row"><a href="#apps" class="view-all">查看全部 →</a></div>'
);

body = body.replace(
  /<a class="text-link" href="app\/docs\.html">兼容 OpenAI 生态<\/a>/,
  '<RouterLink class="text-link" :to="{ name: \'tai-docs\' }">兼容 OpenAI 生态</RouterLink>'
);

body = body.replace(/<a href="app\/models\.html">模型<\/a>/, '<RouterLink :to="{ name: \'tai-models\' }">模型</RouterLink>');

for (const label of ["文档中心", "API 参考", "SDK", "服务状态"]) {
  body = body.replace(
    new RegExp(`<a href="app/docs.html">${label}</a>`, "g"),
    `<RouterLink :to="{ name: 'tai-docs' }">${label}</RouterLink>`
  );
}

body = body.replace(
  /<button type="button" class="oauth-btn">Google<\/button>\s*<button type="button" class="oauth-btn">GitHub<\/button>\s*<button type="button" class="oauth-btn" title="Web3 钱包">◇<\/button>/,
  `<button type="button" class="oauth-btn" @click="openDemoAuth">Google</button>
              <button type="button" class="oauth-btn" @click="openDemoAuth">GitHub</button>
              <button type="button" class="oauth-btn" title="Web3 钱包" @click="openDemoAuth">◇</button>`
);

if (/href="app\//.test(body) || /href="account\//.test(body)) {
  console.error("Unresolved static href remains");
  const m = body.match(/href="(app|account)\/[^"]+"/);
  throw new Error(m ? m[0] : "unknown");
}

const vue = `<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { TButton } from "@trinity/ui";
import "./marketing-home.css";

const router = useRouter();

function goConsole() {
  void router.push({ name: "tai-account-console" });
}

function goDocs() {
  void router.push({ name: "tai-docs" });
}

function openDemoAuth() {
  window.TrinityOR?.openSignIn?.("signin");
}
</script>

<template>
  <div class="marketing-root">
${body}
  </div>
</template>
`;

fs.writeFileSync(outPath, vue, "utf8");
console.log("Wrote", outPath.pathname, "bytes", Buffer.byteLength(vue));
