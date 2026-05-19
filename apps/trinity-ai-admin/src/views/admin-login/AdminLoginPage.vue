<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import "../../styles/admin-theme.css";
import "./admin-login.css";
import {
  DEMO_ADMIN_CREDENTIALS,
  DEFAULT_ADMIN_SESSION_USER,
} from "../admin-shell/sessionMock";
import { isAdminSignedIn, signInAdmin } from "../admin-shell/shellInteractions";

const router = useRouter();
const route = useRoute();

const loginId = ref(DEMO_ADMIN_CREDENTIALS.loginId);
const password = ref("");
const error = ref("");

function redirectAfterLogin(): void {
  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";
  if (redirect && redirect !== "/" && !redirect.startsWith("/login")) {
    void router.replace(redirect);
    return;
  }
  void router.replace({ name: "tai-admin-dashboard" });
}

function onSubmit(): void {
  error.value = "";
  const id = loginId.value.trim().toLowerCase();
  if (!id) {
    error.value = "请输入管理员账号";
    return;
  }
  if (id !== DEMO_ADMIN_CREDENTIALS.loginId) {
    error.value = "原型仅支持演示账号 zhang.san";
    return;
  }
  signInAdmin({
    ...DEFAULT_ADMIN_SESSION_USER,
    loginId: id,
    email: id.includes("@") ? id : `${id}@trinity.internal`,
  });
  redirectAfterLogin();
}

onMounted(() => {
  if (isAdminSignedIn()) redirectAfterLogin();
});
</script>

<template>
  <div class="admin-login" data-or-page="admin-login">
    <el-card class="admin-login__card" shadow="hover">
      <div class="admin-login__brand">
        <span class="admin-login__mark" aria-hidden="true">T</span>
        <div>
          <h1 class="admin-login__title">Trinity 运营后台</h1>
          <p class="admin-login__sub">聚合平台 · 管理端 · Mock 登录</p>
        </div>
      </div>

      <el-form class="admin-login__form" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="账号">
          <el-input v-model="loginId" name="username" autocomplete="username" placeholder="zhang.san" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="原型不校验，任意输入即可"
            show-password
          />
        </el-form-item>
        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="admin-login__error" />
        <el-button type="primary" native-type="submit" class="admin-login__submit" style="width: 100%">
          登录并进入工作台
        </el-button>
      </el-form>

      <p class="admin-login__hint">
        演示账号 <code>{{ DEMO_ADMIN_CREDENTIALS.loginId }}</code>；正式环境对接 SSO / MFA。
      </p>
    </el-card>
  </div>
</template>
