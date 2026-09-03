import { computed, onMounted, ref } from "vue";
import type { MarketFilter, Period } from "./mock";
import { periodLabels, platforms as allPlatforms } from "./mock";

const ONBOARD_KEY = "geo_dash_onboard_done";

export function useDashboardInteractions() {
  const market = ref<MarketFilter>("all");
  const period = ref<Period>("week");
  const showOnboard = ref(false);

  const filteredPlatforms = computed(() => {
    if (market.value === "all") return allPlatforms;
    return allPlatforms.filter((p) => p.market === market.value);
  });

  const overseasPlatforms = computed(() => filteredPlatforms.value.filter((p) => p.market === "overseas"));
  const domesticPlatforms = computed(() => filteredPlatforms.value.filter((p) => p.market === "domestic"));

  const showOverseas = computed(() => market.value === "all" || market.value === "overseas");
  const showDomestic = computed(() => market.value === "all" || market.value === "domestic");

  const periodLabel = computed(() => periodLabels[period.value]);

  function setMarket(next: MarketFilter) {
    market.value = next;
  }

  function setPeriod(next: Period) {
    period.value = next;
  }

  function kpiCardClass(tone: string) {
    if (market.value === "all") return {};
    const m = tone === "overseas" ? "overseas" : tone === "domestic" ? "domestic" : "all";
    if (m === "all") {
      return { "is-dim": false, "is-highlight": false };
    }
    return {
      "is-dim": m !== market.value,
      "is-highlight": m === market.value,
    };
  }

  function dismissOnboard() {
    showOnboard.value = false;
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
    } catch {
      /* private mode */
    }
  }

  onMounted(() => {
    try {
      showOnboard.value = localStorage.getItem(ONBOARD_KEY) !== "1";
    } catch {
      showOnboard.value = true;
    }
  });

  return {
    market,
    period,
    showOnboard,
    filteredPlatforms,
    overseasPlatforms,
    domesticPlatforms,
    showOverseas,
    showDomestic,
    periodLabel,
    setMarket,
    setPeriod,
    kpiCardClass,
    dismissOnboard,
  };
}

function freshClass(fresh: string) {
  if (fresh === "today") return "today";
  if (fresh === "stale") return "stale";
  return "old";
}

export { freshClass };
