<script setup lang="ts">
const open = defineModel<boolean>({ required: true });

withDefaults(
  defineProps<{
    title: string;
    width?: string;
    headNote?: string;
    closeOnClickModal?: boolean;
  }>(),
  {
    width: "520px",
    closeOnClickModal: true,
  },
);
</script>

<template>
  <el-dialog
    v-model="open"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    append-to-body
    destroy-on-close
    align-center
    class="admin-ep-dialog"
  >
    <p v-if="headNote" class="admin-ep-dialog__note">{{ headNote }}</p>
    <slot />
    <template v-if="$slots.footer" #footer>
      <div class="admin-ep-dialog__footer">
        <slot name="footer" />
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.admin-ep-dialog__note {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--el-text-color-secondary);
}
.admin-ep-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
