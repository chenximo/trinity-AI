<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { TrinityAuthModal, type TrinityAuthMode } from "@trinity/ui";
import { AI_CLOUD_CONSOLE_HASH } from "../account/mock";
import AliyunCloudSceneVisual from "../../components/AliyunCloudSceneVisual.vue";
import AwsCloudSceneVisual from "../../components/AwsCloudSceneVisual.vue";
import AzureCloudSceneVisual from "../../components/AzureCloudSceneVisual.vue";
import CloudVendorLogo from "../../components/CloudVendorLogo.vue";
import GcpCloudSceneVisual from "../../components/GcpCloudSceneVisual.vue";
import HuaweiCloudSceneVisual from "../../components/HuaweiCloudSceneVisual.vue";
import TencentCloudSceneVisual from "../../components/TencentCloudSceneVisual.vue";
import HomeHeroCloudOrbit from "../../components/HomeHeroCloudOrbit.vue";
import advantageResources from "../../assets/home/advantage-resources.png";
import advantagePricing from "../../assets/home/advantage-pricing.png";
import { useTrinityOrSession, useTrinityOrUiLang } from "../shell/shellInteractions";

defineOptions({ name: "AiCloudHomePage" });

type HomeCloudVendor = "aliyun" | "tencent" | "huawei" | "aws" | "gcp" | "azure";

const HOME_CLOUD_NAV_VENDORS = [
  { vendor: "aliyun" as const, label: "阿里云", hash: "cloud-aliyun", panelId: "cloud-aliyun" },
  { vendor: "tencent" as const, label: "腾讯云", hash: "cloud-tencent", panelId: "cloud-tencent" },
  { vendor: "huawei" as const, label: "华为云", hash: "cloud-huawei", panelId: "cloud-huawei" },
  { vendor: "aws" as const, label: "AWS", hash: "cloud-aws", panelId: "cloud-aws" },
  { vendor: "gcp" as const, label: "Google Cloud", hash: "cloud-gcp", panelId: "cloud-gcp" },
  { vendor: "azure" as const, label: "Azure", hash: "cloud-azure", panelId: "cloud-azure" },
] satisfies ReadonlyArray<{
  vendor: HomeCloudVendor;
  label: string;
  hash: string;
  panelId: string;
}>;

const router = useRouter();
const pageRef = ref<HTMLElement | null>(null);

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

function setBodyModal(open: boolean) {
  document.body.classList.toggle("or-modal-open", open);
}

function closeDrawer() {
  drawerOpen.value = false;
}

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
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
  setTimeout(() => {
    pageRef.value?.querySelector<HTMLInputElement>("#home-auth-email")?.focus();
  }, 0);
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

function oauthToConsole() {
  void router.push({ name: "aic-account-console", hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS });
}

function onSigninSubmit() {
  setSignedIn(true);
  oauthToConsole();
}

function onAuthModeChange(next: TrinityAuthMode) {
  openAuthModal(next === "signup");
}

function onSignupSubmit() {
  authFormError.value = "";
  setSignedIn(true);
  oauthToConsole();
}

function onSignOut(e: Event) {
  e.preventDefault();
  setSignedIn(false);
  closeUserMenu();
}

let disposeDom: (() => void) | undefined;
let selectCloudTabByPanelId: ((panelId: string) => void) | null = null;

