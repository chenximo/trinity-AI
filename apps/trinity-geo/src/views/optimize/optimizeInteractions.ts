import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  OPTIMIZE_ROWS,
  OPT_ITEM_COUNT,
  filterOptimizeRows,
  resolveHashTargetId,
  type OptStatusFilter,
} from "./mock";

function scrollToHash(hash: string, highlightRef: { value: string | null }) {
  if (!hash) return;
  const directId = hash.replace(/^#/, "");
  let targetId = directId;
  if (!document.getElementById(directId)) {
    const resolved = resolveHashTargetId(hash);
    if (resolved) targetId = resolved;
  }
  highlightRef.value = targetId;
  requestAnimationFrame(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  window.setTimeout(() => {
    if (highlightRef.value === targetId) highlightRef.value = null;
  }, 2400);
}

export function useOptimizeInteractions() {
  const route = useRoute();

  const search = ref("");
  const statusFilter = ref<OptStatusFilter>("all");
  const highlightId = ref<string | null>(null);

  const filteredRows = computed(() =>
    filterOptimizeRows(OPTIMIZE_ROWS, statusFilter.value, search.value),
  );

  const isFiltered = computed(
    () => statusFilter.value !== "all" || search.value.trim().length > 0,
  );

  const listMeta = computed(() =>
    isFiltered.value ? `${filteredRows.value.length} 项匹配` : `${OPT_ITEM_COUNT} 项`,
  );

  const resultCountLabel = computed(() => `显示 ${filteredRows.value.length} 条`);

  const isEmpty = computed(() => filteredRows.value.length === 0);

  function setStatusFilter(next: OptStatusFilter) {
    statusFilter.value = next;
  }

  function isHighlighted(id?: string) {
    return !!id && highlightId.value === id;
  }

  onMounted(() => {
    if (route.hash) scrollToHash(route.hash, highlightId);
  });

  watch(
    () => route.hash,
    (hash) => {
      if (hash) scrollToHash(hash, highlightId);
    },
  );

  return {
    search,
    statusFilter,
    filteredRows,
    listMeta,
    resultCountLabel,
    isEmpty,
    setStatusFilter,
    isHighlighted,
  };
}
