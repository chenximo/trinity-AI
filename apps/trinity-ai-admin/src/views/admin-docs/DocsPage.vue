<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import { filterByQuery } from "../../utils/adminListFilter";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
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

const searchQ = ref("");
const filterType = ref("");
const filterStatus = ref("");
const publishSearchQ = ref("");
const publishStatusFilter = ref("");
const visSearchQ = ref("");

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
  let rows = docRows.value;
  if (filterType.value) rows = rows.filter((r) => r.type === filterType.value);
  if (filterStatus.value) rows = rows.filter((r) => r.status === filterStatus.value);
  return filterByQuery(rows, searchQ.value, (r) =>
    [r.title, r.slug, r.owner, r.type, r.status, r.version].join(" "),
  );
});

const filteredPublishRows = computed(() => {
  let rows = publishRows.value;
  if (publishStatusFilter.value) rows = rows.filter((r) => r.status === publishStatusFilter.value);
  return filterByQuery(rows, publishSearchQ.value, (r) =>
    [r.id, r.docTitle, r.targetVersion, r.requestedBy, r.requestedAt, r.status, r.scheduledAt].join(" "),
  );
});

const filteredVisibilityRows = computed(() =>
  filterByQuery(visibilityRows.value, visSearchQ.value, (r) =>
    [r.docTitle, r.scope, r.customerHint, r.updatedAt].join(" "),
  ),
);

function resetDocsQuery(): void {
  filterType.value = "";
  filterStatus.value = "";
}

function resetPublishQuery(): void {
  publishStatusFilter.value = "";
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
  newModalOpen.value = true;
}

function closeNewModal(): void {
  newModalOpen.value = false;
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
  visModalOpen.value = true;
}

function closeVisModal(): void {
  visModalOpen.value = false;
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

onMounted(() => loadAll());

const docsPg = useAdminTablePagination(filteredDocs);
const publishPg = useAdminTablePagination(filteredPublishRows);
const visibilityPg = useAdminTablePagination(filteredVisibilityRows);
</script>

<template>
  <div class="doc-page">
    <el-card v-show="panel === 'list'" shadow="never" class="admin-ep-card doc-page__panel" aria-label="文档列表">
      <AdminSectionHead toolbar-only title="文档列表">
        <template #annot>
          <AdminInternalTip heading="文档列表 · 原型" explain="文档列表对内说明（原型）">
            <p>元数据与筛选写 <code>localStorage</code> 示意；与静态站点发布流水线对齐在工程期。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="searchQ"
            :input-id="`${idPrefix}-doc-search`"
            search-placeholder="标题、slug、负责人、类型…"
            search-aria-label="检索文档"
            @reset="resetDocsQuery"
          >
            <template #filters>
              <el-select v-model="filterType" clearable placeholder="文档类型" style="width: 9rem">
                <el-option v-for="(v, i) in TYPE_FILTER_VALUES" :key="i" :label="TYPE_FILTER_LABELS[i] ?? ''" :value="v" />
              </el-select>
              <el-select v-model="filterStatus" clearable placeholder="发布状态" style="width: 9rem">
                <el-option v-for="(v, i) in STATUS_FILTER_VALUES" :key="i" :label="STATUS_FILTER_LABELS[i] ?? ''" :value="v" />
              </el-select>
            </template>
            <el-button type="primary" @click="openNewModal">新建文档</el-button>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="docsPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="title" label="标题" min-width="112" sortable/>
        <el-table-column prop="slug" label="Slug" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.slug }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="112" sortable/>
        <el-table-column label="状态" width="88">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="statusBadgeClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.version }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="96" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.owner }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新于" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.updatedAt }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions doc-page__ops">
              <el-button link type="primary" @click="goEditor(scope.row.id)">编辑</el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="docsPg.currentPage"
        v-model:page-size="docsPg.pageSize"
        :total="docsPg.total"
      />
      <p v-if="filteredDocs.length === 0" class="doc-page__hint">无匹配文档。</p>
    </el-card>

    <el-card v-show="panel === 'editor'" shadow="never" class="admin-ep-card doc-page__panel" aria-label="编辑与版本">
      <template v-if="!selectedDoc">
        <AdminSectionHead toolbar-only title="编辑与版本">
          <template #annot>
            <AdminInternalTip heading="编辑与版本 · 未选中文档" explain="文档编辑入口对内说明（原型）">
              <p>未选中时仅提示入口；对内标注不替代列表中的用户引导。</p>
            </AdminInternalTip>
          </template>
