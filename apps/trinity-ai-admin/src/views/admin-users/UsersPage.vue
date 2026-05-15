<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ModalPanel, TButton, TSearchForm1Fixed, TTextField1Labeled } from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
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
  setUsersModalBodyLock,
} from "./usersInteractions";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<UserPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && USER_PANEL_ORDER.includes(id as UserPanelId)) return id as UserPanelId;
  return "list";
});

const userListFilter = ref("");
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
  const q = userListFilter.value.trim().toLowerCase();
  let rows = userRows.value;
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.email.toLowerCase().includes(q) ||
      r.displayName.toLowerCase().includes(q) ||
      r.orgName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.phone && r.phone.toLowerCase().includes(q))
  );
});

const pendingUsers = computed(() => userRows.value.filter((u) => u.status === "待审核"));

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
  setUsersModalBodyLock(false);
});

watch(userListFilter, (v) => {
  writeUsersListFilter(v);
});

watchEffect(() => {
  setUsersModalBodyLock(
    userModalOpen.value ||
      wlModalOpen.value ||
      blModalOpen.value ||
      usrDangerOpen.value ||
      auditModalOpen.value ||
      kycAuditModalOpen.value
  );
});
</script>

<template>
  <div class="usr-page">
    <!-- 用户列表 -->
    <section v-show="panel === 'list'" class="usr-page__panel" aria-label="用户列表">
      <AdminSectionHead title="用户列表">
        <template #annot>
          <AdminInternalTip heading="用户列表 · 原型" explain="用户列表对内说明（原型）">
            <p>检索与状态为 mock；与组织归属、KYC 状态在工程期对齐账号中心。</p>
          </AdminInternalTip>
        </template>
        <template #desc>
          终端用户检索与账号操作（<strong>§4.11</strong>，mock，<code class="usr-page__mono">localStorage</code>）；与员工 RBAC（§4.12）<strong>分权</strong>。
        </template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="userListFilter"
            :input-id="`${idPrefix}-usr-search`"
            placeholder="邮箱、姓名、组织、用户 ID…"
            width="17.5rem"
            aria-label="搜索用户"
          />
          <TButton variant="gradient" type="button" @click="onAddUserClick">新增用户</TButton>
        </template>
      </AdminSectionHead>
      <div class="usr-page__table-wrap">
        <table class="usr-page__table">
          <thead>
            <tr>
              <th>用户 ID</th>
              <th>邮箱</th>
              <th>展示名</th>
              <th>所属组织</th>
              <th>状态</th>
              <th>注册</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredUsers" :key="r.id">
              <td class="usr-page__mono">{{ r.id }}</td>
              <td class="usr-page__mono">{{ r.email }}</td>
              <td>{{ r.displayName }}</td>
              <td>{{ r.orgName }}</td>
              <td><span :class="userStatusBadgeClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.registeredAt }}</td>
              <td>
                <button type="button" class="usr-int__textlink" @click="onEditUserClick(r)">编辑</button>
                <button
                  v-if="r.status === '正常'"
                  type="button"
                  class="usr-int__textlink"
                  @click="requestFreezeUser(r)"
                >
                  冻结
                </button>
                <button
                  v-if="r.status === '已冻结'"
                  type="button"
                  class="usr-int__textlink"
                  @click="requestUnfreezeUser(r)"
                >
                  解冻
                </button>
                <button type="button" class="usr-int__textlink usr-int__textlink--danger" @click="requestDeleteUser(r)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="usr-page__hint">
        键 <code class="usr-page__mono">trinity-ai-admin:terminal-users-rows</code>；搜索键
        <code class="usr-page__mono">trinity-ai-admin:terminal-users-filter</code>；删除 / 冻结 / 解冻经
        <strong>ModalPanel</strong> 二次确认。
      </p>
    </section>

    <!-- 审核队列 -->
    <section v-show="panel === 'audit-queue'" class="usr-page__panel" aria-label="审核队列">
      <AdminSectionHead title="审核队列">
        <template #annot>
          <AdminInternalTip heading="审核队列 · 原型" explain="审核队列对内说明（原型）">
            <p>待审列表为占位；批量通过/拒绝应接工单与通知（详设 §4.11）。</p>
          </AdminInternalTip>
        </template>
        <template #desc>
          待审核用户与列表同源；通过/拒绝写回用户表；批量与原因模板为二期（mock）。
        </template>
      </AdminSectionHead>
      <div v-if="!pendingUsers.length" class="usr-page__hint">当前无待审核用户。</div>
      <div v-else class="usr-page__table-wrap">
        <table class="usr-page__table">
          <thead>
            <tr>
              <th>邮箱</th>
              <th>展示名</th>
              <th>组织</th>
              <th>注册</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pendingUsers" :key="r.id">
              <td class="usr-page__mono">{{ r.email }}</td>
              <td>{{ r.displayName }}</td>
              <td>{{ r.orgName }}</td>
              <td>{{ r.registeredAt }}</td>
              <td>
                <button type="button" class="usr-int__textlink" @click="openAuditModal('approve', r.id)">通过</button>
                <button type="button" class="usr-int__textlink usr-int__textlink--danger" @click="openAuditModal('reject', r.id)">
                  拒绝
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 白名单 -->
    <section v-show="panel === 'whitelist'" class="usr-page__panel" aria-label="白名单">
      <AdminSectionHead title="白名单">
        <template #annot>
          <AdminInternalTip heading="白名单 · 原型" explain="白名单对内说明（原型）">
            <p>域名/号段规则为示意；与风控策略冲突时的优先级需产品定义。</p>
          </AdminInternalTip>
        </template>
        <template #desc>域名/邮箱模式放行规则（mock）。</template>
        <template #tools>
          <TButton variant="gradient" type="button" @click="onAddWlClick">新增规则</TButton>
        </template>
      </AdminSectionHead>
      <div class="usr-page__table-wrap">
        <table class="usr-page__table">
          <thead>
            <tr>
              <th>规则</th>
              <th>类型</th>
              <th>启用</th>
              <th>说明</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in whitelistRows" :key="r.id">
              <td class="usr-page__mono">{{ r.pattern }}</td>
              <td>{{ r.patternType }}</td>
              <td>{{ r.enabled ? "是" : "否" }}</td>
              <td>{{ r.note }}</td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="usr-int__textlink" @click="onEditWlClick(r)">编辑</button>
                <button type="button" class="usr-int__textlink usr-int__textlink--danger" @click="requestDeleteWl(r)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="usr-page__hint">键 <code class="usr-page__mono">trinity-ai-admin:users-whitelist-rows</code>。</p>
    </section>

    <!-- 黑名单 -->
    <section v-show="panel === 'blacklist'" class="usr-page__panel" aria-label="黑名单">
      <AdminSectionHead title="黑名单">
        <template #annot>
          <AdminInternalTip heading="黑名单 · 原型" explain="黑名单对内说明（原型）">
            <p>封禁策略为 mock；真实环境需审计、申诉与合规留存。</p>
          </AdminInternalTip>
        </template>
        <template #desc>拒绝登录/调用的拦截条目（mock）。</template>
        <template #tools>
          <TButton variant="gradient" type="button" @click="onAddBlClick">新增条目</TButton>
        </template>
      </AdminSectionHead>
      <div class="usr-page__table-wrap">
        <table class="usr-page__table">
          <thead>
            <tr>
              <th>目标</th>
              <th>类型</th>
              <th>拒绝登录</th>
              <th>拒绝调用</th>
              <th>原因</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in blacklistRows" :key="r.id">
              <td class="usr-page__mono">{{ r.target }}</td>
              <td>{{ r.targetType }}</td>
              <td>{{ r.blockLogin ? "是" : "否" }}</td>
              <td>{{ r.blockApi ? "是" : "否" }}</td>
              <td>{{ r.reason }}</td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="usr-int__textlink" @click="onEditBlClick(r)">编辑</button>
                <button type="button" class="usr-int__textlink usr-int__textlink--danger" @click="requestDeleteBl(r)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="usr-page__hint">键 <code class="usr-page__mono">trinity-ai-admin:users-blacklist-rows</code>；审计必填为二期。</p>
    </section>

    <!-- 实名 / 企业认证 -->
    <section v-show="panel === 'kyc'" class="usr-page__panel" aria-label="实名与企业认证">
      <AdminSectionHead title="实名 / 企业认证">
        <template #annot>
          <AdminInternalTip heading="实名 / 企业认证 · 原型" explain="KYC 对内说明（原型）">
            <p>材料与审核状态为占位；对接三方实名与人工审核流在工程期接入。</p>
          </AdminInternalTip>
        </template>
        <template #desc>申请记录与人工通过/拒绝示意；材料上传权限为二期（mock）。</template>
      </AdminSectionHead>
      <div class="usr-page__table-wrap">
        <table class="usr-page__table">
          <thead>
            <tr>
              <th>记录 ID</th>
              <th>用户 ID</th>
              <th>类型</th>
              <th>状态</th>
              <th>提交</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in kycRows" :key="r.id">
              <td class="usr-page__mono">{{ r.id }}</td>
              <td class="usr-page__mono">{{ r.userId }}</td>
              <td>{{ r.kind }}</td>
              <td><span :class="kycStatusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.submittedAt }}</td>
              <td>{{ r.remark }}</td>
              <td>
                <template v-if="r.status === '待审'">
                  <button type="button" class="usr-int__textlink" @click="openKycAudit('approve', r.id)">通过</button>
                  <button type="button" class="usr-int__textlink usr-int__textlink--danger" @click="openKycAudit('reject', r.id)">
                    拒绝
                  </button>
                </template>
                <button type="button" class="usr-int__textlink usr-int__textlink--danger" @click="requestDeleteKyc(r)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="usr-page__hint">键 <code class="usr-page__mono">trinity-ai-admin:users-kyc-rows</code>。</p>
    </section>

    <Teleport to="body">
      <div
        v-show="userModalOpen"
        class="or-modal-root usr-int-modal-host"
        role="presentation"
        :aria-hidden="!userModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeUserModal" />
        <ModalPanel
          :title="userModalMode === 'edit' ? '编辑用户' : '新增用户'"
          :title-id="`${idPrefix}-usr-form-title`"
          head-note="状态机：注册 → 验证 → 待审核 → 通过/拒绝（示意）。"
          close-label="关闭"
          @close="closeUserModal"
        >
          <div class="usr-int-modal-grid">
            <TTextField1Labeled
              v-model="draftUserEmail"
              label="邮箱"
              :input-id="`${idPrefix}-usr-em`"
              :disabled="userModalMode === 'edit'"
              placeholder="login@example.com"
            />
            <TTextField1Labeled v-model="draftUserName" label="展示名" :input-id="`${idPrefix}-usr-nm`" />
            <TTextField1Labeled v-model="draftUserOrg" label="所属组织" :input-id="`${idPrefix}-usr-org`" placeholder="空则存为 —" />
            <TTextField1Labeled v-model="draftUserPhone" label="手机（可选）" :input-id="`${idPrefix}-usr-ph`" />
            <TTextField1Labeled
              v-model="draftUserStatus"
              label="状态"
              :input-id="`${idPrefix}-usr-st`"
              placeholder="正常 / 待审核 / 已拒绝 / 已冻结"
            />
          </div>
          <p v-if="userFormError" class="usr-int-modal-err">{{ userFormError }}</p>
          <template #actions>
            <TButton type="button" @click="closeUserModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveUserModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-show="wlModalOpen" class="or-modal-root usr-int-modal-host" role="presentation" :aria-hidden="!wlModalOpen">
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeWlModal" />
        <ModalPanel
          :title="wlEditingId ? '编辑白名单' : '新增白名单'"
          :title-id="`${idPrefix}-usr-wl-title`"
          close-label="关闭"
          @close="closeWlModal"
        >
          <div class="usr-int-modal-grid">
            <TTextField1Labeled v-model="draftWlPattern" label="规则" :input-id="`${idPrefix}-usr-wl-p`" placeholder="@corp.com 或 86139" />
            <TTextField1Labeled
              v-model="draftWlType"
              label="类型"
              :input-id="`${idPrefix}-usr-wl-t`"
              placeholder="邮箱域名 或 手机号段"
            />
            <TTextField1Labeled v-model="draftWlNote" label="说明" :input-id="`${idPrefix}-usr-wl-n`" />
            <div class="form-group form-group--row">
              <input :id="`${idPrefix}-usr-wl-en`" v-model="draftWlEnabled" type="checkbox" />
              <label :for="`${idPrefix}-usr-wl-en`">启用</label>
            </div>
          </div>
          <p v-if="wlFormError" class="usr-int-modal-err">{{ wlFormError }}</p>
          <template #actions>
            <TButton type="button" @click="closeWlModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveWlModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-show="blModalOpen" class="or-modal-root usr-int-modal-host" role="presentation" :aria-hidden="!blModalOpen">
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeBlModal" />
        <ModalPanel
          :title="blEditingId ? '编辑黑名单' : '新增黑名单'"
          :title-id="`${idPrefix}-usr-bl-title`"
          close-label="关闭"
          @close="closeBlModal"
        >
          <div class="usr-int-modal-grid">
            <TTextField1Labeled v-model="draftBlTarget" label="目标" :input-id="`${idPrefix}-usr-bl-tg`" />
            <TTextField1Labeled
              v-model="draftBlType"
              label="类型"
              :input-id="`${idPrefix}-usr-bl-ty`"
              placeholder="邮箱 / 手机 / 用户ID"
            />
            <TTextField1Labeled v-model="draftBlReason" label="原因" :input-id="`${idPrefix}-usr-bl-rs`" />
            <div class="form-group form-group--row">
              <input :id="`${idPrefix}-usr-bl-lg`" v-model="draftBlLogin" type="checkbox" />
              <label :for="`${idPrefix}-usr-bl-lg`">拒绝登录</label>
            </div>
            <div class="form-group form-group--row">
              <input :id="`${idPrefix}-usr-bl-api`" v-model="draftBlApi" type="checkbox" />
              <label :for="`${idPrefix}-usr-bl-api`">拒绝调用</label>
            </div>
          </div>
          <p v-if="blFormError" class="usr-int-modal-err">{{ blFormError }}</p>
          <template #actions>
            <TButton type="button" @click="closeBlModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveBlModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="auditModalOpen"
        class="or-modal-root usr-int-modal-host"
        role="presentation"
        :aria-hidden="!auditModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeAuditModal" />
        <ModalPanel
          :title="auditModalTitle"
          :title-id="`${idPrefix}-usr-audit-title`"
          close-label="关闭"
          @close="closeAuditModal"
        >
          <p class="or-keys-editor-banner" role="status">{{ auditModalMessage }}</p>
          <template #actions>
            <TButton type="button" @click="closeAuditModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="executeAuditModal">{{ auditKind === "approve" ? "确认通过" : "确认拒绝" }}</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="kycAuditModalOpen"
        class="or-modal-root usr-int-modal-host"
        role="presentation"
        :aria-hidden="!kycAuditModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeKycAuditModal" />
        <ModalPanel
          :title="kycAuditTitle"
          :title-id="`${idPrefix}-usr-kyc-audit-title`"
          close-label="关闭"
          @close="closeKycAuditModal"
        >
          <p class="or-keys-editor-banner" role="status">{{ kycAuditMessage }}</p>
          <template #actions>
            <TButton type="button" @click="closeKycAuditModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="executeKycAuditModal">
              {{ kycAuditKind === "approve" ? "确认通过" : "确认拒绝" }}
            </TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="usrDangerOpen"
        class="or-modal-root usr-int-modal-host"
        role="presentation"
        :aria-hidden="!usrDangerOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeUsrDanger" />
        <ModalPanel
          :title="usrDangerTitle"
          :title-id="`${idPrefix}-usr-dg-title`"
          head-note="原型将直接更新 localStorage。"
          close-label="关闭"
          @close="closeUsrDanger"
        >
          <p class="or-keys-editor-banner" role="status">{{ usrDangerMessage }}</p>
          <template #actions>
            <TButton type="button" @click="closeUsrDanger">取消</TButton>
            <TButton variant="gradient" type="button" @click="executeUsrDanger">{{ usrDangerPrimaryLabel }}</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>
  </div>
</template>
