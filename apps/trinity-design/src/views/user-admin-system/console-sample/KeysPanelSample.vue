<script setup lang="ts">
/** API 密钥区打样 · 与 ConsolePage `#keys` 面板 DOM 对齐 */
import { onMounted } from "vue";

onMounted(async () => {
  await import("@repo/assets/adm-form2-dd.js");
});
</script>

<template>
  <section data-or-panel="keys" id="or-panel-keys">
    <nav class="or-crumb" aria-label="面包屑">
      <a href="/trinity-ai">Trinity AI</a>
      <span aria-hidden="true"> / </span>
      <span>API 密钥</span>
    </nav>

    <header class="or-keys-pagehead">
      <div class="or-keys-title-row">
        <h1 class="or-page-title or-keys-page-title">API 密钥</h1>
        <div class="or-keys-title-actions">
          <div class="or-keys-expiry-filter" role="toolbar" aria-label="按到期状态筛选">
            <div class="or-app-filter-dd-wrap" id="or-keys-expiry-dd-wrap-sample">
              <button
                type="button"
                class="or-select or-select--app or-app-filter-dd-trigger"
                id="or-keys-expiry-dd-btn-sample"
                aria-expanded="false"
                aria-haspopup="listbox"
                aria-controls="or-keys-expiry-dd-panel-sample"
              >
                <span id="or-keys-expiry-dd-label-sample" data-dd-label>全部</span>
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
                id="or-keys-expiry-dd-panel-sample"
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
                <button
                  type="button"
                  class="or-app-filter-dd-item"
                  role="option"
                  data-dd-value="过期"
                  data-or-expiry-filter="expired"
                  tabindex="-1"
                >
                  <span class="or-app-filter-dd-label">过期</span>
                  <span class="or-app-filter-dd-mark" aria-hidden="true"></span>
                </button>
                <button
                  type="button"
                  class="or-app-filter-dd-item"
                  role="option"
                  data-dd-value="不过期"
                  data-or-expiry-filter="not-expired"
                  tabindex="-1"
                >
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
        <svg
          class="or-keys-search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          class="or-input or-keys-search-input"
          placeholder="按名称搜索…"
          autocomplete="off"
          aria-label="按名称搜索密钥"
        />
      </label>
    </div>

    <div class="table-wrap or-keys-table-wrap">
      <table class="data-table or-keys-table">
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
                <button type="button" class="or-keys-ops-trigger" title="操作" aria-label="行操作菜单">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="1.75" />
                    <circle cx="12" cy="12" r="1.75" />
                    <circle cx="12" cy="19" r="1.75" />
                  </svg>
                </button>
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
                <button type="button" class="or-keys-ops-trigger" title="操作" aria-label="行操作菜单">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="1.75" />
                    <circle cx="12" cy="12" r="1.75" />
                    <circle cx="12" cy="19" r="1.75" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="or-keys-summary" aria-live="polite">2 个密钥</p>
  </section>
</template>
