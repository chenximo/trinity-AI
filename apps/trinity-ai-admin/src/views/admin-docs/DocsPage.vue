<script setup lang="ts">
import { computed, onMounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ModalPanel, TButton, TSearchForm1Fixed, TTextField1Labeled, FilterForm2PillListbox } from "@trinity/ui";
import type { FilterForm2ListboxItem } from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./docs.css";
import {
  DEFAULT_DOC_ROWS,
  DEFAULT_PUBLISH_JOBS,
  DEFAULT_VERSION_ROWS,
  DEFAULT_VISIBILITY_RULES,
  DOC_PANEL_ORDER,
  publishStatusClass,
  statusBadgeClass,
  type DocPanelId,
  type DocRow,
  type DocVersionRow,
  type PublishJobRow,
  type VisibilityRuleRow,
} from "./mock";
import { renderDocMarkdown } from "./docMarkdownPreview";
import {
  readDocsFilterStatus,
  readDocsFilterType,
  readDocsPublishJson,
  readDocsRowsJson,
  readDocsSearchQ,
  readDocsVersionsJson,
  readDocsVisibilityJson,
  setDocsModalBodyLock,
  writeDocsFilterStatus,
  writeDocsFilterType,
  writeDocsPublishJson,
  writeDocsRowsJson,
  writeDocsSearchQ,
  writeDocsVersionsJson,
  writeDocsVisibilityJson,
} from "./docsInteractions";

const route = useRoute();
const router = useRouter();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<DocPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && DOC_PANEL_ORDER.includes(id as DocPanelId)) return id as DocPanelId;
  return "list";
});

const docRows = ref<DocRow[]>([]);
const versionRows = ref<DocVersionRow[]>([]);
const publishRows = ref<PublishJobRow[]>([]);
const visibilityRows = ref<VisibilityRuleRow[]>([]);

const TYPE_FILTER_VALUES = ["", "用户指南", "供应商 API", "公告", "内部 Runbook"] as const;
const TYPE_FILTER_LABELS = ["全部类型", "用户指南", "供应商 API", "公告", "内部 Runbook"] as const;

const STATUS_FILTER_VALUES = ["", "草稿", "评审中", "已发布", "已归档"] as const;
const STATUS_FILTER_LABELS = ["全部状态", "草稿", "评审中", "已发布", "已归档"] as const;

const NEW_DOC_TYPES: DocRow["type"][] = ["用户指南", "供应商 API", "公告", "内部 Runbook"];
const VIS_SCOPES: VisibilityRuleRow["scope"][] = ["公开", "登录可见", "指定客户"];

const typeFilterOpen = ref(false);
const statusFilterOpen = ref(false);
const newTypeOpen = ref(false);
const visDocOpen = ref(false);
const visScopeOpen = ref(false);

const searchQ = ref("");
const filterType = ref("");
const filterStatus = ref("");

const editorBody = ref("");

const newModalOpen = ref(false);
const newFormError = ref("");
const draftNewTitle = ref("");
const draftNewSlug = ref("");
const draftNewType = ref<DocRow["type"]>("用户指南");

const infoOpen = ref(false);
const infoTitle = ref("");
const infoMsg = ref("");

const visModalOpen = ref(false);
const visFormError = ref("");
const draftVisDocId = ref("");
const draftVisScope = ref<VisibilityRuleRow["scope"]>("公开");
const draftVisHint = ref("");

function loadJson<T>(raw: string | null, fallback: T[]): T[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[];
    } catch {
      /* default */
    }
  }
  return JSON.parse(JSON.stringify(fallback)) as T[];
}

function loadAll(): void {
  docRows.value = loadJson(readDocsRowsJson(), DEFAULT_DOC_ROWS);
  versionRows.value = loadJson(readDocsVersionsJson(), DEFAULT_VERSION_ROWS);
  publishRows.value = loadJson(readDocsPublishJson(), DEFAULT_PUBLISH_JOBS);
  visibilityRows.value = loadJson(readDocsVisibilityJson(), DEFAULT_VISIBILITY_RULES);
  searchQ.value = readDocsSearchQ();
  filterType.value = readDocsFilterType();
  filterStatus.value = readDocsFilterStatus();
}

function persistDocs(): void {
  writeDocsRowsJson(JSON.stringify(docRows.value));
}

function persistVersions(): void {
  writeDocsVersionsJson(JSON.stringify(versionRows.value));
}

