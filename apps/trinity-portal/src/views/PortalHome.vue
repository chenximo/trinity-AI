<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getTrinityDocsSiteUrl } from "@trinity-ai/trinityDocsSite";

const docsSiteUrl = getTrinityDocsSiteUrl();
</script>

<template>
  <main class="portal-home or-site" style="padding: 1.25rem var(--page-gutter, 1rem); max-width: 44rem">
    <h1 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.5rem; color: var(--text)">开发枢纽</h1>
    <p style="color: var(--muted); font-size: 0.875rem; line-height: 1.55; margin: 0 0 1rem">
      单端口聚合各 <code>apps/*</code> 预览路由；生产构建仍以各 app 的 <code>npm run build -w …</code> 为准。
    </p>
    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; line-height: 1.75; color: var(--text)">
      <li>
        <strong>设计枢纽</strong>（<code>trinity-design</code>）：<a href="/design-tokens" style="color: var(--el-color-primary)">色板</a> ·
        <a href="/design-spec" style="color: var(--el-color-primary)">UI 规范</a> ·
        <a href="/admin-ops-spec" style="color: var(--el-color-primary)">运营后台管理系统</a> ·
        <a href="/user-console-spec" style="color: var(--el-color-primary)">用户管理系统</a>
      </li>
      <li>
        <strong>产品骨架</strong>：Trinity AI、AI Cloud、GEO、Admin
      </li>
      <li>
        <strong>对外 API 文档</strong>（<code>trinity-docs</code> · VitePress）：
        <a :href="docsSiteUrl" style="color: var(--el-color-primary)">打开文档站</a>
        · 另开 <code>npm run dev:trinity-docs</code>；开发访问 <code>/docs/</code>（代理到 :5205）。<em>非</em> <code>admin-docs</code>。
      </li>
    </ul>

    <h2 style="font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: var(--text)">运营后台 · 登录 / 登出</h2>
    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; line-height: 1.75; color: var(--text)">
      <li>
        <a href="/trinity-ai-admin/login" style="color: var(--el-color-primary)">登录页</a>
        — 演示账号 <code>zhang.san</code>
      </li>
      <li>
        <a href="/trinity-ai-admin/logout" style="color: var(--el-color-primary)">登出页</a>
        — 需先登录；壳内菜单「退出登录」亦进入此页
      </li>
    </ul>

    <p style="margin: 1.5rem 0 0; font-size: 0.8125rem; color: var(--muted); line-height: 1.55">
      规范展示页源码：<code>apps/trinity-design/src/views/ops-admin-system/</code>、<code>user-admin-system/</code>
    </p>
  </main>
</template>
