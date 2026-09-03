<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAnswerDetailInteractions } from "./answerDetailInteractions";
import "./answer-detail.css";

const { detail, keywordDetailTo } = useAnswerDetailInteractions();
</script>

<template>
  <main class="geo-console-main geo-answer-detail-main">
    <nav class="geo-breadcrumb" aria-label="面包屑">
      <RouterLink :to="{ name: 'geo-keywords' }">监测</RouterLink> /
      <RouterLink :to="keywordDetailTo">{{ detail.questionId }}</RouterLink> /
      <span>回答详情</span>
    </nav>

    <div class="geo-settings-body geo-answer-layout">
      <div class="geo-settings-main">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">③ 测量 · 原始证据</p>
            <h1>{{ detail.title }}</h1>
            <p class="dash-toolbar-meta">
              <span class="platform" :class="detail.platformClass">{{ detail.platform }}</span>
              · {{ detail.meta }}
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="keywordDetailTo" class="geo-btn ghost">返回关键词</RouterLink>
          </div>
        </div>

        <section class="geo-settings-card geo-answer-body-card" aria-labelledby="answer-body-heading">
          <h2 id="answer-body-heading">AI 回答全文</h2>
          <div class="geo-answer-full" id="answer-full">
            <template v-for="(section, idx) in detail.bodySections" :key="idx">
              <component :is="section.level === 3 ? 'h3' : 'h4'">{{ section.heading }}</component>
              <p v-for="(para, pIdx) in section.paragraphs" :key="pIdx">
                <template v-if="section.strong">
                  {{ para.split(section.strong)[0] }}
                  <strong>{{ section.strong }}</strong>
                  {{ para.split(section.strong)[1] ?? "" }}
                </template>
                <template v-else>{{ para }}</template>
              </p>
            </template>
          </div>
          <p class="geo-form-hint">{{ detail.bodyHint }}</p>
        </section>

        <section
          id="cite-heading"
          class="geo-settings-card geo-cite-card"
          aria-labelledby="cite-heading-title"
        >
          <div class="geo-settings-card-head">
            <div>
              <h2 id="cite-heading-title">参考来源与产品依据链接</h2>
              <p class="geo-settings-card-desc">
                豆包本题输出的全部参考 URL（官方文档 + 第三方评测）· 采集时必须结构化存储
              </p>
            </div>
            <span class="geo-cite-badge" :class="detail.citeBadgeTone">{{ detail.citeBadge }}</span>
          </div>

          <div class="geo-cite-groups">
            <div
              v-for="(group, gIdx) in detail.citeGroups"
              :key="gIdx"
              class="geo-cite-group"
              :class="{ missing: group.missing }"
            >
              <h3>
                <span class="geo-cite-tag" :class="group.tag">{{ group.tagLabel }}</span>
                {{ group.title }}
              </h3>
              <ol v-if="group.links?.length" class="geo-cite-list">
                <li v-for="(link, lIdx) in group.links" :key="lIdx">
                  <a :href="link.href" rel="noopener noreferrer" target="_blank">{{ link.label }}</a>
                  <template v-if="link.note"> — {{ link.note }}</template>
                </li>
              </ol>
              <p v-else-if="group.missingNote" class="geo-settings-mini">{{ group.missingNote }}</p>
            </div>
          </div>
        </section>
      </div>

      <aside class="geo-settings-aside geo-answer-aside">
        <div class="geo-settings-card compact">
          <h3>测量标注</h3>
          <dl class="geo-sync-dl geo-annotation-dl">
            <div v-for="field in detail.annotation" :key="field.label">
              <dt>{{ field.label }}</dt>
              <dd :class="field.tone">{{ field.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="geo-settings-card compact warn">
          <h3>信源缺口 · S1+S2+S3</h3>
          <p class="geo-settings-mini">
            <strong>16 条参考链接</strong>{{ detail.citeGap.text }}
          </p>
          <RouterLink :to="detail.citeGap.link">D1 + 信源缺口 →</RouterLink>
        </div>

        <div class="geo-settings-card compact">
          <h3>命中竞品</h3>
          <ul class="geo-comp-hit-list">
            <li v-for="hit in detail.competitorHits" :key="hit.name">
              <RouterLink v-if="hit.detail" :to="hit.detail">
                <strong>{{ hit.name }}</strong>
              </RouterLink>
              <strong v-else>{{ hit.name }}</strong>
              <span>{{ hit.note }}</span>
            </li>
          </ul>
        </div>

        <div class="geo-settings-card compact muted">
          <h3>CCR 样本</h3>
          <p class="geo-settings-mini">
            {{ detail.ccrSample.text }}
            <RouterLink :to="detail.ccrSample.citationsLink">引用读口</RouterLink>
            ·
            <RouterLink :to="detail.ccrSample.brandSampleLink">Q01 正样本</RouterLink>
          </p>
        </div>

        <div class="geo-settings-card compact warn">
          <h3>诊断</h3>
          <p class="geo-settings-mini"><strong>{{ detail.diagnosis.text }}</strong></p>
          <RouterLink :to="detail.diagnosis.link">查看信源依据型优化 →</RouterLink>
        </div>

        <div class="geo-settings-card compact muted">
          <h3>采集元数据</h3>
          <dl class="geo-sync-dl">
            <div v-for="meta in detail.metadata" :key="meta.label">
              <dt>{{ meta.label }}</dt>
              <dd>
                <code v-if="meta.code">{{ meta.value }}</code>
                <template v-else>{{ meta.value }}</template>
              </dd>
            </div>
          </dl>
        </div>

        <a
          href="/__geo_marketing/console/answer-detail.md"
          class="geo-btn ghost sm full"
          target="_blank"
          rel="noopener"
        >
          单页 PRD →
        </a>
      </aside>
    </div>
  </main>
</template>
