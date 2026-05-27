import type { RouteRecordRaw } from "vue-router";
import { TRINITY_LEGAL_ROUTE_NAMES } from "./types";

/**
 * 协议页子路由：合并进各应用 shell 的 `children`（与 `tai-home` 同级）。
 * 路径：`/legal/privacy` · `/legal/terms` · `/legal/model-terms`
 */
export function getTrinityLegalChildRoutes(): RouteRecordRaw[] {
  return [
    {
      path: "legal/privacy",
      name: TRINITY_LEGAL_ROUTE_NAMES.privacy,
      component: () => import("./TrinityPrivacyPolicyPage.vue"),
      meta: { title: "隐私政策", orPage: "legal" },
    },
    {
      path: "legal/terms",
      name: TRINITY_LEGAL_ROUTE_NAMES.terms,
      component: () => import("./TrinityTermsOfServicePage.vue"),
      meta: { title: "服务条款", orPage: "legal" },
    },
    {
      path: "legal/model-terms",
      name: TRINITY_LEGAL_ROUTE_NAMES.modelTerms,
      component: () => import("./TrinityModelTermsPage.vue"),
      meta: { title: "模型使用条款", orPage: "legal" },
    },
  ];
}
