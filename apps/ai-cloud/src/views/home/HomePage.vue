<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { AI_CLOUD_CONSOLE_HASH } from "../account/mock";

defineOptions({ name: "AiCloudHomePage" });

const router = useRouter();
const pageRef = ref<HTMLElement | null>(null);

const authVisible = ref(false);
const authSignup = ref(false);
const authTitle = computed(() => (authSignup.value ? "创建账号" : "欢迎回来"));
const authSub = computed(() =>
  authSignup.value
    ? "注册企业账号以开通服务并获取方案与报价"
    : "使用企业账号登录"
);
const authSubmitLabel = computed(() => (authSignup.value ? "注册" : "登录"));

function setBodyModal(open: boolean) {
  document.body.classList.toggle("or-modal-open", open);
}

function openAuthModal(signup = false) {
  authSignup.value = signup;
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

function onAuthSubmit(e: Event) {
  e.preventDefault();
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

  const closeBtn = root.querySelector("#home-login-close");
  const backdrop = root.querySelector("#home-login-backdrop");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeAuthModal);
    cleanups.push(() => closeBtn.removeEventListener("click", closeAuthModal));
  }
  if (backdrop) {
    const fn = (e: Event) => {
      if (e.target === backdrop) closeAuthModal();
    };
    backdrop.addEventListener("click", fn);
    cleanups.push(() => backdrop.removeEventListener("click", fn));
  }

  const onEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && authVisible.value) closeAuthModal();
  };
  document.addEventListener("keydown", onEscape);
  cleanups.push(() => document.removeEventListener("keydown", onEscape));

  const googleBtn = root.querySelector("#home-auth-google");
  const githubBtn = root.querySelector("#home-auth-github");
  [googleBtn, githubBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", oauthToConsole);
    cleanups.push(() => btn.removeEventListener("click", oauthToConsole));
  });

  const form = root.querySelector("#home-auth-form");
  if (form) {
    form.addEventListener("submit", onAuthSubmit);
    cleanups.push(() => form.removeEventListener("submit", onAuthSubmit));
  }

  const forgotLink = root.querySelector("#home-auth-forgot");
  if (forgotLink) {
    const fn = (e: Event) => e.preventDefault();
    forgotLink.addEventListener("click", fn);
    cleanups.push(() => forgotLink.removeEventListener("click", fn));
  }

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
          <a href="#cloud" role="menuitem">AI 云能力总览</a>
          <a href="#cloud-solutions" role="menuitem">多云对接与各云说明</a>
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
    <span style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--muted-2); padding: 0.35rem 0">AI 云</span>
    <a href="#cloud">能力总览</a>
    <a href="#cloud-solutions">多云对接与各云说明</a>
    <a href="/trinity-ai">Trinity AI</a>
    <button type="button" id="home-drawer-login">登录</button>
    <button type="button" id="home-drawer-register">注册</button>
  </div>
</header>

