<script setup lang="ts">
import { Refresh } from "@element-plus/icons-vue";
import AdminSearchInput from "./AdminSearchInput.vue";

const searchQ = defineModel<string>("search", { default: "" });

withDefaults(
  defineProps<{
    searchPlaceholder?: string;
    searchWidth?: string;
    inputId?: string;
    searchAriaLabel?: string;
    showReset?: boolean;
  }>(),
  {
    searchPlaceholder: "关键词检索…",
    searchWidth: "16rem",
    searchAriaLabel: "检索",
    showReset: true,
  },
);

const emit = defineEmits<{
  reset: [];
}>();

function onReset(): void {
  searchQ.value = "";
  emit("reset");
}
</script>

<template>
  <div class="admin-list-query" role="search">
    <AdminSearchInput
      v-model="searchQ"
      :input-id="inputId"
      :placeholder="searchPlaceholder"
      :width="searchWidth"
      :aria-label="searchAriaLabel"
    />
    <slot name="filters" />
    <slot />
    <el-button v-if="showReset" @click="onReset">
      <el-icon class="el-icon--left"><Refresh /></el-icon>
      重置
    </el-button>
  </div>
</template>

<style scoped>
.admin-list-query {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1 1 auto;
}
</style>
