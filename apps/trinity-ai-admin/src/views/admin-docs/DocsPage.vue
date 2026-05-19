<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Edit } from "@element-plus/icons-vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import { filterByQuery } from "../../utils/adminListFilter";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { ADMIN_TABLE_COL, ADMIN_TABLE_COL_OPS } from "../../utils/adminTableColumns";
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
  searchQ.value = "";
  filterType.value = "";
  filterStatus.value = "";
}

function resetPublishQuery(): void {
  publishSearchQ.value = "";
  publishStatusFilter.value = "";
}

function resetVisQuery(): void {
  visSearchQ.value = "";
}

const editorDocMissing = computed(
  () => Boolean(selectedEditorId.value && !selectedDoc.value),
);

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
  goEditor(id);
}

function goEditor(id: string): void {
  void router.push({
    name: "tai-admin-docs-list",
    query: id ? { id } : {},
  });
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

watch(
  () => panel.value,
  (p) => {
    if (p !== "editor") return;
    void router.replace({
      name: "tai-admin-docs-list",
      query: selectedEditorId.value ? { id: selectedEditorId.value } : {},
    });
  },
  { immediate: true },
);

const docsPg = useAdminTablePagination(filteredDocs);
const publishPg = useAdminTablePagination(filteredPublishRows);
const visibilityPg = useAdminTablePagination(filteredVisibilityRows);
</script>

<template>
  <div class="doc-page doc-page--flow">
    <el-card v-show="panel === 'list'" shadow="never" class="admin-ep-card doc-page__panel" aria-label="文档">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip
            :heading="selectedDoc ? '文档 · 编辑中' : '文档 · 原型'"
            explain="文档列表与编辑对内说明（原型）"
          >
            <p v-if="selectedDoc">
              左侧切换文档；正文与预览写 <code>localStorage</code>。URL：<code>?id=doc-xxx</code>。
            </p>
            <p v-else>点击「编辑」或行进入编辑区；筛选与新建在同一页。</p>
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
              <el-select
                v-model="filterType"
                clearable
                placeholder="类型"
                aria-label="按文档类型筛选"
                style="width: 8rem"
              >
                <el-option label="用户指南" value="用户指南" />
                <el-option label="供应商 API" value="供应商 API" />
                <el-option label="公告" value="公告" />
                <el-option label="内部 Runbook" value="内部 Runbook" />
              </el-select>
              <el-select
                v-model="filterStatus"
                clearable
                placeholder="状态"
                aria-label="按发布状态筛选"
                style="width: 8rem"
              >
                <el-option label="草稿" value="草稿" />
                <el-option label="评审中" value="评审中" />
                <el-option label="已发布" value="已发布" />
                <el-option label="已归档" value="已归档" />
              </el-select>
            </template>
            <template #actions>
              <template v-if="selectedDoc">
                <el-button type="primary" @click="saveDraft">保存草稿</el-button>
                <el-button @click="router.push({ name: 'tai-admin-docs-publish' })">去发布队列</el-button>
                <el-button @click="goEditor('')">关闭编辑</el-button>
              </template>
              <el-button v-else type="primary" @click="openNewModal">新建文档</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>

      <div :class="['doc-page__workspace', { 'doc-page__workspace--editing': selectedDoc }]">
        <aside v-if="selectedDoc" class="doc-page__workspace-aside" aria-label="文档目录">
          <p class="doc-page__workspace-aside-cap">文档（{{ filteredDocs.length }}）</p>
          <nav class="doc-page__workspace-nav">
            <button
              v-for="row in filteredDocs"
              :key="row.id"
              type="button"
              class="doc-page__workspace-nav-item"
              :class="{ 'is-active': row.id === selectedEditorId }"
              @click="goEditor(row.id)"
            >
              <span class="doc-page__workspace-nav-title">{{ row.title }}</span>
              <span class="doc-page__workspace-nav-meta">
                <span :class="statusBadgeClass(row.status)">{{ row.status }}</span>
                · {{ row.version }}
              </span>
            </button>
          </nav>
        </aside>

        <div class="doc-page__workspace-main">
          <template v-if="!selectedDoc">
            <el-table
              :data="docsPg.paginatedRows"
              row-key="id"
              class="admin-ep-table-wrap doc-page__picker-table"
              style="width: 100%"
              :default-sort="{ prop: 'updatedAt', order: 'descending' }"
              highlight-current-row
              @row-click="(row: DocRow) => goEditor(row.id)"
            >
              <el-table-column
                prop="title"
                label="标题"
                :min-width="ADMIN_TABLE_COL.primary"
                sortable
                show-overflow-tooltip
              />
              <el-table-column
                prop="slug"
                label="Slug"
                :min-width="ADMIN_TABLE_COL.md"
                sortable
                show-overflow-tooltip
              >
                <template #default="scope">
                  <template v-if="scope?.row">
                    <span class="doc-page__mono">{{ scope.row.slug }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column
                prop="type"
                label="类型"
                :min-width="ADMIN_TABLE_COL.md"
                sortable
                show-overflow-tooltip
              />
              <el-table-column label="状态" :min-width="ADMIN_TABLE_COL.sm" sortable prop="status">
                <template #default="scope">
                  <template v-if="scope?.row">
                    <span :class="statusBadgeClass(scope.row.status)">{{ scope.row.status }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="版本" :min-width="ADMIN_TABLE_COL.xs" sortable prop="version">
                <template #default="scope">
                  <template v-if="scope?.row">
                    <span class="doc-page__mono">{{ scope.row.version }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column
                prop="owner"
                label="负责人"
                :min-width="ADMIN_TABLE_COL.sm"
                sortable
                show-overflow-tooltip
              />
              <el-table-column label="更新于" :min-width="ADMIN_TABLE_COL.lg" sortable prop="updatedAt">
                <template #default="scope">
                  <template v-if="scope?.row">
                    <span class="doc-page__mono">{{ scope.row.updatedAt }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.sm">
                <template #default="scope">
                  <template v-if="scope?.row">
                    <div class="admin-ep-row-actions" @click.stop>
                      <el-button link type="primary" :icon="Edit" @click="goEditor(scope.row.id)">编辑</el-button>
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
          </template>

          <template v-else-if="editorDocMissing">
            <p class="doc-page__hint">
              未找到文档 <code class="doc-page__mono">{{ selectedEditorId }}</code>，请
              <el-button link type="primary" @click="goEditor('')">返回列表</el-button>。
            </p>
          </template>

          <template v-else>
            <div class="doc-page__editor-meta">
              <h2 class="doc-page__editor-meta-title">{{ selectedDoc!.title }}</h2>
              <p class="doc-page__editor-meta-sub">
                <span class="doc-page__mono">{{ selectedDoc!.slug }}</span>
                · {{ selectedDoc!.type }}
                ·
                <span :class="statusBadgeClass(selectedDoc!.status)">{{ selectedDoc!.status }}</span>
                · {{ selectedDoc!.version }}
                · 负责人 {{ selectedDoc!.owner }}
                · 更新 {{ selectedDoc!.updatedAt }}
              </p>
            </div>
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
                    <span class="doc-page__version-meta">{{ v.at }} · {{ v.author }}</span>
                    <br />
                    <span class="doc-page__version-note">{{ v.note }}</span>
                  </li>
                </ul>
                <p class="doc-page__hint">正式版 diff、分支合并见工程实现。</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </el-card>

    <el-card v-show="panel === 'publish'" shadow="never" class="admin-ep-card doc-page__panel" aria-label="发布与回滚">
      <AdminSectionHead toolbar-only>
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
              <el-select
                v-model="publishStatusFilter"
                clearable
                placeholder="状态"
                aria-label="按发布单状态筛选"
                style="width: 8rem"
              >
                <el-option label="待发布审批" value="待发布审批" />
                <el-option label="已上线" value="已上线" />
                <el-option label="已回滚" value="已回滚" />
              </el-select>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table
        :data="publishPg.paginatedRows"
        row-key="id"
        class="admin-ep-table-wrap"
        style="width: 100%"
        :default-sort="{ prop: 'requestedAt', order: 'descending' }"
      >
        <el-table-column label="单号" :min-width="ADMIN_TABLE_COL.md" sortable prop="id">
          <template #default="scope">
            <template v-if="scope?.row">
              <span class="doc-page__mono">{{ scope.row.id }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="docTitle"
          label="文档"
          :min-width="ADMIN_TABLE_COL.primary"
          flex
          sortable
          show-overflow-tooltip
        />
        <el-table-column label="目标版本" :min-width="ADMIN_TABLE_COL.xs" sortable prop="targetVersion">
          <template #default="scope">
            <template v-if="scope?.row">
              <span class="doc-page__mono">{{ scope.row.targetVersion }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="requestedBy"
          label="申请人"
          :min-width="ADMIN_TABLE_COL.sm"
          sortable
          show-overflow-tooltip
        />
        <el-table-column label="申请时间" :min-width="ADMIN_TABLE_COL.lg" sortable prop="requestedAt">
          <template #default="scope">
            <template v-if="scope?.row">
              <span class="doc-page__mono">{{ scope.row.requestedAt }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="状态" :min-width="ADMIN_TABLE_COL.sm" sortable prop="status">
          <template #default="scope">
            <template v-if="scope?.row">
              <span :class="publishStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="上线/排期" :min-width="ADMIN_TABLE_COL.lg" sortable prop="scheduledAt">
          <template #default="scope">
            <template v-if="scope?.row">
              <span class="doc-page__mono">{{ scope.row.scheduledAt }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.md" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <div class="admin-ep-row-actions">
                <el-button
                  v-if="scope.row.status === '待发布审批'"
                  link
                  type="primary"
                  @click="approvePublish(scope.row)"
                >
                  批准上线
                </el-button>
                <el-button
                  v-if="scope.row.status === '已上线'"
                  link
                  type="danger"
                  @click="rollbackPublish(scope.row)"
                >
                  标记回滚
                </el-button>
                <span
                  v-if="scope.row.status !== '待发布审批' && scope.row.status !== '已上线'"
                  class="doc-page__muted"
                >
                  —
                </span>
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
      <AdminSectionHead toolbar-only>
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
            @reset="resetVisQuery"
          >
            <template #actions>
              <el-button type="primary" @click="openVisModal">新增规则</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="visibilityPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column
          prop="docTitle"
          label="文档"
          :min-width="ADMIN_TABLE_COL.primary"
          flex
          sortable
          show-overflow-tooltip
        />
        <el-table-column prop="scope" label="范围" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column
          prop="customerHint"
          label="客户 / 组织说明"
          :min-width="ADMIN_TABLE_COL.md"
          flex
          sortable
          show-overflow-tooltip
        />
        <el-table-column label="更新于" :min-width="ADMIN_TABLE_COL.lg" sortable prop="updatedAt">
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
