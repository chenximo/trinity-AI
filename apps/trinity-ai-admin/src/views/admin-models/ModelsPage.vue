<script setup lang="ts">
import { Bottom, CircleCheck, Delete, Edit, FolderOpened } from "@element-plus/icons-vue";
import { computed, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminExportCsvButton from "../../components/AdminExportCsvButton.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import {
  ADMIN_TABLE_COL,
  ADMIN_TABLE_COL_MIN,
  ADMIN_TABLE_COL_OPS,
} from "../../utils/adminTableColumns";
import { filterByQuery } from "../../utils/adminListFilter";
import "./models.css";
import {
  MODEL_BINDING_ROWS,
  MODEL_LIST_ROWS,
  MODEL_MASTER_SEEDS,
  MODEL_PANEL_ORDER,
  DEFAULT_MODEL_PRICING_ROWS,
  MODEL_SUPPLY_LINE_ROWS,
  buildDefaultModelMaster,
  type ModelPricingRow,
  type ModelSupplyLineRow,
  getModelSupplierFilterOptions,
  modelHasSupplierLine,
  type ModelListRow,
  type ModelMasterRecord,
  type ModelPanelId,
} from "./mock";
import {
  readModelListFilter,
  readModelListRowsJson,
  readModelListSupplierFilter,
  readModelMasterRecordsJson,
  readModelMasterSelectedId,
  readModelLineSupplierFilter,
  readModelPricingRowsJson,
  readModelSupplyLinesJson,
  writeModelListFilter,
  writeModelListRowsJson,
  writeModelListSupplierFilter,
  writeModelMasterRecordsJson,
  writeModelMasterSelectedId,
  writeModelLineSupplierFilter,
  writeModelPricingRowsJson,
  writeModelSupplyLinesJson,
} from "./modelsInteractions";

const route = useRoute();
const router = useRouter();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<ModelPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && MODEL_PANEL_ORDER.includes(id as ModelPanelId)) return id as ModelPanelId;
  return "list";
});

const listFilter = ref("");
const modelShelfFilter = ref<"all" | "on" | "off" | "gray">("all");
const modelSupplierFilter = ref("");
const modelSupplierOptions = getModelSupplierFilterOptions();
const supplyLineRows = ref<ModelSupplyLineRow[]>([]);
const lineSearchQ = ref("");
const lineSupplierFilter = ref("");
const lineProbeRunning = ref(false);
const pricingSearchQ = ref("");
const pricingRows = ref<ModelPricingRow[]>([]);
const pricingFormOpen = ref(false);
const pricingFormMode = ref<"add" | "edit">("add");
const pricingEditingId = ref<string | null>(null);
const pricingFormError = ref("");
const draftPricingModelId = ref("");
const draftPricingLineId = ref("");
const draftPricingSku = ref("");
const draftPricingListPrice = ref("");
const draftPricingInternalCost = ref("");
const draftPricingEffectiveFrom = ref("");
const draftPricingNote = ref("");
const pricingDeleteConfirmOpen = ref(false);
const pricingDeleteTargetId = ref<string | null>(null);
const pricingDeleteTargetLabel = ref("");
const bindingSearchQ = ref("");

const filteredBindings = computed(() =>
  filterByQuery(MODEL_BINDING_ROWS, bindingSearchQ.value, (r) =>
    [r.modelName, r.routeName, r.platformKeyLabel].join(" "),
  ),
);
const bindingsPg = useAdminTablePagination(filteredBindings);
const modelImportInputRef = ref<HTMLInputElement | null>(null);

const modelListRows = ref<ModelListRow[]>([]);
const modelFormModalOpen = ref(false);
const modelFormMode = ref<"add" | "edit">("add");
const modelEditingId = ref<string | null>(null);
const modelFormError = ref("");
const draftModelDisplayName = ref("");
const draftModelId = ref("");
const draftModelApiKind = ref("API₂");
const draftModelShelf = ref("上架");
const draftModelRouteCount = ref("0");

const modelFormTitle = computed(() =>
  modelFormMode.value === "edit" ? "编辑逻辑模型" : "新增逻辑模型"
);

const modelDangerConfirmOpen = ref(false);
const modelDangerKind = ref<"none" | "delete-model" | "shelf-down">("none");
const modelDangerTargetId = ref<string | null>(null);
const modelDangerTargetLabel = ref("");

const modelDangerConfirmTitle = computed(() => {
  if (modelDangerKind.value === "delete-model") return "确认删除逻辑模型";
  if (modelDangerKind.value === "shelf-down") return "确认下架";
  return "确认操作";
});

const modelDangerConfirmPrimaryLabel = computed(() =>
  modelDangerKind.value === "shelf-down" ? "确认下架" : "确认删除"
);

const modelDangerConfirmMessage = computed(() => {
  const label = modelDangerTargetLabel.value;
  if (modelDangerKind.value === "delete-model") {
    return `确定删除逻辑模型「${label}」？原型将同步更新 localStorage。`;
  }
  if (modelDangerKind.value === "shelf-down") {
    return `确定将「${label}」设为下架？租户侧将不可见该模型（示意），并同步 localStorage。`;
  }
  return "";
});

function loadModelListRows(): void {
  const raw = readModelListRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        modelListRows.value = parsed as ModelListRow[];
        return;
      }
    } catch {
      /* use default */
    }
  }
  modelListRows.value = JSON.parse(JSON.stringify(MODEL_LIST_ROWS)) as ModelListRow[];
}

function persistModelListRows(): void {
  writeModelListRowsJson(JSON.stringify(modelListRows.value));
}

function onAddModelClick(): void {
  modelFormMode.value = "add";
  modelEditingId.value = null;
  modelFormError.value = "";
  draftModelDisplayName.value = "";
  draftModelId.value = "";
  draftModelApiKind.value = "API₂";
  draftModelShelf.value = "上架";
  draftModelRouteCount.value = "0";
  modelFormModalOpen.value = true;
}

function closeModelFormModal(): void {
  modelFormModalOpen.value = false;
  modelFormError.value = "";
  modelEditingId.value = null;
}

function saveModelForm(): void {
  modelFormError.value = "";
  const displayName = draftModelDisplayName.value.trim();
  const apiKind = draftModelApiKind.value.trim() || "API₂";
  const shelf = draftModelShelf.value.trim() || "上架";
  const rc = Number.parseInt(draftModelRouteCount.value.trim(), 10);
  const routeCount = Number.isFinite(rc) && rc >= 0 ? rc : 0;
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  if (!displayName) {
    modelFormError.value = "展示名称必填。";
    return;
  }

  if (modelFormMode.value === "edit" && modelEditingId.value) {
    const idx = modelListRows.value.findIndex((x) => x.id === modelEditingId.value);
    if (idx < 0) {
      modelFormError.value = "未找到该行，可能已被删除。";
      return;
    }
    const prev = modelListRows.value[idx];
    if (!prev) return;
    modelListRows.value[idx] = {
      ...prev,
      displayName,
      apiKind,
      shelf,
      routeCount,
      updatedAt: now,
    };
  } else {
    let id = draftModelId.value.trim();
    if (!id) {
      id = `lm-${Date.now()}`;
    }
    modelListRows.value.push({
      id,
      displayName,
      apiKind,
      shelf,
      routeCount,
      updatedAt: now,
    });
  }
  persistModelListRows();
  closeModelFormModal();
}

