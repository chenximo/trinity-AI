<script setup lang="ts">
import { Delete, Lock, Unlock, View } from "@element-plus/icons-vue";
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute } from "vue-router";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery, uniqueFieldValues } from "../../utils/adminListFilter";
import "./keys.css";
import {
  DEFAULT_KEY_AUDIT_ROWS,
  DEFAULT_PLATFORM_KEYS,
  KEY_PANEL_ORDER,
  type KeyAuditRow,
  type KeyPanelId,
  type PlatformKeyRow,
} from "./mock";
import {
  readKeyAuditJson,
  readKeysFilterOrg,
  readKeysRowsJson,
  readKeysSearchQ,
  writeKeyAuditJson,
  writeKeysFilterOrg,
  writeKeysRowsJson,
  writeKeysSearchQ,
} from "./keysInteractions";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<KeyPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && KEY_PANEL_ORDER.includes(id as KeyPanelId)) return id as KeyPanelId;
  return "list";
});

const keyRows = ref<PlatformKeyRow[]>([]);
const auditRows = ref<KeyAuditRow[]>([]);
const searchQ = ref("");
const filterOrg = ref("");
const auditSearchQ = ref("");
const auditActionFilter = ref("");
const auditDateRange = ref<AdminDateRange | null>(null);
const detailCardOpen = ref(false);
const detailCardKeyId = ref("");

const dangerOpen = ref(false);
const dangerKind = ref<"none" | "freeze" | "unfreeze" | "revoke">("none");
const dangerTargetId = ref<string | null>(null);
const dangerTargetLabel = ref("");
const draftDangerNote = ref("");

const dangerTitle = computed(() => {
  if (dangerKind.value === "freeze") return "确认冻结密钥";
  if (dangerKind.value === "unfreeze") return "确认解冻密钥";
  if (dangerKind.value === "revoke") return "确认吊销密钥";
  return "确认操作";
});

const dangerMessage = computed(() => {
  const label = dangerTargetLabel.value;
  const note = draftDangerNote.value.trim();
  const tail = note ? ` 备注：${note}` : "";
  if (dangerKind.value === "freeze") {
    return `冻结后网关将拒绝该密钥调用；同步延迟约数十秒（产品提示）。密钥：${label}。${tail}`;
  }
  if (dangerKind.value === "unfreeze") {
    return `恢复为「正常」状态。密钥：${label}。${tail}`;
  }
  if (dangerKind.value === "revoke") {
    return `吊销不可恢复（原型状态机示意）。密钥：${label}。${tail}`;
  }
  return "";
});

const uniqueOrgs = computed(() => {
  const m = new Map<string, string>();
  for (const r of keyRows.value) m.set(r.orgId, r.orgName);
  return [...m.entries()].map(([id, name]) => ({ id, name }));
});

const detailRow = computed(
  () => keyRows.value.find((r) => r.id === detailCardKeyId.value) ?? null
);

const filteredKeys = computed(() => {
  let rows = keyRows.value;
  if (filterOrg.value) rows = rows.filter((r) => r.orgId === filterOrg.value);
  return filterByQuery(rows, searchQ.value, (r) =>
    [r.id, r.displayName, r.fingerprintPrefix, r.orgName, r.projectName, r.creatorLogin, r.tags.join(" ")].join(" "),
  );
});

const auditActionOptions = computed(() => uniqueFieldValues(auditRows.value, (r) => r.action));

const filteredAuditRows = computed(() => {
  let rows = auditRows.value;
  if (auditActionFilter.value) rows = rows.filter((r) => r.action === auditActionFilter.value);
  if (auditDateRange.value) {
    rows = rows.filter((r) => isWithinAdminDateRange(r.at, auditDateRange.value));
  }
  return filterByQuery(rows, auditSearchQ.value, (r) =>
    [r.at, r.actor, r.action, r.keyLabel, r.keyId, r.detail].join(" "),
  );
});

function resetKeysQuery(): void {
  filterOrg.value = "";
}

function resetAuditKeyQuery(): void {
  auditActionFilter.value = "";
  auditDateRange.value = null;
}

const keysPg = useAdminTablePagination(filteredKeys);
const auditPg = useAdminTablePagination(filteredAuditRows);

function statusBadgeClass(s: PlatformKeyRow["status"]): string {
  if (s === "正常") return "key-page__badge key-page__badge--ok";
  if (s === "已冻结") return "key-page__badge key-page__badge--warn";
  if (s === "已吊销") return "key-page__badge key-page__badge--danger";
  return "key-page__badge key-page__badge--muted";
}

