<script setup lang="ts">
import { onActivated, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import "@trinity-ai/views/account/account.css";
import "./ai-cloud-console.css";
import {
  mountAiCloudConsoleInteractions,
  type AiCloudConsoleHandle,
} from "./consoleInteractions";
import {
  AI_CLOUD_CONSOLE_PANELS,
  MOCK_CLOUD_ACCOUNTS,
  vendorConsoleLoginLabel,
  type AiCloudConsolePanelId,
} from "./mock";

defineOptions({ name: "AiCloudConsolePage" });

const router = useRouter();

function goHome() {
  void router.push({ name: "aic-home" });
}

function openVendorConsole(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

const rootRef = ref<HTMLElement | null>(null);
const activePanel = ref<AiCloudConsolePanelId>("accounts");
let handle: AiCloudConsoleHandle | undefined;

onMounted(() => {
  if (!rootRef.value) return;
  handle = mountAiCloudConsoleInteractions(rootRef.value, (id) => {
    activePanel.value = id;
  });
});

onActivated(() => {
  handle?.syncHashPanels();
});

onUnmounted(() => {
  handle?.dispose();
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
        <section data-or-panel="accounts" id="or-panel-accounts" class="or-preset-page or-cloud-accounts-page">
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>账号管理</span>
          </nav>

          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">账号管理</h1>
              <div class="or-keys-title-actions">
                <button type="button" class="btn btn-gradient">申请绑定新云</button>
              </div>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead">
                查看已接入的云厂商账号、创建时间与认证信息。完整开户流程见官网「优惠购买流程」。
              </p>
            </div>
          </header>

          <div class="table-wrap or-preset-table-wrap or-cloud-accounts-table-wrap">
            <table class="data-table or-preset-table or-cloud-accounts-table">
              <thead>
                <tr>
                  <th>云厂商</th>
                  <th>名称 / ID</th>
                  <th class="or-cloud-th-center">创建时间</th>
                  <th>身份信息</th>
                  <th class="or-cloud-th-center">状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in MOCK_CLOUD_ACCOUNTS" :key="row.id">
                  <td>
                    <span class="or-cloud-vendor-cell" :data-vendor="row.vendorKey">
                      <span class="or-cloud-vendor-dot" aria-hidden="true" />
                      {{ row.vendor }}
                    </span>
                  </td>
                  <td>
                    <div class="or-preset-name-cell">
                      <strong>{{ row.name }}</strong>
                    </div>
                    <code class="or-keys-mask">{{ row.accountId }}</code>
                  </td>
                  <td class="or-cloud-td-center or-mono-sm">{{ row.createdAt }}</td>
                  <td class="or-cloud-td-identity">
                    <span class="or-cloud-col-identity-inner" :title="row.identity">{{ row.identity }}</span>
                  </td>
                  <td class="or-cloud-td-center">
                    <span
                      class="or-cloud-status-badge"
                      :data-status="row.status"
                      :title="row.status"
                    >{{ row.status }}</span>
                  </td>
                  <td>
                    <div class="or-preset-actions">
                      <button
                        type="button"
                        class="or-btn-outline"
                        :title="vendorConsoleLoginLabel(row.vendor)"
                        @click="openVendorConsole(row.consoleUrl)"
                      >
                        {{ vendorConsoleLoginLabel(row.vendor) }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="or-keys-summary">共 {{ MOCK_CLOUD_ACCOUNTS.length }} 个云账号（演示数据）</p>
        </section>

        <!-- 费用 · 简版 -->
        <section data-or-panel="billing" id="or-panel-billing" hidden>
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>费用</span>
          </nav>
          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">费用</h1>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead">本月总消费与各云消耗概览（演示）。</p>
            </div>
          </header>
          <div class="or-cloud-simple-kpis" role="group" aria-label="费用概览">
            <div class="or-cloud-kpi">
              <div class="or-cloud-kpi__v">¥428,000</div>
              <div class="or-cloud-kpi__l">本月云消费</div>
            </div>
            <div class="or-cloud-kpi">
              <div class="or-cloud-kpi__v">12%</div>
              <div class="or-cloud-kpi__l">渠道优惠节省</div>
            </div>
            <div class="or-cloud-kpi">
              <div class="or-cloud-kpi__v">5</div>
              <div class="or-cloud-kpi__l">已接入云厂商</div>
            </div>
          </div>
          <ul class="or-cloud-simple-list">
            <li><span>阿里云</span><strong>¥162,640</strong></li>
            <li><span>腾讯云</span><strong>¥119,840</strong></li>
            <li><span>华为云</span><strong>¥94,160</strong></li>
            <li><span>AWS</span><strong>¥38,360</strong></li>
            <li><span>其他</span><strong>¥13,000</strong></li>
          </ul>
        </section>

        <!-- 合同 · 简版 -->
        <section data-or-panel="contracts" id="or-panel-contracts" hidden>
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>合同</span>
          </nav>
          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">合同</h1>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead">渠道框架合约与补充协议状态（演示）。</p>
            </div>
          </header>
          <ul class="or-cloud-simple-list">
            <li><span>TC-2024-001 · 框架采购</span><strong>生效中</strong></li>
            <li><span>TC-2025-014 · 腾讯云补充</span><strong>生效中</strong></li>
            <li><span>TC-2025-022 · AWS 出海</span><strong>待签署</strong></li>
          </ul>
        </section>

        <!-- 发票 · 简版 -->
        <section data-or-panel="invoices" id="or-panel-invoices" hidden>
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>发票</span>
          </nav>
          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">发票</h1>
              <div class="or-keys-title-actions">
                <button type="button" class="btn btn-gradient">申请开票</button>
              </div>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead">
                开票主体：上海某某科技有限公司 · 可开票金额 <strong>¥86,420</strong>（演示）
              </p>
            </div>
          </header>
          <ul class="or-cloud-simple-list">
            <li><span>INV-2026-0088 · 增值税专用发票</span><strong>已开具</strong></li>
            <li><span>INV-2026-0091 · 增值税专用发票</span><strong>处理中</strong></li>
          </ul>
        </section>

        <!-- 联系我们 · 简版 -->
        <section data-or-panel="contact" id="or-panel-contact" hidden>
          <nav class="or-crumb" aria-label="面包屑">
            <a href="#" @click.prevent="goHome">Trinity AI 云</a>
            <span aria-hidden="true"> / </span>
            <span>联系我们</span>
          </nav>
          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">联系我们</h1>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead">专属上云顾问与 7×24 技术支持（演示）。</p>
            </div>
          </header>
          <div class="or-cloud-contact-card">
            <p><strong>专属顾问</strong> · 张先生</p>
            <p>电话 400-xxx-xxxx · 企微 Trinity-AI-Cloud</p>
            <p class="or-cloud-contact-hint">
              开户与优惠咨询请前往
              <a href="#" @click.prevent="goHome">官网预约</a>
              ，或发送邮件至 cloud@trinity.example
            </p>
          </div>
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
.or-cloud-contact-card {
  padding: 1rem 1.15rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 0.9375rem;
  line-height: 1.55;
}
.or-cloud-contact-card p {
  margin: 0 0 0.5rem;
}
.or-cloud-contact-hint {
  margin-top: 0.75rem !important;
  color: var(--muted);
  font-size: 0.875rem;
}
.or-cloud-contact-hint a {
  color: var(--blue);
}
</style>
