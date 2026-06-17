import { createRouter, createWebHistory } from "vue-router";
import GeoShellLayout from "../views/shell/GeoShellLayout.vue";
import Home from "../views/Home.vue";
import DemoApp from "../views/demo/DemoApp.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: GeoShellLayout,
      children: [
        { path: "", name: "home", component: Home },
        { path: "demo", name: "demo", component: DemoApp },
      ],
    },
  ],
});
