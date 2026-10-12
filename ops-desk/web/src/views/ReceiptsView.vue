<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Refresh } from "@element-plus/icons-vue";
import { api, type BillToProfile, type TrinityInvoice, type TrinityPreview } from "../api/client";

const router = useRouter();
const tab = ref("trinity");
const billTos = ref<BillToProfile[]>([]);
const list = ref<TrinityInvoice[]>([]);
const loading = ref(false);

const billToId = ref("far");
const amountUsd = ref<number | null>(null);
const periodLabel = ref("");
const description = ref("");
const campaign = ref("-");
const invoiceDate = ref(new Date().toISOString().slice(0, 10));
const monthFilter = ref(new Date().toISOString().slice(0, 7));

const preview = ref<TrinityPreview | null>(null);
const lastInvoice = ref<TrinityInvoice | null>(null);
const downloadUrl = ref("");

const selectedBillTo = computed(() => billTos.value.find((b) => b.id === billToId.value));

watch(billToId, (id) => {
  const b = billTos.value.find((x) => x.id === id);
  if (b && !description.value) description.value = b.default_description;
});

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadMeta() {
  billTos.value = await api.trinityBillTos();
  if (!billToId.value && billTos.value.length) billToId.value = billTos.value[0].id;
  const b = selectedBillTo.value;
  if (b) description.value = b.default_description;
}

async function loadList() {
  list.value = await api.trinityInvoiceList(monthFilter.value || undefined);
}

