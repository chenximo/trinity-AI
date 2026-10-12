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

const customer = ref("");
/** 含特殊值 ALL_CLOUDS 表示全部云；否则为具体云厂商列表 */
const selectedClouds = ref<string[]>([ALL_CLOUDS]);
const period = ref("全部");

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
  if (!customer.value) return ["全部"];
  const set = new Set(
    allRows.value
      .filter((r) => r.customer === customer.value)
      .filter((r) => !effectiveClouds.value.length || effectiveClouds.value.includes(r.cloud))
      .map((r) => r.period),
  );
  return ["全部", ...Array.from(set).sort().reverse()];
});

const previewRows = computed(() => {
  if (!customer.value) return [] as CloudLedgerRow[];
  return allRows.value
    .filter((r) => r.customer === customer.value)
    .filter((r) => !effectiveClouds.value.length || effectiveClouds.value.includes(r.cloud))
    .filter((r) => period.value === "全部" || r.period === period.value)
    .sort((a, b) => {
      if (a.period !== b.period) return b.period.localeCompare(a.period);
      if (a.cloud !== b.cloud) return a.cloud.localeCompare(b.cloud, "zh-CN");
      return a.account.localeCompare(b.account, "zh-CN");
    });
});

const totals = computed(() => {
  let consume = 0;
  let fee = 0;
  let settle = 0;
  for (const r of previewRows.value) {
    consume += r.consume || 0;
    fee += r.fee_amount || 0;
    settle += r.settle_total || 0;
  }
  return {
    consume: Math.round(consume * 100) / 100,
    fee: Math.round(fee * 100) / 100,
    settle: Math.round(settle * 100) / 100,
  };
});

function money(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

watch(customer, () => {
  selectedClouds.value = [ALL_CLOUDS];
  period.value = "全部";
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

async function load() {
  loading.value = true;
  try {
    const data = await api.cloudLedger();
    allRows.value = data.rows;
    settlementDir.value = data.settlement_dir;
    files.value = data.files;
    if (!customer.value && customers.value.length) {
      customer.value = customers.value[0];
      selectedClouds.value = [ALL_CLOUDS];
    } else if (customer.value && !isAllClouds.value) {
      selectedClouds.value = selectedClouds.value.filter((c) =>
        cloudsForCustomer.value.includes(c),
      );
      if (!selectedClouds.value.length) {
        selectedClouds.value = [ALL_CLOUDS];
      }
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
    const res = await fetch(exportUrl());
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
    const name = m ? decodeURIComponent(m[1]) : `${customer.value}_消耗.xlsx`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    ElMessage.success(`已导出 ${previewRows.value.length} 行`);
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

function goInvoice(row: CloudLedgerRow) {
  if (!row.customer_id) {
    ElMessage.warning("无法识别客户，请先在开票页手工建单");
    return;
  }
  router.push({
    path: "/invoices",
    query: {
      customer_id: row.customer_id,
      amount: row.settle_total != null ? String(row.settle_total) : "",
      row_key: row.row_key,
      period: row.period,
      cloud: row.cloud,
    },
  });
}

onMounted(load);
</script>

<template>
  <div v-loading="loading">
    <el-card shadow="never" class="mb">
      <template #header>
        <div class="card-head">
          <span>消耗台账 · 按公司导出</span>
          <el-button :icon="Refresh" @click="load">刷新扫描</el-button>
        </div>
      </template>

      <el-form label-position="top" class="filter-form">
        <el-row :gutter="16">
          <el-col :xs="24" :md="8">
            <el-form-item label="公司" required>
              <el-select v-model="customer" placeholder="选择公司" style="width: 100%">
                <el-option v-for="c in customers" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="10">
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
          <el-col :xs="24" :md="6">
            <el-form-item label="账期">
              <el-select v-model="period" style="width: 100%" :disabled="!customer">
                <el-option v-for="p in periodsForCustomer" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="actions">
          <el-button type="primary" :icon="Download" :disabled="!customer" @click="doExport">
            导出 Excel
          </el-button>
          <span class="hint">来源 {{ files.length }} 个结算表 · 切换公司/云即更新预览</span>
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
            <el-tag>消耗 {{ money(totals.consume) }}</el-tag>
            <el-tag type="warning">服务费 {{ money(totals.fee) }}</el-tag>
            <el-tag type="success">结算 {{ money(totals.settle) }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="previewRows" stripe empty-text="无数据" max-height="560">
        <el-table-column prop="period" label="账期" width="100" />
        <el-table-column prop="cloud" label="云" width="90" />
        <el-table-column prop="account" label="账号" min-width="160" show-overflow-tooltip />
        <el-table-column label="实际消耗" width="120" align="right">
          <template #default="{ row }">{{ money(row.consume) }}</template>
        </el-table-column>
        <el-table-column label="服务费" width="110" align="right">
          <template #default="{ row }">{{ money(row.fee_amount) }}</template>
        </el-table-column>
        <el-table-column label="结算合计" width="120" align="right">
          <template #default="{ row }">{{ money(row.settle_total) }}</template>
        </el-table-column>
        <el-table-column label="开票" width="90">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="
                row.invoice_status === 'invoiced'
                  ? 'success'
                  : row.invoice_status === 'invoicing'
                    ? 'warning'
                    : 'info'
              "
            >
              {{ row.invoice_status_label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.invoice_status !== 'invoiced'"
              type="primary"
              link
              @click="goInvoice(row)"
            >
              去开票
            </el-button>
            <el-button
              v-if="row.invoice_status !== 'invoiced'"
              link
              @click="markInvoiced(row)"
            >
              已开票
            </el-button>
            <el-button v-else link @click="clearInvoiceMark(row)">取消标记</el-button>
            <el-button link @click="markPaid(row, '已支付')">费已付</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: 16px;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
.meta {
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
</style>
