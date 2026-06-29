import { createRouter, createWebHistory } from "vue-router";
import GeoShellLayout from "../views/shell/GeoShellLayout.vue";
import Home from "../views/Home.vue";
import DemoApp from "../views/demo/DemoApp.vue";

function redirectToMarketing(page: "product.html" | "pricing.html") {
  window.location.assign(`/__geo_marketing/${page}`);
  return false;
}

function redirectToConsole() {
  window.location.assign("/__geo_marketing/console/dashboard.html");
  return false;
}

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/product",
      name: "geo-product",
      beforeEnter: () => redirectToMarketing("product.html"),
    },
    {
      path: "/pricing",
      name: "geo-pricing",
      beforeEnter: () => redirectToMarketing("pricing.html"),
    },
    {
      path: "/product.html",
      redirect: { name: "geo-product" },
    },
    {
      path: "/pricing.html",
      redirect: { name: "geo-pricing" },
    },
    {
      path: "/console",
      name: "geo-console",
      beforeEnter: () => redirectToConsole(),
    },
    {
      path: "/login",
      name: "geo-login",
      beforeEnter: () => redirectToConsole(),
    },
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