<div id="home-login-modal-root" class="or-modal-root" :hidden="!authVisible" :aria-hidden="authVisible ? 'false' : 'true'">
  <div class="or-modal-backdrop" id="home-login-backdrop" tabindex="-1"></div>
  <div class="or-modal-card or-auth-modal" role="dialog" aria-modal="true" aria-labelledby="home-auth-title">
    <button type="button" class="or-modal-close" id="home-login-close" aria-label="关闭">&times;</button>
    <div class="or-auth-head">
      <h2 class="or-auth-head-title" id="home-auth-title">{{ authTitle }}</h2>
      <p class="or-auth-head-sub" id="home-auth-sub">{{ authSub }}</p>
    </div>
    <div class="or-oauth-row">
      <button type="button" class="or-oauth-btn" id="home-auth-google" title="使用 Google 账号继续" aria-label="Google 登录">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google 登录
      </button>
      <button type="button" class="or-oauth-btn" id="home-auth-github" title="使用 GitHub 账号继续" aria-label="GitHub 登录">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M12 1C5.92 1 1 5.92 1 12c0 4.87 3.16 8.99 7.55 10.45.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.86-3.06.67-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.44-.28-5-1.22-5-5.45 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.39.11-2.9 0 0 .92-.3 3.03 1.13.88-.25 1.82-.37 2.76-.37.94 0 1.88.12 2.76.37 2.11-1.43 3.03-1.13 3.03-1.13.6 1.51.22 2.62.11 2.9.7.77 1.13 1.76 1.13 2.96 0 4.24-2.57 5.17-5.02 5.44.39.34.74 1.01.74 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.75.53C19.84 20.99 23 16.87 23 12 23 5.92 18.08 1 12 1z"
          />
        </svg>
        GitHub 登录
      </button>
    </div>
    <div class="or-auth-divider" role="separator">或者使用邮箱</div>
    <form id="home-auth-form" novalidate>
      <div class="form-group">
        <label for="home-auth-email">邮箱或用户名</label>
        <input id="home-auth-email" type="text" autocomplete="username" placeholder="name@example.com" required />
      </div>
      <div class="form-group">
        <div class="or-auth-label-row">
          <label for="home-auth-password">密码</label>
          <a href="#" class="or-auth-forgot" id="home-auth-forgot">忘记密码？</a>
        </div>
        <input id="home-auth-password" type="password" autocomplete="current-password" placeholder="••••••••" required />
      </div>
      <label class="or-auth-remember">
        <input type="checkbox" id="home-auth-remember" />
        记住我
      </label>
      <button type="submit" class="or-auth-login-btn" id="home-auth-submit">{{ authSubmitLabel }}</button>
      <p class="or-auth-hint">请妥善保管账号与密码，勿在公共设备保存登录状态。</p>
      <div class="or-auth-foot" id="home-auth-foot-signin" v-show="!authSignup">
        <span class="or-auth-foot-muted">还没有账号？</span>
        <a href="#" data-or-open-signup="1" class="or-auth-foot-link">立即注册</a>
      </div>
      <div class="or-auth-foot" id="home-auth-foot-signup" v-show="authSignup">
        <span class="or-auth-foot-muted">已有账号？</span>
        <button type="button" class="or-auth-foot-link" id="home-auth-to-signin">立即登录</button>
      </div>
    </form>
  </div>
</div>

