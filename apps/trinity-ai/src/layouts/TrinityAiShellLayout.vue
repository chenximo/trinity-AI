<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import TrinityAiAuthModal from "../components/TrinityAiAuthModal.vue";
import { useTrinityOrSession } from "../composables/useTrinityOrSession";
import { useTrinityOrTheme } from "../composables/useTrinityOrTheme";
import { useTrinityOrUiLang } from "../composables/useTrinityOrUiLang";

const suiteHomeHref =
  (import.meta.env.VITE_TRINITY_SUITE_HOME as string | undefined) ?? "../TrinityCloud/home.html";

const route = useRoute();
const router = useRouter();

const theme = useTrinityOrTheme();
const uiLang = useTrinityOrUiLang();
const session = useTrinityOrSession();

const authRef = ref<InstanceType<typeof TrinityAiAuthModal> | null>(null);
const drawerOpen = ref(false);
const userMenuOpen = ref(false);
const userWrapRef = ref<HTMLElement | null>(null);

const orPage = computed(() => (route.meta.orPage as string) || "home");

const primaryNav = [
  { name: "tai-home" as const, label: "首页", orPage: "home" },
  { name: "tai-models" as const, label: "模型", orPage: "models" },
  { name: "tai-chat" as const, label: "对话", orPage: "chat" },
  { name: "tai-docs" as const, label: "文档", orPage: "docs" },
];

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
  authRef.value?.open("signin");
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
  void router.push({ name: "tai-account-console", hash: "#preset" });
}

onMounted(async () => {
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  window.addEventListener("resize", onResizeDrawer);

  const autoload = document.body.getAttribute("data-or-autoload");
  await nextTick();
  if (autoload === "signin") authRef.value?.open("signin");
  else if (autoload === "signup") authRef.value?.open("signup");

  type TrinityORApi = {
    openSignIn: (mode?: string) => void;
    signOut: () => void;
    isSignedIn: () => boolean;
  };
  (window as unknown as { TrinityOR?: TrinityORApi }).TrinityOR = {
    openSignIn: (mode?: string) => authRef.value?.open(mode === "signup" ? "signup" : "signin"),
    signOut: () => session.setSignedIn(false),
    isSignedIn: () => session.isSignedIn.value,
  };
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  window.removeEventListener("resize", onResizeDrawer);
  delete (window as unknown as { TrinityOR?: unknown }).TrinityOR;
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
                  :to="{ name: 'tai-account-console', hash: '#keys' }"
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
                  :to="{ name: 'tai-account-console', hash: '#preset' }"
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
                  :to="{ name: 'tai-account-console', hash: '#credits' }"
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
                  :to="{ name: 'tai-account-console', hash: '#activity' }"
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
                  :to="{ name: 'tai-account-console', hash: '#logs' }"
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
      <RouterView :key="String(route.name ?? '')" />
    </main>

    <TrinityAiAuthModal ref="authRef" @signed-in="onSignedIn" />
  </div>
</template>
