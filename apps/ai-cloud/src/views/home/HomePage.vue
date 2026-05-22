<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { TrinityAuthModal, type TrinityAuthMode } from "@trinity/ui";
import { AI_CLOUD_CONSOLE_HASH } from "../account/mock";
import advantagePricing from "../../assets/home/advantage-pricing.png";
import advantageConsulting from "../../assets/home/advantage-consulting.png";
import advantageSupport from "../../assets/home/advantage-support.png";

defineOptions({ name: "AiCloudHomePage" });

const router = useRouter();
const pageRef = ref<HTMLElement | null>(null);

const authVisible = ref(false);
const authSignup = ref(false);
const authFormError = ref("");
const signupMountKey = ref(0);

const authMode = computed<TrinityAuthMode>(() => (authSignup.value ? "signup" : "signin"));

function setBodyModal(open: boolean) {
  document.body.classList.toggle("or-modal-open", open);
}

function openAuthModal(signup = false) {
  authSignup.value = signup;
  authFormError.value = "";
  if (signup) signupMountKey.value += 1;
  authVisible.value = true;
  setBodyModal(true);
  const drawer = pageRef.value?.querySelector("#home-drawer");
  const menuBtn = pageRef.value?.querySelector("#home-menu-btn");
  drawer?.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
  setTimeout(() => {
    pageRef.value?.querySelector<HTMLInputElement>("#home-auth-email")?.focus();
  }, 0);
}

function closeAuthModal() {
  authVisible.value = false;
  setBodyModal(false);
}

function oauthToConsole() {
  void router.push({ name: "aic-account-console", hash: AI_CLOUD_CONSOLE_HASH.ACCOUNTS });
}

function onSigninSubmit() {
  oauthToConsole();
}

function onAuthModeChange(next: TrinityAuthMode) {
  openAuthModal(next === "signup");
}

function onSignupSubmit() {
  authFormError.value = "";
  oauthToConsole();
}

let disposeDom: (() => void) | undefined;

onMounted(() => {
  const root = pageRef.value;
  if (!root) return;

  const cleanups: Array<() => void> = [];

  const menuBtn = root.querySelector<HTMLButtonElement>("#home-menu-btn");
  const drawer = root.querySelector<HTMLElement>("#home-drawer");
  if (menuBtn && drawer) {
    const onMenu = () => {
      const open = !drawer.classList.contains("open");
      drawer.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 900px)").matches) {
        drawer.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    };
    const onDrawerClick = (e: Event) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#") && href.length > 1) {
        drawer.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    };
    menuBtn.addEventListener("click", onMenu);
    window.addEventListener("resize", onResize);
    drawer.addEventListener("click", onDrawerClick);
    cleanups.push(() => {
      menuBtn.removeEventListener("click", onMenu);
      window.removeEventListener("resize", onResize);
      drawer.removeEventListener("click", onDrawerClick);
    });
  }

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

    const onHash = () => {
      const id = location.hash.slice(1);
      if (id && sections.some((s) => s.id === id)) setOverlapActive(id);
    };
    window.addEventListener("hashchange", onHash);
    cleanups.push(() => window.removeEventListener("hashchange", onHash));

    const hashId = location.hash.slice(1);
    if (hashId && sections.some((s) => s.id === hashId)) setOverlapActive(hashId);
    else setOverlapActive(sections[0]?.id ?? "cloud-solutions");
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
  }

  const lang = root.querySelector<HTMLButtonElement>("#home-lang");
  if (lang) {
    const onLang = () => {
      const isZh = (lang.textContent || "").includes("中");
      lang.textContent = isZh ? "中文 / EN" : "中 / EN";
    };
    lang.addEventListener("click", onLang);
    cleanups.push(() => lang.removeEventListener("click", onLang));
  }

  const wireOpen = (id: string, signup: boolean) => {
    const el = root.querySelector<HTMLElement>("#" + id);
    if (!el) return;
    const fn = () => openAuthModal(signup);
    el.addEventListener("click", fn);
    cleanups.push(() => el.removeEventListener("click", fn));
  };
  wireOpen("home-open-login", false);
  wireOpen("home-open-register", true);
  wireOpen("home-drawer-login", false);
  wireOpen("home-drawer-register", true);

  const signupLink = root.querySelector('[data-or-open-signup="1"]');
  if (signupLink) {
    const fn = (e: Event) => {
      e.preventDefault();
      openAuthModal(true);
    };
    signupLink.addEventListener("click", fn);
    cleanups.push(() => signupLink.removeEventListener("click", fn));
  }

  const toSigninBtn = root.querySelector("#home-auth-to-signin");
  if (toSigninBtn) {
    const fn = () => openAuthModal(false);
    toSigninBtn.addEventListener("click", fn);
    cleanups.push(() => toSigninBtn.removeEventListener("click", fn));
  }

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
  };
});

onUnmounted(() => {
  disposeDom?.();
});

</script>

