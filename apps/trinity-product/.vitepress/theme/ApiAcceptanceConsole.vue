<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { chatCompletionsUrl } from "../../acceptance/runner/executeCase";
import { buildChatCompletionRequest } from "../../acceptance/runner/formatChatRequest";
import {
  buildChatRequestHeaderRows,
  normalizeApiKey,
  type RequestHeaderRow,
} from "../../acceptance/runner/chatRequestHeaders";
import ApiAcceptanceParamBody from "./ApiAcceptanceParamBody.vue";
import ApiAcceptanceRequestEditor from "./ApiAcceptanceRequestEditor.vue";
import "./api-acceptance.css";
import {
  formatParamHint,
  highlightParamKeys,
} from "../../acceptance/config/chatParamHints";
import { formatTokenUsage, type TokenUsage } from "../../acceptance/runner/tokenUsage";
import {
  type ChatApiTestReportFile,
  type ChatApiTestReportRow,
  toReportRows,
} from "../../acceptance/runner/chatApiTestReport";
import {
  computeRunFingerprint,
  getModelCacheEntry,
  markModelExported,
  pickModelRuns,
  rowCacheKey,
  saveModelCacheEntry,
  type SerializableRunRecord,
} from "../../acceptance/runner/acceptanceRunCache";
import {
  type AcceptanceSignoff,
  type ReportCaseRow,
} from "../../acceptance/runner/formatAcceptanceReport";

type AcceptanceCase = {
  id: string;
  title: string;
  category: string;
  matrix?: boolean;
  skipAuth?: boolean;
  request: Record<string, unknown>;
  expect: Record<string, unknown>;
  expectByModel?: Record<string, Record<string, unknown>>;
  hints?: Record<string, string>;
  note?: string;
};

type ModelItem = { id: string; label: string; provider: string };

type RowKey = string;

type RunRecord = {
  pass: boolean | null;
  httpStatus: number | null;
  durationMs: number | null;
  tokenUsage: TokenUsage | null;
  running: boolean;
  responsePreview: string;
  responseRaw: string;
  isGatewayHtml?: boolean;
  apiErrorMessage?: string | null;
  requestMethod: string | null;
  requestUrl: string | null;
  requestHeaders: Record<string, string> | null;
  requestHeaderRows: RequestHeaderRow[] | null;
  requestBody: Record<string, unknown> | null;
  error?: string;
  assertionErrors: string[];
};

type AcceptanceState = AcceptanceSignoff;

const API_KEY_STORAGE = "trinity-api-acceptance-key";
const BASE_URL_STORAGE = "trinity-api-acceptance-base-url";
const MODEL_STORAGE = "trinity-api-acceptance-model";
const CUSTOM_MODELS_STORAGE = "trinity-api-acceptance-custom-models";
const ACCEPTANCE_STORAGE = "trinity-api-acceptance-signoff";

const isClient = typeof window !== "undefined";
const apiBase = computed(() => {
  const base = import.meta.env.BASE_URL ?? "/";
  return `${base.replace(/\/+$/, "")}/__trinity_api_acceptance`;
});

const reportPageUrl = computed(() => {
  const base = import.meta.env.BASE_URL ?? "/product/";
  return `${base.replace(/\/+$/, "")}/ai-api-platform/api-test/reports/chat-api-test`;
});

const loading = ref(true);
const loadError = ref("");
const baseUrl = ref("");
const defaultBaseUrl = ref("");
const hasServerKey = ref(false);
const baseModels = ref<ModelItem[]>([]);
const customModels = ref<ModelItem[]>([]);
const models = ref<ModelItem[]>([]);
const defaultModel = ref("gpt-5.5");
const selectedModel = ref("");
const showAddModel = ref(false);
const newModelId = ref("");
const newModelLabel = ref("");
const addModelError = ref("");
const newModelIdInput = ref<HTMLInputElement | null>(null);
const cases = ref<AcceptanceCase[]>([]);
const apiKey = ref("");
const runningAll = ref(false);

const activeModel = computed(() => selectedModel.value || models.value[0]?.id || "");

const runs = reactive<Record<RowKey, RunRecord>>({});
const acceptance = reactive<Record<RowKey, AcceptanceState>>({});
const detailKey = ref<RowKey | null>(null);
const rejectNote = ref("");
const detailBodyText = ref("");
const detailBodyDefaultText = ref("");
const detailBodyJsonError = ref("");
const detailRunning = ref(false);
const exportMessage = ref("");
const exportError = ref("");
const exportInfo = ref(false);
const hydrateSource = ref<"cache" | "report" | null>(null);
const duplicateExportAck = ref("");

function rowKey(caseId: string, model: string) {
  return `${caseId}::${model}`;
}

function expandRows(): Array<{ caseId: string; model: string; title: string; category: string; caseDef: AcceptanceCase }> {
  const model = activeModel.value || "—";
  return cases.value.map((c) => ({
    caseId: c.id,
    model,
    title: c.title,
    category: c.category,
    caseDef: c,
  }));
}

const tableRows = computed(() => expandRows());

