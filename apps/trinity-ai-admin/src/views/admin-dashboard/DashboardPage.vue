<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRouter, type RouteRecordName } from "vue-router";
import { ArrowRight, Grid, Key, Management, TrendCharts, WarningFilled } from "@element-plus/icons-vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { filterByQuery } from "../../utils/adminListFilter";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import DashboardKpiIcon from "./DashboardKpiIcon.vue";
import "./dashboard.css";
import {
  DASHBOARD_ANOMALY_HINTS,
  DASHBOARD_KPIS,
  DASHBOARD_MONITOR_KPIS,
  DASHBOARD_QUICK_LINKS,
  DASHBOARD_TODOS,
  DASHBOARD_WIDGETS,
  type DashboardKpi,
} from "./mock";

const router = useRouter();
const idPrefix = useId().replace(/:/g, "");
const todoSearchQ = ref("");
const todoKindFilter = ref("");

const filteredTodos = computed(() => {
  let rows = DASHBOARD_TODOS;
  if (todoKindFilter.value) rows = rows.filter((r) => r.kind === todoKindFilter.value);
  return filterByQuery(rows, todoSearchQ.value, (r) =>
    [r.kind, r.title, r.code, r.meta, r.timeLabel].join(" "),
  );
});

const todoOpenCount = computed(() => filteredTodos.value.length);

function resetTodoQuery(): void {
  todoKindFilter.value = "";
}

function kpiClass(k: DashboardKpi): string {
  return ["admin-dashboard__kpi", k.tone === "ok" && "is-ok", k.tone === "warn" && "is-warn", k.tone === "bad" && "is-bad"]
    .filter(Boolean)
    .join(" ");
}

function todoKindClass(kind: string): string {
  const map: Record<string, string> = {
    用户审核: "is-user",
    合同与授信: "is-contract",
    供应商: "is-supplier",
    计费用量: "is-billing",
    平台权限: "is-access",
  };
  return ["admin-dashboard__todo-kind", map[kind] ?? ""].filter(Boolean).join(" ");
}

function goRoute(routeName: string): void {
  void router.push({ name: routeName as RouteRecordName });
}

const todoPg = useAdminTablePagination(filteredTodos);
</script>

