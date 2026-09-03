import { onMounted } from "vue";

/** 营销首页轻交互（对齐 prototype marketing/js/home.js） */
export function useMarketingHomeEffects() {
  onMounted(() => {
    const tabs = document.querySelectorAll(".geo-dashboard-tabs span");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("on"));
        tab.classList.add("on");
      });
    });
  });
}
