/**
 * Trinity AI 应用壳（原 mvp-or-shell.js）：OpenRouter 风格顶栏注入、主题、用户菜单、登录相关与移动抽屉。
 * Expects <header class="or-inject" data-or-page="home|models|chat|docs|console"></header>
 * HTML 位于 app/、account/ 子目录时，导航链接自动加 ../ 指向 TrinityAI 根下页面路径（见 orPathPrefix）；共享脚本与样式在 static/。品牌行链至 TrinityCloud/home.html（与 index.html 顶栏一致，见 suiteHomeHref）。
 */
(function () {
  "use strict";

  var STORAGE_SESSION = "trinity_or_session";
  var STORAGE_REMEMBER = "trinity_or_remember";
  var STORAGE_THEME = "trinity_or_theme";
  var STORAGE_UI_LANG = "trinity_ui_lang";

  function getUiLang() {
    try {
      var v = localStorage.getItem(STORAGE_UI_LANG);
      if (v === "en" || v === "zh") return v;
    } catch (e0) {}
    return "zh";
  }

  function uiLangLabelText() {
    return getUiLang() === "en" ? "English" : "简体中文";
  }

  function uiLangTitleText() {
    return getUiLang() === "en" ? "Language" : "语言";
  }

  function uiLangAria() {
    return getUiLang() === "en" ? "Switch language" : "切换语言";
  }

  function syncDocumentLangAttr() {
    try {
      document.documentElement.lang = getUiLang() === "en" ? "en" : "zh-CN";
    } catch (e1) {}
  }

  function bootTheme() {
    try {
      var t = localStorage.getItem(STORAGE_THEME);
      if (t === "light" || t === "dark") {
        document.documentElement.setAttribute("data-theme", t);
        return;
      }
      if (t === "system" || !t) {
        document.documentElement.setAttribute("data-theme", "system");
      }
    } catch (e) {
      /* ignore */
    }
  }

  bootTheme();

  function isLoggedIn() {
    try {
      return localStorage.getItem(STORAGE_SESSION) === "1";
    } catch (e) {
      return false;
    }
  }

  function setLoggedIn(v) {
    try {
      if (v) localStorage.setItem(STORAGE_SESSION, "1");
      else localStorage.removeItem(STORAGE_SESSION);
    } catch (e) {
      /* ignore */
    }
    syncAuthChrome();
  }

  function navClass(page, target) {
    return page === target ? ' class="is-active"' : "";
  }

  /** 页面位于 app / account 下（含 app/chat/ 等子模块）时，指向 TrinityAI 根下资源的相对前缀 */
  function orPathPrefix() {
    try {
      var path = (window.location.pathname || "").replace(/\\/g, "/");
      if (/\/account\//i.test(path)) {
        var afterAc = (path.split(/\/account\//i)[1] || "").split("/").filter(Boolean);
        return new Array(afterAc.length + 1).join("../");
      }
      if (/\/app\//i.test(path)) {
        var afterApp = (path.split(/\/app\//i)[1] || "").split("/").filter(Boolean);
        return new Array(afterApp.length + 1).join("../");
      }
    } catch (e1) {}
    return "";
  }

  function H(rel) {
    return orPathPrefix() + String(rel).replace(/^\//, "");
  }

  /** 套件门户 Trinity Cloud（与 TrinityAI 同级目录） */
  function suiteHomeHref() {
    try {
      var path = (window.location.pathname || "").replace(/\\/g, "/");
      if (/\/TrinityAI_Admin\//i.test(path)) {
        return "../TrinityCloud/home.html";
      }
      if (/\/app\//i.test(path)) {
        var afterApp = (path.split(/\/app\//i)[1] || "").split("/").filter(Boolean);
        var d = afterApp.length;
        return new Array(d + 2).join("../") + "TrinityCloud/home.html";
      }
      if (/\/account\//i.test(path)) {
        var afterAc = (path.split(/\/account\//i)[1] || "").split("/").filter(Boolean);
        var d2 = afterAc.length;
        return new Array(d2 + 2).join("../") + "TrinityCloud/home.html";
      }
    } catch (e0) {}
    return "../TrinityCloud/home.html";
  }

  function buildHeader(page) {
    var p = page || "home";
    return (
      '<div class="header-row">' +
      '<div class="header-brand-cluster">' +
      '<a href="' +
      suiteHomeHref() +
      '" class="brand-row" aria-label="Trinity AI 云首页">' +
      '<span class="brand-mark" aria-hidden="true">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 2l1.2 4.5L18 8l-4.8 1.5L12 14l-1.2-4.5L6 8l4.8-1.5L12 2zM19 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L19 14zM5 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L5 14z" fill="currentColor"/>' +
      "</svg></span>Trinity AI</a>" +
      "</div>" +
      '<div class="header-end">' +
      '<nav class="primary or-ornav" aria-label="主导航">' +
      '<a href="' +
      H("index.html") +
      '"' +
      navClass(p, "home") +
      ">首页</a>" +
      '<a href="' +
      H("app/models.html") +
      '"' +
      navClass(p, "models") +
      ">模型</a>" +
      '<a href="' +
      H("app/chat/index.html") +
      '"' +
      navClass(p, "chat") +
      ">对话</a>" +
      '<a href="' +
      H("app/docs.html") +
      '"' +
      navClass(p, "docs") +
      ">文档</a>" +
      "</nav>" +
      '<div class="or-header-actions">' +
      '<button type="button" class="or-lang-btn" id="or-lang-btn" title="' +
      uiLangTitleText() +
      '" aria-label="' +
      uiLangAria() +
      '">' +
      '<svg class="or-lang-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 8l6 6m-7 0l6-6l2-3M2 5h12M7 2h1m14 20l-5-10l-5 10m2-4h6"></path>' +
      "</svg>" +
      '<span class="or-lang-label">' +
      uiLangLabelText() +
      "</span></button>" +
      '<span class="or-header-rule or-header-rule--after-lang" aria-hidden="true"></span>' +
      '<div class="or-guest-cluster" id="or-guest-cluster">' +
      '<button type="button" class="btn btn-gradient or-login-pill" id="or-signin-btn">登录</button>' +
      "</div>" +
      '<div class="or-user-wrap" id="or-user-wrap" hidden>' +
      '<button type="button" class="or-user-trigger" id="or-user-trigger" aria-expanded="false" aria-haspopup="true" aria-controls="or-user-menu" aria-label="账户菜单">' +
      '<span class="or-user-avatar" aria-hidden="true">P</span>' +
      '<svg class="or-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      "</button>" +
      '<div class="or-user-menu" id="or-user-menu" role="menu" hidden>' +
      '<div class="or-user-menu-head">' +
      '<span class="or-user-avatar sm" aria-hidden="true">P</span>' +
      '<span class="or-user-menu-title">账户</span>' +
      '<button type="button" class="or-icon-btn" id="or-prefs-gear" title="角色管理" aria-label="角色管理">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' +
      "</button></div>" +
      '<div class="or-menu-group-label" role="presentation">工作区</div>' +
      '<a class="or-menu-item" role="menuitem" href="' +
      H("account/console.html#keys") +
      '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg><span>API 密钥</span></a>' +
      '<a class="or-menu-item" role="menuitem" href="' +
      H("account/console.html#preset") +
      '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg><span>角色管理</span></a>' +
      '<div class="or-menu-group-label" role="presentation">账户</div>' +
      '<a class="or-menu-item" role="menuitem" href="' +
      H("account/console.html#credits") +
      '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg><span>额度</span></a>' +
      '<a class="or-menu-item" role="menuitem" href="' +
      H("account/console.html#activity") +
      '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 19V5M9 19v-7M14 19V9M19 19v-4"/></svg><span>活动</span></a>' +
      '<a class="or-menu-item" role="menuitem" href="' +
      H("account/console.html#logs") +
      '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg><span>用量</span></a>' +
      '<button type="button" class="or-menu-item danger" role="menuitem" id="or-signout-btn">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg><span>退出登录</span></button>' +
      '<div class="or-theme-bar" role="group" aria-label="主题">' +
      '<button type="button" class="or-theme-seg" data-theme-pick="light" title="浅色" aria-label="浅色模式"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button>' +
      '<button type="button" class="or-theme-seg" data-theme-pick="dark" title="深色" aria-label="深色模式"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button>' +
      '<button type="button" class="or-theme-seg" data-theme-pick="system" title="跟随系统" aria-label="跟随系统"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></button>' +
      "</div></div></div></div>" +
      '<button type="button" class="menu-toggle" id="menu-btn" aria-expanded="false" aria-controls="drawer" aria-label="打开菜单">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
      "</button></div></div>" +
      '<div class="mobile-drawer" id="drawer">' +
      '<a href="' +
      H("index.html") +
      '"' +
      navClass(p, "home") +
      ">首页</a>" +
      '<a href="' +
      H("app/models.html") +
      '"' +
      navClass(p, "models") +
      ">模型</a>" +
      '<a href="' +
      H("app/chat/index.html") +
      '"' +
      navClass(p, "chat") +
      ">对话</a>" +
      '<a href="' +
      H("app/docs.html") +
      '"' +
      navClass(p, "docs") +
      ">文档</a>" +
      '<button type="button" class="or-drawer-signin" id="or-drawer-signin">登录</button>' +
      "</div>"
    );
  }

  function buildModal() {
    return (
      '<div class="or-modal-root" id="or-auth-modal-root" hidden>' +
      '<div class="or-modal-backdrop" id="or-auth-backdrop" tabindex="-1"></div>' +
      '<div class="or-modal-card or-auth-modal" role="dialog" aria-modal="true" aria-labelledby="or-auth-title">' +
      '<button type="button" class="or-modal-close" id="or-auth-close" aria-label="关闭">&times;</button>' +
      '<div class="or-auth-head">' +
      '<h2 class="or-auth-head-title" id="or-auth-title">欢迎回来</h2>' +
      '<p class="or-auth-head-sub" id="or-auth-sub">使用您的账号登录 Trinity AI</p>' +
      "</div>" +
      '<div class="or-auth-tabs or-auth-tabs--segmented" role="tablist" aria-label="登录或注册">' +
      '<button type="button" class="or-auth-tab is-active" id="or-auth-tab-signin" role="tab" aria-selected="true" data-or-auth-tab="signin">登录</button>' +
      '<button type="button" class="or-auth-tab" id="or-auth-tab-signup" role="tab" aria-selected="false" data-or-auth-tab="signup">注册</button>' +
      "</div>" +
      '<div class="or-auth-oauth-wrap" id="or-auth-oauth-wrap">' +
      '<div class="or-oauth-row">' +
      '<button type="button" class="or-oauth-btn" id="or-auth-google" title="演示登录（未连接）" aria-label="Google 登录（演示）">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>' +
      "Google 登录</button>" +
      '<button type="button" class="or-oauth-btn" id="or-auth-github" title="演示登录（未连接）" aria-label="GitHub 登录（演示）">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1C5.92 1 1 5.92 1 12c0 4.87 3.16 8.99 7.55 10.45.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.86-3.06.67-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.44-.28-5-1.22-5-5.45 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.39.11-2.9 0 0 .92-.3 3.03 1.13.88-.25 1.82-.37 2.76-.37.94 0 1.88.12 2.76.37 2.11-1.43 3.03-1.13 3.03-1.13.6 1.51.22 2.62.11 2.9.7.77 1.13 1.76 1.13 2.96 0 4.24-2.57 5.17-5.02 5.44.39.34.74 1.01.74 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.75.53C19.84 20.99 23 16.87 23 12 23 5.92 18.08 1 12 1z"/></svg>' +
      "GitHub 登录</button>" +
      "</div>" +
      '<div class="or-auth-divider" role="separator">或者使用邮箱</div>' +
      "</div>" +
      '<div id="or-auth-panel-signin" class="or-auth-panel" role="tabpanel" aria-labelledby="or-auth-tab-signin">' +
      '<form class="or-auth-form" id="or-auth-form-signin" novalidate>' +
      '<div class="form-group"><label for="or-auth-email">邮箱或用户名</label><input id="or-auth-email" type="text" autocomplete="username" placeholder="name@example.com" required /></div>' +
      '<div class="form-group"><div class="or-auth-label-row"><label for="or-auth-password">密码</label><a href="#" class="or-auth-forgot" id="or-auth-forgot">忘记密码？</a></div><input id="or-auth-password" type="password" autocomplete="current-password" placeholder="••••••••" required /></div>' +
      '<label class="or-auth-remember"><input type="checkbox" id="or-auth-remember" />记住我</label>' +
      '<button type="submit" class="or-auth-login-btn">登录</button>' +
      '<p class="or-auth-hint">静态演示，不会向服务器发送任何数据。</p>' +
      '<div class="or-auth-foot" id="or-auth-foot-signin">' +
      '<span class="or-auth-foot-muted">还没有账号？</span>' +
      '<button type="button" class="or-auth-foot-link" id="or-auth-to-signup">立即注册</button>' +
      "</div>" +
      "</form>" +
      "</div>" +
      '<div id="or-auth-panel-signup" class="or-auth-panel or-auth-panel--signup" role="tabpanel" aria-labelledby="or-auth-tab-signup" hidden>' +
      '<form class="or-auth-form or-auth-form-signup" id="or-auth-form-signup" novalidate>' +
      '<div class="or-auth-signup-card">' +
      '<div class="or-auth-server-head">' +
      '<span class="or-auth-server-head-label">账号信息</span>' +
      '<a href="#" class="or-auth-server-head-link" id="or-auth-reg-help" title="帮助" aria-label="注册帮助">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>' +
      "</a></div>" +
      '<div class="or-auth-server-row">' +
      '<div class="or-auth-server-row-inner">' +
      '<span class="or-auth-server-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg></span>' +
      '<div class="or-auth-server-body">' +
      '<strong class="or-auth-server-title">邮箱</strong>' +
      '<span class="or-auth-server-desc">用于登录与找回密码</span>' +
      '<input id="or-auth-reg-email" class="or-auth-server-input" type="email" autocomplete="email" placeholder="name@example.com" required />' +
      "</div>" +
      '<span class="or-auth-server-chevron" aria-hidden="true">›</span>' +
      "</div></div>" +
      '<div class="or-auth-server-row">' +
      '<div class="or-auth-server-row-inner">' +
      '<span class="or-auth-server-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>' +
      '<div class="or-auth-server-body">' +
      '<strong class="or-auth-server-title">密码</strong>' +
      '<span class="or-auth-server-desc">至少 8 位，建议含大小写、数字与符号</span>' +
      '<span class="or-auth-server-meta">强度 · <span id="or-auth-strength-text">—</span></span>' +
      '<input id="or-auth-reg-password" class="or-auth-server-input" type="password" autocomplete="new-password" placeholder="输入密码" required />' +
      '<div class="or-auth-strength or-auth-strength--signup" aria-live="polite">' +
      '<div class="or-auth-strength-track"><div class="or-auth-strength-fill" id="or-auth-strength-fill"></div></div>' +
      "</div></div>" +
      '<span class="or-auth-server-chevron" aria-hidden="true">›</span>' +
      "</div></div>" +
      '<div class="or-auth-server-row">' +
      '<div class="or-auth-server-row-inner">' +
      '<span class="or-auth-server-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></span>' +
      '<div class="or-auth-server-body">' +
      '<strong class="or-auth-server-title">确认密码</strong>' +
      '<span class="or-auth-server-desc">须与上一栏密码一致</span>' +
      '<input id="or-auth-reg-password2" class="or-auth-server-input" type="password" autocomplete="new-password" placeholder="再次输入密码" required />' +
      "</div>" +
      '<span class="or-auth-server-chevron" aria-hidden="true">›</span>' +
      "</div></div>" +
      '<div class="or-auth-server-row">' +
      '<div class="or-auth-server-row-inner">' +
      '<span class="or-auth-server-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></span>' +
      '<div class="or-auth-server-body">' +
      '<div class="or-auth-server-title-row">' +
      '<strong class="or-auth-server-title">验证码</strong>' +
      '<button type="button" class="or-auth-server-link" id="or-auth-captcha-refresh">换一张</button>' +
      "</div>" +
      '<span class="or-auth-server-meta">演示 · 图形码</span>' +
      '<span class="or-auth-server-desc">请输入图中数字（可任意填写）</span>' +
      '<input id="or-auth-captcha" class="or-auth-server-input" type="text" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="例如 5829" />' +
      "</div>" +
      '<span class="or-auth-server-chevron" aria-hidden="true">›</span>' +
      "</div></div>" +
      '<div class="or-auth-server-row">' +
      '<div class="or-auth-server-row-inner">' +
      '<span class="or-auth-server-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></span>' +
      '<div class="or-auth-server-body">' +
      '<strong class="or-auth-server-title">订阅邮件</strong>' +
      '<span class="or-auth-server-desc">产品更新、安全与账单提醒</span>' +
      '<span class="or-auth-server-meta">可选 · 默认关闭</span>' +
      "</div>" +
      '<label class="or-auth-switch" for="or-auth-newsletter">' +
      '<input type="checkbox" id="or-auth-newsletter" class="or-auth-switch-input" />' +
      '<span class="or-auth-switch-track" aria-hidden="true"><span class="or-auth-switch-knob"></span></span>' +
      "</label>" +
      '<span class="or-auth-server-chevron" aria-hidden="true">›</span>' +
      "</div></div>" +
      '<div class="or-auth-server-row or-auth-server-row--last">' +
      '<div class="or-auth-server-row-inner">' +
      '<span class="or-auth-server-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>' +
      '<div class="or-auth-server-body">' +
      '<strong class="or-auth-server-title">用户协议</strong>' +
      '<span class="or-auth-server-desc">请阅读 <a href="#" class="or-auth-foot-link" id="or-auth-terms-link">《用户协议》</a></span>' +
      '<span class="or-auth-server-meta">必选 · 开启以继续</span>' +
      "</div>" +
      '<label class="or-auth-switch" for="or-auth-agree">' +
      '<input type="checkbox" id="or-auth-agree" class="or-auth-switch-input" required />' +
      '<span class="or-auth-switch-track" aria-hidden="true"><span class="or-auth-switch-knob"></span></span>' +
      "</label>" +
      '<span class="or-auth-server-chevron" aria-hidden="true">›</span>' +
      "</div></div>" +
      "</div>" +
      '<p class="or-auth-inline-error" id="or-auth-signup-error" hidden></p>' +
      '<button type="submit" class="or-auth-login-btn or-auth-signup-submit">创建账号</button>' +
      "</form>" +
      '<p class="or-auth-hint">静态演示，不会向服务器发送任何数据。</p>' +
      '<div class="or-auth-foot" id="or-auth-foot-signup">' +
      '<span class="or-auth-foot-muted">已有账号？</span>' +
      '<button type="button" class="or-auth-foot-link" id="or-auth-to-signin">立即登录</button>' +
      "</div>" +
      "</div></div></div>"
    );
  }

  function closeUserMenu() {
    var m = document.getElementById("or-user-menu");
    var t = document.getElementById("or-user-trigger");
    if (m) {
      m.hidden = true;
    }
    if (t) {
      t.setAttribute("aria-expanded", "false");
    }
  }

  function openUserMenu() {
    var m = document.getElementById("or-user-menu");
    var t = document.getElementById("or-user-trigger");
    if (m) m.hidden = false;
    if (t) t.setAttribute("aria-expanded", "true");
  }

  function syncAuthChrome() {
    var inSession = isLoggedIn();
    var guest = document.getElementById("or-guest-cluster");
    var wrap = document.getElementById("or-user-wrap");
    var drawerSign = document.getElementById("or-drawer-signin");
    if (guest) guest.hidden = inSession;
    if (wrap) wrap.hidden = !inSession;
    if (drawerSign) drawerSign.hidden = inSession;
    closeUserMenu();
  }

  function openAuthModal(mode) {
    var root = document.getElementById("or-auth-modal-root");
    if (!root) return;
    root.hidden = false;
    document.body.classList.add("or-modal-open");
    var isSignup = mode === "signup";
    var title = document.getElementById("or-auth-title");
    var sub = document.getElementById("or-auth-sub");
    var panelIn = document.getElementById("or-auth-panel-signin");
    var panelUp = document.getElementById("or-auth-panel-signup");
    var tabIn = document.getElementById("or-auth-tab-signin");
    var tabUp = document.getElementById("or-auth-tab-signup");
    if (title) title.textContent = isSignup ? "创建账号" : "欢迎回来";
    if (sub) sub.textContent = isSignup ? "注册 Trinity AI 账号以开始使用" : "使用您的账号登录 Trinity AI";
    if (panelIn) panelIn.hidden = isSignup;
    if (panelUp) panelUp.hidden = !isSignup;
    if (tabIn) {
      tabIn.classList.toggle("is-active", !isSignup);
      tabIn.setAttribute("aria-selected", isSignup ? "false" : "true");
    }
    if (tabUp) {
      tabUp.classList.toggle("is-active", isSignup);
      tabUp.setAttribute("aria-selected", isSignup ? "true" : "false");
    }
    closeUserMenu();
    var err = document.getElementById("or-auth-signup-error");
    if (err) {
      err.textContent = "";
      err.hidden = true;
    }
    var focusEl = isSignup ? document.getElementById("or-auth-reg-email") : document.getElementById("or-auth-email");
    if (focusEl) focusEl.focus();
    try {
      if (window.history.replaceState) {
        var h = isSignup ? "#register" : "#login";
        window.history.replaceState(null, "", window.location.pathname + window.location.search + h);
      }
    } catch (e1) {
      /* ignore */
    }
  }

  function closeAuthModal() {
    var root = document.getElementById("or-auth-modal-root");
    if (root) root.hidden = true;
    document.body.classList.remove("or-modal-open");
    try {
      var h = window.location.hash;
      if ((h === "#login" || h === "#register") && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } catch (e0) {
      /* ignore */
    }
  }

  function applyThemePick(pick) {
    try {
      localStorage.setItem(STORAGE_THEME, pick);
    } catch (e) {
      /* ignore */
    }
    document.documentElement.setAttribute("data-theme", pick);
    document.querySelectorAll(".or-theme-seg").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme-pick") === pick);
    });
  }

  function syncThemeSegments() {
    var cur = "system";
    try {
      cur = localStorage.getItem(STORAGE_THEME) || "system";
    } catch (e) {
      /* ignore */
    }
    if (cur !== "light" && cur !== "dark" && cur !== "system") cur = "system";
    document.querySelectorAll(".or-theme-seg").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme-pick") === cur);
    });
    document.documentElement.setAttribute("data-theme", cur);
  }

  function injectChrome() {
    document.querySelectorAll("header.or-inject").forEach(function (h) {
      var page = h.getAttribute("data-or-page") || "home";
      h.innerHTML = buildHeader(page);
    });
    if (!document.getElementById("or-auth-modal-root")) {
      document.body.insertAdjacentHTML("beforeend", buildModal());
    }
  }

  function wireMobileDrawer() {
    var b = document.getElementById("menu-btn");
    var d = document.getElementById("drawer");
    if (b && d) {
      b.addEventListener("click", function () {
        var o = d.classList.toggle("open");
        b.setAttribute("aria-expanded", o ? "true" : "false");
      });
      window.addEventListener("resize", function () {
        if (window.matchMedia("(min-width: 900px)").matches) {
          d.classList.remove("open");
          b.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  function wireAuthAndUser() {
    document.body.addEventListener("click", function (e) {
      var wrap = document.getElementById("or-user-wrap");
      if (wrap && !wrap.contains(e.target)) {
        closeUserMenu();
      }
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-signin-btn")) {
        e.preventDefault();
        openAuthModal("signin");
      }
      if (e.target.closest("#or-drawer-signin")) {
        e.preventDefault();
        var d = document.getElementById("drawer");
        var b = document.getElementById("menu-btn");
        if (d) d.classList.remove("open");
        if (b) b.setAttribute("aria-expanded", "false");
        openAuthModal("signin");
      }
    });

    document.body.addEventListener("click", function (e) {
      var trigger = document.getElementById("or-user-trigger");
      if (!trigger || !trigger.contains(e.target)) return;
      var menu = document.getElementById("or-user-menu");
      var open = menu && menu.hidden;
      if (open) openUserMenu();
      else closeUserMenu();
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-signout-btn")) {
        e.preventDefault();
        setLoggedIn(false);
      }
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-prefs-gear")) {
        e.preventDefault();
        closeUserMenu();
        window.location.href = H("account/console.html#preset");
      }
    });

    document.body.addEventListener("click", function (e) {
      var link = e.target.closest("a.or-menu-item");
      if (link && document.getElementById("or-user-menu") && document.getElementById("or-user-menu").contains(link)) {
        closeUserMenu();
      }
    });

    document.body.addEventListener("click", function (e) {
      var seg = e.target.closest(".or-theme-seg");
      if (!seg) return;
      e.preventDefault();
      applyThemePick(seg.getAttribute("data-theme-pick") || "system");
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-auth-backdrop") || e.target.closest("#or-auth-close")) {
        e.preventDefault();
        closeAuthModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAuthModal();
        closeUserMenu();
      }
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-auth-tab-signin") || e.target.closest("#or-auth-to-signin")) {
        e.preventDefault();
        openAuthModal("signin");
      }
      if (e.target.closest("#or-auth-tab-signup") || e.target.closest("#or-auth-to-signup")) {
        e.preventDefault();
        openAuthModal("signup");
      }
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-auth-forgot")) {
        e.preventDefault();
      }
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-auth-terms-link") || e.target.closest("#or-auth-reg-help")) {
        e.preventDefault();
      }
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#or-auth-captcha-refresh")) {
        e.preventDefault();
        var cap = document.getElementById("or-auth-captcha");
        if (cap) {
          cap.value = "";
          cap.focus();
        }
      }
    });

    function redirectAfterDemoLoginIfNeeded() {
      var _path = (window.location.pathname || "").replace(/\\/g, "/");
      if (/\/account\/(login|register)\b/i.test(_path)) {
        window.location.href = H("account/console.html");
        return;
      }
      var onMarketingIndex =
        !/\/app\//i.test(_path) &&
        !/\/account\//i.test(_path) &&
        (/\/TrinityAI\/index\.html$/i.test(_path) || /\/TrinityAI\/?$/i.test(_path));
      if (onMarketingIndex) {
        window.location.href = H("account/console.html");
      }
    }

    function setSignupError(msg) {
      var el = document.getElementById("or-auth-signup-error");
      if (!el) return;
      if (msg) {
        el.textContent = msg;
        el.hidden = false;
      } else {
        el.textContent = "";
        el.hidden = true;
      }
    }

    function wireSignupPasswordStrength() {
      var input = document.getElementById("or-auth-reg-password");
      var fill = document.getElementById("or-auth-strength-fill");
      var label = document.getElementById("or-auth-strength-text");
      if (!input || !fill || !label) return;
      function run() {
        var v = input.value || "";
        var score = 0;
        if (v.length >= 6) score++;
        if (v.length >= 10) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/[a-z]/.test(v)) score++;
        if (/[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        if (v.length === 0) {
          fill.style.width = "0%";
          fill.className = "or-auth-strength-fill";
          if (label) {
            label.textContent = "—";
            label.className = "";
          }
          return;
        }
        var tier = 1;
        var text = "弱";
        if (score >= 5) {
          tier = 3;
          text = "强";
        } else if (score >= 3) {
          tier = 2;
          text = "中";
        }
        var pct = tier === 1 ? 33 : tier === 2 ? 66 : 100;
        fill.style.width = pct + "%";
        fill.className = "or-auth-strength-fill" + (tier === 1 ? " is-weak" : tier === 2 ? " is-mid" : " is-strong");
        if (label) {
          label.textContent = text;
          label.className = tier === 1 ? "is-weak" : tier === 2 ? "is-mid" : "is-strong";
        }
      }
      input.addEventListener("input", run);
      input.addEventListener("change", run);
    }

    wireSignupPasswordStrength();

    var formIn = document.getElementById("or-auth-form-signin");
    if (formIn) {
      formIn.addEventListener("submit", function (e) {
        e.preventDefault();
        try {
          var r = document.getElementById("or-auth-remember");
          if (r && r.checked) localStorage.setItem(STORAGE_REMEMBER, "1");
          else localStorage.removeItem(STORAGE_REMEMBER);
        } catch (err) {
          /* ignore */
        }
        setLoggedIn(true);
        closeAuthModal();
        redirectAfterDemoLoginIfNeeded();
      });
    }

    var formUp = document.getElementById("or-auth-form-signup");
    if (formUp) {
      formUp.addEventListener("submit", function (e) {
        e.preventDefault();
        setSignupError("");
        var agree = document.getElementById("or-auth-agree");
        if (agree && !agree.checked) {
          setSignupError("请先开启「用户协议」开关。");
          return;
        }
        var p1 = document.getElementById("or-auth-reg-password");
        var p2 = document.getElementById("or-auth-reg-password2");
        if (p1 && p2 && p1.value !== p2.value) {
          setSignupError("两次输入的密码不一致。");
          return;
        }
        if (p1 && p1.value.length < 8) {
          setSignupError("密码至少 8 位。");
          return;
        }
        setLoggedIn(true);
        closeAuthModal();
        redirectAfterDemoLoginIfNeeded();
      });
    }

    function oauthDemoLogin() {
      setLoggedIn(true);
      closeAuthModal();
      redirectAfterDemoLoginIfNeeded();
    }

    var g = document.getElementById("or-auth-google");
    if (g) {
      g.addEventListener("click", oauthDemoLogin);
    }
    var gh = document.getElementById("or-auth-github");
    if (gh) {
      gh.addEventListener("click", oauthDemoLogin);
    }

    syncAuthChrome();
    syncThemeSegments();
  }

  function maybeOpenFromQuery() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get("signin") === "1") {
        openAuthModal("signin");
        if (window.history.replaceState) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
      if (q.get("register") === "1") {
        openAuthModal("signup");
        if (window.history.replaceState) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  function maybeOpenFromHash() {
    try {
      var h = window.location.hash;
      if (h === "#login") openAuthModal("signin");
      else if (h === "#register") openAuthModal("signup");
    } catch (e2) {
      /* ignore */
    }
  }

  function initDashboardPanels() {
    var panels = document.querySelectorAll("[data-or-panel]");
    if (!panels.length) return;

    function show(id) {
      panels.forEach(function (el) {
        el.hidden = el.getAttribute("data-or-panel") !== id;
      });
      document.querySelectorAll(".or-side a.or-dash-nav").forEach(function (a) {
        var h = (a.getAttribute("href") || "").replace(/^.*#/, "");
        a.classList.toggle("is-active", h === id);
      });
    }

    function route() {
      var h = (window.location.hash || "#keys").replace(/^#/, "") || "keys";
      var allowed = ["keys", "credits", "activity", "logs", "preset"];
      if (allowed.indexOf(h) === -1) h = "keys";
      show(h);
    }

    window.addEventListener("hashchange", route);
    route();
  }

  function init() {
    injectChrome();
    syncDocumentLangAttr();
    wireMobileDrawer();
    wireAuthAndUser();
    maybeOpenFromQuery();
    maybeOpenFromHash();
    initDashboardPanels();
    var autoload = document.body.getAttribute("data-or-autoload");
    if (autoload === "signin") openAuthModal("signin");
    if (autoload === "signup") openAuthModal("signup");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.TrinityOR = {
    openSignIn: function (mode) {
      openAuthModal(mode === "signup" ? "signup" : "signin");
    },
    signOut: function () {
      setLoggedIn(false);
    },
    isSignedIn: isLoggedIn,
  };
})();