function persistPublish(): void {
  writeDocsPublishJson(JSON.stringify(publishRows.value));
}

function persistVisibility(): void {
  writeDocsVisibilityJson(JSON.stringify(visibilityRows.value));
}

const selectedEditorId = computed(() => {
  const id = route.query.id;
  return typeof id === "string" && id.trim() ? id.trim() : "";
});

const selectedDoc = computed(() => docRows.value.find((r) => r.id === selectedEditorId.value) ?? null);

const versionsForSelected = computed(() =>
  versionRows.value.filter((v) => v.docId === selectedEditorId.value).sort((a, b) => (a.at < b.at ? 1 : -1)),
);

const editorPreviewHtml = computed(() => renderDocMarkdown(editorBody.value));

const filteredDocs = computed(() => {
  const q = searchQ.value.trim().toLowerCase();
  const t = filterType.value;
  const s = filterStatus.value;
  return docRows.value.filter((r) => {
    if (t && r.type !== t) return false;
    if (s && r.status !== s) return false;
    if (!q) return true;
    const blob = [r.title, r.slug, r.owner, r.type, r.status, r.version].join(" ").toLowerCase();
    return blob.includes(q);
  });
});

const typeFilterItems = computed<FilterForm2ListboxItem[]>(() =>
  TYPE_FILTER_VALUES.map((v, i) => ({
    label: TYPE_FILTER_LABELS[i] ?? "",
    checked: filterType.value === v,
  })),
);

const statusFilterItems = computed<FilterForm2ListboxItem[]>(() =>
  STATUS_FILTER_VALUES.map((v, i) => ({
    label: STATUS_FILTER_LABELS[i] ?? "",
    checked: filterStatus.value === v,
  })),
);

const typePillLabel = computed(() => (filterType.value ? filterType.value : "文档类型"));

const statusPillLabel = computed(() => (filterStatus.value ? filterStatus.value : "发布状态"));

const newDocTypeItems = computed<FilterForm2ListboxItem[]>(() =>
  NEW_DOC_TYPES.map((t) => ({ label: t, checked: draftNewType.value === t })),
);

const visDocFilterItems = computed<FilterForm2ListboxItem[]>(() =>
  docRows.value.map((r) => ({ label: r.title, checked: r.id === draftVisDocId.value })),
);

const visScopeItems = computed<FilterForm2ListboxItem[]>(() =>
  VIS_SCOPES.map((s) => ({ label: s, checked: s === draftVisScope.value })),
);

const visDocPillLabel = computed(() => {
  const d = docRows.value.find((x) => x.id === draftVisDocId.value);
  return d?.title ?? "选择文档";
});

const visScopePillLabel = computed(() => draftVisScope.value);

function onTypeFilterSelect(i: number): void {
  filterType.value = TYPE_FILTER_VALUES[i] ?? "";
}

function onStatusFilterSelect(i: number): void {
  filterStatus.value = STATUS_FILTER_VALUES[i] ?? "";
}

function onNewDocTypeSelect(i: number): void {
  const t = NEW_DOC_TYPES[i];
  if (t) draftNewType.value = t;
}

function onVisDocSelect(i: number): void {
  const r = docRows.value[i];
  if (r) draftVisDocId.value = r.id;
}

function onVisScopeSelect(i: number): void {
  const s = VIS_SCOPES[i];
  if (s) draftVisScope.value = s;
}

function syncEditorBody(): void {
  editorBody.value = selectedDoc.value?.body ?? "";
}

watch(selectedEditorId, syncEditorBody, { immediate: true });
watch(
  () => selectedDoc.value?.body,
  () => {
    if (selectedDoc.value) editorBody.value = selectedDoc.value.body;
  },
);

watch(searchQ, (v) => writeDocsSearchQ(v));
watch(filterType, (v) => writeDocsFilterType(v));
watch(filterStatus, (v) => writeDocsFilterStatus(v));

function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function showInfo(title: string, msg: string): void {
  infoTitle.value = title;
  infoMsg.value = msg;
  infoOpen.value = true;
}

function closeInfo(): void {
  infoOpen.value = false;
}

function openNewModal(): void {
  newFormError.value = "";
  draftNewTitle.value = "";
  draftNewSlug.value = "";
  draftNewType.value = "用户指南";
  newTypeOpen.value = false;
  newModalOpen.value = true;
}

function closeNewModal(): void {
  newModalOpen.value = false;
  newTypeOpen.value = false;
}

