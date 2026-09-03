<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useSentimentInteractions } from "./sentimentInteractions";
import {
  SENTIMENT_ALERT,
  SENTIMENT_DIST,
  SENTIMENT_FEED,
  SENTIMENT_INSIGHT,
  SENTIMENT_KPIS,
  SENTIMENT_PILL_LABEL,
  SENTIMENT_QUESTION_ROWS,
} from "./mock";
import "./sentiment.css";

const {
  platformFilter,
  periodFilter,
  filterBadge,
  setPlatformFilter,
  setPeriodFilter,
  platformFilters,
  periodFilters,
} = useSentimentInteractions();
</script>

<template>
  <main class="geo-console-main geo-sentiment-page">
    <div class="dash-toolbar geo-settings-toolbar">
      <div>
        <p class="dash-section-label">③ 测量 · 口碑</p>
        <div class="geo-page-title-row">
          <h1>情感与口碑</h1>
        </div>
        <p class="geo-sentiment-lead">
          仅统计<strong>有品牌提及</strong>的采样 · 正 / 中 / 负倾向 ·
          与 <RouterLink :to="{ name: 'geo-dashboard' }">SOA</RouterLink>、
          <RouterLink :to="{ name: 'geo-citations' }">CCR</RouterLink> 分列读口
        </p>
      </div>
      <div class="geo-settings-toolbar-actions">
        <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-btn ghost">返回总览</RouterLink>
      </div>
    </div>

    <div class="geo-sentiment-scope-bar">
      <p class="geo-form-hint geo-sentiment-scope-note">
        采集粒度 <code>question × platform × round</code>；<code>brand_mentioned=true</code>
        才有情感标签（品类失声如 Q00 为「—」）。
        <strong>上方 KPI / 分布条</strong>默认<strong>全平台 rollup</strong>；<strong>下方流与表</strong>每行含平台。
      </p>
      <div class="geo-sentiment-filters" aria-label="情感页汇总筛选（原型）">
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
      口碑 · 总览 <span class="geo-sentiment-filter-badge">{{ filterBadge }}</span>
    </p>
    <div class="dash-kpi-row geo-sentiment-kpi">
      <div
        v-for="kpi in SENTIMENT_KPIS"
        :key="kpi.label"
        class="geo-metric-card"
        :class="kpi.tone"
      >
        <div class="geo-metric-label">{{ kpi.label }}</div>
        <div class="geo-metric-value">{{ kpi.value }}</div>
        <div class="geo-metric-delta" :class="kpi.deltaClass">{{ kpi.delta }}</div>
      </div>
    </div>

    <p class="dash-section-label">提及流 · 按问题</p>
    <div class="geo-sentiment-board">
      <section class="geo-sentiment-col" aria-labelledby="sentiment-feed-heading">
        <h2 id="sentiment-feed-heading" class="geo-sentiment-col-title">提及内容流</h2>
        <p class="geo-sentiment-col-desc">每行 = 一题 × 一平台 · 有提及才有情感</p>
        <ul class="geo-sentiment-feed">
          <li
            v-for="item in SENTIMENT_FEED"
            :key="item.questionId + item.platform"
            class="geo-sentiment-item"
            :class="item.tone"
          >
            <div class="geo-sentiment-item-head">
              <span class="geo-sentiment-tag">{{ item.tag }}</span>
              <RouterLink v-if="item.titleLink" :to="item.titleLink">
                <strong>{{ item.questionId }}</strong> · {{ item.platform }}
              </RouterLink>
              <template v-else>
                <strong>{{ item.questionId }}</strong> · {{ item.platform }}
              </template>
              <time :datetime="item.datetime">{{ item.time }}</time>
            </div>
            <p>
              {{ item.bodyText }}
              <RouterLink v-if="item.bodyLink" :to="item.bodyLink.to">
                {{ item.bodyLink.label }}
              </RouterLink>
            </p>
          </li>
        </ul>
      </section>

      <section class="geo-sentiment-col" aria-labelledby="sentiment-dist-heading">
        <h2 id="sentiment-dist-heading" class="geo-sentiment-col-title">情感分布 · 近 7 日</h2>
        <p class="geo-sentiment-col-desc">与上方筛选一致 · 默认可提及样本全平台汇总</p>
        <div class="geo-sentiment-bar-wrap" aria-label="情感分布">
          <div class="geo-sentiment-bar">
            <span class="pos" :style="{ width: `${SENTIMENT_DIST.pos}%` }" />
            <span class="neu" :style="{ width: `${SENTIMENT_DIST.neu}%` }" />
            <span class="neg" :style="{ width: `${SENTIMENT_DIST.neg}%` }" />
          </div>
          <div class="geo-sentiment-bar-labels">
            <span>正面 {{ SENTIMENT_DIST.pos }}%</span>
            <span>中性 {{ SENTIMENT_DIST.neu }}%</span>
            <span>负面 {{ SENTIMENT_DIST.neg }}%</span>
          </div>
        </div>

        <h3 class="geo-sentiment-subtitle">按问题 · 情感标签</h3>
        <div class="geo-kw-table-wrap geo-sentiment-table-wrap">
          <table class="geo-kw-table geo-sentiment-q-table">
            <thead>
              <tr>
                <th>问题</th>
                <th>平台</th>
                <th>情感</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in SENTIMENT_QUESTION_ROWS"
                :key="row.questionId + row.platform"
                :class="row.rowClass"
              >
                <td>
                  <RouterLink v-if="row.titleLink" :to="row.titleLink">
                    <strong>{{ row.questionId }}</strong> · {{ row.title }}
                  </RouterLink>
                  <template v-else>
                    <strong>{{ row.questionId }}</strong> · {{ row.title }}
                  </template>
                </td>
                <td>{{ row.platform }}</td>
                <td>
                  <span class="geo-sentiment-pill" :class="row.sentiment">
                    {{ SENTIMENT_PILL_LABEL[row.sentiment] }}
                  </span>
                </td>
                <td>
                  <RouterLink v-if="row.actionLink" :to="row.actionLink">
                    {{ row.action }}
                  </RouterLink>
                  <template v-else>{{ row.action }}</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="geo-sentiment-insight">{{ SENTIMENT_INSIGHT }}</p>
      </section>
    </div>

    <p class="dash-section-label">需关注</p>
    <section class="geo-sentiment-alert" aria-labelledby="sentiment-alert-heading">
      <h2 id="sentiment-alert-heading" class="visually-hidden">需关注项</h2>
      <div class="geo-sentiment-alert-item">
        <span class="geo-sentiment-alert-icon" aria-hidden="true">⚠</span>
        <div>
          <strong>{{ SENTIMENT_ALERT.title }}</strong>
          <p>{{ SENTIMENT_ALERT.desc }}</p>
        </div>
        <RouterLink :to="SENTIMENT_ALERT.actionLink" class="geo-btn ghost sm">
          {{ SENTIMENT_ALERT.actionLabel }}
        </RouterLink>
      </div>
    </section>

    <p class="dash-proto-link">
      情感页原型 v0.2 ·
      <a href="/__geo_marketing/console/sentiment.md" target="_blank" rel="noopener">产品解读</a>
    </p>
  </main>
</template>
