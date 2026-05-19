<script setup lang="ts">
import { Delete, Edit, Lock, Unlock, View } from "@element-plus/icons-vue";
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute, useRouter, type RouteRecordName } from "vue-router";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminExportCsvButton from "../../components/AdminExportCsvButton.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery, uniqueFieldValues } from "../../utils/adminListFilter";
import {
  ADMIN_TABLE_COL,
  ADMIN_TABLE_COL_MIN,
  ADMIN_TABLE_COL_OPS,
} from "../../utils/adminTableColumns";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import "./keys.css";
import {
  DEFAULT_KEY_AUDIT_ROWS,
  DEFAULT_PLATFORM_KEYS,
  DEFAULT_USER_KEYS,
  KEY_PANEL_ORDER,
  KEYS_PROTOTYPE_PERMISSIONS,
  type KeyAuditRow,
  type KeyPanelId,
  type PlatformKeyRow,
  type UserKeyRow,
} from "./mock";
import {
  readKeyAuditJson,
  readKeysFilterOrg,
  readKeysRowsJson,
  readKeysSearchQ,
  readUserKeysJson,
  writeKeyAuditJson,
  writeKeysFilterOrg,
  writeKeysRowsJson,
  writeKeysSearchQ,
  writeUserKeysJson,
} from "./keysInteractions";

const MOCK_OPERATOR = "ops-demo";
const MOCK_REVEALED_SECRET = "sk_live_PrototypeOnly_DoNotCommit_RealSecret_v1";

const route = useRoute();
const router = useRouter();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<KeyPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && KEY_PANEL_ORDER.includes(id as KeyPanelId)) return id as KeyPanelId;
  return "platform-keys";
});

const keyRows = ref<PlatformKeyRow[]>([]);
const userKeyRows = ref<UserKeyRow[]>([]);
const auditRows = ref<KeyAuditRow[]>([]);

const searchQ = ref("");
const filterOrg = ref("");
const filterStatus = ref<PlatformKeyRow["status"] | "">("");

const userKeySearchQ = ref("");
const userKeyStatusFilter = ref("");
const userWorkspaceFilter = ref("");

const userDetailOpen = ref(false);
const userDetailRowId = ref("");

const auditSearchQ = ref("");
const auditActionFilter = ref("");
const auditDateRange = ref<AdminDateRange | null>(null);

const detailCardOpen = ref(false);
const detailCardKeyId = ref("");

const dangerOpen = ref(false);
const dangerScope = ref<"platform" | "user">("platform");
const dangerKind = ref<"none" | "freeze" | "unfreeze" | "revoke" | "delete-platform">("none");
const dangerTargetId = ref<string | null>(null);
const dangerTargetLabel = ref("");
const draftDangerNote = ref("");

const platformFormOpen = ref(false);
const platformFormMode = ref<"add" | "edit">("add");
const platformFormError = ref("");
const platformEditingId = ref<string | null>(null);
const draftDisplayName = ref("");
const draftPurpose = ref("");
const draftExpiresAt = ref("");
const draftOrgId = ref("");
const draftProjectName = ref("");
const draftTags = ref("");

const userRevokeOpen = ref(false);
const userRevokeTarget = ref<UserKeyRow | null>(null);
const draftUserRevokeNote = ref("");

const userQuotaOpen = ref(false);
const userQuotaTarget = ref<UserKeyRow | null>(null);
const draftRpm = ref(60);
const draftDailyCap = ref("500k");
const draftWindowReset = ref("UTC 00:00");

const gateOpen = ref(false);
const gatePassword = ref("");
const gateError = ref("");
const gateTargetId = ref("");
const gateTargetLabel = ref("");
const gateRevealed = ref(false);

const dangerTitle = computed(() => {
  if (dangerKind.value === "freeze") return "确认冻结密钥";
  if (dangerKind.value === "unfreeze") return "确认解冻密钥";
  if (dangerKind.value === "revoke") return "确认吊销密钥";
  if (dangerKind.value === "delete-platform") return "确认删除平台密钥";
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
  if (dangerKind.value === "delete-platform") {
    return `删除后不可恢复（原型示意）。密钥：${label}。${tail}`;
  }
  return "";
});

const platformFormTitle = computed(() =>
  platformFormMode.value === "edit" ? "编辑平台密钥" : "新建平台密钥",
);

const uniqueOrgs = computed(() => {
  const m = new Map<string, string>();
  for (const r of keyRows.value) m.set(r.orgId, r.orgName);
  for (const r of DEFAULT_PLATFORM_KEYS) m.set(r.orgId, r.orgName);
  return [...m.entries()].map(([id, name]) => ({ id, name }));
});

const detailRow = computed(
  () => keyRows.value.find((r) => r.id === detailCardKeyId.value) ?? null,
);

