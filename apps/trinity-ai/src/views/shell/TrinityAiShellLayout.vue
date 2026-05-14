<script setup lang="ts">
import { computed, KeepAlive, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { SHELL_PRIMARY_NAV, TRINITY_OR_REMEMBER_KEY } from "./mock";
import {
  mountTrinityOrWindowApi,
  useTrinityOrSession,
  useTrinityOrTheme,
  useTrinityOrUiLang,
} from "./shellInteractions";
import "./shell.css";
import { ACCOUNT_CONSOLE_HASH } from "../account/mock";

const suiteHomeHref =
  (import.meta.env.VITE_TRINITY_SUITE_HOME as string | undefined) ?? "../TrinityCloud/home.html";

const route = useRoute();
const router = useRouter();

const theme = useTrinityOrTheme();
const uiLang = useTrinityOrUiLang();
const session = useTrinityOrSession();

const drawerOpen = ref(false);
const userMenuOpen = ref(false);
const userWrapRef = ref<HTMLElement | null>(null);

const visible = ref(false);
const mode = ref<"signin" | "signup">("signin");
const signupError = ref("");

const regPassword = ref("");
const strengthPct = ref(0);
const strengthTier = ref<0 | 1 | 2 | 3>(0);
const strengthLabel = ref("—");
const strengthTextClass = ref("");

function runStrength() {
  const v = regPassword.value || "";
  if (v.length === 0) {
    strengthPct.value = 0;
    strengthTier.value = 0;
    strengthLabel.value = "—";
    strengthTextClass.value = "";
    return;
  }
  let score = 0;
  if (v.length >= 6) score++;
  if (v.length >= 10) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[a-z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  let tier: 1 | 2 | 3 = 1;
  let text = "弱";
  if (score >= 5) {
    tier = 3;
    text = "强";
  } else if (score >= 3) {
    tier = 2;
    text = "中";
  }
  strengthTier.value = tier;
  strengthPct.value = tier === 1 ? 33 : tier === 2 ? 66 : 100;
  strengthLabel.value = text;
  strengthTextClass.value = tier === 1 ? "is-weak" : tier === 2 ? "is-mid" : "is-strong";
}

watch(regPassword, runStrength);

const strengthFillClass = computed(() => {
  const t = strengthTier.value;
  if (t === 1) return "or-auth-strength-fill is-weak";
  if (t === 2) return "or-auth-strength-fill is-mid";
  if (t === 3) return "or-auth-strength-fill is-strong";
  return "or-auth-strength-fill";
});

const authTitle = computed(() => (mode.value === "signup" ? "创建账号" : "欢迎回来"));
const authSub = computed(() =>
  mode.value === "signup" ? "注册 Trinity AI 账号以开始使用" : "使用您的账号登录 Trinity AI"
);

function setBodyModal(isOpen: boolean) {
  document.body.classList.toggle("or-modal-open", isOpen);
}

function replaceHash(h: string) {
  try {
    void router.replace({ path: route.path, query: route.query, hash: h || undefined });
  } catch {
    /* ignore */
  }
}

function openAuthModal(next: "signin" | "signup" = "signin") {
  mode.value = next;
  signupError.value = "";
  visible.value = true;
  setBodyModal(true);
  replaceHash(next === "signup" ? "#register" : "#login");
  void nextTick(() => {
    const id = next === "signup" ? "or-auth-reg-email" : "or-auth-email";
    document.getElementById(id)?.focus();
  });
}

function closeAuthModal() {
  visible.value = false;
  setBodyModal(false);
  const h = route.hash;
  if (h === "#login" || h === "#register") replaceHash("");
}

function onBackdropClick() {
  closeAuthModal();
}

function onAuthKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeAuthModal();
}

function onSigninSubmit(e: Event) {
  e.preventDefault();
  const remember = (document.getElementById("or-auth-remember") as HTMLInputElement | null)?.checked;
  try {
    if (remember) localStorage.setItem(TRINITY_OR_REMEMBER_KEY, "1");
    else localStorage.removeItem(TRINITY_OR_REMEMBER_KEY);
  } catch {
    /* ignore */
  }
  onSignedIn();
  closeAuthModal();
}

function onSignupSubmit(e: Event) {
  e.preventDefault();
  signupError.value = "";
  const agree = (document.getElementById("or-auth-agree") as HTMLInputElement | null)?.checked;
  if (!agree) {
    signupError.value = "请先开启「用户协议」开关。";
    return;
  }
  const p1 = (document.getElementById("or-auth-reg-password") as HTMLInputElement | null)?.value ?? "";
  const p2 = (document.getElementById("or-auth-reg-password2") as HTMLInputElement | null)?.value ?? "";
  if (p1 !== p2) {
    signupError.value = "两次输入的密码不一致。";
    return;
  }
  if (p1.length < 8) {
    signupError.value = "密码至少 8 位。";
    return;
  }
  onSignedIn();
  closeAuthModal();
}

function oauthDemo() {
  onSignedIn();
  closeAuthModal();
}

function refreshCaptcha(e: Event) {
  e.preventDefault();
  const cap = document.getElementById("or-auth-captcha") as HTMLInputElement | null;
  if (cap) {
    cap.value = "";
    cap.focus();
  }
}

function onForgot(e: Event) {
  e.preventDefault();
}

function onTermsHelp(e: Event) {
  e.preventDefault();
}

watch(
  () => route.hash,
  (h) => {
    if (h === "#login") openAuthModal("signin");
    else if (h === "#register") openAuthModal("signup");
  },
  { immediate: true }
);

watch(
  () => route.query,
  (q) => {
    if (q.signin === "1") {
      openAuthModal("signin");
      void router.replace({ path: route.path, query: {} });
    }
    if (q.register === "1") {
      openAuthModal("signup");
      void router.replace({ path: route.path, query: {} });
    }
  },
  { immediate: true }
);

const orPage = computed(() => (route.meta.orPage as string) || "home");

const primaryNav = SHELL_PRIMARY_NAV;

function isNavActive(orPageKey: string) {
  return (route.meta.orPage as string | undefined) === orPageKey;
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
  try {
    if (window.matchMedia("(min-width: 900px)").matches) closeDrawer();
  } catch {
    /* ignore */
  }
}

function openAuthSignIn() {
  closeDrawer();
  openAuthModal("signin");
}

function onSignedIn() {
  session.setSignedIn(true);
  closeUserMenu();
  if (route.name === "tai-home") {
    void router.push({ name: "tai-account-console" });
  }
}

function onSignOut(e: Event) {
  e.preventDefault();
  session.setSignedIn(false);
  closeUserMenu();
}

function onPrefsGear(e: Event) {
  e.preventDefault();
  closeUserMenu();
  void router.push({ name: "tai-account-console", hash: ACCOUNT_CONSOLE_HASH.PRESET });
}

let detachTrinityOr: (() => void) | undefined;

onMounted(async () => {
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  window.addEventListener("resize", onResizeDrawer);
  document.addEventListener("keydown", onAuthKeydown);

  const autoload = document.body.getAttribute("data-or-autoload");
  await nextTick();
  if (autoload === "signin") openAuthModal("signin");
  else if (autoload === "signup") openAuthModal("signup");

  detachTrinityOr = mountTrinityOrWindowApi({
    openSignIn: (mode?: string) => openAuthModal(mode === "signup" ? "signup" : "signin"),
    signOut: () => session.setSignedIn(false),
    isSignedIn: () => session.isSignedIn.value,
  });
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  window.removeEventListener("resize", onResizeDrawer);
  document.removeEventListener("keydown", onAuthKeydown);
  document.body.classList.remove("or-modal-open");
  detachTrinityOr?.();
});
</script>

<template>
  <div class="or-site flex min-h-screen flex-col" :data-or-page="orPage">
    <a class="skip" href="#main">跳转至正文</a>

    <header class="or-inject" :data-or-page="orPage">
      <div class="header-row">
        <div class="header-brand-cluster">
          <a :href="suiteHomeHref" class="brand-row" aria-label="Trinity AI 云首页">
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
            Trinity AI
          </a>
        </div>

        <div class="header-end">
          <nav class="primary or-ornav" aria-label="主导航">
            <RouterLink
              v-for="item in primaryNav"
              :key="item.name"
              :to="{ name: item.name }"
              :class="{ 'is-active': isNavActive(item.orPage) }"
            >
              {{ item.label }}
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

            <div id="or-guest-cluster" class="or-guest-cluster" :hidden="session.isSignedIn">
              <button
                id="or-signin-btn"
                type="button"
                class="btn btn-gradient or-login-pill"
                @click="openAuthSignIn"
              >
                登录
              </button>
            </div>

            <div id="or-user-wrap" ref="userWrapRef" class="or-user-wrap" :hidden="!session.isSignedIn">
              <button
                id="or-user-trigger"
                type="button"
                class="or-user-trigger"
                :aria-expanded="userMenuOpen ? 'true' : 'false'"
                aria-haspopup="true"
                aria-controls="or-user-menu"
                aria-label="账户菜单"
                @click.stop="toggleUserMenu"
              >
                <span class="or-user-avatar" aria-hidden="true">P</span>
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
              <div id="or-user-menu" class="or-user-menu" role="menu" :hidden="!userMenuOpen">
                <div class="or-user-menu-head">
                  <span class="or-user-avatar sm" aria-hidden="true">P</span>
                  <span class="or-user-menu-title">账户</span>
                  <button
                    id="or-prefs-gear"
                    type="button"
                    class="or-icon-btn"
                    title="角色管理"
                    aria-label="角色管理"
                    @click="onPrefsGear"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3" />
                      <path
                        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                      />
                    </svg>
                  </button>
                </div>
                <div class="or-menu-group-label" role="presentation">工作区</div>
                <RouterLink
                  class="or-menu-item"
                  role="menuitem"
                  :to="{ name: 'tai-account-console', hash: ACCOUNT_CONSOLE_HASH.KEYS }"
                  @click="closeUserMenu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                  <span>API 密钥</span>
                </RouterLink>
                <RouterLink
                  class="or-menu-item"
                  role="menuitem"
                  :to="{ name: 'tai-account-console', hash: ACCOUNT_CONSOLE_HASH.PRESET }"
                  @click="closeUserMenu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" />
                  </svg>
                  <span>角色管理</span>
                </RouterLink>
                <div class="or-menu-group-label" role="presentation">账户</div>
                <RouterLink
                  class="or-menu-item"
                  role="menuitem"
                  :to="{ name: 'tai-account-console', hash: ACCOUNT_CONSOLE_HASH.CREDITS }"
                  @click="closeUserMenu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  <span>额度</span>
                </RouterLink>
                <RouterLink
                  class="or-menu-item"
                  role="menuitem"
                  :to="{ name: 'tai-account-console', hash: ACCOUNT_CONSOLE_HASH.ACTIVITY }"
                  @click="closeUserMenu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path d="M4 19V5M9 19v-7M14 19V9M19 19v-4" />
                  </svg>
                  <span>活动</span>
                </RouterLink>
                <RouterLink
                  class="or-menu-item"
                  role="menuitem"
                  :to="{ name: 'tai-account-console', hash: ACCOUNT_CONSOLE_HASH.LOGS }"
                  @click="closeUserMenu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                  <span>用量</span>
                </RouterLink>
                <button id="or-signout-btn" type="button" class="or-menu-item danger" role="menuitem" @click="onSignOut">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  <span>退出登录</span>
                </button>
                <div class="or-theme-bar" role="group" aria-label="主题">
                  <button
                    type="button"
                    class="or-theme-seg"
                    data-theme-pick="light"
                    title="浅色"
                    aria-label="浅色模式"
                    :class="{ 'is-active': theme.pick === 'light' }"
                    @click.stop.prevent="theme.setTheme('light')"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="or-theme-seg"
                    data-theme-pick="dark"
                    title="深色"
                    aria-label="深色模式"
                    :class="{ 'is-active': theme.pick === 'dark' }"
                    @click.stop.prevent="theme.setTheme('dark')"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="or-theme-seg"
                    data-theme-pick="system"
                    title="跟随系统"
                    aria-label="跟随系统"
                    :class="{ 'is-active': theme.pick === 'system' }"
                    @click.stop.prevent="theme.setTheme('system')"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </button>
                </div>
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
        <RouterLink
          v-for="item in primaryNav"
          :key="item.name"
          :to="{ name: item.name }"
          :class="{ 'is-active': isNavActive(item.orPage) }"
          @click="closeDrawer"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'tai-account-console' }"
          class="or-drawer-ref-link"
          @click="closeDrawer"
        >
          控制台
        </RouterLink>
        <RouterLink :to="{ name: 'tai-dev-ui-kit' }" class="or-drawer-ref-link" @click="closeDrawer"> UI 烟测 </RouterLink>
        <button
          id="or-drawer-signin"
          type="button"
          class="or-drawer-signin"
          :hidden="session.isSignedIn"
          @click="openAuthSignIn"
        >
          登录
        </button>
      </div>
    </header>

    <main id="main" class="w-full min-h-0 flex-auto" role="main">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['TaiAccountConsolePage']">
          <component :is="Component" :key="String(route.name ?? '')" />
        </KeepAlive>
      </RouterView>
    </main>