function cloudNavItemFromHash(hash: string) {
  const id = hash.replace(/^#/, "");
  return HOME_CLOUD_NAV_VENDORS.find((v) => v.hash === id) ?? null;
}

function applyCloudVendorNav(item: (typeof HOME_CLOUD_NAV_VENDORS)[number]) {
  selectCloudTabByPanelId?.(item.panelId);
  document.getElementById("cloud-solutions")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function onCloudVendorNavClick(vendor: HomeCloudVendor, e: Event) {
  e.preventDefault();
  closeDrawer();
  const item = HOME_CLOUD_NAV_VENDORS.find((v) => v.vendor === vendor);
  if (!item) return;
  const target = `#${item.hash}`;
  if (location.hash === target) applyCloudVendorNav(item);
  else location.hash = target;
}

onMounted(() => {
  const root = pageRef.value;
  if (!root) return;

  const cleanups: Array<() => void> = [];
  let setOverlapActiveFn: ((id: string) => void) | null = null;
  let overlapSectionIds: string[] = [];

  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  window.addEventListener("resize", onResizeDrawer);
  cleanups.push(() => {
    document.removeEventListener("pointerdown", onDocumentPointerDown, true);
    window.removeEventListener("resize", onResizeDrawer);
  });

  const overlapLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>(".home-overlap-item[href^='#']"));
  if (overlapLinks.length) {
    const sections = overlapLinks
      .map((link) => {
        const id = link.getAttribute("href")?.slice(1);
        const el = id ? document.getElementById(id) : null;
        return id && el ? { id, el } : null;
      })
      .filter((x): x is { id: string; el: HTMLElement } => Boolean(x));

    const setOverlapActive = (id: string) => {
      overlapLinks.forEach((link) => {
        const on = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", on);
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    setOverlapActiveFn = setOverlapActive;
    overlapSectionIds = sections.map((s) => s.id);

    const ratios = new Map<string, number>();
    const overlapObserver =
      sections.length > 0
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
              });
              let bestId = sections[0].id;
              let best = -1;
              ratios.forEach((ratio, sid) => {
                if (ratio > best) {
                  best = ratio;
                  bestId = sid;
                }
              });
              if (best > 0) setOverlapActive(bestId);
            },
            { rootMargin: "-32% 0px -48% 0px", threshold: [0, 0.12, 0.28, 0.45, 0.6] },
          )
        : null;

    sections.forEach(({ el }) => overlapObserver?.observe(el));
    if (overlapObserver) cleanups.push(() => overlapObserver.disconnect());

    overlapLinks.forEach((link) => {
      const onClick = () => {
        const id = link.getAttribute("href")?.slice(1);
        if (id) setOverlapActive(id);
      };
      link.addEventListener("click", onClick);
      cleanups.push(() => link.removeEventListener("click", onClick));
    });

  }

  const tabRoot = root.querySelector("#home-cloud-tabs");
  if (tabRoot) {
    const tabs = Array.from(tabRoot.querySelectorAll<HTMLElement>('[role="tab"]'));
    const panels = Array.from(tabRoot.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    const selectTabIndex = (i: number) => {
      if (i < 0 || i >= tabs.length) return;
      tabs.forEach((t, j) => {
        const on = j === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      const activeId = tabs[i]?.getAttribute("aria-controls");
      panels.forEach((p) => {
        if (activeId && p.id === activeId) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    };
    const tabIndexOf = (el: Element) => tabs.indexOf(el as HTMLElement);
    tabs.forEach((tab) => {
      const onClick = () => selectTabIndex(tabIndexOf(tab));
      const onKey = (e: KeyboardEvent) => {
        const i = tabIndexOf(tab);
        let next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next >= 0) {
          e.preventDefault();
          selectTabIndex(next);
          tabs[next]?.focus();
        }
      };
      tab.addEventListener("click", onClick);
      tab.addEventListener("keydown", onKey);
      cleanups.push(() => {
        tab.removeEventListener("click", onClick);
        tab.removeEventListener("keydown", onKey);
      });
    });
    selectCloudTabByPanelId = (panelId: string) => {
      const i = tabs.findIndex((t) => t.getAttribute("aria-controls") === panelId);
      if (i >= 0) selectTabIndex(i);
    };
  }

  const handleLocationHash = () => {
    const id = location.hash.slice(1);
    const cloudItem = cloudNavItemFromHash(location.hash);
    if (cloudItem) {
      applyCloudVendorNav(cloudItem);
      setOverlapActiveFn?.("cloud-solutions");
      return;
    }
    if (id && overlapSectionIds.includes(id)) setOverlapActiveFn?.(id);
  };
  window.addEventListener("hashchange", handleLocationHash);
  cleanups.push(() => window.removeEventListener("hashchange", handleLocationHash));
  handleLocationHash();
  if (!location.hash.slice(1)) setOverlapActiveFn?.(overlapSectionIds[0] ?? "cloud-solutions");

  const onEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && authVisible.value) closeAuthModal();
  };
  document.addEventListener("keydown", onEscape);
  cleanups.push(() => document.removeEventListener("keydown", onEscape));

  const consultForm = root.querySelector("#home-consult-form");
  if (consultForm) {
    const fn = (e: Event) => {
      e.preventDefault();
      alert("感谢您的留言，我们会尽快与您联系。");
    };
    consultForm.addEventListener("submit", fn);
    cleanups.push(() => consultForm.removeEventListener("submit", fn));
  }

  disposeDom = () => {
    cleanups.forEach((fn) => fn());
    setBodyModal(false);
    selectCloudTabByPanelId = null;
  };
});

onUnmounted(() => {
  disposeDom?.();
});

</script>

<template>
  <div ref="pageRef" class="home-page or-site">
<a class="skip" href="#main">跳转至正文</a>

<header class="or-inject" data-or-page="home">
  <div class="header-row">
    <div class="header-brand-cluster">
      <RouterLink :to="{ name: 'aic-home' }" class="brand-row" aria-label="Trinity AI 云首页">
        <span class="brand-mark" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      <nav class="primary or-ornav home-nav-or" aria-label="主导航">
        <div class="home-nav-dd">
          <button type="button" class="home-nav-dd-btn" aria-expanded="false" aria-haspopup="true">
            AI 云
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div class="home-nav-dd-panel home-nav-dd-panel--cloud" role="menu">
            <a href="#cloud-solutions" role="menuitem" @click="closeDrawer">多云对接与各云说明</a>
            <div class="home-nav-dd-divider" role="separator" aria-hidden="true" />
            <span class="home-nav-dd-label">云厂商介绍</span>
            <div class="home-nav-dd-vendors" role="group" aria-label="云厂商介绍">
              <a
                v-for="item in HOME_CLOUD_NAV_VENDORS"
                :key="item.vendor"
                :href="`#${item.hash}`"
                role="menuitem"
                class="home-nav-dd-vendor"
                @click="onCloudVendorNavClick(item.vendor, $event)"
              >
                <span class="home-nav-dd-vendor__logo" aria-hidden="true"><CloudVendorLogo :vendor="item.vendor" /></span>
                <span>{{ item.label }}</span>
              </a>
            </div>
            <div class="home-nav-dd-divider" role="separator" aria-hidden="true" />
            <a href="#why" role="menuitem" @click="closeDrawer">核心优势</a>
            <a href="#benefits" role="menuitem" @click="closeDrawer">专属福利</a>
            <a href="#process" role="menuitem" @click="closeDrawer">购买流程</a>
          </div>
        </div>
        <RouterLink to="/trinity-ai" class="home-nav-or-link">Trinity AI</RouterLink>
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
            <svg class="or-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div class="or-user-menu" role="menu" :hidden="!userMenuOpen">
            <div class="or-user-menu-head">
              <span class="or-user-avatar sm" aria-hidden="true">企</span>
              <span class="or-user-menu-title">上海某某科技</span>
            </div>
            <RouterLink
              class="or-menu-item"
              role="menuitem"
              :to="{ name: 'aic-account-console', hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS }"
              @click="closeUserMenu"
            >
              用户中心
            </RouterLink>
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
    <span class="home-drawer-kicker">AI 云</span>
    <a href="#cloud-solutions" @click="closeDrawer">多云对接与各云说明</a>
    <span class="home-drawer-kicker">云厂商介绍</span>
    <a
      v-for="item in HOME_CLOUD_NAV_VENDORS"
      :key="item.vendor"
      :href="`#${item.hash}`"
      class="home-drawer-vendor"
      @click="onCloudVendorNavClick(item.vendor, $event)"
    >
      <span class="home-drawer-vendor__logo" aria-hidden="true"><CloudVendorLogo :vendor="item.vendor" /></span>
      {{ item.label }}
    </a>
    <a href="#why" @click="closeDrawer">核心优势</a>
    <a href="#benefits" @click="closeDrawer">专属福利</a>
    <a href="#process" @click="closeDrawer">购买流程</a>
    <RouterLink to="/trinity-ai" @click="closeDrawer">Trinity AI</RouterLink>
    <button v-show="!isSignedIn" type="button" class="sign-in or-drawer-register" @click="openAuthSignUp">注册</button>
    <button v-show="!isSignedIn" type="button" class="or-drawer-signin" @click="openAuthSignIn">登录</button>
    <RouterLink
      v-show="isSignedIn"
      class="or-drawer-ref-link"
      :to="{ name: 'aic-account-console', hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS }"
      @click="closeDrawer"
    >
      用户中心
    </RouterLink>
  </div>
</header>

<TrinityAuthModal
  id="home-login-modal-root"
  :open="authVisible"
  :mode="authMode"
  id-prefix="home-auth"
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

<main id="main">
  <section class="home-banner" aria-label="首屏">
    <div class="home-banner-bg" aria-hidden="true"></div>
    <div class="home-banner-grid" aria-hidden="true"></div>
    <div class="home-banner-inner home-shell">
      <div class="home-hero-grid">
        <div class="home-hero-left">
          <p class="home-eyebrow"><span class="home-eyebrow-dot" aria-hidden="true"></span> 云资源集采整合 · 一站式多云采购与管理</p>
          <h1><em>Trinity AI 云</em></h1>
          <p class="home-banner-save" role="status">企业上云成本优化最优解，让每家企业都用上云厂商大客户价</p>
          <div class="home-banner-action">
            <div class="home-banner-sub-wrap">
              <p class="home-banner-sub">
                一站式多云采购与管理，覆盖<span class="home-cloud-name">阿里云</span>、<span class="home-cloud-name">腾讯云</span>、<span class="home-cloud-name">华为云</span>、<span class="home-cloud-name">AWS</span>、<span class="home-cloud-name">Google Cloud</span>、<span class="home-cloud-name">Azure</span> 等主流公有云，提供渠道优惠价、上云方案咨询，助力企业降低上云成本、提升业务效率。依托集团体量议价，企业零门槛享大客户级折扣、灵活账期与统一账单；仅收透明服务费，不赚差价。
              </p>
              <div class="home-banner-cta home-banner-cta--sub">
                <a href="#consult" class="btn btn-gradient">立即咨询优惠权益</a>
              </div>
            </div>
          </div>
        </div>
        <div class="home-hero-right">
          <HomeHeroCloudOrbit />
        </div>
      </div>
    </div>
  </section>

  <nav class="home-overlap" aria-label="页面章节导航">
    <div class="home-overlap-inner">
      <div class="home-overlap-grid">
        <a class="home-overlap-item is-active" href="#cloud-solutions" data-overlap-section="cloud-solutions">
          <span class="home-overlap-kicker">多云对接</span>
          <span class="home-overlap-title-row">
            <strong class="home-overlap-title">主流云厂商</strong>
            <svg class="home-overlap-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </span>
          <span class="home-overlap-desc"><span class="home-cloud-name">阿里云</span>、<span class="home-cloud-name">腾讯云</span>、<span class="home-cloud-name">华为云</span>、<span class="home-cloud-name">AWS</span>、<span class="home-cloud-name">Google Cloud</span>、<span class="home-cloud-name">Azure</span> 全覆盖</span>
        </a>
        <a class="home-overlap-item" href="#why" data-overlap-section="why">
          <span class="home-overlap-kicker">核心优势</span>
          <span class="home-overlap-title-row">
            <strong class="home-overlap-title">为什么选择我们</strong>
            <svg class="home-overlap-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </span>
          <span class="home-overlap-desc">三大「零」承诺，四大核心赋能</span>
        </a>
        <a class="home-overlap-item" href="#benefits" data-overlap-section="benefits">
          <span class="home-overlap-kicker">专属福利</span>
          <span class="home-overlap-title-row">
            <strong class="home-overlap-title">专属福利</strong>
            <svg class="home-overlap-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </span>
          <span class="home-overlap-desc">渠道优惠、灵活账期、原厂技术支持</span>
        </a>
        <a class="home-overlap-item" href="#process" data-overlap-section="process">
          <span class="home-overlap-kicker">合作流程</span>
          <span class="home-overlap-title-row">
            <strong class="home-overlap-title">优惠合作流程</strong>
            <svg class="home-overlap-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </span>
          <span class="home-overlap-desc">五步闭环，从咨询到售后全程护航</span>
        </a>
        <a class="home-overlap-item" href="#consult" data-overlap-section="consult">
          <span class="home-overlap-kicker">专属咨询</span>
          <span class="home-overlap-title-row">
            <strong class="home-overlap-title">获取专属咨询</strong>
            <svg class="home-overlap-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </span>
          <span class="home-overlap-desc">留下联系方式，1～2 个工作日内回复</span>
        </a>
      </div>
    </div>
  </nav>

  <section class="home-usecase" id="cloud-solutions" aria-label="主流云厂商">
    <div class="home-shell" id="home-cloud-tabs">
      <div class="home-usecase-tablist" role="tablist" aria-label="选择云厂商">
        <button type="button" class="home-usecase-tab" role="tab" id="tab-aliyun" aria-controls="cloud-aliyun" aria-selected="true" tabindex="0">
          <span class="home-usecase-tab__inner">
            <span class="home-usecase-tab__logo" aria-hidden="true"><CloudVendorLogo vendor="aliyun" /></span>
            <span class="home-usecase-tab__label">阿里云</span>
          </span>
        </button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-tencent" aria-controls="cloud-tencent" aria-selected="false" tabindex="-1">
          <span class="home-usecase-tab__inner">
            <span class="home-usecase-tab__logo" aria-hidden="true"><CloudVendorLogo vendor="tencent" /></span>
            <span class="home-usecase-tab__label">腾讯云</span>
          </span>
        </button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-huawei" aria-controls="cloud-huawei" aria-selected="false" tabindex="-1">
          <span class="home-usecase-tab__inner">
            <span class="home-usecase-tab__logo" aria-hidden="true"><CloudVendorLogo vendor="huawei" /></span>
            <span class="home-usecase-tab__label">华为云</span>
          </span>
        </button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-aws" aria-controls="cloud-aws" aria-selected="false" tabindex="-1">
          <span class="home-usecase-tab__inner">
            <span class="home-usecase-tab__logo" aria-hidden="true"><CloudVendorLogo vendor="aws" /></span>
            <span class="home-usecase-tab__label">AWS</span>
          </span>
        </button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-gcp" aria-controls="cloud-gcp" aria-selected="false" tabindex="-1">
          <span class="home-usecase-tab__inner">
            <span class="home-usecase-tab__logo" aria-hidden="true"><CloudVendorLogo vendor="gcp" /></span>
            <span class="home-usecase-tab__label">Google Cloud</span>
          </span>
        </button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-azure" aria-controls="cloud-azure" aria-selected="false" tabindex="-1">
          <span class="home-usecase-tab__inner">
            <span class="home-usecase-tab__logo" aria-hidden="true"><CloudVendorLogo vendor="azure" /></span>
            <span class="home-usecase-tab__label">Azure</span>
          </span>
        </button>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="cloud-tencent" aria-labelledby="tab-tencent" hidden>
        <div class="home-usecase-layout home-usecase-layout--lrbt">
          <div class="home-usecase-layout__top">
            <div class="home-uc-visual home-uc-visual--lrbt" aria-hidden="true">
              <div class="home-uc-vis-inner">
                <div class="home-uc-vis-top">
                  <span class="home-uc-vis-top__logo" aria-hidden="true"><CloudVendorLogo vendor="tencent" /></span>
                  <span>腾讯云 · 直播与实时音视频</span>
                </div>
              <div class="home-uc-scene home-uc-scene--tencent">
                <div class="home-uc-scene-main home-uc-scene-main--tencent">
                  <TencentCloudSceneVisual />
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">连麦 / 互动直播</span>
                  <span class="home-uc-scene-tag">超低延迟转码</span>
                  <span class="home-uc-scene-tag">CDN + 实时 AI 特效 / 推理</span>
                </div>
              </div>
            </div>
          </div>
            <div class="home-usecase-copy home-usecase-copy--lrbt">
              <h3 class="home-usecase-copy__title">
                <span class="home-usecase-copy__title-logo" aria-hidden="true"><CloudVendorLogo vendor="tencent" /></span>
                腾讯云（Tencent Cloud）
              </h3>
              <p class="home-usecase-kicker">游戏云 · TRTC 音视频 · 微信生态 · 多线 BGP</p>
              <div class="home-usecase-body">
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">核心优势</strong>
                  游戏云绝对领先（国内份额 50%+），覆盖 90% 头部厂商；音视频 TRTC 标杆，直播 / 点播 / 实时通话质量强；微信生态深度打通，小程序开发体验最佳；网络质量优（多线 BGP），边缘节点多、延迟低。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">资源数量（2026）</strong>
                  全球 21 地域、65 可用区（含合作区 26 地域、70 可用区）；国内节点密集，音视频 / 游戏加速网络覆盖全国。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">客户画像</strong>
                  游戏厂商、直播 / 短视频、社交 APP、微信小程序、泛娱乐、音视频 UGC 平台。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">使用场景</strong>
                  手游 / 端游服务器、游戏防作弊、直播带货、实时互动、小程序开发、社交 IM、内容审核。
                </p>
              </div>
              <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
            </div>
          </div>
          <ul class="home-usecase-highlights" aria-label="腾讯云核心能力">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              游戏云国内份额 50%+，覆盖 90% 头部厂商
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              TRTC 直播 / 点播 / 实时通话标杆
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              微信生态与小程序开发体验最佳
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              多线 BGP，边缘节点多、延迟低
            </li>
          </ul>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="cloud-huawei" aria-labelledby="tab-huawei" hidden>
        <div class="home-usecase-layout home-usecase-layout--lrbt">
          <div class="home-usecase-layout__top">
            <div class="home-uc-visual home-uc-visual--lrbt" aria-hidden="true">
              <div class="home-uc-vis-inner">
                <div class="home-uc-vis-top">
                  <span class="home-uc-vis-top__logo" aria-hidden="true"><CloudVendorLogo vendor="huawei" /></span>
                  <span>华为云 · 政企与运营商专线</span>
                </div>
              <div class="home-uc-scene home-uc-scene--huawei">
                <div class="home-uc-scene-main home-uc-scene-main--huawei">
                  <HuaweiCloudSceneVisual />
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">运营商骨干 / 专线入云</span>
                  <span class="home-uc-scene-tag">政务专网 · 等保合规</span>
                  <span class="home-uc-scene-tag">昇腾 / 鲲鹏训推一体</span>
                </div>
              </div>
            </div>
          </div>
            <div class="home-usecase-copy home-usecase-copy--lrbt">
              <h3 class="home-usecase-copy__title">
                <span class="home-usecase-copy__title-logo" aria-hidden="true"><CloudVendorLogo vendor="huawei" /></span>
                华为云（Huawei Cloud）
              </h3>
              <p class="home-usecase-kicker">政企信创 · 鲲鹏昇腾 · 混合云 Stack · 盘古大模型</p>
              <div class="home-usecase-body">
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">核心优势</strong>
                  政企 / 信创 / 国产化首选；鲲鹏 + 昇腾全栈自主，合规强、安全可控；混合云 / 云边端一体（Stack 混合云统一架构）；工业 IoT / AI 质检能力强；盘古大模型 + 昇腾算力，AI 国产化训练 / 推理优势明显。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">资源数量（2026）</strong>
                  全球 20+ 地域、60+ 可用区；国内政务 / 金融专属区多；政企专属云、边缘节点覆盖工业场景广泛。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">客户画像</strong>
                  政府 / 政务、央企 / 国企、金融银行、能源制造、工业企业、国产化替代项目。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">使用场景</strong>
                  政务云、智慧城市、金融核心、能源 / 电力、智能制造、工业互联网、AI 质检、数据不出域合规。
                </p>
              </div>
              <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
            </div>
          </div>
          <ul class="home-usecase-highlights" aria-label="华为云核心能力">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              政企 / 信创 / 国产化首选
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              鲲鹏 + 昇腾全栈自主，合规安全可控
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Stack 混合云 / 云边端一体架构
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              盘古大模型 + 昇腾 AI 训推优势
            </li>
          </ul>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="cloud-aliyun" aria-labelledby="tab-aliyun">
        <div class="home-usecase-layout home-usecase-layout--lrbt">
          <div class="home-usecase-layout__top">
            <div class="home-uc-visual home-uc-visual--lrbt" aria-hidden="true">
              <div class="home-uc-vis-inner">
                <div class="home-uc-vis-top">
                  <span class="home-uc-vis-top__logo" aria-hidden="true"><CloudVendorLogo vendor="aliyun" /></span>
                  <span>阿里云 · 电商与金融经营</span>
                </div>
                <div class="home-uc-scene home-uc-scene--aliyun">
                  <div class="home-uc-scene-main home-uc-scene-main--aliyun">
                    <AliyunCloudSceneVisual />
                  </div>
                  <div class="home-uc-scene-legend">
                    <span class="home-uc-scene-tag">大促容量与弹性预算</span>
                    <span class="home-uc-scene-tag">多 BU / 多主体分账</span>
                    <span class="home-uc-scene-tag">经营看板 + 成本归因</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="home-usecase-copy home-usecase-copy--lrbt">
              <h3 class="home-usecase-copy__title">
                <span class="home-usecase-copy__title-logo" aria-hidden="true"><CloudVendorLogo vendor="aliyun" /></span>
                阿里云（Alibaba Cloud）
              </h3>
              <p class="home-usecase-kicker">飞天架构 · 倚天 CPU · 通义千问 · PolarDB / OceanBase</p>
              <div class="home-usecase-body">
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">核心优势</strong>
                  国内市场份额第一，电商高并发与交易系统能力最强；自研飞天架构 + 倚天 CPU + 通义千问，全栈自研；PolarDB / OceanBase 数据库领先；云钉一体，中小企业友好，亚太出海覆盖强。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">资源数量（2026）</strong>
                  全球 27 地域、84 可用区；国内 14 地域，海外 13 地域；CDN / 边缘 2800+ 节点（国内 2300+、海外 500+），带宽 150+ Tbps。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">客户画像</strong>
                  电商 / 零售、互联网平台、金融支付、中小企业、出海亚太企业。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">使用场景</strong>
                  电商大促、直播电商、零售全渠道、高并发交易、SaaS / 中台、企业数字化、亚太出海。
                </p>
              </div>
              <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
            </div>
          </div>
          <ul class="home-usecase-highlights" aria-label="阿里云核心能力">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              国内市场份额第一，电商高并发与交易系统最强
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              飞天 + 倚天 + 通义千问全栈自研
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              PolarDB / OceanBase 数据库领先
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              云钉一体，亚太出海覆盖强
            </li>
          </ul>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="cloud-gcp" aria-labelledby="tab-gcp" hidden>
        <div class="home-usecase-layout home-usecase-layout--lrbt">
          <div class="home-usecase-layout__top">
            <div class="home-uc-visual home-uc-visual--lrbt" aria-hidden="true">
              <div class="home-uc-vis-inner">
                <div class="home-uc-vis-top">
                  <span class="home-uc-vis-top__logo" aria-hidden="true"><CloudVendorLogo vendor="gcp" /></span>
                  <span>Google Cloud · 出海与全球数据面</span>
                </div>
              <div class="home-uc-scene home-uc-scene--gcp">
                <div class="home-uc-scene-main home-uc-scene-main--gcp">
                  <GcpCloudSceneVisual />
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">多 Region 主动 / 主动</span>
                  <span class="home-uc-scene-tag">跨境与数据驻留路径</span>
                  <span class="home-uc-scene-tag">Vertex / TPU 批推理链路</span>
                </div>
              </div>
            </div>
          </div>
            <div class="home-usecase-copy home-usecase-copy--lrbt">
              <h3 class="home-usecase-copy__title">
                <span class="home-usecase-copy__title-logo" aria-hidden="true"><CloudVendorLogo vendor="gcp" /></span>
                Google Cloud（GCP）
              </h3>
              <p class="home-usecase-kicker">Vertex AI · BigQuery · GKE · TPU · Spanner</p>
              <div class="home-usecase-body">
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">核心优势</strong>
                  AI / ML 与大数据最强；TensorFlow 原生支持，Vertex AI、BigQuery、TPU 集群领先；全球骨干网质量顶尖，跨洲延迟低；K8s（GKE）原生创建者，云原生 / 容器化最稳；Spanner 全球分布式数据库强。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">资源数量（2026）</strong>
                  全球 38 地域、115 可用区；中国无公有云地域；全球网络节点密集，AI 训练 / 大数据算力充足。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">客户画像</strong>
                  AI / 机器学习公司、大数据分析企业、云原生 / 容器化团队、跨国科技公司、科研机构。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">使用场景</strong>
                  AI 模型训练 / 推理、大数据分析仓库、云原生微服务、跨国数据平台、高算力科研、实时数据分析。
                </p>
              </div>
              <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
            </div>
          </div>
          <ul class="home-usecase-highlights" aria-label="Google Cloud 核心能力">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              AI / ML 与大数据能力行业领先
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Vertex AI、BigQuery、TPU 集群
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              GKE 云原生 / 容器化最稳
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Spanner 全球分布式数据库
            </li>
          </ul>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="cloud-azure" aria-labelledby="tab-azure" hidden>
        <div class="home-usecase-layout home-usecase-layout--lrbt">
          <div class="home-usecase-layout__top">
            <div class="home-uc-visual home-uc-visual--lrbt" aria-hidden="true">
              <div class="home-uc-vis-inner">
                <div class="home-uc-vis-top">
                  <span class="home-uc-vis-top__logo" aria-hidden="true"><CloudVendorLogo vendor="azure" /></span>
                  <span>Azure · 混合云与 AI 工作负载</span>
                </div>
              <div class="home-uc-scene home-uc-scene--azure">
                <div class="home-uc-scene-main home-uc-scene-main--azure">
                  <AzureCloudSceneVisual />
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">订阅与资源组治理</span>
                  <span class="home-uc-scene-tag">混合互联 / Arc</span>
                  <span class="home-uc-scene-tag">OpenAI / GPU 算力编排</span>
                </div>
              </div>
            </div>
          </div>
            <div class="home-usecase-copy home-usecase-copy--lrbt">
              <h3 class="home-usecase-copy__title">
                <span class="home-usecase-copy__title-logo" aria-hidden="true"><CloudVendorLogo vendor="azure" /></span>
                Microsoft Azure
              </h3>
              <p class="home-usecase-kicker">Windows / .NET · Azure Stack / Arc · Azure OpenAI</p>
              <div class="home-usecase-body">
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">核心优势</strong>
                  Windows / .NET 企业最佳，与 Windows、SQL Server、Office 无缝集成；混合云 / 多云管理标杆（Azure Stack、Arc 统一管理本地 + 多云）；OpenAI 深度合作（GPT-4o），企业级 AI 应用开发便捷。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">资源数量（2026）</strong>
                  全球 64 地域、126 可用区；中国 2 个（上海 / 北京）；全球网络覆盖均衡，与微软产品生态强绑定。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">客户画像</strong>
                  传统 Windows 企业、制造 / 零售 / 流通、微软技术栈用户、混合云 / 多云企业、企业级 SaaS。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">使用场景</strong>
                  企业 ERP / CRM 上云、Windows 迁移、SQL Server 云化、混合云架构、Office 365 集成、企业 AI / BI、内部系统。
                </p>
              </div>
              <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
            </div>
          </div>
          <ul class="home-usecase-highlights" aria-label="Azure 核心能力">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Windows / .NET / SQL Server / Office 无缝集成
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Azure Stack、Arc 混合云 / 多云管理标杆
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              OpenAI 深度合作（GPT-4o）企业级 AI
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              全球 64 地域、126 可用区，生态强绑定
            </li>
          </ul>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="cloud-aws" aria-labelledby="tab-aws" hidden>
        <div class="home-usecase-layout home-usecase-layout--lrbt">
          <div class="home-usecase-layout__top">
            <div class="home-uc-visual home-uc-visual--lrbt" aria-hidden="true">
              <div class="home-uc-vis-inner">
                <div class="home-uc-vis-top">
                  <span class="home-uc-vis-top__logo" aria-hidden="true"><CloudVendorLogo vendor="aws" /></span>
                  <span>AWS · 企业多账号着陆区</span>
                </div>
              <div class="home-uc-scene home-uc-scene--aws">
                <div class="home-uc-scene-main home-uc-scene-main--aws">
                  <AwsCloudSceneVisual />
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">Control Tower 蓝图</span>
                  <span class="home-uc-scene-tag">OU + SCP 安全护栏</span>
                  <span class="home-uc-scene-tag">CUR / SP·RI 与算力对齐</span>
                </div>
              </div>
            </div>
          </div>
            <div class="home-usecase-copy home-usecase-copy--lrbt">
              <h3 class="home-usecase-copy__title">
                <span class="home-usecase-copy__title-logo" aria-hidden="true"><CloudVendorLogo vendor="aws" /></span>
                AWS（Amazon Web Services）
              </h3>
              <p class="home-usecase-kicker">EC2 / S3 / Lambda · Serverless · 全球 Region</p>
              <div class="home-usecase-body">
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">核心优势</strong>
                  全球龙头、服务最全（200+）、生态最成熟；EC2 / S3 / Lambda 行业标杆；稳定性与安全合规最强，SLA 99.99%，认证最全；Serverless / 云原生领域引领，全球覆盖最广、跨区容灾能力强。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">资源数量（2026）</strong>
                  全球 54 地域、180+ 可用区；中国 2 个（北京 / 宁夏）；全球 CDN 节点 400+，覆盖 100+ 国家。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">客户画像</strong>
                  全球化企业、跨国公司、出海企业、北美 / 欧洲科技公司、初创公司、技术驱动型企业。
                </p>
                <p class="home-usecase-desc-block">
                  <strong class="home-usecase-desc-label">使用场景</strong>
                  全球网站 / APP、跨国电商、海外 SaaS、Serverless 架构、大数据分析、全球容灾、AI 训练（海外）。
                </p>
              </div>
              <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
            </div>
          </div>
          <ul class="home-usecase-highlights" aria-label="AWS 核心能力">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              全球龙头，200+ 服务，生态最成熟
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              EC2 / S3 / Lambda 行业标杆
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              SLA 99.99%，安全合规认证最全
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Serverless / 云原生引领，全球容灾能力强
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="home-section" id="why" aria-labelledby="why-h">
    <div class="home-why-top-band">
      <div class="home-shell home-why-top-inner">
        <header class="home-why-intro">
          <h2 id="why-h">为什么选择 Trinity AI 云</h2>
        </header>

        <div class="home-why-highlight" aria-label="降本亮点">
        <div class="home-why-highlight-main">
          <b>20%–40%</b>
          <span>企业云成本典型节省</span>
        </div>
          <p class="home-why-highlight-note">按实际云消费 + 透明服务费 · 无隐形消费 · 不赚差价（具体以商务合同为准）</p>
        </div>

        <p class="home-section-lead home-why-lead">
          云资源<strong>集采整合方</strong>：以集团体量向主流云厂商议价，共享顶级折扣、授信账期与上云服务；企业零门槛采购，专注业务增长。
        </p>
      </div>
    </div>

    <div class="home-shell home-why-shell">
      <div class="home-why-block">
        <h3 class="home-why-block-title">三大「零」承诺</h3>
        <p class="home-why-block-desc">无门槛挂靠、无保底消费、无业绩压力，企业轻装上阵享集采价。</p>
        <div class="home-why-model" aria-label="三大「零」承诺">
          <article class="home-why-model-card">
            <h4>「零」门槛挂靠</h4>
            <p>无资质与业绩门槛，快速接入集团集采架构，即享大客户级权益。</p>
          </article>
          <article class="home-why-model-card">
            <h4>「零」保底消费</h4>
            <p>无最低消费与保底要求，按实际云用量计费，用多少付多少。</p>
          </article>
          <article class="home-why-model-card">
            <h4>「零」业绩承诺</h4>
            <p>无强制业绩承诺，合作灵活、压力更小，专注业务本身增长。</p>
          </article>
        </div>
      </div>

      <div class="home-why-block home-why-block--bento">
        <h3 class="home-why-block-title">四大核心赋能</h3>
        <div class="home-why-advantages home-why-bento" role="list">
          <article class="home-why-adv home-why-adv--resource" role="listitem">
            <header class="home-why-adv-head">
              <h4>资源优势</h4>
              <p class="home-why-adv-desc">覆盖国内外主流云，节点灵活可选，满足出海与国内一站式部署。</p>
            </header>
            <div class="home-why-adv-media" aria-hidden="true">
              <img :src="advantageResources" alt="" loading="lazy" />
            </div>
          </article>

          <article class="home-why-adv home-why-adv--pricing" role="listitem">
            <header class="home-why-adv-head">
              <h4>商务优势</h4>
              <p class="home-why-adv-desc">集团集采议价，共享 VIP 折扣与授信账期。</p>
            </header>
            <div class="home-why-adv-pane">
              <ul class="home-why-adv-points">
                <li>
                  <span class="home-why-adv-point-mark" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <span><strong>最低 2 折起</strong>，VIP 级优惠</span>
                </li>
                <li>
                  <span class="home-why-adv-point-mark" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <span><strong>无保底、无门槛</strong>，按需使用</span>
                </li>
                <li>
                  <span class="home-why-adv-point-mark" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <span>透明服务费，不赚云资源差价</span>
                </li>
              </ul>
              <div class="home-why-adv-media" aria-hidden="true">
                <img :src="advantagePricing" alt="" loading="lazy" />
              </div>
            </div>
          </article>

          <article class="home-why-adv home-why-adv--value" role="listitem">
            <header class="home-why-adv-head">
              <h4>增值服务（免费）</h4>
              <p class="home-why-adv-desc">上云咨询、架构设计、资源选型与多云成本统一管控。</p>
            </header>
            <div class="home-why-adv-pane home-why-adv-pane--preview">
              <div class="home-preview-card" aria-hidden="true">
                <div class="home-preview-head">
                  <span>云控制台 · 集采账单</span>
                  <span class="home-preview-badge">透明对账</span>
                </div>
                <div class="home-preview-body">
                  <div class="home-preview-kpis">
                    <div class="home-preview-kpi"><div class="v">6</div><div class="l">已纳管主账号</div></div>
                    <div class="home-preview-kpi home-preview-kpi--save"><div class="v">20%–40%</div><div class="l">较直销预估节省</div></div>
                    <div class="home-preview-kpi"><div class="v">2</div><div class="l">待对账项</div></div>
                  </div>
                  <div class="home-preview-chart" aria-hidden="true">
                    <div class="home-preview-chart-cap">多云消费占比（示意）</div>
                    <div class="home-preview-stack">
                      <span class="home-preview-seg home-preview-seg--a" style="flex: 38"></span>
                      <span class="home-preview-seg home-preview-seg--b" style="flex: 28"></span>
                      <span class="home-preview-seg home-preview-seg--c" style="flex: 22"></span>
                      <span class="home-preview-seg home-preview-seg--d" style="flex: 12"></span>
                    </div>
                    <div class="home-preview-legend">
                      <span><span class="home-preview-dot home-preview-dot--a" aria-hidden="true"></span><span class="home-cloud-name">阿里云</span> 38%</span>
                      <span><span class="home-preview-dot home-preview-dot--b" aria-hidden="true"></span><span class="home-cloud-name">腾讯云</span> 28%</span>
                      <span><span class="home-preview-dot home-preview-dot--c" aria-hidden="true"></span><span class="home-cloud-name">华为云</span> 22%</span>
                      <span><span class="home-preview-dot home-preview-dot--d" aria-hidden="true"></span>其他 12%</span>
                    </div>
                  </div>
                  <div class="home-preview-rows">
                    <div class="home-preview-row"><span>华为云 · 生产主账号</span><code>财务视图 · 只读</code></div>
                    <div class="home-preview-row"><span>腾讯云 · 按项目分账</span><code>标签映射已生效</code></div>
                    <div class="home-preview-row"><span>2026-04 汇总账单</span><code>待财务确认</code></div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="home-why-adv home-why-adv--support" role="listitem">
            <header class="home-why-adv-head">
              <h4>技术支持</h4>
              <p class="home-why-adv-desc">VIP 专属技术团队，快速响应、问题优先处理。</p>
            </header>
            <div class="home-why-adv-pane">
              <ul class="home-why-adv-points">
                <li>
                  <span class="home-why-adv-point-mark" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <span><strong>VIP 专属技术团队</strong>，7×24 响应</span>
                </li>
                <li>
                  <span class="home-why-adv-point-mark" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <span>故障与工单<strong>优先处理</strong></span>
                </li>
                <li>
                  <span class="home-why-adv-point-mark" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <span>迁移、架构与多云联调协助</span>
                </li>
              </ul>
              <div class="home-why-adv-clouds" aria-label="主流云厂商">
                <span class="home-why-adv-cloud" aria-hidden="true"><CloudVendorLogo vendor="aliyun" /></span>
                <span class="home-why-adv-cloud" aria-hidden="true"><CloudVendorLogo vendor="tencent" /></span>
                <span class="home-why-adv-cloud" aria-hidden="true"><CloudVendorLogo vendor="huawei" /></span>
                <span class="home-why-adv-cloud" aria-hidden="true"><CloudVendorLogo vendor="aws" /></span>
                <span class="home-why-adv-cloud" aria-hidden="true"><CloudVendorLogo vendor="gcp" /></span>
                <span class="home-why-adv-cloud" aria-hidden="true"><CloudVendorLogo vendor="azure" /></span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div class="home-why-values-band">
      <div class="home-shell home-why-values-inner">
        <h3 class="home-why-values-title">合作带来的核心价值</h3>
        <ul class="home-why-values" aria-label="客户收益">
          <li class="home-why-value-item">
            <div class="home-why-value-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="home-why-value-body">
              <strong>云成本立省 20%–40%</strong>
              <span>降低 IT 运营支出，减少资源浪费</span>
            </div>
          </li>
          <li class="home-why-value-item">
            <div class="home-why-value-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
            <div class="home-why-value-body">
              <strong>零门槛享大客户折扣</strong>
              <span>无需年框与保底，灵活按需采购</span>
            </div>
          </li>
          <li class="home-why-value-item">
            <div class="home-why-value-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M6 15h2M10 15h4"/></svg>
            </div>
            <div class="home-why-value-body">
              <strong>共享集团授信账期</strong>
              <span>缓解现金流压力，提升周转效率</span>
            </div>
          </li>
          <li class="home-why-value-item">
            <div class="home-why-value-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            </div>
            <div class="home-why-value-body">
              <strong>免费增值服务</strong>
              <span>咨询、架构优化与持续成本建议</span>
            </div>
          </li>
          <li class="home-why-value-item">
            <div class="home-why-value-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <div class="home-why-value-body">
              <strong>VIP 技术支持</strong>
              <span>专属通道，更快更专业的保障</span>
            </div>
          </li>
          <li class="home-why-value-item">
            <div class="home-why-value-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><path d="M12 12v4M10 14h4"/></svg>
            </div>
            <div class="home-why-value-body">
              <strong>一站式多云管理</strong>
              <span>统一入口，团队聚焦核心业务</span>
            </div>
          </li>
        </ul>
        <p class="home-why-disclaimer">典型节省区间为参考值，具体权益以商务合同为准。</p>
      </div>
    </div>
  </section>



  <section class="home-section" id="benefits" aria-labelledby="benefits-h">
    <div class="home-shell">
      <header class="home-benefits-head">
        <h2 id="benefits-h">专属福利</h2>
      </header>
      <div class="home-compare-wrap">
        <div class="home-compare-stage" role="table" aria-label="专属福利服务对比">
          <div class="home-compare-panel home-compare-panel--labels" role="rowgroup">
            <div class="home-compare-panel-head" role="columnheader">服务项目</div>
            <div class="home-compare-panel-row" role="rowheader">云服务购买</div>
            <div class="home-compare-panel-row" role="rowheader">合同与发票</div>
            <div class="home-compare-panel-row" role="rowheader">云服务价格</div>
            <div class="home-compare-panel-row" role="rowheader">配置推荐与报价</div>
            <div class="home-compare-panel-row" role="rowheader">技术支持服务</div>
            <div class="home-compare-panel-row" role="rowheader">售后服务</div>
            <div class="home-compare-panel-row" role="rowheader">增值服务</div>
          </div>
          <div class="home-compare-panel home-compare-panel--ours" role="rowgroup">
            <div class="home-compare-panel-head" role="columnheader">Trinity AI 云</div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">厂商官网资源，集采渠道代购</span>
              <span class="home-compare-mark home-compare-mark--yes" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">统一账单 / 灵活开票或多抬头</span>
              <span class="home-compare-mark home-compare-mark--yes" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row home-compare-panel-row--emph" role="cell">
              <span class="home-compare-text">官网价格 + 额外优惠 + 折扣返点</span>
              <span class="home-compare-mark home-compare-mark--yes" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">架构师免费推荐配置，择优最大优惠</span>
              <span class="home-compare-mark home-compare-mark--yes" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">1v1 VIP 专属客服售后服务</span>
              <span class="home-compare-mark home-compare-mark--yes" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">开户、续费与对账全程专人跟进</span>
              <span class="home-compare-mark home-compare-mark--yes" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">免费上云咨询、架构设计、多云成本统一管控</span>
              <span class="home-compare-mark home-compare-mark--yes" aria-hidden="true"></span>
            </div>
          </div>
          <div class="home-compare-panel home-compare-panel--vendor" role="rowgroup">
            <div class="home-compare-panel-head" role="columnheader">厂商直销</div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">厂商官网自行购买</span>
              <span class="home-compare-mark home-compare-mark--ring-ok" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">厂商官网申请发票</span>
              <span class="home-compare-mark home-compare-mark--ring-ok" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">官网价格</span>
              <span class="home-compare-mark home-compare-mark--ring-no" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">无</span>
              <span class="home-compare-mark home-compare-mark--ring-no" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">工单服务</span>
              <span class="home-compare-mark home-compare-mark--ring-no" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">工单服务</span>
              <span class="home-compare-mark home-compare-mark--ring-no" aria-hidden="true"></span>
            </div>
            <div class="home-compare-panel-row" role="cell">
              <span class="home-compare-text">无</span>
              <span class="home-compare-mark home-compare-mark--ring-no" aria-hidden="true"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="home-section alt" id="process" aria-labelledby="process-h">
    <div class="home-shell home-process">
      <header class="home-process-head">
        <h2 id="process-h">优惠合作流程</h2>
        <p class="home-process-tagline">极简 · 高效 · 放心</p>
      </header>
      <ol class="home-process-flow" aria-label="优惠合作流程五步">
        <li class="home-process-step">
          <div class="home-process-step-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 class="home-process-step-title">需求沟通</h3>
          <p class="home-process-step-desc">深入了解您的云资源类型、用量和预算需求，制定专属方案。</p>
        </li>
        <li class="home-process-step">
          <div class="home-process-step-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <h3 class="home-process-step-title">成本诊断</h3>
          <p class="home-process-step-desc">免费为您测算优惠空间，出具详细的<strong class="home-process-em">节省报告</strong>，让收益清晰可见。</p>
        </li>
        <li class="home-process-step">
          <div class="home-process-step-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <h3 class="home-process-step-title">签约合作</h3>
          <p class="home-process-step-desc">签署简洁、透明的标准化合作合同，明确双方权责，保障您的权益。</p>
        </li>
        <li class="home-process-step">
          <div class="home-process-step-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <h3 class="home-process-step-title">快速接入</h3>
          <p class="home-process-step-desc">挂靠集团架构，<strong class="home-process-em">1–3 个工作日内</strong>即可开通优惠，流程极简。</p>
        </li>
        <li class="home-process-step">
          <div class="home-process-step-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          </div>
          <h3 class="home-process-step-title">持续服务</h3>
          <p class="home-process-step-desc">统一账单管理、定期成本优化建议与专属 VIP 技术支持，全程无忧。</p>
        </li>
      </ol>
      <div class="home-process-cta">
        <a href="#consult" class="btn btn-gradient">联系在线客服，获取上云优惠</a>
      </div>
    </div>
  </section>

  <section class="home-section" id="consult" aria-labelledby="consult-h">
    <div class="home-shell home-consult-wrap">
      <div class="home-consult-panel">
        <div class="home-consult-panel-deco" aria-hidden="true"></div>
        <div class="home-consult-promo">
          <h2 id="consult-h">立即行动，开启云成本优化之旅</h2>
          <p class="home-consult-promo-lead">
            现在联系<span class="home-ours-em">我们</span>的优惠专员，即刻免费获得成本优化方案，开启云上优惠权益之旅。
          </p>
        </div>
        <div class="home-consult-card">
          <h3 class="home-consult-card-title">申请咨询与折扣</h3>
          <form class="home-consult-form" id="home-consult-form">
            <div class="home-consult-field">
              <label for="c-email">企业邮箱</label>
              <input
                id="c-email"
                type="email"
                name="email"
                required
                autocomplete="email"
                placeholder="name@company.com"
              />
            </div>
            <div class="home-consult-field">
              <label for="c-scale">需求规模</label>
              <div class="home-consult-select-wrap">
                <select id="c-scale" name="scale" required>
                  <option value="startup">初创团队（1–20 人）</option>
                  <option value="growth">成长期企业（21–100 人）</option>
                  <option value="enterprise">大型企业（100 人以上）</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-gradient home-consult-submit">提交申请并领取福利</button>
          </form>
          <p class="home-consult-footnote">2026 年特惠计划受配额限制，请尽快提交</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="home-footer">
    <div class="home-footer-top">
      <div class="home-footer-brand">
        <strong>Trinity AI 云</strong>
        <p>多云 AI 算力纳管与企业级交付，专注上云与用算力。</p>
      </div>
      <div class="home-footer-col">
        <h4>本页产品</h4>
        <ul>
          <li><a href="#cloud-solutions">多云对接与各云说明</a></li>
          <li><a href="#why">核心优势</a></li>
          <li><a href="#benefits">专属福利</a></li>
          <li><a href="#process">购买流程</a></li>
          <li><a href="#consult">咨询与报价</a></li>
        </ul>
      </div>
      <div class="home-footer-col">
        <h4>合规与支持</h4>
        <ul>
          <li><a href="#">隐私政策</a></li>
          <li><a href="#">服务条款</a></li>
          <li><a href="#">安全白皮书</a></li>
        </ul>
      </div>
    </div>
    <div class="home-footer-bottom">© 2026 Trinity AI 云. 保留所有权利。</div>
  </footer>
</main>
  </div>
</template>

<style>
:root {
  --home-max: 1180px;
  --home-banner-min: min(78vh, 760px);
  /* 顶栏/页脚/抽屉左右与 index 一致：用 mvp 的 --page-gutter；main 内正文区块 15%（见 docs/Trinity原型版式与视觉规范.md） */
  --home-content-inline: 15%;
  --home-why-body-inline: 10%;
  --home-section-inline-narrow: 3%;
  --home-why-values-inline: var(--home-section-inline-narrow);
  --home-banner-inline: 8%;
  /* 官网首页字阶（px 固定，不用 rem/clamp/vw） */
  --home-font-display: 52px;
  --home-font-highlight: 44px;
  --home-font-step: 36px;
  --home-font-title: 32px;
  --home-font-module: 24px;
  --home-font-subtitle: 18px;
  --home-font-body: 16px;
  --home-font-body-sm: 14px;
  --home-font-caption: 12px;
  --home-font-micro: 11px;
  --home-section-title-size: var(--home-font-title);
}

body.home-page {
  margin: 0;
  background: var(--bg);
  color: var(--text);
}

body.home-page main {
  padding-inline: 0;
}

.home-shell {
  width: 100%;
  max-width: var(--home-max);
  margin: 0 auto;
  padding-inline: 0;
  box-sizing: border-box;
}

main#main > section {
  padding-inline: var(--home-content-inline);
  box-sizing: border-box;
}

main#main > section.home-banner {
  padding-inline: var(--home-banner-inline);
}

