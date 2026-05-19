<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRoute } from "vue-router";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminExportCsvButton from "../../components/AdminExportCsvButton.vue";
import AdminFilterSelect from "../../components/AdminFilterSelect.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { ADMIN_TABLE_COL, ADMIN_TABLE_COL_MIN } from "../../utils/adminTableColumns";
import {
  type AdminDateRange,
  isBillingPeriodWithinAdminDateRange,
  isWithinAdminDateRange,
} from "../../utils/adminDateRange";
import { filterByQuery, uniqueFieldValues } from "../../utils/adminListFilter";
import "./billing.css";
import {
  BILLING_ADJUST_ROWS,
  BILLING_CREDIT_ROWS,
  BILLING_DEBIT_ROWS,
  BILLING_INVOICE_ROWS,
  BILLING_QUOTA_ROWS,
  BILLING_SKU_ROWS,
  BILLING_USAGE_ROWS,
  type BillingTabId,
} from "./mock";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const activeTab = computed<BillingTabId>(() => {
  const tab = route.meta.billingTab as BillingTabId | undefined;
  const valid: BillingTabId[] = [
    "usage",
    "debit-ledger",
    "credit-ledger",
    "quota",
    "sku",
    "invoice",
    "adjust",
  ];
  if (tab && valid.includes(tab)) return tab;
  return "usage";
});

const usageSearchQ = ref("");
const usageOrgFilter = ref("");
const usageDateRange = ref<AdminDateRange | null>(null);
const quotaSearchQ = ref("");
const skuSearchQ = ref("");
const skuTypeFilter = ref("");
const invoiceSearchQ = ref("");
const invoiceStatusFilter = ref("");
const invoiceDateRange = ref<AdminDateRange | null>(null);
const adjustSearchQ = ref("");
const adjustStateFilter = ref("");
const debitSearchQ = ref("");
const debitDateRange = ref<AdminDateRange | null>(null);
const creditSearchQ = ref("");
const creditSourceFilter = ref("");
const creditDateRange = ref<AdminDateRange | null>(null);
const usageStatusFilter = ref("");

const usageOrgOptions = computed(() => uniqueFieldValues(BILLING_USAGE_ROWS, (r) => r.org));

const filteredUsageRows = computed(() => {
  let rows = BILLING_USAGE_ROWS;
  if (usageOrgFilter.value) rows = rows.filter((r) => r.org === usageOrgFilter.value);
  if (usageStatusFilter.value) rows = rows.filter((r) => r.status === usageStatusFilter.value);
  if (usageDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.time, usageDateRange.value));
  }
  return filterByQuery(rows, usageSearchQ.value, (r) =>
    [r.time, r.requestId, r.org, r.workspace, r.apiKey, r.model, r.line, r.status, r.tokens, r.amt].join(
      " ",
    ),
  );
});

const filteredDebitRows = computed(() => {
  let rows = BILLING_DEBIT_ROWS;
  if (debitDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.at, debitDateRange.value));
  }
  return filterByQuery(rows, debitSearchQ.value, (r) =>
    [r.at, r.requestId, r.workspace, r.user, r.amount, r.billingLine].join(" "),
  );
});

const filteredCreditRows = computed(() => {
  let rows = BILLING_CREDIT_ROWS;
  if (creditSourceFilter.value) rows = rows.filter((r) => r.source === creditSourceFilter.value);
  if (creditDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.at, creditDateRange.value));
  }
  return filterByQuery(rows, creditSearchQ.value, (r) =>
    [r.at, r.workspace, r.source, r.amount, r.orderId].join(" "),
  );
});

const filteredQuotaRows = computed(() =>
  filterByQuery(BILLING_QUOTA_ROWS, quotaSearchQ.value, (r) =>
    [r.org, r.plan, r.used, r.hard, r.soft].join(" "),
  ),
);

const filteredSkuRows = computed(() => {
  let rows = BILLING_SKU_ROWS;
  if (skuTypeFilter.value) rows = rows.filter((r) => r.type === skuTypeFilter.value);
  return filterByQuery(rows, skuSearchQ.value, (r) => [r.id, r.name, r.type, r.price, r.note].join(" "));
});

const filteredInvoiceRows = computed(() => {
  let rows = BILLING_INVOICE_ROWS;
  if (invoiceStatusFilter.value) rows = rows.filter((r) => r.status === invoiceStatusFilter.value);
  if (invoiceDateRange.value) {
    rows = rows.filter((r) => isBillingPeriodWithinAdminDateRange(r.period, invoiceDateRange.value));
  }
  return filterByQuery(rows, invoiceSearchQ.value, (r) =>
    [r.period, r.org, r.amount, r.status, r.paid].join(" "),
  );
});