<template>
  <div ref="pageRef" class="home-page">
<a class="skip" href="#main">跳转至正文</a>

<header class="home-header">
  <div class="home-header-inner">
    <a href="/ai-cloud" class="home-brand" aria-label="Trinity 首页">
      <span class="home-brand-mark" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l1.2 4.5L18 8l-4.8 1.5L12 14l-1.2-4.5L6 8l4.8-1.5L12 2zM19 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L19 14zM5 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L5 14z"
            fill="currentColor"
          />
        </svg>
      </span>
      Trinity
    </a>

    <nav class="home-nav-center" aria-label="主导航">
      <div class="home-nav-dd">
        <button type="button" class="home-nav-dd-btn" aria-expanded="false" aria-haspopup="true">
          AI 云
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div class="home-nav-dd-panel" role="menu">
          <a href="#cloud-solutions" role="menuitem">多云对接与各云说明</a>
          <a href="#why" role="menuitem">核心优势</a>
          <a href="#benefits" role="menuitem">专属福利</a>
          <a href="#process" role="menuitem">购买流程</a>
        </div>
      </div>
      <a href="/trinity-ai" class="home-nav-link">Trinity AI</a>
    </nav>

    <div class="home-actions">
      <button type="button" class="home-lang" id="home-lang" title="切换语言">中 / EN</button>
      <button type="button" class="home-btn-ghost" id="home-open-register">注册</button>
      <button type="button" class="btn btn-gradient" id="home-open-login">登录</button>
      <button type="button" class="home-menu-btn" id="home-menu-btn" aria-expanded="false" aria-controls="home-drawer" aria-label="打开菜单">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
  <div class="home-drawer" id="home-drawer">
    <span style="display: block; font-size: 11px; font-weight: 700; color: var(--muted-2); padding: 0.35rem 0">AI 云</span>
    <a href="#cloud-solutions">多云对接与各云说明</a>
    <a href="#why">核心优势</a>
    <a href="#benefits">专属福利</a>
    <a href="#process">购买流程</a>
    <a href="/trinity-ai">Trinity AI</a>
    <button type="button" id="home-drawer-login">登录</button>
    <button type="button" id="home-drawer-register">注册</button>
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
            <p class="home-banner-sub">
              一站式多云采购与管理，覆盖<span class="home-cloud-name">阿里云</span>、<span class="home-cloud-name">腾讯云</span>、<span class="home-cloud-name">华为云</span>、<span class="home-cloud-name">AWS</span>、<span class="home-cloud-name">Google Cloud</span> 等主流公有云，提供渠道优惠价、上云方案咨询，助力企业降低上云成本、提升业务效率。依托集团体量议价，企业零门槛享大客户级折扣、灵活账期与统一账单；仅收透明服务费，不赚差价。
            </p>
            <div class="home-banner-cta">
              <a href="#consult" class="btn btn-gradient">立即咨询优惠权益</a>
            </div>
          </div>
        </div>
        <div class="home-hero-right">
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
          <span class="home-overlap-desc"><span class="home-cloud-name">阿里云</span>、<span class="home-cloud-name">腾讯云</span>、<span class="home-cloud-name">华为云</span>、<span class="home-cloud-name">AWS</span>、<span class="home-cloud-name">Google Cloud</span> 全覆盖</span>
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
        <button type="button" class="home-usecase-tab" role="tab" id="tab-aliyun" aria-controls="panel-aliyun" aria-selected="true" tabindex="0">阿里云</button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-tencent" aria-controls="panel-tencent" aria-selected="false" tabindex="-1">腾讯云</button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-huawei" aria-controls="panel-huawei" aria-selected="false" tabindex="-1">华为云</button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-aws" aria-controls="panel-aws" aria-selected="false" tabindex="-1">AWS</button>
        <button type="button" class="home-usecase-tab" role="tab" id="tab-gcp" aria-controls="panel-gcp" aria-selected="false" tabindex="-1">Google Cloud</button>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="panel-tencent" aria-labelledby="tab-tencent" hidden>
        <div class="home-usecase-grid">
          <div class="home-uc-visual" aria-hidden="true">
            <div class="home-uc-vis-inner">
              <div class="home-uc-vis-top"><span>腾讯云 · 直播与实时音视频</span></div>
              <div class="home-uc-scene home-uc-scene--tencent">
                <div class="home-uc-scene-main">
                  <svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<linearGradient id="tc-screen" x1="200" y1="52" x2="200" y2="178" gradientUnits="userSpaceOnUse"><stop stop-color="#155e75"/><stop offset="0.5" stop-color="#0e7490"/><stop offset="1" stop-color="#042f2e"/></linearGradient>
