<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  VERIFY_KPIS,
  VERIFY_RULE_ROWS,
  VERIFY_SPOTLIGHT,
  VERIFY_TYPE_FILTERS,
  toRouterLink,
} from "./mock";
import { useVerifyInteractions } from "./verifyInteractions";
import "./verify.css";

const {
  search,
  typeFilter,
  filteredIndexRows,
  filteredCases,
  spotlightVisible,
  isSingleCol,
  listMeta,
  resultCountLabel,
  isEmpty,
  setTypeFilter,
  isHighlighted,
} = useVerifyInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="优化子导航">
        <p class="geo-settings-sidebar-title">优化</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-optimize' }">优化待办</RouterLink>
          <RouterLink :to="{ name: 'geo-verify' }" class="is-active" aria-current="page">
            效果验证
          </RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-verify-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">⑥ 验证</p>
            <div class="geo-page-title-row">
              <h1>效果验证</h1>
            </div>
            <p class="geo-verify-lead">
              对比优化前后采集轮次 · <strong>先看信源盘 Δ，再看 SOA Δ</strong> · 动作来自
              <RouterLink :to="{ name: 'geo-optimize' }">优化待办</RouterLink>
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-optimize' }" class="geo-btn ghost">返回待办</RouterLink>
            <button type="button" class="geo-btn primary" disabled title="商用：触发 R2 全量采集">
              触发 R2 采集
            </button>
          </div>
        </div>

        <div class="geo-verify-scope-bar">
          <p class="geo-form-hint geo-verify-scope-note">
            验收顺序：信源盘我方域 → CCR 命中 → 正文 SOA（SOA 可滞后数轮）。 Q00 样本展示「<strong>先进盘、后进答案</strong>」· 数据
            <code>mvp/data/r2/verify.json</code>
          </p>
        </div>

        <p class="dash-section-label">R1 → R2 · 汇总</p>
        <div class="dash-kpi-row geo-verify-kpi">
          <div
            v-for="kpi in VERIFY_KPIS"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value" :class="{ 'geo-metric-value-sm': kpi.valueSm }">
              {{ kpi.value }}
            </div>
            <div class="geo-metric-delta">{{ kpi.delta }}</div>
          </div>
        </div>

        <section class="geo-verify-list-section" aria-labelledby="verify-list-heading">
          <header class="geo-kw-list-head">
            <div>
              <h2 id="verify-list-heading">验证任务</h2>
              <p class="geo-kw-list-desc">
                按 question × platform 对比 R1 / R2 ·
                <span>{{ listMeta }}</span>
              </p>
            </div>
          </header>

          <div class="geo-kw-toolbar geo-verify-toolbar">
            <div class="geo-kw-search">
              <input
                v-model="search"
                type="search"
                placeholder="搜索 Q ID、动作、平台…"
                aria-label="搜索验证任务"
              />
            </div>
            <div class="geo-kw-status-filters geo-verify-type-filters" role="tablist" aria-label="验证类型">
              <button
                v-for="opt in VERIFY_TYPE_FILTERS"
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

          <div
            v-show="spotlightVisible"
            :id="VERIFY_SPOTLIGHT.id"
            class="geo-verify-spotlight"
            :class="{ 'is-highlighted': isHighlighted(VERIFY_SPOTLIGHT.id) }"
            aria-label="Q00 验证样本"
          >
            <span class="geo-verify-badge" :class="VERIFY_SPOTLIGHT.badge">
              {{ VERIFY_SPOTLIGHT.badgeLabel }}
            </span>
            <span class="geo-verify-spotlight-title">
              <strong>{{ VERIFY_SPOTLIGHT.titleStrong }}</strong>
              {{ VERIFY_SPOTLIGHT.titleRest }}
            </span>
            <span class="geo-verify-spotlight-fact">{{ VERIFY_SPOTLIGHT.fact }}</span>
            <span class="geo-verify-spotlight-links">
              <RouterLink
                v-for="link in VERIFY_SPOTLIGHT.links"
                :key="link.label"
                :to="toRouterLink(link.to)"
              >
                {{ link.label }}
              </RouterLink>
            </span>
          </div>

          <div class="geo-kw-table-wrap geo-verify-index-wrap">
            <table class="geo-kw-table geo-verify-index-table">
              <thead>
                <tr>
                  <th scope="col">判定</th>
                  <th scope="col">问题</th>
                  <th scope="col">平台</th>
                  <th scope="col">领先 Δ</th>
                  <th scope="col">SOA</th>
                  <th scope="col">动作</th>
                  <th scope="col"><span class="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredIndexRows"
                  :key="row.questionId"
                  class="geo-verify-index-row"
                >
                  <td>
                    <span class="geo-verify-badge" :class="row.badge">{{ row.badgeLabel }}</span>
                  </td>
                  <td>
                    <RouterLink :to="{ hash: row.detailHash }" class="geo-verify-index-q">
                      <strong>{{ row.questionId }}</strong> {{ row.questionTitle }}
                    </RouterLink>
                  </td>
                  <td>{{ row.platform }}</td>
                  <td class="geo-verify-trend" :class="row.citeTrendClass">{{ row.citeTrend }}</td>
                  <td class="geo-verify-trend" :class="row.soaTrendClass">{{ row.soaTrend }}</td>
                  <td>
                    <RouterLink :to="toRouterLink(row.actionLink)" class="mono">
                      {{ row.actionId }}
                    </RouterLink>
                  </td>
                  <td class="geo-kw-actions">
                    <RouterLink :to="{ hash: row.detailHash }" class="geo-btn text">明细</RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="isEmpty" class="geo-kw-empty">没有匹配的验证项。</p>
          </div>
        </section>

        <p class="dash-section-label geo-verify-detail-label">R1 → R2 · 明细</p>

        <div
          id="verify-detail-grid"
          class="geo-verify-detail-grid"
          :class="{ 'is-single-col': isSingleCol }"
        >
          <article
            v-for="verifyCase in filteredCases"
            :id="verifyCase.id"
            :key="verifyCase.id"
            class="geo-verify-case"
            :class="{ 'is-highlighted': isHighlighted(verifyCase.id) }"
            :aria-labelledby="`${verifyCase.id}-heading`"
          >
            <header class="geo-verify-case-head">
              <div>
                <h3 :id="`${verifyCase.id}-heading`">{{ verifyCase.title }}</h3>
                <p class="geo-verify-case-meta">
                  {{ verifyCase.metaBefore }}
                  <RouterLink :to="toRouterLink(verifyCase.metaActionLink)">
                    {{ verifyCase.metaActionLabel }}
                  </RouterLink>
                  {{ verifyCase.metaAfter }}
                </p>
              </div>
              <span class="geo-verify-badge" :class="verifyCase.badge">
                {{ verifyCase.badgeLabel }}
              </span>
            </header>
            <p class="geo-verify-case-verdict">{{ verifyCase.verdict }}</p>
            <div class="geo-kw-table-wrap geo-verify-r12-wrap">
              <table class="geo-kw-table geo-verify-r12-table">
                <thead>
                  <tr>
                    <th scope="col">指标</th>
                    <th scope="col">R1 → R2</th>
                    <th scope="col">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r12 in verifyCase.r12Rows"
                    :key="r12.label"
                    class="geo-verify-r12-row"
                    :class="{ 'is-primary': r12.primary }"
                  >
                    <th scope="row">{{ r12.label }}</th>
                    <td class="geo-verify-r12-pair">
                      <span
                        v-if="r12.r1Gap"
                        class="geo-verify-r12-gap"
                      >{{ r12.r1 }}</span>
                      <span v-else class="num" :class="r12.r1Class">{{ r12.r1 }}</span>
                      <span class="geo-verify-r12-arrow" aria-hidden="true">→</span>
                      <span
                        v-if="r12.r2Gap"
                        class="geo-verify-r12-gap"
                      >{{ r12.r2 }}</span>
                      <span v-else class="num" :class="r12.r2Class">{{ r12.r2 }}</span>
                    </td>
                    <td>
                      <span class="dash-verify-delta" :class="r12.deltaClass">{{ r12.delta }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <details class="geo-verify-added-details">
              <summary>{{ verifyCase.addedSummary }}</summary>
              <ul class="geo-verify-cite-compact">
                <li v-for="cite in verifyCase.addedCites" :key="cite.href">
                  <a :href="cite.href" rel="noopener noreferrer" target="_blank">{{ cite.label }}</a>
                  <span class="geo-verify-new">{{ cite.tag }}</span>
                  <span class="geo-verify-cite-desc">{{ cite.desc }}</span>
                </li>
              </ul>
              <p class="geo-form-hint">
                {{ verifyCase.addedHintPrefix }}
                <template v-for="(hintLink, idx) in verifyCase.addedHintLinks" :key="hintLink.label">
                  <RouterLink :to="toRouterLink(hintLink.to)">{{ hintLink.label }}</RouterLink>
                  <template
                    v-if="idx < verifyCase.addedHintLinks.length - 1 || verifyCase.addedHintCode"
                  >
                    ·
                  </template>
                </template>
                <code v-if="verifyCase.addedHintCode">{{ verifyCase.addedHintCode }}</code>
              </p>
            </details>
            <p class="geo-verify-case-links">
              <template v-for="(link, idx) in verifyCase.footerLinks" :key="link.label">
                <span v-if="idx > 0" aria-hidden="true"> · </span>
                <RouterLink :to="toRouterLink(link.to)">{{ link.label }}</RouterLink>
              </template>
            </p>
          </article>
        </div>

        <details class="geo-verify-rules-details">
          <summary>验证规则速查（信源 → CCR → SOA）</summary>
          <div class="geo-kw-table-wrap">
            <table class="geo-kw-table geo-verify-rules-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>含义</th>
                  <th>通常顺序</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rule in VERIFY_RULE_ROWS" :key="rule.metric">
                  <td>{{ rule.metric }}</td>
                  <td>{{ rule.meaning }}</td>
                  <td>{{ rule.order }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="geo-form-hint">
            <a
              href="/__geo_marketing/console/verify.md"
              target="_blank"
              rel="noopener"
            >产品设计 §0.6 ⑤ 验证层</a>
            ·
            <a href="/__geo_marketing/console/verify.md" target="_blank" rel="noopener">单页 PRD</a>
          </p>
        </details>

        <p class="dash-proto-link">
          效果验证原型 v0.2 ·
          <a href="/__geo_marketing/console/verify.md" target="_blank" rel="noopener">产品解读</a>
        </p>
      </div>
    </div>
  </main>
</template>
