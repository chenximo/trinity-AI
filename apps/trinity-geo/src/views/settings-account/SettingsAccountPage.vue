<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  ACCOUNT_KPIS,
  ACCOUNT_PROFILE,
  PLAN_PERKS,
  QUOTA_ROWS,
} from "./mock";
import "./settings-account.css";
</script>

<template>
  <main class="geo-console-main">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="设置子导航">
        <p class="geo-settings-sidebar-title">设置</p>
        <nav class="geo-settings-nav">
          <RouterLink :to="{ name: 'geo-settings-brand' }">品牌设置</RouterLink>
          <RouterLink :to="{ name: 'geo-settings-account' }" class="is-active" aria-current="page">
            账户与套餐
          </RouterLink>
          <RouterLink :to="{ name: 'geo-settings-notifications' }">通知与告警</RouterLink>
        </nav>
      </aside>

      <div class="geo-settings-content geo-account-page">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label">⑧ 设置</p>
            <div class="geo-page-title-row">
              <h1>账户与套餐</h1>
            </div>
            <p class="geo-account-lead">
              GEO 订阅用量与升级 · 登录身份复用 Trinity 门户 · 定价见
              <RouterLink :to="{ name: 'trinity-geo-pricing' }">官网定价</RouterLink>
            </p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <RouterLink :to="{ name: 'trinity-geo-pricing' }" class="geo-btn primary">
              升级套餐
            </RouterLink>
          </div>
        </div>

        <div class="geo-account-scope-bar">
          <p class="geo-form-hint geo-account-scope-note">
            本页仅展示 <strong>GEO 用量与订阅</strong>；发票与支付方式在 Trinity 账单中心统一管理（Stripe 托管）。
          </p>
        </div>

        <p class="dash-section-label">套餐 · 汇总</p>
        <div class="dash-kpi-row geo-account-kpi">
          <div
            v-for="kpi in ACCOUNT_KPIS"
            :key="kpi.label"
            class="geo-metric-card"
            :class="kpi.tone"
          >
            <div class="geo-metric-label">{{ kpi.label }}</div>
            <div class="geo-metric-value" :class="{ 'geo-metric-value-sm': kpi.label !== '试用剩余' }">
              {{ kpi.value }}
            </div>
            <div class="geo-metric-delta" :class="{ 'warn-text': 'deltaWarn' in kpi && kpi.deltaWarn }">
              <RouterLink v-if="'deltaLink' in kpi && kpi.deltaLink" :to="kpi.deltaLink">
                {{ kpi.delta }}
              </RouterLink>
              <template v-else>{{ kpi.delta }}</template>
            </div>
          </div>
        </div>

        <div class="geo-account-spotlight" aria-label="当前套餐样本">
          <span class="geo-account-plan-badge">专业版</span>
          <strong>$79/月</strong>
          <span class="geo-account-spotlight-fact">1 品牌 · 每日采集 · PDF 报告 + 邮件</span>
          <span class="geo-account-spotlight-links">
            <RouterLink :to="{ name: 'trinity-geo-pricing' }">对比套餐</RouterLink>
            <RouterLink :to="{ name: 'geo-reports' }">报告配额</RouterLink>
          </span>
        </div>

        <section class="geo-account-section" aria-labelledby="quota-heading">
          <header class="geo-kw-list-head">
            <div>
              <h2 id="quota-heading">配额用量</h2>
              <p class="geo-kw-list-desc">各维度已用 / 上限 · 触顶后需升级或释放资源</p>
            </div>
          </header>

          <div class="geo-kw-table-wrap geo-account-quota-wrap">
            <table class="geo-kw-table geo-account-quota-table">
              <thead>
                <tr>
                  <th scope="col">维度</th>
                  <th scope="col">已用</th>
                  <th scope="col">上限</th>
                  <th scope="col">用量</th>
                  <th scope="col"><span class="sr-only">管理</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in QUOTA_ROWS"
                  :key="row.dimension"
                  :class="{ 'geo-account-row-warn': row.warn }"
                >
                  <th scope="row">{{ row.dimension }}</th>
                  <template v-if="row.spanUsedMax">
                    <td colspan="2" class="geo-muted">{{ row.used }}</td>
                    <td class="geo-account-meter-cell"><span class="geo-muted">—</span></td>
                  </template>
                  <template v-else>
                    <td class="num" :class="{ warn: row.warn }">{{ row.used }}</td>
                    <td class="num muted">{{ row.max }}</td>
                    <td class="geo-account-meter-cell">
                      <div
                        v-if="row.meterPercent !== null"
                        class="geo-account-meter"
                        :class="{ 'is-full': row.meterFull }"
                        role="presentation"
                      >
                        <span :style="{ width: `${row.meterPercent}%` }" />
                      </div>
                    </td>
                  </template>
                  <td class="geo-kw-actions">
                    <RouterLink
                      v-if="row.manageLink"
                      :to="row.manageLink"
                      class="geo-btn text"
                    >
                      {{ row.manageLabel }}
                    </RouterLink>
                    <span v-else class="geo-muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="geo-account-body">
          <section class="geo-account-section geo-account-profile" aria-labelledby="profile-heading">
            <h2 id="profile-heading" class="geo-account-section-title">账户信息</h2>
            <p class="geo-account-section-desc">与 Trinity 统一账户同步</p>
            <form class="geo-form-grid geo-account-form" @submit.prevent>
              <label class="geo-form-field span-2">
                <span>工作邮箱</span>
                <input type="email" :value="ACCOUNT_PROFILE.email" readonly />
              </label>
              <label class="geo-form-field">
                <span>组织名称</span>
                <input type="text" :value="ACCOUNT_PROFILE.org" />
              </label>
              <label class="geo-form-field">
                <span>时区</span>
                <select>
                  <option selected>{{ ACCOUNT_PROFILE.timezone }}</option>
                  <option>America/Los_Angeles</option>
                </select>
              </label>
              <div class="geo-account-form-actions span-2">
                <button type="button" class="geo-btn primary" disabled title="商用">
                  保存（商用）
                </button>
              </div>
            </form>
          </section>

          <aside class="geo-account-aside" aria-label="账单与关联">
            <div class="geo-account-aside-block">
              <h3 class="geo-account-aside-title">账单</h3>
              <p class="geo-account-aside-desc">Stripe 托管 · 发票与支付方式在 Trinity 门户。</p>
              <button type="button" class="geo-btn ghost sm full" disabled>查看账单历史</button>
            </div>

            <div class="geo-account-aside-block">
              <h3 class="geo-account-aside-title">关联</h3>
              <ul class="geo-account-related">
                <li>
                  <RouterLink :to="{ name: 'trinity-geo-pricing' }">
                    <strong>定价与升级</strong>
                    <span>专业版 / 企业版对比</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink :to="{ name: 'geo-settings-notifications' }">
                    <strong>通知与告警</strong>
                    <span>试用到期提醒</span>
                  </RouterLink>
                </li>
                <li>
                  <RouterLink :to="{ name: 'geo-settings-brand' }">
                    <strong>品牌设置</strong>
                    <span>1 / 3 品牌配额</span>
                  </RouterLink>
                </li>
              </ul>
            </div>

            <details class="geo-account-plan-details">
              <summary>专业版权益速查</summary>
              <ul class="geo-account-plan-perks">
                <li v-for="perk in PLAN_PERKS" :key="perk">{{ perk }}</li>
              </ul>
            </details>
          </aside>
        </div>

        <p class="dash-proto-link">
          账户与套餐原型 v0.2 ·
          <a href="/__geo_marketing/console/settings-account.md" target="_blank" rel="noopener">
            产品解读
          </a>
        </p>
      </div>
    </div>
  </main>
</template>
