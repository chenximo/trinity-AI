import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { MARKETING_NAV_ITEMS } from "./marketingHeaderMock";

export function useMarketingSiteHeader() {
  const route = useRoute();
  const headerRef = ref<HTMLElement | null>(null);
  const activeNavId = ref(MARKETING_NAV_ITEMS[0]?.id ?? "soa");

  function onScroll() {
    const header = headerRef.value;
    if (header) {
      header.style.boxShadow =
        window.scrollY > 8 ? "0 4px 24px rgba(15,23,42,0.06)" : "none";
    }
  }

  function setActiveNav(id: string) {
    activeNavId.value = id;
  }

  onMounted(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const hash = route.hash.replace(/^#/, "");
    if (hash) {
      const match = MARKETING_NAV_ITEMS.find((n) => n.id === hash);
      if (match) activeNavId.value = match.id;
    }
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
  });

  return {
    headerRef,
    activeNavId,
    setActiveNav,
  };
}

/** 营销页 dashboard 预览 Tab（原型 home.js） */
export function useMarketingDashboardTabs(initial = "全部") {
  const activeTab = ref(initial);

  function setTab(tab: string) {
    activeTab.value = tab;
  }

  function isTabOn(tab: string) {
    return activeTab.value === tab;
  }

  return { activeTab, setTab, isTabOn };
}
