<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { useRoute } from "vue-router";
import { CircleClose, Delete, Edit, Select, View } from "@element-plus/icons-vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { ADMIN_TABLE_COL, ADMIN_TABLE_COL_OPS } from "../../utils/adminTableColumns";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { filterByQuery } from "../../utils/adminListFilter";
import "./users.css";
import {
  USER_PANEL_ORDER,
  DEFAULT_TERMINAL_USERS,
  DEFAULT_WHITELIST_RULES,
  DEFAULT_BLACKLIST_ENTRIES,
  DEFAULT_KYC_APPLICATIONS,
  type UserPanelId,
  type TerminalUserRow,
  type WhitelistRuleRow,
  type BlacklistEntryRow,
  type KycApplicationRow,
} from "./mock";
import {
  readTerminalUsersJson,
  writeTerminalUsersJson,
  readUsersListFilter,
  writeUsersListFilter,
  readWhitelistJson,
  writeWhitelistJson,
  readBlacklistJson,
  writeBlacklistJson,
  readKycJson,
  writeKycJson,
} from "./usersInteractions";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<UserPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && USER_PANEL_ORDER.includes(id as UserPanelId)) return id as UserPanelId;
  return "list";
});

const userListFilter = ref("");
const userStatusFilter = ref("");
const auditQueueSearchQ = ref("");
const wlSearchQ = ref("");
const wlEnabledFilter = ref("");
const blSearchQ = ref("");
const blTypeFilter = ref("");
const kycSearchQ = ref("");
const kycStatusFilter = ref("");
const userRows = ref<TerminalUserRow[]>([]);
const whitelistRows = ref<WhitelistRuleRow[]>([]);
const blacklistRows = ref<BlacklistEntryRow[]>([]);
const kycRows = ref<KycApplicationRow[]>([]);

const userModalOpen = ref(false);
const userModalMode = ref<"add" | "edit">("add");
const userEditingId = ref<string | null>(null);
const userFormError = ref("");
const draftUserEmail = ref("");
const draftUserName = ref("");
const draftUserOrg = ref("");
const draftUserPhone = ref("");
const draftUserStatus = ref<TerminalUserRow["status"]>("正常");

const wlModalOpen = ref(false);
const wlEditingId = ref<string | null>(null);
const wlFormError = ref("");
const draftWlPattern = ref("");
const draftWlType = ref<WhitelistRuleRow["patternType"]>("邮箱域名");
const draftWlNote = ref("");
const draftWlEnabled = ref(true);

const blModalOpen = ref(false);
const blEditingId = ref<string | null>(null);
const blFormError = ref("");
const draftBlTarget = ref("");
const draftBlType = ref<BlacklistEntryRow["targetType"]>("邮箱");
const draftBlReason = ref("");
const draftBlLogin = ref(true);
const draftBlApi = ref(true);

const auditModalOpen = ref(false);
const auditKind = ref<"approve" | "reject">("approve");
const auditUserId = ref<string | null>(null);

const kycAuditModalOpen = ref(false);
const kycAuditKind = ref<"approve" | "reject">("approve");
const kycAuditRowId = ref<string | null>(null);

const detailCardOpen = ref(false);
const detailCardId = ref("");

const detailRow = computed(() => userRows.value.find((r) => r.id === detailCardId.value) ?? null);

const usrDangerOpen = ref(false);
const usrDangerKind = ref<
  "none" | "delete-user" | "delete-wl" | "delete-bl" | "delete-kyc" | "freeze-user" | "unfreeze-user"
>("none");
const usrDangerId = ref<string | null>(null);
const usrDangerLabel = ref("");

const usrDangerTitle = computed(() => {
  switch (usrDangerKind.value) {
    case "delete-user":
      return "确认删除用户";
    case "delete-wl":
      return "确认删除白名单规则";
    case "delete-bl":
      return "确认删除黑名单条目";
    case "delete-kyc":
      return "确认删除认证记录";
    case "freeze-user":
      return "确认冻结账号";
    case "unfreeze-user":
      return "确认解冻账号";
    default:
      return "确认操作";
  }
});

const usrDangerPrimaryLabel = computed(() => {
  if (usrDangerKind.value === "unfreeze-user") return "确认解冻";
  if (usrDangerKind.value === "freeze-user") return "确认冻结";
  return "确认删除";
});

const usrDangerMessage = computed(() => {
  const label = usrDangerLabel.value;
  switch (usrDangerKind.value) {
    case "delete-user":
      return `确定删除终端用户「${label}」？原型将同步更新 localStorage，并移除其待审认证记录（若有）。`;
    case "delete-wl":
      return `确定删除白名单规则「${label}」？`;
    case "delete-bl":
      return `确定删除黑名单「${label}」？`;
    case "delete-kyc":
      return `确定删除认证记录「${label}」？`;
    case "freeze-user":
      return `确定冻结「${label}」？登录与调用将拒绝（示意）。`;
    case "unfreeze-user":
      return `确定将「${label}」恢复为正常状态？`;
    default:
      return "";
  }
});

