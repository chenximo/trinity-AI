import { createRouter, createWebHistory } from "vue-router";
import DesignTokens from "../views/DesignTokens.vue";
import DesignSpec from "../views/DesignSpec.vue";
import OpsAdminSpecHub from "../views/ops-admin-system/OpsAdminSpecHub.vue";
import UserConsoleSpecHub from "../views/user-admin-system/UserConsoleSpecHub.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/design-tokens" },
    { path: "/design-tokens", name: "design-tokens", component: DesignTokens },
    { path: "/design-spec", name: "design-spec", component: DesignSpec },
    {
      path: "/admin-ops-spec",
      name: "admin-ops-spec",
      component: OpsAdminSpecHub,
      meta: { title: "运营后台列表规范样板" },
    },
    {
      path: "/user-console-spec",
      name: "user-console-spec",
      component: UserConsoleSpecHub,
      meta: { title: "用户后台 · 规范索引" },
    },
    {
      path: "/user-console-preview",
      redirect: { name: "user-console-spec", hash: "#spec-2-main" },
    },
    { path: "/trinity-ai-admin/example", redirect: { name: "admin-ops-spec" } },
  ],
});