function onEditModelClick(row: ModelListRow): void {
  modelFormMode.value = "edit";
  modelEditingId.value = row.id;
  modelFormError.value = "";
  draftModelDisplayName.value = row.displayName;
  draftModelId.value = row.id;
  draftModelApiKind.value = row.apiKind;
  draftModelShelf.value = row.shelf;
  draftModelRouteCount.value = String(row.routeCount);
  modelFormModalOpen.value = true;
}

function requestDeleteModel(row: ModelListRow): void {
  modelDangerKind.value = "delete-model";
  modelDangerTargetId.value = row.id;
  modelDangerTargetLabel.value = `${row.displayName}（${row.id}）`;
  modelDangerConfirmOpen.value = true;
}

function requestModelShelfDown(row: ModelListRow): void {
  modelDangerKind.value = "shelf-down";
  modelDangerTargetId.value = row.id;
  modelDangerTargetLabel.value = `${row.displayName}（${row.id}）`;
  modelDangerConfirmOpen.value = true;
}

function closeModelDangerConfirm(): void {
  modelDangerConfirmOpen.value = false;
  modelDangerKind.value = "none";
  modelDangerTargetId.value = null;
  modelDangerTargetLabel.value = "";
}

function applyModelShelfDown(id: string): void {
  const idx = modelListRows.value.findIndex((x) => x.id === id);
  if (idx < 0) return;
  const prev = modelListRows.value[idx];
  if (!prev || prev.shelf === "下架") return;
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  modelListRows.value[idx] = { ...prev, shelf: "下架", updatedAt: now };
  persistModelListRows();
}

function executeModelDangerConfirm(): void {
  const id = modelDangerTargetId.value;
  if (!id || modelDangerKind.value === "none") {
    closeModelDangerConfirm();
    return;
  }
  if (modelDangerKind.value === "delete-model") {
    modelListRows.value = modelListRows.value.filter((x) => x.id !== id);
    delete masterRecords.value[id];
    if (masterSelectedId.value === id) {
      masterSelectedId.value = modelListRows.value[0]?.id ?? "";
      writeModelMasterSelectedId(masterSelectedId.value);
    }
    persistMasterRecords();
    persistModelListRows();
  } else if (modelDangerKind.value === "shelf-down") {
    applyModelShelfDown(id);
  }
  closeModelDangerConfirm();
}

function setModelShelfStatus(id: string, shelf: "上架" | "下架"): void {
  if (shelf === "下架") return;
  const idx = modelListRows.value.findIndex((x) => x.id === id);
  if (idx < 0) return;
  const prev = modelListRows.value[idx];
  if (!prev || prev.shelf === shelf) return;
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  modelListRows.value[idx] = { ...prev, shelf, updatedAt: now };
  persistModelListRows();
}

function triggerModelImport(): void {
  modelImportInputRef.value?.click();
}

function onModelImportFileChange(e: Event): void {
  const el = e.target as HTMLInputElement;
  const f = el.files?.[0];
  if (f) window.alert(`原型：已选择导入文件「${f.name}」（未解析）`);
  el.value = "";
}

function onExportModelsClick(): void {
  window.alert("原型：将导出当前筛选结果为 Excel（未实现）。");
}

function goModelLines(row: ModelListRow): void {
  router.push({ name: "tai-admin-models-lines", query: { modelId: row.id } });
}

function goModelMaster(row: ModelListRow): void {
  masterSelectedId.value = row.id;
  writeModelMasterSelectedId(row.id);
  router.push({ name: "tai-admin-models-master", query: { modelId: row.id } });
}

function goModelMasterByModelId(modelId: string): void {
  const row = modelListRows.value.find((x) => x.id === modelId);
  if (row) goModelMaster(row);
}

function migrateSupplyLine(row: ModelSupplyLineRow): ModelSupplyLineRow {
  return {
    ...row,
    lastProbeAt: row.lastProbeAt ?? "—",
    probeResult: row.probeResult ?? "—",
    probeDetail: row.probeDetail ?? "",
  };
}

function loadSupplyLines(): void {
  const raw = readModelSupplyLinesJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        supplyLineRows.value = (parsed as ModelSupplyLineRow[]).map((r) => migrateSupplyLine(r));
        return;
      }
    } catch {
      /* use default */
    }
  }
  supplyLineRows.value = JSON.parse(JSON.stringify(MODEL_SUPPLY_LINE_ROWS)) as ModelSupplyLineRow[];
  persistSupplyLines();
}

function persistSupplyLines(): void {
  writeModelSupplyLinesJson(JSON.stringify(supplyLineRows.value));
}

function loadPricingRows(): void {
  const raw = readModelPricingRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        pricingRows.value = parsed as ModelPricingRow[];
        return;
      }
    } catch {
      /* use default */
    }
  }
  pricingRows.value = JSON.parse(JSON.stringify(DEFAULT_MODEL_PRICING_ROWS)) as ModelPricingRow[];
  persistPricingRows();
}

function persistPricingRows(): void {
  writeModelPricingRowsJson(JSON.stringify(pricingRows.value));
}

const pricingFormTitle = computed(() =>
  pricingFormMode.value === "edit" ? "编辑刊例行" : "新增刊例行",
);

const pricingLinesForDraftModel = computed(() =>
  supplyLineRows.value.filter((l) => l.modelId === draftPricingModelId.value),
);

