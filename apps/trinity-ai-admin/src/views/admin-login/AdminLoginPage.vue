<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Lock, User } from "@element-plus/icons-vue";
import { computed, onMounted, reactive, ref } from "vue";
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
const formRef = ref<FormInstance>();
const loading = ref(false);

const signedOutNotice = computed(() => route.query.signedOut === "1");

const form = reactive({
  loginId: DEMO_ADMIN_CREDENTIALS.loginId,
  password: "",
});

const rules: FormRules = {
  loginId: [
    { required: true, message: "请输入账号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9._@]+$/,
      message: "账号格式不正确",
      trigger: "blur",
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

function isAuthFlowPath(path: string): boolean {
  return path.includes("/login") || path.includes("/logout");
}

function redirectAfterLogin(): void {
  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";
  if (redirect && redirect !== "/" && !isAuthFlowPath(redirect)) {
    void router.replace(redirect);
    return;
  }
  void router.replace({ name: "tai-admin-dashboard" });
}

async function onSubmit(): Promise<void> {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  const id = form.loginId.trim().toLowerCase();
  if (id !== DEMO_ADMIN_CREDENTIALS.loginId) {
    loading.value = false;
    ElMessage.error("演示环境请使用账号 zhang.san");
    return;
  }

  signInAdmin({
    ...DEFAULT_ADMIN_SESSION_USER,
    loginId: id,
    email: id.includes("@") ? id : `${id}@trinity.internal`,
  });
  loading.value = false;
  redirectAfterLogin();
}

onMounted(() => {
  if (isAdminSignedIn()) redirectAfterLogin();
});
</script>

<template>
  <div class="admin-login" data-or-page="admin-login">
    <div class="admin-login__card">
      <div class="admin-login__hero">
        <span class="admin-login__mark" aria-hidden="true">T</span>
        <h1 class="admin-login__title">Trinity 运营后台</h1>
        <p class="admin-login__sub">聚合平台 · 管理端</p>
      </div>

      <p v-if="signedOutNotice" class="admin-login__notice" role="status">已安全退出，请重新登录</p>

      <el-form
        ref="formRef"
        class="admin-login__form"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="账号" prop="loginId">
          <el-input
            v-model="form.loginId"
            name="username"
            autocomplete="username"
            placeholder="登录名或邮箱"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          class="admin-login__submit"
          :loading="loading"
        >
          {{ loading ? "登录中…" : "登录" }}
        </el-button>
      </el-form>

      <p class="admin-login__demo">
        <span class="admin-login__demo-label">演示账号</span>
        <code>{{ DEMO_ADMIN_CREDENTIALS.loginId }}</code>
      </p>
    </div>
  </div>
</template>
