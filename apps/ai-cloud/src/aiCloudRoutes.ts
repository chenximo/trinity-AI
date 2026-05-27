import type { RouteRecordRaw } from "vue-router";
import { getTrinityLegalChildRoutes } from "@trinity/ui";
import HomePage from "./views/home/HomePage.vue";

/**
 * 子路由：供 `apps/ai-cloud` 独立 dev 与 `trinity-portal` 下 `/ai-cloud` 嵌套复用。
 */
export function getAiCloudChildRoutes(): RouteRecordRaw[] {
  return [
    {
      path: "",
      name: "aic-home",
      component: HomePage,
      meta: { title: "Trinity AI 云", orPage: "home", fullPage: true },
    },
    {
      path: "account/console",
      name: "aic-account-console",
      component: () => import("./views/account/ConsolePage.vue"),
      meta: { title: "用户中心", orPage: "console" },
    },
    ...getTrinityLegalChildRoutes(),
  ];
}
