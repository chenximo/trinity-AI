import { createRouter, createWebHistory } from "vue-router";
import { getGeoConsoleChildRoutes } from "../geoRoutes";
import GeoConsoleLayout from "../views/shell/GeoConsoleLayout.vue";
import MarketingHomePage from "../views/marketing/home/MarketingHomePage.vue";
import MarketingSiteLayout from "../views/marketing/shell/MarketingSiteLayout.vue";

function redirectToPrototypeMarketing(page: "product.html" | "pricing.html") {
  window.location.assign(`/__geo_marketing/${page}`);
  return false;
}

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/console",
      component: GeoConsoleLayout,
      children: getGeoConsoleChildRoutes(),
    },
    {
      path: "/product",
      name: "geo-product",
      beforeEnter: () => redirectToPrototypeMarketing("product.html"),
    },
    {
      path: "/pricing",
      name: "geo-pricing",
      beforeEnter: () => redirectToPrototypeMarketing("pricing.html"),
    },
    {
      path: "/login",
      redirect: { name: "geo-dashboard" },
    },
    {
      path: "/demo",
      redirect: { name: "geo-dashboard" },
    },
    {
      path: "/",
      component: MarketingSiteLayout,
      children: [{ path: "", name: "trinity-geo", component: MarketingHomePage }],
    },
  ],
});
