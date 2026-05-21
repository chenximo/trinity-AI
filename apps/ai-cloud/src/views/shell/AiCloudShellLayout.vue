<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { AI_CLOUD_CONSOLE_HASH } from "../account/mock";

const route = useRoute();
const router = useRouter();

const isSignedIn = ref(true);
const userMenuOpen = ref(false);
const userWrapRef = ref<HTMLElement | null>(null);

const orPage = computed(() => (route.meta.orPage as string) || "console");
const isFullPage = computed(() => Boolean(route.meta.fullPage));

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}

function closeUserMenu() {
  userMenuOpen.value = false;
}

function onDocumentPointerDown(e: MouseEvent) {
  const wrap = userWrapRef.value;
  if (wrap && !wrap.contains(e.target as Node)) closeUserMenu();
}

function goConsole(hash = AI_CLOUD_CONSOLE_HASH.ACCOUNTS) {
  closeUserMenu();
  void router.push({ name: "aic-account-console", hash });
}

function goHome() {
  closeUserMenu();
  void router.push({ name: "aic-home" });
}

function onSignOut(e: Event) {
  e.preventDefault();
  isSignedIn.value = false;
  closeUserMenu();
  void router.push({ name: "aic-home" });
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
});
</script>

<template>
  <!-- 营销首页自带顶栏，不套控制台壳 -->
  <RouterView v-if="isFullPage" v-slot="{ Component }">
    <component :is="Component" :key="String(route.name ?? '')" />
  </RouterView>

  <div v-else class="or-site flex min-h-screen flex-col" :data-or-page="orPage">
    <a class="skip" href="#main">跳转至正文</a>

    <header class="or-inject" :data-or-page="orPage">
      <div class="header-row">
        <div class="header-brand-cluster">
          <RouterLink :to="{ name: 'aic-home' }" class="brand-row" aria-label="Trinity AI 云">
            <span class="brand-mark" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2l1.2 4.5L18 8l-4.8 1.5L12 14l-1.2-4.5L6 8l4.8-1.5L12 2zM19 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L19 14zM5 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L5 14z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Trinity AI 云
          </RouterLink>
        </div>

        <div class="header-end">
          <nav class="primary or-ornav" aria-label="主导航">
            <RouterLink :to="{ name: 'aic-home' }">官网</RouterLink>
            <RouterLink
              :to="{ name: 'aic-account-console', hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS }"
              :class="{ 'is-active': orPage === 'console' }"
            >
              用户中心
            </RouterLink>
          </nav>

          <div class="or-header-actions">
            <div v-show="!isSignedIn" class="or-guest-cluster">
              <RouterLink :to="{ name: 'aic-home' }" class="btn btn-gradient or-login-pill">登录</RouterLink>
            </div>

            <div v-show="isSignedIn" ref="userWrapRef" class="or-user-wrap">
              <button
                type="button"
                class="or-user-trigger"
                :aria-expanded="userMenuOpen ? 'true' : 'false'"
                aria-haspopup="true"
                aria-label="账户菜单"
                @click.stop="toggleUserMenu"
              >
                <span class="or-user-avatar" aria-hidden="true">企</span>
                <svg
                  class="or-chevron"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div class="or-user-menu" role="menu" :hidden="!userMenuOpen">
                <div class="or-user-menu-head">
                  <span class="or-user-avatar sm" aria-hidden="true">企</span>
                  <span class="or-user-menu-title">上海某某科技</span>
                </div>
                <button type="button" class="or-user-menu-item" role="menuitem" @click="goConsole()">
                  账号管理
                </button>
                <button
                  type="button"
                  class="or-user-menu-item"
                  role="menuitem"
                  @click="goConsole(AI_CLOUD_CONSOLE_HASH.BILLING)"
                >
                  费用
                </button>
                <button type="button" class="or-user-menu-item" role="menuitem" @click="goHome()">
                  返回官网
                </button>
                <button type="button" class="or-user-menu-item" role="menuitem" @click="onSignOut">
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main id="main" class="w-full min-h-0 flex-auto" role="main">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['AiCloudConsolePage']">
          <component :is="Component" :key="String(route.name ?? '')" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>
</template>
