<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute, useRouter, type RouteRecordName } from "vue-router";
import { Edit, Lock, Unlock } from "@element-plus/icons-vue";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminExportCsvButton from "../../components/AdminExportCsvButton.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery } from "../../utils/adminListFilter";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { ADMIN_TABLE_COL, ADMIN_TABLE_COL_OPS } from "../../utils/adminTableColumns";
import "./risk.css";
import {
  DEFAULT_RISK_ACTION_LOGS,
  DEFAULT_RISK_RULES,
  RISK_ACTION_TYPE_LABEL,
  RISK_PANEL_ORDER,
  RISK_SCOPE_TYPE_LABEL,
  riskRuleLabelById,
  type RiskActionLogRow,
  type RiskPanelId,
  type RiskRuleRow,
} from "./mock";
import {
  readRiskActionsSearchQ,
  readRiskActionsTypeFilter,
  readRiskRulesEnabledFilter,
  readRiskRulesJson,
  readRiskRulesSearchQ,
  setRiskModalBodyLock,
  writeRiskActionsSearchQ,
  writeRiskActionsTypeFilter,
  writeRiskRulesEnabledFilter,
  writeRiskRulesJson,
  writeRiskRulesSearchQ,
} from "./riskInteractions";

const route = useRoute();
const router = useRouter();
const idPrefix = useId().replace(/:/g, "");

const ruleRows = ref<RiskRuleRow[]>([]);
const actionRows = ref<RiskActionLogRow[]>(JSON.parse(JSON.stringify(DEFAULT_RISK_ACTION_LOGS)));

const panel = computed<RiskPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && RISK_PANEL_ORDER.includes(id as RiskPanelId)) return id as RiskPanelId;
  return "rules";
});

const ruleSearchQ = ref("");
const ruleEnabledFilter = ref("");
const actionSearchQ = ref("");
const actionTypeFilter = ref("");
const actionDateRange = ref<AdminDateRange | null>(null);

const ruleModalOpen = ref(false);
const ruleEditingId = ref<string | null>(null);
const ruleFormError = ref("");
const draftName = ref("");
const draftWindow = ref(60);
const draftRate = ref(100);
const draftBlacklist = ref(200);
const draftTtl = ref(3600);
const draftEnabled = ref(true);

const filteredRules = computed(() => {
  let rows = ruleRows.value;
  if (ruleEnabledFilter.value === "yes") rows = rows.filter((r) => r.enabled);
  if (ruleEnabledFilter.value === "no") rows = rows.filter((r) => !r.enabled);
  return filterByQuery(rows, ruleSearchQ.value, (r) =>
    [r.id, r.name, String(r.windowSec), String(r.rateLimitThreshold)].join(" "),
  );
});

const filteredActions = computed(() => {
  let rows = actionRows.value;
  if (actionTypeFilter.value) rows = rows.filter((r) => r.actionType === actionTypeFilter.value);
  if (actionDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.startedAt, actionDateRange.value));
  }
  return filterByQuery(rows, actionSearchQ.value, (r) =>
    [r.ip, r.actionType, r.scopeType, r.ruleSource, riskRuleLabelById(ruleRows.value, r.ruleSource)].join(" "),
  );
});

const rulesPg = useAdminTablePagination(filteredRules);
const actionsPg = useAdminTablePagination(filteredActions);

const thresholdError = computed(
  () => draftRate.value > draftBlacklist.value && "限流阈值须 ≤ 拉黑阈值",
);

function persistRules(): void {
  writeRiskRulesJson(JSON.stringify(ruleRows.value));
}

function resetRuleQuery(): void {
  ruleEnabledFilter.value = "";
  writeRiskRulesEnabledFilter("");
}

function resetActionQuery(): void {
  actionTypeFilter.value = "";
  actionDateRange.value = null;
  writeRiskActionsTypeFilter("");
}

function goRoute(name: string): void {
  void router.push({ name: name as RouteRecordName });
}

function ruleStatusClass(enabled: boolean): string {
  return enabled ? "risk-page__badge risk-page__badge--ok" : "risk-page__badge risk-page__badge--muted";
}

function actionTypeClass(actionType: RiskActionLogRow["actionType"]): string {
  return actionType === "blacklist"
    ? "risk-page__badge risk-page__badge--danger"
    : "risk-page__badge risk-page__badge--warn";
}

function openRuleModal(row?: RiskRuleRow): void {
  ruleFormError.value = "";
  if (row) {
    ruleEditingId.value = row.id;
    draftName.value = row.name;
    draftWindow.value = row.windowSec;
    draftRate.value = row.rateLimitThreshold;
    draftBlacklist.value = row.blacklistThreshold;
    draftTtl.value = row.ttlSec;
    draftEnabled.value = row.enabled;
  } else {
    ruleEditingId.value = null;
    draftName.value = "";
    draftWindow.value = 60;
    draftRate.value = 100;
    draftBlacklist.value = 200;
    draftTtl.value = 3600;
    draftEnabled.value = true;
  }
  ruleModalOpen.value = true;
}

