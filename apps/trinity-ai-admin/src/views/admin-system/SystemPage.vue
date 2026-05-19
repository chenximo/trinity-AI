<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute } from "vue-router";
import { Edit, Setting } from "@element-plus/icons-vue";
import AdminAuditDiffPanel from "../../components/AdminAuditDiffPanel.vue";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminExportCsvButton from "../../components/AdminExportCsvButton.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery, uniqueFieldValues } from "../../utils/adminListFilter";
import "./system.css";
import {
  AUDIT_RETENTION_NOTE,
  DEFAULT_AUDIT_LOG_ROWS,
  DEFAULT_SECURITY_EVENTS,
  DEFAULT_EXPORT_APPROVALS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_GLOBAL_PARAMS,
  DEFAULT_SENSITIVE_RULES,
  SYSTEM_PANEL_ORDER,
  type AuditLogRow,
  type SecurityEventRow,
  type ExportApprovalRow,
  type FeatureFlagRow,
  type GlobalParamRow,
  type SensitiveRuleRow,
  type SystemPanelId,
} from "./mock";
import {
  readAuditFilter,
  readAuditRowsJson,
  readExportApprovalsJson,
  readFeatureFlagsJson,
  readGlobalParamsJson,
  readSensitiveRulesJson,
  writeAuditFilter,
  writeAuditRowsJson,
  writeExportApprovalsJson,
  writeFeatureFlagsJson,
  writeGlobalParamsJson,
  writeSensitiveRulesJson,
} from "./systemInteractions";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<SystemPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && SYSTEM_PANEL_ORDER.includes(id as SystemPanelId)) return id as SystemPanelId;
  return "audit-log";
});

const auditFilter = ref("");
const auditModuleFilter = ref("");
const auditDateRange = ref<AdminDateRange | null>(null);
const sensitiveSearchQ = ref("");
const sensitiveEnabledFilter = ref("");
const exportSearchQ = ref("");
const exportStatusFilter = ref("");
const exportDateRange = ref<AdminDateRange | null>(null);
const flagSearchQ = ref("");
const flagEnvFilter = ref("");
const globalSearchQ = ref("");
const globalCategoryFilter = ref("");
const auditRows = ref<AuditLogRow[]>([]);
const securityRows = ref<SecurityEventRow[]>(JSON.parse(JSON.stringify(DEFAULT_SECURITY_EVENTS)));
const securitySearchQ = ref("");
const auditDiffOpen = ref(false);
const auditDiffRow = ref<AuditLogRow | null>(null);
const sensitiveRows = ref<SensitiveRuleRow[]>([]);
const exportRows = ref<ExportApprovalRow[]>([]);
const flagRows = ref<FeatureFlagRow[]>([]);
const globalRows = ref<GlobalParamRow[]>([]);

const sensitiveModalOpen = ref(false);
const sensitiveEditingId = ref<string | null>(null);
const sensitiveFormError = ref("");
const draftSenMfa = ref(false);
const draftSenDual = ref(false);
const draftSenEnabled = ref(true);

const globalModalOpen = ref(false);
const globalEditingId = ref<string | null>(null);
const globalFormError = ref("");
const draftGlobalValue = ref("");

const infoModalOpen = ref(false);
const infoModalTitle = ref("");
const infoModalMessage = ref("");

function loadJson<T>(raw: string | null, fallback: T[]): T[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[];
    } catch {
      /* default */
    }
  }
  return JSON.parse(JSON.stringify(fallback)) as T[];
}

function loadAll(): void {
  auditRows.value = loadJson(readAuditRowsJson(), DEFAULT_AUDIT_LOG_ROWS);
  sensitiveRows.value = loadJson(readSensitiveRulesJson(), DEFAULT_SENSITIVE_RULES);
  exportRows.value = loadJson(readExportApprovalsJson(), DEFAULT_EXPORT_APPROVALS);
  flagRows.value = loadJson(readFeatureFlagsJson(), DEFAULT_FEATURE_FLAGS);
  globalRows.value = loadJson(readGlobalParamsJson(), DEFAULT_GLOBAL_PARAMS);
  auditFilter.value = readAuditFilter();
}

function persistAudit(): void {
  writeAuditRowsJson(JSON.stringify(auditRows.value));
}

