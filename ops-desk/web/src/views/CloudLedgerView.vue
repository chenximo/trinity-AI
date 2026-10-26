<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Download, Refresh } from "@element-plus/icons-vue";
import { api, type CloudLedgerRow } from "../api/client";

const router = useRouter();
const allRows = ref<CloudLedgerRow[]>([]);
const settlementDir = ref("");
const files = ref<string[]>([]);
const loading = ref(false);

const ALL_CLOUDS = "__all__";

/** 台账账期格式 YYYYMM（与结算表一致） */
function toPeriodKey(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** 默认前一个月（例：10 月看 9 月账单）；本月通常还没出表 */
function prevPeriod() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return toPeriodKey(d);
}

/** 优先前一个月；若该客户没有则取其最新账期 */
function pickDefaultPeriod(forCustomer?: string) {
  const prev = prevPeriod();
  const rows = forCustomer
    ? allRows.value.filter((r) => r.customer === forCustomer)
    : allRows.value;
  const periods = [...new Set(rows.map((r) => r.period))].sort().reverse();
  if (periods.includes(prev)) return prev;
  return periods[0] || prev;
}

const customer = ref("");
/** 含特殊值 ALL_CLOUDS 表示全部云；否则为具体云厂商列表 */
const selectedClouds = ref<string[]>([ALL_CLOUDS]);
/** 默认前一个月（9 月账单）；刷新也会重选 */
const period = ref(prevPeriod());
/** 开票状态筛：待开票优先看未开票 */
const invoiceFilter = ref<"unbilled" | "all">("unbilled");
/** 消耗结算 | 服务费（单独开票视图） */
const mainTab = ref<"settle" | "fee">("settle");
/** 服务费 Tab：未开优先 */
const feeFilter = ref<"unbilled" | "all">("unbilled");

const customers = computed(() => {
  const set = new Set(allRows.value.map((r) => r.customer));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "zh-CN"));
});

const cloudsForCustomer = computed(() => {
  if (!customer.value) return [] as string[];
  const set = new Set(
    allRows.value.filter((r) => r.customer === customer.value).map((r) => r.cloud),
  );
  return Array.from(set).sort();
});

const effectiveClouds = computed(() => {
  if (!selectedClouds.value.length || selectedClouds.value.includes(ALL_CLOUDS)) {
    return cloudsForCustomer.value;
  }
  return selectedClouds.value.filter((c) => c !== ALL_CLOUDS);
});

const isAllClouds = computed(
  () => !selectedClouds.value.length || selectedClouds.value.includes(ALL_CLOUDS),
);

const periodsForCustomer = computed(() => {
  if (!customer.value) return ["全部", prevPeriod()];
  const set = new Set(
    allRows.value
      .filter((r) => r.customer === customer.value)
      .filter((r) => !effectiveClouds.value.length || effectiveClouds.value.includes(r.cloud))
      .map((r) => r.period),
  );
  set.add(prevPeriod());
  return ["全部", ...Array.from(set).sort().reverse()];
});

const previewRows = computed(() => {
  if (!customer.value) return [] as CloudLedgerRow[];
  const statusRank = (s: string) =>
    s === "unbilled" ? 0 : s === "invoicing" ? 1 : 2;
  return allRows.value
    .filter((r) => r.customer === customer.value)
    .filter((r) => !effectiveClouds.value.length || effectiveClouds.value.includes(r.cloud))
    .filter((r) => period.value === "全部" || r.period === period.value)
    .filter((r) => invoiceFilter.value === "all" || r.invoice_status !== "invoiced")
    .sort((a, b) => {
      const ra = statusRank(a.invoice_status);
      const rb = statusRank(b.invoice_status);
      if (ra !== rb) return ra - rb;
      if (a.period !== b.period) return b.period.localeCompare(a.period);
      if (a.cloud !== b.cloud) return a.cloud.localeCompare(b.cloud, "zh-CN");
      return a.account.localeCompare(b.account, "zh-CN");
    });
});

/** 服务费是否已开 */
function feeInvoiced(r: CloudLedgerRow) {
  if (r.fee_invoice_status === "done") return true;
  if (r.fee_invoice_status === "none" || !(r.fee_amount || 0)) return false;
  return r.invoice_status === "invoiced";
}

