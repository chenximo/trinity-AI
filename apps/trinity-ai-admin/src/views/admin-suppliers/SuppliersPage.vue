<script setup lang="ts">
import { Delete, Edit, FolderOpened } from "@element-plus/icons-vue";
import { computed, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminDialog from "../../components/AdminDialog.vue";
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
import "./suppliers.css";
import {
  buildDefaultSupplierGateway,
  buildDefaultSupplierProfile,
  buildDefaultSupplierRotationPolicy,
  DEFAULT_INTEGRATION_BINDINGS,
  SUPPLIER_LIST_ROWS,
  SUPPLIER_PROBE_ROWS,
  SUPPLIER_PANEL_ORDER,
  SUPPLIER_ROTATION_EVENT_SEEDS,
  SUPPLIER_ROTATION_POLICY_SEEDS,
  type IntegrationBindingRow,
  type SupplierProbeRow,
  type SupplierGatewayRecord,
  type SupplierListRow,
  type SupplierPanelId,
  type SupplierProfileRecord,
  type SupplierRotationEventRow,
  type SupplierRotationPolicy,
} from "./mock";
import {
  readIntegrationBindingsJson,
  readProfileSelectedSupplierId,
  readSupplierProbeRowsJson,
  readSupplierRotationJson,
  readSupplierGatewaysJson,
  readSupplierListFilter,
  readSupplierListRowsJson,
  readSupplierProfilesJson,
  writeIntegrationBindingsJson,
  writeProfileSelectedSupplierId,
  writeSupplierProbeRowsJson,
  writeSupplierRotationJson,
  writeSupplierGatewaysJson,
  writeSupplierListFilter,
  writeSupplierListRowsJson,
  writeSupplierProfilesJson,
} from "./suppliersInteractions";

const route = useRoute();
const router = useRouter();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<SupplierPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && SUPPLIER_PANEL_ORDER.includes(id as SupplierPanelId)) return id as SupplierPanelId;
  return "list";
});

const listFilter = ref("");
const supplierStatusFilter = ref<"all" | "ok" | "warn">("all");
const supplierImportInputRef = ref<HTMLInputElement | null>(null);

const supplierListRows = ref<SupplierListRow[]>([]);
const supplierFormModalOpen = ref(false);
const supplierFormMode = ref<"add" | "edit">("add");
const supplierEditingId = ref<string | null>(null);
const supplierFormError = ref("");
const draftSupplierId = ref("");
const draftSupplierName = ref("");
const draftSupplierType = ref("");
const draftSupplierRegion = ref("");
const draftSupplierStatus = ref("正常");
const draftSupplierHealth = ref("—");

const supplierFormTitle = computed(() =>
  supplierFormMode.value === "edit" ? "编辑供应商" : "新增供应商"
);

const dangerConfirmOpen = ref(false);
const dangerKind = ref<"none" | "delete-supplier" | "delete-integration">("none");
const dangerTargetId = ref<string | null>(null);
const dangerTargetLabel = ref("");

const dangerConfirmTitle = computed(() => {
  if (dangerKind.value === "delete-supplier") return "确认删除供应商";
  if (dangerKind.value === "delete-integration") return "确认删除对接配置";
  return "确认操作";
});

const dangerConfirmPrimaryLabel = computed(() => "确认删除");

const dangerConfirmMessage = computed(() => {
  const label = dangerTargetLabel.value;
  if (dangerKind.value === "delete-supplier") {
    return `确定删除供应商「${label}」？原型将同步更新 localStorage。`;
  }
  if (dangerKind.value === "delete-integration") {
    return `确定删除对接配置「${label}」？整行输入/输出模板将一并删除，并同步 localStorage。`;
  }
  return "";
});

function normalizeSupplierListRow(raw: Partial<SupplierListRow> & Pick<SupplierListRow, "id">): SupplierListRow {
  const seed = SUPPLIER_LIST_ROWS.find((x) => x.id === raw.id);
  return {
    id: raw.id,
    name: String(raw.name ?? seed?.name ?? ""),
    type: String(raw.type ?? seed?.type ?? ""),
    status: String(raw.status ?? seed?.status ?? "正常"),
    health: String(raw.health ?? seed?.health ?? "—"),
    region: String(raw.region ?? seed?.region ?? ""),
    modelCount:
      typeof raw.modelCount === "number" && Number.isFinite(raw.modelCount)
        ? raw.modelCount
        : (seed?.modelCount ?? 0),
    routeCount:
      typeof raw.routeCount === "number" && Number.isFinite(raw.routeCount)
        ? raw.routeCount
        : (seed?.routeCount ?? 0),
    updatedAt: String(raw.updatedAt ?? seed?.updatedAt ?? ""),
  };
}

function loadSupplierListRows(): void {
  const raw = readSupplierListRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        supplierListRows.value = (parsed as Partial<SupplierListRow>[]).map((row) =>
          normalizeSupplierListRow(row as Partial<SupplierListRow> & Pick<SupplierListRow, "id">),
        );
        return;
      }
    } catch {
      /* use default */
    }
  }
  supplierListRows.value = JSON.parse(JSON.stringify(SUPPLIER_LIST_ROWS)) as SupplierListRow[];
}

function persistSupplierListRows(): void {
  writeSupplierListRowsJson(JSON.stringify(supplierListRows.value));
}

function onAddSupplierClick(): void {
  supplierFormMode.value = "add";
  supplierEditingId.value = null;
  supplierFormError.value = "";
  draftSupplierId.value = "";
  draftSupplierName.value = "";
  draftSupplierType.value = "";
  draftSupplierRegion.value = "";
  draftSupplierStatus.value = "正常";
  draftSupplierHealth.value = "—";
  supplierFormModalOpen.value = true;
}

function closeSupplierFormModal(): void {
  supplierFormModalOpen.value = false;
  supplierFormError.value = "";
  supplierEditingId.value = null;
}

function saveSupplierForm(): void {
  supplierFormError.value = "";
  const name = draftSupplierName.value.trim();
  const type = draftSupplierType.value.trim();
  const region = draftSupplierRegion.value.trim();
  if (!name || !type || !region) {
    supplierFormError.value = "名称、类型、区域均为必填。";
    return;
  }
  let status = draftSupplierStatus.value.trim();
  if (!status) status = "正常";
  let health = draftSupplierHealth.value.trim();
  if (!health) health = "—";
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  if (supplierFormMode.value === "edit" && supplierEditingId.value) {
    const idx = supplierListRows.value.findIndex((x) => x.id === supplierEditingId.value);
    if (idx < 0) {
      supplierFormError.value = "未找到该行，可能已被删除。";
      return;
    }
    const prev = supplierListRows.value[idx];
    if (!prev) return;
    supplierListRows.value[idx] = {
      ...prev,
      name,
      type,
      status,
      health,
      region,
      updatedAt: now,
    };
  } else {
    const newId = `sp-${Date.now()}`;
    const newRow: SupplierListRow = {
      id: newId,
      name,
      type,
      status,
      health,
      region,
      modelCount: 0,
      routeCount: 0,
      updatedAt: now,
    };
    supplierListRows.value.push(newRow);
    profileRecords.value[newId] = buildDefaultSupplierProfile(newRow);
    persistProfileRecords();
  }
  persistSupplierListRows();
  closeSupplierFormModal();
}

function onEditSupplierClick(row: SupplierListRow): void {
  supplierFormMode.value = "edit";
  supplierEditingId.value = row.id;
  supplierFormError.value = "";
  draftSupplierId.value = row.id;
  draftSupplierName.value = row.name;
  draftSupplierType.value = row.type;
  draftSupplierRegion.value = row.region;
  draftSupplierStatus.value = row.status;
  draftSupplierHealth.value = row.health;
  supplierFormModalOpen.value = true;
}

function requestDeleteSupplier(row: SupplierListRow): void {
  dangerKind.value = "delete-supplier";
  dangerTargetId.value = row.id;
  dangerTargetLabel.value = `${row.name}（${row.id}）`;
  dangerConfirmOpen.value = true;
}

function closeDangerConfirm(): void {
  dangerConfirmOpen.value = false;
  dangerKind.value = "none";
  dangerTargetId.value = null;
  dangerTargetLabel.value = "";
}