function parseYuanAmount(text: string): number | null {
  const m = text.match(/¥\s*([\d.]+)/);
  if (!m?.[1]) return null;
  const n = Number.parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

function pricingMarginLabel(row: ModelPricingRow): string {
  const list = parseYuanAmount(row.listPrice);
  const cost = parseYuanAmount(row.internalCost);
  if (list == null || cost == null || list <= 0) return "—";
  return `${(((list - cost) / list) * 100).toFixed(1)}%`;
}

function pricingSupplyLine(lineId: string): ModelSupplyLineRow | undefined {
  return supplyLineRows.value.find((l) => l.id === lineId);
}

function pricingLineSupplier(lineId: string): string {
  return pricingSupplyLine(lineId)?.supplier ?? "—";
}

function pricingLineCostRef(lineId: string): string {
  return pricingSupplyLine(lineId)?.costRef ?? "";
}

function pricingCostMismatch(row: ModelPricingRow): boolean {
  const ref = pricingLineCostRef(row.supplyLineId).trim();
  if (!ref) return false;
  const cost = row.internalCost.trim();
  if (cost.includes(ref) || ref.includes(cost)) return false;
  const costY = parseYuanAmount(cost);
  const refY = parseYuanAmount(ref);
  if (costY != null && refY != null) return Math.abs(costY - refY) > 0.001;
  return true;
}

function onAddPricingClick(): void {
  pricingFormMode.value = "add";
  pricingEditingId.value = null;
  pricingFormError.value = "";
  draftPricingModelId.value = masterSelectedId.value || modelListRows.value[0]?.id || "";
  const lines = supplyLineRows.value.filter((l) => l.modelId === draftPricingModelId.value);
  draftPricingLineId.value = lines[0]?.id ?? "";
  draftPricingSku.value = "";
  draftPricingListPrice.value = "";
  draftPricingInternalCost.value = "";
  draftPricingEffectiveFrom.value = new Date().toISOString().slice(0, 10);
  draftPricingNote.value = "";
  pricingFormOpen.value = true;
}

function onEditPricingClick(row: ModelPricingRow): void {
  pricingFormMode.value = "edit";
  pricingEditingId.value = row.id;
  pricingFormError.value = "";
  draftPricingModelId.value = row.modelId;
  draftPricingLineId.value = row.supplyLineId;
  draftPricingSku.value = row.sku;
  draftPricingListPrice.value = row.listPrice;
  draftPricingInternalCost.value = row.internalCost;
  draftPricingEffectiveFrom.value = row.effectiveFrom;
  draftPricingNote.value = row.note;
  pricingFormOpen.value = true;
}

function closePricingForm(): void {
  pricingFormOpen.value = false;
  pricingFormError.value = "";
  pricingEditingId.value = null;
}

function savePricingForm(): void {
  pricingFormError.value = "";
  const modelId = draftPricingModelId.value.trim();
  const supplyLineId = draftPricingLineId.value.trim();
  const sku = draftPricingSku.value.trim();
  const listPrice = draftPricingListPrice.value.trim();
  const internalCost = draftPricingInternalCost.value.trim();
  const effectiveFrom = draftPricingEffectiveFrom.value.trim();
  const note = draftPricingNote.value.trim();
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  if (!modelId) {
    pricingFormError.value = "请选择逻辑模型。";
    return;
  }
  if (!supplyLineId) {
    pricingFormError.value = "请选择供应线路。";
    return;
  }
  if (!sku) {
    pricingFormError.value = "SKU 必填。";
    return;
  }
  if (!listPrice || !internalCost) {
    pricingFormError.value = "对外刊例价与采购成本必填。";
    return;
  }
  const lineOk = supplyLineRows.value.some((l) => l.id === supplyLineId && l.modelId === modelId);
  if (!lineOk) {
    pricingFormError.value = "供应线路与逻辑模型不匹配。";
    return;
  }

  if (pricingFormMode.value === "edit" && pricingEditingId.value) {
    const idx = pricingRows.value.findIndex((x) => x.id === pricingEditingId.value);
    if (idx < 0) {
      pricingFormError.value = "未找到该行，可能已被删除。";
      return;
    }
    const prev = pricingRows.value[idx];
    if (!prev) return;
    pricingRows.value[idx] = {
      ...prev,
      modelId,
      supplyLineId,
      sku,
      listPrice,
      internalCost,
      effectiveFrom: effectiveFrom || prev.effectiveFrom,
      note,
      updatedAt: now,
    };
  } else {
    pricingRows.value.push({
      id: `pr-${Date.now()}`,
      modelId,
      supplyLineId,
      sku,
      listPrice,
      internalCost,
      effectiveFrom: effectiveFrom || now.slice(0, 10),
      note,
      updatedAt: now,
    });
  }
  persistPricingRows();
  closePricingForm();
}

function requestDeletePricing(row: ModelPricingRow): void {
  pricingDeleteTargetId.value = row.id;
  pricingDeleteTargetLabel.value = `${row.sku}（${row.id}）`;
  pricingDeleteConfirmOpen.value = true;
}

function closePricingDeleteConfirm(): void {
  pricingDeleteConfirmOpen.value = false;
  pricingDeleteTargetId.value = null;
  pricingDeleteTargetLabel.value = "";
}

function executePricingDeleteConfirm(): void {
  const id = pricingDeleteTargetId.value;
  if (id) {
    pricingRows.value = pricingRows.value.filter((x) => x.id !== id);
    persistPricingRows();
  }
  closePricingDeleteConfirm();
}

function goPricingSupplyLine(row: ModelPricingRow): void {
  masterSelectedId.value = row.modelId;
  writeModelMasterSelectedId(row.modelId);
  void router.push({ name: "tai-admin-models-lines", query: { modelId: row.modelId } });
}

function formatLineProbeNow(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function runLineProbeNow(): void {
  const runIds = new Set(filteredSupplyLines.value.map((r) => r.id));
  if (runIds.size === 0) {
    window.alert("当前筛选下无供应线路，请调整逻辑模型或供应商筛选。");
    return;
  }
  lineProbeRunning.value = true;
  window.setTimeout(() => {
    const now = formatLineProbeNow();
    supplyLineRows.value = supplyLineRows.value.map((row) => {
      if (!runIds.has(row.id)) return row;
      const ok = Math.random() > 0.25;
      return {
        ...row,
        lastProbeAt: now,
        probeResult: ok ? "成功" : "失败",
        probeDetail: ok
          ? `HTTP 200 · ${180 + Math.floor(Math.random() * 400)}ms（mock）`
          : "上游超时 / TLS 失败（mock）",
        updatedAt: now,
      };
    });
    persistSupplyLines();
    lineProbeRunning.value = false;
  }, 520);
}

function modelLabelForId(modelId: string): string {
  const row = modelListRows.value.find((x) => x.id === modelId);
  return row ? row.displayName : modelId;
}

function lineProbeBadgeClass(result: string): string {
  if (result === "成功") return "mdl-page__badge mdl-page__badge--ok";
  if (result === "失败") return "mdl-page__badge mdl-page__badge--warn";
  return "mdl-page__badge mdl-page__badge--muted";
}

const masterSelectedId = ref("");
const masterRecords = ref<Record<string, ModelMasterRecord>>({});
const masterFormOpen = ref(false);
const masterFormError = ref("");
const draftMaster = ref<ModelMasterRecord | null>(null);

const masterListRow = computed(
  () => modelListRows.value.find((x) => x.id === masterSelectedId.value) ?? null,
);

const activeMaster = computed(() => {
  const id = masterSelectedId.value;
  if (!id) return null;
  return masterRecords.value[id] ?? null;
});

function loadMasterRecords(): void {
  const map: Record<string, ModelMasterRecord> = {};
  for (const row of modelListRows.value) {
    map[row.id] = buildDefaultModelMaster(row);
  }
  const raw = readModelMasterRecordsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ModelMasterRecord[];
      if (Array.isArray(parsed)) {
        for (const m of parsed) {
          if (!m?.modelId) continue;
          const row = modelListRows.value.find((x) => x.id === m.modelId);
          const base =
            map[m.modelId] ??
            buildDefaultModelMaster(
              row ?? {
                id: m.modelId,
                displayName: m.displayName,
                apiKind: "API₂",
                shelf: "上架",
                routeCount: 0,
                updatedAt: m.updatedAt,
              },
            );
          map[m.modelId] = { ...base, ...m, modelId: m.modelId };
        }
      }
    } catch {
      /* use defaults */
    }
  } else if (modelListRows.value.length > 0) {
    for (const m of MODEL_MASTER_SEEDS) {
      if (modelListRows.value.some((r) => r.id === m.modelId)) map[m.modelId] = { ...m };
    }
    masterRecords.value = map;
    persistMasterRecords();
    return;
  }
  masterRecords.value = map;
}