async function issue() {
  if (!billToId.value || !amountUsd.value || amountUsd.value <= 0) {
    ElMessage.warning("请选择 Bill To 并填写 USD 金额");
    return;
  }
  if (!periodLabel.value.trim()) {
    ElMessage.warning("请填写 Period（如 9-2026）");
    return;
  }
  loading.value = true;
  try {
    const res = await api.issueTrinityInvoice({
      bill_to_id: billToId.value,
      amount_usd: amountUsd.value,
      period_label: periodLabel.value.trim(),
      description: description.value.trim() || undefined,
      campaign: campaign.value.trim() || "-",
      invoice_date: invoiceDate.value,
    });
    preview.value = res.preview;
    lastInvoice.value = res.invoice;
    downloadUrl.value = res.download_url;
    monthFilter.value = res.invoice.month_key || monthFilter.value;
    await loadList();
    ElMessage.success(`已出 Invoice ${res.invoice.invoice_no}`);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
}

function openDownload(url?: string) {
  const u = url || downloadUrl.value;
  if (u) window.open(u, "_blank");
}

async function removeOne(id: number) {
  try {
    await ElMessageBox.confirm(`删除 Invoice #${id}？导出文件一并删除。`, "确认", {
      type: "warning",
    });
  } catch {
    return;
  }
  try {
    await api.deleteTrinityInvoice(id);
    if (lastInvoice.value?.id === id) {
      preview.value = null;
      lastInvoice.value = null;
      downloadUrl.value = "";
    }
    await loadList();
    ElMessage.success("已删除");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function clearMonth() {
  if (!monthFilter.value) {
    ElMessage.warning("请先选择月份");
    return;
  }
  try {
    await ElMessageBox.confirm(`清空 ${monthFilter.value} 全部 Trinity Invoice？`, "清空本月", {
      type: "warning",
    });
  } catch {
    return;
  }
  try {
    const res = await api.deleteTrinityInvoicesMonth(monthFilter.value);
    preview.value = null;
    lastInvoice.value = null;
    downloadUrl.value = "";
    await loadList();
    ElMessage.success(res.deleted ? `已删除 ${res.deleted} 笔` : "该月无记录");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    await loadMeta();
    await loadList();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-loading="loading">
    <el-tabs v-model="tab">
      <el-tab-pane label="Trinity 收款（USD Invoice）" name="trinity">
        <el-card shadow="never" class="mb">
          <template #header>
            <div class="card-head">
              <span>出 Commercial Invoice</span>
              <el-tag size="small" type="success">收款主体 TRINITY AI INC</el-tag>
            </div>
          </template>
          <p class="hint">
            选 Bill To → 填 Period / 金额 → 出单。不占用国内增值税 50 万额度。模板见
            ops-desk/templates/trinity-invoice-template.xlsx
          </p>
          <el-form label-position="top">
            <el-row :gutter="16">
              <el-col :xs="24" :md="8">
                <el-form-item label="Bill To（客户）" required>
                  <el-select v-model="billToId" style="width: 100%">
                    <el-option
                      v-for="b in billTos"
                      :key="b.id"
                      :label="`${b.label} · ${b.bill_to}`"
                      :value="b.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="Amount / USD" required>
                  <el-input-number
                    v-model="amountUsd"
                    :min="0.01"
                    :precision="2"
                    :step="100"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="Invoice Date">
                  <el-date-picker
                    v-model="invoiceDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="Period" required>
                  <el-input v-model="periodLabel" placeholder="如 9-2026 或 Sep 07–12, 2026" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="Description">
                  <el-input v-model="description" placeholder="Computer services / Advertising fee" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="Campaign">
                  <el-input v-model="campaign" placeholder="-" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-alert
              v-if="selectedBillTo"
              type="info"
              :closable="false"
              show-icon
              class="mb"
              :title="`Address：${selectedBillTo.address}`"
            />
            <el-button type="primary" @click="issue">出 Invoice</el-button>
            <el-button
              :icon="Download"
              :disabled="!downloadUrl"
              @click="openDownload()"
            >
              下载 Excel
            </el-button>
          </el-form>
        </el-card>

        <el-card v-if="preview" shadow="never" class="mb">
          <template #header>预览</template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="Invoice No.">{{ preview.invoice_no }}</el-descriptions-item>
            <el-descriptions-item label="Date">{{ preview.invoice_date }}</el-descriptions-item>
            <el-descriptions-item label="Bill To" :span="2">{{ preview.bill_to }}</el-descriptions-item>
            <el-descriptions-item label="Description">{{ preview.description }}</el-descriptions-item>
            <el-descriptions-item label="Period">{{ preview.period_label }}</el-descriptions-item>
            <el-descriptions-item label="Amount/USD">
              $ {{ money(preview.amount_usd) }}
            </el-descriptions-item>
            <el-descriptions-item label="Beneficiary">{{ preview.beneficiary }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="card-head">
              <span>本月记录</span>
              <div class="tools">
                <el-date-picker
                  v-model="monthFilter"
                  type="month"
                  value-format="YYYY-MM"
                  @change="loadList"
                />
                <el-button :icon="Refresh" @click="loadList">刷新</el-button>
                <el-button type="danger" plain :disabled="!list.length" @click="clearMonth">
                  清空本月
                </el-button>
                <el-tag type="info">{{ list.length }} 笔</el-tag>
              </div>
            </div>
          </template>
          <el-table :data="list" stripe empty-text="本月暂无 Trinity Invoice">
            <el-table-column prop="invoice_date" label="Date" width="110" />
            <el-table-column prop="invoice_no" label="Invoice No." width="130" />
            <el-table-column prop="bill_to" label="Bill To" min-width="180" show-overflow-tooltip />
            <el-table-column prop="period_label" label="Period" width="140" show-overflow-tooltip />
            <el-table-column label="USD" width="110" align="right">
              <template #default="{ row }">$ {{ money(row.amount_usd) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  :icon="Download"
                  :disabled="!row.download_url"
                  @click="openDownload(row.download_url || undefined)"
                >
                  下载
                </el-button>
                <el-button type="danger" link :icon="Delete" @click="removeOne(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="国内收款（增值税开票）" name="domestic">
        <el-card shadow="never">
          <p class="hint">
            国内人民币收款对应增值税发票，已在「开票信息」模块（抬头、额度 50 万、消耗台账联动）。
          </p>
          <el-button type="primary" @click="router.push('/invoices')">前往开票信息</el-button>
        </el-card>
      </el-tab-pane>
    </el-tabs>
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
.tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
