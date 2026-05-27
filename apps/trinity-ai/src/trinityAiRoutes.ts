import type { RouteRecordRaw } from "vue-router";
import { getTrinityLegalChildRoutes } from "@trinity/ui";
import { ACCOUNT_CONSOLE_HASH } from "./views/account/mock";
import { getTrinityDocsSiteUrl } from "./trinityDocsSite";
import HomePage from "./views/home/HomePage.vue";

function redirectToDocsSite() {
  window.location.assign(getTrinityDocsSiteUrl());
  return false;
}

/**
 * 子路由表：供独立 `apps/trinity-ai` 与 `apps/trinity-portal` 下 `/trinity-ai` 嵌套复用。
 * 路由 name 带 `tai-` 前缀，避免与 portal 其他应用冲突。
 * `meta.orPage` 与静态壳 `data-or-page` / `buildHeader` 页键对齐。
 */
export function getTrinityAiChildRoutes(): RouteRecordRaw[] {
  return [
    {
      path: "",
      name: "tai-home",
      /** 同步引入，避免首屏 `<RouterView />` 在懒加载 chunk 返回前为空 */
      component: HomePage,
      meta: { title: "首页", orPage: "home" },
    },
    {
      path: "models",
      name: "tai-models",
      component: () => import("./views/models/ModelsPage.vue"),
      meta: { title: "模型", orPage: "models" },
    },
    {
      path: "chat",
      name: "tai-chat",
      component: () => import("./views/chat/ChatPage.vue"),
      meta: { title: "对话", orPage: "chat" },
    },
    {
      path: "docs",
      name: "tai-docs",
      beforeEnter: redirectToDocsSite,
      component: () => import("./views/docs/DocsPage.vue"),
      meta: { title: "文档", orPage: "docs" },
    },
    {
      path: "account/keys",
      redirect: { name: "tai-account-console", hash: "#keys" },
      meta: { title: "API 密钥", orPage: "console" },
    },
    {
      path: "account/billing",
      redirect: { name: "tai-account-console", hash: ACCOUNT_CONSOLE_HASH.CREDITS },
      meta: { title: "额度", orPage: "console" },
    },
    {
      path: "account/login",
      redirect: { name: "tai-home", hash: "#login" },
      meta: { title: "登录", orPage: "home" },
    },
    {
      path: "account/register",
      redirect: { name: "tai-home", hash: "#register" },
      meta: { title: "注册", orPage: "home" },
    },
    {
      path: "account/console",
      name: "tai-account-console",
      component: () => import("./views/account/ConsolePage.vue"),
      meta: { title: "控制台", orPage: "console" },
    },
    {
      path: "dev/ui-kit",
      name: "tai-dev-ui-kit",
      component: () => import("./views/UiKitPlayground.vue"),
      meta: { title: "UI 烟测", orPage: "dev" },
    },
    ...getTrinityLegalChildRoutes(),
  ];
}