const auditModalTitle = computed(() => (auditKind.value === "approve" ? "确认通过审核" : "确认拒绝注册"));
const auditModalMessage = computed(() => {
  const u = userRows.value.find((x) => x.id === auditUserId.value);
  const name = u?.displayName ?? "";
  if (auditKind.value === "approve") return `通过「${name}」的注册审核？状态将改为「正常」。`;
  return `拒绝「${name}」的注册？状态将改为「已拒绝」。`;
});

const kycAuditTitle = computed(() => (kycAuditKind.value === "approve" ? "确认通过认证" : "确认拒绝认证"));
const kycAuditMessage = computed(() => {
  const k = kycRows.value.find((x) => x.id === kycAuditRowId.value);
  if (!k) return "";
  if (kycAuditKind.value === "approve") return `通过 ${k.kind}（用户 ${k.userId}）？记录标为「通过」。`;
  return `拒绝 ${k.kind}（用户 ${k.userId}）？记录标为「拒绝」。`;
});

function loadUsers(): void {
  const raw = readTerminalUsersJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        userRows.value = parsed as TerminalUserRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  userRows.value = JSON.parse(JSON.stringify(DEFAULT_TERMINAL_USERS)) as TerminalUserRow[];
}

function persistUsers(): void {
  writeTerminalUsersJson(JSON.stringify(userRows.value));
}

function loadWhitelist(): void {
  const raw = readWhitelistJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        whitelistRows.value = parsed as WhitelistRuleRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  whitelistRows.value = JSON.parse(JSON.stringify(DEFAULT_WHITELIST_RULES)) as WhitelistRuleRow[];
}

function persistWhitelist(): void {
  writeWhitelistJson(JSON.stringify(whitelistRows.value));
}

function loadBlacklist(): void {
  const raw = readBlacklistJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        blacklistRows.value = parsed as BlacklistEntryRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  blacklistRows.value = JSON.parse(JSON.stringify(DEFAULT_BLACKLIST_ENTRIES)) as BlacklistEntryRow[];
}

function persistBlacklist(): void {
  writeBlacklistJson(JSON.stringify(blacklistRows.value));
}

function loadKyc(): void {
  const raw = readKycJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        kycRows.value = parsed as KycApplicationRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  kycRows.value = JSON.parse(JSON.stringify(DEFAULT_KYC_APPLICATIONS)) as KycApplicationRow[];
}

function persistKyc(): void {
  writeKycJson(JSON.stringify(kycRows.value));
}

const filteredUsers = computed(() => {
  let rows = userRows.value;
  if (userStatusFilter.value) rows = rows.filter((r) => r.status === userStatusFilter.value);
  return filterByQuery(rows, userListFilter.value, (r) =>
    [r.id, r.email, r.displayName, r.orgName, r.phone ?? ""].join(" "),
  );
});

const pendingUsers = computed(() => userRows.value.filter((u) => u.status === "待审核"));

const filteredPendingUsers = computed(() =>
  filterByQuery(pendingUsers.value, auditQueueSearchQ.value, (r) =>
    [r.email, r.displayName, r.orgName, r.id, r.registeredAt].join(" "),
  ),
);

const filteredWhitelist = computed(() => {
  let rows = whitelistRows.value;
  if (wlEnabledFilter.value === "yes") rows = rows.filter((r) => r.enabled);
  if (wlEnabledFilter.value === "no") rows = rows.filter((r) => !r.enabled);
  return filterByQuery(rows, wlSearchQ.value, (r) => [r.pattern, r.patternType, r.note, r.updatedAt].join(" "));
});

const filteredBlacklist = computed(() => {
  let rows = blacklistRows.value;
  if (blTypeFilter.value) rows = rows.filter((r) => r.targetType === blTypeFilter.value);
  return filterByQuery(rows, blSearchQ.value, (r) => [r.target, r.targetType, r.reason, r.updatedAt].join(" "));
});

const filteredKyc = computed(() => {
  let rows = kycRows.value;
  if (kycStatusFilter.value) rows = rows.filter((r) => r.status === kycStatusFilter.value);
  return filterByQuery(rows, kycSearchQ.value, (r) =>
    [r.id, r.userId, r.kind, r.status, r.remark, r.submittedAt].join(" "),
  );
});

function resetUserListQuery(): void {
  userStatusFilter.value = "";
}

function resetWlQuery(): void {
  wlEnabledFilter.value = "";
}

function resetBlQuery(): void {
  blTypeFilter.value = "";
}

function resetKycQuery(): void {
  kycStatusFilter.value = "";
}

function userStatusBadgeClass(s: TerminalUserRow["status"]): string {
  if (s === "正常") return "usr-page__badge usr-page__badge--ok";
  if (s === "待审核") return "usr-page__badge usr-page__badge--warn";
  if (s === "已拒绝") return "usr-page__badge usr-page__badge--danger";
  return "usr-page__badge usr-page__badge--muted";
}

function onAddUserClick(): void {
  userModalMode.value = "add";
  userEditingId.value = null;
  userFormError.value = "";
  draftUserEmail.value = "";
  draftUserName.value = "";
  draftUserOrg.value = "";
  draftUserPhone.value = "";
  draftUserStatus.value = "待审核";
  userModalOpen.value = true;
}

