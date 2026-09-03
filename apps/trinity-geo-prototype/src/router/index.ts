import { createRouter, createWebHistory } from "vue-router";
import { getGeoConsoleChildRoutes } from "../geoRoutes";
import GeoShellLayout from "../views/shell/GeoShellLayout.vue";
import GeoConsoleLayout from "../views/shell/GeoConsoleLayout.vue";
import Home from "../views/Home.vue";

function redirectToMarketing(page: "product.html" | "pricing.html") {
  window.location.assign(`/__geo_marketing/${page}`);
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
      component: GeoConsoleLayout,
      children: getGeoConsoleChildRoutes(),
    },
    {
      path: "/login",
      name: "geo-login",
      redirect: { name: "geo-dashboard" },
    },
    {
      path: "/demo",
      name: "geo-demo-retired",
      redirect: { name: "geo-dashboard" },
    },
    {
      path: "/",
      component: GeoShellLayout,
      children: [{ path: "", name: "home", component: Home }],
    },
  ],
});
