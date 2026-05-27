<script setup lang="ts">
import { computed, ref } from "vue";
import TrinityAuthCaptchaField from "./TrinityAuthCaptchaField.vue";
import TrinityAuthOAuthIconRow from "./TrinityAuthOAuthIconRow.vue";

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
  }>(),
  {
    idPrefix: "or-auth",
    title: "欢迎回来",
    subtitle: "使用您的账号登录",
    dividerText: "或",
    submitLabel: "登录",
    hint: "静态演示，不会向服务器发送任何数据。",
    footMuted: "还没有账号？",
    footSignupLabel: "立即注册",
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

const captchaRef = ref<InstanceType<typeof TrinityAuthCaptchaField> | null>(null);
const captchaError = ref("");

function onSubmit(e: Event) {
  e.preventDefault();
  captchaError.value = "";
  if (!captchaRef.value?.validate()) {
    captchaError.value = "验证码不正确，请重试。";
    captchaRef.value?.focusInput();
    return;
  }
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
    <TrinityAuthOAuthIconRow :id-prefix="idPrefix" @oauth="emit('oauth')" />
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
      <TrinityAuthCaptchaField ref="captchaRef" :id-prefix="idPrefix" />
      <p v-if="captchaError" class="or-auth-inline-error or-auth-captcha-error" role="alert">
        {{ captchaError }}
      </p>
      <label class="or-auth-remember">
        <input :id="rememberId" type="checkbox" />
        记住我
      </label>
      <button type="submit" class="btn btn-gradient or-auth-form-submit or-auth-signin-submit" :id="submitId">
        {{ submitLabel }}
      </button>
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
.or-auth-signin-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>

