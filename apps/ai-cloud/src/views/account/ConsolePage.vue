<script setup lang="ts">
import { computed, onActivated, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ModalPanel, SearchForm1Fixed } from "@trinity/ui";
import "@trinity-ai/views/account/account.css";
import "./ai-cloud-console.css";
import CloudAuthBadge from "./CloudAuthBadge.vue";
import CloudInvoiceStatusBadge from "./CloudInvoiceStatusBadge.vue";
import CloudReconcileBadge from "./CloudReconcileBadge.vue";
import {
  mountAiCloudConsoleInteractions,
  type AiCloudConsoleHandle,
} from "./consoleInteractions";
import {
  AI_CLOUD_CONSOLE_PANELS,
  INVOICE_TYPE_OPTIONS,
  MOCK_BILLING_LINES,
  MOCK_BILLING_SUMMARY,
  MOCK_BILLING_VENDOR_SHARE,
  MOCK_CLOUD_ACCOUNTS,
  MOCK_INVOICE_QUOTA,
  MOCK_INVOICE_RECORDS,
  MOCK_INVOICE_TITLES,
  MOCK_INVOICE_ENTITY,
  MOCK_CONTACT_ADVISOR,
  MOCK_CONTACT_CHANNELS,
  MOCK_CONTACT_NOTES,
  channelDiscountLabel,
  formatCny,
  formatPctSigned,
  maskBankAccount,
  maskCreditCode,
  vendorConsoleOpenLabel,
  type AccountStatus,
  type AiCloudConsolePanelId,
  type AuthStatus,
  type BillingPeriodType,
  type InvoiceType,
  type MockBillingLine,
  type MockCloudAccount,
  type MockInvoiceEntity,
  type MockInvoiceRecord,
  type ReconcileStatus,
} from "./mock";

defineOptions({ name: "AiCloudConsolePage" });

const router = useRouter();

function goHome() {
  void router.push({ name: "aic-home" });
}

function goConsultHome() {
  void router.push({ name: "aic-home", hash: "#consult" });
}

function openVendorConsole(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

const rootRef = ref<HTMLElement | null>(null);
const activePanel = ref<AiCloudConsolePanelId>("accounts");
const accountsSearchQ = ref("");
const vendorFilter = ref("all");
const accountStatusFilter = ref<AccountStatus | "all">("all");
const detailRow = ref<MockCloudAccount | null>(null);
const billingSearchQ = ref("");
const billingPeriodFilter = ref("2026-05");
const billingPeriodTypeFilter = ref<BillingPeriodType | "all">("all");
const billingReconcileFilter = ref<ReconcileStatus | "all">("all");
const billingDetailRow = ref<MockBillingLine | null>(null);
const invoiceEntity = ref<MockInvoiceEntity>({ ...MOCK_INVOICE_ENTITY });
const invoiceQuota = ref({ ...MOCK_INVOICE_QUOTA });
const invoiceTitles = MOCK_INVOICE_TITLES;
const invoiceRecords = ref([...MOCK_INVOICE_RECORDS]);
const invoiceDetailRow = ref<MockInvoiceRecord | null>(null);
const invoiceApplyOpen = ref(false);
const invoiceApplyError = ref("");
const applyTitleId = ref(MOCK_INVOICE_TITLES.find((t) => t.isDefault)?.id ?? "");
const applyInvoiceType = ref<InvoiceType>("增值税专用发票");
const applyAmount = ref("");
const applyEmail = ref("finance@example.com");
const applyContact = ref("");
const applyPhone = ref("");
const applyRemark = ref("");
const enterpriseAuthOpen = ref(false);
const enterpriseAuthError = ref("");
const enterpriseForm = ref({
  entityName: "",
  creditCode: "",
  address: "",
  phone: "",
  bankName: "",
  bankAccount: "",
});
let handle: AiCloudConsoleHandle | undefined;

const canApplyInvoice = computed(
  () => invoiceEntity.value.isProfileComplete && invoiceQuota.value.remaining > 0
);

const applyInvoiceHint = computed(() => {
  if (!invoiceEntity.value.isProfileComplete) {
    return "企业开票资料未完善：注册仅创建账号，请先完成企业认证。";
  }
  if (invoiceQuota.value.remaining <= 0) {
    return "当前账期剩余可开票金额为 0；仅已结算且已支付的多云消费计入额度。";
  }
  return "";
});

const billingSummary = MOCK_BILLING_SUMMARY;
const billingVendorShareSorted = computed(() =>
  [...MOCK_BILLING_VENDOR_SHARE].sort((a, b) => b.sharePct - a.sharePct)
);

const filteredAccounts = computed(() => {
  const q = accountsSearchQ.value.trim().toLowerCase();
  return MOCK_CLOUD_ACCOUNTS.filter((row) => {
    if (vendorFilter.value !== "all" && row.vendorKey !== vendorFilter.value) return false;
    if (accountStatusFilter.value !== "all" && row.accountStatus !== accountStatusFilter.value) {
      return false;
    }
    if (!q) return true;
    return (
      row.name.toLowerCase().includes(q) ||
      row.accountId.toLowerCase().includes(q) ||
      row.vendor.toLowerCase().includes(q)
    );
  });
});

function openDetail(row: MockCloudAccount) {
  detailRow.value = row;
}

function closeDetail() {
  detailRow.value = null;
}

const filteredBillingLines = computed(() => {
  const q = billingSearchQ.value.trim().toLowerCase();
  return MOCK_BILLING_LINES.filter((row) => {
    if (billingPeriodTypeFilter.value !== "all" && row.periodType !== billingPeriodTypeFilter.value) {
      return false;
    }
    if (billingReconcileFilter.value !== "all" && row.reconcileStatus !== billingReconcileFilter.value) {
      return false;
    }
    if (!q) return true;
    return (
      row.vendor.toLowerCase().includes(q) ||
      row.accountName.toLowerCase().includes(q) ||
      row.accountId.toLowerCase().includes(q) ||
      row.periodLabel.toLowerCase().includes(q)
    );
  });
});

function openBillingDetail(row: MockBillingLine) {
  billingDetailRow.value = row;
}

function closeBillingDetail() {
  billingDetailRow.value = null;
}

function goConsoleHash(hash: string) {
  window.location.hash = hash;
}

function parseInvoiceAmount(raw: string): number {
  const n = Number(String(raw).replace(/[,¥\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function openInvoiceApply() {
  if (!canApplyInvoice.value) return;
  invoiceApplyError.value = "";
  applyTitleId.value = MOCK_INVOICE_TITLES.find((t) => t.isDefault)?.id ?? MOCK_INVOICE_TITLES[0]?.id ?? "";
  applyInvoiceType.value = "增值税专用发票";
  applyAmount.value = "";
  applyEmail.value = "finance@example.com";
  applyContact.value = "";
  applyPhone.value = "";
  applyRemark.value = "";
  invoiceApplyOpen.value = true;
}

function closeInvoiceApply() {
  invoiceApplyOpen.value = false;
  invoiceApplyError.value = "";
}

function submitInvoiceApply() {
  invoiceApplyError.value = "";
  const amount = parseInvoiceAmount(applyAmount.value);
  const title = MOCK_INVOICE_TITLES.find((t) => t.id === applyTitleId.value);
  if (!title) {
    invoiceApplyError.value = "请选择开票抬头。";
    return;
  }
  if (!applyEmail.value.trim()) {
    invoiceApplyError.value = "请填写收票邮箱。";
    return;
  }
  if (amount <= 0) {
    invoiceApplyError.value = "请填写有效的开票金额。";
    return;
  }
  if (amount > invoiceQuota.value.remaining) {
    invoiceApplyError.value = `开票金额不能超过剩余可开票额度 ${formatCny(invoiceQuota.value.remaining)}。`;
    return;
  }
  const seq = invoiceRecords.value.length + 1;
  invoiceRecords.value.unshift({
    id: `inv-new-${seq}`,
    applyNo: `INV-2026-${1000 + seq}`,
    periodLabel: invoiceQuota.value.periodLabel,
    contractId: invoiceQuota.value.contractId,
    titleId: title.id,
    titleName: title.name,
    invoiceType: applyInvoiceType.value,
    amount,
    status: "待审核",
    submittedAt: "2026-05-21 15:00",
    email: applyEmail.value.trim(),
    contact: applyContact.value.trim() || undefined,
    phone: applyPhone.value.trim() || undefined,
    remark: applyRemark.value.trim() || undefined,
  });
  invoiceQuota.value.appliedTotal += amount;
  invoiceQuota.value.remaining -= amount;
  closeInvoiceApply();
}

function openInvoiceDetail(row: MockInvoiceRecord) {
  invoiceDetailRow.value = row;
}

function closeInvoiceDetail() {
  invoiceDetailRow.value = null;
}

function openEnterpriseAuth() {
  enterpriseAuthError.value = "";
  const e = invoiceEntity.value;
  enterpriseForm.value = {
    entityName: e.entityName,
    creditCode: e.creditCode,
    address: e.address,
    phone: e.phone,
    bankName: e.bankName,
    bankAccount: e.bankAccount,
  };
  enterpriseAuthOpen.value = true;
}

function closeEnterpriseAuth() {
  enterpriseAuthOpen.value = false;
  enterpriseAuthError.value = "";
}

function submitEnterpriseAuth() {
  enterpriseAuthError.value = "";
  const f = enterpriseForm.value;
  if (!f.entityName.trim() || !f.creditCode.trim()) {
    enterpriseAuthError.value = "请填写企业名称与统一社会信用代码。";
    return;
  }
  if (!f.address.trim() || !f.phone.trim() || !f.bankName.trim() || !f.bankAccount.trim()) {
    enterpriseAuthError.value = "请补全地址、电话与开户信息。";
    return;
  }
  invoiceEntity.value = {
    ...invoiceEntity.value,
    entityName: f.entityName.trim(),
    creditCode: f.creditCode.trim(),
    creditCodeMasked: maskCreditCode(f.creditCode.trim()),
    address: f.address.trim(),
    phone: f.phone.trim(),
    bankName: f.bankName.trim(),
    bankAccount: f.bankAccount.trim(),
    bankAccountMasked: maskBankAccount(f.bankAccount.trim()),
    authStatus: "已认证" as AuthStatus,
    isProfileComplete: true,
  };
  closeEnterpriseAuth();
}

function bindAccountFilters(root: HTMLElement) {
  const vendorPanel = root.querySelector("#or-cloud-vendor-dd-panel");
  vendorPanel?.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>("[data-or-cloud-vendor-filter]");
    if (!item) return;
    vendorFilter.value = item.dataset.orCloudVendorFilter ?? "all";
  });

  const statusPanel = root.querySelector("#or-cloud-account-status-dd-panel");
  statusPanel?.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>("[data-or-cloud-account-status-filter]");
    if (!item) return;
    const v = item.dataset.orCloudAccountStatusFilter ?? "all";
    accountStatusFilter.value = v === "all" ? "all" : (v as AccountStatus);
  });
}

function bindBillingFilters(root: HTMLElement) {
  const periodPanel = root.querySelector("#or-cloud-billing-period-dd-panel");
  periodPanel?.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>("[data-or-cloud-billing-period]");
    if (!item) return;
    billingPeriodFilter.value = item.dataset.orCloudBillingPeriod ?? "2026-05";
  });

  const typePanel = root.querySelector("#or-cloud-billing-period-type-dd-panel");
  typePanel?.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>("[data-or-cloud-billing-period-type]");
    if (!item) return;
    const v = item.dataset.orCloudBillingPeriodType ?? "all";
    billingPeriodTypeFilter.value = v === "all" ? "all" : (v as BillingPeriodType);
  });

  const reconcilePanel = root.querySelector("#or-cloud-billing-reconcile-dd-panel");
  reconcilePanel?.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>("[data-or-cloud-billing-reconcile]");
    if (!item) return;
    const v = item.dataset.orCloudBillingReconcile ?? "all";
    billingReconcileFilter.value = v === "all" ? "all" : (v as ReconcileStatus);
  });
}

