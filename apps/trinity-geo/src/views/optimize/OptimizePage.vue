<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  OPT_KPIS,
  OPT_MAP_ROWS,
  OPT_SPOTLIGHT,
  OPT_STATUS_FILTERS,
  statusLabel,
} from "./mock";
import { useOptimizeInteractions } from "./optimizeInteractions";
import "./optimize.css";

const {
  search,
  statusFilter,
  filteredRows,
  listMeta,
  resultCountLabel,
  isEmpty,
  setStatusFilter,
  isHighlighted,
} = useOptimizeInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="优化子导航">
        <p class="geo-settings-sidebar-title">优化</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-optimize' }" class="is-active" aria-current="page">
            优化待办
          </RouterLink>
          <RouterLink :to="{ name: 'geo-verify' }">效果验证</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-opt-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">⑤ 优化</p>
            <div class="geo-page-title-row">
              <h1>优化待办</h1>
            </div>
            <p class="geo-opt-lead">
              由诊断 <strong>D*</strong> + 信源缺口 <strong>S*</strong> 生成可执行动作 · 每条绑定对标 URL /
              目标问题 · 验收见
              <RouterLink :to="{ name: 'geo-verify' }">效果验证</RouterLink>
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-diagnosis' }" class="geo-btn ghost">诊断列表</RouterLink>
            <button type="button" class="geo-btn primary" disabled title="商用：从 P0 诊断一键生成">
              从 P0 生成
            </button>
          </div>
        </div>

        <div class="geo-opt-scope-bar">
          <p class="geo-form-hint geo-opt-scope-note">
            依据来自回答<strong>参考链接盘</strong>（如 Q00：16 链、我方 0）— 非空泛建议。 文档类任务链
            <RouterLink :to="{ name: 'geo-optimize-detail' }">optimize-detail</RouterLink>
            · 审计
            <RouterLink :to="{ name: 'geo-audit' }">页面审计</RouterLink>。
          </p>
        </div>

        <p class="dash-section-label">行动 · 汇总</p>
        <div class="dash-kpi-row geo-opt-kpi">
          <div
            v-for="kpi in OPT_KPIS"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value" :class="{ 'geo-metric-value-sm': kpi.valueSm }">
              {{ kpi.value }}
            </div>
            <div class="geo-metric-delta">
              <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">{{ kpi.delta }}</RouterLink>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <section class="geo-opt-list-section" aria-labelledby="opt-list-heading">
          <header class="geo-kw-list-head">
            <div>
              <h2 id="opt-list-heading">行动清单</h2>
              <p class="geo-kw-list-desc">
                可勾选指派（商用）· 每条链诊断与信源依据 ·
                <span>{{ listMeta }}</span>
              </p>
            </div>
          </header>

          <div
            :id="OPT_SPOTLIGHT.id"
            class="geo-opt-spotlight"
            :class="{ 'is-highlighted': isHighlighted(OPT_SPOTLIGHT.id) }"
            aria-label="P0 优化样本"
          >
            <span class="geo-opt-badge" :class="OPT_SPOTLIGHT.status">
              {{ statusLabel(OPT_SPOTLIGHT.status) }}
            </span>
            <span class="dash-diag-code d1">{{ OPT_SPOTLIGHT.rule.toUpperCase() }}</span>
            <span v-for="gap in OPT_SPOTLIGHT.gaps" :key="gap" class="geo-diag-gap">{{ gap }}</span>
            <strong>{{ OPT_SPOTLIGHT.title }}</strong>
            <span class="geo-opt-spotlight-fact">{{ OPT_SPOTLIGHT.fact }}</span>
            <span class="geo-opt-spotlight-links">
              <RouterLink v-for="link in OPT_SPOTLIGHT.links" :key="link.label" :to="link.to">
                {{ link.label }}
              </RouterLink>
            </span>
          </div>

          <div class="geo-kw-toolbar geo-opt-toolbar">
            <div class="geo-kw-search">
              <input
                v-model="search"
                type="search"
                placeholder="搜索行动、Q ID、D/S…"
                aria-label="搜索优化项"
              />
            </div>
            <div class="geo-kw-status-filters geo-opt-status-filters" role="tablist" aria-label="任务状态">
              <button
                v-for="opt in OPT_STATUS_FILTERS"
                :key="opt.id"
                type="button"
                :class="{ on: statusFilter === opt.id }"
                role="tab"
                :aria-selected="statusFilter === opt.id"
                @click="setStatusFilter(opt.id)"
              >
                {{ opt.label }}
              </button>
            </div>
            <span class="geo-kw-result-count" aria-live="polite">{{ resultCountLabel }}</span>
          </div>

          <div class="geo-kw-table-wrap geo-opt-table-wrap">
            <table class="geo-kw-table geo-opt-table">
              <thead>
                <tr>
                  <th scope="col">状态</th>
                  <th scope="col">诊断</th>
                  <th scope="col">行动</th>
                  <th scope="col">目标</th>
                  <th scope="col">截止</th>
                  <th scope="col"><span class="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :key="row.rowId ?? row.title"
                  class="geo-opt-row"
                  :class="[
                    row.rowClass,
                    { 'is-highlighted': isHighlighted(row.rowId) },
                  ]"
                  :id="row.rowId"
                >
                  <td>
                    <span class="geo-opt-badge" :class="row.status">
                      {{ statusLabel(row.status) }}
                    </span>
                  </td>
                  <td class="geo-opt-diag-cell">
                    <span class="dash-diag-code" :class="row.rule">
                      {{ row.rule.toUpperCase() }}
                    </span>
                    <span v-for="gap in row.gaps" :key="gap" class="geo-diag-gap">{{ gap }}</span>
                  </td>
                  <td class="geo-opt-title-cell">
                    <RouterLink v-if="row.titleLink" :to="row.titleLink" class="geo-opt-title">
                      {{ row.title }}
                    </RouterLink>
                    <span v-else class="geo-opt-title">{{ row.title }}</span>
                    <span class="geo-opt-sub">{{ row.subtitle }}</span>
                  </td>
                  <td>
                    <RouterLink :to="row.targetLink" class="mono">{{ row.targetId }}</RouterLink>
                  </td>
                  <td class="geo-muted">{{ row.due }}</td>
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
            <p v-if="isEmpty" class="geo-kw-empty">没有匹配的优化项。</p>
          </div>
        </section>

        <details class="geo-opt-map-details">
          <summary>缺口 → 动作映射（D* + S*）</summary>
          <div class="geo-kw-table-wrap">
            <table class="geo-kw-table geo-opt-map-table">
              <thead>
                <tr>
                  <th>缺口 / 症状</th>
                  <th>动作类型</th>
                  <th>最小动作 / 对标</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(mapRow, idx) in OPT_MAP_ROWS" :key="idx">
                  <td>
                    <template v-if="mapRow.symptomHtml === 'D1 + S1S2'">
                      D1 +
                      <span class="geo-diag-gap">S1</span><span class="geo-diag-gap">S2</span>
                    </template>
                    <template v-else-if="mapRow.symptomHtml === 'D1 + S3'">
                      D1 + <span class="geo-diag-gap">S3</span>
                    </template>
                    <span v-else class="dash-diag-code" :class="mapRow.symptomHtml.toLowerCase()">
                      {{ mapRow.symptomHtml }}
                    </span>
                  </td>
                  <td>{{ mapRow.actionType }}</td>
                  <td>
                    <RouterLink v-if="mapRow.benchmarkLink" :to="mapRow.benchmarkLink">
                      {{ mapRow.benchmark }}
                    </RouterLink>
                    <template v-else>{{ mapRow.benchmark }}</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        <p class="dash-proto-link">
          优化待办原型 v0.2 ·
          <a href="/__geo_marketing/console/optimize.md" target="_blank" rel="noopener">产品解读</a>
        </p>
      </div>
    </div>
  </main>
</template>