const runSummary = computed(() => {
  const rows = tableRows.value;
  let executed = 0;
  let machinePass = 0;
  let machineFail = 0;
  let accepted = 0;
  let rejected = 0;
  let pending = 0;

  for (const row of rows) {
    const key = rowKey(row.caseId, row.model);
    const run = runs[key];
    const signoff = acceptance[key] ?? "pending";

    if (run?.pass != null) {
      executed += 1;
      if (run.pass) machinePass += 1;
      else machineFail += 1;
    }
    if (signoff === "accepted") accepted += 1;
    else if (signoff === "rejected") rejected += 1;
    else pending += 1;
  }

  return {
    total: rows.length,
    executed,
    machinePass,
    machineFail,
    accepted,
    rejected,
    pending,
  };
});

const detailRow = computed(() => {
  if (!detailKey.value) return null;
  return tableRows.value.find((r) => rowKey(r.caseId, r.model) === detailKey.value) ?? null;
});

const detailRun = computed(() => (detailKey.value ? runs[detailKey.value] : null));

/** 与 Postman 一致：仅展示格式化后的原始响应体 */
const detailResponseText = computed(() => {
  const run = detailRun.value;
  if (!run) return "（未运行）";
  if (run.running) return "运行中…";
  const body = run.responsePreview || run.responseRaw;
  if (body) return body;
  if (run.error) return run.error;
  return "（空响应）";
});

const detailRequestUrl = computed(() => {
  if (detailRun.value?.requestUrl) return detailRun.value.requestUrl;
  const base = baseUrl.value.trim() || defaultBaseUrl.value.trim();
  return base ? chatCompletionsUrl(base) : "—";
});

function caseParamHint(caseDef: AcceptanceCase, key: string): string {
  return formatParamHint(key, caseDef.hints?.[key]);
}

const detailRequestBody = computed(() => {
  if (detailRun.value?.requestBody) return detailRun.value.requestBody;
  return buildDefaultRequestBody(detailRow.value?.caseDef);
});

function buildDefaultRequestBody(caseDef?: AcceptanceCase): Record<string, unknown> {
  const raw = { ...(caseDef?.request ?? {}) };
  const model = activeModel.value;
  return buildChatCompletionRequest(raw, model, { forceModel: true });
}

