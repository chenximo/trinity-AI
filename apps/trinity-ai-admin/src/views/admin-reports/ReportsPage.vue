<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, View, Download, Refresh } from "@element-plus/icons-vue";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminExportCsvButton from "../../components/AdminExportCsvButton.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { ADMIN_TABLE_COL, ADMIN_TABLE_COL_OPS } from "../../utils/adminTableColumns";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery } from "../../utils/adminListFilter";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import "./reports.css";
import {
  formatOlapMetric,
  metricValue,
  aggregateOlapFacts,
  type ReportOlapAggRow,
} from "./olapAggregate";
import {
  REPORT_EXPORT_ROWS,
  REPORT_OLAP_DIMENSIONS,
  REPORT_OLAP_FACT_ROWS,
  REPORT_OLAP_METRICS,
  REPORT_OLAP_MODEL_OPTIONS,
  REPORT_OLAP_TENANT_OPTIONS,
  REPORT_PANEL_ORDER,
  REPORT_PRESET_ROWS,
  type ReportOlapDimensionId,
  type ReportOlapGrain,
  type ReportOlapMetricId,
  type ReportPanelId,
} from "./mock";

const route = useRoute();
const router = useRouter();
const idPrefix = useId().replace(/:/g, "");

// ==================== 面板路由映射 ====================
const panel = computed<ReportPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && REPORT_PANEL_ORDER.includes(id as ReportPanelId)) return id as ReportPanelId;
  return "preset";
});

// ==================== 预置报表面板 ====================
const presetSearchQ = ref("");
const presetPg = useAdminTablePagination(
  computed(() =>
    filterByQuery(REPORT_PRESET_ROWS, presetSearchQ.value, (r) =>
      [r.id, r.name, r.period, r.owner].join(" "),
    ),
  ),
);

function resetPresetQuery(): void {
  presetSearchQ.value = "";
}

// ==================== 导出任务面板 ====================
const exportSearchQ = ref("");
const exportStatus = ref("");
const exportDateRange = ref<AdminDateRange | null>(null);

const filteredExportRows = computed(() => {
  let rows = REPORT_EXPORT_ROWS;
  if (exportDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.createdAt, exportDateRange.value));
  }
  return filterByQuery(rows, exportSearchQ.value, (r) =>
    [r.id, r.name, r.applicant, r.status].join(" "),
  );
});

const exportPg = useAdminTablePagination(filteredExportRows);

function resetExportQuery(): void {
  exportSearchQ.value = "";
  exportStatus.value = "";
  exportDateRange.value = null;
}

// ==================== 操作处理 ====================
function handleViewPreset(row: (typeof REPORT_PRESET_ROWS)[number]): void {
  console.log("查看预置报表", row);
}

function handleCreatePreset(): void {
  console.log("新建预置报表");
}

function handleDownloadExport(row: (typeof REPORT_EXPORT_ROWS)[number]): void {
  console.log("下载导出文件", row);
}

function handleRetryExport(row: (typeof REPORT_EXPORT_ROWS)[number]): void {
  console.log("重试导出任务", row);
}

// ==================== 多维分析（一期展示）====================
const olapGrain = ref<ReportOlapGrain>("day");
const olapDimensions = ref<ReportOlapDimensionId[]>(["date", "tenant", "model"]);
const olapMetrics = ref<ReportOlapMetricId[]>(["requests", "tokensIn", "costCny"]);
const olapTenantFilter = ref("");
const olapModelFilter = ref("");
const olapDateRange = ref<AdminDateRange | null>(null);
const olapSearchQ = ref("");

const olapFilteredFacts = computed(() => {
  let rows = REPORT_OLAP_FACT_ROWS;
  if (olapTenantFilter.value) rows = rows.filter((r) => r.tenantId === olapTenantFilter.value);
  if (olapModelFilter.value) rows = rows.filter((r) => r.modelId === olapModelFilter.value);
  if (olapDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.date, olapDateRange.value));
  }
  return rows;
});

const olapAggregatedRows = computed(() =>
  aggregateOlapFacts(olapFilteredFacts.value, olapDimensions.value, olapGrain.value),
);

const olapDisplayedRows = computed(() =>
  filterByQuery(olapAggregatedRows.value, olapSearchQ.value, (r) =>
    [r.dateLabel, r.tenantName, r.modelName, r.lineLabel, String(r.requests), String(r.costCny)].join(" "),
  ),
);