function persistMasterRecords(): void {
  writeModelMasterRecordsJson(JSON.stringify(Object.values(masterRecords.value)));
}

function ensureMasterForModel(row: ModelListRow): ModelMasterRecord {
  let m = masterRecords.value[row.id];
  if (!m) {
    m = buildDefaultModelMaster(row);
    masterRecords.value[row.id] = m;
  }
  return m;
}

function openMasterEdit(): void {
  const row = masterListRow.value;
  if (!row) return;
  draftMaster.value = JSON.parse(JSON.stringify(ensureMasterForModel(row))) as ModelMasterRecord;
  masterFormError.value = "";
  masterFormOpen.value = true;
}

function closeMasterEdit(): void {
  masterFormOpen.value = false;
  masterFormError.value = "";
  draftMaster.value = null;
}

function saveMasterEdit(): void {
  const d = draftMaster.value;
  if (!d) return;
  if (!d.displayName.trim()) {
    masterFormError.value = "展示名为必填。";
    return;
  }
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  masterRecords.value[d.modelId] = {
    ...d,
    displayName: d.displayName.trim(),
    contextWindow: d.contextWindow.trim(),
    capabilities: d.capabilities.trim(),
    docAnchor: d.docAnchor.trim(),
    api1Vendor: d.api1Vendor.trim(),
    remark: d.remark.trim(),
    updatedAt: now,
    updatedBy: "ops_admin（原型）",
  };
  const idx = modelListRows.value.findIndex((x) => x.id === d.modelId);
  if (idx >= 0) {
    const prev = modelListRows.value[idx];
    if (prev) {
      modelListRows.value[idx] = { ...prev, displayName: d.displayName.trim(), updatedAt: now };
      persistModelListRows();
    }
  }
  persistMasterRecords();
  closeMasterEdit();
}

function onDocKeydown(e: KeyboardEvent): void {
  if (e.key !== "Escape") return;
  if (masterFormOpen.value) {
    e.preventDefault();
    closeMasterEdit();
    return;
  }
  if (modelDangerConfirmOpen.value) {
    e.preventDefault();
    closeModelDangerConfirm();
    return;
  }
  if (modelFormModalOpen.value) {
    e.preventDefault();
    closeModelFormModal();
    return;
  }
  if (pricingFormOpen.value) {
    e.preventDefault();
    closePricingForm();
    return;
  }
  if (pricingDeleteConfirmOpen.value) {
    e.preventDefault();
    closePricingDeleteConfirm();
  }
}

onMounted(() => {
  listFilter.value = readModelListFilter();
  modelSupplierFilter.value = readModelListSupplierFilter();
  loadModelListRows();
  loadMasterRecords();
  loadSupplyLines();
  loadPricingRows();
  lineSupplierFilter.value = readModelLineSupplierFilter();
  const qid = route.query.modelId;
  const stored = readModelMasterSelectedId();
  if (typeof qid === "string" && qid && modelListRows.value.some((x) => x.id === qid)) {
    masterSelectedId.value = qid;
  } else if (stored && modelListRows.value.some((x) => x.id === stored)) {
    masterSelectedId.value = stored;
  } else if (modelListRows.value[0]) {
    masterSelectedId.value = modelListRows.value[0].id;
  }
  document.addEventListener("keydown", onDocKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onDocKeydown);
});

watch(listFilter, (v) => {
  writeModelListFilter(v);
});

watch(modelSupplierFilter, (v) => {
  writeModelListSupplierFilter(v);
});

watch(lineSupplierFilter, (v) => {
  writeModelLineSupplierFilter(v);
});

watch(masterSelectedId, (id) => {
  writeModelMasterSelectedId(id);
  const row = modelListRows.value.find((x) => x.id === id);
  if (row) ensureMasterForModel(row);
});

watch(
  () => route.query.modelId,
  (q) => {
    if (typeof q === "string" && q && modelListRows.value.some((x) => x.id === q)) {
      masterSelectedId.value = q;
    }
  },
);

watch(panel, (p) => {
  if (p !== "master" && p !== "lines" && p !== "pricing") return;
  if (!masterSelectedId.value && modelListRows.value[0]) {
    masterSelectedId.value = modelListRows.value[0].id;
  }
  const row = modelListRows.value.find((x) => x.id === masterSelectedId.value);
  if (row) ensureMasterForModel(row);
});

watch(draftPricingModelId, (modelId) => {
  if (!pricingFormOpen.value || !modelId) return;
  const valid = supplyLineRows.value.some(
    (l) => l.id === draftPricingLineId.value && l.modelId === modelId,
  );
  if (!valid) {
    draftPricingLineId.value =
      supplyLineRows.value.find((l) => l.modelId === modelId)?.id ?? "";
  }
});

const filteredModelList = computed(() => {
  let rows = modelListRows.value;
  const supplier = modelSupplierFilter.value;
  if (supplier) rows = rows.filter((r) => modelHasSupplierLine(r.id, supplier));
  const sf = modelShelfFilter.value;
  if (sf === "on") rows = rows.filter((r) => r.shelf === "上架");
  else if (sf === "off") rows = rows.filter((r) => r.shelf === "下架");
  else if (sf === "gray") rows = rows.filter((r) => r.shelf === "灰度");
  return filterByQuery(rows, listFilter.value, (r) =>
    [r.displayName, r.id, r.apiKind, r.shelf, String(r.routeCount)].join(" "),
  );
});

const filteredSupplyLines = computed(() => {
  let rows = supplyLineRows.value;
  const mid = masterSelectedId.value;
  if (mid) rows = rows.filter((r) => r.modelId === mid);
  const sup = lineSupplierFilter.value;
  if (sup) rows = rows.filter((r) => r.supplier === sup);
  return filterByQuery(rows, lineSearchQ.value, (r) =>
    [
      r.modelId,
      modelLabelForId(r.modelId),
      String(r.priority),
      r.channel,
      r.supplier,
      r.upstreamModelId,
      r.profileRef,
      r.region,
      r.costRef,
      r.probeResult,
      r.probeDetail,
    ].join(" "),
  );
});

