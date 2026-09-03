<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useCompetitorDetailInteractions } from "./competitorDetailInteractions";
import "./competitor-detail.css";

const { detail } = useCompetitorDetailInteractions();
</script>

<template>
  <main class="geo-console-main geo-competitor-detail-page">
    <nav class="geo-breadcrumb" aria-label="面包屑">
      <RouterLink :to="{ name: 'geo-competitors' }">竞品</RouterLink> /
      <span>{{ detail.name }}</span>
    </nav>

    <div class="dash-toolbar geo-settings-toolbar">
      <div>
        <p class="dash-section-label">③ 竞品下钻</p>
        <h1>{{ detail.name }}</h1>
        <p class="dash-toolbar-meta">
          <span class="geo-market-pill" :class="detail.marketClass">{{ detail.marketLabel }}</span>
          <code class="geo-comp-id">{{ detail.id }}</code>
          · {{ detail.status }}
        </p>
      </div>
      <div class="geo-settings-toolbar-actions">
        <RouterLink :to="{ name: 'geo-competitors' }" class="geo-btn ghost">返回概览</RouterLink>
        <RouterLink :to="{ name: 'geo-competitors-manage' }" class="geo-btn ghost">编辑别名</RouterLink>
      </div>
    </div>

    <div class="geo-settings-callout warn" role="alert">
      <strong>{{ detail.callout.strong }}：</strong>{{ detail.callout.body }}
      <RouterLink :to="detail.callout.answerLink">看豆包回答 →</RouterLink>
      ·
      <a
        href="/__geo_marketing/console/competitor-detail.md"
        target="_blank"
        rel="noopener"
      >单页 PRD →</a>
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
        <div class="geo-metric-delta" :class="kpi.deltaClass">{{ kpi.delta }}</div>
      </div>
    </div>

    <div class="dash-split">
      <section class="geo-settings-card" aria-labelledby="cd-win-heading">
        <h2 id="cd-win-heading">领先我方的问题</h2>
        <table class="geo-kw-table">
          <thead>
            <tr>
              <th>问题</th>
              <th>我方</th>
              <th>{{ detail.name }}</th>
              <th>差值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in detail.winRows" :key="row.question">
              <td>
                <RouterLink :to="row.questionLink">{{ row.question }}</RouterLink>
              </td>
              <td class="num" :class="row.usClass">{{ row.usSoa }}</td>
              <td class="num">{{ row.compSoa }}</td>
              <td class="num" :class="row.diffClass">{{ row.diff }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="geo-settings-card" aria-labelledby="cd-platform-heading">
        <h2 id="cd-platform-heading">分平台 SOA 7d</h2>
        <table class="geo-kw-table">
          <thead>
            <tr>
              <th>平台</th>
              <th>{{ detail.name }}</th>
              <th>我方</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in detail.platformRows" :key="row.platform">
              <td>{{ row.platform }}</td>
              <td class="num">{{ row.compSoa }}</td>
              <td class="num" :class="row.usClass">{{ row.usSoa }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <section class="dash-card" aria-labelledby="cd-answers-heading">
      <div class="dash-card-head">
        <h2 id="cd-answers-heading">含该竞品的最新回答</h2>
      </div>
      <div class="dash-card-body">
        <div class="dash-answer-list">
          <article
            v-for="answer in detail.latestAnswers"
            :key="answer.title"
            class="dash-answer-item"
          >
            <div class="dash-answer-main">
              <RouterLink :to="answer.titleLink" class="dash-answer-kw">{{ answer.title }}</RouterLink>
              <p class="dash-answer-snippet">{{ answer.snippet }}</p>
            </div>
            <div class="dash-answer-meta">
              <span class="dash-badge" :class="answer.badgeClass">{{ answer.badge }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