<linearGradient id="tc-bezel" x1="118" y1="36" x2="292" y2="188" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
<linearGradient id="tc-meter" x1="332" y1="168" x2="332" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>
</defs>
<g opacity="0.35" stroke="#64748b" stroke-width="1"><path d="M8 28h384M8 40h384M8 52h384M8 64h384M8 76h384M8 88h384M8 100h384M8 112h384M8 124h384M8 136h384M8 148h384M8 160h384M8 172h384M8 184h384M8 196h384M8 208h384"/></g>
<rect x="12" y="8" width="376" height="18" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
<g fill="#0f172a"><circle cx="22" cy="17" r="2"/><circle cx="32" cy="17" r="2"/><circle cx="42" cy="17" r="2"/><circle cx="52" cy="17" r="2"/><circle cx="62" cy="17" r="2"/><circle cx="72" cy="17" r="2"/><circle cx="82" cy="17" r="2"/><circle cx="92" cy="17" r="2"/></g>
<g stroke="#94a3b8" stroke-width="1.2"><circle cx="28" cy="120" r="26"/><circle cx="28" cy="120" r="18"/><circle cx="28" cy="120" r="10"/><path d="M8 120h40M28 94v52" opacity="0.6"/></g>
<rect x="10" y="98" width="36" height="44" rx="6" stroke="#475569" stroke-width="1.5" fill="#1e293b"/>
<rect x="108" y="32" width="196" height="156" rx="14" fill="url(#tc-bezel)" stroke="#64748b" stroke-width="1.5"/>
<rect x="122" y="46" width="168" height="112" rx="6" fill="url(#tc-screen)" stroke="#22d3ee" stroke-width="1" opacity="0.95"/>
<path d="M134 132c10-18 18-18 28 0s18 18 28 0 18-18 28 0 18 18 28 0 18-18 28-18 18 18 28 18 18-18 28-18 18 18 28 18" stroke="#5eead4" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.95"/>
<path d="M134 148c8-10 14-10 22 0s14 10 22 0 14-10 22 0 14 10 22 0 14-10 22-10 14 10 22 10" stroke="#67e8f9" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.75"/>
<circle cx="206" cy="88" r="22" stroke="#fbbf24" stroke-width="2" fill="rgba(251,191,36,0.12)"/>
<path d="M198 88l10 8 18-22" stroke="#fcd34d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<rect x="258" y="46" width="36" height="16" rx="3" fill="#7f1d1d" stroke="#fca5a5" stroke-width="0.8"/><circle cx="268" cy="54" r="3" fill="#ef4444"/><path d="M276 50h2v8h-2zM280 50h2v8h-2zM284 50h2v8h-2z" fill="#fecaca"/>
<rect x="318" y="48" width="62" height="124" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.2"/>
<g fill="url(#tc-meter)" opacity="0.9"><rect x="326" y="148" width="6" height="16" rx="1"/><rect x="336" y="132" width="6" height="32" rx="1"/><rect x="346" y="156" width="6" height="8" rx="1"/><rect x="356" y="124" width="6" height="40" rx="1"/><rect x="366" y="140" width="6" height="24" rx="1"/></g>
<path d="M326 56h46v14H326z" fill="#1e293b" stroke="#475569"/><path d="M332 62h34M332 68h24" stroke="#64748b" stroke-width="1.2" stroke-linecap="round"/>
</svg>
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">连麦 / 互动直播</span>
                  <span class="home-uc-scene-tag">超低延迟转码</span>
                  <span class="home-uc-scene-tag">CDN + 实时 AI 特效 / 推理</span>
                </div>
              </div>
            </div>
          </div>
          <div class="home-usecase-copy">
            <h3>在腾讯云上稳定交付 GPU 推理与混合云网络</h3>
            <ul class="home-usecase-features">
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                GPU 云服务器与裸金属编排
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                云联网、专线 DC 与 VPC 边界
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                配额策略、分账与审计导出
              </li>
            </ul>
            <p class="home-usecase-desc">
              适合已在微信生态、游戏与音视频等业务中使用腾讯云的客户。平台将 GPU 池、伸缩策略与账单视图纳入统一策略模板；底层订单与合同仍以腾讯云为准。
            </p>
            <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
          </div>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="panel-huawei" aria-labelledby="tab-huawei" hidden>
        <div class="home-usecase-grid">
          <div class="home-uc-visual" aria-hidden="true">
            <div class="home-uc-vis-inner">
              <div class="home-uc-vis-top"><span>华为云 · 政企与运营商专线</span></div>
              <div class="home-uc-scene home-uc-scene--huawei">
                <div class="home-uc-scene-main">
                  <svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><marker id="hw-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6z" fill="#64748b"/></marker></defs>
