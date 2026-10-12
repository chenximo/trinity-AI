<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const active = computed(() => route.path);

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
        <el-menu-item index="/cloud">消耗台账</el-menu-item>
        <el-menu-item index="/recon">账单对账</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main">
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
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 20px 40px;
}
</style>
