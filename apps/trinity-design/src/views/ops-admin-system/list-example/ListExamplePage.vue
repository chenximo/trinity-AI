<script setup lang="ts">
/**
 * 列表页规范样板 · 与业务页 `keys/platform-keys` 共用 KeysPage（平台密钥面板）。
 * 路由默认无 `stubSecondaryId` 时即为 platform-keys。
 */
import KeysPage from "@trinity-ai-admin/views/admin-keys/KeysPage.vue";
</script>

<template>
  <KeysPage />
</template>
