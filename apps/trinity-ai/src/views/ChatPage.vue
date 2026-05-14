<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ChatFloatingHost from "../chat/ChatFloatingHost.vue";
import ChatHelpSprite from "../chat/ChatHelpSprite.vue";
import ChatIconRail from "../chat/ChatIconRail.vue";
import ChatInlinedMainComposer from "../chat/ChatInlinedMainComposer.vue";
import ChatSidebar from "../chat/ChatSidebar.vue";
import { bindOrcPrototypeChatInteractions } from "../chat/bindOrcPrototypeChatInteractions";
import { getOrcModelById } from "../chat/mock";
import type { ChatSideTab } from "../chat/useChatShellLayout";
import { bindOrcHelpTipsLite } from "../chat/useOrcHelpTips";
import { useChatShellLayout } from "../chat/useChatShellLayout";
import "../styles/chat-openrouter.css";
import "../styles/chat-vue-shell.css";

const chatPageRoot = ref<HTMLElement | null>(null);
const selectedOrcModelId = ref("r3");

const {
  sideTab,
  sideCollapsed,
  mobileDrawerOpen,
  drawer2Visible,
  closeMobileDrawer,
  openMobileDrawer,
  toggleSideCollapsed,
  expandSideFromRail,
} = useChatShellLayout();

function onSelectTab(tab: ChatSideTab) {
  sideTab.value = tab;
}

function applyOrcModelToDom(id: string) {
  const m = getOrcModelById(id);
  if (!m) return;
  const pill = document.querySelector("#orc-assist-model-pill");
  if (pill) pill.textContent = `当前 · ${m.shortName || m.name}`;
  const detailTitle = document.querySelector("#orc-detail-title");
  if (detailTitle) detailTitle.textContent = m.name;
  const detailDesc = document.querySelector("#orc-detail-desc");
  if (detailDesc) detailDesc.textContent = m.desc;
  const logo = document.querySelector("#orc-detail-logo") as HTMLElement | null;
  if (logo) {
    const b = m.brand || "";
    const extra =
      b === "google"
        ? " orc-pv--google"
        : b === "openai"
          ? " orc-pv--openai"
          : b === "anthropic"
            ? " orc-pv--anthropic"
            : b === "recraft"
              ? " orc-pv--recraft"
              : " orc-pv--letter";
    logo.className = `orc-pv orc-detail-pv${extra}`;
    logo.textContent = extra.includes("letter") ? m.provider || "?" : "";
  }
  const w = document.querySelector("#orc-st-weekly");
  const c = document.querySelector("#orc-st-ctx");
  const inn = document.querySelector("#orc-st-in");
  const out = document.querySelector("#orc-st-out");
  if (w) w.textContent = m.weekly;
  if (c) c.textContent = m.context;
  if (inn) inn.textContent = m.input;
  if (out) out.textContent = m.output;
}

watch(
  selectedOrcModelId,
  () => {
    void nextTick(() => applyOrcModelToDom(selectedOrcModelId.value));
  },
  { flush: "post" }
);
let unbindHelp: (() => void) | undefined;
let unbindProto: (() => void) | undefined;

onMounted(() => {
  unbindHelp = bindOrcHelpTipsLite();
  void nextTick(() => {
    applyOrcModelToDom(selectedOrcModelId.value);
    if (chatPageRoot.value) {
      unbindProto = bindOrcPrototypeChatInteractions(chatPageRoot.value, {
        getSelectedModelId: () => selectedOrcModelId.value,
        setSelectedModelId: (id) => {
          selectedOrcModelId.value = id;
        },
      });
    }
  });
});

onUnmounted(() => {
  unbindHelp?.();
  unbindProto?.();
});
</script>

<template>
  <div ref="chatPageRoot" class="mvp-main orc-chat-root chat-page-root">
    <ChatHelpSprite />

    <div
      id="orc-sidebar-backdrop"
      class="orc-sidebar-backdrop"
      aria-hidden="true"
      @click="closeMobileDrawer()"
    />

    <div
      id="orc-app"
      class="orc-shell orc-app"
      :class="{
        'orc-side-collapsed': sideCollapsed,
        'orc-mobile-drawer-open': mobileDrawerOpen,
      }"
    >
      <ChatIconRail :side-collapsed="sideCollapsed" @expand-side="expandSideFromRail()" />
      <ChatSidebar
        v-model:orc-model-id="selectedOrcModelId"
        :side-tab="sideTab"
        :side-collapsed="sideCollapsed"
        @toggle-collapse="toggleSideCollapsed()"
        @select-tab="onSelectTab"
      />
      <ChatInlinedMainComposer :drawer2-visible="drawer2Visible" @open-drawer="openMobileDrawer()" />
    </div>

    <ChatFloatingHost />
  </div>
</template>
