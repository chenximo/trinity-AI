import { computed, reactive, ref, watch, type ComputedRef } from "vue";

export const ADMIN_TABLE_PAGE_SIZES = [10, 20, 50, 100] as const;
export const ADMIN_TABLE_DEFAULT_PAGE_SIZE = 10;

/** 模板 / 脚本中访问时已解包（勿把 `paginatedRows` 当 Ref 传给 `el-table`） */
export type AdminTablePaginationState<T> = {
  currentPage: number;
  pageSize: number;
  total: number;
  paginatedRows: T[];
  resetPage: () => void;
};

export function paginateAdminRows<T>(rows: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return rows;
  const start = (Math.max(1, page) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/**
 * 前端 mock 列表分页：数据源为已筛选的 computed；筛选变化时回到第 1 页。
 */
export function useAdminTablePagination<T>(
  source: ComputedRef<T[]>,
  options?: { pageSize?: number },
): AdminTablePaginationState<T> {
  const currentPage = ref(1);
  const pageSize = ref(options?.pageSize ?? ADMIN_TABLE_DEFAULT_PAGE_SIZE);

  const total = computed(() => source.value.length);

  const paginatedRows = computed(() =>
    paginateAdminRows(source.value, currentPage.value, pageSize.value),
  );

  function resetPage(): void {
    currentPage.value = 1;
  }

  watch(
    source,
    () => {
      currentPage.value = 1;
    },
    { deep: true },
  );

  watch([total, pageSize], () => {
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value) || 1);
    if (currentPage.value > maxPage) currentPage.value = maxPage;
  });

  // reactive：嵌套 ref/computed 在模板 `xxxPg.paginatedRows` 处会自动解包为数组
  return reactive({
    currentPage,
    pageSize,
    total,
    paginatedRows,
    resetPage,
  }) as AdminTablePaginationState<T>;
}
