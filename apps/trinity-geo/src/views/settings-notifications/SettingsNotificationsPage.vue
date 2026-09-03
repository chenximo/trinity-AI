<script setup lang="ts">
import { RouterLink } from "vue-router";
import { CALLOUT_LINKS, NOTIFY_ITEMS, SETTINGS_NAV } from "./mock";
import { useSettingsNotificationsInteractions } from "./settingsNotificationsInteractions";
import "./settings-notifications.css";

const { toggles } = useSettingsNotificationsInteractions();
</script>

<template>
  <main class="geo-console-main geo-settings-notifications-page">
    <div class="geo-settings-layout">
      <aside class="geo-settings-sidebar" aria-label="设置子导航">
        <p class="geo-settings-sidebar-title">设置</p>
        <nav class="geo-settings-nav">
          <RouterLink
            v-for="item in SETTINGS_NAV"
            :key="item.route"
            :to="{ name: item.route }"
            :class="{ 'is-active': item.route === 'geo-settings-notifications' }"
            :aria-current="item.route === 'geo-settings-notifications' ? 'page' : undefined"
          >
            {{ item.label }}
          </RouterLink>
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
          与
          <RouterLink :to="CALLOUT_LINKS.reports">报告定时</RouterLink>、
          <RouterLink :to="CALLOUT_LINKS.monitoring">采集失败</RouterLink>
          联动。
          <a
            href="/__geo_marketing/console/settings-notifications.md"
            target="_blank"
            rel="noopener"
          >单页 PRD →</a>
        </div>

        <section class="geo-settings-card" aria-labelledby="email-heading">
          <h2 id="email-heading">邮件通知</h2>
          <p class="geo-settings-card-desc">默认发送至账户邮箱，可添加抄送</p>
          <ul class="geo-notify-list">
            <li v-for="item in NOTIFY_ITEMS" :key="item.id" class="geo-notify-item">
              <div>
                <strong>{{ item.title }}</strong>
                <p>
                  {{ item.desc }}
                  <RouterLink v-if="item.descLink" :to="item.descLink.to">
                    {{ item.descLink.label }}
                  </RouterLink>
                </p>
              </div>
              <label class="geo-toggle">
                <input v-model="toggles[item.id]" type="checkbox" />
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
