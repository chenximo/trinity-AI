import { computed } from "vue";
import { useRoute } from "vue-router";
import { DEFAULT_COMPETITOR_ID, getCompetitorDetail } from "./mock";

export function useCompetitorDetailInteractions() {
  const route = useRoute();

  const competitorId = computed(() => {
    const raw = route.query.id;
    const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
    return id || DEFAULT_COMPETITOR_ID;
  });

  const detail = computed(() => getCompetitorDetail(competitorId.value));

  return {
    competitorId,
    detail,
  };
}