function onEditUserClick(row: TerminalUserRow): void {
  userModalMode.value = "edit";
  userEditingId.value = row.id;
  userFormError.value = "";
  draftUserEmail.value = row.email;
  draftUserName.value = row.displayName;
  draftUserOrg.value = row.orgName === "—" ? "" : row.orgName;
  draftUserPhone.value = row.phone ?? "";
  draftUserStatus.value = row.status;
  userModalOpen.value = true;
}

function closeUserModal(): void {
  userModalOpen.value = false;
  userFormError.value = "";
  userEditingId.value = null;
}

function saveUserModal(): void {
  userFormError.value = "";
  const email = draftUserEmail.value.trim().toLowerCase();
  const displayName = draftUserName.value.trim();
  const orgName = draftUserOrg.value.trim() || "—";
  const phone = draftUserPhone.value.trim();
  const status = draftUserStatus.value;
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  if (!email) {
    userFormError.value = "邮箱必填。";
    return;
  }
  if (!displayName) {
    userFormError.value = "展示名必填。";
    return;
  }
  const validStatus: TerminalUserRow["status"][] = ["正常", "待审核", "已拒绝", "已冻结"];
  if (!validStatus.includes(status)) {
    userFormError.value = "状态须为：正常 / 待审核 / 已拒绝 / 已冻结。";
    return;
  }

  if (userModalMode.value === "add") {
    if (userRows.value.some((u) => u.email === email)) {
      userFormError.value = "该邮箱已存在。";
      return;
    }
    userRows.value.push({
      id: `tu-${Date.now()}`,
      email,
      displayName,
      orgName,
      status,
      registeredAt: now,
      phone: phone || undefined,
    });
  } else if (userEditingId.value) {
    const idx = userRows.value.findIndex((x) => x.id === userEditingId.value);
    if (idx < 0) {
      userFormError.value = "未找到该用户。";
      return;
    }
    const prev = userRows.value[idx];
    if (!prev) return;
    if (userRows.value.some((u) => u.email === email && u.id !== prev.id)) {
      userFormError.value = "邮箱与其他用户冲突。";
      return;
    }
    userRows.value[idx] = {
      ...prev,
      email,
      displayName,
      orgName,
      status,
      phone: phone || undefined,
    };
  }
  persistUsers();
  closeUserModal();
}

function openDetailCard(row: TerminalUserRow): void {
  detailCardId.value = row.id;
  detailCardOpen.value = true;
}

function closeDetailCard(): void {
  detailCardOpen.value = false;
}

function requestDeleteUser(row: TerminalUserRow): void {
  usrDangerKind.value = "delete-user";
  usrDangerId.value = row.id;
  usrDangerLabel.value = row.displayName;
  usrDangerOpen.value = true;
}

function requestFreezeUser(row: TerminalUserRow): void {
  usrDangerKind.value = "freeze-user";
  usrDangerId.value = row.id;
  usrDangerLabel.value = row.displayName;
  usrDangerOpen.value = true;
}

function requestUnfreezeUser(row: TerminalUserRow): void {
  usrDangerKind.value = "unfreeze-user";
  usrDangerId.value = row.id;
  usrDangerLabel.value = row.displayName;
  usrDangerOpen.value = true;
}

function openAuditModal(kind: "approve" | "reject", userId: string): void {
  auditKind.value = kind;
  auditUserId.value = userId;
  auditModalOpen.value = true;
}

function closeAuditModal(): void {
  auditModalOpen.value = false;
  auditUserId.value = null;
}

function executeAuditModal(): void {
  const id = auditUserId.value;
  if (!id) {
    closeAuditModal();
    return;
  }
  const idx = userRows.value.findIndex((x) => x.id === id);
  if (idx < 0) {
    closeAuditModal();
    return;
  }
  const prev = userRows.value[idx];
  if (!prev || prev.status !== "待审核") {
    closeAuditModal();
    return;
  }
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  userRows.value[idx] = {
    ...prev,
    status: auditKind.value === "approve" ? "正常" : "已拒绝",
    registeredAt: prev.registeredAt,
  };
  persistUsers();
  closeAuditModal();
}

function openKycAudit(kind: "approve" | "reject", rowId: string): void {
  kycAuditKind.value = kind;
  kycAuditRowId.value = rowId;
  kycAuditModalOpen.value = true;
}

function closeKycAuditModal(): void {
  kycAuditModalOpen.value = false;
  kycAuditRowId.value = null;
}

function executeKycAuditModal(): void {
  const id = kycAuditRowId.value;
  if (!id) {
    closeKycAuditModal();
    return;
  }
  const idx = kycRows.value.findIndex((x) => x.id === id);
  if (idx < 0) {
    closeKycAuditModal();
    return;
  }
  const prev = kycRows.value[idx];
  if (!prev || prev.status !== "待审") {
    closeKycAuditModal();
    return;
  }
  kycRows.value[idx] = {
    ...prev,
    status: kycAuditKind.value === "approve" ? "通过" : "拒绝",
  };
  persistKyc();
  closeKycAuditModal();
}

