<script setup lang="ts">
import { computed } from "vue";
import { useDashboardInteractions } from "./dashboardInteractions";
import {
  brandName,
  competitorRows,
  kpis,
  lastUpdated,
  marketLabels,
  periodLabels,
  recentAnswers,
  sentiment,
  trendPoints,
  type MarketFilter,
  type Period,
} from "./mock";
import "./dashboard.css";

const {
  market,
  period,
  showSoaTip,
  showOnboard,
  filteredPlatforms,
  setMarket,
  setPeriod,
  dismissSoaTip,
  dismissOnboard,
} = useDashboardInteractions();

const markets: MarketFilter[] = ["all", "overseas", "domestic"];
const periods: Period[] = ["day", "week", "month"];

const overseasPlatforms = computed(() =>
  filteredPlatforms.value.filter((p) => p.market === "overseas"),
);
const domesticPlatforms = computed(() =>
  filteredPlatforms.value.filter((p) => p.market === "domestic"),
);

const showOverseasTrend = computed(
  () => market.value === "all" || market.value === "overseas",
);
const showDomesticTrend = computed(
  () => market.value === "all" || market.value === "domestic",
);

function trendPolyline(values: number[], width: number, height: number) {
  const max = 100;
  const step = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

const trendSvg = computed(() => {
  const w = 560;
  const h = 72;
  return {
    w,
    h,
    overseas: trendPolyline(trendPoints.overseas, w, h),
    domestic: trendPolyline(trendPoints.domestic, w, h),
  };
});

function freshClass(fresh: string) {
  if (fresh === "today") return "fresh-today";
  if (fresh === "stale") return "fresh-stale";
  return "fresh-old";
}

function kpiVisible(tone: string) {
  if (market.value === "all") return true;
  if (market.value === "overseas") return tone === "overseas" || tone === "primary" || tone === "neutral";
  return tone === "domestic" || tone === "primary" || tone === "neutral";
}
</script>

<template>
  <div class="geo-dash">
    <header class="geo-dash-toolbar">
      <div>
        <h1 class="geo-dash-title">{{ brandName }} · 可见性概览</h1>
        <p class="geo-dash-meta">上次更新：{{ lastUpdated }}</p>
      </div>
      <div class="geo-dash-controls">
        <div class="geo-dash-tabs" role="tablist" aria-label="市场">
          <button
            v-for="m in markets"
            :key="m"
            type="button"
            role="tab"
            class="geo-dash-tab"
            :class="{ on: market === m }"
            :aria-selected="market === m"
            @click="setMarket(m)"
          >
            {{ marketLabels[m] }}
          </button>
        </div>
        <div class="geo-dash-tabs geo-dash-tabs--muted" role="tablist" aria-label="周期">
          <button
            v-for="p in periods"
            :key="p"
            type="button"
            role="tab"
            class="geo-dash-tab"
            :class="{ on: period === p }"
            :aria-selected="period === p"
            @click="setPeriod(p)"
          >
            {{ p === "day" ? "日" : p === "week" ? "周" : "月" }}
          </button>
        </div>
      </div>
    </header>

    <section class="geo-dash-kpi" aria-label="关键指标">
      <article
        v-for="card in kpis"
        :key="card.label"
        v-show="kpiVisible(card.tone)"
        class="geo-metric-card"
        :class="card.tone"
      >
        <div class="geo-metric-label">{{ card.label }}</div>
        <div class="geo-metric-value">{{ card.value }}</div>
        <div
          class="geo-metric-delta"
          :class="{ up: card.deltaUp === true, down: card.deltaUp === false }"
        >
          {{ card.delta }}
        </div>
      </article>
      <article class="geo-dash-sentiment" aria-label="基础情感">
        <div class="geo-metric-label">情感倾向</div>
        <div class="geo-sentiment-bar">
          <span class="pos" :style="{ width: `${sentiment.positive}%` }" />
          <span class="neu" :style="{ width: `${sentiment.neutral}%` }" />
          <span class="neg" :style="{ width: `${sentiment.negative}%` }" />
        </div>
        <p class="geo-sentiment-legend">
          正面 {{ sentiment.positive }}% · 中性 {{ sentiment.neutral }}% · 负面
          {{ sentiment.negative }}%
        </p>
      </article>
    </section>

    <section class="geo-dash-trend-card">
      <div class="geo-dash-trend-head">
        <h2>SOA 趋势</h2>
        <span class="geo-dash-period-hint">{{ periodLabels[period] }}</span>
        <div class="geo-soa-tip-wrap">
          <button
            type="button"
            class="geo-soa-tip-btn"
            aria-label="SOA 释义"
            @click="showSoaTip = !showSoaTip"
          >
            ?
          </button>
          <div v-if="showSoaTip" class="geo-soa-tip" role="tooltip">
            <p>
              <strong>SOA（Share of Answer）</strong>：在监测问题集中，品牌名出现在 AI
              回答中的占比。
            </p>
            <button type="button" class="geo-soa-tip-close" @click="dismissSoaTip">
              知道了
            </button>
          </div>
        </div>
      </div>
      <div class="geo-dash-trend-legend">
        <span v-if="showOverseasTrend" class="leg overseas">海外 SOA</span>
        <span v-if="showDomesticTrend" class="leg domestic">国内 SOA</span>
      </div>
      <div class="geo-dash-chart" aria-hidden="true">
        <svg
          :viewBox="`0 0 ${trendSvg.w} ${trendSvg.h}`"
          preserveAspectRatio="none"
        >
          <polyline
            v-if="showOverseasTrend"
            :points="trendSvg.overseas"
            fill="none"
            stroke="var(--geo-overseas)"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <polyline
            v-if="showDomesticTrend"
            :points="trendSvg.domestic"
            fill="none"
            stroke="var(--geo-domestic)"
            stroke-width="2"
            stroke-dasharray="4 3"
            opacity="0.85"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </section>

    <div class="geo-dash-split">
      <section class="geo-dash-panel" aria-labelledby="platforms-heading">
        <h2 id="platforms-heading">平台 SOA 分布</h2>
        <div v-if="market !== 'domestic'" class="geo-platform-group">
          <h3>海外</h3>
          <div
            v-for="p in overseasPlatforms"
            :key="p.id"
            class="geo-platform-row"
          >
            <span class="geo-platform-name">
              <span class="fresh-dot" :class="freshClass(p.fresh)" aria-hidden="true" />
              {{ p.name }}
            </span>
            <div class="geo-platform-bar-wrap">
              <div class="geo-platform-bar overseas" :style="{ width: `${p.soa}%` }" />
            </div>
            <span class="geo-platform-pct">{{ p.soa }}%</span>
          </div>
        </div>
        <div v-if="market !== 'overseas'" class="geo-platform-group">
          <h3>国内</h3>
          <div
            v-for="p in domesticPlatforms"
            :key="p.id"
            class="geo-platform-row"
          >
            <span class="geo-platform-name">
              <span class="fresh-dot" :class="freshClass(p.fresh)" aria-hidden="true" />
              {{ p.name }}
            </span>
            <div class="geo-platform-bar-wrap">
              <div class="geo-platform-bar domestic" :style="{ width: `${p.soa}%` }" />
            </div>
            <span class="geo-platform-pct">{{ p.soa }}%</span>
          </div>
        </div>
      </section>

      <section class="geo-dash-panel" aria-labelledby="competitors-heading">
        <h2 id="competitors-heading">竞品对比 · 品类词</h2>
        <table class="geo-comp-table">
          <thead>
            <tr>
              <th>问题</th>
              <th>{{ brandName }}</th>
              <th>OpenRouter</th>
              <th>TokenHub</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in competitorRows" :key="row.question">
              <td class="q">{{ row.question }}</td>
              <td :class="{ weak: row.ours < 20 }">{{ row.ours }}%</td>
              <td>{{ row.openrouter }}%</td>
              <td>{{ row.tokenhub }}%</td>
            </tr>
          </tbody>
        </table>
        <a href="#" class="geo-dash-link" title="规划：/console/competitors">查看竞品概览 →</a>
      </section>
    </div>

    <section class="geo-dash-panel geo-dash-answers" aria-labelledby="answers-heading">
      <h2 id="answers-heading">最新 AI 回答</h2>
      <ul class="geo-answer-list">
        <li v-for="row in recentAnswers" :key="row.id" class="geo-answer-item">
          <span
            class="platform"
            :class="row.market === 'overseas' ? 'p-overseas' : 'p-domestic'"
          >
            {{ row.platform }}
          </span>
          <a href="#" class="keyword" :title="`规划：关键词详情 ${row.keyword}`">
            {{ row.keyword }}
          </a>
          <p class="snippet" v-html="row.snippet.replace(/Trinity AI|OpenRouter|TokenHub/g, (m) => `<mark>${m}</mark>`)" />
          <span class="status" :class="row.inAnswer ? 'in' : 'out'">
            {{ row.inAnswer ? "进答案" : "未进答案" }}
          </span>
          <span class="ago">{{ row.ago }}</span>
        </li>
      </ul>
    </section>

    <div v-if="showOnboard" class="geo-onboard" role="dialog" aria-labelledby="onboard-title">
      <div class="geo-onboard-card">
        <h3 id="onboard-title">3 步快速上手</h3>
        <ol>
          <li class="done">添加品牌</li>
          <li class="done">配置关键词（示例 10 条）</li>
          <li class="current">查看 SOA 与竞品差距</li>
        </ol>
        <button type="button" class="geo-btn-dismiss" @click="dismissOnboard">
          开始使用
        </button>
      </div>
    </div>
  </div>
</template>
