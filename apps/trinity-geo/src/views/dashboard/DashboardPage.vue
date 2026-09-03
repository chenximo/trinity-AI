<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { freshClass, useDashboardInteractions } from "./dashboardInteractions";
import {
  brandName,
  competitorRows,
  kpis,
  lastUpdated,
  marketLabels,
  periodLabels,
  recentAnswers,
  sentiment,
} from "./mock";
import "./dashboard.css";

const {
  market,
  period,
  showOnboard,
  overseasPlatforms,
  domesticPlatforms,
  showOverseas,
  showDomestic,
  periodLabel,
  setMarket,
  setPeriod,
  kpiCardClass,
  dismissOnboard,
} = useDashboardInteractions();

const markets = ["all", "overseas", "domestic"] as const;
const periods = ["day", "week", "month"] as const;

const toolbarMeta = computed(
  () =>
    `上次更新：${lastUpdated} · 监测问题 10 条（品类 3 / 品牌 4 / 对比 2 / 场景 1）`,
);
</script>

<template>
  <main class="geo-console-main dash-overview">
    <div class="dash-alert-strip" aria-label="异动与运营通知">
      <span class="dash-alert-pill warn">⚠ 品类词 SOA 仍为 0% · 已邮件告警</span>
      <span class="dash-alert-pill info">📊 本周 GEO 周报已生成</span>
      <span class="dash-alert-pill ok">✓ 今日 10 平台采集完成</span>
    </div>

    <div class="dash-toolbar">
      <div>
        <h1>{{ brandName }} · 可见性概览</h1>
        <p class="dash-toolbar-meta">
          {{ toolbarMeta }} ·
          <RouterLink :to="{ name: 'geo-keywords' }">管理问题集</RouterLink>
        </p>
      </div>
      <div class="dash-toolbar-controls">
        <div class="dash-tabs" role="tablist" aria-label="市场筛选">
          <button
            v-for="m in markets"
            :key="m"
            type="button"
            :class="{ on: market === m }"
            role="tab"
            :aria-selected="market === m"
            @click="setMarket(m)"
          >
            {{ marketLabels[m] }}
          </button>
        </div>
        <div class="dash-period" role="tablist" aria-label="趋势周期">
          <button
            v-for="p in periods"
            :key="p"
            type="button"
            :class="{ on: period === p }"
            role="tab"
            :aria-selected="period === p"
            @click="setPeriod(p)"
          >
            {{ p === "day" ? "日" : p === "week" ? "周" : "月" }}
          </button>
        </div>
      </div>
    </div>

    <nav class="geo-read-hub" aria-label="测量读口">
      <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-read-hub-card is-current">
        <span class="geo-read-hub-kicker">读口 ①</span>
        <strong>可见性</strong>
        <span>SOA · 竞品 · 趋势</span>
      </RouterLink>
      <RouterLink :to="{ name: 'geo-citations' }" class="geo-read-hub-card">
        <span class="geo-read-hub-kicker">读口 ②③</span>
        <strong>引用与信源</strong>
        <span>CCR · 信源盘 M/N</span>
      </RouterLink>
      <RouterLink :to="{ name: 'geo-sentiment' }" class="geo-read-hub-card">
        <span class="geo-read-hub-kicker">读口 · 口碑</span>
        <strong>情感</strong>
        <span>正 / 中 / 负 · 提及流</span>
      </RouterLink>
      <RouterLink :to="{ name: 'geo-optimize' }" class="geo-read-hub-card">
        <span class="geo-read-hub-kicker">读口 · 行动</span>
        <strong>优化与效果</strong>
        <span>待办 · R1/R2 验证</span>
      </RouterLink>
    </nav>

    <p class="dash-section-label">可见性 · SOA 与提及</p>
    <div class="dash-kpi-row">
      <div
        v-for="card in kpis"
        :key="card.label"
        class="geo-metric-card"
        :class="[card.tone, kpiCardClass(card.tone)]"
      >
        <div class="geo-metric-label">{{ card.label }}</div>
        <div class="geo-metric-value">{{ card.value }}</div>
        <div
          class="geo-metric-delta"
          :class="{ up: card.deltaUp === true, down: card.deltaUp === false }"
        >
          {{ card.delta }}
        </div>
      </div>
    </div>
    <p class="dash-ccr-legend">
      <strong>SOA</strong> = 进答案正文 ·
      <RouterLink :to="{ name: 'geo-citations' }">引用与信源</RouterLink>（CCR、信源 M/N）·
      <RouterLink :to="{ name: 'geo-sentiment' }">情感 {{ sentiment.positive }}% 正</RouterLink>
      — 分列读口，避免混读
    </p>

    <p class="dash-section-label">可见性 · 分平台与竞品</p>
    <div class="dash-visibility-board">
      <section class="dash-vis-col" aria-labelledby="platform-heading">
        <h2 id="platform-heading" class="dash-split-title">平台 SOA 分布</h2>
        <div v-if="showOverseas" class="dash-platform-group">
          <h3 class="overseas">海外 · {{ overseasPlatforms.length }} 平台</h3>
          <div
            v-for="p in overseasPlatforms"
            :key="p.id"
            class="dash-platform-row"
          >
            <span class="dash-platform-pill overseas">
              <span class="dash-fresh" :class="freshClass(p.fresh)" />
              {{ p.name }}
            </span>
            <div class="dash-platform-bar overseas">
              <span :style="{ width: `${p.soa}%` }" />
            </div>
            <span class="dash-platform-val">{{ p.soa }}%</span>
          </div>
        </div>
        <div v-if="showDomestic" class="dash-platform-group">
          <h3 class="domestic">国内 · {{ domesticPlatforms.length }} 平台</h3>
          <div
            v-for="p in domesticPlatforms"
            :key="p.id"
            class="dash-platform-row"
          >
            <span class="dash-platform-pill domestic">
              <span class="dash-fresh" :class="freshClass(p.fresh)" />
              {{ p.name }}
            </span>
            <div class="dash-platform-bar domestic">
              <span :style="{ width: `${p.soa}%` }" />
            </div>
            <span class="dash-platform-val">{{ p.soa }}%</span>
          </div>
        </div>
      </section>

      <section class="dash-vis-col dash-vis-mid" aria-label="行业排名与叙事主题">
        <div class="dash-vis-mid-block" aria-labelledby="rank-heading">
          <h2 id="rank-heading" class="dash-split-title">行业可见性排名 · 品类词</h2>
          <ol class="geo-comp-rank-list dash-brand-rank">
            <li>
              <span class="geo-comp-rank-name">
                <RouterLink :to="{ name: 'geo-competitor-detail' }">OpenRouter</RouterLink>
              </span>
              <span class="geo-comp-rank-bar"><span style="width: 68%" /></span>
              <span class="geo-comp-rank-val">68%</span>
            </li>
            <li>
              <span class="geo-comp-rank-name">
                <RouterLink :to="{ name: 'geo-competitor-detail' }">TokenHub</RouterLink>
              </span>
              <span class="geo-comp-rank-bar"><span style="width: 52%" /></span>
              <span class="geo-comp-rank-val">52%</span>
            </li>
            <li class="is-us">
              <span class="geo-comp-rank-name">Trinity AI</span>
              <span class="geo-comp-rank-bar us"><span style="width: 18%" /></span>
              <span class="geo-comp-rank-val">18%</span>
            </li>
            <li>
              <span class="geo-comp-rank-name">LiteLLM</span>
              <span class="geo-comp-rank-bar"><span style="width: 14%" /></span>
              <span class="geo-comp-rank-val">14%</span>
            </li>
          </ol>
        </div>
        <div class="dash-vis-mid-block" aria-labelledby="theme-heading">
          <h2 id="theme-heading" class="dash-split-title">叙事主题 · 提及中 Top</h2>
          <p class="geo-settings-card-desc dash-vis-mid-hint">
            有品牌提及的采样 · <RouterLink :to="{ name: 'geo-sentiment' }">情感读口 →</RouterLink>
          </p>
          <ul class="geo-theme-list">
            <li>
              <span class="geo-theme-name">企业计费 / 团队管控</span>
              <span class="geo-theme-bar"><span style="width: 78%" /></span>
              <span class="geo-theme-val">78%</span>
            </li>
            <li>
              <span class="geo-theme-name">OpenAI 兼容 / 统一网关</span>
              <span class="geo-theme-bar"><span style="width: 65%" /></span>
              <span class="geo-theme-val">65%</span>
            </li>
            <li>
              <span class="geo-theme-name">国内线路 / 出海双栈</span>
              <span class="geo-theme-bar"><span style="width: 41%" /></span>
              <span class="geo-theme-val">41%</span>
            </li>
          </ul>
        </div>
      </section>

      <section class="dash-vis-col dash-comp-col" aria-labelledby="comp-heading">
        <div class="dash-split-title-row">
          <h2 id="comp-heading" class="dash-split-title">竞品对比 · 品类词 Top 3</h2>
          <RouterLink :to="{ name: 'geo-competitors' }" class="geo-btn ghost sm">查看全部 →</RouterLink>
        </div>
        <table class="dash-comp-table">
          <thead>
            <tr>
              <th>监测问题</th>
              <th>我方</th>
              <th>OpenRouter</th>
              <th>TokenHub</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in competitorRows" :key="row.question">
              <td>
                <RouterLink :to="{ name: 'geo-keyword-detail', query: { q: 'Q00' } }">
                  {{ row.question }}
                </RouterLink>
              </td>
              <td class="num" :class="{ low: row.ours < 20, mid: row.ours >= 20 && row.ours < 40 }">
                {{ row.ours }}%
              </td>
              <td class="num">{{ row.openrouter }}%</td>
              <td class="num">{{ row.tokenhub }}%</td>
            </tr>
          </tbody>
        </table>
        <div class="dash-comp-col-fill" aria-labelledby="comp-trend-heading">
          <h3 id="comp-trend-heading" class="dash-comp-fill-title">
            SOA 趋势 · <span>{{ periodLabel }}</span>
          </h3>
          <div class="dash-trend-legend dash-trend-legend-multi dash-comp-fill-legend">
            <span class="line-overseas">我方 · 海外</span>
            <span class="line-domestic">我方 · 国内</span>
            <span class="line-comp-a">OpenRouter</span>
            <span class="line-comp-b">TokenHub</span>
          </div>
          <div class="dash-trend-chart dash-comp-fill-chart" aria-hidden="true">
            <svg viewBox="0 0 400 120" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="400" y2="100" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4 4" />
              <polyline
                points="0,72 50,68 100,62 150,58 200,52 250,48 300,42 350,38 400,34"
                fill="none"
                stroke="#2563eb"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <polyline
                points="0,88 50,86 100,84 150,82 200,78 250,76 300,74 350,72 400,70"
                fill="none"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-dasharray="5 4"
                opacity="0.85"
              />
              <polyline
                points="0,42 50,40 100,38 150,36 200,34 250,32 300,30 350,28 400,26"
                fill="none"
                stroke="#7c3aed"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.75"
              />
              <polyline
                points="0,48 50,50 100,49 150,51 200,50 250,52 300,51 350,53 400,52"
                fill="none"
                stroke="#64748b"
                stroke-width="1.75"
                stroke-linecap="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
      </section>
    </div>

    <section class="dash-panel dash-panel-actions" aria-labelledby="actions-heading">
      <header class="dash-panel-head">
        <h2 id="actions-heading">诊断 · 优化 · 验证</h2>
      </header>
      <div class="dash-action-grid">
        <div class="dash-action-col">
          <div class="dash-action-col-head">
            <h3>④ 诊断</h3>
            <RouterLink :to="{ name: 'geo-diagnosis' }">全部 →</RouterLink>
          </div>
          <div class="dash-diag-list">
            <article class="dash-diag-item">
              <span class="dash-diag-code d1">D1</span>
              <div>
                <p class="dash-diag-title">
                  <RouterLink :to="{ name: 'geo-diagnosis', hash: '#diag-q00' }">
                    品类失声 · 推荐两款 API 聚合平台
                  </RouterLink>
                </p>
                <p class="dash-diag-meta">豆包 · SOA 0% · 参考盘 16 链 0 我方</p>
              </div>
              <span class="dash-diag-priority p0">P0</span>
            </article>
            <article class="dash-diag-item">
              <span class="dash-diag-code d4">D4</span>
              <div>
                <p class="dash-diag-title">叙事落后 · Trinity vs OpenRouter 国内开发者</p>
                <p class="dash-diag-meta">竞品首推 · 建议增加对比表</p>
              </div>
              <span class="dash-diag-priority p1">P1</span>
            </article>
            <article class="dash-diag-item">
              <span class="dash-diag-code d3">D3</span>
              <div>
                <p class="dash-diag-title">弱提及 · trinitydesk 是什么平台</p>
                <p class="dash-diag-meta">仅边缘一句 · 未进正文核心段落</p>
              </div>
              <span class="dash-diag-priority p1">P1</span>
            </article>
          </div>
          <p class="dash-action-foot">
            <RouterLink :to="{ name: 'geo-audit' }">页面审计</RouterLink> · 红灯 2 ·
            <RouterLink :to="{ name: 'geo-audit-reports' }">审计报告</RouterLink>
          </p>
        </div>
        <div class="dash-action-col">
          <div class="dash-action-col-head">
            <h3>⑤ 优化</h3>
            <RouterLink :to="{ name: 'geo-optimize' }">全部 →</RouterLink>
          </div>
          <ul class="dash-opt-list">
            <li class="dash-opt-item">
              <span class="dash-opt-status" />
              <div class="dash-opt-body">
                <strong>
                  <RouterLink :to="{ name: 'geo-optimize', hash: '#opt-s1s2' }">
                    D1·S1+S2 · doc 对标 openrouter.ai/docs
                  </RouterLink>
                </strong>
                <p>Q00 信源 0/16 · 截止 6/18</p>
              </div>
            </li>
            <li class="dash-opt-item">
              <span class="dash-opt-status" />
              <div class="dash-opt-body">
                <strong>
                  <RouterLink :to="{ name: 'geo-optimize', hash: '#opt-d4' }">
                    D4 · vs OpenRouter 对比表
                  </RouterLink>
                </strong>
                <p>国内开发者选型 · 进行中</p>
              </div>
            </li>
            <li class="dash-opt-item">
              <span class="dash-opt-status done" />
              <div class="dash-opt-body">
                <strong>D2 · 官网统一 Trinity AI / Desk 别名</strong>
                <p>已发布 · 待 R2 验证</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="dash-action-col">
          <div class="dash-action-col-head">
            <h3>⑥ 验证</h3>
            <RouterLink :to="{ name: 'geo-verify' }">效果验证 →</RouterLink>
          </div>
          <div class="dash-verify-stack">
            <div class="dash-verify-compare">
              <div class="dash-verify-round">
                <div class="label">Q00 信源</div>
                <div class="val">0/16 → 1/17</div>
              </div>
              <span class="dash-verify-delta">先进盘</span>
            </div>
            <div class="dash-verify-compare">
              <div class="dash-verify-round">
                <div class="label">Q01 CCR</div>
                <div class="val">1/3 → 2/3</div>
              </div>
              <span class="dash-verify-delta">↑</span>
            </div>
            <div class="dash-verify-compare">
              <div class="dash-verify-round">
                <div class="label">品牌 SOA</div>
                <div class="val">28% → 34%</div>
              </div>
              <span class="dash-verify-delta">↑ 6pt</span>
            </div>
          </div>
          <p class="dash-action-foot">
            <RouterLink :to="{ name: 'geo-verify', hash: '#verify-q00' }">Q00 详情</RouterLink> ·
            <RouterLink :to="{ name: 'geo-verify', hash: '#verify-q01' }">Q01 详情</RouterLink>
          </p>
        </div>
      </div>
    </section>

    <div class="dash-ops-split dash-split-flat">
      <section class="dash-split-col" aria-labelledby="alert-heading">
        <h2 id="alert-heading" class="dash-split-title">自动化运营 · 最近告警</h2>
        <ul class="dash-ops-list">
          <li><strong>6/12 08:00</strong> 品类词 SOA 跌超阈值（0% → 邮件）</li>
          <li><strong>6/11 18:20</strong> 竞品 TokenHub 在新问题集出现覆盖</li>
          <li><strong>6/10 09:00</strong> 国内 SOA 周环比 -3%（预警）</li>
        </ul>
      </section>
      <section class="dash-split-col" aria-labelledby="gov-heading">
        <h2 id="gov-heading" class="dash-split-title">治理 · 合规与风险</h2>
        <ul class="dash-ops-list">
          <li><strong>幻觉监测</strong> 1 条待复核（豆包误述定价）</li>
          <li><strong>负面提及</strong> 本周 3 次 · 占比 7%</li>
          <li><strong>合规审查</strong> 待推送内容 0 条红灯</li>
        </ul>
      </section>
    </div>

    <p class="dash-section-label">② 监测 · 最新证据</p>
    <section class="dash-panel" aria-labelledby="answers-heading">
      <header class="dash-panel-head">
        <h2 id="answers-heading">最新 AI 回答</h2>
      </header>
      <div class="dash-answer-list">
        <article v-for="row in recentAnswers" :key="row.id" class="dash-answer-item">
          <div class="dash-answer-main">
            <RouterLink
              :to="{ name: 'geo-answer-detail', query: { id: row.id } }"
              class="dash-answer-kw"
            >
              {{ row.keyword }}
            </RouterLink>
            <p class="dash-answer-snippet">
              <span class="platform" :class="row.market === 'overseas' ? 'p-overseas' : 'p-domestic'">
                {{ row.platform }}
              </span>
              「{{ row.snippet }}」
            </p>
          </div>
          <div class="dash-answer-meta">
            <span class="dash-badge" :class="row.inAnswer ? 'ok' : 'miss'">
              {{ row.inAnswer ? "进答案" : "未进答案" }}
            </span>
            <div class="dash-answer-time">{{ row.ago }}</div>
          </div>
        </article>
      </div>
    </section>

    <p class="dash-proto-link">
      Vue 交付工程 · 对照
      <a href="/__geo_marketing/console/dashboard.html" target="_blank" rel="noopener">HTML 原型</a>
      ·
      <RouterLink :to="{ name: 'trinity-geo' }">营销首页</RouterLink>
    </p>

    <div
      v-if="showOnboard"
      class="dash-onboard-backdrop"
      role="dialog"
      aria-labelledby="onboard-title"
      aria-modal="true"
      @click.self="dismissOnboard"
    >
      <div class="dash-onboard" @click.stop>
        <div class="dash-onboard-head">
          <h3 id="onboard-title">GEO 六环 · 快速上手</h3>
          <button type="button" class="dash-onboard-dismiss" aria-label="关闭" @click="dismissOnboard">
            ×
          </button>
        </div>
        <ol>
          <li class="done">① 策略：品牌 · 问题集 · 竞品</li>
          <li class="done">② 监测：10 平台采集</li>
          <li class="current">③–⑥ 在本页看测量、诊断、优化与验证</li>
        </ol>
        <button type="button" class="dash-onboard-close" @click="dismissOnboard">开始查看总览</button>
      </div>
    </div>
  </main>
</template>
