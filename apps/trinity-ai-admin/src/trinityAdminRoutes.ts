import type { RouteRecordRaw } from "vue-router";
import DashboardPage from "./views/admin-dashboard/DashboardPage.vue";
import OpsPage from "./views/admin-ops/OpsPage.vue";
import BillingPage from "./views/admin-billing/BillingPage.vue";
import AdminStubPage from "./views/admin-shell/AdminStubPage.vue";
import AccessPage from "./views/admin-access/AccessPage.vue";
import SuppliersPage from "./views/admin-suppliers/SuppliersPage.vue";
import ModelsPage from "./views/admin-models/ModelsPage.vue";
import UsersPage from "./views/admin-users/UsersPage.vue";
import KeysPage from "./views/admin-keys/KeysPage.vue";
import CustomersPage from "./views/admin-customers/CustomersPage.vue";
import SystemPage from "./views/admin-system/SystemPage.vue";
import DocsPage from "./views/admin-docs/DocsPage.vue";
import ReportsPage from "./views/admin-reports/ReportsPage.vue";
import RiskPage from "./views/admin-risk/RiskPage.vue";
import { ADMIN_ALL_MODULE_BASES } from "./views/admin-shell/adminNavTree";
import { OPS_TABS } from "./views/admin-ops/mock";
import { BILLING_TABS } from "./views/admin-billing/mock";
import { defaultSecondaryRouteName, getValidSecondaryPages } from "./views/admin-shell/moduleSecondaryPages";

/**
 * 运营后台子路由表：供独立 `apps/trinity-ai-admin` 与 `apps/trinity-portal` 下 **`/trinity-ai-admin`** 嵌套复用。
 * 路由 `name` 带 `tai-admin-` 前缀；**二级页面**为子 path + 子路由名（与侧栏子菜单一致）。
 */
export function getTrinityAdminChildRoutes(): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];

  routes.push({
    path: "dashboard",
    name: "tai-admin-dashboard",
    component: DashboardPage,
    meta: { title: "工作台", designRef: "§4.1", planBatch: "P0" },
  });

  for (const t of OPS_TABS) {
    routes.push({
      path: `ops/${t.id}`,
      name: `tai-admin-ops-${t.id}`,
      component: OpsPage,
      meta: {
        title: t.label,
        designRef: "§4.2",
        planBatch: "P1",
        opsTab: t.id,
      },
    });
  }
  /** 已下线子页：旧书签 / 外链 → 实时大盘 */
  for (const legacy of ["errors", "health", "alerts", "maintenance"] as const) {
    routes.push({ path: `ops/${legacy}`, redirect: { name: "tai-admin-ops-live" } });
  }
  routes.push({
    path: "ops",
    name: "tai-admin-ops",
    redirect: { name: "tai-admin-ops-live" },
  });

  for (const t of BILLING_TABS) {
    routes.push({
      path: `billing/${t.id}`,
      name: `tai-admin-billing-${t.id}`,
      component: BillingPage,
      meta: {
        title: t.label,
        groupTitle: "用量与计费",
        designRef: "§4.3",
        planBatch: "P2",
        billingTab: t.id,
      },
    });
  }
  routes.push({
    path: "billing",
    name: "tai-admin-billing",
    redirect: { name: "tai-admin-billing-usage" },
  });

  /** 旧书签：数据范围独立子页 */
  routes.push({
    path: "access/scope",
    redirect: { name: "tai-admin-access-data-scope" },
  });
  /** 「登录安全」子页已移除；旧链接兼容 */
  routes.push({
    path: "access/login-security",
    redirect: { name: "tai-admin-access-roles" },
  });

  /** API 密钥：旧子 path 兼容 → 平台密钥 */
  /** 旧路由名 / 书签：API 列表 → 平台密钥 */
  routes.push({
    path: "keys/list",
    name: "tai-admin-keys-list",
    redirect: { name: "tai-admin-keys-platform-keys" },
  });
  routes.push({ path: "keys/search", redirect: { name: "tai-admin-keys-platform-keys" } });
  routes.push({ path: "keys/detail", redirect: { name: "tai-admin-keys-platform-keys" } });
  routes.push({ path: "keys/freeze", redirect: { name: "tai-admin-keys-platform-keys" } });
  routes.push({ path: "keys/risk", redirect: { name: "tai-admin-risk-rules" } });

  /** 旧书签：错误二级 id */
  routes.push({ path: "reports/undefined", redirect: { name: "tai-admin-reports-preset" } });

  /** 文档：编辑子页已并入列表（?id=） */
  routes.push({
    path: "docs/editor",
    name: "tai-admin-docs-editor",
    redirect: (to) => ({
      name: "tai-admin-docs-list",
      query: to.query.id ? { id: String(to.query.id) } : {},
    }),
  });

  for (const mod of ADMIN_ALL_MODULE_BASES) {
    const secondaries = getValidSecondaryPages(mod.parentRouteName);
    if (!secondaries.length) continue;
    const PageComponent =
      mod.pathBase === "suppliers"
        ? SuppliersPage
        : mod.pathBase === "models"
          ? ModelsPage
          : mod.pathBase === "access"
            ? AccessPage
            : mod.pathBase === "users"
              ? UsersPage
              : mod.pathBase === "keys"
                ? KeysPage
                : mod.pathBase === "customers"
                  ? CustomersPage
                  : mod.pathBase === "system"
                    ? SystemPage
                    : mod.pathBase === "docs"
                      ? DocsPage
                      : mod.pathBase === "reports"
                        ? ReportsPage
                        : mod.pathBase === "risk"
                          ? RiskPage
                          : AdminStubPage;
    for (const sec of secondaries) {
      routes.push({
        path: `${mod.pathBase}/${sec.id}`,
        name: `${mod.parentRouteName}-${sec.id}`,
        component: PageComponent,
        meta: {
          title: sec.title,
          groupTitle: mod.label,
          designRef: mod.designRef,
          planBatch: mod.planBatch,
          parentRouteName: mod.parentRouteName,
          stubSecondaryId: sec.id,
        },
      });
    }
    const defaultChild = defaultSecondaryRouteName(mod.parentRouteName);
    if (defaultChild) {
      routes.push({
        path: mod.pathBase,
        name: mod.parentRouteName,
        redirect: { name: defaultChild },
      });
    }
  }

  return routes;
}