function executeSupplierDangerConfirm(): void {
  const id = dangerTargetId.value;
  if (!id || dangerKind.value === "none") {
    closeDangerConfirm();
    return;
  }
  if (dangerKind.value === "delete-supplier") {
    supplierListRows.value = supplierListRows.value.filter((x) => x.id !== id);
    delete profileRecords.value[id];
    delete gatewayRecords.value[id];
    if (profileSelectedId.value === id) {
      profileSelectedId.value = supplierListRows.value[0]?.id ?? "";
      writeProfileSelectedSupplierId(profileSelectedId.value);
    }
    delete rotationPolicies.value[id];
    rotationEvents.value = rotationEvents.value.filter((e) => e.supplierId !== id);
    persistProfileRecords();
    persistGatewayRecords();
    persistRotationData();
    persistSupplierListRows();
  } else if (dangerKind.value === "delete-integration") {
    integrationRows.value = integrationRows.value.filter((x) => x.id !== id);
    persistIntegrationRows();
  }
  closeDangerConfirm();
}

function triggerSupplierImport(): void {
  supplierImportInputRef.value?.click();
}

function onSupplierImportFileChange(e: Event): void {
  const el = e.target as HTMLInputElement;
  const f = el.files?.[0];
  if (f) window.alert(`原型：已选择导入文件「${f.name}」（未解析）`);
  el.value = "";
}

function onExportSuppliersClick(): void {
  window.alert("原型：将导出当前筛选结果为 CSV（未实现）。");
}

function goSupplierProfile(row: SupplierListRow): void {
  profileSelectedId.value = row.id;
  ensureProfileForSupplier(row);
  router.push({ name: "tai-admin-suppliers-profile", query: { supplierId: row.id } });
}

const profileRecords = ref<Record<string, SupplierProfileRecord>>({});
const profileSelectedId = ref("");
/** AdminListQuery 占位（档案页无关键词检索） */
const profileToolbarSearchQ = ref("");

const profileSupplier = computed(() =>
  supplierListRows.value.find((x) => x.id === profileSelectedId.value) ?? null,
);

const activeProfile = computed(() => {
  const id = profileSelectedId.value;
  if (!id) return null;
  return profileRecords.value[id] ?? null;
});

function loadProfileRecords(): void {
  const map: Record<string, SupplierProfileRecord> = {};
  for (const row of supplierListRows.value) {
    map[row.id] = buildDefaultSupplierProfile(row);
  }
  const raw = readSupplierProfilesJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SupplierProfileRecord[];
      if (Array.isArray(parsed)) {
        for (const p of parsed) {
          if (!p?.supplierId) continue;
          const base = map[p.supplierId] ?? buildDefaultSupplierProfile({ id: p.supplierId, name: p.legalName, type: "" });
          map[p.supplierId] = { ...base, ...p, supplierId: p.supplierId };
        }
      }
    } catch {
      /* use defaults */
    }
  }
  profileRecords.value = map;
}

function persistProfileRecords(): void {
  writeSupplierProfilesJson(JSON.stringify(Object.values(profileRecords.value)));
}

function ensureProfileForSupplier(row: SupplierListRow): SupplierProfileRecord {
  let p = profileRecords.value[row.id];
  if (!p) {
    p = buildDefaultSupplierProfile(row);
    profileRecords.value[row.id] = p;
  }
  return p;
}

const profileFormOpen = ref(false);
const profileFormError = ref("");
const draftProfile = ref<SupplierProfileRecord | null>(null);

function openProfileEdit(): void {
  const row = profileSupplier.value;
  if (!row) return;
  draftProfile.value = JSON.parse(JSON.stringify(ensureProfileForSupplier(row))) as SupplierProfileRecord;
  profileFormError.value = "";
  profileFormOpen.value = true;
}

function closeProfileEdit(): void {
  profileFormOpen.value = false;
  profileFormError.value = "";
  draftProfile.value = null;
}

function saveProfileEdit(): void {
  const d = draftProfile.value;
  if (!d) return;
  if (!d.legalName.trim()) {
    profileFormError.value = "法人主体为必填。";
    return;
  }
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  profileRecords.value[d.supplierId] = {
    ...d,
    legalName: d.legalName.trim(),
    taxId: d.taxId.trim(),
    billingCycle: d.billingCycle.trim(),
    paymentTerms: d.paymentTerms.trim(),
    bankName: d.bankName.trim(),
    bankAccountMasked: d.bankAccountMasked.trim(),
    contactName: d.contactName.trim(),
    contactEmail: d.contactEmail.trim(),
    contactPhone: d.contactPhone.trim(),
    meteringUnit: d.meteringUnit.trim(),
    contractRef: d.contractRef.trim(),
    remark: d.remark.trim(),
    updatedAt: now,
    updatedBy: "ops_admin（原型）",
  };
  persistProfileRecords();
  closeProfileEdit();
}

function goSupplierSubRoute(routeName: string): void {
  const q = profileSelectedId.value ? { supplierId: profileSelectedId.value } : {};
  router.push({ name: routeName, query: q });
}

const gatewayRecords = ref<Record<string, SupplierGatewayRecord>>({});

const activeGateway = computed(() => {
  const id = profileSelectedId.value;
  if (!id) return null;
  return gatewayRecords.value[id] ?? null;
});

const hasActiveGateway = computed(() => !!activeGateway.value);

function loadGatewayRecords(): void {
  const map: Record<string, SupplierGatewayRecord> = {};
  const raw = readSupplierGatewaysJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SupplierGatewayRecord[];
      if (Array.isArray(parsed)) {
        for (const g of parsed) {
          if (!g?.supplierId) continue;
          map[g.supplierId] = { ...g, supplierId: g.supplierId };
        }
      }
    } catch {
      /* empty */
    }
  }
  gatewayRecords.value = map;
}

function persistGatewayRecords(): void {
  writeSupplierGatewaysJson(JSON.stringify(Object.values(gatewayRecords.value)));
}

const gatewayFormOpen = ref(false);
const gatewayFormMode = ref<"add" | "edit">("add");
const gatewayFormError = ref("");
const draftGateway = ref<SupplierGatewayRecord | null>(null);

const gatewayDialogTitle = computed(() =>
  gatewayFormMode.value === "add" ? "添加网关对接参数" : "编辑网关对接参数",
);

const gatewayDialogHeadNote = computed(() =>
  gatewayFormMode.value === "add"
    ? "每家供应商仅一套网关默认参数。表单预填来自 mock 模板，保存后写入 localStorage（工程期改接供应商 gateway API）。"
    : "修改后覆盖该供应商已保存的网关参数；Profile/JSON 真源仍在契约中心。",
);

function openGatewayAdd(): void {
  const row = profileSupplier.value;
  if (!row) return;
  gatewayFormMode.value = "add";
  draftGateway.value = buildDefaultSupplierGateway(row);
  gatewayFormError.value = "";
  gatewayFormOpen.value = true;
}

function openGatewayEdit(): void {
  const row = profileSupplier.value;
  if (!row) return;
  const existing = gatewayRecords.value[row.id];
  if (!existing) {
    openGatewayAdd();
    return;
  }
  gatewayFormMode.value = "edit";
  draftGateway.value = JSON.parse(JSON.stringify(existing)) as SupplierGatewayRecord;
  gatewayFormError.value = "";
  gatewayFormOpen.value = true;
}

function closeGatewayEdit(): void {
  gatewayFormOpen.value = false;
  gatewayFormError.value = "";
  draftGateway.value = null;
  gatewayFormMode.value = "add";
}

function saveGatewayEdit(): void {
  const d = draftGateway.value;
  if (!d) return;
  if (!d.baseUrl.trim() || !d.profileRef.trim()) {
    gatewayFormError.value = "Base URL 与 Profile 引用为必填。";
    return;
  }
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  gatewayRecords.value[d.supplierId] = {
    ...d,
    apiKind: d.apiKind.trim(),
    baseUrl: d.baseUrl.trim(),
    profileRef: d.profileRef.trim(),
    jsonRef: d.jsonRef.trim(),
    timeoutMs: Number(d.timeoutMs) || 45000,
    retryDefault: d.retryDefault.trim(),
    updatedAt: now,
    updatedBy: "ops_admin（原型）",
  };
  persistGatewayRecords();
  closeGatewayEdit();
}

