<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import {
  FilterForm2PillListbox,
  type FilterForm2ListboxItem,
  ModalPanel,
  TButton,
  TSearchForm1Fixed,
  TTextField1Labeled,
} from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./models.css";
import {
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
  setModelsModalBodyLock,
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
const modelShelfFilterOpen = ref(false);
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

const modelShelfListboxItems = computed<FilterForm2ListboxItem[]>(() => {
  const v = modelShelfFilter.value;
  return [
    { label: "全部", checked: v === "all" },
    { label: "上架", checked: v === "on" },
    { label: "下架", checked: v === "off" },
    { label: "灰度", checked: v === "gray" },
  ];
});

const modelShelfPillLabel = computed(() => {
  switch (modelShelfFilter.value) {
    case "on":
      return "上架";
    case "off":
      return "下架";
    case "gray":
      return "灰度";
    default:
      return "上下架";
  }
});

function onModelShelfListboxSelect(i: number): void {
  const keys: Array<"all" | "on" | "off" | "gray"> = ["all", "on", "off", "gray"];
  modelShelfFilter.value = keys[i] ?? "all";
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
  setModelsModalBodyLock(false);
});

watch(listFilter, (v) => {
  writeModelListFilter(v);
});

watchEffect(() => {
  setModelsModalBodyLock(modelFormModalOpen.value || modelDangerConfirmOpen.value);
});

const filteredModelList = computed(() => {
  let rows = modelListRows.value;
  const sf = modelShelfFilter.value;
  if (sf === "on") rows = rows.filter((r) => r.shelf === "上架");
  else if (sf === "off") rows = rows.filter((r) => r.shelf === "下架");
  else if (sf === "gray") rows = rows.filter((r) => r.shelf === "灰度");

  const q = listFilter.value.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.displayName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.apiKind.toLowerCase().includes(q) ||
      r.shelf.toLowerCase().includes(q)
  );
});

function shelfBadgeClass(shelf: string): string {
  if (shelf === "上架") return "mdl-page__badge mdl-page__badge--ok";
  if (shelf === "下架") return "mdl-page__badge mdl-page__badge--muted";
  return "mdl-page__badge mdl-page__badge--warn";
}
</script>

