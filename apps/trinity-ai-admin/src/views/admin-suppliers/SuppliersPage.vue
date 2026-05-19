<script setup lang="ts">
import { Delete, Edit } from "@element-plus/icons-vue";
import { computed, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { filterByQuery } from "../../utils/adminListFilter";
import "./suppliers.css";
import {
  DEFAULT_INTEGRATION_BINDINGS,
  SUPPLIER_INTEGRATION,
  SUPPLIER_KEY_ROTATION,
  SUPPLIER_LIST_ROWS,
  SUPPLIER_PROBE_ROWS,
  SUPPLIER_PROFILE,
  SUPPLIER_PANEL_ORDER,
  type IntegrationBindingRow,
  type SupplierListRow,
  type SupplierPanelId,
} from "./mock";
import {
  readSupplierListFilter,
  readSupplierListRowsJson,
  readIntegrationBindingsJson,
  writeIntegrationBindingsJson,
  writeSupplierListFilter,
  writeSupplierListRowsJson,
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

function loadSupplierListRows(): void {
  const raw = readSupplierListRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        supplierListRows.value = parsed as SupplierListRow[];
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
    supplierListRows.value.push({
      id: `sp-${Date.now()}`,
      name,
      type,
      status,
      health,
      region,
      updatedAt: now,
    });
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

const integrationRows = ref<IntegrationBindingRow[]>([]);
const integrationSearchQuery = ref("");
const integrationScopeFilter = ref<"all" | "chat" | "emb">("all");
const probeSearchQ = ref("");
const probeResultFilter = ref("");

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
  if (supplierFormModalOpen.value) {
    e.preventDefault();
    closeSupplierFormModal();
  }
}

onMounted(() => {
  listFilter.value = readSupplierListFilter();
  loadSupplierListRows();
  loadIntegrationRows();
  document.addEventListener("keydown", onDocKeydown);
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
    [r.name, r.id, r.type, r.region, r.health].join(" "),
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
  let rows = SUPPLIER_PROBE_ROWS;
  if (probeResultFilter.value) rows = rows.filter((r) => r.result === probeResultFilter.value);
  return filterByQuery(rows, probeSearchQ.value, (r) =>
    [r.id, r.target, r.lastRun, r.latency, r.result, r.detail].join(" "),
  );
});

function resetSupplierListQuery(): void {
  supplierStatusFilter.value = "all";
}

function resetIntegrationQuery(): void {
  integrationScopeFilter.value = "all";
}

function resetProbeQuery(): void {
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
              search-placeholder="名称 / ID / 类型 / 区域…"
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
          <el-table-column label="ID" min-width="100">
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="sup-page__mono">{{ scope.row.id }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" min-width="120" sortable/>
          <el-table-column prop="type" label="类型" min-width="100" sortable/>
          <el-table-column label="状态" width="100">
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
          <el-table-column prop="health" label="健康" min-width="90" sortable/>
          <el-table-column prop="region" label="区域" min-width="90" sortable/>
          <el-table-column prop="updatedAt" label="更新" min-width="130" sortable/>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
              <div class="admin-ep-row-actions">
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
            <AdminInternalTip heading="档案与结算 · 原型" explain="供应商档案对内说明（原型）">
              <p>结算周期与账户信息为占位；与财务对账字段在工程期对齐。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <el-button type="button">编辑档案（示意）</el-button>
            <el-button type="primary">保存（示意）</el-button>
          </template>
        </AdminSectionHead>
        <dl class="sup-page__dl">
          <dt class="sup-page__dt">法人主体</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_PROFILE.legalName }}</dd>
          <dt class="sup-page__dt">税号</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_PROFILE.taxId }}</dd>
          <dt class="sup-page__dt">结算周期</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_PROFILE.billingCycle }}</dd>
          <dt class="sup-page__dt">付款条件</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_PROFILE.paymentTerms }}</dd>
          <dt class="sup-page__dt">联系人</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_PROFILE.contact }}</dd>
          <dt class="sup-page__dt">备注</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_PROFILE.remark }}</dd>
        </dl>
      </el-card>
    </section>

    <!-- 对接配置 -->
    <section v-show="panel === 'integration'" class="sup-page__panel" aria-label="对接配置">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="对接配置">
          <template #annot>
            <AdminInternalTip heading="对接配置 · 原型" explain="对接配置对内说明（原型）">
              <p>Base URL、鉴权方式为示意；上线前须走配置审计与密钥轮换（§4.4）。</p>
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
                <el-button type="primary" @click="openAddIntegration">新增对接配置</el-button>
                <el-button @click="router.push({ name: 'tai-admin-suppliers-probe' })">跳转拨测子页</el-button>
                <el-button @click="router.push({ name: 'tai-admin-ops-live' })">监控 · 供应商健康</el-button>
                <el-button type="button">探测连通性（示意）</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <dl class="sup-page__dl">
          <dt class="sup-page__dt">API 类型</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_INTEGRATION.apiKind }}</dd>
          <dt class="sup-page__dt">Base URL</dt>
          <dd class="sup-page__dd"><span class="sup-page__mono">{{ SUPPLIER_INTEGRATION.baseUrl }}</span></dd>
          <dt class="sup-page__dt">Profile 引用</dt>
          <dd class="sup-page__dd"><span class="sup-page__mono">{{ SUPPLIER_INTEGRATION.profileRef }}</span></dd>
          <dt class="sup-page__dt">JSON 契约引用</dt>
          <dd class="sup-page__dd"><span class="sup-page__mono">{{ SUPPLIER_INTEGRATION.jsonRef }}</span></dd>
          <dt class="sup-page__dt">超时 (ms)</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_INTEGRATION.timeoutMs }}</dd>
          <dt class="sup-page__dt">重试默认</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_INTEGRATION.retryDefault }}</dd>
        </dl>
        <p class="sup-page__callout">{{ SUPPLIER_INTEGRATION.api2Note }}</p>

        <h3 class="sup-int__subcap">输入 / 输出模板（Tab 切换列表 + 增删改查）</h3>
        <p class="sup-page__hint" style="margin-top: 0; margin-bottom: 0.65rem">
          列表用 <strong>Tab</strong> 切换「输入模板 / 输出模板」；弹窗内同样用 Tab 编辑两侧 JSON。数据存 <code class="sup-page__mono">localStorage</code>；<strong>删除</strong>经二次确认。
        </p>

        <el-tabs v-model="integrationListTab" class="sup-int-list-tabs">
          <el-tab-pane label="输入模板" name="input">
            <el-table :data="integrationPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
              <el-table-column prop="configName" label="配置名称" min-width="120" sortable/>
              <el-table-column prop="inputName" label="模板名称" min-width="120" sortable/>
              <el-table-column label="JSON 预览" min-width="160" show-overflow-tooltip>
                <template #default="scope">
                  <template v-if="scope?.row">
                  <span class="sup-page__mono">{{ jsonPreview(scope.row.inputJson) }}</span>
                  </template>
            </template>
              </el-table-column>
              <el-table-column prop="updatedAt" label="更新" min-width="130" sortable/>
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="scope">
                  <template v-if="scope?.row">
                  <div class="admin-ep-row-actions">
                    <el-button link type="primary" :icon="Edit" @click="openEditIntegration(scope.row, 'input')">编辑</el-button>
                    <el-button link type="danger" :icon="Delete" @click="requestDeleteIntegration(scope.row)">删除</el-button>
                  </div>
                  </template>
            </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="输出模板" name="output">
            <el-table :data="integrationPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
              <el-table-column prop="configName" label="配置名称" min-width="120" sortable/>
              <el-table-column prop="outputName" label="模板名称" min-width="120" sortable/>
              <el-table-column label="JSON 预览" min-width="160" show-overflow-tooltip>
                <template #default="scope">
                  <template v-if="scope?.row">
                  <span class="sup-page__mono">{{ jsonPreview(scope.row.outputJson) }}</span>
                  </template>
            </template>
              </el-table-column>
              <el-table-column prop="updatedAt" label="更新" min-width="130" sortable/>
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="scope">
                  <template v-if="scope?.row">
                  <div class="admin-ep-row-actions">
                    <el-button link type="primary" :icon="Edit" @click="openEditIntegration(scope.row, 'output')">编辑</el-button>
                    <el-button link type="danger" :icon="Delete" @click="requestDeleteIntegration(scope.row)">删除</el-button>
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
      </el-card>
    </section>

    <!-- 连通性探测 -->
    <section v-show="panel === 'probe'" class="sup-page__panel" aria-label="连通性探测">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="连通性探测">
          <template #annot>
            <AdminInternalTip heading="连通性探测 · 原型" explain="连通性探测对内说明（原型）">
              <p>探测结果为 mock；真实环境应限频、落审计并区分供应商沙箱/生产。</p>
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
                <el-select v-model="probeResultFilter" clearable placeholder="结果" style="width: 7rem">
                  <el-option label="成功" value="成功" />
                  <el-option label="失败" value="失败" />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary">立即执行拨测（示意）</el-button>
                <el-button>调度策略</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <el-table :data="probePg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column label="任务" min-width="100">
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="sup-page__mono">{{ scope.row.id }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="target" label="目标" min-width="160" sortable/>
          <el-table-column prop="lastRun" label="最近执行" min-width="130" sortable/>
          <el-table-column prop="latency" label="延迟" width="100" sortable/>
          <el-table-column label="结果" width="100">
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
          <el-table-column prop="detail" label="说明" min-width="180" show-overflow-tooltip sortable/>
        </el-table>
        <AdminTablePagination
          v-model:current-page="probePg.currentPage"
          v-model:page-size="probePg.pageSize"
          :total="probePg.total"
        />
      </el-card>
    </section>

    <!-- 密钥轮换策略 -->
    <section v-show="panel === 'key-rotation'" class="sup-page__panel" aria-label="密钥轮换策略">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="密钥轮换策略">
          <template #annot>
            <AdminInternalTip heading="密钥轮换策略 · 原型" explain="密钥轮换对内说明（原型）">
              <p>轮换窗口与通知策略为占位；与平台密钥中心联动见详设。</p>
            </AdminInternalTip>
          </template>
</AdminSectionHead>
        <dl class="sup-page__dl">
          <dt class="sup-page__dt">下一窗口</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_KEY_ROTATION.nextWindow }}</dd>
          <dt class="sup-page__dt">负责人</dt>
          <dd class="sup-page__dd">{{ SUPPLIER_KEY_ROTATION.owner }}</dd>
        </dl>
        <p class="sup-page__hint">网关注入与 KMS 对接为工程项，此处仅占位说明。</p>
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