const integrationRows = ref<IntegrationBindingRow[]>([]);
const integrationSearchQuery = ref("");
const integrationScopeFilter = ref<"all" | "chat" | "emb">("all");
const probeRows = ref<SupplierProbeRow[]>([]);
const probeSearchQ = ref("");
const probeResultFilter = ref("");
const probeRunning = ref(false);

function migrateProbeRow(row: SupplierProbeRow): SupplierProbeRow {
  if (row.supplierId) return row;
  const t = row.target ?? "";
  if (t.includes("腾讯")) return { ...row, supplierId: "sp-001" };
  if (t.includes("火山")) return { ...row, supplierId: "sp-002" };
  if (t.includes("OpenAI")) return { ...row, supplierId: "sp-003" };
  return { ...row, supplierId: "sp-001" };
}

function loadProbeRows(): void {
  const raw = readSupplierProbeRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        probeRows.value = (parsed as SupplierProbeRow[]).map((row) => migrateProbeRow(row));
        return;
      }
    } catch {
      /* use default */
    }
  }
  probeRows.value = JSON.parse(JSON.stringify(SUPPLIER_PROBE_ROWS)) as SupplierProbeRow[];
}

function persistProbeRows(): void {
  writeSupplierProbeRowsJson(JSON.stringify(probeRows.value));
}

function formatProbeNow(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function runProbeNow(): void {
  const runIds = new Set(filteredProbeRows.value.map((r) => r.id));
  if (runIds.size === 0) {
    window.alert(
      profileSelectedId.value
        ? "当前供应商下无匹配拨测任务，请调整筛选或先在列表确认该供应商有线路。"
        : "当前筛选下无拨测任务，请调整搜索或结果筛选。",
    );
    return;
  }
  probeRunning.value = true;
  window.setTimeout(() => {
    const now = formatProbeNow();
    probeRows.value = probeRows.value.map((row) => {
      if (!runIds.has(row.id)) return row;
      const ok = Math.random() > 0.28;
      return {
        ...row,
        lastRun: now,
        result: ok ? "成功" : "失败",
        latency: ok ? `${180 + Math.floor(Math.random() * 520)}ms` : "—",
        detail: ok
          ? `HTTP 200 · TLS 握手 ${18 + Math.floor(Math.random() * 60)}ms（mock 即时拨测）`
          : `HTTP 504 · 上游超时（mock 即时拨测）`,
      };
    });
    persistProbeRows();
    probeRunning.value = false;
  }, 520);
}

const rotationPolicies = ref<Record<string, SupplierRotationPolicy>>({});
const rotationEvents = ref<SupplierRotationEventRow[]>([]);
const rotationSearchQ = ref("");
const rotationStatusFilter = ref("");
const rotationFormOpen = ref(false);
const rotationFormError = ref("");
const draftRotation = ref<SupplierRotationPolicy | null>(null);

function loadRotationData(): void {
  const policies: Record<string, SupplierRotationPolicy> = {};
  let events: SupplierRotationEventRow[] = [];
  const raw = readSupplierRotationJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as {
        policies?: SupplierRotationPolicy[];
        events?: SupplierRotationEventRow[];
      };
      for (const p of parsed.policies ?? []) {
        if (p?.supplierId) policies[p.supplierId] = p;
      }
      if (Array.isArray(parsed.events)) events = parsed.events;
    } catch {
      /* use default */
    }
  }
  if (Object.keys(policies).length === 0) {
    for (const p of SUPPLIER_ROTATION_POLICY_SEEDS) policies[p.supplierId] = { ...p };
    events = JSON.parse(JSON.stringify(SUPPLIER_ROTATION_EVENT_SEEDS)) as SupplierRotationEventRow[];
    rotationPolicies.value = policies;
    rotationEvents.value = events;
    persistRotationData();
    return;
  }
  rotationPolicies.value = policies;
  rotationEvents.value = events;
}

function persistRotationData(): void {
  writeSupplierRotationJson(
    JSON.stringify({
      policies: Object.values(rotationPolicies.value),
      events: rotationEvents.value,
    }),
  );
}

function ensureRotationPolicy(row: SupplierListRow): SupplierRotationPolicy {
  let p = rotationPolicies.value[row.id];
  if (!p) {
    p = buildDefaultSupplierRotationPolicy(row);
    rotationPolicies.value[row.id] = p;
  }
  return p;
}

const activeRotationPolicy = computed(() => {
  const id = profileSelectedId.value;
  if (!id) return null;
  return rotationPolicies.value[id] ?? null;
});

function openRotationEdit(): void {
  const row = profileSupplier.value;
  if (!row) return;
  draftRotation.value = JSON.parse(JSON.stringify(ensureRotationPolicy(row))) as SupplierRotationPolicy;
  rotationFormError.value = "";
  rotationFormOpen.value = true;
}

function closeRotationEdit(): void {
  rotationFormOpen.value = false;
  rotationFormError.value = "";
  draftRotation.value = null;
}

function saveRotationEdit(): void {
  const d = draftRotation.value;
  if (!d) return;
  if (!d.owner.trim() || !d.nextWindow.trim()) {
    rotationFormError.value = "负责人与下一窗口为必填。";
    return;
  }
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  rotationPolicies.value[d.supplierId] = {
    ...d,
    rotationDays: Number(d.rotationDays) || 90,
    dualKeyWindowHours: Number(d.dualKeyWindowHours) || 24,
    notifyChannels: d.notifyChannels.trim(),
    kmsMode: d.kmsMode.trim(),
    owner: d.owner.trim(),
    nextWindow: d.nextWindow.trim(),
    remark: d.remark.trim(),
    updatedAt: now,
    updatedBy: "ops_admin（原型）",
  };
  persistRotationData();
  closeRotationEdit();
}

function rotationStatusBadgeClass(status: string): string {
  if (status === "已完成") return "sup-page__badge sup-page__badge--ok";
  if (status === "进行中") return "sup-page__badge sup-page__badge--warn";
  if (status === "已跳过") return "sup-page__badge sup-page__badge--muted";
  return "sup-page__badge";
}

const modalOpen = ref(false);
const modalTab = ref<"input" | "output">("input");
/** 对接配置区：输入/输出模板列表 Tab（与弹窗内 Tab 独立） */
const integrationListTab = ref<"input" | "output">("input");
const editingId = ref<string | null>(null);
const draftConfigName = ref("");
const draftInputName = ref("");
const draftInputJson = ref("");
const draftOutputName = ref("");
const draftOutputJson = ref("");
const modalError = ref("");

function loadIntegrationRows(): void {
  const raw = readIntegrationBindingsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        integrationRows.value = parsed as IntegrationBindingRow[];
        return;
      }
    } catch {
      /* use default */
    }
  }
  integrationRows.value = JSON.parse(JSON.stringify(DEFAULT_INTEGRATION_BINDINGS)) as IntegrationBindingRow[];
}

function persistIntegrationRows(): void {
  writeIntegrationBindingsJson(JSON.stringify(integrationRows.value));
}

function jsonPreview(s: string, max = 52): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "—";
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function closeIntegrationModal(): void {
  modalOpen.value = false;
  modalError.value = "";
}

function openAddIntegration(): void {
  integrationListTab.value = "input";
  editingId.value = null;
  modalTab.value = "input";
  draftConfigName.value = "";
  draftInputName.value = "";
  draftInputJson.value = "{\n  \n}";
  draftOutputName.value = "";
  draftOutputJson.value = "{\n  \n}";
  modalError.value = "";
  modalOpen.value = true;
}

function openEditIntegration(row: IntegrationBindingRow, tab: "input" | "output"): void {
  integrationListTab.value = tab;
  editingId.value = row.id;
  modalTab.value = tab;
  draftConfigName.value = row.configName;
  draftInputName.value = row.inputName;
  draftInputJson.value = row.inputJson;
  draftOutputName.value = row.outputName;
  draftOutputJson.value = row.outputJson;
  modalError.value = "";
  modalOpen.value = true;
}

