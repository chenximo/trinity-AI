import { createRouter, createWebHistory } from "vue-router";
import DesignTokens from "../views/DesignTokens.vue";
import DesignSpec from "../views/DesignSpec.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/design-tokens" },
    { path: "/design-tokens", name: "design-tokens", component: DesignTokens },
    { path: "/design-spec", name: "design-spec", component: DesignSpec },
  ],
});
