<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";

const model = defineModel<string>({ default: "" });

withDefaults(
  defineProps<{
    placeholder?: string;
    width?: string;
    inputId?: string;
    ariaLabel?: string;
  }>(),
  {
    placeholder: "搜索…",
    width: "17.5rem",
    inputId: undefined,
    ariaLabel: "搜索",
  },
);
</script>

<template>
  <el-input
    :id="inputId"
    v-model="model"
    clearable
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    class="admin-ep-search"
    :style="{ width }"
  >
    <template #prefix>
      <el-icon><Search /></el-icon>
    </template>
  </el-input>
</template>

<style scoped>
.admin-ep-search {
  flex-shrink: 0;
}
</style>
