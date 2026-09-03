<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useCitationsInteractions } from "./citationsInteractions";
import {
  CCR_PILL_LABEL,
  CITE_KPIS,
  CITE_PLATFORM_ROWS,
  CITE_QUESTION_ROWS,
  CITE_SPOTLIGHT,
  CITE_STRUCTURE_BARS,
  CITE_STRUCTURE_INSIGHT,
  EXTRACTABLE_PILL_LABEL,
} from "./mock";
import "./citations.css";

const {
  platformFilter,
  periodFilter,
  filterBadge,
  setPlatformFilter,
  setPeriodFilter,
  platformFilters,
  periodFilters,
} = useCitationsInteractions();
</script>

<template>
  <main class="geo-console-main geo-cite-page">
    <div class="dash-toolbar geo-settings-toolbar">
      <div>
        <p class="dash-section-label">② 引用 · ③ 信源</p>
        <div class="geo-page-title-row">
          <h1>引用与信源</h1>
        </div>
        <p class="geo-cite-lead">
          <strong>CCR</strong> = 有品牌提及时的引用角色 ·
          <strong>信源 M/N</strong> = 参考链我方域占比 · 进答案正文见
          <RouterLink :to="{ name: 'geo-dashboard' }">可见性（SOA）</RouterLink>
        </p>
      </div>
      <div class="geo-settings-toolbar-actions">
        <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-btn ghost">返回总览</RouterLink>
      </div>
    </div>

    <div class="geo-cite-scope-bar">
      <p class="geo-form-hint geo-cite-scope-note">
        采集粒度 <code>question × platform × round</code> 一条回答 → 解析
        <code>cited_urls[]</code>（仅 <code>citation_extractable=true</code>）。
        <strong>上方 KPI / 来源结构</strong>默认<strong>全平台 rollup</strong>（可筛平台）；<strong>下方按问题表</strong>每行含平台，不跨平台合并。
      </p>
      <div class="geo-cite-filters" aria-label="引用页汇总筛选（原型）">
        <div class="dash-tabs" role="tablist" aria-label="平台筛选">
          <button
            v-for="p in platformFilters"
            :key="p"
            type="button"
            :class="{ on: platformFilter === p }"
            role="tab"
            :aria-selected="platformFilter === p"
            @click="setPlatformFilter(p)"
          >
            {{ p }}
          </button>
        </div>
        <div class="dash-period" role="tablist" aria-label="时间窗">
          <button
            v-for="p in periodFilters"
            :key="p"
            type="button"
            :class="{ on: periodFilter === p }"
            role="tab"
            :aria-selected="periodFilter === p"
            @click="setPeriodFilter(p)"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>

    <p class="dash-section-label">
      引用与信源 · 总览 <span class="geo-cite-filter-badge">{{ filterBadge }}</span>
    </p>
    <div class="dash-kpi-row geo-cite-kpi">
      <div
        v-for="kpi in CITE_KPIS"
        :key="kpi.label"
        class="geo-metric-card"
        :class="kpi.tone"
      >
        <div class="geo-metric-label">{{ kpi.label }}</div>
        <div class="geo-metric-value">{{ kpi.value }}</div>
        <div class="geo-metric-delta">
          <template v-if="kpi.deltaLink">
            {{ kpi.delta.split(" · ")[0] }} ·
            <RouterLink :to="kpi.deltaLink">{{ kpi.delta.split(" · ")[1] }}</RouterLink>
          </template>
          <template v-else>{{ kpi.delta }}</template>
        </div>
      </div>
    </div>

    <p class="dash-section-label">按问题 · 来源结构</p>
    <div class="geo-cite-board">
      <section class="geo-cite-col" aria-labelledby="cite-by-q-heading">
        <h2 id="cite-by-q-heading" class="geo-cite-col-title">按问题 · 信源概况</h2>
        <p class="geo-cite-col-desc">CCR 与 M/N 分列 · 每行 = 一题 × 一平台</p>
        <div class="geo-kw-table-wrap geo-cite-table-wrap">
          <table class="geo-kw-table geo-cite-q-table">
            <thead>
              <tr>
                <th>问题</th>
                <th>平台</th>
                <th>CCR</th>
                <th>信源 M/N</th>
                <th>缺口</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in CITE_QUESTION_ROWS"
                :key="row.questionId + row.platform"
                class="geo-cite-q-row"
                :class="row.rowClass"
              >
                <td>
                  <RouterLink
                    v-if="row.titleLink"
                    :to="row.titleLink"
                    class="geo-cite-q-title"
                  >
                    <strong>{{ row.questionId }}</strong> · {{ row.title }}
                  </RouterLink>
                  <template v-else>
                    <strong>{{ row.questionId }}</strong> · {{ row.title }}
                  </template>
                </td>
                <td>{{ row.platform }}</td>
                <td>
                  <span class="geo-cite-pill" :class="row.ccr">
                    {{ CCR_PILL_LABEL[row.ccr] }}
                  </span>
                </td>
                <td class="num" :class="row.citeClass">
                  <strong>{{ row.citeMn.split("/")[0] }}</strong
                  >/{{ row.citeMn.split("/")[1] }}
                </td>
                <td>
                  <span v-if="row.gapMuted" class="geo-diag-sub">{{ row.gap }}</span>
                  <template v-else>{{ row.gap }}</template>
                </td>
                <td>
                  <RouterLink :to="row.actionLink">{{ row.action }}</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="geo-cite-col" aria-labelledby="cite-structure-heading">
        <h2 id="cite-structure-heading" class="geo-cite-col-title">来源结构 · 近 7 日</h2>
        <p class="geo-cite-col-desc">与上方筛选一致 · 默认可提取样本全平台汇总</p>
        <ul class="geo-cite-structure-bars">
          <li v-for="bar in CITE_STRUCTURE_BARS" :key="bar.tag">
            <span class="label">
              <span class="geo-cite-tag" :class="bar.tagClass">{{ bar.tag }}</span>
            </span>
            <div class="bar-wrap">
              <div class="bar" :class="bar.tagClass" :style="{ width: `${bar.width}%` }" />
            </div>
            <span class="pct">{{ bar.pct }}</span>
          </li>
        </ul>
        <p class="geo-cite-insight">{{ CITE_STRUCTURE_INSIGHT }}</p>
        <RouterLink :to="{ name: 'geo-optimize', hash: '#opt-s1s2' }" class="geo-btn ghost sm">
          对标 docs 优化 →
        </RouterLink>
      </section>
    </div>

    <p class="dash-section-label">
      焦点样本 · Q00 信源盘
      <span class="geo-cite-filter-badge muted">固定下钻 · 不受上方筛选</span>
    </p>
    <section class="geo-cite-spotlight" aria-labelledby="cite-spotlight-heading">
      <header class="geo-cite-spotlight-head">
        <div>
          <h2 id="cite-spotlight-heading">{{ CITE_SPOTLIGHT.title }}</h2>
          <p class="geo-cite-col-desc">
            单条采集记录信源盘（非平台汇总）· 真源
            <code>mvp/data/r1/cited_sources.json</code> · 品类失声典型
          </p>
        </div>
        <span class="geo-cite-badge danger">{{ CITE_SPOTLIGHT.badge }}</span>
      </header>
      <div class="geo-cite-spotlight-grid">
        <article
          v-for="cell in CITE_SPOTLIGHT.cells"
          :key="cell.title"
          class="geo-cite-spotlight-cell"
          :class="cell.tone"
        >
          <h3 class="geo-cite-section-title">{{ cell.title }}</h3>
          <p>{{ cell.desc }}</p>
        </article>
      </div>
      <div class="geo-cite-spotlight-actions">
        <RouterLink
          v-for="action in CITE_SPOTLIGHT.actions"
          :key="action.label"
          :to="action.to"
          class="geo-btn"
          :class="action.primary ? 'primary' : 'ghost'"
        >
          {{ action.label }}
        </RouterLink>
      </div>
    </section>

    <p class="dash-section-label">平台可提取性</p>
    <section class="geo-cite-platform" aria-labelledby="cite-platform-heading">
      <h2 id="cite-platform-heading" class="visually-hidden">平台可提取性</h2>
      <div class="geo-kw-table-wrap geo-cite-table-wrap">
        <table class="geo-kw-table geo-cite-platform-table">
          <thead>
            <tr>
              <th>平台</th>
              <th>citation_extractable</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in CITE_PLATFORM_ROWS" :key="row.platform">
              <td>{{ row.platform }}</td>
              <td>
                <span class="geo-cite-pill" :class="row.extractable">
                  {{ EXTRACTABLE_PILL_LABEL[row.extractable] }}
                </span>
              </td>
              <td>{{ row.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="dash-proto-link">
      引用页原型 v0.2 ·
      <a href="/__geo_marketing/console/citations.md" target="_blank" rel="noopener">产品解读</a>
    </p>
  </main>
</template>