const olapPg = useAdminTablePagination(olapDisplayedRows);

const olapSummary = computed(() => {
  const rows = olapFilteredFacts.value;
  return {
    requests: rows.reduce((s, r) => s + r.requests, 0),
    tokensIn: rows.reduce((s, r) => s + r.tokensIn, 0),
    tokensOut: rows.reduce((s, r) => s + r.tokensOut, 0),
    costCny: rows.reduce((s, r) => s + r.costCny, 0),
  };
});

const olapActiveDimensions = computed(() => {
  if (olapDimensions.value.length > 0) return olapDimensions.value;
  return ["date", "tenant", "model"] as ReportOlapDimensionId[];
});

const olapActiveMetrics = computed(() => {
  if (olapMetrics.value.length > 0) return olapMetrics.value;
  return ["requests", "costCny"] as ReportOlapMetricId[];
});

const olapSummaryCards = computed(() => {
  const s = olapSummary.value;
  const defs: { id: ReportOlapMetricId; label: string; value: string }[] = [
    { id: "requests", label: "请求次数", value: formatOlapMetric(s.requests, "requests") },
    { id: "tokensIn", label: "入向 Token", value: formatOlapMetric(s.tokensIn, "tokensIn") },
    { id: "tokensOut", label: "出向 Token", value: formatOlapMetric(s.tokensOut, "tokensOut") },
    { id: "costCny", label: "预估消耗", value: formatOlapMetric(s.costCny, "costCny") },
  ];
  return defs.filter((d) => olapActiveMetrics.value.includes(d.id));
});

const olapDimensionLabel = (id: ReportOlapDimensionId): string =>
  REPORT_OLAP_DIMENSIONS.find((d) => d.id === id)?.label ?? id;

const olapMetricLabel = (id: ReportOlapMetricId): string =>
  REPORT_OLAP_METRICS.find((m) => m.id === id)?.label ?? id;

function resetOlapQuery(): void {
  olapGrain.value = "day";
  olapDimensions.value = ["date", "tenant", "model"];
  olapMetrics.value = ["requests", "tokensIn", "costCny"];
  olapTenantFilter.value = "";
  olapModelFilter.value = "";
  olapDateRange.value = null;
  olapSearchQ.value = "";
}

function goBillingUsageFromOlap(row: ReportOlapAggRow): void {
  const query: Record<string, string> = {};
  if (row.tenantName) {
    const fact = REPORT_OLAP_FACT_ROWS.find((r) => r.tenantName === row.tenantName);
    if (fact) query.tenantId = fact.tenantId;
  }
  if (row.modelName) {
    const fact = REPORT_OLAP_FACT_ROWS.find((r) => r.modelName === row.modelName);
    if (fact) query.modelId = fact.modelId;
  }
  void router.push({ name: "tai-admin-billing-usage", query });
}

function onOlapExportClick(): void {
  window.alert(`原型：将导出当前 ${olapDisplayedRows.value.length} 行聚合结果（正式版走导出任务与 §4.13 审批）。`);
}
</script>