function persistSensitive(): void {
  writeSensitiveRulesJson(JSON.stringify(sensitiveRows.value));
}

function persistExport(): void {
  writeExportApprovalsJson(JSON.stringify(exportRows.value));
}

function persistFlags(): void {
  writeFeatureFlagsJson(JSON.stringify(flagRows.value));
}

function persistGlobal(): void {
  writeGlobalParamsJson(JSON.stringify(globalRows.value));
}

const auditModuleOptions = computed(() => uniqueFieldValues(auditRows.value, (r) => r.module));

const filteredAudit = computed(() => {
  let rows = auditRows.value;
  if (auditModuleFilter.value) rows = rows.filter((r) => r.module === auditModuleFilter.value);
  if (auditDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.at, auditDateRange.value));
  }
  return filterByQuery(rows, auditFilter.value, (r) =>
    [r.actorLogin, r.actorName, r.module, r.action, r.target, r.ip, r.result, r.at].join(" "),
  );
});

const filteredSensitive = computed(() => {
  let rows = sensitiveRows.value;
  if (sensitiveEnabledFilter.value === "yes") rows = rows.filter((r) => r.enabled);
  if (sensitiveEnabledFilter.value === "no") rows = rows.filter((r) => !r.enabled);
  return filterByQuery(rows, sensitiveSearchQ.value, (r) => [r.operation, r.description].join(" "));
});

const filteredExport = computed(() => {
  let rows = exportRows.value;
  if (exportStatusFilter.value) rows = rows.filter((r) => r.status === exportStatusFilter.value);
  if (exportDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.requestedAt, exportDateRange.value));
  }
  return filterByQuery(rows, exportSearchQ.value, (r) =>
    [r.id, r.applicant, r.scope, r.rowEstimate, r.status, r.requestedAt].join(" "),
  );
});

const filteredFlags = computed(() => {
  let rows = flagRows.value;
  if (flagEnvFilter.value) rows = rows.filter((r) => r.env === flagEnvFilter.value);
  return filterByQuery(rows, flagSearchQ.value, (r) => [r.key, r.name, r.env, r.note].join(" "));
});

const flagEnvOptions = computed(() => uniqueFieldValues(flagRows.value, (r) => r.env));

const filteredGlobal = computed(() => {
  let rows = globalRows.value;
  if (globalCategoryFilter.value) rows = rows.filter((r) => r.category === globalCategoryFilter.value);
  return filterByQuery(rows, globalSearchQ.value, (r) =>
    [r.key, r.label, r.category, r.value, r.updatedBy].join(" "),
  );
});

const globalCategoryOptions = computed(() => uniqueFieldValues(globalRows.value, (r) => r.category));

function resetAuditQuery(): void {
  auditModuleFilter.value = "";
  auditDateRange.value = null;
}

function resetSensitiveQuery(): void {
  sensitiveEnabledFilter.value = "";
}

function resetExportQuery(): void {
  exportStatusFilter.value = "";
  exportDateRange.value = null;
}

function resetFlagQuery(): void {
  flagEnvFilter.value = "";
}

function resetGlobalQuery(): void {
  globalCategoryFilter.value = "";
}

const editingSensitive = computed(() =>
  sensitiveEditingId.value ? sensitiveRows.value.find((r) => r.id === sensitiveEditingId.value) : undefined,
);

const sensitiveModalTitle = computed(() =>
  editingSensitive.value ? `配置 · ${editingSensitive.value.operation}` : "敏感操作规则",
);

const editingGlobal = computed(() =>
  globalEditingId.value ? globalRows.value.find((r) => r.id === globalEditingId.value) : undefined,
);

const globalModalTitle = computed(() =>
  editingGlobal.value ? `编辑 · ${editingGlobal.value.label}` : "全局参数",
);

function auditResultClass(result: AuditLogRow["result"]): string {
  return result === "成功" ? "sys-page__badge--ok" : "sys-page__badge--danger";
}

function exportStatusClass(status: ExportApprovalRow["status"]): string {
  if (status === "待审批") return "sys-page__badge--warn";
  if (status === "已通过") return "sys-page__badge--ok";
  return "sys-page__badge--danger";
}

function openSensitiveModal(row: SensitiveRuleRow): void {
  sensitiveEditingId.value = row.id;
  draftSenMfa.value = row.requireMfa;
  draftSenDual.value = row.requireDualApproval;
  draftSenEnabled.value = row.enabled;
  sensitiveFormError.value = "";
  sensitiveModalOpen.value = true;
}