<template>
  <div class="mdl-page">
    <!-- 模型列表 -->
    <section v-show="panel === 'list'" class="mdl-page__panel" aria-label="模型列表">
      <AdminSectionHead title="模型列表">
        <template #annot>
          <AdminInternalTip heading="模型列表 · 原型" explain="模型列表对内说明（原型）">
            <p>上架状态与供应商标识为 mock；与线路、刊例三表联动在工程期校验。</p>
          </AdminInternalTip>
        </template>
        <template #desc>逻辑模型检索、上下架筛选与导入导出（<strong>§4.5</strong>，mock）；上架即时、下架/删除二次确认。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="listFilter"
            :input-id="`${idPrefix}-mdl-search`"
            placeholder="按展示名 / 平台 ID / 通道 / 上下架…"
            width="17.5rem"
            aria-label="搜索模型"
          />
          <FilterForm2PillListbox
            v-model:open="modelShelfFilterOpen"
            managed-panel
            :wrap-id="`${idPrefix}-mdl-sf-wrap`"
            :btn-id="`${idPrefix}-mdl-sf-btn`"
            :panel-id="`${idPrefix}-mdl-sf-panel`"
            :label-span-id="`${idPrefix}-mdl-sf-lbl`"
            listbox-aria-label="按上下架筛选"
            beak-x="2.75rem"
            :items="modelShelfListboxItems"
            @select="onModelShelfListboxSelect"
          >
            {{ modelShelfPillLabel }}
          </FilterForm2PillListbox>
          <input
            ref="modelImportInputRef"
            type="file"
            class="mdl-visually-hidden"
            accept=".csv,.xlsx,.xls,application/vnd.ms-excel"
            tabindex="-1"
            aria-hidden="true"
            @change="onModelImportFileChange"
          />
          <TButton variant="gradient" type="button" @click="onAddModelClick">新增模型</TButton>
          <TButton variant="outline" type="button" @click="triggerModelImport">导入</TButton>
          <TButton variant="outline" type="button" @click="onExportModelsClick">导出</TButton>
        </template>
      </AdminSectionHead>
      <div class="mdl-page__table-wrap">
        <table class="mdl-page__table">
          <thead>
            <tr>
              <th>平台模型 ID</th>
              <th>展示名</th>
              <th>通道</th>
              <th>上下架</th>
              <th>线路数</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredModelList" :key="r.id">
              <td class="mdl-page__mono">{{ r.id }}</td>
              <td>{{ r.displayName }}</td>
              <td>{{ r.apiKind }}</td>
              <td><span :class="shelfBadgeClass(r.shelf)">{{ r.shelf }}</span></td>
              <td>{{ r.routeCount }}</td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button
                  v-if="r.shelf !== '上架'"
                  type="button"
                  class="mdl-int__textlink"
                  @click="setModelShelfStatus(r.id, '上架')"
                >
                  上架
                </button>
                <button
                  v-if="r.shelf !== '下架'"
                  type="button"
                  class="mdl-int__textlink mdl-int__textlink--danger"
                  @click="requestModelShelfDown(r)"
                >
                  下架
                </button>
                <button type="button" class="mdl-int__textlink" @click="onEditModelClick(r)">编辑</button>
                <button
                  type="button"
                  class="mdl-int__textlink mdl-int__textlink--danger"
                  @click="requestDeleteModel(r)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mdl-page__hint">
        列表与新增/编辑写入 <code class="mdl-page__mono">localStorage</code>（<code class="mdl-page__mono">trinity-ai-admin:models-list-rows</code>）；搜索关键字
        <code class="mdl-page__mono">trinity-ai-admin:models-list-filter</code>；操作列<strong>下架</strong>与<strong>删除</strong>经二次 <strong>ModalPanel</strong> 确认；<strong>上架</strong>为即时生效；导入/导出为原型占位；编辑为
        <strong>ModalPanel</strong> + <strong>TTextField1Labeled</strong>（<code class="mdl-page__mono">@trinity/ui</code>）。
      </p>
    </section>

    <!-- 主数据 -->
    <section v-show="panel === 'master'" class="mdl-page__panel" aria-label="主数据">
      <AdminSectionHead title="主数据">
        <template #annot>
          <AdminInternalTip heading="主数据 · 原型" explain="模型主数据对内说明（原型）">
            <p>能力标签与上下文长度为占位；应对接模型注册中心版本号。</p>
          </AdminInternalTip>
        </template>
        <template #desc>当前逻辑模型样例字段只读（mock）。</template>
        <template #tools>
          <TButton variant="outline" type="button">编辑主数据（示意）</TButton>
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
    </section>

    <!-- 供应线路 -->
    <section v-show="panel === 'lines'" class="mdl-page__panel" aria-label="供应线路">
      <AdminSectionHead title="供应线路">
        <template #annot>
          <AdminInternalTip heading="供应线路 · 原型" explain="供应线路对内说明（原型）">
            <p>路由优先级与降级策略为示意；生产需与网关路由表同步。</p>
          </AdminInternalTip>
        </template>
        <template #desc>
          示意模型：<strong>{{ MODEL_MASTER_SAMPLE.displayName }}</strong>；多线路优先级、Profile、Mapper（§4.5.1 / §4.6，mock）。
        </template>
        <template #tools>
          <TButton variant="outline" type="button">线路探测（示意）</TButton>
          <TButton variant="gradient" type="button">调整优先级（示意）</TButton>
        </template>
      </AdminSectionHead>
      <div class="mdl-page__table-wrap">
        <table class="mdl-page__table">
          <thead>
            <tr>
              <th>优先级</th>
              <th>通道</th>
              <th>供应商</th>
              <th>上游 model_id</th>
              <th>Profile</th>
              <th>区域</th>
              <th>成本引用</th>
              <th>更新</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in MODEL_SUPPLY_LINE_ROWS" :key="r.id">
              <td>{{ r.priority }}</td>
              <td>{{ r.channel }}</td>
              <td>{{ r.supplier }}</td>
              <td class="mdl-page__mono">{{ r.upstreamModelId }}</td>
              <td class="mdl-page__mono">{{ r.profileRef }}</td>
              <td>{{ r.region }}</td>
              <td>{{ r.costRef }}</td>
              <td>{{ r.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 刊例与成本 -->
    <section v-show="panel === 'pricing'" class="mdl-page__panel" aria-label="刊例与成本">
      <AdminSectionHead title="刊例与成本">
        <template #annot>
          <AdminInternalTip heading="刊例与成本 · 原型" explain="刊例成本对内说明（原型）">
            <p>成本与毛利率为 mock；财务口径与供应商对账单需二期对齐。</p>
          </AdminInternalTip>
        </template>
        <template #desc>SKU 刊例价与内部成本参考（可选，mock）。</template>
      </AdminSectionHead>
      <div class="mdl-page__table-wrap">
        <table class="mdl-page__table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>刊例价</th>
              <th>内部成本参考</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in MODEL_PRICING_ROWS" :key="i">
              <td class="mdl-page__mono">{{ r.sku }}</td>
              <td>{{ r.listPrice }}</td>
              <td>{{ r.internalCost }}</td>
              <td>{{ r.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-show="modelFormModalOpen"
        class="or-modal-root mdl-int-modal-host"
        role="presentation"
        :aria-hidden="!modelFormModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeModelFormModal" />
        <ModalPanel
          :title="modelFormTitle"
          :title-id="`${idPrefix}-mdl-form-title`"
          head-note="原型：写入列表与 localStorage；正式版接主数据与审计。"
          close-label="关闭"
          @close="closeModelFormModal"
        >
          <div class="or-keys-editor-grid mdl-int-modal-grid">
            <TTextField1Labeled
              v-model="draftModelDisplayName"
              label="展示名称"
              :input-id="`${idPrefix}-mdl-dn`"
              placeholder="租户可见名称"
            />
            <TTextField1Labeled
              v-model="draftModelId"
              label="平台模型 ID"
              :input-id="`${idPrefix}-mdl-id`"
              :disabled="modelFormMode === 'edit'"
              :placeholder="modelFormMode === 'edit' ? '编辑时不可改 ID' : '留空则自动生成 lm-时间戳'"
            />
            <TTextField1Labeled
              v-model="draftModelApiKind"
              label="通道类型"
              :input-id="`${idPrefix}-mdl-api`"
              placeholder="API₁ 或 API₂"
            />
            <TTextField1Labeled
              v-model="draftModelShelf"
              label="上下架"
              :input-id="`${idPrefix}-mdl-shelf`"
              placeholder="上架 / 下架 / 灰度"
            />
            <TTextField1Labeled
              v-model="draftModelRouteCount"
              label="绑定线路数"
              :input-id="`${idPrefix}-mdl-rc`"
              placeholder="0"
            />
          </div>
          <p v-if="modelFormError" class="mdl-int-modal-err">{{ modelFormError }}</p>
          <template #actions>
            <TButton type="button" @click="closeModelFormModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveModelForm">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="modelDangerConfirmOpen"
        class="or-modal-root mdl-int-modal-host"
        role="presentation"
        :aria-hidden="!modelDangerConfirmOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeModelDangerConfirm" />
        <ModalPanel
          :title="modelDangerConfirmTitle"
          :title-id="`${idPrefix}-mdl-danger-title`"
          head-note="请再次确认；原型将直接更新 localStorage。"
          close-label="关闭"
          @close="closeModelDangerConfirm"
        >
          <p class="or-keys-editor-banner" role="status">{{ modelDangerConfirmMessage }}</p>
          <template #actions>
            <TButton type="button" @click="closeModelDangerConfirm">取消</TButton>
            <TButton variant="gradient" type="button" @click="executeModelDangerConfirm">
              {{ modelDangerConfirmPrimaryLabel }}
            </TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>
  </div>
</template>
