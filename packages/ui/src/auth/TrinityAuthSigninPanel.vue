<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    idPrefix?: string;
    title?: string;
    subtitle?: string;
    dividerText?: string;
    submitLabel?: string;
    hint?: string;
    footMuted?: string;
    footSignupLabel?: string;
    oauthGoogleLabel?: string;
    oauthGithubLabel?: string;
  }>(),
  {
    idPrefix: "or-auth",
    title: "欢迎回来",
    subtitle: "使用您的账号登录",
    dividerText: "或者使用邮箱",
    submitLabel: "登录",
    hint: "静态演示，不会向服务器发送任何数据。",
    footMuted: "还没有账号？",
    footSignupLabel: "立即注册",
    oauthGoogleLabel: "Google 登录",
    oauthGithubLabel: "GitHub 登录",
  }
);

const emit = defineEmits<{
  oauth: [];
  submit: [payload: { remember: boolean }];
  signUp: [];
  forgot: [];
}>();

const emailId = computed(() => `${props.idPrefix}-email`);
const passwordId = computed(() => `${props.idPrefix}-password`);
const rememberId = computed(() => `${props.idPrefix}-remember`);
const forgotId = computed(() => `${props.idPrefix}-forgot`);
const submitId = computed(() => `${props.idPrefix}-submit`);
const toSignupId = computed(() => `${props.idPrefix}-to-signup`);

function onSubmit(e: Event) {
  e.preventDefault();
  const remember = (document.getElementById(rememberId.value) as HTMLInputElement | null)?.checked ?? false;
  emit("submit", { remember });
}
</script>

<template>
  <div class="or-auth-signin-panel">
    <div class="or-auth-head">
      <h2 :id="`${idPrefix}-title`" class="or-auth-head-title">{{ title }}</h2>
      <p :id="`${idPrefix}-sub`" class="or-auth-head-sub">{{ subtitle }}</p>
    </div>
    <div class="or-oauth-row">
      <button
        type="button"
        class="or-oauth-btn"
        :id="`${idPrefix}-google`"
        title="使用 Google 账号继续"
        :aria-label="oauthGoogleLabel"
        @click="emit('oauth')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {{ oauthGoogleLabel }}
      </button>
      <button
        type="button"
        class="or-oauth-btn"
        :id="`${idPrefix}-github`"
        title="使用 GitHub 账号继续"
        :aria-label="oauthGithubLabel"
        @click="emit('oauth')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M12 1C5.92 1 1 5.92 1 12c0 4.87 3.16 8.99 7.55 10.45.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.86-3.06.67-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.44-.28-5-1.22-5-5.45 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.39.11-2.9 0 0 .92-.3 3.03 1.13.88-.25 1.82-.37 2.76-.37.94 0 1.88.12 2.76.37 2.11-1.43 3.03-1.13 3.03-1.13.6 1.51.22 2.62.11 2.9.7.77 1.13 1.76 1.13 2.96 0 4.24-2.57 5.17-5.02 5.44.39.34.74 1.01.74 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.75.53C19.84 20.99 23 16.87 23 12 23 5.92 18.08 1 12 1z"
          />
        </svg>
        {{ oauthGithubLabel }}
      </button>
    </div>
    <div class="or-auth-divider" role="separator">{{ dividerText }}</div>
    <form :id="`${idPrefix}-form-signin`" class="or-auth-form" novalidate @submit="onSubmit">
      <div class="form-group">
        <label :for="emailId">邮箱或用户名</label>
        <input :id="emailId" type="text" autocomplete="username" placeholder="请输入邮箱或用户名" required />
      </div>
      <div class="form-group">
        <div class="or-auth-label-row">
          <label :for="passwordId">密码</label>
          <a :id="forgotId" href="#" class="or-auth-forgot" @click.prevent="emit('forgot')">忘记密码？</a>
        </div>
        <input
          :id="passwordId"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>
      <label class="or-auth-remember">
        <input :id="rememberId" type="checkbox" />
        记住我
      </label>
      <button type="submit" class="btn btn-gradient or-auth-signin-submit" :id="submitId">{{ submitLabel }}</button>
      <p v-if="hint" class="or-auth-hint">{{ hint }}</p>
      <div class="or-auth-foot">
        <span class="or-auth-foot-muted">{{ footMuted }}</span>
        <button type="button" class="or-auth-foot-link" :id="toSignupId" @click="emit('signUp')">
          {{ footSignupLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.or-auth-signin-submit {
  width: 100%;
  height: 46px;
  margin: 0;
  padding: 0 1rem;
  font-size: 0.9375rem;
  box-sizing: border-box;
}
</style>