function saveNewDoc(): void {
  const title = draftNewTitle.value.trim();
  const slug = draftNewSlug.value.trim();
  if (!title) {
    newFormError.value = "请填写标题";
    return;
  }
  if (!slug) {
    newFormError.value = "请填写 slug / 路径";
    return;
  }
  const id = `doc-${Date.now()}`;
  docRows.value.unshift({
    id,
    title,
    slug: slug.startsWith("/") ? slug : `/${slug}`,
    type: draftNewType.value,
    status: "草稿",
    owner: "zhang.san",
    updatedAt: formatNow(),
    version: "v0.1",
    body: `# ${title}\n\n（新建 mock 正文）`,
  });
  versionRows.value.unshift({
    id: `ver-${Date.now()}`,
    docId: id,
    version: "v0.1",
    branch: "draft",
    author: "zhang.san",
    at: formatNow(),
    note: "新建文档",
  });
  persistDocs();
  persistVersions();
  closeNewModal();
  showInfo("已创建", `文档「${title}」已加入列表（mock）。`);
}

function goEditor(id: string): void {
  void router.push({ name: "tai-admin-docs-editor", query: { id } });
}

function saveDraft(): void {
  const row = selectedDoc.value;
  if (!row) return;
  row.body = editorBody.value;
  row.updatedAt = formatNow();
  if (row.status === "已发布") row.status = "评审中";
  versionRows.value.unshift({
    id: `ver-${Date.now()}`,
    docId: row.id,
    version: row.version,
    branch: "draft",
    author: "zhang.san",
    at: formatNow(),
    note: "保存草稿",
  });
  persistDocs();
  persistVersions();
  showInfo("已保存", "正文已写入 localStorage；版本树已追加一条（mock）。");
}

function approvePublish(job: PublishJobRow): void {
  if (job.status !== "待发布审批") return;
  job.status = "已上线";
  job.scheduledAt = formatNow();
  const doc = docRows.value.find((d) => d.id === job.docId);
  if (doc) {
    doc.status = "已发布";
    doc.version = job.targetVersion;
    doc.updatedAt = formatNow();
  }
  persistPublish();
  persistDocs();
  showInfo("已发布", `${job.docTitle} ${job.targetVersion} 已上线（mock）。`);
}

function rollbackPublish(job: PublishJobRow): void {
  if (job.status !== "已上线") return;
  job.status = "已回滚";
  persistPublish();
  showInfo("已回滚", `${job.docTitle} 发布单已标记回滚（mock）。`);
}

function openVisModal(): void {
  visFormError.value = "";
  draftVisDocId.value = docRows.value[0]?.id ?? "";
  draftVisScope.value = "公开";
  draftVisHint.value = "";
  visDocOpen.value = false;
  visScopeOpen.value = false;
  visModalOpen.value = true;
}

function closeVisModal(): void {
  visModalOpen.value = false;
  visDocOpen.value = false;
  visScopeOpen.value = false;
}

function saveVisRule(): void {
  const docId = draftVisDocId.value.trim();
  if (!docId) {
    visFormError.value = "请选择文档";
    return;
  }
  const doc = docRows.value.find((d) => d.id === docId);
  if (!doc) {
    visFormError.value = "文档不存在";
    return;
  }
  const hint = draftVisHint.value.trim();
  if (draftVisScope.value === "指定客户" && !hint) {
    visFormError.value = "指定客户时请填写客户/组织说明";
    return;
  }
  visibilityRows.value.push({
    id: `vis-${Date.now()}`,
    docId,
    docTitle: doc.title,
    scope: draftVisScope.value,
    customerHint: draftVisScope.value === "公开" ? "—" : hint || "—",
    updatedAt: formatNow(),
  });
  persistVisibility();
  closeVisModal();
  showInfo("已添加", "可见范围规则已写入列表（mock）。");
}

watchEffect(() => {
  const o = newModalOpen.value || infoOpen.value || visModalOpen.value;
  setDocsModalBodyLock(o);
});

onMounted(() => loadAll());
</script>