<main id="main">
  <section class="home-banner" aria-label="首屏">
    <div class="home-banner-bg" aria-hidden="true"></div>
    <div class="home-banner-grid" aria-hidden="true"></div>
    <div class="home-banner-inner home-shell">
      <div class="home-hero-grid">
        <div class="home-hero-left">
          <p class="home-eyebrow"><span class="home-eyebrow-dot" aria-hidden="true"></span> 企业级多云 AI 算力与服务</p>
          <h1><em>Trinity AI 云</em></h1>
          <p class="home-banner-sub">
            纳管阿里云、腾讯云、华为云、AWS、Google Cloud 等主流公有云账号与 GPU / 推理资源池，提供算力编排、弹性配额、成本分账与合规审计能力，助力企业专注上云与用算力。
          </p>
          <div class="home-banner-cta">
            <a href="#consult" class="btn btn-gradient">立即咨询</a>
            <a href="#promo" class="home-btn-outline-light">查看折扣</a>
            <a href="#cloud-solutions" class="btn">云产品说明</a>
          </div>
          <div class="home-hero-stats" aria-label="平台关键指标">
            <div class="home-stat-chip"><b>12+</b><span>公有云区域接入</span></div>
            <div class="home-stat-chip"><b>99.95%</b><span>算力池可用性目标</span></div>
            <div class="home-stat-chip"><b>5K+</b><span>GPU 卡时 / 日</span></div>
            <div class="home-stat-chip"><b>8</b><span>自建与托管地域节点</span></div>
          </div>
          <div class="home-hero-pills" aria-label="能力标签">
            <span class="home-pill">多云账号纳管</span>
            <span class="home-pill">GPU 弹性配额</span>
            <span class="home-pill">专线 / VPC 互联</span>
            <span class="home-pill">账单分账与审计</span>
          </div>
        </div>
        <div class="home-hero-right">
          <div class="home-preview-card" aria-hidden="true">
            <div class="home-preview-head">
              <span>云控制台 · 账号与账单</span>
              <span class="home-preview-badge">账单日更</span>
            </div>
            <div class="home-preview-body">
              <div class="home-preview-kpis">
                <div class="home-preview-kpi"><div class="v">6</div><div class="l">已纳管主账号</div></div>
                <div class="home-preview-kpi"><div class="v">¥42.8w</div><div class="l">本月预估消费</div></div>
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
                  <span><span class="home-preview-dot home-preview-dot--a" aria-hidden="true"></span>阿里云 38%</span>
                  <span><span class="home-preview-dot home-preview-dot--b" aria-hidden="true"></span>腾讯云 28%</span>
                  <span><span class="home-preview-dot home-preview-dot--c" aria-hidden="true"></span>华为云 22%</span>
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

  <div class="home-overlap">
    <div class="home-overlap-inner">
      <div class="home-overlap-grid">
        <a class="home-overlap-item" href="#cloud-solutions">
          <strong>各云对接说明</strong>
          <span>主流公有云按标签查看对接能力与交付边界</span>
        </a>
        <a class="home-overlap-item" href="#arch">
          <strong>架构与合规</strong>
          <span>接入、编排、成本与审计分层设计</span>
        </a>
        <a class="home-overlap-item" href="#promo">
          <strong>商务折扣</strong>
          <span>算力券与年度框架</span>
        </a>
        <a class="home-overlap-item" href="#consult">
          <strong>上云与交付</strong>
          <span>迁移评估、网络规划与专人交付</span>
        </a>
      </div>
    </div>
  </div>

  <section class="home-usecase" id="cloud-solutions" aria-labelledby="home-usecase-heading">
    <div class="home-shell" id="home-cloud-tabs">
      <p class="home-usecase-kicker" id="home-usecase-heading">已支持对接的主流公有云</p>

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

  <section class="home-section is-tight-top" id="cloud" aria-labelledby="cloud-h">
    <div class="home-shell">
      <h2 id="cloud-h">AI 云服务</h2>
      <p class="home-section-lead">
        面向企业 IT 与平台团队：在阿里云、腾讯云、华为云、AWS、Google Cloud 等主流公有云上，统一纳管 AI 推理与 GPU 算力资源，提供配额调度、成本分账与合规留痕，支撑从接入到持续运营的全链路治理。
      </p>
      <div class="home-cards">
        <article class="home-card">
          <div class="home-card-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
          </div>
          <h3>多云纳管</h3>
          <p>统一接入多家云主账号与子账号，资源目录、标签与权限边界一致治理。</p>
        </article>
        <article class="home-card">
          <div class="home-card-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h3>GPU 与弹性算力</h3>
          <p>推理实例模板、弹性伸缩与队列优先级，按业务峰谷自动扩缩 GPU 资源池。</p>
        </article>
        <article class="home-card">
          <div class="home-card-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3>云成本与分账</h3>
          <p>按云账号、项目、部门拆分账单，预算告警与预留实例建议，降低闲置与超支风险。</p>
        </article>
        <article class="home-card">
          <div class="home-card-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3>安全与合规</h3>
          <p>密钥与数据分级策略、审计日志与导出，满足金融与政务类采购要求。</p>
        </article>
      </div>
    </div>
  </section>

  <section class="home-section alt" id="arch" aria-labelledby="arch-h">
    <div class="home-shell">
      <h2 id="arch-h">我们的架构优势</h2>
      <p class="home-section-lead">从云账号到算力交付的分层设计，突出高可用、可审计与弹性扩展。</p>
      <div class="home-arch">
        <div class="home-arch-diagram" aria-hidden="true">
          <div class="home-arch-row">公有云账号与网络接入层（API / 专线 / VPC）</div>
          <div class="home-arch-arrow">↓</div>
          <div class="home-arch-row">资源编排与 GPU 算力池层（模板、队列、伸缩）</div>
          <div class="home-arch-arrow">↓</div>
          <div class="home-arch-row">成本、配额与合规审计层（账单、告警、留痕）</div>
        </div>
        <div>
          <p class="home-arch-note">
            <strong>高可用：</strong>多地域算力池与健康检查，故障域隔离与分钟级切换预案。<br /><br />
            <strong>可审计：</strong>资源变更、配额调整与账单导出全链路留痕，满足内控与等保测评材料需求。<br /><br />
            <strong>弹性扩展：</strong>按队列与优先级横向扩容 GPU 节点，峰值过后自动回收。
          </p>
        </div>
      </div>
      <div class="home-arch-highlights">
        <div class="home-arch-hl">
          <strong>多活容灾</strong>
          多地域部署与健康检查，故障域隔离，分钟级切换。
        </div>
        <div class="home-arch-hl">
          <strong>成本可视</strong>
          按云账号、项目与部门维度拆分账单，支持预算告警与预留容量建议。
        </div>
        <div class="home-arch-hl">
          <strong>企业集成</strong>
          对接企业 IAM、CMDB 与工单系统；变更 Webhook 同步至运维平台。
        </div>
      </div>
    </div>
  </section>

  <section class="home-section" id="promo" aria-labelledby="promo-h">
    <div class="home-shell">
      <h2 id="promo-h">限时优惠 / 折扣活动</h2>
      <p class="home-section-lead">面向新用户与企业客户的算力与套餐方案，具体权益与价格以商务合同及官网公示为准。</p>
      <div class="home-promo-grid">
        <div class="home-promo">
          <div>
            <h3>新用户首月抵扣</h3>
            <p>完成企业认证即可获得算力抵扣券；大额合约可叠加上云架构咨询与迁移工时包。</p>
            <span class="home-promo-badge">限时礼遇</span>
          </div>
          <div>
            <a href="#consult" class="btn btn-gradient">联系销售</a>
          </div>
        </div>
        <div class="home-promo home-promo--slate">
          <div>
            <h3>企业年度框架</h3>
            <p>承诺年度 GPU 卡时或云消费规模享阶梯折扣；含专属技术支持与季度容量复盘。</p>
            <span class="home-promo-badge" style="background: var(--text)">企业专享</span>
          </div>
          <div>
            <a href="#consult" class="btn">获取报价单</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="home-section alt" id="consult" aria-labelledby="consult-h">
    <div class="home-shell">
      <h2 id="consult-h">获取专属咨询</h2>
      <p class="home-section-lead">留下联系方式，我们将在 1～2 个工作日内与您沟通方案与报价。</p>
      <form class="home-form" id="home-consult-form">
        <div class="home-form-row">
          <label for="c-name">姓名</label>
          <input id="c-name" type="text" name="name" autocomplete="name" placeholder="您的称呼" />
        </div>
        <div class="home-form-row">
          <label for="c-email">工作邮箱</label>
          <input id="c-email" type="email" name="email" autocomplete="email" placeholder="name@company.com" />
        </div>
        <div class="home-form-row">
          <label for="c-co">公司 / 团队</label>
          <input id="c-co" type="text" name="company" autocomplete="organization" placeholder="选填" />
        </div>
        <div class="home-form-row">
          <label for="c-msg">需求简述</label>
          <textarea id="c-msg" name="message" placeholder="例如：目标地域、GPU 型号与卡数、峰值并发、合规等级、是否需专线等"></textarea>
        </div>
        <button type="submit" class="btn btn-gradient" style="margin-top: 0.25rem">提交咨询</button>
      </form>
    </div>
  </section>

  <footer class="home-footer">
    <div class="home-shell home-footer-grid">
      <div>
        <strong style="color: var(--text); font-size: 0.9375rem">Trinity AI 云</strong>
        <p style="margin: 0.5rem 0 0; max-width: 22rem">多云 AI 算力纳管与企业级交付，专注上云与用算力。</p>
      </div>
      <div>
        <h4>本页产品</h4>
        <ul>
          <li><a href="#cloud">AI 云能力</a></li>
          <li><a href="#cloud-solutions">多云对接与各云说明</a></li>
          <li><a href="#arch">架构与合规</a></li>
          <li><a href="#promo">折扣活动</a></li>
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
  --home-banner-min: min(76vh, 700px);
  /* 顶栏/页脚/抽屉左右与 index 一致：用 mvp 的 --page-gutter；main 内正文区块 15%（见 docs/Trinity原型版式与视觉规范.md） */
  --home-content-inline: 15%;
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

