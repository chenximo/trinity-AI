import { onMounted, onUnmounted } from "vue";

/** 营销/落地页样式作用域（home.css 中 body.geo-site） */
export function useGeoSiteBodyClass() {
  onMounted(() => {
    document.body.classList.add("geo-site");
  });
  onUnmounted(() => {
    document.body.classList.remove("geo-site");
  });
}
