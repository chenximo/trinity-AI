import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  DIAGNOSIS_ROWS,
  OPEN_DIAG_COUNT,
  filterDiagnosisRows,
  type DiagPriorityFilter,
  type DiagTypeFilter,
} from "./mock";

function scrollToHash(hash: string, highlightRef: { value: string | null }) {
  if (!hash) return;
  const id = hash.replace(/^#/, "");
  highlightRef.value = id;
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  window.setTimeout(() => {
    if (highlightRef.value === id) highlightRef.value = null;
  }, 2400);
}

export function useDiagnosisInteractions() {
  const route = useRoute();

  const search = ref("");
  const typeFilter = ref<DiagTypeFilter>("all");
  const priorityFilter = ref<DiagPriorityFilter>("all");
  const highlightId = ref<string | null>(null);

  const filteredRows = computed(() =>
    filterDiagnosisRows(DIAGNOSIS_ROWS, typeFilter.value, priorityFilter.value, search.value),
  );

  const isFiltered = computed(
    () =>
      typeFilter.value !== "all" ||
      priorityFilter.value !== "all" ||
      search.value.trim().length > 0,
  );

  const listMeta = computed(() =>
    isFiltered.value
      ? `${filteredRows.value.length} 条匹配`
      : `${OPEN_DIAG_COUNT} 条开放`,
  );

  const resultCountLabel = computed(() => `显示 ${filteredRows.value.length} 条`);

  const isEmpty = computed(() => filteredRows.value.length === 0);

  function setTypeFilter(next: DiagTypeFilter) {
    typeFilter.value = next;
  }

  function setPriorityFilter(next: DiagPriorityFilter) {
    priorityFilter.value = next;
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
    typeFilter,
    priorityFilter,
    filteredRows,
    listMeta,
    resultCountLabel,
    isEmpty,
    highlightId,
    setTypeFilter,
    setPriorityFilter,
    isHighlighted,
  };
}
