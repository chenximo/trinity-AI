import { computed, ref } from "vue";
import {
  AUDIT_PAGES,
  AUDIT_ROWS,
  lampToFilter,
  type AuditLampFilter,
  type AuditPageDetail,
} from "./mock";

export function useAuditInteractions() {
  const selectedId = ref("audit-doc-intro");
  const lampFilter = ref<AuditLampFilter>("all");
  const search = ref("");
  const scanUrl = ref("https://doc.trinitydesk.ai/docs/introduction");

  const toast = ref("");
  const toastVisible = ref(false);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  function showToast(msg: string) {
    toast.value = msg;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, 2200);
  }

  const selectedDetail = computed<AuditPageDetail | undefined>(
    () => AUDIT_PAGES[selectedId.value],
  );

  const filteredRows = computed(() => {
    const q = search.value.trim().toLowerCase();
    return AUDIT_ROWS.filter((row) => {
      const lampKey = lampToFilter(row.lamp);
      const matchLamp = lampFilter.value === "all" || lampFilter.value === lampKey;
      const matchQuery = !q || row.search.toLowerCase().includes(q);
      return matchLamp && matchQuery;
    });
  });

  const resultCountLabel = computed(() => `显示 ${filteredRows.value.length} 条`);

  const listMeta = computed(() => {
    const filtered = lampFilter.value !== "all" || search.value.trim();
    if (filtered) return `${filteredRows.value.length} 页匹配`;
    return `${AUDIT_ROWS.length} 页`;
  });

  const isEmpty = computed(() => filteredRows.value.length === 0);

  function selectRow(id: string) {
    selectedId.value = id;
  }

  function setLampFilter(next: AuditLampFilter) {
    lampFilter.value = next;
  }

  function submitScan(e: Event) {
    e.preventDefault();
    showToast(`审计已排队（Mock）· ${scanUrl.value}`);
  }

  return {
    selectedId,
    lampFilter,
    search,
    scanUrl,
    toast,
    toastVisible,
    selectedDetail,
    filteredRows,
    resultCountLabel,
    listMeta,
    isEmpty,
    selectRow,
    setLampFilter,
    submitScan,
  };
}