function onAddWlClick(): void {
  wlEditingId.value = null;
  wlFormError.value = "";
  draftWlPattern.value = "";
  draftWlType.value = "邮箱域名";
  draftWlNote.value = "";
  draftWlEnabled.value = true;
  wlModalOpen.value = true;
}

function onEditWlClick(row: WhitelistRuleRow): void {
  wlEditingId.value = row.id;
  wlFormError.value = "";
  draftWlPattern.value = row.pattern;
  draftWlType.value = row.patternType;
  draftWlNote.value = row.note;
  draftWlEnabled.value = row.enabled;
  wlModalOpen.value = true;
}

function closeWlModal(): void {
  wlModalOpen.value = false;
  wlFormError.value = "";
  wlEditingId.value = null;
}

function saveWlModal(): void {
  wlFormError.value = "";
  const pattern = draftWlPattern.value.trim();
  const note = draftWlNote.value.trim() || "—";
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const t = draftWlType.value;
  if (!pattern) {
    wlFormError.value = "规则内容必填。";
    return;
  }
  if (t !== "邮箱域名" && t !== "手机号段") {
    wlFormError.value = "类型须为「邮箱域名」或「手机号段」。";
    return;
  }
  if (wlEditingId.value) {
    const idx = whitelistRows.value.findIndex((x) => x.id === wlEditingId.value);
    if (idx >= 0) {
      const prev = whitelistRows.value[idx];
      if (prev) {
        whitelistRows.value[idx] = {
          ...prev,
          pattern,
          patternType: t,
          note,
          enabled: draftWlEnabled.value,
          updatedAt: now,
        };
      }
    }
  } else {
    whitelistRows.value.push({
      id: `wl-${Date.now()}`,
      pattern,
      patternType: t,
      enabled: draftWlEnabled.value,
      note,
      updatedAt: now,
    });
  }
  persistWhitelist();
  closeWlModal();
}

function requestDeleteWl(row: WhitelistRuleRow): void {
  usrDangerKind.value = "delete-wl";
  usrDangerId.value = row.id;
  usrDangerLabel.value = row.pattern;
  usrDangerOpen.value = true;
}

function onAddBlClick(): void {
  blEditingId.value = null;
  blFormError.value = "";
  draftBlTarget.value = "";
  draftBlType.value = "邮箱";
  draftBlReason.value = "";
  draftBlLogin.value = true;
  draftBlApi.value = true;
  blModalOpen.value = true;
}

function onEditBlClick(row: BlacklistEntryRow): void {
  blEditingId.value = row.id;
  blFormError.value = "";
  draftBlTarget.value = row.target;
  draftBlType.value = row.targetType;
  draftBlReason.value = row.reason;
  draftBlLogin.value = row.blockLogin;
  draftBlApi.value = row.blockApi;
  blModalOpen.value = true;
}

function closeBlModal(): void {
  blModalOpen.value = false;
  blFormError.value = "";
  blEditingId.value = null;
}

function saveBlModal(): void {
  blFormError.value = "";
  const target = draftBlTarget.value.trim();
  const reason = draftBlReason.value.trim() || "—";
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const tt = draftBlType.value;
  if (!target) {
    blFormError.value = "目标必填。";
    return;
  }
  if (tt !== "邮箱" && tt !== "手机" && tt !== "用户ID") {
    blFormError.value = "目标类型须为「邮箱」「手机」或「用户ID」。";
    return;
  }
  if (blEditingId.value) {
    const idx = blacklistRows.value.findIndex((x) => x.id === blEditingId.value);
    if (idx >= 0) {
      const prev = blacklistRows.value[idx];
      if (prev) {
        blacklistRows.value[idx] = {
          ...prev,
          target,
          targetType: tt,
          reason,
          blockLogin: draftBlLogin.value,
          blockApi: draftBlApi.value,
          updatedAt: now,
        };
      }
    }
  } else {
    blacklistRows.value.push({
      id: `bl-${Date.now()}`,
      target,
      targetType: tt,
      reason,
      blockLogin: draftBlLogin.value,
      blockApi: draftBlApi.value,
      updatedAt: now,
    });
  }
  persistBlacklist();
  closeBlModal();
}

function requestDeleteBl(row: BlacklistEntryRow): void {
  usrDangerKind.value = "delete-bl";
  usrDangerId.value = row.id;
  usrDangerLabel.value = row.target;
  usrDangerOpen.value = true;
}

function requestDeleteKyc(row: KycApplicationRow): void {
  usrDangerKind.value = "delete-kyc";
  usrDangerId.value = row.id;
  usrDangerLabel.value = `${row.kind} · ${row.userId}`;
  usrDangerOpen.value = true;
}

function closeUsrDanger(): void {
  usrDangerOpen.value = false;
  usrDangerKind.value = "none";
  usrDangerId.value = null;
  usrDangerLabel.value = "";
}