function loadKeys(): void {
  const raw = readKeysRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        keyRows.value = parsed as PlatformKeyRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  keyRows.value = JSON.parse(JSON.stringify(DEFAULT_PLATFORM_KEYS)) as PlatformKeyRow[];
}

function persistKeys(): void {
  writeKeysRowsJson(JSON.stringify(keyRows.value));
}

function loadAudit(): void {
  const raw = readKeyAuditJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        auditRows.value = parsed as KeyAuditRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  auditRows.value = JSON.parse(JSON.stringify(DEFAULT_KEY_AUDIT_ROWS)) as KeyAuditRow[];
}

function persistAudit(): void {
  writeKeyAuditJson(JSON.stringify(auditRows.value));
}

function appendAudit(entry: Omit<KeyAuditRow, "id"> & { id?: string }): void {
  const id = entry.id ?? `ka-${Date.now()}`;
  auditRows.value = [{ ...entry, id }, ...auditRows.value];
  persistAudit();
}

function loadFilters(): void {
  searchQ.value = readKeysSearchQ();
  filterOrg.value = readKeysFilterOrg();
}

onMounted(() => {
  loadKeys();
  loadAudit();
  loadFilters();
});

watch(searchQ, (v) => writeKeysSearchQ(v));
watch(filterOrg, (v) => writeKeysFilterOrg(v));

function openDetailCard(row: PlatformKeyRow): void {
  detailCardKeyId.value = row.id;
  detailCardOpen.value = true;
}

function closeDetailCard(): void {
  detailCardOpen.value = false;
}

function openDanger(kind: "freeze" | "unfreeze" | "revoke", row: PlatformKeyRow): void {
  dangerKind.value = kind;
  dangerTargetId.value = row.id;
  dangerTargetLabel.value = `${row.displayName}（${row.id}）`;
  draftDangerNote.value = "";
  dangerOpen.value = true;
}

function closeDanger(): void {
  dangerOpen.value = false;
  dangerKind.value = "none";
  dangerTargetId.value = null;
  dangerTargetLabel.value = "";
  draftDangerNote.value = "";
}

function executeDanger(): void {
  const id = dangerTargetId.value;
  const kind = dangerKind.value;
  if (!id || kind === "none") {
    closeDanger();
    return;
  }
  const row = keyRows.value.find((r) => r.id === id);
  if (!row) {
    closeDanger();
    return;
  }
  const note = draftDangerNote.value.trim();
  const detailSuffix = note ? `；${note}` : "";
  if (kind === "freeze") {
    row.status = "已冻结";
    appendAudit({
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: "ops-demo",
      keyId: row.id,
      keyLabel: row.displayName,
      action: "冻结",
      detail: `原因码（示意）RISK_OPS${detailSuffix}`,
    });
  } else if (kind === "unfreeze") {
    row.status = "正常";
    appendAudit({
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: "ops-demo",
      keyId: row.id,
      keyLabel: row.displayName,
      action: "解冻",
      detail: `人工解冻${detailSuffix}`,
    });
  } else if (kind === "revoke") {
    row.status = "已吊销";
    appendAudit({
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: "ops-demo",
      keyId: row.id,
      keyLabel: row.displayName,
      action: "吊销",
      detail: `吊销后不可再用${detailSuffix}`,
    });
  }
  persistKeys();
  closeDanger();
}

function onExportAuditClick(): void {
  appendAudit({
    at: new Date().toISOString().slice(0, 16).replace("T", " "),
    actor: "ops-demo",
    keyId: "—",
    keyLabel: "—",
    action: "导出审计",
    detail: "导出 CSV（示意）；正式版走审批与双人复核（§4.13）",
  });
}

const detailDialogTitle = computed(() => detailRow.value?.displayName ?? "密钥详情");

function onViewDetailAudit(): void {
  const row = detailRow.value;
  if (!row) return;
  appendAudit({
    at: new Date().toISOString().slice(0, 16).replace("T", " "),
    actor: "ops-demo",
    keyId: row.id,
    keyLabel: row.displayName,
    action: "检索查看",
    detail: "列表页查看绑定客户与最近调用摘要（脱敏）",
  });
}

</script>

