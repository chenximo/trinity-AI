<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId } from "vue";
import { useRouter, type RouteRecordName } from "vue-router";
import { Refresh, WarningFilled } from "@element-plus/icons-vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import { ADMIN_TABLE_COL, ADMIN_TABLE_COL_OPS } from "../../utils/adminTableColumns";
import "./ops.css";
import {
  OPS_CALL_TREND_7D,
  OPS_ERROR_DIST_24H,
  OPS_ERROR_TOP,
  OPS_LATENCY_TOP,
  OPS_MAINTENANCE,
  OPS_MODEL_CALL_SHARE,
  OPS_MONITOR_CHARTS,
  OPS_MONITOR_WINDOW,
  OPS_SUMMARY,
  OPS_SUPPLIER_HEALTH,
} from "./mock";

const router = useRouter();
const lineGradId = `ops-ln-${useId().replace(/:/g, "")}`;

const windowHours = ref(OPS_MONITOR_WINDOW.defaultHours);
const lastRefreshAt = ref(OPS_SUMMARY.updatedAt);
const stale = ref(OPS_SUMMARY.stale);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const windowLabel = computed(() => `最近 ${windowHours.value} 小时`);

const trendSvgPoints = computed(() => {
  const pts = OPS_CALL_TREND_7D.points;
  if (!pts.length) return "";
  const w = 400;
  const h = 100;
  const padX = 12;
  const padY = 12;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  return pts
    .map((p, i) => {
      const x = padX + innerW * (pts.length === 1 ? 0.5 : i / (pts.length - 1));
      const y = padY + innerH * (1 - (p - min) / span);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});

const trendFillPoints = computed(() => {
  const line = trendSvgPoints.value;
  if (!line) return "";
  const first = line.split(" ")[0] ?? "12,88";
  const last = line.split(" ").at(-1) ?? "388,88";
  const [lx] = last.split(",");
  return `${first} ${line} ${lx},88 12,88`;
});

function pieConicFromSegments(segments: readonly { pct: number; color: string }[]): string {
  let acc = 0;
  const parts = segments.map((s) => {
    const start = acc;
    acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

const errorPieConic = computed(() => pieConicFromSegments(OPS_ERROR_DIST_24H.segments));
const modelPieConic = computed(() => pieConicFromSegments(OPS_MODEL_CALL_SHARE.segments));

const errRateTone = computed(() => {
  const n = Number.parseFloat(OPS_SUMMARY.errRate);
  if (Number.isNaN(n)) return "";
  if (n >= 1) return "is-bad";
  if (n >= 0.5) return "is-warn";
  return "";
});

const kpiCards = computed(() => [
  { id: "qps", icon: "activity" as const, label: `QPS · ${windowLabel.value}`, value: OPS_SUMMARY.qps, meta: "全平台实时", tone: "" },
  { id: "err", icon: "alert" as const, label: "错误率", value: OPS_SUMMARY.errRate, meta: "全平台聚合", tone: errRateTone.value },
  { id: "p99", icon: "clock" as const, label: "P99 延迟", value: OPS_SUMMARY.p99, meta: "网关出口", tone: "" },
]);

function refreshNow(): void {
  lastRefreshAt.value = new Date().toISOString().slice(0, 19).replace("T", " ");
  stale.value = false;
}

function onWindowChange(h: number): void {
  windowHours.value = Math.min(OPS_MONITOR_WINDOW.maxHours, Math.max(1, h));
  refreshNow();
}

function goRoute(name: string, query?: Record<string, string>): void {
  void router.push({ name: name as RouteRecordName, query });
}

function supplierStatusClass(status: string): string {
  if (status === "正常") return "ops-page__badge ops-page__badge--ok";
  if (status === "降级中") return "ops-page__badge ops-page__badge--warn";
  return "ops-page__badge";
}

function chartBarHeight(v: number, series: readonly number[]): string {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pct = 24 + ((v - min) / span) * 76;
  return `${pct}%`;
}

function tokenPctHigh(requestPct: number, tokenPct: number): boolean {
  return tokenPct - requestPct >= 8;
}

onMounted(() => {
  refreshTimer = setInterval(() => {
    lastRefreshAt.value = new Date().toISOString().slice(0, 19).replace("T", " ");
  }, OPS_MONITOR_WINDOW.refreshSec * 1000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<template>
  <div class="ops-page">
    <AdminSectionHead title="实时大盘">
      <template #annot>
        <AdminInternalTip heading="实时大盘 · 原型" explain="分区对齐 README §2；数据 mock">
          <p>
            时间窗默认 {{ OPS_MONITOR_WINDOW.defaultHours }}h，每 {{ OPS_MONITOR_WINDOW.refreshSec }}s 刷新。工程期接
            <code>/v1/admin/monitor/*</code>。监控摘要见工作台，本页为深度分析。
          </p>
        </AdminInternalTip>
      </template>
      <template #desc>
        值班视图（{{ windowLabel }}）· 更新 {{ lastRefreshAt }} · 摘要见
        <el-button link type="primary" class="ops-page__desc-link" @click="goRoute('tai-admin-dashboard')">工作台</el-button>
      </template>
      <template #tools>
        <el-select :model-value="windowHours" class="ops-page__window-select" @change="onWindowChange(Number($event))">
          <el-option :value="2" label="2 小时" />
          <el-option :value="6" label="6 小时" />
          <el-option :value="24" label="24 小时" />
        </el-select>
        <el-button type="primary" :icon="Refresh" @click="refreshNow">刷新</el-button>
        <el-button plain @click="goRoute('tai-admin-billing-usage')">用量日志</el-button>
        <el-button plain @click="goRoute('tai-admin-risk-rules')">风控规则</el-button>
      </template>
    </AdminSectionHead>

    <el-alert
      v-if="OPS_MAINTENANCE[0]"
      class="ops-page__alert"
      type="warning"
      :closable="false"
      show-icon
      :title="`维护预告：${OPS_MAINTENANCE[0].title}`"
    >
      <template #default>
        {{ OPS_MAINTENANCE[0].window }} · {{ OPS_MAINTENANCE[0].action }} · {{ OPS_MAINTENANCE[0].owner }}
      </template>
    </el-alert>

    <el-alert
      v-if="stale"
      class="ops-page__alert"
      type="info"
      :closable="false"
      show-icon
      title="数据可能滞后 (stale)"
      description="当前展示为缓存降级结果，请以刷新后数据为准。"
    />

    <section class="ops-page__panel" aria-label="大盘内容">
      <div class="ops-page__scroll">
        <p class="ops-page__context" role="note">
          <strong>与工作台分工：</strong>工作台 = 近 5m/15m 摘要 + 待办；本页 = 同窗
          <strong>趋势、模型占比、Top 榜、供应商健康</strong>。
        </p>

        <!-- ① 值班 KPI -->
        <section class="ops-page__block" aria-label="值班核心指标">
          <h3 class="ops-page__group-title">值班指标</h3>
          <div class="ops-page__kpis">
            <article
              v-for="k in kpiCards"
              :key="k.id"
              class="ops-page__kpi"
              :class="k.tone"
              :data-icon="k.icon"
            >
              <div class="ops-page__kpi-ico" aria-hidden="true">
                <svg v-if="k.icon === 'activity'" viewBox="0 0 24 24" fill="none" class="ops-page__kpi-svg">
                  <path
                    d="M4 14.5 8 10l3 3 5-6 4 5"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg v-else-if="k.icon === 'alert'" viewBox="0 0 24 24" fill="none" class="ops-page__kpi-svg">
                  <path
                    d="M12 8v5m0 3h.01M4.5 18h15L12 4 4.5 18Z"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" class="ops-page__kpi-svg">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.75" />
                  <path d="M12 8v4l2.5 2.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
                </svg>
              </div>
              <div class="ops-page__kpi-body">
                <div class="ops-page__kpi-label">{{ k.label }}</div>
                <p class="ops-page__kpi-value">{{ k.value }}</p>
                <p class="ops-page__kpi-meta">{{ k.meta }}</p>
              </div>
            </article>
          </div>
        </section>

        <!-- ② 趋势 + 错误构成 -->
        <div class="ops-page__duo">
          <el-card shadow="never" class="admin-ep-card ops-page__block" aria-label="调用量趋势">
            <header class="ops-page__block-head">
              <h3 class="ops-page__block-title">{{ OPS_CALL_TREND_7D.title }}</h3>
            </header>
            <div class="ops-page__trend-wrap">
              <svg class="ops-page__trend-svg" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient :id="lineGradId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--blue)" stop-opacity="0.28" />
                    <stop offset="100%" stop-color="var(--blue)" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <polygon v-if="trendFillPoints" :points="trendFillPoints" :fill="`url(#${lineGradId})`" />
                <polyline
                  v-if="trendSvgPoints"
                  :points="trendSvgPoints"
                  fill="none"
                  stroke="var(--blue)"
                  stroke-width="2"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
              <div class="ops-page__trend-labels">
                <span v-for="(lb, i) in OPS_CALL_TREND_7D.labels" :key="i">{{ lb }}</span>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="admin-ep-card ops-page__block" aria-label="错误码分布">
            <header class="ops-page__block-head">
              <h3 class="ops-page__block-title">{{ OPS_ERROR_DIST_24H.title }}</h3>
              <span class="ops-page__block-meta">{{ windowLabel }}</span>
            </header>
            <div class="ops-page__pie-panel">
              <div class="ops-page__pie ops-page__pie--md" :style="{ background: errorPieConic }" />
              <ul class="ops-page__pie-legend">
                <li v-for="s in OPS_ERROR_DIST_24H.segments" :key="s.label" class="ops-page__pie-legend-item">
                  <span class="ops-page__pie-dot" :style="{ background: s.color }" />
                  <span class="ops-page__pie-label">{{ s.label }}</span>
                  <span class="ops-page__pie-pct">{{ s.pct }}%</span>
                </li>
              </ul>
            </div>
          </el-card>
        </div>

        <!-- ③ 模型调用占比 -->
        <el-card shadow="never" class="admin-ep-card ops-page__block" aria-label="模型调用占比">
          <header class="ops-page__block-head">
            <div>
              <h3 class="ops-page__block-title">{{ OPS_MODEL_CALL_SHARE.title }}（{{ windowLabel }}）</h3>
              <p class="ops-page__block-desc">
                {{ OPS_MODEL_CALL_SHARE.metricLabel }}；Token 占比显著高于请求占比时关注长上下文
              </p>
            </div>
            <el-button link type="primary" @click="goRoute('tai-admin-billing-usage')">按模型查用量 →</el-button>
          </header>
          <div class="ops-page__model-layout ops-page__model-layout--lean">
            <div class="ops-page__pie ops-page__pie--md" :style="{ background: modelPieConic }" aria-hidden="true" />
            <div class="ops-page__model-table-wrap">
              <table class="ops-page__model-table">
                <thead>
                  <tr>
                    <th>模型</th>
                    <th>请求占比</th>
                    <th>Token 占比</th>
                    <th class="ops-page__th-num">调用量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in OPS_MODEL_CALL_SHARE.segments" :key="s.model">
                    <td class="ops-page__model-name">
                      <span class="ops-page__pie-dot" :style="{ background: s.color }" />{{ s.model }}
                    </td>
                    <td>
                      <div class="ops-page__inline-bar">
                        <span class="ops-page__inline-fill" :style="{ width: `${s.pct}%`, background: s.color }" />
                      </div>
                      <span class="ops-page__inline-pct">{{ s.pct }}%</span>
                    </td>
                    <td>
                      <span class="ops-page__token-pct" :class="{ 'is-high': tokenPctHigh(s.pct, s.tokenPct) }">
                        {{ s.tokenPct }}%
                      </span>
                    </td>
                    <td class="ops-page__th-num ops-page__mono">{{ s.calls }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </el-card>

        <!-- ④ 五类监控（可折叠，与工作台监控卡同源） -->
        <details class="ops-page__details" open>
          <summary class="ops-page__details-summary">
            <span class="ops-page__block-title">五类监控时序</span>
            <span class="ops-page__block-meta">工作台为当前值 · 此处为 {{ windowLabel }} 趋势</span>
          </summary>
          <div class="ops-page__details-body">
            <div class="ops-page__monitor-grid">
              <article v-for="c in OPS_MONITOR_CHARTS" :key="c.id" class="ops-page__monitor-card">
                <div class="ops-page__monitor-top">
                  <span class="ops-page__monitor-name">{{ c.title }}</span>
                  <span class="ops-page__monitor-val">{{ c.last }}<small>{{ c.unit }}</small></span>
                </div>
                <div class="ops-page__monitor-bars" :aria-label="`${c.title} 趋势`">
                  <span
                    v-for="(v, i) in c.series"
                    :key="i"
                    class="ops-page__monitor-bar"
                    :style="{ height: chartBarHeight(v, c.series) }"
                  />
                </div>
              </article>
            </div>
          </div>
        </details>

        <h3 class="ops-page__group-title">异常与根因</h3>

        <!-- ⑤ Top 榜 -->
        <div class="ops-page__duo ops-page__duo--tables">
          <el-card shadow="never" class="admin-ep-card ops-page__block" aria-label="错误 Top">
            <header class="ops-page__block-head">
              <h3 class="ops-page__block-title">错误 Top</h3>
              <span class="ops-page__block-meta">{{ windowLabel }}</span>
            </header>
            <el-table :data="OPS_ERROR_TOP" class="admin-ep-table-wrap" style="width: 100%" size="small">
              <el-table-column prop="code" label="码" :min-width="ADMIN_TABLE_COL.xs">
                <template #default="scope">
                  <span v-if="scope?.row" class="ops-page__code">{{ scope.row.code }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="route" label="路由" :min-width="ADMIN_TABLE_COL.lg" show-overflow-tooltip />
              <el-table-column prop="line" label="线路" :min-width="ADMIN_TABLE_COL.md" show-overflow-tooltip />
              <el-table-column prop="count" label="次数" :min-width="ADMIN_TABLE_COL.sm" align="right" />
              <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.sm" fixed="right">
                <template #default="scope">
                  <el-button
                    v-if="scope?.row"
                    link
                    type="primary"
                    @click="goRoute('tai-admin-billing-usage', { status: scope.row.code })"
                  >
                    用量
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <el-card shadow="never" class="admin-ep-card ops-page__block" aria-label="延迟 Top">
            <header class="ops-page__block-head">
              <h3 class="ops-page__block-title">延迟 Top</h3>
              <span class="ops-page__block-meta">P95</span>
            </header>
            <el-table :data="OPS_LATENCY_TOP" class="admin-ep-table-wrap" style="width: 100%" size="small">
              <el-table-column prop="dim" label="维度" :min-width="ADMIN_TABLE_COL.xl" show-overflow-tooltip />
              <el-table-column prop="p95" label="P95" :min-width="ADMIN_TABLE_COL.sm">
                <template #default="scope">
                  <span v-if="scope?.row" class="ops-page__mono">{{ scope.row.p95 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="note" label="说明" :min-width="ADMIN_TABLE_COL.md" show-overflow-tooltip />
            </el-table>
          </el-card>
        </div>

        <!-- ⑥ 供应商健康 -->
        <el-card shadow="never" class="admin-ep-card ops-page__block" aria-label="供应商健康">
          <header class="ops-page__block-head">
            <div>
              <h3 class="ops-page__block-title">供应商健康</h3>
              <p class="ops-page__block-desc">线路成功率、延迟与容量占用</p>
            </div>
            <el-button link type="primary" @click="goRoute('tai-admin-suppliers-list')">供应商管理 →</el-button>
          </header>
          <el-table :data="OPS_SUPPLIER_HEALTH" class="admin-ep-table-wrap" style="width: 100%">
            <el-table-column prop="name" label="供应商" :min-width="ADMIN_TABLE_COL.md" />
            <el-table-column prop="line" label="线路" :min-width="ADMIN_TABLE_COL.md" />
            <el-table-column prop="ok" label="成功率" :min-width="ADMIN_TABLE_COL.sm">
              <template #default="scope">
                <span v-if="scope?.row" class="ops-page__mono">{{ scope.row.ok }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="p95" label="P95" :min-width="ADMIN_TABLE_COL.sm">
              <template #default="scope">
                <span v-if="scope?.row" class="ops-page__mono">{{ scope.row.p95 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="cap" label="容量" :min-width="ADMIN_TABLE_COL.xs" />
            <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.xs">
              <template #default="scope">
                <span v-if="scope?.row" :class="supplierStatusClass(scope.row.status)">{{ scope.row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="" :width="ADMIN_TABLE_COL_OPS.sm" fixed="right">
              <template #default="scope">
                <el-button
                  v-if="scope?.row?.status === '降级中'"
                  link
                  type="warning"
                  :icon="WarningFilled"
                  @click="goRoute('tai-admin-models-lines')"
                >
                  线路
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </section>
  </div>
</template>
