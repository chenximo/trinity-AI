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
    /** 无关键词检索时设为 false（如档案页仅供应商下拉） */
    showSearch?: boolean;
  }>(),
  {
    searchPlaceholder: "关键词检索…",
    searchWidth: "16rem",
    searchAriaLabel: "检索",
    showReset: true,
    showSearch: true,
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
    <div class="admin-list-query__main">
      <AdminSearchInput
        v-if="showSearch"
        v-model="searchQ"
        :input-id="inputId"
        :placeholder="searchPlaceholder"
        :width="searchWidth"
        :aria-label="searchAriaLabel"
      />
      <slot name="filters" />
      <!-- 筛选类控件：日期范围等，靠左与检索/下拉同一组 -->
      <slot />
      <el-button v-if="showReset" @click="onReset">
        <el-icon class="el-icon--left"><Refresh /></el-icon>
        重置
      </el-button>
    </div>
    <div v-if="$slots.actions" class="admin-list-query__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.admin-list-query {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1 1 auto;
  width: 100%;
}

.admin-list-query__main {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1 1 auto;
}

.admin-list-query__actions {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: auto;
}

.admin-list-query__actions > .el-button,
.admin-list-query__actions > .el-button + .el-button {
  margin-left: 0;
}
</style>
