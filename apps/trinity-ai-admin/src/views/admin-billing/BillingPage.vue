<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { TButton } from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./billing.css";
import {
  BILLING_ADJUST_ROWS,
  BILLING_INVOICE_ROWS,
  BILLING_QUOTA_ROWS,
  BILLING_SKU_ROWS,
  BILLING_TABS,
  BILLING_USAGE_ROWS,
  type BillingTabId,
} from "./mock";

const route = useRoute();

const activeTab = computed<BillingTabId>(() => {
  const tab = route.meta.billingTab as BillingTabId | undefined;
  if (tab && BILLING_TABS.some((x) => x.id === tab)) return tab;
  return "usage";
});
</script>

<template>
  <div class="bill-page">
    <!-- 用量明细 -->
    <section v-show="activeTab === 'usage'" class="bill-page__panel" aria-label="用量明细">
      <AdminSectionHead title="用量明细">
        <template #annot>
          <AdminInternalTip heading="用量明细 · 原型" explain="用量明细对内说明（原型）">
            <p>调用明细为 mock；导出与时间筛选为示意按钮，工程期接数仓与权限。</p>
          </AdminInternalTip>
        </template>
        <template #desc>调用明细钻取与导出（<strong>§4.3</strong>，mock）。</template>
        <template #tools>
          <TButton variant="outline">导出 CSV（示意）</TButton>
          <TButton variant="outline">时间范围</TButton>
        </template>
      </AdminSectionHead>
      <div class="bill-page__table-wrap">
        <table class="bill-page__table">
          <thead>
            <tr>
              <th>时间</th>
              <th>客户</th>
              <th>模型</th>
              <th>线路</th>
              <th>Token 入/出</th>
              <th>试算金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in BILLING_USAGE_ROWS" :key="i">
              <td>{{ r.time }}</td>
              <td>{{ r.org }}</td>
              <td>{{ r.model }}</td>
              <td>{{ r.line }}</td>
              <td>{{ r.tokens }}</td>
              <td>{{ r.amt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="bill-page__hint">钻取单次调用、脱敏策略见正式版 RBAC（原型不实现）。</p>
    </section>

    <!-- 配额监控 -->
    <section v-show="activeTab === 'quota'" class="bill-page__panel" aria-label="配额监控">
      <AdminSectionHead title="配额监控">
        <template #annot>
          <AdminInternalTip heading="配额监控 · 原型" explain="配额监控对内说明（原型）">
            <p>阈值与告警状态为示意；与网关限流、合同配额对齐在工程期实现。</p>
          </AdminInternalTip>
        </template>
        <template #desc>客户套餐用量与硬顶/软顶告警（mock）。</template>
      </AdminSectionHead>
      <div class="bill-page__table-wrap">
        <table class="bill-page__table">
          <thead>
            <tr>
              <th>客户</th>
              <th>套餐</th>
              <th>已用</th>
              <th>硬顶</th>
              <th>软顶 / 告警</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in BILLING_QUOTA_ROWS" :key="i">
              <td>{{ r.org }}</td>
              <td>{{ r.plan }}</td>
              <td>{{ r.used }}</td>
              <td>{{ r.hard }}</td>
              <td>{{ r.soft }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 套餐 SKU -->
    <section v-show="activeTab === 'sku'" class="bill-page__panel" aria-label="套餐 SKU">
      <AdminSectionHead title="套餐 SKU">
        <template #annot>
          <AdminInternalTip heading="套餐 SKU · 原型" explain="套餐 SKU 对内说明（原型）">
            <p>刊例与 SKU 绑定为占位表；价格变更应走审计与版本发布流程（详设 §4.3）。</p>
          </AdminInternalTip>
        </template>
        <template #desc>刊例与套餐条目只读（mock）；与客户合同绑定见客户模块。</template>
      </AdminSectionHead>
      <div class="bill-page__table-wrap">
        <table class="bill-page__table">
          <thead>
            <tr>
              <th>SKU ID</th>
              <th>名称</th>
              <th>类型</th>
              <th>刊例</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in BILLING_SKU_ROWS" :key="i">
              <td>{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.type }}</td>
              <td>{{ r.price }}</td>
              <td>{{ r.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="bill-page__hint">
        与客户合同绑定见
        <RouterLink :to="{ name: 'tai-admin-customers-contract' }">客户与合同 · 合同</RouterLink>。
      </p>
    </section>

    <!-- 账单 -->
    <section v-show="activeTab === 'invoice'" class="bill-page__panel" aria-label="账单">
      <AdminSectionHead title="账单">
        <template #annot>
          <AdminInternalTip heading="账单 · 原型" explain="账单列表对内说明（原型）">
            <p>开票状态与金额为 mock；对账与发票 PDF 下载在工程期对接计费中台。</p>
          </AdminInternalTip>
        </template>
        <template #desc>账期、金额与支付状态（mock）。</template>
        <template #tools>
          <TButton variant="outline">按客户导出对账</TButton>
        </template>
      </AdminSectionHead>
      <div class="bill-page__table-wrap">
        <table class="bill-page__table">
          <thead>
            <tr>
              <th>账期</th>
              <th>客户</th>
              <th>金额</th>
              <th>状态</th>
              <th>支付</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in BILLING_INVOICE_ROWS" :key="i">
              <td>{{ r.period }}</td>
              <td>{{ r.org }}</td>
              <td>{{ r.amount }}</td>
              <td>{{ r.status }}</td>
              <td>{{ r.paid }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 调账 -->
    <section v-show="activeTab === 'adjust'" class="bill-page__panel" aria-label="调账充值">
      <AdminSectionHead title="调账 / 充值">
        <template #annot>
          <AdminInternalTip heading="调账 / 充值 · 原型" explain="调账充值对内说明（原型）">
            <p>调账流水为示意；真实环境需审批流、双人复核与财务凭证号（§4.13）。</p>
          </AdminInternalTip>
        </template>
        <template #desc>调账申请队列与状态（mock）。</template>
        <template #tools>
          <TButton variant="gradient">新建调账申请（示意）</TButton>
        </template>
      </AdminSectionHead>
      <div class="bill-page__table-wrap">
        <table class="bill-page__table">
          <thead>
            <tr>
              <th>单号</th>
              <th>客户</th>
              <th>原因</th>
              <th>金额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in BILLING_ADJUST_ROWS" :key="i">
              <td>{{ r.id }}</td>
              <td>{{ r.org }}</td>
              <td>{{ r.reason }}</td>
              <td>{{ r.amount }}</td>
              <td>{{ r.state }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
