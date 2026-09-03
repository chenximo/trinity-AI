import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  REP_ROWS,
  REP_SPOTLIGHT,
  REP_TOTAL_COUNT,
  filterRepRows,
  spotlightMatches,
  type ReportTypeFilter,
} from "./mock";

function scrollToHash(hash: string, highlightRef: { value: string | null }) {
  if (!hash) return;
  const targetId = hash.replace(/^#/, "");
  highlightRef.value = targetId;
  requestAnimationFrame(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  window.setTimeout(() => {
    if (highlightRef.value === targetId) highlightRef.value = null;
  }, 2400);
}

export function useReportsInteractions() {
  const route = useRoute();

  const search = ref("");
  const typeFilter = ref<ReportTypeFilter>("all");
  const highlightId = ref<string | null>(null);

  const filteredRows = computed(() =>
    filterRepRows(REP_ROWS, typeFilter.value, search.value),
  );

  const spotlightVisible = computed(() =>
    spotlightMatches(REP_SPOTLIGHT, typeFilter.value, search.value),
  );

  const isFiltered = computed(
    () => typeFilter.value !== "all" || search.value.trim().length > 0,
  );

  const listMeta = computed(() =>
    isFiltered.value
      ? `${filteredRows.value.length} 份匹配`
      : `${REP_TOTAL_COUNT} 份`,
  );

  const resultCountLabel = computed(() => `显示 ${filteredRows.value.length} 条`);

  const isEmpty = computed(() => filteredRows.value.length === 0);

  function setTypeFilter(next: ReportTypeFilter) {
    typeFilter.value = next;
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
    filteredRows,
    spotlightVisible,
    listMeta,
    resultCountLabel,
    isEmpty,
    setTypeFilter,
    isHighlighted,
  };
}
