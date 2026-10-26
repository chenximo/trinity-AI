<script setup lang="ts">
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import {
  api,
  type ReconDailyPoint,
  type ReconReportDetailOut,
  type ReconReportListItem,
  type ReconUpstreamUsagePoint,
} from "../api/client";

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

const reports = ref<ReconReportListItem[]>([]);
const upstreamDir = ref("");
const period = ref("全部");
const selectedId = ref("");
const detail = ref<ReconReportDetailOut | null>(null);
const loading = ref(false);
const detailLoading = ref(false);
const error = ref("");
const CHART_ALL = "__all__";
/** CHART_ALL = 全部模型合计；否则为日明细里的模型名 */
const chartModel = ref(CHART_ALL);
/** 点击图表某日后展示该日模型明细 */
const selectedDay = ref("");
const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const periods = computed(() => {
  const set = new Set(reports.value.map((r) => r.period).filter(Boolean));
  return ["全部", ...Array.from(set).sort((a, b) => b.localeCompare(a))];
});

const filteredReports = computed(() => {
  if (period.value === "全部") return reports.value;
  return reports.value.filter((r) => r.period === period.value);
});

const hasDailyChart = computed(
  () => (detail.value?.daily_series?.dates?.length || 0) > 0,
);

const isChartAll = computed(() => chartModel.value === CHART_ALL);

