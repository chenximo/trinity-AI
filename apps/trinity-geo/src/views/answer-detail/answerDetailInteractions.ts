import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getAnswerDetail } from "./mock";

function scrollToHash(hash: string) {
  if (!hash) return;
  const id = hash.replace(/^#/, "");
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function useAnswerDetailInteractions() {
  const route = useRoute();

  const answerId = computed(() => {
    const raw = route.query.id;
    const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
    return id || "Q00-doubao";
  });

  const detail = computed(() => getAnswerDetail(answerId.value));

  const keywordDetailTo = computed(() => ({
    name: "geo-keyword-detail",
    query: { q: detail.value.questionId },
  }));

  onMounted(() => {
    if (route.hash) scrollToHash(route.hash);
  });

  watch(
    () => route.hash,
    (hash) => {
      if (hash) scrollToHash(hash);
    },
  );

  return {
    answerId,
    detail,
    keywordDetailTo,
  };
}
