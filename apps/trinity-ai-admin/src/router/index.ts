import { createRouter, createWebHistory } from "vue-router";
import AdminLoginPage from "../views/admin-login/AdminLoginPage.vue";
import AdminLogoutPage from "../views/admin-logout/AdminLogoutPage.vue";
import AdminShellLayout from "../views/admin-shell/AdminShellLayout.vue";
import { adminShellAuthGuard } from "../views/admin-shell/shellInteractions";
import { getTrinityAdminChildRoutes } from "../trinityAdminRoutes";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "tai-admin-login",
      component: AdminLoginPage,
      meta: { title: "登录", public: true },
    },
    {
      path: "/logout",
      name: "tai-admin-logout",
      component: AdminLogoutPage,
      meta: { title: "退出登录", public: true },
    },
    {
      path: "/",
      component: AdminShellLayout,
      beforeEnter: adminShellAuthGuard,
      redirect: { name: "tai-admin-dashboard" },
      children: getTrinityAdminChildRoutes(),
    },
  ],
});
