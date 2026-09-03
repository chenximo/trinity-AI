<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  DIAG_KPIS,
  DIAG_PRIORITY_FILTERS,
  DIAG_RULE_ROWS,
  DIAG_SPOTLIGHT,
  DIAG_TYPE_FILTERS,
  GAP_RULE_ROWS,
} from "./mock";
import { useDiagnosisInteractions } from "./diagnosisInteractions";
import "./diagnosis.css";

const {
  search,
  typeFilter,
  priorityFilter,
  filteredRows,
  listMeta,
  resultCountLabel,
  isEmpty,
  setTypeFilter,
  setPriorityFilter,
  isHighlighted,
} = useDiagnosisInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="诊断子导航">
        <p class="geo-settings-sidebar-title">诊断</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-diagnosis' }" class="is-active" aria-current="page">
            诊断列表
          </RouterLink>
          <RouterLink :to="{ name: 'geo-audit' }">页面审计</RouterLink>
          <RouterLink :to="{ name: 'geo-audit-reports' }">审计报告</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-diag-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">④ 诊断</p>
            <div class="geo-page-title-row">
              <h1>诊断列表</h1>
            </div>
            <p class="geo-diag-lead">
              规则引擎解释「为什么没进答案 / 为什么落后」· 输入 = 测量标注 +（若有）
              <code>cited_urls</code> 信源盘 · 动作见
              <RouterLink :to="{ name: 'geo-optimize' }">优化待办</RouterLink>
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-audit' }" class="geo-btn ghost">页面审计</RouterLink>
            <RouterLink :to="{ name: 'geo-optimize' }" class="geo-btn primary">优化待办</RouterLink>
          </div>
        </div>

        <div class="geo-diag-scope-bar">
          <p class="geo-form-hint geo-diag-scope-note">
            粒度 <code>question × platform × round</code>；有引用链时叠加信源缺口
            <strong>S1–S6</strong>。列表按优先级排序；P0 样本 <strong>Q00 · D1</strong> 链
            <RouterLink :to="{ name: 'geo-answer-detail', hash: '#cite-heading' }">
              回答信源盘
            </RouterLink>。
          </p>
        </div>

        <p class="dash-section-label">开放诊断 · 汇总</p>
        <div class="dash-kpi-row geo-diag-kpi">
          <div
            v-for="kpi in DIAG_KPIS"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value">{{ kpi.value }}</div>
            <div class="geo-metric-delta">
              <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">{{ kpi.delta }}</RouterLink>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <section class="geo-diag-list-section" aria-labelledby="diag-list-heading">
          <header class="geo-kw-list-head">
            <div>
              <h2 id="diag-list-heading">规则诊断</h2>
              <p class="geo-kw-list-desc">
                D1–D5 由标注推导 · 信源缺口 S* 需 <code>cited_urls</code> ·
                <span>{{ listMeta }}</span>
              </p>
            </div>
          </header>

          <div class="geo-kw-toolbar geo-diag-toolbar">
            <div class="geo-kw-search">
              <input
                v-model="search"
                type="search"
                placeholder="搜索问题、Q ID…"
                aria-label="搜索诊断"
              />
            </div>
            <div class="geo-diag-filters geo-diag-type-filters" role="tablist" aria-label="诊断类型">
              <button
                v-for="opt in DIAG_TYPE_FILTERS"
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
            <div
              class="geo-kw-status-filters geo-diag-priority-filters"
              role="tablist"
              aria-label="优先级"
            >
              <button
                v-for="opt in DIAG_PRIORITY_FILTERS"
                :key="opt.id"
                type="button"
                :class="{ on: priorityFilter === opt.id }"
                role="tab"
                :aria-selected="priorityFilter === opt.id"
                @click="setPriorityFilter(opt.id)"
              >
                {{ opt.label }}
              </button>
            </div>
            <span class="geo-kw-result-count" aria-live="polite">{{ resultCountLabel }}</span>
          </div>

          <div
            :id="DIAG_SPOTLIGHT.id"
            class="geo-diag-spotlight"
            :class="{ 'is-highlighted': isHighlighted(DIAG_SPOTLIGHT.id) }"
            aria-label="P0 样本诊断"
          >
            <span class="dash-diag-priority p0">{{ DIAG_SPOTLIGHT.priority.toUpperCase() }}</span>
            <span class="dash-diag-code d1">{{ DIAG_SPOTLIGHT.rule.toUpperCase() }}</span>
            <span class="geo-diag-spotlight-title">
              <strong>{{ DIAG_SPOTLIGHT.titleStrong }}</strong>
              {{ DIAG_SPOTLIGHT.titleRest }}
            </span>
            <span class="geo-diag-spotlight-fact">{{ DIAG_SPOTLIGHT.fact }}</span>
            <span class="geo-diag-spotlight-links">
              <RouterLink
                v-for="link in DIAG_SPOTLIGHT.links"
                :key="link.label"
                :to="link.to"
              >
                {{ link.label }}
              </RouterLink>
            </span>
          </div>

          <div class="geo-kw-table-wrap geo-diag-table-wrap">
            <table class="geo-kw-table geo-diag-table">
              <thead>
                <tr>
                  <th scope="col">优先级</th>
                  <th scope="col">规则</th>
                  <th scope="col">问题</th>
                  <th scope="col">平台</th>
                  <th scope="col">缺口</th>
                  <th scope="col">证据</th>
                  <th scope="col"><span class="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :key="row.questionId + row.rule"
                  class="geo-diag-row"
                  :class="[
                    row.rowClass,
                    { 'is-highlighted': isHighlighted(row.rowId) },
                  ]"
                  :id="row.rowId"
                >
                  <td>
                    <span class="dash-diag-priority" :class="row.priority">
                      {{ row.priority.toUpperCase() }}
                    </span>
                  </td>
                  <td>
                    <span class="dash-diag-code" :class="row.rule">
                      {{ row.rule.toUpperCase() }}
                    </span>
                  </td>
                  <td class="geo-diag-q-cell">
                    <RouterLink :to="row.questionLink" class="geo-diag-q-title">
                      {{ row.questionTitle }}
                    </RouterLink>
                    <span class="mono geo-diag-qid">{{ row.questionId }}</span>
                  </td>
                  <td>
                    <span v-if="row.platformSplit" class="geo-diag-platform-split">
                      {{ row.platformSplit }}
                    </span>
                    <span v-else class="platform" :class="row.platformClass">{{ row.platform }}</span>
                  </td>
                  <td class="geo-diag-gaps">
                    <template v-if="row.gaps?.length">
                      <span v-for="gap in row.gaps" :key="gap" class="geo-diag-gap">{{ gap }}</span>
                    </template>
                    <span v-else class="geo-muted">—</span>
                  </td>
                  <td class="geo-diag-evidence-cell">{{ row.evidence }}</td>
                  <td class="geo-kw-actions">
                    <RouterLink
                      v-for="action in row.actions"
                      :key="action.label"
                      :to="action.to"
                      class="geo-btn text"
                    >
                      {{ action.label }}
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="isEmpty" class="geo-kw-empty">没有匹配的诊断，试试调整筛选或搜索。</p>
          </div>
        </section>

        <details class="geo-diag-rules-details">
          <summary>规则速查 · D1–D5 与信源缺口 S1–S4</summary>
          <div class="geo-diag-rules-grid">
            <div class="geo-kw-table-wrap">
              <table class="geo-kw-table geo-diag-rules-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>条件</th>
                    <th>结论</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rule in DIAG_RULE_ROWS" :key="rule.rule">
                    <td>
                      <span class="dash-diag-code" :class="rule.rule">
                        {{ rule.rule.toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ rule.condition }}</td>
                    <td>{{ rule.conclusion }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="geo-kw-table-wrap">
              <table class="geo-kw-table">
                <thead>
                  <tr>
                    <th>缺口</th>
                    <th>条件</th>
                    <th>典型动作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="gap in GAP_RULE_ROWS" :key="gap.gap">
                    <td><span class="geo-diag-gap">{{ gap.gap }}</span></td>
                    <td>{{ gap.condition }}</td>
                    <td>
                      <RouterLink v-if="gap.actionLink" :to="gap.actionLink">
                        {{ gap.action }}
                      </RouterLink>
                      <template v-else>{{ gap.action }}</template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <p class="dash-proto-link">
          诊断列表原型 v0.2 ·
          <a
            href="/__geo_marketing/console/diagnosis.md"
            target="_blank"
            rel="noopener"
          >产品解读</a>
        </p>
      </div>
    </div>
  </main>
</template>
