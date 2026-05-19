<script setup lang="ts">
import { ADMIN_TABLE_PAGE_SIZES } from "../utils/adminTablePagination";

const currentPage = defineModel<number>("currentPage", { default: 1 });
const pageSize = defineModel<number>("pageSize", { default: 10 });

withDefaults(
  defineProps<{
    total?: number;
  }>(),
  {
    total: 0,
  },
);
</script>

<template>
  <div
    v-show="total > 0"
    class="admin-table-pagination"
    role="navigation"
    aria-label="表格分页"
  >
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[...ADMIN_TABLE_PAGE_SIZES]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      small
    />
  </div>
</template>