function executeUsrDanger(): void {
  const id = usrDangerId.value;
  const kind = usrDangerKind.value;
  if (!id || kind === "none") {
    closeUsrDanger();
    return;
  }
  if (kind === "delete-user") {
    userRows.value = userRows.value.filter((x) => x.id !== id);
    kycRows.value = kycRows.value.filter((k) => k.userId !== id);
    persistUsers();
    persistKyc();
  } else if (kind === "delete-wl") {
    whitelistRows.value = whitelistRows.value.filter((x) => x.id !== id);
    persistWhitelist();
  } else if (kind === "delete-bl") {
    blacklistRows.value = blacklistRows.value.filter((x) => x.id !== id);
    persistBlacklist();
  } else if (kind === "delete-kyc") {
    kycRows.value = kycRows.value.filter((x) => x.id !== id);
    persistKyc();
  } else if (kind === "freeze-user" || kind === "unfreeze-user") {
    const idx = userRows.value.findIndex((x) => x.id === id);
    if (idx >= 0) {
      const prev = userRows.value[idx];
      if (prev) {
        userRows.value[idx] = {
          ...prev,
          status: kind === "freeze-user" ? "已冻结" : "正常",
        };
        persistUsers();
      }
    }
  }
  closeUsrDanger();
}

function kycStatusClass(s: KycApplicationRow["status"]): string {
  if (s === "通过") return "usr-page__badge usr-page__badge--ok";
  if (s === "拒绝") return "usr-page__badge usr-page__badge--danger";
  return "usr-page__badge usr-page__badge--warn";
}

function onDocKeydown(e: KeyboardEvent): void {
  if (e.key !== "Escape") return;
  if (detailCardOpen.value) {
    closeDetailCard();
    e.preventDefault();
    return;
  }
  if (usrDangerOpen.value) {
    closeUsrDanger();
    e.preventDefault();
    return;
  }
  if (auditModalOpen.value) {
    closeAuditModal();
    e.preventDefault();
    return;
  }
  if (kycAuditModalOpen.value) {
    closeKycAuditModal();
    e.preventDefault();
    return;
  }
  if (userModalOpen.value) {
    closeUserModal();
    e.preventDefault();
    return;
  }
  if (wlModalOpen.value) {
    closeWlModal();
    e.preventDefault();
    return;
  }
  if (blModalOpen.value) {
    closeBlModal();
    e.preventDefault();
  }
}

onMounted(() => {
  userListFilter.value = readUsersListFilter();
  loadUsers();
  loadWhitelist();
  loadBlacklist();
  loadKyc();
  document.addEventListener("keydown", onDocKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onDocKeydown);
});

watch(userListFilter, (v) => {
  writeUsersListFilter(v);
});

const usersPg = useAdminTablePagination(filteredUsers);
const pendingPg = useAdminTablePagination(filteredPendingUsers);
const whitelistPg = useAdminTablePagination(filteredWhitelist);
const blacklistPg = useAdminTablePagination(filteredBlacklist);
const kycPg = useAdminTablePagination(filteredKyc);
</script>

