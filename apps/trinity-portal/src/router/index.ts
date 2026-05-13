import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "portal-home", component: () => import("../views/PortalHome.vue") },
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
      path: "/trinity-ai",
      name: "trinity-ai",
      component: () => import("@trinity-ai/views/Home.vue"),
    },
    {
      path: "/ai-cloud",
      name: "ai-cloud",
      component: () => import("@app-ai-cloud/views/Home.vue"),
    },
    {
      path: "/trinity-geo",
      name: "trinity-geo",
      component: () => import("@trinity-geo/views/Home.vue"),
    },
    {
      path: "/trinity-ai-admin",
      name: "trinity-ai-admin",
      component: () => import("@trinity-ai-admin/views/Home.vue"),
    },
  ],
});
