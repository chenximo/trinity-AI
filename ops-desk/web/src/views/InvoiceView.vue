<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { CopyDocument, Delete, Plus, Refresh } from "@element-plus/icons-vue";
import {
  api,
  type Customer,
  type InvoiceProfile,
  type InvoiceProfileIn,
  type InvoiceQuota,
  type InvoiceRecord,
} from "../api/client";

const route = useRoute();
const highlightId = ref<number | null>(null);

const tab = ref("records");
const customers = ref<Customer[]>([]);
const profiles = ref<InvoiceProfile[]>([]);
const records = ref<InvoiceRecord[]>([]);
const quota = ref<InvoiceQuota | null>(null);
/** 按申请日所在月的额度（新建时校验用） */
const formQuota = ref<InvoiceQuota | null>(null);
const loading = ref(false);

/** 默认全部月份，便于看到税控历史已开票 */
const monthFilter = ref<string | undefined>(undefined);

// new record form
const customerId = ref("shanhe");
const profileId = ref<number | undefined>();
const amount = ref<number | null>(null);
const invoiceType = ref("增值税专用发票");
const paymentReceived = ref("是");
const remark = ref("");
const applyDate = ref(new Date().toISOString().slice(0, 10));
const buyerName = ref("");
const taxNo = ref("");
const addressPhone = ref("");
const bankAccount = ref("");
const sourceRowKeys = ref<string[]>([]);
const settlementHint = ref("");

const formMonth = computed(() => (applyDate.value || "").slice(0, 7));
const activeQuota = computed(() => formQuota.value || quota.value);

// customer dialog
const customerDialog = ref(false);
const customerForm = ref({ name: "", purpose_name: "", id: "" });

// profile dialog
const profileDialog = ref(false);
const editingProfileId = ref<number | null>(null);
const profileForm = ref<InvoiceProfileIn>({
  customer_id: "shanhe",
  title: "",
  tax_no: "",
  address_phone: "",
  bank_account: "",
  default_invoice_type: "增值税专用发票",
  remark: "",
  is_default: true,
});

const customerProfiles = computed(() =>
  profiles.value.filter((p) => p.customer_id === customerId.value),
);

const remainingAfterAmount = computed(() => {
  if (!activeQuota.value || amount.value == null) return null;
  return Math.round((activeQuota.value.remaining - amount.value) * 100) / 100;
});

const amountOverQuota = computed(() => {
  if (!activeQuota.value || amount.value == null) return false;
  return amount.value > activeQuota.value.remaining + 1e-9;
});

const statusLabel: Record<string, string> = {
  draft: "草稿",
  copied: "已复制",
  submitted: "已提交钉钉",
  invoiced: "已开票",
  void: "作废",
};

