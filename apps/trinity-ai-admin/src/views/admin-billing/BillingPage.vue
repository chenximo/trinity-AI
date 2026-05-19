<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRoute } from "vue-router";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminFilterSelect from "../../components/AdminFilterSelect.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import {
  type AdminDateRange,
  isBillingPeriodWithinAdminDateRange,
  isWithinAdminDateRange,
} from "../../utils/adminDateRange";
import { filterByQuery, uniqueFieldValues } from "../../utils/adminListFilter";
import "./billing.css";
import {
  BILLING_ADJUST_ROWS,
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
  if (tab === "usage" || tab === "quota" || tab === "sku" || tab === "invoice" || tab === "adjust") return tab;
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

const usageOrgOptions = computed(() => uniqueFieldValues(BILLING_USAGE_ROWS, (r) => r.org));

const filteredUsageRows = computed(() => {
  let rows = BILLING_USAGE_ROWS;
  if (usageOrgFilter.value) rows = rows.filter((r) => r.org === usageOrgFilter.value);
  if (usageDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.time, usageDateRange.value));
  }
  return filterByQuery(rows, usageSearchQ.value, (r) =>
    [r.time, r.org, r.model, r.line, r.tokens, r.amt].join(" "),
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
  usageDateRange.value = null;
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

const usagePg = useAdminTablePagination(filteredUsageRows);
const quotaPg = useAdminTablePagination(filteredQuotaRows);
const skuPg = useAdminTablePagination(filteredSkuRows);
const invoicePg = useAdminTablePagination(filteredInvoiceRows);
const adjustPg = useAdminTablePagination(filteredAdjustRows);
</script>

<template>
  <div class="bill-page">
    <el-card v-show="activeTab === 'usage'" shadow="never" class="admin-ep-card bill-page__panel" aria-label="用量明细">
      <AdminSectionHead toolbar-only title="用量明细">
        <template #annot>
          <AdminInternalTip heading="用量明细 · 原型" explain="用量明细对内说明（原型）">
            <p>调用明细为 mock；导出与时间筛选为示意按钮，工程期接数仓与权限。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="usageSearchQ"
            :input-id="`${idPrefix}-bill-usage-q`"
            search-placeholder="客户、模型、线路…"
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
            </template>
            <AdminDateRangePicker v-model="usageDateRange" aria-label="用量明细时间范围" />
            <el-button type="primary" plain>导出 CSV（示意）</el-button>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="usagePg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="time" label="时间" min-width="128" sortable />
        <el-table-column prop="org" label="客户" min-width="96" sortable />
        <el-table-column prop="model" label="模型" min-width="128" sortable />
        <el-table-column prop="line" label="线路" min-width="96" sortable />
        <el-table-column prop="tokens" label="Token 入/出" min-width="112" sortable />
        <el-table-column prop="amt" label="试算金额" min-width="80" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="usagePg.currentPage"
        v-model:page-size="usagePg.pageSize"
        :total="usagePg.total"
      />
    </el-card>

    <el-card v-show="activeTab === 'quota'" shadow="never" class="admin-ep-card bill-page__panel" aria-label="配额监控">
      <AdminSectionHead toolbar-only title="配额监控">
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
          />
        </template>
      </AdminSectionHead>
      <el-table :data="quotaPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="org" label="客户" sortable />
        <el-table-column prop="plan" label="套餐" sortable />
        <el-table-column prop="used" label="已用" sortable />
        <el-table-column prop="hard" label="硬顶" sortable />
        <el-table-column prop="soft" label="软顶 / 告警" min-width="128" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="quotaPg.currentPage"
        v-model:page-size="quotaPg.pageSize"
        :total="quotaPg.total"
      />
    </el-card>

    <el-card v-show="activeTab === 'sku'" shadow="never" class="admin-ep-card bill-page__panel" aria-label="套餐 SKU">
      <AdminSectionHead toolbar-only title="套餐 SKU">
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
      <el-table :data="skuPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="id" label="SKU ID" min-width="96" sortable />
        <el-table-column prop="name" label="名称" sortable />
        <el-table-column prop="type" label="类型" width="80" sortable />
        <el-table-column prop="price" label="刊例" sortable />
        <el-table-column prop="note" label="备注" min-width="128" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="skuPg.currentPage"
        v-model:page-size="skuPg.pageSize"
        :total="skuPg.total"
      />
    </el-card>

    <el-card v-show="activeTab === 'invoice'" shadow="never" class="admin-ep-card bill-page__panel" aria-label="账单">
      <AdminSectionHead toolbar-only title="账单">
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
            <el-button type="primary" plain>按客户导出对账</el-button>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="invoicePg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="period" label="账期" sortable />
        <el-table-column prop="org" label="客户" sortable />
        <el-table-column prop="amount" label="金额" sortable />
        <el-table-column prop="status" label="状态" sortable />
        <el-table-column prop="paid" label="支付" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="invoicePg.currentPage"
        v-model:page-size="invoicePg.pageSize"
        :total="invoicePg.total"
      />
    </el-card>

    <el-card v-show="activeTab === 'adjust'" shadow="never" class="admin-ep-card bill-page__panel" aria-label="调账充值">
      <AdminSectionHead toolbar-only title="调账 / 充值">
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
            <el-button type="primary">新建调账申请（示意）</el-button>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="adjustPg.paginatedRows" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="id" label="单号" min-width="96" sortable />
        <el-table-column prop="org" label="客户" sortable />
        <el-table-column prop="reason" label="原因" min-width="128" sortable />
        <el-table-column prop="amount" label="金额" sortable />
        <el-table-column prop="state" label="状态" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="adjustPg.currentPage"
        v-model:page-size="adjustPg.pageSize"
        :total="adjustPg.total"
      />
    </el-card>
  </div>
</template>
