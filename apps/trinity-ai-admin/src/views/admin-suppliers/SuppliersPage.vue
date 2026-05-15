<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  FilterForm2PillListbox,
  type FilterForm2ListboxItem,
  InternalHelpTip,
  ModalPanel,
  TButton,
  TSearchForm1Fixed,
  TTabSwitch1Underline,
  TTextField1Labeled,
} from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./suppliers.css";
import {
  DEFAULT_INTEGRATION_BINDINGS,
  INTEGRATION_MODAL_TABS,
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
  setSupplierModalBodyLock,
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
const supplierStatusFilterOpen = ref(false);
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

const supplierStatusListboxItems = computed<FilterForm2ListboxItem[]>(() => {
  const v = supplierStatusFilter.value;
  return [
    { label: "全部状态", checked: v === "all" },
    { label: "仅正常", checked: v === "ok" },
    { label: "仅异常/降级", checked: v === "warn" },
  ];
});

const supplierStatusPillLabel = computed(() => {
  switch (supplierStatusFilter.value) {
    case "ok":
      return "仅正常";
    case "warn":
      return "异常/降级";
    default:
      return "全部状态";
  }
});

function onSupplierStatusListboxSelect(i: number): void {
  const keys: Array<"all" | "ok" | "warn"> = ["all", "ok", "warn"];
  supplierStatusFilter.value = keys[i] ?? "all";
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
const integrationScopeFilterOpen = ref(false);

const integrationScopeListboxItems = computed<FilterForm2ListboxItem[]>(() => {
  const v = integrationScopeFilter.value;
  return [
    { label: "全部配置", checked: v === "all" },
    { label: "含 chat", checked: v === "chat" },
    { label: "含 embedding", checked: v === "emb" },
  ];
});

const integrationScopePillLabel = computed(() => {
  switch (integrationScopeFilter.value) {
    case "chat":
      return "含 chat";
    case "emb":
      return "含 embedding";
    default:
      return "全部配置";
  }
});

function onIntegrationScopeListboxSelect(i: number): void {
  const keys: Array<"all" | "chat" | "emb"> = ["all", "chat", "emb"];
  integrationScopeFilter.value = keys[i] ?? "all";
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
  setSupplierModalBodyLock(false);
});

watch(listFilter, (v) => {
  writeSupplierListFilter(v);
});

watchEffect(() => {
  setSupplierModalBodyLock(
    modalOpen.value || supplierFormModalOpen.value || dangerConfirmOpen.value
  );
});

const filteredList = computed(() => {
  let rows = supplierListRows.value;
  const st = supplierStatusFilter.value;
  if (st === "ok") rows = rows.filter((r) => r.status === "正常");
  else if (st === "warn") rows = rows.filter((r) => r.status !== "正常");

  const q = listFilter.value.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q)
  );
});

const filteredIntegrationRows = computed(() => {
  let rows = integrationRows.value;
  const q = integrationSearchQuery.value.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (r) =>
        r.configName.toLowerCase().includes(q) ||
        r.inputName.toLowerCase().includes(q) ||
        r.outputName.toLowerCase().includes(q) ||
        r.inputJson.toLowerCase().includes(q) ||
        r.outputJson.toLowerCase().includes(q) ||
        r.updatedAt.toLowerCase().includes(q)
    );
  }
  const sc = integrationScopeFilter.value;
  if (sc === "chat") {
    rows = rows.filter(
      (r) =>
        r.configName.toLowerCase().includes("chat") ||
        r.inputJson.toLowerCase().includes("chat") ||
        r.outputJson.toLowerCase().includes("chat")
    );
  } else if (sc === "emb") {
    rows = rows.filter(
      (r) =>
        r.configName.toLowerCase().includes("embed") ||
        r.inputJson.toLowerCase().includes("embed") ||
        r.outputJson.toLowerCase().includes("embed")
    );
  }
  return rows;
});
</script>