function bodyToJsonText(body: Record<string, unknown>): string {
  return JSON.stringify(body, null, 2);
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function tryParseDetailBody(): Record<string, unknown> | null {
  detailBodyJsonError.value = "";
  try {
    const parsed = JSON.parse(detailBodyText.value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("根节点须为 JSON 对象");
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    detailBodyJsonError.value = err instanceof Error ? err.message : "JSON 解析失败";
    return null;
  }
}

const detailBodyForHints = computed(
  () => parseJsonObject(detailBodyText.value) ?? detailRequestBody.value,
);

function syncDetailBodyEditor(preferRunBody = false) {
  if (!detailRow.value) return;
  const defaultBody = buildDefaultRequestBody(detailRow.value.caseDef);
  detailBodyDefaultText.value = bodyToJsonText(defaultBody);
  const source =
    preferRunBody && detailRun.value?.requestBody
      ? detailRun.value.requestBody
      : detailRun.value?.requestBody ?? defaultBody;
  detailBodyText.value = bodyToJsonText(source);
  detailBodyJsonError.value = "";
}

watch(detailKey, (key) => {
  if (!key) return;
  syncDetailBodyEditor(false);
});

const detailRequestHeaderRows = computed((): RequestHeaderRow[] => {
  if (detailRun.value?.requestHeaderRows?.length) return detailRun.value.requestHeaderRows;
  return buildChatRequestHeaderRows({
    apiKey: apiKey.value.trim() || (hasServerKey.value ? "server-key" : undefined),
    skipAuth: detailRow.value?.caseDef.skipAuth,
    baseUrl: baseUrl.value.trim() || defaultBaseUrl.value.trim(),
  });
});

function defaultRun(): RunRecord {
  return {
    pass: null,
    httpStatus: null,
    durationMs: null,
    tokenUsage: null,
    running: false,
    responsePreview: "",
    responseRaw: "",
    requestMethod: null,
    requestUrl: null,
    requestHeaders: null,
    requestHeaderRows: null,
    requestBody: null,
    assertionErrors: [],
  };
}

function toSerializableRun(run: RunRecord): SerializableRunRecord {
  return {
    pass: run.pass,
    httpStatus: run.httpStatus,
    durationMs: run.durationMs,
    tokenUsage: run.tokenUsage,
    responsePreview: run.responsePreview,
    responseRaw: run.responseRaw,
    isGatewayHtml: run.isGatewayHtml,
    apiErrorMessage: run.apiErrorMessage ?? null,
    requestMethod: run.requestMethod,
    requestUrl: run.requestUrl,
    requestHeaders: run.requestHeaders,
    requestBody: run.requestBody,
    error: run.error,
    assertionErrors: run.assertionErrors,
  };
}

function fromSerializableRun(rec: SerializableRunRecord): RunRecord {
  return {
    ...rec,
    running: false,
    requestHeaderRows: null,
    tokenUsage: rec.tokenUsage,
  };
}

function modelCaseIds(): string[] {
  return cases.value.map((c) => c.id);
}

function hasExecutedRunsForModel(model: string): boolean {
  return modelCaseIds().some((caseId) => runs[rowKey(caseId, model)]?.pass != null);
}

function applyReportRows(model: string, rows: ChatApiTestReportRow[]) {
  for (const row of rows) {
    if (row.machinePass == null) continue;
    const key = rowKey(row.caseId, model);
    runs[key] = {
      ...defaultRun(),
      pass: row.machinePass,
      httpStatus: row.httpStatus,
      responsePreview: row.responsePreview ?? "",
      responseRaw: row.responsePreview ?? "",
      apiErrorMessage: row.apiErrorMessage ?? null,
      assertionErrors:
        row.machinePass === false && row.apiErrorMessage ? [row.apiErrorMessage] : [],
    };
  }
}

function persistActiveModelRuns() {
  const model = activeModel.value;
  if (!model || model === "—" || !isClient) return;

  const caseIds = modelCaseIds();
  const modelRuns: Record<string, SerializableRunRecord> = {};
  for (const caseId of caseIds) {
    const key = rowKey(caseId, model);
    const run = runs[key];
    if (!run || run.pass == null) continue;
    modelRuns[key] = toSerializableRun(run);
  }
  if (!Object.keys(modelRuns).length) return;

  const fingerprint = computeRunFingerprint(model, caseIds, runs);
  const prev = getModelCacheEntry(model);
  const keepExport =
    prev?.exportedFingerprint && prev.exportedFingerprint === fingerprint
      ? { exportedAt: prev.exportedAt, exportedFingerprint: prev.exportedFingerprint }
      : {};

  saveModelCacheEntry(model, {
    runs: modelRuns,
    fingerprint,
    ...keepExport,
  });
}

function formatExportedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function hydrateActiveModelRuns() {
  const model = activeModel.value;
  if (!model || model === "—") return;

  for (const caseDef of cases.value) {
    const key = rowKey(caseDef.id, model);
    if (!runs[key]) runs[key] = defaultRun();
  }

  if (hasExecutedRunsForModel(model)) {
    hydrateSource.value = null;
    return;
  }

  const cached = getModelCacheEntry(model);
  if (cached?.runs && Object.keys(cached.runs).length) {
    for (const [key, rec] of Object.entries(cached.runs)) {
      runs[key] = fromSerializableRun(rec);
    }
    hydrateSource.value = "cache";
    return;
  }

  try {
    const res = await fetch(`${apiBase.value}/report`);
    if (res.ok) {
      const data = (await res.json()) as ChatApiTestReportFile;
      const section = data.models?.[model];
      if (section?.rows?.length) {
        applyReportRows(model, section.rows);
        hydrateSource.value = "report";
        return;
      }
    }
  } catch {
    /* ignore */
  }

  hydrateSource.value = null;
}

function loadSignoff() {
  if (!isClient) return;
  try {
    const raw = sessionStorage.getItem(ACCEPTANCE_STORAGE);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, AcceptanceState>;
    Object.assign(acceptance, parsed);
  } catch {
    /* ignore */
  }
}

function saveSignoff() {
  if (!isClient) return;
  sessionStorage.setItem(ACCEPTANCE_STORAGE, JSON.stringify({ ...acceptance }));
}

function loadCustomModels(): ModelItem[] {
  if (!isClient) return [];
  try {
    const raw = localStorage.getItem(CUSTOM_MODELS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ModelItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => typeof m?.id === "string" && m.id.trim())
      .map((m) => ({
        id: m.id.trim(),
        label: (m.label?.trim() || guessModelLabel(m.id.trim())),
        provider: m.provider?.trim() || "custom",
      }));
  } catch {
    return [];
  }
}

function saveCustomModels(list: ModelItem[]) {
  if (!isClient) return;
  localStorage.setItem(CUSTOM_MODELS_STORAGE, JSON.stringify(list));
}

function mergeModelLists(base: ModelItem[], custom: ModelItem[]): ModelItem[] {
  const seen = new Set<string>();
  const out: ModelItem[] = [];
  for (const m of [...base, ...custom]) {
    const id = m.id.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ ...m, id });
  }
  return out;
}

function refreshMergedModels() {
  models.value = mergeModelLists(baseModels.value, customModels.value);
}

