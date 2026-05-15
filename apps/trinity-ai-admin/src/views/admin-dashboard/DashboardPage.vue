<script setup lang="ts">
import { computed } from "vue";
import { useRouter, type RouteRecordName } from "vue-router";
import { TButton } from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./dashboard.css";
import { DASHBOARD_KPIS, DASHBOARD_TODOS, DASHBOARD_WIDGETS, type DashboardKpi } from "./mock";

const router = useRouter();

const todoOpenCount = computed(() => DASHBOARD_TODOS.length);

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

    <!-- 概览指标 -->
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

    <!-- 待办 -->
    <section class="admin-dashboard__panel" aria-label="待办事项">
      <div class="admin-dashboard__panel-head">
        <h2 class="admin-dashboard__panel-title">待办事项</h2>
        <span class="admin-dashboard__panel-badge" :aria-label="`共 ${todoOpenCount} 条`">{{ todoOpenCount }}</span>
      </div>
      <div class="admin-dashboard__table-wrap">
        <table class="admin-dashboard__table">
          <thead>
            <tr>
              <th scope="col">类型</th>
              <th scope="col">摘要</th>
              <th scope="col">单号 / 上下文</th>
              <th scope="col" class="admin-dashboard__th-time">时间</th>
              <th scope="col" class="admin-dashboard__th-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in DASHBOARD_TODOS" :key="t.id">
              <td>
                <span :class="todoKindClass(t.kind)">{{ t.kind }}</span>
              </td>
              <td>
                <div class="admin-dashboard__todo-title-row">
                  <span class="admin-dashboard__todo-title">{{ t.title }}</span>
                  <span v-if="t.urgent" class="admin-dashboard__todo-urgent">紧急</span>
                </div>
              </td>
              <td>
                <span class="admin-dashboard__todo-code">{{ t.code }}</span>
                <span class="admin-dashboard__todo-meta">{{ t.meta }}</span>
              </td>
              <td class="admin-dashboard__todo-time">{{ t.timeLabel }}</td>
              <td class="admin-dashboard__todo-action">
                <TButton variant="outline" type="button" class="admin-dashboard__todo-btn" @click="goTodo(t.routeName)">
                  去处理
                </TButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 快捷入口 -->
    <section class="admin-dashboard__panel" aria-label="快捷入口">
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
        <RouterLink :to="{ name: 'tai-admin-billing-usage' }">
          <TButton variant="outline">打开用量明细</TButton>
        </RouterLink>
        <RouterLink :to="{ name: 'tai-admin-keys-list' }">
          <TButton variant="outline">打开 API 密钥</TButton>
        </RouterLink>
        <RouterLink :to="{ name: 'tai-admin-ops-live' }">
          <TButton variant="outline">打开实时大盘</TButton>
        </RouterLink>
      </p>
    </section>
  </div>
</template>
