<script setup lang="ts">
import { RouterLink } from "vue-router";
import { statusLabel } from "./mock";
import { useOptimizeDetailInteractions } from "./optimizeDetailInteractions";
import "./optimize-detail.css";

const { detail } = useOptimizeDetailInteractions();
</script>

<template>
  <main class="geo-console-main geo-opt-detail-page">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="优化子导航">
        <p class="geo-settings-sidebar-title">优化</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-optimize' }" class="is-active">待办清单</RouterLink>
          <RouterLink :to="{ name: 'geo-verify' }">效果验证</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">
              <RouterLink :to="{ name: 'geo-optimize' }">← 优化待办</RouterLink>
              · <span class="geo-opt-id">{{ detail.id }}</span>
            </p>
            <h1>{{ detail.title }}</h1>
            <p class="dash-toolbar-meta">
              {{ detail.ruleLabel }} · 目标
              <RouterLink :to="detail.targetLink">{{ detail.targetId }}</RouterLink>
              · 负责人：{{ detail.owner }} · 截止 {{ detail.due }}
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <span class="geo-opt-badge" :class="detail.status">{{ statusLabel(detail.status) }}</span>
            <button type="button" class="geo-btn ghost" disabled>标记完成</button>
          </div>
        </div>

        <div class="geo-settings-callout" role="note">
          样本主线任务 · 与
          <RouterLink :to="detail.calloutLinks[0].to">{{ detail.calloutLinks[0].label }}</RouterLink>、
          <RouterLink :to="detail.calloutLinks[1].to">{{ detail.calloutLinks[1].label }}</RouterLink>
          联动。
          <a
            href="/__geo_marketing/console/optimize-detail.md"
            target="_blank"
            rel="noopener"
          >单页 PRD →</a>
        </div>

        <div class="dash-kpi-row geo-mon-kpi">
          <div v-for="kpi in detail.kpis" :key="kpi.label" class="geo-metric-card neutral">
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value">{{ kpi.value }}</div>
            <div class="geo-metric-delta">
              <RouterLink v-if="kpi.deltaLink" :to="kpi.deltaLink">{{ kpi.delta }}</RouterLink>
              <a
                v-else-if="kpi.externalHref"
                :href="kpi.externalHref"
                rel="noopener noreferrer"
                target="_blank"
              >
                {{ kpi.delta }}
              </a>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <section class="geo-settings-card" aria-labelledby="opt-desc-heading">
          <h2 id="opt-desc-heading">任务说明</h2>
          <p class="geo-settings-card-desc">{{ detail.description }}</p>
          <p class="geo-opt-links">
            依据：
            <template v-for="(link, idx) in detail.basisLinks" :key="link.label">
              <span v-if="idx > 0"> · </span>
              <RouterLink v-if="link.to" :to="link.to">{{ link.label }}</RouterLink>
              <a v-else :href="link.href" rel="noopener noreferrer" target="_blank">{{ link.label }}</a>
            </template>
          </p>
        </section>

        <section class="geo-settings-card" aria-labelledby="opt-check-heading">
          <h2 id="opt-check-heading">执行清单</h2>
          <ul class="geo-opt-checklist">
            <li
              v-for="item in detail.checklist"
              :key="item.text"
              :class="item.state"
            >
              <span aria-hidden="true">{{ item.state === "done" ? "✓" : "○" }}</span>
              {{ item.text }}
            </li>
          </ul>
        </section>

        <section class="geo-settings-card compact muted" aria-labelledby="opt-verify-heading">
          <h2 id="opt-verify-heading">验收标准</h2>
          <ul class="geo-report-preview-list">
            <li v-for="(item, idx) in detail.acceptance" :key="idx">
              {{ item.text }}
              <RouterLink v-if="item.link" :to="item.link">R1 vs R2 对比截图</RouterLink>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>