<path d="M48 168h300" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 4"/>
<path d="M52 168 V56" stroke="#64748b" stroke-width="1" marker-end="url(#hw-arr)"/>
<path d="M52 56h88" stroke="#64748b" stroke-width="1" marker-end="url(#hw-arr)"/>
<path d="M140 56V120" stroke="#64748b" stroke-width="1" marker-end="url(#hw-arr)"/>
<path d="M52 120h240" stroke="#64748b" stroke-width="1" marker-end="url(#hw-arr)"/>
<g stroke="#475569" stroke-width="2" fill="#f8fafc"><path d="M68 160 L68 72 L88 52 L108 72 L108 160z"/><path d="M78 160V88M98 160V88M88 72V52"/></g>
<path d="M108 96 L180 96" stroke="#0ea5e9" stroke-width="2.5" stroke-dasharray="6 4"/>
<path d="M180 96 L180 118" stroke="#0ea5e9" stroke-width="2"/>
<polygon points="180,52 230,82 230,158 180,188 130,158 130,82" stroke="#c2410c" stroke-width="2.2" fill="#fff7ed"/>
<g stroke="#ea580c" stroke-width="1.4" opacity="0.9"><path d="M148 120h64M148 132h52M148 144h60M148 156h48"/></g>
<rect x="168" y="104" width="24" height="24" rx="2" fill="#fb923c" opacity="0.45" stroke="#c2410c"/>
<path d="M248 48h112v132H248z" fill="#fff" stroke="#334155" stroke-width="2"/>
<path d="M262 68h84M262 88h72M262 108h80M262 128h64" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
<rect x="270" y="140" width="68" height="28" rx="4" fill="#fef2f2" stroke="#f87171" stroke-width="1.2"/>
<path d="M286 154l8 8 16-16" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">运营商骨干 / 专线入云</span>
                  <span class="home-uc-scene-tag">政务专网 · 等保合规</span>
                  <span class="home-uc-scene-tag">昇腾 / 鲲鹏训推一体</span>
                </div>
              </div>
            </div>
          </div>
          <div class="home-usecase-copy">
            <h3>面向政企与 Ascend 路线的统一配额与审计</h3>
            <ul class="home-usecase-features">
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                资源目录与多组织配额
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                VPC、云专线与跨 Region 规划
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                变更工单与合规策略模板
              </li>
            </ul>
            <p class="home-usecase-desc">
              适合政务云、运营商及对 Ascend 有硬性要求的项目。我们侧重策略下发、配额与健康度看板；敏感区部署仍遵循华为云合规流程。
            </p>
            <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
          </div>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="panel-aliyun" aria-labelledby="tab-aliyun">
        <div class="home-usecase-grid">
          <div class="home-uc-visual" aria-hidden="true">
            <div class="home-uc-vis-inner">
              <div class="home-uc-vis-top"><span>阿里云 · 电商与金融经营</span></div>
              <div class="home-uc-scene home-uc-scene--aliyun">
                <div class="home-uc-scene-main">
                  <svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="al-bar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#ea580c"/></linearGradient></defs>
<rect x="16" y="24" width="112" height="168" rx="10" fill="#fff" stroke="#fcd34d" stroke-width="1.5" filter="drop-shadow(0 4px 8px rgba(234,88,12,0.12))"/>
<path d="M52 148 A40 40 0 1 1 52 147.9" stroke="#f59e0b" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.85"/>
<circle cx="52" cy="108" r="6" fill="#ea580c" opacity="0.9"/>
<path d="M36 172h64M36 184h48" stroke="#d6d3d1" stroke-width="3" stroke-linecap="round"/>
<rect x="144" y="24" width="120" height="168" rx="10" fill="#fff" stroke="#fb923c" stroke-width="1.5" filter="drop-shadow(0 4px 8px rgba(234,88,12,0.1))"/>
<rect x="158" y="148" width="14" height="36" rx="2" fill="url(#al-bar)" opacity="0.9"/><rect x="178" y="124" width="14" height="60" rx="2" fill="url(#al-bar)" opacity="0.95"/><rect x="198" y="100" width="14" height="84" rx="2" fill="#ea580c" opacity="0.95"/><rect x="218" y="132" width="14" height="52" rx="2" fill="#fb923c"/><rect x="238" y="116" width="14" height="68" rx="2" fill="#f59e0b"/>
<path d="M152 88 Q200 8 248 52 T332 40" stroke="#ea580c" stroke-width="2.5" fill="none" opacity="0.45" stroke-dasharray="5 4"/>
<rect x="280" y="24" width="104" height="168" rx="10" fill="#fff" stroke="#f59e0b" stroke-width="1.5" filter="drop-shadow(0 4px 8px rgba(234,88,12,0.1))"/>
<rect x="292" y="44" width="80" height="10" rx="2" fill="#fef3c7"/><rect x="292" y="62" width="64" height="10" rx="2" fill="#fde68a"/><rect x="292" y="80" width="72" height="10" rx="2" fill="#fcd34d"/><rect x="292" y="98" width="56" height="10" rx="2" fill="#fbbf24"/><rect x="292" y="116" width="68" height="10" rx="2" fill="#f59e0b"/>
<path d="M296 154 L312 138 L328 146 L344 122 L360 130" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="312" cy="172" r="5" fill="#fcd34d"/><circle cx="328" cy="172" r="5" fill="#fbbf24"/><circle cx="344" cy="172" r="5" fill="#f59e0b"/>
</svg>
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">大促容量与弹性预算</span>
                  <span class="home-uc-scene-tag">多 BU / 多主体分账</span>
                  <span class="home-uc-scene-tag">经营看板 + 成本归因</span>
                </div>
              </div>
            </div>
          </div>
          <div class="home-usecase-copy">
            <h3>把灵骏算力与财务单元拆到「部门看得懂」</h3>
            <ul class="home-usecase-features">
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                资源组、RAM 与 IdP 联邦
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                分账报表与预算告警
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                ACK / PAI 推理模板编排
              </li>
            </ul>
            <p class="home-usecase-desc">
              适合电商、金融科技等主体采购在阿里云完成的客户。平台强调算力成本「拆得清」，并与阿里云成本数据对齐校验。
            </p>
            <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
          </div>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="panel-gcp" aria-labelledby="tab-gcp" hidden>
        <div class="home-usecase-grid">
          <div class="home-uc-visual" aria-hidden="true">
            <div class="home-uc-vis-inner">
              <div class="home-uc-vis-top"><span>Google Cloud · 出海与全球数据面</span></div>
              <div class="home-uc-scene home-uc-scene--gcp">
                <div class="home-uc-scene-main">
                  <svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<filter id="g-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<linearGradient id="g-arc" x1="0" y1="180" x2="400" y2="180" gradientUnits="userSpaceOnUse"><stop stop-color="#34d399" stop-opacity="0"/><stop offset="0.5" stop-color="#2dd4bf" stop-opacity="0.9"/><stop offset="1" stop-color="#818cf8" stop-opacity="0"/></linearGradient>