watch([detailRow, billingDetailRow, invoiceDetailRow, invoiceApplyOpen, enterpriseAuthOpen], () => {
  document.body.classList.toggle(
    "or-modal-open",
    Boolean(
      detailRow.value ||
        billingDetailRow.value ||
        invoiceDetailRow.value ||
        invoiceApplyOpen.value ||
        enterpriseAuthOpen.value
    )
  );
});

onMounted(async () => {
  if (!rootRef.value) return;
  handle = mountAiCloudConsoleInteractions(rootRef.value, (id) => {
    activePanel.value = id;
  });
  await import("@repo/assets/adm-form2-dd.js");
  bindAccountFilters(rootRef.value);
  bindBillingFilters(rootRef.value);
});

onActivated(() => {
  handle?.syncHashPanels();
});

onUnmounted(() => {
  handle?.dispose();
  document.body.classList.remove("or-modal-open");
});
</script>

<template>
  <main ref="rootRef" class="mvp-main account-console-root">
    <div class="or-shell">
      <aside class="or-side" aria-label="用户中心">
        <div class="or-side-heading">用户中心</div>
        <a
          v-for="p in AI_CLOUD_CONSOLE_PANELS"
          :key="p.id"
          :href="p.hash"
          class="or-dash-nav"
          :class="{ 'is-active': activePanel === p.id }"
        >
          {{ p.label }}
        </a>
        <div class="or-side-heading" style="margin-top: 0.65rem">产品</div>
        <a href="#" class="or-dash-nav or-cloud-side-product" @click.prevent="goHome">AI 云官网</a>
      </aside>

      <div class="or-main">
        <!-- 账号管理 -->
        <section data-or-panel="accounts" id="or-panel-accounts" class="or-cloud-accounts-page">
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>账号管理</span>
          </nav>

          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">账号管理</h1>
              <div class="or-keys-title-actions">
                <div class="or-cloud-accounts-filters" role="toolbar" aria-label="列表筛选">
                  <div class="or-app-filter-dd-wrap" id="or-cloud-vendor-dd-wrap">
                    <button
                      type="button"
                      class="or-select or-select--app or-app-filter-dd-trigger"
                      id="or-cloud-vendor-dd-btn"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                      aria-controls="or-cloud-vendor-dd-panel"
                    >
                      <span id="or-cloud-vendor-dd-label" data-dd-label>全部云厂商</span>
                      <svg
                        class="or-app-filter-dd-chevron"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                    <div
                      class="or-app-filter-more-panel or-app-filter-pop-beak"
                      id="or-cloud-vendor-dd-panel"
                      role="listbox"
                      hidden
                      aria-label="云厂商筛选"
                      style="--or-pop-beak-x: 1.35rem"
                    >
                      <button
                        type="button"
                        class="or-app-filter-dd-item is-checked"
                        role="option"
                        data-dd-value="全部云厂商"
                        data-or-cloud-vendor-filter="all"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">全部云厂商</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="阿里云"
                        data-or-cloud-vendor-filter="aliyun"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">阿里云</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="腾讯云"
                        data-or-cloud-vendor-filter="tencent"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">腾讯云</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="华为云"
                        data-or-cloud-vendor-filter="huawei"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">华为云</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="AWS"
                        data-or-cloud-vendor-filter="aws"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">AWS</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="Google Cloud"
                        data-or-cloud-vendor-filter="gcp"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">Google Cloud</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                  <div class="or-app-filter-dd-wrap" id="or-cloud-account-status-dd-wrap">
                    <button
                      type="button"
                      class="or-select or-select--app or-app-filter-dd-trigger"
                      id="or-cloud-account-status-dd-btn"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                      aria-controls="or-cloud-account-status-dd-panel"
                    >
                      <span id="or-cloud-account-status-dd-label" data-dd-label>全部状态</span>
                      <svg
                        class="or-app-filter-dd-chevron"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                    <div
                      class="or-app-filter-more-panel or-app-filter-pop-beak"
                      id="or-cloud-account-status-dd-panel"
                      role="listbox"
                      hidden
                      aria-label="账号状态筛选"
                      style="--or-pop-beak-x: 1.35rem"
                    >
                      <button
                        type="button"
                        class="or-app-filter-dd-item is-checked"
                        role="option"
                        data-dd-value="全部状态"
                        data-or-cloud-account-status-filter="all"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">全部状态</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="正常"
                        data-or-cloud-account-status-filter="正常"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">正常</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="过期"
                        data-or-cloud-account-status-filter="过期"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">过期</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="冻结"
                        data-or-cloud-account-status-filter="冻结"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">冻结</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="or-btn-outline" @click="openEnterpriseAuth">升级企业认证</button>
                <button type="button" class="btn btn-gradient">申请绑定新云账号</button>
              </div>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead or-cloud-lead-with-tip">
                查看已接入的云厂商账号、接入时间与认证信息。完整开户与优惠续签见官网
                <span class="or-cloud-lead-sub">「优惠购买流程」</span>
                <details class="or-keys-info or-cloud-lead-info">
                  <summary class="or-keys-info-sum" aria-label="关于账号管理与云控制台">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                    </svg>
                  </summary>
                  <div class="or-keys-info-panel" role="note">
                    列表展示纳管状态（正常 / 过期 / 冻结）；渠道优惠与合约摘要请在详情或费用模块查看。
                    「打开××控制台」将跳转该云厂商官方登录页，非 Trinity SSO 代登。
                  </div>
                </details>
              </p>
            </div>
          </header>

          <div class="or-keys-toolbar or-app-filter-row">
            <SearchForm1Fixed
              v-model="accountsSearchQ"
              input-id="or-cloud-accounts-search-input"
              placeholder="按名称或云账号 ID 搜索…"
              aria-label="按名称或云账号 ID 搜索"
            />
          </div>

          <div class="table-wrap or-keys-table-wrap">
            <table class="data-table or-keys-table or-cloud-accounts-table">
              <thead>
                <tr>
                  <th>云厂商</th>
                  <th>账号名称</th>
                  <th>云账号 ID</th>
                  <th>接入时间</th>
                  <th>企业认证</th>
                  <th>账号状态</th>
                  <th class="or-table-th-ops">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredAccounts" :key="row.id">
                  <td>
                    <span class="or-cloud-vendor-cell" :data-vendor="row.vendorKey">
                      <span class="or-cloud-vendor-name">
                        <span class="or-cloud-vendor-dot" aria-hidden="true" />
                        {{ row.vendor }}
                      </span>
                      <span class="or-cloud-region-badge" :data-region="row.region">{{ row.regionLabel }}</span>
                    </span>
                  </td>
                  <td>
                    <div class="or-cloud-name-cell">
                      <strong>{{ row.name }}</strong>
                    </div>
                  </td>
                  <td>
                    <code class="or-keys-mask">{{ row.accountId }}</code>
                  </td>
                  <td class="or-mono-sm">{{ row.createdAt }}</td>
                  <td>
                    <div class="or-cloud-entity-cell">
                      <span class="or-cloud-entity-name" :title="row.entityName">{{ row.entityName }}</span>
                      <CloudAuthBadge :status="row.authStatus" />
                    </div>
                  </td>
                  <td>
                    <span class="or-cloud-account-status-badge" :data-status="row.accountStatus">
                      {{ row.accountStatus }}
                    </span>
                  </td>
                  <td class="or-table-td-ops">
                    <div class="or-preset-actions">
                      <button type="button" class="or-btn-outline" @click="openDetail(row)">查看详情</button>
                      <button
                        type="button"
                        class="or-btn-outline"
                        :title="`${vendorConsoleOpenLabel(row.vendor)}：跳转厂商官方登录页，非 Trinity SSO 代登`"
                        @click="openVendorConsole(row.consoleUrl)"
                      >
                        {{ vendorConsoleOpenLabel(row.vendor) }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="or-keys-summary" aria-live="polite">
            共 {{ filteredAccounts.length }} 个云账号（演示数据）
          </p>

          <div
            id="or-cloud-account-detail-shell"
            class="or-modal-root or-cloud-account-detail-modal"
            :hidden="!detailRow"
            :aria-hidden="detailRow ? 'false' : 'true'"
            role="presentation"
          >
            <div
              class="or-modal-backdrop"
              tabindex="-1"
              aria-hidden="true"
              @click="closeDetail"
            />
            <ModalPanel
              v-if="detailRow"
              :title="`${detailRow.vendor} · ${detailRow.name}`"
              title-id="or-cloud-account-detail-title"
              close-label="关闭"
              @close="closeDetail"
            >
              <dl class="or-cloud-detail-dl">
                <div class="or-cloud-detail-row">
                  <dt>云账号 ID</dt>
                  <dd><code class="or-keys-mask">{{ detailRow.accountId }}</code></dd>
                </div>
                <div class="or-cloud-detail-row">
                  <dt>统一社会信用代码</dt>
                  <dd><code class="or-keys-mask">{{ detailRow.creditCodeMasked }}</code></dd>
                </div>
                <div class="or-cloud-detail-row">
                  <dt>接入方式</dt>
                  <dd>{{ detailRow.accessMode }}</dd>
                </div>
                <div class="or-cloud-detail-row">
                  <dt>企业认证</dt>
                  <dd class="or-cloud-detail-auth">
                    <span class="or-cloud-detail-entity">{{ detailRow.entityName }}</span>
                    <CloudAuthBadge :status="detailRow.authStatus" />
                  </dd>
                </div>
                <div class="or-cloud-detail-row">
                  <dt>权限摘要（演示）</dt>
                  <dd>{{ detailRow.roleSummary }}</dd>
                </div>
                <div class="or-cloud-detail-row">
                  <dt>绑定记录</dt>
                  <dd>
                    <ul class="or-cloud-detail-list">
                      <li v-for="(line, i) in detailRow.bindingHistory" :key="i">{{ line }}</li>
                    </ul>
                  </dd>
                </div>
                <div class="or-cloud-detail-row">
                  <dt>优惠 / 合约摘要</dt>
                  <dd>{{ detailRow.commercialSummary }}</dd>
                </div>
              </dl>
              <template #actions>
                <button type="button" class="or-btn-outline" @click="closeDetail">关闭</button>
                <button
                  type="button"
                  class="btn btn-gradient"
                  @click="openVendorConsole(detailRow.consoleUrl)"
                >
                  {{ vendorConsoleOpenLabel(detailRow.vendor) }}
                </button>
              </template>
            </ModalPanel>
          </div>
        </section>

        <!-- 费用 -->
        <section data-or-panel="billing" id="or-panel-billing" class="or-cloud-billing-page" hidden>
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>费用</span>
          </nav>
          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">费用</h1>
              <div class="or-keys-title-actions">
                <div class="or-cloud-billing-filters" role="toolbar" aria-label="账期筛选">
                  <div class="or-app-filter-dd-wrap" id="or-cloud-billing-period-dd-wrap">
                    <button
                      type="button"
                      class="or-select or-select--app or-app-filter-dd-trigger"
                      id="or-cloud-billing-period-dd-btn"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                      aria-controls="or-cloud-billing-period-dd-panel"
                    >
                      <span data-dd-label>{{ billingPeriodFilter }}</span>
                      <svg
                        class="or-app-filter-dd-chevron"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                    <div
                      class="or-app-filter-more-panel or-app-filter-pop-beak"
                      id="or-cloud-billing-period-dd-panel"
                      role="listbox"
                      hidden
                      aria-label="统计账期"
                      style="--or-pop-beak-x: 1.35rem"
                    >
                      <button
                        type="button"
                        class="or-app-filter-dd-item is-checked"
                        role="option"
                        data-dd-value="2026-05"
                        data-or-cloud-billing-period="2026-05"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">2026-05</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="2026-04"
                        data-or-cloud-billing-period="2026-04"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">2026-04</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="or-app-filter-dd-item"
                        role="option"
                        data-dd-value="2026-Q1"
                        data-or-cloud-billing-period="2026-Q1"
                        tabindex="-1"
                      >
                        <span class="or-app-filter-dd-label">2026-Q1</span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="or-btn-outline">导出对账明细</button>
                <button type="button" class="btn btn-gradient">联系顾问续签</button>
              </div>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead or-cloud-lead-with-tip">
                感知渠道价格优势，完成
                <span class="or-cloud-lead-sub">月度 / 季度对账</span>
                <details class="or-keys-info or-cloud-lead-info">
                  <summary class="or-keys-info-sum" aria-label="关于费用统计口径">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                    </svg>
                  </summary>
                  <div class="or-keys-info-panel" role="note">
                    数据来自 Trinity 聚合账单与各云回传，非云厂商控制台原生账单 1:1 镜像；通常 T+1 更新。环比、同比为应付金额口径（优惠后实付）。
                  </div>
                </details>
              </p>
            </div>
          </header>

          <section class="or-cloud-billing-overview" aria-label="费用概览">
            <div class="or-cloud-billing-overview__kpis">
              <div class="or-cloud-billing-hero">
                <span class="or-cloud-billing-hero__eyebrow">{{ billingSummary.periodLabel }} · 应付口径</span>
                <p class="or-cloud-billing-hero__label">应付金额（优惠后实付）</p>
                <p class="or-cloud-billing-hero__v">{{ formatCny(billingSummary.totalPayable) }}</p>
                <div class="or-cloud-billing-hero__compare">
                  <span class="or-cloud-billing-hero__list">
                    原厂原价
                    <span class="or-cloud-billing-hero__list-val">{{
                      formatCny(billingSummary.totalListPrice)
                    }}</span>
                  </span>
                  <span class="or-cloud-billing-hero__save">
                    渠道省 {{ formatCny(billingSummary.savingsAmount) }} · {{ billingSummary.savingsRatePct }}%
                  </span>
                </div>
              </div>
              <div class="or-cloud-billing-trends" role="group" aria-label="同比环比">
                <div
                  class="or-cloud-billing-trend"
                  :class="billingSummary.momPct >= 0 ? 'is-up' : 'is-down'"
                >
                  <span class="or-cloud-billing-trend__lbl">环比</span>
                  <span class="or-cloud-billing-trend__v">{{ formatPctSigned(billingSummary.momPct) }}</span>
                  <span class="or-cloud-billing-trend__hint">较上月</span>
                </div>
                <div
                  class="or-cloud-billing-trend"
                  :class="billingSummary.yoyPct >= 0 ? 'is-up' : 'is-down'"
                >
                  <span class="or-cloud-billing-trend__lbl">同比</span>
                  <span class="or-cloud-billing-trend__v">{{ formatPctSigned(billingSummary.yoyPct) }}</span>
                  <span class="or-cloud-billing-trend__hint">较去年同期</span>
                </div>
              </div>
            </div>

            <div class="or-cloud-billing-overview__chart" aria-label="多云消费占比">
              <div class="or-cloud-billing-chart-head">
                <h2 class="or-cloud-billing-chart-title">多云消费占比</h2>
                <span class="or-cloud-billing-chart-hint">{{ billingSummary.periodLabel }} · 应付金额</span>
              </div>
              <p class="or-cloud-billing-chart-annot" role="note">
                <span class="or-cloud-billing-chart-annot__item">
                  <span class="or-cloud-billing-chart-annot__k">色块</span>云厂商
                </span>
                <span class="or-cloud-billing-chart-annot__item">
                  <span class="or-cloud-billing-chart-annot__k">长度</span>占当期应付总额比例
                </span>
                <span class="or-cloud-billing-chart-annot__item">
                  <span class="or-cloud-billing-chart-annot__k">排序</span>占比从高到低
                </span>
              </p>
              <div
                class="or-cloud-billing-bars-scroll"
                tabindex="0"
                aria-label="各云厂商消费占比列表，超出可滚动"
              >
                <div class="or-cloud-billing-bars">
                  <div
                    v-for="(seg, index) in billingVendorShareSorted"
                    :key="seg.vendorKey"
                    class="or-cloud-billing-bar-row"
                  >
                    <div class="or-cloud-billing-bar-label">
                      <span class="or-cloud-billing-bar-rank" aria-hidden="true">{{ index + 1 }}</span>
                      <span class="or-cloud-billing-dot" :data-vendor="seg.vendorKey" aria-hidden="true" />
                      <span class="or-cloud-billing-bar-name">{{ seg.vendor }}</span>
                    </div>
                    <div class="or-cloud-billing-bar-body">
                      <div
                        class="or-cloud-billing-bar-track"
                        role="img"
                        :aria-label="`${seg.vendor} ${seg.sharePct}%`"
                      >
                        <span
                          class="or-cloud-billing-bar-fill"
                          :data-vendor="seg.vendorKey"
                          :style="{ width: `${seg.sharePct}%` }"
                        >
                          <span v-if="seg.sharePct >= 14" class="or-cloud-billing-bar-fill-label">
                            {{ seg.sharePct }}%
                          </span>
                        </span>
                      </div>
                      <span class="or-cloud-billing-bar-meta">
                        <span class="or-cloud-billing-bar-pct">{{ seg.sharePct }}%</span>
                        <span class="or-cloud-billing-bar-amt">{{ formatCny(seg.payable) }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <ul class="or-cloud-billing-chart-legend" aria-label="图例">
                <li v-for="seg in billingVendorShareSorted" :key="`lg-${seg.vendorKey}`">
                  <span class="or-cloud-billing-dot" :data-vendor="seg.vendorKey" aria-hidden="true" />
                  {{ seg.vendor }}
                </li>
              </ul>
            </div>
          </section>

          <div class="or-keys-toolbar or-app-filter-row">
            <SearchForm1Fixed
              v-model="billingSearchQ"
              input-id="or-cloud-billing-search-input"
              placeholder="按云厂商、账号或账期搜索…"
              aria-label="搜索费用明细"
            />
            <div class="or-cloud-billing-filters" role="toolbar" aria-label="明细筛选">
              <div class="or-app-filter-dd-wrap" id="or-cloud-billing-period-type-dd-wrap">
                <button
                  type="button"
                  class="or-select or-select--app or-app-filter-dd-trigger"
                  aria-expanded="false"
                  aria-haspopup="listbox"
                  aria-controls="or-cloud-billing-period-type-dd-panel"
                >
                  <span data-dd-label>全部账期类型</span>
                  <svg
                    class="or-app-filter-dd-chevron"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <div
                  class="or-app-filter-more-panel or-app-filter-pop-beak"
                  id="or-cloud-billing-period-type-dd-panel"
                  role="listbox"
                  hidden
                  aria-label="账期类型"
                  style="--or-pop-beak-x: 1.35rem"
                >
                  <button
                    type="button"
                    class="or-app-filter-dd-item is-checked"
                    role="option"
                    data-dd-value="全部账期类型"
                    data-or-cloud-billing-period-type="all"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">全部账期类型</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                  </button>
                  <button
                    type="button"
                    class="or-app-filter-dd-item"
                    role="option"
                    data-dd-value="自然月"
                    data-or-cloud-billing-period-type="自然月"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">自然月</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                  <button
                    type="button"
                    class="or-app-filter-dd-item"
                    role="option"
                    data-dd-value="合约账期"
                    data-or-cloud-billing-period-type="合约账期"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">合约账期</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                </div>
              </div>
              <div class="or-app-filter-dd-wrap" id="or-cloud-billing-reconcile-dd-wrap">
                <button
                  type="button"
                  class="or-select or-select--app or-app-filter-dd-trigger"
                  aria-expanded="false"
                  aria-haspopup="listbox"
                  aria-controls="or-cloud-billing-reconcile-dd-panel"
                >
                  <span data-dd-label>全部对账状态</span>
                  <svg
                    class="or-app-filter-dd-chevron"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <div
                  class="or-app-filter-more-panel or-app-filter-pop-beak"
                  id="or-cloud-billing-reconcile-dd-panel"
                  role="listbox"
                  hidden
                  aria-label="对账状态"
                  style="--or-pop-beak-x: 1.35rem"
                >
                  <button
                    type="button"
                    class="or-app-filter-dd-item is-checked"
                    role="option"
                    data-dd-value="全部对账状态"
                    data-or-cloud-billing-reconcile="all"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">全部对账状态</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                  </button>
                  <button
                    type="button"
                    class="or-app-filter-dd-item"
                    role="option"
                    data-dd-value="待对账"
                    data-or-cloud-billing-reconcile="待对账"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">待对账</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                  <button
                    type="button"
                    class="or-app-filter-dd-item"
                    role="option"
                    data-dd-value="已对账"
                    data-or-cloud-billing-reconcile="已对账"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">已对账</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                  <button
                    type="button"
                    class="or-app-filter-dd-item"
                    role="option"
                    data-dd-value="有差异"
                    data-or-cloud-billing-reconcile="有差异"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">有差异</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="table-wrap or-keys-table-wrap">
            <table class="data-table or-keys-table or-cloud-billing-table">
              <thead>
                <tr>
                  <th>云厂商</th>
                  <th>账号</th>
                  <th>账期类型</th>
                  <th>账期</th>
                  <th>原厂原价</th>
                  <th>渠道折扣</th>
                  <th>应付金额</th>
                  <th>环比</th>
                  <th>对账状态</th>
                  <th class="or-table-th-ops">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredBillingLines" :key="row.id">
                  <td>
                    <span class="or-cloud-vendor-cell" :data-vendor="row.vendorKey">
                      <span class="or-cloud-vendor-name">
                        <span class="or-cloud-vendor-dot" aria-hidden="true" />
                        {{ row.vendor }}
                      </span>
                    </span>
                  </td>
                  <td>
                    <div class="or-cloud-name-cell">
                      <strong>{{ row.accountName }}</strong>
                    </div>
                    <code class="or-keys-mask">{{ row.accountId }}</code>
                  </td>
                  <td>{{ row.periodType }}</td>
                  <td class="or-mono-sm">{{ row.periodLabel }}</td>
                  <td>
                    <span class="or-cloud-billing-price-list">{{ formatCny(row.listPrice) }}</span>
                  </td>
                  <td>
                    <span class="or-cloud-billing-discount">{{ channelDiscountLabel(row.payable, row.listPrice) }}</span>
                    <span class="or-cloud-billing-kpi__sub">省 {{ formatCny(row.listPrice - row.payable) }}</span>
                  </td>
                  <td>
                    <span class="or-cloud-billing-price-pay">{{ formatCny(row.payable) }}</span>
                  </td>
                  <td>
                    <span
                      class="or-cloud-billing-mom"
                      :class="row.momPct >= 0 ? 'is-up' : 'is-down'"
                    >
                      {{ formatPctSigned(row.momPct) }}
                    </span>
                  </td>
                  <td>
                    <CloudReconcileBadge :status="row.reconcileStatus" />
                  </td>
                  <td class="or-table-td-ops">
                    <div class="or-preset-actions">
                      <button type="button" class="or-btn-outline" @click="openBillingDetail(row)">
                        账单详情
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="or-keys-summary" aria-live="polite">
            共 {{ filteredBillingLines.length }} 条分云账单（演示数据 · {{ billingPeriodFilter }}）
          </p>

          <div
            id="or-cloud-billing-detail-shell"
            class="or-modal-root or-cloud-billing-detail-modal"
            :hidden="!billingDetailRow"
            :aria-hidden="billingDetailRow ? 'false' : 'true'"
            role="presentation"
          >
            <div
              class="or-modal-backdrop"
              tabindex="-1"
              aria-hidden="true"
              @click="closeBillingDetail"
            />
            <ModalPanel
              v-if="billingDetailRow"
              :title="`${billingDetailRow.vendor} · ${billingDetailRow.periodLabel} 账单`"
              title-id="or-cloud-billing-detail-title"
              head-note="Trinity 聚合账单（演示）· 非云厂商控制台原生账单"
              close-label="关闭"
              @close="closeBillingDetail"
            >
              <div class="or-cloud-bill-detail">
                <div class="or-cloud-bill-detail__hero">
                  <div class="or-cloud-bill-detail__vendor">
                    <span
                      class="or-cloud-billing-dot"
                      :data-vendor="billingDetailRow.vendorKey"
                      aria-hidden="true"
                    />
                    <span>{{ billingDetailRow.vendor }}</span>
                  </div>
                  <p class="or-cloud-bill-detail__pay-lbl">应付金额（渠道价）</p>
                  <p class="or-cloud-bill-detail__pay-v">
                    {{ formatCny(billingDetailRow.payable) }}
                  </p>
                  <p class="or-cloud-bill-detail__save">
                    {{ channelDiscountLabel(billingDetailRow.payable, billingDetailRow.listPrice) }}
                    · 省 {{ formatCny(billingDetailRow.listPrice - billingDetailRow.payable) }}
                  </p>
                  <div class="or-cloud-bill-detail__stats">
                    <div class="or-cloud-bill-detail__stat">
                      <span class="or-cloud-bill-detail__stat-k">原厂原价</span>
                      <span class="or-cloud-bill-detail__stat-v is-muted">{{
                        formatCny(billingDetailRow.listPrice)
                      }}</span>
                    </div>
                    <div class="or-cloud-bill-detail__stat">
                      <span class="or-cloud-bill-detail__stat-k">环比</span>
                      <span
                        class="or-cloud-bill-detail__stat-v"
                        :class="billingDetailRow.momPct >= 0 ? 'is-up' : 'is-down'"
                      >
                        {{ formatPctSigned(billingDetailRow.momPct) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="or-cloud-bill-detail__meta" role="list">
                  <div class="or-cloud-bill-detail__meta-item" role="listitem">
                    <span class="or-cloud-bill-detail__meta-k">账号</span>
                    <span class="or-cloud-bill-detail__meta-v">
                      {{ billingDetailRow.accountName }}
                      <code class="or-keys-mask">{{ billingDetailRow.accountId }}</code>
                    </span>
                  </div>
                  <div class="or-cloud-bill-detail__meta-item" role="listitem">
                    <span class="or-cloud-bill-detail__meta-k">账期</span>
                    <span class="or-cloud-bill-detail__meta-v">
                      {{ billingDetailRow.periodType }} · {{ billingDetailRow.periodLabel }}
                    </span>
                  </div>
                  <div class="or-cloud-bill-detail__meta-item" role="listitem">
                    <span class="or-cloud-bill-detail__meta-k">对账状态</span>
                    <span class="or-cloud-bill-detail__meta-v">
                      <CloudReconcileBadge :status="billingDetailRow.reconcileStatus" />
                    </span>
                  </div>
                </div>

                <div class="or-cloud-bill-detail__summary">
                  <h3 class="or-cloud-bill-detail__summary-title">明细摘要</h3>
                  <ul class="or-cloud-bill-detail__summary-list">
                    <li v-for="(line, i) in billingDetailRow.drillLines" :key="i">{{ line }}</li>
                  </ul>
                </div>
              </div>
              <template #actions>
                <button type="button" class="or-btn-outline" @click="closeBillingDetail">关闭</button>
                <button type="button" class="btn btn-gradient">下载对账单</button>
              </template>
            </ModalPanel>
          </div>
        </section>

        <!-- 发票 · P0 -->
        <section data-or-panel="invoices" id="or-panel-invoices" class="or-cloud-invoices-page" hidden>
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>发票</span>
          </nav>
          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">发票</h1>
              <div class="or-keys-title-actions">
                <button
                  type="button"
                  class="btn btn-gradient"
                  :disabled="!canApplyInvoice"
                  :title="applyInvoiceHint || undefined"
                  @click="openInvoiceApply"
                >
                  申请开票
                </button>
              </div>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead or-cloud-lead-with-tip">
                维护开票资料、查看可开票额度并提交申请；审核与开具由平台财务处理。
                <details class="or-keys-info or-cloud-lead-info">
                  <summary class="or-keys-info-sum" aria-label="关于可开票额度">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                    </svg>
                  </summary>
                  <div class="or-keys-info-panel" role="note">
                    可开票额度仅统计已结算、已支付的消费（与
                    <a href="#billing" @click.prevent="goConsoleHash('#billing')">费用</a>
                    应付口径一致），按合约账期管控；禁止超额开票。
                  </div>
                </details>
              </p>
            </div>
          </header>

          <p v-if="applyInvoiceHint" class="or-cloud-invoice-banner" role="status">
            <span>{{ applyInvoiceHint }}</span>
            <button
              v-if="!invoiceEntity.isProfileComplete"
              type="button"
              class="or-btn-outline or-cloud-invoice-banner__action"
              @click="openEnterpriseAuth"
            >
              去完成企业认证
            </button>
          </p>

          <div class="or-cloud-invoice-overview">
            <section class="or-cloud-invoice-card or-cloud-invoice-profile" aria-labelledby="or-cloud-invoice-entity-title">
              <div class="or-cloud-invoice-card__head">
                <div>
                  <h2 id="or-cloud-invoice-entity-title" class="or-cloud-invoice-card__title">我的公司信息</h2>
                  <p class="or-cloud-invoice-card__sub">与租户企业认证同源，本页只读展示</p>
                </div>
                <div class="or-cloud-invoice-profile__actions">
                  <CloudAuthBadge :status="invoiceEntity.authStatus" />
                  <button type="button" class="or-btn-outline" @click="openEnterpriseAuth">企业认证</button>
                </div>
              </div>
              <p class="or-cloud-invoice-source">
                注册仅创建账号；开票主体资料在
                <button type="button" class="or-cloud-invoice-source__link" @click="openEnterpriseAuth">企业认证</button>
                中维护（演示占位，提交后同步至本页）。
              </p>
              <dl class="or-cloud-invoice-entity">
                <div class="or-cloud-invoice-entity__row">
                  <dt>企业名称</dt>
                  <dd>{{ invoiceEntity.entityName }}</dd>
                </div>
                <div class="or-cloud-invoice-entity__row">
                  <dt>统一社会信用代码</dt>
                  <dd><code class="or-keys-mask">{{ invoiceEntity.creditCodeMasked }}</code></dd>
                </div>
                <div class="or-cloud-invoice-entity__row or-cloud-invoice-entity__row--wide">
                  <dt>注册地址</dt>
                  <dd>{{ invoiceEntity.address }}</dd>
                </div>
                <div class="or-cloud-invoice-entity__row">
                  <dt>企业电话</dt>
                  <dd>{{ invoiceEntity.phone }}</dd>
                </div>
                <div class="or-cloud-invoice-entity__row">
                  <dt>开户行</dt>
                  <dd>{{ invoiceEntity.bankName }}</dd>
                </div>
                <div class="or-cloud-invoice-entity__row">
                  <dt>对公账号</dt>
                  <dd><code class="or-keys-mask">{{ invoiceEntity.bankAccountMasked }}</code></dd>
                </div>
              </dl>
            </section>

            <section class="or-cloud-invoice-card or-cloud-invoice-quota-panel" aria-labelledby="or-cloud-invoice-quota-title">
              <div class="or-cloud-invoice-card__head">
                <div>
                  <h2 id="or-cloud-invoice-quota-title" class="or-cloud-invoice-card__title">可开票金额</h2>
                  <p class="or-cloud-invoice-card__sub">
                    账期 {{ invoiceQuota.periodLabel }} · 合约编号 <code>{{ invoiceQuota.contractId }}</code>
                  </p>
                </div>
              </div>
              <div class="or-cloud-invoice-quota">
                <div class="or-cloud-invoice-quota__hero">
                  <span class="or-cloud-invoice-quota__lbl">剩余可开票金额</span>
                  <span class="or-cloud-invoice-quota__v">{{ formatCny(invoiceQuota.remaining) }}</span>
                </div>
                <div class="or-cloud-invoice-quota__grid">
                  <div class="or-cloud-invoice-quota__item">
                    <span class="or-cloud-invoice-quota__k">本期已结算消费</span>
                    <span class="or-cloud-invoice-quota__n">{{ formatCny(invoiceQuota.settledPayable) }}</span>
                  </div>
                  <div class="or-cloud-invoice-quota__item">
                    <span class="or-cloud-invoice-quota__k">已申请开票</span>
                    <span class="or-cloud-invoice-quota__n">{{ formatCny(invoiceQuota.appliedTotal) }}</span>
                  </div>
                  <div class="or-cloud-invoice-quota__item">
                    <span class="or-cloud-invoice-quota__k">已成功开票</span>
                    <span class="or-cloud-invoice-quota__n">{{ formatCny(invoiceQuota.invoicedSuccess) }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="or-cloud-invoice-secondary">
            <section class="or-cloud-invoice-card or-cloud-invoice-titles-panel" aria-labelledby="or-cloud-invoice-titles-title">
              <div class="or-cloud-invoice-card__head">
                <div>
                  <h2 id="or-cloud-invoice-titles-title" class="or-cloud-invoice-card__title">发票抬头</h2>
                  <p class="or-cloud-invoice-card__sub">只读展示；新增/编辑抬头为 P1</p>
                </div>
              </div>
              <ul class="or-cloud-invoice-titles-list">
                <li
                  v-for="t in invoiceTitles"
                  :key="t.id"
                  class="or-cloud-invoice-title-chip"
                  :class="{ 'is-default': t.isDefault }"
                >
                  <span class="or-cloud-invoice-title-chip__name">{{ t.name }}</span>
                  <code class="or-keys-mask or-cloud-invoice-title-chip__code">{{ t.creditCodeMasked }}</code>
                  <span v-if="t.isDefault" class="or-cloud-invoice-title-chip__tag">默认</span>
                </li>
              </ul>
            </section>

            <section class="or-cloud-invoice-card or-cloud-invoice-records-panel" aria-labelledby="or-cloud-invoice-records-title">
              <div class="or-cloud-invoice-card__head or-cloud-invoice-card__head--records">
                <h2 id="or-cloud-invoice-records-title" class="or-cloud-invoice-card__title">开票记录</h2>
                <span class="or-cloud-invoice-records-count" aria-live="polite">{{ invoiceRecords.length }} 条</span>
              </div>
              <div class="table-wrap or-keys-table-wrap">
              <table class="data-table or-keys-table or-cloud-invoice-records-table">
                <thead>
                  <tr>
                    <th>申请单号</th>
                    <th>账期</th>
                    <th>开票抬头</th>
                    <th>类型</th>
                    <th>申请金额</th>
                    <th>状态</th>
                    <th class="or-table-th-ops">操作</th>
                  </tr>
                </thead>
                <tbody v-if="invoiceRecords.length">
                  <tr v-for="row in invoiceRecords" :key="row.id">
                    <td class="or-mono-sm">{{ row.applyNo }}</td>
                    <td class="or-mono-sm">{{ row.periodLabel }}</td>
                    <td>{{ row.titleName }}</td>
                    <td>{{ row.invoiceType }}</td>
                    <td>{{ formatCny(row.amount) }}</td>
                    <td><CloudInvoiceStatusBadge :status="row.status" /></td>
                    <td class="or-table-td-ops">
                      <div class="or-preset-actions">
                        <button type="button" class="or-btn-outline" @click="openInvoiceDetail(row)">详情</button>
                        <button
                          v-if="row.status === '开票成功'"
                          type="button"
                          class="or-btn-outline"
                        >
                          下载
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="7" class="or-cloud-invoice-empty">暂无开票申请</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </section>
          </div>

          <div
            id="or-cloud-enterprise-auth-shell"
            class="or-modal-root or-cloud-enterprise-auth-modal"
            :hidden="!enterpriseAuthOpen"
            :aria-hidden="enterpriseAuthOpen ? 'false' : 'true'"
            role="presentation"
          >
            <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeEnterpriseAuth" />
            <ModalPanel
              v-if="enterpriseAuthOpen"
              title="企业认证"
              title-id="or-cloud-enterprise-auth-title"
              head-note="演示占位：注册不含下列字段，提交后同步至发票与账号纳管"
              close-label="关闭"
              @close="closeEnterpriseAuth"
            >
              <form class="or-cloud-enterprise-auth-form" @submit.prevent="submitEnterpriseAuth">
                <p v-if="enterpriseAuthError" class="or-cloud-invoice-form-error" role="alert">{{ enterpriseAuthError }}</p>
                <div class="form-group">
                  <label for="or-enterprise-name">企业名称</label>
                  <input id="or-enterprise-name" v-model="enterpriseForm.entityName" type="text" class="or-input" autocomplete="organization" />
                </div>
                <div class="form-group">
                  <label for="or-enterprise-credit">统一社会信用代码</label>
                  <input id="or-enterprise-credit" v-model="enterpriseForm.creditCode" type="text" class="or-input" autocomplete="off" />
                </div>
                <div class="form-group">
                  <label for="or-enterprise-address">注册地址</label>
                  <input id="or-enterprise-address" v-model="enterpriseForm.address" type="text" class="or-input" autocomplete="street-address" />
                </div>
                <div class="form-group">
                  <label for="or-enterprise-phone">企业电话</label>
                  <input id="or-enterprise-phone" v-model="enterpriseForm.phone" type="tel" class="or-input" autocomplete="tel" />
                </div>
                <div class="form-group">
                  <label for="or-enterprise-bank">开户行</label>
                  <input id="or-enterprise-bank" v-model="enterpriseForm.bankName" type="text" class="or-input" autocomplete="off" />
                </div>
                <div class="form-group">
                  <label for="or-enterprise-account">对公账号</label>
                  <input id="or-enterprise-account" v-model="enterpriseForm.bankAccount" type="text" class="or-input" autocomplete="off" />
                </div>
              </form>
              <template #actions>
                <button type="button" class="or-btn-outline" @click="closeEnterpriseAuth">取消</button>
                <button type="button" class="btn btn-gradient" @click="submitEnterpriseAuth">提交认证</button>
              </template>
            </ModalPanel>
          </div>

          <div
            id="or-cloud-invoice-apply-shell"
            class="or-modal-root or-cloud-invoice-apply-modal"
            :hidden="!invoiceApplyOpen"
            :aria-hidden="invoiceApplyOpen ? 'false' : 'true'"
            role="presentation"
          >
            <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeInvoiceApply" />
            <ModalPanel
              v-if="invoiceApplyOpen"
              title="申请开票"
              title-id="or-cloud-invoice-apply-title"
              close-label="关闭"
              @close="closeInvoiceApply"
            >
              <form class="or-cloud-invoice-apply-form" @submit.prevent="submitInvoiceApply">
                <p v-if="invoiceApplyError" class="or-cloud-invoice-form-error" role="alert">{{ invoiceApplyError }}</p>
                <div class="form-group">
                  <label for="or-invoice-apply-title">开票抬头</label>
                  <select id="or-invoice-apply-title" v-model="applyTitleId" class="or-input">
                    <option v-for="t in invoiceTitles" :key="t.id" :value="t.id">
                      {{ t.name }}{{ t.isDefault ? "（默认）" : "" }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <span class="or-cloud-invoice-form-lbl">开票类型</span>
                  <div class="or-cloud-invoice-type-row">
                    <label v-for="opt in INVOICE_TYPE_OPTIONS" :key="opt" class="or-cloud-invoice-type-opt">
                      <input v-model="applyInvoiceType" type="radio" name="invoice-type" :value="opt" />
                      {{ opt }}
                    </label>
                  </div>
                </div>
                <div class="or-cloud-invoice-apply-readonly">
                  <span>合约账期</span>
                  <strong>{{ invoiceQuota.periodLabel }}</strong>
                  <span>合约编号</span>
                  <code>{{ invoiceQuota.contractId }}</code>
                </div>
                <div class="form-group">
                  <label for="or-invoice-apply-amount">申请开票金额</label>
                  <input
                    id="or-invoice-apply-amount"
                    v-model="applyAmount"
                    type="text"
                    class="or-input"
                    inputmode="decimal"
                    placeholder="不超过剩余可开票额度"
                    autocomplete="off"
                  />
                  <p class="or-cloud-invoice-form-hint">剩余可开票 {{ formatCny(invoiceQuota.remaining) }}</p>
                </div>
                <div class="form-group">
                  <label>开票项目</label>
                  <p class="or-cloud-invoice-form-fixed">云服务技术服务费</p>
                </div>
                <div class="form-group">
                  <label for="or-invoice-apply-email">收票邮箱</label>
                  <input id="or-invoice-apply-email" v-model="applyEmail" type="email" class="or-input" autocomplete="email" />
                </div>
                <div class="form-group">
                  <label for="or-invoice-apply-contact">收票联系人（选填）</label>
                  <input id="or-invoice-apply-contact" v-model="applyContact" type="text" class="or-input" autocomplete="name" />
                </div>
                <div class="form-group">
                  <label for="or-invoice-apply-phone">联系电话（选填）</label>
                  <input id="or-invoice-apply-phone" v-model="applyPhone" type="tel" class="or-input" autocomplete="tel" />
                </div>
                <div class="form-group">
                  <label for="or-invoice-apply-remark">财务备注（选填）</label>
                  <input id="or-invoice-apply-remark" v-model="applyRemark" type="text" class="or-input" />
                </div>
              </form>
              <template #actions>
                <button type="button" class="or-btn-outline" @click="closeInvoiceApply">取消</button>
                <button type="button" class="btn btn-gradient" @click="submitInvoiceApply">提交申请</button>
              </template>
            </ModalPanel>
          </div>

          <div
            id="or-cloud-invoice-detail-shell"
            class="or-modal-root or-cloud-invoice-detail-modal"
            :hidden="!invoiceDetailRow"
            :aria-hidden="invoiceDetailRow ? 'false' : 'true'"
            role="presentation"
          >
            <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeInvoiceDetail" />
            <ModalPanel
              v-if="invoiceDetailRow"
              :title="invoiceDetailRow.applyNo"
              title-id="or-cloud-invoice-detail-title"
              head-note="开票申请详情（演示）"
              close-label="关闭"
              @close="closeInvoiceDetail"
            >
              <dl class="or-cloud-invoice-detail-dl">
                <div class="or-cloud-invoice-detail-row">
                  <dt>状态</dt>
                  <dd><CloudInvoiceStatusBadge :status="invoiceDetailRow.status" /></dd>
                </div>
                <div v-if="invoiceDetailRow.status === '已驳回' && invoiceDetailRow.rejectReason" class="or-cloud-invoice-detail-row is-reject">
                  <dt>驳回原因</dt>
                  <dd>{{ invoiceDetailRow.rejectReason }}</dd>
                </div>
                <div class="or-cloud-invoice-detail-row">
                  <dt>开票抬头</dt>
                  <dd>{{ invoiceDetailRow.titleName }}</dd>
                </div>
                <div class="or-cloud-invoice-detail-row">
                  <dt>类型 / 金额</dt>
                  <dd>{{ invoiceDetailRow.invoiceType }} · {{ formatCny(invoiceDetailRow.amount) }}</dd>
                </div>
                <div class="or-cloud-invoice-detail-row">
                  <dt>账期 / 合约</dt>
                  <dd>
                    {{ invoiceDetailRow.periodLabel }} · <code>{{ invoiceDetailRow.contractId }}</code>
                  </dd>
                </div>
                <div class="or-cloud-invoice-detail-row">
                  <dt>提交时间</dt>
                  <dd>{{ invoiceDetailRow.submittedAt }}</dd>
                </div>
                <div class="or-cloud-invoice-detail-row">
                  <dt>收票邮箱</dt>
                  <dd>{{ invoiceDetailRow.email }}</dd>
                </div>
                <div v-if="invoiceDetailRow.contact" class="or-cloud-invoice-detail-row">
                  <dt>联系人</dt>
                  <dd>{{ invoiceDetailRow.contact }}{{ invoiceDetailRow.phone ? ` · ${invoiceDetailRow.phone}` : "" }}</dd>
                </div>
                <div v-if="invoiceDetailRow.remark" class="or-cloud-invoice-detail-row">
                  <dt>财务备注</dt>
                  <dd>{{ invoiceDetailRow.remark }}</dd>
                </div>
              </dl>
              <template #actions>
                <button type="button" class="or-btn-outline" @click="closeInvoiceDetail">关闭</button>
                <button
                  v-if="invoiceDetailRow.status === '开票成功'"
                  type="button"
                  class="btn btn-gradient"
                >
                  下载电子发票
                </button>
              </template>
            </ModalPanel>
          </div>
        </section>

        <!-- 联系我们 -->
        <section data-or-panel="contact" id="or-panel-contact" class="or-cloud-contact-page" hidden>
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>联系我们</span>
          </nav>
          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">联系我们</h1>
              <div class="or-keys-title-actions">
                <button type="button" class="btn btn-gradient" @click="goConsultHome">官网预约咨询</button>
              </div>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead or-cloud-lead-with-tip">
                <span class="or-cloud-lead-sub">专属顾问、技术支持与财务通道；</span>开户与优惠可在线预约。
                <details class="or-keys-info or-cloud-lead-info">
                  <summary class="or-keys-info-sum" aria-label="服务说明">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                    </svg>
                  </summary>
                  <div class="or-keys-info-panel" role="note">
                    紧急故障请致电并说明租户与云账号 ID；账单与发票问题请优先使用控制台
                    <a href="#billing" @click.prevent="goConsoleHash('#billing')">费用</a>
                    、
                    <a href="#invoices" @click.prevent="goConsoleHash('#invoices')">发票</a>
                    模块留痕。
                  </div>
                </details>
              </p>
            </div>
          </header>

          <section class="or-cloud-contact-hero" aria-labelledby="or-cloud-contact-hero-title">
            <div class="or-cloud-contact-hero__main">
              <span class="or-cloud-contact-hero__badge">{{ MOCK_CONTACT_ADVISOR.badge }}</span>
              <h2 id="or-cloud-contact-hero-title" class="or-cloud-contact-hero__title">
                {{ MOCK_CONTACT_ADVISOR.name }} · {{ MOCK_CONTACT_ADVISOR.role }}
              </h2>
              <p class="or-cloud-contact-hero__summary">{{ MOCK_CONTACT_ADVISOR.summary }}</p>
              <div class="or-cloud-contact-hero__actions">
                <a class="btn btn-gradient" href="tel:4008880626">致电顾问</a>
                <button type="button" class="or-btn-outline" @click="goConsultHome">填写预约表单</button>
              </div>
            </div>
            <dl class="or-cloud-contact-hero__meta">
              <div class="or-cloud-contact-hero__meta-row">
                <dt>服务热线</dt>
                <dd><a :href="`tel:${MOCK_CONTACT_ADVISOR.phone.replace(/-/g, '')}`">{{ MOCK_CONTACT_ADVISOR.phone }}</a></dd>
              </div>
              <div class="or-cloud-contact-hero__meta-row">
                <dt>企业微信</dt>
                <dd>{{ MOCK_CONTACT_ADVISOR.wechat }}</dd>
              </div>
              <div class="or-cloud-contact-hero__meta-row">
                <dt>服务时间</dt>
                <dd>{{ MOCK_CONTACT_ADVISOR.hours }}</dd>
              </div>
              <div class="or-cloud-contact-hero__meta-row">
                <dt>商务邮箱</dt>
                <dd><a :href="`mailto:${MOCK_CONTACT_ADVISOR.email}`">{{ MOCK_CONTACT_ADVISOR.email }}</a></dd>
              </div>
            </dl>
          </section>

          <div class="or-cloud-contact-grid">
            <article
              v-for="channel in MOCK_CONTACT_CHANNELS"
              :key="channel.id"
              class="or-cloud-contact-card"
            >
              <h3 class="or-cloud-contact-card__title">{{ channel.title }}</h3>
              <p class="or-cloud-contact-card__desc">{{ channel.desc }}</p>
              <dl class="or-cloud-contact-card__list">
                <div v-for="(item, idx) in channel.items" :key="idx" class="or-cloud-contact-card__row">
                  <dt>{{ item.label }}</dt>
                  <dd>
                    <a v-if="item.href" :href="item.href">{{ item.value }}</a>
                    <template v-else>{{ item.value }}</template>
                  </dd>
                </div>
              </dl>
            </article>
          </div>

          <ul class="or-cloud-contact-notes" aria-label="温馨提示">
            <li v-for="(note, idx) in MOCK_CONTACT_NOTES" :key="idx">{{ note }}</li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.or-cloud-side-product {
  margin-top: 0.15rem;
}
.or-cloud-simple-kpis {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.or-cloud-kpi {
  flex: 1 1 8rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}
.or-cloud-kpi__v {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}
.or-cloud-kpi__l {
  font-size: 0.8125rem;
  color: var(--muted);
  margin-top: 0.2rem;
}
.or-cloud-simple-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.or-cloud-simple-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.9375rem;
}
.or-cloud-simple-list li:last-child {
  border-bottom: none;
}
.or-cloud-simple-list strong {
  font-weight: 600;
  color: var(--text);
}
</style>
