import { computed, onMounted, ref } from "vue";
import type { MarketFilter, Period } from "./mock";
import { platforms as allPlatforms } from "./mock";

const SOA_TIP_KEY = "geo_soa_tip_seen";
const ONBOARD_KEY = "geo_dash_onboard_done";

export function useDashboardInteractions() {
  const market = ref<MarketFilter>("all");
  const period = ref<Period>("week");
  const showSoaTip = ref(false);
  const showOnboard = ref(false);

  const filteredPlatforms = computed(() => {
    if (market.value === "all") return allPlatforms;
    return allPlatforms.filter((p) => p.market === market.value);
  });

  function setMarket(next: MarketFilter) {
    market.value = next;
  }

  function setPeriod(next: Period) {
    period.value = next;
  }

  function dismissSoaTip() {
    showSoaTip.value = false;
    try {
      localStorage.setItem(SOA_TIP_KEY, "1");
    } catch {
      /* private mode */
    }
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
      showSoaTip.value = localStorage.getItem(SOA_TIP_KEY) !== "1";
      showOnboard.value = localStorage.getItem(ONBOARD_KEY) !== "1";
    } catch {
      showSoaTip.value = true;
      showOnboard.value = true;
    }
  });

  return {
    market,
    period,
    showSoaTip,
    showOnboard,
    filteredPlatforms,
    setMarket,
    setPeriod,
    dismissSoaTip,
    dismissOnboard,
  };
}
