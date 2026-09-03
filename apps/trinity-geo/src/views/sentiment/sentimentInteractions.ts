import { computed, ref } from "vue";
import {
  PERIOD_FILTERS,
  PLATFORM_FILTERS,
  filterBadgeLabel,
  type PeriodFilter,
  type PlatformFilter,
} from "./mock";

export function useSentimentInteractions() {
  const platformFilter = ref<PlatformFilter>("全部平台");
  const periodFilter = ref<PeriodFilter>("近 7 日");

  const filterBadge = computed(() =>
    filterBadgeLabel(platformFilter.value, periodFilter.value),
  );

  function setPlatformFilter(next: PlatformFilter) {
    platformFilter.value = next;
  }

  function setPeriodFilter(next: PeriodFilter) {
    periodFilter.value = next;
  }

  return {
    platformFilter,
    periodFilter,
    filterBadge,
    setPlatformFilter,
    setPeriodFilter,
    platformFilters: PLATFORM_FILTERS,
    periodFilters: PERIOD_FILTERS,
  };
}
