<script setup lang="ts">
import { RouterLink } from "vue-router";
import { REPORT_PREVIEW } from "./mock";
import "./report-preview.css";

const report = REPORT_PREVIEW;
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-content geo-report-preview-wrap">
      <div class="dash-toolbar geo-settings-toolbar">
        <div>
          <p class="dash-section-label">
            <RouterLink :to="{ name: 'geo-reports' }">← 报告列表</RouterLink>
          </p>
          <h1>{{ report.title }}</h1>
          <p class="dash-toolbar-meta">{{ report.meta }}</p>
        </div>
        <div class="geo-settings-toolbar-actions">
          <button type="button" class="geo-btn ghost" disabled>发送邮件</button>
          <button type="button" class="geo-btn primary" disabled>下载 PDF</button>
        </div>
      </div>

      <article class="geo-report-preview-sheet" aria-label="报告正文预览">
        <header class="geo-report-preview-head">
          <div>
            <h2>Trinity AI · AI 可见性周报</h2>
            <p>生成于 {{ report.generatedAt }} · {{ report.tier }}</p>
          </div>
          <div class="geo-report-preview-soa">
            <div>
              <span>全球 SOA</span>
              <strong>{{ report.soa.global.value }}</strong>
              <em :class="report.soa.global.deltaClass">{{ report.soa.global.delta }}</em>
            </div>
            <div>
              <span>中国 SOA</span>
              <strong>{{ report.soa.china.value }}</strong>
              <em :class="report.soa.china.deltaClass">{{ report.soa.china.delta }}</em>
            </div>
          </div>
        </header>

        <section v-for="section in report.sections" :key="section.heading">
          <h3>{{ section.heading }}</h3>
          <p v-if="section.paragraphs?.length">
            <template v-if="section.summaryStrong">
              {{ section.paragraphs[0] }}<strong>{{ section.summaryStrong }}</strong>{{ section.paragraphs[1] }}
            </template>
            <template v-else>{{ section.paragraphs[0] }}</template>
          </p>
          <div v-if="section.platforms" class="geo-report-preview-platforms">
            <span
              v-for="plat in section.platforms"
              :key="plat.label"
              :class="plat.class"
            >
              {{ plat.label }}
            </span>
          </div>
          <ul v-if="section.listItems" class="geo-report-preview-list">
            <li v-for="item in section.listItems" :key="item.label">
              <RouterLink :to="item.to">{{ item.label }}</RouterLink>
            </li>
          </ul>
        </section>

        <footer class="geo-report-preview-foot">{{ report.footer }}</footer>
      </article>
    </div>
  </main>
</template>