<template>
  <div class="sup-page">
    <!-- 供应商列表 -->
    <section v-show="panel === 'list'" class="sup-page__panel" aria-label="供应商列表">
      <AdminSectionHead title="供应商列表">
        <template #annot>
          <AdminInternalTip heading="供应商列表 · 原型" explain="供应商列表对内说明（原型）">
            <p>列表与筛选为 mock；导入/导出示意，工程期接主数据与审批。</p>
          </AdminInternalTip>
        </template>
        <template #desc>主数据检索、状态筛选与导入导出（<strong>§4.4</strong>，mock）。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="listFilter"
            :input-id="`${idPrefix}-sp-search`"
            placeholder="按名称 / ID / 类型 / 区域搜索…"
            width="17.5rem"
            aria-label="搜索供应商"
          />
          <FilterForm2PillListbox
            v-model:open="supplierStatusFilterOpen"
            managed-panel
            :wrap-id="`${idPrefix}-sp-st-wrap`"
            :btn-id="`${idPrefix}-sp-st-btn`"
            :panel-id="`${idPrefix}-sp-st-panel`"
            :label-span-id="`${idPrefix}-sp-st-lbl`"
            listbox-aria-label="按状态筛选"
            beak-x="2.75rem"
            :items="supplierStatusListboxItems"
            @select="onSupplierStatusListboxSelect"
          >
            {{ supplierStatusPillLabel }}
          </FilterForm2PillListbox>
          <input
            ref="supplierImportInputRef"
            type="file"
            class="sup-visually-hidden"
            accept=".csv,.xlsx,.xls,application/vnd.ms-excel"
            tabindex="-1"
            aria-hidden="true"
            @change="onSupplierImportFileChange"
          />
          <TButton variant="gradient" type="button" @click="onAddSupplierClick">新增供应商</TButton>
          <TButton variant="outline" type="button" @click="triggerSupplierImport">导入</TButton>
          <TButton variant="outline" type="button" @click="onExportSuppliersClick">导出</TButton>
        </template>
      </AdminSectionHead>
      <div class="sup-page__table-wrap">
        <table class="sup-page__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>类型</th>
              <th>状态</th>
              <th>健康</th>
              <th>区域</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredList" :key="r.id">
              <td class="sup-page__mono">{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.type }}</td>
              <td>
                <span
                  class="sup-page__badge"
                  :class="r.status === '正常' ? 'sup-page__badge--ok' : 'sup-page__badge--warn'"
                >
                  {{ r.status }}
                </span>
              </td>
              <td>{{ r.health }}</td>
              <td>{{ r.region }}</td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="sup-int__textlink" @click="onEditSupplierClick(r)">编辑</button>
                <button
                  type="button"
                  class="sup-int__textlink sup-int__textlink--danger"
                  @click="requestDeleteSupplier(r)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="sup-page__hint">
        列表数据与新增/编辑写入 <code class="sup-page__mono">localStorage</code>（键 <code class="sup-page__mono">trinity-ai-admin:suppliers-list-rows</code>）；搜索关键字另存；状态为前端即时过滤；导入/导出为原型占位；编辑为 <strong>ModalPanel</strong> + <strong>TTextField1Labeled</strong>；<strong>删除</strong>经二次 <strong>ModalPanel</strong> 确认（<code class="sup-page__mono">@trinity/ui</code>）。
      </p>
    </section>

    <!-- 档案与结算 -->
    <section v-show="panel === 'profile'" class="sup-page__panel" aria-label="档案与结算">
      <AdminSectionHead title="档案与结算">
        <template #annot>
          <AdminInternalTip heading="档案与结算 · 原型" explain="供应商档案对内说明（原型）">
            <p>结算周期与账户信息为占位；与财务对账字段在工程期对齐。</p>
          </AdminInternalTip>
        </template>
        <template #desc>法人、结算周期与付款条款只读示意（mock）。</template>
        <template #tools>
          <TButton variant="outline">编辑档案（示意）</TButton>
          <TButton variant="gradient">保存（示意）</TButton>
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
    </section>

    <!-- 对接配置 -->
    <section v-show="panel === 'integration'" class="sup-page__panel" aria-label="对接配置">
      <AdminSectionHead title="对接配置">
        <template #annot>
          <AdminInternalTip heading="对接配置 · 原型" explain="对接配置对内说明（原型）">
            <p>Base URL、鉴权方式为示意；上线前须走配置审计与密钥轮换（§4.4）。</p>
          </AdminInternalTip>
        </template>
        <template #desc>API 连通、JSON 模板列表与范围筛选（<strong>§4.4</strong>，mock）。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="integrationSearchQuery"
            :input-id="`${idPrefix}-int-search`"
            placeholder="搜索配置名称、模板名、JSON…"
            width="17.5rem"
            aria-label="搜索对接配置"
          />
          <FilterForm2PillListbox
            v-model:open="integrationScopeFilterOpen"
            managed-panel
            :wrap-id="`${idPrefix}-int-sc-wrap`"
            :btn-id="`${idPrefix}-int-sc-btn`"
            :panel-id="`${idPrefix}-int-sc-panel`"
            :label-span-id="`${idPrefix}-int-sc-lbl`"
            listbox-aria-label="快捷筛选配置范围"
            beak-x="2.75rem"
            :items="integrationScopeListboxItems"
            @select="onIntegrationScopeListboxSelect"
          >
            {{ integrationScopePillLabel }}
          </FilterForm2PillListbox>
          <TButton variant="gradient" type="button" @click="openAddIntegration">新增对接配置</TButton>
          <TButton variant="outline" type="button" @click="router.push({ name: 'tai-admin-suppliers-probe' })">
            跳转拨测子页
          </TButton>
          <TButton variant="outline" type="button" @click="router.push({ name: 'tai-admin-ops-live' })">
            监控 · 供应商健康
          </TButton>
          <TButton variant="outline" type="button">探测连通性（示意）</TButton>
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
        列表用 <strong>Tab</strong> 切换「输入模板 / 输出模板」；弹窗内同样用 Tab 编辑两侧 JSON。组件来自 <strong>@trinity/ui</strong>，对齐
        <code>DesignSpec.vue</code>；数据存 <code class="sup-page__mono">localStorage</code>；<strong>删除</strong>经二次 <strong>ModalPanel</strong> 确认。
      </p>

      <TTabSwitch1Underline
        v-model="integrationListTab"
        :tabs="INTEGRATION_MODAL_TABS"
        tablist-label="输入或输出模板列表"
        class="sup-int-list-tabs"
      />

      <div v-show="integrationListTab === 'input'" class="sup-page__table-wrap">
        <table class="sup-page__table">
          <thead>
            <tr>
              <th>配置名称</th>
              <th>模板名称</th>
              <th>JSON 预览</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredIntegrationRows" :key="`${r.id}-in`">
              <td>{{ r.configName }}</td>
              <td>{{ r.inputName }}</td>
              <td class="sup-page__mono">{{ jsonPreview(r.inputJson) }}</td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="sup-int__textlink" @click="openEditIntegration(r, 'input')">编辑</button>
                <button
                  type="button"
                  class="sup-int__textlink sup-int__textlink--danger"
                  @click="requestDeleteIntegration(r)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-show="integrationListTab === 'output'" class="sup-page__table-wrap">
        <table class="sup-page__table">
          <thead>
            <tr>
              <th>配置名称</th>
              <th>模板名称</th>
              <th>JSON 预览</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredIntegrationRows" :key="`${r.id}-out`">
              <td>{{ r.configName }}</td>
              <td>{{ r.outputName }}</td>
              <td class="sup-page__mono">{{ jsonPreview(r.outputJson) }}</td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="sup-int__textlink" @click="openEditIntegration(r, 'output')">编辑</button>
                <button
                  type="button"
                  class="sup-int__textlink sup-int__textlink--danger"
                  @click="requestDeleteIntegration(r)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 连通性探测 -->
    <section v-show="panel === 'probe'" class="sup-page__panel" aria-label="连通性探测">
      <AdminSectionHead title="连通性探测">
        <template #annot>
          <AdminInternalTip heading="连通性探测 · 原型" explain="连通性探测对内说明（原型）">
            <p>探测结果为 mock；真实环境应限频、落审计并区分供应商沙箱/生产。</p>
          </AdminInternalTip>
        </template>
        <template #desc>拨测任务与最近结果只读（mock）。</template>
        <template #tools>
          <TButton variant="gradient">立即执行拨测（示意）</TButton>
          <TButton variant="outline">调度策略</TButton>
        </template>
      </AdminSectionHead>
      <div class="sup-page__table-wrap">
        <table class="sup-page__table">
          <thead>
            <tr>
              <th>任务</th>
              <th>目标</th>
              <th>最近执行</th>
              <th>延迟</th>
              <th>结果</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in SUPPLIER_PROBE_ROWS" :key="r.id">
              <td class="sup-page__mono">{{ r.id }}</td>
              <td>{{ r.target }}</td>
              <td>{{ r.lastRun }}</td>
              <td>{{ r.latency }}</td>
              <td>
                <span
                  class="sup-page__badge"
                  :class="r.result === '成功' ? 'sup-page__badge--ok' : 'sup-page__badge--warn'"
                >
                  {{ r.result }}
                </span>
              </td>
              <td>{{ r.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 密钥轮换策略 -->
    <section v-show="panel === 'key-rotation'" class="sup-page__panel" aria-label="密钥轮换策略">
      <AdminSectionHead title="密钥轮换策略">
        <template #annot>
          <AdminInternalTip heading="密钥轮换策略 · 原型" explain="密钥轮换对内说明（原型）">
            <p>轮换窗口与通知策略为占位；与平台密钥中心联动见详设。</p>
          </AdminInternalTip>
        </template>
        <template #desc>{{ SUPPLIER_KEY_ROTATION.policy }}</template>
      </AdminSectionHead>
      <dl class="sup-page__dl">
        <dt class="sup-page__dt">下一窗口</dt>
        <dd class="sup-page__dd">{{ SUPPLIER_KEY_ROTATION.nextWindow }}</dd>
        <dt class="sup-page__dt">负责人</dt>
        <dd class="sup-page__dd">{{ SUPPLIER_KEY_ROTATION.owner }}</dd>
      </dl>
      <p class="sup-page__hint">网关注入与 KMS 对接为工程项，此处仅占位说明。</p>
    </section>

    <Teleport to="body">
      <div
        v-show="modalOpen"
        class="or-modal-root sup-int-modal-host"
        role="presentation"
        :aria-hidden="!modalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeIntegrationModal" />
        <ModalPanel
          :title="editingId ? '编辑对接配置' : '新增对接配置'"
          head-note="名称与 JSON；「输入模板 / 输出模板」用 Tab 切换编辑（对齐 DesignSpec 弹窗 + Tab）。"
          @close="closeIntegrationModal"
        >
          <template #headTrail>
            <InternalHelpTip title="对内说明" aria-label="对内说明" layout="inline">
              <p style="margin: 0; font-size: 0.75rem; line-height: 1.45">列表为同一配置行的输入/输出两视图；删除任一侧即删除整行。</p>
            </InternalHelpTip>
          </template>
          <p class="or-keys-editor-banner" role="status">保存前校验两处 JSON 均为合法 JSON；配置名称必填。</p>
          <div class="or-keys-editor-grid sup-int-modal-grid">
            <TTextField1Labeled
              v-model="draftConfigName"
              label="配置名称"
              :input-id="`${idPrefix}-cfg-name`"
              placeholder="如 chat · 线路 A"
            />
          </div>
          <TTabSwitch1Underline
            v-model="modalTab"
            :tabs="INTEGRATION_MODAL_TABS"
            tablist-label="输入或输出模板"
            class="sup-int-modal-tabs"
          />
          <div v-show="modalTab === 'input'" class="sup-int-modal-grid">
            <TTextField1Labeled
              v-model="draftInputName"
              label="输入模板名称"
              :input-id="`${idPrefix}-in-name`"
              placeholder="如 OpenAI 请求体映射入参"
            />
            <div class="form-group">
              <label :for="`${idPrefix}-in-json`">输入 JSON</label>
              <textarea :id="`${idPrefix}-in-json`" v-model="draftInputJson" spellcheck="false" />
            </div>
          </div>
          <div v-show="modalTab === 'output'" class="sup-int-modal-grid">
            <TTextField1Labeled
              v-model="draftOutputName"
              label="输出模板名称"
              :input-id="`${idPrefix}-out-name`"
              placeholder="如统一出参包装"
            />
            <div class="form-group">
              <label :for="`${idPrefix}-out-json`">输出 JSON</label>
              <textarea :id="`${idPrefix}-out-json`" v-model="draftOutputJson" spellcheck="false" />
            </div>
          </div>
          <p v-if="modalError" class="sup-int-modal-err">{{ modalError }}</p>
          <template #actions>
            <TButton type="button" @click="closeIntegrationModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveIntegrationModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="supplierFormModalOpen"
        class="or-modal-root sup-int-modal-host"
        role="presentation"
        :aria-hidden="!supplierFormModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeSupplierFormModal" />
        <ModalPanel
          :title="supplierFormTitle"
          :title-id="`${idPrefix}-sup-form-title`"
          head-note="原型：仅写入列表与 localStorage；正式版接主数据 API 与权限审计。"
          close-label="关闭"
          @close="closeSupplierFormModal"
        >
          <div class="or-keys-editor-grid sup-int-modal-grid">
            <TTextField1Labeled
              v-if="supplierFormMode === 'edit'"
              v-model="draftSupplierId"
              label="供应商 ID"
              :input-id="`${idPrefix}-sup-id`"
              disabled
            />
            <TTextField1Labeled
              v-model="draftSupplierName"
              label="名称"
              :input-id="`${idPrefix}-sup-name`"
              placeholder="供应商显示名"
            />
            <TTextField1Labeled
              v-model="draftSupplierType"
              label="类型"
              :input-id="`${idPrefix}-sup-type`"
              placeholder="如 API₂ 聚合、API₁"
            />
            <TTextField1Labeled
              v-model="draftSupplierRegion"
              label="区域"
              :input-id="`${idPrefix}-sup-region`"
              placeholder="如 cn-east"
            />
            <TTextField1Labeled
              v-model="draftSupplierStatus"
              label="状态"
              :input-id="`${idPrefix}-sup-status`"
              placeholder="正常 或 降级 等"
            />
            <TTextField1Labeled
              v-model="draftSupplierHealth"
              label="健康摘要"
              :input-id="`${idPrefix}-sup-health`"
              placeholder="如 99.92% 或 —"
            />
          </div>
          <p v-if="supplierFormError" class="sup-int-modal-err">{{ supplierFormError }}</p>
          <template #actions>
            <TButton type="button" @click="closeSupplierFormModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveSupplierForm">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="dangerConfirmOpen"
        class="or-modal-root sup-int-modal-host"
        role="presentation"
        :aria-hidden="!dangerConfirmOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeDangerConfirm" />
        <ModalPanel
          :title="dangerConfirmTitle"
          :title-id="`${idPrefix}-sup-danger-title`"
          head-note="请再次确认；原型将直接更新 localStorage。"
          close-label="关闭"
          @close="closeDangerConfirm"
        >
          <p class="or-keys-editor-banner" role="status">{{ dangerConfirmMessage }}</p>
          <template #actions>
            <TButton type="button" @click="closeDangerConfirm">取消</TButton>
            <TButton variant="gradient" type="button" @click="executeSupplierDangerConfirm">
              {{ dangerConfirmPrimaryLabel }}
            </TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>
  </div>
</template>
