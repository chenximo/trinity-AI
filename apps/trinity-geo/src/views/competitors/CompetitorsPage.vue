<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useCompetitorsInteractions } from "./competitorsInteractions";
import {
  COMP_GAP_ITEMS,
  COMP_KPIS,
  COMP_MATRIX_COLS,
  COMP_MATRIX_HEAD_LINK,
  COMP_MATRIX_ROWS,
  COMP_RANK_LIST,
  MARKET_FILTER_LABELS,
} from "./mock";
import "./competitors.css";

const { marketFilter, setMarketFilter, marketFilters } = useCompetitorsInteractions();
</script>

<template>
  <main class="geo-console-main geo-comp-page">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="竞品子导航">
        <p class="geo-settings-sidebar-title">竞品</p>
        <nav class="geo-settings-nav">
          <RouterLink
            :to="{ name: 'geo-competitors' }"
            class="is-active"
            aria-current="page"
          >
            竞品概览
          </RouterLink>
          <RouterLink :to="{ name: 'geo-competitors-manage' }">竞品管理</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">③ 测量 · 竞品对比</p>
            <h1>竞品概览</h1>
            <p class="dash-toolbar-meta">同一监测问题集下 · 品牌 vs 竞品 SOA（进答案正文）</p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-competitors-manage' }" class="geo-btn ghost">
              管理竞品
            </RouterLink>
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
                {{ MARKET_FILTER_LABELS[m] }}
              </button>
            </div>
          </div>
        </div>

        <div class="geo-settings-callout" role="note">
          <strong>同题对比：</strong>每行是一道监测问法，列是各方近 7 日 SOA。数据来自启用竞品 + 问题集分母。
          <a href="/__geo_marketing/console/competitors.md" target="_blank" rel="noopener">
            单页 PRD →
          </a>
        </div>

        <div class="dash-kpi-row">
          <div
            v-for="kpi in COMP_KPIS"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value">{{ kpi.value }}</div>
            <div class="geo-metric-delta" :class="kpi.deltaClass">
              <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">{{ kpi.delta }}</RouterLink>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <section class="geo-settings-card" aria-labelledby="comp-rank-heading">
          <h2 id="comp-rank-heading">竞品 SOA 排名 · 全问题集均值</h2>
          <ul class="geo-comp-rank-list">
            <li v-for="item in COMP_RANK_LIST" :key="item.name" :class="{ 'is-us': item.isUs }">
              <RouterLink
                v-if="item.detailLink"
                :to="item.detailLink"
                class="geo-comp-rank-name"
              >
                {{ item.name }}
              </RouterLink>
              <span v-else class="geo-comp-rank-name">{{ item.name }}</span>
              <div class="geo-comp-rank-bar" :class="{ us: item.isUs }">
                <span :style="{ width: `${item.barWidth}%` }" />
              </div>
              <span class="geo-comp-rank-val">{{ item.soa }}%</span>
            </li>
          </ul>
        </section>

        <section class="geo-settings-card" aria-labelledby="comp-matrix-heading">
          <div class="geo-settings-card-head">
            <h2 id="comp-matrix-heading">同题 SOA 矩阵</h2>
            <RouterLink :to="COMP_MATRIX_HEAD_LINK">Q00 详情 →</RouterLink>
          </div>
          <div class="geo-kw-table-wrap">
            <table class="geo-kw-table geo-comp-matrix">
              <thead>
                <tr>
                  <th>监测问题</th>
                  <th v-for="col in COMP_MATRIX_COLS" :key="col.label">
                    <RouterLink v-if="col.detailLink" :to="col.detailLink">{{ col.label }}</RouterLink>
                    <template v-else>{{ col.label }}</template>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in COMP_MATRIX_ROWS" :key="row.questionId">
                  <td>
                    <RouterLink :to="row.titleLink">
                      {{ row.questionId }} {{ row.title }}
                    </RouterLink>
                  </td>
                  <td
                    v-for="(cell, i) in row.cells"
                    :key="i"
                    class="num"
                    :class="cell.tone"
                  >
                    {{ cell.value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="dash-card" aria-labelledby="comp-gap-heading">
          <div class="dash-card-head"><h2 id="comp-gap-heading">最大差距 · 需关注</h2></div>
          <div class="dash-card-body">
            <div class="dash-answer-list">
              <article v-for="item in COMP_GAP_ITEMS" :key="item.title" class="dash-answer-item">
                <div class="dash-answer-main">
                  <RouterLink :to="item.titleLink" class="dash-answer-kw">{{ item.title }}</RouterLink>
                  <p class="dash-answer-snippet">
                    {{ item.snippet }}
                    <span v-if="item.flag" class="geo-kw-flag" :class="item.flag.tone">
                      {{ item.flag.label }}
                    </span>
                  </p>
                </div>
                <div class="dash-answer-meta">
                  <RouterLink :to="item.actionLink" class="geo-btn ghost sm">
                    {{ item.action }}
                  </RouterLink>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