const filteredAdjustRows = computed(() => {
  let rows = BILLING_ADJUST_ROWS;
  if (adjustStateFilter.value) rows = rows.filter((r) => r.state === adjustStateFilter.value);
  return filterByQuery(rows, adjustSearchQ.value, (r) =>
    [r.id, r.org, r.reason, r.amount, r.state].join(" "),
  );
});

function resetUsageQuery(): void {
  usageOrgFilter.value = "";
  usageStatusFilter.value = "";
  usageDateRange.value = null;
}

function resetDebitQuery(): void {
  debitDateRange.value = null;
}

function resetCreditQuery(): void {
  creditSourceFilter.value = "";
  creditDateRange.value = null;
}

function resetSkuQuery(): void {
  skuTypeFilter.value = "";
}

function resetInvoiceQuery(): void {
  invoiceStatusFilter.value = "";
  invoiceDateRange.value = null;
}

function resetAdjustQuery(): void {
  adjustStateFilter.value = "";
}

function resetQuotaQuery(): void {
  quotaSearchQ.value = "";
}

function usageStatusClass(status: string): string {
  if (status === "200") return "bill-page__badge bill-page__badge--ok";
  if (status === "429" || status.startsWith("5")) return "bill-page__badge bill-page__badge--warn";
  return "bill-page__badge bill-page__badge--muted";
}

const usagePg = useAdminTablePagination(filteredUsageRows);
const debitPg = useAdminTablePagination(filteredDebitRows);
const creditPg = useAdminTablePagination(filteredCreditRows);
const quotaPg = useAdminTablePagination(filteredQuotaRows);
const skuPg = useAdminTablePagination(filteredSkuRows);
const invoicePg = useAdminTablePagination(filteredInvoiceRows);
const adjustPg = useAdminTablePagination(filteredAdjustRows);
</script>

