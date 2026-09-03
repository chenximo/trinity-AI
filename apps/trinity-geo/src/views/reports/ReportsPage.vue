<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useReportsInteractions } from "./reportsInteractions";
import {
  REP_KPIS,
  REP_SCHEDULE_ITEMS,
  REP_SPOTLIGHT,
  REP_TYPE_FILTERS,
} from "./mock";
import "./reports.css";

const {
  search,
  typeFilter,
  filteredRows,
  spotlightVisible,
  listMeta,
  resultCountLabel,
  isEmpty,
  setTypeFilter,
  isHighlighted,
} = useReportsInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="报告子导航">
        <p class="geo-settings-sidebar-title">报告</p>
        <nav class="geo-settings-nav">
          <RouterLink
            :to="{ name: 'geo-reports' }"
            class="is-active"
            aria-current="page"
          >
            报告列表
          </RouterLink>
          <RouterLink :to="{ name: 'geo-verify' }">效果验证</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-reports-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">⑥ 报告</p>
            <div class="geo-page-title-row">
              <h1>报告与导出</h1>
            </div>
            <p class="geo-reports-lead">
              周报 / 月报汇总 SOA、竞品、诊断与验证结论 · 单次 R1→R2 验收见
              <RouterLink :to="{ name: 'geo-verify' }">效果验证</RouterLink>
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-settings-notifications' }" class="geo-btn ghost">
              通知设置
            </RouterLink>
            <button type="button" class="geo-btn primary" disabled title="商用：自定义周期报告">
              新建报告
            </button>
          </div>
        </div>

        <div class="geo-reports-scope-bar">
          <p class="geo-form-hint geo-reports-scope-note">
            本页为<strong>周期汇总</strong>，便于周会外发；与逐题验证区分。
            预览样本 <strong>2026-W24 周报</strong> · 商用支持 PDF / 邮件定时发送。
          </p>
        </div>

        <p class="dash-section-label">报告 · 汇总</p>
        <div class="dash-kpi-row geo-reports-kpi">
          <div
            v-for="kpi in REP_KPIS"
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
            <div class="geo-metric-delta">
              <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">{{ kpi.delta }}</RouterLink>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <section class="geo-reports-list-section" aria-labelledby="rep-list-heading">
          <header class="geo-kw-list-head">
            <div>
              <h2 id="rep-list-heading">历史报告</h2>
              <p class="geo-kw-list-desc">
                在线预览 · 导出 PDF / PNG（商用）·
                <span>{{ listMeta }}</span>
              </p>
            </div>
          </header>

          <div
            v-show="spotlightVisible"
            :id="REP_SPOTLIGHT.id"
            class="geo-reports-spotlight"
            :class="{ 'is-highlighted': isHighlighted(REP_SPOTLIGHT.id) }"
            aria-label="本周周报样本"
          >
            <span class="geo-report-status ready">{{ REP_SPOTLIGHT.statusLabel }}</span>
            <span class="geo-reports-spotlight-title">
              <strong>{{ REP_SPOTLIGHT.titleStrong }}</strong> {{ REP_SPOTLIGHT.titleRest }}
            </span>
            <span class="geo-reports-spotlight-fact">{{ REP_SPOTLIGHT.fact }}</span>
            <span class="geo-reports-spotlight-links">
              <RouterLink
                v-for="link in REP_SPOTLIGHT.links"
                :key="link.label"
                :to="link.to"
              >
                {{ link.label }}
              </RouterLink>
            </span>
          </div>

          <div class="geo-kw-toolbar geo-reports-toolbar">
            <div class="geo-kw-search">
              <input
                v-model="search"
                type="search"
                placeholder="搜索报告名、周期、摘要…"
                aria-label="搜索报告"
              />
            </div>
            <div
              class="geo-kw-status-filters geo-reports-type-filters"
              role="tablist"
              aria-label="报告类型"
            >
              <button
                v-for="opt in REP_TYPE_FILTERS"
                :key="opt.id"
                type="button"
                :class="{ on: typeFilter === opt.id }"
                role="tab"
                :aria-selected="typeFilter === opt.id"
                @click="setTypeFilter(opt.id)"
              >
                {{ opt.label }}
              </button>
            </div>
            <span class="geo-kw-result-count" aria-live="polite">{{ resultCountLabel }}</span>
          </div>

          <div class="geo-kw-table-wrap geo-reports-table-wrap">
            <table class="geo-kw-table geo-report-table">
              <thead>
                <tr>
                  <th scope="col">类型</th>
                  <th scope="col">报告</th>
                  <th scope="col">周期</th>
                  <th scope="col">状态</th>
                  <th scope="col">核心摘要</th>
                  <th scope="col"><span class="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :id="row.id"
                  :key="row.id"
                  class="geo-reports-row"
                  :class="{
                    'geo-reports-row-featured': row.featured,
                    'is-highlighted': isHighlighted(row.id),
                  }"
                >
                  <td>
                    <span class="geo-reports-type-pill" :class="row.type">
                      {{ row.typeLabel }}
                    </span>
                  </td>
                  <td class="geo-reports-title-cell">
                    <RouterLink :to="row.titleLink" class="geo-reports-title">
                      {{ row.title }}
                    </RouterLink>
                    <span class="geo-reports-sub">{{ row.sub }}</span>
                  </td>
                  <td class="geo-muted">{{ row.period }}</td>
                  <td>
                    <span class="geo-report-status" :class="row.status">
                      {{ row.statusLabel }}
                    </span>
                  </td>
                  <td class="geo-reports-summary" v-html="row.summaryHtml" />
                  <td class="geo-kw-actions">
                    <template v-for="(action, i) in row.actions" :key="i">
                      <RouterLink
                        v-if="action.to"
                        :to="action.to"
                        class="geo-btn text"
                      >
                        {{ action.label }}
                      </RouterLink>
                      <span
                        v-else
                        class="geo-muted"
                        :title="action.title"
                      >
                        {{ action.label }}
                      </span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-show="isEmpty" class="geo-kw-empty">没有匹配的报告。</p>
          </div>
        </section>

        <details class="geo-reports-schedule-details">
          <summary>默认定时与告警（P1）</summary>
          <ul class="geo-reports-schedule-list">
            <li v-for="item in REP_SCHEDULE_ITEMS" :key="item.label">
              <strong>{{ item.label }}</strong> — {{ item.detail }}
              <RouterLink v-if="item.link" :to="item.link">{{ item.linkLabel }}</RouterLink>
            </li>
          </ul>
        </details>

        <p class="dash-proto-link">
          报告列表原型 v0.2 ·
          <a href="/__geo_marketing/console/reports.md" target="_blank" rel="noopener">
            产品解读
          </a>
          · 预览
          <RouterLink :to="{ name: 'geo-report-preview' }">2026-W24 周报</RouterLink>
        </p>
      </div>
    </div>
  </main>
</template>
