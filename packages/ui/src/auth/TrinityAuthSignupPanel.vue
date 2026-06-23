<script setup lang="ts">
import { computed, ref } from "vue";
import TrinityAuthCaptchaField from "./TrinityAuthCaptchaField.vue";
import TrinityAuthOAuthIconRow from "./TrinityAuthOAuthIconRow.vue";
import TrinityAuthTermsAgree from "./TrinityAuthTermsAgree.vue";

const props = withDefaults(
  defineProps<{
    /** 表单控件 id 前缀，如 `or-auth`、`home-auth` */
    idPrefix?: string;
    /** 父级校验错误（与组件内条款错误合并展示） */
    formError?: string;
    /** 协议链接是否新标签打开（默认当前页跳转并关闭弹窗） */
    legalOpenInNewTab?: boolean;
  }>(),
  { idPrefix: "or-auth", formError: "", legalOpenInNewTab: false }
);

const emit = defineEmits<{
  oauth: [];
  submit: [];
  signIn: [];
  /** 跳转协议页前触发（用于关闭登录弹窗） */
  beforeLegalNavigate: [];
}>();

const termsAgreed = ref(false);
const passwordVisible = ref(false);
const passwordConfirmVisible = ref(false);
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const localError = ref("");
const captchaRef = ref<InstanceType<typeof TrinityAuthCaptchaField> | null>(null);

const regIdPrefix = computed(() => `${props.idPrefix}-reg`);
const emailId = computed(() => `${regIdPrefix.value}-email`);
const passwordId = computed(() => `${regIdPrefix.value}-password`);
const passwordConfirmId = computed(() => `${regIdPrefix.value}-password2`);
const agreeId = computed(() => `${props.idPrefix}-agree`);
const submitId = computed(() => `${props.idPrefix}-submit`);
const toSigninId = computed(() => `${props.idPrefix}-to-signin`);

const passwordInputType = computed(() => (passwordVisible.value ? "text" : "password"));
const passwordConfirmInputType = computed(() => (passwordConfirmVisible.value ? "text" : "password"));

const displayError = computed(() => props.formError || localError.value);

function togglePasswordVisible() {
  passwordVisible.value = !passwordVisible.value;
}

function togglePasswordConfirmVisible() {
  passwordConfirmVisible.value = !passwordConfirmVisible.value;
}

function onSubmit() {
  localError.value = "";
  const pwd = password.value;
  if (pwd.length < 8) {
    localError.value = "密码至少 8 位。";
    return;
  }
  if (pwd !== passwordConfirm.value) {
    localError.value = "两次输入的密码不一致。";
    return;
  }
  if (!captchaRef.value?.validate()) {
    localError.value = "验证码不正确，请重试。";
    captchaRef.value?.focusInput();
    return;
  }
  if (!termsAgreed.value) {
    localError.value = "请先勾选同意《服务条款》与《隐私政策》。";
    return;
  }
  emit("submit");
}

function reset() {
  termsAgreed.value = false;
  passwordVisible.value = false;
  passwordConfirmVisible.value = false;
  email.value = "";
  password.value = "";
  passwordConfirm.value = "";
  localError.value = "";
  captchaRef.value?.refresh();
}

defineExpose({ reset });
</script>

<template>
  <div class="or-auth-signup-panel">
    <div class="or-auth-head">
      <h2 :id="`${idPrefix}-title`" class="or-auth-head-title">创建账号</h2>
      <p class="or-auth-head-sub">欢迎！请填写以下信息以开始使用。</p>
    </div>
    <TrinityAuthOAuthIconRow :id-prefix="idPrefix" @oauth="emit('oauth')" />
    <div class="or-auth-divider" role="separator">或</div>
    <form :id="`${idPrefix}-form-signup`" class="or-auth-form" novalidate @submit.prevent="onSubmit">
      <p v-if="displayError" class="or-auth-inline-error" role="alert">{{ displayError }}</p>
      <div class="form-group">
        <label :for="emailId">邮箱</label>
        <input
          :id="emailId"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          placeholder="you@company.com"
          required
        />
      </div>
      <div class="form-group">
        <label :for="passwordId">密码</label>
        <div class="or-auth-password-wrap">
          <input
            :id="passwordId"
            v-model="password"
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
      <div class="form-group">
        <label :for="passwordConfirmId">确认密码</label>
        <div class="or-auth-password-wrap">
          <input
            :id="passwordConfirmId"
            v-model="passwordConfirm"
            :type="passwordConfirmInputType"
            autocomplete="new-password"
            placeholder="请再次输入密码"
            required
          />
          <button
            type="button"
            class="or-auth-password-toggle"
            :aria-label="passwordConfirmVisible ? '隐藏密码' : '显示密码'"
            tabindex="-1"
            @click="togglePasswordConfirmVisible"
          >
            <svg
              v-if="!passwordConfirmVisible"
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
      <TrinityAuthCaptchaField ref="captchaRef" :id-prefix="regIdPrefix" />
      <TrinityAuthTermsAgree
        :agree-id="agreeId"
        v-model:agreed="termsAgreed"
        :legal-open-in-new-tab="legalOpenInNewTab"
        @before-legal-navigate="emit('beforeLegalNavigate')"
      />
      <button type="submit" class="btn btn-gradient or-auth-form-submit or-auth-signup-submit" :id="submitId">
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
  margin-bottom: 0;
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
  width: calc(100% + 3rem);
  margin: 0.85rem -1.5rem 0;
  padding: 0.75rem 1.5rem 0.85rem;
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

/* 密码眼睛：scoped + :deep，避免全局样式被 Uno 预检盖掉 */
.or-auth-signup-panel :deep(.or-auth-form .form-group .or-auth-password-wrap) {
  position: relative;
  display: block;
  width: 100%;
}

.or-auth-signup-panel :deep(.or-auth-form .form-group .or-auth-password-wrap input) {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding-right: 2.75rem;
}

.or-auth-signup-panel :deep(.or-auth-form .form-group .or-auth-password-wrap .or-auth-password-toggle) {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  z-index: 2;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  min-width: 2.25rem;
  max-width: 2.25rem;
  height: 2.25rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  flex: none;
}

.or-auth-signup-panel :deep(.or-auth-form .form-group .or-auth-password-wrap .or-auth-password-toggle:hover) {
  color: var(--text);
  background: var(--surface);
}
</style>