function money(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadAll() {
  loading.value = true;
  try {
    customers.value = await api.paymentCustomers();
    profiles.value = await api.invoiceProfiles();
    records.value = await api.invoiceRecords(monthFilter.value || undefined);
    const qMonth = monthFilter.value || formMonth.value || new Date().toISOString().slice(0, 7);
    quota.value = await api.invoiceQuota(qMonth);
    if (formMonth.value) {
      formQuota.value =
        formMonth.value === monthFilter.value
          ? quota.value
          : await api.invoiceQuota(formMonth.value);
    }
    syncProfileFields();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
}

watch(formMonth, async (m) => {
  if (!m) return;
  if (m === monthFilter.value && quota.value) {
    formQuota.value = quota.value;
    return;
  }
  try {
    formQuota.value = await api.invoiceQuota(m);
  } catch {
    /* ignore */
  }
});

function customerDisplayName(id: string) {
  return customers.value.find((c) => c.id === id)?.name || "";
}

/** 换客户时强制对齐购方字段，避免残留上一客户抬头 */
function applyCustomerBuyerState(id: string) {
  const list = profiles.value.filter((p) => p.customer_id === id);
  if (!list.length) {
    profileId.value = undefined;
    buyerName.value = customerDisplayName(id);
    taxNo.value = "";
    addressPhone.value = "";
    bankAccount.value = "";
    return;
  }
  const cur = list.find((p) => p.is_default) || list[0];
  profileId.value = cur.id;
  buyerName.value = cur.title;
  taxNo.value = cur.tax_no;
  addressPhone.value = cur.address_phone;
  bankAccount.value = cur.bank_account;
  invoiceType.value = cur.default_invoice_type || "增值税专用发票";
}

function syncProfileFields() {
  applyCustomerBuyerState(customerId.value);
}

const buyerMismatch = computed(() => {
  const cname = customerDisplayName(customerId.value);
  if (!cname || !buyerName.value.trim()) return false;
  // 有抬头时以抬头为准；无抬头时期望购方=客户名
  if (!customerProfiles.value.length) {
    return buyerName.value.trim() !== cname;
  }
  return !customerProfiles.value.some((p) => p.title === buyerName.value.trim());
});

watch(
  customerId,
  (id) => {
    applyCustomerBuyerState(id);
  },
  { flush: "sync" },
);

watch(profileId, (id, prev) => {
  // 仅在用户改抬头时同步；换客户由 applyCustomerBuyerState 负责
  if (id == null) {
    if (prev != null && !customerProfiles.value.length) {
      buyerName.value = customerDisplayName(customerId.value);
      taxNo.value = "";
      addressPhone.value = "";
      bankAccount.value = "";
    }
    return;
  }
  const p = profiles.value.find((x) => x.id === id);
  if (!p || p.customer_id !== customerId.value) return;
  buyerName.value = p.title;
  taxNo.value = p.tax_no;
  addressPhone.value = p.address_phone;
  bankAccount.value = p.bank_account;
  invoiceType.value = p.default_invoice_type || "增值税专用发票";
});

async function createRecord() {
  if (!customerId.value || !amount.value || amount.value <= 0) {
    ElMessage.warning("请选择客户并填写开票金额");
    return;
  }
  if (!buyerName.value.trim()) {
    ElMessage.warning("请先配置开票抬头，或填写购方名称");
    return;
  }
  if (amountOverQuota.value && activeQuota.value) {
    ElMessage.warning(
      `${activeQuota.value.month} 剩余额度仅 ${money(activeQuota.value.remaining)} 元，无法再开 ${money(amount.value)} 元`,
    );
    return;
  }
  loading.value = true;
  try {
    const rec = await api.createInvoiceRecord({
      customer_id: customerId.value,
      profile_id: profileId.value,
      buyer_name: buyerName.value.trim(),
      tax_no: taxNo.value.trim(),
      address_phone: addressPhone.value.trim(),
      bank_account: bankAccount.value.trim(),
      invoice_type: invoiceType.value,
      amount: amount.value,
      payment_received: paymentReceived.value,
      remark: remark.value || settlementHint.value,
      apply_date: applyDate.value,
      status: "draft",
      source_row_keys: sourceRowKeys.value,
    });
    monthFilter.value = rec.month_key || monthFilter.value;
    sourceRowKeys.value = [];
    settlementHint.value = "";
    await loadAll();
    ElMessage.success("已创建开票记录，可一键复制到钉钉");
    tab.value = "records";
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
}

async function copyText(text: string, id?: number) {
  try {
    await navigator.clipboard.writeText(text);
    if (id) {
      await api.patchInvoiceRecordStatus(id, "copied");
      await loadAll();
    }
    ElMessage.success("已复制到剪贴板，可粘贴到钉钉开票申请");
  } catch {
    ElMessage.error("复制失败，请手动选择文本复制");
  }
}

async function setStatus(id: number, status: string) {
  try {
    await api.patchInvoiceRecordStatus(id, status);
    await loadAll();
    ElMessage.success("状态已更新");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function removeRecord(id: number) {
  try {
    await ElMessageBox.confirm(`删除开票记录 #${id}？`, "确认删除", { type: "warning" });
  } catch {
    return;
  }
  try {
    await api.deleteInvoiceRecord(id);
    await loadAll();
    ElMessage.success("已删除");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function clearMonth() {
  if (!monthFilter.value) {
    ElMessage.warning("请先选择月份再清空（全部月份不可一键清空）");
    return;
  }
  try {
    await ElMessageBox.confirm(
      `清空 ${monthFilter.value} 全部 ${records.value.length} 笔开票记录？`,
      "清空本月",
      { type: "warning" },
    );
  } catch {
    return;
  }
  try {
    const res = await api.deleteInvoiceRecordsMonth(monthFilter.value);
    await loadAll();
    ElMessage.success(res.deleted ? `已删除 ${res.deleted} 笔` : "该月没有可删记录");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

const listTotals = computed(() => {
  let amount = 0;
  let ex = 0;
  let tax = 0;
  for (const r of records.value) {
    amount += r.amount || 0;
    if (r.amount_ex_tax != null) ex += r.amount_ex_tax;
    if (r.tax_amount != null) tax += r.tax_amount;
  }
  return {
    amount: Math.round(amount * 100) / 100,
    ex: Math.round(ex * 100) / 100,
    tax: Math.round(tax * 100) / 100,
  };
});

function openCreateCustomer() {
  customerForm.value = { name: "", purpose_name: "", id: "" };
  customerDialog.value = true;
}

async function saveCustomer() {
  if (!customerForm.value.name.trim()) {
    ElMessage.warning("请填写客户名称");
    return;
  }
  try {
    const c = await api.createCustomer({
      name: customerForm.value.name.trim(),
      purpose_name: customerForm.value.purpose_name.trim() || undefined,
      id: customerForm.value.id.trim() || undefined,
    });
    customers.value = await api.paymentCustomers();
    customerId.value = c.id;
    applyCustomerBuyerState(c.id);
    customerDialog.value = false;
    ElMessage.success(`客户「${c.name}」已添加，请再维护开票抬头`);
    // 方便接着建抬头
    openCreateProfile();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

function openCreateProfile() {
  editingProfileId.value = null;
  profileForm.value = {
    customer_id: customerId.value || "shanhe",
    title: "",
    tax_no: "",
    address_phone: "",
    bank_account: "",
    default_invoice_type: "增值税专用发票",
    remark: "",
    is_default: true,
  };
  profileDialog.value = true;
}

function openEditProfile(p: InvoiceProfile) {
  editingProfileId.value = p.id;
  profileForm.value = {
    customer_id: p.customer_id,
    title: p.title,
    tax_no: p.tax_no,
    address_phone: p.address_phone,
    bank_account: p.bank_account,
    default_invoice_type: p.default_invoice_type,
    remark: p.remark,
    is_default: p.is_default,
  };
  profileDialog.value = true;
}

async function saveProfile() {
  if (!profileForm.value.title.trim()) {
    ElMessage.warning("请填写购方名称 / 抬头");
    return;
  }
  try {
    if (editingProfileId.value) {
      await api.updateInvoiceProfile(editingProfileId.value, profileForm.value);
    } else {
      await api.createInvoiceProfile(profileForm.value);
    }
    profileDialog.value = false;
    await loadAll();
    ElMessage.success("抬头已保存");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function removeProfile(id: number) {
  try {
    await ElMessageBox.confirm("删除该开票抬头？", "确认", { type: "warning" });
  } catch {
    return;
  }
  try {
    await api.deleteInvoiceProfile(id);
    await loadAll();
    ElMessage.success("已删除");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

onMounted(async () => {
  const m = typeof route.query.month === "string" ? route.query.month : "";
  if (m && /^\d{4}-\d{2}$/.test(m)) monthFilter.value = m;
  const hid = typeof route.query.highlight === "string" ? Number(route.query.highlight) : NaN;
  if (!Number.isNaN(hid)) highlightId.value = hid;

  const cid = typeof route.query.customer_id === "string" ? route.query.customer_id : "";
  if (cid) customerId.value = cid;
  const amt = typeof route.query.amount === "string" ? Number(route.query.amount) : NaN;
  if (!Number.isNaN(amt) && amt > 0) amount.value = amt;
  const rk = typeof route.query.row_key === "string" ? route.query.row_key : "";
  if (rk) {
    sourceRowKeys.value = [rk];
    const period = typeof route.query.period === "string" ? route.query.period : "";
    const cloud = typeof route.query.cloud === "string" ? route.query.cloud : "";
    settlementHint.value = `来自消耗台账 ${period} ${cloud}`.trim();
    if (!remark.value) remark.value = settlementHint.value;
    tab.value = "records";
  }

  await loadAll();
  if (highlightId.value) tab.value = "records";
  if (rk && activeQuota.value && amount.value && amount.value > activeQuota.value.remaining) {
    ElMessage.warning(
      `台账结算合计超过本月剩余额度（剩余 ${money(activeQuota.value.remaining)}），请改小金额后再保存`,
    );
  }
});
</script>

<template>
  <div v-loading="loading">
    <el-card v-if="activeQuota" shadow="never" class="mb quota-card">
      <div class="quota-row">
        <div class="quota-item">
          <div class="quota-label">{{ activeQuota.month }} 月额度</div>
          <div class="quota-value">¥ {{ money(activeQuota.quota) }}</div>
        </div>
        <div class="quota-item">
          <div class="quota-label">已开出</div>
          <div class="quota-value">¥ {{ money(activeQuota.used_invoiced) }}</div>
        </div>
        <div class="quota-item">
          <div class="quota-label">占用中</div>
          <div class="quota-value muted">¥ {{ money(activeQuota.used_pending) }}</div>
          <div class="quota-hint">草稿 / 已复制 / 已提交</div>
        </div>
        <div class="quota-item highlight">
          <div class="quota-label">剩余可开</div>
          <div class="quota-value" :class="{ danger: activeQuota.remaining <= 0 }">
            ¥ {{ money(activeQuota.remaining) }}
          </div>
          <div class="quota-hint">{{ activeQuota.record_count }} 笔非作废</div>
        </div>
      </div>
      <el-alert
        v-if="activeQuota.remaining <= 0"
        type="error"
        :closable="false"
        show-icon
        title="本月额度已用尽；删除或作废记录后可释放额度"
        class="quota-alert"
      />
      <el-alert
        v-else-if="amountOverQuota"
        type="warning"
        :closable="false"
        show-icon
        :title="`本次金额超过剩余额度（保存后剩余约 ${money(remainingAfterAmount ?? 0)}）`"
        class="quota-alert"
      />
    </el-card>

    <el-tabs v-model="tab">
      <el-tab-pane label="开票记录" name="records">
        <el-card shadow="never" class="mb">
          <template #header>
            <div class="card-head">
              <span>新建开票记录</span>
              <div class="tools">
                <el-tag v-if="sourceRowKeys.length" size="small" type="success">
                  已关联台账 {{ sourceRowKeys.length }} 行
                </el-tag>
                <el-tag size="small" type="info">复制后粘贴到钉钉</el-tag>
              </div>
            </div>
          </template>
          <el-alert
            v-if="settlementHint"
            type="info"
            :closable="false"
            show-icon
            :title="`${settlementHint} · 金额已按结算合计预填，可按额度改小`"
            class="mb"
          />
          <el-form label-position="top">
            <el-row :gutter="16">
              <el-col :xs="24" :md="8">
                <el-form-item label="客户">
                  <div class="customer-row">
                    <el-select
                      v-model="customerId"
                      filterable
                      style="flex: 1; min-width: 0"
                      placeholder="选择或搜索客户"
                      @change="applyCustomerBuyerState"
                    >
                      <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
                    </el-select>
                    <el-button :icon="Plus" @click="openCreateCustomer">新建</el-button>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="开票抬头">
                  <el-select
                    v-model="profileId"
                    clearable
                    placeholder="请先维护抬头"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="p in customerProfiles"
                      :key="p.id"
                      :label="p.title"
                      :value="p.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="开票金额（元）">
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
              <el-col :xs="24" :md="8">
                <el-form-item label="票种">
                  <el-select v-model="invoiceType" style="width: 100%">
                    <el-option label="电子发票（普通发票）" value="电子发票（普通发票）" />
                    <el-option label="增值税专用发票" value="增值税专用发票" />
                    <el-option label="增值税普通发票" value="增值税普通发票" />
                    <el-option label="电子专票" value="电子专票" />
                    <el-option label="电子普票" value="电子普票" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="是否已完成收款">
                  <el-select v-model="paymentReceived" style="width: 100%">
                    <el-option label="是" value="是" />
                    <el-option label="否" value="否" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="申请日期">
                  <el-date-picker
                    v-model="applyDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="buyerMismatch || !customerProfiles.length">
                <el-alert
                  :type="buyerMismatch ? 'warning' : 'info'"
                  :closable="false"
                  show-icon
                  class="mb"
                  :title="
                    !customerProfiles.length
                      ? `当前客户「${customerDisplayName(customerId)}」还没有开票抬头：购方已按客户名预填，请点「去维护抬头」补全税号等`
                      : `购方「${buyerName}」与当前客户抬头不一致，请重新选择开票抬头`
                  "
                />
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="购方名称">
                  <el-input v-model="buyerName" placeholder="默认与客户/抬头一致" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="纳税人识别号">
                  <el-input v-model="taxNo" :placeholder="customerProfiles.length ? '' : '请先维护抬头'" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="地址、电话">
                  <el-input
                    v-model="addressPhone"
                    :placeholder="customerProfiles.length ? '' : '请先维护抬头'"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="开户行及账号">
                  <el-input
                    v-model="bankAccount"
                    :placeholder="customerProfiles.length ? '' : '请先维护抬头'"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input v-model="remark" type="textarea" :rows="2" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-button type="primary" :disabled="amountOverQuota" @click="createRecord">
              保存开票记录
            </el-button>
            <el-button @click="tab = 'profiles'">去维护抬头</el-button>
            <span v-if="activeQuota && amount" class="remain-hint">
              保存后 {{ activeQuota.month }} 剩余约 ¥
              {{ money(Math.max(remainingAfterAmount ?? 0, 0)) }}
            </span>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="card-head">
              <span>开票记录{{ monthFilter ? ` · ${monthFilter}` : " · 全部" }}</span>
              <div class="tools">
                <el-date-picker
                  v-model="monthFilter"
                  type="month"
                  value-format="YYYY-MM"
                  clearable
                  placeholder="全部月份"
                  @change="loadAll"
                />
                <el-button :icon="Refresh" @click="loadAll">刷新</el-button>
                <el-button
                  type="danger"
                  plain
                  :disabled="!records.length || !monthFilter"
                  @click="clearMonth"
                >
                  清空本月
                </el-button>
                <el-tag type="info">{{ records.length }} 笔</el-tag>
                <el-tag>合计金额 {{ money(listTotals.ex) }}</el-tag>
                <el-tag type="warning">税额 {{ money(listTotals.tax) }}</el-tag>
                <el-tag type="success">价税合计 {{ money(listTotals.amount) }}</el-tag>
              </div>
            </div>
          </template>

          <el-table
            :data="records"
            stripe
            empty-text="暂无开票记录"
            :row-class-name="({ row }) => (row.id === highlightId ? 'row-highlight' : '')"
          >
            <el-table-column prop="apply_date" label="开票日期" width="120" />
            <el-table-column prop="customer_name" label="客户" min-width="100" show-overflow-tooltip />
            <el-table-column prop="buyer_name" label="购方抬头" min-width="160" show-overflow-tooltip />
            <el-table-column prop="seller_name" label="企业主体" min-width="160" show-overflow-tooltip />
            <el-table-column label="金额" width="110" align="right">
              <template #default="{ row }">
                {{ row.amount_ex_tax != null ? money(row.amount_ex_tax) : "—" }}
              </template>
            </el-table-column>
            <el-table-column label="税额" width="100" align="right">
              <template #default="{ row }">
                {{ row.tax_amount != null ? money(row.tax_amount) : "—" }}
              </template>
            </el-table-column>
            <el-table-column label="价税合计" width="120" align="right">
              <template #default="{ row }">{{ money(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="invoice_type" label="票种" min-width="140" show-overflow-tooltip />
            <el-table-column label="数电发票号码" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.invoice_no || "—" }}</template>
            </el-table-column>
            <el-table-column label="台账" width="90">
              <template #default="{ row }">
                <el-tag v-if="row.source_row_keys?.length" size="small" type="success">
                  {{ row.source_row_keys.length }} 行
                </el-tag>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ statusLabel[row.status] || row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :icon="CopyDocument" @click="copyText(row.copy_text, row.id)">
                  复制
                </el-button>
                <el-button link @click="setStatus(row.id, 'submitted')">已提交钉钉</el-button>
                <el-button link @click="setStatus(row.id, 'invoiced')">已开票</el-button>
                <el-button type="danger" link :icon="Delete" @click="removeRecord(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="开票抬头" name="profiles">
        <el-card shadow="never">
          <template #header>
            <div class="card-head">
              <span>客户开票信息</span>
              <el-button type="primary" :icon="Plus" @click="openCreateProfile">新建抬头</el-button>
            </div>
          </template>
          <el-table :data="profiles" stripe empty-text="暂无抬头，请先新建">
            <el-table-column prop="customer_name" label="客户" min-width="140" />
            <el-table-column prop="title" label="购方名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="tax_no" label="税号" min-width="160" show-overflow-tooltip />
            <el-table-column prop="default_invoice_type" label="默认票种" width="130" />
            <el-table-column label="默认" width="70">
              <template #default="{ row }">
                <el-tag v-if="row.is_default" size="small" type="success">是</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  :icon="CopyDocument"
                  @click="
                    copyText(
                      `购方名称：${row.title}\n纳税人识别号：${row.tax_no}\n地址、电话：${row.address_phone}\n开户行及账号：${row.bank_account}`,
                    )
                  "
                >
                  复制抬头
                </el-button>
                <el-button link @click="openEditProfile(row)">编辑</el-button>
                <el-button type="danger" link @click="removeProfile(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="customerDialog" title="新建客户" width="480px">
      <el-form label-position="top">
        <el-form-item label="客户名称" required>
          <el-input v-model="customerForm.name" placeholder="如：经营帮科技有限公司" />
        </el-form-item>
        <el-form-item label="用途简称（付款单等）">
          <el-input v-model="customerForm.purpose_name" placeholder="不填则同客户名称" />
        </el-form-item>
        <el-form-item label="内部 id（可选）">
          <el-input v-model="customerForm.id" placeholder="英文/数字，不填自动生成" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="customerDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCustomer">保存并维护抬头</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="profileDialog"
      :title="editingProfileId ? '编辑开票抬头' : '新建开票抬头'"
      width="560px"
    >
      <el-form label-position="top">
        <el-form-item label="客户">
          <div class="customer-row">
            <el-select v-model="profileForm.customer_id" filterable style="flex: 1; min-width: 0">
              <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
            <el-button :icon="Plus" @click="openCreateCustomer">新建</el-button>
          </div>
        </el-form-item>
        <el-form-item label="购方名称" required>
          <el-input v-model="profileForm.title" />
        </el-form-item>
        <el-form-item label="纳税人识别号">
          <el-input v-model="profileForm.tax_no" />
        </el-form-item>
        <el-form-item label="地址、电话">
          <el-input v-model="profileForm.address_phone" />
        </el-form-item>
        <el-form-item label="开户行及账号">
          <el-input v-model="profileForm.bank_account" />
        </el-form-item>
        <el-form-item label="默认票种">
          <el-select v-model="profileForm.default_invoice_type" style="width: 100%">
            <el-option label="增值税专用发票" value="增值税专用发票" />
            <el-option label="增值税普通发票" value="增值税普通发票" />
            <el-option label="电子专票" value="电子专票" />
            <el-option label="电子普票" value="电子普票" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="profileForm.remark" />
        </el-form-item>
        <el-form-item label="设为该客户默认抬头">
          <el-switch v-model="profileForm.is_default" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
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
.customer-row {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
}
.quota-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 16px;
}
.quota-item.highlight {
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
}
.quota-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.quota-value {
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.quota-value.muted {
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.quota-value.danger {
  color: var(--el-color-danger);
}
.quota-hint {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.quota-alert {
  margin-top: 12px;
}
.remain-hint {
  margin-left: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.muted {
  color: var(--el-text-color-secondary);
}
:deep(.row-highlight) {
  --el-table-tr-bg-color: var(--el-color-primary-light-9);
}
@media (max-width: 768px) {
  .quota-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
