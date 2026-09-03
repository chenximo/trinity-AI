import type { RouteRecordRaw } from "vue-router";
import GeoConsoleLayout from "./views/shell/GeoConsoleLayout.vue";
import DashboardPage from "./views/dashboard/DashboardPage.vue";
import KeywordsPage from "./views/keywords/KeywordsPage.vue";
import KeywordDetailPage from "./views/keyword-detail/KeywordDetailPage.vue";
import AnswerDetailPage from "./views/answer-detail/AnswerDetailPage.vue";
import AnswerDetailBrandPage from "./views/answer-detail-brand/AnswerDetailBrandPage.vue";
import DiagnosisPage from "./views/diagnosis/DiagnosisPage.vue";
import AuditPage from "./views/audit/AuditPage.vue";
import AuditReportsPage from "./views/audit-reports/AuditReportsPage.vue";
import OptimizePage from "./views/optimize/OptimizePage.vue";
import OptimizeDetailPage from "./views/optimize-detail/OptimizeDetailPage.vue";
import VerifyPage from "./views/verify/VerifyPage.vue";
import CitationsPage from "./views/citations/CitationsPage.vue";
import SentimentPage from "./views/sentiment/SentimentPage.vue";
import MonitoringPage from "./views/monitoring/MonitoringPage.vue";
import CompetitorsPage from "./views/competitors/CompetitorsPage.vue";
import CompetitorsManagePage from "./views/competitors-manage/CompetitorsManagePage.vue";
import CompetitorDetailPage from "./views/competitor-detail/CompetitorDetailPage.vue";
import ReportsPage from "./views/reports/ReportsPage.vue";
import ReportPreviewPage from "./views/report-preview/ReportPreviewPage.vue";
import BrandSettingsPage from "./views/brand-settings/BrandSettingsPage.vue";
import SettingsAccountPage from "./views/settings-account/SettingsAccountPage.vue";
import SettingsNotificationsPage from "./views/settings-notifications/SettingsNotificationsPage.vue";
import MarketingHomePage from "./views/marketing/home/MarketingHomePage.vue";
import MarketingSiteLayout from "./views/marketing/shell/MarketingSiteLayout.vue";

function redirectToPrototypeMarketing(page: "index.html" | "product.html" | "pricing.html") {
  const path = page === "index.html" ? "/__geo_marketing/" : `/__geo_marketing/${page}`;
  window.location.assign(path);
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
      component: CitationsPage,
      meta: { nav: "citations", title: "引用与信源" },
    },
    {
      path: "sentiment",
      name: "geo-sentiment",
      component: SentimentPage,
      meta: { nav: "sentiment", title: "情感与口碑" },
    },
    {
      path: "monitoring",
      name: "geo-monitoring",
      component: MonitoringPage,
      meta: { nav: "monitoring", title: "监测采集" },
    },
    {
      path: "keywords",
      name: "geo-keywords",
      component: KeywordsPage,
      meta: { nav: "monitoring", title: "问题集管理" },
    },
    {
      path: "keyword-detail",
      name: "geo-keyword-detail",
      component: KeywordDetailPage,
      meta: { nav: "monitoring", title: "关键词详情" },
    },
    {
      path: "answer-detail",
      name: "geo-answer-detail",
      component: AnswerDetailPage,
      meta: { nav: "monitoring", title: "回答详情" },
    },
    {
      path: "answer-detail-brand",
      name: "geo-answer-detail-brand",
      component: AnswerDetailBrandPage,
      meta: { nav: "monitoring", title: "回答详情 CCR" },
    },
    {
      path: "competitors",
      name: "geo-competitors",
      component: CompetitorsPage,
      meta: { nav: "competitors", title: "竞品概览" },
    },
    {
      path: "competitors-manage",
      name: "geo-competitors-manage",
      component: CompetitorsManagePage,
      meta: { nav: "competitors", title: "竞品管理" },
    },
    {
      path: "competitor-detail",
      name: "geo-competitor-detail",
      component: CompetitorDetailPage,
      meta: { nav: "competitors", title: "竞品详情" },
    },
    {
      path: "diagnosis",
      name: "geo-diagnosis",
      component: DiagnosisPage,
      meta: { nav: "diagnosis", title: "诊断列表" },
    },
    {
      path: "audit",
      name: "geo-audit",
      component: AuditPage,
      meta: { nav: "diagnosis", title: "页面审计" },
    },
    {
      path: "audit-reports",
      name: "geo-audit-reports",
      component: AuditReportsPage,
      meta: { nav: "diagnosis", title: "审计报告" },
    },
    {
      path: "optimize",
      name: "geo-optimize",
      component: OptimizePage,
      meta: { nav: "optimize", title: "优化待办" },
    },
    {
      path: "optimize-detail",
      name: "geo-optimize-detail",
      component: OptimizeDetailPage,
      meta: { nav: "optimize", title: "优化详情" },
    },
    {
      path: "verify",
      name: "geo-verify",
      component: VerifyPage,
      meta: { nav: "optimize", title: "效果验证" },
    },
    {
      path: "reports",
      name: "geo-reports",
      component: ReportsPage,
      meta: { nav: "reports", title: "报告列表" },
    },
    {
      path: "report-preview",
      name: "geo-report-preview",
      component: ReportPreviewPage,
      meta: { nav: "reports", title: "报告预览" },
    },
    {
      path: "brand-settings",
      name: "geo-settings-brand",
      component: BrandSettingsPage,
      meta: { nav: "settings", title: "品牌设置" },
    },
    {
      path: "settings-account",
      name: "geo-settings-account",
      component: SettingsAccountPage,
      meta: { nav: "settings", title: "账户与套餐" },
    },
    {
      path: "settings-notifications",
      name: "geo-settings-notifications",
      component: SettingsNotificationsPage,
      meta: { nav: "settings", title: "通知与告警" },
    },
  ];
}

/** 门户 `/trinity-geo` 子路由 */
export function getTrinityGeoChildRoutes(): RouteRecordRaw[] {
  return [
    {
      path: "",
      component: MarketingSiteLayout,
      children: [
        {
          path: "",
          name: "trinity-geo",
          component: MarketingHomePage,
          meta: { title: "Trinity GEO" },
        },
      ],
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
      beforeEnter: () => redirectToPrototypeMarketing("product.html"),
    },
    {
      path: "pricing",
      name: "trinity-geo-pricing",
      beforeEnter: () => redirectToPrototypeMarketing("pricing.html"),
    },
    { path: "product.html", redirect: { name: "trinity-geo-product" } },
    { path: "pricing.html", redirect: { name: "trinity-geo-pricing" } },
    {
      path: "console",
      component: GeoConsoleLayout,
      children: getGeoConsoleChildRoutes(),
    },
    {
      path: "prototype",
      name: "trinity-geo-prototype",
      beforeEnter: () => redirectToPrototypeMarketing("index.html"),
    },
  ];
}