</AdminSectionHead>
      </template>
      <template v-else>
        <AdminSectionHead toolbar-only title="编辑与版本">
          <template #annot>
            <AdminInternalTip heading="编辑与版本 · Markdown" explain="文档编辑器对内说明（原型）">
              <p>预览由 <code>marked</code> + 净化渲染；版本树为 mock。长说明勿塞进顶栏 <code>head-note</code>，用本 ⓘ（<code>#ds-internal-tip</code>）。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <el-button type="primary" @click="saveDraft">保存草稿</el-button>
            <el-button @click="router.push({ name: 'tai-admin-docs-publish' })">去发布队列</el-button>
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
    </el-card>

    <el-card v-show="panel === 'publish'" shadow="never" class="admin-ep-card doc-page__panel" aria-label="发布与回滚">
      <AdminSectionHead toolbar-only title="发布与回滚">
        <template #annot>
          <AdminInternalTip heading="发布与回滚 · 原型" explain="文档发布对内说明（原型）">
            <p>审批单与回滚为状态机示意；静态刷新与 CDN 失效策略见详设 §4.9。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="publishSearchQ"
            :input-id="`${idPrefix}-doc-pub-q`"
            search-placeholder="单号、文档、申请人…"
            search-aria-label="检索发布单"
            @reset="resetPublishQuery"
          >
            <template #filters>
              <el-select v-model="publishStatusFilter" clearable placeholder="状态" style="width: 9rem">
                <el-option label="待发布审批" value="待发布审批" />
                <el-option label="已上线" value="已上线" />
                <el-option label="已回滚" value="已回滚" />
              </el-select>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="publishPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="单号" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.id }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="docTitle" label="文档" min-width="96" sortable/>
        <el-table-column prop="targetVersion" label="目标版本" width="96" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.targetVersion }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="requestedBy" label="申请人" width="96" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.requestedBy }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="requestedAt" label="申请时间" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.requestedAt }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="状态" width="96">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="publishStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="scheduledAt" label="上线/排期" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.scheduledAt }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="112" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions doc-page__ops">
              <el-button v-if="scope.row.status === '待发布审批'" link type="primary" @click="approvePublish(scope.row)">批准上线</el-button>
              <el-button v-if="scope.row.status === '已上线'" link type="danger" @click="rollbackPublish(scope.row)">标记回滚</el-button>
              <span v-if="scope.row.status !== '待发布审批' && scope.row.status !== '已上线'" class="doc-page__muted">—</span>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="publishPg.currentPage"
        v-model:page-size="publishPg.pageSize"
        :total="publishPg.total"
      />
    </el-card>

    <el-card v-show="panel === 'visibility'" shadow="never" class="admin-ep-card doc-page__panel" aria-label="可见范围">
      <AdminSectionHead toolbar-only title="可见范围">
        <template #annot>
          <AdminInternalTip heading="可见范围 · 原型" explain="文档可见范围对内说明（原型）">
            <p>公开/登录/指定客户组为配置占位；应对接客户组织 ID 与鉴权中间件。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="visSearchQ"
            :input-id="`${idPrefix}-doc-vis-q`"
            search-placeholder="文档、范围、客户说明…"
            search-aria-label="检索可见范围"
          >
            <el-button type="primary" @click="openVisModal">新增规则</el-button>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="visibilityPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="docTitle" label="文档" min-width="112" sortable/>
        <el-table-column prop="scope" label="范围" width="96" sortable/>
        <el-table-column prop="customerHint" label="客户 / 组织说明" min-width="128" sortable/>
        <el-table-column prop="updatedAt" label="更新于" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="doc-page__mono">{{ scope.row.updatedAt }}</span>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="visibilityPg.currentPage"
        v-model:page-size="visibilityPg.pageSize"
        :total="visibilityPg.total"
      />
    </el-card>

    <AdminDialog v-model="newModalOpen" title="新建文档">
      <el-form label-position="top" class="admin-ep-form doc-form-stack">
        <el-form-item label="标题">
          <el-input :id="`${idPrefix}-nt`" v-model="draftNewTitle" placeholder="文档标题" />
        </el-form-item>
        <el-form-item label="Slug / 路径">
          <el-input :id="`${idPrefix}-ns`" v-model="draftNewSlug" placeholder="如 docs/my-page 或 /docs/my-page" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="draftNewType" style="width: 100%">
            <el-option v-for="t in NEW_DOC_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
      </el-form>
      <p v-if="newFormError" class="doc-form-error">{{ newFormError }}</p>
      <template #footer>
        <el-button @click="closeNewModal">取消</el-button>
        <el-button type="primary" @click="saveNewDoc">创建</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="visModalOpen" title="新增可见范围">
      <el-form label-position="top" class="admin-ep-form doc-form-stack">
        <el-form-item label="文档">
          <el-select v-model="draftVisDocId" filterable style="width: 100%">
            <el-option v-for="d in docRows" :key="d.id" :label="d.title" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="范围">
          <el-select v-model="draftVisScope" style="width: 100%">
            <el-option v-for="s in VIS_SCOPES" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户 / 组织说明">
          <el-input :id="`${idPrefix}-vh`" v-model="draftVisHint" placeholder="指定客户时填写 org id 或说明" />
        </el-form-item>
      </el-form>
      <p v-if="visFormError" class="doc-form-error">{{ visFormError }}</p>
      <template #footer>
        <el-button @click="closeVisModal">取消</el-button>
        <el-button type="primary" @click="saveVisRule">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="infoOpen" :title="infoTitle">
      <p class="or-keys-editor-banner" role="status">{{ infoMsg }}</p>
      <template #footer>
        <el-button type="primary" @click="closeInfo">知道了</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
