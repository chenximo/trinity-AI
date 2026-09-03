import { computed, ref } from "vue";
import {
  INITIAL_ALIASES,
  nextAliasId,
  countEnabled,
  type BrandAlias,
  type RecalcStatus,
} from "./mock";

export function useBrandSettingsInteractions() {
  const aliases = ref<BrandAlias[]>(INITIAL_ALIASES.map((a) => ({ ...a })));
  const aliasInput = ref("");
  const search = ref("");
  const recalcStatus = ref<RecalcStatus>("无");
  const recalcBtnDisabled = ref(true);

  const toast = ref("");
  const toastVisible = ref(false);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  function showToast(msg: string) {
    toast.value = msg;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, 2800);
  }

  function markDirty() {
    recalcStatus.value = "保存后排队";
    recalcBtnDisabled.value = false;
  }

  const enabledCount = computed(() => countEnabled(aliases.value));
  const totalCount = computed(() => aliases.value.length);

  const filteredAliases = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return aliases.value;
    return aliases.value.filter(
      (row) =>
        row.search.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q),
    );
  });

  const resultCountLabel = computed(() => `显示 ${filteredAliases.value.length} 条`);

  const listMeta = computed(() => {
    const q = search.value.trim();
    if (q) return `${filteredAliases.value.length} 条匹配`;
    return `${totalCount.value} 条`;
  });

  const isEmpty = computed(() => filteredAliases.value.length === 0);

  function aliasExists(name: string): boolean {
    const lower = name.trim().toLowerCase();
    return aliases.value.some((a) => a.name.toLowerCase() === lower);
  }

  function addAlias(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (aliasExists(trimmed)) {
      showToast("该别名已存在");
      return;
    }
    aliases.value.push({
      id: nextAliasId(aliases.value),
      name: trimmed,
      type: "品牌",
      enabled: true,
      search: `${trimmed.toLowerCase()} 品牌`,
    });
    markDirty();
    showToast("已添加别名（记得保存）");
  }

  function submitAliasAdd() {
    addAlias(aliasInput.value);
    aliasInput.value = "";
  }

  function onAliasKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      submitAliasAdd();
    }
  }

  function removeAlias(row: BrandAlias) {
    if (row.locked) return;
    aliases.value = aliases.value.filter((a) => a.id !== row.id);
    markDirty();
  }

  function setAliasEnabled(row: BrandAlias, enabled: boolean) {
    if (row.locked) return;
    row.enabled = enabled;
    markDirty();
  }

  function applySuggest(name: string) {
    addAlias(name);
  }

  function saveBrand() {
    recalcStatus.value = "队列中";
    showToast("品牌设置已保存，历史标注重算已排队");
  }

  function triggerRecalc() {
    if (recalcBtnDisabled.value) return;
    showToast("已触发近 30 天历史重算");
    recalcStatus.value = "重算中…";
  }

  return {
    aliases,
    aliasInput,
    search,
    recalcStatus,
    recalcBtnDisabled,
    toast,
    toastVisible,
    enabledCount,
    totalCount,
    filteredAliases,
    resultCountLabel,
    listMeta,
    isEmpty,
    submitAliasAdd,
    onAliasKeydown,
    removeAlias,
    setAliasEnabled,
    applySuggest,
    saveBrand,
    triggerRecalc,
  };
}
