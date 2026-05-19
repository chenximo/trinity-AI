<script setup lang="ts">
import {
  ADMIN_DATE_RANGE_DEFAULT_TIME,
  ADMIN_DATE_RANGE_SHORTCUTS,
  type AdminDateRange,
} from "../utils/adminDateRange";

const range = defineModel<AdminDateRange | null>({ default: null });

withDefaults(
  defineProps<{
    startPlaceholder?: string;
    endPlaceholder?: string;
    ariaLabel?: string;
    width?: string;
    mode?: "date" | "datetime";
  }>(),
  {
    startPlaceholder: "开始",
    endPlaceholder: "结束",
    ariaLabel: "选择时间范围",
    width: "13.5rem",
    mode: "date",
  },
);
</script>

<template>
  <el-date-picker
    v-model="range"
    :type="mode === 'datetime' ? 'datetimerange' : 'daterange'"
    :shortcuts="[...ADMIN_DATE_RANGE_SHORTCUTS]"
    :default-time="mode === 'datetime' ? ADMIN_DATE_RANGE_DEFAULT_TIME : undefined"
    range-separator="至"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :format="mode === 'datetime' ? 'MM-DD HH:mm' : 'YYYY-MM-DD'"
    :unlink-panels="true"
    clearable
    :aria-label="ariaLabel"
    class="admin-ep-date-range"
    :style="{ width }"
  />
</template>