<template>
  <section class="rpt-page rpt-page--flow">
    <!-- ==================== 预置报表面板 ==================== -->
    <div v-show="panel === 'preset'" class="rpt-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="预置报表 · 原型" explain="预置报表对内说明（原型）">
            <p>固定模板与参数面板为 mock；工程期接数仓与权限。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <!-- 左侧：查询条件 -->
          <el-input
            :id="`${idPrefix}-preset-search`"
            v-model="presetSearchQ"
            placeholder="报表名称、周期、负责人…"
            clearable
            style="width: 220px"
          />
          <el-button :icon="Refresh" @click="resetPresetQuery">重置</el-button>

          <!-- 右侧：操作按钮 -->
          <el-button type="primary" :icon="Plus" @click="handleCreatePreset">
            新建报表
          </el-button>
        </template>
      </AdminSectionHead>

      <el-table
        :data="presetPg.paginatedRows"
        row-key="id"
        class="admin-ep-table-wrap"
      >
        <!-- 列：仅 min-width，全部左对齐 -->
        <el-table-column prop="name" label="报表" :min-width="ADMIN_TABLE_COL.primary" show-overflow-tooltip sortable />
        <el-table-column prop="period" label="周期" :min-width="ADMIN_TABLE_COL.sm" sortable />
        <el-table-column prop="owner" label="负责人" :min-width="ADMIN_TABLE_COL.xs" sortable />
        <el-table-column prop="updatedAt" label="更新时间" :min-width="ADMIN_TABLE_COL.lg" sortable />

        <!-- 操作列：固定右侧 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="admin-ep-row-actions" @click.stop>
              <el-button type="primary" link :icon="View" @click="handleViewPreset(row)">
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="暂无预置报表" />
        </template>
      </el-table>

      <AdminTablePagination
        v-model:current-page="presetPg.currentPage"
        v-model:page-size="presetPg.pageSize"
        :total="presetPg.total"
      />
    </div>

    <!-- ==================== 多维分析（一期：配置 + 透视表）==================== -->
    <div v-show="panel === 'olap'" class="rpt-page__panel rpt-page__panel--olap">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="多维分析 · 一期" explain="OLAP 对内说明（原型）">
            <p>
              选择维度与指标后聚合 mock 事实表；拖拽布局、保存视图为二期。可
              <strong>下钻用量明细</strong>（跳转计费 §4.3）。
            </p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="olapSearchQ"
            :input-id="`${idPrefix}-rpt-olap-q`"
            search-placeholder="检索聚合结果…"
            search-aria-label="检索多维分析结果"
            @reset="resetOlapQuery"
          >
            <template #filters>
              <el-select v-model="olapGrain" aria-label="时间粒度" class="rpt-olap__grain">
                <el-option label="按日" value="day" />
                <el-option label="按周" value="week" />
                <el-option label="按月" value="month" />
              </el-select>
              <el-select
                v-model="olapTenantFilter"
                clearable
                placeholder="客户"
                aria-label="筛选客户"
                class="rpt-olap__filter-tenant"
              >
                <el-option
                  v-for="opt in REPORT_OLAP_TENANT_OPTIONS"
                  :key="opt.value || 'all'"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <el-select
                v-model="olapModelFilter"
                clearable
                placeholder="模型"
                aria-label="筛选模型"
                class="rpt-olap__filter-model"
              >
                <el-option
                  v-for="opt in REPORT_OLAP_MODEL_OPTIONS"
                  :key="opt.value || 'all'"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <AdminDateRangePicker v-model="olapDateRange" aria-label="分析时间范围" />
            </template>
            <template #actions>
              <AdminExportCsvButton
                :hint="`将导出当前 ${olapDisplayedRows.length} 行聚合结果（原型占位）。`"
                @export="onOlapExportClick"
              />
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>

      <div class="rpt-olap__config" role="group" aria-label="分组维度与指标">
        <div class="rpt-olap__config-row">
          <span class="rpt-olap__config-label">维度</span>
          <el-select
            v-model="olapDimensions"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择维度"
            aria-label="分组维度"
            class="rpt-olap__select-dim"
          >
            <el-option
              v-for="d in REPORT_OLAP_DIMENSIONS"
              :key="d.id"
              :label="d.label"
              :value="d.id"
            />
          </el-select>
        </div>
        <div class="rpt-olap__config-row">
          <span class="rpt-olap__config-label">指标</span>
          <el-select
            v-model="olapMetrics"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择指标"
            aria-label="指标"
            class="rpt-olap__select-metric"
          >
            <el-option
              v-for="m in REPORT_OLAP_METRICS"
              :key="m.id"
              :label="m.label"
              :value="m.id"
            />
          </el-select>
        </div>
        <p class="rpt-olap__config-hint">
          当前分组：{{ olapActiveDimensions.map(olapDimensionLabel).join(" · ") }}；指标：{{
            olapActiveMetrics.map(olapMetricLabel).join("、")
          }}
          · 共 {{ olapDisplayedRows.length }} 行（事实表 mock {{ olapFilteredFacts.length }} 条）
        </p>
      </div>

      <div v-if="olapSummaryCards.length" class="rpt-olap__summary">
        <div v-for="card in olapSummaryCards" :key="card.id" class="rpt-olap__stat">
          <span class="rpt-olap__stat-label">{{ card.label }}</span>
          <span class="rpt-olap__stat-value">{{ card.value }}</span>
        </div>
      </div>

      <el-table
        :data="olapPg.paginatedRows"
        row-key="key"
        class="admin-ep-table-wrap"
        style="width: 100%"
      >
        <el-table-column
          v-if="olapActiveDimensions.includes('date')"
          prop="dateLabel"
          :label="olapGrain === 'day' ? '日期' : olapGrain === 'week' ? '周' : '月份'"
          :min-width="ADMIN_TABLE_COL.sm"
          sortable
        />
        <el-table-column
          v-if="olapActiveDimensions.includes('tenant')"
          prop="tenantName"
          label="客户"
          :min-width="ADMIN_TABLE_COL.md"
          sortable
          show-overflow-tooltip
        />
        <el-table-column
          v-if="olapActiveDimensions.includes('model')"
          prop="modelName"
          label="模型"
          :min-width="ADMIN_TABLE_COL.primary"
          sortable
          show-overflow-tooltip
        />
        <el-table-column
          v-if="olapActiveDimensions.includes('line')"
          prop="lineLabel"
          label="供应商线路"
          :min-width="ADMIN_TABLE_COL.xl"
          sortable
          show-overflow-tooltip
        />
        <el-table-column
          v-for="mid in olapActiveMetrics"
          :key="mid"
          :label="olapMetricLabel(mid)"
          :min-width="ADMIN_TABLE_COL.md"
          sortable
        >
          <template #default="scope">
            <template v-if="scope?.row">
              {{ formatOlapMetric(metricValue(scope.row, mid), mid) }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.sm" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <div class="admin-ep-row-actions" @click.stop>
                <el-button link type="primary" :icon="View" @click="goBillingUsageFromOlap(scope.row)">明细</el-button>
              </div>
            </template>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="无聚合结果，请调整维度或筛选" />
        </template>
      </el-table>

      <AdminTablePagination
        v-model:current-page="olapPg.currentPage"
        v-model:page-size="olapPg.pageSize"
        :total="olapPg.total"
      />
    </div>

    <!-- ==================== 导出任务面板 ==================== -->
    <div v-show="panel === 'export'" class="rpt-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="导出任务 · 原型" explain="导出任务对内说明（原型）">
            <p>异步导出队列 mock；与 §4.13 数据导出审批衔接。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <!-- 左侧：查询条件 -->
          <el-input
            :id="`${idPrefix}-export-search`"
            v-model="exportSearchQ"
            placeholder="任务名称、申请人…"
            clearable
            style="width: 200px"
          />
          <el-select
            v-model="exportStatus"
            placeholder="状态"
            clearable
            style="width: 120px"
          >
            <el-option label="已完成" value="已完成" />
            <el-option label="处理中" value="处理中" />
            <el-option label="失败" value="失败" />
          </el-select>
          <el-date-picker
            v-model="exportDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
          <el-button :icon="Refresh" @click="resetExportQuery">重置</el-button>

          <!-- 右侧：操作按钮 -->
          <el-button type="primary" :icon="Plus">新建导出</el-button>
        </template>
      </AdminSectionHead>

      <el-table
        :data="exportPg.paginatedRows"
        row-key="id"
        class="admin-ep-table-wrap"
      >
        <!-- 列：仅 min-width，全部左对齐 -->
        <el-table-column prop="id" label="任务 ID" min-width="xs" sortable />
        <el-table-column prop="name" label="名称" min-width="primary" show-overflow-tooltip sortable />
        <el-table-column prop="applicant" label="申请人" min-width="sm" sortable />
        <el-table-column prop="status" label="状态" min-width="xs" sortable>
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : row.status === '处理中' ? 'warning' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="lg" sortable />

        <!-- 操作列：固定右侧 -->
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="admin-ep-row-actions" @click.stop>
              <el-button type="primary" link :icon="Download" @click="handleDownloadExport(row)">
                下载
              </el-button>
              <el-button
                v-if="row.status === '失败'"
                type="primary"
                link
                :icon="Refresh"
                @click="handleRetryExport(row)"
              >
                重试
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="暂无导出任务" />
        </template>
      </el-table>

      <AdminTablePagination
        v-model:current-page="exportPg.currentPage"
        v-model:page-size="exportPg.pageSize"
        :total="exportPg.total"
      />
    </div>

    <!-- ==================== 订阅推送面板（占位）==================== -->
    <div v-show="panel === 'subscribe'" class="rpt-page__panel">
      <AdminSectionHead toolbar-only>
        <template #annot>
          <AdminInternalTip heading="订阅推送 · 原型" explain="订阅推送对内说明（原型）">
            <p>周期推送与订阅管理为二期范围。</p>
          </AdminInternalTip>
        </template>
      </AdminSectionHead>
      <div class="rpt-page__placeholder">订阅推送（二期）占位。</div>
    </div>
  </section>
</template>
