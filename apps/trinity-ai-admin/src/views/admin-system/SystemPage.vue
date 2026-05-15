<script setup lang="ts">
import { computed, onMounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ModalPanel, TButton, TSearchForm1Fixed, TTextField1Labeled } from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./system.css";
import {
  AUDIT_RETENTION_NOTE,
  DEFAULT_AUDIT_LOG_ROWS,
  DEFAULT_EXPORT_APPROVALS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_GLOBAL_PARAMS,
  DEFAULT_SENSITIVE_RULES,
  SYSTEM_PANEL_ORDER,
  type AuditLogRow,
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
  setSystemModalBodyLock,
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
const auditRows = ref<AuditLogRow[]>([]);
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

const filteredAudit = computed(() => {
  const q = auditFilter.value.trim().toLowerCase();
  if (!q) return auditRows.value;
  return auditRows.value.filter((r) => {
    const blob = [r.actorLogin, r.actorName, r.module, r.action, r.target, r.ip, r.result].join(" ").toLowerCase();
    return blob.includes(q);
  });
});

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

watchEffect(() => {
  const open = sensitiveModalOpen.value || globalModalOpen.value || infoModalOpen.value;
  setSystemModalBodyLock(open);
});

onMounted(() => loadAll());
</script>

<template>
  <div class="sys-page">
    <!-- 操作审计 -->
    <section v-show="panel === 'audit-log'" class="sys-page__panel" aria-label="操作审计">
      <AdminSectionHead title="操作审计">
        <template #annot>
          <AdminInternalTip heading="操作审计 · 原型" explain="操作审计对内说明（原型）">
            <p>检索与导出为示意；保留周期与不可抵赖存证见 <strong>§4.13</strong>。</p>
          </AdminInternalTip>
        </template>
        <template #desc>全平台操作留痕检索与导出（<strong>§4.13</strong>，mock）。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="auditFilter"
            :input-id="`${idPrefix}-audit-search`"
            placeholder="操作人、模块、动作、目标…"
            width="18rem"
            aria-label="检索审计日志"
          />
          <TButton variant="outline">导出审计包（示意）</TButton>
        </template>
      </AdminSectionHead>
      <p class="sys-page__callout sys-page__callout--info">{{ AUDIT_RETENTION_NOTE }}</p>
      <div class="sys-page__table-wrap">
        <table class="sys-page__table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作人</th>
              <th>模块</th>
              <th>动作</th>
              <th>目标</th>
              <th>结果</th>
              <th>来源 IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredAudit" :key="r.id">
              <td class="sys-page__mono">{{ r.at }}</td>
              <td>
                {{ r.actorName }}
                <br />
                <span class="sys-page__mono sys-page__muted">{{ r.actorLogin }}</span>
              </td>
              <td>{{ r.module }}</td>
              <td>{{ r.action }}</td>
              <td class="sys-page__mono">{{ r.target }}</td>
              <td><span :class="auditResultClass(r.result)">{{ r.result }}</span></td>
              <td class="sys-page__mono">{{ r.ip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="filteredAudit.length === 0" class="sys-page__hint">无匹配记录。</p>
    </section>

    <!-- 敏感操作审批 -->
    <section v-show="panel === 'sensitive'" class="sys-page__panel" aria-label="敏感操作审批">
      <AdminSectionHead title="敏感操作审批">
        <template #annot>
          <AdminInternalTip heading="敏感操作审批 · 原型" explain="敏感操作对内说明（原型）">
            <p>MFA/双人复核为产品规则占位；正式环境对接审批流引擎。</p>
          </AdminInternalTip>
        </template>
        <template #desc>
          删除客户、批量导出、密钥明文查看等须 <strong>MFA</strong> 或 <strong>双人复核</strong>（mock）；正式环境对接审批流。
        </template>
      </AdminSectionHead>
      <div class="sys-page__table-wrap">
        <table class="sys-page__table">
          <thead>
            <tr>
              <th>操作类型</th>
              <th>说明</th>
              <th>需 MFA</th>
              <th>双人复核</th>
              <th>启用</th>
              <th>更新于</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in sensitiveRows" :key="r.id">
              <td>{{ r.operation }}</td>
              <td>{{ r.description }}</td>
              <td>{{ yesNo(r.requireMfa) }}</td>
              <td>{{ yesNo(r.requireDualApproval) }}</td>
              <td>{{ yesNo(r.enabled) }}</td>
              <td class="sys-page__mono">{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="sys-int__textlink" @click="openSensitiveModal(r)">配置</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 数据导出审批 -->
    <section v-show="panel === 'export-approval'" class="sys-page__panel" aria-label="数据导出审批">
      <AdminSectionHead title="数据导出审批">
        <template #annot>
          <AdminInternalTip heading="数据导出审批 · 原型" explain="导出审批对内说明（原型）">
            <p>与报表导出、大客户数据包衔接为示意；超阈值队列 mock。</p>
          </AdminInternalTip>
        </template>
        <template #desc>
          与报表导出、大客户数据包衔接；超行数阈值触发队列（mock）。
        </template>
      </AdminSectionHead>
      <div class="sys-page__table-wrap">
        <table class="sys-page__table">
          <thead>
            <tr>
              <th>申请 ID</th>
              <th>申请人</th>
              <th>范围</th>
              <th>预估行数</th>
              <th>申请时间</th>
              <th>状态</th>
              <th>审批人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in exportRows" :key="r.id">
              <td class="sys-page__mono">{{ r.id }}</td>
              <td class="sys-page__mono">{{ r.applicant }}</td>
              <td>{{ r.scope }}</td>
              <td>{{ r.rowEstimate }}</td>
              <td class="sys-page__mono">{{ r.requestedAt }}</td>
              <td><span :class="exportStatusClass(r.status)">{{ r.status }}</span></td>
              <td>
                <template v-if="r.reviewer">
                  {{ r.reviewer }}
                  <br />
                  <span class="sys-page__mono sys-page__muted">{{ r.reviewedAt }}</span>
                </template>
                <span v-else class="sys-page__muted">—</span>
              </td>
              <td>
                <div v-if="r.status === '待审批'" class="sys-page__ops">
                  <button type="button" class="sys-int__textlink" @click="reviewExport(r, true)">通过</button>
                  <button type="button" class="sys-int__textlink sys-int__textlink--danger" @click="reviewExport(r, false)">
                    拒绝
                  </button>
                </div>
                <span v-else class="sys-page__muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 特性开关 -->
    <section v-show="panel === 'flags'" class="sys-page__panel" aria-label="特性开关">
      <AdminSectionHead title="特性开关">
        <template #annot>
          <AdminInternalTip heading="特性开关 · 原型" explain="特性开关对内说明（原型）">
            <p>灰度百分比为占位；变更应写入审计并与发布系统联动。</p>
          </AdminInternalTip>
        </template>
        <template #desc>按环境 / 百分比灰度；与全局参数、维护模式联动（mock）。</template>
      </AdminSectionHead>
      <div class="sys-page__table-wrap">
        <table class="sys-page__table">
          <thead>
            <tr>
              <th>开关键</th>
              <th>名称</th>
              <th>环境</th>
              <th>灰度 %</th>
              <th>启用</th>
              <th>备注</th>
              <th>更新于</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in flagRows" :key="r.id">
              <td class="sys-page__mono">{{ r.key }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.env }}</td>
              <td>{{ r.rolloutPct }}%</td>
              <td>
                <button
                  type="button"
                  class="sys-page__toggle"
                  :class="{ 'is-on': r.enabled }"
                  :aria-pressed="r.enabled ? 'true' : 'false'"
                  :aria-label="`${r.name} ${r.enabled ? '已启用' : '已关闭'}`"
                  @click="toggleFlag(r)"
                />
              </td>
              <td>{{ r.note }}</td>
              <td class="sys-page__mono">{{ r.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 全局参数 -->
    <section v-show="panel === 'global'" class="sys-page__panel" aria-label="全局参数">
      <AdminSectionHead title="全局参数">
        <template #annot>
          <AdminInternalTip heading="全局参数 · 原型" explain="全局参数对内说明（原型）">
            <p>计费时区、限流等变更属高风险配置；工程期加变更单与回滚。</p>
          </AdminInternalTip>
        </template>
        <template #desc>计费时区、限流、API 版本策略等；变更写入审计（mock）。</template>
      </AdminSectionHead>
      <div class="sys-page__table-wrap">
        <table class="sys-page__table">
          <thead>
            <tr>
              <th>参数键</th>
              <th>名称</th>
              <th>分类</th>
              <th>当前值</th>
              <th>更新人</th>
              <th>更新于</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in globalRows" :key="r.id">
              <td class="sys-page__mono">{{ r.key }}</td>
              <td>{{ r.label }}</td>
              <td>{{ r.category }}</td>
              <td>{{ r.value }}</td>
              <td class="sys-page__mono">{{ r.updatedBy }}</td>
              <td class="sys-page__mono">{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="sys-int__textlink" @click="openGlobalModal(r)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-show="sensitiveModalOpen"
        class="or-modal-root sys-int-modal-host"
        role="presentation"
        :aria-hidden="!sensitiveModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeSensitiveModal" />
        <ModalPanel
          v-if="editingSensitive"
          :title="sensitiveModalTitle"
          :title-id="`${idPrefix}-sys-sen-title`"
          head-note="敏感操作规则（mock）；保存写入 localStorage。"
          close-label="关闭"
          @close="closeSensitiveModal"
        >
          <p class="sys-page__hint" style="margin-top: 0">{{ editingSensitive.description }}</p>
          <div class="sys-form-stack">
            <label class="sys-page__check">
              <input v-model="draftSenMfa" type="checkbox" />
              需要 MFA（二次验证）
            </label>
            <label class="sys-page__check">
              <input v-model="draftSenDual" type="checkbox" />
              需要双人复核
            </label>
            <label class="sys-page__check">
              <input v-model="draftSenEnabled" type="checkbox" />
              启用此规则
            </label>
            <p v-if="sensitiveFormError" class="sys-form-error">{{ sensitiveFormError }}</p>
          </div>
          <template #actions>
            <TButton type="button" @click="closeSensitiveModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveSensitiveModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="globalModalOpen"
        class="or-modal-root sys-int-modal-host"
        role="presentation"
        :aria-hidden="!globalModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeGlobalModal" />
        <ModalPanel
          v-if="editingGlobal"
          :title="globalModalTitle"
          :title-id="`${idPrefix}-sys-gp-title`"
          head-note="变更将记入操作审计（mock）。"
          close-label="关闭"
          @close="closeGlobalModal"
        >
          <p class="sys-page__hint" style="margin-top: 0">
            键 <code class="sys-page__mono">{{ editingGlobal.key }}</code> · {{ editingGlobal.category }}
          </p>
          <div class="sys-form-stack">
            <TTextField1Labeled
              :input-id="`${idPrefix}-gp-val`"
              v-model="draftGlobalValue"
              label="参数值"
              placeholder="输入新值"
            />
            <p v-if="globalFormError" class="sys-form-error">{{ globalFormError }}</p>
          </div>
          <template #actions>
            <TButton type="button" @click="closeGlobalModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveGlobalModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="infoModalOpen"
        class="or-modal-root sys-int-modal-host"
        role="presentation"
        :aria-hidden="!infoModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeInfoModal" />
        <ModalPanel
          :title="infoModalTitle"
          :title-id="`${idPrefix}-sys-info-title`"
          close-label="关闭"
          @close="closeInfoModal"
        >
          <p class="or-keys-editor-banner" role="status">{{ infoModalMessage }}</p>
          <template #actions>
            <TButton variant="gradient" type="button" @click="closeInfoModal">知道了</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

  </div>
</template>
