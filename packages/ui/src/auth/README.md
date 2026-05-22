# 登录 / 注册弹窗（`@trinity/ui`）

与 `assets/trinity-base.css` 中 `.or-auth-modal` 等全局类配合使用。

## 组件

| 导出 | 用途 |
|------|------|
| `TrinityAuthModal` | **推荐**：完整弹窗壳（遮罩、关闭、登录/注册切换） |
| `TrinityAuthSignupPanel` | 仅注册内容区（中文 + OAuth 图标行） |
| `TrinityAuthSigninPanel` | 仅登录内容区（中文 OAuth + 邮箱） |

## 样式

应用入口引入其一即可：

```ts
import "@trinity/ui/styles/auth-signup-modal.css";
// 或
import "@trinity/ui/styles/auth-modal.css";
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
