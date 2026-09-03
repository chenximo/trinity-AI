<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  AUDIT_BENCHMARK_ROWS,
  AUDIT_KPIS,
  AUDIT_PAGES,
  LAMP_FILTER_OPTIONS,
  displayUrl,
  lampLabel,
  scoreClass,
} from "./mock";
import { useAuditInteractions } from "./auditInteractions";
import "./audit.css";

const {
  selectedId,
  lampFilter,
  search,
  scanUrl,
  toast,
  toastVisible,
  selectedDetail,
  filteredRows,
  resultCountLabel,
  listMeta,
  isEmpty,
  selectRow,
  setLampFilter,
  submitScan,
} = useAuditInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="诊断子导航">
        <p class="geo-settings-sidebar-title">诊断</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-diagnosis' }">诊断列表</RouterLink>
          <RouterLink :to="{ name: 'geo-audit' }" class="is-active" aria-current="page">
            页面审计
          </RouterLink>
          <RouterLink :to="{ name: 'geo-audit-reports' }">审计报告</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-audit-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">④ 诊断 · 审计</p>
            <div class="geo-page-title-row">
              <h1>页面审计</h1>
            </div>
            <p class="geo-audit-lead">
              单 URL <strong>可引用性</strong>评分 · 证据密度 · Schema · 爬虫可读性 · 对应缺口
              <span class="geo-diag-gap">S4</span> · 与
              <RouterLink :to="{ name: 'geo-diagnosis' }">规则诊断</RouterLink> 互补
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-audit-reports' }" class="geo-btn ghost">审计报告</RouterLink>
            <RouterLink :to="{ name: 'geo-optimize-detail' }" class="geo-btn primary">
              文档优化任务
            </RouterLink>
          </div>
        </div>

        <div class="geo-audit-scope-bar">
          <p class="geo-form-hint geo-audit-scope-note">
            诊断列表解释「答案里为什么没你」；本页解释「官网 / 文档 AI 能不能安全引用」。
            样本页与
            <RouterLink :to="{ name: 'geo-optimize-detail' }">opt-s1s2</RouterLink> 文档树任务对齐。
          </p>
          <form class="geo-audit-scan-bar" aria-label="输入待审计 URL" @submit="submitScan">
            <label class="geo-audit-scan-field">
              <span class="geo-kw-manual-label">审计 URL</span>
              <input
                v-model="scanUrl"
                type="url"
                placeholder="https://example.com/page"
              />
            </label>
            <button type="submit" class="geo-btn primary">开始审计</button>
          </form>
        </div>

        <p class="dash-section-label">站点 · 汇总</p>
        <div class="dash-kpi-row geo-audit-kpi">
          <div
            v-for="kpi in AUDIT_KPIS"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value">{{ kpi.value }}</div>
            <div class="geo-metric-delta">
              <RouterLink v-if="'deltaLink' in kpi && kpi.deltaLink" :to="kpi.deltaLink">
                {{ kpi.delta }}
              </RouterLink>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <div class="geo-audit-spotlight" aria-label="红灯样本">
          <span class="geo-audit-lamp red" aria-hidden="true" />
          <strong>introduction</strong>
          <span class="geo-audit-spotlight-fact">38 分 · 无 JS 正文为空 · 链 Q00 我方域 0</span>
          <span class="geo-audit-spotlight-links">
            <RouterLink :to="{ name: 'geo-diagnosis', hash: '#diag-q00' }">诊断 Q00</RouterLink>
            <RouterLink :to="{ name: 'geo-answer-detail', hash: '#cite-heading' }">信源盘</RouterLink>
          </span>
        </div>

        <p class="dash-section-label">站点页面 · 明细</p>
        <div class="geo-audit-board">
          <section class="geo-audit-col geo-audit-list-col" aria-labelledby="audit-list-heading">
            <header class="geo-kw-list-head geo-audit-list-head">
              <div>
                <h2 id="audit-list-heading">页面列表</h2>
                <p class="geo-kw-list-desc">
                  按可引用性排序 · 点击行查看因子 · <span>{{ listMeta }}</span>
                </p>
              </div>
            </header>

            <div class="geo-kw-toolbar geo-audit-toolbar">
              <div class="geo-kw-search">
                <input
                  v-model="search"
                  type="search"
                  placeholder="搜索路径或域名…"
                  aria-label="搜索页面"
                />
              </div>
              <div class="geo-kw-status-filters geo-audit-lamp-filters" role="tablist" aria-label="信号灯">
                <button
                  v-for="opt in LAMP_FILTER_OPTIONS"
                  :key="opt.value"
                  type="button"
                  :class="{ on: lampFilter === opt.value }"
                  role="tab"
                  :aria-selected="lampFilter === opt.value"
                  @click="setLampFilter(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
              <span class="geo-kw-result-count" aria-live="polite">{{ resultCountLabel }}</span>
            </div>

            <div class="geo-kw-table-wrap geo-audit-table-wrap">
              <table class="geo-kw-table geo-audit-table">
                <thead>
                  <tr>
                    <th scope="col">页面</th>
                    <th scope="col">类型</th>
                    <th scope="col">评分</th>
                    <th scope="col">状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in filteredRows"
                    :key="row.id"
                    class="geo-audit-row"
                    :class="{ 'is-selected': selectedId === row.id }"
                    @click="selectRow(row.id)"
                  >
                    <td>
                      <strong>{{ row.pathLabel }}</strong>
                      <span class="geo-audit-url">{{ row.domain }}</span>
                    </td>
                    <td>{{ row.type }}</td>
                    <td>
                      <span class="geo-audit-score" :class="scoreClass(row.lamp)">
                        {{ AUDIT_PAGES[row.id]?.score }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="geo-audit-lamp"
                        :class="scoreClass(row.lamp)"
                        :aria-label="lampLabel(row.lamp)"
                      />
                      {{ lampLabel(row.lamp) }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-show="isEmpty" class="geo-kw-empty">没有匹配的页面。</p>
            </div>
          </section>

          <section
            v-if="selectedDetail"
            class="geo-audit-col geo-audit-detail-col"
            aria-labelledby="audit-detail-heading"
          >
            <header class="geo-audit-detail-head">
              <div>
                <h2 id="audit-detail-heading">审计明细</h2>
                <p class="geo-audit-detail-url">
                  <a :href="selectedDetail.url" rel="noopener" target="_blank">
                    {{ displayUrl(selectedDetail.url) }}
                  </a>
                  <span class="geo-muted">· 上次 {{ selectedDetail.scanned }}</span>
                </p>
              </div>
              <div
                class="geo-audit-score-ring"
                :class="scoreClass(selectedDetail.lamp)"
                aria-live="polite"
              >
                <strong>{{ selectedDetail.score }}</strong>
                <span>/100</span>
              </div>
            </header>

            <p class="geo-audit-summary">{{ selectedDetail.summary }}</p>

            <h3 class="geo-audit-section-title">评分因子</h3>
            <div class="geo-kw-table-wrap geo-audit-factors-wrap">
              <table class="geo-kw-table geo-audit-factors-table">
                <thead>
                  <tr>
                    <th scope="col">因子</th>
                    <th scope="col">分</th>
                    <th scope="col">要点</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="factor in selectedDetail.factors"
                    :key="factor.name"
                    :class="`geo-audit-factor-${factor.level}`"
                  >
                    <td><strong>{{ factor.name }}</strong></td>
                    <td class="num">{{ factor.score }}</td>
                    <td class="geo-muted">{{ factor.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 class="geo-audit-section-title">优先修复</h3>
            <ol class="geo-audit-recs">
              <li v-for="(rec, i) in selectedDetail.recs" :key="i">
                <strong>{{ rec.pri }}</strong> {{ rec.text }}
                <RouterLink v-if="rec.link" :to="rec.link">→</RouterLink>
              </li>
            </ol>

            <div class="geo-audit-detail-actions">
              <RouterLink :to="selectedDetail.optimize" class="geo-btn primary">
                创建优化任务
              </RouterLink>
              <RouterLink :to="selectedDetail.diag" class="geo-btn ghost">关联诊断</RouterLink>
            </div>
          </section>
        </div>

        <details class="geo-audit-benchmark-details">
          <summary>对标参考 · 竞品 docs 样本分</summary>
          <div class="geo-kw-table-wrap">
            <table class="geo-kw-table">
              <thead>
                <tr>
                  <th>页面</th>
                  <th>证据分</th>
                  <th>Schema</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bench in AUDIT_BENCHMARK_ROWS" :key="bench.url">
                  <td>
                    <a :href="bench.url" rel="noopener" target="_blank">{{ bench.label }}</a>
                  </td>
                  <td class="num">{{ bench.score }}</td>
                  <td>{{ bench.schema }}</td>
                  <td class="geo-muted">{{ bench.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        <p class="dash-proto-link">
          页面审计原型 v0.2 ·
          <a href="/__geo_marketing/console/audit.md" target="_blank" rel="noopener">产品解读</a>
        </p>
      </div>
    </div>

    <div
      class="geo-toast"
      role="status"
      aria-live="polite"
      :class="{ 'is-visible': toastVisible }"
      :hidden="!toastVisible"
    >
      {{ toast }}
    </div>
  </main>
</template>
