<script setup lang="ts">
import { computed, onMounted, ref, useId } from "vue";
import {
  Delete,
  Edit,
  Plus,
  Upload,
  View,
  Download,
} from "@element-plus/icons-vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery } from "../../utils/adminListFilter";
import {
  ADMIN_TABLE_COL,
  ADMIN_TABLE_COL_OPS,
} from "../../utils/adminTableColumns";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import "./example.css";
import { DEFAULT_EXAMPLE_ROWS, type ExampleRow } from "./mock";

const idPrefix = useId().replace(/:/g, "");

// ==================== 状态 ====================
const tableData = ref<ExampleRow[]>([]);

const searchQ = ref("");
const filterOrg = ref("");
const filterStatus = ref<ExampleRow["status"] | "">("");
const filterDateRange = ref<AdminDateRange | null>(null);

const detailCardOpen = ref(false);
const detailCardId = ref("");

const formOpen = ref(false);
const formMode = ref<"add" | "edit">("add");
const formError = ref("");
const editingId = ref<string | null>(null);

const draftName = ref("");
const draftOrgId = ref("");
const draftStatus = ref<ExampleRow["status"]>("正常");
const draftExpiresAt = ref("");
const draftPurpose = ref("");

// ==================== 计算属性 ====================
const uniqueOrgs = computed(() => {
  const m = new Map<string, string>();
  for (const r of tableData.value) m.set(r.orgId, r.orgName);
  for (const r of DEFAULT_EXAMPLE_ROWS) m.set(r.orgId, r.orgName);
  return [...m.entries()].map(([id, name]) => ({ id, name }));
});

const detailRow = computed(
  () => tableData.value.find((r) => r.id === detailCardId.value) ?? null,
);

const filteredRows = computed(() => {
  let rows = tableData.value;
  if (filterOrg.value) rows = rows.filter((r) => r.orgId === filterOrg.value);
  if (filterStatus.value) rows = rows.filter((r) => r.status === filterStatus.value);
  if (filterDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.createdAt, filterDateRange.value));
  }
  return filterByQuery(rows, searchQ.value, (r) =>
    [r.id, r.name, r.orgName, r.projectName, r.purpose, r.creatorLogin].join(" "),
  );
});

const rowsPg = useAdminTablePagination(filteredRows);

const formTitle = computed(() =>
  formMode.value === "edit" ? "编辑示例" : "新建示例",
);

const formErrorDisplay = computed(() => formError.value);

// ==================== 方法 ====================
function loadData(): void {
  tableData.value = JSON.parse(JSON.stringify(DEFAULT_EXAMPLE_ROWS)) as ExampleRow[];
}

function resetQuery(): void {
  filterOrg.value = "";
  filterStatus.value = "";
  filterDateRange.value = null;
}

function openForm(mode: "add" | "edit", row?: ExampleRow): void {
  formMode.value = mode;
  formError.value = "";
  if (mode === "edit" && row) {
    editingId.value = row.id;
    draftName.value = row.name;
    draftOrgId.value = row.orgId;
    draftStatus.value = row.status;
    draftExpiresAt.value = row.expiresAt;
    draftPurpose.value = row.purpose;
  } else {
    editingId.value = null;
    draftName.value = "";
    draftOrgId.value = uniqueOrgs.value[0]?.id ?? "";
    draftStatus.value = "正常";
    draftExpiresAt.value = "";
    draftPurpose.value = "";
  }
  formOpen.value = true;
}