main#main > .home-overlap {
  width: 100%;
  padding-inline: 50px;
  box-sizing: border-box;
}

/* 页脚与 index 一致：全宽 + 仅左右 page-gutter，不在此再套 max-width 栏宽 */
main#main > footer.home-footer {
  padding-inline: 0;
  box-sizing: border-box;
}

/* 顶栏：壳层样式见 trinity-base（.or-inject / .header-row）；以下为 AI 云首页导航补充 */
.home-nav-or {
  gap: 0.25rem;
}

.home-nav-or-link {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.home-nav-or-link:hover {
  color: var(--text);
  background: var(--surface);
}

.home-nav-dd {
  position: relative;
}

.home-nav-dd-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
}

.home-nav-dd-btn:hover,
.home-nav-dd:focus-within .home-nav-dd-btn {
  background: var(--surface);
  color: var(--text);
}

.home-nav-dd-panel--cloud {
  min-width: 280px;
}

.home-nav-dd-divider {
  height: 1px;
  margin: 0.3rem 0.4rem;
  background: var(--border);
}

.home-nav-dd-label {
  display: block;
  padding: 0.25rem 0.65rem 0.15rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--muted-2);
}

.home-nav-dd-vendors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.1rem 0.25rem;
  padding: 0 0.15rem;
}