function closeSensitiveModal(): void {
  sensitiveModalOpen.value = false;
  sensitiveEditingId.value = null;
}

function saveSensitiveModal(): void {
  const row = editingSensitive.value;
  if (!row) return;
  row.requireMfa = draftSenMfa.value;
  row.requireDualApproval = draftSenDual.value;
  row.enabled = draftSenEnabled.value;
  row.updatedAt = formatNow();
  persistSensitive();
  closeSensitiveModal();
  showInfo("已保存", `规则「${row.operation}」已更新（mock）。`);
}

function openGlobalModal(row: GlobalParamRow): void {
  globalEditingId.value = row.id;
  draftGlobalValue.value = row.value;
  globalFormError.value = "";
  globalModalOpen.value = true;
}

function closeGlobalModal(): void {
  globalModalOpen.value = false;
  globalEditingId.value = null;
}

function saveGlobalModal(): void {
  const row = editingGlobal.value;
  if (!row) return;
  const v = draftGlobalValue.value.trim();
  if (!v) {
    globalFormError.value = "请输入参数值";
    return;
  }
  row.value = v;
  row.updatedAt = formatNow();
  row.updatedBy = "zhang.san";
  persistGlobal();
  closeGlobalModal();
  showInfo("已保存", `参数 ${row.key} 已更新并记入审计（mock）。`);
}

function toggleFlag(row: FeatureFlagRow): void {
  row.enabled = !row.enabled;
  row.updatedAt = formatNow();
  persistFlags();
}

function reviewExport(row: ExportApprovalRow, pass: boolean): void {
  if (row.status !== "待审批") return;
  row.status = pass ? "已通过" : "已拒绝";
  row.reviewer = "zhang.san";
  row.reviewedAt = formatNow();
  persistExport();
  showInfo(pass ? "已通过" : "已拒绝", `导出申请 ${row.id} 已${row.status}。`);
}

function showInfo(title: string, message: string): void {
  infoModalTitle.value = title;
  infoModalMessage.value = message;
  infoModalOpen.value = true;
}

function closeInfoModal(): void {
  infoModalOpen.value = false;
}

function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function yesNo(v: boolean): string {
  return v ? "是" : "否";
}

watch(auditFilter, (v) => writeAuditFilter(v));

const filteredSecurity = computed(() =>
  filterByQuery(securityRows.value, securitySearchQ.value, (r) =>
    [r.eventType, r.subject, r.detail, r.ip, r.severity].join(" "),
  ),
);

function openAuditDiff(row: AuditLogRow): void {
  auditDiffRow.value = row;
  auditDiffOpen.value = true;
}

const auditPg = useAdminTablePagination(filteredAudit);
const securityPg = useAdminTablePagination(filteredSecurity);
const sensitivePg = useAdminTablePagination(filteredSensitive);
const exportPg = useAdminTablePagination(filteredExport);
const flagsPg = useAdminTablePagination(filteredFlags);
const globalPg = useAdminTablePagination(filteredGlobal);

onMounted(() => loadAll());
</script>

