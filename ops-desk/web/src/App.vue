<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const active = computed(() => route.path);
/** 宽表页贴边；概览/表单页保留居中边距 */
const mainBleed = computed(() => route.path === "/recon");

function onSelect(path: string) {
  if (path !== route.path) router.push(path);
}
</script>

<template>
  <el-container class="layout">
    <el-header class="header" height="64px">
      <div class="brand">
        <div class="brand-title">Ops Desk</div>
        <div class="brand-sub">对账 / AI 云 · 独立运营台</div>
      </div>
      <el-menu
        mode="horizontal"
        :ellipsis="false"
        :default-active="active"
        class="top-menu"
        @select="onSelect"
      >
        <el-menu-item index="/">总览</el-menu-item>
        <el-menu-item index="/payments">出付款申请</el-menu-item>
        <el-menu-item index="/receipts">收款</el-menu-item>
        <el-menu-item index="/invoices">开票信息</el-menu-item>
        <el-menu-item index="/contracts">合同管理</el-menu-item>
        <el-menu-item index="/cloud">消耗台账</el-menu-item>
        <el-menu-item index="/finance">财务分类账</el-menu-item>
        <el-menu-item index="/recon">账单对账</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main" :class="{ 'main--bleed': mainBleed }">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: #f5f7fa;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 24px;
}
.brand-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}
.brand-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.top-menu {
  border-bottom: none !important;
  background: transparent;
}
.main {
  --el-main-padding: 20px 20px 40px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 20px 40px;
}
.main--bleed {
  --el-main-padding: 12px 0 24px;
  max-width: none;
  margin: 0;
  padding: 12px 0 24px;
}
</style>
