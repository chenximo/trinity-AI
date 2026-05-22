import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import { getTrinityDocsSiteUrl } from "@trinity-ai/trinityDocsSite";
import { getAiCloudChildRoutes } from "@app-ai-cloud/aiCloudRoutes";
import { getTrinityAiChildRoutes } from "@trinity-ai/trinityAiRoutes";
import { getTrinityAdminChildRoutes } from "@trinity-ai-admin/trinityAdminRoutes";
import { adminShellAuthGuard } from "@trinity-ai-admin/views/admin-shell/shellInteractions";

/** `/docs` 不在 portal 内渲染；开发时整页打开同源 `/docs/`（Vite 代理到 :5205） */
function leaveHubForDocs(to: RouteLocationNormalized) {
  const rest = to.params.pathMatch;
  const suffix =
    typeof rest === "string" ? rest : Array.isArray(rest) ? rest.filter(Boolean).join("/") : "";
  window.location.assign(getTrinityDocsSiteUrl(suffix ? `/${suffix}` : ""));
  return false;
}

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "portal-home", component: () => import("../views/PortalHome.vue") },
    {
      path: "/docs/:pathMatch(.*)*",
      name: "portal-docs",
      alias: ["/docs"],
      beforeEnter: leaveHubForDocs,
    },
    {
      path: "/design-tokens",
      name: "design-tokens",
      component: () => import("@trinity-design/views/DesignTokens.vue"),
    },
    {
      path: "/design-spec",
      name: "design-spec",
      component: () => import("@trinity-design/views/DesignSpec.vue"),
    },
    {
      path: "/admin-ops-spec",
      name: "admin-ops-spec",
      component: () => import("@trinity-design/views/ops-admin-system/OpsAdminSpecHub.vue"),
      meta: { title: "运营后台列表规范样板" },
    },
    {
      path: "/user-console-spec",
      name: "user-console-spec",
      component: () => import("@trinity-design/views/user-admin-system/UserConsoleSpecHub.vue"),
      meta: { title: "用户后台 · 规范索引" },
    },
    {
      path: "/user-console-preview",
      redirect: { name: "user-console-spec", hash: "#spec-2-main" },
    },
    {
      path: "/trinity-ai-admin/example",
      redirect: { name: "admin-ops-spec" },
    },
    {
      path: "/trinity-ai",
      name: "trinity-ai",
      component: () => import("@trinity-ai/views/shell/TrinityAiShellLayout.vue"),
      children: getTrinityAiChildRoutes(),
    },
    {
      path: "/ai-cloud",
      name: "ai-cloud",
      component: () => import("@app-ai-cloud/views/shell/AiCloudShellLayout.vue"),
      children: getAiCloudChildRoutes(),
    },
    {
      path: "/trinity-geo",
      name: "trinity-geo",
      component: () => import("@trinity-geo/views/Home.vue"),
    },
    {
      path: "/trinity-ai-admin/login",
      name: "tai-admin-login",
      component: () => import("@trinity-ai-admin/views/admin-login/AdminLoginPage.vue"),
      meta: { title: "登录", public: true },
    },
    {
      path: "/trinity-ai-admin/logout",
      name: "tai-admin-logout",
      component: () => import("@trinity-ai-admin/views/admin-logout/AdminLogoutPage.vue"),
      meta: { title: "退出登录", public: true },
    },
    {
      path: "/trinity-ai-admin",
      name: "trinity-ai-admin",
      component: () => import("@trinity-ai-admin/views/admin-shell/AdminShellLayout.vue"),
      beforeEnter: adminShellAuthGuard,
      redirect: { name: "tai-admin-dashboard" },
      children: getTrinityAdminChildRoutes(),
    },
  ],
});
