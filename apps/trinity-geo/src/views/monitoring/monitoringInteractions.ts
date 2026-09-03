import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  MARKET_FILTER_LABELS,
  MARKET_FILTERS,
  MON_PLATFORM_CARDS,
  type MarketFilter,
  type MonTab,
} from "./mock";

export function useMonitoringInteractions() {
  const route = useRoute();
  const router = useRouter();

  const activeTab = ref<MonTab>("overview");
  const marketFilter = ref<MarketFilter>("all");
  const toast = ref("");
  const toastVisible = ref(false);

  const visiblePlatformCards = computed(() =>
    MON_PLATFORM_CARDS.filter(
      (card) => marketFilter.value === "all" || card.market === marketFilter.value,
    ),
  );

  function syncTabFromRoute() {
    const tab = route.query.tab;
    activeTab.value = tab === "logs" ? "logs" : "overview";
  }

  function setTab(tab: MonTab) {
    activeTab.value = tab;
    const query = tab === "logs" ? { tab: "logs" } : {};
    router.replace({ name: "geo-monitoring", query });
  }

  function setMarketFilter(next: MarketFilter) {
    marketFilter.value = next;
  }

  function refreshStatus() {
    toast.value = "采集状态已刷新（Mock）";
    toastVisible.value = true;
    window.setTimeout(() => {
      toastVisible.value = false;
    }, 2200);
  }

  onMounted(syncTabFromRoute);
  watch(() => route.query.tab, syncTabFromRoute);

  return {
    activeTab,
    marketFilter,
    toast,
    toastVisible,
    visiblePlatformCards,
    setTab,
    setMarketFilter,
    refreshStatus,
    marketFilters: MARKET_FILTERS,
    marketFilterLabels: MARKET_FILTER_LABELS,
  };
}