main#main > .home-overlap {
  padding-inline: var(--home-content-inline);
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
  font-size: 1rem;
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
  font-size: 0.875rem;
  font-weight: 500;
}

.home-nav-dd-panel a:hover {
  background: var(--surface-2);
}

.home-nav-link {
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
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
  font-size: 0.75rem;
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
  font-size: 0.875rem;
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
  font-size: 0.875rem;
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
  padding: 1.5rem 0 1.25rem;
}

.home-hero-grid {
  display: grid;
  gap: 2rem 2.5rem;
  align-items: center;
}

@media (min-width: 960px) {
  .home-hero-grid {
    grid-template-columns: 1fr minmax(300px, 400px);
  }

  .home-hero-left {
    text-align: left;
  }

  .home-banner-cta {
    justify-content: flex-start;
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
  gap: 0.4rem;
  margin: -30px 0 10px;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--pill-text);
  background: var(--blue-soft);
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.home-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.home-banner h1 {
  margin: 0 0 0.85rem;
  font-size: clamp(1.95rem, 4.2vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.12;
  color: var(--text);
}

.home-banner h1 em {
  font-style: normal;
  color: var(--blue);
}

.home-banner-sub {
  margin: calc(0.75rem + 30px) auto 1.95rem;
  max-width: 32rem;
  font-size: 1rem;
  color: var(--muted);
  line-height: 1.65;
}

@media (min-width: 960px) {
  .home-banner-sub {
    margin-top: calc(1rem + 30px);
    margin-bottom: 2.2rem;
    margin-left: 0;
    margin-right: 0;
    max-width: 38rem;
  }
}

.home-banner-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
  margin-bottom: 1.35rem;
}

/* 首屏三按钮：统一高度与 1px 边框（.btn 40px / 渐变无边框 与 outline 44px 不一致） */
.home-banner-cta > a {
  box-sizing: border-box;
  min-height: 44px;
  height: 44px;
  padding: 0 1.25rem;
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
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.home-stat-chip span {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--muted-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  font-size: 0.75rem;
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
  max-width: 400px;
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
  padding: 0.65rem 0.85rem;
  background: linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%);
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}

.home-preview-badge {
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  font-size: 0.625rem;
  font-weight: 700;
  background: #ecfdf5;
  color: #047857;
}

.home-preview-body {
  padding: 0.85rem 0.85rem 1rem;
}

.home-preview-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.home-preview-kpi {
  padding: 0.45rem 0.5rem;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
}

.home-preview-kpi .v {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text);
}

