<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Edit } from "@element-plus/icons-vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { filterByQuery, uniqueFieldValues } from "../../utils/adminListFilter";
import "./customers.css";
import {
  CONTRACT_ROWS,
  CREDIT_ROWS,
  CUSTOMER_PANEL_ORDER,
  DEFAULT_TENANT_ROWS,
  INVOICE_APPLICATION_ROWS,
  INVOICE_HEADER_ROWS,
  ORG_PROJECT_ROWS,
  type CustomerPanelId,
  type TenantRow,
  type TenantStatus,
} from "./mock";
import {
  readTenantRowsJson,
  readTenantSearchQ,
  writeTenantRowsJson,
  writeTenantSearchQ,
} from "./customersInteractions";

const route = useRoute();
const router = useRouter();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<CustomerPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && CUSTOMER_PANEL_ORDER.includes(id as CustomerPanelId)) return id as CustomerPanelId;
  return "tenants";
});

const tenantRows = ref<TenantRow[]>([]);
const searchQ = ref("");
const tenantStatusFilter = ref("");
const orgSearchQ = ref("");
const contractSearchQ = ref("");
const contractStatusFilter = ref("");
const invoiceHeaderSearchQ = ref("");
const invoiceAppSearchQ = ref("");
const invoiceAppStatusFilter = ref("");
const creditSearchQ = ref("");
const creditApprovalFilter = ref("");

const tenantModalOpen = ref(false);
const tenantModalMode = ref<"add" | "edit">("add");
const tenantEditingId = ref<string | null>(null);
const tenantFormError = ref("");
const draftTenantId = ref("");
const draftTenantName = ref("");
const draftTenantStatus = ref<TenantStatus>("试用");
const draftOwnerLogin = ref("");
const draftAuthSummary = ref("");

const tenantModalTitle = computed(() =>
  tenantModalMode.value === "edit" ? "编辑租户" : "新建租户"
);

const filteredTenants = computed(() => {
  let rows = tenantRows.value;
  if (tenantStatusFilter.value) rows = rows.filter((r) => r.status === tenantStatusFilter.value);
  return filterByQuery(rows, searchQ.value, (r) =>
    [r.id, r.name, r.ownerLogin, r.contractNo, r.authSummary].join(" "),
  );
});

const filteredOrgRows = computed(() =>
  filterByQuery(orgRowsForFilter.value, orgSearchQ.value, (r) =>
    [r.id, r.tenantName, r.projectName, r.billingTag, r.updatedAt].join(" "),
  ),
);

const contractStatusOptions = computed(() => uniqueFieldValues(CONTRACT_ROWS, (r) => r.status));

const filteredContractRows = computed(() => {
  let rows = contractRowsForFilter.value;
  if (contractStatusFilter.value) rows = rows.filter((r) => r.status === contractStatusFilter.value);
  return filterByQuery(rows, contractSearchQ.value, (r) =>
    [r.id, r.tenantName, r.skuName, r.skuId, r.discount, r.startDate, r.endDate, r.status].join(" "),
  );
});

const filteredInvoiceHeaders = computed(() =>
  filterByQuery(INVOICE_HEADER_ROWS, invoiceHeaderSearchQ.value, (r) =>
    [r.id, r.tenantName, r.title, r.taxId, r.invoiceType, r.email].join(" "),
  ),
);

const filteredInvoiceApps = computed(() => {
  let rows = INVOICE_APPLICATION_ROWS;
  if (invoiceAppStatusFilter.value) rows = rows.filter((r) => r.status === invoiceAppStatusFilter.value);
  return filterByQuery(rows, invoiceAppSearchQ.value, (r) =>
    [r.id, r.tenantName, r.period, r.amount, r.status, r.appliedAt].join(" "),
  );
});

const filteredCreditRows = computed(() => {
  let rows = creditRowsForFilter.value;
  if (creditApprovalFilter.value) rows = rows.filter((r) => r.approvalState === creditApprovalFilter.value);
  return filterByQuery(rows, creditSearchQ.value, (r) =>
    [r.id, r.tenantName, r.limitAmount, r.usedAmount, r.approvalState, r.note].join(" "),
  );
});

function resetTenantQuery(): void {
  tenantStatusFilter.value = "";
}

function resetContractQuery(): void {
  contractStatusFilter.value = "";
}

function resetInvoiceAppQuery(): void {
  invoiceAppStatusFilter.value = "";
}

function resetCreditQuery(): void {
  creditApprovalFilter.value = "";
}