function onRuleEnabledChange(row: RiskRuleRow, enabled: boolean): void {
  row.enabled = enabled;
  row.updatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
  persistRules();
}

function saveRule(): void {
  if (!draftName.value.trim()) {
    ruleFormError.value = "请填写规则名称";
    return;
  }
  if (draftRate.value > draftBlacklist.value) {
    ruleFormError.value = "限流阈值须 ≤ 拉黑阈值";
    return;
  }
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  if (ruleEditingId.value) {
    const row = ruleRows.value.find((r) => r.id === ruleEditingId.value);
    if (row) {
      row.name = draftName.value.trim();
      row.windowSec = draftWindow.value;
      row.rateLimitThreshold = draftRate.value;
      row.blacklistThreshold = draftBlacklist.value;
      row.ttlSec = draftTtl.value;
      row.enabled = draftEnabled.value;
      row.updatedAt = now;
    }
  } else {
    ruleRows.value.push({
      id: `rr-${Date.now()}`,
      name: draftName.value.trim(),
      windowSec: draftWindow.value,
      rateLimitThreshold: draftRate.value,
      blacklistThreshold: draftBlacklist.value,
      ttlSec: draftTtl.value,
      enabled: draftEnabled.value,
      updatedAt: now,
    });
  }
  persistRules();
  ruleModalOpen.value = false;
}

watch(ruleModalOpen, (open) => setRiskModalBodyLock(open));

watch(ruleSearchQ, (v) => writeRiskRulesSearchQ(v));
watch(ruleEnabledFilter, (v) => writeRiskRulesEnabledFilter(v));
watch(actionSearchQ, (v) => writeRiskActionsSearchQ(v));
watch(actionTypeFilter, (v) => writeRiskActionsTypeFilter(v));

onMounted(() => {
  const stored = readRiskRulesJson();
  ruleRows.value = stored
    ? (JSON.parse(stored) as RiskRuleRow[])
    : JSON.parse(JSON.stringify(DEFAULT_RISK_RULES));
  ruleSearchQ.value = readRiskRulesSearchQ();
  ruleEnabledFilter.value = readRiskRulesEnabledFilter();
  actionSearchQ.value = readRiskActionsSearchQ();
  actionTypeFilter.value = readRiskActionsTypeFilter();
});
</script>

