<script setup lang="ts">
import { Bottom, CircleCheck, Delete, Edit } from "@element-plus/icons-vue";
import { computed, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { useRoute } from "vue-router";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { filterByQuery } from "../../utils/adminListFilter";
import "./models.css";
import {
  MODEL_BINDING_ROWS,
  MODEL_LIST_ROWS,
  MODEL_MASTER_SAMPLE,
  MODEL_PANEL_ORDER,
  MODEL_PRICING_ROWS,
  MODEL_SUPPLY_LINE_ROWS,
  type ModelListRow,
  type ModelPanelId,
} from "./mock";
import {
  readModelListFilter,
  readModelListRowsJson,
  writeModelListFilter,
  writeModelListRowsJson,
} from "./modelsInteractions";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<ModelPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && MODEL_PANEL_ORDER.includes(id as ModelPanelId)) return id as ModelPanelId;
  return "list";
});

const listFilter = ref("");
const modelShelfFilter = ref<"all" | "on" | "off" | "gray">("all");
const lineSearchQ = ref("");
const pricingSearchQ = ref("");
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

function onDocKeydown(e: KeyboardEvent): void {
  if (e.key !== "Escape") return;
  if (modelDangerConfirmOpen.value) {
    e.preventDefault();
    closeModelDangerConfirm();
    return;
  }
  if (modelFormModalOpen.value) {
    e.preventDefault();
    closeModelFormModal();
  }
}

onMounted(() => {
  listFilter.value = readModelListFilter();
  loadModelListRows();
  document.addEventListener("keydown", onDocKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onDocKeydown);
});

watch(listFilter, (v) => {
  writeModelListFilter(v);
});

const filteredModelList = computed(() => {
  let rows = modelListRows.value;
  const sf = modelShelfFilter.value;
  if (sf === "on") rows = rows.filter((r) => r.shelf === "上架");
  else if (sf === "off") rows = rows.filter((r) => r.shelf === "下架");
  else if (sf === "gray") rows = rows.filter((r) => r.shelf === "灰度");
  return filterByQuery(rows, listFilter.value, (r) =>
    [r.displayName, r.id, r.apiKind, r.shelf].join(" "),
  );
});

const filteredSupplyLines = computed(() =>
  filterByQuery(MODEL_SUPPLY_LINE_ROWS, lineSearchQ.value, (r) =>
    [String(r.priority), r.channel, r.supplier, r.upstreamModelId, r.profileRef, r.region, r.costRef].join(" "),
  ),
);

const filteredPricingRows = computed(() =>
  filterByQuery(MODEL_PRICING_ROWS, pricingSearchQ.value, (r) =>
    [r.sku, r.listPrice, r.internalCost, r.note].join(" "),
  ),
);