</defs>
<path d="M20 178 Q200 120 380 178" stroke="url(#g-arc)" stroke-width="3" fill="none" opacity="0.85"/>
<path d="M40 172 Q200 88 360 168" stroke="#6366f1" stroke-width="1.2" fill="none" opacity="0.35" stroke-dasharray="4 6"/>
<circle cx="72" cy="72" r="7" fill="#4ade80" filter="url(#g-glow)"/><circle cx="140" cy="48" r="9" fill="#60a5fa" filter="url(#g-glow)"/><circle cx="210" cy="40" r="8" fill="#a78bfa" filter="url(#g-glow)"/><circle cx="288" cy="58" r="10" fill="#f472b6" filter="url(#g-glow)"/><circle cx="340" cy="96" r="7" fill="#38bdf8" filter="url(#g-glow)"/><circle cx="200" cy="100" r="11" fill="#fbbf24" filter="url(#g-glow)"/><circle cx="118" cy="118" r="6" fill="#94a3b8" opacity="0.9"/>
<path d="M72 72 Q136 56 200 100" stroke="#a5b4fc" stroke-width="1.5" fill="none" opacity="0.8"/><path d="M200 100 Q248 48 288 58" stroke="#a5b4fc" stroke-width="1.5" fill="none" opacity="0.8"/><path d="M200 100 Q230 120 340 96" stroke="#6ee7b7" stroke-width="1.5" fill="none" opacity="0.75"/><path d="M118 118 Q160 90 200 100" stroke="#94a3b8" stroke-width="1.2" fill="none" opacity="0.6"/>
<path d="M320 36 L352 52 L338 28 Z" fill="#38bdf8" opacity="0.85"/>
<path d="M328 44 L360 40 L352 56 Z" fill="#67e8f9" opacity="0.5"/>
<rect x="24" y="150" width="72" height="28" rx="6" stroke="#818cf8" stroke-width="1" fill="rgba(99,102,241,0.15)"/><rect x="304" y="132" width="72" height="36" rx="6" stroke="#34d399" stroke-width="1" fill="rgba(52,211,153,0.12)"/>
</svg>
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">多 Region 主动 / 主动</span>
                  <span class="home-uc-scene-tag">跨境与数据驻留路径</span>
                  <span class="home-uc-scene-tag">Vertex / TPU 批推理链路</span>
                </div>
              </div>
            </div>
          </div>
          <div class="home-usecase-copy">
            <h3>全球低延迟与 TPU / GPU 选型一站编排</h3>
            <ul class="home-usecase-features">
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                GKE、Compute Engine 与 Vertex 周边
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                Shared VPC 与混合互联
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                Landing Zone 与成本看板对齐
              </li>
            </ul>
            <p class="home-usecase-desc">
              适合出海与需要全球算力调度的团队。关注多区域 GPU/TPU、配额与合规边界；跨境与数据驻留需遵循客户主体与 GCP 条款。
            </p>
            <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
          </div>
        </div>
      </div>

      <div class="home-usecase-panel" role="tabpanel" id="panel-aws" aria-labelledby="tab-aws" hidden>
        <div class="home-usecase-grid">
          <div class="home-uc-visual" aria-hidden="true">
            <div class="home-uc-vis-inner">
              <div class="home-uc-vis-top"><span>AWS · 企业多账号着陆区</span></div>
              <div class="home-uc-scene home-uc-scene--aws">
                <div class="home-uc-scene-main">
                  <svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="aw-pl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8fafc"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient></defs>
