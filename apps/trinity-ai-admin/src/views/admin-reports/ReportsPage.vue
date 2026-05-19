<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRoute } from "vue-router";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery } from "../../utils/adminListFilter";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import "./reports.css";
import {
  REPORT_EXPORT_ROWS,
  REPORT_PANEL_ORDER,
  REPORT_PRESET_ROWS,
  type ReportPanelId,
} from "./mock";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<ReportPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && REPORT_PANEL_ORDER.includes(id as ReportPanelId)) return id as ReportPanelId;
  return "preset";
});

const presetSearchQ = ref("");
const exportSearchQ = ref("");
const exportDateRange = ref<AdminDateRange | null>(null);

const filteredPresetRows = computed(() =>
  filterByQuery(REPORT_PRESET_ROWS, presetSearchQ.value, (r) =>
    [r.id, r.name, r.period, r.owner, r.updatedAt].join(" "),
  ),
);

const filteredExportRows = computed(() => {
  let rows = REPORT_EXPORT_ROWS;
  if (exportDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.createdAt, exportDateRange.value));
  }
  return filterByQuery(rows, exportSearchQ.value, (r) =>
    [r.id, r.name, r.applicant, r.status, r.createdAt].join(" "),
  );
});

function resetExportQuery(): void {
  exportDateRange.value = null;
}

const presetPg = useAdminTablePagination(filteredPresetRows);
const exportPg = useAdminTablePagination(filteredExportRows);

</script>

<template>
  <section class="rpt-page">
    <el-card v-show="panel === 'preset'" shadow="never" class="admin-ep-card rpt-page__panel" aria-label="预置报表">
      <AdminSectionHead toolbar-only title="预置报表">
        <template #annot>
          <AdminInternalTip heading="预置报表 · 原型" explain="预置报表对内说明（原型）">
            <p>固定模板与参数面板为 mock；工程期接数仓与权限。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="presetSearchQ"
            :input-id="`${idPrefix}-rpt-preset-q`"
            search-placeholder="报表名称、周期、负责人…"
            search-aria-label="检索预置报表"
          >
            <template #actions>
              <el-button type="primary" plain>新建报表（示意）</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="presetPg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="name" label="报表" min-width="140" sortable />
        <el-table-column prop="period" label="周期" width="120" sortable />
        <el-table-column prop="owner" label="负责人" width="100" sortable />
        <el-table-column prop="updatedAt" label="更新" min-width="140" sortable />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button link type="primary">查看</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="presetPg.currentPage"
        v-model:page-size="presetPg.pageSize"
        :total="presetPg.total"
      />
    </el-card>

    <el-card v-show="panel === 'olap'" shadow="never" class="admin-ep-card rpt-page__panel" aria-label="多维分析">
      <AdminSectionHead toolbar-only title="多维分析">
        <template #annot>
          <AdminInternalTip heading="多维分析 · 原型" explain="OLAP 对内说明（原型）">
            <p>拖拽/配置式分析为二期；与用量明细互跳见详设 §4.10。</p>
          </AdminInternalTip>
        </template>
      </AdminSectionHead>
      <div class="rpt-page__placeholder">多维分析能力规划中（二期）。</div>
    </el-card>

    <el-card v-show="panel === 'export'" shadow="never" class="admin-ep-card rpt-page__panel" aria-label="导出任务">
      <AdminSectionHead toolbar-only title="导出任务">
        <template #annot>
          <AdminInternalTip heading="导出任务 · 原型" explain="导出任务对内说明（原型）">
            <p>异步导出队列 mock；与 §4.13 数据导出审批衔接。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="exportSearchQ"
            :input-id="`${idPrefix}-rpt-export-q`"
            search-placeholder="任务、申请人、状态…"
            search-aria-label="检索导出任务"
            @reset="resetExportQuery"
          >
            <AdminDateRangePicker v-model="exportDateRange" aria-label="导出任务创建时间范围" />
            <template #actions>
              <el-button type="primary" plain>新建导出（示意）</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="exportPg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="id" label="任务 ID" min-width="112" sortable />
        <el-table-column prop="name" label="名称" min-width="140" sortable />
        <el-table-column prop="applicant" label="申请人" width="100" sortable />
        <el-table-column prop="status" label="状态" width="96" sortable />
        <el-table-column prop="createdAt" label="创建时间" min-width="140" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="exportPg.currentPage"
        v-model:page-size="exportPg.pageSize"
        :total="exportPg.total"
      />
    </el-card>

    <el-card v-show="panel === 'subscribe'" shadow="never" class="admin-ep-card rpt-page__panel" aria-label="订阅推送">
      <AdminSectionHead toolbar-only title="订阅推送（二期）">
        <template #annot>
          <AdminInternalTip heading="订阅推送 · 原型" explain="订阅推送对内说明（原型）">
            <p>周期推送与订阅管理为二期范围。</p>
          </AdminInternalTip>
        </template>
      </AdminSectionHead>
      <div class="rpt-page__placeholder">订阅推送（二期）占位。</div>
    </el-card>
  </section>
</template>