<template>
  <div class="usr-page">
    <section v-show="panel === 'list'" class="usr-page__panel" aria-label="用户列表">
      <el-card shadow="never" class="admin-ep-card">
        <AdminSectionHead toolbar-only title="用户列表">
        <template #annot>
          <AdminInternalTip heading="用户列表 · 原型" explain="用户列表对内说明（原型）">
            <p>检索与状态为 mock；与组织归属、KYC 状态在工程期对齐账号中心。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="userListFilter"
            :input-id="`${idPrefix}-usr-search`"
            search-placeholder="邮箱、姓名、组织、用户 ID…"
            search-aria-label="搜索用户"
            @reset="resetUserListQuery"
          >
            <template #filters>
              <el-select
                v-model="userStatusFilter"
                clearable
                placeholder="状态"
                aria-label="按状态筛选"
                style="width: 7rem"
              >
                <el-option label="正常" value="正常" />
                <el-option label="待审核" value="待审核" />
                <el-option label="已拒绝" value="已拒绝" />
                <el-option label="已冻结" value="已冻结" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary" @click="onAddUserClick">新增用户</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="usersPg.paginatedRows" class="admin-ep-table-wrap" row-key="id">
        <el-table-column prop="email" label="邮箱" :min-width="ADMIN_TABLE_COL.xl" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="usr-page__mono">{{ scope.row.email }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="displayName" label="展示名" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column prop="orgName" label="所属组织" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column prop="id" label="用户 ID" :min-width="ADMIN_TABLE_COL.lg" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="usr-page__mono">{{ scope.row.id }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.xs">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="userStatusBadgeClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="registeredAt" label="注册" :min-width="ADMIN_TABLE_COL.lg" sortable/>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions" @click.stop>
              <el-button link type="primary" :icon="View" @click="openDetailCard(scope.row)">
                详情
              </el-button>
              <el-button link type="primary" :icon="Edit" @click="onEditUserClick(scope.row)">
                编辑
              </el-button>
              <el-button v-if="scope.row.status === '正常'" link type="primary" @click="requestFreezeUser(scope.row)">冻结</el-button>
              <el-button v-if="scope.row.status === '已冻结'" link type="primary" @click="requestUnfreezeUser(scope.row)">解冻</el-button>
              <el-button link type="danger" :icon="Delete" @click="requestDeleteUser(scope.row)">
                删除
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="usersPg.currentPage"
        v-model:page-size="usersPg.pageSize"
        :total="usersPg.total"
      />
      <p class="usr-page__hint">
        键 <code class="usr-page__mono">trinity-ai-admin:terminal-users-rows</code>；搜索键
        <code class="usr-page__mono">trinity-ai-admin:terminal-users-filter</code>；删除 / 冻结 / 解冻经弹窗二次确认。
      </p>
      </el-card>
    </section>

    <section v-show="panel === 'audit-queue'" class="usr-page__panel" aria-label="审核队列">
      <el-card shadow="never" class="admin-ep-card">
      <AdminSectionHead toolbar-only title="审核队列">
        <template #annot>
          <AdminInternalTip heading="审核队列 · 原型" explain="审核队列对内说明（原型）">
            <p>待审列表为占位；批量通过/拒绝应接工单与通知（详设 §4.11）。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="auditQueueSearchQ"
            :input-id="`${idPrefix}-usr-audit-q`"
            search-placeholder="邮箱、姓名、组织…"
            search-aria-label="检索待审用户"
          />
        </template>
      </AdminSectionHead>
      <div v-if="!pendingUsers.length" class="usr-page__hint">当前无待审核用户。</div>
      <el-table v-else :data="pendingPg.paginatedRows" class="admin-ep-table-wrap" row-key="id">
        <el-table-column prop="email" label="邮箱" :min-width="ADMIN_TABLE_COL.xl" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="usr-page__mono">{{ scope.row.email }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="displayName" label="展示名" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column prop="orgName" label="组织" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column prop="registeredAt" label="注册" :min-width="ADMIN_TABLE_COL.lg" sortable/>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions" @click.stop>
              <el-button link type="primary" @click="openAuditModal('approve', scope.row.id)">
                <el-icon><Select /></el-icon>
                通过
              </el-button>
              <el-button link type="danger" @click="openAuditModal('reject', scope.row.id)">
                <el-icon><CircleClose /></el-icon>
                拒绝
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="pendingPg.currentPage"
        v-model:page-size="pendingPg.pageSize"
        :total="pendingPg.total"
      />
      </el-card>
    </section>

    <section v-show="panel === 'whitelist'" class="usr-page__panel" aria-label="白名单">
      <el-card shadow="never" class="admin-ep-card">
      <AdminSectionHead toolbar-only title="白名单">
        <template #annot>
          <AdminInternalTip heading="白名单 · 原型" explain="白名单对内说明（原型）">
            <p>域名/号段规则为示意；与风控策略冲突时的优先级需产品定义。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="wlSearchQ"
            :input-id="`${idPrefix}-usr-wl-q`"
            search-placeholder="规则、类型、说明…"
            search-aria-label="检索白名单"
            @reset="resetWlQuery"
          >
            <template #filters>
              <el-select v-model="wlEnabledFilter" clearable placeholder="启用" style="width: 7rem">
                <el-option label="已启用" value="yes" />
                <el-option label="未启用" value="no" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary" @click="onAddWlClick">新增规则</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="whitelistPg.paginatedRows" class="admin-ep-table-wrap" row-key="id">
        <el-table-column prop="pattern" label="规则" :min-width="ADMIN_TABLE_COL.lg" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="usr-page__mono">{{ scope.row.pattern }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="patternType" label="类型" :min-width="ADMIN_TABLE_COL.xs" sortable/>
        <el-table-column label="启用" :min-width="ADMIN_TABLE_COL.xs">
          <template #default="scope">
              <template v-if="scope?.row">{{ scope.row.enabled ? "是" : "否" }}
              </template>
            </template>
        </el-table-column>
        <el-table-column prop="note" label="说明" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column prop="updatedAt" label="更新" :min-width="ADMIN_TABLE_COL.lg" sortable/>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions" @click.stop>
              <el-button link type="primary" @click="onEditWlClick(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="danger" @click="requestDeleteWl(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="whitelistPg.currentPage"
        v-model:page-size="whitelistPg.pageSize"
        :total="whitelistPg.total"
      />
      <p class="usr-page__hint">键 <code class="usr-page__mono">trinity-ai-admin:users-whitelist-rows</code>。</p>
      </el-card>
    </section>

    <section v-show="panel === 'blacklist'" class="usr-page__panel" aria-label="黑名单">
      <el-card shadow="never" class="admin-ep-card">
      <AdminSectionHead toolbar-only title="黑名单">
        <template #annot>
          <AdminInternalTip heading="黑名单 · 原型" explain="黑名单对内说明（原型）">
            <p>封禁策略为 mock；真实环境需审计、申诉与合规留存。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="blSearchQ"
            :input-id="`${idPrefix}-usr-bl-q`"
            search-placeholder="目标、原因…"
            search-aria-label="检索黑名单"
            @reset="resetBlQuery"
          >
            <template #filters>
              <el-select v-model="blTypeFilter" clearable placeholder="类型" style="width: 7rem">
                <el-option label="邮箱" value="邮箱" />
                <el-option label="手机" value="手机" />
                <el-option label="用户ID" value="用户ID" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary" @click="onAddBlClick">新增条目</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="blacklistPg.paginatedRows" class="admin-ep-table-wrap" row-key="id">
        <el-table-column prop="target" label="目标" :min-width="ADMIN_TABLE_COL.lg" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="usr-page__mono">{{ scope.row.target }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="targetType" label="类型" :min-width="ADMIN_TABLE_COL.xs" sortable/>
        <el-table-column label="拒绝登录" :min-width="ADMIN_TABLE_COL.xs">
          <template #default="scope">
              <template v-if="scope?.row">{{ scope.row.blockLogin ? "是" : "否" }}
              </template>
            </template>
        </el-table-column>
        <el-table-column label="拒绝调用" :min-width="ADMIN_TABLE_COL.xs">
          <template #default="scope">
              <template v-if="scope?.row">{{ scope.row.blockApi ? "是" : "否" }}
              </template>
            </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column prop="updatedAt" label="更新" :min-width="ADMIN_TABLE_COL.lg" sortable/>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions" @click.stop>
              <el-button link type="primary" @click="onEditBlClick(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="danger" @click="requestDeleteBl(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="blacklistPg.currentPage"
        v-model:page-size="blacklistPg.pageSize"
        :total="blacklistPg.total"
      />
      <p class="usr-page__hint">键 <code class="usr-page__mono">trinity-ai-admin:users-blacklist-rows</code>；审计必填为二期。</p>
      </el-card>
    </section>

    <section v-show="panel === 'kyc'" class="usr-page__panel" aria-label="实名与企业认证">
      <el-card shadow="never" class="admin-ep-card">
      <AdminSectionHead toolbar-only title="实名 / 企业认证">
        <template #annot>
          <AdminInternalTip heading="实名 / 企业认证 · 原型" explain="KYC 对内说明（原型）">
            <p>材料与审核状态为占位；对接三方实名与人工审核流在工程期接入。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="kycSearchQ"
            :input-id="`${idPrefix}-usr-kyc-q`"
            search-placeholder="记录 ID、用户、备注…"
            search-aria-label="检索认证记录"
            @reset="resetKycQuery"
          >
            <template #filters>
              <el-select v-model="kycStatusFilter" clearable placeholder="状态" style="width: 7rem">
                <el-option label="待审" value="待审" />
                <el-option label="通过" value="通过" />
                <el-option label="拒绝" value="拒绝" />
              </el-select>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="kycPg.paginatedRows" class="admin-ep-table-wrap" row-key="id">
        <el-table-column prop="id" label="记录 ID" :min-width="ADMIN_TABLE_COL.lg" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="usr-page__mono">{{ scope.row.id }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户 ID" :min-width="ADMIN_TABLE_COL.lg" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="usr-page__mono">{{ scope.row.userId }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="kind" label="类型" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column prop="status" label="状态" :min-width="ADMIN_TABLE_COL.xs">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="kycStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交" :min-width="ADMIN_TABLE_COL.lg" sortable/>
        <el-table-column prop="remark" label="备注" :min-width="ADMIN_TABLE_COL.md" sortable/>
        <el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions" @click.stop>
              <template v-if="scope.row.status === '待审'">
                <el-button link type="primary" @click="openKycAudit('approve', scope.row.id)">通过</el-button>
                <el-button link type="danger" @click="openKycAudit('reject', scope.row.id)">拒绝</el-button>
              </template>
              <el-button link type="danger" @click="requestDeleteKyc(scope.row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="kycPg.currentPage"
        v-model:page-size="kycPg.pageSize"
        :total="kycPg.total"
      />
      <p class="usr-page__hint">键 <code class="usr-page__mono">trinity-ai-admin:users-kyc-rows</code>。</p>
      </el-card>
    </section>

    <!-- ==================== 详情弹窗 ==================== -->
    <AdminDialog v-model="detailCardOpen" :title="detailRow?.email ?? '用户详情'" width="560px">
      <div v-if="detailRow" class="usr-page__detail-grid">
        <div>
          <div class="usr-page__detail-k">用户 ID</div>
          <p class="usr-page__detail-v usr-page__mono">{{ detailRow.id }}</p>
        </div>
        <div>
          <div class="usr-page__detail-k">邮箱</div>
          <p class="usr-page__detail-v usr-page__mono">{{ detailRow.email }}</p>
        </div>
        <div>
          <div class="usr-page__detail-k">展示名</div>
          <p class="usr-page__detail-v">{{ detailRow.displayName }}</p>
        </div>
        <div>
          <div class="usr-page__detail-k">所属组织</div>
          <p class="usr-page__detail-v">{{ detailRow.orgName }}</p>
        </div>
        <div>
          <div class="usr-page__detail-k">状态</div>
          <p class="usr-page__detail-v">
            <span :class="userStatusBadgeClass(detailRow.status)">{{ detailRow.status }}</span>
          </p>
        </div>
        <div>
          <div class="usr-page__detail-k">手机</div>
          <p class="usr-page__detail-v">{{ detailRow.phone ?? '—' }}</p>
        </div>
        <div>
          <div class="usr-page__detail-k">注册时间</div>
          <p class="usr-page__detail-v">{{ detailRow.registeredAt }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeDetailCard">关闭</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="userModalOpen"
      :title="userModalMode === 'edit' ? '编辑用户' : '新增用户'"
      head-note="状态机：注册 → 验证 → 待审核 → 通过/拒绝（示意）。"
    >
      <el-form label-position="top" class="admin-ep-form usr-int-modal-grid">
        <el-form-item label="邮箱">
          <el-input
            :id="`${idPrefix}-usr-em`"
            v-model="draftUserEmail"
            placeholder="login@example.com"
            :disabled="userModalMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="展示名">
          <el-input :id="`${idPrefix}-usr-nm`" v-model="draftUserName" />
        </el-form-item>
        <el-form-item label="所属组织">
          <el-input :id="`${idPrefix}-usr-org`" v-model="draftUserOrg" placeholder="空则存为 —" />
        </el-form-item>
        <el-form-item label="手机（可选）">
          <el-input :id="`${idPrefix}-usr-ph`" v-model="draftUserPhone" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input
            :id="`${idPrefix}-usr-st`"
            v-model="draftUserStatus"
            placeholder="正常 / 待审核 / 已拒绝 / 已冻结"
          />
        </el-form-item>
      </el-form>
      <p v-if="userFormError" class="usr-int-modal-err">{{ userFormError }}</p>
      <template #footer>
        <el-button @click="closeUserModal">取消</el-button>
        <el-button type="primary" @click="saveUserModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="wlModalOpen" :title="wlEditingId ? '编辑白名单' : '新增白名单'">
      <el-form label-position="top" class="admin-ep-form usr-int-modal-grid">
        <el-form-item label="规则">
          <el-input :id="`${idPrefix}-usr-wl-p`" v-model="draftWlPattern" placeholder="@corp.com 或 86139" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input :id="`${idPrefix}-usr-wl-t`" v-model="draftWlType" placeholder="邮箱域名 或 手机号段" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input :id="`${idPrefix}-usr-wl-n`" v-model="draftWlNote" />
        </el-form-item>
        <el-form-item>
          <el-checkbox :id="`${idPrefix}-usr-wl-en`" v-model="draftWlEnabled">启用</el-checkbox>
        </el-form-item>
      </el-form>
      <p v-if="wlFormError" class="usr-int-modal-err">{{ wlFormError }}</p>
      <template #footer>
        <el-button @click="closeWlModal">取消</el-button>
        <el-button type="primary" @click="saveWlModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="blModalOpen" :title="blEditingId ? '编辑黑名单' : '新增黑名单'">
      <el-form label-position="top" class="admin-ep-form usr-int-modal-grid">
        <el-form-item label="目标">
          <el-input :id="`${idPrefix}-usr-bl-tg`" v-model="draftBlTarget" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input :id="`${idPrefix}-usr-bl-ty`" v-model="draftBlType" placeholder="邮箱 / 手机 / 用户ID" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input :id="`${idPrefix}-usr-bl-rs`" v-model="draftBlReason" />
        </el-form-item>
        <el-form-item>
          <el-checkbox :id="`${idPrefix}-usr-bl-lg`" v-model="draftBlLogin">拒绝登录</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox :id="`${idPrefix}-usr-bl-api`" v-model="draftBlApi">拒绝调用</el-checkbox>
        </el-form-item>
      </el-form>
      <p v-if="blFormError" class="usr-int-modal-err">{{ blFormError }}</p>
      <template #footer>
        <el-button @click="closeBlModal">取消</el-button>
        <el-button type="primary" @click="saveBlModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="auditModalOpen" :title="auditModalTitle">
      <p class="or-keys-editor-banner" role="status">{{ auditModalMessage }}</p>
      <template #footer>
        <el-button @click="closeAuditModal">取消</el-button>
        <el-button :type="auditKind === 'approve' ? 'primary' : 'danger'" @click="executeAuditModal">
          {{ auditKind === "approve" ? "确认通过" : "确认拒绝" }}
        </el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="kycAuditModalOpen" :title="kycAuditTitle">
      <p class="or-keys-editor-banner" role="status">{{ kycAuditMessage }}</p>
      <template #footer>
        <el-button @click="closeKycAuditModal">取消</el-button>
        <el-button :type="kycAuditKind === 'approve' ? 'primary' : 'danger'" @click="executeKycAuditModal">
          {{ kycAuditKind === "approve" ? "确认通过" : "确认拒绝" }}
        </el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="usrDangerOpen" :title="usrDangerTitle" head-note="原型将直接更新 localStorage。">
      <p class="or-keys-editor-banner" role="status">{{ usrDangerMessage }}</p>
      <template #footer>
        <el-button @click="closeUsrDanger">取消</el-button>
        <el-button
          :type="usrDangerKind === 'unfreeze-user' ? 'primary' : 'danger'"
          @click="executeUsrDanger"
        >
          {{ usrDangerPrimaryLabel }}
        </el-button>
      </template>
    </AdminDialog>
  </div>
</template>
