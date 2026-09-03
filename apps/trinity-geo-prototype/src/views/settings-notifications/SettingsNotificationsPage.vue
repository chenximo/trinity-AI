<script setup lang="ts">
</script>

<template>
<main v-pre class="geo-console-main">
      <div class="geo-settings-layout">
        <aside class="geo-settings-sidebar" aria-label="设置子导航">
          <p class="geo-settings-sidebar-title">设置</p>
          <nav class="geo-settings-nav">
            <a href="./brand-settings.html">品牌设置</a>
            <a href="./settings-account.html">账户与套餐</a>
            <a href="./settings-notifications.html" class="is-active" aria-current="page">通知与告警</a>
          </nav>
        </aside>

        <div class="geo-settings-content">
          <div class="dash-toolbar geo-settings-toolbar">
            <div>
              <p class="dash-section-label">⑧ 设置</p>
              <h1>通知与告警</h1>
              <p class="dash-toolbar-meta">邮件为主 · Webhook / Slack 为商用扩展</p>
            </div>
          </div>

          <div class="geo-settings-callout" role="note">
            与 <a href="./reports.html">报告定时</a>、<a href="./monitoring.html">采集失败</a> 联动。
            <a href="./settings-notifications.md">单页 PRD →</a>
          </div>

          <section class="geo-settings-card" aria-labelledby="email-heading">
            <h2 id="email-heading">邮件通知</h2>
            <p class="geo-settings-card-desc">默认发送至账户邮箱，可添加抄送</p>
            <ul class="geo-notify-list">
              <li class="geo-notify-item">
                <div>
                  <strong>SOA 周环比下降</strong>
                  <p>单品牌全球 SOA 较上周下降 ≥ 10%</p>
                </div>
                <label class="geo-toggle">
                  <input type="checkbox" checked />
                  <span aria-hidden="true"></span>
                </label>
              </li>
              <li class="geo-notify-item">
                <div>
                  <strong>竞品新覆盖</strong>
                  <p>竞品在任一平台首次出现在监测问题答案中</p>
                </div>
                <label class="geo-toggle">
                  <input type="checkbox" checked />
                  <span aria-hidden="true"></span>
                </label>
              </li>
              <li class="geo-notify-item">
                <div>
                  <strong>采集失败</strong>
                  <p>连续 2 次日采失败时提醒</p>
                </div>
                <label class="geo-toggle">
                  <input type="checkbox" checked />
                  <span aria-hidden="true"></span>
                </label>
              </li>
              <li class="geo-notify-item">
                <div>
                  <strong>GEO 周报</strong>
                  <p>每周一 09:00 自动发送 · <a href="./reports.html">报告列表</a></p>
                </div>
                <label class="geo-toggle">
                  <input type="checkbox" checked />
                  <span aria-hidden="true"></span>
                </label>
              </li>
              <li class="geo-notify-item">
                <div>
                  <strong>试用即将到期</strong>
                  <p>到期前 3 天、1 天各提醒一次</p>
                </div>
                <label class="geo-toggle">
                  <input type="checkbox" checked />
                  <span aria-hidden="true"></span>
                </label>
              </li>
            </ul>
          </section>

          <section class="geo-settings-card muted compact" aria-labelledby="webhook-heading">
            <h2 id="webhook-heading">Webhook / Slack（商用）</h2>
            <p class="geo-settings-card-desc">企业版可用 · 本原型占位</p>
            <label class="geo-settings-form">
              <span>Webhook URL</span>
              <input type="url" placeholder="https://hooks.example.com/geo" disabled />
            </label>
          </section>
        </div>
      </div>
    </main>
</template>