<template>
  <div class="key-page">
    <!-- API 列表 -->
    <section v-show="panel === 'list'" class="key-page__panel" aria-label="API 列表">
      <el-card shadow="never" class="admin-ep-card key-page__panel">
        <AdminSectionHead toolbar-only title="API 列表">
          <template #annot>
            <AdminInternalTip heading="API 列表 · 原型" explain="API 列表页对内说明（原型）">
              <p>
                列表为<strong>平台运营视角</strong>：指纹、最近调用等为脱敏/mock；行内冻结/吊销会写入本地 mock 与「审计轨迹」。与门户侧用户自助密钥形态可能不一致。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="searchQ"
              :input-id="`${idPrefix}-key-search`"
              search-placeholder="指纹前缀、名称、客户、项目、创建人、标签…"
              search-aria-label="检索 API 密钥"
              @reset="resetKeysQuery"
            >
              <template #filters>
                <el-select
                  v-model="filterOrg"
                  filterable
                  clearable
                  placeholder="客户组织"
                  aria-label="按客户组织筛选"
                  style="width: 10rem"
                >
                  <el-option v-for="o in uniqueOrgs" :key="o.id" :label="o.name" :value="o.id" />
                </el-select>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <el-table
          :data="keysPg.paginatedRows"
          row-key="id"
          class="admin-ep-table-wrap"
          style="width: 100%"
          :default-sort="{ prop: 'lastCallAt', order: 'descending' }"
        >
          <el-table-column prop="displayName" label="密钥名" min-width="120" sortable/>
          <el-table-column prop="fingerprintPrefix" label="指纹（脱敏）" min-width="120" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="key-page__mono">{{ scope.row.fingerprintPrefix }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="客户 / 项目" min-width="140" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              {{ scope.row.orgName }}
              <br />
              <span class="key-page__mono key-page__muted">{{ scope.row.projectName }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="creatorLogin" label="创建人" min-width="100" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="key-page__mono">{{ scope.row.creatorLogin }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              <span :class="statusBadgeClass(scope.row.status)">{{ scope.row.status }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="lastCallAt" label="最近调用" min-width="140" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              {{ scope.row.lastCallAt }}
              <br />
              <span class="key-page__muted" style="font-size: 0.6875rem">{{ scope.row.lastCallModel }} · {{ scope.row.lastRegion }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
              <div class="admin-ep-row-actions" @click.stop>
                <el-button link type="primary" :icon="View" @click="openDetailCard(scope.row)">查看详情</el-button>
                <el-button v-if="scope.row.status === '正常'" link type="primary" :icon="Lock" @click="openDanger('freeze', scope.row)">
                  冻结
                </el-button>
                <el-button v-if="scope.row.status === '已冻结'" link type="primary" :icon="Unlock" @click="openDanger('unfreeze', scope.row)">
                  解冻
                </el-button>
                <el-button v-if="scope.row.status !== '已吊销'" link type="danger" :icon="Delete" @click="openDanger('revoke', scope.row)">
                  吊销
                </el-button>
                <span v-if="scope.row.status === '已吊销'" class="key-page__muted" style="font-size: 0.6875rem; color: var(--muted-2)">已终态</span>
              </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <AdminTablePagination
          v-model:current-page="keysPg.currentPage"
          v-model:page-size="keysPg.pageSize"
          :total="keysPg.total"
        />
      </el-card>
    </section>

    <!-- 审计轨迹 -->
    <section v-show="panel === 'audit'" class="key-page__panel" aria-label="审计轨迹">
      <el-card shadow="never" class="admin-ep-card key-page__panel">
        <AdminSectionHead toolbar-only title="审计轨迹">
          <template #annot>
            <AdminInternalTip heading="审计轨迹 · 原型" explain="密钥审计页对内说明（原型）">
              <p>
                导出为示意 CSV；保留周期与合规要求见 <strong>§4.13</strong>。本表由前端追加行，非真实审计仓。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="auditSearchQ"
              :input-id="`${idPrefix}-key-audit-q`"
              search-placeholder="操作人、动作、密钥、说明…"
              search-aria-label="检索密钥审计"
              @reset="resetAuditKeyQuery"
            >
              <template #filters>
                <el-select
                  v-model="auditActionFilter"
                  clearable
                  placeholder="动作"
                  aria-label="按动作筛选"
                  style="width: 7rem"
                >
                  <el-option v-for="a in auditActionOptions" :key="a" :label="a" :value="a" />
                </el-select>
              </template>
              <AdminDateRangePicker v-model="auditDateRange" aria-label="密钥审计时间范围" />
              <el-button @click="onExportAuditClick">导出 CSV（示意）</el-button>
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
          <el-table-column prop="at" label="时间" min-width="130" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="key-page__mono">{{ scope.row.at }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="actor" label="操作人" min-width="100" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              <span class="key-page__mono">{{ scope.row.actor }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="动作" min-width="90" sortable/>
          <el-table-column prop="keyLabel" label="密钥" min-width="140" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
              {{ scope.row.keyLabel }}
              <br />
              <span class="key-page__mono key-page__muted">{{ scope.row.keyId }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="detail" label="说明" min-width="200" show-overflow-tooltip sortable/>
        </el-table>
        <AdminTablePagination
          v-model:current-page="auditPg.currentPage"
          v-model:page-size="auditPg.pageSize"
          :total="auditPg.total"
        />
      </el-card>
    </section>

    <AdminDialog
      v-model="detailCardOpen"
      :title="detailDialogTitle"
      width="640px"
      head-note="完整密钥串不可常驻展示；明文仅在强审批下短时开放（若政策允许）。"
    >
      <AdminInternalTip heading="详情弹层 · 对内" explain="密钥详情 Modal 顶栏对内说明（原型）">
        <p>
          顶栏<strong>下</strong>灰字为对用户可见提示；本 ⓘ 为<strong>对内标注</strong>（对齐 <code>#ds-internal-tip</code>）。字段为原型占位，工程期与网关/计费对账。
        </p>
      </AdminInternalTip>
      <div v-if="detailRow" class="key-page__detail-grid">
        <div>
          <div class="key-page__detail-k">密钥 ID</div>
          <p class="key-page__detail-v key-page__mono">{{ detailRow.id }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">显示名</div>
          <p class="key-page__detail-v">{{ detailRow.displayName }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">指纹（脱敏）</div>
          <p class="key-page__detail-v key-page__mono">{{ detailRow.fingerprintPrefix }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">状态</div>
          <p class="key-page__detail-v">
            <span :class="statusBadgeClass(detailRow.status)">{{ detailRow.status }}</span>
          </p>
        </div>
        <div>
          <div class="key-page__detail-k">客户组织</div>
          <p class="key-page__detail-v">{{ detailRow.orgName }}（{{ detailRow.orgId }}）</p>
        </div>
        <div>
          <div class="key-page__detail-k">项目</div>
          <p class="key-page__detail-v">{{ detailRow.projectName }}（{{ detailRow.projectId }}）</p>
        </div>
        <div>
          <div class="key-page__detail-k">创建人</div>
          <p class="key-page__detail-v key-page__mono">{{ detailRow.creatorLogin }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">创建时间</div>
          <p class="key-page__detail-v">{{ detailRow.createdAt }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">最近调用</div>
          <p class="key-page__detail-v">{{ detailRow.lastCallAt }} · {{ detailRow.lastCallModel }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">最近地域</div>
          <p class="key-page__detail-v">{{ detailRow.lastRegion }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">标签</div>
          <p class="key-page__detail-v">{{ detailRow.tags.join("、") || "—" }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeDetailCard">关闭</el-button>
        <el-button @click="onViewDetailAudit">记录查看审计（示意）</el-button>
        <el-button type="primary" disabled>申请明文查看（占位）</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="dangerOpen"
      :title="dangerTitle"
      width="560px"
      head-note="危险操作二次确认；原型直接写 localStorage 并追加审计。"
    >
      <AdminInternalTip heading="危险操作 · 对内" explain="冻结吊销确认 Modal 对内说明（原型）">
        <p>
          与 <code>head-note</code> 分工：<strong>head-note</strong> 给用户短提示；本 ⓘ 说明原型写库与审计追加逻辑，上线前可随 <code>data-trinity-internal-annotation</code> 剥离。
        </p>
      </AdminInternalTip>
      <p class="or-keys-editor-banner" role="status">{{ dangerMessage }}</p>
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="原因 / 备注（可选）">
          <el-input
            :id="`${idPrefix}-key-danger-note`"
            v-model="draftDangerNote"
            placeholder="如：客户工单号、风控单号"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDanger">取消</el-button>
        <el-button v-if="dangerKind === 'revoke' || dangerKind === 'freeze'" type="danger" @click="executeDanger">
          {{ dangerKind === "revoke" ? "确认吊销" : "确认冻结" }}
        </el-button>
        <el-button v-else type="primary" @click="executeDanger">确认解冻</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