/** 模型下拉：按账期 |差额| 从大到小，选项文案带差额 */
const chartModelOptions = computed(() => {
  const series = detail.value?.daily_series;
  if (!series?.models?.length) return [];
  return series.models
    .map((m) => {
      const pts = series.by_model[m] || [];
      const upstream = pts.reduce((s, p) => s + p.upstream_usd, 0);
      const platform = pts.reduce((s, p) => s + p.platform_usd, 0);
      const diff = pts.reduce((s, p) => s + p.diff_usd, 0);
      return { model: m, upstream, platform, diff };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
});

const chartScopeSummary = computed(() => {
  const pts = activePoints();
  if (!pts.length) return null;
  const upstream = pts.reduce((s, p) => s + p.upstream_usd, 0);
  const platform = pts.reduce((s, p) => s + p.platform_usd, 0);
  const diff = pts.reduce((s, p) => s + p.diff_usd, 0);
  return {
    label: isChartAll.value ? "全部模型合计" : chartModel.value,
    upstream,
    platform,
    diff,
  };
});

const topGapChips = computed(() => chartModelOptions.value.slice(0, 5));

const usageNote = computed(() => detail.value?.daily_series?.usage_note || "");

const modelUsageRows = computed(() => {
  if (isChartAll.value || !chartModel.value) return [];
  const money = detail.value?.daily_series?.by_model?.[chartModel.value] || [];
  const usageList =
    detail.value?.daily_series?.upstream_usage?.[chartModel.value] || [];
  const usageMap = new Map(usageList.map((u) => [u.date, u]));
  const dates = new Set([...money.map((p) => p.date), ...usageList.map((u) => u.date)]);
  return Array.from(dates)
    .sort()
    .map((date) => {
      const m = money.find((p) => p.date === date);
      const u: ReconUpstreamUsagePoint | undefined = usageMap.get(date);
      return {
        date,
        calls: u?.calls ?? null,
        tokens_m: u?.tokens_m ?? null,
        eff_cny_per_m: u?.eff_cny_per_m ?? null,
        cny: u?.cny ?? null,
        upstream_usd: m?.upstream_usd ?? 0,
        platform_usd: m?.platform_usd ?? 0,
        diff_usd: m?.diff_usd ?? 0,
      };
    })
    .filter((r) => r.upstream_usd || r.platform_usd || r.calls || r.tokens_m);
});

const modelUsageTotals = computed(() => {
  const rows = modelUsageRows.value;
  if (!rows.length) return null;
  return {
    calls: rows.reduce((s, r) => s + (r.calls || 0), 0),
    tokens_m: rows.reduce((s, r) => s + (r.tokens_m || 0), 0),
    cny: rows.reduce((s, r) => s + (r.cny || 0), 0),
    upstream_usd: rows.reduce((s, r) => s + r.upstream_usd, 0),
    platform_usd: rows.reduce((s, r) => s + r.platform_usd, 0),
    diff_usd: rows.reduce((s, r) => s + r.diff_usd, 0),
  };
});

function pickPreferred(list: ReconReportListItem[]) {
  if (!list.length) return "";
  return (list.find((r) => r.has_overview) || list[0]).id;
}

function ensureSelectionInFilter() {
  const list = filteredReports.value;
  if (!list.length) {
    selectedId.value = "";
    return;
  }
  if (!list.some((r) => r.id === selectedId.value)) {
    selectedId.value = pickPreferred(list);
  }
}

async function loadList() {
  loading.value = true;
  error.value = "";
  try {
    const data = await api.reconReports();
    reports.value = data.reports || [];
    upstreamDir.value = data.upstream_dir || data.recon_dir;
    if (period.value !== "全部" && !periods.value.includes(period.value)) {
      period.value = "全部";
    }
    // 首次加载：落到最新有结论的月份
    if (!selectedId.value && period.value === "全部") {
      const withOverview = reports.value.find((r) => r.has_overview);
      if (withOverview) period.value = withOverview.period;
    }
    if (!selectedId.value) {
      selectedId.value = pickPreferred(filteredReports.value);
    } else {
      ensureSelectionInFilter();
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

async function loadDetail(id: string) {
  if (!id) {
    detail.value = null;
    return;
  }
  const [supplier, p] = id.split("/");
  if (!supplier || !p) return;
  detailLoading.value = true;
  try {
    detail.value = await api.reconReport(supplier, p);
    chartModel.value = CHART_ALL;
    selectedDay.value = "";
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    detail.value = null;
  } finally {
    detailLoading.value = false;
  }
}

function activePoints(): ReconDailyPoint[] {
  const series = detail.value?.daily_series;
  if (!series?.dates?.length) return [];
  if (chartModel.value === CHART_ALL) return series.totals || [];
  return series.by_model?.[chartModel.value] || [];
}

function selectChartModel(model: string) {
  chartModel.value = model || CHART_ALL;
}

type DayModelRow = {
  model: string;
  upstream_usd: number;
  platform_usd: number;
  diff_usd: number;
};

function modelsOnDate(fullDate: string): DayModelRow[] {
  const byModel = detail.value?.daily_series?.by_model || {};
  const rows: DayModelRow[] = [];
  for (const [model, pts] of Object.entries(byModel)) {
    const p = pts.find((x) => x.date === fullDate);
    if (!p) continue;
    if (!p.upstream_usd && !p.platform_usd && !p.diff_usd) continue;
    rows.push({
      model,
      upstream_usd: p.upstream_usd,
      platform_usd: p.platform_usd,
      diff_usd: p.diff_usd,
    });
  }
  // 大差异在前、小差异在后（|差额|，正负同等重视）
  rows.sort((a, b) => {
    const da = Math.abs(a.diff_usd);
    const db = Math.abs(b.diff_usd);
    if (db !== da) return db - da;
    return (
      Math.abs(b.upstream_usd) +
      Math.abs(b.platform_usd) -
      (Math.abs(a.upstream_usd) + Math.abs(a.platform_usd))
    );
  });
  return rows;
}

const dayModelRows = computed(() =>
  selectedDay.value ? modelsOnDate(selectedDay.value) : [],
);

function money4(v: number) {
  const sign = v > 0 ? "+" : "";
  return `${sign}$${v.toFixed(4)}`;
}

function tooltipHtml(dataIndex: number): string {
  const points = activePoints();
  const p = points[dataIndex];
  if (!p) return "";
  const label = p.date.slice(5);
  let html =
    `<div style="font-weight:600;margin-bottom:6px">${label}</div>` +
    `<div>上游 USD　<span style="color:#409eff">$${p.upstream_usd.toFixed(4)}</span></div>` +
    `<div>平台成本　<span style="color:#e6a23c">$${p.platform_usd.toFixed(4)}</span></div>` +
    `<div>差额　　　<span style="color:#67c23a">${money4(p.diff_usd)}</span></div>`;

  if (isChartAll.value) {
    const rows = modelsOnDate(p.date).slice(0, 8);
    if (rows.length) {
      const all = modelsOnDate(p.date);
      html += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #ebeef5;font-weight:600">当日模型 · 按|差额|从大到小</div>`;
      for (const r of rows) {
        html +=
          `<div style="margin-top:4px;font-size:12px">` +
          `<div style="color:#303133">${r.model}</div>` +
          `<div style="color:#909399">上 $${r.upstream_usd.toFixed(2)} · 平 $${r.platform_usd.toFixed(2)} · 差 ${money4(r.diff_usd)}</div>` +
          `</div>`;
      }
      if (all.length > 8) {
        html += `<div style="margin-top:4px;color:#909399;font-size:11px">点击柱/点查看完整列表</div>`;
      }
    }
  }
  return html;
}

function renderChart() {
  if (!chartEl.value || !hasDailyChart.value) {
    chart?.dispose();
    chart = null;
    return;
  }
  if (!chart) {
    chart = echarts.init(chartEl.value);
    chart.on("click", (params) => {
      const idx = typeof params.dataIndex === "number" ? params.dataIndex : -1;
      const p = activePoints()[idx];
      if (p) selectedDay.value = p.date;
    });
  }
  const points = activePoints();
  const dates = points.map((p) => p.date.slice(5)); // MM-DD
  const upstream = points.map((p) => p.upstream_usd);
  const platform = points.map((p) => p.platform_usd);
  const diff = points.map((p) => p.diff_usd);
  const title = isChartAll.value ? "全部模型合计" : chartModel.value;

  chart.setOption(
    {
      color: ["#409eff", "#e6a23c", "#67c23a"],
      title: {
        text: title,
        left: 0,
        top: 0,
        textStyle: { fontSize: 13, fontWeight: 600, color: "#606266" },
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        enterable: true,
        extraCssText: "max-width:320px;max-height:360px;overflow:auto;",
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? params : [params];
          const idx = (list[0] as { dataIndex?: number })?.dataIndex ?? -1;
          return tooltipHtml(idx);
        },
      },
      legend: {
        top: 0,
        right: 0,
        data: ["上游 USD", "平台成本 USD", "差额"],
      },
      grid: { left: 48, right: 24, top: 40, bottom: 36 },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: { rotate: dates.length > 16 ? 45 : 0, fontSize: 11 },
      },
      yAxis: [
        {
          type: "value",
          name: "USD",
          splitLine: { lineStyle: { type: "dashed" } },
        },
      ],
      series: [
        {
          name: "上游 USD",
          type: "line",
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          data: upstream,
        },
        {
          name: "平台成本 USD",
          type: "line",
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          data: platform,
        },
        {
          name: "差额",
          type: "bar",
          barMaxWidth: 14,
          itemStyle: { opacity: 0.35 },
          data: diff,
        },
      ],
    },
    true,
  );
  chart.resize();
}

watch(selectedId, (id) => {
  void loadDetail(id);
});

watch(period, () => {
  ensureSelectionInFilter();
});

watch(
  [detail, chartModel, hasDailyChart],
  async () => {
    await nextTick();
    renderChart();
  },
  { flush: "post" },
);

function onResize() {
  chart?.resize();
}

onMounted(async () => {
  window.addEventListener("resize", onResize);
  await loadList();
  if (selectedId.value) await loadDetail(selectedId.value);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  chart?.dispose();
  chart = null;
});

function fmtMoney(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}`;
}

function diffClass(v: number | null | undefined) {
  if (v == null) return "";
  if (Math.abs(v) < 0.5) return "ok";
  return v > 0 ? "up" : "down";
}
</script>

<template>
  <section class="panel">
    <div class="head">
      <div>
        <h2 style="margin: 0">账单对账 · 结论</h2>
        <p class="muted" style="margin: 6px 0 0">
          分析在对话中完成；此处展示已落盘结论（
          <code>pricing/账单对账/上游对账/{供应商}/{账期}/</code>
          ）。
        </p>
      </div>
      <div class="head-actions">
        <el-select v-model="period" style="width: 140px" placeholder="账期">
          <el-option v-for="p in periods" :key="p" :label="p === '全部' ? '全部月份' : p" :value="p" />
        </el-select>
        <el-button :loading="loading" @click="loadList">刷新</el-button>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else class="meta">真源目录：{{ upstreamDir }}</p>

    <div v-if="!loading && !reports.length" class="empty">
      暂无对账结论。对话产出「模型总览」CSV/MD 并放入上游对账目录后，刷新即可看到。
    </div>

    <div v-else-if="!loading && !filteredReports.length" class="empty">
      {{ period }} 暂无对账结论，可切换其他月份或选「全部月份」。
    </div>

    <div v-else class="layout">
      <aside class="list">
        <button
          v-for="r in filteredReports"
          :key="r.id"
          type="button"
          class="case"
          :class="{ active: r.id === selectedId }"
          @click="selectedId = r.id"
        >
          <div class="case-top">
            <strong>{{ r.supplier }}</strong>
            <span class="tag">{{ r.status_label }}</span>
          </div>
          <div class="case-period">{{ r.period }}</div>
          <div class="case-head">{{ r.headline || "（无摘要）" }}</div>
        </button>
      </aside>

      <div class="detail" v-loading="detailLoading">
        <template v-if="detail">
          <div class="kpis">
            <div class="kpi">
              <div class="kpi-label">上游合计 USD</div>
              <div class="kpi-val">{{ detail.summary.upstream_usd?.toFixed(2) ?? "—" }}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">平台成本 USD</div>
              <div class="kpi-val">{{ detail.summary.platform_usd?.toFixed(2) ?? "—" }}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">差额</div>
              <div class="kpi-val" :class="diffClass(detail.summary.diff_usd)">
                {{ fmtMoney(detail.summary.diff_usd) }}
                <span v-if="detail.summary.diff_pct_of_platform != null" class="pct">
                  （{{ detail.summary.diff_pct_of_platform > 0 ? "+" : "" }}{{ detail.summary.diff_pct_of_platform }}%）
                </span>
              </div>
            </div>
          </div>

          <p class="meta">
            {{ detail.path }}
            <span v-if="detail.overview_file"> · {{ detail.overview_file }}</span>
          </p>
          <p class="muted">{{ detail.note }}</p>

          <el-table :data="detail.models" stripe size="small" class="table" empty-text="无模型总览行">
            <el-table-column prop="model" label="模型" min-width="150" fixed />
            <el-table-column prop="side" label="两侧" width="88" />
            <el-table-column label="上游$" width="96" align="right">
              <template #default="{ row }">{{ row.upstream_usd?.toFixed(2) ?? "—" }}</template>
            </el-table-column>
            <el-table-column label="平台$" width="96" align="right">
              <template #default="{ row }">{{ row.platform_usd?.toFixed(2) ?? "—" }}</template>
            </el-table-column>
            <el-table-column label="差额$" width="100" align="right">
              <template #default="{ row }">
                <span :class="diffClass(row.diff_usd)">{{ fmtMoney(row.diff_usd) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="占缺口%" width="88" align="right">
              <template #default="{ row }">
                {{ row.share_pct == null ? "—" : `${row.share_pct}%` }}
              </template>
            </el-table-column>
            <el-table-column prop="big_gap_dates" label="大差日期" min-width="160" show-overflow-tooltip />
            <el-table-column prop="align_dates" label="对齐日期" min-width="140" show-overflow-tooltip />
            <el-table-column prop="conclusion" label="结论" min-width="180" show-overflow-tooltip />
          </el-table>

          <div v-if="hasDailyChart" class="chart-block">
            <div class="chart-head">
              <div>
                <div class="cal-title">日对比 · 上游 vs 平台</div>
                <p class="muted cal-legend">
                  可选全部合计或单个模型看曲线。蓝线上游、橙线平台；柱为当日差额。
                </p>
              </div>
              <div class="chart-scope">
                <span class="chart-scope-label">查看</span>
                <el-select
                  v-model="chartModel"
                  filterable
                  style="width: 280px"
                  placeholder="选择模型或全部合计"
                >
                  <el-option label="全部模型合计" :value="CHART_ALL" />
                  <el-option
                    v-for="m in chartModelOptions"
                    :key="m.model"
                    :value="m.model"
                    :label="`${m.model}（差 ${money4(m.diff)}）`"
                  />
                </el-select>
              </div>
            </div>

            <div class="model-chips">
              <button
                type="button"
                class="chip"
                :class="{ active: isChartAll }"
                @click="selectChartModel(CHART_ALL)"
              >
                全部合计
              </button>
              <button
                v-for="m in topGapChips"
                :key="m.model"
                type="button"
                class="chip"
                :class="{ active: chartModel === m.model }"
                @click="selectChartModel(m.model)"
              >
                {{ m.model }}
                <span :class="diffClass(m.diff)">{{ money4(m.diff) }}</span>
              </button>
            </div>

            <div v-if="chartScopeSummary" class="scope-kpis">
              <span class="scope-name">{{ chartScopeSummary.label }}</span>
              <span>上游 ${{ chartScopeSummary.upstream.toFixed(2) }}</span>
              <span>平台 ${{ chartScopeSummary.platform.toFixed(2) }}</span>
              <span :class="diffClass(chartScopeSummary.diff)">
                差额 {{ money4(chartScopeSummary.diff) }}
              </span>
              <template v-if="modelUsageTotals">
                <span>上游调用 {{ modelUsageTotals.calls.toLocaleString() }}</span>
                <span>上游 Token {{ modelUsageTotals.tokens_m.toFixed(2) }}M</span>
                <span>上游 ¥{{ modelUsageTotals.cny.toFixed(2) }}</span>
              </template>
            </div>

            <p v-if="usageNote" class="usage-note">{{ usageNote }}</p>

            <div ref="chartEl" class="chart-el" />

            <div v-if="!isChartAll && modelUsageRows.length" class="usage-block">
              <div class="cal-title">{{ chartModel }} · 日明细（含上游量）</div>
              <p class="muted cal-legend">
                调用 / Token / 有效¥/M 来自上游日账单；平台侧目前只有成本$，暂无比对请求与 Token。
              </p>
              <el-table :data="modelUsageRows" size="small" stripe max-height="320">
                <el-table-column prop="date" label="日期" width="110" />
                <el-table-column label="上游调用" width="96" align="right">
                  <template #default="{ row }">
                    {{ row.calls == null ? "—" : row.calls.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column label="上游Token(M)" width="120" align="right">
                  <template #default="{ row }">
                    {{ row.tokens_m == null ? "—" : row.tokens_m.toFixed(3) }}
                  </template>
                </el-table-column>
                <el-table-column label="有效¥/M" width="96" align="right">
                  <template #default="{ row }">
                    {{ row.eff_cny_per_m == null ? "—" : row.eff_cny_per_m.toFixed(3) }}
                  </template>
                </el-table-column>
                <el-table-column label="上游$" width="96" align="right">
                  <template #default="{ row }">{{ row.upstream_usd.toFixed(4) }}</template>
                </el-table-column>
                <el-table-column label="平台$" width="96" align="right">
                  <template #default="{ row }">{{ row.platform_usd.toFixed(4) }}</template>
                </el-table-column>
                <el-table-column label="差额$" width="100" align="right">
                  <template #default="{ row }">
                    <span :class="diffClass(row.diff_usd)">{{ money4(row.diff_usd) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-if="selectedDay && dayModelRows.length" class="day-detail">
              <div class="day-detail-head">
                <strong>{{ selectedDay }} 模型明细</strong>
                <span class="muted">按|差额|从大到小 · 点击图表日期切换</span>
                <el-button link type="primary" @click="selectedDay = ''">关闭</el-button>
              </div>
              <el-table :data="dayModelRows" size="small" stripe max-height="280">
                <el-table-column prop="model" label="模型" min-width="160" />
                <el-table-column label="上游$" width="100" align="right">
                  <template #default="{ row }">{{ row.upstream_usd.toFixed(4) }}</template>
                </el-table-column>
                <el-table-column label="平台$" width="100" align="right">
                  <template #default="{ row }">{{ row.platform_usd.toFixed(4) }}</template>
                </el-table-column>
                <el-table-column label="差额$" width="110" align="right">
                  <template #default="{ row }">
                    <span :class="diffClass(row.diff_usd)">{{ money4(row.diff_usd) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="88" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="selectChartModel(row.model)">看曲线</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <details v-if="detail.models?.some((m) => m.calendar)" class="cal-block">
            <summary>符号日历（备查）</summary>
            <p class="muted cal-legend">{{ detail.calendar_legend }}</p>
            <div v-for="m in detail.models" :key="m.model" class="cal-row">
              <div class="cal-model">{{ m.model }}</div>
              <code class="cal">{{ m.calendar || "—" }}</code>
            </div>
          </details>

          <details v-if="detail.md_text" class="md-block">
            <summary>查看 Markdown 结论全文</summary>
            <pre>{{ detail.md_text }}</pre>
          </details>

          <div v-if="detail.files?.length" class="files">
            <div class="files-title">目录文件</div>
            <ul>
              <li v-for="f in detail.files" :key="f">{{ f }}</li>
            </ul>
          </div>
        </template>
        <p v-else-if="!detailLoading" class="muted">选择左侧一笔对账任务查看结论。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 14px;
  margin-top: 14px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 180px);
  overflow: auto;
}
.case {
  text-align: left;
  border: 1px solid var(--el-border-color);
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
}
.case.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}
.case-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.case-period {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.case-head {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 6px;
  line-height: 1.4;
}
.tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #ecf5ff;
  color: #409eff;
}
.case:not(.active) .tag {
  opacity: 0.9;
}
.detail {
  min-width: 0;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 14px;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}
.kpi {
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
}
.kpi-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.kpi-val {
  font-size: 20px;
  font-weight: 700;
  margin-top: 4px;
}
.kpi-val .pct {
  font-size: 12px;
  font-weight: 500;
}
.up {
  color: #c45656;
}
.down {
  color: #529b2e;
}
.ok {
  color: #606266;
}
.cal {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  letter-spacing: 0.5px;
  white-space: pre;
  overflow-x: auto;
}
.chart-block {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}
.chart-scope {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.chart-scope-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.model-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.chip {
  border: 1px solid var(--el-border-color);
  background: #fff;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-regular);
}
.chip.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.scope-kpis {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: baseline;
  font-size: 13px;
  margin-bottom: 4px;
  color: var(--el-text-color-regular);
}
.scope-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.chart-el {
  width: 100%;
  height: 320px;
}
.usage-note {
  margin: 0 0 8px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #b88230;
  background: #fdf6ec;
  border-radius: 6px;
}
.usage-block {
  margin-top: 10px;
}
.day-detail {
  margin-top: 8px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}
.day-detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.cal-block {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.cal-title {
  font-weight: 600;
  font-size: 14px;
}
.cal-legend {
  margin: 4px 0 10px;
  font-size: 12px;
}
.cal-row {
  display: grid;
  grid-template-columns: minmax(140px, 220px) 1fr;
  gap: 10px;
  align-items: baseline;
  padding: 4px 0;
  border-bottom: 1px dashed var(--el-border-color-extra-light);
}
.cal-model {
  font-size: 13px;
  color: var(--el-text-color-regular);
  word-break: break-all;
}
.table {
  width: 100%;
  margin-top: 8px;
}
.md-block {
  margin-top: 14px;
}
.md-block pre {
  white-space: pre-wrap;
  font-size: 12px;
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  max-height: 320px;
  overflow: auto;
}
.files {
  margin-top: 12px;
  font-size: 13px;
}
.files-title {
  font-weight: 600;
  margin-bottom: 4px;
}
.empty {
  margin-top: 20px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  color: var(--el-text-color-secondary);
}
@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
