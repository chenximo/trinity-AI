<script setup lang="ts">
import { useMarketingPageScripts } from "../shell/shellInteractions";
import pageJs from "../../../marketing/js/reports.js?raw";

useMarketingPageScripts([pageJs]);
</script>

<template>
<main v-pre class="geo-console-main">
      <div class="geo-settings-layout">
        <aside class="geo-settings-sidebar" aria-label="报告子导航">
          <p class="geo-settings-sidebar-title">报告</p>
          <nav class="geo-settings-nav">
            <a href="./reports.html" class="is-active" aria-current="page">报告列表</a>
            <a href="./verify.html">效果验证</a>
          </nav>
        </aside>

        <div class="geo-settings-content geo-reports-page">
          <div class="dash-toolbar geo-settings-toolbar">
            <div>
              <p class="dash-section-label">⑥ 报告</p>
              <div class="geo-page-title-row">
                <h1>报告与导出</h1>
                <button
                  type="button"
                  class="geo-help-tip-btn geo-help-tip-btn--inline"
                  data-geo-prototype-annotation
                  data-geo-help-tpl="geo-help-tpl-reports-mock"
                  data-geo-help-title="原型 · 报告说明"
                  aria-label="原型报告与 Mock 说明"
                  aria-expanded="false"
                  aria-controls="geo-help-tip-popover"
                  title="说明"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
                    <path d="M12 16v-4M12 8h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
              <p class="geo-reports-lead">
                周报 / 月报汇总 SOA、竞品、诊断与验证结论 · 单次 R1→R2 验收见
                <a href="./verify.html">效果验证</a>
              </p>
            </div>
            <div class="geo-settings-toolbar-actions">
              <a href="./settings-notifications.html" class="geo-btn ghost">通知设置</a>
              <button type="button" class="geo-btn primary" disabled title="商用：自定义周期报告">新建报告</button>
            </div>
          </div>

          <div class="geo-reports-scope-bar">
            <p class="geo-form-hint geo-reports-scope-note">
              本页为<strong>周期汇总</strong>，便于周会外发；与逐题验证区分。
              预览样本 <strong>2026-W24 周报</strong> · 商用支持 PDF / 邮件定时发送。
            </p>
          </div>

          <p class="dash-section-label">报告 · 汇总</p>
          <div class="dash-kpi-row geo-reports-kpi">
            <div class="geo-metric-card primary">
              <div class="geo-metric-label">本月已生成</div>
              <div class="geo-metric-value">2</div>
              <div class="geo-metric-delta">周报 + 月报草案</div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">定时周报</div>
              <div class="geo-metric-value geo-metric-value-sm">周一 09:00</div>
              <div class="geo-metric-delta"><a href="./settings-notifications.html">配置 →</a></div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">上次发送</div>
              <div class="geo-metric-value geo-metric-value-sm">6/10</div>
              <div class="geo-metric-delta">3 位收件人</div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">套餐</div>
              <div class="geo-metric-value geo-metric-value-sm">专业版</div>
              <div class="geo-metric-delta"><a href="./settings-account.html">用量 →</a></div>
            </div>
          </div>

          <section class="geo-reports-list-section" aria-labelledby="rep-list-heading">
            <header class="geo-kw-list-head">
              <div>
                <h2 id="rep-list-heading">历史报告</h2>
                <p class="geo-kw-list-desc">
                  在线预览 · 导出 PDF / PNG（商用）·
                  <span id="rep-list-meta">3 份</span>
                </p>
              </div>
            </header>

            <div class="geo-reports-spotlight" id="rep-w24" aria-label="本周周报样本">
              <span class="geo-report-status ready">已生成</span>
              <span class="geo-reports-spotlight-title"><strong>W24</strong> GEO 周报 · 6/9–6/15</span>
              <span class="geo-reports-spotlight-fact">全球 SOA 42% ↑6% · 中国 28% ↓3% · P0 诊断 3 条</span>
              <span class="geo-reports-spotlight-links">
                <a href="./report-preview.html">预览</a>
                <a href="./dashboard.html">总览对照</a>
              </span>
            </div>

            <div class="geo-kw-toolbar geo-reports-toolbar">
              <div class="geo-kw-search">
                <input type="search" id="rep-search" placeholder="搜索报告名、周期、摘要…" aria-label="搜索报告" />
              </div>
              <div class="geo-kw-status-filters geo-reports-type-filters" role="tablist" aria-label="报告类型">
                <button type="button" class="on" data-rep-filter="all" role="tab" aria-selected="true">全部</button>
                <button type="button" data-rep-filter="weekly" role="tab">周报</button>
                <button type="button" data-rep-filter="monthly" role="tab">月报</button>
                <button type="button" data-rep-filter="verify" role="tab">验收摘要</button>
              </div>
              <span class="geo-kw-result-count" id="rep-result-count" aria-live="polite">显示 3 条</span>
            </div>

            <div class="geo-kw-table-wrap geo-reports-table-wrap">
              <table class="geo-kw-table geo-report-table" id="rep-table">
                <thead>
                  <tr>
                    <th scope="col">类型</th>
                    <th scope="col">报告</th>
                    <th scope="col">周期</th>
                    <th scope="col">状态</th>
                    <th scope="col">核心摘要</th>
                    <th scope="col"><span class="sr-only">操作</span></th>
                  </tr>
                </thead>
                <tbody id="rep-tbody">
                  <tr
                    class="geo-reports-row geo-reports-row-featured"
                    data-rep-type="weekly"
                    data-search="geo 周报 w24 2026 全球 soa 42 中国 28"
                    id="rep-row-w24"
                  >
                    <td><span class="geo-reports-type-pill weekly">周报</span></td>
                    <td class="geo-reports-title-cell">
                      <a href="./report-preview.html" class="geo-reports-title">GEO 周报</a>
                      <span class="geo-reports-sub">2026-W24</span>
                    </td>
                    <td class="geo-muted">6/9 – 6/15</td>
                    <td><span class="geo-report-status ready">已生成</span></td>
                    <td class="geo-reports-summary">全球 SOA <strong>42%</strong> <span class="up">↑6%</span> · 中国 <strong>28%</strong> <span class="down">↓3%</span> · P0 ×3</td>
                    <td class="geo-kw-actions">
                      <a href="./report-preview.html" class="geo-btn text">预览</a>
                      <span class="geo-muted" title="商用">PDF</span>
                    </td>
                  </tr>
                  <tr
                    class="geo-reports-row"
                    data-rep-type="monthly"
                    data-search="月报 草案 2026-06 q00 信源"
                  >
                    <td><span class="geo-reports-type-pill monthly">月报</span></td>
                    <td class="geo-reports-title-cell">
                      <a href="./report-preview.html" class="geo-reports-title">GEO 月报</a>
                      <span class="geo-reports-sub">草案</span>
                    </td>
                    <td class="geo-muted">2026-06</td>
                    <td><span class="geo-report-status draft">草稿</span></td>
                    <td class="geo-reports-summary">含 Q00 信源盘 0→1 验证注记</td>
                    <td class="geo-kw-actions">
                      <a href="./report-preview.html" class="geo-btn text">预览</a>
                    </td>
                  </tr>
                  <tr
                    class="geo-reports-row"
                    data-rep-type="verify"
                    data-search="验收摘要 q00 opt-s1s2 信源 soa"
                  >
                    <td><span class="geo-reports-type-pill verify">验收</span></td>
                    <td class="geo-reports-title-cell">
                      <a href="./verify.html#verify-q00-detail" class="geo-reports-title">优化验收摘要</a>
                      <span class="geo-reports-sub">Q00 · opt-s1s2</span>
                    </td>
                    <td class="geo-muted">R2 6/20</td>
                    <td><span class="geo-report-status ready">已生成</span></td>
                    <td class="geo-reports-summary">信源 <strong>0/16→1/17</strong> · SOA 仍 0% · 先进盘</td>
                    <td class="geo-kw-actions">
                      <a href="./verify.html#verify-q00-detail" class="geo-btn text">验证</a>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p class="geo-kw-empty" id="rep-empty" hidden>没有匹配的报告。</p>
            </div>
          </section>

          <details class="geo-reports-schedule-details">
            <summary>默认定时与告警（P1）</summary>
            <ul class="geo-reports-schedule-list">
              <li><strong>周报</strong> — 每周一 09:00 · 收件人：市场负责人 + 2</li>
              <li><strong>SOA 异动</strong> — 即时邮件 · 阈值 −10% · <a href="./settings-notifications.html">修改</a></li>
              <li><strong>试用到期</strong> — 提前 3 天 · 账户邮箱</li>
            </ul>
          </details>

          <p class="dash-proto-link">
            报告列表原型 v0.2 ·
            <a href="./reports.md">产品解读</a>
            · 预览 <a href="./report-preview.html">2026-W24 周报</a>
          </p>
        </div>
      </div>
    </main>
</template>