.home-nav-dd-vendor {
  display: flex !important;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.5rem !important;
  font-size: 0.8125rem !important;
}

.home-nav-dd-vendor__logo {
  display: inline-flex;
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  align-items: center;
  justify-content: center;
}

.home-nav-dd-vendor__logo :deep(.cloud-vendor-logo) {
  width: 100%;
  height: 100%;
}

.home-nav-dd-vendor__logo :deep(.cloud-vendor-logo--img) {
  object-fit: contain;
}

.home-drawer-vendor {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0;
  color: inherit;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
}

.home-drawer-vendor__logo {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.home-drawer-vendor__logo :deep(.cloud-vendor-logo) {
  width: 100%;
  height: 100%;
}

.home-drawer-vendor__logo :deep(.cloud-vendor-logo--img) {
  object-fit: contain;
}

.home-nav-dd-panel {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  min-width: 200px;
  padding: 0.35rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
  z-index: 20;
}

.home-nav-dd:hover .home-nav-dd-panel,
.home-nav-dd:focus-within .home-nav-dd-panel {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

.home-nav-dd-panel a {
  display: block;
  padding: 0.5rem 0.65rem;
  border-radius: var(--radius);
  color: inherit;
  text-decoration: none;
  font-size: var(--home-font-body-sm);
  font-weight: 500;
}

.home-nav-dd-panel a:hover {
  background: var(--surface-2);
}

.home-drawer-kicker {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted-2);
  padding: 0.35rem 0;
}

button.or-drawer-register {
  display: block;
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.65rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--blue);
  background: transparent;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
}