<g transform="translate(200,120)"><path d="M-120 20 L0 -40 L120 20 L0 80 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/><path d="M-100 8 L0 -52 L100 8 L0 68 Z" fill="#f1f5f9" stroke="#64748b" stroke-width="1.2"/><path d="M-80 -4 L0 -64 L80 -4 L0 56 Z" fill="url(#aw-pl)" stroke="#475569" stroke-width="1.2"/></g>
<g transform="translate(200,58)"><rect x="-28" y="-18" width="56" height="36" rx="4" fill="#fff" stroke="#f59e0b" stroke-width="2"/><path d="M-12 -6h24M-12 4h16" stroke="#78716c" stroke-width="2" stroke-linecap="round"/></g>
<path d="M200 76 L200 92" stroke="#64748b" stroke-width="2"/>
<g transform="translate(200,108)"><rect x="-130" y="0" width="80" height="44" rx="5" fill="#fff" stroke="#ea580c" stroke-width="1.5" transform="skewX(-8)"/><rect x="-30" y="8" width="80" height="44" rx="5" fill="#fff" stroke="#f59e0b" stroke-width="1.5" transform="skewX(-8)"/><rect x="70" y="16" width="80" height="44" rx="5" fill="#fff" stroke="#ea580c" stroke-width="1.5" transform="skewX(-8)"/></g>
<path d="M88 124h32M88 136h20M248 132h28M248 144h36" stroke="#78716c" stroke-width="2" stroke-linecap="round"/>
<rect x="168" y="168" width="64" height="28" rx="6" fill="#fff7ed" stroke="#fb923c" stroke-width="1.5"/><path d="M184 182h32M184 190h24" stroke="#b45309" stroke-width="1.5" stroke-linecap="round"/>
</svg>
                </div>
                <div class="home-uc-scene-legend">
                  <span class="home-uc-scene-tag">Control Tower 蓝图</span>
                  <span class="home-uc-scene-tag">OU + SCP 安全护栏</span>
                  <span class="home-uc-scene-tag">CUR / SP·RI 与算力对齐</span>
                </div>
              </div>
            </div>
          </div>
          <div class="home-usecase-copy">
            <h3>把 Organizations 与算力成本放进同一治理平面</h3>
            <ul class="home-usecase-features">
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                多账号着陆区与 IAM IC
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                EC2 GPU、EKS 与 Batch 流水线
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                CUR、SP/RI 建议与 ITSM 回传
              </li>
            </ul>
            <p class="home-usecase-desc">
              适合已使用 Organizations、Control Tower 的中大型客户。平台侧重算力与财务视图统一；变更与告警可对接企业 ITSM。
            </p>
            <a href="#consult" class="home-usecase-cta">预约对接咨询</a>
          </div>
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

      <div class="home-why-block">
        <h3 class="home-why-block-title">四大核心赋能</h3>
        <div class="home-why-advantages">
          <article class="home-why-adv">
            <div class="home-why-adv-visual home-why-adv-visual--svg" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div class="home-why-adv-body">
              <h4>资源优势</h4>
              <p>覆盖国内外主流云，节点灵活可选，满足出海与国内一站式部署。</p>
            </div>
          </article>
          <article class="home-why-adv">
            <div class="home-why-adv-visual" aria-hidden="true">
              <img :src="advantagePricing" alt="" loading="lazy" />
            </div>
            <div class="home-why-adv-body">
              <h4>商务优势</h4>
              <p><strong>最低 2 折起</strong>，VIP 级优惠；<strong>无保底、无门槛</strong>，按需使用。</p>
            </div>
          </article>
          <article class="home-why-adv">
            <div class="home-why-adv-visual" aria-hidden="true">
              <img :src="advantageConsulting" alt="" loading="lazy" />
            </div>
            <div class="home-why-adv-body">
              <h4>增值服务（免费）</h4>
              <p>上云咨询、架构设计、资源选型与多云成本统一管控。</p>
            </div>
          </article>
          <article class="home-why-adv">
            <div class="home-why-adv-visual" aria-hidden="true">
              <img :src="advantageSupport" alt="" loading="lazy" />
            </div>
            <div class="home-why-adv-body">
              <h4>技术支持</h4>
              <p><strong>VIP专属技术团队</strong>，快速响应、问题优先处理。</p>
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
    <div class="home-shell home-footer-grid">
      <div>
        <strong style="color: var(--text); font-size: 14px">Trinity AI 云</strong>
        <p style="margin: 0.5rem 0 0; max-width: 22rem">多云 AI 算力纳管与企业级交付，专注上云与用算力。</p>
      </div>
      <div>
        <h4>本页产品</h4>
        <ul>
          <li><a href="#cloud-solutions">多云对接与各云说明</a></li>
          <li><a href="#why">核心优势</a></li>
          <li><a href="#benefits">专属福利</a></li>
          <li><a href="#process">购买流程</a></li>
          <li><a href="#consult">咨询与报价</a></li>
        </ul>
      </div>
      <div>
        <h4>文档</h4>
        <ul>
          <li><a href="/trinity-ai/docs">文档中心</a></li>
        </ul>
      </div>
      <div>
        <h4>合规与支持</h4>
        <ul>
          <li><a href="#">隐私政策</a></li>
          <li><a href="#">服务条款</a></li>
          <li><a href="#">安全白皮书</a></li>
        </ul>
      </div>
    </div>
    <div class="home-shell home-footer-bottom">© 2026 Trinity. 保留所有权利。</div>
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
  padding-inline: 0;
  box-sizing: border-box;
}

