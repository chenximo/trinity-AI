<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useMonitoringInteractions } from "./monitoringInteractions";
import {
  MON_FAIL_ROWS,
  MON_KPIS,
  MON_LOG_ROWS,
  MON_RECENT_ITEMS,
} from "./mock";
import "./monitoring.css";

const {
  activeTab,
  marketFilter,
  toast,
  toastVisible,
  visiblePlatformCards,
  setTab,
  setMarketFilter,
  refreshStatus,
  marketFilters,
  marketFilterLabels,
} = useMonitoringInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="监测子导航">
        <p class="geo-settings-sidebar-title">监测</p>
        <nav class="geo-settings-nav">
          <RouterLink
            :to="{ name: 'geo-monitoring' }"
            class="is-active"
            aria-current="page"
          >
            监测概览
          </RouterLink>
          <RouterLink :to="{ name: 'geo-keywords' }">问题集管理</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-monitoring-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">② 监测采集</p>
            <div class="geo-page-title-row">
              <h1>监测采集</h1>
            </div>
            <p class="geo-monitoring-lead">
              <strong>运维视角</strong>：采集是否成功、数据是否新鲜 ·
              任务粒度 <code>question × platform × round</code> ·
              SOA / 引用 / 情感见
              <RouterLink :to="{ name: 'geo-dashboard' }">测量读口</RouterLink>
            </p>
          </div>
          <div v-show="activeTab === 'overview'" class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-keywords' }" class="geo-btn ghost">
              管理问题集
            </RouterLink>
            <button type="button" class="geo-btn primary" @click="refreshStatus">
              立即刷新状态
            </button>
          </div>
          <div v-show="activeTab === 'logs'" class="geo-settings-toolbar-actions">
            <button type="button" class="geo-btn ghost" disabled>导出 CSV</button>
            <button type="button" class="geo-btn primary" disabled>批量重试失败</button>
          </div>
        </div>

        <div class="geo-monitoring-scope-bar">
          <p class="geo-form-hint geo-monitoring-scope-note">
            本页<strong>以平台为主维</strong>展示采集健康度；顶部 KPI 为今日全站汇总（启用题 × 平台）。
            单条失败 / 入库记录均含平台列；完整任务表见
            <a href="#" @click.prevent="setTab('logs')">采集日志</a> Tab。
          </p>
        </div>

        <div class="geo-mon-view-tabs dash-tabs" role="tablist" aria-label="监测页视图">
          <button
            type="button"
            :class="{ on: activeTab === 'overview' }"
            role="tab"
            :aria-selected="activeTab === 'overview'"
            @click="setTab('overview')"
          >
            概览
          </button>
          <button
            type="button"
            :class="{ on: activeTab === 'logs' }"
            role="tab"
            :aria-selected="activeTab === 'logs'"
            @click="setTab('logs')"
          >
            采集日志
          </button>
        </div>

        <div
          v-show="activeTab === 'overview'"
          class="geo-mon-tab-panel"
          role="tabpanel"
        >
          <p class="dash-section-label">采集 · 今日</p>
          <div class="dash-kpi-row geo-mon-kpi">
            <div
              v-for="kpi in MON_KPIS"
              :key="kpi.label"
              class="geo-metric-card"
              :class="kpi.tone"
            >
              <div class="geo-metric-label">{{ kpi.label }}</div>
              <div
                class="geo-metric-value"
                :class="{ 'geo-metric-value-sm': kpi.valueSm }"
              >
                {{ kpi.value }}
              </div>
              <div class="geo-metric-delta" :class="kpi.deltaClass">
                <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">
                  {{ kpi.delta }}
                </RouterLink>
                <template v-else>{{ kpi.delta }}</template>
              </div>
            </div>
          </div>

          <div class="geo-monitoring-section-head">
            <div>
              <p class="dash-section-label">平台 · 采集状态</p>
              <p class="geo-monitoring-col-desc">
                <span class="dash-fresh today" aria-hidden="true" /> 今日已采 ·
                <span class="dash-fresh stale" aria-hidden="true" /> 逾 24h ·
                <span class="dash-fresh fail" aria-hidden="true" /> 失败
              </p>
            </div>
            <div class="dash-tabs" role="tablist" aria-label="市场筛选">
              <button
                v-for="m in marketFilters"
                :key="m"
                type="button"
                :class="{ on: marketFilter === m }"
                role="tab"
                :aria-selected="marketFilter === m"
                @click="setMarketFilter(m)"
              >
                {{ marketFilterLabels[m] }}
              </button>
            </div>
          </div>

          <div class="geo-mon-platform-grid">
            <article
              v-for="card in visiblePlatformCards"
              :key="card.name"
              class="geo-mon-platform-card"
              :class="card.market"
            >
              <header>
                <span class="dash-fresh" :class="card.fresh" aria-hidden="true" />
                <strong>{{ card.name }}</strong>
                <span class="geo-mon-status" :class="card.status">{{ card.statusLabel }}</span>
              </header>
              <dl>
                <div>
                  <dt>最近采集</dt>
                  <dd>{{ card.lastCollect }}</dd>
                </div>
                <div>
                  <dt>今日进度</dt>
                  <dd>{{ card.progress }}</dd>
                </div>
                <div>
                  <dt>失败</dt>
                  <dd>{{ card.failures }}</dd>
                </div>
                <div>
                  <dt>信源可提取</dt>
                  <dd :class="{ 'geo-mon-highlight': card.extractableHighlight }">
                    {{ card.extractable }}
                  </dd>
                </div>
              </dl>
            </article>
          </div>

          <p class="dash-section-label">失败与入库</p>
          <div class="geo-mon-board">
            <section class="geo-mon-col" aria-labelledby="mon-fail-heading">
              <div class="geo-mon-col-head">
                <h2 id="mon-fail-heading" class="geo-mon-col-title">最近失败</h2>
                <a href="#" class="geo-mon-col-link" @click.prevent="setTab('logs')">
                  全部日志 →
                </a>
              </div>
              <p class="geo-monitoring-col-desc">平台 × 问题 × 失败原因</p>
              <div class="geo-kw-table-wrap">
                <table class="geo-kw-table geo-mon-fail-table">
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>平台</th>
                      <th>问题</th>
                      <th>原因</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in MON_FAIL_ROWS" :key="row.time + row.questionId">
                      <td class="mono">{{ row.time }}</td>
                      <td>{{ row.platform }}</td>
                      <td>
                        <RouterLink v-if="row.questionLink" :to="row.questionLink">
                          <strong>{{ row.questionId }}</strong> · {{ row.questionTitle }}
                        </RouterLink>
                        <template v-else>
                          <strong>{{ row.questionId }}</strong> · {{ row.questionTitle }}
                        </template>
                      </td>
                      <td class="geo-muted">{{ row.reason }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="geo-mon-col" aria-labelledby="mon-recent-heading">
              <div class="geo-mon-col-head">
                <h2 id="mon-recent-heading" class="geo-mon-col-title">最新入库</h2>
                <RouterLink :to="{ name: 'geo-answer-detail' }" class="geo-mon-col-link">
                  Q00 回答 →
                </RouterLink>
              </div>
              <p class="geo-monitoring-col-desc">最近 raw_answer · 只读 SOA 徽章</p>
              <ul class="geo-mon-recent-list">
                <li
                  v-for="item in MON_RECENT_ITEMS"
                  :key="item.questionId + item.platform"
                  class="geo-mon-recent-item"
                >
                  <div class="geo-mon-recent-main">
                    <RouterLink :to="item.titleLink">
                      <strong>{{ item.questionId }}</strong> · {{ item.title }}
                    </RouterLink>
                    <p>
                      <span class="platform" :class="item.platformClass">{{ item.platform }}</span>
                      {{ item.meta }}
                    </p>
                  </div>
                  <span class="dash-badge" :class="item.badge">{{ item.badgeLabel }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <div
          v-show="activeTab === 'logs'"
          class="geo-mon-tab-panel"
          role="tabpanel"
        >
          <p class="geo-monitoring-col-desc">
            按平台 × 问题记录日采任务 · 连续失败触发
            <RouterLink :to="{ name: 'geo-settings-notifications' }">邮件告警</RouterLink>
          </p>
          <div class="geo-log-filters" role="group" aria-label="日志筛选">
            <label>
              <span>平台</span>
              <select aria-label="平台">
                <option>全部</option>
                <option>豆包</option>
                <option>ChatGPT</option>
                <option>Gemini</option>
                <option>DeepSeek</option>
              </select>
            </label>
            <label>
              <span>状态</span>
              <select aria-label="状态">
                <option>全部</option>
                <option>成功</option>
                <option selected>失败</option>
              </select>
            </label>
            <label>
              <span>日期</span>
              <input type="date" value="2026-06-15" aria-label="日期" />
            </label>
          </div>
          <div class="geo-kw-table-wrap geo-mon-log-table-wrap">
            <table class="geo-kw-table geo-log-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>平台</th>
                  <th>问题</th>
                  <th>状态</th>
                  <th>耗时</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in MON_LOG_ROWS"
                  :key="row.time + row.platform + row.questionId"
                  :class="{ 'geo-log-fail': row.fail }"
                >
                  <td :class="{ mono: row.mono }">{{ row.time }}</td>
                  <td>{{ row.platform }}</td>
                  <td>
                    <RouterLink v-if="row.questionLink" :to="row.questionLink">
                      <strong>{{ row.questionId }}</strong>
                      <template v-if="row.questionTitle !== row.questionId">
                        · {{ row.questionTitle }}
                      </template>
                    </RouterLink>
                  </td>
                  <td>
                    <span class="geo-log-status" :class="row.status">{{ row.statusLabel }}</span>
                  </td>
                  <td>{{ row.duration }}</td>
                  <td>
                    <button v-if="row.fail" type="button" class="geo-btn ghost sm">重试</button>
                    <RouterLink
                      v-else-if="row.answerLink"
                      :to="row.answerLink"
                      class="geo-btn text sm"
                    >
                      答案
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="dash-proto-link">
          监测采集原型 v0.3 ·
          <a href="/__geo_marketing/console/monitoring.md" target="_blank" rel="noopener">产品解读</a>
          · 日志规格
          <a href="/__geo_marketing/console/monitoring-logs.md" target="_blank" rel="noopener">
            monitoring-logs.md
          </a>
        </p>
      </div>
    </div>

    <div class="geo-toast" role="status" :class="{ 'is-visible': toastVisible }" :hidden="!toastVisible">
      {{ toast }}
    </div>
  </main>
</template>
