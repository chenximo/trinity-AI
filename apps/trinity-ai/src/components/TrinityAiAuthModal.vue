<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const REMEMBER_KEY = "trinity_or_remember";

const emit = defineEmits<{
  signedIn: [];
}>();

const router = useRouter();
const route = useRoute();

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

function setBodyModal(open: boolean) {
  document.body.classList.toggle("or-modal-open", open);
}

function replaceHash(h: string) {
  try {
    void router.replace({ path: route.path, query: route.query, hash: h || undefined });
  } catch {
    /* ignore */
  }
}

function open(next: "signin" | "signup" = "signin") {
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

function close() {
  visible.value = false;
  setBodyModal(false);
  const h = route.hash;
  if (h === "#login" || h === "#register") replaceHash("");
}

function onBackdropClick() {
  close();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

function onSigninSubmit(e: Event) {
  e.preventDefault();
  const remember = (document.getElementById("or-auth-remember") as HTMLInputElement | null)?.checked;
  try {
    if (remember) localStorage.setItem(REMEMBER_KEY, "1");
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* ignore */
  }
  emit("signedIn");
  close();
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
  emit("signedIn");
  close();
}

function oauthDemo() {
  emit("signedIn");
  close();
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

defineExpose({
  open,
  close,
});

watch(
  () => route.hash,
  (h) => {
    if (h === "#login") open("signin");
    else if (h === "#register") open("signup");
  },
  { immediate: true }
);

watch(
  () => route.query,
  (q) => {
    if (q.signin === "1") {
      open("signin");
      void router.replace({ path: route.path, query: {} });
    }
    if (q.register === "1") {
      open("signup");
      void router.replace({ path: route.path, query: {} });
    }
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.classList.remove("or-modal-open");
});
</script>

<template>
  <div id="or-auth-modal-root" class="or-modal-root" :hidden="!visible">
    <div id="or-auth-backdrop" class="or-modal-backdrop" tabindex="-1" @click="onBackdropClick" />
    <div class="or-modal-card or-auth-modal" role="dialog" aria-modal="true" aria-labelledby="or-auth-title">
      <button id="or-auth-close" type="button" class="or-modal-close" aria-label="关闭" @click="close">
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
          @click="open('signin')"
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
          @click="open('signup')"
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
            <button id="or-auth-to-signup" type="button" class="or-auth-foot-link" @click="open('signup')">
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
          <button id="or-auth-to-signin" type="button" class="or-auth-foot-link" @click="open('signin')">立即登录</button>
        </div>
      </div>
    </div>
  </div>
</template>
