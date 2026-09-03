import { ref } from "vue";
import { MARKET_FILTERS, type MarketFilter } from "./mock";

/** 市场筛选 · 原型态 UI（不驱动数据过滤） */
export function useCompetitorsInteractions() {
  const marketFilter = ref<MarketFilter>("all");

  function setMarketFilter(next: MarketFilter) {
    marketFilter.value = next;
  }

  return {
    marketFilter,
    setMarketFilter,
    marketFilters: MARKET_FILTERS,
  };
}
