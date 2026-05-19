<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRouter, type RouteRecordName } from "vue-router";
import { Right } from "@element-plus/icons-vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { filterByQuery } from "../../utils/adminListFilter";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import "./dashboard.css";
import { DASHBOARD_KPIS, DASHBOARD_TODOS, DASHBOARD_WIDGETS, type DashboardKpi } from "./mock";

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

function goTodo(routeName: string): void {
  void router.push({ name: routeName as RouteRecordName });
}

const todoPg = useAdminTablePagination(filteredTodos);
</script>

<template>
  <div class="admin-dashboard">
    <AdminSectionHead title="工作台">
      <template #annot>
        <AdminInternalTip heading="工作台 · 原型" explain="工作台对内说明（原型）">
          <p>
            KPI、待办、快捷入口为 mock。<strong>调用量趋势（7 日）</strong>与<strong>近 24h 错误码分布</strong>已迁至侧栏
            <strong>实时大盘</strong>。
          </p>
        </AdminInternalTip>
      </template>
      <template #desc>聚合调用、待办与快捷入口（mock）；趋势与错误分布见「实时大盘」。</template>
    </AdminSectionHead>

    <el-card shadow="never" class="admin-ep-card" aria-label="概览指标">
      <section class="admin-dashboard__panel" aria-label="概览指标">
        <div class="admin-dashboard__kpis">
          <div v-for="k in DASHBOARD_KPIS" :key="k.id" :class="kpiClass(k)" :data-icon="k.icon">
            <div class="admin-dashboard__kpi-ico" aria-hidden="true">
              <svg v-if="k.icon === 'activity'" viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
                <path
                  d="M4 14.5 8 10l3 3 5-6 4 5"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg v-else-if="k.icon === 'shield'" viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
                <path
                  d="M12 3 5 6v5c0 4 3.2 7.4 7 8 3.8-.6 7-4 7-8V6l-7-3Z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
              </svg>
              <svg v-else-if="k.icon === 'users'" viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
                <circle cx="9" cy="8" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <circle cx="15" cy="8" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <path
                  d="M4 20c0-3 2.5-5 5-5h6c2.5 0 5 2 5 5"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="admin-dashboard__kpi-svg">
                <path
                  d="M4 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                  stroke="currentColor"
                  stroke-width="1.75"
                />
                <path d="M16 12h3v4h-3" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="admin-dashboard__kpi-body">
              <div class="admin-dashboard__kpi-label">{{ k.label }}</div>
              <div class="admin-dashboard__kpi-value">{{ k.value }}</div>
              <div class="admin-dashboard__kpi-sublabel">{{ k.sublabel }}</div>
              <div class="admin-dashboard__kpi-delta">{{ k.delta }}</div>
            </div>
          </div>
        </div>
      </section>
    </el-card>

    <el-card shadow="never" class="admin-ep-card" aria-label="待办事项">
      <section aria-label="待办事项">
        <div class="admin-dashboard__panel-head">
          <h2 class="admin-dashboard__panel-title">待办事项</h2>
          <span class="admin-dashboard__panel-badge" :aria-label="`共 ${todoOpenCount} 条`">{{ todoOpenCount }}</span>
          <AdminListQuery
            v-model:search="todoSearchQ"
            :input-id="`${idPrefix}-dash-todo-q`"
            search-placeholder="类型、摘要、单号…"
            search-aria-label="检索待办"
            @reset="resetTodoQuery"
            style="margin-left: auto"
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
          <el-table-column prop="timeLabel" label="时间" width="120" class-name="admin-dashboard__th-time" sortable/>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <div v-if="scope?.row" class="admin-ep-row-actions">
                <el-button link type="primary" @click="goTodo(scope.row.routeName)">
                  <el-icon><Right /></el-icon>
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
      </section>
    </el-card>

    <el-card shadow="never" class="admin-ep-card" aria-label="快捷入口">
      <section aria-label="快捷入口">
        <h2 class="admin-dashboard__panel-title admin-dashboard__panel-title--sm">快捷入口</h2>
        <div class="admin-dashboard__shortcuts">
          <RouterLink
            v-for="w in DASHBOARD_WIDGETS"
            :key="w.id"
            class="admin-dashboard__shortcut"
            :to="{ name: w.routeName }"
          >
            <span class="admin-dashboard__shortcut-title">{{ w.title }}</span>
            <span class="admin-dashboard__shortcut-summary">{{ w.summary }}</span>
            <span class="admin-dashboard__shortcut-go">进入 →</span>
          </RouterLink>
        </div>
        <p class="admin-dashboard__foot-actions">
          <RouterLink v-slot="{ navigate }" :to="{ name: 'tai-admin-billing-usage' }" custom>
            <el-button @click="navigate">打开用量明细</el-button>
          </RouterLink>
          <RouterLink v-slot="{ navigate }" :to="{ name: 'tai-admin-keys-list' }" custom>
            <el-button @click="navigate">打开 API 密钥</el-button>
          </RouterLink>
          <RouterLink v-slot="{ navigate }" :to="{ name: 'tai-admin-ops-live' }" custom>
            <el-button @click="navigate">打开实时大盘</el-button>
          </RouterLink>
        </p>
      </section>
    </el-card>
  </div>
</template>