/* 页脚与 index 一致：全宽 + 仅左右 page-gutter，不在此再套 max-width 栏宽 */
main#main > footer.home-footer {
  padding-inline: 0;
  box-sizing: border-box;
}

/* 顶栏：与 index.html .header-row 相同（全宽、左右 var(--page-gutter)），不用 home-max 收窄 */
.home-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border);
}

.home-header-inner {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0 var(--page-gutter);
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-sizing: border-box;
}

.home-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: var(--home-font-body);
  letter-spacing: -0.02em;
  color: var(--text);
  flex-shrink: 0;
}

.home-brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--blue);
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.35);
}

.home-brand-mark svg {
  width: 17px;
  height: 17px;
}

.home-nav-center {
  display: none;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
}

@media (min-width: 900px) {
  .home-nav-center {
    display: flex;
  }
}

.home-nav-dd {
  position: relative;
}

.home-nav-dd-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  font: inherit;
  font-size: var(--home-font-body-sm);
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
}

.home-nav-dd-btn:hover,
.home-nav-dd:focus-within .home-nav-dd-btn {
  background: var(--surface);
  color: var(--text);
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

.home-nav-link {
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius);
  font-size: var(--home-font-body-sm);
  font-weight: 500;
  color: var(--muted);
}

.home-nav-link:hover {
  background: var(--surface);
  color: var(--text);
}

.home-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.home-lang {
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  font: inherit;
  font-size: var(--home-font-caption);
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}

.home-lang:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.home-btn-ghost {
  display: none;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  font: inherit;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  color: var(--blue);
  cursor: pointer;
}

.home-btn-ghost:hover {
  background: var(--blue-soft);
}

@media (min-width: 480px) {
  .home-btn-ghost {
    display: inline-flex;
  }
}

.home-menu-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.home-menu-btn:hover {
  background: var(--surface);
}

@media (min-width: 900px) {
  .home-menu-btn {
    display: none;
  }
}

.home-drawer {
  display: none;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  padding: 0.5rem var(--page-gutter) 1rem;
}

.home-drawer.open {
  display: block;
}

@media (min-width: 900px) {
  .home-drawer {
    display: none !important;
  }
}

.home-drawer a,
.home-drawer button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0;
  font-size: var(--home-font-body-sm);
  font-weight: 500;
  color: var(--muted);
  border: none;
  border-bottom: 1px solid var(--border);
  background: none;
  font-family: inherit;
  cursor: pointer;
}

.home-drawer a:last-of-type,
.home-drawer button:last-of-type {
  border-bottom: none;
}

/* 首屏 Banner */
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
}

.home-hero-grid {
  display: grid;
  gap: 2.25rem 3rem;
  align-items: center;
}

@media (min-width: 960px) {
  .home-hero-grid {
    grid-template-columns: 1fr minmax(360px, 520px);
  }

  .home-hero-left {
    text-align: left;
  }

  .home-hero-stats {
    justify-content: flex-start;
  }

  .home-hero-pills {
    justify-content: flex-start;
  }
}

.home-hero-left {
  text-align: center;
}

.home-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: -30px 0 12px;
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
  font-size: var(--home-font-display);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: var(--text);
}

.home-banner h1 em {
  font-style: normal;
  color: var(--blue);
}

.home-banner-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  margin: 0 auto 1.15rem;
  padding: 0.75rem 50px;
  border-radius: 999px;
  font-size: var(--home-font-body-sm);
  font-weight: 600;
  line-height: 1.45;
  text-align: center;
  white-space: nowrap;
  color: var(--muted);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%);
  border: 1px solid rgba(37, 99, 235, 0.22);
  box-shadow: 0 8px 28px rgba(37, 99, 235, 0.12);
  box-sizing: border-box;
}

@media (min-width: 960px) {
  .home-banner-save {
    margin-left: 0;
    margin-right: 0;
    font-size: var(--home-font-body);
  }
}

.home-banner-action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 1.35rem;
}

