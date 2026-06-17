import { computed, ref, watch } from "vue";
import { analyzeRecords } from "./analyze";
import { brand, questions, seedR1Records } from "./seed";
import type {
  Action,
  DemoStep,
  Question,
  Record,
} from "./types";

const STORAGE_KEY = "trinity-geo-mvp-demo-v1";

interface Persisted {
  records: Record[];
  actions: Action[];
  activeRound: string;
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch {
    /* empty */
  }
  return {
    records: [...seedR1Records],
    actions: [],
    activeRound: "R1",
  };
}

const state = ref<Persisted>(load());
const activeStep = ref<DemoStep>("dashboard");
const selectedQuestionId = ref<string | null>(null);
const selectedRecordId = ref<string | null>(null);

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
}

watch(state, persist, { deep: true });

const r1Analysis = computed(() =>
  analyzeRecords(state.value.records, brand, "R1", state.value.actions),
);

const r2Analysis = computed(() =>
  analyzeRecords(state.value.records, brand, "R2", state.value.actions),
);

const activeAnalysis = computed(() =>
  state.value.activeRound === "R2" ? r2Analysis.value : r1Analysis.value,
);

function questionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

function addManualRecord(payload: {
  questionId: string;
  answer: string;
  round: string;
}) {
  const q = questionById(payload.questionId);
  if (!q) return;

  state.value.records = state.value.records.filter(
    (r) =>
      !(
        r.question_id === payload.questionId &&
        r.round === payload.round &&
        r.collection_channel === "doubao-app-manual"
      ),
  );

  state.value.records.push({
    question_id: q.id,
    question_type: q.type,
    question_text: q.text,
    platform: "doubao",
    collection_channel: "doubao-app-manual",
    model: "doubao-app",
    round: payload.round,
    collected_at: new Date().toISOString(),
    answer_full: payload.answer.trim(),
    brand_id: brand.brand_id,
    source_note: "演示台人工录入",
  });

  state.value.actions = r1Analysis.value.actions.map((a) => {
    const prev = state.value.actions.find((x) => x.action_id === a.action_id);
    return prev ? { ...a, status: prev.status } : a;
  });
}

function setActionStatus(actionId: string, status: Action["status"]) {
  const idx = state.value.actions.findIndex((a) => a.action_id === actionId);
  const fromAnalysis = activeAnalysis.value.actions.find(
    (a) => a.action_id === actionId,
  );
  if (!fromAnalysis) return;
  const next = { ...fromAnalysis, status };
  if (idx >= 0) state.value.actions[idx] = next;
  else state.value.actions.push(next);
}

function resetDemo() {
  state.value = {
    records: [...seedR1Records],
    actions: [],
    activeRound: "R1",
  };
  activeStep.value = "dashboard";
  localStorage.removeItem(STORAGE_KEY);
}

function pipelineStatus() {
  const r1 = r1Analysis.value;
  const r2 = r2Analysis.value;
  return {
    strategy: questions.length > 0,
    collect: r1.total > 0,
    measure: r1.total > 0,
    diagnose: r1.diagnoses.length > 0,
    optimize: state.value.actions.some((a) => a.status === "已完成"),
    verify: r2.total > 0,
  };
}

export function useGeoStore() {
  return {
    brand,
    questions,
    state,
    activeStep,
    selectedQuestionId,
    selectedRecordId,
    r1Analysis,
    r2Analysis,
    activeAnalysis,
    pipelineStatus,
    questionById,
    addManualRecord,
    setActionStatus,
    resetDemo,
  };
}
