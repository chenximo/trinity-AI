<script setup lang="ts">
import { computed } from "vue";
import { resolveNavIconComponent, type NavIconKey } from "./adminNavIcons";

const props = withDefaults(
  defineProps<{
    iconKey: NavIconKey;
    variant?: "root" | "sub";
  }>(),
  {
    variant: "root",
  },
);

const Icon = computed(() => resolveNavIconComponent(props.iconKey));
</script>

<template>
  <span
    class="admin-shell__nav-ico"
    :class="{ 'admin-shell__nav-ico--sub': variant === 'sub' }"
    aria-hidden="true"
  >
    <el-icon><component :is="Icon" /></el-icon>
  </span>
</template>