function saveForm(): void {
  formError.value = "";
  const name = draftName.value.trim();
  const purpose = draftPurpose.value.trim();
  const expiresAt = draftExpiresAt.value.trim();
  const org = uniqueOrgs.value.find((o) => o.id === draftOrgId.value);

  if (!name) {
    formError.value = "请填写名称";
    return;
  }
  if (!purpose) {
    formError.value = "用途说明为必填";
    return;
  }
  if (!expiresAt) {
    formError.value = "请填写到期日";
    return;
  }

  if (formMode.value === "add") {
    const id = `ex-${Date.now()}`;
    tableData.value.unshift({
      id,
      name,
      orgId: draftOrgId.value,
      orgName: org?.name ?? draftOrgId.value,
      projectName: "默认项目",
      creatorLogin: "ops-demo",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      expiresAt,
      purpose,
      status: draftStatus.value,
      bindingCount: 0,
      lastCallAt: "—",
      lastRegion: "—",
    });
  } else if (editingId.value) {
    const row = tableData.value.find((r) => r.id === editingId.value);
    if (!row) {
      formError.value = "未找到该记录";
      return;
    }
    row.name = name;
    row.purpose = purpose;
    row.expiresAt = expiresAt;
    row.orgId = draftOrgId.value;
    row.orgName = org?.name ?? row.orgName;
    row.status = draftStatus.value;
  }
  formOpen.value = false;
}

function openDetailCard(row: ExampleRow): void {
  detailCardId.value = row.id;
  detailCardOpen.value = true;
}

function closeDetailCard(): void {
  detailCardOpen.value = false;
}

function deleteRow(row: ExampleRow): void {
  tableData.value = tableData.value.filter((r) => r.id !== row.id);
}