function guessModelLabel(id: string): string {
  return id
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function openAddModel() {
  showAddModel.value = true;
  addModelError.value = "";
  newModelId.value = "";
  newModelLabel.value = "";
  void nextTick(() => newModelIdInput.value?.focus());
}

function cancelAddModel() {
  showAddModel.value = false;
  addModelError.value = "";
  newModelId.value = "";
  newModelLabel.value = "";
}

function confirmAddModel() {
  addModelError.value = "";
  const id = newModelId.value.trim();
  if (!id) {
    addModelError.value = "请填写 model id（如 gpt-5.4）";
    return;
  }
  if (!/^[\w.-]+$/.test(id)) {
    addModelError.value = "model id 仅允许字母、数字、 . - _";
    return;
  }

  if (!models.value.some((m) => m.id === id)) {
    const item: ModelItem = {
      id,
      label: newModelLabel.value.trim() || guessModelLabel(id),
      provider: "custom",
    };
    customModels.value = [...customModels.value.filter((m) => m.id !== id), item];
    saveCustomModels(customModels.value);
    refreshMergedModels();
  }

  selectedModel.value = id;
  onModelChange();
  cancelAddModel();
}

async function loadConfig() {
  loading.value = true;
  loadError.value = "";
  try {
    const res = await fetch(`${apiBase.value}/config`);
    if (!res.ok) throw new Error(`配置加载失败 HTTP ${res.status}`);
    const data = (await res.json()) as {
      baseUrl: string;
      hasServerKey: boolean;
      defaultModel?: string;
      models: ModelItem[];
      cases: AcceptanceCase[];
    };
    defaultBaseUrl.value = data.baseUrl;
    const savedBase = isClient ? sessionStorage.getItem(BASE_URL_STORAGE)?.trim() : "";
    baseUrl.value = savedBase || data.baseUrl;
    hasServerKey.value = data.hasServerKey;
    baseModels.value = data.models;
    customModels.value = loadCustomModels();
    refreshMergedModels();
    defaultModel.value = data.defaultModel ?? data.models[0]?.id ?? "gpt-5.5";
    const savedModel = isClient ? sessionStorage.getItem(MODEL_STORAGE)?.trim() : "";
    const modelIds = new Set(models.value.map((m) => m.id));
    selectedModel.value =
      savedModel && modelIds.has(savedModel) ? savedModel : defaultModel.value;
    cases.value = data.cases;
    await hydrateActiveModelRuns();
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

async function runRow(
  caseId: string,
  model: string,
  requestOverride?: Record<string, unknown>,
) {
  const key = rowKey(caseId, model);
  if (!model || model === "—") {
    runs[key] = {
      ...defaultRun(),
      pass: false,
      assertionErrors: ["请先在顶栏选择测试模型"],
    };
    return;
  }
  runs[key] = { ...defaultRun(), running: true };
  try {
    const res = await fetch(`${apiBase.value}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId,
        model,
        requestOverride,
        apiKey: normalizeApiKey(apiKey.value) || undefined,
        baseUrl: baseUrl.value.trim() || undefined,
      }),
    });
    const data = (await res.json()) as RunRecord & { error?: string };
    if (!res.ok && data.error) {
      runs[key] = {
        ...defaultRun(),
        pass: false,
        error: data.error,
        assertionErrors: [data.error],
      };
      persistActiveModelRuns();
      return;
    }
    runs[key] = {
      pass: data.pass,
      httpStatus: data.httpStatus,
      durationMs: data.durationMs,
      tokenUsage: data.tokenUsage ?? null,
      running: false,
      responsePreview: data.responsePreview ?? "",
      responseRaw: data.responseRaw ?? "",
      isGatewayHtml: data.isGatewayHtml,
      apiErrorMessage: data.apiErrorMessage ?? null,
      requestMethod: data.requestMethod ?? "POST",
      requestUrl: data.requestUrl ?? null,
      requestHeaders: data.requestHeaders ?? null,
      requestHeaderRows: data.requestHeaderRows ?? null,
      requestBody: data.requestBody ?? null,
      error: data.error,
      assertionErrors: data.assertionErrors ?? [],
    };
    persistActiveModelRuns();
  } catch (e) {
    runs[key] = {
      ...defaultRun(),
      pass: false,
      error: e instanceof Error ? e.message : String(e),
      assertionErrors: ["请求失败"],
    };
    persistActiveModelRuns();
  }
}

async function runAll() {
  const model = activeModel.value;
  runningAll.value = true;
  for (const row of tableRows.value) {
    await runRow(row.caseId, row.model);
  }
  runningAll.value = false;
  hydrateSource.value = null;

  if (
    model &&
    model !== "—" &&
    runSummary.value.executed === runSummary.value.total &&
    runSummary.value.total > 0
  ) {
    await exportModelReport(model, { auto: true });
  }
}

function setAcceptance(key: RowKey, state: AcceptanceState) {
  acceptance[key] = state;
  saveSignoff();
}

function openDetail(key: RowKey) {
  detailKey.value = key;
  rejectNote.value = "";
  syncDetailBodyEditor(false);
}

function closeDetail() {
  detailKey.value = null;
  detailBodyJsonError.value = "";
}

async function runFromDetail() {
  if (!detailRow.value || !detailKey.value) return;
  const parsed = tryParseDetailBody();
  if (!parsed) return;

  const model =
    typeof parsed.model === "string" && parsed.model.trim()
      ? parsed.model.trim()
      : detailRow.value.model;

  detailRunning.value = true;
  await runRow(detailRow.value.caseId, model, parsed);
  detailRunning.value = false;
  syncDetailBodyEditor(true);
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    api: "API",
    smoke: "冒烟",
    stream: "流式",
    message: "消息",
    param: "参数",
    negative: "负例",
  };
  return map[cat] ?? cat;
}

function machineLabel(key: RowKey) {
  const r = runs[key];
  if (!r || r.running) return "—";
  if (r.pass === null) return "未运行";
  return r.pass ? "机器通过" : "机器失败";
}

function acceptanceLabel(key: RowKey) {
  return acceptance[key] ?? "pending";
}

onMounted(() => {
  if (isClient) {
    apiKey.value = sessionStorage.getItem(API_KEY_STORAGE) ?? "";
    loadSignoff();
    void loadConfig();
  }
});

function onApiKeyInput() {
  if (isClient) {
    const normalized = normalizeApiKey(apiKey.value);
    if (normalized !== apiKey.value) apiKey.value = normalized;
    sessionStorage.setItem(API_KEY_STORAGE, apiKey.value);
  }
}

function onBaseUrlInput() {
  if (isClient) sessionStorage.setItem(BASE_URL_STORAGE, baseUrl.value.trim());
}

function resetBaseUrl() {
  baseUrl.value = defaultBaseUrl.value;
  onBaseUrlInput();
}

function onModelChange() {
  if (isClient) sessionStorage.setItem(MODEL_STORAGE, selectedModel.value);
  duplicateExportAck.value = "";
  exportMessage.value = "";
  exportError.value = "";
  exportInfo.value = false;
  void hydrateActiveModelRuns();
}

function resetModel() {
  selectedModel.value = defaultModel.value;
  onModelChange();
}

function buildReportRows(model: string): ReportCaseRow[] {
  return cases.value.map((caseDef) => {
    const key = rowKey(caseDef.id, model);
    const run = runs[key] ?? defaultRun();
    return {
      caseId: caseDef.id,
      title: caseDef.title,
      category: caseDef.category,
      paramKeys: highlightParamKeys(caseDef.request, caseDef.hints),
      httpStatus: run.httpStatus,
      machinePass: run.pass,
      acceptance: acceptance[key] ?? "pending",
      responsePreview: run.responsePreview || run.responseRaw || run.error || "",
      apiErrorMessage: run.apiErrorMessage ?? null,
      assertionErrors: run.assertionErrors,
      note: caseDef.note,
    };
  });
}

async function exportModelReport(model: string, opts?: { auto?: boolean; force?: boolean }) {
  exportMessage.value = "";
  exportError.value = "";
  exportInfo.value = false;
  const modelMeta = models.value.find((m) => m.id === model);
  const rows = toReportRows(buildReportRows(model)).filter((r) => r.machinePass != null);
  if (!rows.length) {
    exportError.value = "无测试结果可导出，请先运行用例";
    return;
  }
  if (rows.length < cases.value.length) {
    exportError.value = `仅 ${rows.length}/${cases.value.length} 条已执行，请先运行全部`;
    return;
  }

  const fingerprint = computeRunFingerprint(model, modelCaseIds(), runs);
  const cached = getModelCacheEntry(model);
  const alreadyExported =
    cached?.exportedFingerprint === fingerprint && Boolean(cached?.exportedAt);

  if (!opts?.force && alreadyExported && cached?.exportedAt) {
    const when = formatExportedAt(cached.exportedAt);
    if (opts?.auto) {
      exportInfo.value = true;
      exportMessage.value = `已于 ${when} 导出（结果未变），无需重复写入`;
      return;
    }
    if (duplicateExportAck.value !== fingerprint) {
      duplicateExportAck.value = fingerprint;
      exportInfo.value = true;
      exportMessage.value = `已于 ${when} 导出，结果未变化。再次点击「导出测试汇总」将覆盖写入。`;
      return;
    }
  }

  duplicateExportAck.value = "";

  try {
    const res = await fetch(`${apiBase.value}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        modelLabel: modelMeta?.label,
        endpoint: "POST /v1/chat/completions",
        rows,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) {
      exportError.value = data.error ?? `导出失败 HTTP ${res.status}`;
      return;
    }
    markModelExported(model, fingerprint);
    const caseIds = modelCaseIds();
    const modelRuns = pickModelRuns(
      model,
      caseIds,
      Object.fromEntries(
        caseIds
          .map((caseId) => {
            const key = rowCacheKey(caseId, model);
            const run = runs[key];
            if (!run || run.pass == null) return null;
            return [key, toSerializableRun(run)] as const;
          })
          .filter((x): x is [string, SerializableRunRecord] => x != null),
      ),
    );
    saveModelCacheEntry(model, {
      runs: modelRuns,
      fingerprint,
      exportedAt: new Date().toISOString(),
      exportedFingerprint: fingerprint,
    });
    exportMessage.value = opts?.auto
      ? `已自动写入 Chat API Test（模型 ${model}）`
      : `已写入 Chat API Test 报告（模型 ${model}）`;
  } catch (e) {
    exportError.value = e instanceof Error ? e.message : "导出失败";
  }
}

function exportCurrentModelReport() {
  const model = activeModel.value;
  if (!model || model === "—") return;
  void exportModelReport(model);
}

watch(showAddModel, (open) => {
  if (!isClient || !open) return;
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") cancelAddModel();
  };
  document.addEventListener("keydown", onEsc);
  return () => document.removeEventListener("keydown", onEsc);
});
</script>

<template>
  <div v-if="!isClient" class="api-acc" aria-hidden="true" />

  <div v-else class="api-acc">
    <ol class="api-acc-flow">
      <li class="api-acc-flow-step" :class="{ 'is-active': Boolean(activeModel && activeModel !== '—') }">
        <span class="api-acc-flow-num">1</span>
        <span class="api-acc-flow-text"><strong>选择模型</strong> · 下拉选择或点 <strong>新增</strong> 添加 model id</span>
      </li>
      <li
        class="api-acc-flow-step"
        :class="{ 'is-active': runSummary.executed > 0, 'is-running': runningAll }"
      >
        <span class="api-acc-flow-num">2</span>
        <span class="api-acc-flow-text"><strong>测试模型</strong> · 运行全部，查看表格结果</span>
      </li>
      <li class="api-acc-flow-step" :class="{ 'is-active': runSummary.executed === runSummary.total && runSummary.total > 0 }">
        <span class="api-acc-flow-num">3</span>
        <span class="api-acc-flow-text"><strong>记录汇总</strong> · 导出至 <a :href="reportPageUrl">Chat API Test</a></span>
      </li>
    </ol>

    <p class="api-acc-lead">
      流程：<strong>选模型 → 测模型 → 导出汇总</strong>。换模型重复 1～3；汇总样例见侧栏「API 验证」。仅 localhost dev 可用。
    </p>

    <div v-if="loading" class="api-acc-banner">加载用例…</div>
    <div v-else-if="loadError" class="api-acc-banner api-acc-banner--error">{{ loadError }}</div>

    <template v-else>
      <div class="api-acc-toolbar">
        <label class="api-acc-field api-acc-field--grow">
          <span>内测 BASE_URL</span>
          <input
            v-model="baseUrl"
            type="url"
            class="api-acc-input"
            autocomplete="off"
            placeholder="http://43.159.57.43"
            @input="onBaseUrlInput"
          />
        </label>
        <button
          v-if="defaultBaseUrl && baseUrl !== defaultBaseUrl"
          type="button"
          class="api-acc-btn api-acc-btn--sm api-acc-reset-base"
          @click="resetBaseUrl"
        >
          恢复默认
        </button>
        <label class="api-acc-field api-acc-model-field">
          <span>测试模型</span>
          <div class="api-acc-model-row">
            <select
              v-model="selectedModel"
              class="api-acc-input api-acc-select"
              @change="onModelChange"
            >
              <option v-for="m in models" :key="m.id" :value="m.id">
                {{ m.label }}（{{ m.id }}）
              </option>
            </select>
            <button type="button" class="api-acc-btn api-acc-btn--sm" @click="openAddModel">
              新增
            </button>
          </div>
        </label>
        <button
          v-if="selectedModel && selectedModel !== defaultModel"
          type="button"
          class="api-acc-btn api-acc-btn--sm api-acc-reset-base"
          @click="resetModel"
        >
          默认模型
        </button>
        <label class="api-acc-field api-acc-field--grow">
          <span>API Key {{ hasServerKey ? "（可留空，已配置服务端 TRINITY_API_KEY）" : "（xh-…）" }}</span>
          <input
            v-model="apiKey"
            type="password"
            class="api-acc-input"
            autocomplete="off"
            placeholder="xh-…（仅 Key，勿带 Bearer）"
            @input="onApiKeyInput"
          />
        </label>
        <div class="api-acc-toolbar-actions">
          <button type="button" class="api-acc-btn api-acc-btn--primary" :disabled="runningAll" @click="runAll">
            {{ runningAll ? "运行中…" : "运行全部" }}
          </button>
          <button
            type="button"
            class="api-acc-btn"
            :disabled="!activeModel || activeModel === '—'"
            @click="exportCurrentModelReport"
          >
            导出测试汇总
          </button>
        </div>
      </div>

      <p
        v-if="exportMessage"
        class="api-acc-export-ok"
        :class="{ 'api-acc-export-info': exportInfo }"
      >
        {{ exportMessage }}
        <template v-if="!exportInfo">
          ·
          <a :href="reportPageUrl">查看报告</a>
          · 提交 git 后线上文档站同步
        </template>
      </p>
      <p v-if="exportError" class="api-acc-export-err">{{ exportError }}</p>

      <p v-if="hydrateSource === 'cache'" class="api-acc-hydrate-hint">
        已恢复本机 24 小时内缓存（含完整响应与耗时）
      </p>
      <p v-else-if="hydrateSource === 'report'" class="api-acc-hydrate-hint">
        已从 Chat API Test 历史导出回填（耗时 / Tokens 需重跑获取）
      </p>

      <p v-if="!loading && !loadError" class="api-acc-summary">
        当前模型 <code>{{ activeModel }}</code> ·
        <strong>{{ runSummary.executed }}/{{ runSummary.total }}</strong> 已测 ·
        <strong>{{ runSummary.machinePass }}/{{ runSummary.total }}</strong> 通过
        <template v-if="runSummary.machineFail"> · {{ runSummary.machineFail }} 未通过</template>
        <template v-if="runSummary.executed === runSummary.total && runSummary.total > 0">
          · 可执行步骤 3 导出汇总
        </template>
      </p>

      <div class="api-acc-table-wrap">
        <table class="api-acc-table">
          <thead>
            <tr>
              <th class="api-acc-col-case">用例</th>
              <th class="api-acc-col-cat">类别</th>
              <th class="api-acc-col-status">机器结果</th>
              <th class="api-acc-col-metrics">耗时 / Tokens</th>
              <th class="api-acc-col-signoff">验收</th>
              <th class="api-acc-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableRows" :key="rowKey(row.caseId, row.model)">
              <td class="api-acc-col-case">
                <div class="api-acc-case-head">
                  <code class="api-acc-case-id">{{ row.caseId }}</code>
                  <span class="api-acc-case-title">{{ row.title }}</span>
                </div>
                <div v-if="highlightParamKeys(row.caseDef.request, row.caseDef.hints).length" class="api-acc-case-params">
                  <span
                    v-for="key in highlightParamKeys(row.caseDef.request, row.caseDef.hints)"
                    :key="key"
                    class="api-acc-param-chip"
                  >
                    <span class="api-acc-param-key-wrap">
                      <code>{{ key }}</code>
                      <span
                        v-if="caseParamHint(row.caseDef, key)"
                        class="api-acc-param-tip"
                        role="tooltip"
                      >{{ caseParamHint(row.caseDef, key) }}</span>
                    </span>
                  </span>
                </div>
              </td>
              <td class="api-acc-col-cat">
                {{ categoryLabel(row.category) }}
              </td>
              <td class="api-acc-col-status">
                <span
                  class="api-acc-pill"
                  :class="{
                    'is-pass': runs[rowKey(row.caseId, row.model)]?.pass === true,
                    'is-fail': runs[rowKey(row.caseId, row.model)]?.pass === false,
                    'is-run': runs[rowKey(row.caseId, row.model)]?.running,
                    'is-idle': runs[rowKey(row.caseId, row.model)]?.pass == null && !runs[rowKey(row.caseId, row.model)]?.running,
                  }"
                >
                  {{
                    runs[rowKey(row.caseId, row.model)]?.running
                      ? "运行中"
                      : machineLabel(rowKey(row.caseId, row.model))
                  }}
                </span>
              </td>
              <td class="api-acc-col-metrics api-acc-metrics">
                <template v-if="runs[rowKey(row.caseId, row.model)]?.running">—</template>
                <template v-else-if="runs[rowKey(row.caseId, row.model)]?.durationMs != null">
                  <span class="api-acc-metrics-ms">{{ runs[rowKey(row.caseId, row.model)]!.durationMs }} ms</span>
                  <span
                    v-if="formatTokenUsage(runs[rowKey(row.caseId, row.model)]!.tokenUsage) !== '—'"
                    class="api-acc-metrics-tokens"
                  >
                    {{ formatTokenUsage(runs[rowKey(row.caseId, row.model)]!.tokenUsage) }}
                  </span>
                  <span
                    v-else-if="runs[rowKey(row.caseId, row.model)]?.pass != null"
                    class="api-acc-metrics-tokens api-acc-metrics-tokens--muted"
                  >未返回 usage</span>
                </template>
                <template v-else>—</template>
              </td>
              <td class="api-acc-col-signoff">
                <span
                  class="api-acc-signoff"
                  :class="{
                    'is-accepted': acceptanceLabel(rowKey(row.caseId, row.model)) === 'accepted',
                    'is-rejected': acceptanceLabel(rowKey(row.caseId, row.model)) === 'rejected',
                    'is-pending': acceptanceLabel(rowKey(row.caseId, row.model)) === 'pending',
                  }"
                >
                  {{
                    acceptanceLabel(rowKey(row.caseId, row.model)) === "accepted"
                      ? "已验收"
                      : acceptanceLabel(rowKey(row.caseId, row.model)) === "rejected"
                        ? "未通过"
                        : "待验收"
                  }}
                </span>
              </td>
              <td class="api-acc-col-actions api-acc-actions">
                <button
                  type="button"
                  class="api-acc-btn api-acc-btn--sm api-acc-btn--run"
                  :disabled="runs[rowKey(row.caseId, row.model)]?.running"
                  @click="runRow(row.caseId, row.model)"
                >
                  运行
                </button>
                <button
                  type="button"
                  class="api-acc-btn api-acc-btn--sm"
                  @click="openDetail(rowKey(row.caseId, row.model))"
                >
                  详情
                </button>
                <button
                  type="button"
                  class="api-acc-btn api-acc-btn--sm api-acc-btn--ok"
                  @click="setAcceptance(rowKey(row.caseId, row.model), 'accepted')"
                >
                  验收✓
                </button>
                <button
                  type="button"
                  class="api-acc-btn api-acc-btn--sm api-acc-btn--no"
                  @click="setAcceptance(rowKey(row.caseId, row.model), 'rejected')"
                >
                  不通过
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-if="detailKey && detailRow" class="api-acc-drawer-backdrop" @click.self="closeDetail">
      <aside class="api-acc-drawer" role="dialog" aria-label="用例详情">
        <header class="api-acc-drawer-head">
          <h3>{{ detailRow.caseId }} · {{ detailRow.model }}</h3>
          <button type="button" class="api-acc-btn api-acc-btn--sm" @click="closeDetail">关闭</button>
        </header>
        <div class="api-acc-drawer-body">
          <p class="api-acc-drawer-meta">
            HTTP {{ detailRun?.httpStatus ?? "—" }} · {{ detailRun?.durationMs ?? "—" }} ms
            <template v-if="detailRun && formatTokenUsage(detailRun.tokenUsage) !== '—'">
              · {{ formatTokenUsage(detailRun.tokenUsage) }}
            </template>
          </p>
          <h4>请求</h4>
          <p class="api-acc-drawer-meta api-acc-drawer-meta--mono">
            {{ detailRun?.requestMethod ?? "POST" }} {{ detailRequestUrl }}
          </p>
          <h5 class="api-acc-drawer-sub">Headers</h5>
          <div class="api-acc-header-table-wrap">
            <table class="api-acc-header-table">
              <thead>
                <tr>
                  <th scope="col" aria-label="启用" />
                  <th scope="col">Key</th>
                  <th scope="col">Value</th>
                  <th scope="col">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in detailRequestHeaderRows"
                  :key="row.key"
                  :class="{ 'is-disabled': !row.enabled }"
                >
                  <td class="api-acc-header-check">{{ row.enabled ? "✓" : "—" }}</td>
                  <td>{{ row.key }}</td>
                  <td class="api-acc-header-value">{{ row.value }}</td>
                  <td class="api-acc-header-note">{{ row.note ?? "—" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="api-acc-drawer-hint">
            与 Postman 一致：<code>Content-Type</code>、<code>Authorization</code> 为业务必填；其余由 HTTP 客户端自动添加。
          </p>
          <h5 class="api-acc-drawer-sub">Body</h5>
          <ApiAcceptanceRequestEditor
            v-model="detailBodyText"
            :default-value="detailBodyDefaultText"
            :running="detailRunning || Boolean(detailRun?.running)"
            :error="detailBodyJsonError"
            @run="runFromDetail"
          />
          <ApiAcceptanceParamBody
            :body="detailBodyForHints"
            :case-hints="detailRow.caseDef.hints"
            :case-note="detailRow.caseDef.note"
          />
          <h4>响应</h4>
          <p class="api-acc-drawer-meta api-acc-drawer-meta--mono">
            HTTP {{ detailRun?.httpStatus ?? "—" }}
            <template v-if="detailRun?.durationMs != null"> · {{ detailRun.durationMs }} ms</template>
            <template v-if="detailRun && formatTokenUsage(detailRun.tokenUsage) !== '—'">
              · {{ formatTokenUsage(detailRun.tokenUsage) }}
            </template>
          </p>
          <p v-if="detailRun?.isGatewayHtml" class="api-acc-drawer-warn">
            网关返回 HTML 错误页（如 nginx 502），非 API JSON；请直接看下方响应体排查。
          </p>
          <pre class="api-acc-pre api-acc-pre--response">{{ detailResponseText }}</pre>
          <template v-if="detailRun?.assertionErrors?.length">
            <h4>断言</h4>
            <ul class="api-acc-errors">
              <li v-for="(err, i) in detailRun.assertionErrors" :key="i">{{ err }}</li>
            </ul>
          </template>
        </div>
      </aside>
    </div>

    <div v-if="showAddModel" class="api-acc-modal-backdrop" @click.self="cancelAddModel">
      <div class="api-acc-modal" role="dialog" aria-modal="true" aria-labelledby="api-acc-add-model-title">
        <header class="api-acc-modal-head">
          <h2 id="api-acc-add-model-title" class="api-acc-modal-title">新增测试模型</h2>
          <button type="button" class="api-acc-modal-close" aria-label="关闭" @click="cancelAddModel">
            ×
          </button>
        </header>
        <div class="api-acc-modal-body">
          <p class="api-acc-modal-hint">填写网关上的 <code>model</code> 字符串，添加后自动选中并可用于运行 / 导出汇总。</p>
          <label class="api-acc-modal-field">
            <span>model id <em>必填</em></span>
            <input
              ref="newModelIdInput"
              v-model="newModelId"
              type="text"
              class="api-acc-input"
              autocomplete="off"
              placeholder="gpt-5.4"
              @keydown.enter.prevent="confirmAddModel"
            />
          </label>
          <label class="api-acc-modal-field">
            <span>显示名 <em>可选</em></span>
            <input
              v-model="newModelLabel"
              type="text"
              class="api-acc-input"
              autocomplete="off"
              placeholder="GPT-5.4"
              @keydown.enter.prevent="confirmAddModel"
            />
          </label>
          <p v-if="addModelError" class="api-acc-modal-error">{{ addModelError }}</p>
        </div>
        <footer class="api-acc-modal-foot">
          <button type="button" class="api-acc-btn" @click="cancelAddModel">取消</button>
          <button type="button" class="api-acc-btn api-acc-btn--primary" @click="confirmAddModel">
            添加并选中
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>
