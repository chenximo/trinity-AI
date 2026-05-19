<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import "../../styles/admin-theme.css";
import "../admin-login/admin-login.css";
import "./admin-logout.css";
import { adminUserInitials, type AdminSessionUser } from "../admin-shell/sessionMock";
import { isAdminSignedIn, readAdminSession, signOutAdmin } from "../admin-shell/shellInteractions";

const router = useRouter();
const sessionUser = ref<AdminSessionUser | null>(null);
const loading = ref(false);

const userInitials = computed(() =>
  sessionUser.value ? adminUserInitials(sessionUser.value) : "?",
);

function goLogin(signedOut = false): void {
  void router.replace({
    name: "tai-admin-login",
    query: signedOut ? { signedOut: "1" } : undefined,
  });
}

function onCancel(): void {
  void router.replace({ name: "tai-admin-dashboard" });
}

function onConfirm(): void {
  loading.value = true;
  signOutAdmin();
  loading.value = false;
  goLogin(true);
}

onMounted(() => {
  if (!isAdminSignedIn()) {
    goLogin();
    return;
  }
  sessionUser.value = readAdminSession();
});
</script>

<template>
  <div class="admin-login admin-logout" data-or-page="admin-logout">
    <div class="admin-logout__card">
      <p class="admin-logout__eyebrow">Trinity 运营后台</p>

      <template v-if="sessionUser">
        <div class="admin-logout__hero">
          <span class="admin-logout__avatar" aria-hidden="true">{{ userInitials }}</span>
          <h1 class="admin-logout__name">{{ sessionUser.displayName }}</h1>
          <p class="admin-logout__account">{{ sessionUser.loginId }}</p>
          <span class="admin-logout__role">{{ sessionUser.roleLabel }}</span>
        </div>

        <p class="admin-logout__lead">确定退出当前账号？退出后需重新登录才能继续操作。</p>

        <div class="admin-logout__actions">
          <el-button size="large" @click="onCancel">返回工作台</el-button>
          <el-button type="danger" size="large" :loading="loading" @click="onConfirm">
            {{ loading ? "退出中…" : "退出登录" }}
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>