function resetModelListQuery(): void {
  modelShelfFilter.value = "all";
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
              <p>上架状态与供应商标识为 mock；与线路、刊例三表联动在工程期校验。</p>
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
          <el-table-column prop="routeCount" label="线路数" width="90" sortable/>
          <el-table-column prop="updatedAt" label="更新" min-width="130" sortable/>
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
              <div class="admin-ep-row-actions">
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
          列表与新增/编辑写入 <code class="mdl-page__mono">localStorage</code>（<code class="mdl-page__mono">trinity-ai-admin:models-list-rows</code>）；搜索关键字
          <code class="mdl-page__mono">trinity-ai-admin:models-list-filter</code>；操作列<strong>下架</strong>与<strong>删除</strong>经二次确认；<strong>上架</strong>为即时生效；导入/导出为原型占位；编辑为 Element Plus 表单弹窗。
        </p>
      </el-card>
    </section>

    <!-- 主数据 -->
    <section v-show="panel === 'master'" class="mdl-page__panel" aria-label="主数据">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="主数据">
          <template #annot>
            <AdminInternalTip heading="主数据 · 原型" explain="模型主数据对内说明（原型）">
              <p>能力标签与上下文长度为占位；应对接模型注册中心版本号。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <el-button type="button">编辑主数据（示意）</el-button>
          </template>
        </AdminSectionHead>
        <dl class="mdl-page__dl">
          <dt class="mdl-page__dt">逻辑模型 ID</dt>
          <dd class="mdl-page__dd"><span class="mdl-page__mono">{{ MODEL_MASTER_SAMPLE.logicalId }}</span></dd>
          <dt class="mdl-page__dt">展示名</dt>
          <dd class="mdl-page__dd">{{ MODEL_MASTER_SAMPLE.displayName }}</dd>
          <dt class="mdl-page__dt">上下文长度</dt>
          <dd class="mdl-page__dd">{{ MODEL_MASTER_SAMPLE.contextWindow }}</dd>
          <dt class="mdl-page__dt">能力标签</dt>
          <dd class="mdl-page__dd">{{ MODEL_MASTER_SAMPLE.capabilities }}</dd>
          <dt class="mdl-page__dt">对外文档锚点</dt>
          <dd class="mdl-page__dd"><span class="mdl-page__mono">{{ MODEL_MASTER_SAMPLE.docAnchor }}</span></dd>
          <dt class="mdl-page__dt">API₁ 原生研发商</dt>
          <dd class="mdl-page__dd">{{ MODEL_MASTER_SAMPLE.api1Vendor }}</dd>
          <dt class="mdl-page__dt">备注</dt>
          <dd class="mdl-page__dd">{{ MODEL_MASTER_SAMPLE.remark }}</dd>
        </dl>
      </el-card>
    </section>

    <!-- 供应线路 -->
    <section v-show="panel === 'lines'" class="mdl-page__panel" aria-label="供应线路">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="供应线路">
          <template #annot>
            <AdminInternalTip heading="供应线路 · 原型" explain="供应线路对内说明（原型）">
              <p>路由优先级与降级策略为示意；生产需与网关路由表同步。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="lineSearchQ"
              :input-id="`${idPrefix}-mdl-line-q`"
              search-placeholder="通道、供应商、区域…"
              search-aria-label="检索供应线路"
            >
              <template #actions>
                <el-button>线路探测（示意）</el-button>
                <el-button type="primary">调整优先级（示意）</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <el-table :data="supplyLinesPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column prop="priority" label="优先级" width="90" sortable/>
          <el-table-column prop="channel" label="通道" min-width="90" sortable/>
          <el-table-column prop="supplier" label="供应商" min-width="100" sortable/>
          <el-table-column label="上游 model_id" min-width="120">
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="mdl-page__mono">{{ scope.row.upstreamModelId }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="Profile" min-width="100">
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="mdl-page__mono">{{ scope.row.profileRef }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="region" label="区域" width="100" sortable/>
          <el-table-column prop="costRef" label="成本引用" min-width="100" sortable/>
          <el-table-column prop="updatedAt" label="更新" min-width="130" sortable/>
        </el-table>
        <AdminTablePagination
          v-model:current-page="supplyLinesPg.currentPage"
          v-model:page-size="supplyLinesPg.pageSize"
          :total="supplyLinesPg.total"
        />
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
        <AdminSectionHead toolbar-only title="刊例与成本">
          <template #annot>
            <AdminInternalTip heading="刊例与成本 · 原型" explain="刊例成本对内说明（原型）">
              <p>成本与毛利率为 mock；财务口径与供应商对账单需二期对齐。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="pricingSearchQ"
              :input-id="`${idPrefix}-mdl-price-q`"
              search-placeholder="SKU、刊例价、备注…"
              search-aria-label="检索刊例"
            />
          </template>
        </AdminSectionHead>
        <el-table :data="pricingPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
          <el-table-column label="SKU" min-width="120">
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="mdl-page__mono">{{ scope.row.sku }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="listPrice" label="刊例价" min-width="100" sortable/>
          <el-table-column prop="internalCost" label="内部成本参考" min-width="120" sortable/>
          <el-table-column prop="note" label="备注" min-width="160" show-overflow-tooltip sortable/>
        </el-table>
        <AdminTablePagination
          v-model:current-page="pricingPg.currentPage"
          v-model:page-size="pricingPg.pageSize"
          :total="pricingPg.total"
        />
      </el-card>
    </section>

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
