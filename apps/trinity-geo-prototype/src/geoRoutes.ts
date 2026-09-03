import type { RouteRecordRaw } from "vue-router";
import Home from "./views/Home.vue";
import GeoConsoleLayout from "./views/shell/GeoConsoleLayout.vue";
import DashboardPage from "./views/dashboard/DashboardPage.vue";

function redirectToMarketing(page: "product.html" | "pricing.html") {
  window.location.assign(`/__geo_marketing/${page}`);
  return false;
}

/** 控制台子路由：独立 `/console` 与门户 `/trinity-geo/console` 共用 */
export function getGeoConsoleChildRoutes(): RouteRecordRaw[] {
  return [
    {
      path: "",
      name: "geo-dashboard",
      component: DashboardPage,
      meta: { nav: "dashboard", title: "可见性总览" },
    },
    {
      path: "citations",
      name: "geo-citations",
      component: () => import("./views/citations/CitationsPage.vue"),
      meta: { nav: "citations", title: "引用与信源" },
    },
    {
      path: "sentiment",
      name: "geo-sentiment",
      component: () => import("./views/sentiment/SentimentPage.vue"),
      meta: { nav: "sentiment", title: "情感与口碑" },
    },
    {
      path: "monitoring",
      name: "geo-monitoring",
      component: () => import("./views/monitoring/MonitoringPage.vue"),
      meta: { nav: "monitoring", title: "监测采集" },
    },
    {
      path: "keywords",
      name: "geo-keywords",
      component: () => import("./views/keywords/KeywordsPage.vue"),
      meta: { nav: "monitoring", title: "问题集管理" },
    },
    {
      path: "keyword-detail",
      name: "geo-keyword-detail",
      component: () => import("./views/keyword-detail/KeywordDetailPage.vue"),
      meta: { nav: "monitoring", title: "关键词详情" },
    },
    {
      path: "answer-detail",
      name: "geo-answer-detail",
      component: () => import("./views/answer-detail/AnswerDetailPage.vue"),
      meta: { nav: "monitoring", title: "回答详情" },
    },
    {
      path: "answer-detail-brand",
      name: "geo-answer-detail-brand",
      component: () => import("./views/answer-detail-brand/AnswerDetailBrandPage.vue"),
      meta: { nav: "monitoring", title: "回答详情 CCR" },
    },
    {
      path: "competitors",
      name: "geo-competitors",
      component: () => import("./views/competitors/CompetitorsPage.vue"),
      meta: { nav: "competitors", title: "竞品概览" },
    },
    {
      path: "competitors-manage",
      name: "geo-competitors-manage",
      component: () => import("./views/competitors-manage/CompetitorsManagePage.vue"),
      meta: { nav: "competitors", title: "竞品管理" },
    },
    {
      path: "competitor-detail",
      name: "geo-competitor-detail",
      component: () => import("./views/competitor-detail/CompetitorDetailPage.vue"),
      meta: { nav: "competitors", title: "竞品详情" },
    },
    {
      path: "diagnosis",
      name: "geo-diagnosis",
      component: () => import("./views/diagnosis/DiagnosisPage.vue"),
      meta: { nav: "diagnosis", title: "诊断列表" },
    },
    {
      path: "audit",
      name: "geo-audit",
      component: () => import("./views/audit/AuditPage.vue"),
      meta: { nav: "diagnosis", title: "页面审计" },
    },
    {
      path: "audit-reports",
      name: "geo-audit-reports",
      component: () => import("./views/audit-reports/AuditReportsPage.vue"),
      meta: { nav: "diagnosis", title: "审计报告" },
    },
    {
      path: "optimize",
      name: "geo-optimize",
      component: () => import("./views/optimize/OptimizePage.vue"),
      meta: { nav: "optimize", title: "优化待办" },
    },
    {
      path: "optimize-detail",
      name: "geo-optimize-detail",
      component: () => import("./views/optimize-detail/OptimizeDetailPage.vue"),
      meta: { nav: "optimize", title: "优化详情" },
    },
    {
      path: "verify",
      name: "geo-verify",
      component: () => import("./views/verify/VerifyPage.vue"),
      meta: { nav: "optimize", title: "效果验证" },
    },
    {
      path: "reports",
      name: "geo-reports",
      component: () => import("./views/reports/ReportsPage.vue"),
      meta: { nav: "reports", title: "报告列表" },
    },
    {
      path: "report-preview",
      name: "geo-report-preview",
      component: () => import("./views/report-preview/ReportPreviewPage.vue"),
      meta: { nav: "reports", title: "报告预览" },
    },
    {
      path: "brand-settings",
      name: "geo-settings-brand",
      component: () => import("./views/brand-settings/BrandSettingsPage.vue"),
      meta: { nav: "settings", title: "品牌设置" },
    },
    {
      path: "settings-account",
      name: "geo-settings-account",
      component: () => import("./views/settings-account/SettingsAccountPage.vue"),
      meta: { nav: "settings", title: "账户与套餐" },
    },
    {
      path: "settings-notifications",
      name: "geo-settings-notifications",
      component: () => import("./views/settings-notifications/SettingsNotificationsPage.vue"),
      meta: { nav: "settings", title: "通知与告警" },
    },
  ];
}

/** 门户 `/trinity-geo` 子路由（含营销 iframe 首页 + 控制台） */
export function getTrinityGeoChildRoutes(): RouteRecordRaw[] {
  return [
    {
      path: "",
      name: "trinity-geo",
      component: Home,
      meta: { title: "Trinity GEO" },
    },
    {
      path: "demo",
      name: "trinity-geo-demo-retired",
      redirect: { name: "geo-dashboard" },
    },
    {
      path: "login",
      name: "trinity-geo-login",
      redirect: { name: "geo-dashboard" },
    },
    {
      path: "product",
      name: "trinity-geo-product",
      beforeEnter: () => redirectToMarketing("product.html"),
    },
    {
      path: "pricing",
      name: "trinity-geo-pricing",
      beforeEnter: () => redirectToMarketing("pricing.html"),
    },
    { path: "product.html", redirect: { name: "trinity-geo-product" } },
    { path: "pricing.html", redirect: { name: "trinity-geo-pricing" } },
    {
      path: "console",
      component: GeoConsoleLayout,
      children: getGeoConsoleChildRoutes(),
    },
  ];
}
