<script setup lang="ts">
import { onActivated, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { getTrinityDocsSiteUrl } from "../../trinityDocsSite";
import "./account.css";
import {
  mountAccountConsoleInteractions,
  type AccountConsoleHandle,
} from "./accountInteractions";

defineOptions({ name: "TaiAccountConsolePage" });

const docsSiteUrl = getTrinityDocsSiteUrl();
const rootRef = ref<HTMLElement | null>(null);
let handle: AccountConsoleHandle | undefined;

onMounted(() => {
  if (rootRef.value) {
    void mountAccountConsoleInteractions(rootRef.value).then((h) => {
      handle = h;
    });
  }
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
        <aside class="or-side" aria-label="控制台">
          <div class="or-side-heading">工作区</div>
          <a href="#keys" class="or-dash-nav">API 密钥</a>
          <a href="#preset" class="or-dash-nav">角色管理</a>
          <div class="or-side-heading" style="margin-top: 0.65rem">账户</div>
          <a href="#credits" class="or-dash-nav">Credits</a>
          <a href="#activity" class="or-dash-nav">活动</a>
          <a href="#logs" class="or-dash-nav">用量</a>
          <div class="or-side-heading" style="margin-top: 0.65rem">产品</div>
          <RouterLink :to="{ name: 'tai-models' }">模型</RouterLink>
          <RouterLink :to="{ name: 'tai-chat' }">对话</RouterLink>
          <a :href="docsSiteUrl">文档</a>
        </aside>

        <div class="or-main">
          <section data-or-panel="keys" id="or-panel-keys">
            <nav class="or-crumb" aria-label="面包屑">
              <RouterLink :to="{ name: 'tai-home' }">Trinity AI</RouterLink>
              <span aria-hidden="true"> / </span>
              <span>API 密钥</span>
            </nav>

            <header class="or-keys-pagehead">
              <div class="or-keys-title-row">
                <h1 class="or-page-title or-keys-page-title">API 密钥</h1>
                <div class="or-keys-title-actions">
                  <div class="or-keys-expiry-filter" role="toolbar" aria-label="按到期状态筛选">
                    <div class="or-app-filter-dd-wrap" id="or-keys-expiry-dd-wrap">
                      <button
                        type="button"
                        class="or-select or-select--app or-app-filter-dd-trigger"
                        id="or-keys-expiry-dd-btn"
                        aria-expanded="false"
                        aria-haspopup="listbox"
                        aria-controls="or-keys-expiry-dd-panel"
                      >
                        <span id="or-keys-expiry-dd-label" data-dd-label>全部</span>
                        <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </button>
                      <div
                        class="or-app-filter-more-panel or-app-filter-pop-beak"
                        id="or-keys-expiry-dd-panel"
                        role="listbox"
                        hidden
                        aria-label="到期筛选"
                        style="--or-pop-beak-x: 1.35rem"
                      >
                        <button
                          type="button"
                          class="or-app-filter-dd-item is-checked"
                          role="option"
                          data-dd-value="全部"
                          data-or-expiry-filter="all"
                          tabindex="-1"
                        >
                          <span class="or-app-filter-dd-label">全部</span>
                          <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                        </button>
                        <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="过期" data-or-expiry-filter="expired" tabindex="-1">
                          <span class="or-app-filter-dd-label">过期</span>
                          <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                        </button>
                        <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="不过期" data-or-expiry-filter="not-expired" tabindex="-1">
                          <span class="or-app-filter-dd-label">不过期</span>
                          <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-gradient or-keys-btn-create">创建密钥</button>
                </div>
              </div>
              <div class="or-keys-lead-row">
                <p class="or-lead or-keys-lead">创建与轮换密钥；完整密钥仅在创建时展示一次。</p>
                <details class="or-keys-info">
                  <summary class="or-keys-info-sum" aria-label="关于 API 密钥">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                    </svg>
                  </summary>
                  <div class="or-keys-info-panel" role="note">
                    密钥用于调用 Trinity AI API；请妥善保管，勿提交到公开仓库。泄露后请立即轮换。
                  </div>
                </details>
              </div>
            </header>

            <div class="or-keys-toolbar or-app-filter-row">
              <label class="or-keys-search">
                <span class="visually-hidden">按名称搜索</span>
                <svg class="or-keys-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  id="or-keys-search-input"
                  class="or-input or-keys-search-input"
                  placeholder="按名称搜索…"
                  autocomplete="off"
                  aria-label="按名称搜索密钥"
                />
              </label>
            </div>

            <div class="table-wrap or-keys-table-wrap">
              <table class="data-table or-keys-table" id="or-keys-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>密钥</th>
                    <th class="or-keys-th-center">额度上限</th>
                    <th class="or-keys-th-center">重置周期</th>
                    <th class="or-keys-th-center">过期</th>
                    <th class="or-keys-th-center">创建时间</th>
                    <th class="or-keys-th-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr data-or-key-name="测试一号" data-or-key-expiry="not-expired">
                    <td class="or-keys-col-name">测试一号</td>
                    <td class="or-keys-col-key">
                      <code class="or-keys-mask">xh-****************************</code>
                    </td>
                    <td class="or-keys-col-center or-keys-metric">$1.00</td>
                    <td class="or-keys-col-center">不适用</td>
                    <td class="or-keys-col-center">永不过期</td>
                    <td class="or-keys-col-center or-keys-datetime">2026年4月28日 16:34</td>
                    <td class="or-keys-actions-row">
                      <div class="or-keys-ops" data-or-keys-ops>
                        <button
                          type="button"
                          class="or-keys-ops-trigger"
                          aria-haspopup="true"
                          aria-expanded="false"
                          title="操作"
                        >
                          <span class="visually-hidden">行操作菜单</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="12" cy="5" r="1.75" />
                            <circle cx="12" cy="12" r="1.75" />
                            <circle cx="12" cy="19" r="1.75" />
                          </svg>
                        </button>
                        <div class="or-keys-ops-panel" role="menu" hidden>
                          <button type="button" class="or-keys-ops-item or-keys-ops-item--edit" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span>编辑</span>
                          </button>
                          <button type="button" class="or-keys-ops-item" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <path d="M3 3v18h18" />
                              <path d="M7 15l3-3 3 3 6-8" />
                            </svg>
                            <span>活动</span>
                          </button>
                          <button type="button" class="or-keys-ops-item" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M15 9l-6 6M9 9l6 6" />
                            </svg>
                            <span>停用</span>
                          </button>
                          <button type="button" class="or-keys-ops-item or-keys-ops-item--danger" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                            <span>删除</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr data-or-key-name="历史接口密钥" data-or-key-expiry="expired">
                    <td class="or-keys-col-name">历史接口密钥</td>
                    <td class="or-keys-col-key">
                      <code class="or-keys-mask">xh-****************************</code>
                    </td>
                    <td class="or-keys-col-center or-keys-metric">$0.00</td>
                    <td class="or-keys-col-center">不适用</td>
                    <td class="or-keys-col-center">已于 2025年12月1日 过期</td>
                    <td class="or-keys-col-center or-keys-datetime">2024年6月2日 09:10</td>
                    <td class="or-keys-actions-row">
                      <div class="or-keys-ops" data-or-keys-ops>
                        <button
                          type="button"
                          class="or-keys-ops-trigger"
                          aria-haspopup="true"
                          aria-expanded="false"
                          title="操作"
                        >
                          <span class="visually-hidden">行操作菜单</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="12" cy="5" r="1.75" />
                            <circle cx="12" cy="12" r="1.75" />
                            <circle cx="12" cy="19" r="1.75" />
                          </svg>
                        </button>
                        <div class="or-keys-ops-panel" role="menu" hidden>
                          <button type="button" class="or-keys-ops-item or-keys-ops-item--edit" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span>编辑</span>
                          </button>
                          <button type="button" class="or-keys-ops-item" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <path d="M3 3v18h18" />
                              <path d="M7 15l3-3 3 3 6-8" />
                            </svg>
                            <span>活动</span>
                          </button>
                          <button type="button" class="or-keys-ops-item" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M15 9l-6 6M9 9l6 6" />
                            </svg>
                            <span>停用</span>
                          </button>
                          <button type="button" class="or-keys-ops-item or-keys-ops-item--danger" role="menuitem">
                            <svg class="or-keys-ops-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                            <span>删除</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="or-keys-summary" id="or-keys-summary" aria-live="polite">2 个密钥</p>
          </section>

          <section data-or-panel="credits" id="or-panel-credits" hidden>
            <nav class="or-crumb" aria-label="面包屑">
              <RouterLink :to="{ name: 'tai-home' }">Trinity AI</RouterLink>
              <span aria-hidden="true"> / </span>
              <span>Credits</span>
            </nav>

            <header class="or-credits-pagehead">
              <div class="or-credits-title-row">
                <h1 class="or-page-title or-credits-page-title">Credits</h1>
                <div class="or-credits-title-actions">
                  <button type="button" class="btn btn-gradient or-credits-btn-recharge" data-or-open-purchase-credits>
                    Add Credits
                  </button>
                  <button type="button" class="or-btn-outline or-credits-btn-export">Export usage</button>
                </div>
              </div>
              <div class="or-credits-lead-row">
                <p class="or-lead or-credits-lead">
                  USD 预充值余额 · Chat 与 API Key 共用 · 充多少到账多少（无充值手续费行）。
                </p>
                <details class="or-credits-info">
                  <summary class="or-credits-info-sum" aria-label="关于 Credits 与退款">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                    </svg>
                  </summary>
                  <div class="or-credits-info-panel" role="note">
                    Credits 长期有效。24h 内未使用可邮件申请退款；超过 24h 或已消费不退。不支持提现。
                  </div>
                </details>
              </div>
            </header>

            <div class="or-credit-card">
              <div>
                <div class="or-credit-label">Available balance</div>
                <div class="or-credit-val" id="or-credits-balance-display">$248.35</div>
                <p class="or-footnote" style="margin-top: 0.35rem; margin-bottom: 0">
                  Purchased <strong>$248.35</strong> · Trial grant <strong>$0.00</strong>
                </p>
                <div class="or-credits-balance-actions">
                  <button type="button" class="btn btn-gradient or-credits-btn-recharge" data-or-open-purchase-credits>
                    Purchase Credits
                  </button>
                  <button type="button" class="or-btn-outline" disabled title="P0.5">Manage payment methods</button>
                </div>
              </div>
            </div>

            <div class="or-mini-stats" aria-label="本月概要">
              <div class="or-mini-stat">
                <div class="lbl">Spend this month</div>
                <div class="val">$42.18</div>
              </div>
              <div class="or-mini-stat">
                <div class="lbl">API requests</div>
                <div class="val">18.4k</div>
              </div>
              <div class="or-mini-stat">
                <div class="lbl">Low balance alert</div>
                <div class="val">$10</div>
              </div>
            </div>

            <h2 class="or-section-title">Payment History</h2>
            <div class="table-wrap">
              <table class="data-table" id="or-payment-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="or-mono-sm">2026-06-07 14:22</td>
                    <td>$50.00</td>
                    <td>Card ·••• 4242</td>
                    <td><span class="badge ok">Completed</span></td>
                    <td><a href="#" class="text-link">Stripe receipt</a></td>
                  </tr>
                  <tr>
                    <td class="or-mono-sm">2026-05-28 09:15</td>
                    <td>$25.00</td>
                    <td>Alipay</td>
                    <td><span class="badge ok">Completed</span></td>
                    <td><a href="#" class="text-link">Stripe receipt</a></td>
                  </tr>
                  <tr>
                    <td class="or-mono-sm">2026-05-12 18:40</td>
                    <td>$10.00</td>
                    <td>WeChat Pay</td>
                    <td><span class="badge ok">Completed</span></td>
                    <td><a href="#" class="text-link">Stripe receipt</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="or-footnote">
              24h 内未使用的充值如需退款，请邮件
              <a href="mailto:support@trinitydesk.ai">support@trinitydesk.ai</a>
              并提供交易 ID（无控制台自助 Refund 按钮）。
            </p>

            <h2 class="or-section-title">Ledger</h2>
            <div class="or-toolbar or-app-filter-row" style="overflow: visible">
              <div style="display: inline-flex; align-items: center; gap: 0.4rem">
                <span class="or-keys-expiry-lbl">类型</span>
                <div class="or-app-filter-dd-wrap" id="or-credits-type-dd-wrap">
                  <button
                    type="button"
                    class="or-select or-select--app or-app-filter-dd-trigger"
                    id="or-credits-type-dd-btn"
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    aria-controls="or-credits-type-dd-panel"
                  >
                    <span data-dd-label>全部</span>
                    <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                  <div
                    class="or-app-filter-more-panel or-app-filter-pop-beak"
                    id="or-credits-type-dd-panel"
                    role="listbox"
                    hidden
                    aria-label="流水类型"
                    style="--or-pop-beak-x: 2.75rem"
                  >
                    <button type="button" class="or-app-filter-dd-item is-checked" role="option" data-dd-value="全部" tabindex="-1">
                      <span class="or-app-filter-dd-label">全部</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                    </button>
                    <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="API 消费" tabindex="-1">
                      <span class="or-app-filter-dd-label">API 消费</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="充值" tabindex="-1">
                      <span class="or-app-filter-dd-label">充值</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="赠送 / 活动" tabindex="-1">
                      <span class="or-app-filter-dd-label">赠送 / 活动</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                    </button>
                  </div>
                </div>
              </div>
              <div style="display: inline-flex; align-items: center; gap: 0.4rem">
                <span class="or-keys-expiry-lbl">时间</span>
                <div class="or-app-filter-dd-wrap" id="or-credits-time-dd-wrap">
                  <button
                    type="button"
                    class="or-select or-select--app or-app-filter-dd-trigger"
                    id="or-credits-time-dd-btn"
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    aria-controls="or-credits-time-dd-panel"
                  >
                    <span data-dd-label>近 30 天</span>
                    <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                  <div
                    class="or-app-filter-more-panel or-app-filter-pop-beak"
                    id="or-credits-time-dd-panel"
                    role="listbox"
                    hidden
                    aria-label="流水时间"
                    style="--or-pop-beak-x: 2.75rem"
                  >
                    <button type="button" class="or-app-filter-dd-item is-checked" role="option" data-dd-value="近 30 天" tabindex="-1">
                      <span class="or-app-filter-dd-label">近 30 天</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                    </button>
                    <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="近 7 天" tabindex="-1">
                      <span class="or-app-filter-dd-label">近 7 天</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="本账单周期" tabindex="-1">
                      <span class="or-app-filter-dd-label">本账单周期</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>类型</th>
                    <th>说明</th>
                    <th>金额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="or-mono-sm">2026-05-09 14:22</td>
                    <td>Usage</td>
                    <td>chat · gpt-4o</td>
                    <td>−$0.42</td>
                  </tr>
                  <tr>
                    <td class="or-mono-sm">2026-05-09 11:05</td>
                    <td>Usage</td>
                    <td>embeddings · text-embedding-3-small</td>
                    <td>−$0.03</td>
                  </tr>
                  <tr>
                    <td class="or-mono-sm">2026-05-08 09:12</td>
                    <td>Top-up</td>
                    <td>Stripe · Card ·••• 4242</td>
                    <td>+$50.00</td>
                  </tr>
                  <tr>
                    <td class="or-mono-sm">2026-05-01 00:00</td>
                    <td>Grant</td>
                    <td>Welcome credits (demo)</td>
                    <td>+$5.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <aside class="or-credits-policy" aria-label="充值与退款说明">
              <h3>充值说明</h3>
              <ul>
                <li>USD 计价；单笔最低 <strong>$10</strong>。</li>
                <li><strong>充 $N 到账 $N Credits</strong> — 无 Service / Processing fee 行。</li>
                <li>Credits 长期有效；政策变更将至少提前 30 天通知。</li>
              </ul>
            </aside>

            <p class="or-credits-sales-foot">
              需要企业大额预存、对公汇款、定制阶梯折扣或月结方案？
              <button type="button" class="or-contact-sales-inline-btn" data-or-open-contact-sales>Contact Sales</button>
            </p>
          </section>

          <section data-or-panel="activity" id="or-panel-activity" hidden>
            <nav class="or-crumb" aria-label="面包屑">
              <RouterLink :to="{ name: 'tai-home' }">Trinity AI</RouterLink>
              <span aria-hidden="true"> / </span>
              <span>活动</span>
            </nav>

            <div class="or-act-pagehead">
              <div class="or-act-pagehead-left">
                <h1 class="or-page-title">活动</h1>
                <p class="or-lead">各模型上的用量概览（示意）</p>
              </div>
              <div class="or-act-controls or-app-filter-row" style="overflow: visible">
                <div class="or-app-filter-dd-wrap" id="or-act-model-dd-wrap">
                  <button
                    type="button"
                    class="or-select or-select--app or-app-filter-dd-trigger"
                    id="or-act-model-dd-btn"
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    aria-controls="or-act-model-dd-panel"
                  >
                    <span id="or-act-model-dd-label" data-dd-label>按模型</span>
                    <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                  <div
                    class="or-app-filter-more-panel or-app-filter-pop-beak"
                    id="or-act-model-dd-panel"
                    role="listbox"
                    hidden
                    aria-label="分组"
                    style="--or-pop-beak-x: 2.75rem"
                  >
                    <button type="button" class="or-app-filter-dd-item is-checked" role="option" data-or-act-model="按模型">
                      <span class="or-app-filter-dd-label">按模型</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                    </button>
                    <button type="button" class="or-app-filter-dd-item" role="option" data-or-act-model="按提供商">
                      <span class="or-app-filter-dd-label">按提供商</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="or-app-filter-dd-item" role="option" data-or-act-model="按应用">
                      <span class="or-app-filter-dd-label">按应用</span>
                      <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                    </button>
                  </div>
                </div>
                <button type="button" class="or-icon-btn" title="设置" aria-label="活动设置">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </button>
                <a href="#logs" class="or-btn-outline or-app-filter-pill" style="text-decoration: none">查看用量</a>
              </div>
            </div>

            <div class="or-act-cards" aria-label="用量概览">
              <article class="or-act-metric-card">
                <button type="button" class="or-icon-btn or-act-metric-expand" title="展开" aria-label="展开 Spend">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </button>
                <div class="or-act-metric-lbl">Spend</div>
                <div class="or-act-metric-val">$0.00182</div>
                <div class="or-act-mini-chart" aria-hidden="true">
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 22%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 18%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 35%; background: linear-gradient(to top, var(--success-bright) 0 18%, var(--blue) 18% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 28%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 42%; background: linear-gradient(to top, var(--success-bright) 0 25%, var(--blue) 25% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 55%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 38%; background: linear-gradient(to top, var(--success-bright) 0 20%, var(--blue) 20% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 68%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 48%; background: linear-gradient(to top, var(--success-bright) 0 22%, var(--blue) 22% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 72%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 88%; background: linear-gradient(to top, var(--success-bright) 0 15%, var(--blue) 15% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 62%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                </div>
                <div class="or-act-legend">
                  <div class="or-act-legend-row">
                    <span class="or-act-legend-dot or-act-legend-dot--b" aria-hidden="true"></span>
                    <span class="or-act-legend-name">gpt-oss-120b</span>
                    <span class="or-act-legend-val">$0.00</span>
                  </div>
                  <div class="or-act-legend-row">
                    <span class="or-act-legend-dot or-act-legend-dot--g" aria-hidden="true"></span>
                    <span class="or-act-legend-name">Mistral 7B Instruct v0.1</span>
                    <span class="or-act-legend-val">$0.00</span>
                  </div>
                </div>
              </article>

              <article class="or-act-metric-card">
                <button type="button" class="or-icon-btn or-act-metric-expand" title="展开" aria-label="展开 Requests">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </button>
                <div class="or-act-metric-lbl">Requests</div>
                <div class="or-act-metric-val">5</div>
                <div class="or-act-mini-chart" aria-hidden="true">
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 30%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 24%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 40%; background: linear-gradient(to top, var(--success-bright) 0 28%, var(--blue) 28% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 36%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 52%; background: linear-gradient(to top, var(--success-bright) 0 22%, var(--blue) 22% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 70%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 44%; background: linear-gradient(to top, var(--success-bright) 0 35%, var(--blue) 35% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 78%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 50%; background: linear-gradient(to top, var(--success-bright) 0 18%, var(--blue) 18% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 85%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 92%; background: linear-gradient(to top, var(--success-bright) 0 12%, var(--blue) 12% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 58%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                </div>
                <div class="or-act-legend">
                  <div class="or-act-legend-row">
                    <span class="or-act-legend-dot or-act-legend-dot--b" aria-hidden="true"></span>
                    <span class="or-act-legend-name">gpt-oss-120b</span>
                    <span class="or-act-legend-val">4</span>
                  </div>
                  <div class="or-act-legend-row">
                    <span class="or-act-legend-dot or-act-legend-dot--g" aria-hidden="true"></span>
                    <span class="or-act-legend-name">Mistral 7B Instruct v0.1</span>
                    <span class="or-act-legend-val">1</span>
                  </div>
                </div>
              </article>

              <article class="or-act-metric-card">
                <button type="button" class="or-icon-btn or-act-metric-expand" title="展开" aria-label="展开 Tokens">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </button>
                <div class="or-act-metric-lbl">Tokens</div>
                <div class="or-act-metric-val">5K</div>
                <div class="or-act-mini-chart" aria-hidden="true">
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 26%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 20%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 38%; background: linear-gradient(to top, var(--success-bright) 0 20%, var(--blue) 20% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 32%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 48%; background: linear-gradient(to top, var(--success-bright) 0 24%, var(--blue) 24% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 58%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 44%; background: linear-gradient(to top, var(--success-bright) 0 30%, var(--blue) 30% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 66%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 52%; background: linear-gradient(to top, var(--success-bright) 0 18%, var(--blue) 18% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 74%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 82%; background: linear-gradient(to top, var(--success-bright) 0 14%, var(--blue) 14% 100%); border-radius: 3px 3px 1px 1px"></div></div>
                  <div class="or-act-bar-col"><div style="width: 100%; max-width: 22px; height: 90%; background: var(--blue); border-radius: 3px 3px 1px 1px"></div></div>
                </div>
                <div class="or-act-legend">
                  <div class="or-act-legend-row">
                    <span class="or-act-legend-dot or-act-legend-dot--b" aria-hidden="true"></span>
                    <span class="or-act-legend-name">gpt-oss-120b</span>
                    <span class="or-act-legend-val">4.27K</span>
                  </div>
                  <div class="or-act-legend-row">
                    <span class="or-act-legend-dot or-act-legend-dot--g" aria-hidden="true"></span>
                    <span class="or-act-legend-name">Mistral 7B Instruct v0.1</span>
                    <span class="or-act-legend-val">627</span>
                  </div>
                </div>
              </article>
            </div>

            <div class="or-act-guardrails">
              <div class="or-act-guardrails-ico" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2>Set up Guardrails</h2>
                <p>
                  Protect your API usage with content filters, spending limits, and usage policies. Once configured, enforcement stats will appear here.
                </p>
                <a href="#" class="text-link">Configure guardrails →</a>
              </div>
            </div>
            <p class="or-footnote">接入后端后图表与图例将随真实用量更新。</p>
            <p class="or-credits-sales-foot">
              企业方案？
              <button type="button" class="or-contact-sales-inline-btn" data-or-open-contact-sales>Contact Sales</button>
            </p>
          </section>

          <section data-or-panel="logs" id="or-panel-logs" hidden>
            <nav class="or-crumb" aria-label="面包屑">
              <RouterLink :to="{ name: 'tai-home' }">Trinity AI</RouterLink>
              <span aria-hidden="true"> / </span>
              <span>用量</span>
            </nav>

            <header class="or-log-pagehead">
              <div class="or-log-title-row">
                <h1 class="or-page-title or-log-page-title">用量</h1>
                <div class="or-log-toolbar-end or-app-filter-row" style="overflow: visible">
                  <button type="button" class="or-icon-btn" title="刷新" aria-label="刷新列表">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M21 21v-5h-5" />
                    </svg>
                  </button>
                  <div class="or-app-filter-dd-wrap or-app-filter-dd-wrap--panel-end" id="or-log-time-wrap">
                    <button
                      type="button"
                      class="or-select or-select--app or-app-filter-dd-trigger or-log-time-trigger"
                      id="or-log-time-btn"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                      aria-controls="or-log-time-panel"
                      aria-label="时间范围"
                    >
                      <span id="or-log-time-dd-label" class="or-log-time-dd-label" data-dd-label>最近 1 天</span>
                      <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                    <div
                      class="or-app-filter-more-panel or-app-filter-pop-beak or-log-time-range-panel"
                      id="or-log-time-panel"
                      role="listbox"
                      hidden
                      aria-label="时间范围"
                      style="--or-pop-beak-r: 2rem"
                    >
                      <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="最近 15 分钟" tabindex="-1">
                        <span class="or-app-filter-dd-label or-log-time-opt-label">
                          <span class="or-log-time-chip" aria-hidden="true">15m</span>
                          <span>最近 15 分钟</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="最近 30 分钟" tabindex="-1">
                        <span class="or-app-filter-dd-label or-log-time-opt-label">
                          <span class="or-log-time-chip" aria-hidden="true">30m</span>
                          <span>最近 30 分钟</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="最近 1 小时" tabindex="-1">
                        <span class="or-app-filter-dd-label or-log-time-opt-label">
                          <span class="or-log-time-chip" aria-hidden="true">1h</span>
                          <span>最近 1 小时</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="最近 6 小时" tabindex="-1">
                        <span class="or-app-filter-dd-label or-log-time-opt-label">
                          <span class="or-log-time-chip" aria-hidden="true">6h</span>
                          <span>最近 6 小时</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item is-checked" role="option" data-dd-value="最近 1 天" tabindex="-1">
                        <span class="or-app-filter-dd-label or-log-time-opt-label">
                          <span class="or-log-time-chip" aria-hidden="true">1d</span>
                          <span>最近 1 天</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="最近 7 天" tabindex="-1">
                        <span class="or-app-filter-dd-label or-log-time-opt-label">
                          <span class="or-log-time-chip" aria-hidden="true">7d</span>
                          <span>最近 7 天</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item or-log-time-opt--full" role="option" data-dd-value="最近 30 天" tabindex="-1">
                        <span class="or-app-filter-dd-label or-log-time-opt-label">
                          <span class="or-log-time-chip" aria-hidden="true">30d</span>
                          <span>最近 30 天</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                  <div class="or-app-filter-dd-wrap or-app-filter-dd-wrap--panel-end" id="or-log-more-wrap">
                    <button
                      type="button"
                      class="or-select or-select--app or-app-filter-dd-trigger"
                      id="or-log-more-btn"
                      title="更多"
                      aria-label="更多选项"
                      aria-expanded="false"
                      aria-haspopup="menu"
                      aria-controls="or-log-more-panel"
                    >
                      <span data-dd-label>更多</span>
                      <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                    <div
                      class="or-app-filter-more-panel or-app-filter-pop-beak or-form2-menu-panel"
                      id="or-log-more-panel"
                      role="menu"
                      hidden
                      aria-label="更多选项"
                      style="--or-pop-beak-r: 1.75rem"
                    >
                      <button type="button" class="or-app-filter-dd-item" role="menuitem">
                        <span class="or-app-filter-dd-label or-form2-menu-item-label">
                          <span class="or-app-filter-menu-ic" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <path d="M15 3h6v6" />
                              <path d="M10 14 21 3" />
                            </svg>
                          </span>
                          <span>导出 CSV</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item" role="menuitem">
                        <span class="or-app-filter-dd-label or-form2-menu-item-label">
                          <span class="or-app-filter-menu-ic" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="3" width="7" height="7" rx="1" />
                              <rect x="14" y="3" width="7" height="7" rx="1" />
                              <rect x="14" y="14" width="7" height="7" rx="1" />
                              <rect x="3" y="14" width="7" height="7" rx="1" />
                            </svg>
                          </span>
                          <span>列显示</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                      <button type="button" class="or-app-filter-dd-item" disabled role="menuitem">
                        <span class="or-app-filter-dd-label or-form2-menu-item-label">
                          <span class="or-app-filter-menu-ic" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="3" />
                              <circle cx="12" cy="12" r="8" stroke-dasharray="2 4" />
                            </svg>
                          </span>
                          <span>高级筛选（即将推出）</span>
                        </span>
                        <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p class="or-lead or-log-lead">按次调用明细与用量柱状图；与 OpenRouter Logs · Generations 一致（仅生成记录，无任务 / 会话分组）。</p>
            </header>

            <div class="or-log-chart" aria-hidden="true">
              <div class="or-log-chart-y"><span>3</span><span>2</span><span>1</span><span>0</span></div>
              <div class="or-log-chart-bars">
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 18%"></div><span class="or-log-bar-lbl">4月9日</span></div>
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 8%"></div><span class="or-log-bar-lbl">4月13日</span></div>
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 22%"></div><span class="or-log-bar-lbl">4月17日</span></div>
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 12%"></div><span class="or-log-bar-lbl">4月21日</span></div>
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 35%"></div><span class="or-log-bar-lbl">4月25日</span></div>
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 15%"></div><span class="or-log-bar-lbl">4月29日</span></div>
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 28%"></div><span class="or-log-bar-lbl">5月3日</span></div>
                <div class="or-log-bar-wrap"><div class="or-log-bar" style="height: 88%"></div><span class="or-log-bar-lbl">5月7日</span></div>
              </div>
            </div>

            <div class="or-keys-toolbar or-log-toolbar-caption">
              <span class="or-log-toolbar-caption-txt">请求量按日聚合（示意）</span>
            </div>

            <div class="table-wrap or-logs-scroll">
              <table class="data-table or-logs or-logs-wide">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>模型</th>
                    <th>上游</th>
                    <th>
                      应用
                      <button type="button" class="or-log-th-info" title="标识调用来源的应用或集成" aria-label="应用列说明">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                        </svg>
                      </button>
                    </th>
                    <th>输入</th>
                    <th>输出</th>
                    <th class="or-log-col-cost">费用</th>
                    <th class="or-log-col-credits" title="按 Credits 扣减的示意值">Credits</th>
                    <th>速度</th>
                    <th>结束原因</th>
                    <th class="or-log-th-actions"><span class="visually-hidden">标记</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="or-mono-sm">5月8日 10:11</td>
                    <td>
                      <span class="or-model-cell">
                        <span class="or-model-ico" style="background: linear-gradient(135deg, var(--green-bright), var(--success))" aria-hidden="true"></span>
                        <span aria-hidden="true" style="color: var(--muted-2)">→</span>
                        <span class="or-model-ico" style="background: linear-gradient(135deg, var(--oauth-google), var(--oauth-google-hover))" aria-hidden="true"></span>
                        <span class="or-log-pill"><a href="#" class="text-link">gpt-oss-120b</a></span>
                      </span>
                    </td>
                    <td><span class="or-log-pill">Google Vertex</span></td>
                    <td><span class="or-log-pill"><RouterLink :to="{ name: 'tai-chat' }" class="text-link">Trinity AI: 对话</RouterLink></span></td>
                    <td>222 tok</td>
                    <td>74 tok</td>
                    <td class="or-mono-sm or-log-col-cost"><span class="or-log-cost"><span class="or-log-cost-amt">$ 0.0000466</span></span></td>
                    <td class="or-mono-sm or-log-col-credits">0.0023</td>
                    <td class="or-mono-sm">130.3 tok/s</td>
                    <td>stop</td>
                    <td>
                      <button type="button" class="or-icon-btn" title="标记 / 反馈" aria-label="标记此行">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="or-mono-sm">5月7日 18:42</td>
                    <td>
                      <span class="or-model-cell">
                        <span class="or-model-ico" style="background: linear-gradient(135deg, var(--orange), var(--orange-deep))" aria-hidden="true"></span>
                        <span aria-hidden="true" style="color: var(--muted-2)">→</span>
                        <span class="or-model-ico" style="background: linear-gradient(135deg, var(--warning), var(--warning))" aria-hidden="true"></span>
                        <span class="or-log-pill"><a href="#" class="text-link">Mistral 7B Instruct v0.1</a></span>
                      </span>
                    </td>
                    <td><span class="or-log-pill">Cloudflare</span></td>
                    <td><span class="or-log-pill"><RouterLink :to="{ name: 'tai-chat' }" class="text-link">Trinity AI: 对话</RouterLink></span></td>
                    <td>512 tok</td>
                    <td>196 tok</td>
                    <td class="or-mono-sm or-log-col-cost"><span class="or-log-cost"><span class="or-log-cost-amt">$ 0.0000182</span></span></td>
                    <td class="or-mono-sm or-log-col-credits">0.0009</td>
                    <td class="or-mono-sm">88.1 tok/s</td>
                    <td>stop</td>
                    <td>
                      <button type="button" class="or-icon-btn" title="标记 / 反馈" aria-label="标记此行">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="or-mono-sm">5月7日 09:05</td>
                    <td>
                      <span class="or-model-cell">
                        <span class="or-model-ico" style="background: linear-gradient(135deg, var(--indigo-400), var(--indigo-500))" aria-hidden="true"></span>
                        <span aria-hidden="true" style="color: var(--muted-2)">→</span>
                        <span class="or-model-ico" style="background: linear-gradient(135deg, var(--warning), var(--warning-ink))" aria-hidden="true"></span>
                        <span class="or-log-pill"><a href="#" class="text-link">anthropic/claude-3.5-sonnet</a></span>
                      </span>
                    </td>
                    <td><span class="or-log-pill">Amazon Bedrock</span></td>
                    <td><span class="or-log-pill"><a href="#" class="text-link">API: default-key</a></span></td>
                    <td>4,120 tok</td>
                    <td>890 tok</td>
                    <td class="or-mono-sm or-log-col-cost"><span class="or-log-cost"><span class="or-log-cost-amt">$ 0.0124</span></span></td>
                    <td class="or-mono-sm or-log-col-credits">1.24</td>
                    <td class="or-mono-sm">42.6 tok/s</td>
                    <td>stop</td>
                    <td>
                      <button type="button" class="or-icon-btn" title="标记 / 反馈" aria-label="标记此行">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="or-footnote">与 OpenRouter Logs（Generations）一致：时间、模型路由、上游、应用、Token、费用（美元）、Credits 扣减、速度、finish_reason；本页仅展示生成级明细。</p>
          </section>

          <section data-or-panel="preset" id="or-panel-preset" class="or-preset-page" hidden>
            <header class="or-preset-pagehead">
              <nav class="or-crumb" aria-label="面包屑">
                <RouterLink :to="{ name: 'tai-home' }">Trinity AI</RouterLink>
                <span aria-hidden="true"> / </span>
                <span>角色管理</span>
              </nav>
              <div class="or-preset-title-row">
                <h1 class="or-page-title or-preset-page-title">角色管理</h1>
                <div class="or-preset-title-actions">
                  <button type="button" class="btn btn-gradient or-preset-open-editor or-preset-btn-primary" data-preset-key="new">新建角色</button>
                  <button
                    type="button"
                    class="or-btn-outline or-preset-btn-secondary"
                    disabled
                    title="暂不支持"
                    aria-label="从当前对话创建（暂不支持）"
                  >
                    从当前对话创建（暂不支持）
                  </button>
                </div>
              </div>
              <div class="or-preset-lead-row">
                <p class="or-lead or-preset-lead">
                  为每个角色保存系统提示、默认模型与采样参数，便于 Playground 与 API 快速复用；技术字段仍为 <code>preset_id</code>，与 OpenRouter <strong>Presets</strong> 同类能力。
                </p>
                <details class="or-preset-info">
                  <summary class="or-preset-info-sum" aria-label="关于角色、preset_id 与 API 单次覆盖">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                    </svg>
                  </summary>
                  <div class="or-preset-info-panel" role="note">
                    <p style="margin: 0 0 0.5rem">
                      请求中携带 <code>preset_id</code> 即可套用该角色的系统提示与默认采样；可与对话页角色下拉、Playground 共用同一套配置。
                    </p>
                    <p style="margin: 0">
                      <strong>API：单次覆盖（不修改模板）</strong>：请求体携带 <code>preset_id</code>（或与 <code>@preset/…</code> 映射一致），同一请求内仍可传 <code>temperature</code> 等字段覆盖该角色的默认参数。
                    </p>
                  </div>
                </details>
              </div>
            </header>

            <p class="or-preset-list-hint or-preset-hint or-preset-hint--guide">
              上表为<strong>角色模板列表</strong>（演示数据）；点击某一行的「<strong>编辑</strong>」或顶部「<strong>新建角色</strong>」，在<strong>全屏弹窗</strong>中编辑同一条记录（宽版表单，与密钥「编辑」弹层同源结构）。
            </p>

            <div class="table-wrap or-preset-table-wrap">
              <table class="data-table or-preset-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>preset_id</th>
                    <th>默认模型</th>
                    <th>角色简介</th>
                    <th>更新</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="or-preset-name-cell">
                        <strong>中文技术写作</strong>
                        <div class="or-preset-badges or-preset-kind-row" aria-label="来源与默认">
                          <span class="or-preset-kind-self">自建</span><span class="or-preset-kind-dot">·</span><span class="or-preset-kind-default">默认</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="or-preset-id-row">
                        <code>preset_default_zh</code>
                        <button type="button" class="or-btn-outline" data-or-copy="preset_default_zh" style="padding: 0.2rem 0.45rem; font-size: 0.6875rem">复制</button>
                      </div>
                    </td>
                    <td><code>openai/gpt-4o</code></td>
                    <td style="max-width: 220px; color: var(--muted); font-size: 0.8125rem">中文优先的技术文档与说明，Markdown 结构清晰。</td>
                    <td class="or-mono-sm">2026-05-01</td>
                    <td>
                      <div class="or-preset-actions">
                        <button type="button" class="or-btn-outline or-preset-open-editor" data-preset-key="preset_default_zh">编辑</button>
                        <button type="button" class="or-btn-outline">选择默认</button>
                        <button type="button" class="or-btn-outline is-danger">删除</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="or-preset-name-cell">
                        <strong>代码审查 · 严格</strong>
                        <div class="or-preset-badges or-preset-kind-row" aria-label="来源">
                          <span class="or-preset-kind-self">自建</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="or-preset-id-row">
                        <code>preset_code_review</code>
                        <button type="button" class="or-btn-outline" data-or-copy="preset_code_review" style="padding: 0.2rem 0.45rem; font-size: 0.6875rem">复制</button>
                      </div>
                    </td>
                    <td><code>anthropic/claude-3.5-sonnet</code></td>
                    <td style="max-width: 220px; color: var(--muted); font-size: 0.8125rem">只做 PR 问题清单与补丁建议，不写空话夸奖。</td>
                    <td class="or-mono-sm">2026-04-20</td>
                    <td>
                      <div class="or-preset-actions">
                        <button type="button" class="or-btn-outline or-preset-open-editor" data-preset-key="preset_code_review">编辑</button>
                        <button type="button" class="or-btn-outline">选择默认</button>
                        <button type="button" class="or-btn-outline is-danger">删除</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="or-preset-name-cell">
                        <strong>客服 · 简短回复</strong>
                        <div class="or-preset-badges or-preset-kind-row">
                          <span class="or-preset-official" title="平台提供">官方</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="or-preset-id-row">
                        <code>preset_cs_short</code>
                        <button type="button" class="or-btn-outline" data-or-copy="preset_cs_short" style="padding: 0.2rem 0.45rem; font-size: 0.6875rem">复制</button>
                      </div>
                    </td>
                    <td><code>openai/gpt-4o-mini</code></td>
                    <td style="max-width: 220px; color: var(--muted); font-size: 0.8125rem">一线客服场景：语气友好、回复短、步骤可执行。</td>
                    <td class="or-mono-sm">2026-04-02</td>
                    <td>
                      <div class="or-preset-actions">
                        <button type="button" class="or-btn-outline or-preset-open-editor" data-preset-key="preset_cs_short">编辑</button>
                        <button type="button" class="or-btn-outline">选择默认</button>
                        <button type="button" class="or-btn-outline is-danger">删除</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="or-preset-list-hint or-preset-hint or-preset-hint--status" id="or-preset-editor-hint">
              尚未打开编辑弹窗：请在上表点击「<strong>编辑</strong>」或顶部「<strong>新建角色</strong>」。
            </p>

            <p class="or-footnote or-preset-pagefoot or-preset-pagefoot--modal-note">
              列表选行后通过<strong>大屏弹窗</strong>编辑；「<strong>取消</strong>」、右上角关闭或按 Esc 关闭弹窗。接入后端后保存即生成/更新 <code>preset_id</code>，并与对话页角色下拉同步。
            </p>
          </section>
        </div>
      </div>

      <!-- Purchase Credits · MVP 充值弹窗（PRD 方案 A · Stripe 原型占位） -->
      <div id="or-pay-credits-shell" class="or-modal-root or-pay-credits-modal" hidden aria-hidden="true" role="presentation">
        <div class="or-modal-backdrop" id="or-pay-credits-backdrop" tabindex="-1" aria-hidden="true"></div>
        <div
          class="or-modal-card or-pay-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="or-pay-credits-title"
        >
          <header>
            <div class="or-modal-head">
              <h2 id="or-pay-credits-title" class="or-modal-title">Purchase Credits</h2>
              <button type="button" class="or-modal-close" id="or-pay-credits-dismiss" aria-label="关闭">&times;</button>
            </div>
          </header>

          <div class="or-pay-modal-body">
            <div class="or-pay-summary or-pay-summary--compact">
              <div class="or-pay-amount-field">
                <label for="or-pay-amount-input">Amount (USD Credits)</label>
                <div class="or-pay-amount-input-wrap">
                  <span class="or-pay-currency" aria-hidden="true">$</span>
                  <input
                    id="or-pay-amount-input"
                    class="or-pay-amount-input"
                    type="number"
                    inputmode="decimal"
                    min="10"
                    step="0.01"
                    value="10"
                    aria-describedby="or-pay-min-hint or-pay-amount-error"
                  />
                </div>
                <p id="or-pay-min-hint" class="or-footnote" style="margin: 0.35rem 0 0">最低 $10 · 充多少到账多少</p>
                <p id="or-pay-amount-error" class="or-pay-amount-error" hidden role="alert"></p>
                <div class="or-pay-presets" role="group" aria-label="Quick amounts">
                  <button type="button" class="or-pay-preset is-active" data-or-pay-preset="10">$10</button>
                  <button type="button" class="or-pay-preset" data-or-pay-preset="25">$25</button>
                  <button type="button" class="or-pay-preset" data-or-pay-preset="50">$50</button>
                  <button type="button" class="or-pay-preset" data-or-pay-preset="100">$100</button>
                </div>
              </div>
              <div class="or-pay-summary-row is-total">
                <span class="or-pay-summary-lbl">Total due</span>
                <span class="or-pay-summary-val" id="or-pay-total-due">$10.00</span>
              </div>
            </div>

            <div class="or-pay-tabs" role="tablist" aria-label="Payment method">
              <button type="button" class="or-pay-tab is-selected" role="tab" aria-selected="true" data-or-pay-method="card">
                <span class="or-pay-tab-ico" aria-hidden="true">💳</span>
                <span class="or-pay-tab-lbl">银行卡</span>
              </button>
              <button type="button" class="or-pay-tab" role="tab" aria-selected="false" data-or-pay-method="wechat">
                <span class="or-pay-tab-ico or-pay-tab-ico--wechat" aria-hidden="true">微</span>
                <span class="or-pay-tab-lbl">微信支付</span>
              </button>
              <button type="button" class="or-pay-tab" role="tab" aria-selected="false" data-or-pay-method="enterprise">
                <span class="or-pay-tab-ico" aria-hidden="true">🏦</span>
                <span class="or-pay-tab-lbl">企业</span>
              </button>
              <button type="button" class="or-pay-tab" role="tab" aria-selected="false" data-or-pay-method="alipay">
                <span class="or-pay-tab-ico or-pay-tab-ico--alipay" aria-hidden="true">支</span>
                <span class="or-pay-tab-lbl">支付宝</span>
              </button>
            </div>

            <div id="or-pay-panel-card" class="or-pay-panel" role="tabpanel">
              <div class="or-pay-card-form" aria-label="Stripe Payment Element placeholder">
                <label class="or-pay-field">
                  <span class="or-pay-field-lbl">卡号</span>
                  <input type="text" placeholder="1234 1234 1234 1234" autocomplete="cc-number" />
                </label>
                <div class="or-pay-field-row">
                  <label class="or-pay-field">
                    <span class="or-pay-field-lbl">有效期</span>
                    <input type="text" placeholder="月 / 年" autocomplete="cc-exp" />
                  </label>
                  <label class="or-pay-field">
                    <span class="or-pay-field-lbl">安全码</span>
                    <input type="text" placeholder="CVC" autocomplete="cc-csc" />
                  </label>
                </div>
                <label class="or-pay-field">
                  <span class="or-pay-field-lbl">国家 / 地区</span>
                  <select>
                    <option>中国香港特别行政区</option>
                    <option>美国</option>
                    <option>新加坡</option>
                    <option>其他</option>
                  </select>
                </label>
              </div>
            </div>

            <div id="or-pay-panel-scan" class="or-pay-panel" hidden role="tabpanel">
              <div class="or-pay-scan-hint">
                <span class="or-pay-scan-hint-ico" aria-hidden="true">📱</span>
                <p id="or-pay-scan-hint-text">点击 Purchase 后将弹出二维码，请使用所选 App 扫码完成支付。</p>
              </div>
            </div>

            <div id="or-pay-panel-enterprise" class="or-pay-panel" hidden role="tabpanel">
              <div class="or-pay-enterprise-panel">
                <p>企业大额预存、Wire 对公、月结合同与定制折扣<strong>不提供自助充值</strong>，请通过销售团队办理。</p>
                <button type="button" class="or-btn-outline or-pay-enterprise-btn" id="or-pay-contact-sales-link">
                  Contact Sales
                </button>
              </div>
            </div>

            <p id="or-pay-status" class="or-pay-status" hidden role="status" aria-live="polite"></p>
          </div>

          <footer class="or-pay-modal-foot">
            <button type="button" class="btn btn-gradient or-pay-purchase-full" id="or-pay-credits-purchase">Purchase</button>
            <p class="or-pay-account or-pay-account--foot">
              Personal account: <strong>user@example.com</strong>
            </p>
          </footer>
        </div>

        <!-- 微信 / 支付宝 · 二维码二级弹窗（缩短主弹窗） -->
        <div id="or-pay-qr-shell" class="or-pay-qr-layer" hidden aria-hidden="true">
          <div class="or-pay-qr-card" role="dialog" aria-modal="true" aria-labelledby="or-pay-qr-title">
            <div class="or-modal-head or-pay-qr-head">
              <h3 id="or-pay-qr-title" class="or-modal-title">微信支付</h3>
              <button type="button" class="or-modal-close" id="or-pay-qr-dismiss" aria-label="关闭">&times;</button>
            </div>
            <p class="or-pay-qr-amount" id="or-pay-qr-amount">$10.00</p>
            <div class="or-pay-qr-box" aria-hidden="true"></div>
            <p class="or-pay-qr-tip" id="or-pay-qr-tip">请使用微信扫描二维码完成支付</p>
            <p class="or-pay-qr-sub">原型占位 · 接入 Stripe 后展示真实二维码</p>
            <button type="button" class="btn btn-gradient or-pay-qr-done" id="or-pay-qr-done">我已完成支付</button>
          </div>
        </div>
      </div>

      <!-- Contact Sales · 企业咨询弹窗（无自助对公 Tab） -->
      <div id="or-contact-sales-shell" class="or-modal-root or-contact-sales-modal" hidden aria-hidden="true" role="presentation">
        <div class="or-modal-backdrop" id="or-contact-sales-backdrop" tabindex="-1" aria-hidden="true"></div>
        <div
          class="or-modal-card or-pay-modal-card or-contact-sales-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="or-contact-sales-title"
        >
          <header>
            <div class="or-modal-head">
              <h2 id="or-contact-sales-title" class="or-modal-title">Contact Sales</h2>
              <button type="button" class="or-modal-close" id="or-contact-sales-dismiss" aria-label="关闭">&times;</button>
            </div>
          </header>

          <div class="or-pay-modal-body">
            <p class="or-contact-sales-lead">
              企业大额预存、对公 Wire、月结合同与定制阶梯价请通过销售团队办理。控制台<strong>无</strong>自助对公充值入口。
            </p>

            <form id="or-contact-sales-form" class="or-contact-sales-form" novalidate>
              <div class="form-group">
                <label for="or-sales-company">公司名称 <span aria-hidden="true">*</span></label>
                <input id="or-sales-company" type="text" required autocomplete="organization" placeholder="Acme Inc." />
              </div>
              <div class="form-group">
                <label for="or-sales-email">工作邮箱 <span aria-hidden="true">*</span></label>
                <input id="or-sales-email" type="email" required autocomplete="email" placeholder="you@company.com" value="user@example.com" />
              </div>
              <div class="form-group">
                <label for="or-sales-spend">预估月消耗（USD，可选）</label>
                <input id="or-sales-spend" type="text" inputmode="decimal" placeholder="例如 $5,000 / month" />
              </div>
              <div class="form-group">
                <label for="or-sales-needs">需求说明（可选）</label>
                <textarea
                  id="or-sales-needs"
                  rows="4"
                  placeholder="对公汇款、PO、Net30、私有化 SDK、专属折扣…"
                ></textarea>
              </div>
            </form>

            <p id="or-contact-sales-status" class="or-contact-sales-status" hidden role="status" aria-live="polite"></p>
          </div>

          <footer class="or-keys-editor-actions">
            <button type="button" class="or-btn-outline" id="or-contact-sales-cancel">Cancel</button>
            <button type="button" class="btn btn-gradient" id="or-contact-sales-submit">Submit inquiry</button>
          </footer>
        </div>
      </div>

      <div id="or-preset-editor-shell" class="or-modal-root or-preset-editor-modal" hidden aria-hidden="true" role="presentation">
        <div class="or-modal-backdrop" id="or-preset-editor-backdrop" tabindex="-1" aria-hidden="true"></div>
        <div
          class="or-modal-card or-keys-editor-modal-card or-preset-editor-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="or-preset-modal-title"
        >
          <header>
            <div class="or-modal-head or-keys-editor-modal-head">
              <h2 id="or-preset-modal-title" class="or-modal-title">编辑角色</h2>
              <button type="button" class="or-modal-close" id="or-preset-modal-dismiss" aria-label="关闭">&times;</button>
            </div>
          </header>
          <p class="or-keys-editor-banner or-preset-editing-banner" id="or-preset-editing-banner" role="status" aria-live="polite"></p>
          <div class="or-preset-editor-modal-body">
            <div class="or-preset-editor" id="or-preset-editor">
              <div class="or-preset-detail-head">
                <div class="or-preset-detail-head-left">
                  <input
                    id="or-preset-title-input"
                    class="or-preset-title-input"
                    type="text"
                    value=""
                    aria-label="角色名称"
                    placeholder="给角色起个名字"
                    autocomplete="off"
                  />
                  <span class="badge ok">已启用</span>
                </div>
                <div class="or-preset-detail-head-right">
                  <RouterLink :to="{ name: 'tai-chat' }" class="or-btn-outline" style="text-decoration: none">在对话中测试</RouterLink>
                </div>
              </div>

              <div class="or-preset-detail-grid or-preset-detail-grid--full">
                <div class="or-preset-detail-center">
                  <div id="or-preset-panel-config">
                    <div class="or-preset-block">
                      <h3>模型</h3>
                      <p class="or-preset-muted" style="margin-bottom: 0.65rem">当前绑定的主模型与备用模型（故障时按策略降级）。</p>
                      <div class="or-preset-model-bind-row">
                        <div class="or-preset-model-tags">
                          <span id="or-preset-model-tag-a" class="or-preset-model-tag">—</span>
                          <span id="or-preset-model-tag-b" class="or-preset-model-tag or-preset-model-tag--sec" hidden>—</span>
                        </div>
                        <div class="or-preset-model-dd-group">
                          <label class="or-preset-model-inline-lbl" for="or-preset-model-primary-dd-btn">主模型</label>
                          <div class="or-app-filter-dd-wrap" id="or-preset-model-primary-dd-wrap">
                            <button
                              type="button"
                              class="or-select or-select--app or-app-filter-dd-trigger"
                              id="or-preset-model-primary-dd-btn"
                              aria-expanded="false"
                              aria-haspopup="listbox"
                              aria-controls="or-preset-model-primary-dd-panel"
                            >
                              <span id="or-preset-model-primary-dd-label" data-dd-label>openai/gpt-4o</span>
                              <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                                <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                              </svg>
                            </button>
                            <div
                              class="or-app-filter-more-panel or-app-filter-pop-beak"
                              id="or-preset-model-primary-dd-panel"
                              role="listbox"
                              hidden
                              aria-label="主模型"
                              style="--or-pop-beak-x: 1.35rem"
                            >
                              <button type="button" class="or-app-filter-dd-item is-checked" role="option" data-dd-value="openai/gpt-4o" tabindex="-1">
                                <span class="or-app-filter-dd-label">openai/gpt-4o</span>
                                <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                              </button>
                              <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="anthropic/claude-3.5-sonnet" tabindex="-1">
                                <span class="or-app-filter-dd-label">anthropic/claude-3.5-sonnet</span>
                                <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                              </button>
                              <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="openai/gpt-4o-mini" tabindex="-1">
                                <span class="or-app-filter-dd-label">openai/gpt-4o-mini</span>
                                <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div class="or-preset-model-dd-group">
                          <label class="or-preset-model-inline-lbl" for="or-preset-model-fallback-dd-btn">备用模型</label>
                          <div class="or-app-filter-dd-wrap" id="or-preset-model-fallback-dd-wrap">
                            <button
                              type="button"
                              class="or-select or-select--app or-app-filter-dd-trigger"
                              id="or-preset-model-fallback-dd-btn"
                              aria-expanded="false"
                              aria-haspopup="listbox"
                              aria-controls="or-preset-model-fallback-dd-panel"
                            >
                              <span id="or-preset-model-fallback-dd-label" data-dd-label>无</span>
                              <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                                <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                              </svg>
                            </button>
                            <div
                              class="or-app-filter-more-panel or-app-filter-pop-beak"
                              id="or-preset-model-fallback-dd-panel"
                              role="listbox"
                              hidden
                              aria-label="备用模型"
                              style="--or-pop-beak-x: 1.35rem"
                            >
                              <button type="button" class="or-app-filter-dd-item is-checked" role="option" data-dd-value="" tabindex="-1">
                                <span class="or-app-filter-dd-label">无</span>
                                <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                              </button>
                              <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="anthropic/claude-3.5-sonnet" tabindex="-1">
                                <span class="or-app-filter-dd-label">anthropic/claude-3.5-sonnet</span>
                                <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                              </button>
                              <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="openai/gpt-4o-mini" tabindex="-1">
                                <span class="or-app-filter-dd-label">openai/gpt-4o-mini</span>
                                <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                              </button>
                              <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="openai/gpt-4o" tabindex="-1">
                                <span class="or-app-filter-dd-label">openai/gpt-4o</span>
                                <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="or-preset-block">
                      <h3>角色简介</h3>
                      <p class="or-preset-muted" style="margin-bottom: 0.5rem">
                        一句话概括角色用途与风格（可选）。用于列表与说明展示；<strong>不会</strong>作为模型的系统提示词发送。
                      </p>
                      <div class="form-group" style="margin-bottom: 0">
                        <label for="or-preset-intro">简介</label>
                        <textarea
                          id="or-preset-intro"
                          rows="3"
                          maxlength="2000"
                          placeholder="例如：面向一线客服的简短、友好回复风格…"
                        ></textarea>
                      </div>
                    </div>

                    <div class="or-preset-block">
                      <div class="or-preset-sys-head">
                        <h3>系统提示词</h3>
                        <span class="or-preset-ai-assistant-pill">AI 助手</span>
                      </div>
                      <p class="or-preset-muted" style="margin-bottom: 0.5rem">AI 的系统指令，定义角色的行为与回答风格。</p>
                      <div class="form-group" style="margin-bottom: 0">
                        <label class="visually-hidden" for="or-preset-system">系统提示词</label>
                        <textarea id="or-preset-system" placeholder="设定角色的行为和风格，例如：你是一个专业的翻译助手…"></textarea>
                      </div>
                    </div>

                    <div class="or-preset-block">
                      <h3>提供商偏好</h3>
                      <p class="or-preset-muted">
                        未在该角色内配置厂商路由偏好时，使用<strong>账户默认路由</strong>。若已关联降级策略，则与策略中心下发的白名单/顺序合并生效。
                      </p>
                      <div class="form-group" style="margin-bottom: 0">
                        <label for="or-preset-policy">关联故障降级策略 ID</label>
                        <input id="or-preset-policy" type="text" value="policy_failover_std" autocomplete="off" />
                      </div>
                    </div>

                    <div class="or-preset-block">
                      <h3>参数</h3>
                      <p class="or-preset-muted" style="margin-bottom: 0.75rem">常用推理参数；更多项可折叠。</p>
                      <div class="or-preset-grid-3">
                        <div class="form-group">
                          <label for="or-preset-temp">温度（Temperature）</label>
                          <input id="or-preset-temp" type="number" step="0.01" min="0" max="2" value="0.2" />
                        </div>
                        <div class="form-group">
                          <label for="or-preset-max">最大 Token 数</label>
                          <input id="or-preset-max" type="number" min="1" value="2048" />
                        </div>
                        <div class="form-group">
                          <label for="or-preset-topp">Top P</label>
                          <input id="or-preset-topp" type="number" step="0.01" min="0" max="1" value="0.9" />
                        </div>
                      </div>
                      <details class="or-preset-more">
                        <summary>更多参数</summary>
                        <div class="or-preset-grid-3" style="margin-top: 0.5rem">
                          <div class="form-group">
                            <label for="or-preset-topk">Top K</label>
                            <input id="or-preset-topk" type="number" min="1" value="40" />
                          </div>
                          <div class="form-group">
                            <label for="or-preset-freq">频率惩罚</label>
                            <input id="or-preset-freq" type="number" step="0.01" value="0" />
                          </div>
                          <div class="form-group">
                            <label for="or-preset-pres">存在惩罚</label>
                            <input id="or-preset-pres" type="number" step="0.01" value="0" />
                          </div>
                        </div>
                      </details>
                    </div>

                    <fieldset class="or-preset-fieldset" style="margin-bottom: 0.75rem">
                      <legend>基础信息（对内）</legend>
                      <div class="or-preset-grid-2">
                        <div class="form-group">
                          <label for="or-preset-slug">Slug（只读）</label>
                          <input id="or-preset-slug" type="text" value="taobao-cs-assistant" readonly style="opacity: 0.9" />
                        </div>
                        <div class="form-group">
                          <label for="or-preset-desc">说明</label>
                          <input id="or-preset-desc" type="text" value="淘宝售前 / 售后话术约束" />
                        </div>
                      </div>
                    </fieldset>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer class="or-keys-editor-actions or-preset-editor-actions">
            <button type="button" class="or-btn-outline" id="or-preset-btn-close" aria-label="取消">取消</button>
            <button type="button" class="btn btn-gradient" id="or-preset-btn-save" aria-label="保存">保存</button>
          </footer>
        </div>
      </div>

      <div id="or-keys-editor-shell" class="or-modal-root or-keys-editor-modal" hidden aria-hidden="true">
        <div class="or-modal-backdrop" id="or-keys-editor-backdrop" tabindex="-1" aria-hidden="true"></div>
        <div
          class="or-modal-card or-keys-editor-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="or-keys-editor-title"
        >
          <header>
            <div class="or-modal-head or-keys-editor-modal-head">
              <h2 id="or-keys-editor-title" class="or-modal-title">编辑密钥</h2>
              <button type="button" class="or-modal-close" id="or-keys-edit-dismiss" aria-label="关闭">&times;</button>
            </div>
          </header>
          <p class="or-keys-editor-banner" id="or-keys-editor-banner" role="status" aria-live="polite">
            仅可修改<strong>名称、额度、周期、过期与备注</strong>。<strong>完整密钥</strong>在创建后<strong>不可再次查看</strong>，亦<strong>不可</strong>在本页编辑；需更换请<strong>轮换密钥</strong>或新建。
          </p>
          <div class="or-keys-editor-grid">
            <div class="form-group">
              <label for="or-keys-edit-name">名称</label>
              <input id="or-keys-edit-name" type="text" autocomplete="off" />
            </div>
            <div class="form-group">
              <span class="or-keys-editor-field-lbl">密钥</span>
              <p class="or-keys-editor-readonly-desc">以下为脱敏前缀，仅供辨认；无法还原或修改密钥串。</p>
              <code id="or-keys-edit-key-mask" class="or-keys-mask or-keys-editor-key-mask" aria-live="polite"></code>
            </div>
            <div class="form-group">
              <label for="or-keys-edit-limit">额度上限</label>
              <input id="or-keys-edit-limit" type="text" inputmode="decimal" autocomplete="off" placeholder="例如 $1.00 或 100 USD" />
            </div>
            <div class="form-group">
              <label for="or-keys-edit-reset-dd-btn">重置周期</label>
              <div class="or-app-filter-dd-wrap" id="or-keys-edit-reset-dd-wrap">
                <button
                  type="button"
                  class="or-select or-select--app or-app-filter-dd-trigger"
                  id="or-keys-edit-reset-dd-btn"
                  aria-expanded="false"
                  aria-haspopup="listbox"
                  aria-controls="or-keys-edit-reset-dd-panel"
                >
                  <span id="or-keys-edit-reset-dd-label" data-dd-label>不适用</span>
                  <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <div
                  class="or-app-filter-more-panel or-app-filter-pop-beak"
                  id="or-keys-edit-reset-dd-panel"
                  role="listbox"
                  hidden
                  aria-label="重置周期"
                  style="--or-pop-beak-x: 1.35rem"
                >
                  <button type="button" class="or-app-filter-dd-item is-checked" role="option" data-dd-value="不适用" tabindex="-1">
                    <span class="or-app-filter-dd-label">不适用</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                  </button>
                  <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="按日" tabindex="-1">
                    <span class="or-app-filter-dd-label">按日</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                  <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="按周" tabindex="-1">
                    <span class="or-app-filter-dd-label">按周</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                  <button type="button" class="or-app-filter-dd-item" role="option" data-dd-value="按月" tabindex="-1">
                    <span class="or-app-filter-dd-label">按月</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="or-keys-edit-expiry-dd-btn">过期</label>
              <div class="or-app-filter-dd-wrap" id="or-keys-edit-expiry-dd-wrap">
                <button
                  type="button"
                  class="or-select or-select--app or-app-filter-dd-trigger"
                  id="or-keys-edit-expiry-dd-btn"
                  aria-expanded="false"
                  aria-haspopup="listbox"
                  aria-controls="or-keys-edit-expiry-dd-panel"
                >
                  <span id="or-keys-edit-expiry-dd-label" data-dd-label>永不过期</span>
                  <svg class="or-app-filter-dd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <div
                  class="or-app-filter-more-panel or-app-filter-pop-beak"
                  id="or-keys-edit-expiry-dd-panel"
                  role="listbox"
                  hidden
                  aria-label="过期方式"
                  style="--or-pop-beak-x: 1.35rem"
                >
                  <button
                    type="button"
                    class="or-app-filter-dd-item is-checked"
                    role="option"
                    data-or-keys-expiry-mode="never"
                    tabindex="-1"
                  >
                    <span class="or-app-filter-dd-label">永不过期</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true">✓</span>
                  </button>
                  <button type="button" class="or-app-filter-dd-item" role="option" data-or-keys-expiry-mode="date" tabindex="-1">
                    <span class="or-app-filter-dd-label">指定日期</span>
                    <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                  </button>
                </div>
              </div>
            </div>
            <div class="form-group" id="or-keys-edit-expiry-date-wrap" hidden>
              <label for="or-keys-edit-expiry-date">过期日期</label>
              <input id="or-keys-edit-expiry-date" type="date" />
            </div>
            <div class="form-group">
              <label for="or-keys-edit-created">创建时间</label>
              <input id="or-keys-edit-created" type="text" readonly class="or-keys-editor-readonly-input" aria-readonly="true" />
            </div>
            <div class="form-group or-keys-editor-span">
              <label for="or-keys-edit-note">备注（可选）</label>
              <textarea id="or-keys-edit-note" rows="3" maxlength="500" placeholder="团队内可见的说明，不会随请求发送。"></textarea>
            </div>
          </div>
          <footer class="or-keys-editor-actions">
            <button type="button" class="or-btn-outline" id="or-keys-edit-cancel">取消</button>
            <button type="button" class="btn btn-gradient" id="or-keys-edit-save">保存更改</button>
          </footer>
        </div>
      </div>
  </main>
</template>