<template>
  <div class="doc-page">
    <!-- 文档列表 -->
    <section v-show="panel === 'list'" class="doc-page__panel" aria-label="文档列表">
      <AdminSectionHead title="文档列表">
        <template #annot>
          <AdminInternalTip heading="文档列表 · 原型" explain="文档列表对内说明（原型）">
            <p>元数据与筛选写 <code>localStorage</code> 示意；与静态站点发布流水线对齐在工程期。</p>
          </AdminInternalTip>
        </template>
        <template #desc>对外文档元数据与筛选（<strong>§4.9</strong>，mock，<code class="doc-page__mono">localStorage</code>）。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="searchQ"
            :input-id="`${idPrefix}-doc-search`"
            placeholder="标题、slug、负责人、类型…"
            width="18rem"
            aria-label="检索文档"
          />
          <FilterForm2PillListbox
            v-model:open="typeFilterOpen"
            managed-panel
            :wrap-id="`${idPrefix}-doc-type-wrap`"
            :btn-id="`${idPrefix}-doc-type-btn`"
            :panel-id="`${idPrefix}-doc-type-panel`"
            :label-span-id="`${idPrefix}-doc-type-lbl`"
            listbox-aria-label="按文档类型筛选"
            panel-align="end"
            :items="typeFilterItems"
            @select="onTypeFilterSelect"
          >
            {{ typePillLabel }}
          </FilterForm2PillListbox>
          <FilterForm2PillListbox
            v-model:open="statusFilterOpen"
            managed-panel
            :wrap-id="`${idPrefix}-doc-status-wrap`"
            :btn-id="`${idPrefix}-doc-status-btn`"
            :panel-id="`${idPrefix}-doc-status-panel`"
            :label-span-id="`${idPrefix}-doc-status-lbl`"
            listbox-aria-label="按发布状态筛选"
            panel-align="end"
            :items="statusFilterItems"
            @select="onStatusFilterSelect"
          >
            {{ statusPillLabel }}
          </FilterForm2PillListbox>
          <TButton variant="gradient" type="button" @click="openNewModal">新建文档</TButton>
        </template>
      </AdminSectionHead>
      <div class="doc-page__table-wrap">
        <table class="doc-page__table">
          <thead>
            <tr>
              <th>标题</th>
              <th>Slug</th>
              <th>类型</th>
              <th>状态</th>
              <th>版本</th>
              <th>负责人</th>
              <th>更新于</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredDocs" :key="r.id">
              <td>{{ r.title }}</td>
              <td class="doc-page__mono">{{ r.slug }}</td>
              <td>{{ r.type }}</td>
              <td><span :class="statusBadgeClass(r.status)">{{ r.status }}</span></td>
              <td class="doc-page__mono">{{ r.version }}</td>
              <td class="doc-page__mono">{{ r.owner }}</td>
              <td class="doc-page__mono">{{ r.updatedAt }}</td>
              <td>
                <div class="doc-page__ops">
                  <button type="button" class="doc-int__textlink" @click="goEditor(r.id)">编辑</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="filteredDocs.length === 0" class="doc-page__hint">无匹配文档。</p>
    </section>

    <!-- 编辑与版本 -->
    <section v-show="panel === 'editor'" class="doc-page__panel" aria-label="编辑与版本">
      <template v-if="!selectedDoc">
        <AdminSectionHead title="编辑与版本">
          <template #annot>
            <AdminInternalTip heading="编辑与版本 · 未选中文档" explain="文档编辑入口对内说明（原型）">
              <p>未选中时仅提示入口；对内标注不替代列表中的用户引导。</p>
            </AdminInternalTip>
          </template>
          <template #desc>
            请从
            <RouterLink class="doc-int__textlink" :to="{ name: 'tai-admin-docs-list' }">文档列表</RouterLink>
            点「编辑」，或在 URL 加 <code class="doc-page__mono">?id=doc-xxx</code>。
          </template>
        </AdminSectionHead>
      </template>
      <template v-else>
        <AdminSectionHead title="编辑与版本">
          <template #annot>
            <AdminInternalTip heading="编辑与版本 · Markdown" explain="文档编辑器对内说明（原型）">
              <p>预览由 <code>marked</code> + 净化渲染；版本树为 mock。长说明勿塞进顶栏 <code>head-note</code>，用本 ⓘ（<code>#ds-internal-tip</code>）。</p>
            </AdminInternalTip>
          </template>
          <template #desc>
            <strong>{{ selectedDoc.title }}</strong>
            <span class="doc-page__mono"> · {{ selectedDoc.slug }}</span>
            — Markdown 与预览（mock）。
          </template>
          <template #tools>
            <TButton variant="gradient" type="button" @click="saveDraft">保存草稿</TButton>
            <TButton variant="outline" type="button" @click="router.push({ name: 'tai-admin-docs-publish' })">
              去发布队列
            </TButton>
          </template>
        </AdminSectionHead>
        <div class="doc-page__editor-layout">
          <div class="doc-page__editor-main">
            <div class="doc-page__md-preview-grid">
              <div class="doc-page__md-wrap">
                <label :for="`${idPrefix}-body`">Markdown</label>
                <textarea
                  :id="`${idPrefix}-body`"
                  v-model="editorBody"
                  class="doc-page__md-input"
                  spellcheck="false"
                  aria-label="文档 Markdown 正文"
                />
              </div>
              <div class="doc-page__preview-pane">
                <p class="doc-page__preview-pane__title">预览</p>
                <div
                  class="doc-page__preview"
                  tabindex="0"
                  role="region"
                  aria-label="Markdown 渲染预览"
                  v-html="editorPreviewHtml"
                />
              </div>
            </div>
          </div>
          <div>
            <p class="doc-page__cap">版本树（mock）</p>
            <ul class="doc-page__version-list">
              <li v-for="v in versionsForSelected" :key="v.id" class="doc-page__version-item">
                <span class="doc-page__mono">{{ v.version }}</span>
                · {{ v.branch === "draft" ? "草稿" : "发布" }}
                <br />
                <span style="font-size: 0.6875rem; color: var(--muted)">{{ v.at }} · {{ v.author }}</span>
                <br />
                <span style="font-size: 0.6875rem">{{ v.note }}</span>
              </li>
            </ul>
            <p class="doc-page__hint">正式版 diff、分支合并见工程实现。</p>
          </div>
        </div>
      </template>
    </section>

    <!-- 发布与回滚 -->
    <section v-show="panel === 'publish'" class="doc-page__panel" aria-label="发布与回滚">
      <AdminSectionHead title="发布与回滚">
        <template #annot>
          <AdminInternalTip heading="发布与回滚 · 原型" explain="文档发布对内说明（原型）">
            <p>审批单与回滚为状态机示意；静态刷新与 CDN 失效策略见详设 §4.9。</p>
          </AdminInternalTip>
        </template>
        <template #desc>发布审批、排期与一键回滚（mock）；静态站点刷新说明略。</template>
      </AdminSectionHead>
      <div class="doc-page__table-wrap">
        <table class="doc-page__table">
          <thead>
            <tr>
              <th>单号</th>
              <th>文档</th>
              <th>目标版本</th>
              <th>申请人</th>
              <th>申请时间</th>
              <th>状态</th>
              <th>上线/排期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="j in publishRows" :key="j.id">
              <td class="doc-page__mono">{{ j.id }}</td>
              <td>{{ j.docTitle }}</td>
              <td class="doc-page__mono">{{ j.targetVersion }}</td>
              <td class="doc-page__mono">{{ j.requestedBy }}</td>
              <td class="doc-page__mono">{{ j.requestedAt }}</td>
              <td><span :class="publishStatusClass(j.status)">{{ j.status }}</span></td>
              <td class="doc-page__mono">{{ j.scheduledAt }}</td>
              <td>
                <div class="doc-page__ops">
                  <button
                    v-if="j.status === '待发布审批'"
                    type="button"
                    class="doc-int__textlink"
                    @click="approvePublish(j)"
                  >
                    批准上线
                  </button>
                  <button
                    v-if="j.status === '已上线'"
                    type="button"
                    class="doc-int__textlink doc-int__textlink--danger"
                    @click="rollbackPublish(j)"
                  >
                    标记回滚
                  </button>
                  <span v-if="j.status !== '待发布审批' && j.status !== '已上线'" class="doc-page__muted">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 可见范围 -->
    <section v-show="panel === 'visibility'" class="doc-page__panel" aria-label="可见范围">
      <AdminSectionHead title="可见范围">
        <template #annot>
          <AdminInternalTip heading="可见范围 · 原型" explain="文档可见范围对内说明（原型）">
            <p>公开/登录/指定客户组为配置占位；应对接客户组织 ID 与鉴权中间件。</p>
          </AdminInternalTip>
        </template>
        <template #desc>按文档配置公开范围与客户说明（mock）。</template>
        <template #tools>
          <TButton variant="gradient" type="button" @click="openVisModal">新增规则</TButton>
        </template>
      </AdminSectionHead>
      <div class="doc-page__table-wrap">
        <table class="doc-page__table">
          <thead>
            <tr>
              <th>文档</th>
              <th>范围</th>
              <th>客户 / 组织说明</th>
              <th>更新于</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in visibilityRows" :key="v.id">
              <td>{{ v.docTitle }}</td>
              <td>{{ v.scope }}</td>
              <td>{{ v.customerHint }}</td>
              <td class="doc-page__mono">{{ v.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-show="newModalOpen"
        class="or-modal-root doc-int-modal-host"
        role="presentation"
        :aria-hidden="!newModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeNewModal" />
        <ModalPanel title="新建文档" :title-id="`${idPrefix}-new-title`" close-label="关闭" @close="closeNewModal">
          <div class="doc-form-stack">
            <TTextField1Labeled :input-id="`${idPrefix}-nt`" v-model="draftNewTitle" label="标题" placeholder="文档标题" />
            <TTextField1Labeled
              :input-id="`${idPrefix}-ns`"
              v-model="draftNewSlug"
              label="Slug / 路径"
              placeholder="如 docs/my-page 或 /docs/my-page"
            />
            <div>
              <p class="doc-page__cap" style="margin: 0 0 0.35rem">类型</p>
              <FilterForm2PillListbox
                v-model:open="newTypeOpen"
                managed-panel
                :wrap-id="`${idPrefix}-doc-newtype-wrap`"
                :btn-id="`${idPrefix}-doc-newtype-btn`"
                :panel-id="`${idPrefix}-doc-newtype-panel`"
                :label-span-id="`${idPrefix}-doc-newtype-lbl`"
                listbox-aria-label="选择文档类型"
                panel-align="start"
                :items="newDocTypeItems"
                @select="onNewDocTypeSelect"
              >
                {{ draftNewType }}
              </FilterForm2PillListbox>
            </div>
            <p v-if="newFormError" class="doc-form-error">{{ newFormError }}</p>
          </div>
          <template #actions>
            <TButton type="button" @click="closeNewModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveNewDoc">创建</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="visModalOpen"
        class="or-modal-root doc-int-modal-host"
        role="presentation"
        :aria-hidden="!visModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeVisModal" />
        <ModalPanel title="新增可见范围" :title-id="`${idPrefix}-vis-title`" close-label="关闭" @close="closeVisModal">
          <div class="doc-form-stack">
            <div>
              <p class="doc-page__cap" style="margin: 0 0 0.35rem">文档</p>
              <FilterForm2PillListbox
                v-model:open="visDocOpen"
                managed-panel
                :wrap-id="`${idPrefix}-doc-visdoc-wrap`"
                :btn-id="`${idPrefix}-doc-visdoc-btn`"
                :panel-id="`${idPrefix}-doc-visdoc-panel`"
                :label-span-id="`${idPrefix}-doc-visdoc-lbl`"
                listbox-aria-label="选择文档"
                panel-align="start"
                :items="visDocFilterItems"
                @select="onVisDocSelect"
              >
                {{ visDocPillLabel }}
              </FilterForm2PillListbox>
            </div>
            <div>
              <p class="doc-page__cap" style="margin: 0 0 0.35rem">范围</p>
              <FilterForm2PillListbox
                v-model:open="visScopeOpen"
                managed-panel
                :wrap-id="`${idPrefix}-doc-vscope-wrap`"
                :btn-id="`${idPrefix}-doc-vscope-btn`"
                :panel-id="`${idPrefix}-doc-vscope-panel`"
                :label-span-id="`${idPrefix}-doc-vscope-lbl`"
                listbox-aria-label="选择可见范围"
                panel-align="start"
                :items="visScopeItems"
                @select="onVisScopeSelect"
              >
                {{ visScopePillLabel }}
              </FilterForm2PillListbox>
            </div>
            <TTextField1Labeled
              :input-id="`${idPrefix}-vh`"
              v-model="draftVisHint"
              label="客户 / 组织说明"
              placeholder="指定客户时填写 org id 或说明"
            />
            <p v-if="visFormError" class="doc-form-error">{{ visFormError }}</p>
          </div>
          <template #actions>
            <TButton type="button" @click="closeVisModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveVisRule">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="infoOpen"
        class="or-modal-root doc-int-modal-host"
        role="presentation"
        :aria-hidden="!infoOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeInfo" />
        <ModalPanel :title="infoTitle" :title-id="`${idPrefix}-info`" close-label="关闭" @close="closeInfo">
          <p class="or-keys-editor-banner" role="status">{{ infoMsg }}</p>
          <template #actions>
            <TButton variant="gradient" type="button" @click="closeInfo">知道了</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>
  </div>
</template>