button.or-drawer-register:hover {
  background: var(--blue-soft);
}

.home-banner {
  position: relative;
  min-height: var(--home-banner-min);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.home-banner-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse 90% 55% at 50% -15%, rgba(37, 99, 235, 0.14), transparent 55%),
    linear-gradient(180deg, #f8fafc 0%, #ffffff 55%);
}

.home-banner-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.58;
  background-image: linear-gradient(rgba(37, 99, 235, 0.075) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.075) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: homeGridDrift 28s linear infinite;
}

@keyframes homeGridDrift {
  to {
    background-position: 48px 48px;
  }
}

.home-banner-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 2rem 0 1.5rem;
  box-sizing: border-box;
}

.home-hero-grid {
  display: grid;
  gap: 2rem 2.5rem;
  align-items: center;
}

.home-hero-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  width: 100%;
}

@media (min-width: 960px) {
  .home-hero-grid {
    grid-template-columns: minmax(0, 1fr) auto;
    max-width: none;
    gap: 0 0.5rem;
    align-items: center;
    justify-content: flex-start;
  }

}

.home-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: -75px 0 12px;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--pill-text);
  background: var(--blue-soft);
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.home-eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.home-banner h1 {
  margin: 0 0 1rem;
  width: 100%;
  font-size: var(--home-font-display);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
  text-align: left;
  color: var(--text);
}

.home-banner h1 em {
  font-style: normal;
  color: var(--blue);
}

.home-banner-save {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  align-self: flex-start;
  max-width: 100%;
  margin: 0 0 1.15rem;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  line-height: 1.45;
  text-align: left;
  white-space: normal;
  color: var(--muted);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%);
  border: 1px solid rgba(37, 99, 235, 0.22);
  box-shadow: 0 8px 28px rgba(37, 99, 235, 0.12);
  box-sizing: border-box;
}

@media (min-width: 960px) {
  .home-banner-save {
    padding-inline: 1.5rem;
    font-size: var(--home-font-body);
  }
}

.home-banner-action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 0;
}

.home-banner-sub-wrap {
  position: relative;
  width: 100%;
  max-width: none;
}

@media (min-width: 960px) {
  .home-banner-sub-wrap {
    max-width: 44rem;
  }
}

.home-banner-sub {
  margin: 0;
  padding: 0 0 3.75rem;
  max-width: none;
  font-size: var(--home-font-subtitle);
  color: var(--muted);
  line-height: 1.7;
  text-align: left;
}

@media (min-width: 960px) {
  .home-banner-sub {
    padding-bottom: 3.5rem;
  }
}

.home-banner-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: flex-start;
  align-self: flex-start;
  margin: 0;
}

.home-banner-cta--sub {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  justify-content: flex-end;
  align-self: auto;
  margin: 0;
}

/* 首屏 CTA：胶囊按钮，左右 50px */
.home-banner-cta > a {
  box-sizing: border-box;
  min-height: 48px;
  height: 48px;
  padding: 0 50px;
  border-radius: 999px;
  font-size: var(--home-font-body);
  border-width: 1px;
  border-style: solid;
}

.home-banner-cta > a.btn-gradient {
  border-color: rgba(255, 255, 255, 0.42);
}

.home-banner-cta > a.btn:not(.btn-gradient),
.home-banner-cta > a.home-btn-outline-light {
  border-color: var(--border-strong);
}

.home-hero-right {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 0;
  padding: 0.5rem 0;
}

@media (min-width: 960px) {
  .home-hero-right {
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    margin-left: -1rem;
  }

  .home-hero-right :deep(.home-hero-orbit) {
    width: 520px;
    height: 520px;
    --orbit-size: 520px;
    --orbit-r-edge: 220px;
    --orbit-r-core: 82px;
    --hub-size: 10.75rem;
    --icon-size: 3.75rem;
    --ring-outer-inset: 2.5%;
    --ring-inner-inset: 26%;
    --ring-band-inner-hole: 25%;
    --ring-band-outer-edge: 90.5%;
  }
}

.home-preview-card {
  width: 100%;
  max-width: 520px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  overflow: hidden;
  text-align: left;
}

.home-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.1rem;
  background: linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%);
  border-bottom: 1px solid var(--border);
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--muted);
}

.home-preview-badge {
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: var(--home-font-caption);
  font-weight: 700;
  background: #ecfdf5;
  color: #047857;
}

.home-preview-body {
  padding: 1.05rem 1.1rem 1.2rem;
}

.home-preview-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
  margin-bottom: 1rem;
}

.home-preview-kpi {
  padding: 0.6rem 0.65rem;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
}

.home-preview-kpi .v {
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  color: var(--text);
}

.home-preview-kpi .l {
  font-size: var(--home-font-caption);
  color: var(--muted-2);
  margin-top: 0.15rem;
}

.home-preview-kpi--save {
  border-color: rgba(4, 120, 87, 0.25);
  background: #ecfdf5;
}

.home-preview-kpi--save .v {
  color: #047857;
}

/* 首屏预览卡：账单 / 消费示意（非资源拓扑） */
.home-preview-chart {
  margin-bottom: 0.8rem;
  padding: 0.65rem 0.6rem 0.55rem;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.home-preview-chart-cap {
  font-size: var(--home-font-caption);
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.55rem;
}

.home-preview-stack {
  display: flex;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--border);
}

.home-preview-seg {
  min-width: 3px;
  height: 100%;
}

.home-preview-seg--a {
  background: linear-gradient(90deg, #0ea5e9, #0284c7);
}

.home-preview-seg--b {
  background: linear-gradient(90deg, #6366f1, #4f46e5);
}

.home-preview-seg--c {
  background: linear-gradient(90deg, #f97316, #ea580c);
}

.home-preview-seg--d {
  background: linear-gradient(90deg, #94a3b8, #64748b);
}

.home-preview-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem 0.55rem;
  margin-top: 0.55rem;
  font-size: var(--home-font-micro);
  color: var(--muted);
}

.home-preview-legend span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.home-preview-dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  flex-shrink: 0;
}

.home-preview-dot--a {
  background: #0284c7;
}

.home-preview-dot--b {
  background: #4f46e5;
}

.home-preview-dot--c {
  background: #ea580c;
}

.home-preview-dot--d {
  background: #64748b;
}

.home-preview-rows {
  font-size: var(--home-font-caption);
  color: var(--muted);
}

.home-preview-row {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0;
  border-top: 1px solid var(--border);
}

.home-preview-row:first-child {
  border-top: none;
  padding-top: 0;
}

.home-preview-row code {
  font-size: var(--home-font-caption);
  color: var(--text);
}

/* 首屏下方叠层能力带 */
.home-overlap {
  position: relative;
  z-index: 2;
  margin-top: -2.75rem;
  margin-bottom: 0.5rem;
  padding-inline: 50px;
}

.home-overlap-inner {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  box-shadow: none;
  overflow: hidden;
}

.home-overlap-grid {
  display: flex;
  align-items: stretch;
}

.home-overlap-item {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.1rem 1.15rem 1rem;
  border: none;
  border-bottom: 3px solid transparent;
  border-radius: 0;
  background: var(--bg);
  text-decoration: none;
  color: inherit;
  text-align: left;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.home-overlap-item:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 2.75rem;
  background: var(--border);
  pointer-events: none;
}

.home-overlap-item.is-active,
.home-overlap-item:hover {
  border-bottom-color: var(--blue);
}

.home-overlap-kicker {
  font-size: var(--home-font-caption);
  font-weight: 500;
  color: var(--muted-2);
  line-height: 1.3;
}

.home-overlap-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}

.home-overlap-title {
  font-size: var(--home-font-body);
  font-weight: 700;
  color: var(--text);
  line-height: 1.35;
}

.home-overlap-chevron {
  flex-shrink: 0;
  color: var(--muted-2);
  opacity: 0.85;
}

.home-overlap-item.is-active .home-overlap-chevron,
.home-overlap-item:hover .home-overlap-chevron {
  color: var(--blue);
  opacity: 1;
}

.home-overlap-desc {
  font-size: var(--home-font-body-sm);
  color: var(--text);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .home-overlap-item {
    padding: 1.25rem 1.35rem 1.1rem;
  }
}

@media (max-width: 899px) {
  .home-overlap-inner {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .home-overlap-grid {
    min-width: 100%;
    width: max-content;
  }

  .home-overlap-item {
    flex: 0 0 10.5rem;
    min-width: 10.5rem;
  }
}

.home-btn-outline-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 1.25rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-strong);
  background: var(--bg);
  color: var(--text);
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.home-btn-outline-light:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: var(--blue-soft);
}

