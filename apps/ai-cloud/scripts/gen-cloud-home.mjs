/**
 * TrinityCloud/home.html → 单文件 HomePage.vue（1:1 结构，仅改站内链与登录跳转）
 */
import fs from "node:fs";

const homePath = new URL("../../../TrinityCloud/home.html", import.meta.url);
const outPath = new URL("../src/views/home/HomePage.vue", import.meta.url);

fs.mkdirSync(new URL("../src/views/home/", import.meta.url), { recursive: true });

const lines = fs.readFileSync(homePath, "utf8").split("\n");

const styleBlock = lines
  .slice(18, 1422)
  .map((l) => l.replace(/^      /, ""))
  .join("\n");

let markup = lines.slice(1425, 2093).join("\n").replace(/^    /gm, "");

markup = markup
  .replace(/href="home\.html"/g, 'href="/ai-cloud"')
  .replace(/href="\.\.\/TrinityAI\/index\.html"/g, 'href="/trinity-ai"')
  .replace(/href="\.\.\/TrinityAI\/account\/register\.html"/g, 'href="#" data-or-open-signup="1"')
  .replace(/href="\.\.\/TrinityAI\/app\/docs\.html"/g, 'href="/trinity-ai/docs"')
  .replace(
    /window\.location\.href = "\.\.\/TrinityAI\/account\/console\.html";/g,
    'void router.push({ name: "aic-account-console", hash: "#accounts" });'
  );

const scriptSetup = `import { computed, onMounted, onUnmounted, ref } from "vue";
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
`;

/** 登录弹层：最小 Vue 绑定 */
markup = markup
  .replace(
    /<div id="home-login-modal-root" class="or-modal-root" hidden aria-hidden="true">/,
    '<div id="home-login-modal-root" class="or-modal-root" :hidden="!authVisible" :aria-hidden="authVisible ? \'false\' : \'true\'">'
  )
  .replace(
    /<h2 class="or-auth-head-title" id="home-auth-title">欢迎回来<\/h2>/,
    '<h2 class="or-auth-head-title" id="home-auth-title">{{ authTitle }}</h2>'
  )
  .replace(
    /<p class="or-auth-head-sub" id="home-auth-sub">使用企业账号登录<\/p>/,
    '<p class="or-auth-head-sub" id="home-auth-sub">{{ authSub }}</p>'
  )
  .replace(
    /<button type="submit" class="or-auth-login-btn" id="home-auth-submit">登录<\/button>/,
    '<button type="submit" class="or-auth-login-btn" id="home-auth-submit">{{ authSubmitLabel }}</button>'
  )
  .replace(
    /<div class="or-auth-foot" id="home-auth-foot-signin">/,
    '<div class="or-auth-foot" id="home-auth-foot-signin" v-show="!authSignup">'
  )
  .replace(
    /<div class="or-auth-foot" id="home-auth-foot-signup" hidden>/,
    '<div class="or-auth-foot" id="home-auth-foot-signup" v-show="authSignup">'
  );

const vue = `<script setup lang="ts">
${scriptSetup}
</script>

<template>
  <div ref="pageRef" class="home-page">
${markup}
  </div>
</template>

<style>
${styleBlock}

.home-page {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
</style>
`;

fs.writeFileSync(outPath, vue, "utf8");
console.log("Wrote", outPath.pathname, "bytes", Buffer.byteLength(vue));