function saveIntegrationModal(): void {
  modalError.value = "";
  const cfg = draftConfigName.value.trim();
  if (!cfg) {
    modalError.value = "请填写配置名称。";
    return;
  }
  const inName = draftInputName.value.trim();
  const outName = draftOutputName.value.trim();
  if (!inName || !outName) {
    modalError.value = "输入模板名称与输出模板名称均需填写。";
    return;
  }
  try {
    JSON.parse(draftInputJson.value);
    JSON.parse(draftOutputJson.value);
  } catch {
    modalError.value = "「输入 JSON」「输出 JSON」须为合法 JSON。";
    return;
  }
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  if (editingId.value) {
    const idx = integrationRows.value.findIndex((x) => x.id === editingId.value);
    if (idx >= 0) {
      const prev = integrationRows.value[idx];
      if (prev) {
        integrationRows.value[idx] = {
          ...prev,
          configName: cfg,
          inputName: inName,
          inputJson: draftInputJson.value,
          outputName: outName,
          outputJson: draftOutputJson.value,
          updatedAt: now,
        };
      }
    }
  } else {
    integrationRows.value.push({
      id: `ib-${Date.now()}`,
      configName: cfg,
      inputName: inName,
      inputJson: draftInputJson.value,
      outputName: outName,
      outputJson: draftOutputJson.value,
      updatedAt: now,
    });
  }
  persistIntegrationRows();
  closeIntegrationModal();
}

function requestDeleteIntegration(row: IntegrationBindingRow): void {
  dangerKind.value = "delete-integration";
  dangerTargetId.value = row.id;
  dangerTargetLabel.value = row.configName;
  dangerConfirmOpen.value = true;
}

function onDocKeydown(e: KeyboardEvent): void {
  if (e.key !== "Escape") return;
  if (dangerConfirmOpen.value) {
    e.preventDefault();
    closeDangerConfirm();
    return;
  }
  if (modalOpen.value) {
    e.preventDefault();
    closeIntegrationModal();
    return;
  }
  if (rotationFormOpen.value) {
    e.preventDefault();
    closeRotationEdit();
    return;
  }
  if (gatewayFormOpen.value) {
    e.preventDefault();
    closeGatewayEdit();
    return;
  }
  if (profileFormOpen.value) {
    e.preventDefault();
    closeProfileEdit();
    return;
  }
  if (supplierFormModalOpen.value) {
    e.preventDefault();
    closeSupplierFormModal();
  }
}

onMounted(() => {
  listFilter.value = readSupplierListFilter();
  loadSupplierListRows();
  loadProfileRecords();
  loadGatewayRecords();
  const qid = route.query.supplierId;
  const stored = readProfileSelectedSupplierId();
  if (typeof qid === "string" && qid) profileSelectedId.value = qid;
  else if (stored) profileSelectedId.value = stored;
  else if (supplierListRows.value[0]) profileSelectedId.value = supplierListRows.value[0].id;
  if (profileSelectedId.value) {
    const row = supplierListRows.value.find((x) => x.id === profileSelectedId.value);
    if (row) ensureProfileForSupplier(row);
  }
  loadIntegrationRows();
  loadProbeRows();
  loadRotationData();
  document.addEventListener("keydown", onDocKeydown);
});

watch(profileSelectedId, (id) => {
  writeProfileSelectedSupplierId(id);
  const row = supplierListRows.value.find((x) => x.id === id);
  if (row) ensureProfileForSupplier(row);
});

watch(
  () => route.query.supplierId,
  (q) => {
    if (typeof q === "string" && q && supplierListRows.value.some((x) => x.id === q)) {
      profileSelectedId.value = q;
    }
  },
);

watch(panel, (p) => {
  if (p !== "profile" && p !== "integration" && p !== "probe" && p !== "key-rotation") return;
  if (!profileSelectedId.value && supplierListRows.value[0]) {
    profileSelectedId.value = supplierListRows.value[0].id;
  }
  const row = supplierListRows.value.find((x) => x.id === profileSelectedId.value);
  if (row) ensureProfileForSupplier(row);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onDocKeydown);
});

watch(listFilter, (v) => {
  writeSupplierListFilter(v);
});

const filteredList = computed(() => {
  let rows = supplierListRows.value;
  const st = supplierStatusFilter.value;
  if (st === "ok") rows = rows.filter((r) => r.status === "正常");
  else if (st === "warn") rows = rows.filter((r) => r.status !== "正常");
  return filterByQuery(rows, listFilter.value, (r) =>
    [r.name, r.id, r.type, r.region, r.health, String(r.modelCount), String(r.routeCount)].join(" "),
  );
});

const filteredIntegrationRows = computed(() => {
  let rows = integrationRows.value;
  const sc = integrationScopeFilter.value;
  if (sc === "chat") {
    rows = rows.filter(
      (r) =>
        r.configName.toLowerCase().includes("chat") ||
        r.inputJson.toLowerCase().includes("chat") ||
        r.outputJson.toLowerCase().includes("chat"),
    );
  } else if (sc === "emb") {
    rows = rows.filter(
      (r) =>
        r.configName.toLowerCase().includes("embed") ||
        r.inputJson.toLowerCase().includes("embed") ||
        r.outputJson.toLowerCase().includes("embed"),
    );
  }
  return filterByQuery(rows, integrationSearchQuery.value, (r) =>
    [r.configName, r.inputName, r.outputName, r.inputJson, r.outputJson, r.updatedAt].join(" "),
  );
});

const filteredProbeRows = computed(() => {
  let rows = probeRows.value;
  const sid = profileSelectedId.value;
  if (sid) rows = rows.filter((r) => r.supplierId === sid);
  if (probeResultFilter.value) rows = rows.filter((r) => r.result === probeResultFilter.value);
  return filterByQuery(rows, probeSearchQ.value, (r) =>
    [r.id, r.target, r.lastRun, r.latency, r.result, r.detail].join(" "),
  );
});

const probeFilterHint = computed(() => {
  if (!profileSupplier.value) return "";
  const n = filteredProbeRows.value.length;
  return `当前供应商 ${profileSupplier.value.name}（${profileSupplier.value.id}）· 共 ${n} 条任务`;
});

const filteredRotationEvents = computed(() => {
  let rows = rotationEvents.value;
  const sid = profileSelectedId.value;
  if (sid) rows = rows.filter((r) => r.supplierId === sid);
  if (rotationStatusFilter.value) rows = rows.filter((r) => r.status === rotationStatusFilter.value);
  return filterByQuery(rows, rotationSearchQ.value, (r) =>
    [r.windowLabel, r.scheduledAt, r.status, r.platformKeyRef, r.detail].join(" "),
  );
});

const rotationFilterHint = computed(() => {
  if (!profileSupplier.value) return "";
  const n = filteredRotationEvents.value.length;
  return `当前供应商 ${profileSupplier.value.name}（${profileSupplier.value.id}）· 共 ${n} 条轮换记录`;
});

const rotationPg = useAdminTablePagination(filteredRotationEvents);

function resetRotationQuery(): void {
  rotationSearchQ.value = "";
  rotationStatusFilter.value = "";
}

function resetSupplierListQuery(): void {
  listFilter.value = "";
  supplierStatusFilter.value = "all";
}

function resetIntegrationQuery(): void {
  integrationSearchQuery.value = "";
  integrationScopeFilter.value = "all";
}

function resetProbeQuery(): void {
  probeSearchQ.value = "";
  probeResultFilter.value = "";
}

const integrationDialogTitle = computed(() => (editingId.value ? "编辑对接配置" : "新增对接配置"));

const listPg = useAdminTablePagination(filteredList);
const integrationPg = useAdminTablePagination(filteredIntegrationRows);
const probePg = useAdminTablePagination(filteredProbeRows);
</script>