function statusBadgeClass(s: ExampleRow["status"]): string {
  if (s === "正常") return "example-page__badge example-page__badge--ok";
  if (s === "已冻结") return "example-page__badge example-page__badge--warn";
  if (s === "已吊销") return "example-page__badge example-page__badge--danger";
  return "example-page__badge example-page__badge--muted";
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="example-page">
    <!-- ==================== 列表面板 ==================== -->
    <div class="example-page__panel">
      <AdminSectionHead toolbar-only title="列表页模板示例">
        <template #annot>
          <AdminInternalTip heading="列表页模板 · 规范演示" explain="搜索、筛选、表格、操作按钮的规范实现">
            <p>参考 API 密钥页面的平台密钥，展示完整的列表页规范。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="searchQ"
            :input-id="`${idPrefix}-example-search`"
            search-placeholder="名称、客户、项目、用途…"
            search-aria-label="检索示例数据"
            @reset="resetQuery"
          >
            <template #filters>
              <el-select
                v-model="filterOrg"
                filterable
                clearable
                placeholder="客户组织"
                aria-label="按客户组织筛选"
                style="width: 10rem"
              >
                <el-option v-for="o in uniqueOrgs" :key="o.id" :label="o.name" :value="o.id" />
              </el-select>
              <el-select v-model="filterStatus" clearable placeholder="状态" style="width: 7rem">
                <el-option label="正常" value="正常" />
                <el-option label="已冻结" value="已冻结" />
                <el-option label="已吊销" value="已吊销" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary" :icon="Plus" @click="openForm('add')">
                新建
              </el-button>
              <el-button :icon="Upload">导入</el-button>
              <el-button :icon="Download">导出</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>

      <el-table
        :data="rowsPg.paginatedRows"
        row-key="id"
        class="admin-ep-table-wrap"
      >
        <el-table-column
          prop="name"
          label="名称"
          :min-width="ADMIN_TABLE_COL.primary"
          sortable
          show-overflow-tooltip
        />
        <el-table-column prop="orgName" label="客户 / 项目" :min-width="ADMIN_TABLE_COL.xl" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
              {{ scope.row.orgName }}
              <br />
              <span class="example-page__mono example-page__muted">{{ scope.row.projectName }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="expiresAt" label="到期" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="bindingCount" label="绑定" :min-width="ADMIN_TABLE_COL.xs" sortable />
        <el-table-column
          prop="purpose"
          label="用途"
          :min-width="ADMIN_TABLE_COL.md"
          sortable
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.xs" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
              <span :class="statusBadgeClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="lastCallAt" label="最近调用" :min-width="ADMIN_TABLE_COL.lg" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
              {{ scope.row.lastCallAt }}
              <br />
              <span class="example-page__muted" style="font-size: 0.6875rem">
                {{ scope.row.lastRegion }}
              </span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.md" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <div class="admin-ep-row-actions" @click.stop>
                <el-button link type="primary" :icon="View" @click="openDetailCard(scope.row)">
                  详情
                </el-button>
                <el-button link type="primary" :icon="Edit" @click="openForm('edit', scope.row)">
                  编辑
                </el-button>
                <el-button link type="danger" :icon="Delete" @click="deleteRow(scope.row)">
                  删除
                </el-button>
              </div>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <AdminTablePagination
        v-model:current-page="rowsPg.currentPage"
        v-model:page-size="rowsPg.pageSize"
        :total="rowsPg.total"
      />
    </div>

    <!-- ==================== 详情弹窗 ==================== -->
    <AdminDialog v-model="detailCardOpen" :title="detailRow?.name ?? '详情'" width="640px">
      <div v-if="detailRow" class="example-page__detail-grid">
        <div>
          <div class="example-page__detail-k">ID</div>
          <p class="example-page__detail-v example-page__mono">{{ detailRow.id }}</p>
        </div>
        <div>
          <div class="example-page__detail-k">名称</div>
          <p class="example-page__detail-v">{{ detailRow.name }}</p>
        </div>
        <div>
          <div class="example-page__detail-k">状态</div>
          <p class="example-page__detail-v">
            <span :class="statusBadgeClass(detailRow.status)">{{ detailRow.status }}</span>
          </p>
        </div>
        <div>
          <div class="example-page__detail-k">到期日</div>
          <p class="example-page__detail-v">{{ detailRow.expiresAt }}</p>
        </div>
        <div>
          <div class="example-page__detail-k">用途说明</div>
          <p class="example-page__detail-v">{{ detailRow.purpose }}</p>
        </div>
        <div>
          <div class="example-page__detail-k">客户组织</div>
          <p class="example-page__detail-v">{{ detailRow.orgName }}（{{ detailRow.orgId }}）</p>
        </div>
        <div>
          <div class="example-page__detail-k">项目</div>
          <p class="example-page__detail-v">{{ detailRow.projectName }}</p>
        </div>
        <div>
          <div class="example-page__detail-k">创建人 / 时间</div>
          <p class="example-page__detail-v example-page__mono">
            {{ detailRow.creatorLogin }} · {{ detailRow.createdAt }}
          </p>
        </div>
        <div>
          <div class="example-page__detail-k">最近调用</div>
          <p class="example-page__detail-v">{{ detailRow.lastCallAt }} · {{ detailRow.lastRegion }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeDetailCard">关闭</el-button>
      </template>
    </AdminDialog>

    <!-- ==================== 新建/编辑弹窗 ==================== -->
    <AdminDialog v-model="formOpen" :title="formTitle" width="480px">
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="名称" required>
          <el-input v-model="draftName" placeholder="如：生产网关" />
        </el-form-item>
        <el-form-item label="用途说明" required>
          <el-input v-model="draftPurpose" placeholder="必填，如：生产网关上游" />
        </el-form-item>
        <el-form-item label="到期日" required>
          <el-input v-model="draftExpiresAt" placeholder="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="客户组织" required>
          <el-select v-model="draftOrgId" filterable style="width: 100%">
            <el-option v-for="o in uniqueOrgs" :key="o.id" :label="o.name" :value="o.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="draftStatus" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="已冻结" value="已冻结" />
            <el-option label="已吊销" value="已吊销" />
          </el-select>
        </el-form-item>
        <p v-if="formErrorDisplay" class="example-page__form-err">{{ formErrorDisplay }}</p>
      </el-form>
      <template #footer>
        <el-button @click="formOpen = false">取消</el-button>
        <el-button type="primary" @click="saveForm">保存</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
