<script setup lang="ts">
import { computed } from "vue";
import TrinityAuthSigninPanel from "./TrinityAuthSigninPanel.vue";
import TrinityAuthSignupPanel from "./TrinityAuthSignupPanel.vue";

export type TrinityAuthMode = "signin" | "signup";

const props = withDefaults(
  defineProps<{
    /** 是否显示弹窗 */
    open: boolean;
    mode?: TrinityAuthMode;
    /** 表单控件 id 前缀 */
    idPrefix?: string;
    /** 注册表单外部错误 */
    signupFormError?: string;
    /** 登录文案（产品可覆盖） */
    signinTitle?: string;
    signinSubtitle?: string;
    signinHint?: string;
    closeLabel?: string;
    /** 打开注册时递增以重置注册表单状态 */
    signupResetKey?: number;
    /** 注册页协议链接是否新标签打开 */
    legalOpenInNewTab?: boolean;
  }>(),
  {
    mode: "signin",
    idPrefix: "or-auth",
    signupFormError: "",
    signinTitle: "欢迎回来",
    signinSubtitle: "使用您的账号登录",
    signinHint: "静态演示，不会向服务器发送任何数据。",
    closeLabel: "关闭",
    signupResetKey: 0,
    legalOpenInNewTab: false,
  }
);

const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:mode": [value: TrinityAuthMode];
  close: [];
  oauth: [];
  signin: [payload: { remember: boolean }];
  signup: [];
}>();

const titleId = computed(() => `${props.idPrefix}-title`);

function onClose() {
  emit("update:open", false);
  emit("close");
}

function onBackdropClick() {
  onClose();
}

function switchMode(next: TrinityAuthMode) {
  emit("update:mode", next);
}
</script>

<template>
  <div
    class="or-modal-root trinity-auth-modal"
    :hidden="!open"
    :aria-hidden="open ? 'false' : 'true'"
    role="presentation"
  >
    <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="onBackdropClick" />
    <div
      class="or-modal-card or-auth-modal"
      :class="{ 'or-auth-modal--signup': mode === 'signup' }"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <button type="button" class="or-modal-close" :aria-label="closeLabel" @click="onClose">&times;</button>

      <TrinityAuthSignupPanel
        v-if="mode === 'signup'"
        :key="signupResetKey"
        :id-prefix="idPrefix"
        :form-error="signupFormError"
        :legal-open-in-new-tab="legalOpenInNewTab"
        @oauth="emit('oauth')"
        @submit="emit('signup')"
        @sign-in="switchMode('signin')"
        @before-legal-navigate="onClose"
      />

      <TrinityAuthSigninPanel
        v-else
        :id-prefix="idPrefix"
        :title="signinTitle"
        :subtitle="signinSubtitle"
        :hint="signinHint"
        @oauth="emit('oauth')"
        @submit="emit('signin', $event)"
        @sign-up="switchMode('signup')"
      />
    </div>
  </div>
</template>
