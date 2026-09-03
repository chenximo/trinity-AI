import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  VERIFY_CASES,
  VERIFY_INDEX_ROWS,
  VERIFY_ITEM_COUNT,
  VERIFY_SPOTLIGHT,
  filterVerifyCases,
  filterVerifyIndexRows,
  resolveVerifyHashTargetId,
  spotlightMatches,
  type VerifyTypeFilter,
} from "./mock";

function scrollToHash(hash: string, highlightRef: { value: string | null }) {
  if (!hash) return;
  const directId = hash.replace(/^#/, "");
  let targetId = directId;
  if (!document.getElementById(directId)) {
    const resolved = resolveVerifyHashTargetId(hash);
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

export function useVerifyInteractions() {
  const route = useRoute();

  const search = ref("");
  const typeFilter = ref<VerifyTypeFilter>("all");
  const highlightId = ref<string | null>(null);

  const filteredIndexRows = computed(() =>
    filterVerifyIndexRows(VERIFY_INDEX_ROWS, typeFilter.value, search.value),
  );

  const filteredCases = computed(() =>
    filterVerifyCases(VERIFY_CASES, typeFilter.value, search.value),
  );

  const spotlightVisible = computed(() =>
    spotlightMatches(VERIFY_SPOTLIGHT, typeFilter.value, search.value),
  );

  const isSingleCol = computed(() => filteredCases.value.length <= 1);

  const isFiltered = computed(
    () => typeFilter.value !== "all" || search.value.trim().length > 0,
  );

  const listMeta = computed(() =>
    isFiltered.value
      ? `${filteredIndexRows.value.length} 项匹配`
      : `${VERIFY_ITEM_COUNT} 项`,
  );

  const resultCountLabel = computed(() => `显示 ${filteredIndexRows.value.length} 项`);

  const isEmpty = computed(() => filteredIndexRows.value.length === 0);

  function setTypeFilter(next: VerifyTypeFilter) {
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
    filteredIndexRows,
    filteredCases,
    spotlightVisible,
    isSingleCol,
    listMeta,
    resultCountLabel,
    isEmpty,
    setTypeFilter,
    isHighlighted,
  };
}