function consumeInvoiced(r: CloudLedgerRow) {
  if (r.consume_invoice_status === "done") return true;
  if (r.consume_invoice_status === "none" || !(r.consume || 0)) return false;
  return r.invoice_status === "invoiced";
}

/** 有服务费的人民币行 */
const feeRows = computed(() =>
  allRows.value.filter((r) => {
    const cur = (r.currency || (r.cloud === "Akamai" ? "USD" : "CNY")).toUpperCase();
    return cur === "CNY" && (r.fee_amount || 0) > 0;
  }),
);

/** 服务费按公司汇总 */
const feeByCompany = computed(() => {
  const map = new Map<
    string,
    {
      customer: string;
      customer_id: string | null;
      rows: number;
      feeTotal: number;
      feeInvoiced: number;
      feeUnbilled: number;
      unbilledRows: number;
    }
  >();
  for (const r of feeRows.value) {
    const fee = r.fee_amount || 0;
    const done = feeInvoiced(r);
    const slot = map.get(r.customer) || {
      customer: r.customer,
      customer_id: r.customer_id,
      rows: 0,
      feeTotal: 0,
      feeInvoiced: 0,
      feeUnbilled: 0,
      unbilledRows: 0,
    };
    slot.rows += 1;
    slot.feeTotal += fee;
    if (done) slot.feeInvoiced += fee;
    else {
      slot.feeUnbilled += fee;
      slot.unbilledRows += 1;
    }
    if (!slot.customer_id && r.customer_id) slot.customer_id = r.customer_id;
    map.set(r.customer, slot);
  }
  return Array.from(map.values())
    .map((x) => ({
      ...x,
      feeTotal: Math.round(x.feeTotal * 100) / 100,
      feeInvoiced: Math.round(x.feeInvoiced * 100) / 100,
      feeUnbilled: Math.round(x.feeUnbilled * 100) / 100,
    }))
    .sort((a, b) => b.feeUnbilled - a.feeUnbilled || b.feeTotal - a.feeTotal);
});

const feeTotals = computed(() => {
  let feeTotal = 0;
  let feeInvoicedAmt = 0;
  let feeUnbilled = 0;
  let unbilledRows = 0;
  for (const r of feeRows.value) {
    const fee = r.fee_amount || 0;
    feeTotal += fee;
    if (feeInvoiced(r)) feeInvoicedAmt += fee;
    else {
      feeUnbilled += fee;
      unbilledRows += 1;
    }
  }
  return {
    rows: feeRows.value.length,
    feeTotal: Math.round(feeTotal * 100) / 100,
    feeInvoiced: Math.round(feeInvoicedAmt * 100) / 100,
    feeUnbilled: Math.round(feeUnbilled * 100) / 100,
    unbilledRows,
  };
});

const feeDetailRows = computed(() => {
  return feeRows.value
    .filter((r) => !customer.value || r.customer === customer.value)
    .filter((r) => feeFilter.value === "all" || !feeInvoiced(r))
    .sort((a, b) => {
      const da = feeInvoiced(a) ? 1 : 0;
      const db = feeInvoiced(b) ? 1 : 0;
      if (da !== db) return da - db;
      if (a.customer !== b.customer) return a.customer.localeCompare(b.customer, "zh-CN");
      if (a.period !== b.period) return b.period.localeCompare(a.period);
      return a.cloud.localeCompare(b.cloud, "zh-CN");
    });
});

function pickFeeCompany(name: string) {
  customer.value = name;
  feeFilter.value = "unbilled";
  mainTab.value = "fee";
}

const totalsByCurrency = computed(() => {
  const map = new Map<string, { consume: number; fee: number; settle: number }>();
  for (const r of previewRows.value) {
    const cur = r.currency || (r.cloud === "Akamai" ? "USD" : "CNY");
    const slot = map.get(cur) || { consume: 0, fee: 0, settle: 0 };
    slot.consume += r.consume || 0;
    slot.fee += r.fee_amount || 0;
    slot.settle += r.settle_total || 0;
    map.set(cur, slot);
  }
  return Array.from(map.entries()).map(([currency, v]) => ({
    currency,
    consume: Math.round(v.consume * 100) / 100,
    fee: Math.round(v.fee * 100) / 100,
    settle: Math.round(v.settle * 100) / 100,
  }));
});