const orgRowsForFilter = computed(() => {
  const tid = route.query.tenantId;
  if (typeof tid === "string" && tid) {
    return ORG_PROJECT_ROWS.filter((r) => r.tenantId === tid);
  }
  return ORG_PROJECT_ROWS;
});

const contractRowsForFilter = computed(() => {
  const tid = route.query.tenantId;
  if (typeof tid === "string" && tid) {
    return CONTRACT_ROWS.filter((r) => r.tenantId === tid);
  }
  return CONTRACT_ROWS;
});

const creditRowsForFilter = computed(() => {
  const tid = route.query.tenantId;
  if (typeof tid === "string" && tid) {
    return CREDIT_ROWS.filter((x) => x.tenantId === tid);
  }
  return CREDIT_ROWS;
});

function tenantStatusClass(s: TenantStatus): string {
  if (s === "正式") return "cus-page__badge cus-page__badge--ok";
  if (s === "试用") return "cus-page__badge cus-page__badge--trial";
  return "cus-page__badge cus-page__badge--off";
}

function contractStatusClass(s: (typeof CONTRACT_ROWS)[number]["status"]): string {
  if (s === "即将到期") return "cus-page__badge cus-page__badge--warn";
  if (s === "已到期") return "cus-page__badge cus-page__badge--off";
  return "cus-page__badge cus-page__badge--ok";
}

function invoiceAppStatusClass(s: (typeof INVOICE_APPLICATION_ROWS)[number]["status"]): string {
  if (s === "待开票") return "cus-page__badge cus-page__badge--pending";
  if (s === "已驳回") return "cus-page__badge cus-page__badge--reject";
  return "cus-page__badge cus-page__badge--done";
}

function creditApprovalClass(s: (typeof CREDIT_ROWS)[number]["approvalState"]): string {
  if (s === "待审批") return "cus-page__badge cus-page__badge--pending";
  return "cus-page__badge cus-page__badge--ok";
}

function loadTenants(): void {
  const raw = readTenantRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        tenantRows.value = parsed as TenantRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  tenantRows.value = JSON.parse(JSON.stringify(DEFAULT_TENANT_ROWS)) as TenantRow[];
}

function persistTenants(): void {
  writeTenantRowsJson(JSON.stringify(tenantRows.value));
}

function openTenantAdd(): void {
  tenantModalMode.value = "add";
  tenantEditingId.value = null;
  draftTenantId.value = "";
  draftTenantName.value = "";
  draftTenantStatus.value = "试用";
  draftOwnerLogin.value = "";
  draftAuthSummary.value = "待认证";
  tenantFormError.value = "";
  tenantModalOpen.value = true;
}

function openTenantEdit(row: TenantRow): void {
  tenantModalMode.value = "edit";
  tenantEditingId.value = row.id;
  draftTenantId.value = row.id;
  draftTenantName.value = row.name;
  draftTenantStatus.value = row.status;
  draftOwnerLogin.value = row.ownerLogin;
  draftAuthSummary.value = row.authSummary;
  tenantFormError.value = "";
  tenantModalOpen.value = true;
}

function closeTenantModal(): void {
  tenantModalOpen.value = false;
}

function submitTenantForm(): void {
  const name = draftTenantName.value.trim();
  const owner = draftOwnerLogin.value.trim();
  if (!name || !owner) {
    tenantFormError.value = "请填写租户名称与主账号。";
    return;
  }
  const now = "2026-05-15 12:00";
  if (tenantModalMode.value === "add") {
    const id = draftTenantId.value.trim() || `org-${name.toLowerCase().replace(/\s+/g, "-")}`;
    if (tenantRows.value.some((r) => r.id === id)) {
      tenantFormError.value = "租户 ID 已存在。";
      return;
    }
    tenantRows.value.push({
      id,
      name,
      status: draftTenantStatus.value,
      authSummary: draftAuthSummary.value.trim() || "待认证",
      ownerLogin: owner,
      contractNo: "—",
      creditUsed: "—",
      updatedAt: now,
    });
  } else {
    const id = tenantEditingId.value;
    const row = tenantRows.value.find((r) => r.id === id);
    if (!row) return;
    row.name = name;
    row.status = draftTenantStatus.value;
    row.ownerLogin = owner;
    row.authSummary = draftAuthSummary.value.trim() || row.authSummary;
    row.updatedAt = now;
  }
  persistTenants();
  tenantModalOpen.value = false;
}

