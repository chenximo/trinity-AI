<script setup lang="ts">
defineProps<{
  /** 非 toolbar 模式时展示；卡片内列表可省略（面包屑已展示页名） */
  title?: string;
  /** 卡片内列表：仅筛选/操作栏 + 右侧原型说明图标 */
  toolbarOnly?: boolean;
}>();
</script>

<template>
  <header
    class="admin-section-head"
    :class="{ 'admin-section-head--toolbar': toolbarOnly }"
  >
    <template v-if="!toolbarOnly">
      <div class="admin-section-head__start">
        <div class="admin-section-title-row">
          <h2 v-if="title" class="admin-section-title">{{ title }}</h2>
          <slot name="annot" />
        </div>
        <p v-if="$slots.desc" class="admin-section-desc"><slot name="desc" /></p>
      </div>
    </template>
    <div v-if="$slots.tools" class="admin-section-head__end">
      <div class="admin-section-tools">
        <slot name="tools" />
      </div>
    </div>
    <div v-if="toolbarOnly && $slots.annot" class="admin-section-head__tip">
      <slot name="annot" />
    </div>
  </header>
</template>
