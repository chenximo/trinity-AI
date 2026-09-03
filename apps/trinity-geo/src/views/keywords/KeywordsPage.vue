<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useKeywordsInteractions } from "./keywordsInteractions";
import {
  BRAND_NAME,
  KEYWORD_TEMPLATES,
  QUOTA_MAX,
  QUOTA_PLAN,
  QUESTION_TYPES,
  STATUS_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
  TYPE_SUMMARY_LABELS,
  typeClass,
  typeShort,
} from "./mock";
import "./keywords.css";

const {
  aiSuggestions,
  search,
  typeFilter,
  statusFilter,
  manualAddCollapsed,
  showAiPanel,
  addType,
  addText,
  toast,
  toastVisible,
  activeCount,
  typeCounts,
  quotaPercent,
  listMeta,
  pausedNote,
  filteredQuestions,
  resultCountLabel,
  setTypeFilter,
  setStatusFilter,
  toggleManualAdd,
  toggleAiPanel,
  closeAiPanel,
  fillTemplate,
  submitManualAdd,
  applyAiSuggestions,
  togglePause,
  removeQuestion,
  onAddKeydown,
} = useKeywordsInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="监测子导航">
        <p class="geo-settings-sidebar-title">监测</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-monitoring' }">监测概览</RouterLink>
          <RouterLink :to="{ name: 'geo-keywords' }" class="is-active" aria-current="page">
            问题集管理
          </RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">① 策略规划 · ② 监测输入</p>
            <h1>问题集管理</h1>
            <p class="dash-toolbar-meta">
              配置用户在 AI 里的<strong>真实问法</strong>——每日采集与 SOA 的分母（denominator）
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-btn ghost">返回总览</RouterLink>
            <button type="button" class="geo-btn ghost" title="商用能力 · 原型 Mock" @click="toggleAiPanel">
              AI 生成建议
            </button>
          </div>
        </div>

        <div class="geo-settings-callout" role="note">
          <strong>SOA 分母 = 启用中的监测问题 × 10 平台 × 采集轮次。</strong>
          建议品类 + 对比 + 场景词合计 ≥ 50%，避免只问品牌名导致 SOA 虚高。
          <a
            href="/__geo_marketing/console/keywords.md"
            target="_blank"
            rel="noopener"
          >单页 PRD →</a>
        </div>

        <div class="geo-kw-quota" aria-label="套餐用量">
          <div class="geo-kw-quota-head">
            <span>监测问题 <strong>{{ activeCount }}</strong> / {{ QUOTA_MAX }}（{{ QUOTA_PLAN }}）</span>
            <span class="geo-muted">{{ pausedNote }}</span>
          </div>
          <div
            class="geo-kw-quota-bar"
            role="progressbar"
            :aria-valuenow="activeCount"
            aria-valuemin="0"
            :aria-valuemax="QUOTA_MAX"
          >
            <span :style="{ width: `${quotaPercent}%` }" />
          </div>
        </div>

        <div class="geo-kw-type-summary" aria-label="问题类型分布">
          <span
            v-for="t in TYPE_SUMMARY_LABELS"
            :key="t"
            class="dash-strategy-tag"
            role="button"
            tabindex="0"
            @click="setTypeFilter(t)"
            @keydown.enter.prevent="setTypeFilter(t)"
          >
            {{ typeShort(t) }} <strong>{{ typeCounts[t] }}</strong>
          </span>
        </div>

        <div class="geo-settings-body">
          <div class="geo-settings-main">
            <section class="geo-kw-list-section" aria-labelledby="kw-list-heading">
              <header class="geo-kw-list-head">
                <div>
                  <h2 id="kw-list-heading">监测问题列表</h2>
                  <p class="geo-kw-list-desc">
                    点击问法下钻详情 · SOA 7d 为<strong>全平台 rollup</strong>（仅启用题）·
                    <span>{{ listMeta }}</span>
                  </p>
                </div>
                <button
                  type="button"
                  class="geo-btn ghost sm"
                  :aria-expanded="!manualAddCollapsed"
                  aria-controls="kw-manual-add"
                  @click="toggleManualAdd"
                >
                  {{ manualAddCollapsed ? "添加监测问题" : "收起添加表单" }}
                </button>
              </header>

              <section
                v-show="!manualAddCollapsed"
                id="kw-manual-add"
                class="geo-kw-manual-add"
                aria-labelledby="kw-manual-heading"
              >
                <div class="geo-kw-manual-head">
                  <h3 id="kw-manual-heading">手动添加监测问题</h3>
                  <span class="geo-kw-manual-tag">主路径 · 人工确认后启用</span>
                </div>
                <p class="geo-kw-manual-desc">
                  真实口语问法（非 SEO 词）· 添加后进入「监测中」，下一采集周期生效
                </p>
                <div class="geo-kw-manual-form">
                  <label class="geo-kw-manual-type">
                    <span class="geo-kw-manual-label">问题类型</span>
                    <select v-model="addType" aria-label="问题类型">
                      <option v-for="t in QUESTION_TYPES" :key="t" :value="t">{{ t }}</option>
                    </select>
                  </label>
                  <label class="geo-form-field geo-kw-manual-text">
                    <span class="geo-kw-manual-label">问法（用户口语）</span>
                    <textarea
                      v-model="addText"
                      rows="2"
                      placeholder="例如：国内有哪些 OpenAI 兼容的大模型 API 聚合平台？"
                      aria-label="问法"
                      @keydown="onAddKeydown"
                    />
                  </label>
                  <div class="geo-kw-manual-actions">
                    <button type="button" class="geo-btn primary" @click="submitManualAdd">
                      添加并启用监测
                    </button>
                  </div>
                </div>
              </section>

              <section
                v-show="showAiPanel"
                class="geo-kw-ai-panel"
                aria-labelledby="kw-ai-heading"
              >
                <div class="geo-kw-manual-head">
                  <h3 id="kw-ai-heading">AI 生成建议问法</h3>
                  <span class="geo-badge muted">辅助 · 勾选后仍须确认</span>
                </div>
                <p class="geo-kw-manual-desc">
                  根据品牌 <strong>{{ BRAND_NAME }}</strong>、行业与竞品生成候选；不会自动上线，勾选后点击「加入问题集」。
                </p>
                <ul class="geo-kw-ai-list">
                  <li v-for="item in aiSuggestions" :key="item.id">
                    <label>
                      <input v-model="item.checked" type="checkbox" />
                      {{ item.label }}
                    </label>
                  </li>
                </ul>
                <div class="geo-kw-add-actions">
                  <button type="button" class="geo-btn ghost" @click="closeAiPanel">收起</button>
                  <button type="button" class="geo-btn primary" @click="applyAiSuggestions">
                    加入已选问题
                  </button>
                </div>
              </section>

              <div class="geo-kw-toolbar">
                <div class="geo-kw-search">
                  <input
                    v-model="search"
                    type="search"
                    placeholder="搜索问法或 ID…"
                    aria-label="搜索问题"
                  />
                </div>
                <div class="geo-kw-filters" role="tablist" aria-label="问题类型筛选">
                  <button
                    v-for="opt in TYPE_FILTER_OPTIONS"
                    :key="opt.value"
                    type="button"
                    :class="{ on: typeFilter === opt.value }"
                    role="tab"
                    :aria-selected="typeFilter === opt.value"
                    @click="setTypeFilter(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <div class="geo-kw-status-filters" role="tablist" aria-label="监测状态筛选">
                  <button
                    v-for="opt in STATUS_FILTER_OPTIONS"
                    :key="opt.value"
                    type="button"
                    :class="{ on: statusFilter === opt.value }"
                    role="tab"
                    :aria-selected="statusFilter === opt.value"
                    @click="setStatusFilter(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <span class="geo-kw-result-count" aria-live="polite">{{ resultCountLabel }}</span>
              </div>

              <div class="geo-kw-table-wrap">
                <table class="geo-kw-table geo-kw-list-table">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">类型</th>
                      <th scope="col">问法（用户口语）</th>
                      <th scope="col" title="近 7 日 · 全平台">SOA 7d</th>
                      <th scope="col">信号</th>
                      <th scope="col">状态</th>
                      <th scope="col"><span class="sr-only">操作</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in filteredQuestions"
                      :key="row.id"
                      :class="{
                        'is-paused': row.status === 'paused',
                        'geo-kw-row-p0': row.priority === 'P0',
                      }"
                    >
                      <td class="mono">
                        <span v-if="row.priority" class="geo-kw-priority" :title="`${row.priority} 品类失声`">
                          {{ row.id }}
                        </span>
                        <template v-else>{{ row.id }}</template>
                      </td>
                      <td>
                        <span class="geo-kw-type" :class="typeClass(row.type)">{{ typeShort(row.type) }}</span>
                      </td>
                      <td>
                        <RouterLink
                          v-if="row.status === 'active'"
                          :to="row.detail"
                          class="geo-kw-text"
                          :title="`关键词详情 ${row.id}`"
                        >
                          {{ row.text }}
                        </RouterLink>
                        <span v-else class="geo-kw-text muted">{{ row.text }}</span>
                      </td>
                      <td
                        class="num kw-soa-cell"
                        :class="row.soa7d === null ? 'geo-muted' : row.soaTone"
                      >
                        {{ row.soa7d === null ? "—" : `${row.soa7d}%` }}
                      </td>
                      <td class="geo-kw-signals">
                        <span
                          v-for="(sig, i) in row.signals"
                          :key="i"
                          class="geo-kw-signal"
                          :class="sig.tone"
                          :title="sig.title"
                        >
                          {{ sig.label }}
                        </span>
                      </td>
                      <td>
                        <span
                          class="geo-kw-status"
                          :class="row.status === 'active' ? 'on' : 'off'"
                        >
                          {{ row.status === "active" ? "监测中" : "已暂停" }}
                        </span>
                      </td>
                      <td class="geo-kw-actions">
                        <template v-if="row.status === 'active'">
                          <RouterLink :to="row.detail" class="geo-btn text">详情</RouterLink>
                          <button type="button" class="geo-btn text kw-toggle" @click="togglePause(row)">
                            暂停
                          </button>
                        </template>
                        <template v-else>
                          <button type="button" class="geo-btn text kw-toggle" @click="togglePause(row)">
                            恢复
                          </button>
                          <button type="button" class="geo-btn text danger kw-remove" @click="removeQuestion(row)">
                            删除
                          </button>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-show="filteredQuestions.length === 0" class="geo-kw-empty">
                  没有匹配的问题，试试调整筛选或搜索。
                </p>
              </div>

              <p class="geo-form-hint geo-kw-foot">
                真源 <code>mvp/config/questions.json</code> · 采集任务 = 启用题 × 10 平台
              </p>
            </section>
          </div>

          <aside class="geo-settings-aside" aria-label="采集与关联">
            <div class="geo-settings-card compact">
              <h3>采集状态</h3>
              <dl class="geo-sync-dl">
                <div>
                  <dt>启用问题</dt>
                  <dd>{{ activeCount }}</dd>
                </div>
                <div>
                  <dt>今日采集</dt>
                  <dd>100 条</dd>
                </div>
                <div>
                  <dt>成功率</dt>
                  <dd>98%</dd>
                </div>
                <div>
                  <dt>下次全量</dt>
                  <dd>明日 06:00</dd>
                </div>
              </dl>
              <RouterLink :to="{ name: 'geo-monitoring' }" class="geo-btn ghost sm full">
                查看监测概览
              </RouterLink>
            </div>

            <div class="geo-settings-card compact">
              <h3>快速填入（模板）</h3>
              <p class="geo-settings-mini" style="margin-bottom: 0.5rem">
                点击后填入上方手动表单，可改文案再添加。
              </p>
              <ul class="geo-kw-templates">
                <li v-for="(tpl, i) in KEYWORD_TEMPLATES" :key="i">
                  <button
                    type="button"
                    class="geo-chip-suggest kw-template"
                    @click="fillTemplate(tpl.type, tpl.text)"
                  >
                    {{ tpl.label }}
                  </button>
                </li>
              </ul>
            </div>

            <div class="geo-settings-card compact">
              <h3>关联配置</h3>
              <ul class="geo-related-links">
                <li>
                  <RouterLink :to="{ name: 'geo-settings-brand' }">
                    <strong>品牌与别名</strong>
                    <span>测量识别输入</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink :to="{ name: 'geo-competitors-manage' }">
                    <strong>竞品库</strong>
                    <span>对比侧输入</span>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </aside>
        </div>
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