<div id="or-auth-modal-root" class="or-modal-root" :hidden="!visible">
    <div id="or-auth-backdrop" class="or-modal-backdrop" tabindex="-1" @click="onBackdropClick" />
    <div class="or-modal-card or-auth-modal" role="dialog" aria-modal="true" aria-labelledby="or-auth-title">
      <button id="or-auth-close" type="button" class="or-modal-close" aria-label="关闭" @click="closeAuthModal">
        &times;
      </button>
      <div class="or-auth-head">
        <h2 id="or-auth-title" class="or-auth-head-title">{{ authTitle }}</h2>
        <p id="or-auth-sub" class="or-auth-head-sub">{{ authSub }}</p>
      </div>
      <div class="or-auth-tabs or-auth-tabs--segmented" role="tablist" aria-label="登录或注册">
        <button
          id="or-auth-tab-signin"
          type="button"
          class="or-auth-tab"
          :class="{ 'is-active': mode === 'signin' }"
          role="tab"
          :aria-selected="mode === 'signin'"
          data-or-auth-tab="signin"
          @click="openAuthModal('signin')"
        >
          登录
        </button>
        <button
          id="or-auth-tab-signup"
          type="button"
          class="or-auth-tab"
          :class="{ 'is-active': mode === 'signup' }"
          role="tab"
          :aria-selected="mode === 'signup'"
          data-or-auth-tab="signup"
          @click="openAuthModal('signup')"
        >
          注册
        </button>
      </div>
      <div id="or-auth-oauth-wrap" class="or-auth-oauth-wrap">
        <div class="or-oauth-row">
          <button
            id="or-auth-google"
            type="button"
            class="or-oauth-btn"
            title="演示登录（未连接）"
            aria-label="Google 登录（演示）"
            @click="oauthDemo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google 登录
          </button>
          <button
            id="or-auth-github"
            type="button"
            class="or-oauth-btn"
            title="演示登录（未连接）"
            aria-label="GitHub 登录（演示）"
            @click="oauthDemo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 1C5.92 1 1 5.92 1 12c0 4.87 3.16 8.99 7.55 10.45.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.86-3.06.67-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.44-.28-5-1.22-5-5.45 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.39.11-2.9 0 0 .92-.3 3.03 1.13.88-.25 1.82-.37 2.76-.37.94 0 1.88.12 2.76.37 2.11-1.43 3.03-1.13 3.03-1.13.6 1.51.22 2.62.11 2.9.7.77 1.13 1.76 1.13 2.96 0 4.24-2.57 5.17-5.02 5.44.39.34.74 1.01.74 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.75.53C19.84 20.99 23 16.87 23 12 23 5.92 18.08 1 12 1z"
              />
            </svg>
            GitHub 登录
          </button>
        </div>
        <div class="or-auth-divider" role="separator">或者使用邮箱</div>
      </div>
      <div
        id="or-auth-panel-signin"
        class="or-auth-panel"
        role="tabpanel"
        aria-labelledby="or-auth-tab-signin"
        :hidden="mode !== 'signin'"
      >
        <form id="or-auth-form-signin" class="or-auth-form" novalidate @submit="onSigninSubmit">
          <div class="form-group">
            <label for="or-auth-email">邮箱或用户名</label>
            <input
              id="or-auth-email"
              type="text"
              autocomplete="username"
              placeholder="name@example.com"
              required
            />
          </div>
          <div class="form-group">
            <div class="or-auth-label-row">
              <label for="or-auth-password">密码</label>
              <a id="or-auth-forgot" href="#" class="or-auth-forgot" @click="onForgot">忘记密码？</a>
            </div>
            <input
              id="or-auth-password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>
          <label class="or-auth-remember"><input id="or-auth-remember" type="checkbox" />记住我</label>
          <button type="submit" class="or-auth-login-btn">登录</button>
          <p class="or-auth-hint">静态演示，不会向服务器发送任何数据。</p>
          <div id="or-auth-foot-signin" class="or-auth-foot">
            <span class="or-auth-foot-muted">还没有账号？</span>
            <button id="or-auth-to-signup" type="button" class="or-auth-foot-link" @click="openAuthModal('signup')">
              立即注册
            </button>
          </div>
        </form>
      </div>
      <div
        id="or-auth-panel-signup"
        class="or-auth-panel or-auth-panel--signup"
        role="tabpanel"
        aria-labelledby="or-auth-tab-signup"
        :hidden="mode !== 'signup'"
      >
        <form id="or-auth-form-signup" class="or-auth-form or-auth-form-signup" novalidate @submit="onSignupSubmit">
          <div class="or-auth-signup-card">
            <div class="or-auth-server-head">
              <span class="or-auth-server-head-label">账号信息</span>
              <a
                id="or-auth-reg-help"
                href="#"
                class="or-auth-server-head-link"
                title="帮助"
                aria-label="注册帮助"
                @click="onTermsHelp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                </svg>
              </a>
            </div>
            <div class="or-auth-server-row">
              <div class="or-auth-server-row-inner">
                <span class="or-auth-server-ico" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </span>
                <div class="or-auth-server-body">
                  <strong class="or-auth-server-title">邮箱</strong>
                  <span class="or-auth-server-desc">用于登录与找回密码</span>
                  <input
                    id="or-auth-reg-email"
                    class="or-auth-server-input"
                    type="email"
                    autocomplete="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <span class="or-auth-server-chevron" aria-hidden="true">›</span>
              </div>
            </div>
            <div class="or-auth-server-row">
              <div class="or-auth-server-row-inner">
                <span class="or-auth-server-ico" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <div class="or-auth-server-body">
                  <strong class="or-auth-server-title">密码</strong>
                  <span class="or-auth-server-desc">至少 8 位，建议含大小写、数字与符号</span>
                  <span class="or-auth-server-meta"
                    >强度 · <span id="or-auth-strength-text" :class="strengthTextClass">{{ strengthLabel }}</span></span
                  >
                  <input
                    id="or-auth-reg-password"
                    v-model="regPassword"
                    class="or-auth-server-input"
                    type="password"
                    autocomplete="new-password"
                    placeholder="输入密码"
                    required
                  />
                  <div class="or-auth-strength or-auth-strength--signup" aria-live="polite">
                    <div class="or-auth-strength-track">
                      <div id="or-auth-strength-fill" :class="strengthFillClass" :style="{ width: strengthPct + '%' }" />
                    </div>
                  </div>
                </div>
                <span class="or-auth-server-chevron" aria-hidden="true">›</span>
              </div>
            </div>
            <div class="or-auth-server-row">
              <div class="or-auth-server-row-inner">
                <span class="or-auth-server-ico" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div class="or-auth-server-body">
                  <strong class="or-auth-server-title">确认密码</strong>
                  <span class="or-auth-server-desc">须与上一栏密码一致</span>
                  <input
                    id="or-auth-reg-password2"
                    class="or-auth-server-input"
                    type="password"
                    autocomplete="new-password"
                    placeholder="再次输入密码"
                    required
                  />
                </div>
                <span class="or-auth-server-chevron" aria-hidden="true">›</span>
              </div>
            </div>
            <div class="or-auth-server-row">
              <div class="or-auth-server-row-inner">
                <span class="or-auth-server-ico" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </span>
                <div class="or-auth-server-body">
                  <div class="or-auth-server-title-row">
                    <strong class="or-auth-server-title">验证码</strong>
                    <button id="or-auth-captcha-refresh" type="button" class="or-auth-server-link" @click="refreshCaptcha">
                      换一张
                    </button>
                  </div>
                  <span class="or-auth-server-meta">演示 · 图形码</span>
                  <span class="or-auth-server-desc">请输入图中数字（可任意填写）</span>
                  <input
                    id="or-auth-captcha"
                    class="or-auth-server-input"
                    type="text"
                    inputmode="numeric"
                    maxlength="8"
                    autocomplete="off"
                    placeholder="例如 5829"
                  />
                </div>
                <span class="or-auth-server-chevron" aria-hidden="true">›</span>
              </div>
            </div>
            <div class="or-auth-server-row">
              <div class="or-auth-server-row-inner">
                <span class="or-auth-server-ico" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </span>
                <div class="or-auth-server-body">
                  <strong class="or-auth-server-title">订阅邮件</strong>
                  <span class="or-auth-server-desc">产品更新、安全与账单提醒</span>
                  <span class="or-auth-server-meta">可选 · 默认关闭</span>
                </div>
                <label class="or-auth-switch" for="or-auth-newsletter">
                  <input id="or-auth-newsletter" type="checkbox" class="or-auth-switch-input" />
                  <span class="or-auth-switch-track" aria-hidden="true"><span class="or-auth-switch-knob" /></span>
                </label>
                <span class="or-auth-server-chevron" aria-hidden="true">›</span>
              </div>
            </div>
            <div class="or-auth-server-row or-auth-server-row--last">
              <div class="or-auth-server-row-inner">
                <span class="or-auth-server-ico" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <div class="or-auth-server-body">
                  <strong class="or-auth-server-title">用户协议</strong>
                  <span class="or-auth-server-desc"
                    >请阅读 <a id="or-auth-terms-link" href="#" class="or-auth-foot-link" @click="onTermsHelp">《用户协议》</a></span
                  >
                  <span class="or-auth-server-meta">必选 · 开启以继续</span>
                </div>
                <label class="or-auth-switch" for="or-auth-agree">
                  <input id="or-auth-agree" type="checkbox" class="or-auth-switch-input" required />
                  <span class="or-auth-switch-track" aria-hidden="true"><span class="or-auth-switch-knob" /></span>
                </label>
                <span class="or-auth-server-chevron" aria-hidden="true">›</span>
              </div>
            </div>
          </div>
          <p v-show="!!signupError" id="or-auth-signup-error" class="or-auth-inline-error">{{ signupError }}</p>
          <button type="submit" class="or-auth-login-btn or-auth-signup-submit">创建账号</button>
        </form>
        <p class="or-auth-hint">静态演示，不会向服务器发送任何数据。</p>
        <div id="or-auth-foot-signup" class="or-auth-foot">
          <span class="or-auth-foot-muted">已有账号？</span>
          <button id="or-auth-to-signin" type="button" class="or-auth-foot-link" @click="openAuthModal('signin')">立即登录</button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