<template>
  <div class="sup-page">
    <!-- 供应商列表 -->
    <section v-show="panel === 'list'" class="sup-page__panel" aria-label="供应商列表">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="供应商列表">
          <template #annot>
            <AdminInternalTip heading="供应商列表 · 原型" explain="供应商列表对内说明（原型）">
              <p>列表与筛选为 mock；导入/导出示意，工程期接主数据与审批。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="listFilter"
              :input-id="`${idPrefix}-sp-search`"
              search-placeholder="名称 / ID / 类型 / 区域 / 模型数…"
              search-aria-label="搜索供应商"
              @reset="resetSupplierListQuery"
            >
              <template #filters>
                <el-select
                  v-model="supplierStatusFilter"
                  placeholder="状态"
                  aria-label="按状态筛选"
                  style="width: 9rem"
                >
                  <el-option label="全部状态" value="all" />
                  <el-option label="仅正常" value="ok" />
                  <el-option label="仅异常/降级" value="warn" />
                </el-select>
              </template>
              <template #actions>
                <input
                  ref="supplierImportInputRef"
                  type="file"
                  class="sup-visually-hidden"
                  accept=".csv,.xlsx,.xls,application/vnd.ms-excel"
                  tabindex="-1"
                  aria-hidden="true"
                  @change="onSupplierImportFileChange"
                />
                <el-button type="primary" @click="onAddSupplierClick">新增供应商</el-button>
                <el-button @click="triggerSupplierImport">导入</el-button>
                <el-button @click="onExportSuppliersClick">导出</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <el-table :data="listPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column label="ID" :min-width="ADMIN_TABLE_COL.md">
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="sup-page__mono">{{ scope.row.id }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" :min-width="ADMIN_TABLE_COL.primary" sortable />
          <el-table-column prop="type" label="类型" :min-width="ADMIN_TABLE_COL.md" sortable />
          <el-table-column label="状态" :min-width="ADMIN_TABLE_COL.xs">
            <template #default="scope">
              <template v-if="scope?.row">
              <span
                class="sup-page__badge"
                :class="scope.row.status === '正常' ? 'sup-page__badge--ok' : 'sup-page__badge--warn'"
              >
                {{ scope.row.status }}
              </span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="modelCount" label="模型数" :min-width="ADMIN_TABLE_COL.xs" sortable />
          <el-table-column prop="routeCount" label="路由数" :min-width="ADMIN_TABLE_COL.xs" sortable />
          <el-table-column prop="health" label="健康" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="region" label="区域" :min-width="ADMIN_TABLE_COL.md" sortable />
          <el-table-column prop="updatedAt" label="更新" :min-width="ADMIN_TABLE_COL.lg" sortable />
          <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg"fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
              <div class="admin-ep-row-actions" @click.stop>
                <el-button link type="primary" :icon="FolderOpened" @click="goSupplierProfile(scope.row)">
                  档案
                </el-button>
                <el-button link type="primary" :icon="Edit" @click="onEditSupplierClick(scope.row)">编辑</el-button>
                <el-button link type="danger" :icon="Delete" @click="requestDeleteSupplier(scope.row)">删除</el-button>
              </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <AdminTablePagination
          v-model:current-page="listPg.currentPage"
          v-model:page-size="listPg.pageSize"
          :total="listPg.total"
        />
        <p class="sup-page__hint">
          列表数据与新增/编辑写入 <code class="sup-page__mono">localStorage</code>（键 <code class="sup-page__mono">trinity-ai-admin:suppliers-list-rows</code>）；搜索关键字另存；状态为前端即时过滤；导入/导出为原型占位；编辑为 Element Plus 表单弹窗；<strong>删除</strong>经二次确认。
        </p>
      </el-card>
    </section>

    <!-- 档案与结算 -->
    <section v-show="panel === 'profile'" class="sup-page__panel" aria-label="档案与结算">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="档案与结算">
          <template #annot>
            <AdminInternalTip heading="档案与结算 · 原型" explain="供应商档案与结算说明（原型）">
              <p>
                按<strong>供应商</strong>维护法人主体、结算与付款、对账计量单位；与列表主数据分离。数据存
                <code>trinity-ai-admin:suppliers-profiles</code>；工程期接主数据 API 与操作审计。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="profileToolbarSearchQ"
              :show-search="false"
              :show-reset="false"
              :input-id="`${idPrefix}-profile-supplier`"
            >
              <template #filters>
                <el-select
                  v-model="profileSelectedId"
                  placeholder="选择供应商"
                  filterable
                  aria-label="当前档案所属供应商"
                  style="width: 14rem"
                >
                  <el-option
                    v-for="row in supplierListRows"
                    :key="row.id"
                    :label="`${row.name}（${row.id}）`"
                    :value="row.id"
                  />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary" :disabled="!profileSupplier" @click="openProfileEdit">
                  编辑档案
                </el-button>
                <el-button
                  :disabled="!profileSupplier"
                  @click="goSupplierSubRoute('tai-admin-suppliers-integration')"
                >
                  对接配置
                </el-button>
                <el-button :disabled="!profileSupplier" @click="goSupplierSubRoute('tai-admin-suppliers-probe')">
                  连通性探测
                </el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <p v-if="supplierListRows.length === 0" class="sup-profile__empty">
          暂无供应商，请先在「供应商列表」新建。
        </p>
        <template v-else-if="profileSupplier && activeProfile">
          <header class="sup-profile__hero">
            <div class="sup-profile__hero-main">
              <h3 class="sup-profile__title">{{ profileSupplier.name }}</h3>
              <p class="sup-profile__meta">
                <span class="sup-page__mono">{{ profileSupplier.id }}</span>
                <span aria-hidden="true"> · </span>
                {{ profileSupplier.type }}
                <span aria-hidden="true"> · </span>
                {{ profileSupplier.region }}
              </p>
            </div>
            <span
              class="sup-page__badge sup-profile__status"
              :class="profileSupplier.status === '正常' ? 'sup-page__badge--ok' : 'sup-page__badge--warn'"
            >
              {{ profileSupplier.status }}
            </span>
            <ul class="sup-profile__metrics" aria-label="运行摘要">
              <li><span class="sup-profile__metric-label">模型</span>{{ profileSupplier.modelCount }}</li>
              <li><span class="sup-profile__metric-label">路由</span>{{ profileSupplier.routeCount }}</li>
              <li><span class="sup-profile__metric-label">健康</span>{{ profileSupplier.health }}</li>
              <li><span class="sup-profile__metric-label">计量</span>{{ activeProfile.meteringUnit }}</li>
            </ul>
          </header>

          <div class="sup-profile__grid">
            <section class="sup-profile__card" aria-labelledby="sup-profile-legal">
              <h4 id="sup-profile-legal" class="sup-profile__card-title">主体与合规</h4>
              <dl class="sup-profile__dl">
                <dt>法人主体</dt>
                <dd>{{ activeProfile.legalName }}</dd>
                <dt>统一社会信用代码</dt>
                <dd>{{ activeProfile.taxId || "—" }}</dd>
                <dt>关联合约</dt>
                <dd>
                  <span class="sup-page__mono">{{ activeProfile.contractRef }}</span>
                  <span class="sup-profile__muted">（客户与合同 · 工程期跳转）</span>
                </dd>
              </dl>
            </section>

            <section class="sup-profile__card" aria-labelledby="sup-profile-billing">
              <h4 id="sup-profile-billing" class="sup-profile__card-title">结算与付款</h4>
              <dl class="sup-profile__dl">
                <dt>结算周期</dt>
                <dd>{{ activeProfile.billingCycle }}</dd>
                <dt>付款条件</dt>
                <dd>{{ activeProfile.paymentTerms }}</dd>
                <dt>开户行</dt>
                <dd>{{ activeProfile.bankName }}</dd>
                <dt>对公账号</dt>
                <dd class="sup-page__mono">{{ activeProfile.bankAccountMasked }}</dd>
              </dl>
            </section>

            <section class="sup-profile__card" aria-labelledby="sup-profile-contact">
              <h4 id="sup-profile-contact" class="sup-profile__card-title">商务联系人</h4>
              <dl class="sup-profile__dl">
                <dt>姓名</dt>
                <dd>{{ activeProfile.contactName }}</dd>
                <dt>邮箱</dt>
                <dd>{{ activeProfile.contactEmail || "—" }}</dd>
                <dt>电话</dt>
                <dd>{{ activeProfile.contactPhone || "—" }}</dd>
              </dl>
            </section>

            <section class="sup-profile__card" aria-labelledby="sup-profile-audit">
              <h4 id="sup-profile-audit" class="sup-profile__card-title">备注与审计（只读）</h4>
              <dl class="sup-profile__dl">
                <dt>备注</dt>
                <dd class="sup-profile__remark">{{ activeProfile.remark || "—" }}</dd>
                <dt>最近更新</dt>
                <dd>{{ activeProfile.updatedAt }}</dd>
                <dt>更新人</dt>
                <dd>{{ activeProfile.updatedBy }}</dd>
              </dl>
            </section>
          </div>
        </template>
        <p v-else class="sup-profile__empty">请在上方选择供应商。</p>

        <p class="sup-page__hint">
          档案按供应商 ID 持久化；列表删除供应商时同步移除对应档案。对账字段「上游计量单位」须与用量/账单导出一致（详设 §4.4）。
        </p>
      </el-card>
    </section>

    <!-- 对接配置 -->
    <section v-show="panel === 'integration'" class="sup-page__panel" aria-label="对接配置">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="对接配置">
          <template #annot>
            <AdminInternalTip heading="对接配置 · 数据来源" explain="对接配置对内说明（原型）">
              <p>
                <strong>网关对接参数</strong>：每家供应商一套。点「添加网关对接参数」→ 表单预填来自
                <code>mock.ts</code> 模板 → 保存写入 <code>trinity-ai-admin:suppliers-gateway</code>。已有配置时「添加」按模板重新预填（保存后覆盖）。工程期改接
                <code>GET/PATCH …/providers/:id/gateway</code>。
              </p>
              <p>
                <strong>Mapper 模板</strong>：可多行，「新增 Mapper 模板」→
                <code>trinity-ai-admin:suppliers-integration-bindings</code>；Profile/JSON 真源在契约中心。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="integrationSearchQuery"
              :input-id="`${idPrefix}-int-search`"
              search-placeholder="配置名、模板、JSON…"
              search-aria-label="搜索对接配置"
              @reset="resetIntegrationQuery"
            >
              <template #filters>
                <el-select
                  v-model="profileSelectedId"
                  placeholder="供应商"
                  filterable
                  clearable
                  aria-label="按供应商查看对接"
                  style="width: 14rem"
                >
                  <el-option
                    v-for="row in supplierListRows"
                    :key="row.id"
                    :label="`${row.name}（${row.id}）`"
                    :value="row.id"
                  />
                </el-select>
                <el-select
                  v-model="integrationScopeFilter"
                  placeholder="配置范围"
                  aria-label="快捷筛选配置范围"
                  style="width: 9rem"
                >
                  <el-option label="全部配置" value="all" />
                  <el-option label="含 chat" value="chat" />
                  <el-option label="含 embedding" value="emb" />
                </el-select>
              </template>
              <template #actions>
                <el-button
                  type="primary"
                  :disabled="!profileSupplier"
                  @click="openGatewayAdd"
                >
                  添加网关对接参数
                </el-button>
                <el-button @click="openAddIntegration">新增 Mapper 模板</el-button>
                <el-button @click="goSupplierSubRoute('tai-admin-suppliers-probe')">连通性探测</el-button>
                <el-button @click="router.push({ name: 'tai-admin-ops-live' })">供应商健康</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <section class="sup-int__block" aria-labelledby="sup-int-gateway-title">
          <h4 id="sup-int-gateway-title" class="sup-int__block-title">网关对接参数</h4>
          <p v-if="profileSupplier && activeGateway" class="sup-int__block-sub sup-int__block-meta">
            <span>
              当前供应商：<strong>{{ profileSupplier.name }}</strong>
              <span class="sup-page__mono">（{{ profileSupplier.id }}）</span>
              · 最近更新 {{ activeGateway.updatedAt }} · {{ activeGateway.updatedBy }}
            </span>
            <span class="admin-ep-row-actions sup-int__meta-actions">
              <el-button link type="primary" :icon="Edit" @click="openGatewayEdit">编辑</el-button>
            </span>
          </p>
          <p v-else-if="!profileSupplier" class="sup-int__block-sub">
            请先在上方选择供应商，再点击右上角「添加网关对接参数」。
          </p>
          <p v-else-if="profileSupplier && !activeGateway" class="sup-int__empty">
            该供应商尚未配置网关对接参数。请点击右上角「添加网关对接参数」完成录入。
          </p>
          <dl v-if="activeGateway" class="sup-int__dl">
            <dt>API 类型</dt>
            <dd>{{ activeGateway.apiKind }}</dd>
            <dt>Base URL</dt>
            <dd><span class="sup-page__mono">{{ activeGateway.baseUrl }}</span></dd>
            <dt>Profile 引用</dt>
            <dd><span class="sup-page__mono">{{ activeGateway.profileRef }}</span></dd>
            <dt>JSON 契约</dt>
            <dd><span class="sup-page__mono">{{ activeGateway.jsonRef }}</span></dd>
            <dt>超时</dt>
            <dd>{{ activeGateway.timeoutMs }} ms</dd>
            <dt>重试</dt>
            <dd>{{ activeGateway.retryDefault }}</dd>
          </dl>
        </section>

        <section class="sup-int__block sup-int__block--table" aria-labelledby="sup-int-tpl-title">
          <h4 id="sup-int-tpl-title" class="sup-int__block-title">输入 / 输出模板</h4>
          <el-tabs v-model="integrationListTab" class="sup-int-list-tabs">
            <el-tab-pane label="输入模板" name="input">
              <el-table :data="integrationPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
                <el-table-column
                  prop="configName"
                  label="配置名称"
                  :min-width="ADMIN_TABLE_COL.primary"
                  sortable
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="inputName"
                  label="模板名称"
                  :min-width="ADMIN_TABLE_COL.md"
                  sortable
                  show-overflow-tooltip
                />
                <el-table-column label="JSON 预览" :min-width="ADMIN_TABLE_COL_MIN.detail" show-overflow-tooltip>
                  <template #default="scope">
                    <template v-if="scope?.row">
                      <span class="sup-page__mono">{{ jsonPreview(scope.row.inputJson) }}</span>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="更新" :min-width="ADMIN_TABLE_COL.lg" sortable />
                <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.md"fixed="right">
                  <template #default="scope">
                    <template v-if="scope?.row">
                      <div class="admin-ep-row-actions" @click.stop>
                        <el-button
                          link
                          type="primary"
                          :icon="Edit"
                          @click="openEditIntegration(scope.row, 'input')"
                        >
                          编辑
                        </el-button>
                        <el-button
                          link
                          type="danger"
                          :icon="Delete"
                          @click="requestDeleteIntegration(scope.row)"
                        >
                          删除
                        </el-button>
                      </div>
                    </template>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="输出模板" name="output">
              <el-table :data="integrationPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
                <el-table-column
                  prop="configName"
                  label="配置名称"
                  :min-width="ADMIN_TABLE_COL.primary"
                  sortable
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="outputName"
                  label="模板名称"
                  :min-width="ADMIN_TABLE_COL.md"
                  sortable
                  show-overflow-tooltip
                />
                <el-table-column label="JSON 预览" :min-width="ADMIN_TABLE_COL_MIN.detail" show-overflow-tooltip>
                  <template #default="scope">
                    <template v-if="scope?.row">
                      <span class="sup-page__mono">{{ jsonPreview(scope.row.outputJson) }}</span>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="更新" :min-width="ADMIN_TABLE_COL.lg" sortable />
                <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.md"fixed="right">
                  <template #default="scope">
                    <template v-if="scope?.row">
                      <div class="admin-ep-row-actions" @click.stop>
                        <el-button
                          link
                          type="primary"
                          :icon="Edit"
                          @click="openEditIntegration(scope.row, 'output')"
                        >
                          编辑
                        </el-button>
                        <el-button
                          link
                          type="danger"
                          :icon="Delete"
                          @click="requestDeleteIntegration(scope.row)"
                        >
                          删除
                        </el-button>
                      </div>
                    </template>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
        </el-tabs>
          <AdminTablePagination
            v-model:current-page="integrationPg.currentPage"
            v-model:page-size="integrationPg.pageSize"
            :total="integrationPg.total"
          />
        </section>

        <p class="sup-page__hint">
          模板行存 <code class="sup-page__mono">trinity-ai-admin:suppliers-integration-bindings</code>；删除整行即删除输入/输出两侧。
        </p>
      </el-card>
    </section>

    <!-- 连通性探测 -->
    <section v-show="panel === 'probe'" class="sup-page__panel" aria-label="连通性探测">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="连通性探测">
          <template #annot>
            <AdminInternalTip heading="连通性探测 · 原型" explain="连通性探测对内说明（原型）">
              <p>
                按供应商筛选与档案/对接共用 <code>profileSelectedId</code>（<code>?supplierId=</code> 可深链）。「立即执行拨测」对<strong>当前筛选结果</strong>逐条 mock
                更新最近执行/延迟/结果，写入 <code>trinity-ai-admin:suppliers-probe-rows</code>。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="probeSearchQ"
              :input-id="`${idPrefix}-sp-probe-q`"
              search-placeholder="任务、目标、说明…"
              search-aria-label="检索拨测任务"
              @reset="resetProbeQuery"
            >
              <template #filters>
                <el-select
                  v-model="profileSelectedId"
                  placeholder="供应商"
                  filterable
                  clearable
                  aria-label="按供应商查看拨测"
                  style="width: 14rem"
                >
                  <el-option
                    v-for="row in supplierListRows"
                    :key="row.id"
                    :label="`${row.name}（${row.id}）`"
                    :value="row.id"
                  />
                </el-select>
                <el-select v-model="probeResultFilter" clearable placeholder="结果" style="width: 7rem">
                  <el-option label="成功" value="成功" />
                  <el-option label="失败" value="失败" />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary" :loading="probeRunning" @click="runProbeNow">
                  立即执行拨测（示意）
                </el-button>
                <el-button @click="router.push({ name: 'tai-admin-ops-live' })">供应商健康</el-button>
                <el-button disabled title="原型未实现">调度策略</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <p v-if="probeFilterHint" class="sup-int__block-sub sup-page__probe-hint">{{ probeFilterHint }}</p>
        <el-table :data="probePg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column label="任务" :min-width="ADMIN_TABLE_COL.sm">
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="sup-page__mono">{{ scope.row.id }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="target"
            label="目标"
            :min-width="ADMIN_TABLE_COL.primary"
            sortable
            show-overflow-tooltip
          />
          <el-table-column prop="lastRun" label="最近执行" :min-width="ADMIN_TABLE_COL.lg" sortable />
          <el-table-column prop="latency" label="延迟" :width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column label="结果" :width="ADMIN_TABLE_COL.sm">
            <template #default="scope">
              <template v-if="scope?.row">
                <span
                  class="sup-page__badge"
                  :class="scope.row.result === '成功' ? 'sup-page__badge--ok' : 'sup-page__badge--warn'"
                >
                  {{ scope.row.result }}
                </span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="detail"
            label="说明"
            :min-width="ADMIN_TABLE_COL_MIN.detail"
            show-overflow-tooltip
            sortable
          />
        </el-table>
        <AdminTablePagination
          v-model:current-page="probePg.currentPage"
          v-model:page-size="probePg.pageSize"
          :total="probePg.total"
        />
        <p class="sup-page__hint">
          拨测结果存 <code class="sup-page__mono">trinity-ai-admin:suppliers-probe-rows</code>；执行范围 = 当前供应商 + 搜索 + 结果筛选后的任务行。
        </p>
      </el-card>
    </section>

    <!-- 密钥轮换策略 -->
    <section v-show="panel === 'key-rotation'" class="sup-page__panel" aria-label="密钥轮换策略">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="密钥轮换策略">
          <template #annot>
            <AdminInternalTip heading="密钥轮换策略 · 原型" explain="密钥轮换对内说明（原型）">
              <p>
                按供应商维护轮换周期、双发窗口、通知与 KMS 方式；下方为窗口/历史记录。凭据明文轮换在
                <strong>API 密钥 → 平台密钥</strong>；本页为治理说明与排期。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="rotationSearchQ"
              :input-id="`${idPrefix}-sp-rot-q`"
              search-placeholder="窗口、密钥、说明…"
              search-aria-label="检索轮换记录"
              @reset="resetRotationQuery"
            >
              <template #filters>
                <el-select
                  v-model="profileSelectedId"
                  placeholder="供应商"
                  filterable
                  clearable
                  aria-label="按供应商查看轮换"
                  style="width: 14rem"
                >
                  <el-option
                    v-for="row in supplierListRows"
                    :key="row.id"
                    :label="`${row.name}（${row.id}）`"
                    :value="row.id"
                  />
                </el-select>
                <el-select
                  v-model="rotationStatusFilter"
                  clearable
                  placeholder="状态"
                  aria-label="按轮换状态筛选"
                  style="width: 8rem"
                >
                  <el-option label="计划中" value="计划中" />
                  <el-option label="进行中" value="进行中" />
                  <el-option label="已完成" value="已完成" />
                  <el-option label="已跳过" value="已跳过" />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary" :disabled="!profileSupplier" @click="openRotationEdit">
                  编辑轮换策略
                </el-button>
                <el-button @click="router.push({ name: 'tai-admin-keys-platform-keys' })">
                  平台密钥
                </el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <p v-if="rotationFilterHint" class="sup-int__block-sub sup-page__probe-hint">{{ rotationFilterHint }}</p>
        <p v-else-if="!profileSupplier" class="sup-int__block-sub">
          请先在上方选择供应商，查看该户的轮换策略与记录。
        </p>

        <section
          v-if="profileSupplier && activeRotationPolicy"
          class="sup-rot__block"
          aria-labelledby="sup-rot-policy-title"
        >
          <div class="sup-int__block-head">
            <h4 id="sup-rot-policy-title" class="sup-int__block-title sup-int__block-title--inline">
              轮换策略
            </h4>
            <el-button size="small" @click="openRotationEdit">编辑</el-button>
          </div>
          <p class="sup-int__block-sub sup-int__block-meta">
            <span>
              当前供应商：<strong>{{ profileSupplier.name }}</strong>
              <span class="sup-page__mono">（{{ profileSupplier.id }}）</span>
              · 最近更新 {{ activeRotationPolicy.updatedAt }} · {{ activeRotationPolicy.updatedBy }}
            </span>
          </p>
          <dl class="sup-rot__dl">
            <dt>轮换周期</dt>
            <dd>{{ activeRotationPolicy.rotationDays }} 天</dd>
            <dt>双发窗口</dt>
            <dd>{{ activeRotationPolicy.dualKeyWindowHours }} 小时</dd>
            <dt>下一窗口</dt>
            <dd>{{ activeRotationPolicy.nextWindow }}</dd>
            <dt>负责人</dt>
            <dd>{{ activeRotationPolicy.owner }}</dd>
            <dt>通知渠道</dt>
            <dd>{{ activeRotationPolicy.notifyChannels }}</dd>
            <dt>凭据注入</dt>
            <dd>{{ activeRotationPolicy.kmsMode }}</dd>
            <dt>说明</dt>
            <dd class="sup-profile__remark">{{ activeRotationPolicy.remark }}</dd>
          </dl>
        </section>

        <p
          v-else-if="profileSupplier && !activeRotationPolicy"
          class="sup-int__empty"
        >
          该供应商尚未配置轮换策略，请点击「编辑轮换策略」录入。
        </p>

        <section class="sup-rot__block sup-rot__block--table" aria-labelledby="sup-rot-events-title">
          <h4 id="sup-rot-events-title" class="sup-int__block-title">轮换窗口与记录</h4>
          <el-table :data="rotationPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
            <el-table-column prop="windowLabel" label="窗口" :min-width="ADMIN_TABLE_COL.primary" sortable show-overflow-tooltip />
            <el-table-column prop="scheduledAt" label="计划时间" :min-width="ADMIN_TABLE_COL.lg" sortable />
            <el-table-column label="状态" :width="ADMIN_TABLE_COL.sm">
              <template #default="scope">
                <template v-if="scope?.row">
                  <span :class="rotationStatusBadgeClass(scope.row.status)">{{ scope.row.status }}</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="platformKeyRef" label="关联平台密钥" :min-width="ADMIN_TABLE_COL.md" show-overflow-tooltip />
            <el-table-column prop="detail" label="说明" :min-width="ADMIN_TABLE_COL_MIN.detail" show-overflow-tooltip sortable />
          </el-table>
          <AdminTablePagination
            v-model:current-page="rotationPg.currentPage"
            v-model:page-size="rotationPg.pageSize"
            :total="rotationPg.total"
          />
        </section>

        <p class="sup-page__hint">
          策略与记录存 <code class="sup-page__mono">trinity-ai-admin:suppliers-rotation</code>；工程期与 KMS / 网关注入联动，明文 Key 在平台密钥维护。
        </p>
      </el-card>
    </section>

    <AdminDialog
      v-model="modalOpen"
      :title="integrationDialogTitle"
      width="640px"
      head-note="名称与 JSON；「输入模板 / 输出模板」用 Tab 切换编辑。"
    >
      <AdminInternalTip heading="对内说明" explain="对接配置弹窗">
        <p style="margin: 0; font-size: 0.75rem; line-height: 1.45">列表为同一配置行的输入/输出两视图；删除任一侧即删除整行。</p>
      </AdminInternalTip>
      <p class="or-keys-editor-banner" role="status">保存前校验两处 JSON 均为合法 JSON；配置名称必填。</p>
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="配置名称">
          <el-input :id="`${idPrefix}-cfg-name`" v-model="draftConfigName" placeholder="如 chat · 线路 A" />
        </el-form-item>
      </el-form>
      <el-tabs v-model="modalTab" class="sup-int-modal-tabs">
        <el-tab-pane label="输入模板" name="input">
          <el-form label-position="top" class="admin-ep-form sup-int-modal-grid">
            <el-form-item label="输入模板名称">
              <el-input
                :id="`${idPrefix}-in-name`"
                v-model="draftInputName"
                placeholder="如 OpenAI 请求体映射入参"
              />
            </el-form-item>
            <el-form-item label="输入 JSON">
              <el-input
                :id="`${idPrefix}-in-json`"
                v-model="draftInputJson"
                type="textarea"
                :rows="10"
                spellcheck="false"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="输出模板" name="output">
          <el-form label-position="top" class="admin-ep-form sup-int-modal-grid">
            <el-form-item label="输出模板名称">
              <el-input
                :id="`${idPrefix}-out-name`"
                v-model="draftOutputName"
                placeholder="如统一出参包装"
              />
            </el-form-item>
            <el-form-item label="输出 JSON">
              <el-input
                :id="`${idPrefix}-out-json`"
                v-model="draftOutputJson"
                type="textarea"
                :rows="10"
                spellcheck="false"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <p v-if="modalError" class="sup-int-modal-err">{{ modalError }}</p>
      <template #footer>
        <el-button @click="closeIntegrationModal">取消</el-button>
        <el-button type="primary" @click="saveIntegrationModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="supplierFormModalOpen"
      :title="supplierFormTitle"
      width="520px"
      head-note="原型：仅写入列表与 localStorage；正式版接主数据 API 与权限审计。"
    >
      <el-form label-position="top" class="admin-ep-form sup-int-modal-grid">
        <el-form-item v-if="supplierFormMode === 'edit'" label="供应商 ID">
          <el-input :id="`${idPrefix}-sup-id`" v-model="draftSupplierId" disabled />
        </el-form-item>
        <el-form-item label="名称">
          <el-input :id="`${idPrefix}-sup-name`" v-model="draftSupplierName" placeholder="供应商显示名" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input :id="`${idPrefix}-sup-type`" v-model="draftSupplierType" placeholder="如 API₂ 聚合、API₁" />
        </el-form-item>
        <el-form-item label="区域">
          <el-input :id="`${idPrefix}-sup-region`" v-model="draftSupplierRegion" placeholder="如 cn-east" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input :id="`${idPrefix}-sup-status`" v-model="draftSupplierStatus" placeholder="正常 或 降级 等" />
        </el-form-item>
        <el-form-item label="健康摘要">
          <el-input :id="`${idPrefix}-sup-health`" v-model="draftSupplierHealth" placeholder="如 99.92% 或 —" />
        </el-form-item>
      </el-form>
      <p v-if="supplierFormError" class="sup-int-modal-err">{{ supplierFormError }}</p>
      <template #footer>
        <el-button @click="closeSupplierFormModal">取消</el-button>
        <el-button type="primary" @click="saveSupplierForm">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="rotationFormOpen"
      title="编辑轮换策略"
      width="560px"
      head-note="治理说明与排期；上游凭据明文轮换请在「平台密钥」完成。"
    >
      <el-form v-if="draftRotation" label-position="top" class="admin-ep-form sup-rotation-form">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="轮换周期（天）">
              <el-input-number v-model="draftRotation.rotationDays" :min="30" :max="365" class="sup-gateway-form__num" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="双发窗口（小时）">
              <el-input-number v-model="draftRotation.dualKeyWindowHours" :min="1" :max="72" class="sup-gateway-form__num" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下一窗口" required>
              <el-input v-model="draftRotation.nextWindow" placeholder="2026-05-18 02:00–04:00 UTC+8" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" required>
              <el-input v-model="draftRotation.owner" placeholder="平台安全 @li" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="通知渠道">
              <el-input v-model="draftRotation.notifyChannels" placeholder="邮件 · 企业微信" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="凭据注入方式">
              <el-select v-model="draftRotation.kmsMode" placeholder="选择方式" style="width: 100%">
                <el-option label="网关心跳热加载" value="网关心跳热加载" />
                <el-option label="KMS 托管同步" value="KMS 托管同步" />
                <el-option label="手动登记 + 平台密钥" value="手动登记 + 平台密钥" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="说明">
              <el-input v-model="draftRotation.remark" type="textarea" :rows="3" placeholder="轮换窗口、双发与值班约定" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <p v-if="rotationFormError" class="sup-int-modal-err">{{ rotationFormError }}</p>
      <template #footer>
        <el-button @click="closeRotationEdit">取消</el-button>
        <el-button type="primary" @click="saveRotationEdit">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="gatewayFormOpen"
      :title="gatewayDialogTitle"
      width="560px"
      :head-note="gatewayDialogHeadNote"
    >
      <el-form v-if="draftGateway" label-position="top" class="admin-ep-form sup-gateway-form">
        <el-form-item label="API 类型">
          <el-input v-model="draftGateway.apiKind" placeholder="如 OpenAI 兼容（/v1/chat/completions）" />
        </el-form-item>
        <el-form-item label="Base URL" required>
          <el-input v-model="draftGateway.baseUrl" placeholder="https://api.vendor.com/v1" />
        </el-form-item>
        <el-form-item label="Profile 引用" required>
          <el-input v-model="draftGateway.profileRef" placeholder="profile/vendor-model@v1" />
        </el-form-item>
        <el-form-item label="JSON 契约">
          <el-input v-model="draftGateway.jsonRef" placeholder="s3://trinity-contracts/..." />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="超时（ms）">
              <el-input-number v-model="draftGateway.timeoutMs" :min="1000" :max="300000" :step="1000" class="sup-gateway-form__num" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重试策略">
              <el-input v-model="draftGateway.retryDefault" placeholder="幂等 2 次 · 指数退避" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <p v-if="gatewayFormError" class="sup-int-modal-err">{{ gatewayFormError }}</p>
      <template #footer>
        <el-button @click="closeGatewayEdit">取消</el-button>
        <el-button type="primary" @click="saveGatewayEdit">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="profileFormOpen"
      title="编辑档案与结算"
      width="640px"
      head-note="法人主体必填；保存后写入按供应商档案存储。"
    >
      <el-form v-if="draftProfile" label-position="top" class="admin-ep-form sup-profile-form">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="法人主体" required>
              <el-input v-model="draftProfile.legalName" placeholder="营业执照名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码">
              <el-input v-model="draftProfile.taxId" placeholder="可选" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算周期">
              <el-input v-model="draftProfile.billingCycle" placeholder="如 月结 T+7" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款条件">
              <el-input v-model="draftProfile.paymentTerms" placeholder="转账方式、币种等" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户行">
              <el-input v-model="draftProfile.bankName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="对公账号（脱敏展示）">
              <el-input v-model="draftProfile.bankAccountMasked" placeholder="**** 8821" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上游计量单位">
              <el-input v-model="draftProfile.meteringUnit" placeholder="token / request 等，与对账导出一致" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联合约编号">
              <el-input v-model="draftProfile.contractRef" placeholder="与客户合同模块对齐" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人姓名">
              <el-input v-model="draftProfile.contactName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="邮箱">
              <el-input v-model="draftProfile.contactEmail" type="email" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="电话">
              <el-input v-model="draftProfile.contactPhone" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="draftProfile.remark" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <p v-if="profileFormError" class="sup-int-modal-err">{{ profileFormError }}</p>
      <template #footer>
        <el-button @click="closeProfileEdit">取消</el-button>
        <el-button type="primary" @click="saveProfileEdit">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="dangerConfirmOpen"
      :title="dangerConfirmTitle"
      width="480px"
      head-note="请再次确认；原型将直接更新 localStorage。"
    >
      <p class="or-keys-editor-banner" role="status">{{ dangerConfirmMessage }}</p>
      <template #footer>
        <el-button @click="closeDangerConfirm">取消</el-button>
        <el-button type="danger" @click="executeSupplierDangerConfirm">{{ dangerConfirmPrimaryLabel }}</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