/* 多云对接 · Tab + 双栏（接在叠层卡下方，与首屏「主流公有云」叙事合一） */
.home-usecase {
  scroll-margin-top: calc(var(--nav-h) + 12px);
  padding: 2.5rem 0 3.25rem;
  border-top: none;
  background: var(--bg);
}

.home-usecase-tablist {
  --home-cloud-tab-gap: 48px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  column-gap: var(--home-cloud-tab-gap);
  row-gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 720px) {
  .home-usecase-tablist {
    flex-wrap: nowrap;
    justify-content: flex-start;
    column-gap: var(--home-cloud-tab-gap);
    overflow-x: auto;
    padding-bottom: 0.35rem;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }

  .home-usecase-tab {
    scroll-snap-align: start;
    flex: 0 0 auto;
  }
}

/* 云厂商名：统一黑色；选中 Tab /「我们」等用主题色高亮 */
.home-cloud-name {
  color: var(--text);
  font-weight: 600;
}

.home-ours-em {
  color: var(--blue);
  font-weight: 700;
}

.home-usecase-tab__inner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.home-usecase-tab__logo {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  overflow: visible;
  align-items: center;
  justify-content: center;
}

.home-usecase-tab__label {
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  line-height: 1.25;
  color: var(--text);
  transition: color 0.15s ease;
}

.home-usecase-tab {
  flex: 0 0 auto;
  padding: 0.25rem 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.home-usecase-tab:hover .home-usecase-tab__label {
  color: var(--blue);
}

.home-usecase-tab:focus-visible {
  outline: 2px solid var(--blue-ring);
  outline-offset: 4px;
  border-radius: 4px;
}

.home-usecase-tab[aria-selected="true"] .home-usecase-tab__label {
  color: var(--blue);
  font-weight: 700;
}

.home-usecase-panel[hidden] {
  display: none !important;
}

/* 云厂商 Tab：左图 + 右文 + 下栏要点（lrbt） */
.home-usecase-layout--lrbt {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.home-usecase-layout__top {
  display: grid;
  gap: 80px;
  align-items: start;
}

@media (min-width: 900px) {
  .home-usecase-layout__top {
    grid-template-columns: 1fr 1fr;
    column-gap: 80px;
    row-gap: 80px;
    align-items: center;
  }
}

.home-uc-visual--lrbt {
  --home-uc-art-h: 268px;
  min-height: 380px;
  height: fit-content;
  align-self: center;
}

.home-uc-visual--lrbt .home-uc-vis-inner {
  min-height: 380px;
  height: 100%;
  padding: 1.15rem 1.15rem 1.1rem;
  justify-content: center;
}

.home-uc-visual--lrbt .home-uc-scene {
  min-height: 320px;
  flex: 1;
  justify-content: stretch;
}

.home-uc-visual--lrbt .home-uc-scene-main {
  flex: 0 0 var(--home-uc-art-h);
  width: 100%;
  min-height: var(--home-uc-art-h);
  height: var(--home-uc-art-h);
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
}

.home-uc-visual--lrbt .home-uc-scene-main > * {
  width: 100%;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
}

.home-uc-visual--lrbt .home-uc-scene-main svg {
  max-height: 300px;
}

.home-usecase-copy--lrbt {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: start;
  padding-block: 0.15rem;
}

@media (min-width: 900px) {
  .home-usecase-copy--lrbt {
    align-self: center;
  }
}

.home-usecase-copy--lrbt h3 {
  margin-bottom: 0.55rem;
  font-size: var(--home-font-module);
  line-height: 1.28;
}

.home-usecase-kicker {
  margin: 0 0 1.15rem;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--muted);
  line-height: 1.5;
}

.home-usecase-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.35rem;
}

.home-usecase-desc-block {
  margin: 0;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.72;
}

.home-usecase-desc-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: var(--home-font-body-sm);
  font-weight: 700;
  color: var(--text);
}

.home-usecase-highlights {
  list-style: none;
  margin: 0;
  padding: 1.35rem 0 0;
  display: grid;
  gap: 1rem 2.5rem;
  grid-template-columns: 1fr;
  border-top: 1px solid var(--border);
}

@media (min-width: 640px) {
  .home-usecase-highlights {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.home-usecase-highlights li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--text);
  line-height: 1.55;
}

.home-usecase-highlights svg {
  flex-shrink: 0;
  margin-top: 0.15rem;
  color: #16a34a;
}

.home-usecase-grid {
  display: grid;
  gap: 1.75rem;
  align-items: stretch;
}

@media (min-width: 900px) {
  .home-usecase-grid {
    grid-template-columns: 1.12fr 0.88fr;
    gap: 2rem;
  }

  .home-usecase-copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;
    min-height: 0;
    padding-block: 0.5rem;
  }

  .home-usecase-desc {
    flex: 0 1 auto;
    font-size: var(--home-font-body-sm);
    line-height: 1.72;
  }

  .home-usecase-copy .home-usecase-features {
    margin-bottom: 1.15rem;
  }

  .home-usecase-copy .home-usecase-cta {
    margin-top: 0.15rem;
  }
}

.home-uc-visual {
  position: relative;
  border-radius: 16px;
  border: none;
  background: transparent;
  box-shadow: none;
  min-height: 300px;
  overflow: hidden;
}

.home-uc-vis-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1rem;
  min-height: 300px;
}

.home-uc-vis-top {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: var(--home-font-caption);
  font-weight: 600;
  color: var(--muted);
}

.home-uc-vis-top__logo {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.home-usecase-copy__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.home-usecase-copy__title-logo {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
}

/* 各云场景配图（SVG + 标签，典型行业与架构） */
.home-uc-scene {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 252px;
  border-radius: 12px;
  border: none;
  overflow: hidden;
  background: transparent;
}

.home-uc-scene-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.35rem;
}

.home-uc-scene-main svg {
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 228px;
}

.home-uc-scene-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.55rem 0.65rem;
  border-top: none;
}

/* 腾讯云：暗色「导播 / 监视器」视听风，与浅色页面对比 */
.home-uc-scene--tencent {
  background: radial-gradient(ellipse 100% 90% at 50% 0%, #164e63 0%, #0f172a 52%, #020617 100%);
}

.home-uc-scene--tencent .home-uc-scene-legend {
  background: rgba(15, 23, 42, 0.96);
}

.home-uc-scene--tencent .home-uc-scene-tag {
  background: rgba(30, 41, 59, 0.95);
  border: none;
  color: #e2e8f0;
}

/* 华为云：工程蓝图网格 + 政企专线感 */
.home-uc-scene--huawei {
  background-color: #f1f5f9;
  background-image: linear-gradient(rgba(100, 116, 139, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 116, 139, 0.09) 1px, transparent 1px);
  background-size: 14px 14px;
}

.home-uc-scene--huawei .home-uc-scene-legend {
  background: rgba(255, 255, 255, 0.94);
}

/* 阿里云：暖色数据看板 / 大促经营风 */
.home-uc-scene--aliyun {
  background: linear-gradient(165deg, #fffbeb 0%, #fef3c7 28%, #fff7ed 55%, #fafaf9 100%);
}

.home-uc-scene--aliyun .home-uc-scene-legend {
  background: rgba(255, 251, 235, 0.97);
}

/* Google Cloud：深色全球网络 / 数据出海节点风（与腾讯云暗色构图不同：偏紫、节点网） */
.home-uc-scene--gcp {
  background: radial-gradient(ellipse 90% 80% at 70% 10%, #312e81 0%, #1e1b4b 42%, #0f172a 100%);
}

.home-uc-scene--gcp .home-uc-scene-legend {
  background: rgba(15, 23, 42, 0.96);
}

.home-uc-scene--gcp .home-uc-scene-tag {
  background: rgba(49, 46, 129, 0.55);
  border: none;
  color: #e0e7ff;
}

/* AWS：浅灰等距「企业着陆区」工程风 */
.home-uc-scene--aws {
  background: linear-gradient(195deg, #f8fafc 0%, #e2e8f0 38%, #cbd5e1 100%);
}

.home-uc-scene--aws .home-uc-scene-legend {
  background: rgba(248, 250, 252, 0.96);
}

/* Azure：浅蓝混合云 + OpenAI 工作负载 */
.home-uc-scene--azure {
  background: linear-gradient(165deg, #f0f9ff 0%, #e0f2fe 35%, #f8fafc 100%);
}

.home-uc-scene--azure .home-uc-scene-legend {
  background: rgba(240, 249, 255, 0.95);
}

.home-uc-scene--azure .home-uc-scene-tag {
  background: #fff;
  border: none;
  color: #0369a1;
}

.home-uc-scene-tag {
  font-size: var(--home-font-micro);
  font-weight: 600;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: var(--surface-2);
  border: none;
  color: var(--muted);
}

.home-uc-scene--aws .home-uc-scene-tag {
  background: #fff;
  color: #9a3412;
}

.home-usecase-copy h3 {
  margin: 0 0 0.85rem;
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--text);
}

.home-usecase-features {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

@media (min-width: 520px) {
  .home-usecase-features {
    grid-template-columns: repeat(2, 1fr);
  }
}

.home-usecase-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
}

.home-usecase-features svg {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: var(--blue);
}

.home-usecase-desc {
  margin: 0 0 1.25rem;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.65;
  max-width: none;
}

.home-usecase-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.35rem;
  border-radius: 999px;
  border: 1px solid var(--blue);
  color: var(--blue);
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}

.home-usecase-cta:hover {
  background: var(--blue-soft);
}

/* 通用区块（区块间仅用背景色区分，不用顶部分割线） */
.home-section {
  padding: 3rem 0;
  border-top: none;
}

.home-section.is-tight-top {
  padding-top: 2.25rem;
}

.home-section.alt {
  background: var(--surface);
}

.home-section h2 {
  margin: 0 0 0.5rem;
  font-size: var(--home-section-title-size);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.03em;
}

.home-section-lead {
  margin: 0 0 1.75rem;
  max-width: 40rem;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.6;
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 900px) {
  .home-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 520px) {
  .home-cards {
    grid-template-columns: 1fr;
  }
}

.home-card {
  padding: 1.35rem 1.15rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.home-section.alt .home-card {
  background: var(--bg);
}

.home-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.home-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--blue-soft);
  color: var(--blue);
  display: grid;
  place-items: center;
  margin-bottom: 0.85rem;
}

.home-card h3 {
  margin: 0 0 0.45rem;
  font-size: var(--home-font-body);
  font-weight: 700;
}

.home-card p {
  margin: 0;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.55;
}

/* —— 为什么选择 —— */
main#main > section#why {
  padding-inline: 0;
  padding-top: 0;
}

.home-why-top-band {
  width: 100%;
  padding: 2.5rem var(--home-content-inline) 2.25rem;
  background: var(--surface);
  box-sizing: border-box;
}

.home-why-top-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: min(1600px, 100%);
  margin-inline: auto;
}

.home-why-intro {
  width: 100%;
  text-align: center;
}

.home-why-intro #why-h {
  margin: 0 auto 0.65rem;
  text-align: center;
}

.home-why-lead {
  width: 100%;
  margin: 0 auto;
  max-width: none;
  text-align: center;
  white-space: nowrap;
  font-size: var(--home-font-subtitle);
  line-height: 1.55;
}

@media (max-width: 1100px) {
  .home-why-lead {
    font-size: var(--home-font-body);
  }
}

.home-shell.home-why-shell {
  --home-why-shell-inline: calc(var(--home-why-body-inline) + 30px);
  width: 100%;
  max-width: min(1600px, calc(100% - 2 * var(--home-why-shell-inline)));
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 2.5rem var(--home-why-shell-inline) 0;
  margin-inline: auto;
  box-sizing: border-box;
}

