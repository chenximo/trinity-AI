<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    /** 表单控件 id 前缀，如 `or-auth`、`home-auth` */
    idPrefix?: string;
    /** 父级校验错误（与组件内条款错误合并展示） */
    formError?: string;
  }>(),
  { idPrefix: "or-auth", formError: "" }
);

const emit = defineEmits<{
  oauth: [];
  submit: [];
  signIn: [];
}>();

const termsAgreed = ref(false);
const passwordVisible = ref(false);
const localError = ref("");

const emailId = computed(() => `${props.idPrefix}-email`);
const passwordId = computed(() => `${props.idPrefix}-password`);
const agreeId = computed(() => `${props.idPrefix}-agree`);
const submitId = computed(() => `${props.idPrefix}-submit`);
const toSigninId = computed(() => `${props.idPrefix}-to-signin`);

const passwordInputType = computed(() => (passwordVisible.value ? "text" : "password"));

const displayError = computed(() => props.formError || localError.value);

function togglePasswordVisible() {
  passwordVisible.value = !passwordVisible.value;
}

function onSubmit() {
  localError.value = "";
  if (!termsAgreed.value) {
    localError.value = "请先勾选同意《服务条款》《隐私政策》与《模型使用条款》。";
    return;
  }
  emit("submit");
}

function reset() {
  termsAgreed.value = false;
  passwordVisible.value = false;
  localError.value = "";
}

defineExpose({ reset });
</script>

<template>
  <div class="or-auth-signup-panel">
    <div class="or-auth-head">
      <h2 :id="`${idPrefix}-title`" class="or-auth-head-title">创建账号</h2>
      <p class="or-auth-head-sub">欢迎！请填写以下信息以开始使用。</p>
    </div>
    <div class="or-oauth-row or-oauth-row--icons">
      <button
        type="button"
        class="or-oauth-btn or-oauth-btn--icon"
        :id="`${idPrefix}-github`"
        title="使用 GitHub 账号继续"
        aria-label="使用 GitHub 继续"
        @click="emit('oauth')"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M12 1C5.92 1 1 5.92 1 12c0 4.87 3.16 8.99 7.55 10.45.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.86-3.06.67-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.44-.28-5-1.22-5-5.45 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.39.11-2.9 0 0 .92-.3 3.03 1.13.88-.25 1.82-.37 2.76-.37.94 0 1.88.12 2.76.37 2.11-1.43 3.03-1.13 3.03-1.13.6 1.51.22 2.62.11 2.9.7.77 1.13 1.76 1.13 2.96 0 4.24-2.57 5.17-5.02 5.44.39.34.74 1.01.74 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.75.53C19.84 20.99 23 16.87 23 12 23 5.92 18.08 1 12 1z"
          />
        </svg>
      </button>
      <button
        type="button"
        class="or-oauth-btn or-oauth-btn--icon"
        :id="`${idPrefix}-google`"
        title="使用 Google 账号继续"
        aria-label="使用 Google 继续"
        @click="emit('oauth')"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      </button>
      <button
        type="button"
        class="or-oauth-btn or-oauth-btn--icon"
        :id="`${idPrefix}-metamask`"
        title="使用 MetaMask 继续"
        aria-label="使用 MetaMask 继续"
        @click="emit('oauth')"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#E2761B" d="M22.1 4.2 13.2 9.5l1.6-3.7 7.3-1.6z" />
          <path fill="#E4761B" d="M1.9 4.2l8.8 5.3-1.5-3.7L1.9 4.2z" />
          <path fill="#D7C1B3" d="M19.5 16.8 17 20.5l4.5 1.2 1.1-4.9-3.1-.9z" />
          <path fill="#233447" d="M1.4 16.8l3.1.9 1.1 4.9-4.5-1.2-2.6-3.7z" />
          <path fill="#CD6116" d="M7.1 10.4 8.5 12.8l6.9.3 1.4-2.4-9.7-.3z" />
          <path fill="#E4751F" d="M22.1 4.2 19.5 10.4l-2.3-.3-1.6-3.7 6.5-2.2zM1.9 4.2l2.3 6.2 2.3.3-1.6 3.7L1.9 4.2z" />
          <path fill="#F6851B" d="M8.5 12.8 7.1 16.8l3.4 1.6 3.4-1.6-1.4-4-4 0z" />
        </svg>
      </button>
    </div>
    <div class="or-auth-divider" role="separator">或</div>
    <form class="or-auth-form-signup or-auth-signup-form" novalidate @submit.prevent="onSubmit">
      <p v-if="displayError" class="or-auth-form-error" role="alert">{{ displayError }}</p>
      <div class="form-group or-auth-signup-field">
        <label class="or-auth-signup-label" :for="emailId">邮箱</label>
        <input
          :id="emailId"
          class="or-auth-signup-input"
          type="email"
          autocomplete="email"
          placeholder="请输入邮箱"
          required
        />
      </div>
      <div class="form-group or-auth-signup-field">
        <label class="or-auth-signup-label" :for="passwordId">密码</label>
        <div class="or-auth-password-wrap">
          <input
            :id="passwordId"
            class="or-auth-signup-input or-auth-signup-input--password"
            :type="passwordInputType"
            autocomplete="new-password"
            placeholder="请输入密码"
            required
          />
          <button
            type="button"
            class="or-auth-password-toggle"
            :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
            tabindex="-1"
            @click="togglePasswordVisible"
          >
            <svg
              v-if="!passwordVisible"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M1 1l22 22M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            </svg>
          </button>
        </div>
      </div>
      <div class="or-auth-terms-row">
        <label class="or-auth-terms">
          <input :id="agreeId" v-model="termsAgreed" class="or-auth-terms-check" type="checkbox" />
          <span class="or-auth-terms-text">
            我已阅读并同意
            <a href="#" class="or-auth-terms-link" @click.prevent>《服务条款》</a>、
            <a href="#" class="or-auth-terms-link" @click.prevent>《隐私政策》</a>与
            <a href="#" class="or-auth-terms-link" @click.prevent>《模型使用条款》</a>
          </span>
        </label>
      </div>
      <button type="submit" class="btn btn-gradient or-auth-signup-submit" :id="submitId">
        继续
        <span class="or-auth-continue-arrow" aria-hidden="true">›</span>
      </button>
    </form>
    <div class="or-auth-foot-bar">
      <span class="or-auth-foot-muted">已有账号？</span>
      <button type="button" class="or-auth-foot-link" :id="toSigninId" @click="emit('signIn')">立即登录</button>
    </div>
  </div>