const lineFilterHint = computed(() => {
  const parts: string[] = [];
  if (masterListRow.value) {
    parts.push(`逻辑模型 ${masterListRow.value.displayName}（${masterListRow.value.id}）`);
  }
  if (lineSupplierFilter.value) parts.push(`供应商 ${lineSupplierFilter.value}`);
  if (parts.length === 0) return "";
  return `${parts.join(" · ")} · 共 ${filteredSupplyLines.value.length} 条线路`;
});

function resetLineQuery(): void {
  lineSearchQ.value = "";
  lineSupplierFilter.value = "";
}

function resetPricingQuery(): void {
  pricingSearchQ.value = "";
}

const filteredPricingRows = computed(() => {
  let rows = pricingRows.value;
  const mid = masterSelectedId.value;
  if (mid) rows = rows.filter((r) => r.modelId === mid);
  return filterByQuery(rows, pricingSearchQ.value, (r) =>
    [
      r.modelId,
      modelLabelForId(r.modelId),
      r.sku,
      r.supplyLineId,
      pricingLineSupplier(r.supplyLineId),
      pricingLineCostRef(r.supplyLineId),
      r.listPrice,
      r.internalCost,
      r.effectiveFrom,
      r.note,
    ].join(" "),
  );
});

const pricingFilterHint = computed(() => {
  if (!masterListRow.value) return "";
  return `逻辑模型 ${masterListRow.value.displayName}（${masterListRow.value.id}） · 共 ${filteredPricingRows.value.length} 条刊例`;
});

function resetModelListQuery(): void {
  listFilter.value = "";
  modelShelfFilter.value = "all";
  modelSupplierFilter.value = "";
}

function shelfBadgeClass(shelf: string): string {
  if (shelf === "上架") return "mdl-page__badge mdl-page__badge--ok";
  if (shelf === "下架") return "mdl-page__badge mdl-page__badge--muted";
  return "mdl-page__badge mdl-page__badge--warn";
}

const modelListPg = useAdminTablePagination(filteredModelList);
const supplyLinesPg = useAdminTablePagination(filteredSupplyLines);
const pricingPg = useAdminTablePagination(filteredPricingRows);
</script>