function unitLabel(currency: string | null | undefined) {
  if (!currency || currency === "CNY") return "CNY";
  return currency;
}

function money(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


watch(customer, () => {
  selectedClouds.value = [ALL_CLOUDS];
  period.value = pickDefaultPeriod(customer.value);
});

watch(selectedClouds, (val, oldVal) => {
  if (!val.length) {
    selectedClouds.value = [ALL_CLOUDS];
    return;
  }
  // 勾选「全部云」时清空具体云；勾选具体云时去掉「全部云」
  if (val.includes(ALL_CLOUDS) && val.length > 1) {
    const addedAll = !oldVal?.includes(ALL_CLOUDS) && val.includes(ALL_CLOUDS);
    selectedClouds.value = addedAll ? [ALL_CLOUDS] : val.filter((c) => c !== ALL_CLOUDS);
    return;
  }
  if (period.value !== "全部" && !periodsForCustomer.value.includes(period.value)) {
    period.value = "全部";
  }
});

/** 刷新：回到前一个月（有数据则用该月，否则最新账期）并重载 */
async function refresh() {
  await load({ resetPeriod: true });
}

async function load(opts?: { resetPeriod?: boolean }) {
  loading.value = true;
  try {
    const data = await api.cloudLedger();
    allRows.value = data.rows;
    settlementDir.value = data.settlement_dir;
    files.value = data.files;
    if (!customer.value && customers.value.length) {
      customer.value = customers.value[0];
      selectedClouds.value = [ALL_CLOUDS];
      period.value = pickDefaultPeriod(customer.value);
    } else if (customer.value && !isAllClouds.value) {
      selectedClouds.value = selectedClouds.value.filter((c) =>
        cloudsForCustomer.value.includes(c),
      );
      if (!selectedClouds.value.length) {
        selectedClouds.value = [ALL_CLOUDS];
      }
    }
    if (opts?.resetPeriod || !period.value) {
      period.value = pickDefaultPeriod(customer.value);
    } else if (
      period.value !== "全部" &&
      !periodsForCustomer.value.includes(period.value)
    ) {
      period.value = pickDefaultPeriod(customer.value);
    }
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
}

function exportUrl() {
  const params = new URLSearchParams();
  params.set("customer", customer.value);
  // 全部云：不传 clouds，后端按该客户全部云导出
  if (!isAllClouds.value && effectiveClouds.value.length) {
    params.set("clouds", effectiveClouds.value.join(","));
  }
  if (period.value && period.value !== "全部") params.set("period", period.value);
  return `/api/cloud/ledger/export?${params.toString()}`;
}

async function downloadBlob(url: string, fallbackName: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    let detail = text || res.statusText;
    try {
      detail = (JSON.parse(text) as { detail?: string }).detail || detail;
    } catch {
      /* plain text */
    }
    throw new Error(detail);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const m = /filename\*=UTF-8''([^;]+)/i.exec(cd);
  const name = m ? decodeURIComponent(m[1]) : fallbackName;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
  return name;
}

async function doExport() {
  if (!customer.value) {
    ElMessage.warning("请先选择公司");
    return;
  }
  if (!effectiveClouds.value.length) {
    ElMessage.warning("请至少选择一个云");
    return;
  }
  if (!previewRows.value.length) {
    ElMessage.warning("没有可导出的数据");
    return;
  }
  try {
    await downloadBlob(exportUrl(), `${customer.value}_消耗.xlsx`);
    ElMessage.success(`已导出 ${previewRows.value.length} 行`);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

function confirmPdfUrl() {
  const params = new URLSearchParams();
  params.set("customer", customer.value);
  params.set("period", period.value);
  return `/api/cloud/settlement-confirm.pdf?${params.toString()}`;
}

async function doExportConfirmPdf() {
  if (!customer.value) {
    ElMessage.warning("请先选择公司");
    return;
  }
  if (!period.value || period.value === "全部") {
    ElMessage.warning("导出结算确认单请先选择具体账期（如 202609）");
    return;
  }
  if (!previewRows.value.length) {
    ElMessage.warning("该账期没有可出单的数据");
    return;
  }
  try {
    const name = await downloadBlob(
      confirmPdfUrl(),
      `结算确认单_${customer.value}_${period.value}.pdf`,
    );
    ElMessage.success(`已导出 ${name}（已落盘发票/结算确认单）`);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function markPaid(row: CloudLedgerRow, fee_paid: string) {
  try {
    await api.setFeePaid(row.row_key, fee_paid);
    await load();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function markInvoiced(row: CloudLedgerRow) {
  try {
    await api.setLedgerInvoiceStatus(row.row_key, "invoiced", "台账标记已开票");
    await load();
    ElMessage.success("已标记为已开票");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function clearInvoiceMark(row: CloudLedgerRow) {
  try {
    await api.setLedgerInvoiceStatus(row.row_key, "unbilled");
    await load();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

function goInvoiceKind(row: CloudLedgerRow, kind: "consume" | "fee" | "settle") {
  if (!row.customer_id) {
    ElMessage.warning("无法识别客户，请先在开票页手工建单");
    return;
  }
  let amount = "";
  if (kind === "fee" && row.fee_amount != null) amount = String(row.fee_amount);
  else if (kind === "consume" && row.consume != null) amount = String(row.consume);
  else if (row.settle_total != null) amount = String(row.settle_total);
  router.push({
    path: "/invoices",
    query: {
      customer_id: row.customer_id,
      amount,
      row_key: row.row_key,
      period: row.period,
      cloud: row.cloud,
      kind,
    },
  });
}

function goInvoiceConsume(row: CloudLedgerRow) {
  goInvoiceKind(row, "consume");
}

function goInvoiceFee(row: CloudLedgerRow) {
  goInvoiceKind(row, "fee");
}

onMounted(load);
</script>

<template>
  <div v-loading="loading">
    <el-tabs v-model="mainTab" class="mb">
      <el-tab-pane label="消耗结算" name="settle" />
      <el-tab-pane name="fee">
        <template #label>
          服务费
          <el-badge
            v-if="feeTotals.unbilledRows"
            :value="feeTotals.unbilledRows"
            :max="99"
            class="tab-badge"
          />
        </template>
      </el-tab-pane>
    </el-tabs>

    <template v-if="mainTab === 'fee'">
      <el-card shadow="never" class="mb">
        <template #header>
          <div class="card-head">
            <span>服务费汇总（人民币 · 有服务费的行）</span>
            <div class="tools">
              <el-tag type="info">{{ feeTotals.rows }} 行</el-tag>
              <el-tag>应付 ¥{{ money(feeTotals.feeTotal) }}</el-tag>
              <el-tag type="success">已开 ¥{{ money(feeTotals.feeInvoiced) }}</el-tag>
              <el-tag type="danger">未开 ¥{{ money(feeTotals.feeUnbilled) }}</el-tag>
              <el-button :icon="Refresh" @click="refresh">刷新</el-button>
            </div>
          </div>
        </template>
        <el-table
          :data="feeByCompany"
          stripe
          size="small"
          empty-text="当前结算表没有服务费行"
          highlight-current-row
          @row-click="(row: { customer: string }) => pickFeeCompany(row.customer)"
        >
          <el-table-column prop="customer" label="公司" min-width="160" />
          <el-table-column label="行数" width="70" align="right">
            <template #default="{ row }">{{ row.rows }}</template>
          </el-table-column>
          <el-table-column label="应付服务费" width="130" align="right">
            <template #default="{ row }">{{ money(row.feeTotal) }}</template>
          </el-table-column>
          <el-table-column label="已开" width="120" align="right">
            <template #default="{ row }">
              <span class="ok">{{ money(row.feeInvoiced) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="未开" width="120" align="right">
            <template #default="{ row }">
              <strong :class="{ danger: row.feeUnbilled > 0 }">{{ money(row.feeUnbilled) }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="pickFeeCompany(row.customer)">看明细</el-button>
            </template>
          </el-table-column>
        </el-table>
        <p class="hint" style="margin-top: 8px">
          服务费常单独开票。点公司看下方明细；「去开服务费」会带服务费金额跳到开票信息。
        </p>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="card-head">
            <span>服务费明细{{ customer ? ` · ${customer}` : " · 全部公司" }}</span>
            <div class="tools">
              <el-select v-model="customer" clearable placeholder="全部公司" style="width: 160px">
                <el-option v-for="c in customers" :key="c" :label="c" :value="c" />
              </el-select>
              <el-select v-model="feeFilter" style="width: 140px">
                <el-option label="仅未开服务费" value="unbilled" />
                <el-option label="全部" value="all" />
              </el-select>
            </div>
          </div>
        </template>
        <el-table :data="feeDetailRows" stripe empty-text="没有服务费明细" max-height="560">
          <el-table-column label="服务费状态" width="120" fixed>
            <template #default="{ row }">
              <el-tag v-if="feeInvoiced(row)" type="success" size="small">服务费已开</el-tag>
              <el-tag v-else type="danger" size="small">服务费未开</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="customer" label="公司" min-width="120" show-overflow-tooltip />
          <el-table-column prop="period" label="账期" width="100" />
          <el-table-column prop="cloud" label="云" width="90" />
          <el-table-column prop="account" label="账号" min-width="140" show-overflow-tooltip />
          <el-table-column label="服务费（￥）" width="120" align="right">
            <template #default="{ row }">
              <strong>{{ money(row.fee_amount) }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="对应消耗" width="120" align="right">
            <template #default="{ row }">{{ money(row.consume) }}</template>
          </el-table-column>
          <el-table-column label="消耗开票" width="90">
            <template #default="{ row }">
              <el-tag
                v-if="(row.consume || 0) > 0"
                size="small"
                :type="consumeInvoiced(row) ? 'success' : 'danger'"
              >
                {{ consumeInvoiced(row) ? "已开" : "未开" }}
              </el-tag>
              <span v-else class="muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="!feeInvoiced(row)"
                type="primary"
                link
                @click="goInvoiceFee(row)"
              >
                去开服务费
              </el-button>
              <span v-else class="muted">—</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <template v-else>
    <el-card shadow="never" class="mb">
      <template #header>
        <div class="card-head">
          <span>消耗台账 · 按公司导出</span>
          <div class="tools">
            <el-button type="primary" link @click="router.push('/invoices')">
              开票信息 →
            </el-button>
            <el-button :icon="Refresh" @click="refresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-form label-position="top" class="filter-form">
        <el-row :gutter="16">
          <el-col :xs="24" :md="6">
            <el-form-item label="公司" required>
              <el-select v-model="customer" placeholder="选择公司" style="width: 100%">
                <el-option v-for="c in customers" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-form-item label="云厂商（可多选）" required>
              <el-select
                v-model="selectedClouds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="全部云 / 选择相关云"
                style="width: 100%"
                :disabled="!customer"
              >
                <el-option :value="ALL_CLOUDS" label="全部云" />
                <el-option v-for="c in cloudsForCustomer" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="5">
            <el-form-item label="账期">
              <el-select v-model="period" style="width: 100%" :disabled="!customer">
                <el-option v-for="p in periodsForCustomer" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="5">
            <el-form-item label="开票状态">
              <el-select v-model="invoiceFilter" style="width: 100%" :disabled="!customer">
                <el-option label="待开票（未开/开票中）" value="unbilled" />
                <el-option label="全部状态" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="actions">
          <el-button type="primary" :icon="Download" :disabled="!customer" @click="doExport">
            导出 Excel
          </el-button>
          <el-button
            type="success"
            plain
            :icon="Download"
            :disabled="!customer || period === '全部'"
            @click="doExportConfirmPdf"
          >
            导出云服务确认单 PDF
          </el-button>
          <span class="hint">
            来源 {{ files.length }} 个结算表 · 确认单须选具体账期（YYYYMM），文件名
            <code>云服务确认单_公司_账单日起.pdf</code>
          </span>
        </div>
      </el-form>
      <p class="meta">{{ settlementDir }}</p>
    </el-card>

    <el-card v-if="customer" shadow="never">
      <template #header>
        <div class="card-head">
          <span>
            预览 · {{ customer }}
            · {{ isAllClouds ? "全部云" : effectiveClouds.join(" / ") }}
            <template v-if="period !== '全部'"> · {{ period }}</template>
          </span>
          <div class="sum">
            <el-tag type="info">{{ previewRows.length }} 行</el-tag>
            <template v-for="t in totalsByCurrency" :key="t.currency">
              <el-tag>{{ t.currency }} · 消耗 {{ money(t.consume) }}</el-tag>
              <el-tag type="warning">{{ t.currency }} · 服务费 {{ money(t.fee) }}</el-tag>
              <el-tag type="success">{{ t.currency }} · 结算 {{ money(t.settle) }}</el-tag>
            </template>
          </div>
        </div>
      </template>

      <el-table :data="previewRows" stripe empty-text="无数据" max-height="560">
        <el-table-column label="开票状态" width="168" fixed>
          <template #default="{ row }">
            <div class="inv-stack">
              <div v-if="(row.consume || 0) > 0" class="inv-line">
                <span class="inv-k">消耗</span>
                <el-tag
                  size="small"
                  :type="consumeInvoiced(row) ? 'success' : 'danger'"
                >
                  {{ consumeInvoiced(row) ? "已开" : "未开" }}
                </el-tag>
              </div>
              <div v-if="(row.fee_amount || 0) > 0" class="inv-line">
                <span class="inv-k">服务费</span>
                <el-tag size="small" :type="feeInvoiced(row) ? 'success' : 'danger'">
                  {{ feeInvoiced(row) ? "已开" : "未开" }}
                </el-tag>
              </div>
              <div
                v-if="!(row.consume || 0) && !(row.fee_amount || 0)"
                class="inv-line"
              >
                <el-tag
                  size="small"
                  :type="row.invoice_status === 'invoiced' ? 'success' : 'danger'"
                >
                  {{ row.invoice_status_label }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="period" label="账期" width="100" />
        <el-table-column prop="cloud" label="云" width="90" />
        <el-table-column prop="account" label="账号" min-width="160" show-overflow-tooltip />
        <el-table-column label="币种" width="70" align="center">
          <template #default="{ row }">{{ unitLabel(row.currency || (row.cloud === "Akamai" ? "USD" : "CNY")) }}</template>
        </el-table-column>
        <el-table-column label="实际消耗" width="120" align="right">
          <template #default="{ row }">{{ money(row.consume) }}</template>
        </el-table-column>
        <el-table-column label="服务费" width="110" align="right">
          <template #default="{ row }">{{ money(row.fee_amount) }}</template>
        </el-table-column>
        <el-table-column label="结算合计" width="120" align="right">
          <template #default="{ row }">{{ money(row.settle_total) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="(row.consume || 0) > 0 && !consumeInvoiced(row)"
              type="primary"
              link
              @click="goInvoiceConsume(row)"
            >
              开消耗
            </el-button>
            <el-button
              v-if="(row.fee_amount || 0) > 0 && !feeInvoiced(row)"
              type="primary"
              link
              @click="goInvoiceFee(row)"
            >
              开服务费
            </el-button>
            <el-button
              v-if="row.invoice_status !== 'invoiced'"
              link
              @click="markInvoiced(row)"
            >
              整行已开
            </el-button>
            <el-button v-else link @click="clearInvoiceMark(row)">取消标记</el-button>
            <el-button link @click="markPaid(row, '已支付')">费已付</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    </template>
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: 16px;
}
.tab-badge {
  margin-left: 6px;
}
.tab-badge :deep(.el-badge__content) {
  transform: translateY(-2px);
}
.ok {
  color: var(--el-color-success);
}
.danger {
  color: var(--el-color-danger);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-form :deep(.el-form-item) {
  margin-bottom: 12px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}
.hint,
.meta,
.muted {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.meta {
  margin: 12px 0 0;
  word-break: break-all;
}
.sum {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.inv-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}
.inv-line {
  display: flex;
  align-items: center;
  gap: 6px;
}
.inv-k {
  width: 42px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
