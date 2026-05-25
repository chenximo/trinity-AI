<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { TrinityAuthModal, type TrinityAuthMode } from "@trinity/ui";
import { AI_CLOUD_CONSOLE_HASH } from "../account/mock";
import { useTrinityOrSession, useTrinityOrUiLang } from "./shellInteractions";

const route = useRoute();
const router = useRouter();

const uiLang = useTrinityOrUiLang();
const { isSignedIn, setSignedIn } = useTrinityOrSession();

const drawerOpen = ref(false);
const userMenuOpen = ref(false);
const userWrapRef = ref<HTMLElement | null>(null);

const authVisible = ref(false);
const authSignup = ref(false);
const authFormError = ref("");
const signupMountKey = ref(0);

const authMode = computed<TrinityAuthMode>(() => (authSignup.value ? "signup" : "signin"));

const orPage = computed(() => (route.meta.orPage as string) || "console");
const isFullPage = computed(() => Boolean(route.meta.fullPage));

function setBodyModal(open: boolean) {
  document.body.classList.toggle("or-modal-open", open);
}

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}

function closeDrawer() {
  drawerOpen.value = false;
}

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

function onResizeDrawer() {
  if (window.matchMedia("(min-width: 900px)").matches) closeDrawer();
}

function openAuthModal(signup = false) {
  authSignup.value = signup;
  authFormError.value = "";
  if (signup) signupMountKey.value += 1;
  authVisible.value = true;
  setBodyModal(true);
  closeDrawer();
}

function openAuthSignIn() {
  closeDrawer();
  openAuthModal(false);
}

function openAuthSignUp() {
  closeDrawer();
  openAuthModal(true);
}

function closeAuthModal() {
  authVisible.value = false;
  setBodyModal(false);
}

function onAuthModeChange(next: TrinityAuthMode) {
  openAuthModal(next === "signup");
}

function onSigninSubmit() {
  setSignedIn(true);
  closeAuthModal();
  void router.push({ name: "aic-account-console", hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS });
}

function onSignupSubmit() {
  authFormError.value = "";
  setSignedIn(true);
  closeAuthModal();
  void router.push({ name: "aic-account-console", hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS });
}

function oauthToConsole() {
  setSignedIn(true);
  closeAuthModal();
  void router.push({ name: "aic-account-console", hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS });
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
  setSignedIn(false);
  closeUserMenu();
  void router.push({ name: "aic-home" });
}

function onAuthKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && authVisible.value) closeAuthModal();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  window.addEventListener("resize", onResizeDrawer);
  document.addEventListener("keydown", onAuthKeydown);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  window.removeEventListener("resize", onResizeDrawer);
  document.removeEventListener("keydown", onAuthKeydown);
  document.body.classList.remove("or-modal-open");
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
            <RouterLink :to="{ name: 'aic-home' }" :class="{ 'is-active': orPage === 'home' }">官网</RouterLink>
            <RouterLink
              :to="{ name: 'aic-account-console', hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS }"
              :class="{ 'is-active': orPage === 'console' }"
            >
              用户中心
            </RouterLink>
          </nav>

          <div class="or-header-actions">
            <button
              id="or-lang-btn"
              type="button"
              class="or-lang-btn"
              :title="uiLang.titleText"
              :aria-label="uiLang.ariaLabel"
              @click="uiLang.toggle"
            >
              <svg
                class="or-lang-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m5 8l6 6m-7 0l6-6l2-3M2 5h12M7 2h1m14 20l-5-10l-5 10m2-4h6"
                />
              </svg>
              <span class="or-lang-label">{{ uiLang.labelText }}</span>
            </button>

            <span class="or-header-rule or-header-rule--after-lang" aria-hidden="true" />

            <div v-show="!isSignedIn" class="or-guest-cluster">
              <button type="button" class="sign-in" @click="openAuthSignUp">注册</button>
              <button type="button" class="btn btn-gradient or-login-pill" @click="openAuthSignIn">登录</button>
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
                <button type="button" class="or-menu-item" role="menuitem" @click="goConsole()">账号管理</button>
                <button
                  type="button"
                  class="or-menu-item"
                  role="menuitem"
                  @click="goConsole(AI_CLOUD_CONSOLE_HASH.BILLING)"
                >
                  费用
                </button>
                <button type="button" class="or-menu-item" role="menuitem" @click="goHome()">返回官网</button>
                <button type="button" class="or-menu-item danger" role="menuitem" @click="onSignOut">退出登录</button>
              </div>
            </div>

            <button
              id="menu-btn"
              type="button"
              class="menu-toggle"
              :aria-expanded="drawerOpen ? 'true' : 'false'"
              aria-controls="drawer"
              aria-label="打开菜单"
              @click="toggleDrawer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div id="drawer" class="mobile-drawer" :class="{ open: drawerOpen }">
        <RouterLink :to="{ name: 'aic-home' }" @click="closeDrawer">官网</RouterLink>
        <RouterLink
          :to="{ name: 'aic-account-console', hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS }"
          @click="closeDrawer"
        >
          用户中心
        </RouterLink>
        <button v-show="!isSignedIn" type="button" class="sign-in or-drawer-register" @click="openAuthSignUp">
          注册
        </button>
        <button v-show="!isSignedIn" type="button" class="or-drawer-signin" @click="openAuthSignIn">登录</button>
        <RouterLink
          v-show="isSignedIn"
          class="or-drawer-ref-link"
          :to="{ name: 'aic-account-console', hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS }"
          @click="closeDrawer"
        >
          账号管理
        </RouterLink>
      </div>
    </header>

    <main id="main" class="w-full min-h-0 flex-auto" role="main">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['AiCloudConsolePage']">
          <component :is="Component" :key="String(route.name ?? '')" />
        </KeepAlive>
      </RouterView>
    </main>

    <TrinityAuthModal
      id="aic-auth-modal-root"
      :open="authVisible"
      :mode="authMode"
      id-prefix="aic-auth"
      signin-subtitle="使用企业账号登录"
      signin-hint="请妥善保管账号与密码，勿在公共设备保存登录状态。"
      :signup-form-error="authFormError"
      :signup-reset-key="signupMountKey"
      @close="closeAuthModal"
      @update:mode="onAuthModeChange"
      @oauth="oauthToConsole"
      @signin="onSigninSubmit"
      @signup="onSignupSubmit"
    />
  </div>
</template>
