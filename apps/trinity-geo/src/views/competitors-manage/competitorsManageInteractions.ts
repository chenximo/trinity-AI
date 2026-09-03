import { computed, ref } from "vue";
import {
  AI_COMP_SUGGESTIONS,
  INITIAL_COMPETITORS,
  QUOTA_MAX,
  aliasPreview,
  buildSearchText,
  countByMarket,
  slugify,
  totalAliases,
  type AiCompSuggestion,
  type CompMarket,
  type CompetitorRow,
  type MarketFilter,
  type StatusFilter,
} from "./mock";

export type RecalcStatus = "无" | "保存后排队" | "队列中 · 约 5 分钟";

export function useCompetitorsManageInteractions() {
  const competitors = ref<CompetitorRow[]>(
    INITIAL_COMPETITORS.map((c) => ({ ...c, aliases: [...c.aliases] })),
  );
  const aiSuggestions = ref<AiCompSuggestion[]>(AI_COMP_SUGGESTIONS.map((s) => ({ ...s })));

  const search = ref("");
  const marketFilter = ref<MarketFilter>("all");
  const statusFilter = ref<StatusFilter>("all");

  const manualAddCollapsed = ref(false);
  const showAiPanel = ref(false);

  const addName = ref("");
  const addMarket = ref<CompMarket>("overseas");
  const addAlias = ref("");

  const aliasInputs = ref<Record<string, string>>({});
  const recalcStatus = ref<RecalcStatus>("无");
  const recalcBtnDisabled = ref(true);

  let nextCompNum = 7;

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

  const activeCount = computed(
    () => competitors.value.filter((c) => c.status === "active").length,
  );
  const pausedCount = computed(
    () => competitors.value.filter((c) => c.status === "paused").length,
  );
  const aliasTotal = computed(() => totalAliases(competitors.value));
  const marketCounts = computed(() => countByMarket(competitors.value));
  const quotaPercent = computed(() =>
    Math.min(100, Math.round((activeCount.value / QUOTA_MAX) * 100)),
  );

  const listMeta = computed(
    () =>
      `${activeCount.value} 家监测中` +
      (pausedCount.value ? ` · ${pausedCount.value} 家已暂停` : ""),
  );

  const filteredCompetitors = computed(() => {
    const q = search.value.trim().toLowerCase();
    return competitors.value.filter((row) => {
      const matchMarket = marketFilter.value === "all" || row.market === marketFilter.value;
      const matchStatus =
        statusFilter.value === "all" || row.status === statusFilter.value;
      const matchQuery =
        !q ||
        row.search.includes(q) ||
        row.id.includes(q) ||
        row.name.toLowerCase().includes(q);
      return matchMarket && matchStatus && matchQuery;
    });
  });

  const resultCountLabel = computed(() => `显示 ${filteredCompetitors.value.length} 家`);
  const isEmpty = computed(() => filteredCompetitors.value.length === 0);

  function setMarketFilter(next: MarketFilter) {
    marketFilter.value = next;
  }

  function setStatusFilter(next: StatusFilter) {
    statusFilter.value = next;
  }

  function toggleManualAdd() {
    manualAddCollapsed.value = !manualAddCollapsed.value;
  }

  function toggleAiPanel() {
    showAiPanel.value = !showAiPanel.value;
    if (showAiPanel.value) manualAddCollapsed.value = false;
  }

  function closeAiPanel() {
    showAiPanel.value = false;
  }

  function toggleExpand(row: CompetitorRow) {
    row.expanded = !row.expanded;
  }

  function togglePause(row: CompetitorRow) {
    const paused = row.status !== "paused";
    row.status = paused ? "paused" : "active";
    markDirty();
    showToast(paused ? "已暂停该竞品对比" : "已恢复竞品监测");
  }

  function removeCompetitor(row: CompetitorRow) {
    if (!window.confirm("确定删除该竞品？")) return;
    competitors.value = competitors.value.filter((c) => c.id !== row.id);
    markDirty();
    showToast("已删除竞品");
  }

  function aliasExists(row: CompetitorRow, alias: string): boolean {
    const lower = alias.trim().toLowerCase();
    return row.aliases.some((a) => a.toLowerCase() === lower);
  }

  function addAliasToRow(row: CompetitorRow) {
    const draft = (aliasInputs.value[row.id] ?? "").trim();
    if (!draft) return;
    if (aliasExists(row, draft)) {
      showToast("别名已存在");
      return;
    }
    row.aliases.push(draft);
    row.search = buildSearchText(row.name, row.market, row.aliases);
    aliasInputs.value[row.id] = "";
    markDirty();
  }

  function removeAliasFromRow(row: CompetitorRow, alias: string) {
    if (alias === row.aliases[0]) return;
    row.aliases = row.aliases.filter((a) => a !== alias);
    row.search = buildSearchText(row.name, row.market, row.aliases);
    markDirty();
  }

  function createCompetitor(name: string, market: CompMarket, aliasText: string, silent = false) {
    const trimmed = name.trim();
    if (!trimmed) return false;

    let aliases = aliasText.trim() ? [trimmed, aliasText.trim()] : [trimmed];
    if (aliasText.trim() && aliasText.trim().toLowerCase() === trimmed.toLowerCase()) {
      aliases = [trimmed];
    }

    let id = slugify(trimmed, nextCompNum);
    if (competitors.value.some((c) => c.id === id)) {
      id = `${id}-${nextCompNum}`;
    }
    nextCompNum += 1;

    const row: CompetitorRow = {
      id,
      name: trimmed,
      market,
      status: "active",
      soa7d: null,
      aliases,
      expanded: true,
      search: buildSearchText(trimmed, market, aliases),
    };
    competitors.value = [row, ...competitors.value];
    if (!silent) markDirty();
    return true;
  }

  function submitManualAdd() {
    if (!addName.value.trim()) {
      showToast("请填写竞品主名称");
      return;
    }
    if (createCompetitor(addName.value, addMarket.value, addAlias.value)) {
      addName.value = "";
      addAlias.value = "";
      showToast("已添加竞品（记得保存）");
    }
  }

  function applyAiSuggestions() {
    const picked = aiSuggestions.value.filter((s) => s.checked);
    if (!picked.length) {
      showToast("请先勾选");
      return;
    }
    for (const item of picked) {
      createCompetitor(item.name, item.market, item.alias === item.name ? "" : item.alias, true);
      item.checked = false;
    }
    showAiPanel.value = false;
    markDirty();
    showToast(`已加入 ${picked.length} 个竞品`);
  }

  function saveCompetitors() {
    recalcStatus.value = "队列中 · 约 5 分钟";
    showToast("竞品库已保存，标注重算已排队");
  }

  function triggerRecalc() {
    if (recalcBtnDisabled.value) return;
    showToast("已触发竞品提及重算");
  }

  function previewFor(row: CompetitorRow): string {
    return aliasPreview(row.aliases);
  }

  return {
    competitors,
    aiSuggestions,
    search,
    marketFilter,
    statusFilter,
    manualAddCollapsed,
    showAiPanel,
    addName,
    addMarket,
    addAlias,
    aliasInputs,
    recalcStatus,
    recalcBtnDisabled,
    toast,
    toastVisible,
    activeCount,
    pausedCount,
    aliasTotal,
    marketCounts,
    quotaPercent,
    listMeta,
    filteredCompetitors,
    resultCountLabel,
    isEmpty,
    setMarketFilter,
    setStatusFilter,
    toggleManualAdd,
    toggleAiPanel,
    closeAiPanel,
    toggleExpand,
    togglePause,
    removeCompetitor,
    addAliasToRow,
    removeAliasFromRow,
    submitManualAdd,
    applyAiSuggestions,
    saveCompetitors,
    triggerRecalc,
    previewFor,
  };
}
