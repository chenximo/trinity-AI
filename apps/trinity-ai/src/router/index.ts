import { createRouter, createWebHistory } from "vue-router";
import TrinityAiShellLayout from "../views/shell/TrinityAiShellLayout.vue";
import { getTrinityAiChildRoutes } from "../trinityAiRoutes";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: TrinityAiShellLayout,
      children: getTrinityAiChildRoutes(),
    },
  ],
});
