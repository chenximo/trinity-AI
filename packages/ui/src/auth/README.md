# 登录 / 注册弹窗（`@trinity/ui`）

与 `assets/trinity-base.css` 中 `.or-auth-modal` 等全局类配合使用。

## 组件

| 导出 | 用途 |
|------|------|
| `TrinityAuthModal` | **推荐**：完整弹窗壳（遮罩、关闭、登录/注册切换） |
| `TrinityAuthSignupPanel` | 仅注册内容区（中文 + OAuth 图标行） |
| `TrinityAuthSigninPanel` | 仅登录内容区（中文 OAuth + 邮箱 + 图形验证码） |
| `TrinityAuthCaptchaField` | 图形验证码行（登录等表单内复用） |

## 样式

应用入口在 **Uno / Tailwind 预检之后** 引入（否则注册页密码「眼睛」可能被挤到输入框下方）：

```ts
import "virtual:uno.css";
import "@trinity/ui/styles/trinity-shell-chrome.css";
```

## 用法示例

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TrinityAuthModal, type TrinityAuthMode } from "@trinity/ui";

const authOpen = ref(false);
const authMode = ref<TrinityAuthMode>("signin");

function onOAuth() { /* 演示跳转 */ }
function onSignin() { /* 登录成功 */ }
function onSignup() { /* 注册成功 */ }
</script>

<template>
  <TrinityAuthModal
    :open="authOpen"
    :mode="authMode"
    id-prefix="or-auth"
    signin-subtitle="使用您的账号登录 Trinity AI"
    @close="authOpen = false"
    @update:mode="(m) => (authMode = m)"
    @oauth="onOAuth"
    @signin="onSignin"
    @signup="onSignup"
  />
</template>
```

主操作按钮使用全局 **`btn btn-gradient`**（`var(--grad)` / `var(--grad-hover)`，见 design-tokens）。

业务页负责：`body.or-modal-open`、路由 hash（`#login` / `#register`）、会话写入。

## 协议链接

注册勾选区使用 `vue-router` 的 `RouterLink` 跳转至 `@trinity/ui` 协议页（见 `../legal/README.md`）。应用须：

1. `...getTrinityLegalChildRoutes()` 注册子路由；
2. `import "@trinity/ui/styles/legal.css"`。