.home-preview-kpi .l {
  font-size: 0.625rem;
  color: var(--muted-2);
  margin-top: 0.1rem;
}

/* 首屏预览卡：账单 / 消费示意（非资源拓扑） */
.home-preview-chart {
  margin-bottom: 0.65rem;
  padding: 0.5rem 0.45rem 0.45rem;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.home-preview-chart-cap {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.45rem;
}

.home-preview-stack {
  display: flex;
  height: 12px;
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
  gap: 0.3rem 0.45rem;
  margin-top: 0.45rem;
  font-size: 0.5625rem;
  color: var(--muted);
}

.home-preview-legend span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.home-preview-dot {
  width: 6px;
  height: 6px;
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
  font-size: 0.6875rem;
  color: var(--muted);
}

.home-preview-row {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
  border-top: 1px solid var(--border);
}

.home-preview-row:first-child {
  border-top: none;
  padding-top: 0;
}

.home-preview-row code {
  font-size: 0.65rem;
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
  max-width: var(--home-max);
  margin: 0 auto;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: none;
  background: var(--surface);
  box-shadow: none;
}

.home-overlap-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

@media (min-width: 720px) {
  .home-overlap-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.home-overlap-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem 0.65rem;
  border-radius: var(--radius);
  border: none;
  background: var(--bg);
  text-decoration: none;
  color: inherit;
  transition: background 0.18s ease;
}

.home-overlap-item:hover {
  background: var(--surface-2);
}

.home-overlap-item strong {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text);
}

