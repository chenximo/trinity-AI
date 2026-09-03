<script setup lang="ts">
import { RouterLink } from "vue-router";
import { KEYWORD_NAV_ITEMS, PERIOD_LABELS, typeClass, typeShort } from "./mock";
import { useKeywordDetailInteractions } from "./keywordDetailInteractions";
import "./keyword-detail.css";

const { period, questionId, detail, setPeriod, navTo } = useKeywordDetailInteractions();
const periods = ["day", "week", "month"] as const;
</script>

<template>
  <main class="geo-console-main geo-kw-detail-page">
    <nav class="geo-breadcrumb" aria-label="面包屑">
      <RouterLink :to="{ name: 'geo-dashboard' }">总览</RouterLink> / <span>可见性下钻</span> /
      <span>{{ questionId }}</span>
    </nav>

    <div class="geo-kw-detail-layout">
      <aside class="geo-kw-detail-aside" aria-label="监测问题列表">
        <div class="geo-kw-detail-aside-head">
          <h2>问题集</h2>
          <RouterLink :to="{ name: 'geo-keywords' }" class="geo-btn ghost sm">管理</RouterLink>
        </div>
        <p class="geo-kw-detail-aside-hint">单题 = 可见性下钻单元（非 SKU 目录）</p>
        <ul class="geo-kw-detail-nav">
          <li
            v-for="item in KEYWORD_NAV_ITEMS"
            :key="item.id"
            :class="{ 'is-current': item.id === questionId }"
          >
            <RouterLink :to="navTo(item.id)">
              <span class="geo-kw-type" :class="typeClass(item.type)">{{ typeShort(item.type) }}</span>
              <span class="geo-kw-detail-nav-text">{{ item.text }}</span>
              <span
                class="geo-kw-detail-nav-soa"
                :class="item.soaTone"
              >
                {{ item.soa }}%
              </span>
            </RouterLink>
          </li>
        </ul>
        <p class="geo-kw-detail-aside-foot">
          <RouterLink :to="{ name: 'geo-keywords' }">查看全部 10 题 →</RouterLink>
        </p>
      </aside>

      <div class="geo-kw-detail-main">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">可见性 · 单题下钻</p>
            <h1>{{ detail.title }}</h1>
            <p class="dash-toolbar-meta">
              <span class="geo-kw-type" :class="typeClass(detail.type)">{{ detail.type }}</span>
              <code class="geo-comp-id">{{ detail.id }}</code>
              · {{ detail.status }}
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-btn ghost">返回总览</RouterLink>
            <RouterLink :to="{ name: 'geo-answer-detail' }" class="geo-btn primary">
              查看最新回答
            </RouterLink>
          </div>
        </div>

        <div class="geo-settings-callout warn" role="alert">
          <strong>
            <RouterLink :to="detail.callout.diagLink">{{ detail.callout.diagText }}</RouterLink>：
          </strong>
          SOA 0%；豆包 R1 参考盘 <strong>16 链、我方域 0</strong>，竞品 OpenRouter、TokenHub 占官方依据。
          <RouterLink :to="detail.callout.citeLink">查看信源 →</RouterLink>
          · <RouterLink :to="detail.callout.optimizeLink">优化动作 →</RouterLink>
        </div>

        <div class="dash-kpi-row">
          <div
            v-for="kpi in detail.kpis"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value">{{ kpi.value }}</div>
            <div class="geo-metric-delta" :class="{ down: kpi.deltaDown }">
              <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">{{ kpi.delta }}</RouterLink>
              <template v-else>{{ kpi.delta }}</template>
              <template v-if="kpi.deltaText">
                · <RouterLink :to="kpi.deltaLink!">{{ kpi.deltaText }}</RouterLink>
              </template>
            </div>
          </div>
        </div>
        <p class="geo-form-hint geo-kw-sample-hint">
          {{ detail.sampleHint }}
          <RouterLink :to="{ name: 'geo-verify', hash: '#verify-q00' }">效果验证</RouterLink>
        </p>

        <div class="geo-kw-detail-split">
          <section class="dash-panel" aria-labelledby="kw-trend-heading">
            <header class="dash-panel-head">
              <div>
                <h2 id="kw-trend-heading">SOA 趋势 · 本题</h2>
                <div class="dash-trend-legend dash-trend-legend-multi">
                  <span class="line-overseas">我方</span>
                  <span class="line-comp-a">OpenRouter</span>
                  <span class="line-comp-b">TokenHub</span>
                </div>
              </div>
              <div class="dash-period" role="tablist">
                <button
                  v-for="p in periods"
                  :key="p"
                  type="button"
                  :class="{ on: period === p }"
                  @click="setPeriod(p)"
                >
                  {{ PERIOD_LABELS[p] }}
                </button>
              </div>
            </header>
            <div class="dash-trend-chart geo-kw-trend-flat" aria-hidden="true">
              <svg viewBox="0 0 400 80" preserveAspectRatio="none">
                <line x1="0" y1="70" x2="400" y2="70" stroke="#e2e8f0" />
                <polyline
                  points="0,70 400,70"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                />
                <polyline
                  points="0,28 100,26 200,24 300,22 400,20"
                  fill="none"
                  stroke="#7c3aed"
                  stroke-width="2"
                  opacity="0.75"
                />
                <polyline
                  points="0,32 100,34 200,33 300,35 400,34"
                  fill="none"
                  stroke="#64748b"
                  stroke-width="1.75"
                  opacity="0.7"
                />
              </svg>
              <p class="geo-kw-trend-note">{{ detail.trendNote }}</p>
            </div>
          </section>

          <section class="dash-panel" aria-labelledby="kw-comp-rank-heading">
            <header class="dash-panel-head">
              <h2 id="kw-comp-rank-heading">本题 · 竞品 SOA 排名</h2>
              <RouterLink :to="{ name: 'geo-competitors' }" class="geo-btn ghost sm">
                竞品模块 →
              </RouterLink>
            </header>
            <ol class="geo-comp-rank-list">
              <li
                v-for="row in detail.competitors"
                :key="row.name"
                :class="{ 'is-us': row.isUs }"
              >
                <span class="geo-comp-rank-name">
                  <RouterLink v-if="row.detail" :to="row.detail">{{ row.name }}</RouterLink>
                  <template v-else>{{ row.name }}</template>
                </span>
                <span class="geo-comp-rank-bar" :class="{ us: row.isUs }">
                  <span :style="{ width: `${row.soa}%` }" />
                </span>
                <span class="geo-comp-rank-val" :class="row.soaTone">{{ row.soa }}%</span>
              </li>
            </ol>
          </section>
        </div>

        <section class="dash-panel" aria-labelledby="kw-tags-heading">
          <header class="dash-panel-head">
            <h2 id="kw-tags-heading">回答中的叙事标签 · 本题采样</h2>
          </header>
          <div class="geo-tag-cloud">
            <span
              v-for="tag in detail.tags"
              :key="tag.label"
              class="geo-tag-chip"
              :class="{ hot: tag.hot, muted: tag.muted }"
            >
              {{ tag.label }}
            </span>
          </div>
          <p class="geo-form-hint">
            灰色 = 本题未进正文提及 · 情感维度见
            <RouterLink :to="{ name: 'geo-sentiment' }">情感读口</RouterLink>
          </p>
        </section>

        <section class="geo-settings-card" aria-labelledby="kw-platform-heading">
          <h2 id="kw-platform-heading">分平台摘要</h2>
          <div class="geo-kw-table-wrap">
            <table class="geo-kw-table">
              <thead>
                <tr>
                  <th>平台</th>
                  <th>市场</th>
                  <th>SOA 7d</th>
                  <th>信源 M/N</th>
                  <th>竞品领先</th>
                  <th>最近回答</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in detail.platforms" :key="row.platform">
                  <td>{{ row.platform }}</td>
                  <td>{{ row.market }}</td>
                  <td class="num" :class="row.soaClass">{{ row.soa }}</td>
                  <td class="num" :class="row.citeClass">{{ row.cite }}</td>
                  <td>{{ row.leaders }}</td>
                  <td>
                    <RouterLink :to="row.answer" :title="row.answerTitle">查看</RouterLink>
                    · {{ row.answerTime }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="dash-panel" aria-labelledby="kw-answers-heading">
          <header class="dash-panel-head">
            <h2 id="kw-answers-heading">本题 · 最新回答</h2>
          </header>
          <div class="dash-answer-list">
            <article
              v-for="ans in detail.latestAnswers"
              :key="ans.title"
              class="dash-answer-item"
            >
              <div class="dash-answer-main">
                <RouterLink :to="ans.detail" class="dash-answer-kw">{{ ans.title }}</RouterLink>
                <p class="dash-answer-snippet">{{ ans.snippet }}</p>
              </div>
              <div class="dash-answer-meta">
                <span class="dash-badge" :class="ans.inAnswer ? 'ok' : 'miss'">
                  {{ ans.inAnswer ? "进答案" : "未进答案" }}
                </span>
                <span class="dash-badge cite-miss">{{ ans.citeLabel }}</span>
                <span class="geo-kw-flag warn">
                  <RouterLink :to="ans.diagLink">{{ ans.diagCode }}</RouterLink>
                </span>
              </div>
            </article>
          </div>
        </section>

        <p class="dash-proto-link">
          <a
            href="/__geo_marketing/console/keyword-detail.md"
            target="_blank"
            rel="noopener"
          >产品解读</a>
          · 总览见 <RouterLink :to="{ name: 'geo-dashboard' }">可见性读口 ①</RouterLink>
        </p>
      </div>
    </div>
  </main>
</template>
