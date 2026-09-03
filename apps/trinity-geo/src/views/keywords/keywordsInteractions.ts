import { computed, ref } from "vue";
import {
  AI_SUGGESTIONS,
  INITIAL_QUESTIONS,
  QUOTA_MAX,
  countByType,
  nextQuestionId,
  type AiSuggestion,
  type KeywordQuestion,
  type QuestionStatus,
  type QuestionType,
  type StatusFilter,
  type TypeFilter,
} from "./mock";

export function useKeywordsInteractions() {
  const questions = ref<KeywordQuestion[]>(INITIAL_QUESTIONS.map((q) => ({ ...q, signals: [...q.signals] })));
  const aiSuggestions = ref<AiSuggestion[]>(AI_SUGGESTIONS.map((s) => ({ ...s })));

  const search = ref("");
  const typeFilter = ref<TypeFilter>("all");
  const statusFilter = ref<StatusFilter>("all");

  const manualAddCollapsed = ref(false);
  const showAiPanel = ref(false);

  const addType = ref<QuestionType>("品类词");
  const addText = ref("");

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

  const activeCount = computed(() => questions.value.filter((q) => q.status === "active").length);
  const pausedCount = computed(() => questions.value.filter((q) => q.status === "paused").length);
  const typeCounts = computed(() => countByType(questions.value));
  const quotaPercent = computed(() => Math.min(100, Math.round((activeCount.value / QUOTA_MAX) * 100)));

  const listMeta = computed(
    () => `${activeCount.value} 条监测中 · ${pausedCount.value} 条已暂停`,
  );
  const pausedNote = computed(() => `${pausedCount.value} 条已暂停，不计入 SOA 分母`);

  const filteredQuestions = computed(() => {
    const q = search.value.trim().toLowerCase();
    return questions.value.filter((row) => {
      const typeOk = typeFilter.value === "all" || row.type === typeFilter.value;
      const statusOk =
        statusFilter.value === "all" ||
        (statusFilter.value === "active" && row.status === "active") ||
        (statusFilter.value === "paused" && row.status === "paused");
      const searchOk =
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.text.toLowerCase().includes(q);
      return typeOk && statusOk && searchOk;
    });
  });

  const resultCountLabel = computed(() => `显示 ${filteredQuestions.value.length} 条`);

  function setTypeFilter(next: TypeFilter) {
    typeFilter.value = next;
  }

  function setStatusFilter(next: StatusFilter) {
    statusFilter.value = next;
  }

  function toggleManualAdd() {
    manualAddCollapsed.value = !manualAddCollapsed.value;
    if (!manualAddCollapsed.value && addText.value === "") {
      /* focus handled in template via ref if needed */
    }
  }

  function toggleAiPanel() {
    showAiPanel.value = !showAiPanel.value;
  }

  function closeAiPanel() {
    showAiPanel.value = false;
  }

  function fillTemplate(type: QuestionType, text: string) {
    addType.value = type;
    addText.value = text;
    manualAddCollapsed.value = false;
    showToast("已填入上方表单，可修改后添加");
  }

  function addQuestion(type: QuestionType, text: string, silent = false) {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const id = nextQuestionId(questions.value);
    const row: KeywordQuestion = {
      id,
      type,
      status: "active",
      text: trimmed,
      soa7d: null,
      signals: [{ label: "—", tone: "muted" }],
      detail: { name: "geo-keyword-detail", query: { q: id } },
    };
    questions.value = [row, ...questions.value];
    if (!silent) showToast("已添加，明日采集周期生效");
    return true;
  }

  function submitManualAdd() {
    if (!addText.value.trim()) {
      showToast("请填写问法");
      manualAddCollapsed.value = false;
      return;
    }
    if (addQuestion(addType.value, addText.value)) {
      addText.value = "";
    }
  }

  function applyAiSuggestions() {
    const picked = aiSuggestions.value.filter((s) => s.checked);
    if (!picked.length) {
      showToast("请先勾选建议问法");
      return;
    }
    for (const item of picked) {
      addQuestion(item.type, item.text, true);
    }
    showAiPanel.value = false;
    showToast(`已加入 ${picked.length} 条问题`);
  }

  function togglePause(row: KeywordQuestion) {
    const paused = row.status !== "paused";
    row.status = paused ? "paused" : "active";
    if (paused) {
      row.soa7d = null;
      row.soaTone = undefined;
      row.signals = [{ label: "—", tone: "muted" }];
    } else {
      row.soa7d = null;
      row.signals = [{ label: "—", tone: "muted" }];
    }
    showToast(paused ? "已暂停监测，不再计入 SOA 分母" : "已恢复监测");
  }

  function removeQuestion(row: KeywordQuestion) {
    if (!window.confirm("确定删除该监测问题？")) return;
    questions.value = questions.value.filter((q) => q.id !== row.id);
    showToast("已删除");
  }

  function onAddKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitManualAdd();
    }
  }

  return {
    questions,
    aiSuggestions,
    search,
    typeFilter,
    statusFilter,
    manualAddCollapsed,
    showAiPanel,
    addType,
    addText,
    toast,
    toastVisible,
    activeCount,
    pausedCount,
    typeCounts,
    quotaPercent,
    listMeta,
    pausedNote,
    filteredQuestions,
    resultCountLabel,
    setTypeFilter,
    setStatusFilter,
    toggleManualAdd,
    toggleAiPanel,
    closeAiPanel,
    fillTemplate,
    submitManualAdd,
    applyAiSuggestions,
    togglePause,
    removeQuestion,
    onAddKeydown,
  };
}