function goPanel(name: string, query?: Record<string, string>): void {
  void router.push({ name, query });
}

onMounted(() => {
  searchQ.value = readTenantSearchQ();
  loadTenants();
});

watch(searchQ, (v) => writeTenantSearchQ(v));

const tenantsPg = useAdminTablePagination(filteredTenants);
const orgPg = useAdminTablePagination(filteredOrgRows);
const contractPg = useAdminTablePagination(filteredContractRows);
const invoiceHeaderPg = useAdminTablePagination(filteredInvoiceHeaders);
const invoiceAppPg = useAdminTablePagination(filteredInvoiceApps);
const creditPg = useAdminTablePagination(filteredCreditRows);
</script>

<template>
  <div class="cus-page">
    <el-card v-show="panel === 'tenants'" shadow="never" class="admin-ep-card cus-page__panel" aria-label="租户列表">
      <AdminSectionHead toolbar-only title="租户列表">
        <template #annot>
          <AdminInternalTip heading="租户列表 · 原型" explain="租户列表对内说明（原型）">
            <p>检索与状态为 mock；与密钥归属、用量分摊字段在工程期对齐主数据。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="searchQ"
            :input-id="`${idPrefix}-tenant-search`"
            search-placeholder="名称 / ID / 主账号 / 合同号"
            search-aria-label="检索租户"
            @reset="resetTenantQuery"
          >
            <template #filters>
              <el-select v-model="tenantStatusFilter" clearable placeholder="状态" style="width: 7rem">
                <el-option label="正式" value="正式" />
                <el-option label="试用" value="试用" />
                <el-option label="停用" value="停用" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary" @click="openTenantAdd">新建租户</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="tenantsPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="租户 ID" min-width="96" sortable/>
        <el-table-column prop="name" label="名称" min-width="96" sortable/>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="tenantStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="authSummary" label="认证摘要" min-width="112" sortable/>
        <el-table-column prop="ownerLogin" label="主账号" min-width="112" sortable/>
        <el-table-column prop="contractNo" label="合同" width="80" sortable/>
        <el-table-column prop="creditUsed" label="授信占用" width="96" sortable/>
        <el-table-column label="操作" width="208" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions cus-page__actions">
              <el-button link type="primary" @click="openTenantEdit(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="primary" @click="goPanel('tai-admin-customers-org', { tenantId: scope.row.id })">组织</el-button>
              <el-button link type="primary" @click="goPanel('tai-admin-customers-contract', { tenantId: scope.row.id })">合同</el-button>
              <el-button link type="primary" @click="goPanel('tai-admin-customers-credit', { tenantId: scope.row.id })">授信</el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="tenantsPg.currentPage"
        v-model:page-size="tenantsPg.pageSize"
        :total="tenantsPg.total"
      />
      <p class="cus-page__hint">终端用户账号见 <RouterLink :to="{ name: 'tai-admin-users-list' }">用户与认证</RouterLink>（§4.11），与本节租户组织区分。</p>
    </el-card>

    <el-card v-show="panel === 'org'" shadow="never" class="admin-ep-card cus-page__panel" aria-label="组织与项目">
      <AdminSectionHead toolbar-only title="组织 / 项目">
        <template #annot>
          <AdminInternalTip heading="组织 / 项目 · 原型" explain="组织项目对内说明（原型）">
            <p>树/表为占位结构；合同主体下团队与项目 ID 应对接 CRM/IdP。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="orgSearchQ"
            :input-id="`${idPrefix}-cus-org-q`"
            search-placeholder="项目、租户、标签…"
            search-aria-label="检索组织项目"
          >
            <template #actions>
              <el-button>新建项目（示意）</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <p v-if="route.query.tenantId" class="cus-page__hint">
        已筛选租户：<code>{{ route.query.tenantId }}</code> ·
        <el-button link type="primary" @click="goPanel('tai-admin-customers-org')">清除筛选</el-button>
      </p>
      <el-table :data="orgPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="项目 ID" sortable/>
        <el-table-column prop="tenantName" label="租户" sortable/>
        <el-table-column prop="projectName" label="项目名称" sortable/>
        <el-table-column prop="members" label="成员数" width="80" sortable/>
        <el-table-column prop="keyCount" label="密钥数" width="80" sortable/>
        <el-table-column prop="billingTag" label="分摊标签" sortable/>
        <el-table-column prop="updatedAt" label="更新" width="136" sortable/>
      </el-table>
      <AdminTablePagination
        v-model:current-page="orgPg.currentPage"
        v-model:page-size="orgPg.pageSize"
        :total="orgPg.total"
      />
      <p class="cus-page__hint">密钥归属与 <RouterLink :to="{ name: 'tai-admin-keys-platform-keys' }">平台密钥</RouterLink> 字段对齐（工程期）。</p>
    </el-card>

    <el-card v-show="panel === 'contract'" shadow="never" class="admin-ep-card cus-page__panel" aria-label="合同">
      <AdminSectionHead toolbar-only title="合同">
        <template #annot>
          <AdminInternalTip heading="合同 · 原型" explain="合同页对内说明（原型）">
            <p>期限、折扣与绑定 SKU 为示意；到期提醒与工作台待办联动二期再做。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="contractSearchQ"
            :input-id="`${idPrefix}-cus-contract-q`"
            search-placeholder="合同号、客户、SKU…"
            search-aria-label="检索合同"
            @reset="resetContractQuery"
          >
            <template #filters>
              <el-select v-model="contractStatusFilter" clearable placeholder="状态" style="width: 8rem">
                <el-option v-for="s in contractStatusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary">新建合同（示意）</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <p v-if="route.query.tenantId" class="cus-page__hint">
        已筛选租户：<code>{{ route.query.tenantId }}</code> ·
        <el-button link type="primary" @click="goPanel('tai-admin-customers-contract')">清除筛选</el-button>
      </p>
      <el-table :data="contractPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="合同编号" sortable/>
        <el-table-column prop="tenantName" label="客户" sortable/>
        <el-table-column label="绑定 SKU" min-width="128">
          <template #default="scope">
            <template v-if="scope?.row">
            <RouterLink :to="{ name: 'tai-admin-billing-sku' }">{{ scope.row.skuName }}</RouterLink>
            <span class="cus-page__hint">（{{ scope.row.skuId }}）</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="discount" label="折扣" width="80" sortable/>
        <el-table-column label="起止" min-width="160">
          <template #default="scope">
              <template v-if="scope?.row">{{ scope.row.startDate }} ~ {{ scope.row.endDate }}
              </template>
            </template>
        </el-table-column>
        <el-table-column label="状态" width="96">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="contractStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="contractPg.currentPage"
        v-model:page-size="contractPg.pageSize"
        :total="contractPg.total"
      />
      <p class="cus-page__hint">即将到期合同可进 <RouterLink :to="{ name: 'tai-admin-dashboard' }">工作台</RouterLink> 待办（示意链接已存在）。</p>
    </el-card>

    <el-card v-show="panel === 'invoice'" shadow="never" class="admin-ep-card cus-page__panel" aria-label="发票与抬头">
      <AdminSectionHead toolbar-only title="发票与抬头">
        <template #annot>
          <AdminInternalTip heading="发票与抬头 · 原型" explain="发票抬头对内说明（原型）">
            <p>税号与开票申请为 mock；真实对接税务与财务审核流。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="invoiceHeaderSearchQ"
            :input-id="`${idPrefix}-cus-inv-h-q`"
            search-placeholder="抬头、客户、税号…"
            search-aria-label="检索开票抬头"
          >
            <template #actions>
              <el-button>新建申请（示意）</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <h3 class="cus-page__subhead">开票抬头</h3>
      <el-table :data="invoiceHeaderPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="抬头 ID" sortable/>
        <el-table-column prop="tenantName" label="客户" sortable/>
        <el-table-column prop="title" label="抬头名称" sortable/>
        <el-table-column prop="taxId" label="税号" sortable/>
        <el-table-column prop="invoiceType" label="票种" sortable/>
        <el-table-column prop="email" label="接收邮箱" min-width="112" sortable/>
        <el-table-column label="默认" width="64">
          <template #default="scope">
              <template v-if="scope?.row">{{ scope.row.default ? "是" : "否" }}
              </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="invoiceHeaderPg.currentPage"
        v-model:page-size="invoiceHeaderPg.pageSize"
        :total="invoiceHeaderPg.total"
      />
      <h3 class="cus-page__subhead">发票申请</h3>
      <AdminListQuery
        v-model:search="invoiceAppSearchQ"
        :input-id="`${idPrefix}-cus-inv-a-q`"
        search-placeholder="单号、客户、账期…"
        search-aria-label="检索发票申请"
        :show-reset="true"
        @reset="resetInvoiceAppQuery"
        style="margin-bottom: 0.75rem"
      >
        <template #filters>
          <el-select v-model="invoiceAppStatusFilter" clearable placeholder="状态" style="width: 8rem">
            <el-option label="待开票" value="待开票" />
            <el-option label="已开票" value="已开票" />
            <el-option label="已驳回" value="已驳回" />
          </el-select>
        </template>
      </AdminListQuery>
      <el-table :data="invoiceAppPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="申请单号" sortable/>
        <el-table-column prop="tenantName" label="客户" sortable/>
        <el-table-column prop="period" label="账期" sortable/>
        <el-table-column prop="amount" label="金额" sortable/>
        <el-table-column label="状态" width="96">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="invoiceAppStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="appliedAt" label="申请时间" width="136" sortable/>
      </el-table>
      <AdminTablePagination
        v-model:current-page="invoiceAppPg.currentPage"
        v-model:page-size="invoiceAppPg.pageSize"
        :total="invoiceAppPg.total"
      />
      <p class="cus-page__hint">
        账单状态与
        <RouterLink :to="{ name: 'tai-admin-billing-invoice' }">用量与计费 · 账单</RouterLink>
        联动（原型分表展示）。
      </p>
    </el-card>

    <el-card v-show="panel === 'credit'" shadow="never" class="admin-ep-card cus-page__panel" aria-label="授信">
      <AdminSectionHead toolbar-only title="授信">
        <template #annot>
          <AdminInternalTip heading="授信 · 原型" explain="授信对内说明（原型）">
            <p>额度与状态为占位；大额授信应走审批与风控策略（详设 §4.7）。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="creditSearchQ"
            :input-id="`${idPrefix}-cus-credit-q`"
            search-placeholder="授信 ID、客户、说明…"
            search-aria-label="检索授信"
            @reset="resetCreditQuery"
          >
            <template #filters>
              <el-select v-model="creditApprovalFilter" clearable placeholder="审批" style="width: 8rem">
                <el-option label="待审批" value="待审批" />
                <el-option label="已通过" value="已通过" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary">大额授信申请（示意）</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <p v-if="route.query.tenantId" class="cus-page__hint">
        已筛选租户：<code>{{ route.query.tenantId }}</code> ·
        <el-button link type="primary" @click="goPanel('tai-admin-customers-credit')">清除筛选</el-button>
      </p>
      <el-table :data="creditPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="授信 ID" sortable/>
        <el-table-column prop="tenantName" label="客户" sortable/>
        <el-table-column prop="limitAmount" label="额度" sortable/>
        <el-table-column prop="usedAmount" label="已用" sortable/>
        <el-table-column label="审批" width="96">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="creditApprovalClass(scope.row.approvalState)">{{ scope.row.approvalState }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="note" label="说明" min-width="96" sortable/>
      </el-table>
      <AdminTablePagination
        v-model:current-page="creditPg.currentPage"
        v-model:page-size="creditPg.pageSize"
        :total="creditPg.total"
      />
      <p class="cus-page__hint">
        待审批可与
        <RouterLink :to="{ name: 'tai-admin-users-audit-queue' }">用户与认证 · 审核队列</RouterLink>
        协同（v2 深链）。
      </p>
    </el-card>

    <AdminDialog
      v-model="tenantModalOpen"
      :title="tenantModalTitle"
      head-note="租户列表支持 localStorage 持久化（原型）。"
    >
      <p v-if="tenantFormError" class="cus-page__form-error">{{ tenantFormError }}</p>
      <el-form label-position="top" class="admin-ep-form cus-page__modal-fields">
        <el-form-item v-if="tenantModalMode === 'add'" label="租户 ID（可选）">
          <el-input :id="`${idPrefix}-tid`" v-model="draftTenantId" placeholder="留空则自动生成" />
        </el-form-item>
        <el-form-item label="租户名称">
          <el-input :id="`${idPrefix}-tname`" v-model="draftTenantName" placeholder="如 Acme" />
        </el-form-item>
        <el-form-item label="主账号">
          <el-input :id="`${idPrefix}-owner`" v-model="draftOwnerLogin" placeholder="owner@example.com" />
        </el-form-item>
        <el-form-item label="认证摘要">
          <el-input :id="`${idPrefix}-auth`" v-model="draftAuthSummary" placeholder="企业认证已通过 / 待认证" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select :id="`${idPrefix}-tst`" v-model="draftTenantStatus" style="width: 100%">
            <el-option label="正式" value="正式" />
            <el-option label="试用" value="试用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeTenantModal">取消</el-button>
        <el-button type="primary" @click="submitTenantForm">保存</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