</template>

<style scoped>
.or-auth-signup-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.or-auth-signup-panel .or-auth-head {
  margin-bottom: 1.25rem;
}

.or-auth-signup-panel .or-oauth-row--icons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.or-auth-signup-panel .or-oauth-btn--icon {
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.or-auth-signup-panel .or-auth-divider {
  margin: 0 0 1.15rem;
}

.or-auth-signup-form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
}

.or-auth-signup-field {
  display: block;
  width: 100%;
  margin: 0 0 1rem;
}

.or-auth-signup-field + .or-auth-signup-field {
  margin-top: 0;
}

.or-auth-signup-label {
  display: block;
  margin: 0 0 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text);
}

.or-auth-signup-input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--text);
  background: var(--bg);
  box-sizing: border-box;
  appearance: none;
}

.or-auth-signup-input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-ring);
}

.or-auth-password-wrap {
  position: relative;
  display: block;
  width: 100%;
}

.or-auth-signup-input--password {
  padding-right: 2.75rem;
}

.or-auth-password-toggle {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  z-index: 2;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
}

.or-auth-password-toggle:hover {
  color: var(--text);
  background: var(--surface);
}

.or-auth-terms-row {
  display: block;
  width: 100%;
  margin: 0.15rem 0 1rem;
}

.or-auth-terms {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  width: 100%;
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--muted);
  cursor: pointer;
  user-select: none;
}

.or-auth-terms-check {
  width: 1rem;
  height: 1rem;
  margin: 0.2rem 0 0;
  flex-shrink: 0;
  accent-color: var(--blue);
  cursor: pointer;
}

.or-auth-terms-text {
  display: block;
  flex: 1;
  min-width: 0;
}

.or-auth-terms-link {
  color: var(--blue);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.or-auth-terms-link:hover {
  color: #1d4ed8;
}

.or-auth-form-error {
  display: block;
  width: 100%;
  margin: 0 0 0.85rem;
  padding: 0.5rem 0.65rem;
  font-size: 0.8125rem;
  color: var(--danger-ink, #b91c1c);
  background: var(--danger-soft, #fef2f2);
  border-radius: 6px;
  box-sizing: border-box;
}

.or-auth-signup-submit {
  width: 100%;
  height: 46px;
  margin: 0;
  padding: 0 1rem;
  font-size: 0.9375rem;
  box-sizing: border-box;
  flex-shrink: 0;
}

.or-auth-continue-arrow {
  font-size: 1.125rem;
  line-height: 1;
  opacity: 0.9;
}

.or-auth-signup-panel .or-auth-foot-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  width: calc(100% + 4rem);
  margin: 1.35rem -2rem 0;
  padding: 1rem 2rem 1.15rem;
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  font-size: 0.875rem;
  box-sizing: border-box;
}

.or-auth-signup-panel .or-auth-foot-muted {
  color: var(--muted);
}

.or-auth-signup-panel .or-auth-foot-link {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--blue);
  cursor: pointer;
}

.or-auth-signup-panel .or-auth-foot-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
