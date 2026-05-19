<script setup lang="ts">
const model = defineModel<string>({ default: "" });

withDefaults(
  defineProps<{
    placeholder?: string;
    ariaLabel?: string;
    width?: string;
    clearable?: boolean;
  }>(),
  {
    placeholder: "筛选",
    width: "8.5rem",
    clearable: true,
  },
);
</script>

<template>
  <el-select
    v-model="model"
    :clearable="clearable"
    :placeholder="placeholder"
    :aria-label="ariaLabel ?? placeholder"
    class="admin-ep-filter-select"
    :style="{ width }"
  >
    <slot />
  </el-select>
</template>
