<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  AUDIT_KPIS,
  AUDIT_REPORT_ROWS,
  AUDIT_SUMMARY,
  DIAGNOSIS_NAV,
} from "./mock";
import "./audit-reports.css";
</script>

<template>
  <main class="geo-console-main geo-audit-reports-page">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="诊断子导航">
        <p class="geo-settings-sidebar-title">诊断</p>
        <nav class="geo-settings-nav">
          <RouterLink
            v-for="item in DIAGNOSIS_NAV"
            :key="item.route"
            :to="{ name: item.route }"
            :class="{ 'is-active': item.route === 'geo-audit-reports' }"
            :aria-current="item.route === 'geo-audit-reports' ? 'page' : undefined"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">④ 诊断与审计</p>
            <h1>审计报告</h1>
            <p class="dash-toolbar-meta">
              站点扫描历史 · 评分趋势 · 导出 PDF（商用） · 与单次 URL 审计互补
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-audit' }" class="geo-btn ghost">返回页面审计</RouterLink>
            <button type="button" class="geo-btn primary" disabled title="商用：触发全站扫描">
              新建全站扫描
            </button>
          </div>
        </div>

        <div class="geo-settings-callout" role="note">
          <strong>与页面审计的区别：</strong>本页保存<strong>批量 / 周期</strong>扫描快照；单 URL 因子明细仍在
          <RouterLink :to="{ name: 'geo-audit' }">页面审计</RouterLink>。红灯页修复后可在
          <RouterLink :to="{ name: 'geo-verify' }">效果验证</RouterLink> 看信源盘 Δ。
        </div>

        <div class="dash-kpi-row geo-mon-kpi">
          <div
            v-for="kpi in AUDIT_KPIS"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value" :style="kpi.valueStyle">{{ kpi.value }}</div>
            <div class="geo-metric-delta" :class="kpi.deltaClass">
              <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">{{ kpi.delta }}</RouterLink>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <section class="geo-settings-card" aria-labelledby="audit-rep-list-heading">
          <div class="geo-settings-card-head">
            <div>
              <h2 id="audit-rep-list-heading">扫描历史</h2>
              <p class="geo-settings-card-desc">点击报告查看摘要 · 明细跳页面审计</p>
            </div>
          </div>
          <div class="geo-kw-table-wrap">
            <table class="geo-kw-table geo-report-table">
              <thead>
                <tr>
                  <th>报告 ID</th>
                  <th>扫描时间</th>
                  <th>范围</th>
                  <th>页面数</th>
                  <th>均分</th>
                  <th>红灯</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in AUDIT_REPORT_ROWS" :key="row.id">
                  <td class="mono">
                    <RouterLink v-if="row.idLink" :to="row.idLink">{{ row.id }}</RouterLink>
                    <template v-else>{{ row.id }}</template>
                  </td>
                  <td>{{ row.scannedAt }}</td>
                  <td>{{ row.scope }}</td>
                  <td>{{ row.pageCount }}</td>
                  <td class="num" :class="row.avgClass">{{ row.avgScore }}</td>
                  <td class="num" :class="row.redClass">{{ row.redCount }}</td>
                  <td>
                    <RouterLink :to="row.detailLink">明细</RouterLink>
                    · <span class="geo-muted" title="商用">PDF</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          :id="AUDIT_SUMMARY.id"
          class="geo-settings-card"
          aria-labelledby="rep-20260614-heading"
        >
          <div class="geo-settings-card-head">
            <div>
              <h2 id="rep-20260614-heading">{{ AUDIT_SUMMARY.title }}</h2>
              <p class="geo-settings-card-desc">{{ AUDIT_SUMMARY.desc }}</p>
            </div>
            <span class="geo-verify-badge" :class="AUDIT_SUMMARY.badgeClass">
              {{ AUDIT_SUMMARY.badge }}
            </span>
          </div>

          <div class="geo-kw-table-wrap">
            <table class="geo-kw-table">
              <thead>
                <tr>
                  <th>页面</th>
                  <th>评分</th>
                  <th>较上版</th>
                  <th>优先动作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in AUDIT_SUMMARY.rows" :key="row.page">
                  <td>
                    <RouterLink :to="row.pageLink">{{ row.page }}</RouterLink>
                  </td>
                  <td class="num" :class="row.scoreClass">{{ row.score }}</td>
                  <td class="num" :class="row.deltaClass">{{ row.delta }}</td>
                  <td>
                    <RouterLink v-if="row.actionLink" :to="row.actionLink">{{ row.action }}</RouterLink>
                    <template v-else>{{ row.action }}</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="geo-form-hint">
            修复后验证：
            <template v-for="(link, idx) in AUDIT_SUMMARY.verifyLinks" :key="link.label">
              <RouterLink :to="link.to">{{ link.label }}</RouterLink
              ><span v-if="idx < AUDIT_SUMMARY.verifyLinks.length - 1"> · </span>
            </template>
          </p>
        </section>
      </div>
    </div>
  </main>
</template>
