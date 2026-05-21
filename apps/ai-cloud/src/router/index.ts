import { createRouter, createWebHistory } from "vue-router";
import { getAiCloudChildRoutes } from "../aiCloudRoutes";
import AiCloudShellLayout from "../views/shell/AiCloudShellLayout.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: AiCloudShellLayout,
      children: getAiCloudChildRoutes(),
    },
  ],
});