.home-why-highlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min(920px, 100%);
  max-width: 100%;
  margin-inline: auto;
  padding: 1.75rem clamp(2rem, 5vw, 5rem) 1.85rem;
  border-radius: 30px;
  background: var(--grad);
  color: #fff;
  text-align: center;
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.28);
  box-sizing: border-box;
}

.home-why-highlight-main {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 0.45rem 0.75rem;
  margin: 0;
}

.home-why-highlight-label {
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.home-why-highlight-main b {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.home-why-highlight-main span {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.home-why-highlight-tagline {
  margin: 0.5rem 0 0;
  font-size: var(--home-font-body);
  font-weight: 600;
  line-height: 1.45;
  white-space: nowrap;
  opacity: 0.96;
}

.home-why-highlight-note {
  margin: 0.85rem 0 0;
  max-width: 42rem;
  font-size: var(--home-font-body-sm);
  line-height: 1.55;
  opacity: 0.92;
}

.home-why-block {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.home-why-block--bento {
  gap: 0.75rem;
}

.home-why-block-title,
.home-why-values-title {
  margin: 0;
  font-size: var(--home-font-module);
  font-weight: 700;
  color: var(--text);
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.home-why-block-title {
  padding-left: 0.85rem;
  border-left: 4px solid var(--blue);
}

.home-why-block-desc {
  margin: 0.15rem 0 0;
  padding-left: 0.85rem;
  font-size: var(--home-font-body);
  color: var(--muted);
  line-height: 1.6;
  max-width: 48rem;
}

.home-why-model {
  display: grid;
  gap: 0.9rem;
  width: 100%;
}

@media (min-width: 768px) {
  .home-why-model {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
}

.home-why-model-card {
  position: relative;
  padding: 1.05rem 1rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--bg);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.home-why-model-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: linear-gradient(90deg, var(--blue) 0%, #60a5fa 100%);
}

.home-why-model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
}

.home-why-model-card h4 {
  margin: 0 0 0.4rem;
  font-size: var(--home-font-body);
  font-weight: 700;
}

.home-why-model-card p {
  margin: 0;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.55;
}

.home-why-advantages,
.home-why-bento {
  /* 字阶与首页一致：模块 24 / 小标题 18 / 正文 16 / 辅助 14 */
  --home-bento-title-size: var(--home-font-subtitle);
  --home-bento-desc-size: var(--home-font-body);
  --home-bento-point-size: var(--home-font-body-sm);
  --home-bento-gap: 0.75rem;
  --home-bento-card-pad: 0.85rem 1rem 0.9rem;
  --home-bento-card-radius: 16px;
  --home-bento-inner-gap: 0.55rem;
  --home-bento-pane-gap: 0.7rem;
  --home-bento-media-min: 80px;
  --home-bento-resource-media-min: 98px;
  --home-bento-preview-min: 116px;
  --home-bento-clouds-min: 68px;
  --home-bento-row-min: 196px;
  display: grid;
  gap: var(--home-bento-gap);
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 960px) {
  .home-why-bento {
    grid-template-columns: repeat(20, minmax(0, 1fr));
    gap: 0.95rem;
    align-items: stretch;
  }

  .home-why-adv--resource {
    grid-column: 1 / span 7;
  }

  .home-why-adv--pricing {
    grid-column: 8 / span 13;
  }

  .home-why-adv--value {
    grid-column: 1 / span 10;
  }

  .home-why-adv--support {
    grid-column: 11 / span 10;
  }
}

@media (min-width: 1200px) {
  :root {
    --home-why-body-inline: clamp(48px, 4vw, 80px);
  }

  .home-why-top-band {
    padding-inline: clamp(48px, 5vw, 100px);
  }

  .home-shell.home-why-shell {
    gap: 4.25rem;
    padding-top: 3.25rem;
  }

  .home-why-block {
    gap: 1.5rem;
  }

  .home-why-model {
    gap: 1.15rem;
  }

  .home-why-bento {
    gap: 1rem;
  }
}

@media (min-width: 1440px) {
  :root {
    --home-why-body-inline: clamp(56px, 4.5vw, 96px);
  }

  .home-why-top-band {
    padding-inline: clamp(64px, 6vw, 128px);
  }

  .home-shell.home-why-shell {
    max-width: min(1680px, calc(100% - 2 * var(--home-why-shell-inline)));
    gap: 4.25rem;
  }

  .home-why-model {
    gap: 2rem;
  }

  .home-why-bento {
    gap: 1.1rem;
  }

  .home-why-model-card {
    padding: 1.15rem 1.1rem 1.1rem;
  }
}

.home-why-bento .home-why-adv {
  display: flex;
  flex-direction: column;
  gap: var(--home-bento-inner-gap);
  min-height: 0;
  padding: var(--home-bento-card-pad);
  border-radius: var(--home-bento-card-radius);
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.035);
  overflow: hidden;
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.home-why-bento .home-why-adv:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -10px rgba(37, 99, 235, 0.12);
}

.home-why-adv-head {
  flex-shrink: 0;
}

.home-why-adv-head h4 {
  margin: 0;
  font-size: var(--home-bento-title-size);
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.home-why-adv-desc {
  margin: 0.28rem 0 0;
  font-size: var(--home-bento-desc-size);
  color: var(--muted);
  line-height: 1.5;
}

.home-why-adv-pane {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--home-bento-pane-gap);
  min-height: 0;
}

@media (min-width: 960px) {
  .home-why-adv--pricing .home-why-adv-pane,
  .home-why-adv--support .home-why-adv-pane {
    flex-direction: row;
    align-items: stretch;
    gap: 1rem;
  }

  .home-why-adv--resource {
    min-height: var(--home-bento-row-min);
  }

  .home-why-adv--pricing,
  .home-why-adv--value,
  .home-why-adv--support {
    min-height: calc(var(--home-bento-row-min) - 12px);
  }
}

.home-why-adv-media {
  flex: 1;
  min-height: var(--home-bento-media-min);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.home-why-adv--resource .home-why-adv-media {
  min-height: var(--home-bento-resource-media-min);
}

.home-why-adv-media img {
  width: 100%;
  height: 100%;
  min-height: var(--home-bento-media-min);
  object-fit: cover;
  display: block;
}

.home-why-adv--pricing .home-why-adv-media {
  min-height: var(--home-bento-media-min);
}

@media (min-width: 960px) {
  .home-why-adv--pricing .home-why-adv-media {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
}

.home-why-adv-points {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

@media (min-width: 960px) {
  .home-why-adv--pricing .home-why-adv-points,
  .home-why-adv--support .home-why-adv-points {
    flex: 0 0 38%;
    min-width: 0;
    justify-content: center;
  }
}

.home-why-adv-points li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: var(--home-bento-point-size);
  color: var(--text);
  line-height: 1.5;
}

.home-why-adv-point-mark {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.12rem;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.1);
  color: var(--blue);
}

.home-why-adv-point-mark svg {
  display: block;
  width: 14px;
  height: 14px;
}

.home-why-adv-points strong {
  font-weight: 600;
  color: var(--text);
}

.home-why-adv-pane--preview {
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  background: var(--surface-2);
  overflow: hidden;
}

.home-why-adv--value .home-preview-card {
  width: 100%;
  height: 100%;
  min-height: var(--home-bento-preview-min);
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.home-why-adv--value .home-preview-head {
  padding: 0.55rem 0.75rem 0.4rem;
  font-size: var(--home-font-body-sm);
  background: transparent;
  border-bottom: none;
}

.home-why-adv--value .home-preview-body {
  padding: 0.25rem 0.75rem 0.6rem;
}

.home-why-adv--value .home-preview-kpis {
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.home-why-adv--value .home-preview-kpi {
  padding: 0.35rem 0.45rem;
  border: none;
  background: rgba(255, 255, 255, 0.5);
}

.home-why-adv--value .home-preview-kpi--save {
  border: none;
  background: rgba(236, 253, 245, 0.85);
}

.home-why-adv--value .home-preview-kpi .v {
  font-size: var(--home-font-subtitle);
}

.home-why-adv--value .home-preview-kpi .l {
  font-size: var(--home-font-caption);
}

.home-why-adv--value .home-preview-chart {
  margin-bottom: 0.55rem;
  padding: 0.35rem 0 0.45rem;
  border: none;
  background: transparent;
}

.home-why-adv--value .home-preview-chart-cap {
  font-size: var(--home-font-caption);
}

.home-why-adv--value .home-preview-legend {
  gap: 0.3rem 0.45rem;
  font-size: var(--home-font-caption);
}

.home-why-adv--value .home-preview-rows {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.home-why-adv--value .home-preview-row {
  padding: 0;
  font-size: var(--home-font-body-sm);
  border-top: none;
}

.home-why-adv-clouds {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem 0.45rem;
  align-content: center;
  min-height: var(--home-bento-clouds-min);
  padding: 0.45rem 0.55rem;
  border-radius: 12px;
  border: none;
  background: var(--surface-2);
}

@media (min-width: 960px) {
  .home-why-adv--support .home-why-adv-clouds {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
}

.home-why-adv-cloud {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: auto;
  padding: 0.25rem;
  border: none;
  border-radius: 0;
  background: transparent;
  box-sizing: border-box;
}

.home-why-adv-cloud :deep(.cloud-vendor-logo) {
  width: 1.75rem;
  height: 1.75rem;
}

.home-why-values-band {
  width: 100%;
  margin-top: 50px;
  padding: 2.5rem var(--home-section-inline-narrow) 2.25rem;
  background: var(--surface);
  box-sizing: border-box;
}

.home-shell.home-why-values-inner {
  width: 100%;
  max-width: none;
  margin: 0;
}

.home-why-values-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

.home-why-values-title {
  width: 100%;
  padding: 0;
  border: none;
  text-align: center;
}

.home-why-values {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1rem 1.25rem;
  align-items: stretch;
}

.home-why-value-item {
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.25rem;
  text-align: center;
  background: transparent;
  border: none;
  box-sizing: border-box;
}

@media (max-width: 899px) {
  .home-why-values {
    display: flex;
    flex-wrap: nowrap;
    gap: 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
  }

  .home-why-values::-webkit-scrollbar {
    height: 4px;
  }

  .home-why-value-item {
    flex: 0 0 auto;
    min-width: 9.5rem;
    scroll-snap-align: start;
  }
}

.home-why-value-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  background: var(--blue-soft);
  color: var(--blue);
  display: grid;
  place-items: center;
}

.home-why-value-icon svg {
  display: block;
}

.home-why-value-body {
  min-width: 0;
}

.home-why-value-item strong {
  display: block;
  font-size: var(--home-font-body);
  font-weight: 700;
  color: var(--text);
  line-height: 1.4;
  white-space: nowrap;
}

.home-why-value-item .home-why-value-body > span {
  display: block;
  margin-top: 0.2rem;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.45;
}

@media (min-width: 900px) {
  .home-why-values {
    gap: 1.15rem 1.5rem;
  }
}

@media (min-width: 1100px) {
  .home-why-values {
    gap: 1.25rem 1.75rem;
  }

  .home-why-value-item strong {
    font-size: var(--home-font-subtitle);
  }
}

.home-why-disclaimer {
  margin: 0.75rem 0 0;
  font-size: var(--home-font-micro);
  color: var(--muted-2);
  line-height: 1.45;
  text-align: center;
}

/* —— 获取专属咨询：蓝底双栏 + 白卡表单 —— */
main#main > section#consult {
  padding-inline: 8%;
}

.home-consult-wrap {
  padding: 0 0 3rem;
}

.home-consult-panel {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  gap: 2.5rem;
  padding: 3rem 2rem;
  border-radius: 3rem;
  background: var(--grad);
  box-shadow: 0 24px 48px rgba(37, 99, 235, 0.28);
  box-sizing: border-box;
}

.home-consult-panel-deco {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  transform: skewX(12deg) translateX(8rem);
  pointer-events: none;
}

.home-consult-promo {
  position: relative;
  z-index: 1;
  max-width: 40rem;
  color: #fff;
}

.home-consult-promo #consult-h {
  margin: 0 0 1.25rem;
  font-size: var(--home-section-title-size);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.03em;
  color: #fff;
}

.home-consult-promo-lead {
  margin: 0 0 1.75rem;
  font-size: var(--home-font-subtitle);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
}

.home-consult-card {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg);
  border-radius: 1rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  box-sizing: border-box;
}

.home-consult-card-title {
  margin: 0 0 1.5rem;
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  color: var(--text);
  line-height: 1.35;
}

@media (min-width: 900px) {
  .home-consult-panel {
    flex-direction: row;
    align-items: center;
    padding: 4rem 3.5rem;
    gap: 2rem;
  }

  .home-consult-promo {
    flex: 1;
    min-width: 0;
    margin-bottom: 0;
  }

  .home-consult-card {
    margin: 0;
    width: 100%;
    max-width: 28rem;
  }
}

.home-consult-field {
  margin-bottom: 1.1rem;
}

.home-consult-field label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--text);
}

.home-consult-field input,
.home-consult-select-wrap select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-family: inherit;
  font-size: var(--home-font-body-sm);
  color: var(--text);
  background: var(--bg);
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.home-consult-select-wrap {
  position: relative;
}

.home-consult-select-wrap select {
  appearance: none;
  padding-right: 2.5rem;
  cursor: pointer;
}

.home-consult-select-wrap::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 0.85rem;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid var(--muted-2);
  border-bottom: 2px solid var(--muted-2);
  transform: translateY(-65%) rotate(45deg);
  pointer-events: none;
}

.home-consult-field input:focus,
.home-consult-select-wrap select:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-ring);
}

