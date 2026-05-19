<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string;
    hint?: string;
  }>(),
  {
    label: "导出 CSV",
    hint: "将导出当前筛选结果（原型占位，工程期接异步任务与审批）。",
  },
);

const emit = defineEmits<{
  export: [];
}>();

function onExport(): void {
  emit("export");
  window.alert(props.hint);
}
</script>

<template>
  <el-button type="primary" plain @click="onExport">{{ label }}</el-button>
</template>
