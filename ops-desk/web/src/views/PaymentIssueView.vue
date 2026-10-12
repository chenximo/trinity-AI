<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Download, Printer, Refresh, Delete } from "@element-plus/icons-vue";
import { api, type Customer, type Payee, type Payment, type PaymentPreview } from "../api/client";

const customers = ref<Customer[]>([]);
const payees = ref<Payee[]>([]);
const list = ref<Payment[]>([]);
const loading = ref(false);
const metaLoading = ref(false);

const customerId = ref("shanhe");
const cloud = ref("aliyun");
const amount = ref<number | null>(400000);
const applyDate = ref(new Date().toISOString().slice(0, 10));
const periodMonth = ref(new Date().getMonth() + 1);
const periodYear = ref(new Date().getFullYear());
const purpose = ref("");
const monthFilter = ref(new Date().toISOString().slice(0, 7));

const preview = ref<PaymentPreview | null>(null);
const lastPayment = ref<Payment | null>(null);
const downloadUrl = ref("");

const selectedPayee = computed(() => payees.value.find((p) => p.cloud === cloud.value));

async function loadMeta() {
  metaLoading.value = true;
  try {
    customers.value = await api.paymentCustomers();
    payees.value = await api.paymentPayees();
  } finally {
    metaLoading.value = false;
  }
}

async function loadList() {
  list.value = await api.paymentList(monthFilter.value);
}

