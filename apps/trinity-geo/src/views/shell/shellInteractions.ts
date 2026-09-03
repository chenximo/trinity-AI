import { onMounted, onUnmounted } from "vue";

/** 控制台样式真源写在 `body.geo-console` */
export function useGeoConsoleBodyClass() {
  onMounted(() => {
    document.body.classList.add("geo-console");
  });
  onUnmounted(() => {
    document.body.classList.remove("geo-console");
  });
}