const filteredKeys = computed(() => {
  let rows = keyRows.value;
  if (filterOrg.value) rows = rows.filter((r) => r.orgId === filterOrg.value);
  if (filterStatus.value) rows = rows.filter((r) => r.status === filterStatus.value);
  return filterByQuery(rows, searchQ.value, (r) =>
    [r.id, r.displayName, r.fingerprintPrefix, r.orgName, r.projectName, r.creatorLogin, r.purpose, r.tags.join(" ")].join(
      " ",
    ),
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

const userWorkspaceOptions = computed(() => {
  const set = new Set<string>();
  for (const r of userKeyRows.value) set.add(r.workspace);
  for (const r of DEFAULT_USER_KEYS) set.add(r.workspace);
  return [...set].sort();
});

const userDetailRow = computed(
  () => userKeyRows.value.find((r) => r.id === userDetailRowId.value) ?? null,
);

const userDetailDialogTitle = computed(() => userDetailRow.value?.name ?? "用户密钥详情");

const filteredUserKeys = computed(() => {
  let rows = userKeyRows.value;
  if (userKeyStatusFilter.value) rows = rows.filter((r) => r.status === userKeyStatusFilter.value);
  if (userWorkspaceFilter.value) rows = rows.filter((r) => r.workspace === userWorkspaceFilter.value);
  return filterByQuery(rows, userKeySearchQ.value, (r) =>
    [r.name, r.fingerprintPrefix, r.userLogin, r.workspace, r.policyVersion, r.expiresAt].join(" "),
  );
});

const keysPg = useAdminTablePagination(filteredKeys);
const userKeysPg = useAdminTablePagination(filteredUserKeys);
const auditPg = useAdminTablePagination(filteredAuditRows);

const detailDialogTitle = computed(() => detailRow.value?.displayName ?? "密钥详情");

function nowLabel(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function appendAudit(entry: Omit<KeyAuditRow, "id"> & { id?: string }): void {
  const id = entry.id ?? `ka-${Date.now()}`;
  auditRows.value = [{ ...entry, id }, ...auditRows.value];
  persistAudit();
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

function loadUserKeys(): void {
  const raw = readUserKeysJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        userKeyRows.value = parsed as UserKeyRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  userKeyRows.value = JSON.parse(JSON.stringify(DEFAULT_USER_KEYS)) as UserKeyRow[];
}

function persistUserKeys(): void {
  writeUserKeysJson(JSON.stringify(userKeyRows.value));
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

function loadFilters(): void {
  searchQ.value = readKeysSearchQ();
  filterOrg.value = readKeysFilterOrg();
}

function resetKeysQuery(): void {
  filterOrg.value = "";
  filterStatus.value = "";
}

function resetAuditKeyQuery(): void {
  auditActionFilter.value = "";
  auditDateRange.value = null;
}

function resetUserKeyQuery(): void {
  userKeyStatusFilter.value = "";
  userWorkspaceFilter.value = "";
}

function openUserDetail(row: UserKeyRow): void {
  userDetailRowId.value = row.id;
  userDetailOpen.value = true;
}

function closeUserDetail(): void {
  userDetailOpen.value = false;
}

function openUserQuotaFromDetail(): void {
  const row = userDetailRow.value;
  if (!row) return;
  userDetailOpen.value = false;
  openUserQuota(row);
}

function openUserRevokeFromDetail(): void {
  const row = userDetailRow.value;
  if (!row) return;
  userDetailOpen.value = false;
  openUserRevoke(row);
}

function openUserDangerFromDetail(kind: "freeze" | "unfreeze"): void {
  const row = userDetailRow.value;
  if (!row) return;
  userDetailOpen.value = false;
  openUserDanger(kind, row);
}

function userKeyWritable(status: UserKeyRow["status"]): boolean {
  return status === "正常" || status === "已冻结";
}

function statusBadgeClass(s: PlatformKeyRow["status"]): string {
  if (s === "正常") return "key-page__badge key-page__badge--ok";
  if (s === "已冻结") return "key-page__badge key-page__badge--warn";
  if (s === "已吊销") return "key-page__badge key-page__badge--danger";
  return "key-page__badge key-page__badge--muted";
}

function userStatusClass(s: UserKeyRow["status"]): string {
  if (s === "正常") return "key-page__badge key-page__badge--ok";
  if (s === "已冻结") return "key-page__badge key-page__badge--warn";
  if (s === "已撤销") return "key-page__badge key-page__badge--danger";
  return "key-page__badge key-page__badge--muted";
}

function goBindings(): void {
  void router.push({ name: "tai-admin-models-bindings" as RouteRecordName });
}

function openDetailCard(row: PlatformKeyRow): void {
  detailCardKeyId.value = row.id;
  detailCardOpen.value = true;
}

function closeDetailCard(): void {
  detailCardOpen.value = false;
}

function openPlatformForm(mode: "add" | "edit", row?: PlatformKeyRow): void {
  platformFormMode.value = mode;
  platformFormError.value = "";
  if (mode === "edit" && row) {
    platformEditingId.value = row.id;
    draftDisplayName.value = row.displayName;
    draftPurpose.value = row.purpose;
    draftExpiresAt.value = row.expiresAt;
    draftOrgId.value = row.orgId;
    draftProjectName.value = row.projectName;
    draftTags.value = row.tags.join(", ");
  } else {
    platformEditingId.value = null;
    draftDisplayName.value = "";
    draftPurpose.value = "";
    draftExpiresAt.value = "";
    draftOrgId.value = uniqueOrgs.value[0]?.id ?? "org-acme";
    draftProjectName.value = "";
    draftTags.value = "";
  }
  platformFormOpen.value = true;
}

function savePlatformForm(): void {
  platformFormError.value = "";
  const displayName = draftDisplayName.value.trim();
  const purpose = draftPurpose.value.trim();
  const expiresAt = draftExpiresAt.value.trim();
  const projectName = draftProjectName.value.trim() || "默认项目";
  const org = uniqueOrgs.value.find((o) => o.id === draftOrgId.value);

  if (!displayName) {
    platformFormError.value = "请填写密钥名称";
    return;
  }
  if (!purpose) {
    platformFormError.value = "用途说明为必填（对齐后端校验）";
    return;
  }
  if (!expiresAt) {
    platformFormError.value = "请填写到期日（须有到期策略）";
    return;
  }
  if (!draftOrgId.value) {
    platformFormError.value = "请选择客户组织";
    return;
  }

  const tags = draftTags.value
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (platformFormMode.value === "add") {
    const id = `pk-${Date.now()}`;
    const prefix = `sk_live_${Math.random().toString(36).slice(2, 8)}…`;
    keyRows.value.unshift({
      id,
      displayName,
      fingerprintPrefix: prefix,
      orgId: draftOrgId.value,
      orgName: org?.name ?? draftOrgId.value,
      projectId: `prj-${Date.now()}`,
      projectName,
      creatorLogin: MOCK_OPERATOR,
      createdAt: nowLabel(),
      expiresAt,
      purpose,
      bindingCount: 0,
      status: "正常",
      lastCallAt: "—",
      lastCallModel: "—",
      lastRegion: "—",
      tags,
    });
    appendAudit({
      at: nowLabel(),
      actor: MOCK_OPERATOR,
      keyId: id,
      keyLabel: displayName,
      action: "新建",
      detail: `用途：${purpose}；到期：${expiresAt}`,
    });
  } else if (platformEditingId.value) {
    const row = keyRows.value.find((r) => r.id === platformEditingId.value);
    if (!row) {
      platformFormError.value = "未找到该密钥";
      return;
    }
    const before = `名称=${row.displayName}；用途=${row.purpose}`;
    row.displayName = displayName;
    row.purpose = purpose;
    row.expiresAt = expiresAt;
    row.orgId = draftOrgId.value;
    row.orgName = org?.name ?? row.orgName;
    row.projectName = projectName;
    row.tags = tags;
    appendAudit({
      at: nowLabel(),
      actor: MOCK_OPERATOR,
      keyId: row.id,
      keyLabel: displayName,
      action: "编辑",
      detail: `改前 ${before} → 改后 名称=${displayName}；用途=${purpose}`,
    });
  }
  persistKeys();
  platformFormOpen.value = false;
}

function openDanger(kind: "freeze" | "unfreeze" | "revoke" | "delete-platform", row: PlatformKeyRow): void {
  dangerScope.value = "platform";
  dangerKind.value = kind;
  dangerTargetId.value = row.id;
  dangerTargetLabel.value = `${row.displayName}（${row.id}）`;
  draftDangerNote.value = "";
  dangerOpen.value = true;
}

function openUserDanger(kind: "freeze" | "unfreeze", row: UserKeyRow): void {
  dangerScope.value = "user";
  dangerKind.value = kind;
  dangerTargetId.value = row.id;
  dangerTargetLabel.value = `${row.name}（${row.id}）`;
  draftDangerNote.value = "";
  dangerOpen.value = true;
}

function closeDanger(): void {
  dangerOpen.value = false;
  dangerScope.value = "platform";
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

  if (dangerScope.value === "user") {
    const row = userKeyRows.value.find((r) => r.id === id);
    if (!row) {
      closeDanger();
      return;
    }
    const note = draftDangerNote.value.trim();
    const detailSuffix = note ? `；${note}` : "";
    const at = nowLabel();

    if (kind === "freeze") {
      row.status = "已冻结";
      row.updatedAt = at;
      appendAudit({
        at,
        actor: MOCK_OPERATOR,
        keyId: row.id,
        keyLabel: row.name,
        action: "冻结",
        detail: `用户密钥冻结；网关将拒绝调用（示意）${detailSuffix}`,
      });
    } else if (kind === "unfreeze") {
      row.status = "正常";
      row.updatedAt = at;
      appendAudit({
        at,
        actor: MOCK_OPERATOR,
        keyId: row.id,
        keyLabel: row.name,
        action: "解冻",
        detail: `用户密钥解冻${detailSuffix}`,
      });
    }
    persistUserKeys();
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

  if (kind === "delete-platform") {
    keyRows.value = keyRows.value.filter((r) => r.id !== id);
    appendAudit({
      at: nowLabel(),
      actor: MOCK_OPERATOR,
      keyId: row.id,
      keyLabel: row.displayName,
      action: "删除",
      detail: `已删除平台密钥${detailSuffix}`,
    });
    persistKeys();
    closeDanger();
    return;
  }

  if (kind === "freeze") {
    row.status = "已冻结";
    appendAudit({
      at: nowLabel(),
      actor: MOCK_OPERATOR,
      keyId: row.id,
      keyLabel: row.displayName,
      action: "冻结",
      detail: `原因码（示意）RISK_OPS${detailSuffix}`,
    });
  } else if (kind === "unfreeze") {
    row.status = "正常";
    appendAudit({
      at: nowLabel(),
      actor: MOCK_OPERATOR,
      keyId: row.id,
      keyLabel: row.displayName,
      action: "解冻",
      detail: `人工解冻${detailSuffix}`,
    });
  } else if (kind === "revoke") {
    row.status = "已吊销";
    appendAudit({
      at: nowLabel(),
      actor: MOCK_OPERATOR,
      keyId: row.id,
      keyLabel: row.displayName,
      action: "吊销",
      detail: `吊销后不可再用${detailSuffix}`,
    });
  }
  persistKeys();
  closeDanger();
}

function openGateDialog(row: PlatformKeyRow): void {
  gateTargetId.value = row.id;
  gateTargetLabel.value = row.displayName;
  gatePassword.value = "";
  gateError.value = "";
  gateRevealed.value = false;
  gateOpen.value = true;
}

function closeGateDialog(): void {
  gateOpen.value = false;
  gateRevealed.value = false;
}

function confirmGateReveal(): void {
  if (!gatePassword.value.trim()) {
    gateError.value = "请输入二次口令（原型示意 verify-credential-password）";
    return;
  }
  gateError.value = "";
  gateRevealed.value = true;
  appendAudit({
    at: nowLabel(),
    actor: MOCK_OPERATOR,
    keyId: gateTargetId.value,
    keyLabel: gateTargetLabel.value,
    action: "查看明文",
    detail: "credential gate 验证通过；明文短时展示（原型写死，工程期接 gate token）",
  });
}

function onViewDetailAudit(): void {
  const row = detailRow.value;
  if (!row) return;
  appendAudit({
    at: nowLabel(),
    actor: MOCK_OPERATOR,
    keyId: row.id,
    keyLabel: row.displayName,
    action: "检索查看",
    detail: "详情弹层查看绑定客户与最近调用摘要（脱敏）",
  });
}

function openUserQuota(row: UserKeyRow): void {
  userQuotaTarget.value = row;
  draftRpm.value = row.rpmLimit;
  draftDailyCap.value = row.dailyTokenCap;
  draftWindowReset.value = row.windowReset;
  userQuotaOpen.value = true;
}

function saveUserQuota(): void {
  const row = userQuotaTarget.value;
  if (!row) return;
  const before = `RPM=${row.rpmLimit}；日顶=${row.dailyTokenCap}；窗口=${row.windowReset}`;
  row.rpmLimit = draftRpm.value;
  row.dailyTokenCap = draftDailyCap.value;
  row.windowReset = draftWindowReset.value;
  row.updatedAt = nowLabel();
  appendAudit({
    at: nowLabel(),
    actor: MOCK_OPERATOR,
    keyId: row.id,
    keyLabel: row.name,
    action: "调整限额",
    detail: `改前 ${before} → 改后 RPM=${row.rpmLimit}；日顶=${row.dailyTokenCap}`,
  });
  persistUserKeys();
  userQuotaOpen.value = false;
}

function openUserRevoke(row: UserKeyRow): void {
  userRevokeTarget.value = row;
  draftUserRevokeNote.value = "";
  userRevokeOpen.value = true;
}

function executeUserRevoke(): void {
  const row = userRevokeTarget.value;
  if (!row || row.status === "已撤销") {
    userRevokeOpen.value = false;
    return;
  }
  const note = draftUserRevokeNote.value.trim();
  row.status = "已撤销";
  row.updatedAt = nowLabel();
  appendAudit({
    at: nowLabel(),
    actor: MOCK_OPERATOR,
    keyId: row.id,
    keyLabel: row.name,
    action: "撤销",
    detail: note ? `用户密钥撤销；${note}` : "用户密钥撤销（运营操作）",
  });
  persistUserKeys();
  userRevokeOpen.value = false;
}

onMounted(() => {
  loadKeys();
  loadUserKeys();
  loadAudit();
  loadFilters();
});

watch(searchQ, (v) => writeKeysSearchQ(v));
watch(filterOrg, (v) => writeKeysFilterOrg(v));
</script>

<template>
  <div class="key-page">
    <section v-show="panel === 'platform-keys'" class="key-page__panel" aria-label="平台密钥">
      <el-card shadow="never" class="admin-ep-card key-page__panel">
        <AdminSectionHead toolbar-only title="平台密钥">
          <template #annot>
            <AdminInternalTip heading="平台密钥 · 原型" explain="上游平台 API Key（§4.2.3）">
              <p>
                列表为<strong>平台运营视角</strong>：指纹脱敏；支持新建/编辑/删除、冻结/吊销、gate 明文（mock）。
                绑定路由数可跳转「模型管理 → 路由绑定」。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="searchQ"
              :input-id="`${idPrefix}-key-search`"
              search-placeholder="指纹前缀、名称、客户、项目、用途…"
              search-aria-label="检索平台密钥"
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
                <el-select v-model="filterStatus" clearable placeholder="状态" style="width: 7rem">
                  <el-option label="正常" value="正常" />
                  <el-option label="已冻结" value="已冻结" />
                  <el-option label="已吊销" value="已吊销" />
                </el-select>
              </template>
              <template #actions>
                <el-button
                  v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite"
                  type="primary"
                  @click="openPlatformForm('add')"
                >
                  新建平台密钥
                </el-button>
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
          <el-table-column
            prop="displayName"
            label="密钥名"
            :min-width="ADMIN_TABLE_COL.primary"
            sortable
            show-overflow-tooltip
          />
          <el-table-column prop="fingerprintPrefix" label="指纹（脱敏）" :min-width="ADMIN_TABLE_COL.lg" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="key-page__mono">{{ scope.row.fingerprintPrefix }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="客户 / 项目" :min-width="ADMIN_TABLE_COL.xl" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                {{ scope.row.orgName }}
                <br />
                <span class="key-page__mono key-page__muted">{{ scope.row.projectName }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="expiresAt" label="到期" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="bindingCount" label="绑定" :min-width="ADMIN_TABLE_COL.xs" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <el-button link type="primary" @click="goBindings">{{ scope.row.bindingCount }}</el-button>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="purpose"
            label="用途"
            :min-width="ADMIN_TABLE_COL.md"
            sortable
            show-overflow-tooltip
          />
          <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.xs" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <span :class="statusBadgeClass(scope.row.status)">{{ scope.row.status }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="lastCallAt" label="最近调用" :min-width="ADMIN_TABLE_COL.lg" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                {{ scope.row.lastCallAt }}
                <br />
                <span class="key-page__muted" style="font-size: 0.6875rem">
                  {{ scope.row.lastCallModel }} · {{ scope.row.lastRegion }}
                </span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg"fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
                <div class="admin-ep-row-actions" @click.stop>
                  <el-button link type="primary" :icon="View" @click="openDetailCard(scope.row)">详情</el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canRevealSecret && scope.row.status !== '已吊销'"
                    link
                    type="primary"
                    @click="openGateDialog(scope.row)"
                  >
                    明文
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && scope.row.status !== '已吊销'"
                    link
                    type="primary"
                    :icon="Edit"
                    @click="openPlatformForm('edit', scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && scope.row.status === '正常'"
                    link
                    type="primary"
                    :icon="Lock"
                    @click="openDanger('freeze', scope.row)"
                  >
                    冻结
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && scope.row.status === '已冻结'"
                    link
                    type="primary"
                    :icon="Unlock"
                    @click="openDanger('unfreeze', scope.row)"
                  >
                    解冻
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && scope.row.status !== '已吊销'"
                    link
                    type="danger"
                    :icon="Delete"
                    @click="openDanger('revoke', scope.row)"
                  >
                    吊销
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && scope.row.status === '已吊销'"
                    link
                    type="danger"
                    @click="openDanger('delete-platform', scope.row)"
                  >
                    删除
                  </el-button>
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

    <section v-show="panel === 'user-keys'" class="key-page__panel" aria-label="用户密钥">
      <el-card shadow="never" class="admin-ep-card key-page__panel">
        <AdminSectionHead toolbar-only title="用户密钥">
          <template #annot>
            <AdminInternalTip heading="用户密钥 · 原型" explain="运营视角 user_api_key（§4.3.3）">
              <p>
                列表为<strong>运营查询视角</strong>：指纹脱敏；支持详情、限额调整与撤销（mock）。
                与租户门户自助建 Key 分轨。
              </p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="userKeySearchQ"
              :input-id="`${idPrefix}-user-key-q`"
              search-placeholder="名称、用户、workspace、指纹…"
              search-aria-label="检索用户密钥"
              @reset="resetUserKeyQuery"
            >
              <template #filters>
                <el-select
                  v-model="userWorkspaceFilter"
                  filterable
                  clearable
                  placeholder="Workspace"
                  aria-label="按 Workspace 筛选"
                  style="width: 10rem"
                >
                  <el-option v-for="ws in userWorkspaceOptions" :key="ws" :label="ws" :value="ws" />
                </el-select>
                <el-select v-model="userKeyStatusFilter" clearable placeholder="状态" style="width: 7rem">
                  <el-option label="正常" value="正常" />
                  <el-option label="已冻结" value="已冻结" />
                  <el-option label="已撤销" value="已撤销" />
                </el-select>
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>
        <el-table
          :data="userKeysPg.paginatedRows"
          row-key="id"
          class="admin-ep-table-wrap"
          style="width: 100%"
          :default-sort="{ prop: 'updatedAt', order: 'descending' }"
        >
          <el-table-column
            prop="name"
            label="密钥名"
            :min-width="ADMIN_TABLE_COL.primary"
            sortable
            show-overflow-tooltip
          />
          <el-table-column prop="fingerprintPrefix" label="指纹（脱敏）" :min-width="ADMIN_TABLE_COL.lg" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="key-page__mono">{{ scope.row.fingerprintPrefix }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="userLogin" label="用户 / Workspace" :min-width="ADMIN_TABLE_COL.xl" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                {{ scope.row.userLogin }}
                <br />
                <span class="key-page__mono key-page__muted">{{ scope.row.workspace }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="rpmLimit" label="RPM" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="dailyTokenCap" label="日 Token 顶" :min-width="ADMIN_TABLE_COL.md" sortable />
          <el-table-column prop="windowReset" label="窗口重置" :min-width="ADMIN_TABLE_COL.md" sortable />
          <el-table-column prop="expiresAt" label="到期" :min-width="ADMIN_TABLE_COL.sm" sortable />
          <el-table-column prop="policyVersion" label="策略" :min-width="ADMIN_TABLE_COL.xs" sortable />
          <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.xs" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <span :class="userStatusClass(scope.row.status)">{{ scope.row.status }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="最近更新" :min-width="ADMIN_TABLE_COL.lg" sortable />
          <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg"fixed="right">
            <template #default="scope">
              <template v-if="scope?.row">
                <div class="admin-ep-row-actions" @click.stop>
                  <el-button link type="primary" :icon="View" @click="openUserDetail(scope.row)">详情</el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && userKeyWritable(scope.row.status)"
                    link
                    type="primary"
                    :icon="Edit"
                    @click="openUserQuota(scope.row)"
                  >
                    限额
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && scope.row.status === '正常'"
                    link
                    type="warning"
                    :icon="Lock"
                    @click="openUserDanger('freeze', scope.row)"
                  >
                    冻结
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && scope.row.status === '已冻结'"
                    link
                    type="primary"
                    :icon="Unlock"
                    @click="openUserDanger('unfreeze', scope.row)"
                  >
                    解冻
                  </el-button>
                  <el-button
                    v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && userKeyWritable(scope.row.status)"
                    link
                    type="danger"
                    @click="openUserRevoke(scope.row)"
                  >
                    撤销
                  </el-button>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <AdminTablePagination
          v-model:current-page="userKeysPg.currentPage"
          v-model:page-size="userKeysPg.pageSize"
          :total="userKeysPg.total"
        />
      </el-card>
    </section>

    <section v-show="panel === 'audit'" class="key-page__panel" aria-label="审计轨迹">
      <el-card shadow="never" class="admin-ep-card key-page__panel">
        <AdminSectionHead toolbar-only title="审计轨迹">
          <template #annot>
            <AdminInternalTip heading="审计轨迹 · 原型" explain="密钥域操作留痕">
              <p>本表为密钥相关操作 mock；全站写操作审计见「系统与合规 → 操作审计」。</p>
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
              <template #actions>
                <AdminExportCsvButton
                  hint="将导出当前筛选结果（原型占位）；正式版走 §4.13 导出审批。"
                  @export="
                    appendAudit({
                      at: nowLabel(),
                      actor: MOCK_OPERATOR,
                      keyId: '—',
                      keyLabel: '—',
                      action: '导出审计',
                      detail: '导出 CSV（示意）',
                    })
                  "
                />
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
          <el-table-column prop="at" label="时间" :min-width="ADMIN_TABLE_COL.lg" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="key-page__mono">{{ scope.row.at }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="actor" label="操作人" :min-width="ADMIN_TABLE_COL.md" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="key-page__mono">{{ scope.row.actor }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="动作" :min-width="ADMIN_TABLE_COL.xs" sortable />
          <el-table-column prop="keyLabel" label="密钥" :min-width="ADMIN_TABLE_COL.xl" sortable>
            <template #default="scope">
              <template v-if="scope?.row">
                {{ scope.row.keyLabel }}
                <br />
                <span class="key-page__mono key-page__muted">{{ scope.row.keyId }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="detail"
            label="说明"
            :min-width="ADMIN_TABLE_COL_MIN.detail"
            show-overflow-tooltip
            sortable
          />
        </el-table>
        <AdminTablePagination
          v-model:current-page="auditPg.currentPage"
          v-model:page-size="auditPg.pageSize"
          :total="auditPg.total"
        />
      </el-card>
    </section>

    <AdminDialog v-model="detailCardOpen" :title="detailDialogTitle" width="640px">
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
          <div class="key-page__detail-k">到期日</div>
          <p class="key-page__detail-v">{{ detailRow.expiresAt }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">用途说明</div>
          <p class="key-page__detail-v">{{ detailRow.purpose }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">绑定路由数</div>
          <p class="key-page__detail-v">
            <el-button link type="primary" @click="goBindings">{{ detailRow.bindingCount }} 条 → 路由绑定</el-button>
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
          <div class="key-page__detail-k">创建人 / 时间</div>
          <p class="key-page__detail-v key-page__mono">{{ detailRow.creatorLogin }} · {{ detailRow.createdAt }}</p>
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
        <el-button @click="onViewDetailAudit">记录查看审计</el-button>
        <el-button
          v-if="KEYS_PROTOTYPE_PERMISSIONS.canRevealSecret && detailRow?.status !== '已吊销'"
          type="primary"
          @click="detailRow && openGateDialog(detailRow)"
        >
          查看明文
        </el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="platformFormOpen" :title="platformFormTitle" width="480px">
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="名称" required>
          <el-input v-model="draftDisplayName" placeholder="如：生产网关" />
        </el-form-item>
        <el-form-item label="用途说明" required>
          <el-input v-model="draftPurpose" placeholder="必填，如：生产网关上游" />
        </el-form-item>
        <el-form-item label="到期日" required>
          <el-input v-model="draftExpiresAt" placeholder="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="客户组织" required>
          <el-select v-model="draftOrgId" filterable style="width: 100%">
            <el-option v-for="o in uniqueOrgs" :key="o.id" :label="o.name" :value="o.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="draftProjectName" placeholder="对外 API 项目" />
        </el-form-item>
        <el-form-item label="标签（逗号分隔）">
          <el-input v-model="draftTags" placeholder="生产, 高调用" />
        </el-form-item>
        <p v-if="platformFormError" class="key-page__form-err">{{ platformFormError }}</p>
      </el-form>
      <template #footer>
        <el-button @click="platformFormOpen = false">取消</el-button>
        <el-button type="primary" @click="savePlatformForm">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="dangerOpen" :title="dangerTitle" width="560px">
      <p class="or-keys-editor-banner" role="status">{{ dangerMessage }}</p>
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="原因 / 备注（可选）">
          <el-input v-model="draftDangerNote" placeholder="工单号、风控单号等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDanger">取消</el-button>
        <el-button
          v-if="dangerKind === 'revoke' || dangerKind === 'freeze' || dangerKind === 'delete-platform'"
          type="danger"
          @click="executeDanger"
        >
          {{ dangerKind === "delete-platform" ? "确认删除" : dangerKind === "revoke" ? "确认吊销" : "确认冻结" }}
        </el-button>
        <el-button v-else type="primary" @click="executeDanger">确认解冻</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="gateOpen" title="二次口令验证" width="440px" @closed="gateRevealed = false">
      <template v-if="!gateRevealed">
        <p class="key-page__muted">查看「{{ gateTargetLabel }}」明文需 credential gate（§4.2.3）。</p>
        <el-input v-model="gatePassword" type="password" placeholder="二次口令" show-password />
        <p v-if="gateError" class="key-page__form-err">{{ gateError }}</p>
      </template>
      <template v-else>
        <p class="key-page__muted">验证通过。以下为<strong>原型写死</strong>明文，工程期替换为 gate token 接口返回。</p>
        <pre class="key-page__secret-pre">{{ MOCK_REVEALED_SECRET }}</pre>
      </template>
      <template #footer>
        <el-button @click="closeGateDialog">{{ gateRevealed ? "关闭" : "取消" }}</el-button>
        <el-button v-if="!gateRevealed" type="primary" @click="confirmGateReveal">验证并查看</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="userDetailOpen" :title="userDetailDialogTitle" width="560px">
      <div v-if="userDetailRow" class="key-page__detail-grid">
        <div>
          <div class="key-page__detail-k">密钥 ID</div>
          <p class="key-page__detail-v key-page__mono">{{ userDetailRow.id }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">名称</div>
          <p class="key-page__detail-v">{{ userDetailRow.name }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">指纹（脱敏）</div>
          <p class="key-page__detail-v key-page__mono">{{ userDetailRow.fingerprintPrefix }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">状态</div>
          <p class="key-page__detail-v">
            <span :class="userStatusClass(userDetailRow.status)">{{ userDetailRow.status }}</span>
          </p>
        </div>
        <div>
          <div class="key-page__detail-k">用户</div>
          <p class="key-page__detail-v">
            <RouterLink :to="{ name: 'tai-admin-users-list', query: { q: userDetailRow.userLogin } }">
              {{ userDetailRow.userLogin }}
            </RouterLink>
          </p>
        </div>
        <div>
          <div class="key-page__detail-k">Workspace</div>
          <p class="key-page__detail-v key-page__mono">{{ userDetailRow.workspace }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">RPM 限额</div>
          <p class="key-page__detail-v">{{ userDetailRow.rpmLimit }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">日 Token 顶</div>
          <p class="key-page__detail-v">{{ userDetailRow.dailyTokenCap }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">窗口重置</div>
          <p class="key-page__detail-v">{{ userDetailRow.windowReset }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">过期日</div>
          <p class="key-page__detail-v">{{ userDetailRow.expiresAt }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">策略版本</div>
          <p class="key-page__detail-v">{{ userDetailRow.policyVersion }}</p>
        </div>
        <div>
          <div class="key-page__detail-k">最近更新</div>
          <p class="key-page__detail-v key-page__mono">{{ userDetailRow.updatedAt }}</p>
        </div>
        <div class="key-page__detail-span">
          <div class="key-page__detail-k">关联用量（示意）</div>
          <p class="key-page__detail-v">
            <RouterLink
              :to="{ name: 'tai-admin-billing-usage', query: { apiKey: userDetailRow.name } }"
            >
              用量明细 · 按 Key 筛选 →
            </RouterLink>
          </p>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeUserDetail">关闭</el-button>
        <el-button
          v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && userDetailRow && userKeyWritable(userDetailRow.status)"
          @click="openUserQuotaFromDetail"
        >
          调整限额
        </el-button>
        <el-button
          v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && userDetailRow?.status === '正常'"
          type="warning"
          @click="openUserDangerFromDetail('freeze')"
        >
          冻结
        </el-button>
        <el-button
          v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && userDetailRow?.status === '已冻结'"
          type="primary"
          @click="openUserDangerFromDetail('unfreeze')"
        >
          解冻
        </el-button>
        <el-button
          v-if="KEYS_PROTOTYPE_PERMISSIONS.canWrite && userDetailRow && userKeyWritable(userDetailRow.status)"
          type="danger"
          @click="openUserRevokeFromDetail"
        >
          撤销
        </el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="userQuotaOpen" title="调整限额" width="400px">
      <el-form v-if="userQuotaTarget" label-position="top">
        <el-form-item label="RPM">
          <el-input-number v-model="draftRpm" :min="1" />
        </el-form-item>
        <el-form-item label="日 Token 上限">
          <el-input v-model="draftDailyCap" />
        </el-form-item>
        <el-form-item label="窗口重置">
          <el-input v-model="draftWindowReset" placeholder="UTC 00:00" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userQuotaOpen = false">取消</el-button>
        <el-button type="primary" @click="saveUserQuota">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="userRevokeOpen" title="确认撤销用户密钥" width="480px">
      <p v-if="userRevokeTarget" class="or-keys-editor-banner">
        撤销后用户侧不可再使用该 Key：{{ userRevokeTarget.name }}（{{ userRevokeTarget.id }}）
      </p>
      <el-form label-position="top">
        <el-form-item label="备注（可选）">
          <el-input v-model="draftUserRevokeNote" placeholder="撤销原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userRevokeOpen = false">取消</el-button>
        <el-button type="danger" @click="executeUserRevoke">确认撤销</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