.home-consult-submit {
  width: 100%;
  margin-top: 0.25rem;
  padding: 1rem 1.25rem;
  justify-content: center;
  font-size: var(--home-font-body);
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
}

.home-consult-footnote {
  margin: 1rem 0 0;
  font-size: var(--home-font-caption);
  font-style: italic;
  color: var(--muted-2);
  line-height: 1.5;
  text-align: center;
}

/* —— 优惠合作流程（横向连线流程，无卡片框） —— */
main#main > section#process {
  padding-inline: 0;
}

.home-shell.home-process {
  width: 100%;
  max-width: none;
  margin: 0;
  padding-inline: var(--home-section-inline-narrow);
  box-sizing: border-box;
}

.home-process {
  text-align: center;
}

.home-process-head {
  margin-bottom: 0.25rem;
}

.home-process-head #process-h {
  margin: 0 0 0.35rem;
}

.home-process-tagline {
  margin: 0;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.12em;
}

.home-process-flow {
  list-style: none;
  margin: 2rem 0 1.5rem;
  padding: 0;
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.home-process-step {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding: 0 0.5rem;
  text-align: center;
  box-sizing: border-box;
}

.home-process-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 2rem;
  left: calc(50% + 2rem);
  right: calc(-50% + 2rem);
  height: 2px;
  background: #93c5fd;
  z-index: 0;
  pointer-events: none;
}

.home-process-step:not(:last-child)::before {
  content: "";
  position: absolute;
  top: calc(2rem - 4px);
  right: calc(-50% + 2rem - 4px);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #93c5fd;
  z-index: 1;
  pointer-events: none;
}

.home-process-step:not(:first-child) .home-process-step-icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: -1.35rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #93c5fd;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
}

.home-process-step-icon {
  position: relative;
  z-index: 2;
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue);
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 6px var(--surface);
}

.home-process-step-icon svg {
  display: block;
}

.home-process-step-title {
  margin: 1rem 0 0.45rem;
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  color: var(--text);
  line-height: 1.35;
}

.home-process-step-desc {
  margin: 0;
  padding: 0 0.15rem;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.6;
}

.home-process-em {
  font-weight: 600;
  color: var(--blue);
}

.home-process-cta {
  margin-top: 0.5rem;
}

.home-process-cta > a {
  box-sizing: border-box;
  min-height: 52px;
  height: 52px;
  padding: 0 2rem;
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.42);
}

@media (max-width: 1099px) {
  .home-process-flow {
    flex-wrap: nowrap;
    gap: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    padding-bottom: 0.5rem;
    scrollbar-width: thin;
  }

  .home-process-step {
    flex: 0 0 11.5rem;
    scroll-snap-align: start;
  }

  .home-process-step:not(:last-child)::after,
  .home-process-step:not(:last-child)::before,
  .home-process-step:not(:first-child) .home-process-step-icon::before {
    display: none;
  }
}

@media (min-width: 1100px) {
  .home-process-step:not(:last-child)::after {
    left: calc(50% + 2.25rem);
    right: calc(-50% + 2.25rem);
  }
}

/* —— 专属福利 —— */
#benefits.home-section {
  padding-bottom: calc(3rem + 30px);
}

.home-benefits-head {
  text-align: center;
  margin-bottom: 30px;
}

.home-benefits-head #benefits-h {
  margin: 0;
}

/* —— 专属福利：三栏面板对比（参考深蓝 + 中栏凸起） —— */
.home-compare-wrap {
  --compare-navy: #1e3358;
  --compare-navy-deep: #162a47;
  --compare-blue: #4a8ef5;
  --compare-blue-mid: #3b7de8;
  --compare-blue-deep: #2f6fd4;
  --compare-panel-extra-h: 50px;
  --compare-row-extra-h: calc(var(--compare-panel-extra-h) / 7);
  --compare-side-reduce-h: 60px;
  --compare-side-row-reduce-h: calc(var(--compare-side-reduce-h) / 7);
  --compare-side-w: calc(11.5rem + 10px);
  --compare-ours-min-w: calc(14rem - 10px);
  --compare-ours-max-w: calc(25rem - 10px);
  --compare-ours-lift: 22px;
  margin-top: 0;
  /* 中栏负边距上浮，用 padding 预留标题下与区块底间距 */
  padding: var(--compare-ours-lift) 0;
  background: transparent;
  border: none;
}

.home-compare-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  max-width: calc(58rem + 30px);
  margin: 0 auto;
}

.home-compare-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  overflow: hidden;
  color: #fff;
}

.home-compare-panel--labels,
.home-compare-panel--vendor {
  background: linear-gradient(180deg, var(--compare-navy) 0%, var(--compare-navy-deep) 100%);
  box-shadow: 0 8px 24px rgba(22, 42, 71, 0.28);
}

.home-compare-panel--labels,
.home-compare-panel--vendor {
  flex: 0 0 var(--compare-side-w);
  width: var(--compare-side-w);
  min-width: var(--compare-side-w);
  max-width: var(--compare-side-w);
  z-index: 1;
  align-self: center;
}

.home-compare-panel--labels {
  margin-right: -20px;
  border-radius: 18px 0 0 18px;
}

.home-compare-panel--vendor {
  margin-left: -20px;
  border-radius: 0 18px 18px 0;
}

.home-compare-panel--ours {
  flex: 1 1 46%;
  min-width: var(--compare-ours-min-w);
  max-width: var(--compare-ours-max-w);
  z-index: 3;
  align-self: center;
  margin-block: calc(-1 * var(--compare-ours-lift));
  border-radius: 20px;
  background: linear-gradient(165deg, #5ca3ff 0%, var(--compare-blue) 28%, var(--compare-blue-mid) 55%, var(--compare-blue-deep) 100%);
  box-shadow:
    0 22px 48px rgba(47, 111, 212, 0.45),
    0 8px 16px rgba(30, 64, 120, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.home-compare-panel-head {
  padding: 1.1rem 0.75rem;
  font-size: var(--home-font-body);
  font-weight: 700;
  text-align: center;
  line-height: 1.35;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.08);
}

.home-compare-panel--ours .home-compare-panel-head {
  padding: 1.2rem 0.85rem;
  font-size: var(--home-font-subtitle);
  font-weight: 800;
  color: #fff;
  border-bottom-color: rgba(255, 255, 255, 0.22);
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.35) 0%, rgba(255, 255, 255, 0.1) 100%);
  text-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
}

.home-compare-panel-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: calc(4.75rem + var(--compare-row-extra-h));
  padding: 0.85rem 0.75rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.home-compare-panel-row:last-child {
  border-bottom: none;
}

.home-compare-panel--labels .home-compare-panel-row,
.home-compare-panel--vendor .home-compare-panel-row {
  min-height: calc(4.35rem + var(--compare-row-extra-h) - var(--compare-side-row-reduce-h));
  padding: 0.6rem 0.45rem;
}

.home-compare-panel--labels .home-compare-panel-row {
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  line-height: 1.4;
  padding-inline: 0.4rem;
}

.home-compare-panel--labels .home-compare-panel-head,
.home-compare-panel--vendor .home-compare-panel-head {
  padding: 0.75rem 0.5rem;
  font-size: var(--home-font-body);
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.home-compare-panel--ours .home-compare-panel-row {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.55rem;
  padding: 0.85rem 0.65rem;
  min-height: calc(4.5rem + var(--compare-row-extra-h));
  border-bottom-color: rgba(255, 255, 255, 0.16);
}

.home-compare-panel--vendor .home-compare-panel-row {
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  text-align: center;
}

.home-compare-panel-row--emph .home-compare-text {
  font-weight: 600;
}

.home-compare-text {
  font-size: var(--home-font-body-sm);
  line-height: 1.5;
  opacity: 0.96;
}

.home-compare-panel--ours .home-compare-text {
  width: 100%;
  max-width: 100%;
  font-size: var(--home-font-body);
  line-height: 1.45;
  text-align: center;
}

.home-compare-panel--vendor .home-compare-text {
  flex: 0 1 auto;
  width: auto;
  max-width: calc(100% - 1.85rem);
  font-size: var(--home-font-body-sm);
  line-height: 1.45;
  text-align: center;
}

.home-compare-panel--ours .home-compare-mark {
  margin-top: 0.1rem;
}

.home-compare-panel--vendor .home-compare-mark {
  margin-top: 0;
}

.home-compare-mark {
  flex-shrink: 0;
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 0.8rem;
}

.home-compare-mark--yes {
  background-color: #f5c518;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 12.5l4 4L18 8.5' stroke='%231e3a5f' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.home-compare-mark--ring-ok,
.home-compare-mark--ring-no {
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.75);
}

.home-compare-mark--ring-ok {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 12.5l4 4L18 8.5' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.home-compare-mark--ring-no {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M8 8l8 8M16 8l-8 8' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
  opacity: 0.85;
}

@media (min-width: 900px) {
  .home-compare-wrap {
    --compare-ours-lift: 28px;
    padding: var(--compare-ours-lift) 0;
  }

  .home-compare-stage {
    gap: 0.65rem;
  }

  .home-compare-panel--ours {
    margin-block: calc(-1 * var(--compare-ours-lift));
  }

  .home-compare-panel-row {
    min-height: calc(4.6rem + var(--compare-row-extra-h));
  }

  .home-compare-panel--labels .home-compare-panel-row,
  .home-compare-panel--vendor .home-compare-panel-row {
    min-height: calc(4.6rem + var(--compare-row-extra-h) - var(--compare-side-row-reduce-h));
  }

  .home-compare-panel--ours .home-compare-panel-row {
    min-height: calc(4.5rem + var(--compare-row-extra-h));
  }

}

@media (max-width: 767px) {
  .home-compare-wrap {
    --compare-ours-lift: 16px;
    margin-inline: 0;
    padding-block: var(--compare-ours-lift);
  }

  .home-compare-stage {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    justify-content: flex-start;
    padding-bottom: 0.35rem;
    min-width: 100%;
  }

  .home-compare-panel {
    flex: 0 0 auto;
    width: calc(7.75rem + 10px);
  }

  .home-compare-panel--ours {
    width: calc(12rem - 10px);
    max-width: calc(12rem - 10px);
    margin-block: calc(-1 * var(--compare-ours-lift));
    z-index: 3;
  }

  .home-compare-panel--labels,
  .home-compare-panel--vendor {
    width: calc(8.75rem + 10px);
    min-width: calc(8.75rem + 10px);
    max-width: none;
  }
}

/* 页脚：与 trinity-ai 首页 footer 字阶、分割线、布局一致 */
.home-footer {
  border-top: 1px solid var(--border);
  padding: 2.25rem 0 0;
  background: var(--bg);
  font-size: 0.8125rem;
  color: var(--muted);
}

.home-footer-top {
  display: grid;
  gap: 1.75rem;
  width: 100%;
  margin: 0;
  padding: 0 var(--page-gutter);
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .home-footer-top {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 900px) {
  .home-footer-top {
    grid-template-columns: 1.15fr repeat(2, 1fr);
  }
}

.home-footer-brand {
  color: var(--muted);
}

.home-footer-brand strong {
  display: block;
  color: var(--text);
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 0.45rem;
}

.home-footer-brand p {
  margin: 0;
  max-width: 22rem;
  line-height: 1.55;
}

.home-footer-col h4 {
  margin: 0 0 0.65rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: none;
  color: var(--muted-2);
}

.home-footer-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.home-footer-col li {
  margin-bottom: 0.4rem;
}

.home-footer-col a {
  color: var(--muted);
}

.home-footer-col a:hover {
  color: var(--text);
}

.home-footer-bottom {
  padding: 1.35rem var(--page-gutter) 2rem;
  border-top: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--muted-2);
  text-align: center;
}


.home-page {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
</style>
