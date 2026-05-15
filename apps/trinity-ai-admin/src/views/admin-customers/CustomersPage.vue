<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ModalPanel, TButton, TSearchForm1Fixed, TTextField1Labeled } from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
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
  setCustomersModalBodyLock,
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
  const q = searchQ.value.trim().toLowerCase();
  if (!q) return tenantRows.value;
  return tenantRows.value.filter((r) => {
    return (
      r.id.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.ownerLogin.toLowerCase().includes(q) ||
      r.contractNo.toLowerCase().includes(q) ||
      r.authSummary.toLowerCase().includes(q)
    );
  });
});

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

watchEffect(() => {
  setCustomersModalBodyLock(tenantModalOpen.value);
});

onUnmounted(() => {
  setCustomersModalBodyLock(false);
});
</script>

<template>
  <div class="cus-page">
    <!-- 租户列表 -->
    <section v-show="panel === 'tenants'" class="cus-page__panel" aria-label="租户列表">
      <AdminSectionHead title="租户列表">
        <template #annot>
          <AdminInternalTip heading="租户列表 · 原型" explain="租户列表对内说明（原型）">
            <p>检索与状态为 mock；与密钥归属、用量分摊字段在工程期对齐主数据。</p>
          </AdminInternalTip>
        </template>
        <template #desc>
          租户主数据与合同入口（<strong>§4.7</strong>，mock）；与
          <RouterLink :to="{ name: 'tai-admin-billing-usage' }">用量与计费</RouterLink>、
          <RouterLink :to="{ name: 'tai-admin-keys-list' }">API 密钥</RouterLink>
          共用客户 ID。
        </template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="searchQ"
            :input-id="`${idPrefix}-tenant-search`"
            placeholder="名称 / ID / 主账号 / 合同号"
            width="20rem"
            aria-label="检索租户"
          />
          <TButton variant="gradient" type="button" @click="openTenantAdd">新建租户</TButton>
        </template>
      </AdminSectionHead>
      <div class="cus-page__table-wrap">
        <table class="cus-page__table">
          <thead>
            <tr>
              <th>租户 ID</th>
              <th>名称</th>
              <th>状态</th>
              <th>认证摘要</th>
              <th>主账号</th>
              <th>合同</th>
              <th>授信占用</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredTenants" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td><span :class="tenantStatusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.authSummary }}</td>
              <td>{{ r.ownerLogin }}</td>
              <td>{{ r.contractNo }}</td>
              <td>{{ r.creditUsed }}</td>
              <td>
                <div class="cus-page__actions">
                  <button type="button" class="cus-page__link-btn" @click="openTenantEdit(r)">编辑</button>
                  <button
                    type="button"
                    class="cus-page__link-btn"
                    @click="goPanel('tai-admin-customers-org', { tenantId: r.id })"
                  >
                    组织
                  </button>
                  <button
                    type="button"
                    class="cus-page__link-btn"
                    @click="goPanel('tai-admin-customers-contract', { tenantId: r.id })"
                  >
                    合同
                  </button>
                  <button
                    type="button"
                    class="cus-page__link-btn"
                    @click="goPanel('tai-admin-customers-credit', { tenantId: r.id })"
                  >
                    授信
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="cus-page__hint">终端用户账号见 <RouterLink :to="{ name: 'tai-admin-users-list' }">用户与认证</RouterLink>（§4.11），与本节租户组织区分。</p>
    </section>

    <!-- 组织 / 项目 -->
    <section v-show="panel === 'org'" class="cus-page__panel" aria-label="组织与项目">
      <AdminSectionHead title="组织 / 项目">
        <template #annot>
          <AdminInternalTip heading="组织 / 项目 · 原型" explain="组织项目对内说明（原型）">
            <p>树/表为占位结构；合同主体下团队与项目 ID 应对接 CRM/IdP。</p>
          </AdminInternalTip>
        </template>
        <template #desc>租户下项目与成员、密钥归属对齐（mock）。</template>
        <template #tools>
          <TButton variant="outline" type="button">新建项目（示意）</TButton>
        </template>
      </AdminSectionHead>
      <p v-if="route.query.tenantId" class="cus-page__hint">
        已筛选租户：<code>{{ route.query.tenantId }}</code> ·
        <button type="button" class="cus-page__link-btn" @click="goPanel('tai-admin-customers-org')">清除筛选</button>
      </p>
      <div class="cus-page__table-wrap">
        <table class="cus-page__table">
          <thead>
            <tr>
              <th>项目 ID</th>
              <th>租户</th>
              <th>项目名称</th>
              <th>成员数</th>
              <th>密钥数</th>
              <th>分摊标签</th>
              <th>更新</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in orgRowsForFilter" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.tenantName }}</td>
              <td>{{ r.projectName }}</td>
              <td>{{ r.members }}</td>
              <td>{{ r.keyCount }}</td>
              <td>{{ r.billingTag }}</td>
              <td>{{ r.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="cus-page__hint">密钥归属与 <RouterLink :to="{ name: 'tai-admin-keys-list' }">API 列表</RouterLink> 字段对齐（工程期）。</p>
    </section>

    <!-- 合同 -->
    <section v-show="panel === 'contract'" class="cus-page__panel" aria-label="合同">
      <AdminSectionHead title="合同">
        <template #annot>
          <AdminInternalTip heading="合同 · 原型" explain="合同页对内说明（原型）">
            <p>期限、折扣与绑定 SKU 为示意；到期提醒与工作台待办联动二期再做。</p>
          </AdminInternalTip>
        </template>
        <template #desc>合同与 SKU 绑定、折扣与状态（mock）。</template>
        <template #tools>
          <TButton variant="gradient" type="button">新建合同（示意）</TButton>
        </template>
      </AdminSectionHead>
      <p v-if="route.query.tenantId" class="cus-page__hint">
        已筛选租户：<code>{{ route.query.tenantId }}</code> ·
        <button type="button" class="cus-page__link-btn" @click="goPanel('tai-admin-customers-contract')">清除筛选</button>
      </p>
      <div class="cus-page__table-wrap">
        <table class="cus-page__table">
          <thead>
            <tr>
              <th>合同编号</th>
              <th>客户</th>
              <th>绑定 SKU</th>
              <th>折扣</th>
              <th>起止</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in contractRowsForFilter" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.tenantName }}</td>
              <td>
                <RouterLink :to="{ name: 'tai-admin-billing-sku' }">{{ r.skuName }}</RouterLink>
                <span class="cus-page__hint">（{{ r.skuId }}）</span>
              </td>
              <td>{{ r.discount }}</td>
              <td>{{ r.startDate }} ~ {{ r.endDate }}</td>
              <td><span :class="contractStatusClass(r.status)">{{ r.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="cus-page__hint">即将到期合同可进 <RouterLink :to="{ name: 'tai-admin-dashboard' }">工作台</RouterLink> 待办（示意链接已存在）。</p>
    </section>

    <!-- 发票与抬头 -->
    <section v-show="panel === 'invoice'" class="cus-page__panel" aria-label="发票与抬头">
      <AdminSectionHead title="发票与抬头">
        <template #annot>
          <AdminInternalTip heading="发票与抬头 · 原型" explain="发票抬头对内说明（原型）">
            <p>税号与开票申请为 mock；真实对接税务与财务审核流。</p>
          </AdminInternalTip>
        </template>
        <template #desc>开票抬头与发票申请分表（mock）。</template>
        <template #tools>
          <TButton variant="outline" type="button">新建申请（示意）</TButton>
        </template>
      </AdminSectionHead>
      <h3 class="cus-page__subhead">开票抬头</h3>
      <div class="cus-page__table-wrap">
        <table class="cus-page__table">
          <thead>
            <tr>
              <th>抬头 ID</th>
              <th>客户</th>
              <th>抬头名称</th>
              <th>税号</th>
              <th>票种</th>
              <th>接收邮箱</th>
              <th>默认</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in INVOICE_HEADER_ROWS" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.tenantName }}</td>
              <td>{{ r.title }}</td>
              <td>{{ r.taxId }}</td>
              <td>{{ r.invoiceType }}</td>
              <td>{{ r.email }}</td>
              <td>{{ r.default ? "是" : "否" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="cus-page__subhead">发票申请</h3>
      <div class="cus-page__table-wrap">
        <table class="cus-page__table">
          <thead>
            <tr>
              <th>申请单号</th>
              <th>客户</th>
              <th>账期</th>
              <th>金额</th>
              <th>状态</th>
              <th>申请时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in INVOICE_APPLICATION_ROWS" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.tenantName }}</td>
              <td>{{ r.period }}</td>
              <td>{{ r.amount }}</td>
              <td><span :class="invoiceAppStatusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.appliedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="cus-page__hint">
        账单状态与
        <RouterLink :to="{ name: 'tai-admin-billing-invoice' }">用量与计费 · 账单</RouterLink>
        联动（原型分表展示）。
      </p>
    </section>

    <!-- 授信 -->
    <section v-show="panel === 'credit'" class="cus-page__panel" aria-label="授信">
      <AdminSectionHead title="授信">
        <template #annot>
          <AdminInternalTip heading="授信 · 原型" explain="授信对内说明（原型）">
            <p>额度与状态为占位；大额授信应走审批与风控策略（详设 §4.7）。</p>
          </AdminInternalTip>
        </template>
        <template #desc>额度、占用与审批状态（mock）。</template>
        <template #tools>
          <TButton variant="gradient" type="button">大额授信申请（示意）</TButton>
        </template>
      </AdminSectionHead>
      <p v-if="route.query.tenantId" class="cus-page__hint">
        已筛选租户：<code>{{ route.query.tenantId }}</code> ·
        <button type="button" class="cus-page__link-btn" @click="goPanel('tai-admin-customers-credit')">清除筛选</button>
      </p>
      <div class="cus-page__table-wrap">
        <table class="cus-page__table">
          <thead>
            <tr>
              <th>授信 ID</th>
              <th>客户</th>
              <th>额度</th>
              <th>已用</th>
              <th>审批</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in (route.query.tenantId
                ? CREDIT_ROWS.filter((x) => x.tenantId === route.query.tenantId)
                : CREDIT_ROWS)"
              :key="r.id"
            >
              <td>{{ r.id }}</td>
              <td>{{ r.tenantName }}</td>
              <td>{{ r.limitAmount }}</td>
              <td>{{ r.usedAmount }}</td>
              <td><span :class="creditApprovalClass(r.approvalState)">{{ r.approvalState }}</span></td>
              <td>{{ r.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="cus-page__hint">
        待审批可与
        <RouterLink :to="{ name: 'tai-admin-users-audit-queue' }">用户与认证 · 审核队列</RouterLink>
        协同（v2 深链）。
      </p>
    </section>

    <Teleport to="body">
      <div
        v-show="tenantModalOpen"
        class="or-modal-root"
        role="presentation"
        :aria-hidden="!tenantModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeTenantModal" />
        <ModalPanel
          :title="tenantModalTitle"
          :title-id="`${idPrefix}-cus-tenant-title`"
          head-note="租户列表支持 localStorage 持久化（原型）。"
          close-label="关闭"
          @close="closeTenantModal"
        >
      <p v-if="tenantFormError" class="cus-page__form-error">{{ tenantFormError }}</p>
      <div class="cus-page__modal-fields">
        <TTextField1Labeled
          v-if="tenantModalMode === 'add'"
          :input-id="`${idPrefix}-tid`"
          v-model="draftTenantId"
          label="租户 ID（可选）"
          placeholder="留空则自动生成"
        />
        <TTextField1Labeled
          :input-id="`${idPrefix}-tname`"
          v-model="draftTenantName"
          label="租户名称"
          placeholder="如 Acme"
        />
        <TTextField1Labeled
          :input-id="`${idPrefix}-owner`"
          v-model="draftOwnerLogin"
          label="主账号"
          placeholder="owner@example.com"
        />
        <TTextField1Labeled
          :input-id="`${idPrefix}-auth`"
          v-model="draftAuthSummary"
          label="认证摘要"
          placeholder="企业认证已通过 / 待认证"
        />
        <label class="cus-page__hint">
          状态
          <select v-model="draftTenantStatus" class="cus-page__table" style="display: block; margin-top: 0.25rem; width: 100%">
            <option value="正式">正式</option>
            <option value="试用">试用</option>
            <option value="停用">停用</option>
          </select>
        </label>
      </div>
      <template #actions>
        <TButton type="button" @click="closeTenantModal">取消</TButton>
        <TButton variant="gradient" type="button" @click="submitTenantForm">保存</TButton>
      </template>
        </ModalPanel>
      </div>
    </Teleport>
  </div>
</template>
