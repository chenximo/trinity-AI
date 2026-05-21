<script setup lang="ts">
/**
 * 用户控制台打样（规范站）· 参考 account 的 DOM 与 account.css。
 * API 管理（工作区）含 API 密钥完整打样；其余区为占位。
 */
import { ref } from "vue";
import "@trinity-ai/views/account/account.css";
import KeysPanelSample from "./KeysPanelSample.vue";
import "./console-sample.css";

const PANELS = [
  { id: "keys", label: "API 密钥", group: "api" },
  { id: "preset", label: "角色管理", group: "api" },
  { id: "credits", label: "额度", group: "account" },
  { id: "activity", label: "活动", group: "account" },
  { id: "logs", label: "用量", group: "account" },
] as const;

type PanelId = (typeof PANELS)[number]["id"];

const activePanel = ref<PanelId>("keys");

const GROUPS = [
  { id: "api", title: "API 管理" },
  { id: "account", title: "账户" },
] as const;

function selectPanel(id: PanelId): void {
  activePanel.value = id;
}

const panelTitle = (id: PanelId) => PANELS.find((p) => p.id === id)?.label ?? id;
</script>

<template>
  <main id="user-console-spec-main" class="mvp-main account-console-root user-console-spec-preview__main">
    <div class="or-shell">
      <aside class="or-side" aria-label="控制台导航（打样）">
        <template v-for="g in GROUPS" :key="g.id">
          <div
            class="or-side-heading"
            :style="g.id === 'account' ? 'margin-top: 0.65rem' : undefined"
          >
            {{ g.title }}
          </div>
          <a
            v-for="p in PANELS.filter((x) => x.group === g.id)"
            :key="p.id"
            href="#"
            class="or-dash-nav"
            :class="{ 'is-active': activePanel === p.id }"
            @click.prevent="selectPanel(p.id)"
          >
            {{ p.label }}
          </a>
        </template>
        <div class="or-side-heading" style="margin-top: 0.65rem">产品</div>
        <a href="/trinity-ai/account/console#keys" class="or-dash-nav">完整原型 →</a>
      </aside>

      <div class="or-main">
        <p class="user-console-sample__banner" role="status">
          打样页 · <strong>API 管理 → API 密钥</strong> 已与
          <code>views/account/ConsolePage.vue</code> 对齐；创建/行内菜单等完整交互见
          <a href="/trinity-ai/account/console#keys">产品控制台</a>。
        </p>

        <KeysPanelSample v-show="activePanel === 'keys'" />

        <section
          v-for="p in PANELS.filter((x) => x.id !== 'keys')"
          :key="p.id"
          :data-or-panel="p.id"
          :hidden="activePanel !== p.id"
        >
          <nav class="or-crumb" aria-label="面包屑">
            <a href="/trinity-ai">Trinity AI</a>
            <span aria-hidden="true"> / </span>
            <span>{{ panelTitle(p.id) }}</span>
          </nav>

          <header class="or-keys-pagehead">
            <div class="or-keys-title-row">
              <h1 class="or-page-title or-keys-page-title">{{ panelTitle(p.id) }}</h1>
              <div class="or-keys-title-actions">
                <button type="button" class="btn btn-gradient">主操作</button>
              </div>
            </div>
            <div class="or-keys-lead-row">
              <p class="or-lead or-keys-lead">
                {{ panelTitle(p.id) }} 区打样占位 · 完整内容见
                <a :href="`/trinity-ai/account/console#${p.id}`">产品控制台</a>。
              </p>
            </div>
          </header>

          <div class="user-console-sample__table-placeholder">
            {{ panelTitle(p.id) }} 列表 / 卡片区 · 见完整原型
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
