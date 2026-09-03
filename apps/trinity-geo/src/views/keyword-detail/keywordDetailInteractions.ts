import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { getKeywordDetail, type DetailPeriod } from "./mock";

export function useKeywordDetailInteractions() {
  const route = useRoute();
  const period = ref<DetailPeriod>("week");

  const questionId = computed(() => {
    const q = route.query.q;
    const raw = typeof q === "string" ? q : Array.isArray(q) ? q[0] : "";
    return raw?.toUpperCase() || "Q00";
  });

  const detail = computed(() => getKeywordDetail(questionId.value));

  function setPeriod(next: DetailPeriod) {
    period.value = next;
  }

  function navTo(id: string) {
    return { name: "geo-keyword-detail", query: { q: id } };
  }

  return {
    period,
    questionId,
    detail,
    setPeriod,
    navTo,
  };
}