<template>
  <div class="risk-page">
    <section v-show="panel === 'rules'" class="risk-page__panel" aria-label="风控规则">
      <el-card shadow="never" class="admin-ep-card risk-page__panel">
        <AdminSectionHead toolbar-only>
          <template #annot>
            <AdminInternalTip heading="风控规则 · 原型" explain="全局限流/拉黑（§4.4.2）">
              <p>窗口内超 <strong>限流阈值</strong> 则限流；超 <strong>拉黑阈值</strong> 则拉黑（TTL 秒）。限流阈值须 ≤ 拉黑阈值。</p>
              <p>
                流量/错误观测在
                <el-button link type="primary" @click="goRoute('tai-admin-ops-live')">实时大盘</el-button>
                ；本页只配 IP 策略，动作结果见「风控动作日志」。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="ruleSearchQ"
              :input-id="`${idPrefix}-risk-rule-q`"
              search-placeholder="规则名称、ID、阈值…"
              search-aria-label="检索风控规则"
              @reset="resetRuleQuery"
            >
              <template #filters>
                <el-select v-model="ruleEnabledFilter" clearable placeholder="状态" style="width: 7rem">
                  <el-option label="启用" value="yes" />
                  <el-option label="停用" value="no" />
                </el-select>
              </template>
              <template #actions>
                <el-button type="primary" @click="openRuleModal()">新建规则</el-button>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <el-table
          :data="rulesPg.paginatedRows"
          row-key="id"
          class="admin-ep-table-wrap"
          style="width: 100%"
          :default-sort="{ prop: 'updatedAt', order: 'descending' }"
        >
          <el-table-column
            prop="name"
            label="规则"
            :min-width="ADMIN_TABLE_COL.xl"
            sortable
            show-overflow-tooltip
          />
          <el-table-column prop="windowSec" label="窗口(s)" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="rateLimitThreshold" label="限流阈值" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="blacklistThreshold" label="拉黑阈值" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="ttlSec" label="TTL(s)" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="enabled" label="状态" :min-width="ADMIN_TABLE_COL.xs" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <span :class="ruleStatusClass(scope.row.enabled)">{{ scope.row.enabled ? "启用" : "停用" }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新" :min-width="ADMIN_TABLE_COL.lg" sortable />
          <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg"fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
                <div class="admin-ep-row-actions" @click.stop>
                  <el-button link type="primary" :icon="Edit" @click="openRuleModal(scope.row)">编辑</el-button>
                  <el-button
                    v-if="scope.row.enabled"
                    link
                    type="primary"
                    :icon="Lock"
                    @click="onRuleEnabledChange(scope.row, false)"
                  >
                    停用
                  </el-button>
                  <el-button
                    v-else
                    link
                    type="primary"
                    :icon="Unlock"
                    @click="onRuleEnabledChange(scope.row, true)"
                  >
                    启用
                  </el-button>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <AdminTablePagination
          v-model:current-page="rulesPg.currentPage"
          v-model:page-size="rulesPg.pageSize"
          :total="rulesPg.total"
        />
        <p class="risk-page__hint">限流阈值须 ≤ 拉黑阈值；规则变更将写入 <code>risk_rule</code>（工程期）。</p>
      </el-card>
    </section>

    <section v-show="panel === 'action-logs'" class="risk-page__panel" aria-label="风控动作日志">
      <el-card shadow="never" class="admin-ep-card risk-page__panel">
        <AdminSectionHead toolbar-only>
          <template #annot>
            <AdminInternalTip heading="风控动作 · 原型" explain="IP 限流/拉黑记录（§4.4.3）">
              <p>已执行的限流/拉黑，非 API 调用明细（用量日志）也非后台操作审计。</p>
              <p>工程期对接 <code>risk_ip_action</code> 表。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="actionSearchQ"
              :input-id="`${idPrefix}-risk-act-q`"
              search-placeholder="IP、规则名称、动作…"
              search-aria-label="检索风控动作"
              @reset="resetActionQuery"
            >
              <template #filters>
                <el-select v-model="actionTypeFilter" clearable placeholder="动作" style="width: 7rem">
                  <el-option label="限流" value="rate_limit" />
                  <el-option label="拉黑" value="blacklist" />
                </el-select>
              </template>
              <AdminDateRangePicker v-model="actionDateRange" aria-label="风控动作时间范围" />
              <template #actions>
                <AdminExportCsvButton />
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <el-table
          :data="actionsPg.paginatedRows"
          row-key="id"
          class="admin-ep-table-wrap"
          style="width: 100%"
          :default-sort="{ prop: 'startedAt', order: 'descending' }"
        >
          <el-table-column prop="ip" label="IP" :min-width="ADMIN_TABLE_COL.lg" sortable show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope?.row" class="risk-page__mono">{{ scope.row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="actionType" label="动作" :min-width="ADMIN_TABLE_COL.sm" sortable>
            <template #default="scope">
              <span v-if="scope?.row" :class="actionTypeClass(scope.row.actionType)">
                {{ RISK_ACTION_TYPE_LABEL[scope.row.actionType] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="scopeType" label="范围" :min-width="ADMIN_TABLE_COL.sm" sortable>
            <template #default="scope">
              <span v-if="scope?.row">{{ RISK_SCOPE_TYPE_LABEL[scope.row.scopeType] }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="hitCount" label="命中" :min-width="ADMIN_TABLE_COL.xs" sortable />
          <el-table-column prop="ruleSource" label="规则" :min-width="ADMIN_TABLE_COL.md" sortable show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope?.row">{{ riskRuleLabelById(ruleRows, scope.row.ruleSource) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="startedAt" label="开始" :min-width="ADMIN_TABLE_COL.lg" sortable />
          <el-table-column prop="endedAt" label="结束" :min-width="ADMIN_TABLE_COL.lg" sortable />
        </el-table>
        <AdminTablePagination
          v-model:current-page="actionsPg.currentPage"
          v-model:page-size="actionsPg.pageSize"
          :total="actionsPg.total"
        />
      </el-card>
    </section>

    <AdminDialog v-model="ruleModalOpen" :title="ruleEditingId ? '编辑规则' : '新建规则'" width="480px">
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="名称" required>
          <el-input v-model="draftName" placeholder="如：全局限流" />
        </el-form-item>
        <el-form-item label="统计窗口 (秒)">
          <el-input-number v-model="draftWindow" :min="1" class="risk-page__num" />
        </el-form-item>
        <el-form-item label="限流阈值（窗口内请求数）">
          <el-input-number v-model="draftRate" :min="1" class="risk-page__num" />
        </el-form-item>
        <el-form-item label="拉黑阈值（窗口内请求数）">
          <el-input-number v-model="draftBlacklist" :min="1" class="risk-page__num" />
        </el-form-item>
        <el-form-item label="拉黑 TTL (秒)">
          <el-input-number v-model="draftTtl" :min="60" class="risk-page__num" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="draftEnabled" />
        </el-form-item>
        <p v-if="thresholdError" class="risk-page__warn">{{ thresholdError }}</p>
        <p v-if="ruleFormError" class="risk-page__warn">{{ ruleFormError }}</p>
      </el-form>
      <template #footer>
        <el-button @click="ruleModalOpen = false">取消</el-button>
        <el-button type="primary" :disabled="Boolean(thresholdError)" @click="saveRule">保存</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