function money(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function issue() {
  if (!customerId.value || !cloud.value || !amount.value || amount.value <= 0) {
    ElMessage.warning("请选择公司、云，并填写打款金额");
    return;
  }
  if (selectedPayee.value && !selectedPayee.value.ready) {
    ElMessage.error(`${selectedPayee.value.label} 收款信息未配置，无法出单`);
    return;
  }
  loading.value = true;
  try {
    const res = await api.issuePayment({
      customer_id: customerId.value,
      cloud: cloud.value,
      amount: amount.value,
      apply_date: applyDate.value,
      period_year: periodYear.value,
      period_month: periodMonth.value,
      purpose: purpose.value.trim() || undefined,
    });
    preview.value = res.preview;
    lastPayment.value = res.payment;
    downloadUrl.value = res.download_url;
    monthFilter.value = res.payment.month_key || monthFilter.value;
    await loadList();
    ElMessage.success("已出单，可预览打印或下载 Excel");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
}

function printPreview() {
  window.print();
}

function openDownload() {
  if (downloadUrl.value) window.open(downloadUrl.value, "_blank");
}

async function removeOne(id: number) {
  try {
    await ElMessageBox.confirm(`删除记录 #${id}？对应导出文件也会删掉。`, "确认删除", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  try {
    await api.deletePayment(id);
    if (lastPayment.value?.id === id) {
      preview.value = null;
      lastPayment.value = null;
      downloadUrl.value = "";
    }
    await loadList();
    ElMessage.success("已删除");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function clearMonth() {
  if (!monthFilter.value) return;
  try {
    await ElMessageBox.confirm(
      `清空 ${monthFilter.value} 全部 ${list.value.length} 笔记录及导出文件？`,
      "清空本月",
      { type: "warning", confirmButtonText: "清空", cancelButtonText: "取消" },
    );
  } catch {
    return;
  }
  try {
    const res = await api.deletePaymentsMonth(monthFilter.value);
    preview.value = null;
    lastPayment.value = null;
    downloadUrl.value = "";
    await loadList();
    ElMessage.success(res.deleted ? `已删除 ${res.deleted} 笔` : "该月没有可删记录");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

onMounted(async () => {
  try {
    await loadMeta();
    await loadList();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
});
</script>

<template>
  <div class="pay-layout" v-loading="metaLoading">
    <el-card shadow="never" class="no-print">
      <template #header>
        <div class="card-head">
          <span>出付款申请单</span>
          <el-tag size="small" type="info">打款用付款申请单</el-tag>
        </div>
      </template>
      <p class="hint">选公司 + 云，填打款金额 → 出单。预览可打印；Excel 按申请月留档。</p>

      <el-form label-position="top" class="issue-form">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="公司">
              <el-select v-model="customerId" placeholder="选择公司" style="width: 100%">
                <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="上游云">
              <el-select v-model="cloud" placeholder="选择云" style="width: 100%">
                <el-option
                  v-for="p in payees"
                  :key="p.cloud"
                  :label="p.ready ? p.label : `${p.label}（待配置）`"
                  :value="p.cloud"
                  :disabled="!p.ready"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="打款金额（元）">
              <el-input-number
                v-model="amount"
                :min="0.01"
                :precision="2"
                :step="1000"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="申请日期">
              <el-date-picker
                v-model="applyDate"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="用途月份">
              <div class="period-row">
                <el-input-number v-model="periodYear" :min="2020" :max="2100" controls-position="right" />
                <el-input-number
                  v-model="periodMonth"
                  :min="1"
                  :max="12"
                  controls-position="right"
                />
                <span>月</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="汇款用途（可空，自动生成）">
              <el-input
                v-model="purpose"
                clearable
                placeholder="例如：山河业务阿里云 10月费用资源费用充值"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="actions">
          <el-button type="primary" :loading="loading" @click="issue">出单并预览</el-button>
          <el-button v-if="preview" :icon="Printer" @click="printPreview">打印预览</el-button>
          <el-button v-if="downloadUrl" :icon="Download" @click="openDownload">
            下载 Excel
          </el-button>
          <el-text v-if="selectedPayee" type="info" size="small">
            收款：{{ selectedPayee.full_name }}
          </el-text>
        </div>
      </el-form>
    </el-card>

    <el-card v-if="preview" shadow="never" class="preview-sheet" id="payment-preview">
      <h2 class="preview-title">付款申请单</h2>
      <div class="preview-row">
        <span>单位名称：{{ preview.payer_name }}</span>
        <span>日期：{{ preview.apply_date_label }}</span>
      </div>
      <div class="preview-row">
        <span>申请部门：{{ preview.department }}</span>
        <span>申请人：{{ preview.applicant }}</span>
      </div>
      <table class="preview-table">
        <tr>
          <th rowspan="3">收款人或单位信息</th>
          <td>全称</td>
          <td colspan="3">{{ preview.payee_name }}</td>
        </tr>
        <tr>
          <td>账号</td>
          <td colspan="3">{{ preview.payee_account }}</td>
        </tr>
        <tr>
          <td>开户银行</td>
          <td colspan="3">{{ preview.payee_bank }}</td>
        </tr>
        <tr>
          <th rowspan="2">汇款金额</th>
          <td>人民币 小写</td>
          <td colspan="3">{{ money(preview.amount) }}</td>
        </tr>
        <tr>
          <td>人民币 大写</td>
          <td colspan="3">{{ preview.amount_upper }}</td>
        </tr>
        <tr>
          <th>汇款用途</th>
          <td colspan="4">{{ preview.purpose }}</td>
        </tr>
      </table>
      <div class="preview-sign">
        <span>审批：</span>
        <span>部门主管：</span>
        <span>财务审核：</span>
        <span>出纳：</span>
      </div>
      <el-text v-if="lastPayment" class="no-print" type="info" size="small">
        已留档 #{{ lastPayment.id }} · {{ lastPayment.export_path }}
      </el-text>
    </el-card>

    <el-card shadow="never" class="no-print">
      <template #header>
        <div class="card-head">
          <span>本月记录</span>
          <div class="list-tools">
            <el-date-picker
              v-model="monthFilter"
              type="month"
              value-format="YYYY-MM"
              placeholder="选择月份"
              @change="loadList"
            />
            <el-button :icon="Refresh" @click="loadList">刷新</el-button>
            <el-button type="danger" plain :disabled="!list.length" :icon="Delete" @click="clearMonth">
              清空本月
            </el-button>
            <el-tag type="info">{{ list.length }} 笔</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="list" stripe empty-text="本月暂无记录" style="width: 100%">
        <el-table-column prop="apply_date" label="申请日" width="120" />
        <el-table-column prop="customer_name" label="公司" min-width="160" show-overflow-tooltip />
        <el-table-column prop="cloud_label" label="云" width="90" />
        <el-table-column label="金额" width="130" align="right">
          <template #default="{ row }">{{ money(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" min-width="220" show-overflow-tooltip />
        <el-table-column label="文件" width="90">
          <template #default="{ row }">
            <el-link type="primary" :href="`/api/payments/${row.id}/file`" target="_blank">下载</el-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="removeOne(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.pay-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.hint {
  margin: 0 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.period-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.list-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.preview-sheet {
  max-width: 860px;
}
.preview-title {
  text-align: center;
  margin: 0 0 16px;
  letter-spacing: 0.25em;
  font-size: 22px;
}
.preview-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}
.preview-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
.preview-table th,
.preview-table td {
  border: 1px solid #303133;
  padding: 10px 12px;
  font-size: 14px;
}
.preview-table th {
  width: 130px;
  background: #fafafa;
  font-weight: 600;
}
.preview-sign {
  display: flex;
  justify-content: space-between;
  margin: 18px 0 8px;
  font-size: 14px;
}
</style>
