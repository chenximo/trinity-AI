import { computed } from "vue";
import { useRoute } from "vue-router";
import { getOptimizeDetail } from "./mock";

export function useOptimizeDetailInteractions() {
  const route = useRoute();

  const taskId = computed(() => {
    const raw = route.query.id;
    const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
    return id || "opt-s1s2";
  });

  const detail = computed(() => getOptimizeDetail(taskId.value));

  return { taskId, detail };
}
