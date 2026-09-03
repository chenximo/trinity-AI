<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Q01_CHATGPT_BRAND } from "./mock";
import "./answer-detail-brand.css";

const detail = Q01_CHATGPT_BRAND;
</script>

<template>
  <main class="geo-console-main geo-answer-detail-main">
    <nav class="geo-breadcrumb" aria-label="面包屑">
      <RouterLink :to="detail.breadcrumb.citations">引用与信源</RouterLink> /
      <RouterLink :to="detail.breadcrumb.keyword">{{ detail.questionId }}</RouterLink> /
      <span>{{ detail.breadcrumb.current }}</span>
    </nav>

    <div class="geo-settings-callout ccr-sample" role="note">
      <strong>CCR 样本页：</strong>{{ detail.callout.text }}
      <RouterLink :to="detail.callout.negativeSampleLink">Q00·豆包</RouterLink>（CCR 否）。
    </div>

    <div class="geo-settings-body geo-answer-layout">
      <div class="geo-settings-main">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">③ 测量 · CCR 样本</p>
            <h1>{{ detail.title }}</h1>
            <p class="dash-toolbar-meta">
              <span class="platform" :class="detail.platformClass">{{ detail.platform }}</span>
              · {{ detail.meta }}
            </p>
          </div>
        </div>

        <section class="geo-settings-card geo-answer-body-card" aria-labelledby="answer-body-heading">
          <h2 id="answer-body-heading">AI 回答全文</h2>
          <div class="geo-answer-full">
            <p v-for="(para, idx) in detail.bodyParagraphs" :key="idx">
              <template v-if="para.em"><em>{{ para.text }}</em></template>
              <template v-else-if="para.externalHref">
                <template v-if="para.text.includes(para.externalLabel!)">
                  {{ para.text.split(para.externalLabel!)[0] }}
                  <a :href="para.externalHref" rel="noopener noreferrer" target="_blank">
                    {{ para.externalLabel }}
                  </a>
                  {{ para.text.split(para.externalLabel!)[1] ?? "" }}
                </template>
                <template v-else>{{ para.text }}</template>
              </template>
              <template v-else-if="para.strong">
                {{ para.text.split(para.strong)[0] }}
                <strong>{{ para.strong }}</strong>
                {{ para.text.split(para.strong)[1] ?? "" }}
              </template>
              <template v-else>{{ para.text }}</template>
            </p>
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

        <div class="geo-settings-card compact muted">
          <h3>CCR vs SOA</h3>
          <p class="geo-settings-mini">{{ detail.ccrVsSoaNote }}</p>
          <p class="geo-settings-mini geo-adb-r2-note">
            R2 验证（定价页 opt-d3）→
            <RouterLink :to="detail.verifyLink">CCR 1/3→2/3</RouterLink>
          </p>
        </div>

        <RouterLink
          v-for="action in detail.asideActions"
          :key="action.label"
          :to="action.to"
          class="geo-btn ghost sm full"
        >
          {{ action.label }}
        </RouterLink>
      </aside>
    </div>
  </main>
</template>