<template>
  <div class="mdl-page">
    <!-- 模型列表 -->
    <section v-show="panel === 'list'" class="mdl-page__panel" aria-label="模型列表">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="模型列表">
          <template #annot>
            <AdminInternalTip heading="模型列表 · 原型" explain="模型列表对内说明（原型）">
              <p>
                <strong>供应商筛选</strong>按供应线路 mock 表聚合（非列表字段）。点击<strong>线路数</strong>跳转
                <code>lines?modelId=</code>；供应线路页按模型筛选见 <code>TODO.md</code> MDL-02。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="listFilter"
              :input-id="`${idPrefix}-mdl-search`"
              search-placeholder="展示名 / 平台 ID / 通道…"
              search-aria-label="搜索模型"
              @reset="resetModelListQuery"
            >
              <template #filters>
                <el-select
                  v-model="modelSupplierFilter"
                  placeholder="供应商"
                  filterable
                  clearable
                  aria-label="按供应商筛选模型"
                  style="width: 11rem"
                >
                  <el-option
                    v-for="name in modelSupplierOptions"
                    :key="name"
                    :label="name"
                    :value="name"
                  />
                </el-select>
                <el-select
                  v-model="modelShelfFilter"
                  placeholder="上下架"
                  aria-label="按上下架筛选"
                  style="width: 8rem"
                >
                  <el-option label="全部" value="all" />
                  <el-option label="上架" value="on" />
                  <el-option label="下架" value="off" />
                  <el-option label="灰度" value="gray" />
                </el-select>
              </template>
              <template #actions>
                <input
                  ref="modelImportInputRef"
                  type="file"
                  class="mdl-visually-hidden"
                  accept=".csv,.xlsx,.xls,application/vnd.ms-excel"
                  tabindex="-1"
                  aria-hidden="true"
                  @change="onModelImportFileChange"
                />
                <el-button type="primary" @click="onAddModelClick">新增模型</el-button>
                <el-button @click="triggerModelImport">导入</el-button>
                <el-button @click="onExportModelsClick">导出</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <el-table :data="modelListPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column label="平台模型 ID" min-width="120">
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="mdl-page__mono">{{ scope.row.id }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="displayName" label="展示名" min-width="120" sortable/>
          <el-table-column prop="apiKind" label="通道" min-width="80" sortable/>
          <el-table-column label="上下架" width="100">
            <template #default="scope">
              <template v-if="scope?.row">
              <span :class="shelfBadgeClass(scope.row.shelf)">{{ scope.row.shelf }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="线路数" width="100" sortable prop="routeCount">
            <template #default="scope">
              <template v-if="scope?.row">
                <el-button link type="primary" @click="goModelLines(scope.row)">
                  {{ scope.row.routeCount }}
                </el-button>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新" min-width="130" sortable/>
          <el-table-column label="操作" width="320"fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
              <div class="admin-ep-row-actions">
                <el-button link type="primary" :icon="FolderOpened" @click="goModelMaster(scope.row)">
                  主数据
                </el-button>
                <el-button
                  v-if="scope.row.shelf !== '上架'"
                  link
                  type="primary"
                  :icon="CircleCheck"
                  @click="setModelShelfStatus(scope.row.id, '上架')"
                >
                  上架
                </el-button>
                <el-button
                  v-if="scope.row.shelf !== '下架'"
                  link
                  type="danger"
                  :icon="Bottom"
                  @click="requestModelShelfDown(scope.row)"
                >
                  下架
                </el-button>
                <el-button link type="primary" :icon="Edit" @click="onEditModelClick(scope.row)">编辑</el-button>
                <el-button link type="danger" :icon="Delete" @click="requestDeleteModel(scope.row)">删除</el-button>
              </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <AdminTablePagination
          v-model:current-page="modelListPg.currentPage"
          v-model:page-size="modelListPg.pageSize"
          :total="modelListPg.total"
        />
        <p class="mdl-page__hint">
          列表与新增/编辑写入 <code class="mdl-page__mono">trinity-ai-admin:models-list-rows</code>；搜索
          <code class="mdl-page__mono">models-list-filter</code>、供应商
          <code class="mdl-page__mono">models-list-supplier-filter</code>。点击<strong>线路数</strong>进入供应线路（带
          <code class="mdl-page__mono">modelId</code>）。重置清空搜索、供应商与上下架筛选。
        </p>
      </el-card>
    </section>

    <!-- 主数据 -->
    <section v-show="panel === 'master'" class="mdl-page__panel" aria-label="主数据">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="主数据">
          <template #annot>
            <AdminInternalTip heading="主数据 · 原型" explain="模型主数据对内说明（原型）">
              <p>
                按逻辑模型切换；展示名与列表同步。保存写入
                <code>trinity-ai-admin:models-master-records</code>；列表行「主数据」或
                <code>?modelId=</code> 可深链。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery :show-search="false" @reset="() => {}">
              <template #filters>
                <el-select
                  v-model="masterSelectedId"
                  placeholder="逻辑模型"
                  filterable
                  aria-label="选择逻辑模型"
                  style="width: 16rem"
                >
                  <el-option
                    v-for="row in modelListRows"
                    :key="row.id"
                    :label="`${row.displayName}（${row.id}）`"
                    :value="row.id"
                  />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary" :disabled="!masterListRow" @click="openMasterEdit">编辑主数据</el-button>
                <el-button :disabled="!masterListRow" @click="goModelLines(masterListRow!)">供应线路</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <p v-if="!masterListRow" class="mdl-master__empty">请先在上方选择逻辑模型，或从模型列表进入。</p>

        <template v-else-if="activeMaster && masterListRow">
          <div class="mdl-master__summary">
            <span>
              <strong>{{ activeMaster.displayName }}</strong>
              <span class="mdl-page__mono">（{{ activeMaster.modelId }}）</span>
            </span>
            <ul class="mdl-master__summary-metrics">
              <li>
                <span class="mdl-master__metric-label">通道</span>{{ masterListRow.apiKind }}
              </li>
              <li>
                <span class="mdl-master__metric-label">上下架</span>
                <span :class="shelfBadgeClass(masterListRow.shelf)">{{ masterListRow.shelf }}</span>
              </li>
              <li>
                <span class="mdl-master__metric-label">线路数</span>
                <el-button link type="primary" @click="goModelLines(masterListRow)">{{ masterListRow.routeCount }}</el-button>
              </li>
              <li>
                <span class="mdl-master__metric-label">更新</span>{{ activeMaster.updatedAt }} · {{ activeMaster.updatedBy }}
              </li>
            </ul>
            <span class="admin-ep-row-actions mdl-master__summary-edit">
              <el-button link type="primary" :icon="Edit" @click="openMasterEdit">编辑</el-button>
            </span>
          </div>

          <div class="mdl-master__grid">
            <section class="mdl-master__card" aria-labelledby="mdl-master-base-title">
              <h4 id="mdl-master-base-title" class="mdl-master__card-title">基础与标识</h4>
              <dl class="mdl-master__dl">
                <dt>逻辑模型 ID</dt>
                <dd><span class="mdl-page__mono">{{ activeMaster.modelId }}</span></dd>
                <dt>展示名</dt>
                <dd>{{ activeMaster.displayName }}</dd>
                <dt>上下文长度</dt>
                <dd>{{ activeMaster.contextWindow }}</dd>
                <dt>API₁ 原生研发商</dt>
                <dd>{{ activeMaster.api1Vendor }}</dd>
              </dl>
            </section>
            <section class="mdl-master__card" aria-labelledby="mdl-master-cap-title">
              <h4 id="mdl-master-cap-title" class="mdl-master__card-title">能力与文档</h4>
              <dl class="mdl-master__dl">
                <dt>能力标签</dt>
                <dd>{{ activeMaster.capabilities }}</dd>
                <dt>对外文档锚点</dt>
                <dd><span class="mdl-page__mono">{{ activeMaster.docAnchor }}</span></dd>
                <dt>备注</dt>
                <dd class="mdl-master__remark">{{ activeMaster.remark || "—" }}</dd>
              </dl>
            </section>
          </div>
        </template>

        <p v-else-if="masterListRow" class="mdl-master__empty">
          该模型尚未写入主数据，请点击「编辑主数据」录入。
        </p>

        <p class="mdl-page__hint">
          主数据存 <code class="mdl-page__mono">trinity-ai-admin:models-master-records</code>；当前选中
          <code class="mdl-page__mono">models-master-selected-id</code>。
        </p>
      </el-card>
    </section>

    <!-- 供应线路 -->
    <section v-show="panel === 'lines'" class="mdl-page__panel" aria-label="供应线路">
      <el-card shadow="never" class="admin-ep-card mdl-page__panel">
        <AdminSectionHead toolbar-only>
          <template #annot>
            <AdminInternalTip heading="供应线路 · 原型" explain="供应线路对内说明（原型）">
              <p>
                左：逻辑模型 + 供应商 + 搜索 + 重置；右：<strong>线路探测</strong> 对当前筛选结果 mock 更新。与列表/主数据共用
                <code>modelId</code>；数据存 <code>models-supply-lines</code>。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="lineSearchQ"
              :input-id="`${idPrefix}-mdl-line-q`"
              search-placeholder="通道、供应商、Profile…"
              search-aria-label="检索供应线路"
              @reset="resetLineQuery"
            >
              <template #filters>
                <el-select
                  v-model="masterSelectedId"
                  placeholder="逻辑模型"
                  filterable
                  clearable
                  aria-label="按逻辑模型筛选线路"
                  style="width: 15rem"
                >
                  <el-option
                    v-for="row in modelListRows"
                    :key="row.id"
                    :label="`${row.displayName}（${row.id}）`"
                    :value="row.id"
                  />
                </el-select>
                <el-select
                  v-model="lineSupplierFilter"
                  placeholder="供应商"
                  filterable
                  clearable
                  aria-label="按供应商筛选线路"
                  style="width: 11rem"
                >
                  <el-option
                    v-for="name in modelSupplierOptions"
                    :key="name"
                    :label="name"
                    :value="name"
                  />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary" :loading="lineProbeRunning" @click="runLineProbeNow">
                  线路探测
                </el-button>
                <el-button disabled title="原型二期">调整优先级</el-button>
                <el-button v-if="masterListRow" @click="goModelMaster(masterListRow)">主数据</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <p v-if="lineFilterHint" class="mdl-master__empty mdl-lines__hint">{{ lineFilterHint }}</p>

        <el-table :data="supplyLinesPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column
            v-if="!masterSelectedId"
            label="逻辑模型"
            :min-width="ADMIN_TABLE_COL.md"
            show-overflow-tooltip
          >
            <template #default="scope">
              <template v-if="scope?.row">
                <span>{{ modelLabelForId(scope.row.modelId) }}</span>
                <span class="mdl-page__mono">（{{ scope.row.modelId }}）</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" :width="ADMIN_TABLE_COL.xs" sortable />
          <el-table-column prop="channel" label="通道" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="supplier" label="供应商" :min-width="ADMIN_TABLE_COL.md" sortable />
          <el-table-column label="上游 model_id" :min-width="ADMIN_TABLE_COL.md">
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="mdl-page__mono">{{ scope.row.upstreamModelId }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="Profile" :min-width="ADMIN_TABLE_COL.md" show-overflow-tooltip>
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="mdl-page__mono">{{ scope.row.profileRef }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="region" label="区域" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column label="探测" :width="ADMIN_TABLE_COL.sm">
            <template #default="scope">
              <template v-if="scope?.row">
                <span :class="lineProbeBadgeClass(scope.row.probeResult)">{{ scope.row.probeResult }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="probeDetail"
            label="探测说明"
            :min-width="ADMIN_TABLE_COL_MIN.detail"
            show-overflow-tooltip
          />
          <el-table-column prop="updatedAt" label="更新" :min-width="ADMIN_TABLE_COL.lg" sortable />
          <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.sm"fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
                <div class="admin-ep-row-actions">
                  <el-button
                    link
                    type="primary"
                    :icon="FolderOpened"
                    @click="goModelMasterByModelId(scope.row.modelId)"
                  >
                    主数据
                  </el-button>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <AdminTablePagination
          v-model:current-page="supplyLinesPg.currentPage"
          v-model:page-size="supplyLinesPg.pageSize"
          :total="supplyLinesPg.total"
        />
        <p class="mdl-page__hint">
          线路数据 <code class="mdl-page__mono">trinity-ai-admin:models-supply-lines</code>；探测范围 = 当前逻辑模型 + 供应商 + 搜索筛选结果。重置不清逻辑模型（与列表供应商筛独立）。
        </p>
      </el-card>
    </section>

    <section v-show="panel === 'bindings'" class="mdl-page__panel" aria-label="路由绑定">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="路由绑定">
          <template #annot>
            <AdminInternalTip heading="路由绑定 · 原型" explain="模型路由与平台密钥绑定（§4.2.4）">
              <p>绑定/解绑、优先级与启停；变更前后摘要在工程期展示。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="bindingSearchQ"
              :input-id="`${idPrefix}-mdl-bind-q`"
              search-placeholder="模型、路由、密钥…"
              search-aria-label="检索路由绑定"
            />
          </template>
        </AdminSectionHead>
        <el-table :data="bindingsPg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column prop="modelName" label="模型" min-width="140" sortable />
          <el-table-column prop="routeName" label="路由" min-width="120" sortable />
          <el-table-column prop="platformKeyLabel" label="平台密钥" min-width="120" sortable />
          <el-table-column prop="priority" label="优先级" width="80" sortable />
          <el-table-column label="启停" width="72">
            <template #default="scope">
              <template v-if="scope?.row">{{ scope.row.enabled ? "启用" : "停用" }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新" min-width="130" sortable />
        </el-table>
        <AdminTablePagination
          v-model:current-page="bindingsPg.currentPage"
          v-model:page-size="bindingsPg.pageSize"
          :total="bindingsPg.total"
        />
      </el-card>
    </section>

    <!-- 刊例与成本 -->
    <section v-show="panel === 'pricing'" class="mdl-page__panel" aria-label="刊例与成本">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only>
          <template #annot>
            <AdminInternalTip heading="刊例与成本 · 原型" explain="对外刊例与供应商采购刊例（原型）">
              <p>
                <strong>对外刊例价</strong>：我们对客户的标准价目；<strong>采购成本</strong>：对齐供应商刊例后的内部参考；
                <strong>供应商刊例（线路）</strong>：供应线路上的上游标价（<code>costRef</code>）。按逻辑模型可对比多家供应商。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="pricingSearchQ"
              :input-id="`${idPrefix}-mdl-price-q`"
              search-placeholder="供应商、SKU、对外刊例、采购成本…"
              search-aria-label="检索刊例"
              @reset="resetPricingQuery"
            >
              <template #filters>
                <el-select
                  v-model="masterSelectedId"
                  placeholder="逻辑模型"
                  filterable
                  clearable
                  aria-label="按逻辑模型筛选刊例"
                  style="width: 15rem"
                >
                  <el-option
                    v-for="row in modelListRows"
                    :key="row.id"
                    :label="`${row.displayName}（${row.id}）`"
                    :value="row.id"
                  />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary" @click="onAddPricingClick">新增刊例行</el-button>
                <AdminExportCsvButton
                  :hint="`将导出当前 ${filteredPricingRows.length} 条刊例行（原型占位）；正式版接 §4.13 导出审批。`"
                />
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <p v-if="pricingFilterHint" class="mdl-master__empty mdl-lines__hint">{{ pricingFilterHint }}</p>

        <el-table
          :data="pricingPg.paginatedRows"
          row-key="id"
          class="admin-ep-table-wrap"
          style="width: 100%"
        >
          <el-table-column
            v-if="!masterSelectedId"
            label="逻辑模型"
            :min-width="ADMIN_TABLE_COL.md"
            sortable
            prop="modelId"
            show-overflow-tooltip
          >
            <template #default="scope">
              <template v-if="scope?.row">
                <span>{{ modelLabelForId(scope.row.modelId) }}</span>
                <span class="mdl-page__mono">（{{ scope.row.modelId }}）</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="供应商" :min-width="ADMIN_TABLE_COL.md" sortable prop="supplyLineId">
            <template #default="scope">
              <template v-if="scope?.row">
                <span>{{ pricingLineSupplier(scope.row.supplyLineId) }}</span>
                <el-button
                  link
                  type="primary"
                  class="mdl-page__mono"
                  style="display: block; margin: 0"
                  @click="goPricingSupplyLine(scope.row)"
                >
                  {{ scope.row.supplyLineId }}
                </el-button>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="计费 SKU" :min-width="ADMIN_TABLE_COL.primary" sortable prop="sku">
            <template #default="scope">
              <template v-if="scope?.row">
                <RouterLink :to="{ name: 'tai-admin-billing-sku' }" class="mdl-page__mono">
                  {{ scope.row.sku }}
                </RouterLink>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="listPrice"
            label="对外刊例价"
            :min-width="ADMIN_TABLE_COL.lg"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            label="采购成本"
            :min-width="ADMIN_TABLE_COL.lg"
            sortable
            prop="internalCost"
            show-overflow-tooltip
          >
            <template #default="scope">
              <template v-if="scope?.row">
                <span>{{ scope.row.internalCost }}</span>
                <span
                  v-if="pricingCostMismatch(scope.row)"
                  class="mdl-page__hint"
                  style="display: block; margin: 0"
                >
                  与供应商刊例（线路）「{{ pricingLineCostRef(scope.row.supplyLineId) }}」不一致
                </span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="毛利率（示意）" :min-width="ADMIN_TABLE_COL.sm" sortable>
            <template #default="scope">
              <template v-if="scope?.row">{{ pricingMarginLabel(scope.row) }}</template>
            </template>
          </el-table-column>
          <el-table-column
            prop="effectiveFrom"
            label="生效自"
            :min-width="ADMIN_TABLE_COL.sm"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            label="供应商刊例（线路）"
            :min-width="ADMIN_TABLE_COL.lg"
            sortable
            prop="supplyLineId"
            show-overflow-tooltip
          >
            <template #default="scope">
              <template v-if="scope?.row">
                {{ pricingLineCostRef(scope.row.supplyLineId) || "—" }}
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="note"
            label="备注"
            :min-width="ADMIN_TABLE_COL_MIN.detail"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            label="操作"
            :width="ADMIN_TABLE_COL_OPS.md"
            fixed="right"
          >
            <template #default="scope">
              <template v-if="scope?.row">
                <div class="admin-ep-row-actions" @click.stop>
                  <el-button link type="primary" :icon="Edit" @click="onEditPricingClick(scope.row)">
                    编辑
                  </el-button>
                  <el-button link type="primary" @click="goPricingSupplyLine(scope.row)">供应线路</el-button>
                  <el-button link type="danger" :icon="Delete" @click="requestDeletePricing(scope.row)">
                    删除
                  </el-button>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <AdminTablePagination
          v-model:current-page="pricingPg.currentPage"
          v-model:page-size="pricingPg.pageSize"
          :total="pricingPg.total"
        />
        <p v-if="filteredPricingRows.length === 0" class="mdl-page__hint">无匹配刊例行。</p>
        <p v-else class="mdl-page__hint">
          共 {{ filteredPricingRows.length }} 条 · 持久化
          <code>trinity-ai-admin:models-pricing-rows</code>
        </p>
      </el-card>
    </section>

    <AdminDialog
      v-model="pricingFormOpen"
      :title="pricingFormTitle"
      width="560px"
      head-note="对外刊例价（对客户）与采购成本（对齐供应商刊例）；保存后写入 localStorage。"
    >
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="逻辑模型" required>
          <el-select v-model="draftPricingModelId" filterable placeholder="选择模型" style="width: 100%">
            <el-option
              v-for="row in modelListRows"
              :key="row.id"
              :label="`${row.displayName}（${row.id}）`"
              :value="row.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商线路" required>
          <el-select
            v-model="draftPricingLineId"
            filterable
            placeholder="选择供应商与线路"
            style="width: 100%"
            :disabled="!draftPricingModelId"
          >
            <el-option
              v-for="line in pricingLinesForDraftModel"
              :key="line.id"
              :label="`${line.supplier} · ${line.id} · ${line.channel}`"
              :value="line.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="draftPricingLineId" label="供应商刊例（线路，只读）">
          <el-input :model-value="pricingLineCostRef(draftPricingLineId)" disabled />
        </el-form-item>
        <el-form-item label="计费 SKU" required>
          <el-input v-model="draftPricingSku" placeholder="SKU-G4OM-IN" class="mdl-page__mono" />
        </el-form-item>
        <el-form-item label="对外刊例价（对客户）" required>
          <el-input v-model="draftPricingListPrice" placeholder="¥1.20 / 1M tokens（入）" />
        </el-form-item>
        <el-form-item label="采购成本（对齐供应商刊例）" required>
          <el-input v-model="draftPricingInternalCost" placeholder="¥0.42" />
        </el-form-item>
        <el-form-item label="生效自">
          <el-input v-model="draftPricingEffectiveFrom" placeholder="2026-05-01" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="draftPricingNote" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <p v-if="pricingFormError" class="mdl-int-modal-err">{{ pricingFormError }}</p>
      <template #footer>
        <el-button @click="closePricingForm">取消</el-button>
        <el-button type="primary" @click="savePricingForm">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="pricingDeleteConfirmOpen"
      title="确认删除刊例行"
      width="480px"
      head-note="请再次确认；原型将直接更新 localStorage。"
    >
      <p class="or-keys-editor-banner" role="status">
        确定删除刊例行「{{ pricingDeleteTargetLabel }}」？
      </p>
      <template #footer>
        <el-button @click="closePricingDeleteConfirm">取消</el-button>
        <el-button type="danger" @click="executePricingDeleteConfirm">确认删除</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="masterFormOpen"
      title="编辑主数据"
      width="560px"
      head-note="能力标签、上下文、文档锚点等；展示名保存后同步模型列表。"
    >
      <el-form v-if="draftMaster" label-position="top" class="admin-ep-form">
        <el-form-item label="展示名" required>
          <el-input v-model="draftMaster.displayName" placeholder="租户可见名称" />
        </el-form-item>
        <el-form-item label="上下文长度">
          <el-input v-model="draftMaster.contextWindow" placeholder="如 128k tokens" />
        </el-form-item>
        <el-form-item label="能力标签">
          <el-input v-model="draftMaster.capabilities" placeholder="工具调用 · 流式 · …" />
        </el-form-item>
        <el-form-item label="对外文档锚点">
          <el-input v-model="draftMaster.docAnchor" placeholder="docs/models/…" />
        </el-form-item>
        <el-form-item label="API₁ 原生研发商">
          <el-input v-model="draftMaster.api1Vendor" placeholder="OpenAI（原生契约，API₁）" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="draftMaster.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <p v-if="masterFormError" class="mdl-int-modal-err">{{ masterFormError }}</p>
      <template #footer>
        <el-button @click="closeMasterEdit">取消</el-button>
        <el-button type="primary" @click="saveMasterEdit">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="modelFormModalOpen"
      :title="modelFormTitle"
      width="560px"
      head-note="原型：写入列表与 localStorage；正式版接主数据与审计。"
    >
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="展示名称">
          <el-input :id="`${idPrefix}-mdl-dn`" v-model="draftModelDisplayName" placeholder="租户可见名称" />
        </el-form-item>
        <el-form-item label="平台模型 ID">
          <el-input
            :id="`${idPrefix}-mdl-id`"
            v-model="draftModelId"
            :disabled="modelFormMode === 'edit'"
            :placeholder="modelFormMode === 'edit' ? '编辑时不可改 ID' : '留空则自动生成 lm-时间戳'"
          />
        </el-form-item>
        <el-form-item label="通道类型">
          <el-input :id="`${idPrefix}-mdl-api`" v-model="draftModelApiKind" placeholder="API₁ 或 API₂" />
        </el-form-item>
        <el-form-item label="上下架">
          <el-input :id="`${idPrefix}-mdl-shelf`" v-model="draftModelShelf" placeholder="上架 / 下架 / 灰度" />
        </el-form-item>
        <el-form-item label="绑定线路数">
          <el-input :id="`${idPrefix}-mdl-rc`" v-model="draftModelRouteCount" placeholder="0" />
        </el-form-item>
      </el-form>
      <p v-if="modelFormError" class="mdl-int-modal-err">{{ modelFormError }}</p>
      <template #footer>
        <el-button @click="closeModelFormModal">取消</el-button>
        <el-button type="primary" @click="saveModelForm">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="modelDangerConfirmOpen"
      :title="modelDangerConfirmTitle"
      width="480px"
      head-note="请再次确认；原型将直接更新 localStorage。"
    >
      <p class="or-keys-editor-banner" role="status">{{ modelDangerConfirmMessage }}</p>
      <template #footer>
        <el-button @click="closeModelDangerConfirm">取消</el-button>
        <el-button type="danger" @click="executeModelDangerConfirm">{{ modelDangerConfirmPrimaryLabel }}</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