<template>
  <div class="admin-dashboard">
    <AdminSectionHead title="工作台">
      <template #annot>
        <AdminInternalTip heading="工作台 · 原型" explain="工作台对内说明（原型）">
          <p>监控 KPI 对齐 §4.1；趋势与五图见侧栏<strong>实时大盘</strong>。</p>
        </AdminInternalTip>
      </template>

    </AdminSectionHead>

    <div class="admin-dashboard__grid">
      <div class="admin-dashboard__main">
        <el-card shadow="never" class="admin-ep-card" aria-label="概览">
          <div class="admin-dashboard__kpi-section">
            <h3 class="admin-dashboard__kpi-cap">实时监控</h3>
            <div class="admin-dashboard__kpis admin-dashboard__kpis--monitor">
              <div
                v-for="k in DASHBOARD_MONITOR_KPIS"
                :key="k.id"
                :class="kpiClass(k)"
                :data-icon="k.icon"
              >
                <div class="admin-dashboard__kpi-ico" aria-hidden="true">
                  <DashboardKpiIcon :icon="k.icon" />
                </div>
                <div class="admin-dashboard__kpi-body">
                  <div class="admin-dashboard__kpi-label">{{ k.label }}</div>
                  <div class="admin-dashboard__kpi-value">{{ k.value }}</div>
                  <div class="admin-dashboard__kpi-sublabel">{{ k.sublabel }}</div>
                </div>
              </div>
            </div>
            <ul class="admin-dashboard__anomaly" aria-label="异常提示">
              <li v-for="a in DASHBOARD_ANOMALY_HINTS" :key="a.id" :class="a.tone === 'warn' ? 'is-warn' : ''">
                {{ a.label }} <strong>{{ a.value }}</strong>
              </li>
            </ul>
          </div>

          <div class="admin-dashboard__kpi-section admin-dashboard__kpi-section--ops">
            <h3 class="admin-dashboard__kpi-cap">运营摘要</h3>
            <div class="admin-dashboard__kpis admin-dashboard__kpis--ops">
              <div v-for="k in DASHBOARD_KPIS" :key="k.id" :class="kpiClass(k)" :data-icon="k.icon">
                <div class="admin-dashboard__kpi-ico" aria-hidden="true">
                  <DashboardKpiIcon :icon="k.icon" />
                </div>
                <div class="admin-dashboard__kpi-body">
                  <div class="admin-dashboard__kpi-label">{{ k.label }}</div>
                  <div class="admin-dashboard__kpi-value">{{ k.value }}</div>
                  <div class="admin-dashboard__kpi-delta">{{ k.delta }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="admin-ep-card" aria-label="待办事项">
          <div class="admin-dashboard__panel-head">
            <h2 class="admin-dashboard__panel-title">待办事项</h2>
            <span class="admin-dashboard__panel-badge" :aria-label="`共 ${todoOpenCount} 条`">{{ todoOpenCount }}</span>
            <AdminListQuery
              v-model:search="todoSearchQ"
              :input-id="`${idPrefix}-dash-todo-q`"
              search-placeholder="类型、摘要、单号…"
              search-aria-label="检索待办"
              class="admin-dashboard__todo-query"
              @reset="resetTodoQuery"
            >
              <template #filters>
                <el-select v-model="todoKindFilter" clearable placeholder="类型" style="width: 8rem">
                  <el-option label="用户审核" value="用户审核" />
                  <el-option label="合同与授信" value="合同与授信" />
                  <el-option label="供应商" value="供应商" />
                  <el-option label="计费用量" value="计费用量" />
                  <el-option label="平台权限" value="平台权限" />
                </el-select>
              </template>
            </AdminListQuery>
          </div>
          <el-table :data="todoPg.paginatedRows" row-key="id" class="admin-ep-table-wrap">
            <el-table-column label="类型" width="100">
              <template #default="scope">
                <span v-if="scope?.row" :class="todoKindClass(scope.row.kind)">{{ scope.row.kind }}</span>
              </template>
            </el-table-column>
            <el-table-column label="摘要" min-width="140">
              <template #default="scope">
                <div v-if="scope?.row" class="admin-dashboard__todo-title-row">
                  <span class="admin-dashboard__todo-title">{{ scope.row.title }}</span>
                  <span v-if="scope.row.urgent" class="admin-dashboard__todo-urgent">紧急</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单号 / 上下文" min-width="160">
              <template #default="scope">
                <template v-if="scope?.row">
                  <span class="admin-dashboard__todo-code">{{ scope.row.code }}</span>
                  <span class="admin-dashboard__todo-meta">{{ scope.row.meta }}</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="timeLabel" label="时间" width="120" class-name="admin-dashboard__th-time" sortable />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <div v-if="scope?.row" class="admin-ep-row-actions" @click.stop>
                  <el-button link type="primary" @click="goRoute(scope.row.routeName)">
                    <el-icon><ArrowRight /></el-icon>
                    去处理
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <AdminTablePagination
            v-model:current-page="todoPg.currentPage"
            v-model:page-size="todoPg.pageSize"
            :total="todoPg.total"
          />
        </el-card>
      </div>

      <aside class="admin-dashboard__side" aria-label="快捷入口与提醒">
        <el-card shadow="never" class="admin-ep-card">
          <h3 class="admin-dashboard__side-title">常用入口</h3>
          <nav class="admin-dashboard__nav-links">
            <button
              v-for="(w, i) in DASHBOARD_QUICK_LINKS"
              :key="w.id"
              type="button"
              class="admin-dashboard__nav-link"
              @click="goRoute(w.routeName)"
            >
              <span class="admin-dashboard__nav-link-ico">
                <el-icon v-if="i === 0"><Management /></el-icon>
                <el-icon v-else-if="i === 1"><Key /></el-icon>
                <el-icon v-else-if="i === 2"><TrendCharts /></el-icon>
                <el-icon v-else-if="i === 3"><WarningFilled /></el-icon>
                <el-icon v-else><Grid /></el-icon>
              </span>
              <span class="admin-dashboard__nav-link-text">
                <span class="admin-dashboard__nav-link-title">{{ w.title }}</span>
                <span class="admin-dashboard__nav-link-desc">{{ w.summary }}</span>
              </span>
              <el-icon class="admin-dashboard__nav-link-arrow"><ArrowRight /></el-icon>
            </button>
          </nav>
          <el-button type="primary" plain class="admin-dashboard__ops-link" @click="goRoute('tai-admin-ops-live')">
            打开实时大盘 →
          </el-button>
        </el-card>

        <el-card shadow="never" class="admin-ep-card">
          <h3 class="admin-dashboard__side-title">运行提醒</h3>
          <div class="admin-dashboard__alerts">
            <button
              v-for="w in DASHBOARD_WIDGETS"
              :key="w.id"
              type="button"
              class="admin-dashboard__alert"
              @click="goRoute(w.routeName)"
            >
              <el-icon class="admin-dashboard__alert-icon"><WarningFilled /></el-icon>
              <span class="admin-dashboard__alert-text">
                <span class="admin-dashboard__alert-title">{{ w.title }}</span>
                <span class="admin-dashboard__alert-summary">{{ w.summary }}</span>
              </span>
              <el-icon class="admin-dashboard__alert-arrow"><ArrowRight /></el-icon>
            </button>
          </div>
        </el-card>
      </aside>
    </div>
  </div>
</template>