.home-banner-sub {
  margin: 0 0 1.25rem;
  max-width: none;
  font-size: var(--home-font-subtitle);
  color: var(--muted);
  line-height: 1.7;
  text-align: left;
}

@media (min-width: 960px) {
  .home-banner-sub {
    margin-bottom: 1.5rem;
    max-width: 44rem;
  }
}

.home-banner-footnote {
  margin: -0.35rem 0 1rem;
  max-width: 38rem;
  font-size: var(--home-font-micro);
  color: var(--muted-2);
  line-height: 1.45;
  text-align: center;
}

@media (min-width: 960px) {
  .home-banner-footnote {
    text-align: left;
    margin-left: 0;
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

/* 首屏 CTA：胶囊按钮，左右 50px，左下对齐 */
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

.home-hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.home-stat-chip {
  min-width: 7.5rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.92);
  text-align: left;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.home-stat-chip b {
  display: block;
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.home-stat-chip span {
  font-size: var(--home-font-micro);
  font-weight: 500;
  color: var(--muted-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.home-stat-chip--accent {
  border-color: rgba(37, 99, 235, 0.35);
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%);
}

.home-stat-chip--accent b {
  color: var(--blue);
}

.home-hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.home-pill {
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  font-size: var(--home-font-caption);
  font-weight: 500;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid var(--border);
}

.home-hero-right {
  display: flex;
  justify-content: center;
}

@media (min-width: 960px) {
  .home-hero-right {
    justify-content: flex-end;
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
  padding-inline: 0;
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 720px) {
  .home-usecase-tablist {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }

  .home-usecase-tab {
    scroll-snap-align: start;
    flex-shrink: 0;
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

.home-usecase-tab {
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  border: none;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--home-font-body);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.home-usecase-tab:hover {
  color: var(--text);
  background: var(--surface-2);
}

.home-usecase-tab:focus-visible {
  outline: 2px solid var(--blue-ring);
  outline-offset: 2px;
}

.home-usecase-tab[aria-selected="true"] {
  background: var(--blue-soft);
  color: var(--blue);
  box-shadow: none;
}

.home-usecase-panel[hidden] {
  display: none !important;
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
  background: var(--surface);
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
  margin-bottom: 0.75rem;
  font-size: var(--home-font-caption);
  font-weight: 600;
  color: var(--muted);
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
  background: var(--surface);
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
  gap: 1.25rem;
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
  max-width: 1320px;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 2.5rem var(--home-why-body-inline) 0;
  box-sizing: border-box;
}

.home-why-highlight {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 50px 1.15rem;
  border-radius: 999px;
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
  gap: 0.35rem 0.6rem;
  margin: 0;
}

.home-why-highlight-label {
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.home-why-highlight-main b {
  font-size: var(--home-font-highlight);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
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
  margin: 0.65rem 0 0;
  max-width: 32rem;
  font-size: var(--home-font-caption);
  line-height: 1.5;
  opacity: 0.9;
}

.home-why-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  max-width: 40rem;
}

.home-why-model {
  display: grid;
  gap: 0.85rem;
}

@media (min-width: 768px) {
  .home-why-model {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}

.home-why-model-card {
  position: relative;
  padding: 1.15rem 1rem 1.1rem;
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

.home-why-advantages {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .home-why-advantages {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

.home-why-adv {
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.home-why-adv:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.12);
}

.home-why-adv-visual {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.home-why-adv-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home-why-adv-visual--svg {
  color: #fff;
}

.home-why-adv-visual--svg svg {
  opacity: 0.9;
}

.home-why-adv-body {
  padding: 1.15rem 1.25rem 1.25rem;
}

.home-why-adv h4 {
  margin: 0 0 0.4rem;
  font-size: var(--home-font-subtitle);
  font-weight: 700;
  color: var(--text);
}

.home-why-adv p {
  margin: 0;
  font-size: var(--home-font-body-sm);
  color: var(--muted);
  line-height: 1.6;
}

.home-why-adv p strong {
  color: var(--text);
  font-weight: 600;
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

/* 页脚简化 */
.home-footer {
  border-top: none;
  padding: 2rem 0;
  background: var(--surface);
  font-size: var(--home-font-caption);
  color: var(--muted);
}

.home-footer-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .home-footer-grid {
    grid-template-columns: 1.6fr 1fr 1fr 1fr;
  }
}

@media (min-width: 700px) and (max-width: 899px) {
  .home-footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.home-footer h4 {
  margin: 0 0 0.5rem;
  font-size: var(--home-font-caption);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-2);
}

.home-footer ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-footer a {
  color: var(--muted);
  display: inline-block;
  padding: 0.2rem 0;
}

.home-footer a:hover {
  color: var(--blue);
}

.home-footer-bottom {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: none;
  text-align: center;
  color: var(--muted-2);
  font-size: var(--home-font-caption);
}

.home-footer .home-shell {
  max-width: none;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  padding-inline: var(--page-gutter);
}


.home-page {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
</style>
