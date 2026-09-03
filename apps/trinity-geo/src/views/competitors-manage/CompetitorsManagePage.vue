<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  MARKET_FILTER_OPTIONS,
  QUOTA_MAX,
  QUOTA_PLAN,
  STATUS_FILTER_OPTIONS,
  marketLabel,
} from "./mock";
import { useCompetitorsManageInteractions } from "./competitorsManageInteractions";
import "./competitors-manage.css";

const {
  aiSuggestions,
  search,
  marketFilter,
  statusFilter,
  manualAddCollapsed,
  showAiPanel,
  addName,
  addMarket,
  addAlias,
  aliasInputs,
  recalcStatus,
  recalcBtnDisabled,
  toast,
  toastVisible,
  activeCount,
  pausedCount,
  aliasTotal,
  marketCounts,
  quotaPercent,
  listMeta,
  filteredCompetitors,
  resultCountLabel,
  isEmpty,
  setMarketFilter,
  setStatusFilter,
  toggleManualAdd,
  toggleAiPanel,
  closeAiPanel,
  toggleExpand,
  togglePause,
  removeCompetitor,
  addAliasToRow,
  removeAliasFromRow,
  submitManualAdd,
  applyAiSuggestions,
  saveCompetitors,
  triggerRecalc,
  previewFor,
} = useCompetitorsManageInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="竞品子导航">
        <p class="geo-settings-sidebar-title">竞品</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-competitors' }">竞品概览</RouterLink>
          <RouterLink :to="{ name: 'geo-competitors-manage' }" class="is-active" aria-current="page">
            竞品管理
          </RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-comp-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">① 策略规划</p>
            <div class="geo-page-title-row">
              <h1>竞品管理</h1>
            </div>
            <p class="geo-comp-lead">
              维护对比侧实体与<strong>竞品别名</strong>（<code>entity_type=competitor</code>）·
              与品牌共用别名库 · 同题 SOA 读
              <RouterLink :to="{ name: 'geo-competitors' }">竞品概览</RouterLink>
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-competitors' }" class="geo-btn ghost">竞品概览</RouterLink>
            <button type="button" class="geo-btn ghost" @click="toggleAiPanel">AI 推荐竞品</button>
            <button type="button" class="geo-btn primary" @click="saveCompetitors">保存更改</button>
          </div>
        </div>

        <div class="geo-kw-quota" aria-label="竞品套餐用量">
          <div class="geo-kw-quota-head">
            <span>监测竞品 <strong>{{ activeCount }}</strong> / {{ QUOTA_MAX }}（{{ QUOTA_PLAN }}）</span>
            <span class="geo-muted">
              共 {{ aliasTotal }} 个别名 · {{ pausedCount }} 家已暂停
            </span>
          </div>
          <div
            class="geo-kw-quota-bar"
            role="progressbar"
            :aria-valuenow="activeCount"
            aria-valuemin="0"
            :aria-valuemax="QUOTA_MAX"
          >
            <span :style="{ width: `${quotaPercent}%` }" />
          </div>
        </div>

        <div class="geo-comp-market-summary" aria-label="市场分布">
          <button
            type="button"
            class="dash-strategy-tag"
            :class="{ on: marketFilter === 'all' }"
            @click="setMarketFilter('all')"
          >
            全部 <strong>{{ marketCounts.all }}</strong>
          </button>
          <button
            type="button"
            class="dash-strategy-tag"
            :class="{ on: marketFilter === 'overseas' }"
            @click="setMarketFilter('overseas')"
          >
            海外 <strong>{{ marketCounts.overseas }}</strong>
          </button>
          <button
            type="button"
            class="dash-strategy-tag"
            :class="{ on: marketFilter === 'domestic' }"
            @click="setMarketFilter('domestic')"
          >
            国内 <strong>{{ marketCounts.domestic }}</strong>
          </button>
          <button
            type="button"
            class="dash-strategy-tag"
            :class="{ on: marketFilter === 'both' }"
            @click="setMarketFilter('both')"
          >
            双市场 <strong>{{ marketCounts.both }}</strong>
          </button>
        </div>

        <section class="geo-kw-list-section" aria-labelledby="comp-list-heading">
          <header class="geo-kw-list-head">
            <div>
              <h2 id="comp-list-heading">竞品库</h2>
              <p class="geo-kw-list-desc">
                点击 ▸ 展开编辑别名 · 暂停后不参与同题 SOA 对比 ·
                <span>{{ listMeta }}</span>
              </p>
            </div>
            <button
              type="button"
              class="geo-btn ghost sm"
              :aria-expanded="!manualAddCollapsed"
              aria-controls="comp-manual-add"
              @click="toggleManualAdd"
            >
              {{ manualAddCollapsed ? "展开添加表单" : "收起添加表单" }}
            </button>
          </header>

          <section
            id="comp-manual-add"
            class="geo-kw-manual-add"
            :class="{ 'is-collapsed': manualAddCollapsed }"
            aria-labelledby="comp-manual-heading"
          >
            <div class="geo-kw-manual-head">
              <h3 id="comp-manual-heading">手动添加竞品</h3>
              <span class="geo-kw-manual-tag">主路径 · 保存后写入别名库</span>
            </div>
            <p class="geo-kw-manual-desc">
              填写竞品主名称与至少 1 个别名写法；entity_id 由系统生成 slug。
            </p>
            <div class="geo-comp-manual-form">
              <label class="geo-form-field">
                <span class="geo-kw-manual-label">竞品主名称</span>
                <input v-model="addName" type="text" placeholder="例如 OpenRouter" />
              </label>
              <label class="geo-form-field">
                <span class="geo-kw-manual-label">市场</span>
                <select v-model="addMarket" aria-label="市场">
                  <option value="overseas">海外</option>
                  <option value="domestic">国内</option>
                  <option value="both">双市场</option>
                </select>
              </label>
              <label class="geo-form-field">
                <span class="geo-kw-manual-label">首个别名</span>
                <input v-model="addAlias" type="text" placeholder="openrouter.ai" />
              </label>
              <div class="geo-kw-manual-actions">
                <button type="button" class="geo-btn primary" @click="submitManualAdd">添加竞品</button>
              </div>
            </div>
          </section>

          <section
            v-show="showAiPanel"
            class="geo-kw-ai-panel"
            aria-labelledby="comp-ai-heading"
          >
            <div class="geo-kw-manual-head">
              <h3 id="comp-ai-heading">AI 推荐竞品（基于行业与问题集）</h3>
              <span class="geo-badge muted">辅助 · 须确认</span>
            </div>
            <ul class="geo-kw-ai-list">
              <li v-for="item in aiSuggestions" :key="item.id">
                <label>
                  <input v-model="item.checked" type="checkbox" />
                  {{ item.name }} · {{ marketLabel(item.market).text }}
                </label>
              </li>
            </ul>
            <div class="geo-kw-add-actions">
              <button type="button" class="geo-btn ghost" @click="closeAiPanel">收起</button>
              <button type="button" class="geo-btn primary" @click="applyAiSuggestions">
                加入已选竞品
              </button>
            </div>
          </section>

          <div class="geo-kw-toolbar geo-comp-toolbar">
            <div class="geo-kw-search">
              <input
                v-model="search"
                type="search"
                placeholder="搜索名称、ID 或别名…"
                aria-label="搜索竞品"
              />
            </div>
            <div class="geo-kw-filters geo-comp-market-filters" role="tablist" aria-label="市场筛选">
              <button
                v-for="opt in MARKET_FILTER_OPTIONS"
                :key="opt.value"
                type="button"
                :class="{ on: marketFilter === opt.value }"
                role="tab"
                :aria-selected="marketFilter === opt.value"
                @click="setMarketFilter(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
            <div class="geo-kw-status-filters" role="tablist" aria-label="监测状态筛选">
              <button
                v-for="opt in STATUS_FILTER_OPTIONS"
                :key="opt.value"
                type="button"
                :class="{ on: statusFilter === opt.value }"
                role="tab"
                :aria-selected="statusFilter === opt.value"
                @click="setStatusFilter(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
            <span class="geo-kw-result-count" aria-live="polite">{{ resultCountLabel }}</span>
          </div>

          <div class="geo-kw-table-wrap geo-comp-table-wrap">
            <table class="geo-kw-table geo-comp-table">
              <thead>
                <tr>
                  <th scope="col" class="geo-comp-th-expand"><span class="sr-only">展开</span></th>
                  <th scope="col">竞品</th>
                  <th scope="col">市场</th>
                  <th scope="col" title="近 7 日 · 全平台 rollup">SOA 7d</th>
                  <th scope="col">别名</th>
                  <th scope="col">状态</th>
                  <th scope="col"><span class="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in filteredCompetitors" :key="row.id">
                  <tr
                    class="geo-comp-row"
                    :class="{ 'is-open': row.expanded, 'is-paused': row.status === 'paused' }"
                  >
                    <td class="geo-comp-expand-cell">
                      <button
                        type="button"
                        class="geo-comp-expand"
                        :aria-expanded="row.expanded"
                        :aria-label="row.expanded ? '收起别名' : '展开别名'"
                        @click="toggleExpand(row)"
                      >
                        {{ row.expanded ? "▾" : "▸" }}
                      </button>
                    </td>
                    <td class="geo-comp-name-cell">
                      <strong>{{ row.name }}</strong>
                      <code class="geo-comp-id">{{ row.id }}</code>
                    </td>
                    <td>
                      <span class="geo-market-pill" :class="marketLabel(row.market).cls">
                        {{ marketLabel(row.market).text }}
                      </span>
                    </td>
                    <td class="num">
                      <RouterLink
                        v-if="row.soa7d !== null && row.soaDetailLink"
                        :to="row.soaDetailLink"
                        class="geo-comp-soa-link"
                      >
                        {{ row.soa7d }}%
                      </RouterLink>
                      <span v-else class="geo-muted">—</span>
                    </td>
                    <td class="geo-comp-alias-preview">{{ previewFor(row) }}</td>
                    <td>
                      <span
                        class="geo-kw-status comp-status-label"
                        :class="{ on: row.status === 'active', off: row.status === 'paused' }"
                      >
                        {{ row.status === "active" ? "监测中" : "已暂停" }}
                      </span>
                    </td>
                    <td class="geo-kw-actions">
                      <button type="button" class="geo-btn text comp-toggle" @click="togglePause(row)">
                        {{ row.status === "active" ? "暂停" : "恢复" }}
                      </button>
                      <button
                        type="button"
                        class="geo-btn text danger comp-remove"
                        @click="removeCompetitor(row)"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                  <tr v-show="row.expanded" class="geo-comp-detail">
                    <td colspan="7">
                      <div class="geo-comp-alias-panel">
                        <ul class="geo-comp-alias-chips">
                          <li
                            v-for="(alias, idx) in row.aliases"
                            :key="alias"
                            class="geo-alias-chip"
                            :class="{ 'is-primary': idx === 0 }"
                          >
                            <span>{{ alias }}</span>
                            <span v-if="idx === 0" class="geo-alias-tag">主</span>
                            <button
                              v-else
                              type="button"
                              class="comp-alias-remove"
                              :aria-label="`删除别名 ${alias}`"
                              @click="removeAliasFromRow(row, alias)"
                            >
                              ×
                            </button>
                          </li>
                        </ul>
                        <div class="geo-alias-add geo-comp-alias-add">
                          <input
                            v-model="aliasInputs[row.id]"
                            type="text"
                            class="comp-alias-input"
                            placeholder="添加别名…"
                            aria-label="新别名"
                            @keydown.enter.prevent="addAliasToRow(row)"
                          />
                          <button
                            type="button"
                            class="geo-btn ghost sm comp-alias-add"
                            @click="addAliasToRow(row)"
                          >
                            添加
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <p v-show="isEmpty" class="geo-kw-empty">没有匹配的竞品，试试调整筛选或搜索。</p>
        </section>

        <div class="geo-comp-sync-strip" aria-label="别名库同步">
          <dl class="geo-comp-sync-dl">
            <div>
              <dt>竞品实体</dt>
              <dd>{{ marketCounts.all }}</dd>
            </div>
            <div>
              <dt>别名总数</dt>
              <dd>{{ aliasTotal }}</dd>
            </div>
            <div>
              <dt>上次同步</dt>
              <dd>今日 09:00</dd>
            </div>
            <div>
              <dt>待重算</dt>
              <dd class="geo-sync-pending" :class="{ 'is-pending': recalcStatus !== '无' }">
                {{ recalcStatus }}
              </dd>
            </div>
          </dl>
          <div class="geo-comp-sync-actions">
            <button
              type="button"
              class="geo-btn ghost sm"
              :disabled="recalcBtnDisabled"
              @click="triggerRecalc"
            >
              触发竞品标注重算
            </button>
          </div>
          <p class="geo-comp-related">
            关联
            <RouterLink :to="{ name: 'geo-settings-brand' }">品牌别名</RouterLink> ·
            <RouterLink :to="{ name: 'geo-keywords' }">问题集</RouterLink> ·
            <RouterLink :to="{ name: 'geo-competitors' }">竞品概览</RouterLink>
          </p>
        </div>

        <p class="dash-proto-link">
          竞品管理原型 v0.2 ·
          <a href="/__geo_marketing/console/competitors-manage.md" target="_blank" rel="noopener">
            产品解读
          </a>
        </p>
      </div>
    </div>

    <div
      class="geo-toast"
      role="status"
      aria-live="polite"
      :class="{ 'is-visible': toastVisible }"
      :hidden="!toastVisible"
    >
      {{ toast }}
    </div>
  </main>
</template>