.home-overlap-item span {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.4;
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
  font-size: 0.875rem;
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

.home-usecase-kicker {
  margin: 0 0 1.5rem;
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-2);
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

.home-usecase-tab {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  background: var(--surface);
  color: var(--muted);
  font: inherit;
  font-size: 0.8125rem;
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
    font-size: 0.9375rem;
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
  font-size: 0.75rem;
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
  font-size: 0.625rem;
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
  font-size: 1.2rem;
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
  font-size: 0.875rem;
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
  font-size: 0.875rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}

.home-usecase-cta:hover {
  background: var(--blue-soft);
}

/* 通用区块 */
.home-section {
  padding: 3rem 0;
  border-top: 1px solid var(--border);
}

.home-section.is-tight-top {
  padding-top: 2.25rem;
}

.home-section.alt {
  background: var(--surface);
}

.home-section h2 {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.home-section-lead {
  margin: 0 0 1.75rem;
  max-width: 40rem;
  font-size: 0.9375rem;
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
  font-size: 1rem;
  font-weight: 700;
}

.home-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted);
  line-height: 1.55;
}

/* 架构 */
.home-arch {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}

@media (min-width: 900px) {
  .home-arch {
    grid-template-columns: 1fr 1fr;
  }
}

.home-arch-diagram {
  padding: 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 0.8125rem;
}

.home-arch-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: var(--radius);
  background: var(--surface-2);
  font-weight: 600;
  color: var(--text);
}

.home-arch-row:last-child {
  margin-bottom: 0;
}

.home-arch-arrow {
  text-align: center;
  color: var(--muted-2);
  font-size: 0.75rem;
  padding: 0.15rem 0;
}

.home-arch-note {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted);
  line-height: 1.6;
}

.home-arch-note strong {
  color: var(--text);
}

.home-arch-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1.35rem;
}

@media (max-width: 640px) {
  .home-arch-highlights {
    grid-template-columns: 1fr;
  }
}

.home-arch-hl {
  padding: 0.85rem 0.9rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 0.8125rem;
  color: var(--muted);
  line-height: 1.5;
}

.home-arch-hl strong {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text);
}

/* 优惠 */
.home-promo-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .home-promo-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.home-promo {
  padding: 1.75rem 1.5rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.06) 100%);
  border: 1px solid rgba(37, 99, 235, 0.2);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.home-promo--slate {
  background: linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%);
  border-color: var(--border-strong);
}

.home-promo h3 {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.home-promo p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted);
}

.home-promo-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 700;
  background: var(--blue);
  color: #fff;
}

/* 咨询表单 */
.home-form {
  max-width: 32rem;
}

.home-form-row {
  margin-bottom: 1rem;
}

.home-form-row label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted);
}

.home-form-row input,
.home-form-row textarea {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 0.9375rem;
}

.home-form-row textarea {
  min-height: 100px;
  resize: vertical;
}

.home-form-row input:focus,
.home-form-row textarea:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-ring);
}

/* 页脚简化 */
.home-footer {
  border-top: 1px solid var(--border);
  padding: 2rem 0;
  background: var(--surface);
  font-size: 0.8125rem;
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
  font-size: 0.75rem;
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
  border-top: 1px solid var(--border);
  text-align: center;
  color: var(--muted-2);
  font-size: 0.75rem;
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