<template>
  <div class="sys-page">
    <el-card v-show="panel === 'audit-log'" shadow="never" class="admin-ep-card sys-page__panel" aria-label="操作审计">
      <AdminSectionHead toolbar-only title="操作审计">
        <template #annot>
          <AdminInternalTip heading="操作审计 · 原型" explain="操作审计对内说明（原型）">
            <p>检索与导出为示意；保留周期与不可抵赖存证见 <strong>§4.13</strong>。</p>
            <p>{{ AUDIT_RETENTION_NOTE }}</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="auditFilter"
            :input-id="`${idPrefix}-audit-search`"
            search-placeholder="操作人、模块、动作、目标…"
            search-aria-label="检索审计日志"
            @reset="resetAuditQuery"
          >
            <template #filters>
              <el-select
                v-model="auditModuleFilter"
                clearable
                placeholder="模块"
                aria-label="按模块筛选"
                style="width: 7rem"
              >
                <el-option v-for="m in auditModuleOptions" :key="m" :label="m" :value="m" />
              </el-select>
            </template>
            <AdminDateRangePicker v-model="auditDateRange" aria-label="操作审计时间范围" />
            <template #actions>
              <AdminExportCsvButton label="导出审计包" hint="正式环境需审批与双人复核后生成加密包（原型占位）。" />
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table
        :data="auditPg.paginatedRows"
        row-key="id"
        class="admin-ep-table-wrap"
        style="width: 100%"
        :default-sort="{ prop: 'at', order: 'descending' }"
      >
        <el-table-column prop="at" label="时间" min-width="160" show-overflow-tooltip sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.at }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="actorName" label="操作人" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            {{ scope.row.actorName }}
            <br />
            <span class="sys-page__mono sys-page__muted">{{ scope.row.actorLogin }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="96" sortable/>
        <el-table-column prop="action" label="动作" width="96" sortable/>
        <el-table-column prop="target" label="目标" min-width="112" show-overflow-tooltip sortable>
          <template #default="scope">
            <template v-if="scope?.row">
              <span class="sys-page__mono">{{ scope.row.target }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="结果" width="80" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
            <span :class="auditResultClass(scope.row.result)">{{ scope.row.result }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="ip" label="来源 IP" width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.ip }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="Diff" width="72" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button link type="primary" @click="openAuditDiff(scope.row)">查看</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="auditPg.currentPage"
        v-model:page-size="auditPg.pageSize"
        :total="auditPg.total"
      />
      <p v-if="filteredAudit.length === 0" class="sys-page__hint">无匹配记录。</p>
    </el-card>

    <el-card v-show="panel === 'security-events'" shadow="never" class="admin-ep-card sys-page__panel" aria-label="安全事件">
      <AdminSectionHead toolbar-only title="安全事件">
        <template #tools>
          <AdminListQuery
            v-model:search="securitySearchQ"
            :input-id="`${idPrefix}-sec-q`"
            search-placeholder="类型、主体、详情…"
            search-aria-label="检索安全事件"
          />
        </template>
      </AdminSectionHead>
      <el-table :data="securityPg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="at" label="时间" min-width="140" sortable />
        <el-table-column prop="eventType" label="类型" width="140" sortable />
        <el-table-column prop="severity" label="级别" width="72" sortable />
        <el-table-column prop="subject" label="主体" min-width="96" sortable />
        <el-table-column prop="detail" label="详情" min-width="160" sortable />
        <el-table-column prop="ip" label="IP" width="112" sortable />
      </el-table>
      <AdminTablePagination
        v-model:current-page="securityPg.currentPage"
        v-model:page-size="securityPg.pageSize"
        :total="securityPg.total"
      />
    </el-card>

    <el-card v-show="panel === 'sensitive'" shadow="never" class="admin-ep-card sys-page__panel" aria-label="敏感操作审批">
      <AdminSectionHead toolbar-only title="敏感操作审批">
        <template #annot>
          <AdminInternalTip heading="敏感操作审批 · 原型" explain="敏感操作对内说明（原型）">
            <p>MFA/双人复核为产品规则占位；正式环境对接审批流引擎。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="sensitiveSearchQ"
            :input-id="`${idPrefix}-sen-q`"
            search-placeholder="操作类型、说明…"
            search-aria-label="检索敏感规则"
            @reset="resetSensitiveQuery"
          >
            <template #filters>
              <el-select
                v-model="sensitiveEnabledFilter"
                clearable
                placeholder="启用"
                aria-label="按启用筛选"
                style="width: 7rem"
              >
                <el-option label="已启用" value="yes" />
                <el-option label="未启用" value="no" />
              </el-select>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="sensitivePg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="operation" label="操作类型" min-width="128" sortable/>
        <el-table-column prop="description" label="说明" min-width="128" sortable/>
        <el-table-column prop="requireMfa" label="需 MFA" width="80" sortable>
          <template #default="scope">
              <template v-if="scope?.row">{{ yesNo(scope.row.requireMfa) }}
              </template>
            </template>
        </el-table-column>
        <el-table-column prop="requireDualApproval" label="双人复核" width="88" sortable>
          <template #default="scope">
              <template v-if="scope?.row">{{ yesNo(scope.row.requireDualApproval) }}
              </template>
            </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="64" sortable>
            <template #default="scope">
              <template v-if="scope?.row">{{ yesNo(scope.row.enabled) }}
              </template>
            </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新于" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.updatedAt }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="80"fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions">
              <el-button link type="primary" @click="openSensitiveModal(scope.row)">
                <el-icon><Setting /></el-icon>
                配置
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="sensitivePg.currentPage"
        v-model:page-size="sensitivePg.pageSize"
        :total="sensitivePg.total"
      />
    </el-card>

    <el-card v-show="panel === 'export-approval'" shadow="never" class="admin-ep-card sys-page__panel" aria-label="数据导出审批">
      <AdminSectionHead toolbar-only title="数据导出审批">
        <template #annot>
          <AdminInternalTip heading="数据导出审批 · 原型" explain="导出审批对内说明（原型）">
            <p>与报表导出、大客户数据包衔接为示意；超阈值队列 mock。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="exportSearchQ"
            :input-id="`${idPrefix}-exp-q`"
            search-placeholder="申请 ID、申请人、范围…"
            search-aria-label="检索导出申请"
            @reset="resetExportQuery"
          >
            <template #filters>
              <el-select
                v-model="exportStatusFilter"
                clearable
                placeholder="状态"
                aria-label="按状态筛选"
                style="width: 7rem"
              >
                <el-option label="待审批" value="待审批" />
                <el-option label="已通过" value="已通过" />
                <el-option label="已拒绝" value="已拒绝" />
              </el-select>
            </template>
            <AdminDateRangePicker v-model="exportDateRange" aria-label="导出申请时间范围" />
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="exportPg.paginatedRows" row-key="id" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="id" label="申请 ID" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.id }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" min-width="96" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.applicant }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="scope" label="范围" min-width="96" sortable/>
        <el-table-column prop="rowEstimate" label="预估行数" width="88" sortable/>
        <el-table-column prop="requestedAt" label="申请时间" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.requestedAt }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="88" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
            <span :class="exportStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="审批人" min-width="112">
          <template #default="scope">
            <template v-if="scope?.row">
              <template v-if="scope.row.reviewer">
                {{ scope.row.reviewer }}
                <br />
                <span class="sys-page__mono sys-page__muted">{{ scope.row.reviewedAt }}</span>
              </template>
              <span v-else class="sys-page__muted">—</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="112"fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <div v-if="scope.row.status === '待审批'" class="admin-ep-row-actions sys-page__ops">
              <el-button link type="primary" @click="reviewExport(scope.row, true)">通过</el-button>
              <el-button link type="danger" @click="reviewExport(scope.row, false)">拒绝</el-button>
            </div>
              <span v-else class="sys-page__muted">—</span>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="exportPg.currentPage"
        v-model:page-size="exportPg.pageSize"
        :total="exportPg.total"
      />
    </el-card>

    <el-card v-show="panel === 'flags'" shadow="never" class="admin-ep-card sys-page__panel" aria-label="特性开关">
      <AdminSectionHead toolbar-only title="特性开关">
        <template #annot>
          <AdminInternalTip heading="特性开关 · 原型" explain="特性开关对内说明（原型）">
            <p>灰度百分比为占位；变更应写入审计并与发布系统联动。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="flagSearchQ"
            :input-id="`${idPrefix}-flag-q`"
            search-placeholder="开关键、名称…"
            search-aria-label="检索特性开关"
            @reset="resetFlagQuery"
          >
            <template #filters>
              <el-select
                v-model="flagEnvFilter"
                clearable
                placeholder="环境"
                aria-label="按环境筛选"
                style="width: 7rem"
              >
                <el-option v-for="e in flagEnvOptions" :key="e" :label="e" :value="e" />
              </el-select>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="flagsPg.paginatedRows" row-key="key" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="key" label="开关键" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.key }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="96" sortable/>
        <el-table-column prop="env" label="环境" width="80" sortable/>
        <el-table-column prop="rolloutPct" label="灰度 %" width="80" sortable>
          <template #default="scope">
              <template v-if="scope?.row">{{ scope.row.rolloutPct }}%
              </template>
            </template>
        </el-table-column>
        <el-table-column label="启用" width="80">
          <template #default="scope">
            <template v-if="scope?.row">
            <button
              type="button"
              class="sys-page__toggle"
              :class="{ 'is-on': scope.row.enabled }"
              :aria-pressed="scope.row.enabled ? 'true' : 'false'"
              :aria-label="`${scope.row.name} ${scope.row.enabled ? '已启用' : '已关闭'}`"
              @click="toggleFlag(scope.row)"
            />
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="96" sortable/>
        <el-table-column prop="updatedAt" label="更新于" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.updatedAt }}</span>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="flagsPg.currentPage"
        v-model:page-size="flagsPg.pageSize"
        :total="flagsPg.total"
      />
    </el-card>

    <el-card v-show="panel === 'global'" shadow="never" class="admin-ep-card sys-page__panel" aria-label="全局参数">
      <AdminSectionHead toolbar-only title="全局参数">
        <template #annot>
          <AdminInternalTip heading="全局参数 · 原型" explain="全局参数对内说明（原型）">
            <p>计费时区、限流等变更属高风险配置；工程期加变更单与回滚。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="globalSearchQ"
            :input-id="`${idPrefix}-global-q`"
            search-placeholder="参数键、名称、值…"
            search-aria-label="检索全局参数"
            @reset="resetGlobalQuery"
          >
            <template #filters>
              <el-select
                v-model="globalCategoryFilter"
                clearable
                placeholder="分类"
                aria-label="按分类筛选"
                style="width: 7rem"
              >
                <el-option v-for="c in globalCategoryOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="globalPg.paginatedRows" row-key="key" class="admin-ep-table-wrap" style="width: 100%">
        <el-table-column prop="key" label="参数键" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.key }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="label" label="名称" min-width="96" sortable/>
        <el-table-column prop="category" label="分类" width="96" sortable/>
        <el-table-column prop="value" label="当前值" min-width="96" sortable/>
        <el-table-column prop="updatedBy" label="更新人" width="96" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.updatedBy }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新于" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="sys-page__mono">{{ scope.row.updatedAt }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="80"fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions">
              <el-button link type="primary" @click="openGlobalModal(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="globalPg.currentPage"
        v-model:page-size="globalPg.pageSize"
        :total="globalPg.total"
      />
    </el-card>

    <AdminDialog
      v-model="sensitiveModalOpen"
      :title="sensitiveModalTitle"
      head-note="敏感操作规则（mock）；保存写入 localStorage。"
    >
      <template v-if="editingSensitive">
        <p class="sys-page__hint" style="margin-top: 0">{{ editingSensitive.description }}</p>
        <div class="sys-form-stack">
          <el-checkbox v-model="draftSenMfa">需要 MFA（二次验证）</el-checkbox>
          <el-checkbox v-model="draftSenDual">需要双人复核</el-checkbox>
          <el-checkbox v-model="draftSenEnabled">启用此规则</el-checkbox>
          <p v-if="sensitiveFormError" class="sys-form-error">{{ sensitiveFormError }}</p>
        </div>
      </template>
      <template #footer>
        <el-button @click="closeSensitiveModal">取消</el-button>
        <el-button type="primary" @click="saveSensitiveModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="globalModalOpen"
      :title="globalModalTitle"
      head-note="变更将记入操作审计（mock）。"
    >
      <template v-if="editingGlobal">
        <p class="sys-page__hint" style="margin-top: 0">
          键 <code class="sys-page__mono">{{ editingGlobal.key }}</code> · {{ editingGlobal.category }}
        </p>
        <el-form label-position="top" class="admin-ep-form sys-form-stack">
          <el-form-item label="参数值">
            <el-input :id="`${idPrefix}-gp-val`" v-model="draftGlobalValue" placeholder="输入新值" />
          </el-form-item>
          <p v-if="globalFormError" class="sys-form-error">{{ globalFormError }}</p>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="closeGlobalModal">取消</el-button>
        <el-button type="primary" @click="saveGlobalModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="infoModalOpen" :title="infoModalTitle">
      <p class="or-keys-editor-banner" role="status">{{ infoModalMessage }}</p>
      <template #footer>
        <el-button type="primary" @click="closeInfoModal">知道了</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="auditDiffOpen" title="变更详情" width="720px">
      <AdminAuditDiffPanel
        v-if="auditDiffRow"
        :before-json="auditDiffRow.beforeJson"
        :after-json="auditDiffRow.afterJson"
        :changed-fields="auditDiffRow.changedFields"
      />
      <template #footer>
        <el-button type="primary" @click="auditDiffOpen = false">关闭</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
