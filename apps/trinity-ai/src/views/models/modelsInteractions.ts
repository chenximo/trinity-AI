import { onUnmounted, watch, type Ref } from "vue";

const BODY_CLASS = "tai-models-filters-open";

/** 窄屏筛选抽屉打开时同步 `body` 类名，供全局 overflow / 布局使用。 */
export function useModelsFiltersBodyClass(open: Ref<boolean>): void {
  watch(
    open,
    (isOpen) => {
      document.body.classList.toggle(BODY_CLASS, isOpen);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    document.body.classList.remove(BODY_CLASS);
  });
}