<template>
  <div class="bill-page">
    <section v-show="activeTab === 'usage'" class="bill-page__panel" aria-label="用量明细">
      <el-card shadow="never" class="admin-ep-card bill-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="用量明细 · 原型" explain="用量明细对内说明（原型）">
            <p>调用明细为 mock；导出与时间筛选为示意按钮，工程期接数仓与权限。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="usageSearchQ"
            :input-id="`${idPrefix}-bill-usage-q`"
            search-placeholder="请求 ID、客户、模型、线路、状态…"
            search-aria-label="检索用量明细"
            @reset="resetUsageQuery"
          >
            <template #filters>
              <AdminFilterSelect
                v-model="usageOrgFilter"
                placeholder="客户"
                aria-label="按客户筛选"
                width="9rem"
              >
                <el-option v-for="o in usageOrgOptions" :key="o" :label="o" :value="o" />
              </AdminFilterSelect>
              <el-select v-model="usageStatusFilter" clearable placeholder="状态" style="width: 7rem">
                <el-option label="200" value="200" />
                <el-option label="429" value="429" />
              </el-select>
            </template>
            <AdminDateRangePicker v-model="usageDateRange" aria-label="用量明细时间范围" />
            <template #actions>
              <AdminExportCsvButton />
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table
        :data="usagePg.paginatedRows"
        row-key="requestId"
        class="admin-ep-table-wrap"
        style="width: 100%"
        :default-sort="{ prop: 'time', order: 'descending' }"
      >
        <el-table-column prop="time" label="时间" :min-width="ADMIN_TABLE_COL.lg" sortable />
        <el-table-column prop="requestId" label="请求 ID" :min-width="ADMIN_TABLE_COL.lg" sortable show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope?.row" class="bill-page__mono">{{ scope.row.requestId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="org" label="客户" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
        <el-table-column prop="workspace" label="Workspace" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
        <el-table-column prop="apiKey" label="API Key" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
        <el-table-column prop="model" label="模型" :min-width="ADMIN_TABLE_COL.primary" sortable show-overflow-tooltip />
        <el-table-column prop="line" label="线路" :min-width="ADMIN_TABLE_COL.sm" sortable show-overflow-tooltip />
        <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.xs" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
              <span :class="usageStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="latencyMs" label="时延(ms)" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="tokens" label="Token 入/出" :min-width="ADMIN_TABLE_COL.md" sortable />
        <el-table-column prop="amt" label="试算金额" :min-width="ADMIN_TABLE_COL.sm" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="usagePg.currentPage"
        v-model:page-size="usagePg.pageSize"
        :total="usagePg.total"
      />
      </el-card>
    </section>

    <section v-show="activeTab === 'debit-ledger'" class="bill-page__panel" aria-label="扣费流水">
      <el-card shadow="never" class="admin-ep-card bill-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="扣费流水 · 原型" explain="扣费流水（§4.3.2）">
            <p>按请求扣费明细；导出须带时间范围。工程期接 <code>wallet_debit_ledger</code>。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="debitSearchQ"
            :input-id="`${idPrefix}-bill-debit-q`"
            search-placeholder="请求、workspace、用户…"
            search-aria-label="检索扣费流水"
            @reset="resetDebitQuery"
          >
            <AdminDateRangePicker v-model="debitDateRange" aria-label="扣费时间范围" />
            <template #actions>
              <AdminExportCsvButton />
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table
        :data="debitPg.paginatedRows"
        row-key="requestId"
        class="admin-ep-table-wrap"
        style="width: 100%"
        :default-sort="{ prop: 'at', order: 'descending' }"
      >
        <el-table-column prop="at" label="时间" :min-width="ADMIN_TABLE_COL.lg" sortable />
        <el-table-column prop="requestId" label="请求 ID" :min-width="ADMIN_TABLE_COL.lg" sortable show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope?.row" class="bill-page__mono">{{ scope.row.requestId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="workspace" label="Workspace" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
        <el-table-column prop="user" label="用户" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="billingLine" label="账单行" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
      </el-table>
      <AdminTablePagination
        v-model:current-page="debitPg.currentPage"
        v-model:page-size="debitPg.pageSize"
        :total="debitPg.total"
      />
      </el-card>
    </section>

    <section v-show="activeTab === 'credit-ledger'" class="bill-page__panel" aria-label="入账流水">
      <el-card shadow="never" class="admin-ep-card bill-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="入账流水 · 原型" explain="入账流水（§4.3.2）">
            <p>充值/入账记录；工程期接 <code>wallet_credit_ledger</code>。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="creditSearchQ"
            :input-id="`${idPrefix}-bill-credit-q`"
            search-placeholder="workspace、订单号…"
            search-aria-label="检索入账流水"
            @reset="resetCreditQuery"
          >
            <template #filters>
              <el-select v-model="creditSourceFilter" clearable placeholder="来源" style="width: 7rem">
                <el-option label="Stripe" value="Stripe" />
                <el-option label="手工充值" value="手工充值" />
              </el-select>
            </template>
            <AdminDateRangePicker v-model="creditDateRange" aria-label="入账时间范围" />
            <template #actions>
              <AdminExportCsvButton />
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table
        :data="creditPg.paginatedRows"
        row-key="orderId"
        class="admin-ep-table-wrap"
        style="width: 100%"
        :default-sort="{ prop: 'at', order: 'descending' }"
      >
        <el-table-column prop="at" label="时间" :min-width="ADMIN_TABLE_COL.lg" sortable />
        <el-table-column prop="workspace" label="Workspace" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
        <el-table-column prop="source" label="来源" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="amount" label="金额" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="orderId" label="订单号" :min-width="ADMIN_TABLE_COL.lg" sortable show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope?.row" class="bill-page__mono">{{ scope.row.orderId }}</span>
          </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="creditPg.currentPage"
        v-model:page-size="creditPg.pageSize"
        :total="creditPg.total"
      />
      </el-card>
    </section>

    <section v-show="activeTab === 'quota'" class="bill-page__panel" aria-label="配额监控">
      <el-card shadow="never" class="admin-ep-card bill-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="配额监控 · 原型" explain="配额监控对内说明（原型）">
            <p>阈值与告警状态为示意；与网关限流、合同配额对齐在工程期实现。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="quotaSearchQ"
            :input-id="`${idPrefix}-bill-quota-q`"
            search-placeholder="客户、套餐…"
            search-aria-label="检索配额"
            @reset="resetQuotaQuery"
          />
        </template>
      </AdminSectionHead>
      <el-table
        :data="quotaPg.paginatedRows"
        row-key="org"
        class="admin-ep-table-wrap"
        style="width: 100%"
      >
        <el-table-column prop="org" label="客户" :min-width="ADMIN_TABLE_COL.primary" sortable show-overflow-tooltip />
        <el-table-column prop="plan" label="套餐" :min-width="ADMIN_TABLE_COL.md" sortable />
        <el-table-column prop="used" label="已用" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="hard" label="硬顶" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="soft" label="软顶 / 告警" :min-width="ADMIN_TABLE_COL.lg" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="quotaPg.currentPage"
        v-model:page-size="quotaPg.pageSize"
        :total="quotaPg.total"
      />
      </el-card>
    </section>

    <section v-show="activeTab === 'sku'" class="bill-page__panel" aria-label="套餐 SKU">
      <el-card shadow="never" class="admin-ep-card bill-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="套餐 SKU · 原型" explain="套餐 SKU 对内说明（原型）">
            <p>刊例与 SKU 绑定为占位表；价格变更应走审计与版本发布流程（详设 §4.3）。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="skuSearchQ"
            :input-id="`${idPrefix}-bill-sku-q`"
            search-placeholder="SKU、名称…"
            search-aria-label="检索 SKU"
            @reset="resetSkuQuery"
          >
            <template #filters>
              <el-select
                v-model="skuTypeFilter"
                clearable
                placeholder="类型"
                aria-label="按类型筛选"
                style="width: 7rem"
              >
                <el-option label="包月" value="包月" />
                <el-option label="按量" value="按量" />
              </el-select>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="skuPg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="id" label="SKU ID" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope?.row" class="bill-page__mono">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" :min-width="ADMIN_TABLE_COL.xl" sortable show-overflow-tooltip />
        <el-table-column prop="type" label="类型" :min-width="ADMIN_TABLE_COL.xs" sortable />
        <el-table-column prop="price" label="刊例" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column
          prop="note"
          label="备注"
          :min-width="ADMIN_TABLE_COL_MIN.detail"
          sortable
          show-overflow-tooltip
        />
      </el-table>
      <AdminTablePagination
        v-model:current-page="skuPg.currentPage"
        v-model:page-size="skuPg.pageSize"
        :total="skuPg.total"
      />
      </el-card>
    </section>

    <section v-show="activeTab === 'invoice'" class="bill-page__panel" aria-label="账单">
      <el-card shadow="never" class="admin-ep-card bill-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="账单 · 原型" explain="账单列表对内说明（原型）">
            <p>开票状态与金额为 mock；对账与发票 PDF 下载在工程期对接计费中台。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="invoiceSearchQ"
            :input-id="`${idPrefix}-bill-inv-q`"
            search-placeholder="账期、客户…"
            search-aria-label="检索账单"
            @reset="resetInvoiceQuery"
          >
            <template #filters>
              <el-select
                v-model="invoiceStatusFilter"
                clearable
                placeholder="状态"
                aria-label="按状态筛选"
                style="width: 7rem"
              >
                <el-option label="已出账" value="已出账" />
              </el-select>
            </template>
            <AdminDateRangePicker v-model="invoiceDateRange" aria-label="账单账期范围" />
            <template #actions>
              <el-button type="primary" plain>按客户导出对账</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table
        :data="invoicePg.paginatedRows"
        row-key="period"
        class="admin-ep-table-wrap"
        style="width: 100%"
        :default-sort="{ prop: 'period', order: 'descending' }"
      >
        <el-table-column prop="period" label="账期" :min-width="ADMIN_TABLE_COL.md" sortable />
        <el-table-column prop="org" label="客户" :min-width="ADMIN_TABLE_COL.primary" sortable show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="paid" label="支付" :min-width="ADMIN_TABLE_COL.sm" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="invoicePg.currentPage"
        v-model:page-size="invoicePg.pageSize"
        :total="invoicePg.total"
      />
      </el-card>
    </section>

    <section v-show="activeTab === 'adjust'" class="bill-page__panel" aria-label="调账充值">
      <el-card shadow="never" class="admin-ep-card bill-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="调账 / 充值 · 原型" explain="调账充值对内说明（原型）">
            <p>调账流水为示意；真实环境需审批流、双人复核与财务凭证号（§4.13）。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="adjustSearchQ"
            :input-id="`${idPrefix}-bill-adj-q`"
            search-placeholder="单号、客户、原因…"
            search-aria-label="检索调账"
            @reset="resetAdjustQuery"
          >
            <template #filters>
              <el-select
                v-model="adjustStateFilter"
                clearable
                placeholder="状态"
                aria-label="按状态筛选"
                style="width: 8rem"
              >
                <el-option label="待财务审" value="待财务审" />
                <el-option label="已完成" value="已完成" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary">新建调账申请（示意）</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="adjustPg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="id" label="单号" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope?.row" class="bill-page__mono">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="org" label="客户" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip />
        <el-table-column
          prop="reason"
          label="原因"
          :min-width="ADMIN_TABLE_COL_MIN.detail"
          sortable
          show-overflow-tooltip
        />
        <el-table-column prop="amount" label="金额" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="state" label="状态" :min-width="ADMIN_TABLE_COL.sm" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="adjustPg.currentPage"
        v-model:page-size="adjustPg.pageSize"
        :total="adjustPg.total"
      />
      </el-card>
    </section>
  </div>
</template>
