<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  BRAND_ENTITY_ID,
  INITIAL_BRAND_FORM,
  SUGGESTED_ALIASES,
} from "./mock";
import { useBrandSettingsInteractions } from "./brandSettingsInteractions";
import "./brand-settings.css";

const brandForm = INITIAL_BRAND_FORM;

const {
  aliasInput,
  search,
  recalcStatus,
  recalcBtnDisabled,
  toast,
  toastVisible,
  enabledCount,
  totalCount,
  filteredAliases,
  resultCountLabel,
  listMeta,
  isEmpty,
  submitAliasAdd,
  onAliasKeydown,
  removeAlias,
  setAliasEnabled,
  applySuggest,
  saveBrand,
  triggerRecalc,
} = useBrandSettingsInteractions();
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="设置子导航">
        <p class="geo-settings-sidebar-title">设置</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-settings-brand' }" class="is-active" aria-current="page">
            品牌设置
          </RouterLink>
          <RouterLink :to="{ name: 'geo-settings-account' }">账户与套餐</RouterLink>
          <RouterLink :to="{ name: 'geo-settings-notifications' }">通知与告警</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-brand-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">① 策略规划</p>
            <div class="geo-page-title-row">
              <h1>品牌设置</h1>
            </div>
            <p class="geo-brand-lead">
              配置品牌实体与<strong>别名库</strong> — 规则引擎据此识别提及与 SOA · 问题集见
              <RouterLink :to="{ name: 'geo-monitoring' }">监测</RouterLink>
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-btn ghost">总览</RouterLink>
            <button type="button" class="geo-btn primary" @click="saveBrand">保存更改</button>
          </div>
        </div>

        <div class="geo-brand-scope-bar">
          <p class="geo-form-hint geo-brand-scope-note">
            <strong>别名库 = 测量引擎输入。</strong>采集只存原文；匹配后才标注「是否提及 / 是否进正文」。
            变更别名后可触发历史重算（不重采集）· 样本 <code>mvp/config/brand.json</code>
          </p>
        </div>

        <p class="dash-section-label">测量同步 · 汇总</p>
        <div class="dash-kpi-row geo-brand-kpi">
          <div class="geo-metric-card primary">
            <div class="geo-metric-label">已启用别名</div>
            <div class="geo-metric-value">{{ enabledCount }}</div>
            <div class="geo-metric-delta"><span>{{ totalCount }} 个别名</span></div>
          </div>
          <div class="geo-metric-card neutral">
            <div class="geo-metric-label">上次同步</div>
            <div class="geo-metric-value geo-metric-value-sm">今日 09:00</div>
            <div class="geo-metric-delta">entity_aliases</div>
          </div>
          <div class="geo-metric-card neutral">
            <div class="geo-metric-label">待重算</div>
            <div
              class="geo-metric-value geo-metric-value-sm geo-sync-pending"
              :class="{ 'is-pending': recalcStatus !== '无' }"
            >
              {{ recalcStatus }}
            </div>
            <div class="geo-metric-delta">近 30 天标注</div>
          </div>
          <div class="geo-metric-card neutral">
            <div class="geo-metric-label">实体 ID</div>
            <div class="geo-metric-value geo-metric-value-sm">
              <code class="geo-brand-entity-id">{{ BRAND_ENTITY_ID }}</code>
            </div>
            <div class="geo-metric-delta">canonical</div>
          </div>
        </div>

        <div class="geo-brand-body">
          <div class="geo-brand-main">
            <section class="geo-brand-section" aria-labelledby="brand-basic-heading">
              <h2 id="brand-basic-heading" class="geo-brand-section-title">品牌基础信息</h2>
              <p class="geo-brand-section-desc">主名称用于报告展示与实体归一化（canonical name）</p>

              <div class="geo-form-grid geo-brand-form-grid">
                <label class="geo-form-field span-2">
                  <span>品牌主名称 <abbr title="必填">*</abbr></span>
                  <input
                    type="text"
                    name="primary_name"
                    :value="brandForm.primaryName"
                    autocomplete="organization"
                  />
                </label>

                <label class="geo-form-field">
                  <span>品牌 Logo</span>
                  <div class="geo-logo-upload">
                    <div class="geo-logo-preview" aria-hidden="true">T</div>
                    <button type="button" class="geo-btn ghost sm">上传</button>
                  </div>
                </label>

                <label class="geo-form-field">
                  <span>所属行业</span>
                  <select name="industry">
                    <option value="ai-api" selected>AI / API 聚合</option>
                    <option value="saas">企业 SaaS</option>
                    <option value="consumer">消费电子</option>
                    <option value="ecom">出海电商</option>
                    <option value="other">其他</option>
                  </select>
                </label>

                <label class="geo-form-field span-2">
                  <span>官网 URL</span>
                  <input
                    type="url"
                    name="product_url"
                    :value="brandForm.productUrl"
                    placeholder="https://"
                  />
                </label>

                <label class="geo-form-field span-2">
                  <span>文档 / 产品页</span>
                  <input type="url" name="doc_url" :value="brandForm.docUrl" placeholder="https://" />
                </label>

                <label class="geo-form-field span-2">
                  <span>一句话描述</span>
                  <input
                    type="text"
                    name="tagline"
                    :value="brandForm.tagline"
                    maxlength="120"
                  />
                  <span class="geo-form-hint">报告与 Onboarding · 不参与测量匹配</span>
                </label>
              </div>
            </section>

            <section class="geo-brand-section geo-brand-alias-section" aria-labelledby="brand-alias-heading">
              <header class="geo-kw-list-head">
                <div>
                  <h2 id="brand-alias-heading">别名库</h2>
                  <p class="geo-kw-list-desc">
                    回答中出现以下写法即计为本品牌提及（大小写不敏感）·
                    <span>{{ listMeta }}</span>
                  </p>
                </div>
              </header>

              <div class="geo-brand-spotlight" aria-label="测量链路说明">
                <span class="dash-diag-code d2">D2</span>
                <strong>别名 → 规则引擎 → SOA / CCR</strong>
                <span class="geo-brand-spotlight-fact">
                  漏配别名可能导致未识别 · 链
                  <RouterLink :to="{ name: 'geo-verify', hash: '#verify-q01-detail' }">
                    Q01 D2 验收
                  </RouterLink>
                </span>
              </div>

              <div class="geo-alias-suggest geo-brand-alias-suggest" aria-label="推荐别名">
                <span class="geo-alias-suggest-label">推荐：</span>
                <button
                  v-for="chip in SUGGESTED_ALIASES"
                  :key="chip"
                  type="button"
                  class="geo-chip-suggest"
                  @click="applySuggest(chip)"
                >
                  {{ chip }}
                </button>
              </div>

              <div class="geo-alias-add geo-brand-alias-add">
                <input
                  v-model="aliasInput"
                  type="text"
                  placeholder="新别名，如 Trinity Desk、trinitydesk.ai"
                  aria-label="新别名"
                  @keydown="onAliasKeydown"
                />
                <button type="button" class="geo-btn primary sm" @click="submitAliasAdd">添加</button>
              </div>

              <div class="geo-kw-toolbar geo-brand-alias-toolbar">
                <div class="geo-kw-search">
                  <input
                    v-model="search"
                    type="search"
                    placeholder="搜索别名、类型…"
                    aria-label="搜索别名"
                  />
                </div>
                <span class="geo-kw-result-count" aria-live="polite">{{ resultCountLabel }}</span>
              </div>

              <div class="geo-kw-table-wrap geo-brand-alias-table-wrap">
                <table class="geo-kw-table geo-brand-alias-table">
                  <thead>
                    <tr>
                      <th scope="col">别名</th>
                      <th scope="col">类型</th>
                      <th scope="col">启用</th>
                      <th scope="col"><span class="sr-only">操作</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in filteredAliases" :key="row.id">
                      <td>
                        <strong v-if="row.isPrimary">{{ row.name }}</strong>
                        <template v-else>{{ row.name }}</template>
                        <span v-if="row.isPrimary" class="geo-alias-tag">主名称</span>
                      </td>
                      <td>{{ row.type }}</td>
                      <td>
                        <label class="geo-toggle">
                          <input
                            type="checkbox"
                            :checked="row.enabled"
                            :disabled="row.locked"
                            @change="
                              setAliasEnabled(row, ($event.target as HTMLInputElement).checked)
                            "
                          />
                          <span class="geo-toggle-ui" />
                        </label>
                      </td>
                      <td>
                        <span v-if="row.locked" class="geo-muted">—</span>
                        <button
                          v-else
                          type="button"
                          class="geo-btn text danger"
                          @click="removeAlias(row)"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-show="isEmpty" class="geo-kw-empty">没有匹配的别名。</p>
              </div>

              <p class="geo-form-hint geo-alias-foot">
                竞品别名在
                <RouterLink :to="{ name: 'geo-competitors-manage' }">竞品管理</RouterLink>
                维护（<code>entity_type=competitor</code>）。
              </p>
            </section>
          </div>

          <aside class="geo-brand-aside" aria-label="操作与关联">
            <div class="geo-brand-aside-block">
              <h3 class="geo-brand-aside-title">历史重算</h3>
              <p class="geo-brand-aside-desc">别名变更后重跑近 30 天标注与聚合，不重新采集。</p>
              <button
                type="button"
                class="geo-btn ghost sm full"
                :disabled="recalcBtnDisabled"
                @click="triggerRecalc"
              >
                触发重算（保存后可用）
              </button>
            </div>

            <div class="geo-brand-aside-block">
              <h3 class="geo-brand-aside-title">关联配置</h3>
              <ul class="geo-brand-related">
                <li>
                  <RouterLink :to="{ name: 'geo-monitoring' }">
                    <strong>监测问题集</strong>
                    <span>10 条 · SOA 分母</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink :to="{ name: 'geo-competitors-manage' }">
                    <strong>竞品库</strong>
                    <span>6 家 · 对比侧输入</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink :to="{ name: 'geo-diagnosis' }">
                    <strong>诊断列表</strong>
                    <span>D2 未识别规则</span>
                  </RouterLink>
                </li>
              </ul>
            </div>

            <details class="geo-brand-engine-details">
              <summary>引擎说明</summary>
              <p class="geo-settings-mini">
                主路径：<strong>规则引擎 + 别名库 + 时序库</strong>。NER/LLM 为可选增强，不在本页配置。
              </p>
            </details>
          </aside>
        </div>

        <p class="dash-proto-link">
          品牌设置原型 v0.2 ·
          <a href="/__geo_marketing/console/brand-settings.md" target="_blank" rel="noopener">
            产品解读
          </a>
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
